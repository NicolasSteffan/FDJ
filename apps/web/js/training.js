// ========================================
// TRAINING DES MODÈLES IA - JavaScript
// ========================================

// Variables globales pour le training
let trainingInProgress = false;
let modelTrainingInProgress = false;
let modelTrainingIntervals = {};

// ========================================
// FONCTIONS DE GESTION DES MODÈLES DYNAMIQUES
// ========================================

// Configuration des modèles par IA
const AI_MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o (Recommandé)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ],
  claude: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recommandé)' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' }
  ],
  mistral: [
    { value: 'mistral-large-latest', label: 'Mistral Large' },
    { value: 'mistral-medium-latest', label: 'Mistral Medium' },
    { value: 'mistral-small-latest', label: 'Mistral Small' },
    { value: 'mistral-3b-latest', label: 'Mistral 3B' }
  ],
  gemini: [
    { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Recommandé)' },
    { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash' }
  ],
  perplexity: [
    { value: 'llama-3.1-8b-online', label: 'Llama 3.1 8B Online' },
    { value: 'llama-3.1-70b-online', label: 'Llama 3.1 70B Online' },
    { value: 'mixtral-8x7b-instruct', label: 'Mixtral 8x7B Instruct' }
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-coder', label: 'DeepSeek Coder' }
  ]
};

// Modèles ajoutés dynamiquement pour l'entraînement
let DYNAMIC_MODELS = [];
let NEXT_MODEL_ID = 1;

// ========================================
// FONCTIONS DE GESTION DES MODÈLES
// ========================================

// Mettre à jour la liste des modèles selon l'IA sélectionnée
function updateTrainingModels() {
  const selectedAI = document.getElementById('trainingAI').value;
  const modelSelect = document.getElementById('trainingModel');
  
  // Vider la liste actuelle
  modelSelect.innerHTML = '';
  
  // Ajouter les modèles correspondants
  if (AI_MODELS[selectedAI]) {
    AI_MODELS[selectedAI].forEach(model => {
      const option = document.createElement('option');
      option.value = model.value;
      option.textContent = model.label;
      modelSelect.appendChild(option);
    });
  }
  
  // Ajouter un log pour indiquer le changement
  addTrainingLog(`🔄 IA sélectionnée: ${selectedAI} - ${AI_MODELS[selectedAI]?.length || 0} modèles disponibles`, 'info');
}

// Mettre à jour la liste des modèles pour la section "Ajouter une modèle"
function updateAddModelModels() {
  const selectedAI = document.getElementById('addModelAI').value;
  const modelSelect = document.getElementById('addModelModel');
  
  // Vider la liste actuelle
  modelSelect.innerHTML = '';
  
  // Ajouter les modèles correspondants
  if (AI_MODELS[selectedAI]) {
    AI_MODELS[selectedAI].forEach(model => {
      const option = document.createElement('option');
      option.value = model.value;
      option.textContent = model.label;
      modelSelect.appendChild(option);
    });
  }
}

// Fonction pour ajouter un modèle
function addModel() {
  const selectedAI = document.getElementById('addModelAI').value;
  const selectedModel = document.getElementById('addModelModel').value;
  
  if (!selectedAI || !selectedModel) {
    addTrainingLog(`❌ Veuillez sélectionner une IA et un modèle`, 'error');
    return;
  }
  
  // Vérifier si le modèle existe déjà
  const existingModel = DYNAMIC_MODELS.find(m => m.ai === selectedAI && m.model === selectedModel);
  if (existingModel) {
    addTrainingLog(`❌ Le modèle ${selectedModel} (${selectedAI}) existe déjà`, 'error');
    return;
  }
  
  addTrainingLog(`➕ Ajout du modèle: ${selectedAI} - ${selectedModel}`, 'info');
  
  // Activer la LED de la section
  activateTrainingSectionLED('add-model-section');
  
  // Ajouter le modèle à la liste dynamique
  const newModel = {
    id: NEXT_MODEL_ID++,
    ai: selectedAI,
    model: selectedModel,
    name: `Modèle ${String.fromCharCode(64 + DYNAMIC_MODELS.length + 1)}`, // A, B, C, D...
    epochs: Array(10).fill('collapsed') // 10 époques, toutes en collapsed
  };
  
  DYNAMIC_MODELS.push(newModel);
  
  // Mettre à jour le tableau
  updateTrainingTable();
  
  // Sauvegarder les modèles
  saveDynamicModels();
  
  setTimeout(() => {
    addTrainingLog(`✅ Modèle ${selectedModel} ajouté avec succès`, 'success');
  }, 1000);
}

