const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory data model
const db = {
  courses: []
};

// --- Course Endpoints ---

// Create a new course
app.post('/courses', (req, res) => {
  const { name, color, goalGrade, assessments } = req.body;
  const newCourse = {
    id: uuidv4(),
    name,
    color: color || '#cccccc',
    goalGrade: goalGrade || null,
    assessments: assessments || []
  };
  db.courses.push(newCourse);
  res.status(201).json(newCourse);
});

// List all courses
app.get('/courses', (req, res) => {
  res.json(db.courses);
});

// Get course details
app.get('/courses/:id', (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

// Update course
app.put('/courses/:id', (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const { name, color, goalGrade } = req.body;
  if (name) course.name = name;
  if (color) course.color = color;
  if (goalGrade !== undefined) course.goalGrade = goalGrade;
  res.json(course);
});

// Delete course
app.delete('/courses/:id', (req, res) => {
  const idx = db.courses.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });
  db.courses.splice(idx, 1);
  res.status(204).end();
});

// --- Assessment Endpoints ---

// Add assessment(s) to a course
app.post('/courses/:id/assessments', (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  let assessments = req.body;
  if (!Array.isArray(assessments)) assessments = [assessments];
  const newAssessments = assessments.map(a => ({
    id: uuidv4(),
    title: a.title,
    type: a.type,
    dueDate: a.dueDate,
    weight: a.weight,
    grade: a.grade || null
  }));
  course.assessments.push(...newAssessments);
  res.status(201).json(newAssessments);
});

// Update assessment
app.put('/courses/:id/assessments/:aid', (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const assessment = course.assessments.find(a => a.id === req.params.aid);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
  const { title, type, dueDate, weight } = req.body;
  if (title) assessment.title = title;
  if (type) assessment.type = type;
  if (dueDate) assessment.dueDate = dueDate;
  if (weight !== undefined) assessment.weight = weight;
  res.json(assessment);
});

// Delete assessment
app.delete('/courses/:id/assessments/:aid', (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const idx = course.assessments.findIndex(a => a.id === req.params.aid);
  if (idx === -1) return res.status(404).json({ error: 'Assessment not found' });
  course.assessments.splice(idx, 1);
  res.status(204).end();
});

// --- Grade Management ---

// Add/update grade for an assessment
app.post('/courses/:id/assessments/:aid/grade', (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const assessment = course.assessments.find(a => a.id === req.params.aid);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
  const { grade } = req.body;
  if (grade === undefined || grade === null) return res.status(400).json({ error: 'Grade required' });
  assessment.grade = grade;
  res.json(assessment);
});

// --- Grade Summary ---

app.get('/courses/:id/grade-summary', (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const { assessments, goalGrade } = course;
  const graded = assessments.filter(a => a.grade !== null && a.grade !== undefined);
  const ungraded = assessments.filter(a => a.grade === null || a.grade === undefined);
  const gradedWeight = graded.reduce((sum, a) => sum + (a.weight || 0), 0);
  const gradedScore = graded.reduce((sum, a) => sum + ((a.grade || 0) * (a.weight || 0)), 0);
  const totalWeight = assessments.reduce((sum, a) => sum + (a.weight || 0), 0);
  const currentGrade = gradedWeight > 0 ? (gradedScore / gradedWeight) : null;
  let requiredAvg = null;
  if (goalGrade !== null && ungraded.length > 0) {
    const needed = (goalGrade * totalWeight - gradedScore) / (totalWeight - gradedWeight);
    requiredAvg = needed > 0 ? needed : 0;
  }
  res.json({
    currentGrade,
    requiredAvg,
    gradedWeight,
    totalWeight,
    graded,
    ungraded
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 