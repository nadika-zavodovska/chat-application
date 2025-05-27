// Fetch messages from the server and display on the page
async function displayMessages() {
    try {
        // const response = await fetch('http://localhost:3000/messages');
        const response = await fetch(
            'https://nadika-zavodovska-live-chat.hosting.codeyourfuture.io/messages'
        );
        // If something went wrong
        if (!response.ok) throw new Error('Error: Failed to load messages');
        // Convert response to the JavaScript object
        const messages = await response.json();

        // Get message-block and clear it
        const messagesBlock = document.getElementById('messages-block');
        messagesBlock.innerHTML = '';

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
    // Prevent the page from reloading
    e.preventDefault();

    // Get name and text from the form inputs
    const name = document.getElementById('name').value.trim();
    const text = document.getElementById('text').value.trim();

    // If name and text fields are empty, error alert
    if (!name || !text) {
        alert("Name and text fields can't be empty.");
        return;
    }

    // Sending the data from the form to the server
    try {
        const response = await fetch(
            'https://nadika-zavodovska-live-chat.hosting.codeyourfuture.io/messages',
            {
                method: 'POST',
                // Send data in JSON
                headers: { 'Content-Type': 'application/json' },
                // Convert our data to JSON string
                body: JSON.stringify({ name, text }),
            }
        );

        // If the server returns error, show an alert
        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || 'Failed to send message');
            return;
        }
        // Clear the form and call displayMessages function
        document.getElementById('chat-form-block').reset();
        displayMessages();
    } catch (error) {
        // If message can't be sent, show alert message
        alert('Error sending message.');
        console.error('Send error:', error);
    }
});

window.onload = displayMessages;
