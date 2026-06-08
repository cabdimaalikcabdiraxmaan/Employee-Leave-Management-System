require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pwd = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', 10);
  const eng = await prisma.department.upsert({ where: { name: 'Engineering' }, update: {}, create: { name: 'Engineering', description: 'Engineering department' } });
  const hr = await prisma.department.upsert({ where: { name: 'Human Resources' }, update: {}, create: { name: 'Human Resources', description: 'HR department' } });

  const admin = await prisma.employee.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { firstName: 'Admin', lastName: 'User', email: 'admin@example.com', password: pwd, role: 'ADMIN', departmentId: hr.id } });

  const managerPwd = await bcrypt.hash('manager123', 10);
  const manager = await prisma.employee.upsert({ where: { email: 'manager@example.com' }, update: {}, create: { firstName: 'Jane', lastName: 'Manager', email: 'manager@example.com', password: managerPwd, role: 'MANAGER', departmentId: eng.id } });

  const empPwd = await bcrypt.hash('employee123', 10);
  const employee = await prisma.employee.upsert({ where: { email: 'employee@example.com' }, update: {}, create: { firstName: 'John', lastName: 'Employee', email: 'employee@example.com', password: empPwd, role: 'EMPLOYEE', departmentId: eng.id } });

  console.log('Seed completed');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
