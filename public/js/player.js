// Logique du Joueur Mobile avec Décompte d'une Minute, Verrouillage et Élimination 💀
const socket = io();

// État local
let myPlayerId = localStorage.getItem('manoir_player_id');
let myPlayerName = localStorage.getItem('manoir_player_name') || '';
let myPlayerAvatar = localStorage.getItem('manoir_player_avatar') || '👻';
let currentSelectedRoom = null;
let myAssignmentType = null;
let isLocked = false;
let isAlive = true;
let currentPhase = 'WAITING';
let latestGameState = null;
let hasJoined = false;

// Éléments DOM
const screenJoin = document.getElementById('screen-join');
const screenWaiting = document.getElementById('screen-waiting');
const screenCountdown = document.getElementById('screen-countdown');
const screenRevealed = document.getElementById('screen-revealed');
const screenDay = document.getElementById('screen-day');
const screenEliminated = document.getElementById('screen-eliminated');
const eliminatedReasonText = document.getElementById('eliminated-reason-text');
const dayRoomTitle = document.getElementById('day-room-title');
const btnDayShowMorningReport = document.getElementById('btn-day-show-morning-report');

const formJoin = document.getElementById('form-join');
const inputNickname = document.getElementById('input-nickname');
const avatarGrid = document.getElementById('avatar-grid');
const playerProfileBadge = document.getElementById('player-profile-badge');
const badgeAvatar = document.getElementById('badge-avatar');
const badgeName = document.getElementById('badge-name');
const waitingAvatar = document.getElementById('waiting-avatar');
const waitingName = document.getElementById('waiting-name');

const playerTimer = document.getElementById('player-timer');
const playerTimerBox = document.getElementById('player-timer-box');
const roomsListContainer = document.getElementById('rooms-list-container');
const btnLockRoom = document.getElementById('btn-lock-room');
const confirmedNotification = document.getElementById('confirmed-notification');
const revealedRoomTitle = document.getElementById('revealed-room-title');
const btnSoundToggle = document.getElementById('btn-sound-toggle');

// Éléments du Dashboard des Spectres 👻
const btnSpectreWhisper = document.getElementById('btn-spectre-whisper');
const spectreWhisperFeedback = document.getElementById('spectre-whisper-feedback');
const spectreEmojiGrid = document.getElementById('spectre-emoji-grid');
const spectreEmojiFeedback = document.getElementById('spectre-emoji-feedback');

let whisperCooldownTimer = null;

// Gestion du son
btnSoundToggle.addEventListener('click', () => {
  const isEnabled = window.soundEngine.toggle();
  btnSoundToggle.textContent = isEnabled ? '🔊' : '🔇';
});

// Choix avatar
avatarGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.avatar-option');
  if (!btn) return;
  document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  myPlayerAvatar = btn.dataset.avatar;
});

document.querySelectorAll('.avatar-option').forEach(btn => {
  btn.style.cssText = `
    background: rgba(255,255,255,0.08);
    border: 2px solid rgba(255,255,255,0.15);
    font-size: 1.5rem;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
  `;
});

const existingAvatarBtn = document.querySelector(`[data-avatar="${myPlayerAvatar}"]`);
if (existingAvatarBtn) {
  document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
  existingAvatarBtn.classList.add('selected');
}

// Fonction pour mettre à jour l'affichage du profil (seul l'animateur peut le modifier une fois entré)
function updateProfileDisplay(avatar, name) {
  if (badgeAvatar) badgeAvatar.textContent = avatar;
  if (badgeName) badgeName.textContent = name;
  if (waitingAvatar) waitingAvatar.textContent = avatar;
  if (waitingName) waitingName.textContent = name;
  if (playerProfileBadge) playerProfileBadge.style.display = 'inline-flex';
}

// Reconnexion automatique au chargement et lors de la connexion au serveur
if (myPlayerId && myPlayerName) {
  inputNickname.value = myPlayerName;
  joinManoir(myPlayerId, myPlayerName, myPlayerAvatar);
}

// Déverrouillage automatique du son sur iOS/Android au 1er geste
const unlockAudioOnGesture = () => {
  if (window.soundEngine) window.soundEngine.init();
  document.removeEventListener('touchstart', unlockAudioOnGesture);
  document.removeEventListener('click', unlockAudioOnGesture);
};
document.addEventListener('touchstart', unlockAudioOnGesture, { passive: true });
document.addEventListener('click', unlockAudioOnGesture, { passive: true });

