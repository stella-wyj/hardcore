import { updateAssessmentGrade } from '../../../../syllabusParser.js';

export default function handler(req, res) {
  const { method } = req;
  const { id: courseId, aid: assessmentId } = req.query;

  if (!courseId || !assessmentId) {
    return res.status(400).json({ error: 'Course ID and Assessment ID are required' });
  }

  switch (method) {
    case 'POST':
      try {
        const { grade } = req.body;
        
        if (grade === undefined || grade === null) {
          return res.status(400).json({ error: 'Grade is required' });
        }

        if (grade < 0 || grade > 100) {
          return res.status(400).json({ error: 'Grade must be between 0 and 100' });
        }

        const success = updateAssessmentGrade(parseInt(courseId), parseInt(assessmentId), grade);
        if (!success) {
          return res.status(404).json({ error: 'Course or assessment not found' });
        }

        res.status(200).json({
          message: 'Grade updated successfully',
          courseId: parseInt(courseId),
          assessmentId: parseInt(assessmentId),
          grade: grade
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update grade' });
      }
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
  }
} 