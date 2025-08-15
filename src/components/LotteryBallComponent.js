/**
 * FDJ Project - Lottery Ball Component
 * Composant réutilisable pour l'affichage des boules de loterie
 * 
 * @class LotteryBallComponent
 * @description Composant pour créer et gérer l'affichage des numéros et étoiles
 */

class LotteryBallComponent {
  /**
   * Crée une instance de LotteryBallComponent
   * @param {Object} options - Options du composant
   * @param {string} [options.size='normal'] - Taille des boules (small, normal, large)
   * @param {boolean} [options.animated=false] - Activer les animations
   * @param {string} [options.theme='default'] - Thème visuel
   */
  constructor(options = {}) {
    this.options = {
      size: 'normal',
      animated: false,
      theme: 'default',
      showTooltip: false,
      clickable: false,
      ...options
    };

    this.element = null;
    this.numbers = [];
    this.stars = [];
    this.clickHandlers = new Map();
  }

  /**
   * Crée le composant avec des numéros et étoiles
   * @param {number[]} numbers - Numéros principaux
   * @param {number[]} stars - Numéros étoiles
   * @param {Object} [options] - Options de rendu
   * @returns {HTMLElement} Élément DOM créé
   */
  render(numbers = [], stars = [], options = {}) {
    this.numbers = [...numbers];
    this.stars = [...stars];
    
    const renderOptions = { ...this.options, ...options };
    
    // Créer le conteneur principal
    this.element = document.createElement('div');
    this.element.className = this.buildContainerClasses(renderOptions);
    
    // Ajouter les numéros principaux
    numbers.forEach((number, index) => {
      const ball = this.createBall(number, false, index, renderOptions);
      this.element.appendChild(ball);
    });
    
    // Ajouter les étoiles
    stars.forEach((star, index) => {
      const ball = this.createBall(star, true, index, renderOptions);
      this.element.appendChild(ball);
    });
    
    // Ajouter les événements si nécessaire
    if (renderOptions.clickable) {
      this.setupClickHandlers();
    }
    
    // Animations d'entrée
    if (renderOptions.animated) {
      this.animateEntry();
    }
    
    return this.element;
  }

  /**
   * Crée une boule individuelle
   * @param {number} value - Valeur de la boule
   * @param {boolean} isStar - Si c'est une étoile
   * @param {number} index - Index dans la séquence
   * @param {Object} options - Options de rendu
   * @returns {HTMLElement} Élément boule
   */
  createBall(value, isStar, index, options) {
    const ball = document.createElement('div');
    ball.className = this.buildBallClasses(isStar, options);
    ball.textContent = value;
    ball.dataset.value = value;
    ball.dataset.index = index;
    ball.dataset.type = isStar ? 'star' : 'number';
    
    // Ajouter des attributs d'accessibilité
    ball.setAttribute('role', 'button');
    ball.setAttribute('aria-label', `${isStar ? 'Étoile' : 'Numéro'} ${value}`);
    ball.setAttribute('tabindex', options.clickable ? '0' : '-1');
    
    // Tooltip si activé
    if (options.showTooltip) {
      ball.title = this.generateTooltip(value, isStar);
    }
    
    // Styles inline pour les thèmes personnalisés
    if (options.theme !== 'default') {
      this.applyCustomTheme(ball, isStar, options.theme);
    }
    
    return ball;
  }

  /**
   * Construit les classes CSS du conteneur
   * @param {Object} options - Options de rendu
   * @returns {string} Classes CSS
   */
  buildContainerClasses(options) {
    const classes = ['lottery-balls'];
    
    if (options.size !== 'normal') {
      classes.push(`balls-${options.size}`);
    }
    
    if (options.compact) {
      classes.push('balls-compact');
    }
    
    if (options.vertical) {
      classes.push('balls-vertical');
    }
    
    if (options.animated) {
      classes.push('balls-animated');
    }
    
    if (options.theme !== 'default') {
      classes.push(`balls-theme-${options.theme}`);
    }
    
    return classes.join(' ');
  }

  /**
   * Construit les classes CSS d'une boule
   * @param {boolean} isStar - Si c'est une étoile
   * @param {Object} options - Options de rendu
   * @returns {string} Classes CSS
   */
  buildBallClasses(isStar, options) {
    const classes = ['ball'];
    
    if (isStar) {
      classes.push('star');
    }
    
    if (options.size === 'small') {
      classes.push('ball-small');
    } else if (options.size === 'large') {
      classes.push('ball-large');
    }
    
    if (options.clickable) {
      classes.push('ball-clickable');
    }
    
    if (options.theme !== 'default') {
      classes.push(`ball-${options.theme}`);
    }
    
    return classes.join(' ');
  }

