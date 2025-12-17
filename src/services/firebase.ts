// IMPORTANTE: Este archivo contiene la lógica REAL para conectar con Firebase.
// Está COMENTADO para que la app compile y funcione en modo "Demo" (GitHub) sin dependencias externas.
// Para pasar a producción:
// 1. npm install firebase
// 2. Descomenta el código.
// 3. Agrega tus credenciales en firebaseConfig.

/* ================= DESCOMENTAR PARA PRODUCCIÓN =================

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
  updateDoc,
  getDoc
} from "firebase/firestore";
import { User, Order, SongRequest } from '../types';

const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const authService = {
  loginGoogle: async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    return mapUser(result.user);
  },
  loginWithRedirect: async (): Promise<void> => {
    await signInWithPopup(auth, googleProvider);
  },
  loginWithEmail: async (email: string, password: string): Promise<User> => {
     throw new Error("Implementar login real");
  },
  logout: async () => {
    await signOut(auth);
  },
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? mapUser(firebaseUser) : null);
    });
  },
  getCurrentUser: (): User | null => {
    const u = auth.currentUser;
    return u ? mapUser(u) : null;
  }
};

export const orderService = {
  create: async (userId: string, request: SongRequest): Promise<Order> => {
    const estimatedPrice = 30000; 
    const newOrderData = {
      userId,
      status: 'pending_payment',
      request,
      price: estimatedPrice,
      depositAmount: estimatedPrice / 2,
      createdAt: Date.now(),
    };
    const docRef = await addDoc(collection(db, "orders"), newOrderData);
    return { id: docRef.id, ...newOrderData } as Order;
  },
  list: async (userId: string): Promise<Order[]> => {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => orders.push({ id: doc.id, ...doc.data() } as Order));
    return orders;
  },
  getOrder: async (orderId: string): Promise<Order | null> => {
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Order : null;
  },
  payDeposit: async (orderId: string): Promise<Order> => {
     const orderRef = doc(db, "orders", orderId);
     await updateDoc(orderRef, { status: "deposit_paid" });
     const updated = await getDoc(orderRef);
     return { id: updated.id, ...updated.data() } as Order;
  },
  payFinal: async (orderId: string): Promise<Order> => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: "completed" });
    const updated = await getDoc(orderRef);
    return { id: updated.id, ...updated.data() } as Order;
  },
  getAll: async (): Promise<Order[]> => { return []; },
  updateStatus: async (id: string, status: any, url?: string) => { return {} as Order; }
};

const mapUser = (fbUser: FirebaseUser): User => {
  return {
    uid: fbUser.uid,
    email: fbUser.email || "",
    displayName: fbUser.displayName || fbUser.email?.split('@')[0]
  };
};

export const calculateEstimatedPrice = (genre: string, instruments: string[], pkg: string): number => {
  return 30000;
};

================= FIN BLOQUE COMENTADO ================= */

// Export ficticio para que TypeScript no marque error de módulo vacío
export const firebaseInfo = "Plantilla de Firebase (Desactivada para GitHub)";