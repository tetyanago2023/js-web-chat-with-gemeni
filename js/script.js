document.getElementById('send-btn').addEventListener('click', sendPrompt);
document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendPrompt();
    }
});

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
            const errorResponse = await response.json(); // Get the error message from the response
            throw new Error(errorResponse.error || 'Network response was not ok');
        }

        const data = await response.json();  // Parse the response from the server
        displayMessage('AI', data.response);  // Display the AI's response
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
