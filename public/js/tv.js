// ========================================================
// 📺 LOGIQUE DU GRAND ÉCRAN TV (VIDÉOPROJECTEUR)
// Pure vue spectateur : aucun bouton d'administration
// ========================================================
const socket = window.socket || io();
window.socket = socket;

let currentGameState = null;

// DOM Elements
const tvTimerDisplay = document.getElementById('tv-timer-display');
const tvTimerSeconds = document.getElementById('tv-timer-seconds');
const tvPhaseHeadline = document.getElementById('tv-phase-headline');
const tvPhaseSubtext = document.getElementById('tv-phase-subtext');
const tvNightBadge = document.getElementById('tv-night-badge');
const badgeAliveCount = document.getElementById('badge-alive-count');
const badgeDeadCount = document.getElementById('badge-dead-count');
const unassignedCounter = document.getElementById('unassigned-counter');
const occupantsUnassigned = document.getElementById('occupants-unassigned');
const graveyardCounter = document.getElementById('graveyard-counter');
const occupantsGraveyard = document.getElementById('occupants-graveyard');
const tvSleepCurtain = document.getElementById('tv-sleep-curtain');

const btnSoundToggle = document.getElementById('btn-sound-toggle');
const btnFullscreen = document.getElementById('btn-fullscreen');

// Overlays
const morningDeathsOverlay = document.getElementById('morning-deaths-overlay');
const morningOverlayNightNum = document.getElementById('morning-overlay-night-num');
const morningVictimsContainer = document.getElementById('morning-victims-container');
const morningSurvivorsCount = document.getElementById('morning-survivors-count');

const celebrationOverlay = document.getElementById('celebration-overlay');
const celebrationIcon = document.getElementById('celebration-icon');
const celebrationTitle = document.getElementById('celebration-title');
const celebrationSubtitle = document.getElementById('celebration-subtitle');
const celebrationSurvivorsList = document.getElementById('celebration-survivors-list');

const voteVerdictOverlay = document.getElementById('vote-verdict-overlay');
const voteVerdictSubtitle = document.getElementById('vote-verdict-subtitle');
const voteVerdictContent = document.getElementById('vote-verdict-content');

// Gestion du son & plein écran
btnSoundToggle?.addEventListener('click', () => {
  window.soundEngine.init();
  const isEnabled = window.soundEngine.toggle();
  btnSoundToggle.textContent = isEnabled ? '🔊' : '🔇';
});

btnFullscreen?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    btnFullscreen.textContent = '✕';
  } else {
    document.exitFullscreen().catch(() => {});
    btnFullscreen.textContent = '⛶';
  }
});

// Click global pour initialiser l'audio Web
document.addEventListener('click', () => {
  window.soundEngine.init();
}, { once: true });

// Écoute de l'état en direct
socket.on('state_updated', (state) => {
  currentGameState = state;
  renderTvView(state);
});

socket.on('timer_tick', ({ remaining, timerPaused }) => {
  if (tvTimerSeconds) {
    if (timerPaused) {
      tvTimerSeconds.textContent = remaining;
      tvTimerDisplay?.classList.add('paused');
    } else {
      tvTimerSeconds.textContent = remaining;
      tvTimerDisplay?.classList.remove('paused');
      if (remaining <= 10) {
        tvTimerDisplay?.classList.add('urgent');
        // Battement de cœur angoissant sous les 10 secondes
        window.soundEngine.playHeartbeat(1.2);
        window.soundEngine.playTick();
      } else {
        tvTimerDisplay?.classList.remove('urgent');
      }
    }
  }
});

socket.on('timer_paused', ({ remaining }) => {
  if (tvTimerSeconds) tvTimerSeconds.textContent = remaining;
  tvTimerDisplay?.classList.add('paused');
});

socket.on('timer_resumed', ({ remaining }) => {
  if (tvTimerSeconds) tvTimerSeconds.textContent = remaining;
  tvTimerDisplay?.classList.remove('paused');
});

socket.on('countdown_finished', () => {
  window.soundEngine.playGong();
});

socket.on('sleep_phase_started', () => {
  window.soundEngine.playGong();
  // Hurlement de loup lugubre dans la nuit tombante 🐺
  setTimeout(() => {
    window.soundEngine.playWolfHowl();
  }, 900);

  if (tvSleepCurtain && currentGameState && !currentGameState.tvMapVisible) {
    tvSleepCurtain.style.display = 'flex';
  }
});

// ========================================================
// 👻 RÉACTIONS EMOJIS & MURMURES SPECTRAUX (100% ANONYMES)
// ========================================================
const tvGhostEmojisContainer = document.getElementById('tv-ghost-emojis-container');

