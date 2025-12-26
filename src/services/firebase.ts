// IMPORTANTE: Este archivo contiene la lógica REAL para conectar con Firebase.
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserSessionPersistence
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
  apiKey: "AIzaSyDVBVueL9KhuiTBClXES1qyyq_rYaM7fzY",
  authDomain: "tu-cancion-final.firebaseapp.com",
  projectId: "tu-cancion-final",
  storageBucket: "tu-cancion-final.firebasestorage.app",
  messagingSenderId: "444251950172",
  appId: "1:444251950172:web:308e850ae2a4b1c0f6ea99",
  measurementId: "G-KDC5JPLGFR"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Configurar persistencia: solo sesión actual
setPersistence(auth, browserSessionPersistence);
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
  getAll: async (): Promise<Order[]> => {
    const querySnapshot = await getDocs(collection(db, "orders"));
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => orders.push({ id: doc.id, ...doc.data() } as Order));
    return orders;
  },
  updateStatus: async (id: string, status: any, url?: string) => {
    const orderRef = doc(db, "orders", id);
    const updateData: any = { status };
    if (url) updateData.finalUrl = url;
    await updateDoc(orderRef, updateData);
    const updated = await getDoc(orderRef);
    return { id: updated.id, ...updated.data() } as Order;
  }
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

export const firebaseInfo = "Conexión Real de Firebase Activa";