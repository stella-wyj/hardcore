// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import the Gemini AI library
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import 'dotenv/config';

// Import OCR and PDF processing libraries
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { spawn } from 'child_process';

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set!');
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('✅ Gemini API key loaded successfully');

// Function to convert PDF to images using Poppler
const convertPDFToImages = async (pdfPath, outputDir) => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Converting PDF to images using Poppler...');
    
    // Use pdftoppm command from Poppler
    const pdftoppm = spawn('pdftoppm', [
      '-png',           // Output format
      '-r', '300',      // Resolution (300 DPI for good OCR quality)
      '-cropbox',       // Use crop box for page boundaries
      pdfPath,          // Input PDF
      path.join(outputDir, 'page') // Output prefix
    ]);
    
    let stdout = '';
    let stderr = '';
    
    pdftoppm.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pdftoppm.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pdftoppm.on('close', (code) => {
      if (code === 0) {
        console.log('✅ PDF converted to images successfully');
        resolve();
      } else {
        console.error('❌ PDF to image conversion failed:', stderr);
        reject(new Error(`pdftoppm failed with code ${code}: ${stderr}`));
      }
    });
    
    pdftoppm.on('error', (error) => {
      console.error('❌ pdftoppm command not found. Please install Poppler:', error.message);
      reject(new Error('Poppler (pdftoppm) is not installed. Please install Poppler utilities.'));
    });
  });
};

// Function to enhance image for better OCR
const enhanceImageForOCR = async (imagePath) => {
  try {
    console.log('🔧 Enhancing image for OCR...');
    
    const enhancedImagePath = imagePath.replace('.png', '_enhanced.png');
    
    await sharp(imagePath)
      .resize(2000, null, { withoutEnlargement: true }) // Resize to max 2000px width
      .sharpen() // Sharpen the image
      .normalize() // Normalize contrast
      .threshold(128) // Convert to black and white for better OCR
      .png()
      .toFile(enhancedImagePath);
    
    return enhancedImagePath;
  } catch (error) {
    console.error('❌ Image enhancement failed:', error);
    return imagePath; // Return original if enhancement fails
  }
};

// Function to perform OCR on an image
const performOCR = async (imagePath) => {
  try {
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => {
        // Silent logger - no progress output
      }
    });
    
    return result.data.text;
  } catch (error) {
    console.error(`❌ OCR failed for ${path.basename(imagePath)}:`, error);
    throw error;
  }
};

