// --- Syllabus Analyzer Functionality from backend.html ---
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const error = document.getElementById('error');
const backendResults = document.getElementById('backend-results');
const backendResultsContent = document.getElementById('backendResultsContent');

// Drag and drop functionality
if (uploadArea) {
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });
}

if (fileInput) {
  fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);
    }
  });
}

function handleFile(file) {
  if (!file.type.includes('pdf') && !file.type.includes('text')) {
    showError('Please select a PDF or TXT file.');
    return;
  }
  showError('');
  backendResults.style.display = 'block';
  
  // Show detailed progress bar
  let progressHtml = `
    <div class="progress-container" style="margin: 20px 0;">
      <h3>📄 Processing Syllabus</h3>
      <div class="progress-bar" style="width: 100%; height: 20px; background-color: #f0f0f0; border-radius: 10px; overflow: hidden; margin: 10px 0;">
        <div class="progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4CAF50, #45a049); transition: width 0.3s ease;"></div>
      </div>
      <div class="progress-text" style="text-align: center; margin-top: 5px; font-weight: bold; color: #666;">Starting...</div>
      <div class="progress-details" style="margin-top: 10px; font-size: 0.9em; color: #888;"></div>
    </div>
  `;
  backendResultsContent.innerHTML = progressHtml;
  
  const progressFill = backendResultsContent.querySelector('.progress-fill');
  const progressText = backendResultsContent.querySelector('.progress-text');
  const progressDetails = backendResultsContent.querySelector('.progress-details');
  
  // Update progress function
  function updateProgress(percent, text, details = '') {
    progressFill.style.width = percent + '%';
    progressText.textContent = text;
    if (details) {
      progressDetails.innerHTML = details;
    }
  }
  
  // Simulate progress updates
  updateProgress(10, 'Uploading file...', '📤 Sending PDF to server');
  setTimeout(() => updateProgress(20, 'Converting PDF to images...', '🔄 Using OCR to extract text'), 500);
  setTimeout(() => updateProgress(40, 'Extracting text with OCR...', '🔍 Processing each page'), 1000);
  setTimeout(() => updateProgress(60, 'Analyzing with AI...', '🤖 Sending to Gemini for analysis'), 1500);
  setTimeout(() => updateProgress(80, 'Processing results...', '📋 Parsing and organizing data'), 2000);
  const formData = new FormData();
  formData.append('syllabus', file);
  fetch('/upload', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show 100% completion
        updateProgress(100, 'Complete!', '✅ Syllabus processed successfully');
        
        // Wait a moment to show completion, then display results
        setTimeout(() => {
          let html = '';
          
          // Show success message with course info
          html += '<div style="background:#d4edda;color:#155724;padding:1em;border-radius:8px;margin-bottom:1em;">';
          html += `✅ <strong>Course created successfully!</strong><br>`;
          html += `📚 Course: ${data.course.name}<br>`;
          html += `👨‍🏫 Instructor: ${data.course.instructor}<br>`;
          html += `📊 Assessments: ${data.assessmentCount} items added`;
          html += '</div>';
        
        // Show structured course data
        html += '<h3>📋 Course Overview</h3>';
        html += '<div style="background:#f8f9fa;padding:1em;border-radius:8px;margin-bottom:1em;">';
        
        if (data.parsedData.quizzes.length > 0) {
          html += `<h4>📝 Quizzes (${data.parsedData.quizzes.length})</h4>`;
          html += '<ul>';
          data.parsedData.quizzes.forEach(quiz => {
            html += `<li><strong>${quiz.name}</strong> - ${quiz.weight}% ${quiz.date ? `(Due: ${quiz.date})` : ''}</li>`;
          });
          html += '</ul>';
        }
        
        if (data.parsedData.assignments.length > 0) {
          html += `<h4>📄 Assignments (${data.parsedData.assignments.length})</h4>`;
          html += '<ul>';
          data.parsedData.assignments.forEach(assignment => {
            html += `<li><strong>${assignment.name}</strong> - ${assignment.weight}% ${assignment.date ? `(Due: ${assignment.date})` : ''}</li>`;
          });
          html += '</ul>';
        }
        
        if (data.parsedData.midterm) {
          html += '<h4>📚 Midterm</h4>';
          html += `<ul><li><strong>${data.parsedData.midterm.name}</strong> - ${data.parsedData.midterm.weight}% ${data.parsedData.midterm.date ? `(Due: ${data.parsedData.midterm.date})` : ''}</li></ul>`;
        }
        
        if (data.parsedData.final) {
          html += '<h4>🎯 Final</h4>';
          html += `<ul><li><strong>${data.parsedData.final.name}</strong> - ${data.parsedData.final.weight}% ${data.parsedData.final.date ? `(Due: ${data.parsedData.final.date})` : ''}</li></ul>`;
        }
        
        if (data.parsedData.officeHours.length > 0) {
          html += '<h4>🕐 Office Hours</h4>';
          html += '<ul>';
          data.parsedData.officeHours.forEach(oh => {
            html += `<li>${oh}</li>`;
          });
          html += '</ul>';
        }
        
        html += '</div>';
        
        // Show raw Gemini response (collapsible)
        html += '<details style="margin-top:1em;">';
        html += '<summary style="cursor:pointer;font-weight:bold;">📄 View Raw Gemini Response</summary>';
        html += '<div style="background:#f8f8f8;padding:1em;border-radius:8px;margin-top:0.5em;white-space:pre-wrap;font-family:monospace;font-size:0.9em;max-height:400px;overflow:auto;border:1px solid #e0e0e0;word-wrap:break-word;max-width:100%;">';
        html += data.extractedInfo ? data.extractedInfo.replace(/\n/g, '<br>') : 'No response';
        html += '</div>';
        html += '</details>';
        
        // Show structured data (collapsible)
        html += '<details style="margin-top:1em;">';
        html += '<summary style="cursor:pointer;font-weight:bold;">🔍 View Structured Data</summary>';
        html += '<pre style="background:#f8f8f8;padding:1em;border-radius:8px;margin-top:0.5em;overflow:auto;font-size:0.9em;max-height:400px;border:1px solid #e0e0e0;white-space:pre-wrap;word-wrap:break-word;max-width:100%;">' + JSON.stringify(data.parsedData, null, 2) + '</pre>';
        html += '</details>';
        
        backendResultsContent.innerHTML = html;
        
        // Refresh the courses list in Performance Summary
        loadCoursesAndGrades();
        }, 1000); // Close setTimeout
        
      } else {
        updateProgress(100, 'Error!', '❌ ' + (data.error || 'Failed to process syllabus'));
        setTimeout(() => {
          showError(data.error || 'Failed to process syllabus');
          backendResults.style.display = 'none';
        }, 2000);
      }
    })
    .catch(err => {
      updateProgress(100, 'Error!', '❌ Error uploading file: ' + err.message);
      setTimeout(() => {
        showError('Error uploading file: ' + err.message);
        backendResults.style.display = 'none';
      }, 2000);
    });
}

