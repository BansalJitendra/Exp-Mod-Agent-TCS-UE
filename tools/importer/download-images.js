#!/usr/bin/env node

/**
 * Post-Import Image Downloader
 *
 * Scans .plain.html files in the content directory, downloads all external
 * images, saves them locally, and updates the HTML to use relative paths.
 *
 * Usage:
 *   node tools/importer/download-images.js [--content-dir content]
 *
 * Images are saved as content/media_<hash>.<ext> and referenced with
 * ./media_<hash>.<ext> in the HTML, matching the AEM EDS media pattern.
 */

import {
  readFileSync, writeFileSync, existsSync, mkdirSync,
  readdirSync, statSync,
} from 'fs';
import { resolve, dirname, join, basename } from 'path';
import { createHash } from 'crypto';
import https from 'https';
import http from 'http';

const CONTENT_DIR = resolve(
  process.argv.includes('--content-dir')
    ? process.argv[process.argv.indexOf('--content-dir') + 1]
    : 'content',
);

const DOWNLOAD_TIMEOUT = 15000;

function urlToFilename(url) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 12);
  const parsed = new URL(url);
  const ext = parsed.pathname.match(/\.(jpe?g|png|gif|webp|svg|avif)$/i);
  const extension = ext ? ext[0].toLowerCase() : '.jpeg';
  return `media_${hash}${extension}`;
}

function downloadFile(url, destPath) {
  return new Promise((resolvePromise, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
          + 'AppleWebKit/537.36 (KHTML, like Gecko) '
          + 'Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/*,*/*;q=0.8',
      },
      timeout: DOWNLOAD_TIMEOUT,
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400
        && response.headers.location) {
        downloadFile(response.headers.location, destPath)
          .then(resolvePromise)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        mkdirSync(dirname(destPath), { recursive: true });
        writeFileSync(destPath, buffer);
        resolvePromise(buffer.length);
      });
      response.on('error', reject);
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full));
    } else if (entry.endsWith('.plain.html')) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  console.log('[Image Download] Content directory:', CONTENT_DIR);

  if (!existsSync(CONTENT_DIR)) {
    console.error('Content directory not found:', CONTENT_DIR);
    process.exit(1);
  }

  const htmlFiles = walkDir(CONTENT_DIR);

  if (htmlFiles.length === 0) {
    console.log('No .plain.html files found.');
    return;
  }

  console.log(`Found ${htmlFiles.length} HTML file(s)`);

  // Collect all unique external image URLs
  const imgRegex = /<img\s[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const urlMap = new Map();
  const fileContents = new Map();

  for (const filePath of htmlFiles) {
    const html = readFileSync(filePath, 'utf-8');
    fileContents.set(filePath, html);

    let match;
    imgRegex.lastIndex = 0;
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (src.startsWith('http://') || src.startsWith('https://')) {
        if (!urlMap.has(src)) {
          const decodedSrc = src
            .replace(/&amp;/g, '&')
            .replace(/&#x26;/g, '&');
          urlMap.set(src, {
            filename: urlToFilename(decodedSrc),
            downloadUrl: decodedSrc,
          });
        }
      }
    }
  }

  console.log(`Found ${urlMap.size} unique external image(s)`);

  if (urlMap.size === 0) {
    console.log('No external images to download.');
    return;
  }

  // Download all images
  let downloaded = 0;
  let failed = 0;

  for (const [originalSrc, { filename, downloadUrl }] of urlMap) {
    const destPath = join(CONTENT_DIR, filename);

    if (existsSync(destPath)) {
      console.log(`  skip: ${filename} (already exists)`);
      downloaded++;
      continue;
    }

    try {
      const size = await downloadFile(downloadUrl, destPath);
      const kb = (size / 1024).toFixed(1);
      console.log(`  ok: ${filename} (${kb} KB)`);
      downloaded++;
    } catch (error) {
      console.error(`  fail: ${filename} - ${error.message}`);
      failed++;
      urlMap.delete(originalSrc);
    }

    await new Promise((r) => { setTimeout(r, 200); });
  }

  // Update HTML files with local paths
  let updatedFiles = 0;

  for (const [filePath, originalHtml] of fileContents) {
    let html = originalHtml;
    let changed = false;

    for (const [originalSrc, { filename }] of urlMap) {
      if (html.includes(originalSrc)) {
        const htmlDir = dirname(filePath);
        let relativePath = `./${filename}`;

        if (htmlDir !== CONTENT_DIR) {
          const depth = dirname(filePath.replace(CONTENT_DIR, ''))
            .split('/')
            .filter(Boolean).length;
          relativePath = '../'.repeat(depth) + filename;
        }

        html = html.split(originalSrc).join(relativePath);
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(filePath, html, 'utf-8');
      updatedFiles++;
      console.log(`  updated: ${basename(filePath)}`);
    }
  }

  console.log('');
  console.log('[Image Download] Complete:');
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Failed:     ${failed}`);
  console.log(`  HTML updated: ${updatedFiles} file(s)`);
}

main().catch((err) => {
  console.error('[Image Download] Error:', err);
  process.exit(1);
});
