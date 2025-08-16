/**
 * Mock Data pour FDJ EuroMillion - Conforme bible.md
 * Données de test pour les tirages et historique
 */

// Générateur de tirages EuroMillion mock
class MockEuroMillionGenerator {
  constructor() {
    this.currentDate = new Date();
    this.historique = this.generateHistorique(30); // 30 derniers tirages
  }

  // Génère un tirage aléatoire EuroMillion
  generateSingleDraw(date = null) {
    const drawDate = date || new Date();
    
    // Générer 5 numéros uniques entre 1 et 50
    const numbers = [];
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 50) + 1;
      if (!numbers.includes(num)) numbers.push(num);
    }
    numbers.sort((a, b) => a - b);
    
    // Générer 2 étoiles uniques entre 1 et 12
    const stars = [];
    while (stars.length < 2) {
      const star = Math.floor(Math.random() * 12) + 1;
      if (!stars.includes(star)) stars.push(star);
    }
    stars.sort((a, b) => a - b);

    // Générer des gains mock réalistes
    const gains = this.generateGains();

    return {
      date: drawDate.toLocaleDateString('fr-FR'),
      dateISO: drawDate.toISOString(),
      numbers: numbers,
      stars: stars,
      gains: gains,
      jackpot: this.generateJackpot(),
      participants: Math.floor(Math.random() * 50000) + 10000
    };
  }

  // Génère un historique de tirages
  generateHistorique(count = 30) {
    const historique = [];
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
      // Tirages tous les mardis et vendredis
      const daysBack = i * 3 + (i % 2 === 0 ? 2 : 0); // Approximation
      const drawDate = new Date(today);
      drawDate.setDate(today.getDate() - daysBack);
      
      historique.push(this.generateSingleDraw(drawDate));
    }
    
    return historique.reverse(); // Plus ancien en premier
  }

  // Génère des gains mock réalistes
  generateGains() {
    const gainsData = [
      { rang: "5 + 2", gagnants: Math.floor(Math.random() * 3), gain: "Jackpot" },
      { rang: "5 + 1", gagnants: Math.floor(Math.random() * 8) + 1, gain: this.formatEuro(Math.floor(Math.random() * 500000) + 100000) },
      { rang: "5 + 0", gagnants: Math.floor(Math.random() * 15) + 3, gain: this.formatEuro(Math.floor(Math.random() * 50000) + 10000) },
      { rang: "4 + 2", gagnants: Math.floor(Math.random() * 50) + 10, gain: this.formatEuro(Math.floor(Math.random() * 5000) + 1000) },
      { rang: "4 + 1", gagnants: Math.floor(Math.random() * 200) + 50, gain: this.formatEuro(Math.floor(Math.random() * 500) + 100) },
      { rang: "4 + 0", gagnants: Math.floor(Math.random() * 500) + 100, gain: this.formatEuro(Math.floor(Math.random() * 100) + 50) },
      { rang: "3 + 2", gagnants: Math.floor(Math.random() * 800) + 200, gain: this.formatEuro(Math.floor(Math.random() * 100) + 20) },
      { rang: "3 + 1", gagnants: Math.floor(Math.random() * 2000) + 500, gain: this.formatEuro(Math.floor(Math.random() * 50) + 10) },
      { rang: "3 + 0", gagnants: Math.floor(Math.random() * 5000) + 1000, gain: this.formatEuro(Math.floor(Math.random() * 20) + 5) },
      { rang: "2 + 2", gagnants: Math.floor(Math.random() * 10000) + 2000, gain: this.formatEuro(Math.floor(Math.random() * 20) + 5) },
      { rang: "2 + 1", gagnants: Math.floor(Math.random() * 50000) + 10000, gain: this.formatEuro(Math.floor(Math.random() * 10) + 2) },
      { rang: "1 + 2", gagnants: Math.floor(Math.random() * 100000) + 20000, gain: this.formatEuro(Math.floor(Math.random() * 5) + 2) }
    ];

    return gainsData.filter(g => g.gagnants > 0); // Ne garder que les rangs avec gagnants
  }

  // Génère un jackpot réaliste
  generateJackpot() {
    const jackpots = [
      "17 000 000", "25 000 000", "42 000 000", "68 000 000", 
      "95 000 000", "130 000 000", "175 000 000", "220 000 000"
    ];
    return jackpots[Math.floor(Math.random() * jackpots.length)] + " €";
  }

  // Formate un montant en euros
  formatEuro(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Obtient le dernier tirage
  getLatestDraw() {
    return this.historique[this.historique.length - 1] || this.generateSingleDraw();
  }

  // Obtient l'historique complet
  getHistorique() {
    return this.historique;
  }

  // Obtient les tirages par date
  getDrawByDate(dateStr) {
    return this.historique.find(draw => draw.date === dateStr) || null;
  }

  // Simule un nouveau tirage (pour test)
  simulateNewDraw() {
    const newDraw = this.generateSingleDraw();
    this.historique.push(newDraw);
    
    // Garder seulement les 50 derniers
    if (this.historique.length > 50) {
      this.historique.shift();
    }
    
    return newDraw;
  }
}

// Instance globale pour l'application
window.mockEuroMillion = new MockEuroMillionGenerator();

// Export pour tests ou utilisation modulaire
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockEuroMillionGenerator;
}

// Console log pour debug
console.log('🎲 Mock EuroMillion Data initialisé:', {
  historiqueLength: window.mockEuroMillion.getHistorique().length,
  latestDraw: window.mockEuroMillion.getLatestDraw(),
  sampleGains: window.mockEuroMillion.getLatestDraw().gains.slice(0, 3)
});

