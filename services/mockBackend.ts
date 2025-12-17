// src/services/mockBackend.ts

export const calculateEstimatedPrice = (genre: string, instruments: any[], packageName: string) => {
  if (packageName === 'trio') return 60000;
  if (packageName === 'duo') return 45000;
  return 30000;
};

export const authService = {
  onAuthStateChanged: (callback: (user: any) => void) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    callback(user);
    return () => {};
  },
  logout: () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  }
};

export const saveOrder = (orderData: any) => {
  try {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      ...orderData,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      status: 'pending'
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return newOrder;
  } catch (e) {
    console.error("Error saving order", e);
    return null;
  }
};