// Gestion de l'anti-mise en veille (Wake Lock API) sur smartphone
let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator && !wakeLock && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (err) {
    // Non supporté ou ignoré par le navigateur
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

// Indicateur visuel discret de reconnexion réseau
function showConnectionStatus(online) {
  let indicator = document.getElementById('mobile-conn-status');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'mobile-conn-status';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      background: rgba(220, 38, 38, 0.95);
      border: 1px solid #f87171;
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 5px 14px;
      border-radius: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      gap: 6px;
      transition: all 0.3s ease;
    `;
    indicator.innerHTML = '<span>⚡</span><span>Reconnexion au Manoir...</span>';
    document.body.appendChild(indicator);
  }
  indicator.style.display = online ? 'none' : 'flex';
}

socket.on('disconnect', () => {
  showConnectionStatus(false);
});

socket.on('connect', () => {
  showConnectionStatus(true);
  if (myPlayerId && myPlayerName) {
    joinManoir(myPlayerId, myPlayerName, myPlayerAvatar);
  }
});

// Reprise instantanée à la sortie de veille du smartphone
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (currentPhase === 'COUNTDOWN') {
      requestWakeLock();
    }
    if (!socket.connected) {
      socket.connect();
    }
    if (myPlayerId && myPlayerName) {
      joinManoir(myPlayerId, myPlayerName, myPlayerAvatar);
      socket.emit('get_state');
    }
  } else {
    releaseWakeLock();
  }
});

formJoin.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = inputNickname.value.trim();
  if (!name) return;

  if (!myPlayerId) {
    myPlayerId = 'p_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('manoir_player_id', myPlayerId);
  }
  localStorage.setItem('manoir_player_name', name);
  localStorage.setItem('manoir_player_avatar', myPlayerAvatar);
  myPlayerName = name;

  joinManoir(myPlayerId, name, myPlayerAvatar);
});

function joinManoir(id, name, avatar) {
  window.soundEngine.init();
  window.soundEngine.playSelect();
  socket.emit('player_join', { id, name, avatar });
}

// Confirmation de connexion reçue du serveur
socket.on('joined_ack', ({ player, state }) => {
  hasJoined = true;
  myPlayerId = player.id;
  myPlayerName = player.name;
  myPlayerAvatar = player.avatar;
  localStorage.setItem('manoir_player_id', myPlayerId);
  localStorage.setItem('manoir_player_name', myPlayerName);
  localStorage.setItem('manoir_player_avatar', myPlayerAvatar);

  updateProfileDisplay(player.avatar, player.name);
  handleStateUpdate(state);
});

socket.on('state_updated', (state) => {
  handleStateUpdate(state);
});

// Décompte chaque seconde avec pulsation cardiaque sous tension
socket.on('timer_tick', ({ remaining, phase, timerPaused }) => {
  if (playerTimer) {
    if (timerPaused) {
      playerTimer.textContent = '⏸️ ' + remaining;
      playerTimerBox?.classList.add('paused');
    } else {
      playerTimer.textContent = remaining;
      playerTimerBox?.classList.remove('paused');
      if (remaining <= 10) {
        playerTimerBox?.classList.add('urgent');
        // Battement de cœur angoissant sous les 10 secondes
        window.soundEngine.playHeartbeat(1.2);
        window.soundEngine.playTick();
        if (navigator.vibrate) navigator.vibrate(40);
      } else {
        playerTimerBox?.classList.remove('urgent');
      }
    }
  }

  const spectreTimer = document.getElementById('spectre-countdown-timer');
  if (spectreTimer) {
    spectreTimer.textContent = `${remaining}s`;
  }
});

socket.on('timer_paused', ({ remaining }) => {
  if (playerTimer) {
    playerTimer.textContent = '⏸️ ' + remaining;
    playerTimerBox?.classList.add('paused');
  }
});

socket.on('timer_resumed', ({ remaining }) => {
  if (playerTimer) {
    playerTimer.textContent = remaining;
    playerTimerBox?.classList.remove('paused');
  }
});

// Fin du décompte
socket.on('countdown_finished', () => {
  window.soundEngine.playGong();
});

// Confirmation de verrouillage reçu du serveur
socket.on('room_locked_ack', ({ roomId, assignmentType }) => {
  isLocked = true;
  currentSelectedRoom = roomId;
  if (assignmentType) myAssignmentType = assignmentType;
  updateLockStatusView();
});

socket.on('spectre_cooldown', ({ waitSec }) => {
  if (spectreWhisperFeedback) {
    spectreWhisperFeedback.style.display = 'block';
    spectreWhisperFeedback.textContent = `⏳ Patientez ${waitSec}s avant votre prochain murmure...`;
  }
});

// Joueur renommé par l'animateur
socket.on('player_renamed', ({ playerId, name }) => {
  if (playerId === myPlayerId) {
    myPlayerName = name;
    localStorage.setItem('manoir_player_name', name);
    updateProfileDisplay(myPlayerAvatar, name);
  }
});

// Joueur retiré par l'animateur
socket.on('player_removed', ({ playerId }) => {
  if (playerId === myPlayerId) {
    hasJoined = false;
    localStorage.removeItem('manoir_player_id');
    localStorage.removeItem('manoir_player_name');
    myPlayerId = null;
    myPlayerName = '';
    isLocked = false;
    currentSelectedRoom = null;
    screenWaiting.style.display = 'none';
    screenCountdown.style.display = 'none';
    screenRevealed.style.display = 'none';
    if (screenDay) screenDay.style.display = 'none';
    screenEliminated.style.display = 'none';
    screenJoin.style.display = 'block';
    if (playerProfileBadge) playerProfileBadge.style.display = 'none';
    alert("Vous avez été retiré de la partie par l'animateur.");
  }
});

// Élimination lors du vote du village
socket.on('village_vote_eliminated', (data) => {
  if (data.player && data.player.id === myPlayerId) {
    window.soundEngine.playGong();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
  }
});

function handleStateUpdate(state) {
  const prevPhase = currentPhase;
  latestGameState = state;
  currentPhase = state.phase;

  // Réinitialiser la sélection locale si on démarre un nouveau décompte
  if (currentPhase === 'COUNTDOWN' && prevPhase !== 'COUNTDOWN') {
    currentSelectedRoom = null;
    isLocked = false;
    myAssignmentType = null;
  }

  // Vérifier si le joueur est enregistré sur le serveur
  const me = myPlayerId ? state.players.find(p => p.id === myPlayerId) : null;

  // CRITIQUE : Si le joueur n'a pas encore validé son pseudo ou n'est pas encore sur le serveur :
  // On AFFICHE l'écran d'entrée (screenJoin) pour qu'il choisisse son pseudo !
  if (!me || !hasJoined) {
    hasJoined = false;
    screenJoin.style.display = 'block';
    screenWaiting.style.display = 'none';
    screenCountdown.style.display = 'none';
    screenRevealed.style.display = 'none';
    if (screenDay) screenDay.style.display = 'none';
    screenEliminated.style.display = 'none';
    if (playerProfileBadge) playerProfileBadge.style.display = 'none';
    return;
  }

  // Joueur confirmé et présent sur le serveur
  hasJoined = true;
  updateProfileDisplay(me.avatar || myPlayerAvatar, me.name || myPlayerName);

  if (me) {
    if (me.room) {
      currentSelectedRoom = me.room;
    }
    isLocked = me.isLocked;
    if (me.assignmentType) {
      myAssignmentType = me.assignmentType;
    }
    
    // Si éliminé : le joueur est un Spectre et doit TOUJOURS rester sur l'écran Éliminé 💀
    if (!me.isAlive) {
      if (isAlive) {
        // Vient d'être éliminé
        window.soundEngine.playGong();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
      }
      isAlive = false;

      // S'assurer de rejoindre le salon de discussion secret des spectres
      socket.emit('spectre_join_chat');

      // Masquer tous les écrans vivants et afficher l'écran Éliminé 💀
      screenJoin.style.display = 'none';
      screenWaiting.style.display = 'none';
      screenCountdown.style.display = 'none';
      screenRevealed.style.display = 'none';
      if (screenDay) screenDay.style.display = 'none';
      screenEliminated.style.display = 'block';

      if (me.eliminatedReason === 'pyromane') {
        eliminatedReasonText.textContent = "💥 BOOM ! Le Pyromane a fait sauter la pièce où vous dormiez ! Vous avez été pulvérisé dans l'explosion... Vous êtes désormais un spectre 💀.";
      } else if (me.eliminatedReason === 'monsters') {
        eliminatedReasonText.textContent = "🐺 Les Monstres ont fondu sur votre cachette cette nuit... Votre âme rejoint les spectres 💀.";
      } else if (me.eliminatedReason === 'sorciere') {
        eliminatedReasonText.textContent = "🧪 La Sorcière a versé sa fiole mortelle dans votre chambre cette nuit... Votre âme rejoint les spectres 💀.";
      } else if (me.eliminatedReason === 'chasseur') {
        eliminatedReasonText.textContent = "🏹 Le Chasseur a décoché sa dernière flèche vengeresse dans votre direction... Votre âme rejoint les spectres 💀.";
      } else if (me.eliminatedReason === 'vote') {
        eliminatedReasonText.textContent = "⚖️ CONDAMNÉ PAR LE VILLAGE ! Le conseil a voté contre vous à l'issue des débats... Vos concitoyens vous ont éliminé ! Votre âme rejoint les spectres 💀.";
      } else {
        eliminatedReasonText.textContent = "Les ombres du Manoir ont réclamé votre âme... Vous rejoignez désormais le Cercle des Spectres 👻.";
      }
      renderSpectreDashboard(state);
      return;
    } else {
      isAlive = true;
    }
  }

  // Masquer les écrans pour les vivants
  screenJoin.style.display = 'none';
  screenWaiting.style.display = 'none';
  screenCountdown.style.display = 'none';
  screenRevealed.style.display = 'none';
  if (screenDay) screenDay.style.display = 'none';
  screenEliminated.style.display = 'none';

  if (currentPhase === 'WAITING') {
    releaseWakeLock();
    screenWaiting.style.display = 'block';
    isLocked = false;
    currentSelectedRoom = null;
    myAssignmentType = null;
  } else if (currentPhase === 'COUNTDOWN') {
    requestWakeLock();
    screenCountdown.style.display = 'block';
    if (playerTimer) playerTimer.textContent = state.timerRemaining;
    renderRooms(state.rooms);
    updateLockStatusView(state.rooms);
  } else if (currentPhase === 'NIGHT_ASLEEP') {
    // 🌙 NUIT NOIRE : Tout le monde dort, yeux fermés, téléphone posé !
    releaseWakeLock();
    screenRevealed.style.display = 'block';
    const revealedRoomSource = document.getElementById('revealed-room-source');
    if (currentSelectedRoom && state.rooms && state.rooms[currentSelectedRoom]) {
      const r = state.rooms[currentSelectedRoom];
      revealedRoomTitle.textContent = `${r.icon} ${r.name}`;

      if (revealedRoomSource) {
        if (myAssignmentType === 'chosen') {
          revealedRoomSource.style.display = 'block';
          revealedRoomSource.innerHTML = '<span style="color: #6ee7b7; font-weight: 600;">🔒 Cachette scellée par vos soins</span>';
        } else if (myAssignmentType === 'selected') {
          revealedRoomSource.style.display = 'block';
          revealedRoomSource.innerHTML = '<span style="color: #6ee7b7; font-weight: 600;">✓ Sélection prise en compte avant le gong</span>';
        } else if (myAssignmentType === 'previous') {
          revealedRoomSource.style.display = 'block';
          revealedRoomSource.innerHTML = '<span style="color: #fde047; font-weight: 600;">🔄 Même cachette que la nuit précédente (reconduite)</span>';
        } else if (myAssignmentType === 'random') {
          revealedRoomSource.style.display = 'block';
          revealedRoomSource.innerHTML = '<span style="color: #93c5fd; font-weight: 600;">🎲 Cachette attribuée au hasard par le Manoir</span>';
        } else {
          revealedRoomSource.style.display = 'none';
        }
      }
    } else {
      revealedRoomTitle.textContent = `Dans les couloirs obscurs...`;
      if (revealedRoomSource) revealedRoomSource.style.display = 'none';
    }
  } else if (currentPhase === 'REVEALED') {
    // ☀️ LE JOUR SE LÈVE : Tout le monde ouvre les yeux ! Débats & Conseil du Village
    releaseWakeLock();
    if (screenDay) {
      screenDay.style.display = 'block';
      if (dayRoomTitle) {
        if (currentSelectedRoom && state.rooms && state.rooms[currentSelectedRoom]) {
          const r = state.rooms[currentSelectedRoom];
          dayRoomTitle.textContent = `${r.icon} ${r.name}`;
        } else {
          dayRoomTitle.textContent = `🚪 Dans les couloirs`;
        }
      }
    }
  }
}

// Rendu des 5 pièces
function renderRooms(rooms) {
  if (!rooms) return;
  roomsListContainer.innerHTML = '';

  const destroyedRooms = latestGameState?.destroyedRooms || [];

  Object.values(rooms).forEach(room => {
    const isDestroyed = destroyedRooms.includes(room.id);
    const isSelected = currentSelectedRoom === room.id;
    const card = document.createElement('div');
    card.className = `room-card ${isSelected ? 'selected' : ''} ${isSelected && isLocked ? 'locked' : ''} ${isDestroyed ? 'is-destroyed' : ''}`;

    let statusIndicator = '';
    if (isDestroyed) {
      statusIndicator = '<span class="room-selection-indicator indicator-destroyed">💥 Détruite</span>';
    } else if (isSelected && isLocked) {
      statusIndicator = '<span class="room-selection-indicator indicator-locked">🔒 Scellé</span>';
    } else if (isSelected) {
      statusIndicator = '<span class="room-selection-indicator indicator-selected">✓ Sélectionné</span>';
    }

    card.innerHTML = `
      <div class="room-thumb-wrapper">
        <img src="${room.image}" alt="${room.name}" class="room-img" loading="lazy">
      </div>
      <div class="room-content">
        <div class="room-title-row">
          <div class="room-name">${room.icon} ${room.name}</div>
          ${statusIndicator}
        </div>
        <div class="room-flavor" style="${isDestroyed ? 'color: #f87171; font-weight: bold;' : ''}">
          ${isDestroyed ? '💥 Condamnée par le Pyromane' : room.floor}
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      if (isDestroyed) {
        alert('💥 Cette pièce a été pulvérisée par le Pyromane ! Elle est totalement condamnée et inaccessible.');
        return;
      }

      // RÈGLE : Une fois validé, plus possible de changer !
      if (isLocked) {
        alert('Votre cachette est déjà verrouillée et scellée pour cette nuit ! Impossible de changer.');
        return;
      }

      currentSelectedRoom = room.id;
      window.soundEngine.playSelect();
      if (navigator.vibrate) navigator.vibrate(30);

      // Informer immédiatement le serveur de la pièce touchée
      socket.emit('player_select_room', { roomId: room.id });

      renderRooms(rooms);
      updateLockStatusView(rooms);
    });

    roomsListContainer.appendChild(card);
  });
}

