const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const SESSION_FILE_PATH = path.join(__dirname, 'session_state.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/Images', express.static(path.join(__dirname, 'Images')));
app.use('/images', express.static(path.join(__dirname, 'Images')));
app.use('/Image', express.static(path.join(__dirname, 'Images')));
app.use('/image', express.static(path.join(__dirname, 'Images')));
app.use(express.json());

// Détection de l'adresse IP locale pour le QR code
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let fallbackIp = 'localhost';

  // 1. Chercher d'abord sur une interface physique (Wi-Fi, Ethernet, LAN) en évitant les adaptateurs virtuels (VMware, VirtualBox, WSL, Hyper-V, etc.)
  for (const name of Object.keys(interfaces)) {
    const isVirtual = /virtual|vmware|vbox|hyper-v|wsl|vethernet|docker|tailscale|zerotier/i.test(name);
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (!isVirtual) {
          return iface.address;
        } else if (fallbackIp === 'localhost') {
          fallbackIp = iface.address;
        }
      }
    }
  }
  return fallbackIp;
}

// Les 5 salles du Manoir Piégé
const ROOMS = {
  grenier: {
    id: 'grenier',
    name: 'Le Grenier',
    icon: '🕷️',
    image: '/assets/rooms/grenier.jpg',
    color: '#8d99ae',
    floor: 'Étage sous les toits'
  },
  chambre: {
    id: 'chambre',
    name: 'La Chambre',
    icon: '🛏️',
    image: '/assets/rooms/chambre.jpg',
    color: '#9d4edd',
    floor: 'Premier étage'
  },
  salon: {
    id: 'salon',
    name: 'Le Salon',
    icon: '🔥',
    image: '/assets/rooms/salon.jpg',
    color: '#f59e0b',
    floor: 'Premier étage'
  },
  cuisine: {
    id: 'cuisine',
    name: 'La Cuisine',
    icon: '🍲',
    image: '/assets/rooms/cuisine.jpg',
    color: '#10b981',
    floor: 'Rez-de-chaussée'
  },
  salle_a_manger: {
    id: 'salle_a_manger',
    name: 'La Salle à Manger',
    icon: '🕯️',
    image: '/assets/rooms/salle_a_manger.jpg',
    color: '#3b82f6',
    floor: 'Rez-de-chaussée'
  }
};

// État global du jeu
const gameState = {
  phase: 'WAITING', // 'WAITING', 'COUNTDOWN', 'REVEALED', 'NIGHT_ASLEEP'
  timerDuration: 60,
  timerRemaining: 60,
  timerInterval: null,
  timerPaused: false,
  destroyedRooms: new Set(), // Set des pièces détruites par le Pyromane
  players: new Map(), // id -> { id, name, avatar, room, isLocked, isAlive, hasPhone, eliminatedReason, connected }
  currentNight: 1,
  maxNights: 5,
  scores: {
    village: 0,
    monsters: 0,
    pyromane: 0
  },
  gameHistory: [],
  currentNightEliminations: new Set(),
  nightExplodedRooms: new Set(),
  lastRevealedDeaths: [],
  tvMapVisible: false,
  tvRulesVisible: false,
  tvRulesCardIndex: 0,
  tvRulesTab: 'roles',
  // 👻 Fonctionnalités Spectres
  spectreLastWhisper: new Map(), // playerId -> timestamp
  spectreLastEmoji: new Map(), // playerId -> timestamp
  spectreChatMessages: [], // { id, fromId, fromName, fromAvatar, text, time, isHost }
  spectreMutedPlayers: new Set() // Set of playerIds muted by Host
};

// Fonctions utilitaires pour le choix des pièces
function getAvailableIntactRooms() {
  const roomKeys = Object.keys(ROOMS);
  const available = roomKeys.filter(rId => !gameState.destroyedRooms.has(rId));
  return available.length > 0 ? available : roomKeys;
}

function getRandomAvailableRoom() {
  const available = getAvailableIntactRooms();
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

function getPublicState(forPlayerId = null) {
  const isRevealed = gameState.phase === 'REVEALED';
  const isNightAsleep = gameState.phase === 'NIGHT_ASLEEP';
  const canSeeRooms = isRevealed || isNightAsleep;

  const playerList = Array.from(gameState.players.values()).map(p => {
    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      // La pièce est visible pour l'hôte dès la nuit fermée, et révélée publiquement le jour
      room: (canSeeRooms || forPlayerId === p.id) ? p.room : null,
      assignmentType: p.assignmentType || null,
      isLocked: p.isLocked,
      isAlive: p.isAlive,
      hasPhone: p.hasPhone,
      eliminatedReason: p.eliminatedReason,
      connected: p.connected
    };
  });

  const roomCounts = {
    grenier: 0,
    chambre: 0,
    salon: 0,
    cuisine: 0,
    salle_a_manger: 0,
    unassigned: 0
  };

  let lockedAliveCount = 0;
  let aliveCount = 0;
  let deadCount = 0;

  for (const p of gameState.players.values()) {
    if (p.isAlive) {
      aliveCount++;
      if (p.isLocked) lockedAliveCount++;
      if (canSeeRooms) {
        if (p.room && roomCounts[p.room] !== undefined) {
          roomCounts[p.room]++;
        } else {
          roomCounts.unassigned++;
        }
      }
    } else {
      deadCount++;
    }
  }

  return {
    phase: gameState.phase,
    timerRemaining: gameState.timerRemaining,
    timerDuration: gameState.timerDuration,
    timerPaused: !!gameState.timerPaused,
    players: playerList,
    rooms: ROOMS,
    destroyedRooms: Array.from(gameState.destroyedRooms),
    nightExplodedRooms: Array.from(gameState.nightExplodedRooms),
    pendingNightEliminations: Array.from(gameState.currentNightEliminations),
    roomCounts: isRevealed ? roomCounts : null,
    totalPlayers: gameState.players.size,
    aliveCount,
    deadCount,
    lockedCount: lockedAliveCount,
    currentNight: gameState.currentNight,
    maxNights: gameState.maxNights,
    scores: gameState.scores,
    gameHistory: gameState.gameHistory,
    lastRevealedDeaths: gameState.lastRevealedDeaths,
    pendingNightDeathsCount: gameState.currentNightEliminations.size,
    tvMapVisible: gameState.tvMapVisible,
    tvRulesVisible: !!gameState.tvRulesVisible,
    tvRulesCardIndex: gameState.tvRulesCardIndex || 0,
    tvRulesTab: gameState.tvRulesTab || 'roles'
  };
}

