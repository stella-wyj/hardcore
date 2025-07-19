// Syllabus Parser - Parses Gemini response and stores in database
import fs from 'fs';

// In-memory database (replace with real database in production)
let db = {
  courses: [],
  assessments: [],
  nextCourseId: 1,
  nextAssessmentId: 1
};

// Load existing data if available
try {
  if (fs.existsSync('database.json')) {
    const data = fs.readFileSync('database.json', 'utf8');
    db = JSON.parse(data);
  }
} catch (error) {
  console.log('No existing database found, starting fresh');
}

// Save database to file
function saveDatabase() {
  try {
    fs.writeFileSync('database.json', JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
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
      parsed.courseName = line.split('Course Name:')[1].trim();
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
      name: dateMatch[2].trim(),
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
      name: weightMatch[1].trim(),
      weight: parseInt(weightMatch[2]),
      type: type,
      description: item
    };
  }
  
  // Fallback - just store the raw item
  return {
    date: null,
    name: item,
    weight: null,
    type: type,
    description: item
  };
}

// Save parsed syllabus data to database
function saveSyllabusToDatabase(parsedData) {
  try {
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

export {
  parseGeminiResponse,
  saveSyllabusToDatabase,
  getAllCourses,
  getCourseById,
  updateCourseGoalGrade,
  updateAssessmentGrade,
  calculateGradeSummary
}; 