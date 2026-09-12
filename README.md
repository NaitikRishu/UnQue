# Meta Lead Ads + React Native Live Stream PoC

A real-time Proof of Concept that receives Meta Lead Ad form submissions via Webhooks, fetches full lead data through the Meta Graph API, and instantly pushes them to an open React Native mobile app using WebSockets (Socket.io) with zero manual refresh or polling.

---

## Architecture Overview

```
+-------------------------------------------------------------+
| 1. Meta Lead Ad Form Submitted                              |
|    (Simulated via Meta Lead Ads Testing Tool or Live Ad)     |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 2. Meta Webhook (POST /webhook)                             |
|    - Receives { leadgen_id, page_id, form_id }              |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 3. Backend (Node.js / Express)                              |
|    - Acknowledges webhook with HTTP 200 OK immediately      |
|    - Calls Meta Graph API: GET /{leadgen_id}                |
|      using Page Access Token to fetch lead fields           |
|      (Full Name, Email, Phone Number, Timestamp)            |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 4. Real-Time Push (Socket.io Server)                        |
|    - Broadcasts 'new_lead' event to all connected clients   |
+------------------------------+------------------------------+
                               | (Instant WebSocket Push)
                               v
+-------------------------------------------------------------+
| 5. React Native Mobile App (Expo)                           |
|    - Active WebSocket connection listens for 'new_lead'     |
|    - Prepends incoming lead to list state in real time       |
|    - UI updates live with animation and timestamp           |
+-------------------------------------------------------------+
```

---

## Tech Stack

- **Backend**: Node.js, Express, Socket.io, Axios, Dotenv, Cors
- **Mobile Client**: React Native, Expo, Socket.io Client
- **External APIs**: Meta Graph API (v19.0), Meta Webhooks
- **Tunneling (for Meta)**: ngrok / Cloudflare Tunnel / LocalTunnel

---

## Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on your physical device (or iOS Simulator / Android Emulator)
- (Optional for Meta testing) ngrok account / CLI

---

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the backend server
npm start
# or with auto-restart on changes:
npm run dev
```
 
The server will start on `http://localhost:4000`.

#### Backend Environment Variables (`.env`)
```env
PORT=4000
META_VERIFY_TOKEN=unque_lead_verify_token_2026
META_PAGE_ACCESS_TOKEN=your_page_access_token_here
```

---

### 3. Mobile App Setup

```bash
# Navigate to mobile-app folder in a new terminal
cd mobile-app

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

- **iOS Simulator**: Press `i` in the terminal.
- **Android Emulator**: Press `a` in the terminal.
- **Physical Device**: Scan the QR code using the Expo Go app.
- **Web Browser Preview**: Press `w` (or visit `http://localhost:8081`).

> **Tip**: If running on a physical phone or Android emulator, tap the **🟢 Live** status badge in the app header to configure the backend URL (e.g., `http://192.168.1.X:4000` or your ngrok URL).

---

## Testing Options

### Option A: Instant Local Simulation (No Meta Setup Required)

With the backend and mobile app running:

```bash
# In the backend directory:
npm run test:lead
```

Or simulate a webhook POST payload directly via `curl`:

```bash
curl -X POST http://localhost:4000/webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"page","entry":[{"id":"1000","time":1710000000,"changes":[{"field":"leadgen","value":{"leadgen_id":"test_lead_123","page_id":"1000","form_id":"2000"}}]}]}'
```

The lead will immediately appear at the top of your React Native screen!

---

### Option B: End-to-End Testing with Meta Lead Ads Testing Tool

To connect real Meta Webhooks to your local machine:

#### Step 1: Expose your local backend
Run ngrok (or localtunnel) in a separate terminal:
```bash
ngrok http 4000
```
Copy the generated HTTPS forwarding URL (e.g. `https://abc-123.ngrok-free.app`).

#### Step 2: Configure Meta Webhook
1. Go to [Meta for Developers](https://developers.facebook.com/) $\rightarrow$ Your App $\rightarrow$ **Webhooks**.
2. Select **Page** from the dropdown and click **Subscribe to this object**.
3. Set **Callback URL**: `https://your-ngrok-url.ngrok-free.app/webhook`
4. Set **Verify Token**: `unque_lead_verify_token_2026` (matching `.env`).
5. Click **Verify and Save**.
6. Subscribe to the `leadgen` field under Page webhooks.

#### Step 3: Configure Page Access Token
1. In Meta Graph API Explorer or App Dashboard, generate a **Page Access Token** with `leads_retrieval` and `pages_manage_ads` permissions.
2. Paste the token into `backend/.env`:
   ```env
   META_PAGE_ACCESS_TOKEN=EAAB...
   ```
3. Restart the backend server.

#### Step 4: Fire Test Lead in Meta Lead Ads Testing Tool
1. Open [Meta Lead Ads Testing Tool](https://developers.facebook.com/tools/lead-ads-testing/).
2. Select your **Page** and **Form**.
3. Click **Create Lead**.
4. Observe the webhook payload hitting your backend $\rightarrow$ Graph API fetch $\rightarrow$ WebSocket push $\rightarrow$ lead appears live on the mobile app screen without touching the device!

---

## Key Assumptions & Design Decisions

1. **Event-Driven Push over Polling**: We use WebSockets (Socket.io) instead of client-side HTTP polling (`setInterval`). This ensures zero delay and minimal network overhead.
2. **Page Access Token for PoC**: For this Proof of Concept, the Page Access Token is configured statically in `.env` (obtained via Meta Graph API Explorer) rather than implementing a full multi-tenant OAuth login flow.
3. **In-Memory Store**: Leads received during the active session are kept in an in-memory array (`leads = []`) and synchronized on initial client connection (`initial_leads`). In a production system, this would be persisted to PostgreSQL/MongoDB with a message broker like Redis Pub/Sub for horizontal scaling.
4. **Local Tunneling**: `ngrok` is assumed to expose the local development server to Meta's public webhook infrastructure.
5. **Immediate Webhook ACK**: The backend immediately acknowledges Meta webhook POST requests with HTTP 200 (`EVENT_RECEIVED`) before resolving the Graph API request asynchronously, preventing Meta webhook timeouts and retries.

---

## Project Structure

```
UnQue/
├── backend/
│   ├── server.js          # Express app + Socket.io + Webhook handlers + Graph API client
│   ├── test-lead.js       # Standalone CLI test lead simulator
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Example environment variables
│   └── .env               # Local configuration
├── mobile-app/
│   ├── App.js             # React Native main screen with Socket.io listener & list UI
│   ├── app.json           # Expo project configuration
│   └── package.json       # Mobile app dependencies
└── README.md              # Project documentation and architecture guide
```