function showError(message) {
  if (error) {
    error.textContent = message;
    error.style.display = message ? 'block' : 'none';
  }
}

function toggleInputMethod() {
  const uploadArea = document.getElementById('uploadArea');
  const textInputArea = document.getElementById('textInputArea');
  const toggleBtn = document.querySelector('button[onclick="toggleInputMethod()"]');
  if (uploadArea.style.display !== 'none') {
    uploadArea.style.display = 'none';
    textInputArea.style.display = 'block';
    toggleBtn.textContent = 'Switch to File Upload';
    toggleBtn.style.background = '#007bff';
  } else {
    uploadArea.style.display = 'block';
    textInputArea.style.display = 'none';
    toggleBtn.textContent = 'Switch to Text Input';
    toggleBtn.style.background = '#28a745';
  }
}

function handleTextSubmit() {
  const text = document.getElementById('syllabusText').value.trim();
  if (!text) {
    showError('Please enter syllabus content.');
    return;
  }
  showError('');
  backendResults.style.display = 'block';
  
  // Show progress bar for text analysis
  let progressHtml = `
    <div class="progress-container" style="margin: 20px 0;">
      <h3>📝 Processing Text</h3>
      <div class="progress-bar" style="width: 100%; height: 20px; background-color: #f0f0f0; border-radius: 10px; overflow: hidden; margin: 10px 0;">
        <div class="progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4CAF50, #45a049); transition: width 0.3s ease;"></div>
      </div>
      <div class="progress-text" style="text-align: center; margin-top: 5px; font-weight: bold; color: #666;">Starting...</div>
      <div class="progress-details" style="margin-top: 10px; font-size: 0.9em; color: #888;"></div>
    </div>
  `;
  backendResultsContent.innerHTML = progressHtml;
  
  const progressFill = backendResultsContent.querySelector('.progress-fill');
  const progressText = backendResultsContent.querySelector('.progress-text');
  const progressDetails = backendResultsContent.querySelector('.progress-details');
  
  // Update progress function
  function updateProgress(percent, text, details = '') {
    progressFill.style.width = percent + '%';
    progressText.textContent = text;
    if (details) {
      progressDetails.innerHTML = details;
    }
  }
  
  // Simulate progress updates
  updateProgress(20, 'Sending text to server...', '📤 Uploading syllabus text');
  setTimeout(() => updateProgress(50, 'Analyzing with AI...', '🤖 Processing with Gemini'), 500);
  setTimeout(() => updateProgress(80, 'Processing results...', '📋 Organizing data'), 1000);
  fetch('/analyze-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show 100% completion
        updateProgress(100, 'Complete!', '✅ Text analysis completed');
        
        // Wait a moment to show completion, then display results
        setTimeout(() => {
          let html = '';
          html += '<h3>Extracted Syllabus Information</h3>';
          html += '<div style="margin-bottom:1em;white-space:pre-line;">' + (data.extractedInfo ? data.extractedInfo.replace(/\n/g, '<br>') : '') + '</div>';
          html += '<h4>Numbers Found</h4>';
          html += '<ul>' + (data.numbers && data.numbers.length ? data.numbers.map(n => `<li>${n}</li>`).join('') : '<li>None</li>') + '</ul>';
          html += '<h4>Words Found</h4>';
          html += '<ul style="max-height:150px;overflow:auto;">' + (data.words && data.words.length ? data.words.map(w => `<li>${w}</li>`).join('') : '<li>None</li>') + '</ul>';
          html += '<h3>Raw Backend Response</h3>';
          html += '<pre style="background:#f8f8f8;padding:10px;border-radius:8px;overflow:auto;max-height:400px;border:1px solid #e0e0e0;white-space:pre-wrap;word-wrap:break-word;max-width:100%;">' + JSON.stringify(data, null, 2) + '</pre>';
          backendResultsContent.innerHTML = html;
        }, 1000);
              } else {
          updateProgress(100, 'Error!', '❌ ' + (data.error || 'Failed to analyze syllabus'));
          setTimeout(() => {
            showError(data.error || 'Failed to analyze syllabus');
            backendResults.style.display = 'none';
          }, 2000);
        }
      })
      .catch(err => {
        updateProgress(100, 'Error!', '❌ Error analyzing text: ' + err.message);
        setTimeout(() => {
          showError('Error analyzing text: ' + err.message);
          backendResults.style.display = 'none';
        }, 2000);
      });
}
// --- End Syllabus Analyzer Functionality ---

