// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import the Gemini AI library
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to read PDF and extract text
const readPDF = async (filePath) => {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileExtension === '.txt') {
      // Read text file directly
      return fs.readFileSync(filePath, 'utf8');
    } else if (fileExtension === '.pdf') {
      // Use pdfjs-dist legacy build for Node.js
      const dataBuffer = fs.readFileSync(filePath);
      
      // Import the legacy build
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      
      // Set up the worker for Node.js environment
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
      
      // Convert Buffer to Uint8Array for pdfjs-dist
      const uint8Array = new Uint8Array(dataBuffer);
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an expert at analyzing academic syllabi. Extract and organize the following information from this syllabus text:

    ${pdfText}

    Please organize the information in this exact format:

    [Course Name: Extract the actual course name/title]
    Instructor: [Instructor's name(s)]

    Quizzes: 
    - [date]: [Quiz name/number] - [weight percentage]%
        - [description if available]

    Assignments:
    - [date]: [Assignment name/number] - [weight percentage]%
        - [description if available]

    Midterm:
    - [date]: [Midterm name/number] - [weight percentage]%
        - [key topics covered if available]
        - [length of midterm] 
        - [format of midterm]
        - [location if available]

    Final:
    - [date]: [Final name/number] - [weight percentage]%
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

    If there are multiple courses in the same document, separate them clearly with the course name as a header.
    If any information is not available, indicate with "Not specified" or skip that line.
    Be precise with dates, times, and percentages. Extract actual course names, not generic "Course #1". If there is no location or description or other information is missing, put down [location] or [description], or [time] as an user prompt placeholder.
    If there are any special instructions or notes, include them under "Other Key Information".
    Make sure to format the output clearly and concisely.  Ensure that the other key information does not contain information about things that are already under a section. 
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error extracting syllabus info:', error);
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
export { processSyllabus, saveExtractedInfo, readPDF, extractSyllabusInfo };

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
