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

// Try to load .env file from skin-type-react directory first (for VITE_ prefixed vars)
// Then try root directory
const reactEnvPath = path.join(__dirname, 'skin-type-react', '.env');
const rootEnvPath = path.join(__dirname, '.env');

// Try to load .env file if dotenv is available
try {
  const dotenv = require('dotenv');
  // First try React app's .env file
  if (fs.existsSync(reactEnvPath)) {
    const reactEnv = dotenv.config({ path: reactEnvPath });
    if (reactEnv.parsed) {
      console.log('📁 Loaded .env from skin-type-react/.env');
    }
  }
  // Also try root .env file
  if (fs.existsSync(rootEnvPath)) {
    const rootEnv = dotenv.config({ path: rootEnvPath });
    if (rootEnv.parsed) {
      console.log('📁 Loaded .env from root directory');
    }
  }
  // Also try default location
  dotenv.config();
} catch (e) {
  // dotenv not installed, that's okay - we'll try manual parsing
  console.log('⚠️  dotenv not available, trying manual .env parsing...');
  
  // Manual .env parsing as fallback
  const envFiles = [reactEnvPath, rootEnvPath];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      try {
        const envContent = fs.readFileSync(envFile, 'utf8');
        envContent.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const equalIndex = trimmed.indexOf('=');
            if (equalIndex > 0) {
              const key = trimmed.substring(0, equalIndex).trim();
              let value = trimmed.substring(equalIndex + 1).trim();
              // Remove surrounding quotes if present
              if ((value.startsWith('"') && value.endsWith('"')) || 
                  (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
              }
              process.env[key] = value;
            }
          }
        });
        console.log(`📁 Manually loaded .env from ${envFile}`);
        // Log what we found (first 10 chars only for security)
        if (process.env.VITE_AIRTABLE_API_KEY) {
          const keyPreview = process.env.VITE_AIRTABLE_API_KEY.substring(0, 10) + '...';
          console.log(`   Found VITE_AIRTABLE_API_KEY: ${keyPreview}`);
        }
        break;
      } catch (err) {
        console.error(`Error reading ${envFile}:`, err.message);
      }
    }
  }
}

// HTML files that need environment variable injection
const HTML_FILES = [
  'dashboard-unique.html',
  'dashboard-lakeshore.html',
  'dashboard.html',
  'index-original.html'
];

// Environment variables to inject
// Priority: VITE_ prefixed (from React app) > non-VITE (legacy) > default
const ENV_VARS = {
  'AIRTABLE_API_KEY': process.env.VITE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY || '',
  'AIRTABLE_BASE_ID': process.env.VITE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appXblSpAMBQskgzB'
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
  console.log('   Update skin-type-react/.env with: VITE_AIRTABLE_API_KEY=your_key_here');
  process.exit(1);
} else {
  console.log('\n✅ API key successfully loaded from .env file');
  console.log('   Key preview:', ENV_VARS.AIRTABLE_API_KEY.substring(0, 10) + '...' + ENV_VARS.AIRTABLE_API_KEY.substring(ENV_VARS.AIRTABLE_API_KEY.length - 5));
  console.log('\n💡 If you see authentication errors:');
  console.log('   1. Make sure your rotated API key is in skin-type-react/.env as VITE_AIRTABLE_API_KEY');
  console.log('   2. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R) to clear cache');
  console.log('   3. Check browser console for detailed error messages');
}
