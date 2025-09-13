import multer from 'multer';
import { processSyllabus } from '../../gemini.js';
import os from 'os';
import fs from 'fs';
import path from 'path';

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Disables default body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  try {
    // Parse the multipart form data using multer
    await new Promise((resolve, reject) => {
      upload.single('syllabus')(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    // Save buffer to a temp file for processSyllabus
    const tempPath = path.join(os.tmpdir(), `syllabus-${Date.now()}.pdf`);
    fs.writeFileSync(tempPath, req.file.buffer);
    // Call processSyllabus with the temp file path
    const extractedInfo = await processSyllabus(tempPath);
    fs.unlinkSync(tempPath);

    // Extract numbers and words from the Gemini output
    const numberMatches = extractedInfo.match(/\b\d+(?:\.\d+)?%?|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g) || [];
    const wordMatches = extractedInfo.match(/[A-Za-z]{2,}/g) || [];

    res.status(200).json({
      success: true,
      extractedInfo,
      numbers: numberMatches,
      words: wordMatches
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
