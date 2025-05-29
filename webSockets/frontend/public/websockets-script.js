// Make a WebSocket connection
const wsHost = new WebSocket('wss://nadika-zavodovska-live-chat-backend-websockets.hosting.codeyourfuture.io');
// const wsHost = new WebSocket('http://localhost:3000/messages');

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
    } else if (msg.command === 'update-reaction') {
        updateReactions(msg.message);
    }
});

// Function to create a div block for a new message and show it 
function showMessage(message) {
    const messagesBlock = document.getElementById('messages-block');

    const containerMsg = document.createElement('div');
    containerMsg.id = `message-${message.id}`;
    messagesBlock.appendChild(containerMsg);

    const content = document.createElement('span');
    content.textContent = `- ${message.name}: ${message.text} `;
    containerMsg.appendChild(content);

    const likeBtn = document.createElement('button');
    likeBtn.textContent = `👍 ${message.likes || 0} `;
    likeBtn.onclick = () => sendReaction(message.id, 'like');
    containerMsg.appendChild(likeBtn);

    const dislikeBtn = document.createElement('button');
    dislikeBtn.textContent = `👎 ${message.dislikes || 0}`;
    dislikeBtn.onclick = () => sendReaction(message.id, 'dislike');      
    containerMsg.appendChild(dislikeBtn);    
}

function updateReactions(reaction) {
    const containerReactions = document.getElementById(`message-${reaction.id}`);
    if (!containerReactions) return;

    const buttonsReactions = containerReactions.querySelectorAll('button');
    buttonsReactions[0].textContent = `👍 ${reaction.likes}`;
    buttonsReactions[1].textContent = `👎 ${reaction.dislikes}`;
}

async function sendReaction(messageId, action) {
    await fetch('https://nadika-zavodovska-live-chat-backend-websockets.hosting.codeyourfuture.io/messages/react',
        {        
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, action }),
        });
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
