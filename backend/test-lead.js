const axios = require('axios');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const sampleLeads = [
  {
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 349-8120',
  },
  {
    name: 'David Kumar',
    email: 'david.kumar@example.com',
    phone: '+91 98765 43210',
  },
  {
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 782-9014',
  },
];

async function simulateLead() {
  const randomLead = sampleLeads[Math.floor(Math.random() * sampleLeads.length)];

  console.log(`[Simulator] Sending test lead: ${randomLead.name}...`);
  try {
    const response = await axios.post(`${BASE_URL}/test-lead`, randomLead);
    console.log('[Simulator] Lead submitted successfully!');
    console.log(response.data);
  } catch (error) {
    console.error('[Simulator] Failed to send lead. Make sure the backend is running on port', PORT);
    console.error(error.message);
  }
}

simulateLead();
