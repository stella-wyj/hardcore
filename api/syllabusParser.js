// Syllabus Parser - Parses Gemini response and stores in database
import fs from 'fs';
import { CLEAR_DATA_ON_START, DEBUG_MODE } from './dev-config.js';

// In-memory database (replace with real database in production)
let db = {
  courses: [],
  assessments: [],
  nextCourseId: 1,
  nextAssessmentId: 1
};

// Load existing data if available
try {
  if (fs.existsSync('database.json') && !CLEAR_DATA_ON_START) {
    const data = fs.readFileSync('database.json', 'utf8');
    const parsedData = JSON.parse(data);
    
    // Check if the database has valid structure and data
    if (parsedData && 
        Array.isArray(parsedData.courses) && 
        Array.isArray(parsedData.assessments) &&
        parsedData.courses.length > 0) {
      db = parsedData;
      if (DEBUG_MODE) {
        console.log('📊 Loaded existing database with', db.courses.length, 'courses and', db.assessments.length, 'assessments');
      }
    } else {
      console.log('Database file exists but is empty or invalid, starting fresh');
    }
  } else {
    if (CLEAR_DATA_ON_START) {
      console.log('🧹 Development mode: Starting with fresh database');
      // Clear the database file if it exists
      if (fs.existsSync('database.json')) {
        const emptyDatabase = {
          courses: [],
          assessments: [],
          nextCourseId: 1,
          nextAssessmentId: 1
        };
        fs.writeFileSync('database.json', JSON.stringify(emptyDatabase, null, 2));
        console.log('🗑️ Cleared existing database.json file');
      }
    } else {
      console.log('No existing database found, starting fresh');
    }
  }
} catch (error) {
  console.log('Error loading database, starting fresh:', error.message);
}

