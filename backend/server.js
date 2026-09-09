require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'Meta Lead Ads Backend Running' });
});

// Meta Webhook Verification (GET /webhook)
// Meta sends hub.mode, hub.verify_token, and hub.challenge
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'unque_lead_verify_token_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Webhook] Verified successfully with Meta!');
    return res.status(200).send(challenge);
  }

  console.warn('[Webhook] Verification failed. Token mismatch.');
  return res.sendStatus(403);
});

// Meta Webhook Event Handler (POST /webhook)
// Meta sends lead notifications when a user submits a Lead Ad form
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry?.forEach((entry) => {
      entry.changes?.forEach((change) => {
        if (change.field === 'leadgen') {
          const { leadgen_id, form_id, page_id, created_time } = change.value;
          console.log(`[Webhook] Received new lead notification: leadgen_id=${leadgen_id}, form_id=${form_id}, page_id=${page_id}`);
        }
      });
    });

    // Always respond with 200 OK immediately so Meta doesn't retry
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.sendStatus(404);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