// Réception du murmure spectral (100% Anonyme : aucun nom ni identité)
socket.on('spectre_whispered', () => {
  if (window.soundEngine && window.soundEngine.playGhostWhisper) {
    window.soundEngine.playGhostWhisper();
  }
  const toast = document.createElement('div');
  toast.className = 'tv-ghost-whisper-toast';
  toast.innerHTML = `
    <span class="tv-ghost-whisper-avatar">👻</span>
    <span class="tv-ghost-whisper-text">Un souffle mystérieux de l'au-delà fait frémir le manoir...</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4200);
});

// Réception d'un emoji spectral flottant (100% Anonyme)
socket.on('tv_ghost_emoji', ({ emoji }) => {
  if (!tvGhostEmojisContainer) return;

  if (window.soundEngine && window.soundEngine.playGhostWhisper) {
    window.soundEngine.playGhostWhisper();
  }

  const el = document.createElement('div');
  el.className = 'tv-floating-ghost-emoji';
  el.textContent = emoji || '👻';

  // Position horizontale aléatoire (8% à 88% de la largeur de l'écran)
  const leftPct = 8 + Math.random() * 80;
  el.style.left = `${leftPct}%`;

  // Légère variation de taille et de durée d'envol
  const sizeRem = 3.2 + Math.random() * 1.5;
  el.style.fontSize = `${sizeRem}rem`;

  const durationSec = 3.2 + Math.random() * 1.2;
  el.style.animationDuration = `${durationSec}s`;

  tvGhostEmojisContainer.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, (durationSec + 0.3) * 1000);
});

// Changement direct de la visibilité sur la TV par l'admin
socket.on('tv_map_visibility_changed', ({ visible }) => {
  if (currentGameState) {
    currentGameState.tvMapVisible = visible;
  }
  if (tvSleepCurtain) {
    if (visible) {
      tvSleepCurtain.style.display = 'none';
    } else if (currentGameState?.phase === 'NIGHT_ASLEEP') {
      tvSleepCurtain.style.display = 'flex';
    }
  }
});

// Explosion d'une salle par le pyromane
socket.on('room_exploded', ({ roomId, roomName, victims }) => {
  // L'explosion reste secrète sur la TV pendant la nuit : révélée uniquement au Bilan du matin
  if (currentGameState && currentGameState.phase === 'REVEALED') {
    window.soundEngine.playExplosion();
    const box = document.getElementById(`box-${roomId}`);
    if (box) {
      box.style.animation = 'shake 0.8s ease-in-out';
      setTimeout(() => { box.style.animation = ''; }, 800);
    }
  }
});

// Révélation solennelle des morts de la nuit
socket.on('night_deaths_revealed', (data) => {
  window.soundEngine.playDawnChime();
  setTimeout(() => window.soundEngine.playGong(), 800);

  if (morningOverlayNightNum) {
    morningOverlayNightNum.textContent = `Nuit ${data.night || 1}`;
  }
  if (morningSurvivorsCount) {
    morningSurvivorsCount.textContent = data.aliveCount || 0;
  }

  if (morningVictimsContainer) {
    morningVictimsContainer.innerHTML = '';
    const victims = data.victims || [];

    // 💥 Révélation de l'attentat du Pyromane sur la TV au Bilan des morts
    if (data.explodedRooms && data.explodedRooms.length > 0) {
      window.soundEngine.playExplosion();
      data.explodedRooms.forEach(rId => {
        const box = document.getElementById(`box-${rId}`);
        if (box) {
          box.style.animation = 'shake 1.2s ease-in-out';
          setTimeout(() => { box.style.animation = ''; }, 1200);
        }
      });

      const roomNames = {
        chambre: '🛏️ Chambre',
        cuisine: '🍲 Cuisine',
        salle_a_manger: '🕯️ Salle à Manger',
        salon: '🔥 Salon',
        grenier: '🕷️ Grenier'
      };
      const explodedLabel = data.explodedRooms.map(rId => roomNames[rId] || rId).join(', ');

      const pyroBanner = document.createElement('div');
      pyroBanner.style.cssText = `
        grid-column: 1 / -1;
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.45), rgba(153, 27, 27, 0.35));
        border: 2px solid #ef4444;
        border-radius: var(--radius-sm);
        padding: 14px 20px;
        color: #fef08a;
        font-family: var(--font-gothic);
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
        margin-bottom: 12px;
        animation: pulse-urgent 1.2s infinite alternate;
      `;
      pyroBanner.innerHTML = `
        <span style="font-size: 2.2rem; filter: drop-shadow(0 0 10px #ef4444);">💥</span>
        <div style="text-align: left;">
          <div style="color: #ffedd5; font-size: 1.35rem; font-weight: 800; letter-spacing: 0.5px;">ATTENTAT DU PYROMANE DÉCOUVERT !</div>
          <div style="font-size: 1rem; color: #fca5a5; font-family: var(--font-sans); margin-top: 3px;">
            Une violente déflagration a calciné : <strong style="color: #fff;">${escapeHtml(explodedLabel)}</strong> !
          </div>
        </div>
      `;
      morningVictimsContainer.appendChild(pyroBanner);
    }

    if (victims.length === 0) {
      const peacefulMsg = document.createElement('div');
      peacefulMsg.style.cssText = 'grid-column: 1 / -1; color: #6ee7b7; font-size: 1.35rem; font-weight: 700; padding: 26px; background: rgba(16, 185, 129, 0.15); border: 2px dashed var(--emerald); border-radius: var(--radius-md);';
      peacefulMsg.textContent = "✨ Miracle dans le Manoir ! Aucun mort à déplorer cette nuit !";
      morningVictimsContainer.appendChild(peacefulMsg);
    } else {
      victims.forEach(v => {
        const card = document.createElement('div');
        card.className = 'morning-victim-card';
        card.innerHTML = `
          <div class="morning-victim-avatar">${v.avatar || '💀'}</div>
          <div>
            <div class="morning-victim-name">${escapeHtml(v.name)}</div>
            <div class="morning-victim-cause">💀 ${escapeHtml(v.reasonText)}</div>
            ${v.roomName ? `<div class="morning-victim-room">📍 ${escapeHtml(v.roomName)}</div>` : ''}
          </div>
        `;
        morningVictimsContainer.appendChild(card);
      });
    }

  }

  if (morningDeathsOverlay) {
    morningDeathsOverlay.style.display = 'flex';
    // Auto-fermeture après 16 secondes
    setTimeout(() => {
      if (morningDeathsOverlay) morningDeathsOverlay.style.display = 'none';
    }, 16000);
  }
});

morningDeathsOverlay?.addEventListener('click', () => {
  morningDeathsOverlay.style.display = 'none';
});

// Proclamation du vainqueur
socket.on('game_won_event', (record) => {
  window.soundEngine.playVictoryFanfare();

  if (celebrationTitle) celebrationTitle.textContent = `VICTOIRE : ${record.winnerTitle.toUpperCase()} !`;
  if (celebrationSubtitle) {
    celebrationSubtitle.textContent = `Partie #${record.gameNumber} remportée en Nuit ${record.nightEnded} !`;
  }

  const icons = {
    village: '🛡️',
    monsters: '🐺',
    pyromane: '💣'
  };
  if (celebrationIcon) celebrationIcon.textContent = icons[record.winnerCamp] || '🏆';

  if (celebrationSurvivorsList) {
    celebrationSurvivorsList.innerHTML = '';
    const survivors = record.survivors || [];
    if (survivors.length === 0) {
      celebrationSurvivorsList.innerHTML = '<span style="color: #94a3b8; font-style: italic;">Aucun survivant</span>';
    } else {
      survivors.forEach(s => {
        const chip = document.createElement('span');
        chip.className = 'history-survivor-chip';
        chip.innerHTML = `<span>${s.avatar || '🕯️'}</span> <strong>${escapeHtml(s.name)}</strong>`;
        celebrationSurvivorsList.appendChild(chip);
      });
    }
  }

  if (celebrationOverlay) {
    celebrationOverlay.style.display = 'flex';
    setTimeout(() => {
      if (celebrationOverlay) celebrationOverlay.style.display = 'none';
    }, 20000);
  }
});

