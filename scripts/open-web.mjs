import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const indexPath = resolve(__dirname, '..', 'apps', 'web', 'index.html');

function openDefault(pathToOpen) {
  const platform = process.platform;
  if (platform === 'win32') {
    // Use PowerShell Start-Process for reliability
    return spawn('powershell', ['-NoLogo', '-NoProfile', '-Command', `Start-Process '${pathToOpen.replace(/'/g, "''")}'`], { stdio: 'inherit' });
  }
  if (platform === 'darwin') {
    return spawn('open', [pathToOpen], { stdio: 'inherit' });
  }
  // linux and others
  return spawn('xdg-open', [pathToOpen], { stdio: 'inherit' });
}

openDefault(indexPath);

