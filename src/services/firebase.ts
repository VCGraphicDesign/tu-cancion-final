// IMPORTANTE: Este archivo contiene la lógica REAL para conectar con Firebase.
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { User, Order, SongRequest } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDVBVueL9KhuiTBClXES1qyyq_rYaM7fzY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tu-cancion-final.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tu-cancion-final",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tu-cancion-final.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "444251950172",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:444251950172:web:308e850ae2a4b1c0f6ea99",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KDC5JPLGFR"
};


const googleProvider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// setPersistence(auth, browserLocalPersistence);  // ELIMINAR ESTA LÍNEA
export const db = getFirestore(app);
export const storage = getStorage(app);
export const authService = {
  loginGoogle: async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    return mapUser(result.user);
  },
  
  registerWithEmail: async (email: string, password: string, name: string): Promise<User> => {
    console.log("Intentando registrar:", email);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registro exitoso:", result.user.uid);
      await updateProfile(result.user, { displayName: name });
      return mapUser(result.user);
    } catch (error: any) {
      console.error("Error en registro:", error.code, error.message);
      throw error;
    }
  },
  
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return mapUser(result.user);
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
  create: async (userId: string, request: Partial<SongRequest> & { package: 'single' | 'duo' | 'trio'; customerEmail?: string; customerName?: string; songsData?: any[] }): Promise<Order> => {
    const estimatedPrice = 30000; 
    const newOrderData = {
      userId,
      customerEmail: request.customerEmail,
      customerName: request.customerName,
      status: 'pending_payment',
      package: request.package,
      songsData: request.songsData || [],
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
    if (url) {
      if (status === 'preview_ready') {
        updateData.previewUrl = url;
      } else if (status === 'completed') {
        updateData.finalUrl = url;
      }
    }
    await updateDoc(orderRef, updateData);
    const updated = await getDoc(orderRef);
    return { id: updated.id, ...updated.data() } as Order;
  },

  uploadAudioFile: async (file: File, orderId: string, type: 'preview' | 'final'): Promise<string> => {
    const fileName = `${orderId}_${type}_${Date.now()}`;
    const storageRef = ref(storage, `audio/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    return downloadUrl;
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