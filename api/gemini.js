// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import the Gemini AI library
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import 'dotenv/config';

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set!');
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('✅ Gemini API key loaded successfully');

// Function to read PDF and extract text
const readPDF = async (filePath) => {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileExtension === '.txt') {
      // Read text file directly
      return fs.readFileSync(filePath, 'utf8');
    } else if (fileExtension === '.pdf') {
      // Use pdfjs-dist with proper Node.js setup
      const dataBuffer = fs.readFileSync(filePath);
      
      try {
        // Use OCR approach: Convert PDF to images, then extract text with Tesseract
        console.log('📄 Using OCR for PDF extraction...');
        
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        // Create temporary directory for images
        const tempDir = path.join(os.tmpdir(), `pdf-ocr-${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });
        
        try {
          // Convert PDF pages to images using pdftoppm
          console.log('🔄 Converting PDF pages to images...');
          await execAsync(`pdftoppm -png "${filePath}" "${tempDir}/page"`);
          
          // Get list of generated image files
          const imageFiles = fs.readdirSync(tempDir)
            .filter(file => file.endsWith('.png'))
            .sort((a, b) => {
              const numA = parseInt(a.match(/page-(\d+)\.png/)?.[1] || '0');
              const numB = parseInt(b.match(/page-(\d+)\.png/)?.[1] || '0');
              return numA - numB;
            });
          
          console.log(`📄 Found ${imageFiles.length} pages to process`);
          
          let fullText = '';
          
          // Process each page with Tesseract OCR
          for (const imageFile of imageFiles) {
            const imagePath = path.join(tempDir, imageFile);
            console.log(`🔍 Processing ${imageFile} with OCR...`);
            
            try {
              const { stdout } = await execAsync(`tesseract "${imagePath}" stdout -l eng`);
              fullText += stdout.trim() + '\n\n';
            } catch (ocrError) {
              console.warn(`⚠️ OCR failed for ${imageFile}:`, ocrError.message);
            }
          }
          
          // Clean up temporary files
          fs.rmSync(tempDir, { recursive: true, force: true });
          
          if (fullText.trim().length > 50) {
            console.log('✅ OCR extraction successful');
            console.log(`📝 Extracted ${fullText.length} characters`);
            console.log(`📋 Sample text: ${fullText.substring(0, 200)}...`);
            return fullText;
          } else {
            throw new Error('OCR extracted very little text');
          }
          
        } catch (conversionError) {
          // Clean up on error
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
          throw conversionError;
        }
        
              } catch (pdfError) {
          console.error('❌ PDF parsing failed:', pdfError.message);
          console.log('⚠️ PDF parsing failed, throwing error to indicate manual input needed');
          throw new Error('PDF could not be parsed automatically. Please use the text input option to manually enter the syllabus information.');
        }
    } else {
      // Try to read as text
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
    2. Each assignment, quiz, midterm, and final should have a UNIQUE, SPECIFIC name that clearly differentiates it from others.
    3. Convert all dates to YYYY-MM-DD format. If the year is not specified, assume the current academic year.
    4. If multiple assignments are mentioned with the same date, list them as separate items with distinct names.
    5. Pay special attention to phrases like "due on", "due by", "submission date", "exam date", "quiz date" - these indicate due dates.
    6. For assignments without specific names, create descriptive names based on content or week number.
    7. Ensure each assessment has a clear weight percentage. If not specified, use "Not specified" for the weight.
    8. ASSIGNMENT NAMES should NOT include dates, course codes, or extra punctuation. Only include the actual assignment name/number (e.g., "Assignment 1", "Linear Algebra Quiz", "Midterm Exam", not "Assignment 1 - March 15" or "MATH 101 Assignment 1").

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
    
    // Send data to gradeCalc backend
    console.log('Syncing with gradeCalc backend...');
    await syncToGradeCalc(result.course, parsedData);
    
    console.log(`✅ Course created with ID: ${result.courseId}`);
    console.log(`📊 ${result.assessmentCount} assessments added`);
    console.log(`🔄 Synced with gradeCalc backend`);
    
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
    
    console.log('📤 Sending course data to gradeCalc backend...');
    
    // Send course data to gradeCalc
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
    console.log(`✅ Successfully synced course "${course.name}" to gradeCalc backend`);
    console.log(`🆔 gradeCalc course ID: ${result.id}`);
    
    return result;
    
  } catch (error) {
    console.warn('⚠️ Failed to sync with gradeCalc backend:', error.message);
    console.log('💡 Make sure gradeCalc backend is running on port 3001');
    // Don't throw error - this shouldn't break the main flow
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
