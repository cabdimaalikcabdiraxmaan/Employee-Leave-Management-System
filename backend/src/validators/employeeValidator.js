const { z } = require('zod');

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  departmentId: z.number().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
});

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  departmentId: z.number().nullable().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
});

module.exports = { createSchema, updateSchema };
