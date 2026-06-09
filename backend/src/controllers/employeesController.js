const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { createSchema, updateSchema } = require('../validators/employeeValidator');
const { stripPassword, stripPasswords } = require('../utils/sanitize');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const { page = 1, perPage = 10, departmentId, q } = req.query;
  const where = {};
  if (departmentId) where.departmentId = Number(departmentId);
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(perPage);
  const take = Number(perPage);
  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take,
      include: { department: true },
      orderBy: { lastName: 'asc' },
    }),
    prisma.employee.count({ where }),
  ]);
  res.json({ data: stripPasswords(employees), total, page: Number(page), perPage: take });
};

exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.employee.findUnique({ where: { id }, include: { department: true } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(stripPassword(user));
};

exports.create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const hashed = await bcrypt.hash(data.password || 'password123', 10);
    const user = await prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashed,
        phone: data.phone,
        position: data.position,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        departmentId: data.departmentId ?? null,
        role: data.role || 'EMPLOYEE',
      },
      include: { department: true },
    });
    res.status(201).json(stripPassword(user));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = updateSchema.parse(req.body);
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    if (data.hireDate) data.hireDate = new Date(data.hireDate);
    const user = await prisma.employee.update({
      where: { id },
      data,
      include: { department: true },
    });
    res.json(stripPassword(user));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.userId) return res.status(400).json({ error: 'Cannot delete your own account' });
    await prisma.employee.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
