import { clearAllCourses } from './syllabusParser.js';

export default function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const success = clearAllCourses();
    if (success) {
      res.status(200).json({ message: 'All courses cleared successfully' });
    } else {
      res.status(500).json({ error: 'Failed to clear courses' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear courses' });
  }
} 