// Save database to file
function saveDatabase() {
  try {
    fs.writeFileSync('database.json', JSON.stringify(db, null, 2));
    if (DEBUG_MODE) {
      console.log(`💾 Database saved: ${db.courses.length} courses, ${db.assessments.length} assessments`);
    }
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Clean course name by removing unnecessary punctuation and details
function cleanCourseName(courseName) {
  if (!courseName) return '';
  
  let cleaned = courseName.trim();
  
  // Remove common unnecessary patterns
  cleaned = cleaned.replace(/^[A-Z]{2,4}\s*\d{3,4}[A-Z]?\s*[-–—]\s*/i, ''); // Remove course codes like "MATH 133 -" or "CS 101 -"
  cleaned = cleaned.replace(/^[A-Z]{2,4}\s*\d{3,4}[A-Z]?\s*[:]\s*/i, ''); // Remove course codes with colons
  cleaned = cleaned.replace(/^[A-Z]{2,4}\s*\d{3,4}[A-Z]?\s*[\(\)]/i, ''); // Remove course codes with parentheses
  cleaned = cleaned.replace(/^[A-Z]{2,4}\s*\d{3,4}[A-Z]?\s*$/i, ''); // Remove standalone course codes
  
  // Remove extra punctuation at the beginning and end
  cleaned = cleaned.replace(/^[^\w\s]*/, ''); // Remove leading punctuation
  cleaned = cleaned.replace(/[^\w\s]*$/, ''); // Remove trailing punctuation
  
  // Remove quotes around the course name
  cleaned = cleaned.replace(/^["'""]|["'""]$/g, '');
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // If we ended up with nothing, return the original
  if (!cleaned) return courseName.trim();
  
  return cleaned;
}

// Clean assignment name by removing dates, course codes, descriptions, and extra punctuation
function cleanAssessmentName(assessmentName) {
  if (!assessmentName) return '';
  
  let cleaned = assessmentName.trim();
  
  // Remove dates in various formats (more aggressive patterns)
  cleaned = cleaned.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, ''); // MM/DD/YYYY or MM/DD/YY
  cleaned = cleaned.replace(/\b\d{4}-\d{1,2}-\d{1,2}\b/g, ''); // YYYY-MM-DD
  cleaned = cleaned.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, ''); // Month DD, YYYY
  cleaned = cleaned.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi, ''); // Abbreviated month
  cleaned = cleaned.replace(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*,?\s*\d{1,2}\b/gi, ''); // Weekday DD
  cleaned = cleaned.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*,?\s*\d{1,2}\b/gi, ''); // Abbreviated weekday
  
  // Remove date patterns that might be included in names (like "YYYY-MM-DD]")
  cleaned = cleaned.replace(/\[\d{4}-\d{2}-\d{2}\]/g, ''); // [YYYY-MM-DD]
  cleaned = cleaned.replace(/\(\d{4}-\d{2}-\d{2}\)/g, ''); // (YYYY-MM-DD)
  cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}\]/g, ''); // YYYY-MM-DD]
  cleaned = cleaned.replace(/\[\d{4}-\d{2}-\d{2}/g, ''); // [YYYY-MM-DD
  cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}\s*[-–—]\s*/g, ''); // YYYY-MM-DD followed by dash
  cleaned = cleaned.replace(/\s*[-–—]\s*\d{4}-\d{2}-\d{2}/g, ''); // Dash followed by YYYY-MM-DD
  
  // Remove any remaining date-like patterns
  cleaned = cleaned.replace(/\b\d{4}-\d{2}-\d{2}\b/g, ''); // Any remaining YYYY-MM-DD
  cleaned = cleaned.replace(/\b\d{2}-\d{2}-\d{4}\b/g, ''); // MM-DD-YYYY
  cleaned = cleaned.replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, ''); // MM/DD/YYYY
  
  // Remove course codes
  cleaned = cleaned.replace(/\b[A-Z]{2,4}\s*\d{3,4}[A-Z]?\b/g, ''); // Course codes like MATH 101, CS 101A
  
  // Remove common date-related phrases
  cleaned = cleaned.replace(/\b(due|due on|due by|submission|submitted|deadline|exam date|quiz date)\s*:?\s*/gi, '');
  
  // Remove "not specified" and similar phrases
  cleaned = cleaned.replace(/\b(not specified|not set|tbd|tba|to be announced|to be determined)\b/gi, '');
  
  // Remove descriptions that start with common words
  cleaned = cleaned.replace(/\b(description|desc|details|about|regarding|concerning|related to|involving|covering|including|consisting of|comprising|containing)\s*:?\s*/gi, '');
  
  // Remove extra punctuation and separators
  cleaned = cleaned.replace(/[-–—]\s*$/, ''); // Remove trailing dashes
  cleaned = cleaned.replace(/^[-–—]\s*/, ''); // Remove leading dashes
  cleaned = cleaned.replace(/[:]\s*$/, ''); // Remove trailing colons
  cleaned = cleaned.replace(/^[:]\s*/, ''); // Remove leading colons
  
  // Remove brackets and parentheses that might contain dates
  cleaned = cleaned.replace(/\[[^\]]*\d{4}[^\]]*\]/g, ''); // [anything with year]
  cleaned = cleaned.replace(/\([^)]*\d{4}[^)]*\)/g, ''); // (anything with year)
  
  // Remove extra whitespace and punctuation
  cleaned = cleaned.replace(/\s+/g, ' ').trim(); // Multiple spaces to single space
  cleaned = cleaned.replace(/^[^\w\s]*/, ''); // Remove leading punctuation
  cleaned = cleaned.replace(/[^\w\s]*$/, ''); // Remove trailing punctuation
  
  // Remove quotes
  cleaned = cleaned.replace(/^["'""]|["'""]$/g, '');
  
  // If we ended up with nothing, return a generic name
  if (!cleaned) return 'Unnamed Assessment';
  
  return cleaned;
}

// Parse Gemini response into structured data
function parseGeminiResponse(response) {
  const parsed = {
    courseName: '',
    instructor: '',
    quizzes: [],
    assignments: [],
    midterm: null,
    final: null,
    officeHours: [],
    textbooks: [],
    otherInfo: []
  };

  const lines = response.split('\n');
  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    // Course Name
    if (line.includes('Course Name:')) {
      const rawCourseName = line.split('Course Name:')[1].trim();
      parsed.courseName = cleanCourseName(rawCourseName);
    }
    // Instructor
    else if (line.includes('Instructor:')) {
      parsed.instructor = line.split('Instructor:')[1].trim();
    }
    // Section headers
    else if (line.includes('Quizzes:')) {
      currentSection = 'quizzes';
    }
    else if (line.includes('Assignments:')) {
      currentSection = 'assignments';
    }
    else if (line.includes('Midterm:')) {
      currentSection = 'midterm';
    }
    else if (line.includes('Final:')) {
      currentSection = 'final';
    }
    else if (line.includes('Office Hours:')) {
      currentSection = 'officeHours';
    }
    else if (line.includes('Textbooks:')) {
      currentSection = 'textbooks';
    }
    else if (line.includes('Other Key Information:')) {
      currentSection = 'otherInfo';
    }
    // Assessment items (lines starting with -)
    else if (line.startsWith('-') && currentSection) {
      const item = line.substring(1).trim();
      
      if (currentSection === 'quizzes' || currentSection === 'assignments') {
        const assessment = parseAssessmentItem(item, currentSection);
        if (assessment) {
          parsed[currentSection].push(assessment);
        }
      }
      else if (currentSection === 'midterm' && !parsed.midterm) {
        parsed.midterm = parseAssessmentItem(item, 'midterm');
      }
      else if (currentSection === 'final' && !parsed.final) {
        parsed.final = parseAssessmentItem(item, 'final');
      }
      else if (currentSection === 'officeHours' || currentSection === 'textbooks' || currentSection === 'otherInfo') {
        parsed[currentSection].push(item);
      }
    }
  }

  return parsed;
}

