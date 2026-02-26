const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  rootDir: process.cwd(),
  outputDir: path.join(process.cwd(), 'processed_docs'),
  ignoreDirs: ['node_modules', '.git', 'dist', 'build', 'coverage', '.vscode'],
  ignoreFiles: ['README.md', 'LICENSE', 'CHANGELOG.md'], // Optional: specific files to ignore
  minContentLength: 100, // Filter out small files
  targetLanguages: ['en', 'hi'], // English and Hindi
};

// Statistics
const stats = {
  totalFiles: 0,
  processedFiles: 0,
  skippedFiles: 0,
  mergedGroups: 0,
  errors: 0,
};

// Simple dictionary for demonstration (In a real app, use a Translation API)
const DICTIONARY = {
  'User Management': 'उपयोगकर्ता प्रबंधन',
  'Asset Management': 'संपत्ति प्रबंधन',
  'Inventory': 'इन्वेंटरी',
  'Login': 'लॉगिन',
  'Dashboard': 'डैशबोर्ड',
  'Setup': 'स्थापना',
  'Permissions': 'अनुमतियां',
  'Role': 'भूमिका',
  'Rights': 'अधिकार',
  'Add': 'जोड़ें',
  'Edit': 'संपादित करें',
  'Delete': 'हटाएं',
  'View': 'देखें',
  'Search': 'खोजें',
  'Filter': 'फ़िल्टर',
  'Status': 'स्थिति',
  'Active': 'सक्रिय',
  'Inactive': 'निष्क्रिय',
  'Submit': 'जमा करें',
  'Cancel': 'रद्द करें',
  'Success': 'सफलता',
  'Error': 'त्रुटि',
  'Loading': 'लोड हो रहा है',
  'Description': 'विवरण',
  'Name': 'नाम',
  'Date': 'दिनांक',
  'Action': 'कार्रवाई',
  'Module': 'मॉड्यूल',
  'Submodule': 'उप-मॉड्यूल',
  'Page': 'पृष्ठ',
  'Introduction': 'परिचय',
  'Overview': 'अवलोकन',
  'Features': 'विशेषताएं',
  'Installation': 'इंस्टॉलेशन',
  'Configuration': 'कॉन्फ़िगरेशन',
  'Usage': 'उपयोग',
  'API Reference': 'एपीआई संदर्भ',
  'Troubleshooting': 'समस्या निवारण',
  'FAQ': 'सामान्य प्रश्न',
};

/**
 * Mock Translation Function
 * In a production environment, integrate with Google Translate API, Microsoft Translator, or similar.
 */
async function translateText(text, targetLang) {
  if (targetLang === 'en') return text;
  
  // Simple dictionary lookup for demo
  // Split by words/phrases to find matches (naive approach)
  let translated = text;
  
  // Replace known terms
  Object.keys(DICTIONARY).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    translated = translated.replace(regex, DICTIONARY[key]);
  });

  // If no changes, append a marker to show it was "processed"
  if (translated === text && text.trim().length > 0) {
    // For large blocks of text, we can't really translate without an API.
    // We'll leave it as is but mark it.
    // valid translation API would go here.
    return text; 
  }

  return translated;
}

/**
 * Recursively scan directory for markdown files
 */
async function scanDirectory(dir) {
  let results = [];
  try {
    const list = await fs.readdir(dir);
    
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        if (!CONFIG.ignoreDirs.includes(file) && !file.startsWith('.')) {
          const subResults = await scanDirectory(filePath);
          results = results.concat(subResults);
        }
      } else {
        if (file.endsWith('.md') && !CONFIG.ignoreFiles.includes(file)) {
          // Check content length
          const content = await fs.readFile(filePath, 'utf8');
          if (content.length >= CONFIG.minContentLength) {
            results.push({
              path: filePath,
              name: file,
              content: content,
              parentDir: path.basename(path.dirname(filePath)),
              stats: stat
            });
            stats.processedFiles++;
          } else {
            stats.skippedFiles++;
            console.log(`Skipped (too small): ${filePath}`);
          }
          stats.totalFiles++;
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dir}:`, err);
    stats.errors++;
  }
  return results;
}

/**
 * Group files by context (Parent Directory)
 */
function groupFiles(files) {
  const groups = {};
  
  files.forEach(file => {
    const groupKey = file.parentDir; // Simple grouping by folder name
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(file);
  });
  
  return groups;
}

/**
 * Process and Merge Groups
 */
async function processGroups(groups) {
  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  for (const [groupName, files] of Object.entries(groups)) {
    console.log(`Processing group: ${groupName} (${files.length} files)`);
    stats.mergedGroups++;

    // Sort files by name (or add custom logic)
    files.sort((a, b) => a.name.localeCompare(b.name));

    // Combine content
    let mergedContentEn = `# ${groupName.toUpperCase()} DOCUMENTATION\n\n`;
    let mergedContentHi = `# ${await translateText(groupName.toUpperCase(), 'hi')} दस्तावेज़ीकरण\n\n`;

    for (const file of files) {
      const sectionTitle = file.name.replace('.md', '');
      
      // English
      mergedContentEn += `## ${sectionTitle}\n\n${file.content}\n\n---\n\n`;
      
      // Hindi Translation (Mock)
      const translatedTitle = await translateText(sectionTitle, 'hi');
      const translatedBody = await translateText(file.content, 'hi');
      mergedContentHi += `## ${translatedTitle}\n\n${translatedBody}\n\n---\n\n`;
    }

    // Write Files
    const filenameBase = groupName.toLowerCase().replace(/\s+/g, '-');
    
    // Write English
    await fs.writeFile(
      path.join(CONFIG.outputDir, `${filenameBase}-en.md`), 
      mergedContentEn
    );
    
    // Write Hindi
    await fs.writeFile(
      path.join(CONFIG.outputDir, `${filenameBase}-hi.md`), 
      mergedContentHi
    );
  }
}

/**
 * Generate Log Report
 */
async function generateReport() {
  const report = `
# Documentation Processing Report
Date: ${new Date().toISOString()}

## Statistics
- Total Files Scanned: ${stats.totalFiles}
- Files Processed: ${stats.processedFiles}
- Files Skipped: ${stats.skippedFiles}
- Merged Groups: ${stats.mergedGroups}
- Errors: ${stats.errors}

## Output Location
${CONFIG.outputDir}

## Note on Translation
This script uses a dictionary-based mock translation for demonstration. 
For production use, please integrate a valid Translation API (e.g., Google Cloud Translation, AWS Translate).
`;

  await fs.writeFile(path.join(CONFIG.outputDir, 'processing-report.md'), report);
  console.log(report);
}

/**
 * Main Execution
 */
async function main() {
  console.log('Starting Documentation Processing...');
  console.log(`Root Directory: ${CONFIG.rootDir}`);
  
  try {
    // 1. Scan
    const files = await scanDirectory(CONFIG.rootDir);
    
    // 2. Group
    const groups = groupFiles(files);
    
    // 3. Process & Translate
    await processGroups(groups);
    
    // 4. Report
    await generateReport();
    
    console.log('Processing Complete!');
  } catch (err) {
    console.error('Fatal Error:', err);
  }
}

main();
