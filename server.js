import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { processSyllabus, processAndStoreSyllabus, extractSyllabusInfo } from './api/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route serves public/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/courses', async (req, res) => {
  try {
    const { getCourseById } = await import('./api/syllabusParser.js');
    // Get all course IDs and return full course data including assessments
    const fs = await import('fs');
    const dbData = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    const courses = dbData.courses.map(course => ({
      ...course,
      assessments: dbData.assessments.filter(a => a.courseId === course.id)
    }));
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const { getCourseById, calculateGradeSummary } = await import('./api/syllabusParser.js');
    const course = getCourseById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const gradeSummary = calculateGradeSummary(parseInt(req.params.id));
    
    res.json({
      ...course,
      gradeSummary
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

app.put('/api/courses/:id', express.json(), async (req, res) => {
  try {
    const { updateCourseGoalGrade, getCourseById } = await import('./api/syllabusParser.js');
    const { goalGrade } = req.body;
    
    if (goalGrade === undefined || goalGrade === null) {
      return res.status(400).json({ error: 'Goal grade is required' });
    }

    const success = updateCourseGoalGrade(parseInt(req.params.id), goalGrade);
    if (!success) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updatedCourse = getCourseById(req.params.id);
    res.json({
      message: 'Goal grade updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

app.post('/api/courses/:id/assessments/:aid/grade', express.json(), async (req, res) => {
  try {
    const { updateAssessmentGrade } = await import('./api/syllabusParser.js');
    const { grade } = req.body;
    
    if (grade === undefined || grade === null) {
      return res.status(400).json({ error: 'Grade is required' });
    }

    if (grade < 0 || grade > 100) {
      return res.status(400).json({ error: 'Grade must be between 0 and 100' });
    }

    const success = updateAssessmentGrade(parseInt(req.params.id), parseInt(req.params.aid), grade);
    if (!success) {
      return res.status(404).json({ error: 'Course or assessment not found' });
    }

    res.json({
      message: 'Grade updated successfully',
      courseId: parseInt(req.params.id),
      assessmentId: parseInt(req.params.aid),
      grade: grade
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update grade' });
  }
});

app.delete('/api/courses/:id/assessments/:aid/grade', async (req, res) => {
  try {
    const { updateAssessmentGrade } = await import('./api/syllabusParser.js');
    
    // Set grade to null to delete it
    const success = updateAssessmentGrade(parseInt(req.params.id), parseInt(req.params.aid), null);
    if (!success) {
      return res.status(404).json({ error: 'Course or assessment not found' });
    }

    res.json({
      message: 'Grade deleted successfully',
      courseId: parseInt(req.params.id),
      assessmentId: parseInt(req.params.aid)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete grade' });
  }
});

app.post('/upload', upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    console.log(`📄 Processing uploaded file: ${req.file.filename}`);
    
    // Process the syllabus and store in database
    const result = await processAndStoreSyllabus(req.file.path);
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      extractedInfo: result.rawResponse,
      parsedData: result.parsedData,
      courseId: result.courseId,
      course: result.course,
      assessmentCount: result.assessmentCount
    });
    
  } catch (error) {
    console.error('Error processing upload:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process syllabus'
    });
  }
});

app.post('/analyze-text', express.json(), async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'No text provided' 
      });
    }

    console.log('📝 Processing text input');
    
    // Process the text and store in database
    const extractedInfo = await extractSyllabusInfo(text, 'text-input.txt');
    
    // Import and use the parser
    const { parseGeminiResponse, saveSyllabusToDatabase } = await import('./api/syllabusParser.js');
    
    // Parse the Gemini response
    console.log('Parsing Gemini response...');
    const parsedData = parseGeminiResponse(extractedInfo);
    
    // Save to database
    console.log('Saving to database...');
    const result = saveSyllabusToDatabase(parsedData);
    
    res.json({
      success: true,
      extractedInfo: extractedInfo,
      parsedData: parsedData,
      courseId: result.courseId,
      course: result.course,
      assessmentCount: result.assessmentCount
    });
    
  } catch (error) {
    console.error('Error processing text:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze text'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`🚀 CourseFlow server running on http://localhost:${port}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
}); 