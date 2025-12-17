
import { Order, SongRequest, User } from '../types';

// Simple in-memory mock storage (persisted to localStorage for demo)
const STORAGE_KEYS = {
  USER: 'tu_cancion_user',
  ORDERS: 'tu_cancion_orders',
};

export const mockAuth = {
  login: async (email: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = { uid: 'user_' + Math.random().toString(36).substr(2, 9), email, displayName: email.split('@')[0] };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        resolve(user);
      }, 800);
    });
  },
  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(STORAGE_KEYS.USER);
    return u ? JSON.parse(u) : null;
  }
};

export const mockOrders = {
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
        
        const existing = mockOrders.list(userId);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([...existing, newOrder]));
        resolve(newOrder);
      }, 1000);
    });
  },
  
  // Get a single order by ID (needed for direct payment links)
  getOrder: async (orderId: string): Promise<Order | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
        const found = all.find((o: Order) => o.id === orderId);
        resolve(found || null);
      }, 500);
    });
  },
  
  list: (userId: string): Order[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return all.filter((o: Order) => o.userId === userId).sort((a: Order, b: Order) => b.createdAt - a.createdAt);
  },

  // Admin: List ALL orders
  getAll: (): Order[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return all.sort((a: Order, b: Order) => b.createdAt - a.createdAt);
  },

  // Admin: Update status and URLs
  updateStatus: async (orderId: string, status: Order['status'], url?: string): Promise<Order> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
            const updated = all.map((o: Order) => {
                if (o.id === orderId) {
                    const newOrder = { ...o, status };
                    // Auto-fill mock URLs if not provided
                    if (status === 'preview_ready') {
                        newOrder.previewUrl = url || 'https://drive.google.com/uc?export=download&id=1MDh3WHPjFOP3ovKsz9DaeQmAyiCmF_ho&confirm=t';
                    }
                    if (status === 'completed') {
                        newOrder.finalUrl = url || 'https://drive.google.com/uc?export=download&id=1MDh3WHPjFOP3ovKsz9DaeQmAyiCmF_ho&confirm=t';
                    }
                    return newOrder;
                }
                return o;
            });
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
            resolve(updated.find((o: Order) => o.id === orderId));
        }, 500);
    });
  },

  payDeposit: async (orderId: string): Promise<Order> => {
     return new Promise((resolve) => {
        setTimeout(() => {
          const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
          const updated = all.map((o: Order) => {
             if (o.id === orderId) return { ...o, status: 'deposit_paid' };
             return o;
          });
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
          resolve(updated.find((o: Order) => o.id === orderId));
        }, 1500);
     });
  },

  // Pay final balance and unlock the song
  payFinal: async (orderId: string): Promise<Order> => {
    return new Promise((resolve) => {
       setTimeout(() => {
         const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
         const updated = all.map((o: Order) => {
            if (o.id === orderId) {
                return { 
                    ...o, 
                    status: 'completed', 
                    finalUrl: 'https://drive.google.com/uc?export=download&id=1MDh3WHPjFOP3ovKsz9DaeQmAyiCmF_ho&confirm=t' // Demo final file
                };
            }
            return o;
         });
         localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
         resolve(updated.find((o: Order) => o.id === orderId));
       }, 1500);
    });
 }
};

export const calculateEstimatedPrice = (genre: string, instruments: string[], pkg: 'single' | 'duo' | 'trio' = 'single'): number => {
  // STRICT PROMOTION PRICING (CLP)
  // We have removed extra costs for 'Classical' genre or extra instruments
  // to ensure the final price matches the promotional banner exactly.
  
  if (pkg === 'duo') {
    // Pack 2 Songs
    return 45000;
  } 
  
  if (pkg === 'trio') {
    // Pack 3 Songs
    return 60000;
  }

  // Default Single Song
  return 30000;
};
