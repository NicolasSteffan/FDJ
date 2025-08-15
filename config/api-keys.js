/**
 * Configuration des clés API pour les modèles IA
 * 
 * ⚠️  ATTENTION : Ne jamais commiter ce fichier avec de vraies clés !
 * Utilisez des variables d'environnement ou un fichier .env
 */

// Configuration Mistral AI
export const MISTRAL_CONFIG = {
  // Clé API Mistral (clé réelle configurée)
  apiKey: process.env.MISTRAL_API_KEY || 'epR5WaEa7Jfiva1aGtRxb6uGmXMBU3Xe',
  
  // Modèles disponibles
  models: {
    mistral: 'mistral-tiny',
    mistralSmall: 'mistral-small-latest', 
    mistralMedium: 'mistral-medium-latest',
    mistralLarge: 'mistral-large-latest'
  },
  
  // Configuration par défaut
  defaultModel: 'mistral-small-latest',
  
  // Paramètres de requête
  defaultParams: {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 0.9
  }
};

// Configuration pour d'autres modèles (futur)
export const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
  models: {
    gpt4: 'gpt-4',
    gpt35: 'gpt-3.5-turbo'
  }
};

// Fonction pour valider une clé API
export function validateApiKey(apiKey, provider = 'mistral') {
  if (!apiKey || apiKey === 'your-mistral-api-key-here') {
    throw new Error(`Clé API ${provider} non configurée. Veuillez configurer votre clé API.`);
  }
  
  // Validation basique du format
  if (provider === 'mistral' && !apiKey.startsWith('mist-')) {
    throw new Error('Format de clé API Mistral invalide. Doit commencer par "mist-"');
  }
  
  return true;
}

// Fonction pour obtenir la configuration active
export function getActiveConfig(provider = 'mistral') {
  switch (provider) {
    case 'mistral':
      return MISTRAL_CONFIG;
    case 'openai':
      return OPENAI_CONFIG;
    default:
      throw new Error(`Provider ${provider} non supporté`);
  }
}


