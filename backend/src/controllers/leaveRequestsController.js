const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { stripPassword } = require('../utils/sanitize');
const prisma = new PrismaClient();

const createSchema = z.object({
  leaveType: z.nativeEnum(require('@prisma/client').LeaveType),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
});

const updateSchema = z.object({
  leaveType: z.nativeEnum(require('@prisma/client').LeaveType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
});

function formatLeaveRequest(item) {
  if (!item) return item;
  return {
    ...item,
    employee: item.employee ? stripPassword(item.employee) : item.employee,
    approvedBy: item.approvedBy ? stripPassword(item.approvedBy) : item.approvedBy,
  };
}

function canAccessLeaveRequest(user, leaveRequest) {
  if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
  return leaveRequest.employeeId === user.userId;
}

exports.list = async (req, res) => {
  const user = req.user;
  const { status } = req.query;
  const where = {};
  if (user.role === 'EMPLOYEE') where.employeeId = user.userId;
  if (status) where.status = status;
  const items = await prisma.leaveRequest.findMany({
    where,
    include: { employee: { include: { department: true } }, approvedBy: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items.map(formatLeaveRequest));
};

exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { employee: { include: { department: true } }, approvedBy: true },
  });
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (!canAccessLeaveRequest(req.user, item)) return res.status(403).json({ error: 'Forbidden' });
  res.json(formatLeaveRequest(item));
};

exports.create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) return res.status(400).json({ error: 'End date must be after start date' });
    const lr = await prisma.leaveRequest.create({
      data: {
        employeeId: req.user.userId,
        leaveType: data.leaveType,
        startDate: start,
        endDate: end,
        reason: data.reason,
      },
      include: { employee: true },
    });
    res.status(201).json(formatLeaveRequest(lr));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Not found' });
    if (current.status !== 'PENDING') return res.status(400).json({ error: 'Only pending requests can be modified' });
    if (req.user.role === 'EMPLOYEE' && current.employeeId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const data = updateSchema.parse(req.body);
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end <= start) return res.status(400).json({ error: 'End date must be after start date' });
    }
    const payload = { ...data };
    if (payload.startDate) payload.startDate = new Date(payload.startDate);
    if (payload.endDate) payload.endDate = new Date(payload.endDate);
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: payload,
      include: { employee: true, approvedBy: true },
    });
    res.json(formatLeaveRequest(updated));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Not found' });
    if (current.status !== 'PENDING') return res.status(400).json({ error: 'Only pending requests can be deleted' });
    if (req.user.role === 'EMPLOYEE' && current.employeeId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.leaveRequest.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Not found' });
    if (current.status !== 'PENDING') return res.status(400).json({ error: 'Only pending can be approved' });
    if (current.employeeId === req.user.userId) return res.status(403).json({ error: 'Cannot approve own request' });
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: req.user.userId, approvedAt: new Date() },
      include: { employee: true, approvedBy: true },
    });
    res.json(formatLeaveRequest(updated));
  } catch (err) {
    next(err);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rejectionReason } = req.body;
    const current = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Not found' });
    if (current.status !== 'PENDING') return res.status(400).json({ error: 'Only pending can be rejected' });
    if (current.employeeId === req.user.userId) return res.status(403).json({ error: 'Cannot reject own request' });
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById: req.user.userId,
        approvedAt: new Date(),
        rejectionReason: rejectionReason || null,
      },
      include: { employee: true, approvedBy: true },
    });
    res.json(formatLeaveRequest(updated));
  } catch (err) {
    next(err);
  }
};