// --- Navigation and Section Management ---
function showSection(sectionName) {
  // Hide all sections
  document.getElementById('dashboard-section').style.display = 'none';
  document.getElementById('calendar-section').style.display = 'none';
  document.getElementById('gradecalc-section').style.display = 'none';
  
  // Show selected section
  document.getElementById(sectionName + '-section').style.display = 'flex';
  
  // Update navigation active state
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.' + sectionName + '-btn').classList.add('active');
  
  // Load data for grade calculator section
  if (sectionName === 'gradecalc') {
    loadGradeCalculatorData();
  }
}

// --- Grade Calculator Functionality ---
let currentCourses = [];
let selectedCourseId = null;

// Load grade calculator data
async function loadGradeCalculatorData() {
  try {
    const response = await fetch('/api/courses');
    const courses = await response.json();
    currentCourses = courses;
    
    if (courses.length === 0) {
      showNoCoursesMessage();
    } else {
      renderCourseTabs(courses);
      if (!selectedCourseId) {
        selectCourse(courses[0].id);
      } else {
        selectCourse(selectedCourseId);
      }
    }
  } catch (error) {
    console.error('Error loading courses:', error);
    showNoCoursesMessage();
  }
}

// Show no courses message
function showNoCoursesMessage() {
  document.getElementById('noCoursesMessage').style.display = 'block';
  document.getElementById('courseContent').style.display = 'none';
  document.getElementById('courseTabs').innerHTML = '';
}