function updateLockStatusView(rooms) {
  if (isLocked && currentSelectedRoom) {
    btnLockRoom.disabled = true;
    btnLockRoom.textContent = '🔒 Cachette Scellée (Non Modifiable)';
    btnLockRoom.style.background = 'linear-gradient(135deg, #059669, #047857)';
    btnLockRoom.style.borderColor = '#10b981';

    const r = rooms ? rooms[currentSelectedRoom] : null;
    const rName = r ? `${r.icon} ${r.name}` : currentSelectedRoom;
    confirmedNotification.style.display = 'block';
    confirmedNotification.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.2); border: 2px solid var(--emerald); border-radius: var(--radius-md); padding: 12px 16px; text-align: center;">
        <div style="font-size: 1.15rem; font-weight: 700; color: #6ee7b7;">
          ✓ Tu es scellé dans : ${rName}
        </div>
        <div style="font-size: 0.85rem; color: #cbd5e1; margin-top: 4px;">
          Impossible de modifier. Révélation sur le grand écran à la fin des 60s !
        </div>
      </div>
    `;
  } else {
    confirmedNotification.style.display = 'none';

    if (!currentSelectedRoom) {
      btnLockRoom.disabled = true;
      btnLockRoom.textContent = '👆 Touche une pièce ci-dessus';
      btnLockRoom.style.background = '';
      btnLockRoom.style.borderColor = '';
    } else {
      btnLockRoom.disabled = false;
      btnLockRoom.textContent = '🔒 Valider ma cachette (Définitif)';
      btnLockRoom.style.background = 'linear-gradient(135deg, #d97706, #b45309)';
      btnLockRoom.style.borderColor = '#f59e0b';
    }
  }
}

// Clic validation définitive
btnLockRoom.addEventListener('click', () => {
  if (!currentSelectedRoom || isLocked) return;

  isLocked = true;
  window.soundEngine.playDoorLock();
  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);

  socket.emit('player_choose_room', { roomId: currentSelectedRoom });
  updateLockStatusView();
});

// Réception événement explosion Pyromane
socket.on('room_exploded', ({ roomId, roomName, victims }) => {
  // L'explosion reste secrète pendant la nuit sur smartphone : révélée au bilan du matin
  if (currentPhase === 'REVEALED') {
    window.soundEngine.playExplosion();
    if (navigator.vibrate) navigator.vibrate([150, 80, 250]);

    document.body.classList.add('exploding-screen');
    setTimeout(() => {
      document.body.classList.remove('exploding-screen');
    }, 750);
  }
});

// Réception événement fin de partie / Victoire proclamée 🏆
socket.on('game_won_event', (record) => {
  const isVillage = record.winnerCamp === 'village';
  const isMonsters = record.winnerCamp === 'monsters';
  if (isVillage) {
    window.soundEngine.playVictoryFanfare();
  } else if (isMonsters) {
    window.soundEngine.playWolfHowl();
  } else {
    window.soundEngine.playExplosion();
  }
  if (navigator.vibrate) navigator.vibrate([100, 100, 200, 100, 300]);

  let banner = document.getElementById('player-victory-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'player-victory-banner';
    banner.className = 'modal-overlay';
    document.body.appendChild(banner);
  }

  banner.innerHTML = `
    <div class="modal-content" style="text-align: center; border-color: var(--gold); box-shadow: 0 0 35px rgba(245, 158, 11, 0.5);">
      <div style="font-size: 3.5rem; margin-bottom: 8px;">${isVillage ? '🏆' : (isMonsters ? '🐺' : '💣')}</div>
      <h2 style="font-family: var(--font-gothic); font-size: 1.5rem; color: var(--gold-light); margin-bottom: 6px;">
        ${record.winnerTitle.toUpperCase()} !
      </h2>
      <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 16px;">
        La manche #${record.gameNumber} est terminée en Nuit ${record.nightEnded} !
      </p>
      ${record.customWinners ? `<div style="background: rgba(0,0,0,0.4); padding: 8px; border-radius: 6px; color: #fef08a; font-weight: bold; margin-bottom: 14px;">🏆 ${record.customWinners}</div>` : ''}
      <button class="btn-primary" style="width: 100%; padding: 12px;" onclick="document.getElementById('player-victory-banner').style.display='none'">
        D'accord !
      </button>
    </div>
  `;
  banner.style.display = 'flex';
});

// ========================================================
// 🌅 RÉVÉLATION DES MORTS DE LA NUIT SUR LE SMARTPHONE
// ========================================================
const modalMorningReport = document.getElementById('modal-morning-report');
const morningReportTitle = document.getElementById('morning-report-title');
const morningReportNight = document.getElementById('morning-report-night');
const morningPersonalStatus = document.getElementById('morning-personal-status');
const morningVictimsList = document.getElementById('morning-victims-list');
const morningSurvivorsBanner = document.getElementById('morning-survivors-banner');
const btnCloseMorningReport = document.getElementById('btn-close-morning-report');

socket.on('night_deaths_revealed', (data) => {
  const night = data.night || 1;
  const victims = data.victims || [];
  const myId = myPlayerId;
  const amIDead = victims.some(v => v.id === myId);

  // Audio & Haptic feedback
  if (amIDead) {
    window.soundEngine.playGong();
    if (navigator.vibrate) navigator.vibrate([150, 80, 200, 80, 400]);
  } else {
    window.soundEngine.playDawnChime();
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  }

  if (morningReportNight) {
    morningReportNight.textContent = `Bilan de la Nuit ${night}`;
  }

  // Statut personnel du joueur
  if (morningPersonalStatus) {
    const me = latestGameState?.players?.find(p => p.id === myId);
    const wasAlreadyDead = (me && !me.isAlive && !amIDead) || (!isAlive && !amIDead);

    if (amIDead) {
      const myVictimData = victims.find(v => v.id === myId);
      const reasonTxt = myVictimData?.reasonText || 'Ombres du Manoir 💀';
      morningPersonalStatus.innerHTML = `
        <div style="background: rgba(220, 38, 38, 0.25); border: 2px solid var(--crimson); border-radius: var(--radius-md); padding: 12px; animation: pulse-danger 1.5s infinite;">
          <div style="font-size: 1.3rem; font-weight: 800; color: #f87171;">💀 VOUS AVEZ ÉTÉ ÉLIMINÉ CETTE NUIT !</div>
          <div style="font-size: 0.88rem; color: #fca5a5; margin-top: 4px;">${escapeHtml(reasonTxt)}</div>
        </div>
      `;
    } else if (wasAlreadyDead) {
      morningPersonalStatus.innerHTML = `
        <div style="background: rgba(147, 51, 234, 0.2); border: 1.5px solid #c084fc; border-radius: var(--radius-md); padding: 12px;">
          <div style="font-size: 1.15rem; font-weight: 800; color: #e9d5ff;">👻 SPECTRE DE L'AU-DELÀ</div>
          <div style="font-size: 0.84rem; color: #cbd5e1; margin-top: 4px;">Vous observez les révélations du matin depuis le royaume des morts.</div>
        </div>
      `;
    } else {
      morningPersonalStatus.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.2); border: 2px solid var(--emerald); border-radius: var(--radius-md); padding: 12px;">
          <div style="font-size: 1.25rem; font-weight: 800; color: #6ee7b7;">🛡️ VOUS AVEZ SURVÉCU !</div>
          <div style="font-size: 0.88rem; color: #a7f3d0; margin-top: 4px;">Vous êtes toujours en vie pour continuer l'enquête.</div>
        </div>
      `;
    }
  }

  // Liste des victimes de cette nuit
  if (morningVictimsList) {
    if (victims.length === 0) {
      morningVictimsList.innerHTML = `
        <div style="color: #6ee7b7; font-size: 0.9rem; font-weight: 600; text-align: center; padding: 8px;">
          ✨ Nuit paisible ! Aucun joueur n'a péri cette nuit !
        </div>
      `;
    } else {
      morningVictimsList.innerHTML = '';
      victims.forEach(v => {
        const item = document.createElement('div');
        item.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.05);
          border-left: 3px solid var(--crimson);
          padding: 8px 10px;
          border-radius: 4px;
        `;
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.3rem;">${v.avatar || '💀'}</span>
            <div>
              <strong style="color: #fff; font-size: 0.95rem;">${escapeHtml(v.name)}</strong>
              ${v.roomName ? `<span style="font-size: 0.72rem; color: var(--gold-light); display: block;">📍 ${escapeHtml(v.roomName)}</span>` : ''}
            </div>
          </div>
          <span style="font-size: 0.75rem; color: #fca5a5; background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 10px;">
            ${escapeHtml(v.reasonText)}
          </span>
        `;
        morningVictimsList.appendChild(item);
      });
    }
  }

  if (morningSurvivorsBanner) {
    morningSurvivorsBanner.innerHTML = `Il reste <strong style="color: #6ee7b7;">${data.aliveCount}</strong> survivants en vie.`;
  }

  if (modalMorningReport) {
    modalMorningReport.style.display = 'flex';
  }
});

btnCloseMorningReport?.addEventListener('click', () => {
  if (modalMorningReport) modalMorningReport.style.display = 'none';
  if (latestGameState) {
    const me = latestGameState.players ? latestGameState.players.find(p => p.id === myPlayerId) : null;
    if (me && !me.isAlive) {
      isAlive = false;
      screenJoin.style.display = 'none';
      screenWaiting.style.display = 'none';
      screenCountdown.style.display = 'none';
      screenRevealed.style.display = 'none';
      if (screenDay) screenDay.style.display = 'none';
      screenEliminated.style.display = 'block';
      renderSpectreDashboard(latestGameState);
    } else {
      // Pour les survivants : afficher l'écran de jour !
      screenJoin.style.display = 'none';
      screenWaiting.style.display = 'none';
      screenCountdown.style.display = 'none';
      screenRevealed.style.display = 'none';
      if (screenDay) screenDay.style.display = 'block';
    }
  }
});

if (btnDayShowMorningReport) {
  btnDayShowMorningReport.addEventListener('click', () => {
    if (window.soundEngine?.init) window.soundEngine.init();
    if (window.soundEngine?.playSelect) window.soundEngine.playSelect();
    if (modalMorningReport) modalMorningReport.style.display = 'flex';
  });
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

// Réinitialisation de la partie
socket.on('game_reset_all', () => {
  currentSelectedRoom = null;
  isLocked = false;
  isAlive = true;
  if (modalMorningReport) modalMorningReport.style.display = 'none';
  const playerVictoryBanner = document.getElementById('player-victory-banner');
  if (playerVictoryBanner) playerVictoryBanner.style.display = 'none';
  window.soundEngine.playDawnChime();
});

// Recommencer la nuit
socket.on('night_restarted', () => {
  currentSelectedRoom = null;
  isLocked = false;
  if (modalMorningReport) modalMorningReport.style.display = 'none';
  const playerVictoryBanner = document.getElementById('player-victory-banner');
  if (playerVictoryBanner) playerVictoryBanner.style.display = 'none';
  window.soundEngine.playGong();
});

// ========================================================
// LOGIQUE DU DASHBOARD DES SPECTRES 👻 & MESSAGERIE DE L'AU-DELÀ
// ========================================================
const spectrePhaseBanner = document.getElementById('spectre-phase-banner');
const formSpectreChat = document.getElementById('form-spectre-chat');
const inputSpectreChat = document.getElementById('input-spectre-chat');
const spectreChatMessages = document.getElementById('spectre-chat-messages');
const spectreOnlineCount = document.getElementById('spectre-online-count');

function renderSpectreDashboard(state) {
  if (!state) return;
  const isNight = state.phase === 'COUNTDOWN' || state.phase === 'NIGHT_ASLEEP';
  const isDay = state.phase === 'REVEALED';

  // 1. Mise à jour du bandeau de phase pour le Spectre
  if (spectrePhaseBanner) {
    if (state.phase === 'COUNTDOWN') {
      spectrePhaseBanner.innerHTML = `
        <div style="background: rgba(245, 158, 11, 0.2); border: 1.5px solid var(--gold); border-radius: var(--radius-sm); padding: 10px 14px; text-align: left; color: #fef08a; font-size: 0.88rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: var(--gold-light);">⏳ Nuit ${state.currentNight || 1} — Choix des vivants</strong>
            <span id="spectre-countdown-timer" class="badge" style="background: rgba(245, 158, 11, 0.3); border: 1px solid var(--gold); color: #fff; font-size: 0.85rem; font-weight: 800; padding: 2px 8px;">
              ${state.timerRemaining || 60}s
            </span>
          </div>
          <span style="font-size: 0.82rem; color: #cbd5e1;">Les vivants choisissent leur chambre. En tant que Spectre, observez et discutez dans le salon secret !</span>
        </div>
      `;
    } else if (state.phase === 'NIGHT_ASLEEP') {
      spectrePhaseBanner.innerHTML = `
        <div style="background: rgba(147, 51, 234, 0.2); border: 1.5px solid #a855f7; border-radius: var(--radius-sm); padding: 10px 14px; text-align: left; color: #e9d5ff; font-size: 0.88rem;">
          <strong style="display: block; margin-bottom: 3px;">🌙 Nuit ${state.currentNight || 1} — Silence dans le Manoir</strong>
          <span style="font-size: 0.82rem; color: #cbd5e1;">Tout le monde dort. C'est le moment idéal pour comploter dans la messagerie des morts !</span>
        </div>
      `;
    } else if (state.phase === 'REVEALED') {
      spectrePhaseBanner.innerHTML = `
        <div style="background: rgba(234, 179, 8, 0.2); border: 1.5px solid #eab308; border-radius: var(--radius-sm); padding: 10px 14px; text-align: left; color: #fef08a; font-size: 0.88rem;">
          <strong style="display: block; margin-bottom: 3px;">☀️ Le Jour se Lève — Débats du Village</strong>
          <span style="font-size: 0.82rem; color: #cbd5e1;">Les vivants débattent. Comploter dans votre salon secret ou envoyez des emojis anonymes sur la TV !</span>
        </div>
      `;
    } else {
      spectrePhaseBanner.innerHTML = '';
    }
  }

  // 2. Compteur de Spectres
  if (spectreOnlineCount && state.players) {
    const deadPlayers = state.players.filter(p => !p.isAlive);
    spectreOnlineCount.textContent = `💀 ${deadPlayers.length} spectre${deadPlayers.length > 1 ? 's' : ''}`;
  }

  // 3. Initialiser les onglets et le grimoire du Spectre
  initSpectreTabs();
}

// ========================================================
// 💬 MESSAGERIE SECRÈTE DES SPECTRES (CHAT DES MORTS)
// ========================================================
let isCurrentPlayerMuted = false;

function updateMuteState(mutedPlayerIds) {
  if (!mutedPlayerIds) return;
  isCurrentPlayerMuted = mutedPlayerIds.includes(myPlayerId);
  const muteBanner = document.getElementById('spectre-muted-banner');
  const btnSubmit = formSpectreChat?.querySelector('button[type="submit"]');

  if (isCurrentPlayerMuted) {
    if (inputSpectreChat) {
      inputSpectreChat.disabled = true;
      inputSpectreChat.placeholder = "🔇 Vous avez été temporairement réduit au silence par l'arbitre.";
    }
    if (btnSubmit) btnSubmit.disabled = true;
    if (!muteBanner && formSpectreChat) {
      const banner = document.createElement('div');
      banner.id = 'spectre-muted-banner';
      banner.style.cssText = 'background: rgba(239, 68, 68, 0.2); border: 1.5px solid #ef4444; border-radius: var(--radius-sm); padding: 8px 12px; color: #fca5a5; font-size: 0.8rem; margin-top: 8px; text-align: center; font-weight: 600;';
      banner.innerHTML = '🔇 L\'arbitre vous a réduit au silence pour comportement inapproprié.';
      formSpectreChat.parentElement.appendChild(banner);
    }
  } else {
    if (inputSpectreChat) {
      inputSpectreChat.disabled = false;
      inputSpectreChat.placeholder = "Murmurer entre spectres...";
    }
    if (btnSubmit) btnSubmit.disabled = false;
    if (muteBanner) muteBanner.remove();
  }
}

function appendSpectreMessage(msg, isHistory = false) {
  if (!spectreChatMessages) return;

  const emptyHint = spectreChatMessages.querySelector('.spectre-chat-empty');
  if (emptyHint) emptyHint.remove();

  const isMine = msg.fromId === myPlayerId;
  const bubble = document.createElement('div');
  bubble.setAttribute('data-msg-id', msg.id);
  bubble.className = `spectre-msg-bubble ${isMine ? 'mine' : ''} ${msg.isHost ? 'host' : ''} ${msg.isWarning ? 'warning' : ''}`;

  if (msg.isWarning) {
    bubble.style.cssText = 'background: rgba(245, 158, 11, 0.2); border: 1.5px solid var(--gold); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 6px;';
  } else if (msg.isSystem) {
    bubble.style.cssText = 'background: rgba(147, 51, 234, 0.2); border: 1px solid #c084fc; border-radius: var(--radius-sm); padding: 8px 10px; margin-bottom: 6px; font-style: italic;';
  }

  bubble.innerHTML = `
    <div class="spectre-msg-header">
      <strong style="color: ${msg.isWarning ? 'var(--gold-light)' : (msg.isHost ? 'var(--gold-light)' : (isMine ? '#d8b4fe' : '#c084fc'))};">
        ${msg.fromAvatar || '👻'} ${escapeHtml(msg.fromName)} ${isMine ? '(Vous)' : ''}
      </strong>
      <span style="color: #94a3b8; font-size: 0.68rem;">${msg.time || ''}</span>
    </div>
    <div style="word-break: break-word; color: ${msg.isWarning ? '#fef08a' : '#fff'};">${escapeHtml(msg.text)}</div>
  `;

  spectreChatMessages.appendChild(bubble);
  spectreChatMessages.scrollTop = spectreChatMessages.scrollHeight;

  if (!isHistory && !isMine && window.soundEngine && window.soundEngine.playGhostWhisper) {
    window.soundEngine.playGhostWhisper();
  }
}

socket.on('spectre_new_message', (msg) => {
  appendSpectreMessage(msg);
});

socket.on('spectre_message_deleted', ({ messageId }) => {
  if (!spectreChatMessages) return;
  const bubble = spectreChatMessages.querySelector(`[data-msg-id="${messageId}"]`);
  if (bubble) {
    bubble.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    bubble.style.opacity = '0';
    bubble.style.transform = 'scale(0.95)';
    setTimeout(() => bubble.remove(), 300);
  }
});

socket.on('spectre_chat_cleared', () => {
  if (!spectreChatMessages) return;
  spectreChatMessages.innerHTML = `
    <div class="spectre-chat-empty" style="text-align: center; color: #94a3b8; font-size: 0.8rem; font-style: italic; margin-top: auto; padding: 12px 0;">
      🧹 Le salon des spectres a été réinitialisé par le Maître du Jeu.
    </div>
  `;
});

socket.on('spectre_muted_status', ({ mutedPlayerIds }) => {
  updateMuteState(mutedPlayerIds);
});

socket.on('spectre_error', ({ message }) => {
  if (typeof showFloatingToast === 'function') {
    showFloatingToast(message);
  } else {
    alert(message);
  }
});

socket.on('spectre_chat_history', ({ messages, mutedPlayerIds }) => {
  if (mutedPlayerIds) updateMuteState(mutedPlayerIds);
  if (!spectreChatMessages) return;
  spectreChatMessages.innerHTML = '';
  if (!messages || messages.length === 0) {
    spectreChatMessages.innerHTML = `
      <div class="spectre-chat-empty" style="text-align: center; color: #94a3b8; font-size: 0.8rem; font-style: italic; margin-top: auto; padding: 12px 0;">
        🕯️ Les âmes errantes chuchotent dans l'obscurité... Envoyez le premier murmure !
      </div>
    `;
  } else {
    messages.forEach(msg => appendSpectreMessage(msg, true));
  }
});

formSpectreChat?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!inputSpectreChat || isCurrentPlayerMuted) return;
  const text = inputSpectreChat.value.trim();
  if (!text) return;
  window.soundEngine.init();
  window.soundEngine.playTick();
  socket.emit('spectre_send_message', { text });
  inputSpectreChat.value = '';
});

document.querySelectorAll('.spectre-quick-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const msg = btn.dataset.msg;
    if (!msg) return;
    window.soundEngine.init();
    window.soundEngine.playTick();
    socket.emit('spectre_send_message', { text: msg });
  });
});

// Clics et interactions Spectres (Murmure & Salon des Spectres)
if (btnSpectreWhisper) {
  btnSpectreWhisper.addEventListener('click', () => {
    window.soundEngine.init();
    window.soundEngine.playGhostWhisper();
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);

    socket.emit('spectre_whisper');

    // Cooldown local de 15s
    btnSpectreWhisper.disabled = true;
    let secLeft = 15;
    btnSpectreWhisper.innerHTML = `<span>⏳ Frisson envoyé (${secLeft}s)...</span>`;
    if (spectreWhisperFeedback) {
      spectreWhisperFeedback.style.display = 'block';
      spectreWhisperFeedback.textContent = "🌬️ Un souffle anonyme a fait frémir la TV du Manoir !";
    }

    clearInterval(whisperCooldownTimer);
    whisperCooldownTimer = setInterval(() => {
      secLeft -= 1;
      if (secLeft <= 0) {
        clearInterval(whisperCooldownTimer);
        btnSpectreWhisper.disabled = false;
        btnSpectreWhisper.innerHTML = `<span>🌬️ Murmure mystérieux sur la TV</span>`;
      } else {
        btnSpectreWhisper.innerHTML = `<span>⏳ Recharge (${secLeft}s)...</span>`;
      }
    }, 1000);
  });
}