// ========================================================
// 🛡️ CRASH RECOVERY : SAUVEGARDE & RESTAURATION EN TEMPS RÉEL
// ========================================================
let saveSessionTimeout = null;

function scheduleSaveSessionState() {
  if (saveSessionTimeout) clearTimeout(saveSessionTimeout);
  saveSessionTimeout = setTimeout(async () => {
    try {
      const data = serializeGameState();
      await fs.promises.writeFile(SESSION_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('⚠️ Erreur lors de l\'auto-sauvegarde de session:', err.message);
    }
  }, 350);
}

function serializeGameState() {
  const playersArray = [];
  for (const p of gameState.players.values()) {
    playersArray.push({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      room: p.room || null,
      previousRoom: p.previousRoom || null,
      selectedRoom: p.selectedRoom || null,
      isLocked: !!p.isLocked,
      isAlive: p.isAlive !== false,
      hasPhone: p.hasPhone !== false,
      eliminatedReason: p.eliminatedReason || null,
      assignmentType: p.assignmentType || null,
      connected: false
    });
  }

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    phase: gameState.phase,
    currentNight: gameState.currentNight,
    maxNights: gameState.maxNights || 5,
    timerRemaining: gameState.timerRemaining,
    timerDuration: gameState.timerDuration,
    timerPaused: !!gameState.timerPaused,
    destroyedRooms: Array.from(gameState.destroyedRooms || []),
    nightExplodedRooms: Array.from(gameState.nightExplodedRooms || []),
    currentNightEliminations: Array.from(gameState.currentNightEliminations || []),
    lastRevealedDeaths: gameState.lastRevealedDeaths || [],
    scores: gameState.scores,
    gameHistory: gameState.gameHistory || [],
    tvMapVisible: !!gameState.tvMapVisible,
    players: playersArray,
    spectreChatMessages: (gameState.spectreChatMessages || []).slice(-100),
    spectreMutedPlayers: Array.from(gameState.spectreMutedPlayers || [])
  };
}

function loadSessionState() {
  if (!fs.existsSync(SESSION_FILE_PATH)) {
    return false;
  }
  try {
    const raw = fs.readFileSync(SESSION_FILE_PATH, 'utf8');
    if (!raw || raw.trim().length === 0) return false;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return false;

    if (typeof data.currentNight === 'number') gameState.currentNight = data.currentNight;
    if (typeof data.maxNights === 'number') gameState.maxNights = data.maxNights;
    if (data.scores) gameState.scores = { ...gameState.scores, ...data.scores };
    if (Array.isArray(data.gameHistory)) gameState.gameHistory = data.gameHistory;
    if (Array.isArray(data.destroyedRooms)) gameState.destroyedRooms = new Set(data.destroyedRooms);
    if (Array.isArray(data.nightExplodedRooms)) gameState.nightExplodedRooms = new Set(data.nightExplodedRooms);
    if (Array.isArray(data.currentNightEliminations)) gameState.currentNightEliminations = new Set(data.currentNightEliminations);
    if (Array.isArray(data.lastRevealedDeaths)) gameState.lastRevealedDeaths = data.lastRevealedDeaths;
    if (Array.isArray(data.spectreChatMessages)) gameState.spectreChatMessages = data.spectreChatMessages;
    if (Array.isArray(data.spectreMutedPlayers)) gameState.spectreMutedPlayers = new Set(data.spectreMutedPlayers);
    if (typeof data.tvMapVisible === 'boolean') gameState.tvMapVisible = data.tvMapVisible;

    // Si on était en cours de décompte lors du crash, on restaure en mode pause sécurisée
    if (data.phase === 'COUNTDOWN') {
      gameState.phase = 'COUNTDOWN';
      gameState.timerRemaining = typeof data.timerRemaining === 'number' ? data.timerRemaining : 60;
      gameState.timerDuration = typeof data.timerDuration === 'number' ? data.timerDuration : 60;
      gameState.timerPaused = true;
    } else if (data.phase) {
      gameState.phase = data.phase;
      gameState.timerRemaining = typeof data.timerRemaining === 'number' ? data.timerRemaining : 60;
    }

    // Restaurer les joueurs
    gameState.players.clear();
    if (Array.isArray(data.players)) {
      for (const p of data.players) {
        gameState.players.set(p.id, {
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          room: p.room || null,
          previousRoom: p.previousRoom || null,
          selectedRoom: p.selectedRoom || null,
          isLocked: !!p.isLocked,
          isAlive: p.isAlive !== false,
          hasPhone: p.hasPhone !== false,
          eliminatedReason: p.eliminatedReason || null,
          assignmentType: p.assignmentType || null,
          connected: false
        });
      }
    }

    console.log(`🛡️ CRASH RECOVERY : Session précédente restaurée avec succès (Nuit ${gameState.currentNight}, ${gameState.players.size} joueurs, Phase ${gameState.phase}) !`);
    return true;
  } catch (err) {
    console.warn('⚠️ Impossible de lire session_state.json, démarrage d\'une session neuve:', err.message);
    return false;
  }
}

function broadcastState() {
  io.emit('state_updated', getPublicState());
  scheduleSaveSessionState();
}