  /**
   * Configure les gestionnaires de clic
   */
  setupClickHandlers() {
    if (!this.element) return;
    
    this.element.addEventListener('click', (e) => {
      const ball = e.target.closest('.ball');
      if (ball) {
        this.onBallClick(ball, e);
      }
    });
    
    // Support clavier
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const ball = e.target.closest('.ball');
        if (ball) {
          e.preventDefault();
          this.onBallClick(ball, e);
        }
      }
    });
  }

  /**
   * Gestionnaire de clic sur une boule
   * @param {HTMLElement} ball - Élément boule cliqué
   * @param {Event} event - Événement de clic
   */
  onBallClick(ball, event) {
    const value = parseInt(ball.dataset.value);
    const type = ball.dataset.type;
    const index = parseInt(ball.dataset.index);
    
    // Animation de clic
    this.animateBallClick(ball);
    
    // Émettre l'événement personnalisé
    const customEvent = new CustomEvent('ballClick', {
      detail: { value, type, index, element: ball },
      bubbles: true
    });
    
    this.element.dispatchEvent(customEvent);
    
    // Appeler les handlers enregistrés
    if (this.clickHandlers.has('click')) {
      this.clickHandlers.get('click').forEach(handler => {
        handler({ value, type, index, element: ball, originalEvent: event });
      });
    }
  }

  /**
   * Ajoute un gestionnaire d'événement
   * @param {string} event - Type d'événement
   * @param {Function} handler - Gestionnaire
   */
  on(event, handler) {
    if (!this.clickHandlers.has(event)) {
      this.clickHandlers.set(event, []);
    }
    this.clickHandlers.get(event).push(handler);
  }

  /**
   * Supprime un gestionnaire d'événement
   * @param {string} event - Type d'événement
   * @param {Function} handler - Gestionnaire à supprimer
   */
  off(event, handler) {
    if (this.clickHandlers.has(event)) {
      const handlers = this.clickHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Met à jour les numéros affichés
   * @param {number[]} numbers - Nouveaux numéros
   * @param {number[]} stars - Nouvelles étoiles
   * @param {Object} [options] - Options de mise à jour
   */
  update(numbers, stars, options = {}) {
    if (!this.element) {
      return this.render(numbers, stars, options);
    }
    
    const updateOptions = { ...this.options, ...options };
    
    // Animation de sortie si demandée
    if (updateOptions.animated) {
      this.animateExit().then(() => {
        this.performUpdate(numbers, stars, updateOptions);
      });
    } else {
      this.performUpdate(numbers, stars, updateOptions);
    }
  }

  /**
   * Effectue la mise à jour réelle
   * @param {number[]} numbers - Nouveaux numéros
   * @param {number[]} stars - Nouvelles étoiles
   * @param {Object} options - Options
   */
  performUpdate(numbers, stars, options) {
    // Vider le conteneur
    this.element.innerHTML = '';
    
    // Recréer le contenu
    this.numbers = [...numbers];
    this.stars = [...stars];
    
    // Ajouter les nouveaux éléments
    numbers.forEach((number, index) => {
      const ball = this.createBall(number, false, index, options);
      this.element.appendChild(ball);
    });
    
    stars.forEach((star, index) => {
      const ball = this.createBall(star, true, index, options);
      this.element.appendChild(ball);
    });
    
    // Remettre en place les événements
    if (options.clickable) {
      this.setupClickHandlers();
    }
    
    // Animation d'entrée
    if (options.animated) {
      this.animateEntry();
    }
  }

  /**
   * Génère un tooltip pour une boule
   * @param {number} value - Valeur de la boule
   * @param {boolean} isStar - Si c'est une étoile
   * @returns {string} Texte du tooltip
   */
  generateTooltip(value, isStar) {
    const type = isStar ? 'Étoile' : 'Numéro';
    const parity = value % 2 === 0 ? 'pair' : 'impair';
    return `${type} ${value} (${parity})`;
  }

  /**
   * Applique un thème personnalisé
   * @param {HTMLElement} ball - Élément boule
   * @param {boolean} isStar - Si c'est une étoile
   * @param {string} theme - Nom du thème
   */
  applyCustomTheme(ball, isStar, theme) {
    const themes = {
      neon: {
        number: { 
          background: 'linear-gradient(145deg, #00ffff, #0080ff)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
        },
        star: { 
          background: 'linear-gradient(145deg, #ffff00, #ff8000)',
          boxShadow: '0 0 20px rgba(255, 255, 0, 0.5)'
        }
      },
      vintage: {
        number: { 
          background: 'linear-gradient(145deg, #d4af37, #b8860b)',
          color: '#2f1b14'
        },
        star: { 
          background: 'linear-gradient(145deg, #cd853f, #a0522d)',
          color: '#2f1b14'
        }
      },
      minimal: {
        number: { 
          background: '#ffffff',
          color: '#333333',
          border: '2px solid #333333'
        },
        star: { 
          background: '#333333',
          color: '#ffffff'
        }
      }
    };
    
    const themeConfig = themes[theme];
    if (themeConfig) {
      const config = isStar ? themeConfig.star : themeConfig.number;
      Object.assign(ball.style, config);
    }
  }

  /**
   * Animation d'entrée
   */
  animateEntry() {
    if (!this.element) return;
    
    const balls = this.element.querySelectorAll('.ball');
    balls.forEach((ball, index) => {
      ball.style.opacity = '0';
      ball.style.transform = 'scale(0.5) translateY(-20px)';
      
      setTimeout(() => {
        ball.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        ball.style.opacity = '1';
        ball.style.transform = 'scale(1) translateY(0)';
      }, index * 100);
    });
  }

  /**
   * Animation de sortie
   * @returns {Promise} Promise résolue quand l'animation est terminée
   */
  animateExit() {
    return new Promise((resolve) => {
      if (!this.element) {
        resolve();
        return;
      }
      
      const balls = this.element.querySelectorAll('.ball');
      if (balls.length === 0) {
        resolve();
        return;
      }
      
      balls.forEach((ball, index) => {
        setTimeout(() => {
          ball.style.transition = 'all 0.3s ease-out';
          ball.style.opacity = '0';
          ball.style.transform = 'scale(0.8) translateY(10px)';
        }, index * 50);
      });
      
      setTimeout(resolve, balls.length * 50 + 300);
    });
  }

  /**
   * Animation de clic sur une boule
   * @param {HTMLElement} ball - Boule à animer
   */
  animateBallClick(ball) {
    ball.style.transform = 'scale(0.95)';
    ball.style.transition = 'transform 0.1s ease-out';
    
    setTimeout(() => {
      ball.style.transform = 'scale(1)';
    }, 100);
  }

  /**
   * Met en surbrillance certaines boules
   * @param {number[]} values - Valeurs à mettre en surbrillance
   * @param {string} [highlightClass='highlighted'] - Classe CSS pour la surbrillance
   */
  highlight(values, highlightClass = 'highlighted') {
    if (!this.element) return;
    
    const balls = this.element.querySelectorAll('.ball');
    balls.forEach(ball => {
      const value = parseInt(ball.dataset.value);
      if (values.includes(value)) {
        ball.classList.add(highlightClass);
      } else {
        ball.classList.remove(highlightClass);
      }
    });
  }

  /**
   * Supprime toutes les surbrillances
   */
  clearHighlight() {
    if (!this.element) return;
    
    const balls = this.element.querySelectorAll('.ball');
    balls.forEach(ball => {
      ball.classList.remove('highlighted', 'correct', 'incorrect');
    });
  }

  /**
   * Compare avec un autre tirage et affiche les correspondances
   * @param {number[]} otherNumbers - Autres numéros
   * @param {number[]} otherStars - Autres étoiles
   */
  compareWith(otherNumbers, otherStars) {
    if (!this.element) return;
    
    const balls = this.element.querySelectorAll('.ball');
    balls.forEach(ball => {
      const value = parseInt(ball.dataset.value);
      const type = ball.dataset.type;
      
      let isMatch = false;
      if (type === 'number') {
        isMatch = otherNumbers.includes(value);
      } else {
        isMatch = otherStars.includes(value);
      }
      
      ball.classList.toggle('correct', isMatch);
      ball.classList.toggle('incorrect', !isMatch);
    });
  }

  /**
   * Obtient les valeurs actuelles
   * @returns {Object} Objet avec numbers et stars
   */
  getValues() {
    return {
      numbers: [...this.numbers],
      stars: [...this.stars]
    };
  }

  /**
   * Vérifie si le composant est dans un état valide
   * @returns {boolean} True si valide
   */
  isValid() {
    return this.numbers.length === 5 && this.stars.length === 2;
  }

  /**
   * Détruit le composant et nettoie les ressources
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.clickHandlers.clear();
    this.element = null;
    this.numbers = [];
    this.stars = [];
  }

  /**
   * Crée un composant statique (méthode de classe)
   * @param {number[]} numbers - Numéros
   * @param {number[]} stars - Étoiles
   * @param {Object} [options] - Options
   * @returns {HTMLElement} Élément DOM
   */
  static create(numbers, stars, options = {}) {
    const component = new LotteryBallComponent(options);
    return component.render(numbers, stars);
  }

  /**
   * Crée plusieurs composants en lot
   * @param {Array} drawsData - Données des tirages [{ numbers, stars }]
   * @param {Object} [options] - Options communes
   * @returns {HTMLElement[]} Éléments DOM
   */
  static createMultiple(drawsData, options = {}) {
    return drawsData.map(data => 
      LotteryBallComponent.create(data.numbers, data.stars, options)
    );
  }
}

export default LotteryBallComponent;