// Grille des emojis à projeter anonymement sur la TV 👻
if (spectreEmojiGrid) {
  let isEmojiOnCooldown = false;
  spectreEmojiGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.spectre-emoji-btn');
    if (!btn || isEmojiOnCooldown) return;

    const emoji = btn.dataset.emoji;
    if (!emoji) return;

    window.soundEngine.init();
    if (window.soundEngine.playSelect) window.soundEngine.playSelect();
    if (navigator.vibrate) navigator.vibrate(40);

    // Effet pop sur le bouton
    btn.classList.add('clicked');
    setTimeout(() => btn.classList.remove('clicked'), 350);

    // Envoi anonyme au serveur
    socket.emit('spectre_send_emoji', { emoji });

    // Feedback joueur
    if (spectreEmojiFeedback) {
      spectreEmojiFeedback.style.display = 'block';
      spectreEmojiFeedback.textContent = `✨ L'esprit ${emoji} flotte anonymement sur la TV !`;
      setTimeout(() => {
        if (spectreEmojiFeedback) spectreEmojiFeedback.style.display = 'none';
      }, 2400);
    }

    // Cooldown 1.2s pour éviter le spam
    isEmojiOnCooldown = true;
    spectreEmojiGrid.classList.add('cooldown');
    setTimeout(() => {
      isEmojiOnCooldown = false;
      spectreEmojiGrid.classList.remove('cooldown');
    }, 1200);
  });
}