function startCountdown(duration = 60) {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }

  // Sauvegarder la pièce de la nuit passée pour chaque joueur vivant
  for (const p of gameState.players.values()) {
    if (p.isAlive) {
      if (p.room) {
        p.previousRoom = p.room;
      }
      if (p.hasPhone) {
        p.room = null;
        p.selectedRoom = null;
        p.assignmentType = null;
        p.isLocked = false;
      } else {
        p.isLocked = !!p.room;
      }
    }
  }

  gameState.phase = 'COUNTDOWN';
  gameState.timerDuration = duration;
  gameState.timerRemaining = duration;
  gameState.timerPaused = false;
  gameState.currentNightEliminations.clear();
  gameState.nightExplodedRooms.clear();
  gameState.tvMapVisible = false;
  gameState.tvRulesVisible = false; // Ferme la présentation TV des règles pour laisser place au décompte !
  io.emit('tv_rules_display', { visible: false });
  broadcastState();

  gameState.timerInterval = setInterval(() => {
    // Si le décompte est en pause, ne pas décrémenter
    if (gameState.timerPaused) return;

    gameState.timerRemaining -= 1;
    io.emit('timer_tick', { remaining: gameState.timerRemaining, phase: gameState.phase, timerPaused: gameState.timerPaused });

    // Fin du décompte : assignation automatique anti-frustration et révélation !
    if (gameState.timerRemaining <= 0) {
      endCountdownAndReveal();
    }
  }, 1000);
}

function endCountdownAndReveal() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }

  gameState.timerPaused = false;
  gameState.nightAsleepStartTime = Date.now();

  // RÈGLE ANTI-FRUSTRATION : Aucun joueur n'est éliminé par manque de choix !
  // Si le joueur n'a pas validé à temps :
  // 1. Choix temporaire sélectionné (si cliqué avant la fin du décompte)
  // 2. Choix de la nuit dernière (si valide et non détruite par le Pyromane)
  // 3. Choix aléatoire parmi les pièces encore intactes (1ère nuit ou pièce précédente détruite)
  for (const p of gameState.players.values()) {
    if (p.isAlive) {
      if (!p.room) {
        // 1. Pièce sélectionnée (touchée) sur le smartphone
        if (p.selectedRoom && ROOMS[p.selectedRoom] && !gameState.destroyedRooms.has(p.selectedRoom)) {
          p.room = p.selectedRoom;
          p.assignmentType = 'selected';
        }
        // 2. Pièce de la nuit passée (si intacte)
        else if (p.previousRoom && ROOMS[p.previousRoom] && !gameState.destroyedRooms.has(p.previousRoom)) {
          p.room = p.previousRoom;
          p.assignmentType = 'previous';
        }
        // 3. Choix aléatoire parmi les pièces disponibles
        else {
          p.room = getRandomAvailableRoom();
          p.assignmentType = 'random';
        }
      } else if (!p.assignmentType) {
        p.assignmentType = 'chosen';
      }

      p.isLocked = true;
      p.previousRoom = p.room; // Mémoriser pour la prochaine nuit
      p.selectedRoom = null;

      // Envoyer l'accusé de réception ciblé au joueur pour son smartphone
      io.to(`player_${p.id}`).emit('room_locked_ack', {
        roomId: p.room,
        assignmentType: p.assignmentType
      });
    }
  }

  // Le décompte est terminé : le manoir s'endort (phase de nuit les yeux fermés)
  gameState.phase = 'NIGHT_ASLEEP';
  gameState.timerRemaining = 0;
  gameState.tvMapVisible = false;
  io.emit('countdown_finished');
  io.emit('sleep_phase_started');
  broadcastState();
}

