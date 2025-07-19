// Test script for CourseFlow API endpoints
const API_BASE = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing CourseFlow API endpoints...\n');

  try {
    // Test 1: Get all courses (should be empty initially)
    console.log('1️⃣ Testing GET /api/courses...');
    const coursesResponse = await fetch(`${API_BASE}/api/courses`);
    const courses = await coursesResponse.json();
    console.log('✅ Courses:', courses);
    console.log('');

    // Test 2: Test syllabus upload with sample data
    console.log('2️⃣ Testing syllabus upload...');
    
    // Create a sample syllabus text
    const sampleSyllabus = `
Course Name: Introduction to Computer Science
Instructor: Dr. Jane Smith

Quizzes:
- 2024-03-15: Quiz 1 - 10%
- 2024-04-01: Quiz 2 - 10%
- 2024-04-15: Quiz 3 - 10%

Assignments:
- 2024-03-20: Assignment 1 - 15%
- 2024-04-10: Assignment 2 - 15%
- 2024-05-01: Assignment 3 - 15%

Midterm:
- 2024-04-20: Midterm Exam - 20%

Final:
- 2024-05-15: Final Exam - 25%

Office Hours:
- Monday, 2:00 PM, Room 101
- Wednesday, 4:00 PM, Room 101

Textbooks:
- "Computer Science: An Overview" by J. Glenn Brookshear - ISBN: 978-0133760064
- "Python Programming" by John Zelle - ISBN: 978-1590282755

Other Key Information:
- Attendance is mandatory
- Late assignments will be penalized 10% per day
- Academic integrity is strictly enforced
    `;

    const textResponse = await fetch(`${API_BASE}/analyze-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: sampleSyllabus })
    });

    const uploadResult = await textResponse.json();
    
    if (uploadResult.success) {
      console.log('✅ Syllabus uploaded successfully!');
      console.log(`📚 Course: ${uploadResult.course.name}`);
      console.log(`👨‍🏫 Instructor: ${uploadResult.course.instructor}`);
      console.log(`📊 Assessments: ${uploadResult.assessmentCount}`);
      console.log(`🆔 Course ID: ${uploadResult.courseId}`);
    } else {
      console.log('❌ Upload failed:', uploadResult.error);
    }
    console.log('');

    // Test 3: Get all courses again (should now have 1 course)
    console.log('3️⃣ Testing GET /api/courses (after upload)...');
    const coursesResponse2 = await fetch(`${API_BASE}/api/courses`);
    const courses2 = await coursesResponse2.json();
    console.log('✅ Courses:', courses2);
    console.log('');

    // Test 4: Get specific course details
    if (uploadResult.success) {
      console.log('4️⃣ Testing GET /api/courses/[id]...');
      const courseResponse = await fetch(`${API_BASE}/api/courses/${uploadResult.courseId}`);
      const courseDetails = await courseResponse.json();
      console.log('✅ Course details:', JSON.stringify(courseDetails, null, 2));
      console.log('');

      // Test 5: Update goal grade
      console.log('5️⃣ Testing PUT /api/courses/[id] (update goal grade)...');
      const updateResponse = await fetch(`${API_BASE}/api/courses/${uploadResult.courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goalGrade: 85 })
      });
      const updateResult = await updateResponse.json();
      console.log('✅ Goal grade update:', updateResult);
      console.log('');

      // Test 6: Update an assessment grade
      if (courseDetails.assessments && courseDetails.assessments.length > 0) {
        const firstAssessment = courseDetails.assessments[0];
        console.log('6️⃣ Testing POST /api/courses/[id]/assessments/[aid]/grade...');
        const gradeResponse = await fetch(`${API_BASE}/api/courses/${uploadResult.courseId}/assessments/${firstAssessment.id}/grade`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ grade: 92 })
        });
        const gradeResult = await gradeResponse.json();
        console.log('✅ Grade update:', gradeResult);
        console.log('');

        // Test 7: Get course details again to see updated grades
        console.log('7️⃣ Testing GET /api/courses/[id] (after grade update)...');
        const courseResponse2 = await fetch(`${API_BASE}/api/courses/${uploadResult.courseId}`);
        const courseDetails2 = await courseResponse2.json();
        console.log('✅ Updated course details:', JSON.stringify(courseDetails2, null, 2));
      }
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testAPI(); 