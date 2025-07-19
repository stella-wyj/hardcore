import { getAllCourses, getCourseById, updateCourseGoalGrade, updateAssessmentGrade, calculateGradeSummary } from './syllabusParser.js';

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const courses = getAllCourses();
        res.status(200).json(courses);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
      }
      break;

    case 'POST':
      try {
        const { name, instructor, goalGrade } = req.body;
        
        // For now, courses are created through syllabus upload
        // This endpoint can be used for manual course creation
        res.status(201).json({ 
          message: 'Course creation through syllabus upload is recommended',
          courses: getAllCourses()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create course' });
      }
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}