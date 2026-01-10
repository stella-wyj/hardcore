// ===== TIMER LOGIC =====
let totalDuration = 25 * 60;
let numSections = 4;
let sectionDuration = totalDuration / numSections;
let timeLeft = sectionDuration;
let currentSection = 1;
let timerInterval = null;
let isRunning = false;

// Quest tracking
let totalElapsedSeconds = 0;
let lastQuestTime = 0;
let questInterval = 30 * 60; // 30 minutes
let currentQuest = null;
let questCompleted = false;

const display = document.getElementById("timer-display");
const timerLabel = document.getElementById("timer-label");
const sectionLabel = document.getElementById("section-label");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

// Quest elements
const questText = document.getElementById("quest-text");
const questTimer = document.getElementById("quest-timer");
const completeQuestBtn = document.getElementById("complete-quest-btn");

// Session modal
const startSessionBtn = document.getElementById("start-session-btn");
const sessionModal = document.getElementById("session-modal");
const totalMinutesInput = document.getElementById("total-minutes");
const modalCancel = document.getElementById("modal-cancel");
const modalStart = document.getElementById("modal-start");

const quests = [
  "Do 10 jumping jacks 🏃",
  "Touch your toes 10 times 🧘",
  "Do 10 lunges (5 each leg) 💪",
  "Do 10 burpees 🔥",
  "Do 20 squats 🦵",
  "Hold a plank for 30 seconds ⏱️",
  "Do 15 push-ups 💪",
  "Stretch your arms overhead for 30 seconds 🙆",
  "Do 10 high knees 🏃",
  "Do 20 calf raises 🦶",
  "Walk in place for 1 minute 🚶",
  "Do 10 side lunges (5 each side) 🏋️",
  "Do 15 mountain climbers 🏔️",
  "Stretch your neck and shoulders 🧘",
  "Do 10 leg raises 🦵",
  "Do 20 arm circles (10 each direction) 🔄",
  "Stand up and stretch for 1 minute 🌟",
  "Do 10 wall push-ups 🏠",
  "Do 15 butt kicks 🦶",
  "Take 10 deep breaths while stretching 🌬️"
];

function updateDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  display.textContent = `${minutes}:${seconds}`;
}

function updateSectionLabel() {
  sectionLabel.textContent = `Block ${currentSection} / ${numSections}`;
}

function getRandomQuest() {
  const availableQuests = quests.filter(q => q !== currentQuest);
  return availableQuests[Math.floor(Math.random() * availableQuests.length)];
}

function giveNewQuest() {
  currentQuest = getRandomQuest();
  lastQuestTime = totalElapsedSeconds;
  questCompleted = false;
  questText.textContent = currentQuest;
  questTimer.textContent = "";
  completeQuestBtn.style.display = "block";
}

function checkQuestTimer() {
  if (totalElapsedSeconds - lastQuestTime >= questInterval) {
    giveNewQuest();
  }

  if (currentQuest && questTimer) {
    const timeSinceLastQuest = totalElapsedSeconds - lastQuestTime;
    const timeUntilNext = questInterval - timeSinceLastQuest;

    if (timeUntilNext > 0) {
      const minutes = Math.floor(timeUntilNext / 60);
      const seconds = timeUntilNext % 60;
      questTimer.textContent = `Next quest in: ${minutes}:${String(seconds).padStart(2, "0")}`;
    }
  }
}

function resetQuestDisplay() {
  questText.textContent = "Start your timer to receive quests!";
  questTimer.textContent = "";
  completeQuestBtn.style.display = "none";
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      totalElapsedSeconds++;
      updateDisplay();
      checkQuestTimer();
    } else {
      if (currentSection < numSections) {
        currentSection++;
        timeLeft = sectionDuration;
        updateSectionLabel();
        updateDisplay();
      } else {
        clearInterval(timerInterval);
        isRunning = false;
        alert("🎉 Session complete! Great work!");
      }
    }
  }, 1000);
}

startBtn.addEventListener("click", startTimer);

