import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { index } = req.body; // Expecting the index of the todo to delete
    const filePath = path.join(process.cwd(), 'public', 'todos.txt');
    const todos = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    todos.splice(index, 1); // Remove the todo at the specified index
    fs.writeFileSync(filePath, todos.join('\n'));
    res.status(200).json({ status: 'Success', message: 'Todo deleted' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