// Parse individual assessment items
function parseAssessmentItem(item, type) {
  // Extract date, name, and weight from format like: "2024-03-15: Assignment 1 - 15%"
  const dateMatch = item.match(/(\d{4}-\d{2}-\d{2}):\s*(.+?)\s*-\s*(\d+)%/);
  if (dateMatch) {
    return {
      date: dateMatch[1],
      name: cleanAssessmentName(dateMatch[2].trim()),
      weight: parseInt(dateMatch[3]),
      type: type,
      description: item
    };
  }
  
  // Try alternative format without date
  const weightMatch = item.match(/(.+?)\s*-\s*(\d+)%/);
  if (weightMatch) {
    return {
      date: null,
      name: cleanAssessmentName(weightMatch[1].trim()),
      weight: parseInt(weightMatch[2]),
      type: type,
      description: item
    };
  }
  
  // Fallback - just store the raw item
  return {
    date: null,
    name: cleanAssessmentName(item),
    weight: null,
    type: type,
    description: item
  };
}

// Save parsed syllabus data to database
function saveSyllabusToDatabase(parsedData) {
  try {
    // Check if a course with the same name already exists
    const existingCourse = db.courses.find(c => 
      c.name.toLowerCase().trim() === (parsedData.courseName || 'Unnamed Course').toLowerCase().trim()
    );
    
    if (existingCourse) {
      console.log(`⚠️ Course "${parsedData.courseName}" already exists. Skipping duplicate creation.`);
      return {
        success: false,
        error: 'Course already exists',
        courseId: existingCourse.id,
        course: existingCourse,
        assessmentCount: existingCourse.assessments.length
      };
    }
    
    // Create course record
    const course = {
      id: db.nextCourseId++,
      name: parsedData.courseName || 'Unnamed Course',
      instructor: parsedData.instructor || 'Not specified',
      color: generateRandomColor(),
      goalGrade: null,
      assessments: [],
      officeHours: parsedData.officeHours,
      textbooks: parsedData.textbooks,
      otherInfo: parsedData.otherInfo,
      createdAt: new Date().toISOString()
    };

    // Create assessment records
    const allAssessments = [
      ...parsedData.quizzes.map(q => ({ ...q, type: 'quiz' })),
      ...parsedData.assignments.map(a => ({ ...a, type: 'assignment' })),
      ...(parsedData.midterm ? [{ ...parsedData.midterm, type: 'midterm' }] : []),
      ...(parsedData.final ? [{ ...parsedData.final, type: 'final' }] : [])
    ];

    allAssessments.forEach(assessment => {
      const assessmentRecord = {
        id: db.nextAssessmentId++,
        courseId: course.id,
        title: assessment.name,
        type: assessment.type,
        dueDate: assessment.date,
        weight: assessment.weight,
        grade: null,
        description: assessment.description,
        createdAt: new Date().toISOString()
      };
      
      db.assessments.push(assessmentRecord);
      course.assessments.push(assessmentRecord);
    });

    // Add course to database
    db.courses.push(course);
    
    // Save to file
    saveDatabase();
    
    return {
      success: true,
      courseId: course.id,
      course: course,
      assessmentCount: allAssessments.length
    };
    
  } catch (error) {
    console.error('Error saving syllabus to database:', error);
    throw error;
  }
}

