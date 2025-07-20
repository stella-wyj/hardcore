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
        const { name, instructor, color, goalGrade } = req.body;
        
        if (!name) {
          return res.status(400).json({ error: 'Course name is required' });
        }
        
        // Create new course
        const newCourse = {
          id: Date.now(), // Simple ID generation
          name: name,
          instructor: instructor || 'Not specified',
          color: color || '#4285f4',
          goalGrade: goalGrade || null,
          assessments: []
        };
        
        // Add to courses data (you'll need to implement this in syllabusParser.js)
        // For now, we'll return the course structure
        res.status(201).json(newCourse);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create course' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Course ID is required' });
        }
        
        // Delete course logic (you'll need to implement this in syllabusParser.js)
        // For now, we'll return success
        res.status(200).json({ message: 'Course deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete course' });
      }
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}