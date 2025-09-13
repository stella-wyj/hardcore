import { getCourseById, updateCourseGoalGrade, calculateGradeSummary } from '../../syllabusParser.js';

export default function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  switch (method) {
    case 'GET':
      try {
        const course = getCourseById(id);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }
        
        // Include grade summary
        const gradeSummary = calculateGradeSummary(parseInt(id));
        
        res.status(200).json({
          ...course,
          gradeSummary
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch course' });
      }
      break;

    case 'PUT':
      try {
        const { goalGrade } = req.body;
        
        if (goalGrade === undefined || goalGrade === null) {
          return res.status(400).json({ error: 'Goal grade is required' });
        }

        const success = updateCourseGoalGrade(parseInt(id), goalGrade);
        if (!success) {
          return res.status(404).json({ error: 'Course not found' });
        }

        const updatedCourse = getCourseById(id);
        res.status(200).json({
          message: 'Goal grade updated successfully',
          course: updatedCourse
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update course' });
      }
      break;

    case 'DELETE':
      try {
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