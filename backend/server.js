require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const axios = require('axios');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS enabled for mobile/web clients
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// In-memory store for received leads (PoC)
const leads = [];

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send existing leads to newly connected client
  socket.emit('initial_leads', leads);

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Helper: Fetch lead details from Meta Graph API using leadgen_id
async function fetchLeadDetails(leadgenId) {
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  if (!token) {
    console.warn('[Graph API] META_PAGE_ACCESS_TOKEN not set. Creating mock lead for testing.');
    return {
      id: leadgenId,
      name: 'Test Prospect',
      email: `lead_${leadgenId.slice(-4)}@example.com`,
      phone: '+1 (555) 019-2834',
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${token}`;
    const response = await axios.get(url);
    const data = response.data;

    // Normalize field_data array into a key-value object
    const fields = {};
    if (Array.isArray(data.field_data)) {
      data.field_data.forEach((field) => {
        fields[field.name] = field.values?.[0] || '';
      });
    }

    return {
      id: data.id || leadgenId,
      name: fields.full_name || fields.name || 'Anonymous Lead',
      email: fields.email || 'No email provided',
      phone: fields.phone_number || fields.phone || 'No phone provided',
      createdAt: data.created_time || new Date().toISOString(),
      raw: data,
    };
  } catch (error) {
    console.error(`[Graph API] Error fetching lead ${leadgenId}:`, error.response?.data || error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'Meta Lead Ads Backend Running' });
});

// GET /leads - Retrieve all received leads
app.get('/leads', (req, res) => {
  res.json({ success: true, count: leads.length, leads });
});

// POST /test-lead - Helper endpoint to simulate a lead directly
app.post('/test-lead', (req, res) => {
  const testLead = {
    id: `test_${Date.now()}`,
    name: req.body.name || 'John Doe (Test)',
    email: req.body.email || 'johndoe.test@example.com',
    phone: req.body.phone || '+1 (555) 012-3456',
    createdAt: new Date().toISOString(),
  };

  leads.unshift(testLead);
  io.emit('new_lead', testLead);
  console.log('[Test Lead] Created and broadcasted:', testLead);

  res.json({ success: true, lead: testLead });
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
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    // Respond with 200 OK immediately so Meta doesn't retry or timeout
    res.status(200).send('EVENT_RECEIVED');

    // Process lead events asynchronously
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const { leadgen_id, form_id, page_id } = change.value;
          console.log(`[Webhook] Processing lead: leadgen_id=${leadgen_id}, form_id=${form_id}, page_id=${page_id}`);

          try {
            const lead = await fetchLeadDetails(leadgen_id);
            leads.unshift(lead);

            // Broadcast new lead to all connected mobile clients in real-time
            io.emit('new_lead', lead);
            console.log('[Socket] Broadcasted new_lead event:', lead.name);
          } catch (err) {
            console.error('[Webhook] Failed to process lead:', err.message);
          }
        }
      }
    }
    return;
  }

  return res.sendStatus(404);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});




