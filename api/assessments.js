export default function handler(req, res) {
    // Example: return a list of assessments
    if (req.method === 'GET') {
      res.status(200).json([
        { id: 1, courseId: 1, name: "Quiz 1", grade: 90 },
        { id: 2, courseId: 2, name: "Lab 1", grade: 85 }
      ]);
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } 