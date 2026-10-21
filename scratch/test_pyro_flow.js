const io = require('socket.io-client');

async function testPyromaneFlow() {
  console.log('Testing Pyromane Secret Night Explosion & Dawn Bilan Flow...');
  const host = io('http://localhost:3000');
  const player = io('http://localhost:3000');
  const tv = io('http://localhost:3000');

  await new Promise(r => setTimeout(r, 500));

  // 1. Reset game
  host.emit('host_action', { action: 'RESET_ALL', payload: { resetScores: true } });
  await new Promise(r => setTimeout(r, 300));

  // 2. Join player
  const playerId = 'test_pyro_victim';
  player.emit('player_join', { id: playerId, name: 'Alice_Test', avatar: '🌸' });
  await new Promise(r => setTimeout(r, 300));

  // 3. Start countdown and choose room 'chambre'
  host.emit('host_action', { action: 'START_COUNTDOWN', payload: { duration: 60 } });
  await new Promise(r => setTimeout(r, 300));

  player.emit('player_choose_room', { roomId: 'chambre' });
  await new Promise(r => setTimeout(r, 300));

  // 4. End countdown -> NIGHT_ASLEEP
  host.emit('host_action', { action: 'REVEAL_NOW' });
  await new Promise(r => setTimeout(r, 400));

  let hostState = null;
  let tvState = null;
  host.on('state_updated', s => { hostState = s; });
  tv.on('state_updated', s => { tvState = s; });

  // 5. Host blows up 'chambre' with Pyromane during the night
  console.log('--- Triggering DESTROY_ROOM on chambre during night ---');
  let hostReceivedExplosion = false;
  host.once('room_exploded', (data) => {
    hostReceivedExplosion = true;
    console.log('✓ Host received room_exploded:', data.roomId, 'victims:', data.victims.map(v => v.name));
  });

  let tvReceivedPrematureExplosion = false;
  tv.on('room_exploded', () => {
    tvReceivedPrematureExplosion = true;
  });

  host.emit('host_action', { action: 'DESTROY_ROOM', payload: { roomId: 'chambre', killOccupants: true } });
  await new Promise(r => setTimeout(r, 500));

  if (!hostReceivedExplosion) throw new Error('Host did not receive room_exploded!');
  if (tvReceivedPrematureExplosion) console.log('Notice: TV socket received room_exploded event (will be ignored during night by client handler)');

  console.log('Host state destroyedRooms:', hostState.destroyedRooms);
  console.log('Host state nightExplodedRooms:', hostState.nightExplodedRooms);
  console.log('Host state pendingNightEliminations:', hostState.pendingNightEliminations);

  const victimPlayer = hostState.players.find(p => p.id === playerId);
  console.log('Victim player during night: isAlive =', victimPlayer.isAlive, 'eliminatedReason =', victimPlayer.eliminatedReason);
  if (!victimPlayer.isAlive) throw new Error('Player should remain alive during the night until dawn reveal!');
  if (victimPlayer.eliminatedReason !== 'pyromane') throw new Error('Player should be marked with eliminatedReason pyromane!');

  // Check TV secret logic:
  const isNightExplosion = tvState.nightExplodedRooms.includes('chambre');
  const isDestroyedOnTv = tvState.destroyedRooms.includes('chambre') && (tvState.phase === 'REVEALED' || !isNightExplosion);
  console.log('On TV during night: isDestroyedOnTv =', isDestroyedOnTv, '(Expect FALSE to hide from TV)');
  if (isDestroyedOnTv) throw new Error('Room should NOT appear destroyed on TV during the night!');

  // 6. Host reveals night deaths at dawn
  console.log('--- Triggering REVEAL_NIGHT_DEATHS ---');
  let tvRevealedData = null;
  tv.once('night_deaths_revealed', (data) => {
    tvRevealedData = data;
    console.log('✓ TV received night_deaths_revealed:');
    console.log('  - Victims count:', data.victims.length);
    console.log('  - Victims:', data.victims.map(v => `${v.name} (${v.reasonText}) in ${v.roomName}`));
    console.log('  - Exploded rooms:', data.explodedRooms);
  });

  host.emit('host_action', { action: 'REVEAL_NIGHT_DEATHS', payload: { victims: [] } });
  await new Promise(r => setTimeout(r, 600));

  if (!tvRevealedData) throw new Error('TV did not receive night_deaths_revealed!');
  if (tvRevealedData.victims.length === 0) throw new Error('Exploded player missing from night_deaths_revealed victims!');
  if (!tvRevealedData.explodedRooms.includes('chambre')) throw new Error('chambre missing from explodedRooms in night_deaths_revealed!');

  const victimInBilan = tvRevealedData.victims.find(v => v.id === playerId);
  if (!victimInBilan) throw new Error('Victim Alice not found in Bilan des morts!');
  console.log('✓ Victim Alice successfully found in Bilan des morts with reasonText:', victimInBilan.reasonText);

  // Now check TV state in REVEALED phase:
  const isDestroyedOnTvDawn = tvState.destroyedRooms.includes('chambre') && (tvState.phase === 'REVEALED' || !tvState.nightExplodedRooms.includes('chambre'));
  console.log('On TV at dawn: isDestroyedOnTv =', isDestroyedOnTvDawn, '(Expect TRUE)');
  if (!isDestroyedOnTvDawn) throw new Error('Room should appear destroyed on TV after dawn reveal!');

  console.log('\n=========================================');
  console.log('🎉 ALL PYROMANE SECRECY & REVEAL TESTS PASSED!');
  console.log('=========================================');

  host.disconnect();
  player.disconnect();
  tv.disconnect();
  process.exit(0);
}

testPyromaneFlow().catch(err => {
  console.error('Test FAILED:', err);
  process.exit(1);
});
