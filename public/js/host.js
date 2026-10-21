// Logique Écran Hôte : Décompte 60s, Révélation, Éliminations 💀 et Attribution Sans Smartphone
const socket = window.socket || io();
window.socket = socket;

let currentGameState = null;
let selectedPlayerForMove = null;
let selectedManualRoom = 'grenier';

// DOM Elements
const btnMainAction = document.getElementById('btn-main-action');
const btnToggleQr = document.getElementById('btn-toggle-qr');
const btnSoundToggle = document.getElementById('btn-sound-toggle');
const btnFullscreen = document.getElementById('btn-fullscreen');
const btnRestartNight = document.getElementById('btn-restart-night');
const btnQuickRestartTimer = document.getElementById('btn-quick-restart-timer');
const btnResetEntireGame = document.getElementById('btn-reset-entire-game');

const hostTimerDisplay = document.getElementById('host-timer-display');
const hostTimerSeconds = document.getElementById('host-timer-seconds');
const btnPauseTimer = document.getElementById('btn-pause-timer');
const badgeReadyCount = document.getElementById('badge-ready-count');
const readyCountNumber = document.getElementById('ready-count-number');
const readyCountTotal = document.getElementById('ready-count-total');
const hostPhaseHeadline = document.getElementById('host-phase-headline');
const hostPhaseSubtext = document.getElementById('host-phase-subtext');
const badgeAliveCount = document.getElementById('badge-alive-count');
const badgeDeadCount = document.getElementById('badge-dead-count');
const unassignedCounter = document.getElementById('unassigned-counter');
const graveyardCounter = document.getElementById('graveyard-counter');
const occupantsGraveyard = document.getElementById('occupants-graveyard');

const btnOpenManualModal = document.getElementById('btn-open-manual-modal');
const modalManualPlayer = document.getElementById('modal-manual-player');
const btnCloseManualModal = document.getElementById('btn-close-manual-modal');
const formAddManual = document.getElementById('form-add-manual');

// Contrôle de l'affichage de la carte sur l'écran TV 📺
const btnToggleNightCurtain = document.getElementById('btn-toggle-night-curtain');
const tvStatusBar = document.getElementById('tv-status-bar');
const tvStatusLabel = document.getElementById('tv-status-label');
const btnToggleTvFromMap = document.getElementById('btn-toggle-tv-from-map');
const manualInputName = document.getElementById('manual-input-name');

const btnAddTest5 = document.getElementById('btn-add-test-5');

const modalQr = document.getElementById('modal-qr');
const btnCloseQr = document.getElementById('btn-close-qr');
const qrCodeImg = document.getElementById('qr-code-img');
const joinLinkText = document.getElementById('join-link-text');

const modalMovePlayer = document.getElementById('modal-move-player');
const modalPlayerTitle = document.getElementById('modal-player-title');
const btnCloseMove = document.getElementById('btn-close-move');
const btnToggleAlive = document.getElementById('btn-toggle-alive');
const inputEditPlayerName = document.getElementById('input-edit-player-name');
const btnSavePlayerName = document.getElementById('btn-save-player-name');
const renamePlayerFeedback = document.getElementById('rename-player-feedback');
const btnDeletePlayerTrigger = document.getElementById('btn-delete-player-trigger');
const deletePlayerConfirmBox = document.getElementById('delete-player-confirm-box');
const deletePlayerConfirmName = document.getElementById('delete-player-confirm-name');
const btnConfirmDeletePlayer = document.getElementById('btn-confirm-delete-player');
const btnCancelDeletePlayer = document.getElementById('btn-cancel-delete-player');

// Éléments du Roster Participants 👥
const btnOpenRosterModal = document.getElementById('btn-open-roster-modal');
const rosterCountHeader = document.getElementById('roster-count-header');
const modalPlayersRoster = document.getElementById('modal-players-roster');
const rosterModalCount = document.getElementById('roster-modal-count');
const btnCloseRoster = document.getElementById('btn-close-roster');
const btnRosterCloseBottom = document.getElementById('btn-roster-close-bottom');
const rosterSearchInput = document.getElementById('roster-search-input');
const rosterPlayersList = document.getElementById('roster-players-list');
const btnRosterAddManual = document.getElementById('btn-roster-add-manual');

// Éléments du Palmarès & Vainqueurs
const currentNightLabel = document.getElementById('current-night-label');
const btnPrevNight = document.getElementById('btn-prev-night');
const btnNextNight = document.getElementById('btn-next-night');
const nightPillsRow = document.getElementById('night-pills-row');
const night5Warning = document.getElementById('night-5-warning');

const scoreValVillage = document.getElementById('score-val-village');
const scoreValMonsters = document.getElementById('score-val-monsters');
const scoreValPyro = document.getElementById('score-val-pyro');

const btnNewRound = document.getElementById('btn-new-round');
const btnClearHistory = document.getElementById('btn-clear-history');
const historyList = document.getElementById('history-list');
const historyTotalCount = document.getElementById('history-total-count');

const btnProclaimVillage = document.getElementById('btn-proclaim-village');
const btnProclaimMonsters = document.getElementById('btn-proclaim-monsters');
const btnProclaimPyro = document.getElementById('btn-proclaim-pyro');

// Modal Proclamation
const modalProclaimDetails = document.getElementById('modal-proclaim-details');
const btnCloseProclaimModal = document.getElementById('btn-close-proclaim-modal');
const btnCancelProclaim = document.getElementById('btn-cancel-proclaim');
const formProclaimWinner = document.getElementById('form-proclaim-winner');
const proclaimCampBadgePreview = document.getElementById('proclaim-camp-badge-preview');
const proclaimModalNightInfo = document.getElementById('proclaim-modal-night-info');
const proclaimInputWinners = document.getElementById('proclaim-input-winners');
const proclaimInputNote = document.getElementById('proclaim-input-note');
let selectedProclaimCamp = 'village';

// Overlay Célébration
const celebrationOverlay = document.getElementById('celebration-overlay');
const celebrationIcon = document.getElementById('celebration-icon');
const celebrationTitle = document.getElementById('celebration-title');
const celebrationSubtitle = document.getElementById('celebration-subtitle');
const celebrationSurvivorsList = document.getElementById('celebration-survivors-list');
const btnCloseCelebration = document.getElementById('btn-close-celebration');

// Éléments Bilan des Morts de la Nuit & Révélation du Matin
const btnOpenNightDeathsModal = document.getElementById('btn-open-night-deaths-modal');
const btnBannerRevealDeaths = document.getElementById('btn-banner-reveal-deaths');
const modalNightDeaths = document.getElementById('modal-night-deaths');
const btnCloseNightDeathsModal = document.getElementById('btn-close-night-deaths-modal');
const btnCancelNightDeaths = document.getElementById('btn-cancel-night-deaths');
const nightDeathsModalNum = document.getElementById('night-deaths-modal-num');
const nightDeathsPlayersList = document.getElementById('night-deaths-players-list');
const btnConfirmRevealDeaths = document.getElementById('btn-confirm-reveal-deaths');

// Éléments du Vote du Village ⚖️
const btnOpenVoteModal = document.getElementById('btn-open-vote-modal');
const btnBannerVillageVote = document.getElementById('btn-banner-village-vote');
const modalVillageVote = document.getElementById('modal-village-vote');
const btnCloseModalVote = document.getElementById('btn-close-modal-vote');
const btnCancelModalVote = document.getElementById('btn-cancel-modal-vote');
const btnConfirmVillageVote = document.getElementById('btn-confirm-village-vote');
const votePlayersList = document.getElementById('vote-players-list');
const voteInputNote = document.getElementById('vote-input-note');
const btnBannerRules = document.getElementById('btn-banner-rules');

const morningDeathsOverlay = document.getElementById('morning-deaths-overlay');
const morningOverlayNightNum = document.getElementById('morning-overlay-night-num');
const morningVictimsContainer = document.getElementById('morning-victims-container');
const morningSurvivorsCount = document.getElementById('morning-survivors-count');
const btnCloseMorningOverlay = document.getElementById('btn-close-morning-overlay');

// Modales de confirmation in-app (remplace window.confirm pour une fiabilité totale)
const modalResetGame = document.getElementById('modal-reset-game');
const btnCloseModalReset = document.getElementById('btn-close-modal-reset');
const btnCancelModalReset = document.getElementById('btn-cancel-modal-reset');
const btnConfirmResetAll = document.getElementById('btn-confirm-reset-all');
const cbResetAllScores = document.getElementById('cb-reset-all-scores');

const modalRestartNight = document.getElementById('modal-restart-night');
const btnCloseModalRestartNight = document.getElementById('btn-close-modal-restart-night');
const btnCancelModalRestartNight = document.getElementById('btn-cancel-modal-restart-night');
const btnConfirmRestartNightAction = document.getElementById('btn-confirm-restart-night-action');

const modalNewRound = document.getElementById('modal-new-round');
const btnCloseModalNewRound = document.getElementById('btn-close-modal-new-round');
const btnCancelModalNewRound = document.getElementById('btn-cancel-modal-new-round');
const btnConfirmNewRoundAction = document.getElementById('btn-confirm-new-round-action');

const modalClearHistory = document.getElementById('modal-clear-history');
const btnCloseModalClearHistory = document.getElementById('btn-close-modal-clear-history');
const btnCancelModalClearHistory = document.getElementById('btn-cancel-modal-clear-history');
const btnConfirmClearHistoryAction = document.getElementById('btn-confirm-clear-history-action');

const modalDeleteHistory = document.getElementById('modal-delete-history');
const btnCloseModalDelHist = document.getElementById('btn-close-modal-del-hist');
const btnCancelModalDelHist = document.getElementById('btn-cancel-modal-del-hist');
const btnConfirmDelHistAction = document.getElementById('btn-confirm-del-hist-action');
const delHistLabel = document.getElementById('del-hist-label');
let pendingDeleteGameId = null;

// Toast notification fluide pour l'animateur
function showHostToast(message, type = 'info') {
  let toast = document.getElementById('host-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'host-toast';
    document.body.appendChild(toast);
  }
  const colors = {
    info: 'background: rgba(30, 27, 75, 0.95); border: 1.5px solid #818cf8; color: #e0e7ff;',
    success: 'background: rgba(6, 78, 59, 0.95); border: 1.5px solid #34d399; color: #ecfdf5;',
    danger: 'background: rgba(127, 29, 29, 0.95); border: 1.5px solid #f87171; color: #fee2e2;',
    warning: 'background: rgba(120, 53, 15, 0.95); border: 1.5px solid #fbbf24; color: #fef3c7;'
  };
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 99999;
    padding: 14px 22px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.95rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: none;
    ${colors[type] || colors.info}
  `;
  toast.innerHTML = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0) scale(1)';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-12px) scale(0.96)';
  }, 4000);
}

// Récupération IP locale & QR Code
const inputCustomJoinUrl = document.getElementById('input-custom-join-url');
const btnApplyCustomUrl = document.getElementById('btn-apply-custom-url');
const btnResetCustomUrl = document.getElementById('btn-reset-custom-url');
const customUrlStatus = document.getElementById('custom-url-status');

async function fetchNetworkInfo() {
  try {
    const res = await fetch('/api/network-info');
    const data = await res.json();
    if (data.qrCodeDataUrl) qrCodeImg.src = data.qrCodeDataUrl;
    if (data.joinUrl) {
      joinLinkText.textContent = data.joinUrl;
      if (inputCustomJoinUrl && data.isCustomUrl) {
        inputCustomJoinUrl.value = data.joinUrl;
      }
    }
  } catch (err) {
    joinLinkText.textContent = `http://${window.location.hostname}:3000`;
  }
}
fetchNetworkInfo();

btnApplyCustomUrl?.addEventListener('click', async () => {
  const url = inputCustomJoinUrl?.value?.trim();
  if (!url) return;
  try {
    const res = await fetch('/api/set-join-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (data.qrCodeDataUrl) qrCodeImg.src = data.qrCodeDataUrl;
    if (data.joinUrl) joinLinkText.textContent = data.joinUrl;
    if (customUrlStatus) {
      customUrlStatus.style.display = 'block';
      customUrlStatus.textContent = '✅ QR Code mis à jour avec le tunnel !';
      setTimeout(() => { customUrlStatus.style.display = 'none'; }, 4000);
    }
    showHostToast("🌐 QR Code mis à jour avec le lien Web / Tunnel !", "success");
  } catch (err) {
    showHostToast("Erreur lors de la mise à jour du QR Code", "error");
  }
});

btnResetCustomUrl?.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/set-join-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '' })
    });
    const data = await res.json();
    if (inputCustomJoinUrl) inputCustomJoinUrl.value = '';
    if (data.qrCodeDataUrl) qrCodeImg.src = data.qrCodeDataUrl;
    if (data.joinUrl) joinLinkText.textContent = data.joinUrl;
    if (customUrlStatus) {
      customUrlStatus.style.display = 'block';
      customUrlStatus.textContent = '✅ Rétabli sur l\'IP locale.';
      setTimeout(() => { customUrlStatus.style.display = 'none'; }, 4000);
    }
    showHostToast("↺ Rétabli sur l'adresse IP locale", "info");
  } catch (err) {
    showHostToast("Erreur lors de la réinitialisation", "error");
  }
});

socket.on('qr_updated', ({ joinUrl, qrCodeDataUrl }) => {
  if (qrCodeImg && qrCodeDataUrl) qrCodeImg.src = qrCodeDataUrl;
  if (joinLinkText && joinUrl) joinLinkText.textContent = joinUrl;
});

