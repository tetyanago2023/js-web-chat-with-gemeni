document.getElementById('send-btn').addEventListener('click', sendPrompt);
document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendPrompt();
    }
});

// Create a markdown-it instance
const md = window.markdownit(); // Access the markdown-it instance from the global window object

async function sendPrompt() {
    const inputField = document.getElementById('user-input');
    const userPrompt = inputField.value.trim();  // Trim any leading or trailing whitespace

    if (!userPrompt) return;  // Prevent sending empty prompts

    displayMessage('User', userPrompt);
    inputField.value = '';  // Clear the input field after sending

    try {
        const response = await fetch('http://127.0.0.1:3000/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: userPrompt })  // Send the prompt to the back-end
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Read the streamed response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        displayMessage('AI', '');  // Start with an empty message for AI

        while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;
            const chunkText = decoder.decode(value, { stream: true });
            appendToLastMessage('AI', chunkText);  // Append each chunk to the last AI message
        }

        // After receiving all chunks, convert the markdown response to HTML
        const lastMessageElement = document.querySelector('.message:last-child'); // Changed to '.message' to select the last message

        // Check if the last message exists before accessing innerText
        if (lastMessageElement) {
            const markdownResponse = lastMessageElement.innerText; // Get the raw text
            const htmlContent = md.render(markdownResponse); // Convert markdown to HTML using markdown-it
            lastMessageElement.innerHTML = htmlContent; // Replace raw text with HTML
        } else {
            console.error('No last message found to convert.');
        }
    } catch (error) {
        console.error('Error:', error);
        displayMessage('AI', 'Sorry, there was an error processing your request.');
    }
}

function displayMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;  // Auto-scroll to the bottom
}

function appendToLastMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const lastMessageDiv = chatBox.lastElementChild;

    if (lastMessageDiv && lastMessageDiv.innerHTML.includes(`<strong>${sender}:</strong>`)) {
        lastMessageDiv.innerHTML += text;  // Append text to the existing message
        chatBox.scrollTop = chatBox.scrollHeight;  // Auto-scroll to the bottom
    }
}