// ========================================================
// 📖 NAVIGATION PAR ONGLETS & RÈGLES DES SPECTRES 👻
// ========================================================
let currentSpectreActiveTab = 'chat';
let isSpectreTabsInitialized = false;

function initSpectreTabs() {
  const navTabs = document.getElementById('spectre-nav-tabs');
  if (!navTabs) return;

  const tabButtons = navTabs.querySelectorAll('.spectre-tab-btn');
  const viewChat = document.getElementById('spectre-view-chat');
  const viewTv = document.getElementById('spectre-view-tv');
  const viewRules = document.getElementById('spectre-view-rules');

  function switchSpectreTab(tabName) {
    currentSpectreActiveTab = tabName;
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.spectreTab === tabName);
    });

    if (viewChat) viewChat.style.display = tabName === 'chat' ? 'block' : 'none';
    if (viewTv) viewTv.style.display = tabName === 'tv' ? 'block' : 'none';
    if (viewRules) viewRules.style.display = tabName === 'rules' ? 'block' : 'none';

    if (tabName === 'rules') {
      renderSpectreCardsList();
    }
  }

  if (!isSpectreTabsInitialized) {
    isSpectreTabsInitialized = true;

    // Écoute des clics sur les onglets principaux
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.soundEngine?.init) window.soundEngine.init();
        if (window.soundEngine?.playTick) window.soundEngine.playTick();
        switchSpectreTab(btn.dataset.spectreTab);
      });
    });

    // Écoute des clics sur les sous-onglets de lecture (Rôles / Règles / Ordre)
    const subtabButtons = document.querySelectorAll('.spectre-rules-subtab-btn');
    const subpaneRoles = document.getElementById('spectre-subpane-roles');
    const subpaneGame = document.getElementById('spectre-subpane-game');
    const subpaneOrder = document.getElementById('spectre-subpane-order');

    subtabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.soundEngine?.init) window.soundEngine.init();
        if (window.soundEngine?.playTick) window.soundEngine.playTick();
        const sub = btn.dataset.subtab;
        subtabButtons.forEach(b => b.classList.toggle('active', b === btn));
        if (subpaneRoles) subpaneRoles.style.display = sub === 'roles' ? 'block' : 'none';
        if (subpaneGame) subpaneGame.style.display = sub === 'game' ? 'block' : 'none';
        if (subpaneOrder) subpaneOrder.style.display = sub === 'order' ? 'block' : 'none';
      });
    });

    // Bouton pour ouvrir la modale plein écran des règles
    const btnOpenRulesModal = document.getElementById('btn-spectre-open-rules-modal');
    if (btnOpenRulesModal) {
      btnOpenRulesModal.addEventListener('click', () => {
        if (window.soundEngine?.init) window.soundEngine.init();
        if (window.soundEngine?.playSelect) window.soundEngine.playSelect();
        if (typeof window.openRulesModal === 'function') {
          window.openRulesModal();
        }
      });
    }
  }

  // S'assurer que la vue actuelle correspond à l'onglet sélectionné
  switchSpectreTab(currentSpectreActiveTab);
}

