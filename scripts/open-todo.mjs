#!/usr/bin/env node

/**
 * Script d'ouverture automatique du TODO au démarrage
 * Utilisation: node scripts/open-todo.mjs
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const todoPath = join(projectRoot, 'TODO.md');

console.log('🚀 Ouverture automatique du TODO...');

// Vérifier que le fichier TODO existe
if (!existsSync(todoPath)) {
  console.error('❌ Fichier TODO.md introuvable !');
  process.exit(1);
}

// Ouvrir le TODO dans l'éditeur par défaut
const openCommand = process.platform === 'win32' ? 'start' : 
                   process.platform === 'darwin' ? 'open' : 'xdg-open';

const child = spawn(openCommand, [todoPath], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('❌ Erreur lors de l\'ouverture:', error.message);
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ TODO ouvert avec succès !');
  } else {
    console.log(`⚠️  Processus terminé avec le code: ${code}`);
  }
});