// Toggle Son
btnSoundToggle.addEventListener('click', () => {
  const isEnabled = window.soundEngine.toggle();
  btnSoundToggle.textContent = isEnabled ? '🔊' : '🔇';
});

// Toggle Plein Écran
btnFullscreen.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// Toggle Format Largeur Carte
const btnToggleMapSize = document.getElementById('btn-toggle-map-size');
const hostCenterColumn = document.getElementById('host-center-column');
if (btnToggleMapSize && hostCenterColumn) {
  btnToggleMapSize.addEventListener('click', () => {
    const isWide = hostCenterColumn.classList.toggle('wide-layout');
    btnToggleMapSize.textContent = isWide ? '◀▶' : '↔️';
    btnToggleMapSize.title = isWide ? 'Revenir au format ajusté' : 'Agrandir en pleine largeur';
  });
}

// Modal QR Code
btnToggleQr.addEventListener('click', () => {
  modalQr.style.display = 'flex';
});
btnCloseQr.addEventListener('click', () => {
  modalQr.style.display = 'none';
});

// Modal Joueur sans téléphone
btnOpenManualModal.addEventListener('click', () => {
  manualInputName.value = '';
  modalManualPlayer.style.display = 'flex';
  manualInputName.focus();
});
btnCloseManualModal.addEventListener('click', () => {
  modalManualPlayer.style.display = 'none';
});

// Sélection de la pièce pour le joueur manuel
document.querySelectorAll('.btn-pick-manual-room').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-pick-manual-room').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedManualRoom = btn.dataset.room;
  });
});

formAddManual.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = manualInputName.value.trim();
  if (!name) return;

  socket.emit('host_action', {
    action: 'ADD_MANUAL_PLAYER',
    payload: { name, roomId: selectedManualRoom || null, avatar: '🕯️' }
  });

  window.soundEngine.playSelect();
  modalManualPlayer.style.display = 'none';
});

// Socket Events
socket.on('state_updated', (state) => {
  currentGameState = state;
  renderHostView(state);
});

socket.on('timer_tick', ({ remaining, phase, timerPaused }) => {
  if (hostTimerSeconds) {
    if (timerPaused) {
      hostTimerSeconds.textContent = remaining;
      hostTimerDisplay?.classList.add('paused');
      if (btnPauseTimer) {
        btnPauseTimer.textContent = '▶️';
        btnPauseTimer.title = 'Reprendre le décompte (Espace)';
      }
    } else {
      hostTimerSeconds.textContent = remaining;
      hostTimerDisplay?.classList.remove('paused');
      if (btnPauseTimer) {
        btnPauseTimer.textContent = '⏸️';
        btnPauseTimer.title = 'Mettre en pause le décompte (Espace)';
      }
      if (remaining <= 10) {
        hostTimerDisplay?.classList.add('urgent');
        // Battement de cœur angoissant sous les 10 secondes
        window.soundEngine.playHeartbeat(1.2);
        window.soundEngine.playTick();
      } else {
        hostTimerDisplay?.classList.remove('urgent');
      }
    }
  }

  // Synchronisation du chronomètre mobile
  const mobileHdrTimer = document.getElementById('mobile-hdr-timer');
  if (mobileHdrTimer) {
    mobileHdrTimer.textContent = timerPaused ? `⏸️ ${remaining}s` : `⏳ ${remaining}s`;
    mobileHdrTimer.classList.toggle('urgent', remaining <= 10 && phase === 'COUNTDOWN' && !timerPaused);
  }
  const mobileBtnMain = document.getElementById('mobile-btn-main-action');
  if (mobileBtnMain && phase === 'COUNTDOWN') {
    mobileBtnMain.innerHTML = timerPaused ? `▶️ Reprendre (${remaining}s)` : `⚡ Endormir (${remaining}s)`;
  }
});

socket.on('timer_paused', ({ remaining }) => {
  hostTimerDisplay?.classList.add('paused');
  if (btnPauseTimer) {
    btnPauseTimer.textContent = '▶️';
    btnPauseTimer.title = 'Reprendre le décompte (Espace)';
  }
  showHostToast("⏸️ Décompte mis en pause", "warning");
});

socket.on('timer_resumed', ({ remaining }) => {
  hostTimerDisplay?.classList.remove('paused');
  if (btnPauseTimer) {
    btnPauseTimer.textContent = '⏸️';
    btnPauseTimer.title = 'Mettre en pause le décompte (Espace)';
  }
  showHostToast("▶️ Décompte repris !", "info");
});

// Réception du murmure spectral d'un joueur éliminé 👻
socket.on('spectre_whispered', ({ fromName, fromAvatar }) => {
  window.soundEngine.playGhostWhisper();
  showHostToast(`👻 Le spectre <strong>${escapeHtml(fromName)}</strong> (${fromAvatar}) a fait frémir le manoir !`, 'info');
});

socket.on('countdown_finished', () => {
  window.soundEngine.playGong();
});

socket.on('game_reset_all', () => {
  nightDeathsSelections.clear();
  if (modalNightDeaths) modalNightDeaths.style.display = 'none';
  if (modalProclaimDetails) modalProclaimDetails.style.display = 'none';
  if (morningDeathsOverlay) morningDeathsOverlay.style.display = 'none';
  if (celebrationOverlay) celebrationOverlay.style.display = 'none';
  if (tvStatusBar) tvStatusBar.style.display = 'none';
  showHostToast("🏰 Partie relancée ! Tous les participants reviennent à la vie.", "success");
});

socket.on('night_restarted', () => {
  nightDeathsSelections.clear();
  if (modalNightDeaths) modalNightDeaths.style.display = 'none';
  if (morningDeathsOverlay) morningDeathsOverlay.style.display = 'none';
  if (tvStatusBar) tvStatusBar.style.display = 'none';
  showHostToast("🔄 Nuit relancée ! Décompte de 60s en cours.", "info");
});

