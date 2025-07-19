export default function handler(req, res) {
    // Example: return a list of courses
    if (req.method === 'GET') {
      res.status(200).json([
        { id: 1, name: "Math" },
        { id: 2, name: "Science" }
      ]);
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  }