const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const { page = 1, perPage = 10, departmentId, q } = req.query;
  const where = {};
  if (departmentId) where.departmentId = Number(departmentId);
  if (q) where.OR = [{ firstName: { contains: q } }, { lastName: { contains: q } }, { email: { contains: q } }];
  const employees = await prisma.employee.findMany({ where, skip: (page - 1) * perPage, take: Number(perPage) });
  res.json(employees);
};

exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.employee.findUnique({ where: { id }, include: { department: true } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  delete user.password;
  res.json(user);
};

exports.create = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, position, hireDate, departmentId, role } = req.body;
    const hashed = await bcrypt.hash(password || 'password123', 10);
    const user = await prisma.employee.create({ data: { firstName, lastName, email, password: hashed, phone, position, hireDate: hireDate ? new Date(hireDate) : null, departmentId: departmentId || null, role: role || 'EMPLOYEE' } });
    delete user.password;
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    const user = await prisma.employee.update({ where: { id }, data });
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.employee.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