// Rendu complet
function renderHostView(state) {
  currentGameState = state;
  const phase = state.phase;
  const isRevealed = phase === 'REVEALED';
  const isNightAsleep = phase === 'NIGHT_ASLEEP';
  const isCountdown = phase === 'COUNTDOWN';
  const canSeeRooms = isRevealed || isNightAsleep;

  // 1. Mise à jour du bandeau supérieur
  badgeAliveCount.textContent = `${state.aliveCount} Survivant${state.aliveCount > 1 ? 's' : ''}`;
  badgeDeadCount.textContent = `${state.deadCount} Éliminé${state.deadCount > 1 ? 's' : ''} 💀`;

  if (phase === 'WAITING') {
    if (tvStatusBar) tvStatusBar.style.display = 'none';
    if (btnToggleNightCurtain) btnToggleNightCurtain.style.display = 'none';
    if (btnBannerVillageVote) btnBannerVillageVote.style.display = 'none';
    if (btnBannerRules) btnBannerRules.style.display = 'inline-flex';

    btnMainAction.innerHTML = '⏳ Lancer le décompte (1 minute)';
    btnMainAction.className = 'btn-primary';
    hostPhaseHeadline.textContent = 'Préparez-vous pour la nuit...';
    hostPhaseSubtext.textContent = 'Invitez les joueurs à scanner le QR Code. Expliquez les règles et le détail des cartes avant de lancer la partie !';
    hostTimerSeconds.textContent = '60';
    hostTimerDisplay.classList.remove('urgent');
  } else if (isCountdown) {
    if (btnBannerRules) btnBannerRules.style.display = 'none';
    if (tvStatusBar) tvStatusBar.style.display = 'none';
    if (btnToggleNightCurtain) btnToggleNightCurtain.style.display = 'none';
    if (btnBannerVillageVote) btnBannerVillageVote.style.display = 'none';

    // Contrôles de pause et compteurs de validation
    if (btnPauseTimer) {
      btnPauseTimer.style.display = 'inline-block';
      btnPauseTimer.textContent = state.timerPaused ? '▶️' : '⏸️';
      btnPauseTimer.title = state.timerPaused ? 'Reprendre le décompte (Espace)' : 'Mettre en pause le décompte (Espace)';
    }
    if (badgeReadyCount) {
      badgeReadyCount.style.display = 'inline-flex';
      if (readyCountNumber) readyCountNumber.textContent = state.lockedCount || 0;
      if (readyCountTotal) readyCountTotal.textContent = state.aliveCount || 0;
    }

    btnMainAction.innerHTML = '⚡ Terminer le décompte (Endormir le Manoir)';
    btnMainAction.className = 'btn-secondary';
    hostPhaseHeadline.textContent = state.timerPaused ? '⏸️ Décompte en pause' : '⏳ Choix des cachettes en cours !';
    hostPhaseSubtext.textContent = `1 minute pour choisir son refuge (${state.lockedCount || 0}/${state.aliveCount || 0} prêts 🔒)`;
    hostTimerSeconds.textContent = state.timerRemaining;
    hostTimerDisplay.classList.toggle('paused', !!state.timerPaused);
  } else if (isNightAsleep) {
    if (btnBannerRules) btnBannerRules.style.display = 'none';
    if (btnPauseTimer) btnPauseTimer.style.display = 'none';
    if (badgeReadyCount) badgeReadyCount.style.display = 'none';
    hostTimerDisplay?.classList.remove('paused');
    if (btnBannerVillageVote) btnBannerVillageVote.style.display = 'none';

    // Contrôle TV pendant la nuit noire (yeux fermés)
    const isTvVisible = !!state.tvMapVisible;

    if (tvStatusBar) {
      tvStatusBar.style.display = 'flex';
      if (tvStatusLabel) {
        if (isTvVisible) {
          tvStatusLabel.innerHTML = '👁️ Carte VISIBLE sur l\'écran TV (Dévoilée)';
          tvStatusLabel.style.color = '#6ee7b7';
        } else {
          tvStatusLabel.innerHTML = '🙈 Carte MASQUÉE sur l\'écran TV (Yeux fermés)';
          tvStatusLabel.style.color = '#fca5a5';
        }
      }
      if (btnToggleTvFromMap) {
        if (isTvVisible) {
          btnToggleTvFromMap.innerHTML = '🙈 Masquer sur la TV';
          btnToggleTvFromMap.className = 'btn-secondary';
          btnToggleTvFromMap.style.borderColor = '#a855f7';
          btnToggleTvFromMap.style.color = '#e9d5ff';
          btnToggleTvFromMap.style.background = 'rgba(168, 85, 247, 0.2)';
        } else {
          btnToggleTvFromMap.innerHTML = '👁️ Dévoiler la carte sur la TV';
          btnToggleTvFromMap.className = 'btn-primary';
          btnToggleTvFromMap.style.background = 'linear-gradient(135deg, #7c3aed, #9333ea)';
          btnToggleTvFromMap.style.borderColor = '#c084fc';
          btnToggleTvFromMap.style.color = '#ffffff';
        }
      }
    }

    if (btnToggleNightCurtain) {
      btnToggleNightCurtain.style.display = 'inline-flex';
      if (isTvVisible) {
        btnToggleNightCurtain.innerHTML = '📺 TV : 🙈 Masquer la carte';
        btnToggleNightCurtain.className = 'btn-secondary';
        btnToggleNightCurtain.style.borderColor = '#a855f7';
        btnToggleNightCurtain.style.color = '#e9d5ff';
        btnToggleNightCurtain.style.background = 'rgba(168, 85, 247, 0.2)';
      } else {
        btnToggleNightCurtain.innerHTML = '📺 TV : 👁️ Dévoiler la carte';
        btnToggleNightCurtain.className = 'btn-primary';
        btnToggleNightCurtain.style.background = 'linear-gradient(135deg, #7c3aed, #9333ea)';
        btnToggleNightCurtain.style.borderColor = '#c084fc';
        btnToggleNightCurtain.style.color = '#ffffff';
      }
    }

    btnMainAction.innerHTML = '🌅 Le Jour se lève (Bilan des Morts)';
    btnMainAction.className = 'btn-danger';
    hostPhaseHeadline.textContent = '🌙 NUIT NOIRE : LE MANOIR S\'ENDORT...';
    hostPhaseSubtext.textContent = 'Tout le monde a les yeux fermés. Votre plan ci-dessous reste visible pour vous ; utilisez le bouton pour afficher la carte sur la TV quand un rôle est appelé.';
    hostTimerSeconds.textContent = '0';
    hostTimerDisplay.classList.remove('urgent');
  } else if (isRevealed) {
    if (btnBannerRules) btnBannerRules.style.display = 'none';
    if (tvStatusBar) tvStatusBar.style.display = 'none';
    if (btnToggleNightCurtain) btnToggleNightCurtain.style.display = 'none';
    if (btnBannerVillageVote) btnBannerVillageVote.style.display = 'inline-flex';

    btnMainAction.innerHTML = '🌙 Nuit suivante (Relancer le décompte 60s)';
    btnMainAction.className = 'btn-primary';
    hostPhaseHeadline.textContent = '☀️ JOUR : DÉBATS & VOTE DU VILLAGE';
    hostPhaseSubtext.textContent = 'Les survivants débattent. Cliquez sur ⚖️ Vote du Village pour éliminer l\'accusé voté, puis lancez la nuit suivante.';
    hostTimerSeconds.textContent = '0';
    hostTimerDisplay.classList.remove('urgent');
  }

  if (btnRestartNight) {
    if (isCountdown) {
      btnRestartNight.innerHTML = '🔄 Relancer la nuit (60s)';
      btnRestartNight.title = 'Relancer le décompte de 60s pour la nuit en cours et déverrouiller les choix des survivants';
    } else if (isNightAsleep || isRevealed) {
      btnRestartNight.innerHTML = '🔄 Recommencer cette nuit';
      btnRestartNight.title = 'Rejouer cette même nuit depuis le début (remet le chrono à 60s sans éliminer)';
    } else {
      btnRestartNight.innerHTML = '🔄 Relancer la nuit';
      btnRestartNight.title = 'Remettre le décompte à 60s';
    }
  }

  if (btnBannerRevealDeaths) {
    btnBannerRevealDeaths.style.display = (isNightAsleep || isRevealed) ? 'inline-flex' : 'none';
  }

  // Compteur global de participants dans le header
  const totalPlayers = state.players ? state.players.length : 0;
  if (rosterCountHeader) {
    rosterCountHeader.textContent = totalPlayers;
  }
  const mobileTabRosterCount = document.getElementById('mobile-tab-roster-count');
  if (mobileTabRosterCount) {
    mobileTabRosterCount.textContent = totalPlayers;
  }
  const mobilePlayersCount = document.getElementById('mobile-players-count');
  if (mobilePlayersCount) {
    mobilePlayersCount.textContent = totalPlayers;
  }
  if (modalPlayersRoster && modalPlayersRoster.style.display === 'flex') {
    renderRosterList();
  }
  const mobilePlayersTabSection = document.getElementById('mobile-players-tab-section');
  if (mobilePlayersTabSection && (mobilePlayersTabSection.classList.contains('active') || mobilePlayersTabSection.style.display !== 'none')) {
    renderMobileRosterList(state);
  }

  // 2. Rendu des 5 salles sur le schéma
  const roomKeys = ['grenier', 'chambre', 'salon', 'cuisine', 'salle_a_manger'];

  roomKeys.forEach(roomId => {
    const boxEl = document.getElementById(`box-${roomId}`);
    const countEl = document.getElementById(`count-${roomId}`);
    const occupantsEl = document.getElementById(`occupants-${roomId}`);

    if (!countEl || !occupantsEl) return;

    const isDestroyed = (state.destroyedRooms || []).includes(roomId);
    if (boxEl) {
      boxEl.classList.toggle('is-destroyed', isDestroyed);
    }

    if (isDestroyed) {
      countEl.textContent = '💥';
      countEl.style.background = '#b91c1c';
      countEl.style.borderColor = '#ef4444';
      countEl.style.color = '#fef08a';

      if (canSeeRooms) {
        const occupants = state.players.filter(p => p.room === roomId && p.isAlive);
        if (occupants.length > 0) {
          occupantsEl.innerHTML = '<span class="destroyed-room-tag">💥 SALLE CALCINÉE</span>';
          occupants.forEach(player => {
            const chip = createPlayerChip(player);
            occupantsEl.appendChild(chip);
          });
        } else {
          occupantsEl.innerHTML = '<span class="destroyed-room-tag">💥 SALLE CALCINÉE</span><span style="font-size: 0.74rem; color: #fca5a5; font-style: italic;">Condamnée par le Pyromane</span>';
        }
      } else {
        occupantsEl.innerHTML = '<span class="destroyed-room-tag">💥 SALLE DÉTRUITE</span><span style="font-size: 0.74rem; color: #fca5a5; font-style: italic;">Condamnée & Inaccessible</span>';
      }
      return;
    }

    // Salle normale intacte
    countEl.style.background = '';
    countEl.style.borderColor = '';
    countEl.style.color = '';

    if (canSeeRooms) {
      // SEULS LES JOUEURS EN VIE ET PRÉSENTS SONT DANS LA SALLE
      const occupants = state.players.filter(p => p.room === roomId && p.isAlive);
      countEl.textContent = occupants.length;

      if (occupants.length === 0) {
        occupantsEl.innerHTML = '<span class="empty-room-hint">Pièce vide</span>';
      } else {
        occupantsEl.innerHTML = '';
        occupants.forEach(player => {
          const chip = createPlayerChip(player);
          occupantsEl.appendChild(chip);
        });
      }
    } else if (isCountdown) {
      countEl.textContent = '🔒 ?';
      occupantsEl.innerHTML = `
        <span style="color: var(--gold-light); font-size: 0.82rem; font-style: italic; display: flex; align-items: center; gap: 4px; padding: 4px 0;">
          <span>🔒</span> Portes closes (${state.timerRemaining}s)
        </span>
      `;
    } else {
      countEl.textContent = '0';
      occupantsEl.innerHTML = '<span class="empty-room-hint">En attente...</span>';
    }
  });

  // 3. Rendu du couloir (vivants qui n'ont pas encore de pièce)
  const unassignedEl = document.getElementById('occupants-unassigned');
  const aliveUnassigned = state.players.filter(p => p.isAlive && !p.room);
  unassignedCounter.textContent = `${aliveUnassigned.length} joueur${aliveUnassigned.length > 1 ? 's' : ''}`;

  if (aliveUnassigned.length === 0) {
    unassignedEl.innerHTML = '<span style="color: #6ee7b7; font-size: 0.95rem; font-weight: 600;">✓ Tout le monde a bien trouvé un refuge !</span>';
  } else {
    unassignedEl.innerHTML = '';
    aliveUnassigned.forEach(player => {
      const chip = createPlayerChip(player, true);
      unassignedEl.appendChild(chip);
    });
  }

  // 4. Rendu de la section CIMETIÈRE 💀 (Joueurs éliminés)
  const deadPlayers = state.players.filter(p => !p.isAlive);
  graveyardCounter.textContent = `${deadPlayers.length} éliminé${deadPlayers.length > 1 ? 's' : ''}`;

  if (deadPlayers.length === 0) {
    occupantsGraveyard.innerHTML = '<span style="color: #94a3b8; font-size: 0.85rem; font-style: italic;">Aucun mort pour le moment. Tout le monde est en vie !</span>';
  } else {
    occupantsGraveyard.innerHTML = '';
    deadPlayers.forEach(player => {
      const chip = document.createElement('div');
      chip.className = 'player-chip';
      chip.style.cssText = `
        background: rgba(185, 28, 28, 0.35);
        border: 1.5px solid var(--crimson);
        color: #fca5a5;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
      `;
      chip.title = 'Cliquez pour ressusciter ou gérer';
      const reasonLabels = {
        vote: '⚖️ Voté',
        monsters: '🐺 Monstres',
        sorciere: '🧪 Sorcière',
        chasseur: '🏹 Chasseur',
        pyromane: '💣 Explosion',
        timeout: '⏳ Temps',
        manual: '💀 Éliminé'
      };
      const rTxt = reasonLabels[player.eliminatedReason] || 'Éliminé';
      chip.innerHTML = `
        <span style="font-size: 1.25rem;">💀</span>
        <span style="text-decoration: line-through; font-weight: bold;">${player.name}</span>
        <span style="font-size: 0.75rem; color: #fca5a5; background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 10px;">${rTxt}</span>
      `;
      chip.addEventListener('click', () => openMoveModal(player));
      occupantsGraveyard.appendChild(chip);
    });
  }

  // 5. Rendu du Palmarès & Compteur de Nuit
  if (currentNightLabel) {
    const night = state.currentNight || 1;
    const maxN = state.maxNights || 5;
    currentNightLabel.textContent = `Nuit ${night} / ${maxN}`;
  }

  // Puces de nuits
  document.querySelectorAll('.btn-night-step').forEach(btn => {
    const n = parseInt(btn.dataset.night);
    btn.classList.toggle('active', n === (state.currentNight || 1));
  });

  if (night5Warning) {
    night5Warning.style.display = (state.currentNight === 5) ? 'block' : 'none';
  }

  // 6. Rendu des Scores (Hall of Fame)
  if (scoreValVillage) scoreValVillage.textContent = state.scores?.village || 0;
  if (scoreValMonsters) scoreValMonsters.textContent = state.scores?.monsters || 0;
  if (scoreValPyro) scoreValPyro.textContent = state.scores?.pyromane || 0;

  // 7. Rendu de l'Historique des Parties
  if (historyTotalCount) {
    historyTotalCount.textContent = (state.gameHistory || []).length;
  }

  if (historyList) {
    const history = state.gameHistory || [];
    if (history.length === 0) {
      historyList.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.8rem; font-style: italic; text-align: center; padding: 18px 8px;">
          Aucune partie enregistrée.<br>Terminez une manche et proclamez le vainqueur !
        </div>
      `;
    } else {
      historyList.innerHTML = '';
      history.forEach(game => {
        const card = document.createElement('div');
        card.className = 'history-card';

        const campTagClasses = {
          village: 'village',
          monsters: 'monsters',
          pyromane: 'pyromane'
        };
        const tagClass = campTagClasses[game.winnerCamp] || 'village';

        let survivorsHtml = '';
        if (game.customWinners) {
          survivorsHtml = `<div style="font-size: 0.75rem; color: #fef08a; font-weight: 600; margin-top: 4px;">🏆 ${escapeHtml(game.customWinners)}</div>`;
        } else if (game.survivors && game.survivors.length > 0) {
          survivorsHtml = `
            <div class="history-survivors-chips">
              ${game.survivors.map(s => `
                <span class="history-survivor-chip">
                  <span>${s.avatar || '🕯️'}</span>
                  <strong>${escapeHtml(s.name)}</strong>
                </span>
              `).join('')}
            </div>
          `;
        } else {
          survivorsHtml = `<div style="font-size: 0.72rem; color: #94a3b8; font-style: italic; margin-top: 2px;">Aucun survivant</div>`;
        }

        const noteHtml = game.note ? `<div style="font-size: 0.72rem; color: var(--gold-light); font-style: italic; margin-top: 2px;">💬 ${escapeHtml(game.note)}</div>` : '';

        card.innerHTML = `
          <div class="history-card-top">
            <span class="history-game-num">Partie #${game.gameNumber}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="history-winner-tag ${tagClass}">
                ${game.winnerTitle}
              </span>
              <button class="btn-del-history" data-game-id="${game.id}" title="Supprimer cette partie">✕</button>
            </div>
          </div>
          <div class="history-details">
            <span>🌙 Terminée en Nuit ${game.nightEnded || '?'}</span>
            <span>⏱️ ${game.timestamp || ''}</span>
          </div>
          ${survivorsHtml}
          ${noteHtml}
        `;

        card.querySelector('.btn-del-history')?.addEventListener('click', (e) => {
          e.stopPropagation();
          pendingDeleteGameId = game.id;
          if (delHistLabel) {
            delHistLabel.textContent = `Partie #${game.gameNumber} (${game.winnerTitle})`;
          }
          if (modalDeleteHistory) {
            modalDeleteHistory.style.display = 'flex';
          }
        });

        historyList.appendChild(card);
      });
    }
  }

  // 8. Rendu de la vue mobile (Smartphones & Tablettes)
  renderMobileView(state);
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

// Création d'un pion de joueur vivant
function createPlayerChip(player, isUnassigned = false) {
  const chip = document.createElement('div');
  chip.className = 'player-chip';
  chip.style.cursor = 'pointer';
  chip.title = 'Cliquer pour déplacer, attribuer une pièce ou éliminer';

  const isCountdown = currentGameState?.phase === 'COUNTDOWN';
  let statusBadge = '';
  const isPyroTarget = player.eliminatedReason === 'pyromane' || (currentGameState?.pendingNightEliminations || []).includes(player.id);
  if (isPyroTarget) {
    statusBadge = '<span style="font-size: 0.72rem; color: #fecaca; background: rgba(220,38,38,0.7); border: 1px solid #ef4444; padding: 2px 6px; border-radius: 8px; font-weight: 700;">💣 Cible Pyro</span>';
  } else if (isCountdown) {
    if (player.isLocked) {
      chip.classList.add('is-locked');
      statusBadge = '<span style="font-size: 0.72rem; color: #a7f3d0; background: rgba(6,78,59,0.7); border: 1px solid #10b981; padding: 2px 6px; border-radius: 8px; font-weight: 700;">🔒 Prêt</span>';
    } else {
      chip.classList.add('is-thinking');
      statusBadge = '<span style="font-size: 0.72rem; color: #fde047; background: rgba(120,53,15,0.6); border: 1px solid rgba(245,158,11,0.5); padding: 2px 6px; border-radius: 8px;">⏳ Choisit...</span>';
    }
  }

  chip.innerHTML = `
    <span style="font-size: 1.25rem;">${player.avatar}</span>
    <span style="font-size: 1.05rem; font-weight: 700; color: #fff;">${player.name}</span>
    ${statusBadge}
    ${!player.hasPhone ? '<span style="font-size: 0.7rem; color: var(--gold-light); background: rgba(0,0,0,0.5); padding: 2px 5px; border-radius: 8px;">Sans tél</span>' : ''}
  `;

  if (isUnassigned) {
    if (!chip.classList.contains('is-locked')) {
      chip.style.background = 'rgba(255, 255, 255, 0.08)';
      chip.style.borderColor = 'rgba(255, 255, 255, 0.25)';
    }
  } else {
    chip.style.background = 'rgba(43, 31, 64, 0.95)';
    chip.style.borderColor = 'var(--gold)';
    chip.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.35)';
  }

  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    openMoveModal(player);
  });

  return chip;
}

