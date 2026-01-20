/**
 * Script to estimate demographics for Photos table records in Airtable
 * 
 * This script:
 * 1. Fetches all records from the Photos table
 * 2. Estimates demographics based on available information
 * 3. Updates records with estimated demographics
 * 
 * Usage: node estimate-demographics.js
 * 
 * Note: Set DRY_RUN=false to actually update records (default is true for safety)
 */

const https = require("https");

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

if (!AIRTABLE_API_KEY) {
  console.error('❌ AIRTABLE_API_KEY environment variable is not set.');
  console.error('   Set it with: export AIRTABLE_API_KEY="your-api-key"');
  process.exit(1);
}
const AIRTABLE_BASE_ID = "appXblSpAMBQskgzB";
const AIRTABLE_TABLE_NAME = "Photos";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Set to false to actually update records (default is true for safety)
const DRY_RUN = true;

// Helper function to make HTTPS requests
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const req = https.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              ok: true,
              status: res.statusCode,
              json: async () => jsonData,
              text: async () => data,
            });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Demographic estimation heuristics
const ETHNIC_NAME_PATTERNS = {
  asian: [
    /^(li|wang|zhang|chen|liu|yang|huang|zhao|wu|zhou|kim|lee|park|choi|jung|yoon|tanaka|yamada|sato|suzuki|nguyen|tran|le|pham|hoang|singh|kumar|patel|sharma|gupta|fernandez|garcia|rodriguez|lopez|martinez|sanchez|ramirez|gonzalez|perez|torres|rivera|flores|gomez|diaz|reyes|morales|ortiz|gutierrez|chavez|ramos|ruiz|mendoza|alvarez|castro|romero|vargas|jimenez|moreno|herrera|medina|aguilar|silva|delgado|castillo|contreras|ortega|dominguez|soto|martin|mendez|santos|rios|castaneda|valdez|guerrero|estrada|salazar|vazquez|maldonado|suarez|rios|campos|juarez|rosas|mejia|benitez|solis|valencia|ibarra|mora|espinoza|nunez|miranda|leon|fuentes|figueroa|vega|rios|rios|rios)/i,
    /\b(chinese|japanese|korean|vietnamese|indian|filipino|thai|indonesian|malaysian|singaporean|taiwanese|hong kong|asian)\b/i
  ],
  black: [
    /^(williams|johnson|jones|brown|davis|miller|wilson|moore|taylor|anderson|thomas|jackson|white|harris|martin|thompson|garcia|martinez|robinson|clark|rodriguez|lewis|lee|walker|hall|allen|young|hernandez|king|wright|lopez|hill|scott|green|adams|baker|gonzalez|nelson|carter|mitchell|perez|roberts|turner|phillips|campbell|parker|evans|edwards|collins|stewart|sanchez|morris|rogers|reed|cook|morgan|bell|murphy|bailey|rivera|cooper|richardson|cox|howard|ward|torres|peterson|gray|ramirez|james|watson|brooks|kelly|sanders|price|bennett|wood|barnes|ross|henderson|coleman|jenkins|perry|powell|long|patterson|hughes|flores|washington|butler|simmons|foster|gonzales|bryant|alexander|russell|griffin|diaz|hayes|myers|ford|hamilton|graham|sullivan|wallace|woods|cole|west|jordan|owens|reynolds|fisher|ellis|harrison|gibson|mcdonald|cruz|marshall|ortiz|gomez|murray|freeman|wells|webb|tucker|burns|crawford|henry|boyd|mason|morales|kennedy|warren|dixon|reyes|ramos|burns|gordon|shaw|holmes|rice|robertson|hunt|black|daniels|palmer|mills|nichols|grant|knight|ferguson|rose|stone|hawkins|dunn|perkins|hudson|spencer|gardner|stephens|payne|pierce|berry|matthews|arnold|wagner|willis|ray|watkins|olson|carroll|duncan|snyder|hart|cunningham|bradley|lane|andrews|ruiz|harper|fox|riley|armstrong|carpenter|weaver|greene|lawrence|elliott|chavez|sims|austin|peters|kelley|franklin|lawson|fields|gutierrez|ryan|schmidt|carr|vasquez|castillo|wheeler|chapman|oliver|montgomery|richards|williamson|johnston|banks|meyer|bishop|mccoy|howell|alvarez|morrison|hansen|fernandez|garza|harvey|little|burton|stanley|nguyen|george|jacobs|reid|kim|fuller|lynch|dean|gilbert|garrett|romero|welch|larson|frazier|burke|hanson|day|mendoza|moreno|bowman|medina|fowler|brewer|hoffman|carlson|silva|pearson|holland|douglas|fleming|jensen|vargas|byrd|davidson|hopkins|may|terry|herrera|wade|soto|walters|curtis|neal|caldwell|lowell|jennings|barnett|graves|jimenez|horton|shelton|barrett|obrien|castro|sutton|gregory|mckinney|lucas|miles|craig|rodriquez|chambers|holt|lambert|fletcher|watts|bates|hale|rhodes|pena|beck|newman|haynes|mcdaniel|mendez|bush|vaughn|parks|dawson|santiago|norris|hardy|love|steele|curry|powers|schultz|barker|guzman|page|munoz|ball|keller|chandler|weber|leonard|walsh|lyons|ramsey|wolfe|schneider|mullins|benson|sharp|bowen|daniel|barber|cummings|hines|baldwin|griffith|valdez|hubbard|salazar|reeves|warner|stevenson|burgess|santos|tate|crosby|gregory|mckinney|mcknight|guy|hubbard|combs|leon|kramer|heath|hancock|gallagher|gaines|shaffer|short|wiggins|mathews|mcclain|fischer|wall|small|melton|hensley|bond|dyer|cameron|grimes|contreras|childers|brandt|o'neal|valencia|winters|mcdonald|hayes|shannon|kemp|nash|dickerson|bond|wyatt|foley|chase|gates|vincent|mathews|hodge|garrison|sloan|mathews|bartlett|durham|hancock|marsh|savage|lowery|hodges|lipscomb|lancaster|bray|pugh|vega|gould|duffy|boyle|york|hutchinson|vaughn|barker|carr|mclaughlin|roth|christensen|schmitt|parrish|franklin|goodwin|mullins|murray|walters|simon|moody|hayden|bush|gibbs|walsh|juarez|fowler|valenzuela|maddox|mccall|hodge|farmer|delacruz|aguilar|vega|glover|manning|cohen|harmon|rodgers|robbins|newton|todd|blair|higgins|ingram|reese|cannon|strickland|townsend|potter|goodwin|walton|rowe|hampton|ortega|patton|swanson|joseph|beck|giles|schmalz|schneider|buck|black|owens|preston|lowe|fraser|byrd|kane|berg|pollard|finley|burns|barrera|davila|mata|mora|valdez|guzman|mendoza|carrillo|vargas|castro|ruiz|morales|ortega|delgado|ramirez|flores|rivera|gomez|diaz|torres|reyes|gutierrez|cruz|mendoza|valdez|guerrero|estrada|salazar|vazquez|maldonado|suarez|rios|campos|juarez|rosas|mejia|benitez|solis|valencia|ibarra|mora|espinoza|nunez|miranda|leon|fuentes|figueroa|vega|rios|rios|rios)/i,
    /\b(african|black|afro|caribbean|west indian)\b/i
  ],
  hispanic: [
    /^(garcia|rodriguez|lopez|martinez|sanchez|ramirez|gonzalez|perez|torres|rivera|flores|gomez|diaz|reyes|morales|ortiz|gutierrez|chavez|ramos|ruiz|mendoza|alvarez|castro|romero|vargas|jimenez|moreno|herrera|medina|aguilar|silva|delgado|castillo|contreras|ortega|dominguez|soto|martin|mendez|santos|rios|castaneda|valdez|guerrero|estrada|salazar|vazquez|maldonado|suarez|rios|campos|juarez|rosas|mejia|benitez|solis|valencia|ibarra|mora|espinoza|nunez|miranda|leon|fuentes|figueroa|vega|rios|rios|rios)/i,
    /\b(hispanic|latino|latina|mexican|spanish|puerto rican|cuban|dominican|colombian|venezuelan|ecuadorian|peruvian|chilean|argentine|brazilian|salvadoran|guatemalan|honduran|nicaraguan|panamanian|costa rican)\b/i
  ],
  middleEastern: [
    /^(ali|ahmed|hassan|mohammed|ibrahim|hussain|khan|malik|ahmad|ali|hassan|hussain|ibrahim|mohammed|omar|youssef|salem|nasser|farid|karim|rashid|tariq|zain|amir|bashir|faris|hamid|jamil|khalil|majid|nadir|osman|qasim|razi|sami|tahir|usman|waleed|yasin|zahir|abbas|darius|ezra|fadi|ghassan|hadi|islam|jawad|kareem|layth|mazen|nabil|omar|pasha|qadir|rami|saeed|tamer|umar|wael|youssef|zaki)/i,
    /\b(arab|middle eastern|persian|iranian|iraqi|lebanese|syrian|palestinian|jordanian|saudi|emirati|kuwaiti|bahraini|qatari|omani|yemeni|turkish|egyptian|pakistani|afghan)\b/i
  ],
  white: [
    /^(smith|johnson|williams|jones|brown|davis|miller|wilson|moore|taylor|anderson|thomas|jackson|white|harris|martin|thompson|garcia|martinez|robinson|clark|rodriguez|lewis|lee|walker|hall|allen|young|hernandez|king|wright|lopez|hill|scott|green|adams|baker|gonzalez|nelson|carter|mitchell|perez|roberts|turner|phillips|campbell|parker|evans|edwards|collins|stewart|sanchez|morris|rogers|reed|cook|morgan|bell|murphy|bailey|rivera|cooper|richardson|cox|howard|ward|torres|peterson|gray|ramirez|james|watson|brooks|kelly|sanders|price|bennett|wood|barnes|ross|henderson|coleman|jenkins|perry|powell|long|patterson|hughes|flores|washington|butler|simmons|foster|gonzales|bryant|alexander|russell|griffin|diaz|hayes|myers|ford|hamilton|graham|sullivan|wallace|woods|cole|west|jordan|owens|reynolds|fisher|ellis|harrison|gibson|mcdonald|cruz|marshall|ortiz|gomez|murray|freeman|wells|webb|tucker|burns|crawford|henry|boyd|mason|morales|kennedy|warren|dixon|reyes|ramos|burns|gordon|shaw|holmes|rice|robertson|hunt|black|daniels|palmer|mills|nichols|grant|knight|ferguson|rose|stone|hawkins|dunn|perkins|hudson|spencer|gardner|stephens|payne|pierce|berry|matthews|arnold|wagner|willis|ray|watkins|olson|carroll|duncan|snyder|hart|cunningham|bradley|lane|andrews|ruiz|harper|fox|riley|armstrong|carpenter|weaver|greene|lawrence|elliott|chavez|sims|austin|peters|kelley|franklin|lawson|fields|gutierrez|ryan|schmidt|carr|vasquez|castillo|wheeler|chapman|oliver|montgomery|richards|williamson|johnston|banks|meyer|bishop|mccoy|howell|alvarez|morrison|hansen|fernandez|garza|harvey|little|burton|stanley|nguyen|george|jacobs|reid|kim|fuller|lynch|dean|gilbert|garrett|romero|welch|larson|frazier|burke|hanson|day|mendoza|moreno|bowman|medina|fowler|brewer|hoffman|carlson|silva|pearson|holland|douglas|fleming|jensen|vargas|byrd|davidson|hopkins|may|terry|herrera|wade|soto|walters|curtis|neal|caldwell|lowell|jennings|barnett|graves|jimenez|horton|shelton|barrett|obrien|castro|sutton|gregory|mckinney|lucas|miles|craig|rodriquez|chambers|holt|lambert|fletcher|watts|bates|hale|rhodes|pena|beck|newman|haynes|mcdaniel|mendez|bush|vaughn|parks|dawson|santiago|norris|hardy|love|steele|curry|powers|schultz|barker|guzman|page|munoz|ball|keller|chandler|weber|leonard|walsh|lyons|ramsey|wolfe|schneider|mullins|benson|sharp|bowen|daniel|barber|cummings|hines|baldwin|griffith|valdez|hubbard|salazar|reeves|warner|stevenson|burgess|santos|tate|crosby|gregory|mckinney|mcknight|guy|hubbard|combs|leon|kramer|heath|hancock|gallagher|gaines|shaffer|short|wiggins|mathews|mcclain|fischer|wall|small|melton|hensley|bond|dyer|cameron|grimes|contreras|childers|brandt|o'neal|valencia|winters|mcdonald|hayes|shannon|kemp|nash|dickerson|bond|wyatt|foley|chase|gates|vincent|mathews|hodge|garrison|sloan|mathews|bartlett|durham|hancock|marsh|savage|lowery|hodges|lipscomb|lancaster|bray|pugh|vega|gould|duffy|boyle|york|hutchinson|vaughn|barker|carr|mclaughlin|roth|christensen|schmitt|parrish|franklin|goodwin|mullins|murray|walters|simon|moody|hayden|bush|gibbs|walsh|juarez|fowler|valenzuela|maddox|mccall|hodge|farmer|delacruz|aguilar|vega|glover|manning|cohen|harmon|rodgers|robbins|newton|todd|blair|higgins|ingram|reese|cannon|strickland|townsend|potter|goodwin|walton|rowe|hampton|ortega|patton|swanson|joseph|beck|giles|schmalz|schneider|buck|black|owens|preston|lowe|fraser|byrd|kane|berg|pollard|finley|burns|barrera|davila|mata|mora|valdez|guzman|mendoza|carrillo|vargas|castro|ruiz|morales|ortega|delgado|ramirez|flores|rivera|gomez|diaz|torres|reyes|gutierrez|cruz|mendoza|valdez|guerrero|estrada|salazar|vazquez|maldonado|suarez|rios|campos|juarez|rosas|mejia|benitez|solis|valencia|ibarra|mora|espinoza|nunez|miranda|leon|fuentes|figueroa|vega|rios|rios|rios)/i,
    /\b(caucasian|white|european|american|british|irish|german|italian|french|polish|scottish|dutch|norwegian|swedish|danish|finnish|greek|portuguese|spanish|russian|ukrainian|romanian|hungarian|czech|slovak|slovenian|croatian|serbian|bulgarian|albanian|estonian|latvian|lithuanian|belarusian|moldovan|maltese|icelandic|luxembourgish|cypriot)\b/i
  ]
};

// Age estimation from text
function estimateAge(text) {
  if (!text) return null;
  
  // Look for explicit age mentions
  const ageMatch = text.match(/\b(\d{1,2})\s*(?:years?\s*old|y\.?o\.?|age|aged)\b/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age >= 18 && age <= 100) return age;
  }
  
  // Look for age ranges
  const rangeMatch = text.match(/\b(?:in\s+)?(?:her|his|their)\s+(?:early|mid|late)\s+(\d{2})s?\b/i);
  if (rangeMatch) {
    const decade = parseInt(rangeMatch[1]);
    if (decade >= 20 && decade <= 90) {
      // Estimate middle of decade
      return decade + 5;
    }
  }
  
  // Look for "X-year-old" pattern
  const hyphenMatch = text.match(/\b(\d{1,2})-year-old\b/i);
  if (hyphenMatch) {
    const age = parseInt(hyphenMatch[1]);
    if (age >= 18 && age <= 100) return age;
  }
  
  return null;
}

// Estimate ethnic background from name
function estimateEthnicBackground(name, story) {
  if (!name && !story) return null;
  
  const text = `${name || ''} ${story || ''}`.toLowerCase();
  
  // Check patterns for each ethnicity
  for (const [ethnicity, patterns] of Object.entries(ETHNIC_NAME_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return ethnicity;
      }
    }
  }
  
  // Default to white if no match (most common in US)
  return 'white';
}

