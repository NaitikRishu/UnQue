# UnQue Offline Interview Submission Guide

This guide contains everything you need to record and submit **Part 1 (Non-Technical Audios)** and **Part 2 (Technical Loom Videos & Git Repo)**.

---

## 📬 Final Email Submission Template

**To**: `krishna@unque.me`, `n.sarang@unque.me`, `nijam@unque.me`  
**Subject**: UnQue Interview Assignment - [Your Full Name]

```text
Hi Krishna, Sarang, and Nijam,

Please find my submission for the UnQue Offline Interview Assignment below:

Part 1: Non-Technical Audio Recordings (Attached / Drive Links)
1. "Nerdy/tedious satisfying part of life" (>90s): [Link / Attached Audio]
2. "Common opinion I strongly disagree with" (>90s): [Link / Attached Audio]
3. "Deep flow state moment where hours passed" (>90s): [Link / Attached Audio]

Part 2: Technical Deliverables (Meta Lead Ads + React Native PoC)
- GitHub Repository: https://github.com/NaitikRishu/UnQue
- Loom 1 (Live Demonstration - App + Lead Ads Tool): [Insert Loom 1 Link]
- Loom 2 (Architecture & Code Walkthrough): [Insert Loom 2 Link]

Key Assumptions Documented:
- Real-time event push using Socket.io over WebSockets instead of client-side polling.
- Page Access Token configured via environment variables for the PoC.
- In-memory lead store with initial synchronization for newly connected clients.
- Ngrok / tunnel used to expose local backend webhook to Meta.

Thank you for reviewing! Looking forward to hearing your thoughts.

Best regards,
[Your Name]
[Your Phone Number / LinkedIn]
```

---

## 🎙️ Part 1: Non-Technical Audio Recordings Guide

> **Important Instructions from Assignment**:
> - At least **90 seconds** long for each recording.
> - Record **ex-tempore** (conversational, natural tone, like speaking with a friend/colleague).
> - Do not read verbatim from a script. Use the frameworks below as inspiration for your real experiences.
> - Can be recorded in English, Hindi, or Telugu.

---

### Question 1: "What’s a 'nerdy' or tedious part of your life that most people hate, but you actually find deeply satisfying?"

#### Framework & Talking Points (~90–120 seconds):
- **Hook (0–20s)**: Introduce the activity immediately. Examples:
  - *Example A (Developer setup)*: "Refactoring and organizing my dotfiles, IDE keybindings, and terminal shell scripts to perfection."
  - *Example B (Data/Organization)*: "Categorizing and color-coding my personal finances or Notion/spreadsheet workspaces down to the penny."
  - *Example C (Debugging/Tuning)*: "Writing clean commit messages, squashing git branches, and maintaining an immaculate git history."
- **Why most people hate it (20–45s)**: Acknowledge that most people find it mundane, time-consuming, repetitive, or an unnecessary distraction from 'shipping fast'.
- **Why you find it deeply satisfying (45–80s)**: Explain the feeling of clarity, zero friction, and cognitive peace it brings. How spending 2 hours setting up a streamlined workflow saves 10 seconds a hundred times every single day.
- **Conclusion (80–100s)**: Tie it back to your philosophy — that taking pride in the small invisible details makes the big visible work seamless.

---

### Question 2: "What is a common opinion in the world around you that you strongly disagree with?"

#### Framework & Talking Points (~90–120 seconds):
- **Hook (0–20s)**: State the common opinion clearly. Examples:
  - *Example A*: "The idea that speed always trumps craft, or that 'Move fast and break things' means you should write sloppy code and fix it later."
  - *Example B*: "The belief that you need to master 10 new frameworks every year to stay relevant as an engineer."
  - *Example C*: "The common myth that more meetings and syncs equate to better communication in remote teams."
- **Why people hold this opinion (20–45s)**: Explain the surface-level logic behind why people think this way (e.g. pressure to show immediate output, fear of missing out).
- **Your counter-perspective with an example (45–80s)**: Provide your contrarian view. E.g., How true speed comes from deep understanding of core fundamentals, clean architecture, and thinking before typing, which avoids weeks of technical debt and rewrites.
- **Conclusion (80–100s)**: Wrap up with how this viewpoint shapes your work ethic and decision-making.

