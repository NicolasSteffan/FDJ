/**
 * Script JavaScript pour la page Training des Modèles IA
 * Version V0.004A avec système modulaire
 */

// Configuration des modèles IA
const AI_MODELS = {
  openai: ['gpt-4o', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  claude: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  mistral: ['mistral-large', 'mistral-medium', 'mistral-small'],
  gemini: ['gemini-pro', 'gemini-pro-vision'],
  perplexity: ['pplx-7b-online', 'pplx-70b-online'],
  deepseek: ['deepseek-chat', 'deepseek-coder']
};

// Modèles actifs (mémorisés)
let ACTIVE_MODELS = [
  { ai: 'openai', model: 'gpt-4o', name: 'ChatGPT-4o', id: 1 },
  { ai: 'openai', model: 'gpt-4', name: 'ChatGPT-4', id: 2 }
];

// Modèles dynamiques ajoutés par l'utilisateur
let DYNAMIC_MODELS = [];
let NEXT_MODEL_ID = 3;

/**
 * Met à jour la liste des modèles pour le training (seulement modèles actifs)
 */
function updateTrainingModels() {
  const aiSelect = document.getElementById('trainingAI');
  const modelSelect = document.getElementById('trainingModel');
  
  if (!aiSelect || !modelSelect) return;
  
  const selectedAI = aiSelect.value;
  
  // Filtrer les modèles actifs pour l'IA sélectionnée
  const activeModelsForAI = ACTIVE_MODELS.filter(m => m.ai === selectedAI);
  
  // Vider la liste
  modelSelect.innerHTML = '';
  
  // Ajouter les modèles actifs seulement
  activeModelsForAI.forEach(modelObj => {
    const option = document.createElement('option');
    option.value = modelObj.model;
    option.textContent = modelObj.name;
    modelSelect.appendChild(option);
  });
  
  console.log(`Modèles actifs mis à jour pour ${selectedAI}:`, activeModelsForAI);
}

/**
 * Met à jour la liste des modèles pour l'ajout
 */
function updateAddModelModels() {
  const aiSelect = document.getElementById('addModelAI');
  const modelSelect = document.getElementById('addModelModel');
  
  if (!aiSelect || !modelSelect) return;
  
  const selectedAI = aiSelect.value;
  const models = AI_MODELS[selectedAI] || [];
  
  // Vider la liste
  modelSelect.innerHTML = '';
  
  // Ajouter les modèles
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });
  
  console.log(`Modèles d'ajout mis à jour pour ${selectedAI}:`, models);
}

/**
 * Ajoute un nouveau modèle comme modèle actif
 */
function addModel() {
  const aiSelect = document.getElementById('addModelAI');
  const modelSelect = document.getElementById('addModelModel');
  
  if (!aiSelect || !modelSelect) {
    console.error('Éléments de sélection non trouvés');
    return;
  }
  
  const ai = aiSelect.value;
  const model = modelSelect.value;
  
  if (!ai || !model) {
    alert('Veuillez sélectionner une IA et un modèle');
    return;
  }
  
  // Vérifier si le modèle existe déjà
  const exists = ACTIVE_MODELS.find(m => m.ai === ai && m.model === model);
  if (exists) {
    alert('Ce modèle est déjà actif');
    return;
  }
  
  // Créer un nom lisible pour le modèle
  let modelName;
  if (ai === 'openai' && model.includes('gpt-4')) {
    modelName = model === 'gpt-4o' ? 'ChatGPT-4o' : 'ChatGPT-4';
  } else {
    modelName = `${ai.charAt(0).toUpperCase() + ai.slice(1)}-${model}`;
  }
  
  // Créer un nouveau modèle actif
  const newModel = {
    id: NEXT_MODEL_ID++,
    ai: ai,
    model: model,
    name: modelName
  };
  
  // Ajouter aux modèles actifs
  ACTIVE_MODELS.push(newModel);
  
  console.log('Modèle actif ajouté:', newModel);
  
  // Mettre à jour les interfaces
  updateTrainingModels();
  updateTrainingTable();
  saveActiveModels();
  
  // Log dans les training logs
  addTrainingLog(`✅ Modèle actif ajouté: ${newModel.name}`, 'success');
}

