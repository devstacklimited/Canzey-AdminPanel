# Canzey Admin Panel - Client

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:3000`

## Features

- Modern, responsive dashboard UI
- User management (CRUD operations)
- Real-time data fetching from backend API
- Beautiful UI with TailwindCSS
- Lucide React icons
- Collapsible sidebar navigation

## Tech Stack

- React 18
- Vite
- TailwindCSS
- Axios
- React Router DOM
- Lucide React Icons

## Project Structure

```
client/
├── src/
│   ├── pages/
│   │   └── Dashboard.jsx    # Main dashboard page
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The client connects to the backend API at `http://localhost:5000/api`

Make sure the server is running before starting the client.
