// Make a WebSocket connectio
const wsHost = new WebSocket('wss://nadika-zavodovska-live-chat-backend-websockets.hosting.codeyourfuture.io');

// Print message in console when webSocket connection is open 
wsHost.addEventListener('open', () => {
    console.log('WebSocket connected successfully.');
});

// If a message comes from server 
wsHost.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    // If the command is send-message, show it on the page 
    if (msg.command === 'send-message') {
        showMessage(msg.message);
    }
});

// Function to create a div block for a new message and show it 
function showMessage(message) {
    const messagesBlock = document.getElementById('messages-block');
    const newMessage = document.createElement('div');
    newMessage.textContent = `- ${message.name}: ${message.text}`;
    messagesBlock.appendChild(newMessage);
}

// Function to load all the m,essages when page loads
async function loadMessages() {
    // fetch messages from server 
    const res = await fetch(
        'https://nadika-zavodovska-live-chat-backend-websockets.hosting.codeyourfuture.io/messages'
    );
    // Read messages as json 
    const messages = await res.json();
    // Show all messages on the page 
    messages.forEach(showMessage);
}

// AddEventListener when submit button clicked 
document.getElementById('chat-form-block').addEventListener('submit', async function (e) {
    e.preventDefault();

    const userName = document.getElementById('name').value.trim();
    const userText = document.getElementById('text').value.trim();

    if (!userName || !userText) {
        alert("Name and message can't be empty.");
        return;
    }

    // Send a new message to the server using post method
    await fetch('https://nadika-zavodovska-live-chat-backend-websockets.hosting.codeyourfuture.io/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, text: userText }),
    });
    // Clear the form after click submit button 
    this.reset();
});

window.onload = loadMessages;
