import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Syllabus Analyzer Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Google Gemini API Key
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (optional)
PORT=3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created!');
  console.log('⚠️  Please edit .env file and add your Gemini API key');
} else {
  console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n📦 Installing dependencies...');
  console.log('Run: npm install');
} else {
  console.log('✅ Dependencies already installed');
}

// Check if uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  console.log('\n📁 Creating uploads directory...');
  fs.mkdirSync(uploadsPath);
  console.log('✅ Uploads directory created');
} else {
  console.log('✅ Uploads directory already exists');
}

console.log('\n🎯 Next Steps:');
console.log('1. Edit .env file and add your Gemini API key');
console.log('2. Run: npm install (if not done already)');
console.log('3. Run: npm test (to test with sample syllabi)');
console.log('4. Run: npm start (to start the web server)');
console.log('5. Open http://localhost:3000 in your browser');

console.log('\n📚 Test Cases Available:');
console.log('- CS 101: Introduction to Computer Science');
console.log('- MATH 201: Calculus II');
console.log('\nRun "npm test" to see these in action!'); 