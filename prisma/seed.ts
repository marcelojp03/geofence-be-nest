import { PrismaClient, UserRole, Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes (solo para desarrollo)
  await prisma.alert.deleteMany();
  await prisma.childPosition.deleteMany();
  await prisma.device.deleteMany();
  await prisma.child.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Crear escuela demo
  const school = await prisma.school.create({
    data: {
      code: 'SCH-001',
      name: 'Colegio Demo San Martín',
      address: 'Calle Principal #123, Santa Cruz, Bolivia',
      phone: '+591 3 1234567',
      status: Status.ACTIVE,
    },
  });

  console.log(`✅ Escuela creada: ${school.name}`);

  // Crear admin de la escuela
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'admin@demo.com',
      fullName: 'Admin Demo',
      passwordHash: hashedPassword,
      role: UserRole.SCHOOL_ADMIN,
      phone: '+591 70000001',
      status: Status.ACTIVE,
    },
  });

  console.log(`✅ Admin creado: ${admin.email}`);

  // Crear padre/tutor demo
  const parent = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'padre@demo.com',
      fullName: 'Juan Pérez',
      passwordHash: await bcrypt.hash('padre123', 10),
      role: UserRole.PARENT,
      phone: '+591 70000002',
      status: Status.ACTIVE,
    },
  });

  console.log(`✅ Padre creado: ${parent.email}`);

  // Crear hijo del padre
  const child = await prisma.child.create({
    data: {
      schoolId: school.id,
      parentId: parent.id,
      fullName: 'María Pérez',
      grade: '3ro Primaria',
      status: Status.ACTIVE,
    },
  });

  console.log(`✅ Hijo creado: ${child.fullName}`);

  // Crear dispositivo para el hijo
  const device = await prisma.device.create({
    data: {
      schoolId: school.id,
      childId: child.id,
      deviceId: 'DEMO-DEVICE-001',
      deviceName: 'Samsung Galaxy A13',
      platform: 'Android',
      status: Status.ACTIVE,
      lastSeen: new Date(),
    },
  });

  console.log(`✅ Dispositivo creado: ${device.deviceName}`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📝 Credenciales de prueba:');
  console.log('   Admin: admin@demo.com / admin123');
  console.log('   Padre: padre@demo.com / padre123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