// Render course tabs
function renderCourseTabs(courses) {
  const courseTabs = document.getElementById('courseTabs');
  courseTabs.innerHTML = courses.map(course => {
    const currentGrade = calculateCurrentGrade(course);
    const gradeClass = getGradeClass(currentGrade);
    return `
      <div class="course-tab ${selectedCourseId === course.id ? 'active' : ''}" onclick="selectCourse(${course.id})">
        <div class="course-name">${course.name}</div>
        <div class="course-grade ${gradeClass}">${currentGrade ? currentGrade.toFixed(1) + '%' : '--'}</div>
      </div>
    `;
  }).join('');
}

// Select a course
async function selectCourse(courseId) {
  selectedCourseId = courseId;
  const course = currentCourses.find(c => c.id === courseId);
  
  if (!course) return;
  
  // Update tab selection
  renderCourseTabs(currentCourses);
  
  // Show course content
  document.getElementById('noCoursesMessage').style.display = 'none';
  document.getElementById('courseContent').style.display = 'block';
  
  // Update course info
  document.getElementById('currentCourseName').textContent = course.name;
  
  // Load goal grade
  const goalGradeInput = document.getElementById('goalGradeInput');
  goalGradeInput.value = course.goalGrade || '';
  
  // Render assessments
  renderAssessments(course);
  
  // Update grade calculations
  updateGradeCalculations(course);
}

