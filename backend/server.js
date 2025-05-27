import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const app = express();

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.resolve(__dirname, 'messages.json');

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(express.json());
// Function to read messages from the messages.json file
async function readMessages() {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        // If error occurs, return an empty array
        return [];
    }
}

async function writeMessages(messages) {
    // Convert JavaScript object to text, save it in the file
    await fs.writeFile(FILE_PATH, JSON.stringify(messages, null, 2));
}

app.get('/messages', async (req, res) => {
    // Get messages from the file
    const messages = await readMessages();
    // Send messages (JSON response)
    res.json(messages);
});

// A user send a new message, save it
app.post('/messages', async (req, res) => {
    // Get name, text from request body
    const { name, text } = req.body;
    // If name ot text fields are empty, send an error message
    if (!name || name.trim() === '' || !text || text.trim() === '') {
        return res.status(400).json({ message: "Name and message input can't be empty" });
    }

    // Read messages
    const messages = await readMessages();
    // Push a new message to all messages list
    messages.push({ name, text });
    // Save mesages to the file
    await writeMessages(messages);
    // Send successful message
    res.status(201).json({ message: 'Message added successfully.' });
});

// Start the server on the port which we specify in the PORT variable
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
