require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leaveRequests');

const app = express();
app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Employee Leave Management API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.js'],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leave-requests', leaveRoutes);

// 404 handler
app.use((req, res, next) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
