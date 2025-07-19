import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { processSyllabus, extractSyllabusInfo } from './gemini.js';

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

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
    
    // Process the syllabus
    const extractedInfo = await processSyllabus(req.file.path);
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      extractedInfo: extractedInfo
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
    
    // Process the text directly
    const extractedInfo = await extractSyllabusInfo(text, 'text-input.txt');
    
    res.json({
      success: true,
      extractedInfo: extractedInfo
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
  console.log(`🚀 Syllabus Analyzer server running on http://localhost:${port}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
}); 