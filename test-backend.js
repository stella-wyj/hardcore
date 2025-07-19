import { processSyllabus } from './api/gemini.js';

// Test with the existing syllabus.pdf file
const testBackend = async () => {
  try {
    console.log('🧪 Testing backend PDF processing...');
    console.log('📄 Processing: syllabus.pdf');
    
    const result = await processSyllabus('syllabus.pdf');
    
    console.log('\n✅ SUCCESS! Extracted information:');
    console.log('=' .repeat(50));
    console.log(result);
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testBackend(); 