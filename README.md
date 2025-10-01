# Tutor Support System

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies for backend:

   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables:

   ```bash
   # Copy and configure backend environment
   cp backend/.env.example backend/.env
   # Edit backend/.env with your Supabase credentials (supabase URL)
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```
5. Install dependencies for frontend
   ```bash
   cd frontend
   npm install
   ```
6. Start the web page run:
   ```bash
   npm run dev
This will start:

- Backend server on http://localhost:3001
- Frontend server on http://localhost:5173



## Backend API

The backend provides a RESTful API with the following endpoints:

- `GET /` - API welcome message
- `GET /health` - Health check endpoint
- `GET /api/test-db` - Test database connection

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

MIT License
