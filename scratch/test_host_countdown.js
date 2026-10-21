const { io } = require("socket.io-client");

async function testCountdown() {
  console.log("Connecting socket to http://localhost:3000...");
  const socket = io("http://localhost:3000");

  let receivedState = false;
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("state_updated", (state) => {
    console.log("Received initial state_updated! Phase:", state.phase, "aliveCount:", state.aliveCount);
    receivedState = true;
  });

  // Wait 500ms
  await new Promise(r => setTimeout(r, 600));

  if (!receivedState) {
    console.error("FAIL: Did not receive state_updated on initial connect!");
    process.exit(1);
  }

  console.log("Simulating mobile host tapping 'Lancer le décompte'...");
  socket.emit("host_action", { action: "START_COUNTDOWN", payload: { duration: 60 } });

  let countdownStarted = false;
  socket.on("timer_tick", ({ remaining, phase }) => {
    console.log(`timer_tick received: remaining=${remaining}, phase=${phase}`);
    if (phase === "COUNTDOWN" && remaining <= 60) {
      countdownStarted = true;
    }
  });

  await new Promise(r => setTimeout(r, 1500));

  if (countdownStarted) {
    console.log("SUCCESS: Countdown started successfully!");
    // Reset back to WAITING
    socket.emit("host_action", { action: "RESET_ALL" });
    await new Promise(r => setTimeout(r, 500));
    socket.disconnect();
    process.exit(0);
  } else {
    console.error("FAIL: Countdown did not start!");
    socket.disconnect();
    process.exit(1);
  }
}

testCountdown().catch(err => {
  console.error("Error in test:", err);
  process.exit(1);
});