celebrationOverlay?.addEventListener('click', () => {
  celebrationOverlay.style.display = 'none';
});

// Proclamation du verdict du vote du village
socket.on('village_vote_eliminated', (data) => {
  window.soundEngine.playGong();

  if (voteVerdictOverlay && voteVerdictContent) {
    if (data.player) {
      if (voteVerdictSubtitle) voteVerdictSubtitle.textContent = 'Le conseil du village a rendu son jugement !';
      voteVerdictContent.innerHTML = `
        <div style="display: inline-flex; align-items: center; gap: 16px; background: rgba(220, 38, 38, 0.25); border: 2px solid var(--crimson); border-radius: var(--radius-md); padding: 16px 28px; text-align: left; box-shadow: 0 0 30px rgba(220, 38, 38, 0.45); max-width: 90%;">
          <div style="font-size: 3.5rem; filter: drop-shadow(0 0 12px rgba(220, 38, 38, 0.9));">${data.player.avatar || '💀'}</div>
          <div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #fecaca; font-family: var(--font-gothic); letter-spacing: 1px;">
              ${escapeHtml(data.player.name)}
            </div>
            <div style="font-size: 1.05rem; color: #fca5a5; font-weight: 700; margin-top: 3px;">
              ⚖️ Condamné(e) et éliminé(e) par le vote des villageois
            </div>
            ${data.note ? `<div style="font-size: 0.9rem; color: #cbd5e1; font-style: italic; margin-top: 5px;">« ${escapeHtml(data.note)} »</div>` : ''}
          </div>
        </div>
      `;
    } else {
      if (voteVerdictSubtitle) voteVerdictSubtitle.textContent = 'Issue du conseil du village :';
      voteVerdictContent.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 2px dashed var(--emerald); border-radius: var(--radius-md); padding: 20px 32px; color: #6ee7b7; font-size: 1.3rem; font-weight: 700;">
          🕊️ Aucun joueur éliminé ! (Égalité des voix ou vote blanc)
        </div>
      `;
    }

    voteVerdictOverlay.style.display = 'flex';
    setTimeout(() => {
      if (voteVerdictOverlay) voteVerdictOverlay.style.display = 'none';
    }, 12000);
  }
});

voteVerdictOverlay?.addEventListener('click', () => {
  voteVerdictOverlay.style.display = 'none';
});

// ========================================================
// 📖 PROJECTION DES RÈGLES & CARTES SUR LE GRAND ÉCRAN TV
// ========================================================
const tvRulesOverlay = document.getElementById('tv-rules-presentation-overlay');
const btnCloseTvPresentation = document.getElementById('btn-close-tv-presentation');
const btnTvPrevCard = document.getElementById('btn-tv-prev-card');
const btnTvNextCard = document.getElementById('btn-tv-next-card');

const tvViewRoles = document.getElementById('tv-view-roles');
const tvViewRegles = document.getElementById('tv-view-regles');
const tvViewAppel = document.getElementById('tv-view-appel');

const tvTabIndicatorRoles = document.getElementById('tv-tab-indicator-roles');
const tvTabIndicatorRegles = document.getElementById('tv-tab-indicator-regles');
const tvTabIndicatorAppel = document.getElementById('tv-tab-indicator-appel');

const tvPresHeaderTitle = document.getElementById('tv-presentation-header-title');
const tvPresHeaderSub = document.getElementById('tv-presentation-header-sub');

const tvPresImg = document.getElementById('tv-presentation-img');
const tvPresCamp = document.getElementById('tv-presentation-camp');
const tvPresTitle = document.getElementById('tv-presentation-title');
const tvPresCount = document.getElementById('tv-presentation-count');
const tvPresPower = document.getElementById('tv-presentation-power');
const tvPresTip = document.getElementById('tv-presentation-tip');
const tvPresCounter = document.getElementById('tv-presentation-counter');

let tvCurrentCardIndex = 0;
let tvCurrentTab = 'roles';

function setTvPresentationTab(tab = 'roles') {
  tvCurrentTab = tab;

  // Active / désactive les vues
  if (tvViewRoles) tvViewRoles.style.display = tab === 'roles' ? 'grid' : 'none';
  if (tvViewRegles) tvViewRegles.style.display = tab === 'regles' ? 'flex' : 'none';
  if (tvViewAppel) tvViewAppel.style.display = tab === 'appel' ? 'flex' : 'none';

  // Mise à jour visuelle des pilules d'onglets
  const indicators = [
    { el: tvTabIndicatorRoles, active: tab === 'roles' },
    { el: tvTabIndicatorRegles, active: tab === 'regles' },
    { el: tvTabIndicatorAppel, active: tab === 'appel' }
  ];

  indicators.forEach(({ el, active }) => {
    if (!el) return;
    if (active) {
      el.style.background = 'rgba(212, 175, 55, 0.25)';
      el.style.borderColor = 'var(--gold)';
      el.style.color = '#fef08a';
    } else {
      el.style.background = 'transparent';
      el.style.borderColor = 'transparent';
      el.style.color = '#94a3b8';
    }
  });

  // Titre et sous-titre selon l'onglet
  if (tab === 'roles') {
    if (tvPresHeaderTitle) tvPresHeaderTitle.textContent = 'EXPLICATION DES RÔLES & CARTES DU MANOIR';
    if (tvPresHeaderSub) tvPresHeaderSub.textContent = 'Présentation officielle pour les joueurs • 13 Cartes Spéciales';
    if (tvPresCounter) tvPresCounter.style.display = 'inline-block';
  } else if (tab === 'regles') {
    if (tvPresHeaderTitle) tvPresHeaderTitle.textContent = 'RÈGLES OFFICIELLES & SALLES DU MANOIR';
    if (tvPresHeaderSub) tvPresHeaderSub.textContent = 'Objectif de la partie • Décompte 60s • Règle d\'attaque des Monstres';
    if (tvPresCounter) tvPresCounter.style.display = 'none';
  } else if (tab === 'appel') {
    if (tvPresHeaderTitle) tvPresHeaderTitle.textContent = 'CHRONOLOGIE : ORDRE D\'APPEL DE LA NUIT';
    if (tvPresHeaderSub) tvPresHeaderSub.textContent = 'Guide officiel des tours de jeu nocturnes pour le Manoir';
    if (tvPresCounter) tvPresCounter.style.display = 'none';
  }
}

function updateTvCardPresentation(index) {
  const cards = window.MANOIR_CARDS_DATA || [];
  if (!cards.length) return;
  if (index < 0) index = cards.length - 1;
  if (index >= cards.length) index = 0;
  tvCurrentCardIndex = index;

  const card = cards[tvCurrentCardIndex];
  if (!card) return;

  if (tvPresCounter) tvPresCounter.textContent = `Carte ${tvCurrentCardIndex + 1} / ${cards.length}`;
  if (tvPresCamp) {
    tvPresCamp.textContent = `${card.avatar} ${card.campLabel}`;
    tvPresCamp.className = `badge badge-${card.camp}`;
  }
  if (tvPresTitle) tvPresTitle.textContent = card.fullTitle || card.name;
  if (tvPresCount) tvPresCount.textContent = `🃏 ${card.count}`;
  if (tvPresPower) tvPresPower.textContent = card.power;
  if (tvPresTip) tvPresTip.textContent = card.tip;

  if (tvPresImg) {
    if (card.image) {
      tvPresImg.src = card.image;
      tvPresImg.style.display = 'block';
    } else {
      tvPresImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" fill="%231a0e2e" rx="16"/><text x="150" y="200" font-size="90" text-anchor="middle">👻</text><text x="150" y="260" font-size="22" fill="%23e9d5ff" font-family="sans-serif" font-weight="bold" text-anchor="middle">LES SPECTRES</text><text x="150" y="295" font-size="14" fill="%23cbd5e1" font-family="sans-serif" text-anchor="middle">Pouvoirs de l%27Au-delà</text></svg>';
    }
  }
}

function showTvCardPresentation(cardIndex = 0, tab = 'roles') {
  setTvPresentationTab(tab);
  updateTvCardPresentation(cardIndex);
  if (tvRulesOverlay) tvRulesOverlay.style.display = 'flex';
}

function hideTvCardPresentation() {
  if (tvRulesOverlay) tvRulesOverlay.style.display = 'none';
}

btnCloseTvPresentation?.addEventListener('click', () => {
  hideTvCardPresentation();
  socket.emit('host_action', {
    action: 'TV_RULES_PRESENT',
    payload: { visible: false }
  });
});
btnTvPrevCard?.addEventListener('click', () => updateTvCardPresentation(tvCurrentCardIndex - 1));
btnTvNextCard?.addEventListener('click', () => updateTvCardPresentation(tvCurrentCardIndex + 1));

// Réception du stream régie / animateur
socket.on('tv_rules_display', ({ visible, cardIndex, tab }) => {
  if (visible) {
    if (window.soundEngine && window.soundEngine.playSelect) window.soundEngine.playSelect();
    showTvCardPresentation(cardIndex ?? tvCurrentCardIndex, tab ?? tvCurrentTab);
  } else {
    hideTvCardPresentation();
  }
});

socket.on('tv_rules_card_changed', ({ cardIndex }) => {
  updateTvCardPresentation(cardIndex ?? 0);
});

socket.on('tv_rules_tab_changed', ({ tab }) => {
  setTvPresentationTab(tab || 'roles');
});

// Clavier quand la présentation TV est ouverte
window.addEventListener('keydown', (e) => {
  if (tvRulesOverlay && tvRulesOverlay.style.display === 'flex') {
    if (e.key === 'Escape') hideTvCardPresentation();
    if (e.key === 'ArrowLeft') updateTvCardPresentation(tvCurrentCardIndex - 1);
    if (e.key === 'ArrowRight') updateTvCardPresentation(tvCurrentCardIndex + 1);
  }
});

// ========================================================
// RENDU DE L'ÉCRAN TV
// ========================================================
function renderTvView(state) {
  // Synchronisation automatique de la projection des règles/cartes sur la TV
  if (state.tvRulesVisible) {
    showTvCardPresentation(state.tvRulesCardIndex || 0, state.tvRulesTab || 'roles');
  } else {
    hideTvCardPresentation();
  }

  const phase = state.phase;
  const isRevealed = phase === 'REVEALED';
  const isNightAsleep = phase === 'NIGHT_ASLEEP';
  const isCountdown = phase === 'COUNTDOWN';
  const canSeeRoomsOnTv = isRevealed || (isNightAsleep && state.tvMapVisible);

  // 1. En-tête, compteurs et palmarès
  if (tvNightBadge) {
    tvNightBadge.textContent = `🌙 Nuit ${state.currentNight || 1} / ${state.maxNights || 5}`;
  }
  badgeAliveCount.textContent = `${state.aliveCount} Survivant${state.aliveCount > 1 ? 's' : ''}`;
  badgeDeadCount.textContent = `${state.deadCount} Éliminé${state.deadCount > 1 ? 's' : ''} 💀`;

  if (state.scores) {
    const elVillage = document.getElementById('tv-score-village');
    const elMonsters = document.getElementById('tv-score-monsters');
    const elPyro = document.getElementById('tv-score-pyro');
    if (elVillage) elVillage.textContent = state.scores.village ?? 0;
    if (elMonsters) elMonsters.textContent = state.scores.monsters ?? 0;
    if (elPyro) elPyro.textContent = state.scores.pyromane ?? 0;
  }

  // 2. Gestion des phases et bandeaux TV
  if (phase === 'WAITING') {
    if (tvSleepCurtain) tvSleepCurtain.style.display = 'none';
    tvTimerSeconds.textContent = '60';
    tvTimerDisplay.classList.remove('urgent');
    tvTimerDisplay.classList.remove('paused');
    tvPhaseHeadline.textContent = 'PRÉPAREZ-VOUS POUR LA NUIT...';
    tvPhaseSubtext.textContent = 'Chaque joueur choisit secrètement sa pièce. À 0s, le Manoir plonge dans le sommeil.';
  } else if (isCountdown) {
    if (tvSleepCurtain) tvSleepCurtain.style.display = 'none';
    tvTimerSeconds.textContent = state.timerRemaining;
    tvTimerDisplay.classList.toggle('paused', !!state.timerPaused);
    if (state.timerPaused) {
      tvPhaseHeadline.textContent = '⏸️ DÉCOMPTE EN PAUSE...';
      tvPhaseSubtext.innerHTML = `Le temps est suspendu dans le Manoir. (${state.lockedCount || 0}/${state.aliveCount || 0} prêts 🔒)`;
    } else {
      tvPhaseHeadline.textContent = '⏳ CHOIX DES CACHETTES EN COURS !';
      tvPhaseSubtext.innerHTML = `Choisis ta cachette avant les 60s ! &bull; <strong style="color: #6ee7b7;">🔒 ${state.lockedCount || 0}/${state.aliveCount || 0} au lit</strong>`;
    }
  } else if (isNightAsleep) {
    tvTimerSeconds.textContent = '0';
    tvTimerDisplay.classList.remove('urgent');
    tvTimerDisplay.classList.remove('paused');

    if (state.tvMapVisible) {
      if (tvSleepCurtain) tvSleepCurtain.style.display = 'none';
      tvPhaseHeadline.textContent = '🌙 NUIT EN COURS : TOUR DES RÔLES';
      tvPhaseSubtext.textContent = 'Seuls les rôles appelés par le Maître du Jeu ouvrent les yeux et consultent le Manoir.';
    } else {
      if (tvSleepCurtain) tvSleepCurtain.style.display = 'flex';
      tvPhaseHeadline.textContent = '🌙 NUIT NOIRE : LE MANOIR S\'ENDORT...';
      tvPhaseSubtext.textContent = 'Tout le monde a les yeux fermés. Le silence règne dans le Manoir.';
    }
  } else if (isRevealed) {
    if (tvSleepCurtain) tvSleepCurtain.style.display = 'none';
    tvTimerSeconds.textContent = '0';
    tvTimerDisplay.classList.remove('urgent');
    tvTimerDisplay.classList.remove('paused');
    tvPhaseHeadline.textContent = '☀️ JOUR : DÉBATS & VOTE DU VILLAGE';
    tvPhaseSubtext.textContent = 'Toutes les cachettes sont dévoilées. Débattez et votez pour éliminer un suspect !';
  }

  // 3. Rendu des 5 salles sur le schéma
  const roomKeys = ['grenier', 'chambre', 'salon', 'cuisine', 'salle_a_manger'];

  roomKeys.forEach(roomId => {
    const boxEl = document.getElementById(`box-${roomId}`);
    const countEl = document.getElementById(`count-${roomId}`);
    const occupantsEl = document.getElementById(`occupants-${roomId}`);

    if (!countEl || !occupantsEl) return;

    // Sur la TV : une pièce ayant explosé CETTE nuit reste secrète/intacte jusqu'au Bilan des morts (REVEALED)
    const isNightExplosion = (state.nightExplodedRooms || []).includes(roomId);
    const isDestroyed = (state.destroyedRooms || []).includes(roomId) && (isRevealed || !isNightExplosion);

    if (boxEl) {
      boxEl.classList.toggle('is-destroyed', isDestroyed);
      boxEl.classList.toggle('destroyed', isDestroyed);
    }

    if (isDestroyed) {
      countEl.textContent = '💥';
      countEl.style.background = '#b91c1c';
      countEl.style.borderColor = '#ef4444';
      countEl.style.color = '#fef08a';

      if (canSeeRoomsOnTv) {
        const occupants = state.players.filter(p => p.room === roomId && p.isAlive);
        if (occupants.length > 0) {
          occupantsEl.innerHTML = '<span class="destroyed-room-tag">💥 SALLE CALCINÉE</span>';
          occupants.forEach(player => {
            const chip = createTvPlayerChip(player);
            occupantsEl.appendChild(chip);
          });
        } else {
          occupantsEl.innerHTML = '<span class="destroyed-room-tag">💥 SALLE CALCINÉE</span><span style="font-size: 0.74rem; color: #fca5a5; font-style: italic;">Condamnée par le Pyromane</span>';
        }
      } else {
        occupantsEl.innerHTML = '<span class="destroyed-room-tag">💥 SALLE DÉTRUITE</span><span style="font-size: 0.74rem; color: #fca5a5; font-style: italic;">Inaccessible</span>';
      }
      return;
    }

    // Salle normale intacte
    countEl.style.background = '';
    countEl.style.borderColor = '';
    countEl.style.color = '';

    if (canSeeRoomsOnTv) {
      const occupants = state.players.filter(p => p.room === roomId && p.isAlive);
      countEl.textContent = occupants.length;
      if (boxEl) {
        boxEl.classList.toggle('occupied', occupants.length > 0 && !isDestroyed);
      }

      if (occupants.length === 0) {
        occupantsEl.innerHTML = '<span class="empty-room-hint">Pièce vide</span>';
      } else {
        occupantsEl.innerHTML = '';
        occupants.forEach(player => {
          const chip = createTvPlayerChip(player);
          occupantsEl.appendChild(chip);
        });
      }
    } else if (isCountdown) {
      if (boxEl) boxEl.classList.remove('occupied');
      countEl.textContent = '🔒 ?';
      occupantsEl.innerHTML = `
        <span style="color: var(--gold-light); font-size: 0.88rem; font-style: italic; display: flex; align-items: center; gap: 4px; padding: 4px 0;">
          <span>🔒</span> Portes closes (${state.timerRemaining}s)
        </span>
      `;
    } else {
      countEl.textContent = '0';
      occupantsEl.innerHTML = '<span class="empty-room-hint">En attente...</span>';
    }
  });

  // 4. Rendu des couloirs (non placés)
  const aliveUnassigned = state.players.filter(p => p.isAlive && !p.room);
  unassignedCounter.textContent = `${aliveUnassigned.length} joueur${aliveUnassigned.length > 1 ? 's' : ''}`;

  if (aliveUnassigned.length === 0) {
    occupantsUnassigned.innerHTML = '<span style="color: #6ee7b7; font-size: 0.88rem; font-weight: 600;">✓ Tout le monde a bien trouvé un refuge !</span>';
  } else {
    occupantsUnassigned.innerHTML = '';
    aliveUnassigned.forEach(player => {
      const chip = createTvPlayerChip(player, true);
      occupantsUnassigned.appendChild(chip);
    });
  }

  // 5. Rendu du Cimetière 💀
  const deadPlayers = state.players.filter(p => !p.isAlive);
  graveyardCounter.textContent = `${deadPlayers.length} éliminé${deadPlayers.length > 1 ? 's' : ''}`;

  if (deadPlayers.length === 0) {
    occupantsGraveyard.innerHTML = '<span style="color: #94a3b8; font-size: 0.82rem; font-style: italic;">Aucun mort pour le moment. Tout le monde est en vie !</span>';
  } else {
    occupantsGraveyard.innerHTML = '';
    deadPlayers.forEach(player => {
      const chip = document.createElement('div');
      chip.className = 'player-chip';
      chip.style.cssText = `
        background: rgba(185, 28, 28, 0.35);
        border: 1.5px solid var(--crimson);
        color: #fca5a5;
        box-shadow: 0 0 8px rgba(220, 38, 38, 0.35);
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 8px;
      `;
      const reasonNames = {
        timeout: 'Couloirs',
        pyromane: 'Pyromane',
        monsters: 'Monstres',
        vote: 'Vote',
        manual: 'Ombres'
      };
      const reasonTxt = reasonNames[player.eliminatedReason] || 'Éliminé';
      chip.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
          <span style="font-size: 1.15rem;">💀</span>
          <span style="text-decoration: line-through; font-weight: bold; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(player.name)}</span>
        </div>
        <span style="font-size: 0.68rem; color: #fca5a5; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 8px; flex-shrink: 0;">${reasonTxt}</span>
      `;
      occupantsGraveyard.appendChild(chip);
    });
  }
}

