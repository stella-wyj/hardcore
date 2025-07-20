import { getCourseById } from '../../../syllabusParser.js';

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
        
        res.status(200).json(course.assessments || []);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assessments' });
      }
      break;

    case 'POST':
      try {
        const { title, type, weight, dueDate, grade } = req.body;
        
        if (!title || !type || weight === undefined) {
          return res.status(400).json({ error: 'Title, type, and weight are required' });
        }
        
        // Create new assessment
        const newAssessment = {
          id: Date.now(), // Simple ID generation
          title: title,
          type: type,
          weight: parseFloat(weight),
          dueDate: dueDate || null,
          grade: grade || null
        };
        
        // Add assessment to course (you'll need to implement this in syllabusParser.js)
        // For now, we'll return the assessment structure
        res.status(201).json(newAssessment);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create assessment' });
      }
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
  }
} 