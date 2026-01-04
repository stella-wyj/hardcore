
// ===== TIMER LOGIC =====
// ===== TIMER LOGIC WITH 4 BLOCKS =====
let totalDuration   = 25 * 60;   // total session time in seconds (default 25 min)
let numSections     = 4;
let sectionDuration = totalDuration / numSections;

let timeLeft       = sectionDuration;  // we time ONE block at a time
let currentSection = 1;
let timerInterval  = null;
let isRunning      = false;

// Quest tracking
let totalElapsedSeconds = 0;  // total time elapsed since timer started
let lastQuestTime = 0;        // time when last quest was given (in seconds)
let questInterval = 30 * 60;  // 30 minutes in seconds
let currentQuest = null;
let questCompleted = false;

const display      = document.getElementById("timer-display");
const startBtn     = document.getElementById("start-btn");
const pauseBtn     = document.getElementById("pause-btn");
const resetBtn     = document.getElementById("reset-btn");
const sectionLabel = document.getElementById("section-label");

// Quest elements
const questText = document.getElementById("quest-text");
const questTimer = document.getElementById("quest-timer");
const completeQuestBtn = document.getElementById("complete-quest-btn");

// NEW: Start session button + modal elements
const openSessionBtn     = document.getElementById("open-session-btn");
const sessionModalOverlay = document.getElementById("session-modal-overlay");
const modalTotalInput    = document.getElementById("modal-total-min");
const modalStartBtn      = document.getElementById("modal-start-btn");
const modalCancelBtn     = document.getElementById("modal-cancel-btn");

function updateDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  display.textContent = `${minutes}:${seconds}`;
}

function updateSectionLabel() {
  if (!sectionLabel) return;
  sectionLabel.textContent = `Block ${currentSection} / ${numSections}`;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  
  // Give first quest immediately when timer starts
  if (totalElapsedSeconds === 0) {
    giveNewQuest();
  }
  
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      totalElapsedSeconds++;
      updateDisplay();
      checkQuestTimer();
    } else {
      // current block finished
      if (currentSection < numSections) {
        currentSection++;
        timeLeft = sectionDuration;
        updateSectionLabel();
        updateDisplay();
      } else {
        // all blocks done
        clearInterval(timerInterval);
        isRunning = false;
      }
    }
  }, 1000);
}

// OPEN modal when "Start session" clicked
openSessionBtn.addEventListener("click", () => {
  // pause any running timer
  isRunning = false;
  clearInterval(timerInterval);

  // show modal
  sessionModalOverlay.classList.add("show");
});

// CANCEL modal
modalCancelBtn.addEventListener("click", () => {
  sessionModalOverlay.classList.remove("show");
});

// CONFIRM modal ("Begin")
modalStartBtn.addEventListener("click", () => {
  const mins = parseInt(modalTotalInput.value, 10);
  if (isNaN(mins) || mins <= 0) return;

  totalDuration   = mins * 60;
  sectionDuration = Math.floor(totalDuration / numSections);

  currentSection = 1;
  timeLeft = sectionDuration;
  totalElapsedSeconds = 0;
  lastQuestTime = 0;
  currentQuest = null;
  questCompleted = false;

  updateSectionLabel();
  updateDisplay();
  resetQuestDisplay();

  // hide modal
  sessionModalOverlay.classList.remove("show");

  // OPTION 1: auto-start timer immediately:
  // startTimer();

  // OPTION 2: let user press the normal "Start" button to begin:
  // (if you prefer this, just leave startTimer() commented out)
});

// Timer control buttons
startBtn.addEventListener("click", () => {
  startTimer();
});

pauseBtn.addEventListener("click", () => {
  isRunning = false;
  clearInterval(timerInterval);
  // Note: totalElapsedSeconds is not reset on pause, so quest timing continues correctly
});

resetBtn.addEventListener("click", () => {
  isRunning = false;
  clearInterval(timerInterval);

  currentSection = 1;
  timeLeft = sectionDuration;
  totalElapsedSeconds = 0;
  lastQuestTime = 0;
  currentQuest = null;
  questCompleted = false;

  updateSectionLabel();
  updateDisplay();
  resetQuestDisplay();
});