function renderSpectreCardsList() {
  const container = document.getElementById('spectre-cards-list-container');
  if (!container) return;

  const cards = window.MANOIR_CARDS_DATA || [];
  if (!cards || cards.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.82rem; padding: 12px;">Chargement des cartes du Manoir...</div>`;
    return;
  }

  // Si déjà généré, ne pas reconstruire pour préserver l'état de dépliement
  if (container.children.length >= cards.length) return;

  container.innerHTML = '';
  cards.forEach((card, index) => {
    const item = document.createElement('div');
    item.className = 'spectre-card-item';

    let campBadgeStyle = 'background: rgba(100, 116, 139, 0.3); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.2);';
    if (card.camp === 'monstres') {
      campBadgeStyle = 'background: rgba(220, 38, 38, 0.3); color: #fca5a5; border: 1px solid #ef4444;';
    } else if (card.camp === 'village') {
      campBadgeStyle = 'background: rgba(16, 185, 129, 0.25); color: #6ee7b7; border: 1px solid #10b981;';
    } else if (card.camp === 'neutre') {
      campBadgeStyle = 'background: rgba(245, 158, 11, 0.25); color: #fef08a; border: 1px solid #f59e0b;';
    } else if (card.camp === 'spectre') {
      campBadgeStyle = 'background: rgba(168, 85, 247, 0.3); color: #e9d5ff; border: 1px solid #a855f7;';
    }

    item.innerHTML = `
      <div class="spectre-card-item-header">
        <div class="spectre-card-item-title">
          <span style="font-size: 1.35rem;">${card.avatar || '🃏'}</span>
          <div>
            <div style="color: #fff; font-weight: 700; font-size: 0.92rem;">${escapeHtml(card.name)}</div>
            <span style="font-size: 0.7rem; color: var(--gold-light);">${escapeHtml(card.count || '')}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="badge" style="${campBadgeStyle} font-size: 0.7rem; padding: 2px 7px;">${escapeHtml(card.campLabel || card.camp)}</span>
          <span class="spectre-card-chevron" style="color: var(--text-muted); font-size: 0.85rem; transition: transform 0.2s ease;">▼</span>
        </div>
      </div>
      <div class="spectre-card-item-power" style="font-size: 0.82rem; color: #e2e8f0; margin-top: 6px; line-height: 1.4;">
        ${escapeHtml(card.power || '')}
      </div>
      <div class="spectre-card-item-details" style="display: none;">
        ${card.tip ? `<div style="color: #fef08a; font-style: italic; margin-bottom: 6px; font-size: 0.78rem;">💡 Conseil : ${escapeHtml(card.tip)}</div>` : ''}
        ${card.rulesDetail ? `<div style="color: #cbd5e1; font-size: 0.78rem;">📜 Règle : ${escapeHtml(card.rulesDetail)}</div>` : ''}
        ${card.image ? `
          <button type="button" class="btn-secondary btn-view-full-card" style="margin-top: 8px; width: 100%; font-size: 0.76rem; padding: 6px; border-color: rgba(255,255,255,0.2);">
            🖼️ Voir la carte illustrée
          </button>
        ` : ''}
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-view-full-card')) {
        if (typeof window.openCardViewer === 'function') {
          window.openCardViewer(index);
        }
        return;
      }
      const details = item.querySelector('.spectre-card-item-details');
      const chevron = item.querySelector('.spectre-card-chevron');
      if (!details) return;
      const isExpanded = details.style.display === 'block';
      details.style.display = isExpanded ? 'none' : 'block';
      item.classList.toggle('expanded', !isExpanded);
      if (chevron) {
        chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });

    container.appendChild(item);
  });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  initSpectreTabs();
});


