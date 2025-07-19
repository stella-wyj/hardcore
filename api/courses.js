export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json([
      { id: 1, name: "Math" },
      { id: 2, name: "Science" }
    ]);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}