// initialize
updateSectionLabel();
updateDisplay();


// ===== ICON → SIDE PANEL LOGIC =====
const iconButtons = document.querySelectorAll(".icon-btn");
const sidePanels  = document.querySelectorAll(".side-panel");
const overlay     = document.getElementById("overlay");

function closeAllPanels() {
  sidePanels.forEach(panel => panel.classList.remove("open"));
  if (overlay) overlay.classList.remove("show");
}

iconButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const panelId = btn.getAttribute("data-panel");
    const panel   = document.getElementById(panelId);
    if (!panel) return;

    const isOpen = panel.classList.contains("open");

    // close everything
    closeAllPanels();

    // if this one was closed, open it
    if (!isOpen) {
      panel.classList.add("open");
      if (overlay) overlay.classList.add("show");
    }
  });
});

if (overlay) {
  overlay.addEventListener("click", closeAllPanels);
}

// ===== QUEST LOGIC =====
const quests = [
  "Do 10 jumping jacks",
  "Touch your toes 10 times",
  "Do 10 lunges (5 each leg)",
  "Do 10 burpees",
  "Do 20 squats",
  "Hold a plank for 30 seconds",
  "Do 15 push-ups",
  "Stretch your arms overhead for 30 seconds",
  "Do 10 high knees",
  "Do 20 calf raises",
  "Walk in place for 1 minute",
  "Do 10 side lunges (5 each side)",
  "Do 15 mountain climbers",
  "Stretch your neck and shoulders",
  "Do 10 leg raises",
  "Do 20 arm circles (10 each direction)",
  "Stand up and stretch for 1 minute",
  "Do 10 wall push-ups",
  "Do 15 butt kicks",
  "Take 10 deep breaths while stretching"
];

function getRandomQuest() {
  const availableQuests = quests.filter(q => q !== currentQuest);
  return availableQuests[Math.floor(Math.random() * availableQuests.length)];
}

function checkQuestTimer() {
  // Check if 30 minutes have passed since last quest
  if (totalElapsedSeconds - lastQuestTime >= questInterval) {
    giveNewQuest();
  }
  
  // Update quest timer display
  if (currentQuest && questTimer) {
    const timeSinceLastQuest = totalElapsedSeconds - lastQuestTime;
    const timeUntilNext = questInterval - timeSinceLastQuest;
    
    if (timeUntilNext > 0) {
      const minutes = Math.floor(timeUntilNext / 60);
      const seconds = timeUntilNext % 60;
      questTimer.textContent = `Next quest in: ${minutes}:${String(seconds).padStart(2, "0")}`;
    } else {
      questTimer.textContent = "";
    }
  }
}

function giveNewQuest() {
  currentQuest = getRandomQuest();
  lastQuestTime = totalElapsedSeconds;
  questCompleted = false;
  
  if (questText) {
    questText.textContent = `⚔️ ${currentQuest}`;
  }
  if (questTimer) {
    questTimer.textContent = "";
  }
  if (completeQuestBtn) {
    completeQuestBtn.style.display = "block";
  }
}

function resetQuestDisplay() {
  if (questText) {
    questText.textContent = "Start your timer to begin quests!";
  }
  if (questTimer) {
    questTimer.textContent = "";
  }
  if (completeQuestBtn) {
    completeQuestBtn.style.display = "none";
  }
}

// Complete quest button handler
if (completeQuestBtn) {
  completeQuestBtn.addEventListener("click", () => {
    if (currentQuest && !questCompleted) {
      questCompleted = true;
      questText.textContent = `✅ Completed: ${currentQuest}`;
      // Keep showing the countdown timer (it will update automatically)
      completeQuestBtn.style.display = "none";
      
      // The next quest will automatically appear when 30 minutes have passed
      // (handled by checkQuestTimer in the timer interval)
    }
  });
}

// ===== CHATBOT LOGIC =====
const API_BASE = "http://localhost:4000";

// Call Akhila's Study Chatbot API
async function askStudyBot(message) {
  const res = await fetch(`${API_BASE}/api/study-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  if (!res.ok) {
    throw new Error("Study chat API error");
  }

  return await res.json(); // { reply, detectedTopic, detectedSubject }
}
