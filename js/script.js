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
  