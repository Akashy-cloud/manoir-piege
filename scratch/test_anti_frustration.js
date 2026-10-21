const { io } = require('socket.io-client');

async function runTest() {
  console.log('--- TEST ANTI-FRUSTRATION START ---');

  const hostSocket = io('http://localhost:3000');
  const p1Socket = io('http://localhost:3000');
  const p2Socket = io('http://localhost:3000');
  const p3Socket = io('http://localhost:3000');

  const wait = ms => new Promise(r => setTimeout(r, ms));

  await wait(500);

  // Reset
  hostSocket.emit('host_action', { action: 'RESET_ALL', payload: { resetScores: true } });
  await wait(200);

  // Connect 3 players
  p1Socket.emit('player_join', { id: 'p1', name: 'Alice', avatar: '👻' });
  p2Socket.emit('player_join', { id: 'p2', name: 'Bob', avatar: '🧙' });
  p3Socket.emit('player_join', { id: 'p3', name: 'Charlie', avatar: '🧛' });
  await wait(300);

  console.log('✓ 3 joueurs connectés');

  // ==========================================
  // ÉTAPE 1 : Nuit 1
  // ==========================================
  console.log('\n[TEST 1] Nuit 1 : Choix P1=chambre (validé), P2=cuisine (sélectionné), P3=rien');
  hostSocket.emit('host_action', { action: 'START_COUNTDOWN', payload: { duration: 60 } });
  await wait(200);

  // P1 valide 'chambre'
  p1Socket.emit('player_choose_room', { roomId: 'chambre' });
  // P2 ne clique que sur la carte 'cuisine' (player_select_room sans valider)
  p2Socket.emit('player_select_room', { roomId: 'cuisine' });
  // P3 ne touche à rien du tout
  await wait(300);

  // Le décompte prend fin (simulé via REVEAL_NOW)
  hostSocket.emit('host_action', { action: 'REVEAL_NOW' });
  await wait(300);

  // Vérification de l'état
  let test1Success = false;
  await new Promise(resolve => {
    hostSocket.once('state_updated', state => {
      const p1 = state.players.find(p => p.id === 'p1');
      const p2 = state.players.find(p => p.id === 'p2');
      const p3 = state.players.find(p => p.id === 'p3');

      console.log('Résultats Nuit 1:');
      console.log(`- P1 (Alice) : vivant=${p1.isAlive}, salle=${p1.room}, type=${p1.assignmentType}`);
      console.log(`- P2 (Bob)   : vivant=${p2.isAlive}, salle=${p2.room}, type=${p2.assignmentType}`);
      console.log(`- P3 (Charlie): vivant=${p3.isAlive}, salle=${p3.room}, type=${p3.assignmentType}`);
      console.log(`- Morts : ${state.deadCount}, Vivants : ${state.aliveCount}`);

      if (
        p1.isAlive && p1.room === 'chambre' && p1.assignmentType === 'chosen' &&
        p2.isAlive && p2.room === 'cuisine' && p2.assignmentType === 'selected' &&
        p3.isAlive && !!p3.room && p3.assignmentType === 'random' &&
        state.deadCount === 0
      ) {
        console.log('>>> TEST 1 RÉUSSI : Aucun mort, choix respectés, P3 a reçu une pièce aléatoire !');
        test1Success = true;
      } else {
        console.error('>>> TEST 1 ÉCHEC !');
      }
      resolve();
    });
    hostSocket.emit('host_action', { action: 'TOGGLE_TV_MAP', payload: { visible: true } });
  });

  if (!test1Success) process.exit(1);

  // ==========================================
  // ÉTAPE 2 : Nuit 2
  // ==========================================
  console.log('\n[TEST 2] Nuit 2 : P1 et P2 ne touchent à rien, P3 valide salon');
  hostSocket.emit('host_action', { action: 'NEXT_NIGHT' });
  hostSocket.emit('host_action', { action: 'START_COUNTDOWN', payload: { duration: 60 } });
  await wait(200);

  // P3 valide 'salon'
  p3Socket.emit('player_choose_room', { roomId: 'salon' });
  // P1 et P2 ne touchent à rien !
  await wait(200);

  // Fin du décompte
  hostSocket.emit('host_action', { action: 'REVEAL_NOW' });
  await wait(300);

  let test2Success = false;
  await new Promise(resolve => {
    hostSocket.once('state_updated', state => {
      const p1 = state.players.find(p => p.id === 'p1');
      const p2 = state.players.find(p => p.id === 'p2');
      const p3 = state.players.find(p => p.id === 'p3');

      console.log('Résultats Nuit 2:');
      console.log(`- P1 (Alice) : vivant=${p1.isAlive}, salle=${p1.room}, type=${p1.assignmentType} (attendu: chambre, previous)`);
      console.log(`- P2 (Bob)   : vivant=${p2.isAlive}, salle=${p2.room}, type=${p2.assignmentType} (attendu: cuisine, previous)`);
      console.log(`- P3 (Charlie): vivant=${p3.isAlive}, salle=${p3.room}, type=${p3.assignmentType} (attendu: salon, chosen)`);
      console.log(`- Morts : ${state.deadCount}, Vivants : ${state.aliveCount}`);

      if (
        p1.isAlive && p1.room === 'chambre' && p1.assignmentType === 'previous' &&
        p2.isAlive && p2.room === 'cuisine' && p2.assignmentType === 'previous' &&
        p3.isAlive && p3.room === 'salon' && p3.assignmentType === 'chosen' &&
        state.deadCount === 0
      ) {
        console.log('>>> TEST 2 RÉUSSI : P1 et P2 ont bien conservé leur cachette de la veille !');
        test2Success = true;
      } else {
        console.error('>>> TEST 2 ÉCHEC !');
      }
      resolve();
    });
    hostSocket.emit('host_action', { action: 'TOGGLE_TV_MAP', payload: { visible: true } });
  });

  if (!test2Success) process.exit(1);

  // ==========================================
  // ÉTAPE 3 : Pièce détruite par Pyromane
  // ==========================================
  console.log('\n[TEST 3] Destruction de "chambre" (ancienne salle de P1) par le Pyromane');
  // Détruire la chambre sans tuer les occupants (pour le test)
  hostSocket.emit('host_action', { action: 'DESTROY_ROOM', payload: { roomId: 'chambre', killOccupants: false } });
  await wait(200);

  hostSocket.emit('host_action', { action: 'NEXT_NIGHT' });
  hostSocket.emit('host_action', { action: 'START_COUNTDOWN', payload: { duration: 60 } });
  await wait(200);

  // P1 ne choisit rien (sa salle d'avant était 'chambre', qui est désormais détruite !)
  // P2 valide 'grenier'
  p2Socket.emit('player_choose_room', { roomId: 'grenier' });
  await wait(200);

  hostSocket.emit('host_action', { action: 'REVEAL_NOW' });
  await wait(300);

  let test3Success = false;
  await new Promise(resolve => {
    hostSocket.once('state_updated', state => {
      const p1 = state.players.find(p => p.id === 'p1');
      console.log('Résultats Nuit 3 (après explosion chambre):');
      console.log(`- P1 (Alice) : vivant=${p1.isAlive}, salle=${p1.room}, type=${p1.assignmentType}`);
      
      if (p1.isAlive && p1.room !== 'chambre' && p1.assignmentType === 'random' && !state.destroyedRooms.includes(p1.room)) {
        console.log('>>> TEST 3 RÉUSSI : P1 a été redirigé vers une pièce intacte et n\'est pas mort !');
        test3Success = true;
      } else {
        console.error('>>> TEST 3 ÉCHEC ! P1 dans une mauvaise salle ou mort');
      }
      resolve();
    });
    hostSocket.emit('host_action', { action: 'TOGGLE_TV_MAP', payload: { visible: true } });
  });

  if (!test3Success) process.exit(1);

  // ==========================================
  // ÉTAPE 4 : Période de grâce (validation à 0s)
  // ==========================================
  console.log('\n[TEST 4] Période de grâce : clic au moment exact où la nuit s\'endort');
  hostSocket.emit('host_action', { action: 'NEXT_NIGHT' });
  hostSocket.emit('host_action', { action: 'START_COUNTDOWN', payload: { duration: 60 } });
  await wait(200);

  // Décompte se termine
  hostSocket.emit('host_action', { action: 'REVEAL_NOW' });
  await wait(50); // 50ms après la fin du décompte

  // P3 clique sur 'salle_a_manger'
  p3Socket.emit('player_choose_room', { roomId: 'salle_a_manger' });
  await wait(300);

  let test4Success = false;
  await new Promise(resolve => {
    hostSocket.once('state_updated', state => {
      const p3 = state.players.find(p => p.id === 'p3');
      console.log('Résultats Période de grâce:');
      console.log(`- P3 (Charlie): vivant=${p3.isAlive}, salle=${p3.room}, type=${p3.assignmentType}`);
      
      if (p3.isAlive && p3.room === 'salle_a_manger' && p3.assignmentType === 'chosen') {
        console.log('>>> TEST 4 RÉUSSI : Le choix tardif (période de grâce) a bien été accepté et honoré !');
        test4Success = true;
      } else {
        console.error('>>> TEST 4 ÉCHEC !');
      }
      resolve();
    });
    hostSocket.emit('host_action', { action: 'TOGGLE_TV_MAP', payload: { visible: true } });
  });

  if (!test4Success) process.exit(1);

  console.log('\n=======================================================');
  console.log('🎉 TOUS LES TESTS DU SYSTÈME ANTI-FRUSTRATION ONT RÉUSSI !');
  console.log('=======================================================');

  hostSocket.disconnect();
  p1Socket.disconnect();
  p2Socket.disconnect();
  p3Socket.disconnect();
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