// Fonction pour retirer un modèle
function removeModel() {
  const selectedAI = document.getElementById('addModelAI').value;
  const selectedModel = document.getElementById('addModelModel').value;
  
  if (!selectedAI || !selectedModel) {
    addTrainingLog(`❌ Veuillez sélectionner une IA et un modèle`, 'error');
    return;
  }
  
  // Chercher le modèle dans la liste dynamique
  const modelIndex = DYNAMIC_MODELS.findIndex(m => m.ai === selectedAI && m.model === selectedModel);
  if (modelIndex === -1) {
    addTrainingLog(`❌ Le modèle ${selectedModel} (${selectedAI}) n'existe pas dans la liste`, 'error');
    return;
  }
  
  const modelToRemove = DYNAMIC_MODELS[modelIndex];
  addTrainingLog(`➖ Retrait du modèle: ${selectedAI} - ${selectedModel}`, 'info');
  
  // Activer la LED de la section
  activateTrainingSectionLED('add-model-section');
  
  // Retirer le modèle de la liste
  DYNAMIC_MODELS.splice(modelIndex, 1);
  
  // Mettre à jour le tableau
  updateTrainingTable();
  
  // Sauvegarder les modèles
  saveDynamicModels();
  
  setTimeout(() => {
    addTrainingLog(`✅ Modèle ${selectedModel} retiré avec succès`, 'success');
  }, 1000);
}

// Mettre à jour le tableau des modèles d'entraînement
function updateTrainingTable() {
  const tbody = document.querySelector('#training-table tbody');
  if (!tbody) return;
  
  // Vider le tableau
  tbody.innerHTML = '';
  
  // Ajouter les modèles dynamiques
  DYNAMIC_MODELS.forEach((model, index) => {
    const row = document.createElement('tr');
    
    // Cellule du nom du modèle
    const nameCell = document.createElement('td');
    nameCell.style.cssText = 'padding: 12px; border-bottom: 1px solid #333; color: #ecf0f1;';
    nameCell.textContent = model.name;
    row.appendChild(nameCell);
    
    // Cellules des époques
    for (let epoch = 1; epoch <= 10; epoch++) {
      const epochCell = document.createElement('td');
      epochCell.style.cssText = 'padding: 12px; text-align: center; border-bottom: 1px solid #333;';
      
      const led = document.createElement('span');
      led.className = `led_generique_petite ${model.epochs[epoch - 1]}`;
      led.id = `model-${model.id}-epoch-${epoch}`;
      led.style.cssText = 'display: inline-block;';
      
      epochCell.appendChild(led);
      row.appendChild(epochCell);
    }
    
    tbody.appendChild(row);
  });
  
  // Si aucun modèle, afficher un message
  if (DYNAMIC_MODELS.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 11;
    emptyCell.style.cssText = 'padding: 20px; text-align: center; color: #7f8c8d; font-style: italic;';
    emptyCell.textContent = 'Aucun modèle ajouté. Utilisez la section "Ajouter une modèle" pour commencer.';
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  }
}

// Sauvegarder les modèles dynamiques dans localStorage
function saveDynamicModels() {
  try {
    localStorage.setItem('dynamicModels', JSON.stringify(DYNAMIC_MODELS));
    localStorage.setItem('nextModelId', NEXT_MODEL_ID.toString());
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des modèles:', error);
  }
}

