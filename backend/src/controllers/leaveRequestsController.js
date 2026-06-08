const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient();

const createSchema = z.object({
  leaveType: z.nativeEnum(require('@prisma/client').LeaveType),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
});

exports.list = async (req, res) => {
  const user = req.user;
  const where = {};
  if (user.role === 'EMPLOYEE') where.employeeId = user.userId;
  const items = await prisma.leaveRequest.findMany({ where, include: { employee: true, approvedBy: true } });
  res.json(items);
};

exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.leaveRequest.findUnique({ where: { id }, include: { employee: true, approvedBy: true } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
};

exports.create = async (req, res) => {
  try {
    const data = createSchema.parse(req.body);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) return res.status(400).json({ error: 'End date must be after start date' });
    const lr = await prisma.leaveRequest.create({ data: { employeeId: req.user.userId, leaveType: data.leaveType, startDate: start, endDate: end, reason: data.reason } });
    res.status(201).json(lr);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const current = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Not found' });
    if (current.status !== 'PENDING') return res.status(400).json({ error: 'Only pending requests can be modified' });
    if (req.user.role === 'EMPLOYEE' && current.employeeId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
    const data = req.body;
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end <= start) return res.status(400).json({ error: 'End date must be after start date' });
    }
    const updated = await prisma.leaveRequest.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const current = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Not found' });
    if (current.status !== 'PENDING') return res.status(400).json({ error: 'Only pending requests can be deleted' });
    if (req.user.role === 'EMPLOYEE' && current.employeeId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
    await prisma.leaveRequest.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const current = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Not found' });
    if (current.status !== 'PENDING') return res.status(400).json({ error: 'Only pending can be approved' });
    if (current.employeeId === req.user.userId) return res.status(403).json({ error: 'Cannot approve own request' });
    const updated = await prisma.leaveRequest.update({ where: { id }, data: { status: 'APPROVED', approvedById: req.user.userId, approvedAt: new Date() } });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rejectionReason } = req.body;
    const current = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Not found' });
    if (current.status !== 'PENDING') return res.status(400).json({ error: 'Only pending can be rejected' });
    if (current.employeeId === req.user.userId) return res.status(403).json({ error: 'Cannot reject own request' });
    const updated = await prisma.leaveRequest.update({ where: { id }, data: { status: 'REJECTED', approvedById: req.user.userId, approvedAt: new Date(), rejectionReason } });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
