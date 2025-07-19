import { processSyllabus } from './gemini.js';

console.log('Testing backend PDF processing...');

try {
  const result = await processSyllabus('syllabus.pdf');
  console.log('✅ SUCCESS!');
  console.log('Result length:', result.length);
  console.log('First 300 characters:');
  console.log(result.substring(0, 300));
  console.log('...');
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error(error.stack);
} 