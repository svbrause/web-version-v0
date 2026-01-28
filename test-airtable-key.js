#!/usr/bin/env node
/**
 * Test script to verify Airtable API key from .env file
 */

const fs = require('fs');
const path = require('path');

// Load .env file
const reactEnvPath = path.join(__dirname, 'skin-type-react', '.env');
let apiKey = null;
let baseId = 'appXblSpAMBQskgzB';

if (fs.existsSync(reactEnvPath)) {
  const content = fs.readFileSync(reactEnvPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        let value = trimmed.substring(equalIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (key === 'VITE_AIRTABLE_API_KEY') {
          apiKey = value;
        }
        if (key === 'VITE_AIRTABLE_BASE_ID') {
          baseId = value;
        }
      }
    }
  });
}

if (!apiKey) {
  console.error('❌ VITE_AIRTABLE_API_KEY not found in skin-type-react/.env');
  process.exit(1);
}

console.log('🔑 Testing Airtable API Key...');
console.log('   Key preview:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
console.log('   Base ID:', baseId);
console.log('');

// Test the API key
const testUrl = `https://api.airtable.com/v0/${baseId}/Web Popup Leads?maxRecords=1`;

fetch(testUrl, {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  if (!response.ok) {
    return response.json().then(data => {
      console.error('❌ Authentication failed!');
      console.error('   Status:', response.status, response.statusText);
      console.error('   Error:', JSON.stringify(data, null, 2));
      console.error('');
      console.error('💡 This means the API key in .env is invalid or expired.');
      console.error('   Please update skin-type-react/.env with your NEW rotated API key:');
      console.error('   VITE_AIRTABLE_API_KEY=your_new_key_here');
      process.exit(1);
    });
  }
  return response.json();
})
.then(data => {
  console.log('✅ API key is valid!');
  console.log('   Successfully connected to Airtable');
  console.log('   Records found:', data.records?.length || 0);
  console.log('');
  console.log('💡 If you still see errors in the dashboard:');
  console.log('   1. Make sure you ran: node build-inject-env.js');
  console.log('   2. Refresh your browser to reload the dashboard');
  process.exit(0);
})
.catch(error => {
  console.error('❌ Network error:', error.message);
  process.exit(1);
});