// Clic sur l'action principale (Desktop & Mobile)
function handleMainAction() {
  const phase = currentGameState ? currentGameState.phase : 'WAITING';

  if (phase === 'WAITING' || phase === 'REVEALED') {
    window.soundEngine.init();
    window.soundEngine.playGong();

    // Passer à la nuit suivante si on relance après la révélation
    if (currentGameState && currentGameState.phase === 'REVEALED' && currentGameState.currentNight < currentGameState.maxNights) {
      socket.emit('host_action', { action: 'NEXT_NIGHT' });
    }

    socket.emit('host_action', { action: 'START_COUNTDOWN', payload: { duration: 60 } });
  } else if (phase === 'COUNTDOWN') {
    window.soundEngine.playGong();
    socket.emit('host_action', { action: 'REVEAL_NOW' });
  } else if (phase === 'NIGHT_ASLEEP') {
    // Le Manoir s'est endormi : cliquer sur le bouton permet d'ouvrir le bilan des morts et de proclamer l'aube
    openNightDeathsModal();
  }
}

btnMainAction?.addEventListener('click', handleMainAction);

// Bouton Pause / Reprendre le Décompte
btnPauseTimer?.addEventListener('click', () => {
  window.soundEngine.init();
  window.soundEngine.playSelect();
  socket.emit('host_action', { action: 'TOGGLE_TIMER_PAUSE' });
});

// Raccourci barre d'espace pour Mettre en Pause / Reprendre
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    if (currentGameState && currentGameState.phase === 'COUNTDOWN') {
      e.preventDefault();
      window.soundEngine.init();
      window.soundEngine.playSelect();
      socket.emit('host_action', { action: 'TOGGLE_TIMER_PAUSE' });
    }
  }
});

// Écouteurs pour le contrôle de l'affichage sur la TV
function toggleTvMapVisibility() {
  const nextVisible = !currentGameState?.tvMapVisible;
  socket.emit('host_action', {
    action: 'TOGGLE_TV_MAP',
    payload: { visible: nextVisible }
  });
  showHostToast(nextVisible ? "📺 Carte désormais VISIBLE sur le Grand Écran TV !" : "📺 Carte MASQUÉE sur l'écran TV (Rideau noir) !", "info");
  window.soundEngine.playSelect();
}

btnToggleNightCurtain?.addEventListener('click', toggleTvMapVisibility);
btnToggleTvFromMap?.addEventListener('click', toggleTvMapVisibility);

socket.on('sleep_phase_started', () => {
  window.soundEngine.playGong();
});

// Modal de gestion / déplacement / renommage / élimination joueur
function openMoveModal(player) {
  selectedPlayerForMove = player;
  modalPlayerTitle.textContent = `Gestion : ${player.avatar} ${player.name} ${!player.isAlive ? '(💀 Mort)' : ''}`;

  if (inputEditPlayerName) inputEditPlayerName.value = player.name;
  if (renamePlayerFeedback) renamePlayerFeedback.style.display = 'none';
  if (deletePlayerConfirmBox) deletePlayerConfirmBox.style.display = 'none';
  if (deletePlayerConfirmName) deletePlayerConfirmName.textContent = player.name;

  btnToggleAlive.innerHTML = player.isAlive ? '💀 Éliminer ce joueur' : '✨ Ressusciter ce joueur';
  btnToggleAlive.className = player.isAlive ? 'btn-danger' : 'btn-primary';

  modalMovePlayer.style.display = 'flex';
  setTimeout(() => inputEditPlayerName?.focus(), 80);
}

btnCloseMove.addEventListener('click', () => {
  modalMovePlayer.style.display = 'none';
  selectedPlayerForMove = null;
});

// Enregistrer le nouveau nom du joueur
function submitRenamePlayer() {
  if (!selectedPlayerForMove) return;
  const newName = (inputEditPlayerName?.value || '').trim();
  if (!newName) return;

  socket.emit('host_action', {
    action: 'RENAME_PLAYER',
    payload: { playerId: selectedPlayerForMove.id, id: selectedPlayerForMove.id, name: newName }
  });

  selectedPlayerForMove.name = newName;
  modalPlayerTitle.textContent = `Gestion : ${selectedPlayerForMove.avatar} ${newName} ${!selectedPlayerForMove.isAlive ? '(💀 Mort)' : ''}`;
  if (deletePlayerConfirmName) deletePlayerConfirmName.textContent = newName;

  if (renamePlayerFeedback) {
    renamePlayerFeedback.style.display = 'block';
    setTimeout(() => {
      if (renamePlayerFeedback) renamePlayerFeedback.style.display = 'none';
    }, 2500);
  }

  window.soundEngine.playSelect();
}

btnSavePlayerName?.addEventListener('click', submitRenamePlayer);
inputEditPlayerName?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitRenamePlayer();
  }
});

// Boutons pour attribuer/changer la pièce
document.querySelectorAll('.btn-set-room').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!selectedPlayerForMove) return;
    const targetRoom = btn.dataset.room || null;

    socket.emit('host_action', {
      action: 'MANUAL_SET_ROOM',
      payload: { playerId: selectedPlayerForMove.id, roomId: targetRoom }
    });

    window.soundEngine.playSelect();
    modalMovePlayer.style.display = 'none';
    selectedPlayerForMove = null;
  });
});

// Bouton Éliminer / Ressusciter
btnToggleAlive.addEventListener('click', () => {
  if (!selectedPlayerForMove) return;

  socket.emit('host_action', {
    action: 'TOGGLE_PLAYER_ALIVE',
    payload: { playerId: selectedPlayerForMove.id, reason: 'manual' }
  });

  window.soundEngine.playDoorLock();
  modalMovePlayer.style.display = 'none';
  selectedPlayerForMove = null;
});

// Retirer un joueur avec confirmation inline 100% fiable
btnDeletePlayerTrigger?.addEventListener('click', () => {
  if (!selectedPlayerForMove) return;
  if (deletePlayerConfirmName) deletePlayerConfirmName.textContent = selectedPlayerForMove.name;
  if (deletePlayerConfirmBox) deletePlayerConfirmBox.style.display = 'block';
});

btnCancelDeletePlayer?.addEventListener('click', () => {
  if (deletePlayerConfirmBox) deletePlayerConfirmBox.style.display = 'none';
});

btnConfirmDeletePlayer?.addEventListener('click', () => {
  if (!selectedPlayerForMove) return;
  const targetId = selectedPlayerForMove.id;

  socket.emit('host_action', {
    action: 'REMOVE_PLAYER',
    payload: { playerId: targetId, id: targetId }
  });

  window.soundEngine.playDoorLock();
  modalMovePlayer.style.display = 'none';
  if (deletePlayerConfirmBox) deletePlayerConfirmBox.style.display = 'none';
  selectedPlayerForMove = null;
});

// 5 Joueurs tests
btnAddTest5.addEventListener('click', () => {
  const testData = [
    { name: 'Lucas', avatar: '🦇', room: 'grenier' },
    { name: 'Emma', avatar: '🕯️', room: 'cuisine' },
    { name: 'Arthur', avatar: '🐺', room: 'cuisine' },
    { name: 'Chloé', avatar: '🧙', room: 'chambre' },
    { name: 'Noé', avatar: '🦉', room: 'salon' }
  ];

  testData.forEach(t => {
    socket.emit('host_action', {
      action: 'ADD_MANUAL_PLAYER',
      payload: { name: t.name, avatar: t.avatar, roomId: t.room }
    });
  });
});

// ========================================================
// 💣 POUVOIR DU PYROMANE (DESTRUCTION DE SALLE)
// ========================================================
let selectedPyroRoom = 'chambre';
const btnOpenPyroModal = document.getElementById('btn-open-pyro-modal');
const modalPyro = document.getElementById('modal-pyro');
const btnClosePyro = document.getElementById('btn-close-pyro');
const pyroKillOccupants = document.getElementById('pyro-kill-occupants');
const btnPyroTrigger = document.getElementById('btn-pyro-trigger');
const btnPyroRestore = document.getElementById('btn-pyro-restore');
const explosionFlashOverlay = document.getElementById('explosion-flash-overlay');
const explosionFlashTitle = document.getElementById('explosion-flash-title');
const explosionFlashSubtitle = document.getElementById('explosion-flash-subtitle');

function updatePyroModalUI() {
  const isDestroyed = (currentGameState?.destroyedRooms || []).includes(selectedPyroRoom);
  document.querySelectorAll('.btn-pyro-pick').forEach(btn => {
    const rId = btn.dataset.room;
    const rDestroyed = (currentGameState?.destroyedRooms || []).includes(rId);
    btn.classList.toggle('selected', rId === selectedPyroRoom);
    
    // Label propre
    const baseNames = {
      chambre: '🛏️ Chambre',
      cuisine: '🍲 Cuisine',
      salle_a_manger: '🕯️ Salle à Manger',
      salon: '🔥 Salon',
      grenier: '🕷️ Grenier'
    };
    btn.innerHTML = `${baseNames[rId] || rId} ${rDestroyed ? '<span style="color:#f87171; font-weight:bold;">(💥 Détruite)</span>' : ''}`;
    
    if (rDestroyed) {
      btn.style.borderColor = '#ef4444';
      btn.style.background = 'rgba(239, 68, 68, 0.2)';
    } else {
      btn.style.borderColor = '';
      btn.style.background = '';
    }
  });

  if (isDestroyed) {
    btnPyroTrigger.style.display = 'none';
    btnPyroRestore.style.display = 'inline-flex';
  } else {
    btnPyroTrigger.style.display = 'inline-flex';
    btnPyroRestore.style.display = 'none';
  }
}

if (btnOpenPyroModal) {
  btnOpenPyroModal.addEventListener('click', () => {
    updatePyroModalUI();
    modalPyro.style.display = 'flex';
  });
}

if (btnClosePyro) {
  btnClosePyro.addEventListener('click', () => {
    modalPyro.style.display = 'none';
  });
}

if (modalPyro) {
  modalPyro.addEventListener('click', (e) => {
    if (e.target === modalPyro) {
      modalPyro.style.display = 'none';
    }
  });
}

document.querySelectorAll('.btn-pyro-pick').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedPyroRoom = btn.dataset.room;
    updatePyroModalUI();
  });
});

if (btnPyroTrigger) {
  btnPyroTrigger.addEventListener('click', () => {
    window.soundEngine.init();
    const kill = pyroKillOccupants ? pyroKillOccupants.checked : true;
    socket.emit('host_action', {
      action: 'DESTROY_ROOM',
      payload: { roomId: selectedPyroRoom, killOccupants: kill }
    });
    modalPyro.style.display = 'none';
  });
}

if (btnPyroRestore) {
  btnPyroRestore.addEventListener('click', () => {
    socket.emit('host_action', {
      action: 'RESTORE_ROOM',
      payload: { roomId: selectedPyroRoom }
    });
    modalPyro.style.display = 'none';
  });
}

// Boutons rapides 💣 sur chaque pièce du schéma
document.querySelectorAll('.btn-quick-pyro').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedPyroRoom = btn.dataset.room;
    updatePyroModalUI();
    modalPyro.style.display = 'flex';
  });
});

// Événement d'explosion reçu du serveur
socket.on('room_exploded', ({ roomId, roomName, victims }) => {
  window.soundEngine.playExplosion();

  // Screen shake
  document.body.classList.add('exploding-screen');
  setTimeout(() => {
    document.body.classList.remove('exploding-screen');
  }, 750);

  // Overlay flash
  if (explosionFlashOverlay) {
    explosionFlashTitle.textContent = `💥 BOOM ! ${roomName ? roomName.toUpperCase() : 'UNE SALLE'} A EXPLOSÉ !`;
    explosionFlashSubtitle.textContent = victims && victims.length > 0 
      ? `💀 ${victims.map(v => v.name).join(', ')} ont été pulvérisés par le Pyromane !`
      : `🔥 La pièce est calcinée et condamnée pour le reste de la partie. Aucun survivant ne s'y trouvait.`;
    
    explosionFlashOverlay.style.display = 'flex';
    setTimeout(() => {
      explosionFlashOverlay.style.display = 'none';
    }, 2400);
  }
});

// ========================================================
// 🏆 PALMARÈS, GESTION DES NUITS & PROCLAMATION VAINQUEURS
// ========================================================

// 1. Navigation dans les nuits
document.querySelectorAll('.btn-night-step').forEach(btn => {
  btn.addEventListener('click', () => {
    const night = parseInt(btn.dataset.night);
    if (night) {
      socket.emit('host_action', { action: 'SET_NIGHT', payload: { night } });
      window.soundEngine.playSelect();
    }
  });
});

btnPrevNight?.addEventListener('click', () => {
  socket.emit('host_action', { action: 'PREV_NIGHT' });
  window.soundEngine.playSelect();
});

btnNextNight?.addEventListener('click', () => {
  socket.emit('host_action', { action: 'NEXT_NIGHT' });
  window.soundEngine.playSelect();
});

// Relancer la nuit en cours (modal in-app)
function openRestartNightModal() {
  if (!currentGameState) return;
  if (modalRestartNight) {
    modalRestartNight.style.display = 'flex';
  }
}

btnRestartNight?.addEventListener('click', openRestartNightModal);
btnQuickRestartTimer?.addEventListener('click', openRestartNightModal);