// Estimate skin tone based on ethnic background
function estimateSkinTone(ethnicBackground) {
  const mapping = {
    'asian': 'medium',
    'black': 'deep',
    'hispanic': 'tan',
    'middleEastern': 'medium',
    'white': 'fair',
    'mixed': 'medium',
    'other': null
  };
  
  return mapping[ethnicBackground] || null;
}

// Estimate sun response based on skin tone and ethnic background
function estimateSunResponse(skinTone, ethnicBackground) {
  if (!skinTone && !ethnicBackground) return null;
  
  // Deep skin tones rarely burn
  if (skinTone === 'deep' || ethnicBackground === 'black') {
    return 'rarely burns';
  }
  
  // Fair skin usually burns
  if (skinTone === 'fair' || skinTone === 'light') {
    return Math.random() > 0.5 ? 'usually burns' : 'always burns';
  }
  
  // Medium/tan skin usually tans
  if (skinTone === 'medium' || skinTone === 'tan') {
    return Math.random() > 0.5 ? 'usually tans' : 'sometimes tans';
  }
  
  // Brown skin usually tans or rarely burns
  if (skinTone === 'brown') {
    return Math.random() > 0.5 ? 'usually tans' : 'rarely burns';
  }
  
  return 'sometimes tans'; // Default
}

