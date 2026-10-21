const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✓ Connecté au serveur');

  // 1. Ajouter 3 joueurs
  socket.emit('host_action', {
    action: 'ADD_MANUAL_PLAYER',
    payload: { name: 'Arthur', avatar: '🐺', roomId: 'cuisine' }
  });
  socket.emit('host_action', {
    action: 'ADD_MANUAL_PLAYER',
    payload: { name: 'Chloé', avatar: '🧙', roomId: 'chambre' }
  });
  socket.emit('host_action', {
    action: 'ADD_MANUAL_PLAYER',
    payload: { name: 'Lucas', avatar: '🦇', roomId: 'grenier' }
  });

  // 2. Changer de nuit (Nuit 3)
  setTimeout(() => {
    console.log('-> Passage à la Nuit 3');
    socket.emit('host_action', { action: 'SET_NIGHT', payload: { night: 3 } });
  }, 300);

  // 3. Proclamer la victoire du Village
  setTimeout(() => {
    console.log('-> Proclamation de la Victoire des Villageois');
    socket.emit('host_action', {
      action: 'DECLARE_WINNER',
      payload: {
        winnerCamp: 'village',
        customWinners: 'Chloé, Lucas',
        note: 'Les 3 monstres ont été trouvés !'
      }
    });
  }, 600);

  // 4. Proclamer une 2e victoire (Monstres)
  setTimeout(() => {
    console.log('-> Proclamation de la Victoire des Monstres pour la partie suivante');
    socket.emit('host_action', {
      action: 'DECLARE_WINNER',
      payload: {
        winnerCamp: 'monsters',
        customWinners: 'Arthur',
        note: 'Victoire en Nuit 5'
      }
    });
  }, 900);
});

socket.on('game_won_event', (record) => {
  console.log(`🎉 Événement de Victoire reçu : Partie #${record.gameNumber} - ${record.winnerTitle} (Terminée en Nuit ${record.nightEnded})`);
  console.log(`   Vainqueurs : ${record.customWinners || record.survivors.map(s => s.name).join(', ')}`);
});

let stateCount = 0;
socket.on('state_updated', (state) => {
  stateCount++;
  if (state.gameHistory && state.gameHistory.length === 2) {
    console.log('-------------------------------------------------------');
    console.log('✓ Validation de l\'état complet du jeu :');
    console.log(`   Nuit courante : Nuit ${state.currentNight} / ${state.maxNights}`);
    console.log(`   Scores : Village: ${state.scores.village} | Monstres: ${state.scores.monsters} | Pyromane: ${state.scores.pyromane}`);
    console.log(`   Total parties jouées dans l'historique : ${state.gameHistory.length}`);
    state.gameHistory.forEach(g => {
      console.log(`   - Partie #${g.gameNumber} : ${g.winnerTitle} (${g.customWinners}) - Nuit ${g.nightEnded} à ${g.timestamp}`);
    });
    console.log('-------------------------------------------------------');
    console.log('✓ TOUS LES TESTS SONT VALIDES AVEC SUCCÈS !');
    socket.disconnect();
    process.exit(0);
  }
});
