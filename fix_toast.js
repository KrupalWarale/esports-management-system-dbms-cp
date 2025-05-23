const fs = require('fs');
const path = require('path');

// Files to process
const filesToFix = [
  'esports/src/pages/AddData.jsx',
  'esports/src/pages/AddToGame.jsx',
  'esports/src/pages/LoginPage.jsx',
  'esports/src/pages/PlayerRegistration.jsx',
  'esports/src/pages/TeamManagement.jsx',
  'esports/src/pages/TeamRegistration.jsx',
  'esports/src/pages/UserDashboard.jsx',
  'esports/src/pages/UserLogin.jsx',
  'esports/src/pages/UserRegistration.jsx'
];

// Process each file
filesToFix.forEach(filePath => {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Modify import statements
    let modifiedContent = content.replace(
      /import\s+\{\s*(ToastContainer,\s*toast|toast,\s*ToastContainer)\s*\}\s+from\s+['"]react-toastify['"];?/g,
      'import { toast } from \'react-toastify\';'
    );
    
    // Remove ToastContainer component
    modifiedContent = modifiedContent.replace(
      /<ToastContainer[\s\S]*?\/>/g, 
      ''
    );
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, modifiedContent);
    
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log('All files processed. Please restart your application to apply changes.'); 