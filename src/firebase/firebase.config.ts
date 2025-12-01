import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

export function initFirebase(): admin.app.App | null {
  // Si ya está inicializado, retornar la instancia existente
  if (admin.apps.length) {
    return admin.app();
  }

  // Verificar que las variables de entorno existan
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      '⚠️  Firebase no configurado: faltan variables FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY',
    );
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Reemplazar \n literal por saltos de línea reales (viene como string desde .env)
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    console.log('🔥 Firebase Admin inicializado correctamente');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    return null;
  }
}

export function getFirebaseApp(): admin.app.App | null {
  if (!firebaseApp && !admin.apps.length) {
    return initFirebase();
  }
  return firebaseApp || (admin.apps.length ? admin.app() : null);
}
