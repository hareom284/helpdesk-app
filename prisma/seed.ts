import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting enhanced database seeding...\n')

  // ========================================
  // 1. CREATE ROLES & PERMISSIONS
  // ========================================
  console.log('📋 Creating roles and permissions...')

  // Create Permissions
  const permissions = await Promise.all([
    // Problem permissions
    prisma.permission.create({ data: { name: 'problem:create', resource: 'problem', action: 'create', description: 'Create new problems' } }),
    prisma.permission.create({ data: { name: 'problem:read', resource: 'problem', action: 'read', description: 'View problems' } }),
    prisma.permission.create({ data: { name: 'problem:update', resource: 'problem', action: 'update', description: 'Update problems' } }),
    prisma.permission.create({ data: { name: 'problem:delete', resource: 'problem', action: 'delete', description: 'Delete problems' } }),
    prisma.permission.create({ data: { name: 'problem:assign', resource: 'problem', action: 'assign', description: 'Assign problems to specialists' } }),

    // User permissions
    prisma.permission.create({ data: { name: 'user:create', resource: 'user', action: 'create', description: 'Create new users' } }),
    prisma.permission.create({ data: { name: 'user:read', resource: 'user', action: 'read', description: 'View users' } }),
    prisma.permission.create({ data: { name: 'user:update', resource: 'user', action: 'update', description: 'Update users' } }),
    prisma.permission.create({ data: { name: 'user:delete', resource: 'user', action: 'delete', description: 'Delete users' } }),

    // Equipment permissions
    prisma.permission.create({ data: { name: 'equipment:create', resource: 'equipment', action: 'create', description: 'Create equipment' } }),
    prisma.permission.create({ data: { name: 'equipment:read', resource: 'equipment', action: 'read', description: 'View equipment' } }),
    prisma.permission.create({ data: { name: 'equipment:update', resource: 'equipment', action: 'update', description: 'Update equipment' } }),
    prisma.permission.create({ data: { name: 'equipment:delete', resource: 'equipment', action: 'delete', description: 'Delete equipment' } }),

    // System permissions
    prisma.permission.create({ data: { name: 'system:admin', resource: 'system', action: 'admin', description: 'Full system access' } }),
    prisma.permission.create({ data: { name: 'reports:view', resource: 'reports', action: 'view', description: 'View reports' } }),
  ])

  console.log(`✅ Created ${permissions.length} permissions`)

  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Full system administrator',
      isSystem: true,
    },
  })

  const operatorRole = await prisma.role.create({
    data: {
      name: 'Operator',
      description: 'Helpdesk operator - handles incoming calls and creates tickets',
      isSystem: true,
    },
  })

  const specialistRole = await prisma.role.create({
    data: {
      name: 'Specialist',
      description: 'Technical specialist - resolves assigned problems',
      isSystem: true,
    },
  })

  const userRole = await prisma.role.create({
    data: {
      name: 'User',
      description: 'Regular user - can create and view own problems',
      isSystem: true,
    },
  })

  console.log('✅ Created 4 roles')

  // Assign Permissions to Roles
  // Admin - all permissions
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Operator - problem management, view users
  const operatorPermissions = permissions.filter(p =>
    p.name.startsWith('problem:') || p.name === 'user:read' || p.name === 'equipment:read'
  )
  for (const permission of operatorPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: operatorRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Specialist - update problems, view equipment
  const specialistPermissions = permissions.filter(p =>
    p.name === 'problem:read' || p.name === 'problem:update' ||
    p.name === 'equipment:read' || p.name === 'user:read'
  )
  for (const permission of specialistPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: specialistRole.id,
        permissionId: permission.id,
      },
    })
  }

  // User - create and read own problems
  const userPermissions = permissions.filter(p =>
    p.name === 'problem:create' || p.name === 'problem:read'
  )
  for (const permission of userPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    })
  }

  console.log('✅ Assigned permissions to roles\n')

  // ========================================
  // 2. CREATE DEPARTMENTS
  // ========================================
  console.log('🏢 Creating departments...')

  const itDept = await prisma.department.create({
    data: {
      name: 'IT Department',
      location: 'Building A - Floor 3',
      isActive: true,
    },
  })

  const salesDept = await prisma.department.create({
    data: {
      name: 'Sales Department',
      location: 'Building B - Floor 1',
      isActive: true,
    },
  })

  const hrDept = await prisma.department.create({
    data: {
      name: 'HR Department',
      location: 'Building A - Floor 2',
      isActive: true,
    },
  })

  const financeDept = await prisma.department.create({
    data: {
      name: 'Finance Department',
      location: 'Building B - Floor 2',
      isActive: true,
    },
  })

  const operationsDept = await prisma.department.create({
    data: {
      name: 'Operations Department',
      location: 'Building C - Floor 1',
      isActive: true,
    },
  })

  console.log('✅ Created 5 departments\n')

  // ========================================
  // 3. CREATE USERS
  // ========================================
  console.log('👥 Creating users...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@manzaneque.com',
      emailVerified: new Date(),
      name: 'System Administrator',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      phone: '+1-555-0001',
      jobTitle: 'System Administrator',
      departmentId: itDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: admin.id, roleId: adminRole.id },
  })

  // Operators
  const operator1 = await prisma.user.create({
    data: {
      email: 'john.smith@manzaneque.com',
      emailVerified: new Date(),
      name: 'John Smith',
      firstName: 'John',
      lastName: 'Smith',
      password: hashedPassword,
      phone: '+1-555-0101',
      jobTitle: 'Helpdesk Operator',
      departmentId: itDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: operator1.id, roleId: operatorRole.id },
  })

  const operator2 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@manzaneque.com',
      emailVerified: new Date(),
      name: 'Sarah Johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      password: hashedPassword,
      phone: '+1-555-0102',
      jobTitle: 'Senior Helpdesk Operator',
      departmentId: itDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: operator2.id, roleId: operatorRole.id },
  })

  // Specialists
  const specialist1 = await prisma.user.create({
    data: {
      email: 'michael.chen@manzaneque.com',
      emailVerified: new Date(),
      name: 'Michael Chen',
      firstName: 'Michael',
      lastName: 'Chen',
      password: hashedPassword,
      phone: '+1-555-0201',
      jobTitle: 'Hardware Specialist',
      departmentId: itDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: specialist1.id, roleId: specialistRole.id },
  })

  const specialist2 = await prisma.user.create({
    data: {
      email: 'emily.rodriguez@manzaneque.com',
      emailVerified: new Date(),
      name: 'Emily Rodriguez',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      password: hashedPassword,
      phone: '+1-555-0202',
      jobTitle: 'Software Specialist',
      departmentId: itDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: specialist2.id, roleId: specialistRole.id },
  })

  const specialist3 = await prisma.user.create({
    data: {
      email: 'robert.kim@manzaneque.com',
      emailVerified: new Date(),
      name: 'Robert Kim',
      firstName: 'Robert',
      lastName: 'Kim',
      password: hashedPassword,
      phone: '+1-555-0203',
      jobTitle: 'Network Specialist',
      departmentId: itDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: specialist3.id, roleId: specialistRole.id },
  })

  // Regular Users (across different departments)
  const user1 = await prisma.user.create({
    data: {
      email: 'david.brown@manzaneque.com',
      emailVerified: new Date(),
      name: 'David Brown',
      firstName: 'David',
      lastName: 'Brown',
      password: hashedPassword,
      phone: '+1-555-0301',
      jobTitle: 'Sales Manager',
      departmentId: salesDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: user1.id, roleId: userRole.id },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'lisa.anderson@manzaneque.com',
      emailVerified: new Date(),
      name: 'Lisa Anderson',
      firstName: 'Lisa',
      lastName: 'Anderson',
      password: hashedPassword,
      phone: '+1-555-0302',
      jobTitle: 'HR Coordinator',
      departmentId: hrDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: user2.id, roleId: userRole.id },
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'james.wilson@manzaneque.com',
      emailVerified: new Date(),
      name: 'James Wilson',
      firstName: 'James',
      lastName: 'Wilson',
      password: hashedPassword,
      phone: '+1-555-0303',
      jobTitle: 'Financial Analyst',
      departmentId: financeDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: user3.id, roleId: userRole.id },
  })

  const user4 = await prisma.user.create({
    data: {
      email: 'maria.garcia@manzaneque.com',
      emailVerified: new Date(),
      name: 'Maria Garcia',
      firstName: 'Maria',
      lastName: 'Garcia',
      password: hashedPassword,
      phone: '+1-555-0304',
      jobTitle: 'Operations Manager',
      departmentId: operationsDept.id,
      isActive: true,
    },
  })

  await prisma.userRole.create({
    data: { userId: user4.id, roleId: userRole.id },
  })

  console.log('✅ Created 10 users (1 admin, 2 operators, 3 specialists, 4 regular users)\n')

  // ========================================
  // 4. CREATE PROBLEM TYPES
  // ========================================
  console.log('📝 Creating problem types...')

  const hardwareProblems = await prisma.problemType.create({
    data: {
      name: 'Hardware Issues',
      description: 'Physical equipment and hardware problems',
      slaResponseTime: 30,
      slaResolutionTime: 240,
      isActive: true,
    },
  })

  const printerProblems = await prisma.problemType.create({
    data: {
      name: 'Printer Problems',
      description: 'Issues related to printers and printing',
      parentProblemTypeId: hardwareProblems.id,
      slaResponseTime: 20,
      slaResolutionTime: 120,
      isActive: true,
    },
  })

  const monitorProblems = await prisma.problemType.create({
    data: {
      name: 'Monitor Issues',
      description: 'Display and monitor related problems',
      parentProblemTypeId: hardwareProblems.id,
      slaResponseTime: 30,
      slaResolutionTime: 180,
      isActive: true,
    },
  })

  const softwareProblems = await prisma.problemType.create({
    data: {
      name: 'Software Issues',
      description: 'Application and software problems',
      slaResponseTime: 15,
      slaResolutionTime: 180,
      isActive: true,
    },
  })

  const officeProblems = await prisma.problemType.create({
    data: {
      name: 'Office Application Problems',
      description: 'Issues with Microsoft Office or similar',
      parentProblemTypeId: softwareProblems.id,
      slaResponseTime: 15,
      slaResolutionTime: 120,
      isActive: true,
    },
  })

  const networkProblems = await prisma.problemType.create({
    data: {
      name: 'Network Issues',
      description: 'Connectivity and network problems',
      slaResponseTime: 10,
      slaResolutionTime: 240,
      isActive: true,
    },
  })

  const emailProblems = await prisma.problemType.create({
    data: {
      name: 'Email Problems',
      description: 'Email client and server issues',
      parentProblemTypeId: networkProblems.id,
      slaResponseTime: 15,
      slaResolutionTime: 120,
      isActive: true,
    },
  })

  console.log('✅ Created 7 problem types\n')

  // ========================================
  // 5. CREATE SPECIALIST EXPERTISE
  // ========================================
  console.log('🎯 Assigning specialist expertise...')

  await prisma.specialistExpertise.createMany({
    data: [
      // Michael Chen - Hardware expert
      { specialistId: specialist1.id, problemTypeId: hardwareProblems.id, expertiseLevel: 'expert' },
      { specialistId: specialist1.id, problemTypeId: printerProblems.id, expertiseLevel: 'expert' },
      { specialistId: specialist1.id, problemTypeId: monitorProblems.id, expertiseLevel: 'expert' },

      // Emily Rodriguez - Software expert
      { specialistId: specialist2.id, problemTypeId: softwareProblems.id, expertiseLevel: 'expert' },
      { specialistId: specialist2.id, problemTypeId: officeProblems.id, expertiseLevel: 'expert' },

      // Robert Kim - Network expert
      { specialistId: specialist3.id, problemTypeId: networkProblems.id, expertiseLevel: 'expert' },
      { specialistId: specialist3.id, problemTypeId: emailProblems.id, expertiseLevel: 'expert' },
      { specialistId: specialist3.id, problemTypeId: softwareProblems.id, expertiseLevel: 'intermediate' },
    ],
  })

  console.log('✅ Assigned specialist expertise\n')

  // ========================================
  // 6. CREATE EQUIPMENT
  // ========================================
  console.log('💻 Creating equipment...')

  const equipment = await prisma.equipment.createMany({
    data: [
      {
        serialNumber: 'DELL-2024-001',
        assetTag: 'IT-DESK-001',
        equipmentType: 'Desktop',
        equipmentMake: 'Dell',
        equipmentModel: 'OptiPlex 7090',
        purchaseDate: new Date('2023-06-15'),
        warrantyExpiry: new Date('2026-06-15'),
        assignedToUserId: user1.id,
        locationDetails: 'Building B - Floor 1 - Desk 12',
        status: 'active',
      },
      {
        serialNumber: 'HP-2024-001',
        assetTag: 'IT-DESK-002',
        equipmentType: 'Laptop',
        equipmentMake: 'HP',
        equipmentModel: 'EliteBook 840',
        purchaseDate: new Date('2023-08-20'),
        warrantyExpiry: new Date('2026-08-20'),
        assignedToUserId: user2.id,
        locationDetails: 'Building A - Floor 2 - HR Office',
        status: 'active',
      },
      {
        serialNumber: 'DELL-2024-002',
        assetTag: 'IT-LAP-001',
        equipmentType: 'Laptop',
        equipmentMake: 'Dell',
        equipmentModel: 'Latitude 5420',
        purchaseDate: new Date('2023-09-10'),
        warrantyExpiry: new Date('2026-09-10'),
        assignedToUserId: user3.id,
        locationDetails: 'Building B - Floor 2 - Finance',
        status: 'active',
      },
      {
        serialNumber: 'LENOVO-2024-001',
        assetTag: 'IT-DESK-003',
        equipmentType: 'Desktop',
        equipmentMake: 'Lenovo',
        equipmentModel: 'ThinkCentre M90',
        purchaseDate: new Date('2023-07-05'),
        warrantyExpiry: new Date('2026-07-05'),
        assignedToUserId: user4.id,
        locationDetails: 'Building C - Floor 1 - Operations',
        status: 'active',
      },
      {
        serialNumber: 'HP-PRINTER-001',
        assetTag: 'IT-PRT-001',
        equipmentType: 'Printer',
        equipmentMake: 'HP',
        equipmentModel: 'LaserJet Pro M404',
        purchaseDate: new Date('2023-05-20'),
        warrantyExpiry: new Date('2025-05-20'),
        locationDetails: 'Building A - Floor 3 - IT Department',
        status: 'active',
      },
    ],
  })

  console.log('✅ Created 5 equipment items\n')

  // Get equipment for problems
  const allEquipment = await prisma.equipment.findMany()

  // ========================================
  // 7. CREATE OPERATING SYSTEMS & SOFTWARE
  // ========================================
  console.log('💿 Creating operating systems and software...')

  const windows11 = await prisma.operatingSystem.create({
    data: { name: 'Windows', version: '11 Pro', vendor: 'Microsoft', isSupported: true },
  })

  const windows10 = await prisma.operatingSystem.create({
    data: { name: 'Windows', version: '10 Pro', vendor: 'Microsoft', isSupported: true },
  })

  const office365 = await prisma.software.create({
    data: {
      name: 'Microsoft Office 365',
      version: '2023',
      vendor: 'Microsoft',
      category: 'Productivity',
    },
  })

  const chrome = await prisma.software.create({
    data: {
      name: 'Google Chrome',
      version: '120.0',
      vendor: 'Google',
      category: 'Browser',
    },
  })

  const zoom = await prisma.software.create({
    data: {
      name: 'Zoom',
      version: '5.16',
      vendor: 'Zoom Video Communications',
      category: 'Communication',
    },
  })

  // Create Licenses
  const office365License = await prisma.license.create({
    data: {
      softwareId: office365.id,
      licenseKey: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
      purchaseDate: new Date('2023-01-01'),
      expiryDate: new Date('2024-12-31'),
      licenseType: 'subscription',
      maxUsers: 100,
      isValid: true,
    },
  })

  console.log('✅ Created operating systems, software, and licenses\n')

  console.log('✅ Seeding completed successfully! 🎉\n')
  console.log('📊 Summary:')
  console.log('  - 4 Roles')
  console.log('  - 15 Permissions')
  console.log('  - 5 Departments')
  console.log('  - 10 Users')
  console.log('  - 7 Problem Types')
  console.log('  - 8 Specialist Expertise assignments')
  console.log('  - 5 Equipment items')
  console.log('  - 2 Operating Systems')
  console.log('  - 3 Software applications')
  console.log('  - 1 License')
  console.log('\n🔑 Test Login Credentials:')
  console.log('  Admin:      admin@manzaneque.com / password123')
  console.log('  Operator:   john.smith@manzaneque.com / password123')
  console.log('  Specialist: michael.chen@manzaneque.com / password123')
  console.log('  User:       david.brown@manzaneque.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
