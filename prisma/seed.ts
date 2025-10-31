import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password
  const hashedPassword = await bcrypt.hash('secret123', 10);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'rambo@rambo.com' },
    update: {},
    create: {
      name: 'Rambo',
      email: 'rambo@rambo.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', {
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
  });

  // Create sample roles
  const roles = [
    {
      name: 'Administrator',
      description: 'Full system administrator with all permissions',
      accessAreas: JSON.stringify(['USERS', 'ROLES', 'PERMISSIONS', 'SETTINGS', 'LOGS']),
      active: true,
    },
    {
      name: 'Moderator',
      description: 'Content moderator with limited permissions',
      accessAreas: JSON.stringify(['USERS', 'CONTENT']),
      active: true,
    },
    {
      name: 'Viewer',
      description: 'Read-only access to the system',
      accessAreas: JSON.stringify(['DASHBOARD']),
      active: true,
    },
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });
  }

  console.log('✅ Roles created:', roles.length);

  // Create sample environment permissions
  const envPermissions = [
    {
      name: '@PRODUCTION',
      permittedActions: JSON.stringify(['READ', 'WRITE', 'DELETE']),
      profile: 'Production Environment',
      purpose: 'Full access to production environment',
    },
    {
      name: '@STAGING',
      permittedActions: JSON.stringify(['READ', 'WRITE']),
      profile: 'Staging Environment',
      purpose: 'Read and write access to staging environment',
    },
    {
      name: '@DEVELOPMENT',
      permittedActions: JSON.stringify(['READ']),
      profile: 'Development Environment',
      purpose: 'Read-only access to development environment',
    },
  ];

  for (const envPerm of envPermissions) {
    await prisma.environmentPermission.upsert({
      where: { name: envPerm.name },
      update: {},
      create: envPerm,
    });
  }

  console.log('✅ Environment permissions created:', envPermissions.length);

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📋 Credentials:');
  console.log('   Email: rambo@rambo.com');
  console.log('   Password: secret123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
