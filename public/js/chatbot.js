document.addEventListener('DOMContentLoaded', function () {
  const chatWindow     = document.getElementById('chat-window');
  const chatToggle     = document.getElementById('chat-toggle');
  const chatClose      = document.getElementById('chat-close');
  const chatForm       = document.getElementById('chat-form');
  const chatInput      = document.getElementById('chat-input');
  const chatSend       = document.getElementById('chat-send');
  const chatMessages   = document.getElementById('chat-messages');
  const chatToggleIcon = document.getElementById('chat-toggle-icon');

  if (!chatWindow) return;

  let isOpen = false;
  let isLoading = false;

  const messages = [
    {
      role: 'assistant',
      content: 'Hej! Jeg er BudgetBuddys AI-assistent. Stil mig et spørgsmål om budgettering eller økonomi – jeg hjælper gerne!',
    },
  ];

  function renderMessages() {
    chatMessages.innerHTML = '';
    messages.forEach(function (msg) {
      const bubble = document.createElement('div');
      bubble.className = 'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start');
      bubble.innerHTML = `
        <div class="max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
          msg.role === 'user'
            ? 'bg-foreground text-background'
            : 'bg-[hsl(var(--muted))] text-foreground'
        }">${escapeHtml(msg.content)}</div>`;
      chatMessages.appendChild(bubble);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'chat-spinner';
    spinner.className = 'flex justify-start';
    spinner.innerHTML = `
      <div class="rounded-2xl bg-[hsl(var(--muted))] px-3 py-2">
        <svg class="h-4 w-4 animate-spin text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>`;
    chatMessages.appendChild(spinner);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeSpinner() {
    const s = document.getElementById('chat-spinner');
    if (s) s.remove();
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  function openChat() {
    isOpen = true;
    chatWindow.style.display = 'flex';
    chatToggleIcon.setAttribute('data-lucide', 'x');
    lucide.createIcons();
    renderMessages();
    chatInput.focus();
  }

  function closeChat() {
    isOpen = false;
    chatWindow.style.display = 'none';
    chatToggleIcon.setAttribute('data-lucide', 'message-circle');
    lucide.createIcons();
  }

  chatToggle.addEventListener('click', function () {
    isOpen ? closeChat() : openChat();
  });

  if (chatClose) {
    chatClose.addEventListener('click', closeChat);
  }

  chatForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || isLoading) return;

    messages.push({ role: 'user', content: text });
    chatInput.value = '';
    renderMessages();
    isLoading = true;
    chatSend.disabled = true;
    chatInput.disabled = true;
    addSpinner();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      removeSpinner();

      if (!res.ok || !res.body) throw new Error('Fejl fra server');

      // Start streaming assistant message
      const assistantMsg = { role: 'assistant', content: '' };
      messages.push(assistantMsg);
      renderMessages();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const lastBubble = chatMessages.lastElementChild;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMsg.content += decoder.decode(value);
        // Update the last bubble directly for smooth streaming
        if (lastBubble) {
          const inner = lastBubble.querySelector('div');
          if (inner) inner.innerHTML = escapeHtml(assistantMsg.content);
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    } catch (err) {
      removeSpinner();
      messages.push({ role: 'assistant', content: 'Beklager, der opstod en fejl. Prøv igen.' });
      renderMessages();
    } finally {
      isLoading = false;
      chatSend.disabled = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  });
});
