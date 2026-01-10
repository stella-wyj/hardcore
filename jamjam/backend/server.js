const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

// allow frontend to talk to backend
app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Mood API backend is running");
});

// ------------------- MOOD ANALYZER -------------------
app.post("/api/analyze-mood", (req, res) => {
  // read text from the body
  const { text } = req.body;

  // validate
  if (!text) {
    return res.status(400).json({ error: "Text input is required" });
  }

  const lower = text.toLowerCase();

  // default values
  let mood = "neutral";
  let stressLevel = 3;
  let suggestion = "Take a short break and review gently.";

  if (
    lower.includes("stressed") ||
    lower.includes("overwhelmed") ||
    lower.includes("anxious")
  ) {
    mood = "stressed";
    stressLevel = 8;
    suggestion =
      "Try 5 deep breaths, then a 25-minute focused study block with no phone.";
  } else if (
    lower.includes("sad") ||
    lower.includes("tired") ||
    lower.includes("exhausted")
  ) {
    mood = "tired/sad";
    stressLevel = 6;
    suggestion =
      "Drink water, stretch or walk for 5 minutes, then do one small easy task.";
  } else if (
    lower.includes("happy") ||
    lower.includes("excited") ||
    lower.includes("motivated")
  ) {
    mood = "motivated";
    stressLevel = 2;
    suggestion =
      "Use this energy to work on your hardest topic for 40 minutes 🎯";
  }

  // send JSON back
  res.json({ mood, stressLevel, suggestion });
});

// ------------------- STUDY CHATBOT -------------------
app.post("/api/study-chat", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  const lower = message.toLowerCase();

  let detectedTopic = "general";
  let detectedSubject = "general";
  let reply =
    "I'm here to help you study. Tell me what subject you're working on and what you're struggling with.";

  // SUBJECT detection
  if (
    lower.includes("math") ||
    lower.includes("calculus") ||
    lower.includes("algebra") ||
    lower.includes("integral") ||
    lower.includes("derivative")
  ) {
    detectedSubject = "math";
  } else if (
    lower.includes("physics") ||
    lower.includes("mechanics") ||
    lower.includes("force") ||
    lower.includes("kinematics")
  ) {
    detectedSubject = "physics";
  } else if (
    lower.includes("chem") ||
    lower.includes("redox") ||
    lower.includes("acid") ||
    lower.includes("base") ||
    lower.includes("titration")
  ) {
    detectedSubject = "chemistry";
  } else if (
    lower.includes("bio") ||
    lower.includes("biology") ||
    lower.includes("cell") ||
    lower.includes("dna") ||
    lower.includes("protein") ||
    lower.includes("genetic")
  ) {
    detectedSubject = "biology";
  } else if (
    lower.includes("code") ||
    lower.includes("programming") ||
    lower.includes("java") ||
    lower.includes("python") ||
    lower.includes("algorithm") ||
    lower.includes("bug") ||
    lower.includes("error")
  ) {
    detectedSubject = "computer science";
  } else if (
    lower.includes("essay") ||
    lower.includes("paragraph") ||
    lower.includes("thesis") ||
    lower.includes("analysis") ||
    lower.includes("english")
  ) {
    detectedSubject = "english / writing";
  }

  // TOPIC detection
  if (
    lower.includes("cant focus") ||
    lower.includes("can't focus") ||
    lower.includes("distracted") ||
    lower.includes("procrastinating") ||
    lower.includes("procrastination")
  ) {
    detectedTopic = "focus";
    reply =
      "Totally get that. Put your phone in another room, set a 25-minute timer, and choose ONE tiny task. When the timer ends, take a 5-minute break, then repeat. This Pomodoro pattern is great for focus.";
  } else if (
    lower.includes("exam") ||
    lower.includes("midterm") ||
    lower.includes("test") ||
    lower.includes("quiz")
  ) {
    detectedTopic = "exam planning";
    reply =
      "For an exam, do this: (1) list all topics, (2) star weak ones, (3) review a weak topic for 25 minutes, (4) do 5–10 practice questions, (5) review mistakes, then move to the next topic.";
  } else if (
    lower.includes("overwhelmed") ||
    lower.includes("too much") ||
    lower.includes("dont know where to start") ||
    lower.includes("don't know where to start")
  ) {
    detectedTopic = "overwhelm";
    reply =
      "When it feels like too much, brain-dump all tasks on paper. Pick the TOP 3 for today, and break each into tiny steps like 'read 3 pages' or 'do 2 questions'. Start with the easiest step.";
  } else if (
    lower.includes("memorize") ||
    lower.includes("remember") ||
    lower.includes("flashcard") ||
    lower.includes("content heavy")
  ) {
    detectedTopic = "memorization";
    reply =
      "For memorization: turn notes into questions/flashcards, quiz yourself without looking, space reviews over several days, and explain the idea out loud as if teaching a friend.";
  } else if (
    lower.includes("dont understand") ||
    lower.includes("don't understand") ||
    lower.includes("confused") ||
    lower.includes("concept")
  ) {
    detectedTopic = "concept understanding";
    reply =
      "When you don’t understand a concept, find a simple explanation, rewrite it in your own words, create a tiny example, and explain it step-by-step out loud.";
  }

  // add subject-specific tail
  if (detectedSubject === "math") {
    reply +=
      " For math, focus on practice problems: look at an example, cover the solution, then try a similar question yourself and only peek when you're stuck.";
  } else if (detectedSubject === "physics") {
    reply +=
      " For physics, always draw a diagram, write known values, choose the right formula, and solve symbolically before plugging numbers.";
  } else if (detectedSubject === "chemistry") {
    reply +=
      " For chemistry, practice identifying reaction types and do lots of calculation questions, writing each step clearly.";
  } else if (detectedSubject === "biology") {
    reply +=
      " For biology, use diagrams/flow charts and quiz yourself on each step of key processes like DNA replication or respiration.";
  } else if (detectedSubject === "computer science") {
    reply +=
      " For programming, write pseudocode first, then code. Test with small inputs and use print statements to see what your code is doing.";
  } else if (detectedSubject === "english / writing") {
    reply +=
      " For essays, start with a clear thesis, then three bullet-point reasons. Turn each bullet into a paragraph with a topic sentence, evidence, and one sentence explaining why that evidence matters.";
  }

  res.json({ reply, detectedTopic, detectedSubject });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
