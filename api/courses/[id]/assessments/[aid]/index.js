import { getCourseById, deleteAssessment } from '../../../../syllabusParser.js';

export default function handler(req, res) {
  const { method } = req;
  const { id, aid } = req.query;

  if (!id || !aid) {
    return res.status(400).json({ error: 'Course ID and Assessment ID are required' });
  }

  switch (method) {
    case 'GET':
      try {
        const course = getCourseById(id);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }
        
        const assessment = course.assessments?.find(a => a.id === parseInt(aid));
        if (!assessment) {
          return res.status(404).json({ error: 'Assessment not found' });
        }
        
        res.status(200).json(assessment);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assessment' });
      }
      break;

    case 'DELETE':
      try {
        const success = deleteAssessment(id, aid);
        if (success) {
          res.status(200).json({ message: 'Assessment deleted successfully' });
        } else {
          res.status(404).json({ error: 'Assessment not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete assessment' });
      }
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
  }
} 