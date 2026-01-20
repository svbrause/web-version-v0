#!/usr/bin/env node
/**
 * Build script to inject environment variables into HTML files
 * 
 * This script replaces {{VARIABLE_NAME}} placeholders in HTML files
 * with actual environment variable values.
 * 
 * Usage: 
 *   node build-inject-env.js
 * 
 * Or with environment variables:
 *   AIRTABLE_API_KEY=your-key node build-inject-env.js
 */

const fs = require('fs');
const path = require('path');

// Try to load .env file if dotenv is available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, that's okay
}

// HTML files that need environment variable injection
const HTML_FILES = [
  'dashboard-unique.html',
  'dashboard-lakeshore.html',
  'dashboard.html',
  'index-original.html'
];

// Environment variables to inject
const ENV_VARS = {
  'AIRTABLE_API_KEY': process.env.AIRTABLE_API_KEY || '',
  'AIRTABLE_BASE_ID': process.env.AIRTABLE_BASE_ID || 'appXblSpAMBQskgzB'
};

// Validate required variables
if (!ENV_VARS.AIRTABLE_API_KEY) {
  console.warn('⚠️  WARNING: AIRTABLE_API_KEY is not set.');
  console.warn('   Set it with: export AIRTABLE_API_KEY="your-api-key"');
  console.warn('   Or create a .env file with AIRTABLE_API_KEY=your-key');
  console.warn('   The script will continue but placeholders will remain.\n');
}

function injectEnvVars(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace each placeholder
    for (const [varName, varValue] of Object.entries(ENV_VARS)) {
      const placeholder = `{{${varName}}}`;
      if (content.includes(placeholder)) {
        // Escape single quotes, backslashes, and newlines for JavaScript strings
        const escapedValue = varValue
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), escapedValue);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Injected environment variables into ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No placeholders found in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process all HTML files
console.log('🔧 Injecting environment variables into HTML files...\n');

let successCount = 0;
for (const htmlFile of HTML_FILES) {
  const filePath = path.join(__dirname, htmlFile);
  if (fs.existsSync(filePath)) {
    if (injectEnvVars(filePath)) {
      successCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${htmlFile}`);
  }
}

console.log(`\n✅ Environment variable injection complete! (${successCount} files updated)`);

if (!ENV_VARS.AIRTABLE_API_KEY) {
  console.log('\n⚠️  Remember to set AIRTABLE_API_KEY before deploying!');
  process.exit(1);
}
