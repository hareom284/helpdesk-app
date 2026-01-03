import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create Departments
  const itDept = await prisma.department.create({
    data: {
      name: 'IT Department',
      location: 'Building A - Floor 3',
    },
  })

  const salesDept = await prisma.department.create({
    data: {
      name: 'Sales Department',
      location: 'Building B - Floor 1',
    },
  })

  const hrDept = await prisma.department.create({
    data: {
      name: 'HR Department',
      location: 'Building A - Floor 2',
    },
  })

  console.log('Created departments')

  // Create Staff - Operators
  const operator1 = await prisma.staff.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@manzaneque.com',
      phone: '+1-555-0101',
      jobTitle: 'Helpdesk Operator',
      departmentId: itDept.id,
      staffType: 'operator',
    },
  })

  const operator2 = await prisma.staff.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@manzaneque.com',
      phone: '+1-555-0102',
      jobTitle: 'Senior Helpdesk Operator',
      departmentId: itDept.id,
      staffType: 'operator',
    },
  })

  // Create Staff - Specialists
  const specialist1 = await prisma.staff.create({
    data: {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@manzaneque.com',
      phone: '+1-555-0201',
      jobTitle: 'Hardware Specialist',
      departmentId: itDept.id,
      staffType: 'specialist',
    },
  })

  const specialist2 = await prisma.staff.create({
    data: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@manzaneque.com',
      phone: '+1-555-0202',
      jobTitle: 'Software Specialist',
      departmentId: itDept.id,
      staffType: 'specialist',
    },
  })

  // Create Staff - Callers (Regular employees)
  const caller1 = await prisma.staff.create({
    data: {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@manzaneque.com',
      phone: '+1-555-0301',
      jobTitle: 'Sales Manager',
      departmentId: salesDept.id,
      staffType: 'caller',
    },
  })

  const caller2 = await prisma.staff.create({
    data: {
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@manzaneque.com',
      phone: '+1-555-0302',
      jobTitle: 'HR Coordinator',
      departmentId: hrDept.id,
      staffType: 'caller',
    },
  })

  console.log('Created staff members')

  // Create Problem Types
  const hardwareProblems = await prisma.problemType.create({
    data: {
      name: 'Hardware Issues',
      description: 'Physical equipment and hardware problems',
    },
  })

  const printerProblems = await prisma.problemType.create({
    data: {
      name: 'Printer Problems',
      description: 'Issues related to printers and printing',
      parentProblemTypeId: hardwareProblems.id,
    },
  })

  const monitorProblems = await prisma.problemType.create({
    data: {
      name: 'Monitor Issues',
      description: 'Display and monitor related problems',
      parentProblemTypeId: hardwareProblems.id,
    },
  })

  const softwareProblems = await prisma.problemType.create({
    data: {
      name: 'Software Issues',
      description: 'Application and software problems',
    },
  })

  const officeProblems = await prisma.problemType.create({
    data: {
      name: 'Office Application Problems',
      description: 'Issues with Microsoft Office or similar',
      parentProblemTypeId: softwareProblems.id,
    },
  })

  const networkProblems = await prisma.problemType.create({
    data: {
      name: 'Network Issues',
      description: 'Connectivity and network problems',
    },
  })

  console.log('Created problem types')

  // Create Specialist Expertise
  await prisma.specialistExpertise.createMany({
    data: [
      {
        specialistId: specialist1.id,
        problemTypeId: hardwareProblems.id,
        expertiseLevel: 'expert',
      },
      {
        specialistId: specialist1.id,
        problemTypeId: printerProblems.id,
        expertiseLevel: 'expert',
      },
      {
        specialistId: specialist2.id,
        problemTypeId: softwareProblems.id,
        expertiseLevel: 'expert',
      },
      {
        specialistId: specialist2.id,
        problemTypeId: networkProblems.id,
        expertiseLevel: 'intermediate',
      },
    ],
  })

  console.log('Created specialist expertise')

  // Create Equipment
  const equipment1 = await prisma.equipment.create({
    data: {
      serialNumber: 'DELL-2024-001',
      equipmentType: 'Desktop',
      equipmentMake: 'Dell',
      equipmentModel: 'OptiPlex 7090',
      purchaseDate: new Date('2023-06-15'),
      warrantyExpiry: new Date('2026-06-15'),
      assignedToStaffId: caller1.id,
      status: 'active',
    },
  })

  const equipment2 = await prisma.equipment.create({
    data: {
      serialNumber: 'HP-2024-001',
      equipmentType: 'Laptop',
      equipmentMake: 'HP',
      equipmentModel: 'EliteBook 840',
      purchaseDate: new Date('2023-08-20'),
      warrantyExpiry: new Date('2026-08-20'),
      assignedToStaffId: caller2.id,
      status: 'active',
    },
  })

  console.log('Created equipment')

  // Create Operating Systems
  const windows11 = await prisma.operatingSystem.create({
    data: {
      name: 'Windows',
      version: '11 Pro',
      vendor: 'Microsoft',
      isSupported: true,
    },
  })

  const windows10 = await prisma.operatingSystem.create({
    data: {
      name: 'Windows',
      version: '10 Pro',
      vendor: 'Microsoft',
      isSupported: true,
    },
  })

  console.log('Created operating systems')

  // Create Software
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

  console.log('Created software')

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

  console.log('Created licenses')

  // Install software on equipment
  await prisma.equipmentSoftware.createMany({
    data: [
      {
        equipmentId: equipment1.id,
        osId: windows11.id,
        installationDate: new Date('2023-06-15'),
      },
      {
        equipmentId: equipment1.id,
        softwareId: office365.id,
        licenseId: office365License.id,
        installationDate: new Date('2023-06-16'),
      },
      {
        equipmentId: equipment2.id,
        osId: windows10.id,
        installationDate: new Date('2023-08-20'),
      },
      {
        equipmentId: equipment2.id,
        softwareId: office365.id,
        licenseId: office365License.id,
        installationDate: new Date('2023-08-21'),
      },
    ],
  })

  console.log('Installed software on equipment')

  // Create sample Problems
  const problem1 = await prisma.problem.create({
    data: {
      problemNumber: 'PRB-2024-00001',
      callerId: caller1.id,
      equipmentId: equipment1.id,
      problemTypeId: printerProblems.id,
      initialOperatorId: operator1.id,
      assignedSpecialistId: specialist1.id,
      priority: 'medium',
      status: 'in_progress',
    },
  })

  const problem2 = await prisma.problem.create({
    data: {
      problemNumber: 'PRB-2024-00002',
      callerId: caller2.id,
      equipmentId: equipment2.id,
      problemTypeId: officeProblems.id,
      initialOperatorId: operator2.id,
      assignedSpecialistId: specialist2.id,
      priority: 'high',
      status: 'open',
    },
  })

  console.log('Created problems')

  // Create Calls
  await prisma.call.createMany({
    data: [
      {
        problemId: problem1.id,
        callerId: caller1.id,
        operatorId: operator1.id,
        callType: 'initial',
        callNotes: 'Printer not working, showing offline status',
        callDescription: 'The HP LaserJet printer is showing as offline in Windows. Unable to print any documents.',
        callDurationMins: 15,
      },
      {
        problemId: problem1.id,
        callerId: caller1.id,
        operatorId: operator1.id,
        callType: 'follow_up',
        callNotes: 'Following up on printer issue, specialist is investigating',
        callDescription: 'Checking on status of printer problem.',
        callDurationMins: 5,
      },
      {
        problemId: problem2.id,
        callerId: caller2.id,
        operatorId: operator2.id,
        callType: 'initial',
        callNotes: 'Microsoft Word crashing when opening documents',
        callDescription: 'Word crashes immediately when trying to open any .docx files. Excel and PowerPoint work fine.',
        callDurationMins: 20,
      },
    ],
  })

  console.log('Created calls')

  // Create a resolved problem with resolution
  const problem3 = await prisma.problem.create({
    data: {
      problemNumber: 'PRB-2024-00003',
      callerId: caller1.id,
      equipmentId: equipment1.id,
      problemTypeId: networkProblems.id,
      initialOperatorId: operator1.id,
      assignedSpecialistId: specialist2.id,
      priority: 'low',
      status: 'resolved',
    },
  })

  await prisma.call.create({
    data: {
      problemId: problem3.id,
      callerId: caller1.id,
      operatorId: operator1.id,
      callType: 'initial',
      callNotes: 'Cannot access shared network drive',
      callDescription: 'Getting "Network path not found" error when trying to access \\\\server\\shared',
      callDurationMins: 10,
    },
  })

  await prisma.resolution.create({
    data: {
      problemId: problem3.id,
      resolvedByStaffId: specialist2.id,
      resolutionDatetime: new Date(),
      resolutionDescription: 'Network drive mapping was incorrect. Remapped drive with correct path and credentials.',
      resolutionNotes: 'Also verified user permissions on the network share. All working correctly now.',
      timeTakenHours: 0.5,
      wasSuccessful: true,
    },
  })

  console.log('Created resolved problem with resolution')

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
