import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed execution...');

  // 1. Create Company
  const company = await prisma.company.upsert({
    where: { name: 'LuminaRH' },
    update: {},
    create: {
      name: 'LuminaRH',
      plan: 'pro',
      isActive: true,
    },
  });
  console.log(`- Company created: "${company.name}"`);

  // 2. Create Departments
  const deptDirection = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Direction Générale',
    },
  });

  const deptDev = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Développement Produit',
    },
  });

  const deptRh = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Ressources Humaines',
    },
  });
  console.log('- Departments created');

  // 3. Create Schedule
  const normalSchedule = await prisma.schedule.create({
    data: {
      companyId: company.id,
      name: 'Horaire Standard (08h00 - 17h00)',
    },
  });
  console.log('- Schedule created');

  // 4. Create Users (with Keycloak-managed accounts)
  const userAdmin = await prisma.user.upsert({
    where: { email: 'amadou@luminarh.sn' },
    update: {
      name: 'Amadou Diallo',
      role: 'admin',
      companyId: company.id,
      departmentId: deptDirection.id,
      isActive: true,
    },
    create: {
      email: 'amadou@luminarh.sn',
      name: 'Amadou Diallo',
      role: 'admin',
      companyId: company.id,
      departmentId: deptDirection.id,
      password: 'KEYCLOAK_MANAGED_SECRET',
      isActive: true,
    },
  });

  const userDev = await prisma.user.upsert({
    where: { email: 'mandiaye@luminarh.sn' },
    update: {
      name: 'Mandiaye Diagne',
      role: 'employee',
      companyId: company.id,
      departmentId: deptDev.id,
      isActive: true,
    },
    create: {
      email: 'mandiaye@luminarh.sn',
      name: 'Mandiaye Diagne',
      role: 'employee',
      companyId: company.id,
      departmentId: deptDev.id,
      password: 'KEYCLOAK_MANAGED_SECRET',
      isActive: true,
    },
  });

  const userRh = await prisma.user.upsert({
    where: { email: 'fatou@luminarh.sn' },
    update: {
      name: 'Fatou Sow',
      role: 'manager',
      companyId: company.id,
      departmentId: deptRh.id,
      isActive: true,
    },
    create: {
      email: 'fatou@luminarh.sn',
      name: 'Fatou Sow',
      role: 'manager',
      companyId: company.id,
      departmentId: deptRh.id,
      password: 'KEYCLOAK_MANAGED_SECRET',
      isActive: true,
    },
  });
  console.log('- Users upserted');

  // 5. Create Employee Profiles
  const empAdmin = await prisma.employee.upsert({
    where: { email: 'amadou@luminarh.sn' },
    update: {
      departmentId: deptDirection.id,
      scheduleId: normalSchedule.id,
    },
    create: {
      companyId: company.id,
      userId: userAdmin.id,
      departmentId: deptDirection.id,
      scheduleId: normalSchedule.id,
      firstName: 'Amadou',
      lastName: 'Diallo',
      email: 'amadou@luminarh.sn',
      contractType: 'cdi',
      status: 'active',
      pinCode: '1111',
    },
  });

  const empDev = await prisma.employee.upsert({
    where: { email: 'mandiaye@luminarh.sn' },
    update: {
      departmentId: deptDev.id,
      scheduleId: normalSchedule.id,
    },
    create: {
      companyId: company.id,
      userId: userDev.id,
      departmentId: deptDev.id,
      scheduleId: normalSchedule.id,
      firstName: 'Mandiaye',
      lastName: 'Diagne',
      email: 'mandiaye@luminarh.sn',
      contractType: 'cdi',
      status: 'active',
      pinCode: '2222',
    },
  });

  const empRh = await prisma.employee.upsert({
    where: { email: 'fatou@luminarh.sn' },
    update: {
      departmentId: deptRh.id,
      scheduleId: normalSchedule.id,
    },
    create: {
      companyId: company.id,
      userId: userRh.id,
      departmentId: deptRh.id,
      scheduleId: normalSchedule.id,
      firstName: 'Fatou',
      lastName: 'Sow',
      email: 'fatou@luminarh.sn',
      contractType: 'cdi',
      status: 'active',
      pinCode: '3333',
    },
  });
  console.log('- Employee profiles created');

  // 6. Create Locations
  const locationDakar = await prisma.location.create({
    data: {
      companyId: company.id,
      name: 'Siège Dakar (Plateau)',
      address: 'Avenue Léopold Sédar Senghor, Dakar',
      latitude: 14.6677,
      longitude: -17.4331,
      radius: 150.0,
      isActive: true,
      qrToken: 'siege-dakar-plateau-qr-token',
    },
  });

  const locationAlmadies = await prisma.location.create({
    data: {
      companyId: company.id,
      name: 'Bureaux Almadies',
      address: 'Route des Almadies, Dakar',
      latitude: 14.7454,
      longitude: -17.5144,
      radius: 100.0,
      isActive: true,
      qrToken: 'bureaux-almadies-qr-token',
    },
  });
  console.log('- Locations created');

  // 7. Create Leave Types and Balances
  const leaveAnnual = await prisma.leaveType.create({
    data: {
      companyId: company.id,
      name: 'Congés Annuels',
      daysAllowed: 30,
      maxDaysPerYear: 30,
      requiresAttachment: false,
      paid: true,
      color: '#4f46e5',
      isActive: true,
    },
  });

  const leaveSick = await prisma.leaveType.create({
    data: {
      companyId: company.id,
      name: 'Congés Maladie',
      daysAllowed: 5,
      maxDaysPerYear: 10,
      requiresAttachment: true,
      paid: true,
      color: '#ef4444',
      isActive: true,
    },
  });
  console.log('- Leave types created');

  const employees = [empAdmin, empDev, empRh];
  const leaveTypes = [leaveAnnual, leaveSick];

  for (const emp of employees) {
    for (const lt of leaveTypes) {
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId: {
            employeeId: emp.id,
            leaveTypeId: lt.id,
          },
        },
        update: {},
        create: {
          employeeId: emp.id,
          leaveTypeId: lt.id,
          year: 2026,
          allocated: lt.daysAllowed,
          used: 0.0,
          pending: 0.0,
          remaining: lt.daysAllowed,
        },
      });
    }
  }
  console.log('- Leave balances initialized');

  // 8. Create Missions
  const missionLumina = await prisma.mission.create({
    data: {
      companyId: company.id,
      title: 'Migration LuminaRH v2',
      description: 'Déploiement du nouveau portail RH unifié et de la sécurité SSO.',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-09-30'),
      status: 'in_progress',
      departmentId: deptDev.id,
      location: 'Bureaux Almadies',
    },
  });

  const missionRecrutement = await prisma.mission.create({
    data: {
      companyId: company.id,
      title: 'Campagne de Recrutement Alternance 2026',
      description: 'Sélection et intégration des nouveaux développeurs alternants.',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-08-31'),
      status: 'in_progress',
      departmentId: deptRh.id,
      location: 'Siège Dakar (Plateau)',
    },
  });
  console.log('- Missions created');

  // 9. Assign Employees to Missions
  await prisma.missionAssignment.create({
    data: {
      missionId: missionLumina.id,
      employeeId: empDev.id,
    },
  });

  await prisma.missionAssignment.create({
    data: {
      missionId: missionRecrutement.id,
      employeeId: empRh.id,
    },
  });
  console.log('- Mission assignments created');

  // 10. Create Tasks
  await prisma.task.create({
    data: {
      title: 'Intégration SSO Keycloak dans le Monolithe',
      description: 'Configurer les routes sécurisées et le décodeur de token JWT.',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date('2026-07-15'),
      employeeId: empDev.id,
      missionId: missionLumina.id,
      departmentId: deptDev.id,
      estimatedMinutes: 480,
      actualMinutes: 120,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Modélisation des Schémas de Base de Données Prisma',
      description: 'Définir les relations des modules Pointage, Congés et Missions.',
      status: 'done',
      priority: 'medium',
      dueDate: new Date('2026-06-30'),
      employeeId: empDev.id,
      missionId: missionLumina.id,
      departmentId: deptDev.id,
      estimatedMinutes: 240,
      actualMinutes: 210,
      completedAt: new Date('2026-06-29'),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Tri des candidatures reçues pour le poste de Dev NodeJS',
      description: 'Passer en revue les CVs de la plateforme de recrutement.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2026-07-10'),
      employeeId: empRh.id,
      missionId: missionRecrutement.id,
      departmentId: deptRh.id,
      estimatedMinutes: 180,
    },
  });
  console.log('- Tasks created');

  console.log('Seed execution completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
