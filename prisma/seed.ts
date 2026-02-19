import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test user if none exists
  const existingUser = await prisma.user.findFirst();
  let userId: string;

  if (!existingUser) {
    const hashedPassword = await hash('testpassword123', 12);
    const testUser = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        emailVerified: true,
        password: hashedPassword,
      },
    });
    userId = testUser.id;
    console.log('Created test user:', testUser.email);
  } else {
    userId = existingUser.id;
    console.log('Using existing user:', existingUser.email);
  }

  const existingCandidates = await prisma.candidate.count();
  let candidateId: string | null = null;

  if (existingCandidates === 0) {
    const candidate = await prisma.candidate.create({
      data: {
        userId,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        title: 'Developpeur Full Stack',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        tools: ['VS Code', 'Docker', 'Git'],
        certifications: ['AWS Certified'],
        languages: [
          { name: 'Francais', level: 'C2' },
          { name: 'Anglais', level: 'B2' },
        ],
        availability: 'immediate',
        status: 'qualified',
        tjm: 550,
        yearsExperience: 5,
        location: 'Paris',
      },
    });
    candidateId = candidate.id;
    console.log('Created test candidate:', candidate.email);
  }

  const invitationCount = await prisma.candidateInvitation.count();
  if (invitationCount === 0) {
    await prisma.candidateInvitation.create({
      data: {
        candidateId,
        email: 'jean.dupont@example.com',
        name: 'Jean Dupont',
        token: 'seed-token-1',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create test client if none exists
  const existingClients = await prisma.client.count();
  let clientId: string | null = null;

  if (existingClients === 0) {
    const client = await prisma.client.create({
      data: {
        userId,
        name: 'BNP Paribas',
        sector: 'Banque',
        status: 'active',
        website: 'https://www.bnpparibas.com',
        address: 'Paris, France',
        contacts: {
          create: {
            name: 'Marie Martin',
            role: 'Responsable RH',
            email: 'marie.martin@bnp.com',
            phone: '01 40 14 00 00',
            isPrimary: true,
          },
        },
      },
    });
    clientId = client.id;
    console.log('Created test client:', client.name);
  } else {
    const client = await prisma.client.findFirst();
    clientId = client?.id ?? null;
  }

  // Create test dossier if none exists
  const existingDossiers = await prisma.dossier.count();
  if (existingDossiers === 0 && clientId) {
    const dossier = await prisma.dossier.create({
      data: {
        userId,
        clientId,
        title: 'Lead Developer React',
        description: "Recherche d'un Lead Developer React pour projet bancaire",
        status: 'inProgress',
        requiredProfiles: 2,
        matchedProfiles: 1,
        requiredSkills: ['React', 'TypeScript', 'Node.js'],
        preferredSkills: ['AWS', 'Docker'],
        score: 75,
      },
    });
    console.log('Created test dossier:', dossier.title);
  }

  // Create notifications
  const notifCount = await prisma.notification.count({ where: { userId } });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId,
          type: 'info',
          title: 'Bienvenue sur le dashboard',
          message: 'Vos dossiers et alertes apparaissent ici.',
          link: '/dashboard',
        },
        {
          userId,
          type: 'warning',
          title: 'Invitation en attente',
          message: "Un candidat n'a pas encore complete son dossier.",
          link: '/mes-candidats',
        },
      ],
    });
    console.log('Created notifications');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
