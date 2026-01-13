// /api/services/firebase.js
const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

// Exportar Firestore
const db = admin.firestore();

// Exportar funciones necesarias
module.exports = {
  db,
  getById: async (orderId) => {
    try {
      const doc = await db.collection('pedidos').doc(orderId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }
};