// Generate random color for course
function generateRandomColor() {
  const colors = [
    '#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d01',
    '#46bdc6', '#7b1fa2', '#e67c73', '#d50000', '#e65100'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get all courses
function getAllCourses() {
  return db.courses.map(course => ({
    id: course.id,
    name: course.name,
    instructor: course.instructor,
    color: course.color,
    goalGrade: course.goalGrade,
    assessments: course.assessments,
    assessmentCount: course.assessments.length
  }));
}

// Get course by ID
function getCourseById(courseId) {
  return db.courses.find(course => course.id === parseInt(courseId));
}

// Update course goal grade
function updateCourseGoalGrade(courseId, goalGrade) {
  const course = getCourseById(courseId);
  if (course) {
    course.goalGrade = goalGrade;
    saveDatabase();
    return true;
  }
  return false;
}

// Update assessment grade
function updateAssessmentGrade(courseId, assessmentId, grade) {
  const assessment = db.assessments.find(a => 
    a.courseId === parseInt(courseId) && a.id === parseInt(assessmentId)
  );
  
  if (assessment) {
    assessment.grade = grade;
    saveDatabase();
    return true;
  }
  return false;
}

// Delete course
function deleteCourse(courseId) {
  const courseIdInt = parseInt(courseId);
  const courseIndex = db.courses.findIndex(course => course.id === courseIdInt);
  
  if (courseIndex !== -1) {
    const course = db.courses[courseIndex];
    
    if (DEBUG_MODE) {
      console.log(`🗑️ Deleting course: ${course.name} (ID: ${courseIdInt})`);
      console.log(`📊 Course had ${course.assessments?.length || 0} assessments`);
    }
    
    // Remove all assessments for this course from the global assessments array
    const assessmentsToRemove = db.assessments.filter(a => a.courseId === courseIdInt);
    db.assessments = db.assessments.filter(a => a.courseId !== courseIdInt);
    
    if (DEBUG_MODE) {
      console.log(`🗑️ Removed ${assessmentsToRemove.length} assessments from global array`);
    }
    
    // Remove the course
    db.courses.splice(courseIndex, 1);
    
    // Save to database
    saveDatabase();
    
    if (DEBUG_MODE) {
      console.log(`✅ Course deleted successfully. Remaining courses: ${db.courses.length}`);
    }
    
    return true;
  }
  
  if (DEBUG_MODE) {
    console.log(`❌ Course with ID ${courseIdInt} not found`);
  }
  
  return false;
}

// Delete assessment
function deleteAssessment(courseId, assessmentId) {
  const courseIdInt = parseInt(courseId);
  const assessmentIdInt = parseInt(assessmentId);
  
  if (DEBUG_MODE) {
    console.log(`🗑️ Attempting to delete assessment ${assessmentIdInt} from course ${courseIdInt}`);
  }
  
  // Find the assessment in the global assessments array
  const assessmentIndex = db.assessments.findIndex(a => 
    a.courseId === courseIdInt && a.id === assessmentIdInt
  );
  
  if (assessmentIndex !== -1) {
    const assessment = db.assessments[assessmentIndex];
    
    if (DEBUG_MODE) {
      console.log(`🗑️ Found assessment: ${assessment.title}`);
    }
    
    // Remove from global assessments array
    db.assessments.splice(assessmentIndex, 1);
    
    // Remove from course assessments
    const course = getCourseById(courseId);
    if (course) {
      const courseAssessmentIndex = course.assessments.findIndex(a => a.id === assessmentIdInt);
      if (courseAssessmentIndex !== -1) {
        course.assessments.splice(courseAssessmentIndex, 1);
        if (DEBUG_MODE) {
          console.log(`🗑️ Removed assessment from course. Remaining assessments: ${course.assessments.length}`);
        }
      }
    }
    
    saveDatabase();
    
    if (DEBUG_MODE) {
      console.log(`✅ Assessment deleted successfully`);
    }
    
    return true;
  }
  
  if (DEBUG_MODE) {
    console.log(`❌ Assessment with ID ${assessmentIdInt} not found in course ${courseIdInt}`);
  }
  
  return false;
}

// Clear all courses
function clearAllCourses() {
  if (DEBUG_MODE) {
    console.log(`🧹 Clearing all courses and assessments`);
    console.log(`📊 Before clearing: ${db.courses.length} courses, ${db.assessments.length} assessments`);
  }
  
  db.courses = [];
  db.assessments = [];
  db.nextCourseId = 1;
  db.nextAssessmentId = 1;
  
  saveDatabase();
  
  if (DEBUG_MODE) {
    console.log(`✅ All data cleared successfully`);
  }
  
  return true;
}

// Calculate course grade summary
function calculateGradeSummary(courseId) {
  const course = getCourseById(courseId);
  if (!course) return null;

  const assessments = course.assessments;
  const gradedAssessments = assessments.filter(a => a.grade !== null);
  const ungradedAssessments = assessments.filter(a => a.grade === null);

  // Calculate current grade
  let currentGrade = null;
  if (gradedAssessments.length > 0) {
    const totalWeight = gradedAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
    const weightedSum = gradedAssessments.reduce((sum, a) => sum + ((a.grade || 0) * (a.weight || 0)), 0);
    currentGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // Calculate required grades for goal
  let requiredGrades = [];
  if (course.goalGrade && ungradedAssessments.length > 0) {
    const totalWeight = assessments.reduce((sum, a) => sum + (a.weight || 0), 0);
    const gradedWeight = gradedAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
    const gradedScore = gradedAssessments.reduce((sum, a) => sum + ((a.grade || 0) * (a.weight || 0)), 0);
    
    const remainingWeight = ungradedAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
    const requiredScore = course.goalGrade * totalWeight - gradedScore;
    
    if (remainingWeight > 0 && requiredScore > gradedScore) {
      const averageGradeNeeded = requiredScore / remainingWeight;
      
      if (averageGradeNeeded <= 100) {
        requiredGrades = ungradedAssessments.map(a => ({
          assessmentId: a.id,
          title: a.title,
          requiredGrade: averageGradeNeeded
        }));
      }
    }
  }

  return {
    currentGrade,
    goalGrade: course.goalGrade,
    gradedAssessments: gradedAssessments.length,
    totalAssessments: assessments.length,
    requiredGrades
  };
}

// Function to sync all courses to gradeCalc backend
async function syncAllCoursesToGradeCalc() {
  try {
    const gradeCalcUrl = 'http://localhost:3001';
    
    console.log('🔄 Syncing all courses to gradeCalc backend...');
    
    for (const course of db.courses) {
      const assessments = db.assessments.filter(a => a.courseId === course.id);
      
      const gradeCalcCourse = {
        name: course.name,
        color: course.color,
        goalGrade: course.goalGrade,
        assessments: assessments.map(assessment => ({
          title: assessment.title,
          type: assessment.type,
          dueDate: assessment.dueDate,
          weight: assessment.weight,
          grade: assessment.grade
        }))
      };
      
      try {
        const response = await fetch(`${gradeCalcUrl}/courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gradeCalcCourse)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Synced course "${course.name}" to gradeCalc backend`);
        } else {
          console.warn(`⚠️ Failed to sync course "${course.name}": ${response.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ Error syncing course "${course.name}":`, error.message);
      }
    }
    
    console.log('🔄 Course sync to gradeCalc completed');
    
  } catch (error) {
    console.warn('⚠️ gradeCalc backend not available:', error.message);
    console.log('💡 gradeCalc backend is not required for main functionality');
  }
}

export {
  parseGeminiResponse,
  saveSyllabusToDatabase,
  getAllCourses,
  getCourseById,
  updateCourseGoalGrade,
  updateAssessmentGrade,
  deleteCourse,
  deleteAssessment,
  clearAllCourses,
  calculateGradeSummary,
  syncAllCoursesToGradeCalc
}; 