import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Order } from '../types';

export const orderService = {
  // Función para crear un pedido nuevo en Firebase
  async create(orderData: any) {
    try {
      const docRef = await addDoc(collection(db, "pedidos"), {
        ...orderData,
        createdAt: new Date().toISOString(),
        status: 'pending_payment'
      });
      return docRef.id;
    } catch (error) {
      console.error("Error al crear pedido:", error);
      throw error;
    }
  },

  // Función que el Admin necesita para ver todos los pedidos
  async getAll(): Promise<Order[]> {
    try {
      const q = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      throw error;
    }
  },

  // Función para que el Admin actualice el estado o suba links
  async updateStatus(orderId: string, status: string, url?: string) {
    try {
      const orderRef = doc(db, "pedidos", orderId);
      const updateData: any = { status };
      if (url) {
        if (status === 'preview_ready') updateData.previewUrl = url;
        if (status === 'completed') updateData.finalUrl = url;
      }
      await updateDoc(orderRef, updateData);
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      throw error;
    }
  }
};