---

### Question 3: "When was the last time you were working on something and realized hours had passed without you noticing?"

#### Framework & Talking Points (~90–120 seconds):
- **Hook (0–20s)**: Set the scene with a genuine project or challenge. (e.g. building a real-time system, hunting down an elusive edge-case bug, or designing a smooth UI interaction).
- **The Problem / Challenge (20–50s)**: Describe what made the problem fascinating. You sat down around 8 PM thinking it would take 30 minutes, but you got pulled into how the pieces fit together.
- **The Flow State (50–80s)**: Describe the immersion — you weren't checking your phone, you didn't notice the room getting dark, you were just in the loop of hypothesizing, testing, and seeing the immediate feedback.
- **The Moment of Realization (80–100s)**: When the tests finally passed or the UI snapped into place, you looked at the clock and it was 2 AM. The feeling of energized exhaustion when you build something that just works.

---

## 🎥 Part 2: Loom Video Recording Guides

---

### 📹 Loom 1: Live Demonstration (Max 5 Minutes)

#### Screen Setup:
- **Left half of screen**: React Native app running on Simulator / Browser (`http://localhost:8081`) with the leads screen open showing **🟢 Live**.
- **Right half of screen**: [Meta Lead Ads Testing Tool](https://developers.facebook.com/tools/lead-ads-testing/) (or terminal running the webhook test).

#### Demo Script (Step-by-Step):
1. **Introduction (0:00 – 0:30)**:
   > *"Hi everyone, this is the live demonstration for the Meta Lead Ads to React Native PoC. On the left, I have our React Native mobile application open with an active real-time WebSocket connection showing 'Live'. On the right, we have the Meta Lead Ads environment."*
2. **The Test (0:30 – 1:30)**:
   > *"Notice that my hands are completely off the mobile device. I will now trigger a new lead submission. Watch the mobile app screen."*
   - Submit the lead.
   - Show the lead appearing at the very top of the list instantly with the `NEW` badge and timestamp.
3. **Trigger a Second Lead (1:30 – 2:15)**:
   > *"Let's submit a second test lead with different data. Instantly, the list updates in real-time, the lead counter increments, and the state re-renders without any polling or page reload."*
4. **Summary & Wrap-up (2:15 – 3:00)**:
   > *"This confirms the full end-to-end event-driven flow: Meta Form $\rightarrow$ Webhook $\rightarrow$ Backend Graph API fetch $\rightarrow$ Socket.io broadcast $\rightarrow$ React Native UI update. Thank you!"*

---

### 📹 Loom 2: Code Walkthrough & Architecture

#### Screen Setup:
- VS Code open with `backend/server.js` and `mobile-app/App.js`.

#### Walkthrough Structure:
1. **Architecture Overview (0:00 – 1:00)**:
   - Walk through the 4-step event-driven pipeline. Emphasize why WebSockets were chosen over polling.
2. **Backend Walkthrough (`backend/server.js`) (1:00 – 2:30)**:
   - Point out `GET /webhook`: Verification challenge handshake with Meta.
   - Point out `POST /webhook`: Handling `leadgen` change events, extracting `leadgen_id`.
   - Point out `fetchLeadDetails()`: Calling Meta Graph API to normalize field data (`full_name`, `email`, `phone_number`).
   - Point out `io.emit('new_lead', lead)`: Real-time broadcast.
3. **Mobile App Walkthrough (`mobile-app/App.js`) (2:30 – 4:00)**:
   - Show `useEffect` lifecycle hook setting up the Socket.io connection.
   - Show the `new_lead` event listener updating React state: `setLeads(prev => [newLead, ...prev])`.
   - Show the `FlatList` rendering `LeadCard` items with connection indicator and empty state.
4. **Conclusion & Assumptions (4:00 – 5:00)**:
   - Reiterate key architectural decisions: in-memory store for PoC, immediate HTTP 200 webhook acknowledgment, and zero-polling architecture.