// Sockets
io.on('connection', (socket) => {
  let boundPlayerId = null;

  // Envoi immédiat de l'état actuel pour tout écran connecté (Host, TV, etc.)
  socket.emit('state_updated', getPublicState());

  // Demande explicite de rafraîchissement d'état (ex: sortie de veille mobile)
  socket.on('get_state', () => {
    socket.emit('state_updated', getPublicState(boundPlayerId));
  });

  socket.on('player_join', ({ id, name, avatar }) => {
    boundPlayerId = id;
    socket.join(`player_${id}`);

    let player = gameState.players.get(id);
    if (!player) {
      player = {
        id,
        name: (name || 'Joueur').trim().slice(0, 16),
        avatar: avatar || '👻',
        room: null,
        selectedRoom: null,
        previousRoom: null,
        assignmentType: null,
        isLocked: false,
        isAlive: true,
        hasPhone: true,
        eliminatedReason: null,
        connected: true
      };
      gameState.players.set(id, player);
    } else {
      player.name = (name || player.name).trim().slice(0, 16);
      player.avatar = avatar || player.avatar;
      player.connected = true;
    }

    if (!player.isAlive) {
      socket.join('spectres_room');
      socket.emit('spectre_chat_history', {
        messages: gameState.spectreChatMessages,
        mutedPlayerIds: Array.from(gameState.spectreMutedPlayers || [])
      });
    } else {
      socket.leave('spectres_room');
    }

    socket.emit('joined_ack', { player, state: getPublicState(id) });
    broadcastState();
  });

  // Joueur sélectionne (touche) une pièce sans avoir encore cliqué sur Valider
  socket.on('player_select_room', ({ roomId }) => {
    if (!boundPlayerId) return;
    const player = gameState.players.get(boundPlayerId);
    if (!player || !player.isAlive || player.isLocked) return;
    if (gameState.destroyedRooms.has(roomId)) return;
    if (ROOMS[roomId] && gameState.phase === 'COUNTDOWN') {
      player.selectedRoom = roomId;
    }
  });

  // Joueur valide sa salle (définitif)
  socket.on('player_choose_room', ({ roomId }) => {
    if (!boundPlayerId) return;

    const player = gameState.players.get(boundPlayerId);
    if (!player || !player.isAlive) return;

    // Impossible de choisir une pièce détruite par le Pyromane
    if (gameState.destroyedRooms.has(roomId)) return;
    if (!ROOMS[roomId]) return;

    // Tolérance : COUNTDOWN actif OU période de grâce de 3s au tout début de NIGHT_ASLEEP (latence réseau / clic à la dernière seconde)
    const isGracePeriod = gameState.phase === 'NIGHT_ASLEEP' && (Date.now() - (gameState.nightAsleepStartTime || 0) < 3000);

    if (gameState.phase === 'COUNTDOWN' || isGracePeriod) {
      if (player.isLocked && gameState.phase === 'COUNTDOWN') return;

      player.room = roomId;
      player.previousRoom = roomId;
      player.selectedRoom = null;
      player.assignmentType = 'chosen';
      player.isLocked = true;

      socket.emit('room_locked_ack', { roomId, assignmentType: 'chosen' });
      broadcastState();

      // Si tous les vivants connectés ont validé pendant le COUNTDOWN
      if (gameState.phase === 'COUNTDOWN') {
        const alivePlayers = Array.from(gameState.players.values()).filter(p => p.isAlive);
        const allLocked = alivePlayers.every(p => p.isLocked);
        if (allLocked && alivePlayers.length > 0) {
          endCountdownAndReveal();
        }
      }
    }
  });



  // 👻 Spectre : Murmure spectral / Frisson sur l'écran TV & Hôte
  socket.on('spectre_whisper', () => {
    if (!boundPlayerId) return;
    const player = gameState.players.get(boundPlayerId);
    if (!player || player.isAlive) return;

    const now = Date.now();
    const lastTime = gameState.spectreLastWhisper.get(boundPlayerId) || 0;
    const cooldownMs = 15000;
    if (now - lastTime < cooldownMs) {
      const waitSec = Math.ceil((cooldownMs - (now - lastTime)) / 1000);
      socket.emit('spectre_cooldown', { waitSec });
      return;
    }

    gameState.spectreLastWhisper.set(boundPlayerId, now);
    // 100% anonyme sur la TV : aucun nom de joueur transmis
    io.emit('spectre_whispered', {
      timestamp: now
    });
  });

  // 👻 Spectre : Envoi d'emoji sur le grand écran TV (100% Anonyme)
  socket.on('spectre_send_emoji', ({ emoji }) => {
    if (!boundPlayerId) return;
    const player = gameState.players.get(boundPlayerId);
    if (!player || player.isAlive) return;

    if (!emoji || typeof emoji !== 'string') return;
    const cleanEmoji = emoji.trim();
    if (!cleanEmoji || cleanEmoji.length > 8) return;

    const now = Date.now();
    if (!gameState.spectreLastEmoji) gameState.spectreLastEmoji = new Map();
    const lastTime = gameState.spectreLastEmoji.get(boundPlayerId) || 0;
    if (now - lastTime < 1000) {
      return; // Cooldown 1s
    }
    gameState.spectreLastEmoji.set(boundPlayerId, now);

    // Diffusion sur l'écran TV - 100% ANONYME (sans nom, sans id)
    io.emit('tv_ghost_emoji', {
      emoji: cleanEmoji,
      timestamp: now
    });
  });

  // 💬 Spectre : Salon de discussion secret des morts
  socket.on('spectre_join_chat', () => {
    socket.join('spectres_room');
    socket.emit('spectre_chat_history', {
      messages: gameState.spectreChatMessages,
      mutedPlayerIds: Array.from(gameState.spectreMutedPlayers || [])
    });
  });

  socket.on('spectre_send_message', ({ text }) => {
    let sender = boundPlayerId ? gameState.players.get(boundPlayerId) : null;
    const isHost = !boundPlayerId;
    if (sender && sender.isAlive && !isHost) return;

    // Vérifier si le joueur est muté par l'arbitre
    if (sender && gameState.spectreMutedPlayers && gameState.spectreMutedPlayers.has(sender.id)) {
      socket.emit('spectre_error', { message: '🔇 Vous avez été temporairement réduit au silence par le Maître du Jeu pour comportement inapproprié.' });
      return;
    }

    const cleanText = (text || '').trim().slice(0, 180);
    if (!cleanText) return;

    const msg = {
      id: 'sm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fromId: sender ? sender.id : 'host',
      fromName: sender ? sender.name : 'Maître du Jeu',
      fromAvatar: sender ? (sender.avatar || '👻') : '🏰',
      isHost: !sender,
      text: cleanText,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    gameState.spectreChatMessages.push(msg);
    if (gameState.spectreChatMessages.length > 80) {
      gameState.spectreChatMessages.shift();
    }

    io.to('spectres_room').emit('spectre_new_message', msg);
  });

  // 🛡️ MODÉRATION DU CHAT DES SPECTRES (RÉSERVÉ À L'HÔTE / RÉGIE)
  socket.on('host_delete_spectre_message', ({ messageId }) => {
    if (boundPlayerId) return; // Sécurité : seul l'hôte peut supprimer
    if (!messageId) return;

    gameState.spectreChatMessages = gameState.spectreChatMessages.filter(m => m.id !== messageId);
    io.to('spectres_room').emit('spectre_message_deleted', { messageId });
  });

  socket.on('host_clear_spectre_chat', () => {
    if (boundPlayerId) return;
    gameState.spectreChatMessages = [];
    io.to('spectres_room').emit('spectre_chat_cleared');
  });

  socket.on('host_mute_spectre_player', ({ playerId }) => {
    if (boundPlayerId || !playerId) return;
    if (!gameState.spectreMutedPlayers) gameState.spectreMutedPlayers = new Set();
    gameState.spectreMutedPlayers.add(playerId);

    const mutedArray = Array.from(gameState.spectreMutedPlayers);
    io.to('spectres_room').emit('spectre_muted_status', { mutedPlayerIds: mutedArray });

    const target = gameState.players.get(playerId);
    const targetName = target ? target.name : 'Un participant';
    const notice = {
      id: 'sm_sys_' + Date.now(),
      fromId: 'system',
      fromName: '🏰 Arbitrage Manoir',
      fromAvatar: '🔇',
      isHost: true,
      isSystem: true,
      text: `🔇 ${targetName} a été réduit au silence par le Maître du Jeu.`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    gameState.spectreChatMessages.push(notice);
    io.to('spectres_room').emit('spectre_new_message', notice);
  });

  socket.on('host_unmute_spectre_player', ({ playerId }) => {
    if (boundPlayerId || !playerId) return;
    if (gameState.spectreMutedPlayers) {
      gameState.spectreMutedPlayers.delete(playerId);
    }
    const mutedArray = Array.from(gameState.spectreMutedPlayers || []);
    io.to('spectres_room').emit('spectre_muted_status', { mutedPlayerIds: mutedArray });

    const target = gameState.players.get(playerId);
    const targetName = target ? target.name : 'Un participant';
    const notice = {
      id: 'sm_sys_' + Date.now(),
      fromId: 'system',
      fromName: '🏰 Arbitrage Manoir',
      fromAvatar: '🔊',
      isHost: true,
      isSystem: true,
      text: `🔊 La parole a été rendue à ${targetName}.`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    gameState.spectreChatMessages.push(notice);
    io.to('spectres_room').emit('spectre_new_message', notice);
  });

  socket.on('host_warn_spectre_chat', ({ warningText }) => {
    if (boundPlayerId) return;
    const text = warningText || "⚠️ RAPPEL DE L'ARBITRE : Merci de rester courtois et respectueux dans le salon des défunts. Tout écart de langage ou insulte sera immédiatement sanctionné d'un mutisme.";
    const warnNotice = {
      id: 'sm_warn_' + Date.now(),
      fromId: 'system',
      fromName: '👑 Maître du Jeu',
      fromAvatar: '⚠️',
      isHost: true,
      isWarning: true,
      text: text,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    gameState.spectreChatMessages.push(warnNotice);
    io.to('spectres_room').emit('spectre_new_message', warnNotice);
  });

  // Actions Animateur
  socket.on('host_action', ({ action, payload }) => {
    // Sécurité : Les joueurs mobiles (qui ont un boundPlayerId) ne peuvent pas exécuter d'actions animateur / régie
    if (boundPlayerId) {
      return;
    }
    switch (action) {
      case 'START_COUNTDOWN':
        startCountdown(payload?.duration || 60);
        break;

      case 'PAUSE_TIMER':
        if (gameState.phase === 'COUNTDOWN' && !gameState.timerPaused) {
          gameState.timerPaused = true;
          io.emit('timer_paused', { remaining: gameState.timerRemaining });
          broadcastState();
        }
        break;

      case 'RESUME_TIMER':
        if (gameState.phase === 'COUNTDOWN' && gameState.timerPaused) {
          gameState.timerPaused = false;
          io.emit('timer_resumed', { remaining: gameState.timerRemaining });
          broadcastState();
        }
        break;

      case 'TOGGLE_TIMER_PAUSE':
        if (gameState.phase === 'COUNTDOWN') {
          gameState.timerPaused = !gameState.timerPaused;
          if (gameState.timerPaused) {
            io.emit('timer_paused', { remaining: gameState.timerRemaining });
          } else {
            io.emit('timer_resumed', { remaining: gameState.timerRemaining });
          }
          broadcastState();
        }
        break;

      case 'REVEAL_NOW':
        endCountdownAndReveal();
        break;

      // 📺 Projection des Règles & Cartes sur la TV
      case 'TV_RULES_PRESENT':
        gameState.tvRulesVisible = !!payload?.visible;
        gameState.tvRulesCardIndex = typeof payload?.cardIndex === 'number' ? payload.cardIndex : 0;
        gameState.tvRulesTab = payload?.tab || 'roles';
        io.emit('tv_rules_display', {
          visible: gameState.tvRulesVisible,
          cardIndex: gameState.tvRulesCardIndex,
          tab: gameState.tvRulesTab
        });
        broadcastState();
        break;

      case 'TV_RULES_SET_CARD':
        gameState.tvRulesCardIndex = typeof payload?.cardIndex === 'number' ? payload.cardIndex : 0;
        io.emit('tv_rules_card_changed', {
          cardIndex: gameState.tvRulesCardIndex
        });
        broadcastState();
        break;

      case 'TV_RULES_SET_TAB':
        gameState.tvRulesTab = payload?.tab || 'roles';
        io.emit('tv_rules_tab_changed', {
          tab: gameState.tvRulesTab
        });
        broadcastState();
        break;

      // Attribuer manuellement une pièce (pour un joueur sans téléphone ou secours)
      case 'MANUAL_SET_ROOM':
        const target = gameState.players.get(payload.playerId);
        if (target) {
          target.room = payload.roomId || null;
          if (payload.roomId) {
            target.previousRoom = payload.roomId;
            target.assignmentType = 'chosen';
          }
          target.isLocked = !!payload.roomId;
        }
        break;

      // Ajouter un joueur sans téléphone avec pièce immédiate
      case 'ADD_MANUAL_PLAYER':
        const newId = 'm_' + Math.random().toString(36).substring(2, 7);
        gameState.players.set(newId, {
          id: newId,
          name: (payload.name || 'Joueur').trim().slice(0, 16),
          avatar: payload.avatar || '🕯️',
          room: payload.roomId || null,
          selectedRoom: null,
          previousRoom: payload.roomId || null,
          assignmentType: payload.roomId ? 'chosen' : null,
          isLocked: !!payload.roomId,
          isAlive: true,
          hasPhone: false,
          eliminatedReason: null,
          connected: true
        });
        break;

      // Éliminer / Ressusciter un joueur manuellement
      case 'TOGGLE_PLAYER_ALIVE':
        const pAlive = gameState.players.get(payload.playerId);
        if (pAlive) {
          pAlive.isAlive = !pAlive.isAlive;
          if (!pAlive.isAlive) {
            pAlive.eliminatedReason = payload.reason || 'manual';
            gameState.currentNightEliminations.add(pAlive.id);
          } else {
            pAlive.eliminatedReason = null;
            gameState.currentNightEliminations.delete(pAlive.id);
          }
        }
        break;

      // ⚖️ Élimination au Vote du Village pendant les débats de jour
      case 'VILLAGE_VOTE_ELIMINATE': {
        const targetId = payload?.playerId;
        const note = payload?.note || 'Condamné par le conseil du village';
        if (targetId && targetId !== 'none') {
          const target = gameState.players.get(targetId);
          if (target && target.isAlive) {
            target.isAlive = false;
            target.eliminatedReason = 'vote';
            const victimObj = {
              id: target.id,
              name: target.name,
              avatar: target.avatar,
              room: target.room,
              roomName: target.room ? (ROOMS[target.room]?.name || target.room) : 'Couloirs',
              reason: 'vote',
              reasonText: '⚖️ Condamné au vote du village 💀'
            };
            gameState.lastRevealedDeaths = [victimObj];
            io.emit('village_vote_eliminated', {
              player: victimObj,
              note
            });
          }
        } else {
          io.emit('village_vote_eliminated', {
            player: null,
            note: 'Aucun joueur éliminé (Égalité ou vote blanc).'
          });
        }
        break;
      }

      // Détruire / Faire sauter une pièce (Pyromane)
      case 'DESTROY_ROOM': {
        const roomId = payload?.roomId;
        const killOccupants = payload?.killOccupants !== false;
        if (ROOMS[roomId]) {
          gameState.destroyedRooms.add(roomId);
          if (gameState.phase !== 'REVEALED') {
            gameState.nightExplodedRooms.add(roomId);
          }
          const victims = [];
          if (killOccupants) {
            for (const p of gameState.players.values()) {
              if (p.isAlive && p.room === roomId) {
                p.eliminatedReason = 'pyromane';
                gameState.currentNightEliminations.add(p.id);
                victims.push({ id: p.id, name: p.name });
              }
            }
          }
          // Notification immédiate pour l'hôte qui effectue l'action
          socket.emit('room_exploded', {
            roomId,
            roomName: ROOMS[roomId].name,
            victims
          });
          broadcastState();
        }
        break;
      }

      // Restaurer / Reconstruire une pièce
      case 'RESTORE_ROOM': {
        const roomId = payload?.roomId;
        if (gameState.destroyedRooms.has(roomId)) {
          gameState.destroyedRooms.delete(roomId);
          gameState.nightExplodedRooms.delete(roomId);
          for (const p of gameState.players.values()) {
            if (p.room === roomId && p.eliminatedReason === 'pyromane' && gameState.currentNightEliminations.has(p.id)) {
              p.eliminatedReason = null;
              gameState.currentNightEliminations.delete(p.id);
            }
          }
          broadcastState();
        }
        break;
      }

      // Basculer l'état détruit / intact d'une pièce
      case 'TOGGLE_ROOM_DESTROYED': {
        const roomId = payload?.roomId;
        const killOccupants = payload?.killOccupants !== false;
        if (gameState.destroyedRooms.has(roomId)) {
          gameState.destroyedRooms.delete(roomId);
          gameState.nightExplodedRooms.delete(roomId);
          for (const p of gameState.players.values()) {
            if (p.room === roomId && p.eliminatedReason === 'pyromane' && gameState.currentNightEliminations.has(p.id)) {
              p.eliminatedReason = null;
              gameState.currentNightEliminations.delete(p.id);
            }
          }
          broadcastState();
        } else if (ROOMS[roomId]) {
          gameState.destroyedRooms.add(roomId);
          if (gameState.phase !== 'REVEALED') {
            gameState.nightExplodedRooms.add(roomId);
          }
          const victims = [];
          if (killOccupants) {
            for (const p of gameState.players.values()) {
              if (p.isAlive && p.room === roomId) {
                p.eliminatedReason = 'pyromane';
                gameState.currentNightEliminations.add(p.id);
                victims.push({ id: p.id, name: p.name });
              }
            }
          }
          socket.emit('room_exploded', {
            roomId,
            roomName: ROOMS[roomId].name,
            victims
          });
          broadcastState();
        }
        break;
      }

      // 🗑️ Supprimer définitivement un joueur de la partie
      case 'REMOVE_PLAYER': {
        const targetId = payload?.playerId || payload?.id;
        if (targetId && gameState.players.has(targetId)) {
          gameState.players.delete(targetId);
          gameState.currentNightEliminations.delete(targetId);
          io.emit('player_removed', { playerId: targetId });
        }
        break;
      }

      // ✏️ Modifier le nom d'un participant
      case 'RENAME_PLAYER': {
        const targetId = payload?.playerId || payload?.id;
        const newName = (payload?.name || '').trim().slice(0, 16);
        if (targetId && newName && gameState.players.has(targetId)) {
          const target = gameState.players.get(targetId);
          target.name = newName;
          io.emit('player_renamed', { playerId: targetId, name: newName });
        }
        break;
      }

      // 🔄 Relancer complètement toute la partie
      case 'RESET_ALL': {
        if (gameState.timerInterval) {
          clearInterval(gameState.timerInterval);
          gameState.timerInterval = null;
        }
        gameState.phase = 'WAITING';
        gameState.timerDuration = 60;
        gameState.timerRemaining = 60;
        gameState.timerPaused = false;
        gameState.currentNight = 1;
        gameState.destroyedRooms.clear();
        gameState.nightExplodedRooms.clear();
        gameState.tvMapVisible = false;
        gameState.tvRulesVisible = false;
        io.emit('tv_rules_display', { visible: false });
        gameState.currentNightEliminations.clear();
        gameState.lastRevealedDeaths = [];
        gameState.spectreChatMessages = [];
        for (const p of gameState.players.values()) {
          p.room = null;
          p.selectedRoom = null;
          p.previousRoom = null;
          p.assignmentType = null;
          p.isLocked = false;
          p.isAlive = true;
          p.eliminatedReason = null;
        }
        if (payload?.resetScores) {
          gameState.scores = { village: 0, monsters: 0, pyromane: 0 };
          gameState.gameHistory = [];
        }
        io.emit('game_reset_all');
        break;
      }

      // 🌙 Relancer la nuit en cours (remet le chrono à 60s et déverrouille les choix pour les survivants actuels)
      case 'RESTART_CURRENT_NIGHT': {
        const autoStart = payload?.autoStart !== false;
        if (gameState.timerInterval) {
          clearInterval(gameState.timerInterval);
          gameState.timerInterval = null;
        }

        gameState.tvMapVisible = false;
        gameState.tvRulesVisible = false;
        io.emit('tv_rules_display', { visible: false });
        // Restaurer les pièces ayant explosé cette nuit si on relance la nuit
        for (const rId of gameState.nightExplodedRooms) {
          gameState.destroyedRooms.delete(rId);
        }
        gameState.nightExplodedRooms.clear();
        gameState.currentNightEliminations.clear();
        gameState.lastRevealedDeaths = [];

        // Déverrouiller tous les survivants
        for (const p of gameState.players.values()) {
          if (p.isAlive) {
            if (p.room) {
              p.previousRoom = p.room;
            }
            if (p.hasPhone) {
              p.room = null;
              p.selectedRoom = null;
              p.assignmentType = null;
              p.isLocked = false;
            } else {
              p.isLocked = !!p.room;
            }
          }
        }

        if (autoStart) {
          startCountdown(payload?.duration || 60);
        } else {
          gameState.phase = 'WAITING';
          gameState.timerDuration = 60;
          gameState.timerRemaining = 60;
        }
        io.emit('night_restarted');
        break;
      }

      // 💀 Éliminer une liste de joueurs (Monstres, Vote, etc.)
      case 'ELIMINATE_PLAYERS': {
        const playerIds = payload?.playerIds || [];
        const reason = payload?.reason || 'monsters';
        for (const pid of playerIds) {
          const p = gameState.players.get(pid);
          if (p && p.isAlive) {
            p.isAlive = false;
            p.eliminatedReason = reason;
            gameState.currentNightEliminations.add(p.id);
          }
        }
        break;
      }

      // 🐺 Attaque des Monstres sur une pièce entière
      case 'MONSTER_ATTACK_ROOM': {
        const roomId = payload?.roomId;
        if (ROOMS[roomId]) {
          for (const p of gameState.players.values()) {
            if (p.isAlive && p.room === roomId) {
              p.isAlive = false;
              p.eliminatedReason = 'monsters';
              gameState.currentNightEliminations.add(p.id);
            }
          }
        }
        break;
      }

      // 🌅 Révéler les morts de la nuit (Le Jour se lève) au grand écran et sur les téléphones
      case 'REVEAL_NIGHT_DEATHS': {
        // Si des victimes spécifiques sont passées dans le payload
        if (Array.isArray(payload?.victims)) {
          for (const item of payload.victims) {
            const p = gameState.players.get(item.playerId || item.id);
            if (p) {
              p.isAlive = false;
              p.eliminatedReason = item.reason || 'monsters';
              gameState.currentNightEliminations.add(p.id);
            }
          }
        }

        // Marquer tous les éliminés de la nuit comme définitivement éliminés
        for (const victimId of gameState.currentNightEliminations) {
          const p = gameState.players.get(victimId);
          if (p) {
            p.isAlive = false;
            if (!p.eliminatedReason) p.eliminatedReason = 'pyromane';
          }
        }

        const reasonTexts = {
          monsters: 'Attaqué par les Monstres 🐺',
          pyromane: 'Pulvérisé par le Pyromane 💣',
          sorciere: 'Potion de la Sorcière 🧪',
          chasseur: 'Tir du Chasseur 🏹',
          timeout: 'Piégé dans les couloirs ⏳',
          vote: 'Condamné par le Village ⚖️',
          manual: 'Ombres du Manoir 💀'
        };

        const victimsList = [];
        for (const victimId of gameState.currentNightEliminations) {
          const p = gameState.players.get(victimId);
          if (p) {
            const roomObj = ROOMS[p.room];
            const roomName = roomObj ? roomObj.name : 'Couloirs';
            const reason = p.eliminatedReason || 'manual';
            victimsList.push({
              id: p.id,
              name: p.name,
              avatar: p.avatar,
              room: p.room,
              roomName,
              reason,
              reasonText: reasonTexts[reason] || 'Ombres du Manoir 💀'
            });
          }
        }

        const explodedRoomsThisNight = Array.from(gameState.nightExplodedRooms);

        gameState.lastRevealedDeaths = victimsList;
        gameState.currentNightEliminations.clear();
        gameState.nightExplodedRooms.clear();
        gameState.phase = 'REVEALED'; // Le Jour se lève !
        gameState.tvMapVisible = true; // Révélation automatique sur la TV à l'aube

        let aliveCount = 0;
        let deadCount = 0;
        for (const p of gameState.players.values()) {
          if (p.isAlive) aliveCount++;
          else deadCount++;
        }

        io.emit('night_deaths_revealed', {
          night: gameState.currentNight,
          victims: victimsList,
          explodedRooms: explodedRoomsThisNight,
          aliveCount,
          deadCount,
          totalPlayers: gameState.players.size,
          note: payload?.note || ''
        });
        broadcastState();
        break;
      }

      // 🏆 Proclamer le Vainqueur d'une partie (Villageois, Monstres ou Pyromane)
      case 'DECLARE_WINNER': {
        const winnerCamp = payload?.winnerCamp || 'village'; // 'village' | 'monsters' | 'pyromane'
        const campNames = {
          village: 'Villageois 🛡️',
          monsters: 'Monstres 🐺',
          pyromane: 'Pyromane 💣'
        };
        const title = campNames[winnerCamp] || 'Vainqueurs';
        
        // Liste des survivants de la partie
        const survivors = Array.from(gameState.players.values())
          .filter(p => p.isAlive)
          .map(p => ({ id: p.id, name: p.name, avatar: p.avatar, hasPhone: p.hasPhone }));

        const gameRecord = {
          id: 'g_' + Date.now().toString(36),
          gameNumber: gameState.gameHistory.length + 1,
          winnerCamp,
          winnerTitle: title,
          nightEnded: gameState.currentNight,
          survivors,
          customWinners: payload?.customWinners || null,
          note: payload?.note || '',
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };

        gameState.gameHistory.unshift(gameRecord); // Les plus récents en premier
        if (gameState.scores[winnerCamp] !== undefined) {
          gameState.scores[winnerCamp] += 1;
        }

        io.emit('game_won_event', gameRecord);
        break;
      }

      // Gestion des nuits
      case 'SET_NIGHT': {
        const n = Math.max(1, Math.min(gameState.maxNights, parseInt(payload?.night) || 1));
        gameState.currentNight = n;
        break;
      }

      case 'NEXT_NIGHT': {
        if (gameState.currentNight < gameState.maxNights) {
          gameState.currentNight += 1;
        }
        break;
      }

      case 'PREV_NIGHT': {
        if (gameState.currentNight > 1) {
          gameState.currentNight -= 1;
        }
        break;
      }

      // Nouvelle manche (relance le jeu pour la partie suivante en gardant l'historique des victoires)
      case 'RESET_GAME_ROUND': {
        if (gameState.timerInterval) {
          clearInterval(gameState.timerInterval);
          gameState.timerInterval = null;
        }
        gameState.phase = 'WAITING';
        gameState.timerDuration = 60;
        gameState.timerRemaining = 60;
        gameState.timerPaused = false;
        gameState.currentNight = 1;
        gameState.tvMapVisible = false;
        gameState.currentNightEliminations.clear();
        gameState.nightExplodedRooms.clear();
        gameState.lastRevealedDeaths = [];
        gameState.spectreChatMessages = [];
        if (gameState.spectreMutedPlayers) gameState.spectreMutedPlayers.clear();
        if (payload?.restoreRooms !== false) {
          gameState.destroyedRooms.clear();
        }
        for (const p of gameState.players.values()) {
          p.room = null;
          p.selectedRoom = null;
          p.previousRoom = null;
          p.assignmentType = null;
          p.isLocked = false;
          p.isAlive = true;
          p.eliminatedReason = null;
        }
        io.emit('game_reset_all');
        break;
      }

      // Supprimer une entrée d'historique erronée
      case 'DELETE_GAME_RECORD': {
        const targetId = payload?.gameId;
        const idx = gameState.gameHistory.findIndex(g => g.id === targetId);
        if (idx !== -1) {
          const removed = gameState.gameHistory.splice(idx, 1)[0];
          if (removed && gameState.scores[removed.winnerCamp] > 0) {
            gameState.scores[removed.winnerCamp] -= 1;
          }
          // Réaligner le numéro de partie
          gameState.gameHistory.slice().reverse().forEach((g, i) => {
            g.gameNumber = i + 1;
          });
        }
        break;
      }

      // 📺 Basculer la visibilité de la carte sur l'écran TV (Projecteur)
      case 'TOGGLE_TV_MAP': {
        if (payload?.visible !== undefined) {
          gameState.tvMapVisible = !!payload.visible;
        } else {
          gameState.tvMapVisible = !gameState.tvMapVisible;
        }
        io.emit('tv_map_visibility_changed', { visible: gameState.tvMapVisible });
        break;
      }

      // Effacer tout l'historique et réinitialiser les scores
      case 'CLEAR_HISTORY': {
        gameState.gameHistory = [];
        gameState.scores = { village: 0, monsters: 0, pyromane: 0 };
        break;
      }
    }

    broadcastState();
  });

  socket.on('disconnect', () => {
    if (boundPlayerId && gameState.players.has(boundPlayerId)) {
      const p = gameState.players.get(boundPlayerId);
      p.connected = false;
      broadcastState();
    }
  });
});

app.get('/tv', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tv.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

let customJoinUrl = process.env.PUBLIC_URL || null;

app.get('/api/network-info', async (req, res) => {
  const localIp = getLocalIpAddress();
  const joinUrl = customJoinUrl || `http://${localIp}:${PORT}`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 280,
      color: {
        dark: '#120d1c',
        light: '#f7f4ea'
      }
    });
    res.json({ localIp, port: PORT, joinUrl, qrCodeDataUrl, isCustomUrl: !!customJoinUrl });
  } catch (err) {
    res.status(500).json({ error: 'QR Code error' });
  }
});

app.post('/api/set-join-url', async (req, res) => {
  const { url } = req.body || {};
  if (url && typeof url === 'string' && url.trim().length > 0) {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    customJoinUrl = cleanUrl;
  } else {
    customJoinUrl = null;
  }

  const localIp = getLocalIpAddress();
  const joinUrl = customJoinUrl || `http://${localIp}:${PORT}`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 280,
      color: {
        dark: '#120d1c',
        light: '#f7f4ea'
      }
    });
    io.emit('qr_updated', { joinUrl, qrCodeDataUrl });
    res.json({ success: true, localIp, port: PORT, joinUrl, qrCodeDataUrl, isCustomUrl: !!customJoinUrl });
  } catch (err) {
    res.status(500).json({ error: 'QR Code error' });
  }
});

// 🛡️ Restauration de session en cas de redémarrage après arrêt inopiné
loadSessionState();

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`=======================================================`);
  console.log(`🏰 LE MANOIR PIÉGÉ - SERVEUR EN LIGNE`);
  console.log(`> 📺 Écran TV / Vidéoprojecteur : http://localhost:${PORT}/tv.html`);
  console.log(`> 💻 Écran Admin / Régie        : http://localhost:${PORT}/host.html`);
  console.log(`> 📱 Téléphones des Joueurs     : http://${localIp}:${PORT}/`);
  console.log(`=======================================================`);
});
