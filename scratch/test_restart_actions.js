const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✓ Connecté au serveur');

  // 1. Ajouter 3 joueurs et éliminer l'un d'eux
  socket.emit('host_action', {
    action: 'ADD_MANUAL_PLAYER',
    payload: { name: 'Arthur', avatar: '🐺', roomId: 'cuisine' }
  });
  socket.emit('host_action', {
    action: 'ADD_MANUAL_PLAYER',
    payload: { name: 'Chloé', avatar: '🧙', roomId: 'chambre' }
  });

  setTimeout(() => {
    // Lancer le décompte
    console.log('-> Démarrage décompte');
    socket.emit('host_action', { action: 'START_COUNTDOWN', payload: { duration: 60 } });
  }, 200);

  setTimeout(() => {
    // Tester RESTART_CURRENT_NIGHT
    console.log('-> Test RESTART_CURRENT_NIGHT');
    socket.emit('host_action', { action: 'RESTART_CURRENT_NIGHT', payload: { autoStart: true, duration: 60 } });
  }, 500);

  setTimeout(() => {
    // Tester RESET_ALL
    console.log('-> Test RESET_ALL (Relance complète)');
    socket.emit('host_action', { action: 'RESET_ALL', payload: { resetScores: false } });
  }, 800);
});

let phaseSteps = [];
socket.on('state_updated', (state) => {
  phaseSteps.push({ phase: state.phase, timer: state.timerRemaining, night: state.currentNight });

  // Après le reset_all
  if (state.phase === 'WAITING' && phaseSteps.length >= 3) {
    console.log('✓ Validation de RESET_ALL :');
    console.log(`   Phase: ${state.phase} | Timer: ${state.timerRemaining}s | Nuit: ${state.currentNight}`);
    const allAlive = state.players.every(p => p.isAlive);
    const allUnlocked = state.players.every(p => !p.isLocked && !p.room);
    console.log(`   Tous vivants: ${allAlive} | Tous déverrouillés sans salle: ${allUnlocked}`);
    if (allAlive && allUnlocked) {
      console.log('✓ TEST RELANCE PARTIE & NUIT RÉUSSI AVEC SUCCÈS !');
      socket.disconnect();
      process.exit(0);
    }
  }
});
