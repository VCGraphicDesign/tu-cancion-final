
// IMPORTANTE: Este archivo contiene la lógica REAL para conectar con Firebase.
// Cuando migres a tu entorno local:
// 1. Instala firebase: npm install firebase
// 2. Descomenta todo el bloque de código de abajo.
// 3. Reemplaza 'firebaseConfig' con tus datos reales.

/* ================= DESCOMENTAR DESDE AQUÍ PARA PRODUCCIÓN =================

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { User, Order, SongRequest } from '../types';

// 1. CONFIGURACIÓN (Copia esto de tu Consola de Firebase)
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ================= SERVICIOS (ADAPTADORES) =================
// Estos servicios tienen los mismos nombres que el Mock para facilitar el reemplazo.

export const authService = {
  // Iniciar sesión con Google
  loginGoogle: async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    return mapUser(result.user);
  },

  // Iniciar sesión con Email (Simulado para mantener compatibilidad simple)
  login: async (email: string): Promise<User> => {
    // Nota: Para producción real, deberías implementar signInWithEmailAndPassword
    // y pedir contraseña en el formulario de Auth.tsx
    throw new Error("Para producción, usa loginGoogle o implementa auth con contraseña");
  },

  logout: async () => {
    await signOut(auth);
  },

  // Escuchar cambios de sesión (Observer)
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? mapUser(firebaseUser) : null);
    });
  },
  
  // Obtener usuario actual síncrono (menos fiable en Firebase, mejor usar observer)
  getCurrentUser: (): User | null => {
    const u = auth.currentUser;
    return u ? mapUser(u) : null;
  }
};

export const orderService = {
  // Crear orden en Firestore
  create: async (userId: string, request: SongRequest): Promise<Order> => {
    const estimatedPrice = 50; // Aquí podrías recalcular o confiar en el front (validar en backend es mejor)
    
    const newOrderData = {
      userId,
      status: 'pending_payment',
      request,
      price: estimatedPrice,
      depositAmount: estimatedPrice / 2,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, "orders"), newOrderData);
    
    return {
      id: docRef.id,
      ...newOrderData
    } as Order;
  },
  
  // Listar órdenes de un usuario
  list: async (userId: string): Promise<Order[]> => {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    // Ordenar por fecha (cliente) o usar orderBy en query (requiere índice)
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  },

  // Actualizar estado a pagado
  payDeposit: async (orderId: string): Promise<void> => {
     const orderRef = doc(db, "orders", orderId);
     await updateDoc(orderRef, {
       status: "deposit_paid"
     });
  }
};

// Helper para convertir usuario de Firebase a nuestro tipo User
const mapUser = (fbUser: FirebaseUser): User => {
  return {
    uid: fbUser.uid,
    email: fbUser.email || "",
    displayName: fbUser.displayName || fbUser.email?.split('@')[0]
  };
};

================= FIN BLOQUE DESCOMENTAR ================= */

// Dummy export para evitar errores ahora
export const firebaseInfo = "Configuración lista. Descomenta el código para usar.";
