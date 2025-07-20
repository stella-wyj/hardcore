// Calendar Integration - Generate iCal files and calendar views
import fs from 'fs';

// Generate iCal content for a course
function generateICalForCourse(course) {
  const courseName = course.name;
  const instructor = course.instructor;
  
  let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CourseFlow//Academic Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${courseName}
X-WR-CALDESC:Academic calendar for ${courseName}
`;

  // Add each assessment as an event
  course.assessments.forEach(assessment => {
    if (assessment.dueDate) {
      const eventDate = new Date(assessment.dueDate);
      const eventEndDate = new Date(eventDate);
      eventEndDate.setHours(eventEndDate.getHours() + 1); // 1 hour duration
      
      const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = eventEndDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const createdDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      const eventTitle = `${assessment.title} (${assessment.type})`;
      const description = `Course: ${courseName}\nInstructor: ${instructor}\nWeight: ${assessment.weight}%\nType: ${assessment.type}`;
      
      icalContent += `BEGIN:VEVENT
UID:${course.id}-${assessment.id}@courseflow
DTSTAMP:${createdDate}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${eventTitle}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${courseName}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
    }
  });

  icalContent += 'END:VCALENDAR';
  return icalContent;
}

// Generate iCal content for all courses
function generateICalForAllCourses(courses) {
  let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CourseFlow//Academic Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:All Courses
X-WR-CALDESC:Academic calendar for all courses
`;

  courses.forEach(course => {
    course.assessments.forEach(assessment => {
      if (assessment.dueDate) {
        const eventDate = new Date(assessment.dueDate);
        const eventEndDate = new Date(eventDate);
        eventEndDate.setHours(eventEndDate.getHours() + 1);
        
        const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = eventEndDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const createdDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const eventTitle = `${assessment.title} - ${course.name}`;
        const description = `Course: ${course.name}\nInstructor: ${course.instructor}\nWeight: ${assessment.weight}%\nType: ${assessment.type}`;
        
        icalContent += `BEGIN:VEVENT
UID:${course.id}-${assessment.id}@courseflow
DTSTAMP:${createdDate}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${eventTitle}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${course.name}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
      }
    });
  });

  icalContent += 'END:VCALENDAR';
  return icalContent;
}

// Generate calendar view data for the frontend
function generateCalendarViewData(courses) {
  const events = [];
  
  courses.forEach(course => {
    course.assessments.forEach(assessment => {
      if (assessment.dueDate) {
        events.push({
          id: `${course.id}-${assessment.id}`,
          title: assessment.title,
          course: course.name,
          type: assessment.type,
          weight: assessment.weight,
          date: assessment.dueDate,
          color: course.color,
          instructor: course.instructor,
          grade: assessment.grade,
          completed: assessment.completed || false
        });
      }
    });
  });
  
  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return events;
}

// Get upcoming events (next 30 days)
function getUpcomingEvents(courses, days = 30) {
  const events = generateCalendarViewData(courses);
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= now && eventDate <= futureDate;
  });
}

// Get events by month
function getEventsByMonth(courses, year, month) {
  const events = generateCalendarViewData(courses);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  });
}

// Save iCal file to disk
function saveICalFile(content, filename) {
  const uploadsDir = './uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filepath = `${uploadsDir}/${filename}`;
  fs.writeFileSync(filepath, content);
  return filepath;
}

// Update event completion status
function updateEventCompletion(courses, eventId, completed) {
  const [courseId, assessmentId] = eventId.split('-');
  
  const course = courses.find(c => c.id.toString() === courseId);
  if (course) {
    const assessment = course.assessments.find(a => a.id.toString() === assessmentId);
    if (assessment) {
      assessment.completed = completed;
      return true;
    }
  }
  return false;
}

export {
  generateICalForCourse,
  generateICalForAllCourses,
  generateCalendarViewData,
  getUpcomingEvents,
  getEventsByMonth,
  saveICalFile,
  updateEventCompletion
}; 