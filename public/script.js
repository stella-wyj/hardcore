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
  backendResultsContent.innerHTML = '<div class="loading">🤖 Analyzing syllabus with AI...</div>';
  const formData = new FormData();
  formData.append('syllabus', file);
  fetch('/upload', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
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
        html += '<div style="background:#f8f8f8;padding:1em;border-radius:8px;margin-top:0.5em;white-space:pre-line;font-family:monospace;font-size:0.9em;">';
        html += data.extractedInfo ? data.extractedInfo.replace(/\n/g, '<br>') : 'No response';
        html += '</div>';
        html += '</details>';
        
        // Show structured data (collapsible)
        html += '<details style="margin-top:1em;">';
        html += '<summary style="cursor:pointer;font-weight:bold;">🔍 View Structured Data</summary>';
        html += '<pre style="background:#f8f8f8;padding:1em;border-radius:8px;margin-top:0.5em;overflow:auto;font-size:0.9em;">' + JSON.stringify(data.parsedData, null, 2) + '</pre>';
        html += '</details>';
        
        backendResultsContent.innerHTML = html;
        
        // Refresh the courses list in Performance Summary
        loadCoursesAndGrades();
        
      } else {
        showError(data.error || 'Failed to process syllabus');
        backendResults.style.display = 'none';
      }
    })
    .catch(err => {
      showError('Error uploading file: ' + err.message);
      backendResults.style.display = 'none';
    });
}

function showError(message) {
  error.textContent = message;
  error.style.display = message ? 'block' : 'none';
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
  backendResultsContent.innerHTML = '<div class="loading">🤖 Analyzing syllabus with AI...</div>';
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
        let html = '';
        html += '<h3>Extracted Syllabus Information</h3>';
        html += '<div style="margin-bottom:1em;white-space:pre-line;">' + (data.extractedInfo ? data.extractedInfo.replace(/\n/g, '<br>') : '') + '</div>';
        html += '<h4>Numbers Found</h4>';
        html += '<ul>' + (data.numbers && data.numbers.length ? data.numbers.map(n => `<li>${n}</li>`).join('') : '<li>None</li>') + '</ul>';
        html += '<h4>Words Found</h4>';
        html += '<ul style="max-height:150px;overflow:auto;">' + (data.words && data.words.length ? data.words.map(w => `<li>${w}</li>`).join('') : '<li>None</li>') + '</ul>';
        html += '<h3>Raw Backend Response</h3>';
        html += '<pre style="background:#f8f8f8;padding:10px;border-radius:8px;overflow:auto;">' + JSON.stringify(data, null, 2) + '</pre>';
        backendResultsContent.innerHTML = html;
      } else {
        showError(data.error || 'Failed to analyze syllabus');
        backendResults.style.display = 'none';
      }
    })
    .catch(err => {
      showError('Error analyzing text: ' + err.message);
      backendResults.style.display = 'none';
    });
}
// --- End Syllabus Analyzer Functionality ---

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
  
// Fetch and display courses and grades in Performance Summary
async function loadCoursesAndGrades() {
  const gradesBox = document.querySelector('.grades-box');
  gradesBox.innerHTML = '<h2>Performance Summary</h2>';
  try {
    const res = await fetch('/api/courses');
    const courses = await res.json();
    if (Array.isArray(courses) && courses.length > 0) {
      courses.forEach(course => {
        const gradeDiv = document.createElement('div');
        gradeDiv.className = 'grade';
        gradeDiv.innerHTML = `
          <span>${course.name}</span>
          <button class="nav-btn" style="font-size:0.95em; padding:6px 14px; margin-left:10px;" onclick="fetchRequiredGrade(${course.id}, '${course.name}')">Required Grade</button>
        `;
        gradesBox.appendChild(gradeDiv);
      });
    } else {
      gradesBox.innerHTML += '<div style="color:#888;">No courses found.</div>';
    }
  } catch (e) {
    gradesBox.innerHTML += '<div style="color:#c00;">Error loading courses.</div>';
  }
}

window.fetchRequiredGrade = async function(courseId, courseName) {
  try {
    const res = await fetch(`/api/courses/${courseId}/required-grade`);
    const data = await res.json();
    if (res.ok) {
      alert(
        `Course: ${courseName}\n` +
        (data.message || 'Required grades:') +
        (data.currentGrade !== undefined ? `\nCurrent Grade: ${data.currentGrade.toFixed(2)}` : '') +
        (data.requiredGrades && data.requiredGrades.length ?
          ('\nRequired Grades: ' + data.requiredGrades.map(rg => `${rg.title}: ${rg.requiredGrade.toFixed(2)}`).join(', ')) :
          ''
        )
      );
    } else {
      alert(data.error || 'An error occurred.');
    }
  } catch (e) {
    alert('Failed to fetch required grade.');
  }
}

