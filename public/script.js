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
  fetch('/api/upload', {
    method: 'POST',
    body: formData
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
  fetch('/api/analyze-text', {
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
  