// Render assessments for a course
function renderAssessments(course) {
  const assessmentsList = document.getElementById('assessmentsList');
  
  if (!course.assessments || course.assessments.length === 0) {
    assessmentsList.innerHTML = '<p style="color: #666; text-align: center;">No assessments found for this course</p>';
    return;
  }
  
  assessmentsList.innerHTML = course.assessments.map(assessment => `
    <div class="assessment-item">
      <div class="assessment-header">
        <div class="assessment-title">${assessment.title}</div>
        <div class="assessment-weight">${assessment.weight || 0}%</div>
      </div>
      <div class="assessment-details">
        <div class="assessment-detail">
          <strong>Type:</strong> 
          <span class="type-badge">${assessment.type}</span>
        </div>
        <div class="assessment-detail">
          <strong>Due:</strong> ${assessment.dueDate || 'Not specified'}
        </div>
      </div>
      <div class="grade-input-section">
        <label>Grade:</label>
        <input type="number" id="grade-${assessment.id}" placeholder="Enter grade" min="0" max="100" value="${assessment.grade || ''}" />
        <button onclick="updateAssessmentGrade(${course.id}, ${assessment.id})">Save</button>
        ${assessment.grade ? `
          <span class="grade-display">${assessment.grade}%</span>
          <button onclick="deleteAssessmentGrade(${course.id}, ${assessment.id})" class="delete-grade-btn">Delete Grade</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Update assessment grade
async function updateAssessmentGrade(courseId, assessmentId) {
  const gradeInput = document.getElementById(`grade-${assessmentId}`);
  const grade = parseFloat(gradeInput.value);
  
  if (isNaN(grade) || grade < 0 || grade > 100) {
    alert('Please enter a valid grade between 0 and 100');
    return;
  }
  
  try {
    const response = await fetch(`/api/courses/${courseId}/assessments/${assessmentId}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade })
    });
    
    if (response.ok) {
      // Update local data
      const course = currentCourses.find(c => c.id === courseId);
      const assessment = course.assessments.find(a => a.id === assessmentId);
      assessment.grade = grade;
      
      // Re-render to show updated grade
      renderAssessments(course);
      renderCourseTabs(currentCourses);
      updateGradeCalculations(course);
      
      // Show success message
      gradeInput.style.borderColor = '#4CAF50';
      setTimeout(() => {
        gradeInput.style.borderColor = '#ddd';
      }, 2000);
    } else {
      alert('Error updating grade');
    }
  } catch (error) {
    console.error('Error updating grade:', error);
    alert('Error updating grade');
  }
}

// Delete assessment grade
async function deleteAssessmentGrade(courseId, assessmentId) {
  if (!confirm('Are you sure you want to delete this assessment grade?')) {
    return;
  }

  try {
    const response = await fetch(`/api/courses/${courseId}/assessments/${assessmentId}/grade`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      // Update local data
      const course = currentCourses.find(c => c.id === courseId);
      const assessment = course.assessments.find(a => a.id === assessmentId);
      assessment.grade = null; // Set grade to null to indicate it's not graded
      
      // Re-render to show updated grade
      renderAssessments(course);
      renderCourseTabs(currentCourses);
      updateGradeCalculations(course);
      
      // Show success message
      alert('Assessment grade deleted successfully!');
    } else {
      alert('Error deleting assessment grade');
    }
  } catch (error) {
    console.error('Error deleting assessment grade:', error);
    alert('Error deleting assessment grade');
  }
}

// Update goal grade
async function updateGoalGrade() {
  const goalGradeInput = document.getElementById('goalGradeInput');
  const goalGrade = parseFloat(goalGradeInput.value);
  
  if (isNaN(goalGrade) || goalGrade < 0 || goalGrade > 100) {
    alert('Please enter a valid goal grade between 0 and 100');
    return;
  }
  
  try {
    const response = await fetch(`/api/courses/${selectedCourseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalGrade })
    });
    
    if (response.ok) {
      // Update local data
      const course = currentCourses.find(c => c.id === selectedCourseId);
      course.goalGrade = goalGrade;
      
      // Update grade calculations
      updateGradeCalculations(course);
      
      // Show success message
      goalGradeInput.style.borderColor = '#4CAF50';
      setTimeout(() => {
        goalGradeInput.style.borderColor = '#ddd';
      }, 2000);
    } else {
      alert('Error updating goal grade');
    }
  } catch (error) {
    console.error('Error updating goal grade:', error);
    alert('Error updating goal grade');
  }
}

// Calculate current grade for a course
function calculateCurrentGrade(course) {
  if (!course.assessments || course.assessments.length === 0) return null;
  
  const gradedAssessments = course.assessments.filter(a => a.grade !== null && a.grade !== undefined);
  if (gradedAssessments.length === 0) return null;
  
  const totalWeightedGrade = gradedAssessments.reduce((sum, a) => sum + (a.grade * (a.weight || 0)), 0);
  const totalWeight = gradedAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
  
  return totalWeight > 0 ? totalWeightedGrade / totalWeight : null;
}

