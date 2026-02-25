require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL.replace('mysql://', 'mariadb://');
const adapter = new PrismaMariaDb(dbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Create company
    const company = await prisma.company.upsert({
        where: { id: 'seed-company-001' },
        update: {},
        create: {
            id: 'seed-company-001',
            name: 'Acme Corp',
            address: '123 Main Street, Anytown',
            country: 'US',
            plan: 'enterprise',
            seatLimit: 50,
            settings: { create: {} },
        },
    });
    console.log('✅ Company created:', company.name);

    // Departments
    const deptNames = ['Engineering', 'Sales', 'HR', 'Finance', 'Operations'];
    const departments = await Promise.all(
        deptNames.map(name =>
            prisma.department.upsert({
                where: { name_companyId: { name, companyId: company.id } },
                update: {},
                create: { name, companyId: company.id },
            })
        )
    );
    console.log('✅ Departments created:', departments.map(d => d.name).join(', '));

    const passwordHash = await bcrypt.hash('Admin@123', 12);

    // Admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@acme.com' },
        update: {},
        create: {
            employeeId: 'EMP-001',
            name: 'Admin User',
            email: 'admin@acme.com',
            passwordHash,
            role: 'admin',
            position: 'System Administrator',
            baseRate: 50,
            companyId: company.id,
        },
    });

    // Manager
    const manager = await prisma.user.upsert({
        where: { email: 'manager@acme.com' },
        update: {},
        create: {
            employeeId: 'EMP-002',
            name: 'Manager User',
            email: 'manager@acme.com',
            passwordHash,
            role: 'manager',
            position: 'Engineering Manager',
            baseRate: 40,
            companyId: company.id,
            departmentId: departments[0].id,
        },
    });

    // Employee
    const employee = await prisma.user.upsert({
        where: { email: 'employee@acme.com' },
        update: {},
        create: {
            employeeId: 'EMP-003',
            name: 'Test Employee',
            email: 'employee@acme.com',
            passwordHash,
            role: 'employee',
            position: 'Software Developer',
            baseRate: 30,
            companyId: company.id,
            departmentId: departments[0].id,
            managerId: manager.id,
        },
    });
    console.log('✅ Users created: admin, manager, employee');
    console.log('   📧 admin@acme.com / Admin@123');
    console.log('   📧 manager@acme.com / Admin@123');
    console.log('   📧 employee@acme.com / Admin@123');

    // Alert configs
    await prisma.alertConfig.createMany({
        data: [
            { companyId: company.id, type: 'idle_timeout', enabled: true, threshold: 30 },
            { companyId: company.id, type: 'unusual_activity', enabled: true, sensitivity: 'medium' },
            { companyId: company.id, type: 'missed_shift', enabled: true, threshold: 15 },
            { companyId: company.id, type: 'geofence_violation', enabled: false },
            { companyId: company.id, type: 'overtime_threshold', enabled: true, threshold: 9 },
        ],
        skipDuplicates: true,
    });

    // Sample holiday
    await prisma.holiday.createMany({
        data: [
            { companyId: company.id, name: 'New Year\'s Day', date: new Date('2026-01-01'), type: 'national', year: 2026 },
            { companyId: company.id, name: 'Independence Day', date: new Date('2026-07-04'), type: 'national', year: 2026 },
        ],
        skipDuplicates: true,
    });

    // Sample project
    const project = await prisma.project.upsert({
        where: { id: 'seed-project-001' },
        update: {},
        create: {
            id: 'seed-project-001',
            companyId: company.id,
            name: 'EMS Backend Development',
            description: 'Build the backend API for the Employee Monitoring System',
            status: 'active',
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-06-30'),
            budget: 50000,
        },
    });

    await prisma.projectMember.createMany({
        data: [
            { projectId: project.id, userId: manager.id, role: 'manager' },
            { projectId: project.id, userId: employee.id, role: 'member' },
        ],
        skipDuplicates: true,
    });

    // Sample tasks
    await prisma.task.createMany({
        data: [
            { projectId: project.id, title: 'Setup authentication module', status: 'done', priority: 'high', position: 0 },
            { projectId: project.id, title: 'Implement employee CRUD', status: 'done', priority: 'high', position: 1 },
            { projectId: project.id, title: 'Build payroll calculation', status: 'in_progress', priority: 'medium', position: 0 },
            { projectId: project.id, title: 'Add screenshot module', status: 'todo', priority: 'medium', position: 0 },
        ],
    });

    // Sample notification
    await prisma.notification.create({
        data: {
            companyId: company.id,
            recipientId: admin.id,
            title: '🎉 System initialized',
            description: 'EMS backend is seeded and ready to use. Login with admin@acme.com / Admin@123',
            type: 'success',
            category: 'system',
        },
    });

    console.log('✅ Sample data seeded successfully!');
    console.log('\n🚀 Start with: npm run dev');
}

main()
    .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
