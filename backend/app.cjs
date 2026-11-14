// Start file for the live hosting (cPanel "Setup Node.js App").
//
// cPanel starts an app by loading one file the old way (require). The backend
// is written the new way (ES modules), which cannot be loaded like that, so
// this small file loads it the new way instead.
//
// In cPanel, set "Application startup file" to: app.cjs
// On your PC you do not need this file: use "npm run dev".

// The settings file (.env) is read from the current folder, so make sure the
// current folder is this one, wherever the hosting started the app from.
process.chdir(__dirname);

import('./dist/main.js').catch((error) => {
  console.error('The backend failed to start:', error);
  process.exit(1);
});
