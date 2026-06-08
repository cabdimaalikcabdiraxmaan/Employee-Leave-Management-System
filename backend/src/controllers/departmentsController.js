const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const departments = await prisma.department.findMany();
  res.json(departments);
};

exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const dept = await prisma.department.findUnique({ where: { id }, include: { employees: true } });
  if (!dept) return res.status(404).json({ error: 'Not found' });
  res.json(dept);
};

const { createSchema, updateSchema } = require('../validators/departmentValidator');

exports.create = async (req, res, next) => {
  try {
    const { name, description } = createSchema.parse(req.body);
    const dept = await prisma.department.create({ data: { name, description } });
    res.status(201).json(dept);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = updateSchema.parse(req.body);
    const dept = await prisma.department.update({ where: { id }, data });
    res.json(dept);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.department.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