// Function to read PDF and extract text using OCR
const readPDF = async (filePath) => {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileExtension === '.txt') {
      // Read text file directly
      console.log('📄 Reading text file directly...');
      return fs.readFileSync(filePath, 'utf8');
    } else if (fileExtension === '.pdf') {
      console.log('📄 Using OCR technology for PDF extraction...');
      
      // Create temporary directory for images
      const tempDir = path.join(os.tmpdir(), 'ocr_temp_' + Date.now());
      fs.mkdirSync(tempDir, { recursive: true });
      
      try {
        // Convert PDF to images using Poppler
        await convertPDFToImages(filePath, tempDir);
        
        // Get list of generated image files
        const imageFiles = fs.readdirSync(tempDir)
          .filter(file => file.endsWith('.png'))
          .sort((a, b) => {
            // Sort by page number
            const pageA = parseInt(a.match(/page-(\d+)\.png/)?.[1] || '0');
            const pageB = parseInt(b.match(/page-(\d+)\.png/)?.[1] || '0');
            return pageA - pageB;
          });
        
        console.log(`📄 Found ${imageFiles.length} pages to process`);
        
        let fullText = '';
        
        // Process each page with OCR
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          const imagePath = path.join(tempDir, imageFile);
          
          console.log(`📄 Processing page ${i + 1}/${imageFiles.length}: ${imageFile}`);
          
          // Enhance image for better OCR
          const enhancedImagePath = await enhanceImageForOCR(imagePath);
          
          // Perform OCR
          const pageText = await performOCR(enhancedImagePath);
          
          fullText += pageText + '\n\n';
          
          // Clean up enhanced image
          if (enhancedImagePath !== imagePath) {
            fs.unlinkSync(enhancedImagePath);
          }
        }
        
        // Clean up temporary directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        if (fullText.trim().length > 50) {
          console.log('✅ OCR text extraction successful');
          console.log(`📝 Extracted ${fullText.length} characters`);
          console.log(`📋 Sample text: ${fullText.substring(0, 200)}...`);
          return fullText;
        } else {
          throw new Error('OCR text extraction resulted in very little text');
        }
        
      } catch (ocrError) {
        console.error('❌ OCR processing failed:', ocrError.message);
        
        // Clean up temporary directory if it exists
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
        
        throw new Error('PDF could not be processed with OCR. Please ensure Poppler is installed and the PDF is readable.');
      }
    } else {
      // Try to read as text
      console.log('📄 Attempting to read as text file...');
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

// Function to extract syllabus information using Gemini API
const extractSyllabusInfo = async (pdfText, fileName) => {
  try {
    console.log(`🤖 Sending ${pdfText.length} characters to Gemini AI...`);
    console.log(`📋 Text preview: ${pdfText.substring(0, 500)}...`);
    
    // Check if text is empty or too short
    if (!pdfText || pdfText.trim().length < 10) {
      console.error('❌ PDF text is empty or too short:', pdfText);
      throw new Error('PDF text is empty or too short. PDF may not be readable.');
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an expert at analyzing academic syllabi. Extract and organize the following information from this syllabus text:
      
    ${pdfText}

    Please organize the information in this exact format:

    Course Name: [Extract the actual course name/title - clean format without extra punctuation, course codes, or unnecessary details]
    Instructor: [Instructor's name(s)]

    Quizzes: 
    - [YYYY-MM-DD date]: [Specific Quiz name/number] - [weight percentage]%
        - [description if available]

    Assignments:
    - [YYYY-MM-DD date]: [Specific Assignment name/number] - [weight percentage]%
        - [description if available]

    Midterm:
    - [YYYY-MM-DD date]: [Specific Midterm name/number] - [weight percentage]%
        - [key topics covered if available]
        - [length of midterm] 
        - [format of midterm]
        - [location if available]

    Final:
    - [YYYY-MM-DD date]: [Specific Final name/number] - [weight percentage]%
      - [length of final] 
        - [format of final]
        - [location if available]

    Office Hours:
    - [day of the week], [time], [room/location]
    - [day of the week], [time], [room/location]

    Textbooks: 
    - [Title of textbook] by [Author(s)] - [ISBN if available]
       - cost if available 

    Other Key Information: 
    - [Any other important details or notes]

    IMPORTANT DATE AND ASSIGNMENT PARSING RULES:
    1. ANY date that mentions a month (January, Feb, March, etc.) or weekday (Monday, Tuesday, etc.) followed by a day number is likely a DUE DATE for an assignment, quiz, or exam.
    2. Assessment names should be SHORT and SPECIFIC (1-3 words max, or up to 6 words for project-related items). Include all but not limited to: "Assignment 1", "Quiz 2", "Midterm", "Final", "Project", "Project Proposal", "Group Project"
    3. If an item is longer than 3 words, it's likely a DESCRIPTION and should NOT be included as an assessment
    4. Convert all dates to YYYY-MM-DD format. If the year is not specified don't include it
    5. If multiple assignments are mentioned with the same date, list them as separate items with distinct names.
    6. If an assessment has null% weight, DO NOT INCLUDE IT in the grade calculator page at all
    7. Just because a sentence includes the word "quiz" or "assignment" or "test" does NOT mean it is an actual assignment
    8. Ensure each assessment has a clear weight percentage. If not specified, use "Not specified" for the weight.
    9. DO NOT include the course description in the course name
    10. DO NOT include the assignment date in the assignment name 
    11. Actual assessments should begin with capital letters, look for: "Assignment", "Test", "Quiz", "Midterm", "Final", "Project", "Lab", "Participation"
    12. Descriptions should be on separate lines with dashes, NOT as part of the assessment name
    
  
    IMPORTANT: This syllabus document is for ONE COURSE ONLY. Extract information for a single course, even if the document mentions multiple topics or sections. If the document contains information for multiple separate courses, only extract the information for the main/primary course that this syllabus represents.

    If any information is not available, indicate with "Not specified" or skip that line.
    Be precise with dates, times, and percentages. Extract actual course names, not generic "Course #1". If there is no location or description or other information is missing, put down [location] or [description], or [time] as an user prompt placeholder.
    If there are any special instructions or notes, include them under "Other Key Information".
    Make sure to format the output clearly and concisely. Ensure that the other key information does not contain information about things that are already under a section.
    `;

    console.log('📤 Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log(`📥 Received ${responseText.length} characters from Gemini`);
    console.log(`📋 Gemini response preview: ${responseText.substring(0, 200)}...`);
    
    return responseText;
  } catch (error) {
    console.error('Error extracting syllabus info:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// Main function to process uploaded syllabus
const processSyllabus = async (filePath) => {
  try {
    console.log(`📄 Processing syllabus: ${path.basename(filePath)}`);
    
    // Read the PDF
    const pdfText = await readPDF(filePath);
    console.log('PDF read successfully');
    
    // Extract information using Gemini
    console.log('Analyzing syllabus with Gemini AI...');
    const extractedInfo = await extractSyllabusInfo(pdfText, path.basename(filePath));
    
    console.log('\n EXTRACTED SYLLABUS INFORMATION:');
    console.log('=' .repeat(50));
    console.log(extractedInfo);
    console.log('=' .repeat(50));
    
    return extractedInfo;
  } catch (error) {
    console.error('Error processing syllabus:', error);
    throw error;
  }
};

// Enhanced function that parses and stores in database
const processAndStoreSyllabus = async (filePath) => {
  try {
    console.log(`📄 Processing and storing syllabus: ${path.basename(filePath)}`);
    
    // Read the PDF
    const pdfText = await readPDF(filePath);
    console.log('PDF read successfully');
    
    // Extract information using Gemini
    console.log('Analyzing syllabus with Gemini AI...');
    const extractedInfo = await extractSyllabusInfo(pdfText, path.basename(filePath));
    
    // Import and use the parser
    const { parseGeminiResponse, saveSyllabusToDatabase } = await import('./syllabusParser.js');
    
    // Parse the Gemini response
    console.log('Parsing Gemini response...');
    const parsedData = parseGeminiResponse(extractedInfo);
    
    // Save to database
    console.log('Saving to database...');
    const result = saveSyllabusToDatabase(parsedData);
    
    if (result.success === false) {
      console.log(`⚠️ ${result.error}: Course "${result.course.name}" already exists`);
      return {
        success: false,
        error: result.error,
        rawResponse: extractedInfo,
        parsedData: parsedData,
        courseId: result.courseId,
        course: result.course,
        assessmentCount: result.assessmentCount
      };
    }
    
    // Send data to gradeCalc backend (silently)
    await syncToGradeCalc(result.course, parsedData);
    
    console.log(`✅ Course created with ID: ${result.courseId}`);
    console.log(`📊 ${result.assessmentCount} assessments added`);
    
    return {
      success: true,
      rawResponse: extractedInfo,
      parsedData: parsedData,
      courseId: result.courseId,
      course: result.course,
      assessmentCount: result.assessmentCount
    };
    
  } catch (error) {
    console.error('Error processing and storing syllabus:', error);
    throw error;
  }
};

// Function to sync course data to gradeCalc backend
const syncToGradeCalc = async (course, parsedData) => {
  try {
    const gradeCalcUrl = 'http://localhost:3001'; // gradeCalc backend URL
    
    // Prepare course data for gradeCalc
    const gradeCalcCourse = {
      name: course.name,
      color: course.color,
      goalGrade: course.goalGrade,
      assessments: course.assessments.map(assessment => ({
        title: assessment.title,
        type: assessment.type,
        dueDate: assessment.dueDate,
        weight: assessment.weight,
        grade: assessment.grade
      }))
    };
    
    // Send course data to gradeCalc (silently)
    const response = await fetch(`${gradeCalcUrl}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gradeCalcCourse)
    });
    
    if (!response.ok) {
      throw new Error(`gradeCalc API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return result;
    
  } catch (error) {
    // Silently ignore gradeCalc sync failures - not required for main functionality
    return null;
  }
};

// Function to save extracted information to a file
const saveExtractedInfo = async (extractedInfo, originalFileName) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFileName = `extracted_syllabus_${timestamp}.txt`;
    
    fs.writeFileSync(outputFileName, extractedInfo);
    console.log(`Extracted information saved to: ${outputFileName}`);
    
    return outputFileName;
  } catch (error) {
    console.error('Error saving extracted info:', error);
    throw error;
  }
};

// Export functions for use in other modules
export { processSyllabus, processAndStoreSyllabus, saveExtractedInfo, readPDF, extractSyllabusInfo, syncToGradeCalc };

// If running this file directly, process the syllabus.pdf file
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2] || 'syllabus.pdf';
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.log(' Usage: node gemini.js [path-to-syllabus.pdf]');
    process.exit(1);
  }
  
  processSyllabus(filePath)
    .then(extractedInfo => saveExtractedInfo(extractedInfo, filePath))
    .then(() => console.log('Syllabus processing completed!'))
    .catch(error => {
      console.error('Processing failed:', error);
      process.exit(1);
    });
} 
