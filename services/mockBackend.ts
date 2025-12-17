import { Order, SongRequest, User } from '../types';

const STORAGE_KEYS = {
  USER: 'tu_cancion_user',
  ORDERS: 'tu_cancion_orders',
};

// ================= AUTH SERVICE SIMULADO =================
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

  handleRedirectResult: async (): Promise<User | null> => {
     return authService.getCurrentUser();
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

  registerWithEmail: async (email: string, password: string, name: string): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
          const user: User = { uid: 'user_new_' + Math.floor(Math.random() * 1000), email, displayName: name };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          window.dispatchEvent(new Event('storage'));
          resolve(user);
        }, 800);
      });
  },

  // Fallback para componentes antiguos
  login: async (email: string): Promise<User> => {
      return authService.loginWithEmail(email, 'pass');
  },

  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.dispatchEvent(new Event('storage'));
    return Promise.resolve();
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    const user = authService.getCurrentUser();
    callback(user);
    const listener = () => {
        callback(authService.getCurrentUser());
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  },
  
  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(STORAGE_KEYS.USER);
    return u ? JSON.parse(u) : null;
  }
};

// ================= ORDER SERVICE SIMULADO =================
export const orderService = {
  create: async (userId: string, request: SongRequest): Promise<Order> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const estimatedPrice = calculateEstimatedPrice(request.genre, request.instruments, request.package);
        const newOrder: Order = {
          id: 'ord_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId,
          status: 'pending_payment',
          request,
          price: estimatedPrice,
          depositAmount: estimatedPrice / 2,
          createdAt: Date.now(),
        };
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([...all, newOrder]));
        resolve(newOrder);
      }, 1000);
    });
  },
  
  getOrder: async (orderId: string): Promise<Order | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
        const found = all.find((o: Order) => o.id === orderId);
        resolve(found || null);
      }, 500);
    });
  },
  
  list: async (userId: string): Promise<Order[]> => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return all.filter((o: Order) => o.userId === userId).sort((a: Order, b: Order) => b.createdAt - a.createdAt);
  },

  getAll: async (): Promise<Order[]> => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return all.sort((a: Order, b: Order) => b.createdAt - a.createdAt);
  },

  updateStatus: async (orderId: string, status: Order['status'], url?: string): Promise<Order> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
            let updatedOrder = null;
            const updatedList = all.map((o: Order) => {
                if (o.id === orderId) {
                    const newOrder = { ...o, status };
                    if (status === 'preview_ready') newOrder.previewUrl = url || 'https://drive.google.com/uc?export=download&id=1MDh3WHPjFOP3ovKsz9DaeQmAyiCmF_ho&confirm=t';
                    if (status === 'completed') newOrder.finalUrl = url || 'https://drive.google.com/uc?export=download&id=1MDh3WHPjFOP3ovKsz9DaeQmAyiCmF_ho&confirm=t';
                    updatedOrder = newOrder;
                    return newOrder;
                }
                return o;
            });
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedList));
            resolve(updatedOrder!);
        }, 500);
    });
  },

  payDeposit: async (orderId: string): Promise<Order> => {
     return new Promise((resolve) => {
        setTimeout(() => {
          const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
          let updatedOrder = null;
          const updated = all.map((o: Order) => {
             if (o.id === orderId) {
                 updatedOrder = { ...o, status: 'deposit_paid' as Order['status'] };
                 return updatedOrder;
             }
             return o;
          });
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
          resolve(updatedOrder!);
        }, 1500);
     });
  },

  payFinal: async (orderId: string): Promise<Order> => {
    return new Promise((resolve) => {
       setTimeout(() => {
         const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
         let updatedOrder = null;
         const updated = all.map((o: Order) => {
            if (o.id === orderId) {
                updatedOrder = { 
                    ...o, 
                    status: 'completed' as Order['status'], 
                    finalUrl: 'https://drive.google.com/uc?export=download&id=1MDh3WHPjFOP3ovKsz9DaeQmAyiCmF_ho&confirm=t' 
                };
                return updatedOrder;
            }
            return o;
         });
         localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
         resolve(updatedOrder!);
       }, 1500);
    });
 }
};

export const calculateEstimatedPrice = (genre: string, instruments: string[], pkg: 'single' | 'duo' | 'trio' = 'single'): number => {
  if (pkg === 'duo') return 45000;
  if (pkg === 'trio') return 60000;
  return 30000;
};