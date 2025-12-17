import { Order, SongRequest, User } from '../types';

const STORAGE_KEYS = {
  USER: 'tu_cancion_user',
  ORDERS: 'tu_cancion_orders',
};

// ================= AUTH SERVICE =================
export const authService = {
  loginWithRedirect: async (provider: string): Promise<void> => {
    const fakeUser: User = { 
        uid: 'user_' + Math.random().toString(36).substr(2, 9), 
        email: 'usuario_demo@gmail.com', 
        displayName: 'Usuario Demo' 
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fakeUser));
    window.dispatchEvent(new Event('storage'));
    return Promise.resolve(); 
  },
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = { uid: 'user_email_' + Math.floor(Math.random() * 1000), email, displayName: email.split('@')[0] };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        resolve(user);
      }, 800);
    });
  },
  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.dispatchEvent(new Event('storage'));
    return Promise.resolve();
  },
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    const user = authService.getCurrentUser();
    callback(user);
    const listener = () => callback(authService.getCurrentUser());
    window.addEventListener('storage', listener);
    const interval = setInterval(listener, 1000);
    return () => {
        window.removeEventListener('storage', listener);
        clearInterval(interval);
    };
  },
  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(STORAGE_KEYS.USER);
    return u ? JSON.parse(u) : null;
  }
};

// ================= ORDER SERVICE =================
export const orderService = {
  // CORRECCIÓN AQUÍ: Ahora acepta "songs" como array o "request" como objeto único
  create: async (userId: string, data: any): Promise<Order> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pkg = data.package || 'single';
        const price = calculateEstimatedPrice('', [], pkg);
        
        const newOrder: any = {
          id: 'ord_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId,
          status: 'pending_payment',
          package: pkg,
          // Guardamos las canciones tanto si vienen como array o como objeto único
          songs: data.songs || [data.request], 
          price: price,
          depositAmount: price / 2,
          createdAt: Date.now(),
        };
        
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([...all, newOrder]));
        resolve(newOrder);
      }, 1000);
    });
  },
  
  list: async (userId: string): Promise<Order[]> => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return all.filter((o: any) => o.userId === userId).sort((a: any, b: any) => b.createdAt - a.createdAt);
  },

  updateStatus: async (orderId: string, status: string): Promise<any> => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const updated = all.map((o: any) => o.id === orderId ? { ...o, status } : o);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return updated.find((o: any) => o.id === orderId);
  }
};

export const calculateEstimatedPrice = (_genre: string, _instruments: string[], pkg: string = 'single'): number => {
  if (pkg === 'duo') return 45000;
  if (pkg === 'trio') return 60000;
  return 30000;
};
