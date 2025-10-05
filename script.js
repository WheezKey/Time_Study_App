// Timer Variables
let timer;
let isRunning = false;
let timeleft = 60 * 60; // 60 minutes in seconds
let currentSessionTime = 60 * 60; // 60 minutes in seconds
let sessionCount = 0;
let breakCount = 0;
let isBreak = false;

// DOM Elements
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const sessionCountDisplay = document.getElementById("session-count");
const breakCountDisplay = document.getElementById("break-count");
const sessionDurationInput = document.getElementById("session-duration");
const breakDurationInput = document.getElementById("break-duration");

// Front Time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(remainingSeconds).padStart(
    2,
    "0"
  )}`;
}

// Update Display
function updateDisplay() {
  timerDisplay.textContent = formatTime(timeleft);
}

// Start Timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(() => {
      timeleft--;
      updateDisplay();

      if (timeleft <= 0) {
        clearInterval(timer);
        isRunning = false;
        playNotification();

        if (isBreak) {
          sessionCount++;
          sessionCountDisplay.textContent = sessionCount;
          alert("Study Session Complete! Time for a break.");
          isBreak = true;
          timeleft = 5 * 60; // 5 minutes break
        } else {
          breakCount++;
          breakCountDisplay.textContent = breakCount;
          alert("Break Over! Time to study.");
          isBreak = false;
          timeleft = currentSessionTime; // Reset to session time
        }
        updateDisplay();
      }
    }, 1000);
  }
}

// Pause Timer
function pauseTimer() {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
  }
}

// Reset Timer
function resetTimer() {
  clearIntervaal(timer);
  isRunning = false;
  timeleft = currentSessionTime;
  updateDisplay();
}

// Set Session Duration
function setSessionTime(minutes) {
  if (!isRunning && !isBreak) {
    currentSessionTime = minutes * 60;
    timeleft = currentSessionTime;
    updateDisplay();
    sessionBtns.forEach((btn) => {
      btn.classList.remove("active");
      if (parseInt(btn.dataset.time) === minutes) btn.classList.add("active");
    });
  }
}

// Notification Sound
function playNotification() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800; // Frequency in Hz
  oscillator.type = "square";

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 5
  ); // Fade out

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 5); // Stop after 5 seconds
}

// Event Listeners
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
sessionBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    if (!isRunning) setSessionTime(parseInt(btn.dataset.time));
  })
);

updateDisplay();

// Utilities
const qs = (id) => document.getElementById(id);
const extractId = (url) => (url.match(/playlist\/([a-zA-Z0-9]+)/) || [])[1];

// Background GIF
(function setBackgroundGif(url) {
  const saved = localStorage.getItem("pixelTimerBG");
  if (saved) setBackgroundGif(saved);
  qs("bgSel").value = saved || qs("bgSel").value;
  qs("bgSel").addEventListener("change", (e) =>
    setBackgroundGif(e.target.value)
  );
})();

// Spotify Widget
(function initSpotify() {
  const player = qs("spotifyPlayer");
  const urlBar = qs("urlBar");
  const saved = localStorage.getItem("pixelTimerPlaylist");
  if (saved) {
    urlBar.value = saved;
    player.src = `https://open.spotify.com/embed/playlist/${extractId(
      saved
    )}?utm_source=generator`;
  }
  qs("loadBtn").onclick = () => {
    const url = urlBar.value.trim();
    const id = extractId(url);
    if (id) {
      player.src = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator`;
      localStorage.setItem("pixelTimerPlaylist", url);
    } else {
      alert("⚠️ Please paste a valid Spotify playlist URL");
    }
  };
})();
