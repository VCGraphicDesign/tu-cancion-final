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
    const estimatedPrice = calculateEstimatedPrice(request.genre, request.instruments, request.package);
    
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

  // Obtener una orden por ID
  getOrder: async (orderId: string): Promise<Order | null> => {
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  },

  // Admin: Listar TODAS las órdenes
  getAll: async (): Promise<Order[]> => {
    const querySnapshot = await getDocs(collection(db, "orders"));
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  },

  // Admin: Actualizar estado y URLs
  updateStatus: async (orderId: string, status: Order['status'], url?: string): Promise<Order> => {
    const orderRef = doc(db, "orders", orderId);
    const data: any = { status };
    if (url) {
        if (status === 'preview_ready') data.previewUrl = url;
        if (status === 'completed') data.finalUrl = url;
    }
    await updateDoc(orderRef, data);
    const updated = await getDoc(orderRef);
    return { id: updated.id, ...updated.data() } as Order;
  },

  // Actualizar estado a pagado (depósito)
  payDeposit: async (orderId: string): Promise<Order> => {
     const orderRef = doc(db, "orders", orderId);
     await updateDoc(orderRef, {
       status: "deposit_paid"
     });
     const updated = await getDoc(orderRef);
     return { id: updated.id, ...updated.data() } as Order;
  },

  // Pagar final
  payFinal: async (orderId: string): Promise<Order> => {
    const orderRef = doc(db, "orders", orderId);
    // URL demo por defecto
    const demoFinalUrl = "https://drive.google.com/uc?export=download&id=1MDh3WHPjFOP3ovKsz9DaeQmAyiCmF_ho&confirm=t";
    
    await updateDoc(orderRef, {
      status: "completed",
      finalUrl: demoFinalUrl
    });
    const updated = await getDoc(orderRef);
    return { id: updated.id, ...updated.data() } as Order;
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

export const calculateEstimatedPrice = (genre: string, instruments: string[], pkg: 'single' | 'duo' | 'trio' = 'single'): number => {
  if (pkg === 'duo') return 45000;
  if (pkg === 'trio') return 60000;
  return 30000;
};

export const firebaseInfo = "Servicio configurado.";