/**
 * Retire le dernier modèle actif ajouté
 */
function removeModel() {
  // Ne pas supprimer les modèles par défaut (ChatGPT-4o et ChatGPT-4)
  const removableModels = ACTIVE_MODELS.filter(m => m.id > 2);
  
  if (removableModels.length === 0) {
    alert('Aucun modèle supplémentaire à retirer (les modèles par défaut sont protégés)');
    return;
  }
  
  // Retirer le dernier modèle ajouté
  const lastModel = removableModels[removableModels.length - 1];
  const index = ACTIVE_MODELS.findIndex(m => m.id === lastModel.id);
  
  if (index !== -1) {
    const removedModel = ACTIVE_MODELS.splice(index, 1)[0];
    console.log('Modèle actif retiré:', removedModel);
    
    // Mettre à jour les interfaces
    updateTrainingModels();
    updateTrainingTable();
    saveActiveModels();
    
    // Log dans les training logs
    addTrainingLog(`❌ Modèle actif retiré: ${removedModel.name}`, 'error');
  }
}

/**
 * Met à jour le tableau d'entraînement avec les modèles actifs
 */
function updateTrainingTable() {
  const tbody = document.querySelector('#training-table tbody');
  if (!tbody) return;
  
  // Vider le tableau existant (garder seulement les modèles fixes A, B, C, D)
  const existingRows = tbody.querySelectorAll('tr[id^="active-model-"]');
  existingRows.forEach(row => row.remove());
  
  // Ajouter les modèles actifs au tableau
  ACTIVE_MODELS.forEach((model, index) => {
    // Créer une nouvelle ligne pour chaque modèle actif
    const row = document.createElement('tr');
    row.id = `active-model-${model.id}`;
    
    // Contenu de la ligne
    row.innerHTML = `
      <td style="padding: 12px; border-bottom: 1px solid #333; color: #ecf0f1;">${model.name}</td>
      ${Array.from({length: 10}, (_, i) => `
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #333;">
          <span class="led_generique_petite collapsed" id="${model.name.replace(/[^a-zA-Z0-9]/g, '-')}-epoch-${i+1}" style="display: inline-block;"></span>
        </td>
      `).join('')}
    `;
    
    tbody.appendChild(row);
  });
  
  console.log(`Tableau mis à jour avec ${ACTIVE_MODELS.length} modèles actifs`);
}

/**
 * Sauvegarde les modèles actifs dans localStorage
 */