btnConfirmRestartNightAction?.addEventListener('click', () => {
  if (modalRestartNight) modalRestartNight.style.display = 'none';
  window.soundEngine.init();
  window.soundEngine.playGong();
  socket.emit('host_action', { action: 'RESTART_CURRENT_NIGHT', payload: { autoStart: true, duration: 60 } });
});

btnCancelModalRestartNight?.addEventListener('click', () => {
  if (modalRestartNight) modalRestartNight.style.display = 'none';
});
btnCloseModalRestartNight?.addEventListener('click', () => {
  if (modalRestartNight) modalRestartNight.style.display = 'none';
});

// Relancer complètement toute la partie (modal in-app)
btnResetEntireGame?.addEventListener('click', () => {
  if (cbResetAllScores) cbResetAllScores.checked = false;
  if (modalResetGame) modalResetGame.style.display = 'flex';
});

btnConfirmResetAll?.addEventListener('click', () => {
  const resetScores = !!cbResetAllScores?.checked;
  if (modalResetGame) modalResetGame.style.display = 'none';
  window.soundEngine.init();
  window.soundEngine.playDawnChime();
  socket.emit('host_action', { action: 'RESET_ALL', payload: { resetScores } });
});

btnCancelModalReset?.addEventListener('click', () => {
  if (modalResetGame) modalResetGame.style.display = 'none';
});
btnCloseModalReset?.addEventListener('click', () => {
  if (modalResetGame) modalResetGame.style.display = 'none';
});

// 2. Nouvelle Manche (modal in-app)
btnNewRound?.addEventListener('click', () => {
  if (modalNewRound) modalNewRound.style.display = 'flex';
});

btnConfirmNewRoundAction?.addEventListener('click', () => {
  if (modalNewRound) modalNewRound.style.display = 'none';
  window.soundEngine.init();
  window.soundEngine.playDawnChime();
  socket.emit('host_action', { action: 'RESET_GAME_ROUND', payload: { restoreRooms: true } });
});

btnCancelModalNewRound?.addEventListener('click', () => {
  if (modalNewRound) modalNewRound.style.display = 'none';
});
btnCloseModalNewRound?.addEventListener('click', () => {
  if (modalNewRound) modalNewRound.style.display = 'none';
});

// 3. Effacer tout l'historique (modal in-app)
btnClearHistory?.addEventListener('click', () => {
  if (modalClearHistory) modalClearHistory.style.display = 'flex';
});

btnConfirmClearHistoryAction?.addEventListener('click', () => {
  if (modalClearHistory) modalClearHistory.style.display = 'none';
  window.soundEngine.playSelect();
  socket.emit('host_action', { action: 'CLEAR_HISTORY' });
  showHostToast("🗑️ Tout le palmarès et les scores ont été effacés.", "info");
});

btnCancelModalClearHistory?.addEventListener('click', () => {
  if (modalClearHistory) modalClearHistory.style.display = 'none';
});
btnCloseModalClearHistory?.addEventListener('click', () => {
  if (modalClearHistory) modalClearHistory.style.display = 'none';
});

// Suppression d'une partie spécifique de l'historique (modal in-app)
btnConfirmDelHistAction?.addEventListener('click', () => {
  if (pendingDeleteGameId) {
    socket.emit('host_action', {
      action: 'DELETE_GAME_RECORD',
      payload: { gameId: pendingDeleteGameId }
    });
    pendingDeleteGameId = null;
    showHostToast("✕ Partie supprimée de l'historique.", "info");
  }
  if (modalDeleteHistory) modalDeleteHistory.style.display = 'none';
});

btnCancelModalDelHist?.addEventListener('click', () => {
  pendingDeleteGameId = null;
  if (modalDeleteHistory) modalDeleteHistory.style.display = 'none';
});
btnCloseModalDelHist?.addEventListener('click', () => {
  pendingDeleteGameId = null;
  if (modalDeleteHistory) modalDeleteHistory.style.display = 'none';
});

// 4. Proclamation du vainqueur
function openProclaimModal(camp) {
  selectedProclaimCamp = camp;
  const night = currentGameState?.currentNight || 1;
  const maxN = currentGameState?.maxNights || 5;

  const campConfig = {
    village: {
      title: '🛡️ Victoire des Villageois !',
      bg: 'rgba(16, 185, 129, 0.2)',
      border: '#10b981',
      color: '#a7f3d0'
    },
    monsters: {
      title: '🐺 Victoire des Monstres !',
      bg: 'rgba(220, 38, 38, 0.25)',
      border: '#ef4444',
      color: '#fca5a5'
    },
    pyromane: {
      title: '💣 Victoire du Pyromane !',
      bg: 'rgba(245, 158, 11, 0.25)',
      border: '#f59e0b',
      color: '#fef08a'
    }
  };

  const cfg = campConfig[camp] || campConfig.village;
  proclaimCampBadgePreview.textContent = cfg.title;
  proclaimCampBadgePreview.style.background = cfg.bg;
  proclaimCampBadgePreview.style.borderColor = cfg.border;
  proclaimCampBadgePreview.style.color = cfg.color;

  proclaimModalNightInfo.textContent = `Nuit ${night} / ${maxN}`;

  // Pré-remplir avec la liste des survivants actuels
  const alivePlayers = (currentGameState?.players || []).filter(p => p.isAlive);
  if (alivePlayers.length > 0) {
    proclaimInputWinners.value = alivePlayers.map(p => p.name).join(', ');
  } else {
    proclaimInputWinners.value = '';
  }
  proclaimInputNote.value = '';

  modalProclaimDetails.style.display = 'flex';
}

btnProclaimVillage?.addEventListener('click', () => openProclaimModal('village'));
btnProclaimMonsters?.addEventListener('click', () => openProclaimModal('monsters'));
btnProclaimPyro?.addEventListener('click', () => openProclaimModal('pyromane'));

btnCloseProclaimModal?.addEventListener('click', () => {
  modalProclaimDetails.style.display = 'none';
});

btnCancelProclaim?.addEventListener('click', () => {
  modalProclaimDetails.style.display = 'none';
});

if (modalProclaimDetails) {
  modalProclaimDetails.addEventListener('click', (e) => {
    if (e.target === modalProclaimDetails) {
      modalProclaimDetails.style.display = 'none';
    }
  });
}

formProclaimWinner?.addEventListener('submit', (e) => {
  e.preventDefault();
  const winners = proclaimInputWinners.value.trim();
  const note = proclaimInputNote.value.trim();

  socket.emit('host_action', {
    action: 'DECLARE_WINNER',
    payload: {
      winnerCamp: selectedProclaimCamp,
      customWinners: winners || null,
      note
    }
  });

  modalProclaimDetails.style.display = 'none';
});

// 5. Célébration plein écran sur l'écran hôte
socket.on('game_won_event', (record) => {
  const camp = record.winnerCamp;
  const isVillage = camp === 'village';
  const isMonsters = camp === 'monsters';

  // Sonorisation immersive
  if (isVillage) {
    window.soundEngine.playVictoryFanfare();
  } else if (isMonsters) {
    window.soundEngine.playWolfHowl();
  } else {
    window.soundEngine.playExplosion();
  }

  if (celebrationOverlay) {
    celebrationIcon.textContent = isVillage ? '🏆' : (isMonsters ? '🐺' : '💣');
    celebrationTitle.className = `celebration-title ${camp}`;
    celebrationTitle.textContent = isVillage 
      ? 'VICTOIRE DES VILLAGEOIS !' 
      : (isMonsters ? 'VICTOIRE DES MONSTRES !' : 'CARNAGE DU PYROMANE !');
    
    celebrationSubtitle.textContent = `Partie #${record.gameNumber} remportée en Nuit ${record.nightEnded} ! ${record.note ? `— « ${record.note} »` : ''}`;

    celebrationSurvivorsList.innerHTML = '';
    if (record.customWinners) {
      const span = document.createElement('span');
      span.style.cssText = 'color: #fef08a; font-weight: 700; font-size: 1.15rem;';
      span.textContent = `🏆 ${record.customWinners}`;
      celebrationSurvivorsList.appendChild(span);
    } else if (record.survivors && record.survivors.length > 0) {
      record.survivors.forEach(s => {
        const chip = document.createElement('div');
        chip.className = 'history-survivor-chip';
        chip.style.cssText = 'font-size: 1rem; padding: 6px 14px; border-radius: 20px; background: rgba(255,255,255,0.12); border-color: var(--gold);';
        chip.innerHTML = `<span style="font-size: 1.3rem;">${s.avatar || '🕯️'}</span> <strong style="color: #fff;">${escapeHtml(s.name)}</strong>`;
        celebrationSurvivorsList.appendChild(chip);
      });
    } else {
      celebrationSurvivorsList.innerHTML = '<span style="color: #94a3b8; font-style: italic;">Aucun survivant</span>';
    }

    celebrationOverlay.style.display = 'flex';
  }
});

btnCloseCelebration?.addEventListener('click', () => {
  celebrationOverlay.style.display = 'none';
});

if (celebrationOverlay) {
  celebrationOverlay.addEventListener('click', (e) => {
    if (e.target === celebrationOverlay) {
      celebrationOverlay.style.display = 'none';
    }
  });
}

// ========================================================
// ⚰️ BILAN DES MORTS DE LA NUIT & RÉVÉLATION DU MATIN 🌅
// ========================================================

let nightDeathsSelections = new Map(); // playerId -> reason

function updateNightDeathsConfirmBtn() {
  if (!btnConfirmRevealDeaths) return;
  const count = nightDeathsSelections.size;
  if (count === 0) {
    btnConfirmRevealDeaths.innerHTML = '🌅 Lever du jour (0 mort)';
    btnConfirmRevealDeaths.className = 'btn-secondary';
    btnConfirmRevealDeaths.style.background = 'rgba(59, 130, 246, 0.25)';
    btnConfirmRevealDeaths.style.borderColor = '#3b82f6';
    btnConfirmRevealDeaths.style.color = '#93c5fd';
  } else {
    btnConfirmRevealDeaths.innerHTML = `🌅 Révéler les Morts (${count}) !`;
    btnConfirmRevealDeaths.className = 'btn-danger';
    btnConfirmRevealDeaths.style.background = '';
    btnConfirmRevealDeaths.style.borderColor = '';
    btnConfirmRevealDeaths.style.color = '';
  }
}

function openNightDeathsModal(targetedRoom = null) {
  if (!currentGameState) return;

  // Si une pièce cible a été passée (clic sur le loup 🐺 d'une salle), on ajoute ses occupants vivants
  if (targetedRoom) {
    const occupants = currentGameState.players.filter(p => p.isAlive && p.room === targetedRoom);
    occupants.forEach(p => nightDeathsSelections.set(p.id, 'monsters'));
  }

  const currentNight = currentGameState.currentNight || 1;
  if (nightDeathsModalNum) {
    nightDeathsModalNum.textContent = `Nuit ${currentNight}`;
  }

  const roomNames = {
    chambre: '🛏️ Chambre',
    cuisine: '🍲 Cuisine',
    salle_a_manger: '🕯️ Salle à Manger',
    salon: '🔥 Salon',
    grenier: '🕷️ Grenier'
  };

  renderNightDeathsPlayersList(roomNames);
  updateNightDeathsConfirmBtn();
  if (modalNightDeaths) modalNightDeaths.style.display = 'flex';
}

function renderNightDeathsPlayersList(roomNames) {
  if (!nightDeathsPlayersList || !currentGameState) return;
  nightDeathsPlayersList.innerHTML = '';

  const alivePlayers = currentGameState.players.filter(p => p.isAlive);

  // Nettoyer les sélections des joueurs qui ne sont plus vivants
  const aliveIds = new Set(alivePlayers.map(p => p.id));
  for (const pid of nightDeathsSelections.keys()) {
    if (!aliveIds.has(pid)) {
      nightDeathsSelections.delete(pid);
    }
  }

  if (alivePlayers.length === 0) {
    nightDeathsPlayersList.innerHTML = '<div style="color: #94a3b8; font-style: italic; text-align: center; padding: 12px;">Tous les joueurs sont déjà éliminés !</div>';
    return;
  }

  alivePlayers.forEach(p => {
    const isMarked = nightDeathsSelections.has(p.id);
    const currentReason = nightDeathsSelections.get(p.id) || 'monsters';
    const roomLabel = p.room ? (roomNames[p.room] || p.room) : '🚪 Couloirs';

    const row = document.createElement('div');
    row.className = `night-death-row ${isMarked ? 'is-marked' : ''}`;

    row.innerHTML = `
      <div class="night-death-player-info" style="display: flex; align-items: center; gap: 10px; min-width: 0; cursor: pointer;">
        <input type="checkbox" class="cb-death-mark" data-pid="${p.id}" ${isMarked ? 'checked' : ''} style="width: 22px; height: 22px; cursor: pointer; accent-color: #ef4444; flex-shrink: 0;">
        <span style="font-size: 1.3rem; flex-shrink: 0;">${p.avatar || '👻'}</span>
        <div style="min-width: 0;">
          <strong style="color: #fff; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${escapeHtml(p.name)}</strong>
          <span style="font-size: 0.72rem; color: var(--gold-light); display: block;">📍 ${escapeHtml(roomLabel)}</span>
        </div>
      </div>

      <div class="reason-pills">
        <button type="button" class="btn-reason-pill ${currentReason === 'monsters' ? 'active' : ''}" data-pid="${p.id}" data-reason="monsters" title="Attaque des Monstres">🐺 Monstres</button>
        <button type="button" class="btn-reason-pill ${currentReason === 'sorciere' ? 'active' : ''}" data-pid="${p.id}" data-reason="sorciere" title="Potion de la Sorcière">🧪 Sorcière</button>
        <button type="button" class="btn-reason-pill ${currentReason === 'chasseur' ? 'active' : ''}" data-pid="${p.id}" data-reason="chasseur" title="Tir du Chasseur">🏹 Chasseur</button>
        <button type="button" class="btn-reason-pill ${currentReason === 'vote' ? 'active' : ''}" data-pid="${p.id}" data-reason="vote" title="Condamné au Vote du Village">⚖️ Vote</button>
      </div>
    `;

    // Clic checkbox & ligne
    const cb = row.querySelector('.cb-death-mark');
    row.querySelector('.night-death-player-info')?.addEventListener('click', (e) => {
      if (e.target !== cb) {
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change'));
      }
    });

    cb?.addEventListener('change', () => {
      if (cb.checked) {
        nightDeathsSelections.set(p.id, currentReason);
        row.classList.add('is-marked');
      } else {
        nightDeathsSelections.delete(p.id);
        row.classList.remove('is-marked');
      }
      updateNightDeathsConfirmBtn();
    });

    // Clic pills raison
    row.querySelectorAll('.btn-reason-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const reason = pill.dataset.reason;
        nightDeathsSelections.set(p.id, reason);
        cb.checked = true;
        row.classList.add('is-marked');
        row.querySelectorAll('.btn-reason-pill').forEach(b => b.classList.toggle('active', b === pill));
        updateNightDeathsConfirmBtn();
      });
    });

    nightDeathsPlayersList.appendChild(row);
  });
}

