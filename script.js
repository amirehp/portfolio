const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

function copyDiscord() {
  navigator.clipboard.writeText('mitshima');
  const btn = document.getElementById('discord-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'mitshima copied ✅';

  setTimeout(() => {
    btn.innerHTML = originalText;
  }, 4000);
}

const WORKER_URL = 'https://demochatbot.57555wwm.workers.dev/';  
const chat = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = [];

function addMessage(text, role) {
  const wrapper = document.createElement('div');
  wrapper.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble rounded-2xl px-4 py-3 text-sm leading-6 ${role === 'user' ? 'user' : 'bot'}`;
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
  return bubble;
}

function addTypingIndicator() {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex justify-start';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble typing rounded-2xl px-4 py-3';
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
  return bubble;
}

function extractReply(data) { 
    const aiContent = data.steps[1].content; 
    const directText = aiContent[aiContent.length - 1].text; 
    return directText; 
}

function setBusy(isBusy) {
  input.disabled = isBusy;
  form.querySelector('button').disabled = isBusy;
  form.querySelector('button').classList.toggle('opacity-60', isBusy);
}

function seedWelcomeMessage() {
  setTimeout(() => {
    addMessage("Hi! I’m Amir’s AI support assistant. What are you looking to build?", 'bot');
  }, 350);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  addMessage(text, 'user');
  messages.push({ role: 'user', content: text });

  const typingBubble = addTypingIndicator();
  setBusy(true);

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error('worker_error');
    }

    const data = await response.json();
    const reply = extractReply(data) || "I’m here to help with Amir’s projects. Tell me a bit more about your idea and I’ll guide you through it.";

    typingBubble.textContent = reply;
    typingBubble.classList.remove('typing');
    typingBubble.classList.add('bot');
    messages.push({ role: 'assistant', content: reply });
  } catch (error) {
    console.log(error);
    typingBubble.textContent = 'The assistant is unavailable right now. Please try again in a moment.';
    typingBubble.classList.remove('typing');
    typingBubble.classList.add('bot');
  } finally {
    setBusy(false);
    chat.scrollTop = chat.scrollHeight;
  }
});

document.querySelectorAll('.quick-prompt').forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.textContent.trim();
    input.focus();
  });
});

seedWelcomeMessage();
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