// Calculate required grade to reach goal
function calculateRequiredGrade(course) {
  if (!course.goalGrade || !course.assessments) return null;
  
  const gradedAssessments = course.assessments.filter(a => a.grade !== null && a.grade !== undefined);
  const ungradedAssessments = course.assessments.filter(a => a.grade === null || a.grade === undefined);
  
  if (ungradedAssessments.length === 0) return null;
  
  const currentWeightedGrade = gradedAssessments.reduce((sum, a) => sum + (a.grade * (a.weight || 0)), 0);
  const totalWeight = course.assessments.reduce((sum, a) => sum + (a.weight || 0), 0);
  const ungradedWeight = ungradedAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
  
  const requiredWeightedGrade = (course.goalGrade * totalWeight) - currentWeightedGrade;
  const requiredGrade = requiredWeightedGrade / ungradedWeight;
  
  return requiredGrade > 0 ? requiredGrade : 0;
}

// Update grade calculations display
function updateGradeCalculations(course) {
  const currentGrade = calculateCurrentGrade(course);
  const requiredGrade = calculateRequiredGrade(course);
  
  // Update current grade display
  const currentGradeElement = document.getElementById('currentGrade');
  if (currentGrade !== null) {
    currentGradeElement.textContent = currentGrade.toFixed(1) + '%';
    currentGradeElement.className = 'stat-value ' + getGradeClass(currentGrade);
  } else {
    currentGradeElement.textContent = '--';
    currentGradeElement.className = 'stat-value';
  }
  
  // Update required grade display
  const requiredGradeStat = document.getElementById('requiredGradeStat');
  const requiredGradeElement = document.getElementById('requiredGrade');
  
  if (requiredGrade !== null) {
    requiredGradeStat.style.display = 'flex';
    requiredGradeElement.textContent = requiredGrade.toFixed(1) + '%';
    requiredGradeElement.className = 'stat-value ' + getGradeClass(requiredGrade);
  } else {
    requiredGradeStat.style.display = 'none';
  }
}

// Get CSS class for grade color
function getGradeClass(grade) {
  if (grade === null || grade === undefined) return '';
  if (grade >= 80) return 'highlight';
  if (grade >= 70) return 'warning';
  return 'danger';
}

// --- File Upload and Navigation ---
document.querySelectorAll('.nav-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

// File upload preview logic
document.getElementById("fileUpload").addEventListener("change", function () {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  Array.from(this.files).forEach(file => {
    const listItem = document.createElement("li");
    listItem.textContent = file.name;
    fileList.appendChild(listItem);
  });
});

// Fetch and display courses and grades in Performance Summary (Dashboard)
async function loadCoursesAndGrades() {
  const gradesBox = document.querySelector('.grades-box');
  if (!gradesBox) return;
  
  const performanceSummary = document.getElementById('performance-summary');
  if (!performanceSummary) return;
  
  performanceSummary.innerHTML = '';
  
  try {
    const res = await fetch('/api/courses');
    const courses = await res.json();
    if (Array.isArray(courses) && courses.length > 0) {
      courses.forEach(course => {
        const currentGrade = calculateCurrentGrade(course);
        const gradeDiv = document.createElement('div');
        gradeDiv.className = 'grade';
        gradeDiv.innerHTML = `
          <span>${course.name}</span>
          <span>${currentGrade ? currentGrade.toFixed(1) + '%' : '--'}</span>
        `;
        performanceSummary.appendChild(gradeDiv);
      });
    } else {
      performanceSummary.innerHTML = '<div style="color:#888;">No courses found.</div>';
    }
  } catch (e) {
    performanceSummary.innerHTML = '<div style="color:#c00;">Error loading courses.</div>';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadCoursesAndGrades();
  
  // Set up navigation based on current path
  const path = window.location.pathname;
  if (path.includes("dashboard")) {
    document.querySelector(".dashboard-btn").classList.add("active");
  } else if (path.includes("calendar")) {
    document.querySelector(".calendar-btn").classList.add("active");
  } else if (path.includes("grades")) {
    document.querySelector(".gradecalc-btn").classList.add("active");
  }
});
  
  