// Estimate skin type (hard to determine without seeing photo, use defaults)
function estimateSkinType() {
  // Random distribution based on common skin types
  const types = ['balanced', 'combination', 'dry', 'oily'];
  const weights = [0.3, 0.4, 0.2, 0.1]; // Combination is most common
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < types.length; i++) {
    sum += weights[i];
    if (random <= sum) {
      return types[i];
    }
  }
  return 'combination';
}

// Fetch all records from Airtable
async function fetchAllRecords() {
  let allRecords = [];
  let offset = null;
  
  do {
    const url = offset 
      ? `${AIRTABLE_API_URL}?offset=${offset}`
      : AIRTABLE_API_URL;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset || null;
      
      console.log(`Fetched ${allRecords.length} records so far...`);
    } catch (error) {
      throw new Error(`Airtable API error: ${error.message}`);
    }
  } while (offset);
  
  return allRecords;
}

// Update a record with estimated demographics
async function updateRecord(recordId, demographics) {
  try {
    const response = await fetch(`${AIRTABLE_API_URL}/${recordId}`, {
      method: 'PATCH',
      body: {
        fields: demographics
      }
    });
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to update record ${recordId}: ${error.message}`);
  }
}

// Main function
async function estimateDemographics() {
  console.log('Starting demographic estimation...\n');
  
  try {
    // Fetch all records
    console.log('Fetching records from Airtable...');
    const records = await fetchAllRecords();
    console.log(`Found ${records.length} records\n`);
    
    // Process each record
    const updates = [];
    let skipped = 0;
    
    for (const record of records) {
      const fields = record.fields || {};
      const recordId = record.id;
      
      // Skip if demographics already exist
      if (fields['Age'] && fields['Skin Type'] && fields['Sun Response'] && 
          fields['Skin Tone'] && fields['Ethnic Background']) {
        console.log(`Skipping ${fields['Name'] || recordId} - already has demographics`);
        skipped++;
        continue;
      }
      
      // Get available data
      const name = fields['Name'] || fields['Patient Name'] || '';
      const story = fields['Story'] || fields['Story Detailed'] || fields['Description'] || '';
      const existingAge = fields['Age'] || fields['Patient Age'];
      
      // Combine text for analysis
      const text = `${name} ${story}`;
      
      // Estimate demographics
      const age = existingAge || estimateAge(text);
      const ethnicBackground = fields['Ethnic Background'] || estimateEthnicBackground(name, story);
      const skinTone = fields['Skin Tone'] || estimateSkinTone(ethnicBackground);
      const sunResponse = fields['Sun Response'] || estimateSunResponse(skinTone, ethnicBackground);
      const skinType = fields['Skin Type'] || estimateSkinType();
      
      // Build update object (only include fields that have values)
      const updateFields = {};
      if (age) updateFields['Age'] = age;
      if (ethnicBackground) updateFields['Ethnic Background'] = ethnicBackground;
      if (skinTone) updateFields['Skin Tone'] = skinTone;
      if (sunResponse) updateFields['Sun Response'] = sunResponse;
      if (skinType) updateFields['Skin Type'] = skinType;
      
      if (Object.keys(updateFields).length > 0) {
        updates.push({
          recordId,
          name: name || recordId,
          fields: updateFields
        });
      }
    }
    
    console.log(`\nFound ${updates.length} records to update (${skipped} already have demographics)\n`);
    
    // Show preview
    console.log('Preview of updates:');
    updates.slice(0, 5).forEach((update, i) => {
      console.log(`\n${i + 1}. ${update.name}`);
      console.log('   Fields:', update.fields);
    });
    
    if (updates.length > 5) {
      console.log(`\n... and ${updates.length - 5} more`);
    }
    
    // Ask for confirmation
    console.log('\n\nReady to update records. This will modify your Airtable data.');
    if (DRY_RUN) {
      console.log('Currently in DRY_RUN mode - no records will be updated.');
      console.log('To perform the updates, set DRY_RUN=false at the top of the script.');
    }
    
    // Update records (with rate limiting)
    if (!DRY_RUN) {
      console.log('\nUpdating records...');
      for (let i = 0; i < updates.length; i++) {
        const update = updates[i];
        try {
          await updateRecord(update.recordId, update.fields);
          console.log(`✓ Updated ${i + 1}/${updates.length}: ${update.name}`);
          
          // Rate limiting - wait 200ms between requests
          if (i < updates.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error) {
          console.error(`✗ Failed to update ${update.name}:`, error.message);
        }
      }
      console.log('\n✓ All updates complete!');
    } else {
      console.log('\n[DRY RUN] No records were actually updated.');
      console.log('To perform the updates, set DRY_RUN=false in the script.');
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  estimateDemographics();
}

module.exports = { estimateDemographics, estimateAge, estimateEthnicBackground, estimateSkinTone, estimateSunResponse, estimateSkinType };

