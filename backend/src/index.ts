import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sql from './config/supabase';
import swaggerUi from 'swagger-ui-express';

// Environment variables are already loaded above

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Swagger Documentation (will be generated automatically)
try {
  const swaggerDocument = require('./swagger-output.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.log('Swagger documentation not found. Run "npm run swagger" to generate it.');
}

// Basic routes
app.get('/', (req, res) => {
  // #swagger.tags = ['General']
  // #swagger.summary = 'Welcome message'
  // #swagger.description = 'Returns a welcome message for the Tutor Support System API'
  /* #swagger.responses[200] = {
    description: 'Successful response',
    schema: { $ref: '#/definitions/ApiResponse' }
  } */
  res.json({ message: 'Tutor Support System API' });
});

app.get('/health', (req, res) => {
  // #swagger.tags = ['Health']
  // #swagger.summary = 'Health check'
  // #swagger.description = 'Returns the health status of the API'
  /* #swagger.responses[200] = {
    description: 'Successful health check',
    schema: { $ref: '#/definitions/HealthCheck' }
  } */
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  // #swagger.tags = ['Database']
  // #swagger.summary = 'Test database connection'
  // #swagger.description = 'Tests the connection to the PostgreSQL database'
  /* #swagger.responses[200] = {
    description: 'Database connection successful',
    schema: { $ref: '#/definitions/DatabaseTest' }
  } */
  /* #swagger.responses[500] = {
    description: 'Database connection failed',
    schema: { $ref: '#/definitions/Error' }
  } */
  try {
    const result = await sql`SELECT 1 as test_value`;
    res.json({ 
      message: 'Database connection successful', 
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});