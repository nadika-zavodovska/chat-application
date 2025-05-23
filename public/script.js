// Fetch messages from the server and display on the page
async function displayMessages() {
    try {
        const response = await fetch('http://localhost:3000/messages');
        
        // Convert response to the JavaScript object
        const messages = await response.json();

        // Get message-block and clear it
        const messagesBlock = document.getElementById('messages-block');
        
        // loop through messages and add each message to the messages block on the page
        messages.forEach((message) => {
            // Create div with name and message text
            const messageEl = document.createElement('div');
            messageEl.textContent = `- ${message.name}: ${message.text}`;
            // Add every message to the messageBlock
            messagesBlock.appendChild(messageEl);
        });
    } catch (error) {
        // if error occurs, print error message in the console
        console.error('Error loading messages:', error);
    }
}

document.getElementById('chat-form-block').addEventListener('submit', async function (e) {
    // Get name and text from the form inputs
    const name = document.getElementById('name').value.trim();
    const text = document.getElementById('text').value.trim();  

    // Sending the data from the form to the server
    try {
        const response = await fetch('http://localhost:3000/messages', {
            method: 'POST',
            // Send data in JSON
            headers: { 'Content-Type': 'application/json' },
            // Convert our data to JSON string
            body: JSON.stringify({ name, text }),
        });
        
        displayMessages();
    } catch (error) {        
        console.error('Send error:', error);
    }
});


window.onload = displayMessages;
