/**
 * FDJ Project - Prediction Model
 * Modèle représentant une prédiction de tirage par IA
 * 
 * @class Prediction
 * @description Encapsule les données et la logique métier d'une prédiction
 */

class Prediction {
  /**
   * Crée une instance de Prediction
   * @param {Object} data - Données de la prédiction
   * @param {string} data.modelId - Identifiant du modèle IA utilisé
   * @param {string} data.modelName - Nom du modèle IA
   * @param {number[]} data.predictedNumbers - Numéros prédits (5 numéros)
   * @param {number[]} data.predictedStars - Étoiles prédites (2 étoiles)
   * @param {number} data.confidence - Score de confiance (0-1)
   * @param {Date|string} [data.createdAt] - Date de création de la prédiction
   * @param {Object} [data.metadata] - Métadonnées du modèle
   */
  constructor(data) {
    this.validateData(data);
    
    this.modelId = data.modelId;
    this.modelName = data.modelName;
    this.predictedNumbers = [...data.predictedNumbers].sort((a, b) => a - b);
    this.predictedStars = [...data.predictedStars].sort((a, b) => a - b);
    this.confidence = data.confidence;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.metadata = data.metadata || {};
    this.id = this.generateId();
    this.actualResult = null; // Sera défini après le tirage réel
    this.accuracy = null; // Calculé après comparaison
  }

  /**
   * Valide les données d'entrée
   * @param {Object} data - Données à valider
   * @throws {Error} Si les données sont invalides
   */
  validateData(data) {
    if (!data) {
      throw new Error('Prediction data is required');
    }

    if (!data.modelId || typeof data.modelId !== 'string') {
      throw new Error('Model ID is required and must be a string');
    }

    if (!data.modelName || typeof data.modelName !== 'string') {
      throw new Error('Model name is required and must be a string');
    }

    if (!Array.isArray(data.predictedNumbers) || data.predictedNumbers.length !== 5) {
      throw new Error('Prediction must have exactly 5 numbers');
    }

    if (!Array.isArray(data.predictedStars) || data.predictedStars.length !== 2) {
      throw new Error('Prediction must have exactly 2 stars');
    }

    if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
      throw new Error('Confidence must be a number between 0 and 1');
    }

    // Validation des plages de numéros
    data.predictedNumbers.forEach(num => {
      if (!Number.isInteger(num) || num < 1 || num > 50) {
        throw new Error(`Invalid predicted number: ${num}. Numbers must be integers between 1 and 50`);
      }
    });

    data.predictedStars.forEach(star => {
      if (!Number.isInteger(star) || star < 1 || star > 12) {
        throw new Error(`Invalid predicted star: ${star}. Stars must be integers between 1 and 12`);
      }
    });

    // Vérification des doublons
    if (new Set(data.predictedNumbers).size !== data.predictedNumbers.length) {
      throw new Error('Predicted numbers must be unique');
    }

