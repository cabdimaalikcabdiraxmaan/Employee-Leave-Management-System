const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { stripPassword } = require('../utils/sanitize');
const prisma = new PrismaClient();

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  departmentId: z.number().optional(),
});

exports.register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashed,
        role: 'EMPLOYEE',
        departmentId: data.departmentId ?? null,
      },
    });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    next(err);
  }
};

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.employee.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    next(err);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await prisma.employee.findUnique({
      where: { id: req.user.userId },
      include: { department: true },
    });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(stripPassword(user));
  } catch (err) {
    next(err);
  }
};