function saveActiveModels() {
  try {
    localStorage.setItem('training_active_models', JSON.stringify(ACTIVE_MODELS));
    localStorage.setItem('training_next_model_id', NEXT_MODEL_ID.toString());
    console.log('Modèles actifs sauvegardés');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
}

/**
 * Charge les modèles actifs depuis localStorage
 */
function loadActiveModels() {
  try {
    const saved = localStorage.getItem('training_active_models');
    const savedId = localStorage.getItem('training_next_model_id');
    
    if (saved) {
      ACTIVE_MODELS = JSON.parse(saved);
      console.log('Modèles actifs chargés:', ACTIVE_MODELS);
    }
    
    if (savedId) {
      NEXT_MODEL_ID = parseInt(savedId);
      console.log('Next model ID chargé:', NEXT_MODEL_ID);
    }
    
    updateTrainingTable();
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
  }
}

/**
 * Sauvegarde les modèles dynamiques dans localStorage (legacy)
 */
function saveDynamicModels() {
  // Fonction maintenue pour compatibilité mais redirige vers saveActiveModels
  saveActiveModels();
}

/**
 * Charge les modèles dynamiques depuis localStorage (legacy)
 */
function loadDynamicModels() {
  // Fonction maintenue pour compatibilité mais redirige vers loadActiveModels
  loadActiveModels();
}

/**
 * Démarre l'entraînement d'un modèle
 */
function startModelTraining() {
  addTrainingLog('🚀 Démarrage de l\'entraînement des modèles...', 'info');
  
  // Simuler l'entraînement
  let epoch = 1;
  const maxEpochs = 10;
  
  const trainingInterval = setInterval(() => {
    // Activer les LEDs progressivement
    const models = ['model-a', 'model-b', 'model-c', 'model-d'];
    models.forEach(model => {
      const led = document.getElementById(`${model}-epoch-${epoch}`);
      if (led) {
        led.classList.remove('collapsed');
        led.classList.add('expanded');
      }
    });
    
    // Mettre à jour les métriques
    const accuracy = Math.min(95, 60 + (epoch * 3.5));
    const loss = Math.max(0.001, 0.5 - (epoch * 0.05));
    
    document.getElementById('trainingAccuracy').textContent = `${accuracy.toFixed(1)}%`;
    document.getElementById('trainingLoss').textContent = loss.toFixed(3);
    
    addTrainingLog(`📊 Époque ${epoch}/${maxEpochs} - Précision: ${accuracy.toFixed(1)}% - Loss: ${loss.toFixed(3)}`, 'info');
    
    epoch++;
    
    if (epoch > maxEpochs) {
      clearInterval(trainingInterval);
      addTrainingLog('✅ Entraînement terminé avec succès!', 'success');
    }
  }, 1000);
}

/**
 * Démarre une séquence d'entraînement complète
 */
function startModelTrainingSequence() {
  addTrainingLog('🎯 Démarrage de la séquence d\'entraînement complète...', 'info');
  startModelTraining();
}

/**
 * Reset l'entraînement des modèles
 */
function resetModelTraining() {
  // Reset toutes les LEDs
  const leds = document.querySelectorAll('#training-table .led_generique_petite');
  leds.forEach(led => {
    led.classList.remove('expanded');
    led.classList.add('collapsed');
  });
  
  // Reset les métriques
  document.getElementById('trainingAccuracy').textContent = '0%';
  document.getElementById('trainingLoss').textContent = '0.000';
  
  addTrainingLog('🔄 Entraînement réinitialisé', 'warning');
}

/**
 * Toggle une section pliable
 */
function toggleTrainingSection(sectionId) {
  const section = document.getElementById(sectionId);
  const content = document.getElementById(sectionId.replace('-section', '-content'));
  const led = document.getElementById(sectionId.replace('-section', '-led'));
  
  if (!section || !content || !led) {
    console.error(`Éléments non trouvés pour ${sectionId}`);
    return;
  }
  
  // Toggle la visibilité
  if (content.classList.contains('expanded')) {
    content.classList.remove('expanded');
    content.classList.add('collapsed');
    led.classList.remove('expanded');
    led.classList.add('collapsed');
  } else {
    content.classList.remove('collapsed');
    content.classList.add('expanded');
    led.classList.remove('collapsed');
    led.classList.add('expanded');
  }
  
  console.log(`Section ${sectionId} toggled`);
}

/**
 * Active la LED d'une section
 */
function activateTrainingSectionLED(sectionId) {
  const led = document.getElementById(sectionId.replace('-section', '-led'));
  if (led) {
    led.classList.remove('collapsed');
    led.classList.add('expanded');
  }
}

/**
 * Ajoute un log dans les training logs
 */
function addTrainingLog(message, type = 'info') {
  const logsContainer = document.getElementById('trainingLogs');
  if (!logsContainer) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '#00ff00',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c'
  };
  
  const logDiv = document.createElement('div');
  logDiv.style.color = colors[type] || colors.info;
  logDiv.textContent = `[${timestamp}] ${message}`;
  
  logsContainer.appendChild(logDiv);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

/**
 * Efface les logs de training
 */
function clearTrainingLogs() {
  const logsContainer = document.getElementById('trainingLogs');
  if (logsContainer) {
    logsContainer.innerHTML = `
      <div style="color: #ffff00;">Training Logs</div>
      <div style="color: #888;">Logs effacés...</div>
    `;
  }
}

/**
 * Initialise les modèles au chargement de la page
 */
function initializeTrainingModels() {
  console.log('Initialisation des modèles de training...');
  
  // Charger les modèles actifs sauvegardés
  loadActiveModels();
  
  // Initialiser les dropdowns avec OpenAI par défaut
  const trainingAISelect = document.getElementById('trainingAI');
  const addModelAISelect = document.getElementById('addModelAI');
  
  if (trainingAISelect) {
    trainingAISelect.value = 'openai';
  }
  if (addModelAISelect) {
    addModelAISelect.value = 'openai';
  }
  
  // Mettre à jour les listes de modèles
  updateTrainingModels();
  updateAddModelModels();
  
  // Log d'initialisation
  addTrainingLog('🎯 Page Training des Modèles IA initialisée', 'success');
  addTrainingLog(`📊 ${ACTIVE_MODELS.length} modèles actifs chargés`, 'info');
  
  console.log('Modèles de training initialisés');
}

// Fonctions pour les autres actions (compatibilité)
function wizardStep(step) {
  const led = document.getElementById(`wizard-led-${step}`);
  if (led) {
    led.classList.remove('collapsed');
    led.classList.add('expanded');
  }
  
  // Gérer la barre de progression pour l'étape 1
  if (step === 1) {
    const progressBar = document.getElementById('step1-progress');
    if (progressBar) {
      // Simuler une progression
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
          clearInterval(interval);
          addTrainingLog(`✅ Étape ${step}: Entraînement du modèle terminé`, 'success');
        }
      }, 200);
      
      addTrainingLog(`🚀 Étape ${step}: Démarrage de l'entraînement du modèle...`, 'info');
    }
  } else {
    addTrainingLog(`🧙 Wizard étape ${step} exécutée`, 'info');
  }
}