// Bouton 'Tout décocher'
document.getElementById('btn-clear-night-deaths')?.addEventListener('click', () => {
  nightDeathsSelections.clear();
  const roomNames = {
    chambre: '🛏️ Chambre',
    cuisine: '🍲 Cuisine',
    salle_a_manger: '🕯️ Salle à Manger',
    salon: '🔥 Salon',
    grenier: '🕷️ Grenier'
  };
  renderNightDeathsPlayersList(roomNames);
  updateNightDeathsConfirmBtn();
});

// Ouvrir la modale depuis le header ou le bandeau
btnOpenNightDeathsModal?.addEventListener('click', () => openNightDeathsModal());
btnBannerRevealDeaths?.addEventListener('click', () => openNightDeathsModal());

btnCloseNightDeathsModal?.addEventListener('click', () => {
  if (modalNightDeaths) modalNightDeaths.style.display = 'none';
});

btnCancelNightDeaths?.addEventListener('click', () => {
  if (modalNightDeaths) modalNightDeaths.style.display = 'none';
});

if (modalNightDeaths) {
  modalNightDeaths.addEventListener('click', (e) => {
    if (e.target === modalNightDeaths) {
      modalNightDeaths.style.display = 'none';
    }
  });
}

// Confirmer et révéler les morts
btnConfirmRevealDeaths?.addEventListener('click', () => {
  const victims = [];
  nightDeathsSelections.forEach((reason, playerId) => {
    victims.push({ playerId, reason });
  });

  socket.emit('host_action', {
    action: 'REVEAL_NIGHT_DEATHS',
    payload: { victims }
  });

  nightDeathsSelections.clear();
  if (modalNightDeaths) modalNightDeaths.style.display = 'none';
});

// Événement reçu : Révélation des morts de la nuit au grand écran 🌅
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

    if (victims.length === 0) {
      morningVictimsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; color: #6ee7b7; font-size: 1.25rem; font-weight: 700; padding: 24px; background: rgba(16, 185, 129, 0.15); border: 2px dashed var(--emerald); border-radius: var(--radius-md);">
          ✨ Miracle dans le Manoir ! Aucun mort à déplorer cette nuit !
        </div>
      `;
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
  }
});

btnCloseMorningOverlay?.addEventListener('click', () => {
  if (morningDeathsOverlay) morningDeathsOverlay.style.display = 'none';
});

if (morningDeathsOverlay) {
  morningDeathsOverlay.addEventListener('click', (e) => {
    if (e.target === morningDeathsOverlay) {
      morningDeathsOverlay.style.display = 'none';
    }
  });
}

// ========================================================
// ⚖️ VOTE DU VILLAGE (DÉBATS DU JOUR)
// ========================================================
function openVillageVoteModal() {
  if (!currentGameState) return;
  const alivePlayers = currentGameState.players ? currentGameState.players.filter(p => p.isAlive) : [];

  if (votePlayersList) {
    votePlayersList.innerHTML = '';
    const roomNames = {
      chambre: '🛏️ Chambre',
      cuisine: '🍲 Cuisine',
      salle_a_manger: '🕯️ Salle à Manger',
      salon: '🔥 Salon',
      grenier: '🕷️ Grenier'
    };

    if (alivePlayers.length === 0) {
      votePlayersList.innerHTML = '<div style="color: #94a3b8; font-style: italic; text-align: center; padding: 12px;">Tous les joueurs sont déjà éliminés !</div>';
    } else {
      alivePlayers.forEach(p => {
        const roomLabel = p.room ? (roomNames[p.room] || p.room) : 'Couloirs';
        const card = document.createElement('label');
        card.style.cssText = `
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        `;

        card.innerHTML = `
          <input type="radio" name="village_vote_pick" value="${p.id}" style="width: 20px; height: 20px; accent-color: #ef4444; cursor: pointer;">
          <span style="font-size: 1.3rem;">${p.avatar || '👻'}</span>
          <div style="flex: 1; min-width: 0;">
            <strong style="color: #fff; font-size: 0.95rem; display: block;">${escapeHtml(p.name)}</strong>
            <span style="font-size: 0.74rem; color: var(--gold-light);">📍 Dormait dans : ${escapeHtml(roomLabel)}</span>
          </div>
          <span style="font-size: 0.72rem; color: #6ee7b7; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 8px; border-radius: 10px;">En vie</span>
        `;
        card.addEventListener('click', () => {
          document.querySelectorAll('#modal-village-vote label').forEach(l => {
            l.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            l.style.background = 'rgba(255, 255, 255, 0.05)';
          });
          card.style.borderColor = '#ef4444';
          card.style.background = 'rgba(239, 68, 68, 0.15)';
        });
        votePlayersList.appendChild(card);
      });
    }
  }

  if (voteInputNote) voteInputNote.value = '';
  if (modalVillageVote) modalVillageVote.style.display = 'flex';
}

function closeVillageVoteModal() {
  if (modalVillageVote) modalVillageVote.style.display = 'none';
}

btnOpenVoteModal?.addEventListener('click', openVillageVoteModal);
btnBannerVillageVote?.addEventListener('click', openVillageVoteModal);
btnCloseModalVote?.addEventListener('click', closeVillageVoteModal);
btnCancelModalVote?.addEventListener('click', closeVillageVoteModal);

if (modalVillageVote) {
  modalVillageVote.addEventListener('click', (e) => {
    if (e.target === modalVillageVote) closeVillageVoteModal();
  });
}

btnConfirmVillageVote?.addEventListener('click', () => {
  const selectedRadio = document.querySelector('input[name="village_vote_pick"]:checked');
  const selectedPid = selectedRadio ? selectedRadio.value : 'none';
  const note = (voteInputNote?.value || '').trim();

  if (selectedPid === 'none') {
    socket.emit('host_action', {
      action: 'VILLAGE_VOTE_ELIMINATE',
      payload: { playerId: null, note: note || 'Vote blanc ou égalité' }
    });
    showHostToast("⚖️ Vote blanc enregistré : aucun joueur éliminé.", "info");
    closeVillageVoteModal();
    return;
  }

  const targetPlayer = currentGameState?.players ? currentGameState.players.find(p => p.id === selectedPid) : null;
  const targetName = targetPlayer ? targetPlayer.name : 'Le joueur';

  socket.emit('host_action', {
    action: 'VILLAGE_VOTE_ELIMINATE',
    payload: { playerId: selectedPid, note }
  });

  window.soundEngine.playGong();
  showHostToast(`⚖️ <strong>${escapeHtml(targetName)}</strong> a été condamné par le vote du village ! 💀`, "danger");
  closeVillageVoteModal();
});

// ========================================================
// 👥 GESTION DU ROSTER DES PARTICIPANTS (LISTE COMPLÈTE)
// ========================================================
function openRosterModal() {
  if (modalPlayersRoster) {
    if (rosterSearchInput) rosterSearchInput.value = '';
    renderRosterList();
    modalPlayersRoster.style.display = 'flex';
  }
}

function renderRosterList() {
  if (!rosterPlayersList || !currentGameState) return;
  const players = currentGameState.players || [];
  if (rosterModalCount) rosterModalCount.textContent = players.length;

  const query = (rosterSearchInput?.value || '').toLowerCase().trim();
  const filtered = players.filter(p => !query || p.name.toLowerCase().includes(query));

  if (filtered.length === 0) {
    rosterPlayersList.innerHTML = `
      <div style="color: #94a3b8; font-style: italic; text-align: center; padding: 24px;">
        ${players.length === 0 ? 'Aucun participant dans la partie. Invitez des joueurs ou ajoutez-en manuellement !' : 'Aucun joueur ne correspond à la recherche.'}
      </div>
    `;
    return;
  }

  const roomNames = {
    chambre: '🛏️ Chambre',
    cuisine: '🍲 Cuisine',
    salle_a_manger: '🕯️ Salle à Manger',
    salon: '🔥 Salon',
    grenier: '🕷️ Grenier'
  };

  rosterPlayersList.innerHTML = '';
  filtered.forEach(p => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      gap: 12px;
    `;

    const roomLabel = p.room ? (roomNames[p.room] || p.room) : '🚪 Couloirs';
    const statusText = p.isAlive ? '🛡️ Vivant' : '💀 Éliminé';
    const statusColor = p.isAlive ? '#6ee7b7' : '#f87171';
    const phoneBadge = p.hasPhone
      ? '<span style="font-size: 0.7rem; color: #7dd3fc; background: rgba(56, 189, 248, 0.15); padding: 2px 6px; border-radius: 6px;">📱 Tél</span>'
      : '<span style="font-size: 0.7rem; color: var(--gold-light); background: rgba(245, 158, 11, 0.15); padding: 2px 6px; border-radius: 6px;">🕯️ Sans tél</span>';

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
        <span style="font-size: 1.6rem; flex-shrink: 0;">${p.avatar || '👻'}</span>
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <strong style="color: #fff; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(p.name)}</strong>
            ${phoneBadge}
          </div>
          <div style="font-size: 0.76rem; color: var(--text-muted); display: flex; gap: 10px; margin-top: 2px;">
            <span>📍 ${escapeHtml(roomLabel)}</span>
            <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 6px; flex-shrink: 0;">
        <button type="button" class="btn-secondary btn-roster-manage" style="padding: 6px 10px; font-size: 0.8rem;" title="Modifier le nom, la pièce ou le statut">
          ✏️ Gérer
        </button>
        <button type="button" class="btn-danger btn-roster-del" style="padding: 6px 10px; font-size: 0.8rem;" title="Retirer ce joueur">
          🗑️
        </button>
      </div>
    `;

    item.querySelector('.btn-roster-manage')?.addEventListener('click', () => {
      openMoveModal(p);
    });

    item.querySelector('.btn-roster-del')?.addEventListener('click', () => {
      openMoveModal(p);
      if (deletePlayerConfirmName) deletePlayerConfirmName.textContent = p.name;
      if (deletePlayerConfirmBox) deletePlayerConfirmBox.style.display = 'block';
    });

    rosterPlayersList.appendChild(item);
  });
}

btnOpenRosterModal?.addEventListener('click', openRosterModal);
btnCloseRoster?.addEventListener('click', () => {
  if (modalPlayersRoster) modalPlayersRoster.style.display = 'none';
});
btnRosterCloseBottom?.addEventListener('click', () => {
  if (modalPlayersRoster) modalPlayersRoster.style.display = 'none';
});
if (modalPlayersRoster) {
  modalPlayersRoster.addEventListener('click', (e) => {
    if (e.target === modalPlayersRoster) {
      modalPlayersRoster.style.display = 'none';
    }
  });
}
rosterSearchInput?.addEventListener('input', renderRosterList);
btnRosterAddManual?.addEventListener('click', () => {
  if (modalPlayersRoster) modalPlayersRoster.style.display = 'none';
  if (manualInputName) manualInputName.value = '';
  if (modalManualPlayer) modalManualPlayer.style.display = 'flex';
  manualInputName?.focus();
});

// ========================================================
// 📱 LOGIQUE DE L'INTERFACE MOBILE ADMIN (SMARTPHONE)
// ========================================================

function renderMobileView(state) {
  if (!state) return;

  // 1. En-tête mobile compact
  const mobileHdrNight = document.getElementById('mobile-hdr-night');
  const mobileHdrTimer = document.getElementById('mobile-hdr-timer');
  const mobileHdrAlive = document.getElementById('mobile-hdr-alive');
  const mobileHdrDead = document.getElementById('mobile-hdr-dead');
  const mobileTabRosterCount = document.getElementById('mobile-tab-roster-count');
  const mobilePlayersCount = document.getElementById('mobile-players-count');

  if (mobileHdrNight) mobileHdrNight.textContent = `🌙 N${state.currentNight || 1}`;
  if (mobileHdrTimer) {
    mobileHdrTimer.textContent = `⏳ ${state.timerRemaining}s`;
    mobileHdrTimer.classList.toggle('urgent', state.timerRemaining <= 10 && state.phase === 'COUNTDOWN');
  }
  if (mobileHdrAlive) mobileHdrAlive.textContent = state.aliveCount || 0;
  if (mobileHdrDead) mobileHdrDead.textContent = state.deadCount || 0;
  if (mobileTabRosterCount) mobileTabRosterCount.textContent = state.players ? state.players.length : 0;
  if (mobilePlayersCount) mobilePlayersCount.textContent = state.players ? state.players.length : 0;

  // 2. Barre d'action flottante (Sticky Footer)
  const mobileBtnMain = document.getElementById('mobile-btn-main-action');
  const mobileBtnTv = document.getElementById('mobile-btn-tv-toggle');
  const mobileBtnDeaths = document.getElementById('mobile-btn-quick-deaths');
  const mobileBtnRestart = document.getElementById('mobile-btn-quick-restart');

  if (mobileBtnMain) {
    if (state.phase === 'WAITING') {
      mobileBtnMain.innerHTML = '⏳ Lancer le décompte (60s)';
      mobileBtnMain.className = 'btn-primary mobile-thumb-main-btn';
    } else if (state.phase === 'COUNTDOWN') {
      mobileBtnMain.innerHTML = `⚡ Endormir le Manoir (${state.timerRemaining}s)`;
      mobileBtnMain.className = 'btn-secondary mobile-thumb-main-btn';
    } else if (state.phase === 'NIGHT_ASLEEP') {
      mobileBtnMain.innerHTML = '🌅 Le Jour se lève (Bilan Morts)';
      mobileBtnMain.className = 'btn-danger mobile-thumb-main-btn';
    } else if (state.phase === 'REVEALED') {
      mobileBtnMain.innerHTML = '🌙 Nuit suivante (Relancer 60s)';
      mobileBtnMain.className = 'btn-primary mobile-thumb-main-btn';
    }
  }

  if (mobileBtnTv) {
    const isNight = state.phase === 'NIGHT_ASLEEP';
    mobileBtnTv.style.display = isNight ? 'inline-flex' : 'none';
    if (isNight) {
      if (state.tvMapVisible) {
        mobileBtnTv.innerHTML = '📺 TV : 🙈 Masquer';
        mobileBtnTv.className = 'btn-secondary mobile-thumb-sub-btn';
      } else {
        mobileBtnTv.innerHTML = '📺 TV : 👁️ Dévoiler';
        mobileBtnTv.className = 'btn-primary mobile-thumb-sub-btn';
      }
    }
  }

  if (mobileBtnDeaths) {
    const canDoDeaths = state.phase === 'NIGHT_ASLEEP' || state.phase === 'REVEALED';
    mobileBtnDeaths.style.display = canDoDeaths ? 'inline-flex' : 'none';
  }

  if (mobileBtnRestart) {
    mobileBtnRestart.textContent = state.phase === 'COUNTDOWN' ? '🔄 60s' : '🔄 Relancer';
  }

  // 3. Cartes détaillées des salles sur mobile
  renderMobileRoomCards(state);

  // 4. Liste des joueurs dans l'onglet Joueurs si actif
  renderMobileRosterList();
}

function renderMobileRoomCards(state) {
  const container = document.getElementById('mobile-rooms-list');
  if (!container) return;

  const roomKeys = ['grenier', 'chambre', 'salon', 'cuisine', 'salle_a_manger'];
  const roomMeta = {
    grenier: { name: 'Le Grenier', icon: '🕷️' },
    chambre: { name: 'La Chambre', icon: '🛏️' },
    salon: { name: 'Le Salon', icon: '🔥' },
    cuisine: { name: 'La Cuisine', icon: '🍲' },
    salle_a_manger: { name: 'La Salle à Manger', icon: '🕯️' }
  };

  const isRevealed = state.phase === 'REVEALED';
  const isNightAsleep = state.phase === 'NIGHT_ASLEEP';
  const canSeeRooms = isRevealed || isNightAsleep;

  container.innerHTML = '';
  roomKeys.forEach(roomId => {
    const isDestroyed = (state.destroyedRooms || []).includes(roomId);
    const occupants = (state.players || []).filter(p => p.room === roomId && p.isAlive);
    const meta = roomMeta[roomId] || { name: roomId, icon: '🚪' };

    const card = document.createElement('div');
    card.className = `mobile-room-card ${isDestroyed ? 'is-destroyed' : ''}`;

    let badgeText = '';
    let badgeStyle = '';
    if (isDestroyed) {
      badgeText = '💥 Détruite';
      badgeStyle = 'background: #b91c1c; color: #fef08a; border: 1px solid #ef4444;';
    } else if (!canSeeRooms) {
      badgeText = '🔒 Portes closes';
      badgeStyle = 'background: rgba(245, 158, 11, 0.2); color: var(--gold-light); border: 1px solid var(--border-gold);';
    } else {
      badgeText = `${occupants.length} joueur${occupants.length > 1 ? 's' : ''}`;
      badgeStyle = occupants.length > 0
        ? 'background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid var(--emerald);'
        : 'background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1);';
    }

    card.innerHTML = `
      <div class="mobile-room-card-head">
        <div class="mobile-room-card-title">
          <span>${meta.icon}</span> ${meta.name}
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button type="button" class="btn-quick-pyro btn-m-pyro" data-room="${roomId}" title="Faire sauter / Restaurer">💣</button>
          <span style="font-size: 0.78rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; ${badgeStyle}">${badgeText}</span>
        </div>
      </div>
      <div class="mobile-room-occupants-list" id="m-occ-${roomId}"></div>
    `;

    const occList = card.querySelector(`#m-occ-${roomId}`);
    if (isDestroyed) {
      occList.innerHTML = '<span style="font-size: 0.78rem; color: #fca5a5; font-style: italic;">💥 Salle pulvérisée par le Pyromane</span>';
    } else if (!canSeeRooms) {
      occList.innerHTML = `<span style="font-size: 0.78rem; color: #cbd5e1; font-style: italic;">Portes closes — Décompte en cours (${state.timerRemaining}s)</span>`;
    } else if (occupants.length === 0) {
      occList.innerHTML = '<span class="empty-room-hint">Pièce vide pour le moment</span>';
    } else {
      occupants.forEach(p => {
        const chip = createPlayerChip(p);
        occList.appendChild(chip);
      });
    }

    // Bouton pyro sur la carte
    card.querySelector('.btn-m-pyro')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openPyroModal(roomId);
    });

    container.appendChild(card);
  });
}