// Création d'un pion joueur pour la TV (pur affichage, sans événements de clic admin)
function createTvPlayerChip(player, isUnassigned = false) {
  const chip = document.createElement('div');
  chip.className = 'player-chip';

  const isCountdown = currentGameState?.phase === 'COUNTDOWN';
  let lockBadge = '';
  if (isCountdown) {
    if (player.isLocked) {
      chip.classList.add('is-locked');
      lockBadge = '<span style="font-size: 0.65rem; color: #a7f3d0; background: rgba(6,78,59,0.7); border: 1px solid #10b981; padding: 1px 5px; border-radius: 6px; font-weight: 700; margin-left: auto;">🔒 Prêt</span>';
    } else {
      chip.classList.add('is-thinking');
      lockBadge = '<span style="font-size: 0.65rem; color: #fde047; background: rgba(120,53,15,0.6); border: 1px solid rgba(245,158,11,0.5); padding: 1px 5px; border-radius: 6px; margin-left: auto;">⏳</span>';
    }
  }

  chip.innerHTML = `
    <span style="font-size: 1.2rem;">${player.avatar}</span>
    <span style="font-size: 0.95rem; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(player.name)}</span>
    ${lockBadge}
    ${!player.hasPhone ? '<span style="font-size: 0.65rem; color: var(--gold-light); background: rgba(0,0,0,0.5); padding: 1px 4px; border-radius: 6px; margin-left: 6px;">Sans tél</span>' : ''}
  `;

  if (isUnassigned) {
    if (!chip.classList.contains('is-locked')) {
      chip.style.background = 'rgba(255, 255, 255, 0.08)';
      chip.style.borderColor = 'rgba(255, 255, 255, 0.25)';
    }
    chip.style.width = '100%';
    chip.style.boxSizing = 'border-box';
    chip.style.justifyContent = 'flex-start';
    chip.style.padding = '4px 8px';
  } else {
    chip.style.background = 'rgba(43, 31, 64, 0.95)';
    chip.style.borderColor = 'var(--gold)';
    chip.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.3)';
    chip.style.padding = '2px 8px';
    chip.style.fontSize = '0.8rem';
  }

  return chip;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// Réinitialisation globale de la partie ou de la nuit
socket.on('game_reset_all', () => {
  if (morningDeathsOverlay) morningDeathsOverlay.style.display = 'none';
  if (celebrationOverlay) celebrationOverlay.style.display = 'none';
  if (tvSleepCurtain) tvSleepCurtain.style.display = 'none';
  if (tvGhostEmojisContainer) tvGhostEmojisContainer.innerHTML = '';
});

socket.on('night_restarted', () => {
  if (morningDeathsOverlay) morningDeathsOverlay.style.display = 'none';
  if (celebrationOverlay) celebrationOverlay.style.display = 'none';
  if (tvSleepCurtain) tvSleepCurtain.style.display = 'none';
  if (tvGhostEmojisContainer) tvGhostEmojisContainer.innerHTML = '';
});

// Rafraîchissement automatique à la sortie de veille
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (!socket.connected) socket.connect();
    socket.emit('get_state');
  }
});