// File upload and analysis logic for syllabus
const uploadForm = document.getElementById('uploadForm');

if (uploadForm) {
  uploadForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) {
      showError('Please select a PDF or TXT file.');
      return;
    }
    // Show loading
    backendResults.style.display = 'block';
    backendResultsContent.innerHTML = '<div class="loading">🤖 Analyzing syllabus with AI...</div>';
    showError('');
    backendResults.style.display = 'none';
    backendResultsContent.innerHTML = '';

    const formData = new FormData();
    formData.append('syllabus', file);

    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success && data.extractedInfo) {
          let html = '';
          html += '<h3>Extracted Syllabus Information</h3>';
          html += '<div style="margin-bottom:1em;white-space:pre-line;">' + (data.extractedInfo ? data.extractedInfo.replace(/\n/g, '<br>') : '') + '</div>';
          html += '<h4>Numbers Found</h4>';
          html += '<ul>' + (data.numbers && data.numbers.length ? data.numbers.map(n => `<li>${n}</li>`).join('') : '<li>None</li>') + '</ul>';
          html += '<h4>Words Found</h4>';
          html += '<ul style="max-height:150px;overflow:auto;">' + (data.words && data.words.length ? data.words.map(w => `<li>${w}</li>`).join('') : '<li>None</li>') + '</ul>';
          html += '<h3>Raw Backend Response</h3>';
          html += '<pre style="background:#f8f8f8;padding:10px;border-radius:8px;overflow:auto;">' + JSON.stringify(data, null, 2) + '</pre>';
          backendResultsContent.innerHTML = html;
        } else if (data.success && data.data) {
          backendResultsContent.innerHTML = data.data;
        } else {
          showError(data.error || 'Failed to process syllabus');
        }
      })
      .catch(err => {
        showError('Error uploading file: ' + err.message);
      });
  });
}

// Call on page load
loadCoursesAndGrades();
  
// jens code
const path = window.location.pathname;

  if (path.includes("dashboard")) {
    document.querySelector(".dashboard-btn").classList.add("active");
  } else if (path.includes("calendar")) {
    document.querySelector(".calendar-btn").classList.add("active");
  } else if (path.includes("grades")) {
    document.querySelector(".grades-btn").classList.add("active");
  }


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
  
// Fetch and display courses and grades in Performance Summary
async function loadCoursesAndGrades() {
  const gradesBox = document.querySelector('.grades-box');
  gradesBox.innerHTML = '<h2>Performance Summary</h2>';
  try {
    const res = await fetch('/api/courses');
    const courses = await res.json();
    if (Array.isArray(courses) && courses.length > 0) {
      courses.forEach(course => {
        const gradeDiv = document.createElement('div');
        gradeDiv.className = 'grade';
        gradeDiv.innerHTML = `
          <span>${course.name}</span>
          <button class="nav-btn" style="font-size:0.95em; padding:6px 14px; margin-left:10px;" onclick="fetchRequiredGrade(${course.id}, '${course.name}')">Required Grade</button>
        `;
        gradesBox.appendChild(gradeDiv);
      });
    } else {
      gradesBox.innerHTML += '<div style="color:#888;">No courses found.</div>';
    }
  } catch (e) {
    gradesBox.innerHTML += '<div style="color:#c00;">Error loading courses.</div>';
  }
}

window.fetchRequiredGrade = async function(courseId, courseName) {
  try {
    const res = await fetch(`/api/courses/${courseId}/required-grade`);
    const data = await res.json();
    if (res.ok) {
      alert(
        `Course: ${courseName}\n` +
        (data.message || 'Required grades:') +
        (data.currentGrade !== undefined ? `\nCurrent Grade: ${data.currentGrade.toFixed(2)}` : '') +
        (data.requiredGrades && data.requiredGrades.length ?
          ('\nRequired Grades: ' + data.requiredGrades.map(rg => `${rg.title}: ${rg.requiredGrade.toFixed(2)}`).join(', ')) :
          ''
        )
      );
    } else {
      alert(data.error || 'An error occurred.');
    }
  } catch (e) {
    alert('Failed to fetch required grade.');
  }
}

// Call on page load
loadCoursesAndGrades();
  