// Charger les modèles dynamiques depuis localStorage
function loadDynamicModels() {
  try {
    const savedModels = localStorage.getItem('dynamicModels');
    const savedNextId = localStorage.getItem('nextModelId');
    
    if (savedModels) {
      DYNAMIC_MODELS = JSON.parse(savedModels);
    }
    
    if (savedNextId) {
      NEXT_MODEL_ID = parseInt(savedNextId);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des modèles:', error);
    DYNAMIC_MODELS = [];
    NEXT_MODEL_ID = 1;
  }
}

// ========================================
// FONCTIONS DE TRAINING
// ========================================

// Démarrer le training principal
async function startTraining() {
  if (trainingInProgress) {
    addTrainingLog('⚠️ Training déjà en cours...', 'warning');
    return;
  }

  trainingInProgress = true;
  addTrainingLog('🚀 Démarrage du training...', 'info');
  
  // Simulation du training
  for (let epoch = 1; epoch <= 10; epoch++) {
    if (!trainingInProgress) break;
    
    addTrainingLog(`📊 Époque ${epoch}/10`, 'info');
    
    // Simuler la progression
    const accuracy = Math.floor(50 + (epoch * 4) + Math.random() * 10);
    const loss = (1.0 - (epoch * 0.08) + Math.random() * 0.1).toFixed(3);
    
    document.getElementById('trainingAccuracy').textContent = `${accuracy}%`;
    document.getElementById('trainingLoss').textContent = loss;
    
    addTrainingLog(`   → Accuracy: ${accuracy}%, Loss: ${loss}`, 'info');
    
    // Attendre avant la prochaine époque
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  if (trainingInProgress) {
    addTrainingLog('✅ Training terminé avec succès !', 'success');
    trainingInProgress = false;
  }
}

// Arrêter le training
function stopTraining() {
  if (trainingInProgress) {
    trainingInProgress = false;
    addTrainingLog('⏹️ Training arrêté par l\'utilisateur', 'warning');
  } else {
    addTrainingLog('ℹ️ Aucun training en cours', 'info');
  }
}

// Ajouter un log de training
function addTrainingLog(message, type = 'info') {
  const logsContainer = document.getElementById('trainingLogs');
  if (!logsContainer) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  
  // Couleurs selon le type
  const colors = {
    'info': '#00ff00',
    'success': '#27ae60',
    'warning': '#f39c12',
    'error': '#e74c3c'
  };
  
  logEntry.style.color = colors[type] || colors.info;
  logEntry.textContent = `[${timestamp}] ${message}`;
  
  logsContainer.appendChild(logEntry);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Effacer les logs
function clearTrainingLogs() {
  const logsContainer = document.getElementById('trainingLogs');
  if (logsContainer) {
    logsContainer.innerHTML = `
      <div style="color: #ffff00;">Training Logs</div>
      <div style="color: #888;">Logs effacés...</div>
    `;
  }
}

// ========================================
// FONCTIONS DU WIZARD
// ========================================

// Exécuter une étape du wizard
function wizardStep(step) {
  addTrainingLog(`🔧 Exécution de l'étape ${step} du wizard`, 'info');
  
  // Activer la LED de l'étape
  const ledId = `wizard-led-${step}`;
  const led = document.getElementById(ledId);
  if (led) {
    led.classList.remove('collapsed');
    led.classList.add('expanded');
    
    // Remettre en gris après 3 secondes
    setTimeout(() => {
      led.classList.remove('expanded');
      led.classList.add('collapsed');
    }, 3000);
  }
  
  // Messages selon l'étape
  const stepMessages = {
    1: '📊 Préparation des données en cours...',
    2: '⚙️ Configuration du modèle...',
    3: '🚀 Démarrage de l\'entraînement initial...',
    4: '✅ Validation du modèle...',
    5: '💾 Sauvegarde et export...'
  };
  
  setTimeout(() => {
    addTrainingLog(stepMessages[step] || `Étape ${step} terminée`, 'success');
  }, 1500);
}

// Reset du wizard
function resetWizard() {
  addTrainingLog('🔄 Reset du wizard', 'info');
  
  // Remettre toutes les LEDs du wizard en gris
  for (let i = 1; i <= 5; i++) {
    const led = document.getElementById(`wizard-led-${i}`);
    if (led) {
      led.classList.remove('expanded');
      led.classList.add('collapsed');
    }
  }
}

// Exécuter tout le wizard
function runFullWizard() {
  addTrainingLog('🚀 Exécution complète du wizard', 'info');
  
  // Exécuter toutes les étapes avec délai
  for (let i = 1; i <= 5; i++) {
    setTimeout(() => {
      wizardStep(i);
    }, i * 2000);
  }
}

// ========================================
// FONCTIONS D'ENTRAÎNEMENT DES MODÈLES
// ========================================

// Démarrer l'entraînement des modèles
function startModelTraining() {
  if (modelTrainingInProgress) {
    addTrainingLog('⚠️ Entraînement déjà en cours...', 'warning');
    return;
  }
  
  if (DYNAMIC_MODELS.length === 0) {
    addTrainingLog('❌ Aucun modèle à entraîner. Ajoutez des modèles d\'abord.', 'error');
    return;
  }
  
  modelTrainingInProgress = true;
  addTrainingLog(`🚀 Démarrage de l'entraînement de ${DYNAMIC_MODELS.length} modèle(s)...`, 'info');
  
  // Démarrer l'entraînement pour chaque modèle dynamique
  const delays = [0, 2000, 4000, 6000, 8000, 10000]; // Décalage pour chaque modèle
  
  DYNAMIC_MODELS.forEach((model, index) => {
    setTimeout(() => {
      startModelTrainingSequence(model.id);
    }, delays[index] || 0);
  });
}

// Séquence d'entraînement pour un modèle spécifique
function startModelTrainingSequence(modelId) {
  const model = DYNAMIC_MODELS.find(m => m.id === modelId);
  if (!model) {
    addTrainingLog(`❌ Modèle avec ID ${modelId} non trouvé`, 'error');
    return;
  }
  
  addTrainingLog(`📊 Démarrage entraînement ${model.name} (${model.ai} - ${model.model})...`, 'info');
  
  let currentEpoch = 1;
  const maxEpochs = 10;
  
  // Fonction pour passer à l'époque suivante
  function nextEpoch() {
    if (currentEpoch <= maxEpochs && modelTrainingInProgress) {
      // Activer la LED de l'époque actuelle (progression du bas vers le haut)
      const ledId = `model-${modelId}-epoch-${currentEpoch}`;
      const led = document.getElementById(ledId);
      
      if (led) {
        led.classList.remove('collapsed');
        led.classList.add('expanded');
        
        // Mettre à jour l'état dans le modèle
        model.epochs[currentEpoch - 1] = 'expanded';
        
        // Log de progression
        addTrainingLog(`   ${model.name} - Époque ${currentEpoch}/${maxEpochs}`, 'info');
        
        // Simuler une métrique de performance
        const accuracy = Math.floor(45 + (currentEpoch * 3.5) + Math.random() * 5);
        addTrainingLog(`   → Accuracy: ${accuracy}%`, 'info');
      }
      
      currentEpoch++;
      
      // Programmer la prochaine époque
      if (currentEpoch <= maxEpochs) {
        modelTrainingIntervals[modelId] = setTimeout(nextEpoch, 1500);
      } else {
        // Entraînement terminé pour ce modèle
        addTrainingLog(`✅ Entraînement ${model.name} terminé`, 'success');
        
        // Vérifier si tous les modèles sont terminés
        checkAllModelsCompleted();
      }
    }
  }
  
  // Démarrer la séquence
  nextEpoch();
}

// Vérifier si tous les modèles ont terminé leur entraînement
function checkAllModelsCompleted() {
  const allIntervals = Object.values(modelTrainingIntervals);
  const allCompleted = allIntervals.every(interval => interval === null);
  
  if (allCompleted) {
    modelTrainingInProgress = false;
    addTrainingLog('🎉 Entraînement de tous les modèles terminé !', 'success');
  }
}

// Reset de l'entraînement des modèles
function resetModelTraining() {
  // Arrêter tous les intervalles en cours
  Object.values(modelTrainingIntervals).forEach(interval => {
    if (interval) clearTimeout(interval);
  });
  
  modelTrainingIntervals = {};
  modelTrainingInProgress = false;
  
  // Remettre toutes les LEDs en gris pour les modèles dynamiques
  DYNAMIC_MODELS.forEach(model => {
    for (let epoch = 1; epoch <= 10; epoch++) {
      const ledId = `model-${model.id}-epoch-${epoch}`;
      const led = document.getElementById(ledId);
      if (led) {
        led.classList.remove('expanded');
        led.classList.add('collapsed');
      }
    }
    // Réinitialiser l'état des époques
    model.epochs = Array(10).fill('collapsed');
  });
  
  // Mettre à jour le tableau
  updateTrainingTable();
  
  // Sauvegarder les modèles
  saveDynamicModels();
  
  addTrainingLog('🔄 Reset entraînement - Tous les modèles remis à zéro', 'info');
}

// ========================================
// FONCTIONS POUR LES SECTIONS PLIABLES
// ========================================

// Basculer l'état d'une section du training
function toggleTrainingSection(sectionId) {
  const section = document.getElementById(sectionId);
  const content = document.getElementById(sectionId.replace('-section', '-content'));
  const toggle = document.getElementById(sectionId.replace('-section', '-toggle'));
  const led = document.getElementById(sectionId.replace('-section', '-led'));
  
  if (content.classList.contains('collapsed')) {
    // Déplier le contenu
    content.classList.remove('collapsed');
    content.classList.add('expanded');
    if (toggle) {
      toggle.classList.remove('collapsed');
      toggle.classList.add('expanded');
      toggle.textContent = '▲';
    }
    if (led) {
      led.classList.remove('collapsed');
      led.classList.add('expanded');
    }
  } else {
    // Plier le contenu
    content.classList.remove('expanded');
    content.classList.add('collapsed');
    if (toggle) {
      toggle.classList.remove('expanded');
      toggle.classList.add('collapsed');
      toggle.textContent = '▼';
    }
    if (led) {
      led.classList.remove('expanded');
      led.classList.add('collapsed');
    }
  }
}

// Activer les LEDs des sections pliables du training
function activateTrainingSectionLED(sectionId) {
  const ledId = sectionId.replace('-section', '-led');
  const led = document.getElementById(ledId);
  if (led) {
    led.classList.remove('collapsed');
    led.classList.add('expanded');
    
    // Remettre la LED en gris après 3 secondes
    setTimeout(() => {
      led.classList.remove('expanded');
      led.classList.add('collapsed');
    }, 3000);
  }
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

// Mettre à jour le bouton selon le type de données sélectionné
function updateTrainingButtons() {
  const dataType = document.getElementById('trainingDataType').value;
  const actionBtn = document.getElementById('trainingActionBtn');
  
  if (dataType === 'training') {
    actionBtn.innerHTML = 'Lecture';
  } else if (dataType === 'test') {
    actionBtn.innerHTML = 'Entraîner';
  } else {
    actionBtn.innerHTML = 'Mixte';
  }
}

// Exécuter l'action de training selon le type sélectionné
function executeTrainingAction() {
  const dataType = document.getElementById('trainingDataType').value;
  const selectedAI = document.getElementById('trainingAI').value;
  const selectedModel = document.getElementById('trainingModel').value;
  
  addTrainingLog(`🎯 Action: ${dataType} avec ${selectedAI} - ${selectedModel}`, 'info');
  
  if (dataType === 'training') {
    addTrainingLog('📖 Lecture des données d\'entraînement...', 'info');
  } else if (dataType === 'test') {
    addTrainingLog('🧪 Entraînement sur données de test...', 'info');
    startTraining();
  } else {
    addTrainingLog('🔄 Traitement de toutes les données...', 'info');
  }
}

// Actions rapides
function quickAction(actionNumber) {
  addTrainingLog(`⚡ Action rapide ${actionNumber} exécutée`, 'info');
  
  // Activer la LED de l'action
  const ledId = `quick-led-${actionNumber}`;
  const led = document.getElementById(ledId);
  if (led) {
    led.classList.remove('collapsed');
    led.classList.add('expanded');
    
    // Remettre en gris après 2 secondes
    setTimeout(() => {
      led.classList.remove('expanded');
      led.classList.add('collapsed');
    }, 2000);
  }
}

// Exporter le modèle entraîné
function exportTrainedModel() {
  addTrainingLog('📤 Export du modèle entraîné...', 'info');
  setTimeout(() => {
    addTrainingLog('✅ Modèle exporté avec succès', 'success');
  }, 1000);
}

// Évaluer le modèle
function evaluateModel() {
  addTrainingLog('🔍 Évaluation du modèle...', 'info');
  setTimeout(() => {
    const score = Math.floor(75 + Math.random() * 20);
    addTrainingLog(`📊 Score d'évaluation: ${score}%`, 'success');
  }, 1500);
}

// ========================================
// INITIALISATION
// ========================================

// Initialiser les modèles au chargement de la page
function initializeTrainingModels() {
  loadDynamicModels(); // Charger les modèles sauvegardés
  updateTrainingModels();
  updateAddModelModels(); // Initialiser aussi la section "Ajouter une modèle"
  updateTrainingButtons();
  updateTrainingTable(); // Initialiser le tableau
}



// Initialiser quand la page Training est chargée
if (typeof window !== 'undefined') {
  // Auto-initialisation si on est dans le navigateur
  document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si on est sur la page Training
    if (document.getElementById('trainingAI')) {
      initializeTrainingModels();
    }
  });
}