function resetWizard() {
  for (let i = 1; i <= 5; i++) {
    const led = document.getElementById(`wizard-led-${i}`);
    if (led) {
      led.classList.remove('expanded');
      led.classList.add('collapsed');
    }
  }
  
  // Remettre à zéro la barre de progression de l'étape 1
  const progressBar = document.getElementById('step1-progress');
  if (progressBar) {
    progressBar.style.width = '0%';
  }
  
  addTrainingLog('🔄 Wizard réinitialisé', 'warning');
}

function runFullWizard() {
  addTrainingLog('🚀 Exécution complète du wizard...', 'info');
  for (let i = 1; i <= 5; i++) {
    setTimeout(() => wizardStep(i), i * 500);
  }
}

function quickAction(actionId) {
  const led = document.getElementById(`quick-led-${actionId}`);
  if (led) {
    led.classList.remove('collapsed');
    led.classList.add('expanded');
    setTimeout(() => {
      led.classList.remove('expanded');
      led.classList.add('collapsed');
    }, 2000);
  }
  addTrainingLog(`⚡ Action rapide ${actionId} exécutée`, 'info');
}

function updateTrainingButtons() {
  const dataType = document.getElementById('trainingDataType')?.value;
  addTrainingLog(`📊 Type de données changé: ${dataType}`, 'info');
}

function executeTrainingAction() {
  const actionBtn = document.getElementById('trainingActionBtn');
  if (actionBtn) {
    const action = actionBtn.textContent.trim();
    addTrainingLog(`🎯 Action exécutée: ${action}`, 'info');
  }
}

function startTraining() {
  addTrainingLog('🚀 Démarrage du training...', 'success');
  startModelTraining();
}

function stopTraining() {
  addTrainingLog('⏹️ Arrêt du training demandé', 'warning');
}

function exportTrainedModel() {
  addTrainingLog('📤 Export du modèle entraîné...', 'info');
}

function evaluateModel() {
  addTrainingLog('📊 Évaluation du modèle...', 'info');
}

// Initialisation automatique quand la page est chargée
document.addEventListener('pageChanged', function(event) {
  if (event.detail && event.detail.page === 'training') {
    // Attendre un peu que le DOM soit mis à jour
    setTimeout(initializeTrainingModels, 100);
  }
});

// Initialisation si la page est déjà chargée
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si on est sur la page training
    const trainingSection = document.getElementById('training');
    if (trainingSection && !trainingSection.classList.contains('hidden')) {
      initializeTrainingModels();
    }
  });
} else {
  // Le DOM est déjà chargé
  const trainingSection = document.getElementById('training');
  if (trainingSection && !trainingSection.classList.contains('hidden')) {
    initializeTrainingModels();
  }
}
