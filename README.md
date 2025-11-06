# Tutor Support System

A full-stack tutoring management system built with **FastAPI** (Python) backend and **React + TypeScript** frontend.

## Prerequisites

- **Python 3.12** 
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase account** (for PostgreSQL database)

## Installation & Setup

### 1. Backend Setup (Python FastAPI)

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python3.12 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install Python dependencies:**

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration:
   # - DATABASE_URL: Your Supabase PostgreSQL connection string
   # - Other settings as needed
   ```

5. **Start the backend server:**

   ```bash
   python main.py
   ```

   The backend will start on **http://localhost:8002**

### 3. Frontend Setup (React + TypeScript)

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **Start the frontend development server:**

   ```bash
   npm run dev
   ```

   The frontend will start on **http://localhost:5173**

## 🚀 Quick Start

After setup, access:

- **Backend API**: http://localhost:8002
- **API Documentation**: http://localhost:8002/docs (Swagger UI)
- **ReDoc Documentation**: http://localhost:8002/redoc
- **Frontend Application**: http://localhost:5173


## Development

### Backend Development

```bash
cd backend
source .venv/bin/activate  # Activate virtual environment
python main.py             # Start with hot reload
```

### Frontend Development

```bash
cd frontend
npm run dev                 # Start with hot reload
```

## Project Structure

```
Tutor-support-system/
├── backend/                 # Python FastAPI backend
│   ├── .venv/              # Virtual environment
│   ├── controllers/        # Business logic controllers
│   ├── db/                 # Database configuration
│   ├── middleware/         # Custom middleware
│   ├── models/             # Data models
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions
│   ├── main.py             # FastAPI application entry point
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment configuration
├── frontend/               # React TypeScript frontend
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
└── README.md               # This file
```


```

