"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed...');
    await prisma.alert.deleteMany();
    await prisma.childPosition.deleteMany();
    await prisma.device.deleteMany();
    await prisma.child.deleteMany();
    await prisma.user.deleteMany();
    await prisma.school.deleteMany();
    console.log('✅ Datos anteriores eliminados');
    const school = await prisma.school.create({
        data: {
            code: 'SCH-001',
            name: 'Colegio Demo San Martín',
            address: 'Calle Principal #123, Santa Cruz, Bolivia',
            phone: '+591 3 1234567',
            status: client_1.Status.ACTIVE,
        },
    });
    console.log(`✅ Escuela creada: ${school.name}`);
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            schoolId: school.id,
            email: 'admin@demo.com',
            fullName: 'Admin Demo',
            passwordHash: hashedPassword,
            role: client_1.UserRole.SCHOOL_ADMIN,
            phone: '+591 70000001',
            status: client_1.Status.ACTIVE,
        },
    });
    console.log(`✅ Admin creado: ${admin.email}`);
    const parent = await prisma.user.create({
        data: {
            schoolId: school.id,
            email: 'padre@demo.com',
            fullName: 'Juan Pérez',
            passwordHash: await bcrypt.hash('padre123', 10),
            role: client_1.UserRole.PARENT,
            phone: '+591 70000002',
            status: client_1.Status.ACTIVE,
        },
    });
    console.log(`✅ Padre creado: ${parent.email}`);
    const child = await prisma.child.create({
        data: {
            schoolId: school.id,
            parentId: parent.id,
            fullName: 'María Pérez',
            grade: '3ro Primaria',
            status: client_1.Status.ACTIVE,
        },
    });
    console.log(`✅ Hijo creado: ${child.fullName}`);
    const device = await prisma.device.create({
        data: {
            schoolId: school.id,
            childId: child.id,
            deviceId: 'DEMO-DEVICE-001',
            deviceName: 'Samsung Galaxy A13',
            platform: 'Android',
            status: client_1.Status.ACTIVE,
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
//# sourceMappingURL=seed.js.map