// Game State
const gameState = {
  cookies: 0,
  perSecond: 0,
  perClick: 1,
};

// Maximum score cap
const MAX_COOKIES = 20240525;

// Helper function to add cookies with max cap
function addCookies(amount) {
  gameState.cookies = Math.min(gameState.cookies + amount, MAX_COOKIES);
}

// Track last cookies value to avoid unnecessary shop regens
let lastCookiesForShop = 0;

// Cheater upgrade (only used by invisible cheat button, not in shop)
const cheaterUpgrade = { id: 'cheater', name: 'Cheater', cost: 0, value: 20240525, owned: 0, type: 'click', cheated: false };

// Upgrades available in the shop
const upgrades = [
  { id: 'cuddles', name: '🥰 Cuddles', cost: 10, value: 1, owned: 0, type: 'click' },
  { id: 'tacobell', name: '🌮 Taco Bell', cost: 100, value: 10, owned: 0, type: 'perSecond' },
  { id: 'blindboxes', name: '🎁 Blind Boxes', cost: 1000, value: 100, owned: 0, type: 'perSecond' },
  { id: 'climbingshoes', name: '🧗 Climbing Shoes', cost: 10000, value: 1000, owned: 0, type: 'perSecond' },
  { id: 'vacationtrip', name: '✈️ Vacation Trip', cost: 100000, value: 10000, owned: 0, type: 'perSecond' },
];

// DOM Elements
const cookieBtn = document.getElementById('cookie-btn');
const cookieCountEl = document.getElementById('cookie-count');
const perSecondEl = document.getElementById('per-second');
const upgradesContainer = document.getElementById('upgrades-container');
const floatyContainer = document.getElementById('floaty-container');
const hiddenBtn = document.getElementById('hidden-btn');
const cheatBtn = document.getElementById('cheat-btn');
const memeVideo = document.getElementById('meme-video');
const videoModal = document.getElementById('video-modal');

// Track if hidden button has been revealed

// Track if hidden button has been revealed
let hiddenButtonRevealed = false;
let memeHasPlayed = false;

// Click Handler
cookieBtn.addEventListener('click', (e) => {
  if (gameState.cookies >= MAX_COOKIES) return;
  addCookies(gameState.perClick);
  updateDisplay();
  createFloatyNumber(e, gameState.perClick);
});

// Hidden Button Handler
if (hiddenBtn) {
  // Use pointerdown since click isn't firing
  hiddenBtn.addEventListener('pointerdown', function(e) {
    if (hiddenButtonRevealed && !memeHasPlayed) {
      videoModal.style.display = 'flex';
      
      memeVideo.currentTime = 0;
      // Don't autoplay - user can click play button
      memeHasPlayed = true;
    }
  });
  
  // Keep the click listener too as fallback
  hiddenBtn.addEventListener('click', function(e) {
    if (hiddenButtonRevealed && !memeHasPlayed) {
      videoModal.style.display = 'flex';
      memeVideo.currentTime = 0;
      const playPromise = memeVideo.play();
      memeHasPlayed = true;
    }
  });
}

// Video modal - cannot be closed by clicking outside
// Users must finish watching or use browser controls

// Cheat Code Button Handler
cheatBtn.addEventListener('click', () => {
  if (!cheaterUpgrade.cheated) {
    cheaterUpgrade.owned += 1;
    gameState.perClick += cheaterUpgrade.value;
    cheaterUpgrade.cheated = true;
    addCookies(MAX_COOKIES);
    updateDisplay();
  }
});

// Create floating number animation for clicks
function createFloatyNumber(event, amount) {
  const floaty = document.createElement('div');
  floaty.className = 'floaty-number';
  floaty.textContent = '+' + amount;
  floaty.style.left = event.clientX + 'px';
  floaty.style.top = event.clientY + 'px';
  floatyContainer.appendChild(floaty);

  setTimeout(() => floaty.remove(), 1000);
}

// Update the display
function updateDisplay() {
  cookieCountEl.textContent = Math.floor(gameState.cookies);
  perSecondEl.textContent = gameState.perSecond.toFixed(1);
  
  if (gameState.cookies > MAX_COOKIES) {
    gameState.cookies = MAX_COOKIES;
  }
  
  cookieCountEl.textContent = Math.floor(gameState.cookies);
  perSecondEl.textContent = gameState.perSecond.toFixed(1);
  
  // Disable all buttons when max is reached
  if (gameState.cookies >= MAX_COOKIES) {
    cookieBtn.disabled = true;
    // Don't disable the hidden button if it's revealed - we need it to play the video
    if (!hiddenButtonRevealed) {
      hiddenBtn.disabled = true;
    }
    // Disable all upgrade buttons
    document.querySelectorAll('.upgrade').forEach(btn => btn.disabled = true);
  }
  cookieCountEl.textContent = Math.floor(gameState.cookies);
  perSecondEl.textContent = gameState.perSecond.toFixed(1);
  
  // Check if hidden button should be revealed
  if (gameState.cookies >= 20240525 && !hiddenButtonRevealed) {
    hiddenBtn.classList.add('revealed');
    cookieBtn.style.display = 'none';
    hiddenButtonRevealed = true;
  }
  
  // Only regenerate shop if button states changed (check if any upgrade affordability changed)
  const needsShopUpdate = upgrades.some(upgrade => 
    (lastCookiesForShop < upgrade.cost && gameState.cookies >= upgrade.cost) ||
    (lastCookiesForShop >= upgrade.cost && gameState.cookies < upgrade.cost)
  );
  
  if (needsShopUpdate) {
    generateShop();
    lastCookiesForShop = gameState.cookies;
  }
}

// Generate upgrades in the shop
function generateShop() {
  upgradesContainer.innerHTML = '';

  upgrades.forEach((upgrade) => {
    const btn = document.createElement('button');
    btn.className = 'upgrade';
    btn.disabled = gameState.cookies < upgrade.cost;

    btn.innerHTML = `
      <div class="upgrade-name">${upgrade.name}</div>
      <div class="upgrade-cost">Cost: ${formatNumber(upgrade.cost)}</div>
      <div class="upgrade-count">Owned: ${upgrade.owned}</div>
    `;

    btn.addEventListener('click', () => {
      if (gameState.cookies >= upgrade.cost) {
        gameState.cookies -= upgrade.cost;
        upgrade.owned += 1;
        // Add to click or per-second based on upgrade type
        if (upgrade.type === 'click') {
          gameState.perClick += upgrade.value;
        } else {
          gameState.perSecond += upgrade.value;
        }
        upgradePrice(upgrade);
        updateDisplay();
        generateShop();
      }
    });

    upgradesContainer.appendChild(btn);
  });
}

// Increase upgrade cost exponentially
function upgradePrice(upgrade) {
  upgrade.cost = Math.ceil(upgrade.cost * 1.15);
}

// Format large numbers
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

// Per second cookie generation
setInterval(() => {
  gameState.cookies += gameState.perSecond / 10;
  updateDisplay();
}, 100);

// Initialize the game
generateShop();
updateDisplay();
