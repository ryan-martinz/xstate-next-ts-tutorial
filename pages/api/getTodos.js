import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const filePath = path.join(process.cwd(), 'public', 'todos.txt');
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const todos = data.split('\n').filter(Boolean); // Split by newline and filter out empty lines
      res.status(200).json({ todos });
    } catch (err) {
      res.status(500).json({ error: 'Failed to read the todo file.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
