require('dotenv').config();
const express = require('express');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const client = new Anthropic();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `Du er en venlig og hjælpsom budgetrådgiver for BudgetBuddy.
Du hjælper brugere med enkle spørgsmål om budgettering, opsparing, gæld og økonomi i hverdagen.
Svar altid kortfattet, konkret og på dansk.
Hvis brugeren har komplekse spørgsmål eller har brug for personlig rådgivning, opfordr dem til at booke en samtale via hjemmesiden.
Du må ikke give specifik juridisk eller finansiel rådgivning – henvis i stedet til professionel hjælp ved komplicerede sager.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(event.delta.text);
      }
    }
    res.end();
  } catch (err) {
    console.error('Anthropic fejl:', err.message);
    res.status(500).end('Fejl fra AI-tjenesten.');
  }
});

// Booking-sider: /book/starter, /book/plus, /book/pro
app.get('/book/:plan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'book.html'));
});

// Fallback til forsiden
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ BudgetBuddy kører på http://localhost:${PORT}`);
});