pauseBtn.addEventListener("click", () => {
  isRunning = false;
  clearInterval(timerInterval);
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

completeQuestBtn.addEventListener("click", () => {
  if (currentQuest && !questCompleted) {
    questCompleted = true;
    questText.textContent = `✅ Completed: ${currentQuest}`;
    completeQuestBtn.style.display = "none";
  }
});

// Session modal
startSessionBtn.addEventListener("click", () => {
  sessionModal.classList.add("show");
});

modalCancel.addEventListener("click", () => {
  sessionModal.classList.remove("show");
});

modalStart.addEventListener("click", () => {
  const mins = parseInt(totalMinutesInput.value, 10);
  if (isNaN(mins) || mins <= 0) return;

  totalDuration = mins * 60;
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
  sessionModal.classList.remove("show");
});

updateSectionLabel();
updateDisplay();

// ===== TASKS LOGIC =====
const tasksList = document.getElementById("tasks-list");
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");

let tasks = [];

function renderTasks() {
  tasksList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const checkbox = document.createElement("div");
    checkbox.className = `task-checkbox ${task.completed ? 'checked' : ''}`;
    checkbox.onclick = () => toggleTask(index);

    const text = document.createElement("span");
    text.className = `task-text ${task.completed ? 'completed' : ''}`;
    text.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-delete";
    deleteBtn.textContent = "×";
    deleteBtn.onclick = () => deleteTask(index);

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    tasksList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    taskInput.value = "";
    renderTasks();
  }
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

// ===== WATER TRACKER =====
const waterGrid = document.getElementById("water-grid");
const waterCount = document.getElementById("water-count");
let waterGlasses = 0;

for (let i = 0; i < 8; i++) {
  const glass = document.createElement("div");
  glass.className = "water-glass";
  glass.dataset.index = i;
  glass.textContent = "💧";
  glass.addEventListener("click", () => {
    if (glass.classList.contains("filled")) {
      glass.classList.remove("filled");
      waterGlasses--;
    } else {
      glass.classList.add("filled");
      waterGlasses++;
    }
    waterCount.textContent = waterGlasses;
  });
  waterGrid.appendChild(glass);
}

// ===== CHAT LOGIC =====
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSendBtn = document.getElementById("chat-send-btn");

const studyResponses = {
  math: [
    "Math can be challenging! Break it down into smaller steps. What specific topic are you working on?",
    "Remember: practice makes perfect with math. Try solving similar problems to build confidence!",
    "Math tip: Draw diagrams to visualize problems. It helps a lot!"
  ],
  science: [
    "Science is all about understanding patterns! What subject are you studying?",
    "Try connecting concepts to real-world examples - it makes science more memorable!",
    "Don't forget to review your notes regularly. Science builds on itself!"
  ],
  history: [
    "History tip: Create a timeline to see how events connect!",
    "Try to understand the 'why' behind historical events, not just the 'what'.",
    "Making flashcards can really help with dates and key figures!"
  ],
  english: [
    "Reading comprehension improves with practice. Take notes while you read!",
    "Writing tip: Always outline your essay before you start writing.",
    "Try reading your work out loud - you'll catch errors you might miss otherwise!"
  ],
  motivation: [
    "You're doing great! Keep up the good work! 💪",
    "Remember why you started. You've got this! 🌟",
    "Take breaks when needed, but don't give up! Small progress is still progress! 🎯"
  ],
  break: [
    "Great idea! Take a 5-10 minute break. Walk around, stretch, or grab a snack!",
    "Breaks are important for learning! Rest your mind and come back refreshed.",
    "During your break, avoid screens if possible. Your eyes need a rest too!"
  ],
  default: [
    "I'm here to help! Tell me more about what you're studying.",
    "That's a great question! How can I support your learning today?",
    "Let's work through this together. What would you like to focus on?",
    "Remember to stay hydrated and take breaks! What do you need help with?"
  ]
};

function detectTopic(message) {
  const lower = message.toLowerCase();
  if (lower.includes("math") || lower.includes("algebra") || lower.includes("calculus") || lower.includes("geometry")) {
    return "math";
  } else if (lower.includes("science") || lower.includes("biology") || lower.includes("chemistry") || lower.includes("physics")) {
    return "science";
  } else if (lower.includes("history") || lower.includes("social studies")) {
    return "history";
  } else if (lower.includes("english") || lower.includes("writing") || lower.includes("essay") || lower.includes("reading")) {
    return "english";
  } else if (lower.includes("tired") || lower.includes("give up") || lower.includes("hard") || lower.includes("difficult") || lower.includes("motivat")) {
    return "motivation";
  } else if (lower.includes("break") || lower.includes("rest")) {
    return "break";
  }
  return "default";
}

function addChatMessage(text, isUser) {
  const msg = document.createElement("div");
  msg.className = `chat-message ${isUser ? 'user' : 'bot'}`;
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  addChatMessage(message, true);
  chatInput.value = "";

  setTimeout(() => {
    const topic = detectTopic(message);
    const responses = studyResponses[topic];
    const response = responses[Math.floor(Math.random() * responses.length)];
    addChatMessage(response, false);
  }, 500);
}

chatSendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});