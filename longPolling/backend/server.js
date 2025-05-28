import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import cors from 'cors';

const app = express();

app.use(
    cors({ origin: 'https://nadika-zavodovska-live-chat-frontend.hosting.codeyourfuture.io', })
);

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.resolve(__dirname, 'messages.json');

// For storing callbacks
const callbacksForNewMessages = [];

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

app.get('/', (req, res) => {
    res.send('<p>Backend established.</p>');
});

app.get('/messages', async (req, res) => {
    // Get messages from the file and slice only new messages
    const messages = await readMessages();
    const since = parseInt(req.query.since || 0);
    const messagesToSend = messages.slice(since);

    // If no new messages, store callbacks 
    if (messagesToSend.length === 0) {
        callbacksForNewMessages.push((newMessages) => {
            res.json(newMessages);
        });
        
        // If no new message after 20 sec, send an empty array, remove callback
        setTimeout(() => {
            const index = callbacksForNewMessages.indexOf(res.send);
            if (index !== -1) {
                callbacksForNewMessages.splice(index, 1);
                res.json([]);
            }
        }, 20000);
    } else {
    // If there are new messages, send messages (JSON response)
    res.json(messages);
    }
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
    const newMessage = { name, text };
    messages.push(newMessage);
    // Save mesages to the file
    await writeMessages(messages);

    // Read messages, add a new message, and store it 
    while (callbacksForNewMessages.length > 0) {
        const callback = callbacksForNewMessages.pop();
        callback([newMessage]);
    }
    // Send successful message
    res.status(201).json({ message: 'Message added successfully.' });
});

// Start the server on the port which we specify in the PORT variable
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
