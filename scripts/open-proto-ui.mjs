import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const indexPath = resolve(__dirname, '..', 'proto', 'ui-minimal', 'index.html');

const platform = process.platform;
if (platform === 'win32') {
  spawn('powershell', ['-NoLogo','-NoProfile','-Command', `Start-Process '${indexPath.replace(/'/g, "''")}'`], { stdio: 'inherit' });
} else if (platform === 'darwin') {
  spawn('open', [indexPath], { stdio: 'inherit' });
} else {
  spawn('xdg-open', [indexPath], { stdio: 'inherit' });
}

