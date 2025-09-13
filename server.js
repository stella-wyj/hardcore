import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import './api/dev-cleanup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Check if we're on Vercel (serverless environment)
const isVercel = process.env.VERCEL === '1';

// Configure multer for file uploads (only if not on Vercel)
let upload;
if (!isVercel) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
  });

  upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed!'), false);
      }
    }
  });

  // Create uploads directory if it doesn't exist (only if not on Vercel)
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route serves public/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes with Vercel compatibility
app.get('/api/courses', async (req, res) => {
  try {
    if (isVercel) {
      // On Vercel, return empty array or mock data
      res.json([]);
      return;
    }
    
    // Only import and use file system operations if not on Vercel
    const { getCourseById, getAllCourses } = await import('./api/syllabusParser.js');
    
    // Use the proper database loading function instead of direct file access
    const courses = getAllCourses();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.json([]); // Return empty array on error
  }
});

// Simplified routes for Vercel deployment
app.get('/api/courses/:id', async (req, res) => {
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
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
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
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
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
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
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
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

// Delete individual assessment
app.delete('/api/courses/:id/assessments/:aid', async (req, res) => {
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
  try {
    const { deleteAssessment } = await import('./api/syllabusParser.js');
    const courseId = parseInt(req.params.id);
    const assessmentId = parseInt(req.params.aid);
    
    const success = deleteAssessment(courseId, assessmentId);
    if (!success) {
      return res.status(404).json({ error: 'Course or assessment not found' });
    }

    res.json({
      message: 'Assessment deleted successfully',
      courseId: courseId,
      assessmentId: assessmentId
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

// Delete individual course
app.delete('/api/courses/:id', async (req, res) => {
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
  try {
    const { deleteCourse } = await import('./api/syllabusParser.js');
    const courseId = parseInt(req.params.id);
    
    const success = deleteCourse(courseId);
    if (!success) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      message: 'Course deleted successfully',
      courseId: courseId
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Clear all courses
app.delete('/api/clear-all', async (req, res) => {
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
  try {
    const { clearAllCourses } = await import('./api/syllabusParser.js');
    
    const success = clearAllCourses();
    if (!success) {
      return res.status(500).json({ error: 'Failed to clear courses' });
    }

    res.json({
      message: 'All courses cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing all courses:', error);
    res.status(500).json({ error: 'Failed to clear all courses' });
  }
});

// Calendar API endpoints
app.get('/api/calendar/events', async (req, res) => {
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
  try {
    const { generateCalendarViewData, getUpcomingEvents } = await import('./api/calendar.js');
    const { getAllCourses } = await import('./api/syllabusParser.js');
    
    // Use the proper database loading function instead of direct file access
    const courses = getAllCourses();
    
    const allEvents = generateCalendarViewData(courses);
    const upcomingEvents = getUpcomingEvents(courses, 30);
    
    res.json({
      allEvents,
      upcomingEvents
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

app.get('/api/calendar/download/:courseId', async (req, res) => {
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
  try {
    const { generateICalForCourse, saveICalFile } = await import('./api/calendar.js');
    const { getCourseById } = await import('./api/syllabusParser.js');
    
    const course = getCourseById(parseInt(req.params.courseId));
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const icalContent = generateICalForCourse(course);
    const filename = `${course.name.replace(/[^a-zA-Z0-9]/g, '_')}_calendar.ics`;
    const filepath = saveICalFile(icalContent, filename);
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(icalContent);
  } catch (error) {
    console.error('Error generating calendar file:', error);
    res.status(500).json({ error: 'Failed to generate calendar file' });
  }
});

app.get('/api/calendar/download-all', async (req, res) => {
  if (isVercel) {
    res.status(404).json({ error: 'Not available on Vercel' });
    return;
  }
  try {
    const { generateICalForAllCourses, saveICalFile } = await import('./api/calendar.js');
    const { getAllCourses } = await import('./api/syllabusParser.js');
    
    // Use the proper database loading function instead of direct file access
    const courses = getAllCourses();
    
    const icalContent = generateICalForAllCourses(courses);
    const filename = 'all_courses_calendar.ics';
    const filepath = saveICalFile(icalContent, filename);
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(icalContent);
  } catch (error) {
    console.error('Error generating calendar file:', error);
    res.status(500).json({ error: 'Failed to generate calendar file' });
  }
});

app.post('/upload', upload ? upload.single('syllabus') : (req, res) => {
  res.status(404).json({ error: 'File upload not available on Vercel' });
}, async (req, res) => {
  if (isVercel) {
    res.status(404).json({ error: 'File upload not available on Vercel' });
    return;
  }
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    console.log(`📄 Processing uploaded file: ${req.file.filename}`);
    
    // Import the function only if not on Vercel
    const { processAndStoreSyllabus } = await import('./api/gemini.js');
    
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
    
    // Check if it's a Gemini API rate limit error
    let errorMessage = error.message || 'Failed to process syllabus';
    if (error.message && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests'))) {
      errorMessage = 'PDF could not be parsed automatically due to API rate limits. Please use the text input option to manually enter the syllabus information.';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

app.post('/analyze-text', express.json(), async (req, res) => {
  if (isVercel) {
    res.status(404).json({ error: 'Text analysis not available on Vercel' });
    return;
  }
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'No text provided' 
      });
    }

    console.log('📝 Processing text input');
    
    // Import the functions only if not on Vercel
    const { extractSyllabusInfo } = await import('./api/gemini.js');
    const { parseGeminiResponse, saveSyllabusToDatabase } = await import('./api/syllabusParser.js');
    
    // Process the text and store in database
    const extractedInfo = await extractSyllabusInfo(text, 'text-input.txt');
    
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

// Only start the server if not on Vercel
if (!isVercel) {
  app.listen(port, () => {
    console.log(`🚀 CourseFlow server running on http://localhost:${port}`);
    console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  });
}

// Export for Vercel
export default app; 