    if (new Set(data.predictedStars).size !== data.predictedStars.length) {
      throw new Error('Predicted stars must be unique');
    }
  }

  /**
   * Génère un ID unique pour la prédiction
   * @returns {string} ID unique
   */
  generateId() {
    const timestamp = this.createdAt.getTime();
    const numbersHash = this.predictedNumbers.join('');
    const starsHash = this.predictedStars.join('');
    return `pred_${this.modelId}_${timestamp}_${numbersHash}${starsHash}`;
  }

  /**
   * Compare la prédiction avec le résultat réel
   * @param {Draw} actualDraw - Tirage réel
   * @returns {Object} Résultats de la comparaison
   */
  compareWithActual(actualDraw) {
    if (!actualDraw || !actualDraw.numbers || !actualDraw.stars) {
      throw new Error('Valid draw required for comparison');
    }

    this.actualResult = actualDraw;

    // Compte les bonnes prédictions
    const correctNumbers = this.predictedNumbers.filter(num => 
      actualDraw.numbers.includes(num)
    ).length;

    const correctStars = this.predictedStars.filter(star => 
      actualDraw.stars.includes(star)
    ).length;

    // Calcul du score d'exactitude
    const numberAccuracy = correctNumbers / 5;
    const starAccuracy = correctStars / 2;
    this.accuracy = (numberAccuracy + starAccuracy) / 2;

    // Détermine le rang EuroMillions
    const rank = this.calculateEuroMillionsRank(correctNumbers, correctStars);

    const result = {
      correctNumbers,
      correctStars,
      numberAccuracy,
      starAccuracy,
      overallAccuracy: this.accuracy,
      rank,
      isWinning: rank > 0,
      matchedNumbers: this.predictedNumbers.filter(num => 
        actualDraw.numbers.includes(num)
      ),
      matchedStars: this.predictedStars.filter(star => 
        actualDraw.stars.includes(star)
      )
    };

    return result;
  }

  /**
   * Calcule le rang EuroMillions basé sur les correspondances
   * @param {number} correctNumbers - Nombre de numéros corrects
   * @param {number} correctStars - Nombre d'étoiles correctes
   * @returns {number} Rang (0 = pas de gain, 1-13 = rangs de gain)
   */
  calculateEuroMillionsRank(correctNumbers, correctStars) {
    // Grille des rangs EuroMillions
    const ranks = [
      { numbers: 5, stars: 2, rank: 1 },  // Jackpot
      { numbers: 5, stars: 1, rank: 2 },
      { numbers: 5, stars: 0, rank: 3 },
      { numbers: 4, stars: 2, rank: 4 },
      { numbers: 4, stars: 1, rank: 5 },
      { numbers: 4, stars: 0, rank: 6 },
      { numbers: 3, stars: 2, rank: 7 },
      { numbers: 2, stars: 2, rank: 8 },
      { numbers: 3, stars: 1, rank: 9 },
      { numbers: 3, stars: 0, rank: 10 },
      { numbers: 1, stars: 2, rank: 11 },
      { numbers: 2, stars: 1, rank: 12 },
      { numbers: 2, stars: 0, rank: 13 }
    ];

    const match = ranks.find(r => 
      r.numbers === correctNumbers && r.stars === correctStars
    );

    return match ? match.rank : 0;
  }

  /**
   * Calcule un score de confiance ajusté basé sur les métadonnées
   * @returns {number} Score de confiance ajusté
   */
  getAdjustedConfidence() {
    let adjustedConfidence = this.confidence;

    // Ajustements basés sur les métadonnées
    if (this.metadata.trainingDataSize) {
      // Plus de données d'entraînement = plus de confiance
      const dataBonus = Math.min(this.metadata.trainingDataSize / 10000, 0.1);
      adjustedConfidence += dataBonus;
    }

    if (this.metadata.modelAccuracy) {
      // Précision historique du modèle
      adjustedConfidence = (adjustedConfidence + this.metadata.modelAccuracy) / 2;
    }

    return Math.min(Math.max(adjustedConfidence, 0), 1);
  }

  /**
   * Vérifie si la prédiction est récente (moins de 7 jours)
   * @returns {boolean} True si récente
   */
  isRecent() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.createdAt >= sevenDaysAgo;
  }

  /**
   * Génère une description textuelle de la confiance
   * @returns {string} Description de la confiance
   */
  getConfidenceDescription() {
    const adjustedConf = this.getAdjustedConfidence();
    
    if (adjustedConf >= 0.9) return 'Très élevée';
    if (adjustedConf >= 0.7) return 'Élevée';
    if (adjustedConf >= 0.5) return 'Moyenne';
    if (adjustedConf >= 0.3) return 'Faible';
    return 'Très faible';
  }

  /**
   * Calcule les statistiques de la prédiction
   * @returns {Object} Statistiques diverses
   */
  getStatistics() {
    const numberSum = this.predictedNumbers.reduce((sum, num) => sum + num, 0);
    const starSum = this.predictedStars.reduce((sum, star) => sum + star, 0);
    
    const parity = {
      numbers: {
        even: this.predictedNumbers.filter(n => n % 2 === 0).length,
        odd: this.predictedNumbers.filter(n => n % 2 === 1).length
      },
      stars: {
        even: this.predictedStars.filter(s => s % 2 === 0).length,
        odd: this.predictedStars.filter(s => s % 2 === 1).length
      }
    };

    return {
      numberSum,
      starSum,
      numberAverage: numberSum / 5,
      starAverage: starSum / 2,
      parity,
      hasConsecutive: this.hasConsecutiveNumbers(),
      distribution: this.getDistribution()
    };
  }

  /**
   * Vérifie si la prédiction contient des numéros consécutifs
   * @returns {boolean} True si des numéros sont consécutifs
   */
  hasConsecutiveNumbers() {
    for (let i = 0; i < this.predictedNumbers.length - 1; i++) {
      if (this.predictedNumbers[i + 1] - this.predictedNumbers[i] === 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Analyse la distribution des numéros prédits
   * @returns {Object} Distribution par déciles
   */
  getDistribution() {
    const distribution = {
      '1-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0
    };

    this.predictedNumbers.forEach(num => {
      if (num <= 10) distribution['1-10']++;
      else if (num <= 20) distribution['11-20']++;
      else if (num <= 30) distribution['21-30']++;
      else if (num <= 40) distribution['31-40']++;
      else distribution['41-50']++;
    });

    return distribution;
  }

  /**
   * Exporte la prédiction en format JSON
   * @returns {Object} Données de la prédiction
   */
  toJSON() {
    return {
      id: this.id,
      modelId: this.modelId,
      modelName: this.modelName,
      predictedNumbers: this.predictedNumbers,
      predictedStars: this.predictedStars,
      confidence: this.confidence,
      createdAt: this.createdAt.toISOString(),
      metadata: this.metadata,
      actualResult: this.actualResult ? this.actualResult.toJSON() : null,
      accuracy: this.accuracy
    };
  }

  /**
   * Crée une prédiction à partir de données JSON
   * @param {Object} json - Données JSON
   * @returns {Prediction} Instance de Prediction
   */
  static fromJSON(json) {
    const prediction = new Prediction(json);
    if (json.actualResult) {
      prediction.actualResult = Draw.fromJSON(json.actualResult);
    }
    if (json.accuracy !== null) {
      prediction.accuracy = json.accuracy;
    }
    return prediction;
  }

  /**
   * Représentation textuelle de la prédiction
   * @returns {string} Description de la prédiction
   */
  toString() {
    const confDesc = this.getConfidenceDescription();
    return `Prediction(${this.modelName}: ${this.predictedNumbers.join('-')} ⭐ ${this.predictedStars.join('-')}, ${confDesc})`;
  }
}

export default Prediction;