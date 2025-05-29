import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import cors from 'cors';
import { randomUUID } from 'crypto';
import http from 'http';
import { server as WebSocketServer } from 'websocket';

const app = express();

app.use(
    cors({ origin: 'https://nadika-zavodovska-live-chat-websockets-frontend.hosting.codeyourfuture.io' })
);
// app.use(cors({ origin: '*' }));

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.resolve(__dirname, 'messages.json');

app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);
// Create WebSocket server
const websocketServer = new WebSocketServer({ httpServer: server });
// Store connected webSocket clients
let clients = [];

// Handle new WebSocket connections
websocketServer.on('request', (request) => {
    // Accept connection
    const socket = request.accept();
    // Add client to the clients array
    clients.push(socket);
    // If disconnects, remove client by using filter method
    socket.on('close', () => {
        clients = clients.filter((client) => client !== socket);
    });
});

// Send message to all connected clients
function sendMessageToAllClients(message, command = 'send-message') {
    const data = JSON.stringify({ command, message });

    clients.forEach((client) => {
        // if client is connected, send a messdage in text format(UTF)
        if (client.connected) client.sendUTF(data);
    });
}

// Function to read messages from the messages.json file
async function readMessages() {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        // If error occurs, return an empty array and print error in console
        console.error('Failed to read messages.json:', err);
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
    // If there are new messages, send messages (JSON response)
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
    const newMessage = { id: randomUUID(), name, text, likes: 0, dislikes: 0 };
    messages.push(newMessage);
    // Save messages to the file
    await writeMessages(messages);
    sendMessageToAllClients(newMessage);
    // Send successful message
    res.status(201).json({ message: 'Message sent.' });
});

// The endpoint to handle reactions 
app.post('/messages/react', async (req, res) => {
    // getting messageId, action from the request 
    const { messageId, action } = req.body;
    // Check if there are action like or dislike 
    if (!['like', 'dislike'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
    }
    // get all the messages 
    const messages = await readMessages();
    // Find the message that mathes messageId, if not - status message that message not found
    const message = messages.find((msg) => msg.id === messageId);
    if (!message) {
        return res.status(404).json({ message: 'Message not found' });
    }
    // Increment if like or dislike 
    if (action === 'like') message.likes++;
    if (action === 'dislike') message.dislikes++;

    // Save updated message 
    await writeMessages(messages);

    // tell all users that info about like and dislike  have changed 
    sendMessageToAllClients(
        { id: message.id, likes: message.likes, dislikes: message.dislikes },
        'update-reaction'
    );
    // Send status message that reaction was updated 
    res.status(200).json({ message: 'Reaction updated.' });
});

// Start the server on the port which we specify in the PORT variable
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
