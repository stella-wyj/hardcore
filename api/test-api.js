import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

console.log('Testing Gemini API key...');
console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
console.log('API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ No API key found in .env file');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testAPI() {
  try {
    console.log('Making test API call...');
    
    // Try different model names
    const models = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
    
    for (const modelName of models) {
      try {
        console.log(`\nTesting model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent("Say 'Hello, API test successful!'");
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ API Test SUCCESSFUL!');
        console.log('Working model:', modelName);
        console.log('Response:', text);
        return; // Exit on success
        
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed:`, modelError.message);
      }
    }
    
    console.error('\n❌ All models failed. API key might be invalid.');
    
  } catch (error) {
    console.error('❌ API Test FAILED:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('API key not valid')) {
      console.error('\n🔑 The API key is invalid. Please get a new one from:');
      console.error('https://makersuite.google.com/app/apikey');
    }
  }
}

testAPI(); 