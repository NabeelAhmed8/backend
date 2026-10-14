# Portfolio Backend API

Backend API service for **Nabeel Ahmed Dhillon**'s frontend portfolio. Built with Node.js and Express.

---

## 📁 Folder Structure

```
backend/
├── config/
│   └── mailer.js          # Nodemailer setup & fallback simulation
├── data/
│   ├── experience.json    # Career logbook entries
│   ├── messages.json      # Stored contact inquiries
│   ├── projects.json      # Portfolio project archive
│   └── skills.json        # Technical arsenal stack
├── routes/
│   ├── contact.js         # Contact form POST & GET messages
│   ├── experience.js      # Experience records endpoint
│   ├── projects.js        # Projects archive endpoint
│   └── skills.js          # Skills matrix endpoint
├── .env                   # Local environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
├── server.js              # Express app entry point
└── README.md              # Documentation
```

---

## 🚀 Quick Start

### 1. Install Dependencies
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
```

### 2. Start the Server
* **Production mode:**
  ```bash
  npm start
  ```
* **Development mode (auto-reload on save):**
  ```bash
  npm run dev
  ```

The server will be active at: `http://localhost:5000`

---

## 📡 Available API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and uptime |
| `POST` | `/api/contact` | Submit a new contact message (`name`, `email`, `message`) |
| `GET` | `/api/contact/messages` | View all submitted inquiries |
| `GET` | `/api/projects` | Fetch all portfolio projects (supports `?category=` filter) |
| `GET` | `/api/projects/:id` | Fetch a specific project by ID |
| `POST` | `/api/projects` | Add a new project to the archive |
| `GET` | `/api/skills` | Fetch all technical skills categories |
| `GET` | `/api/experience` | Fetch career history (supports `?category=dev` or `?category=ops`) |

---

## ✉️ Contact Form Submission Example

### Example cURL Request:
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Connor",
    "email": "sarah@example.com",
    "message": "We have an urgent React frontend contract project available."
  }'
```

### Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Transmission received and logged successfully.",
  "data": {
    "id": "msg_1728775432_k3f9a",
    "timestamp": "2026-10-12T19:38:00.000Z",
    "mailStatus": "logged"
  }
}
```

---

## ⚙️ Environment Configuration (`.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
NOTIFICATION_RECEIVER=nabeelprojects@hotmail.com

# (Optional) For real Gmail SMTP notifications:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
```

> **Note:** If SMTP credentials are not specified, the server runs in **simulation mode**: it logs all messages to the terminal console and securely appends them to `data/messages.json`.

