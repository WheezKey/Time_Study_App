// Timer variables
let timer;
let isRunning = false;
let timeLeft = 60 * 60;
let currentSessionTime = 60 * 60;
let sessionCount = 0;
let breakCount = 0;
let isBreakTime = false;

// DOM elements
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const sessionBtns = document.querySelectorAll(".session-btn");
const sessionCountDisplay = document.getElementById("sessionCount");
const breakCountDisplay = document.getElementById("breakCount");

// Format time
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

// Update display
function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
}

// Start timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startRetroAnimation(); // Added retro glow animation
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();

      if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
        stopRetroAnimation(); // Stop animation when timer ends
        playNotification();

        if (!isBreakTime) {
          sessionCount++;
          sessionCountDisplay.textContent = sessionCount;
          alert("Study session completed! Time for a break.");
          isBreakTime = true;
          timeLeft = 5 * 60;
          currentSessionTime = 5 * 60;
        } else {
          breakCount++;
          breakCountDisplay.textContent = breakCount;
          alert("Break time over! Ready for another study session?");
          isBreakTime = false;
          timeLeft = currentSessionTime;
        }
        updateDisplay();
      }
    }, 1000);
  }
}

// Pause timer
function pauseTimer() {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
    stopRetroAnimation(); // Stop retro animation when paused
  }
}

// Reset timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = currentSessionTime;
  updateDisplay();
  stopRetroAnimation(); // Stop animation on reset
}

// Set session
function setSessionTime(minutes) {
  if (!isRunning) {
    currentSessionTime = minutes * 60;
    timeLeft = currentSessionTime;
    updateDisplay();
    sessionBtns.forEach((btn) => {
      btn.classList.remove("active");
      if (parseInt(btn.dataset.time) === minutes) btn.classList.add("active");
    });
  }
}

// Notification sound (custom retro synth version)
function playNotification() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  // Retro synth melody
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

  oscillator.frequency.linearRampToValueAtTime(
    660,
    audioCtx.currentTime + 0.15
  );
  oscillator.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.3);
  oscillator.frequency.linearRampToValueAtTime(
    440,
    audioCtx.currentTime + 0.45
  );

  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
}

// Events
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
sessionBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    if (!isRunning) setSessionTime(parseInt(btn.dataset.time));
  })
);

updateDisplay();

// UTILITIES
const qs = (id) => document.getElementById(id);
const extractId = (url) =>
  (url.match(/playlist\/([a-zA-Z0-9]+)/) || [])[1] || "";

// Background GIF
function setBackground(url) {
  document.body.style.backgroundImage = `url('${url}')`;
  document.body.style.transition = "background-image 0.8s ease-in-out"; // Smooth theme change
  localStorage.setItem("pixelTimerBG", url);
}
(function initBG() {
  const saved = localStorage.getItem("pixelTimerBG");
  if (saved) setBackground(saved);
  qs("bgSel").value = saved || qs("bgSel").value;
  qs("bgSel").addEventListener("change", (e) => setBackground(e.target.value));
})();

// Spotify widget
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

// === Background Theme Selector ===
const bgSelect = document.getElementById("bgSel");

function changeBackground(path) {
  document.body.style.backgroundImage = `url(${path})`;
  document.body.style.transition = "background-image 0.8s ease-in-out"; // Smooth transition
  localStorage.setItem("selectedBG", path);
}

// Load background when page loads
const savedBG = localStorage.getItem("selectedBG");
if (savedBG) changeBackground(savedBG);

// change background on selection changes
bgSelect.addEventListener("change", (e) => {
  const selectedPath = e.target.value;
  changeBackground(selectedPath);
});

// === Retro Animation Effect ===
function startRetroAnimation() {
  const display = document.getElementById("timer");
  display.classList.add("retro-glow");

  // subtle vibration effect every frame
  const interval = setInterval(() => {
    if (!isRunning) {
      clearInterval(interval);
      display.classList.remove("retro-glow");
    } else {
      display.style.transform = `translate(${Math.random() * 2 - 1}px, ${
        Math.random() * 2 - 1
      }px)`;
    }
  }, 100);
}

function stopRetroAnimation() {
  const display = document.getElementById("timer");
  display.classList.remove("retro-glow");
  display.style.transform = "none";
}