function renderMobileRosterList(state = currentGameState) {
  const container = document.getElementById('mobile-roster-list');
  const sourceState = state || currentGameState;
  if (!container || !sourceState) return;

  const players = sourceState.players || [];
  const query = (document.getElementById('mobile-roster-search')?.value || '').toLowerCase().trim();
  const filtered = players.filter(p => !query || p.name.toLowerCase().includes(query));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="color: #94a3b8; font-style: italic; text-align: center; padding: 20px;">
        ${players.length === 0 ? 'Aucun participant. Invitez les joueurs ou ajoutez-les !' : 'Aucun joueur trouvé.'}
      </div>
    `;
    return;
  }

  const roomNames = {
    chambre: '🛏️ Chambre',
    cuisine: '🍲 Cuisine',
    salle_a_manger: '🕯️ Salle à Manger',
    salon: '🔥 Salon',
    grenier: '🕷️ Grenier'
  };

  container.innerHTML = '';
  filtered.forEach(p => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      gap: 10px;
    `;

    const roomLabel = p.room ? (roomNames[p.room] || p.room) : '🚪 Couloirs';
    const statusText = p.isAlive ? '🛡️ Vivant' : '💀 Éliminé';
    const statusColor = p.isAlive ? '#6ee7b7' : '#f87171';
    const phoneBadge = p.hasPhone
      ? '<span style="font-size: 0.68rem; color: #7dd3fc; background: rgba(56, 189, 248, 0.15); padding: 2px 5px; border-radius: 4px;">📱 Tél</span>'
      : '<span style="font-size: 0.68rem; color: var(--gold-light); background: rgba(245, 158, 11, 0.15); padding: 2px 5px; border-radius: 4px;">🕯️ Manuel</span>';

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
        <span style="font-size: 1.5rem; flex-shrink: 0;">${p.avatar || '👻'}</span>
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <strong style="color: #fff; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(p.name)}</strong>
            ${phoneBadge}
          </div>
          <div style="font-size: 0.74rem; color: var(--text-muted); display: flex; gap: 8px; margin-top: 2px;">
            <span>📍 ${escapeHtml(roomLabel)}</span>
            <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 6px; flex-shrink: 0;">
        <button type="button" class="btn-secondary btn-m-roster-manage" style="padding: 6px 10px; font-size: 0.8rem;">
          ✏️ Gérer
        </button>
      </div>
    `;

    item.querySelector('.btn-m-roster-manage')?.addEventListener('click', () => {
      openMoveModal(p);
    });

    container.appendChild(item);
  });
}

function initMobileAdmin() {
  const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
  const hostMapColumn = document.querySelector('.host-map-column');
  const winnersSidePanel = document.querySelector('.winners-side-panel');
  const mobilePlayersTabSection = document.getElementById('mobile-players-tab-section');
  const mobileToolsTabSection = document.getElementById('mobile-tools-tab-section');
  const hostBannerBox = document.getElementById('host-banner-box');

  let currentTab = 'map';
  let lastWindowWidth = window.innerWidth;

  function applyTab(tabKey, shouldScrollToTop = false) {
    const isTabChange = (currentTab !== tabKey);
    currentTab = tabKey;
    mobileTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    document.body.classList.remove('tab-map', 'tab-players', 'tab-winners', 'tab-tools');
    document.body.classList.add(`tab-${tabKey}`);

    if (window.innerWidth <= 900) {
      if (hostBannerBox) hostBannerBox.style.display = (tabKey === 'map') ? 'flex' : 'none';
      if (hostMapColumn) hostMapColumn.style.display = (tabKey === 'map') ? 'flex' : 'none';

      if (mobilePlayersTabSection) {
        const isPlayers = tabKey === 'players';
        mobilePlayersTabSection.classList.toggle('active', isPlayers);
        mobilePlayersTabSection.style.display = isPlayers ? 'block' : 'none';
      }
      if (winnersSidePanel) {
        winnersSidePanel.style.display = (tabKey === 'winners') ? 'flex' : 'none';
      }
      if (mobileToolsTabSection) {
        const isTools = tabKey === 'tools';
        mobileToolsTabSection.classList.toggle('active', isTools);
        mobileToolsTabSection.style.display = isTools ? 'block' : 'none';
      }

      // Remonter en haut UNIQUEMENT si l'utilisateur clique volontairement sur un onglet
      if (shouldScrollToTop) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }

      if (tabKey === 'players' && isTabChange) {
        renderMobileRosterList(currentGameState);
      }
    } else {
      if (hostBannerBox) hostBannerBox.style.display = 'flex';
      if (hostMapColumn) hostMapColumn.style.display = 'flex';
      if (winnersSidePanel) winnersSidePanel.style.display = 'flex';
      if (mobilePlayersTabSection) {
        mobilePlayersTabSection.classList.remove('active');
        mobilePlayersTabSection.style.display = 'none';
      }
      if (mobileToolsTabSection) {
        mobileToolsTabSection.classList.remove('active');
        mobileToolsTabSection.style.display = 'none';
      }
    }
  }

  mobileTabBtns.forEach(btn => {
    btn.addEventListener('click', () => applyTab(btn.dataset.tab, true));
  });

  // Sur smartphone, le scroll masque/affiche la barre d'adresse du navigateur, ce qui déclenche 'resize' (changement de hauteur).
  // On ne ré-applique les onglets QUE si la LARGEUR réelle de l'écran a changé (changement d'orientation ou redimensionnement PC).
  window.addEventListener('resize', () => {
    if (window.innerWidth !== lastWindowWidth) {
      lastWindowWidth = window.innerWidth;
      applyTab(currentTab, false);
    }
  });

  // Sticky bottom action buttons
  const mobileBtnMain = document.getElementById('mobile-btn-main-action');
  const mobileBtnTv = document.getElementById('mobile-btn-tv-toggle');
  const mobileBtnDeaths = document.getElementById('mobile-btn-quick-deaths');
  const mobileBtnRestart = document.getElementById('mobile-btn-quick-restart');

  mobileBtnMain?.addEventListener('click', (e) => {
    e.preventDefault();
    handleMainAction();
  });
  mobileBtnTv?.addEventListener('click', (e) => {
    e.preventDefault();
    btnToggleNightCurtain?.click();
  });
  mobileBtnDeaths?.addEventListener('click', (e) => {
    e.preventDefault();
    openNightDeathsModal();
  });
  mobileBtnRestart?.addEventListener('click', (e) => {
    e.preventDefault();
    openRestartNightModal();
  });
  document.getElementById('mobile-btn-quick-rules')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof window.openRulesModal === 'function') window.openRulesModal();
  });

  // Mobile tools buttons
  document.getElementById('btn-m-tool-rules')?.addEventListener('click', () => {
    if (typeof window.openRulesModal === 'function') window.openRulesModal();
  });
  document.getElementById('btn-m-tool-pyro')?.addEventListener('click', () => btnOpenPyroModal?.click());
  document.getElementById('btn-m-tool-deaths')?.addEventListener('click', () => openNightDeathsModal());
  document.getElementById('btn-m-tool-qr')?.addEventListener('click', () => {
    if (modalQr) modalQr.style.display = 'flex';
  });
  document.getElementById('btn-m-tool-manual')?.addEventListener('click', () => btnOpenManualModal?.click());
  document.getElementById('btn-m-tool-restart-night')?.addEventListener('click', () => btnRestartNight?.click());
  document.getElementById('btn-m-tool-new-round')?.addEventListener('click', () => {
    const modalNewRound = document.getElementById('modal-new-round');
    if (modalNewRound) modalNewRound.style.display = 'flex';
  });
  document.getElementById('btn-m-tool-reset-all')?.addEventListener('click', () => btnResetEntireGame?.click());
  document.getElementById('btn-m-tool-sound')?.addEventListener('click', () => {
    btnSoundToggle?.click();
    const icon = document.getElementById('m-tool-sound-icon');
    if (icon) icon.textContent = btnSoundToggle?.textContent || '🔊';
  });
  document.getElementById('btn-m-tool-fullscreen')?.addEventListener('click', () => btnFullscreen?.click());
  document.getElementById('btn-mobile-add-manual')?.addEventListener('click', () => btnOpenManualModal?.click());
  document.getElementById('mobile-roster-search')?.addEventListener('input', renderMobileRosterList);

  // Initial application of current tab
  applyTab('map');
}

// Initialiser le mode mobile
initMobileAdmin();

// ========================================================
// ========================================================
// 💬 MESSAGERIE SECRÈTE DES SPECTRES & MODÉRATION (HÔTE / RÉGIE)
// ========================================================
const modalHostSpectreChat = document.getElementById('modal-host-spectre-chat');
const btnOpenHostSpectreChat = document.getElementById('btn-open-host-spectre-chat');
const btnMToolSpectreChat = document.getElementById('btn-m-tool-spectre-chat');
const btnCloseHostSpectreChat = document.getElementById('btn-close-host-spectre-chat');
const hostSpectreChatMessages = document.getElementById('host-spectre-chat-messages');
const formHostSpectreChat = document.getElementById('form-host-spectre-chat');
const inputHostSpectreChat = document.getElementById('input-host-spectre-chat');
const hostSpectreBadge = document.getElementById('host-spectre-badge');
const mToolSpectreBadge = document.getElementById('m-tool-spectre-badge');
const btnHostWarnChat = document.getElementById('btn-host-warn-chat');
const btnHostClearChat = document.getElementById('btn-host-clear-chat');
const hostMutedPlayersBar = document.getElementById('host-muted-players-bar');
const hostMutedPlayersChips = document.getElementById('host-muted-players-chips');

let hostMutedPlayerIds = new Set();
let hostUnreadSpectreCount = 0;

function updateHostSpectreBadges(count) {
  hostUnreadSpectreCount = count;
  if (hostUnreadSpectreCount > 0) {
    if (hostSpectreBadge) {
      hostSpectreBadge.textContent = hostUnreadSpectreCount;
      hostSpectreBadge.style.display = 'inline-block';
    }
    if (mToolSpectreBadge) {
      mToolSpectreBadge.textContent = hostUnreadSpectreCount;
      mToolSpectreBadge.style.display = 'inline-block';
    }
  } else {
    if (hostSpectreBadge) hostSpectreBadge.style.display = 'none';
    if (mToolSpectreBadge) mToolSpectreBadge.style.display = 'none';
  }
}

function renderMutedPlayersBar() {
  if (!hostMutedPlayersBar || !hostMutedPlayersChips) return;
  if (!hostMutedPlayerIds || hostMutedPlayerIds.size === 0) {
    hostMutedPlayersBar.style.display = 'none';
    hostMutedPlayersChips.innerHTML = '';
    return;
  }

  hostMutedPlayersBar.style.display = 'flex';
  hostMutedPlayersChips.innerHTML = '';

  hostMutedPlayerIds.forEach(pid => {
    let playerName = pid;
    if (currentGameState?.players) {
      const p = currentGameState.players.find(pl => pl.id === pid);
      if (p) playerName = p.name;
    }
    const chip = document.createElement('span');
    chip.style.cssText = 'background: rgba(239, 68, 68, 0.3); border: 1px solid #ef4444; border-radius: 4px; padding: 2px 8px; font-weight: 700; color: #fff; display: inline-flex; align-items: center; gap: 6px;';
    chip.innerHTML = `
      <span>${escapeHtml(playerName)}</span>
      <button type="button" class="btn-icon" data-unmute-pid="${pid}" style="color: #6ee7b7; font-size: 0.8rem; padding: 0;" title="Rendre la parole (Démuter)">🔊</button>
    `;
    chip.querySelector('button')?.addEventListener('click', () => {
      socket.emit('host_unmute_spectre_player', { playerId: pid });
    });
    hostMutedPlayersChips.appendChild(chip);
  });
}

function appendHostSpectreMessage(msg) {
  if (!hostSpectreChatMessages) return;
  const empty = hostSpectreChatMessages.querySelector('.host-spectre-empty');
  if (empty) empty.remove();

  const isMuted = msg.fromId && hostMutedPlayerIds.has(msg.fromId);
  const bubble = document.createElement('div');
  bubble.setAttribute('data-msg-id', msg.id);
  bubble.className = `spectre-msg-bubble ${msg.isHost ? 'host' : ''} ${msg.isWarning ? 'warning' : ''}`;
  bubble.style.cssText = 'position: relative; padding: 10px 12px; background: rgba(22, 12, 34, 0.95); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: var(--radius-sm); margin-bottom: 6px;';

  if (msg.isWarning) {
    bubble.style.border = '1.5px solid var(--gold)';
    bubble.style.background = 'rgba(245, 158, 11, 0.2)';
  } else if (msg.isSystem) {
    bubble.style.border = '1px dashed #c084fc';
    bubble.style.background = 'rgba(147, 51, 234, 0.15)';
  }

  const canModerateUser = !msg.isHost && msg.fromId && msg.fromId !== 'system' && msg.fromId !== 'host';

  bubble.innerHTML = `
    <div class="spectre-msg-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
        <strong style="color: ${msg.isWarning ? 'var(--gold-light)' : (msg.isHost ? 'var(--gold-light)' : '#c084fc')}; font-size: 0.85rem;">
          ${msg.fromAvatar || '👻'} ${escapeHtml(msg.fromName)}
        </strong>
        ${isMuted ? '<span class="badge" style="background: rgba(239,68,68,0.3); border: 1px solid #ef4444; color: #fca5a5; font-size: 0.65rem; padding: 1px 4px;">MUTÉ</span>' : ''}
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="color: #94a3b8; font-size: 0.68rem;">${msg.time || ''}</span>
        <!-- Bouton Supprimer Message -->
        <button type="button" class="btn-host-del-msg btn-icon" data-msg-id="${msg.id}" style="color: #f87171; font-size: 0.85rem; padding: 2px 4px;" title="Supprimer ce message pour tout le monde">
          🗑️
        </button>
        ${canModerateUser ? `
          <button type="button" class="btn-host-toggle-mute btn-secondary" data-player-id="${msg.fromId}" style="font-size: 0.68rem; padding: 2px 6px; border-color: ${isMuted ? '#10b981' : '#ef4444'}; color: ${isMuted ? '#6ee7b7' : '#fca5a5'};" title="${isMuted ? 'Rendre la parole' : 'Réduire au silence'}">
            ${isMuted ? '🔊 Démuter' : '🔇 Muter'}
          </button>
        ` : ''}
      </div>
    </div>
    <div style="word-break: break-word; color: ${msg.isWarning ? '#fef08a' : '#fff'}; font-size: 0.88rem; line-height: 1.4;">
      ${escapeHtml(msg.text)}
    </div>
  `;

  // Écouteur suppression message
  bubble.querySelector('.btn-host-del-msg')?.addEventListener('click', () => {
    socket.emit('host_delete_spectre_message', { messageId: msg.id });
  });

  // Écouteur muter / démuter
  bubble.querySelector('.btn-host-toggle-mute')?.addEventListener('click', () => {
    if (hostMutedPlayerIds.has(msg.fromId)) {
      socket.emit('host_unmute_spectre_player', { playerId: msg.fromId });
    } else {
      if (confirm(`Voulez-vous réduire au silence ${msg.fromName} dans le salon des morts ?`)) {
        socket.emit('host_mute_spectre_player', { playerId: msg.fromId });
      }
    }
  });

  hostSpectreChatMessages.appendChild(bubble);
  hostSpectreChatMessages.scrollTop = hostSpectreChatMessages.scrollHeight;

  // Si modal fermée et message d'un joueur, incrémenter badge
  if (modalHostSpectreChat && modalHostSpectreChat.style.display !== 'flex' && !msg.isHost) {
    updateHostSpectreBadges(hostUnreadSpectreCount + 1);
  }
}

socket.on('spectre_new_message', (msg) => {
  appendHostSpectreMessage(msg);
});

socket.on('spectre_message_deleted', ({ messageId }) => {
  if (!hostSpectreChatMessages) return;
  const bubble = hostSpectreChatMessages.querySelector(`[data-msg-id="${messageId}"]`);
  if (bubble) {
    bubble.style.transition = 'opacity 0.25s, transform 0.25s';
    bubble.style.opacity = '0';
    bubble.style.transform = 'scale(0.95)';
    setTimeout(() => bubble.remove(), 250);
  }
});

socket.on('spectre_chat_cleared', () => {
  if (!hostSpectreChatMessages) return;
  hostSpectreChatMessages.innerHTML = `
    <div class="host-spectre-empty" style="text-align: center; color: #94a3b8; font-size: 0.85rem; font-style: italic; margin-top: auto; padding: 20px 0;">
      🧹 Le salon des spectres a été purgé par l'arbitre.
    </div>
  `;
});

socket.on('spectre_muted_status', ({ mutedPlayerIds }) => {
  hostMutedPlayerIds = new Set(mutedPlayerIds || []);
  renderMutedPlayersBar();
  // Mettre à jour l'état des boutons sur les bulles affichées
  if (hostSpectreChatMessages) {
    hostSpectreChatMessages.querySelectorAll('.btn-host-toggle-mute').forEach(btn => {
      const pid = btn.dataset.playerId;
      const isMuted = hostMutedPlayerIds.has(pid);
      btn.style.borderColor = isMuted ? '#10b981' : '#ef4444';
      btn.style.color = isMuted ? '#6ee7b7' : '#fca5a5';
      btn.textContent = isMuted ? '🔊 Démuter' : '🔇 Muter';
      btn.title = isMuted ? 'Rendre la parole' : 'Réduire au silence';
    });
  }
});

socket.on('spectre_chat_history', ({ messages, mutedPlayerIds }) => {
  if (mutedPlayerIds) {
    hostMutedPlayerIds = new Set(mutedPlayerIds);
    renderMutedPlayersBar();
  }
  if (!hostSpectreChatMessages) return;
  hostSpectreChatMessages.innerHTML = '';
  if (!messages || messages.length === 0) {
    hostSpectreChatMessages.innerHTML = `
      <div class="host-spectre-empty" style="text-align: center; color: #94a3b8; font-size: 0.85rem; font-style: italic; margin-top: auto; padding: 20px 0;">
        🕯️ Aucun message spectral pour le moment...
      </div>
    `;
  } else {
    messages.forEach(msg => appendHostSpectreMessage(msg));
  }
});

function openHostSpectreChatModal() {
  if (modalHostSpectreChat) modalHostSpectreChat.style.display = 'flex';
  updateHostSpectreBadges(0);
  socket.emit('spectre_join_chat');
  renderMutedPlayersBar();
}

btnOpenHostSpectreChat?.addEventListener('click', openHostSpectreChatModal);
btnMToolSpectreChat?.addEventListener('click', openHostSpectreChatModal);

btnCloseHostSpectreChat?.addEventListener('click', () => {
  if (modalHostSpectreChat) modalHostSpectreChat.style.display = 'none';
});

modalHostSpectreChat?.addEventListener('click', (e) => {
  if (e.target === modalHostSpectreChat) modalHostSpectreChat.style.display = 'none';
});

// Avertissement officiel
btnHostWarnChat?.addEventListener('click', () => {
  socket.emit('host_warn_spectre_chat', {});
});

// Purge complète du salon
btnHostClearChat?.addEventListener('click', () => {
  if (confirm('Voulez-vous vraiment effacer tous les messages du Salon des Morts ?')) {
    socket.emit('host_clear_spectre_chat');
  }
});

// Raccourcis de modération rapide
document.querySelectorAll('.host-quick-mod-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.dataset.msg;
    if (!text) return;
    socket.emit('spectre_send_message', { text });
  });
});

formHostSpectreChat?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!inputHostSpectreChat) return;
  const text = inputHostSpectreChat.value.trim();
  if (!text) return;
  socket.emit('spectre_send_message', { text });
  inputHostSpectreChat.value = '';
});

// Joindre la room spectres dès la connexion de l'hôte
socket.emit('spectre_join_chat');

// Reconnexion & rafraîchissement automatique à la sortie de veille
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (!socket.connected) socket.connect();
    socket.emit('get_state');
    socket.emit('spectre_join_chat');
  }
});
