import { extractSyllabusInfo } from './gemini.js';

// Sample syllabus text for testing
const sampleSyllabus1 = `
CS 101: Introduction to Computer Science
Fall 2024

Course Information:
Instructor: Dr. Jane Smith
Office: Room 301, Computer Science Building
Email: jane.smith@university.edu

Office Hours:
Monday and Wednesday: 2:00 PM - 4:00 PM, Room 301
Friday: 10:00 AM - 12:00 PM, Room 301

Assignments:
Assignment 1: Due September 15, 2024 - 15%
Description: Implement a simple calculator program in Python

Assignment 2: Due October 1, 2024 - 20%
Description: Create a web page using HTML and CSS

Assignment 3: Due October 20, 2024 - 25%
Description: Build a database application

Midterm Exam:
Date: October 30, 2024, 2:00 PM - 3:30 PM - 20%
Location: Lecture Hall A
Topics: Programming fundamentals, data structures, algorithms

Final Exam:
Date: December 15, 2024, 2:00 PM - 4:00 PM - 20%
Location: Lecture Hall A
`;

const sampleSyllabus2 = `
MATH 201: Calculus II
Spring 2024

Course Information:
Instructor: Prof. John Davis
Office: Room 205, Mathematics Building
Email: john.davis@university.edu

Office Hours:
Tuesday and Thursday: 1:00 PM - 3:00 PM, Room 205
Wednesday: 9:00 AM - 11:00 AM, Room 205

Assignments:
Homework 1: Due February 10, 2024 - 10%
Description: Integration techniques and applications

Homework 2: Due February 25, 2024 - 10%
Description: Series and sequences

Homework 3: Due March 15, 2024 - 10%
Description: Parametric equations and polar coordinates

Midterm 1:
Date: March 1, 2024, 1:00 PM - 2:30 PM - 25%
Location: Room 101, Mathematics Building
Topics: Integration, applications of integration

Midterm 2:
Date: April 5, 2024, 1:00 PM - 2:30 PM - 25%
Location: Room 101, Mathematics Building
Topics: Series, sequences, parametric equations

Final Exam:
Date: May 10, 2024, 1:00 PM - 3:00 PM - 20%
Location: Room 101, Mathematics Building
`;

// Test function
const runTests = async () => {
  console.log('🧪 Running Syllabus Extraction Tests\n');
  
  try {
    // Test 1: CS 101 Syllabus
    console.log('📚 Test 1: CS 101 Syllabus');
    console.log('=' .repeat(40));
    const result1 = await extractSyllabusInfo(sampleSyllabus1, 'cs101.pdf');
    console.log(result1);
    console.log('\n' + '=' .repeat(40) + '\n');
    
    // Test 2: MATH 201 Syllabus
    console.log('📚 Test 2: MATH 201 Syllabus');
    console.log('=' .repeat(40));
    const result2 = await extractSyllabusInfo(sampleSyllabus2, 'math201.pdf');
    console.log(result2);
    console.log('\n' + '=' .repeat(40) + '\n');
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
} 