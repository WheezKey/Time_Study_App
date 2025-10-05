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
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();

      if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
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

// === Background Auto Change === //

// Background List
const bgList = [
  "assets/bg/neon.gif", // sesi 1
  "assets/bg/stars.gif", // sesi 2
  "assets/bg/wave.gif", // sesi 3
  "assets/bg/palm.gif", // sesi 4
  "assets/bg/rain.gif", // sesi 5
];

let currentSession = parseInt(localStorage.getItem("sessionNumber")) || 0;

// Change Background Function
function changeBackgroundAuto() {
  const bg = bgList[currentSession % bgList.length];
  document.body.style.backgroundImage = `url(${bg})`;
  document.body.style.transition = "background-image 1s ease-in-out";
  localStorage.setItem("sessionNumber", currentSession);
}

// Run Background when first load
changeBackgroundAuto();

// Function to change background on 1 session completion
function nextSession() {
  currentSession++;
  if (currentSession >= bgList.length) {
    currentSession = 0; // back to first background
  }
  changeBackgroundAuto();
}

// Call nextSession when a study session is completed
function finishSession() {
  alert("Study session completed! Time for a break.💪");
  nextSession();
}
// Pause timer
function pauseTimer() {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
  }
}

// Reset timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = currentSessionTime;
  updateDisplay();
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

// Notification sound
function playNotification() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = "square";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.5
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
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
