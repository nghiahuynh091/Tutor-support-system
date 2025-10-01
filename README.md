# Tutor Support System

A full-stack application for managing tutor support with Node.js backend, React frontend, and Supabase database.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, Vite, TailwindCSS, ShadCN UI
- **Database**: Supabase
- **Development**: ESLint, Prettier, Nodemon

## Project Structure

```
tutor-support-system/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript type definitions
│   │   └── index.ts        # Main server file
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/               # React Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and helpers
│   │   └── ...
│   └── package.json
└── package.json           # Root package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies for all packages:

   ```bash
   npm run install:all
   ```

3. Set up environment variables:

   ```bash
   # Copy and configure backend environment
   cp backend/.env.example backend/.env
   # Edit backend/.env with your Supabase credentials
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

This will start:

- Backend server on http://localhost:3001
- Frontend server on http://localhost:5173

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run dev:backend` - Start only the backend server
- `npm run dev:frontend` - Start only the frontend server

## Backend API

The backend provides a RESTful API with the following endpoints:

- `GET /` - API welcome message
- `GET /health` - Health check endpoint
- `GET /api/test-db` - Test database connection

## Frontend

The frontend is built with React and includes:

- ShadCN UI components for consistent design
- TailwindCSS for styling
- TypeScript for type safety
- Vite for fast development and building

## Database Setup

1. Create a new project in Supabase
2. Copy your project URL and anon key to `backend/.env`
3. Set up your database schema as needed

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

MIT License
