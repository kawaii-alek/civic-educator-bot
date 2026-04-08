const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loader = document.getElementById('loader');

const API_KEY = "my_secret_key123";

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
        <div class="avatar"><i class="fas fa-${isUser ? 'user' : 'robot'}"></i></div>
        <div class="content">
            <p>${content}</p>
            <span class="timestamp">${timeString}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Clear input
    userInput.value = '';
    
    // Add user message to UI
    addMessage(text, true);
    
    // Show loader
    loader.classList.remove('hidden');

    try {
        const response = await fetch('/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: text }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.content || "I'm sorry, I couldn't process that request.";
        
        addMessage(botResponse, false);
    } catch (error) {
        console.error('Error:', error);
        addMessage("Sorry, I'm having trouble connecting to the constitutional knowledge base. Please make sure the backend is running.", false);
    } finally {
        loader.classList.add('hidden');
    }
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
