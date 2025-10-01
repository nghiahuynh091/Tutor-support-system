import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Tutor Support System API',
    version: '1.0.0',
    description: 'A comprehensive API for managing tutor support system',
    contact: {
      name: 'API Support',
      email: 'support@tutorsystem.com',
    },
  },
  host: 'localhost:3001',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'General',
      description: 'General API endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Database',
      description: 'Database related endpoints',
    },
  ],
  definitions: {
    HealthCheck: {
      status: 'OK',
      timestamp: '2025-10-01T10:00:00.000Z',
    },
    DatabaseTest: {
      message: 'Database connection successful',
      data: [{ test_value: 1 }],
      timestamp: '2025-10-01T10:00:00.000Z',
    },
    Error: {
      message: 'Error message',
      error: 'Detailed error information',
    },
    ApiResponse: {
      message: 'Tutor Support System API',
    },
  },
};

const outputFile = './src/swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

// Generate swagger documentation
swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully!');
});