import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { todo } = req.body;
    const filePath = path.join(process.cwd(), 'public', 'todos.txt');
    fs.appendFileSync(filePath, `\n${todo}`);
    res.status(200).json({ status: 'Success', message: 'Todo added' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}