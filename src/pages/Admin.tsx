import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Music, 
  Play, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Upload, 
  User, 
  Filter, 
  Search, 
  Link as LinkIcon,
  Mail,
  Eye,
  Send,
  Check,
  AlertCircle,
  Copy,
  X,
  Loader2
} from 'lucide-react';
import { orderService } from '../services/firebase';
import { Order, User as UserType } from '../types';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface AdminProps {
  user: UserType | null;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<{[key: string]: any}>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);

  // Función para obtener datos del usuario por su ID
  const getUserDetails = async (userId: string) => {
    if (userDetails[userId]) {
      return userDetails[userId];
    }
    
    try {
      const auth = getAuth();
      // Por ahora mostramos el ID, ya que obtener datos de Firebase Auth requiere más configuración
      const userInfo = {
        email: 'cliente@ejemplo.com', // Placeholder hasta configurar búsqueda real
        displayName: 'Cliente' // Placeholder hasta configurar búsqueda real
      };
      
      setUserDetails(prev => ({ ...prev, [userId]: userInfo }));
      return userInfo;
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return { email: 'No disponible', displayName: 'No disponible' };
    }
  };

  useEffect(() => {
    // Si no hay usuario, redirigir a auth
    if (user === null) {
      navigate('/auth');
      return;
    }

    // Si hay usuario pero NO es admin, redirigir a inicio
    if (user && user.email !== 'admin@tucancion.app') {
      navigate('/');
      return;
    }

    // Si es admin, cargar datos
    if (user && user.email === 'admin@tucancion.app') {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(data);
        setOrders(data);
    } catch (e) {
      console.error("Error loading admin data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    let url = undefined;

    if (newStatus === 'preview_ready') {
      // Crear input para seleccionar archivo de audio
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        try {
          // Subir archivo a Firebase Storage
          url = await orderService.uploadAudioFile(file, orderId, 'preview');
          
          if(!window.confirm(`¿Confirmar cambio de estado a: ${newStatus}?`)) return;
          
          setProcessingId(orderId);
          await orderService.updateStatus(orderId, newStatus, url);
          loadData();
        } catch(error) {
          console.error("Error subiendo el archivo de audio:", error);
          setActionError("Error subiendo el archivo de audio");
        } finally {
          setProcessingId(null);
        }
      };
      input.click();
      return; // Salir temprano para esperar la selección de archivo
    }

    if (newStatus === 'completed') {
      const input = window.prompt("Ingresa el enlace de descarga de la CANCIÓN FINAL:");
      if (!input) return;
      url = input;
    }

    if(!window.confirm(`¿Confirmar cambio de estado a: ${newStatus}?`)) return;
    
    setProcessingId(orderId);
    try {
        await orderService.updateStatus(orderId, newStatus, url);
        loadData();
    } catch(e) {
        console.error("Error actualizando estado:", e);
        setActionError("Error actualizando pedido");
    } finally {
        setProcessingId(null);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const generateFinalLink = async (order: Order) => {
    const url = `${window.location.origin}/final/${order.id}`;
    try {
      // Guardar enlace en Firestore para recuperarlo después
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, { finalPaymentUrl: url });
      // Actualizar estado local
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, finalPaymentUrl: url } : o));
    } catch (e) {
      console.error('Error guardando enlace:', e);
    }
    return url;
  };

  const copyFinalLink = async (order: Order) => {
    let url = order.finalPaymentUrl;
    if (!url) {
      url = await generateFinalLink(order);
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(order.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      console.error('Error copiando al portapapeles:', e);
    }
  };

  const sendFinalPaymentEmail = async (order: Order) => {
    let finalUrl = order.finalPaymentUrl;
    if (!finalUrl) {
      finalUrl = await generateFinalLink(order);
    }

    if (!order.customerEmail) {
      setSendErrorMessage('Este pedido no tiene un correo de cliente (customerEmail) asociado.');
      return;
    }

    setSendingId(order.id);
    setSendErrorMessage(null);
    setSendSuccessMessage(null);

    const endpoints = window.location.origin.includes('localhost')
      ? ['https://tucancion.app/api/send-final-payment-email', '/api/send-final-payment-email']
      : ['/api/send-final-payment-email', 'https://tucancion.app/api/send-final-payment-email'];

    let sent = false;
    let resultData: any = null;
    let lastError: any = null;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            finalPaymentUrl: finalUrl
          })
        });

        const resJson = await response.json().catch(() => ({}));
        if (response.ok && resJson.success) {
          sent = true;
          resultData = resJson.data;
          break;
        } else {
          lastError = new Error(resJson.error || `Error del servidor (${response.status})`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (sent) {
      const now = resultData?.sentAt || Date.now();
      const count = resultData?.sentCount || ((order.finalPaymentLinkSentCount || 0) + 1);
      const sentTo = resultData?.sentTo || order.customerEmail;

      // Actualizar estado local de la lista
      setOrders(prev => prev.map(o => o.id === order.id ? {
        ...o,
        finalPaymentUrl: finalUrl,
        finalPaymentLinkSentAt: now,
        finalPaymentLinkSentTo: sentTo,
        finalPaymentLinkSentCount: count,
      } : o));

      // Actualizar preview si está abierto
      setPreviewOrder(prev => (prev && prev.id === order.id) ? {
        ...prev,
        finalPaymentUrl: finalUrl,
        finalPaymentLinkSentAt: now,
        finalPaymentLinkSentTo: sentTo,
        finalPaymentLinkSentCount: count,
      } : prev);

      setSendSuccessMessage(`¡Enlace enviado con éxito a ${sentTo}!`);
    } else {
      console.error('Error enviando email de pago final:', lastError);
      setSendErrorMessage(lastError?.message || 'Error al conectar con el servicio de correo.');
    }

    setSendingId(null);
  };

  const filteredOrders = orders.filter(o => {
      if (filter === 'all') return true;
      return o.status === filter;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'pending_payment': return <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">Pendiente Pago</span>;
        case 'deposit_paid': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">Por Producir</span>;
        case 'in_progress': return <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-bold border border-purple-500/20">En Progreso</span>;
        case 'preview_ready': return <span className="bg-accent/20 text-accent px-2 py-1 rounded text-xs font-bold border border-accent/20">Avance Listo</span>;
        case 'completed': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/20">Completado</span>;
        default: return null;
    }
  };

  // Mostrar loading mientras verifica usuario
  if (user === null || loading) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no es admin, no mostrar nada (ya redirigió)
  if (user.email !== 'admin@tucancion.app') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4 pb-32">
        <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                        <LayoutDashboard className="text-accent" /> Panel de Producción
                    </h2>
                    <p className="text-gray-400 mt-1">Gestiona pedidos, produce canciones y entrega archivos.</p>
                </div>
                <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-white/10 overflow-x-auto max-w-full">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Todos</button>
                    <button onClick={() => setFilter('deposit_paid')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'deposit_paid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Por Producir</button>
                    <button onClick={() => setFilter('preview_ready')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'preview_ready' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>En Aprobación</button>
                    <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'completed' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Completados</button>
                </div>
            </div>

            {actionError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm flex justify-between items-center">
                <span>{actionError}</span>
                <button onClick={() => setActionError(null)} className="text-red-300 hover:text-white text-xs font-bold uppercase">Cerrar</button>
              </div>
            )}

            <div className="grid gap-6">
                {filteredOrders.length === 0 ? (
                     <div className="bg-surface border border-white/10 rounded-2xl p-12 text-center text-gray-500">
                        No hay pedidos en esta categoría.
                     </div>
                ) : filteredOrders.map((order) => (
                    <div key={order.id} className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors shadow-lg group">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-grow space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><span className="bg-white/10 text-xs px-2 py-1 rounded text-gray-300 font-mono">#{order.id.slice(0, 8)}</span><StatusBadge status={order.status} /></div>
                                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Pedido de Canción</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm bg-bgDark/50 p-4 rounded-xl border border-white/5">
                                    <div><p className="text-gray-500 text-xs uppercase mb-1">Nombre Cliente</p><p className="font-semibold">{order.customerName || 'No especificado'}</p></div>
                                    <div><p className="text-gray-500 text-xs uppercase mb-1">Email Cliente</p><p className="text-sm">{order.customerEmail || 'No especificado'}</p></div>
                                    <div><p className="text-gray-500 text-xs uppercase mb-1">ID Cliente</p><p className="font-mono text-xs">{order.userId}</p></div>
                                    <div><p className="text-gray-500 text-xs uppercase mb-1">Género</p><p>{order.songsData && order.songsData.length > 0 ? order.songsData[0]?.genre : 'No especificado'}</p></div>
                                    <div><p className="text-gray-500 text-xs uppercase mb-1">Ánimo</p><p>{order.songsData && order.songsData.length > 0 ? order.songsData[0]?.mood : 'No especificado'}</p></div>
                                    <div><p className="text-gray-500 text-xs uppercase mb-1">Ocasión</p><p>{order.songsData && order.songsData.length > 0 ? order.songsData[0]?.occasion : 'No especificado'}</p></div>
                                    <div><p className="text-gray-500 text-xs uppercase mb-1">Cantante</p><p>{order.songsData && order.songsData.length > 0 ? order.songsData[0]?.singer : 'No especificado'}</p></div>
                                    <div><p className="text-gray-500 text-xs uppercase mb-1">Instrumentos</p><p>{order.songsData && order.songsData.length > 0 && order.songsData[0]?.instruments && order.songsData[0].instruments.length > 0 ? order.songsData[0].instruments.join(', ') : 'No especificados'}</p></div>
                                    <div className="md:col-span-2"><p className="text-gray-500 text-xs uppercase mb-1">Historia</p><p className="italic" style={{overflowWrap:"break-word",wordBreak:"break-all",minWidth:0}}>"{order.songsData && order.songsData.length > 0 ? order.songsData[0]?.story : 'No especificada'}"</p></div>
                                    {(order.previewUrl || order.finalUrl) && <div className="md:col-span-2 border-t border-white/5 pt-2"><p className="text-xs text-gray-500">Links: {order.previewUrl && <a href={order.previewUrl} target="_blank" className="text-accent underline mr-2">Avance</a>} {order.finalUrl && <a href={order.finalUrl} target="_blank" className="text-primary underline">Final</a>}</p></div>}
                                </div>
                            </div>
                            <div className="lg:w-64 flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
                                <div className="text-center mb-2"><span className="block text-2xl font-bold text-white">{formatMoney(order.price)}</span></div>
                                {order.status === 'pending_payment' && <button onClick={() => handleStatusUpdate(order.id, 'deposit_paid')} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"><CheckCircle size={16} className="inline mr-1"/> Pago Recibido</button>}
                                {order.status === 'deposit_paid' && <button onClick={() => handleStatusUpdate(order.id, 'in_progress')} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"><Clock size={16} className="inline mr-1"/> En Proceso</button>}
                                {order.status === 'in_progress' && <button onClick={() => handleStatusUpdate(order.id, 'preview_ready')} className="w-full py-2 bg-accent text-bgDark font-bold rounded-lg"><Upload size={16} className="inline mr-1"/> Subir Avance</button>}
                                {order.status === 'preview_ready' && <button onClick={() => handleStatusUpdate(order.id, 'completed')} className="w-full py-2 bg-primary hover:bg-primaryDark text-white font-bold rounded-lg"><CheckCircle size={16} className="inline mr-1"/> Completado</button>}

                                {/* LINK DE PAGO FINAL — visible para pedidos con saldo pendiente */}
                                {order.status !== 'pending_payment' && order.status !== 'completed' && (
                                  <div className="mt-1 border-t border-white/10 pt-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-[11px] text-accent uppercase font-bold tracking-wider flex items-center gap-1.5">
                                        <LinkIcon size={12} /> Link de pago final
                                      </p>
                                      {order.finalPaymentLinkSentAt && (
                                        <span className="text-[10px] text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                          Enviado {order.finalPaymentLinkSentCount && order.finalPaymentLinkSentCount > 1 ? `(${order.finalPaymentLinkSentCount}x)` : ''}
                                        </span>
                                      )}
                                    </div>

                                    {order.finalPaymentUrl ? (
                                      <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400 font-mono bg-white/5 rounded-lg px-2 py-1.5 truncate select-all border border-white/5" title={order.finalPaymentUrl}>
                                          {order.finalPaymentUrl}
                                        </p>

                                        {order.finalPaymentLinkSentAt && (
                                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Mail size={11} className="text-accent flex-shrink-0" />
                                            <span className="truncate">
                                              Enviado a <strong className="text-gray-200">{order.finalPaymentLinkSentTo || order.customerEmail}</strong> el {new Date(order.finalPaymentLinkSentAt).toLocaleDateString()}
                                            </span>
                                          </p>
                                        )}

                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                          <button
                                            onClick={() => copyFinalLink(order)}
                                            className={`py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                              copiedId === order.id
                                                ? 'bg-green-600 text-white'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                            title="Copiar enlace al portapapeles"
                                          >
                                            {copiedId === order.id ? <Check size={13} /> : <Copy size={13} />}
                                            {copiedId === order.id ? '¡Copiado!' : 'Copiar'}
                                          </button>

                                          <button
                                            onClick={() => {
                                              setPreviewOrder(order);
                                              setSendErrorMessage(null);
                                              setSendSuccessMessage(null);
                                            }}
                                            className="py-2 px-2 text-xs font-bold rounded-lg bg-accent text-bgDark hover:bg-orange-400 transition-all flex items-center justify-center gap-1.5 shadow-md"
                                            title="Revisar vista previa y enviar al cliente"
                                          >
                                            <Eye size={13} />
                                            {order.finalPaymentLinkSentAt ? 'Reenviar' : 'Revisar / Enviar'}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <button
                                          onClick={async () => {
                                            await generateFinalLink(order);
                                          }}
                                          className="w-full py-2 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 transition-all"
                                        >
                                          <LinkIcon size={13} />
                                          Generar enlace
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* MODAL VISTA PREVIA Y ENVÍO DE LINK DE PAGO FINAL */}
        {previewOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#181818] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Mail className="text-accent" size={20} /> Vista Previa - Link de Pago Final
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Revisa los datos del cliente y el contenido del correo antes de enviarlo.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPreviewOrder(null);
                    setSendSuccessMessage(null);
                    setSendErrorMessage(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-5 flex-grow text-sm">
                {/* Notificaciones */}
                {sendSuccessMessage && (
                  <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-xl text-green-300 text-sm flex items-center gap-2.5">
                    <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                    <span className="font-semibold">{sendSuccessMessage}</span>
                  </div>
                )}
                {sendErrorMessage && (
                  <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm flex items-center gap-2.5">
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                    <span>{sendErrorMessage}</span>
                  </div>
                )}

                {/* Ficha Resumen */}
                <div className="bg-bgDark/60 p-4 rounded-xl border border-white/5 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Nombre del Cliente:</span>
                      <strong className="text-white text-sm">{previewOrder.customerName || 'No especificado (se usará "Cliente")'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Correo Destinatario:</span>
                      <strong className="text-accent text-sm font-mono">{previewOrder.customerEmail || '⚠ Sin correo registrado'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Monto Total Pedido:</span>
                      <span className="text-gray-200 font-semibold">{formatMoney(previewOrder.price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Saldo Pendiente Final:</span>
                      <strong className="text-primary text-base font-bold">{formatMoney(previewOrder.price - previewOrder.depositAmount)}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <span className="text-gray-400 text-xs block mb-1">Enlace de Pago Final:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={previewOrder.finalPaymentUrl || `${window.location.origin}/final/${previewOrder.id}`}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-300 select-all"
                      />
                      <button
                        onClick={() => copyFinalLink(previewOrder)}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors"
                        title="Copiar enlace"
                      >
                        {copiedId === previewOrder.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        {copiedId === previewOrder.id ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  {previewOrder.finalPaymentLinkSentAt && (
                    <div className="pt-2 text-xs text-green-400 flex items-center gap-1.5">
                      <CheckCircle size={14} />
                      <span>
                        Enviado previamente a <strong>{previewOrder.finalPaymentLinkSentTo || previewOrder.customerEmail}</strong> el {new Date(previewOrder.finalPaymentLinkSentAt).toLocaleDateString()} a las {new Date(previewOrder.finalPaymentLinkSentAt).toLocaleTimeString()} ({previewOrder.finalPaymentLinkSentCount || 1} {previewOrder.finalPaymentLinkSentCount === 1 ? 'vez' : 'veces'}).
                      </span>
                    </div>
                  )}
                </div>

                {/* Vista Previa del Correo que recibirá el cliente */}
                <div>
                  <p className="text-xs uppercase font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                    <Eye size={13} className="text-accent" /> Contenido del correo que recibirá el cliente:
                  </p>

                  <div className="border border-white/10 rounded-xl overflow-hidden bg-white text-gray-800 shadow-md">
                    {/* Encabezado correo */}
                    <div className="bg-[#00695C] text-white p-4 text-center">
                      <span className="text-2xl block mb-1">🎵</span>
                      <h4 className="font-bold text-base m-0 tracking-wide">Tu Canción</h4>
                      <p className="text-xs opacity-90 m-0 mt-0.5">¡Tu canción está lista para su entrega final!</p>
                    </div>

                    {/* Cuerpo correo */}
                    <div className="p-5 space-y-4 text-xs sm:text-sm">
                      <p className="text-base font-bold text-gray-900 m-0">
                        ¡Hola {previewOrder.customerName || 'Cliente'}! 🎉
                      </p>
                      <p className="text-gray-600 leading-relaxed m-0">
                        Nos alegra informarte que el trabajo de producción de tu canción personalizada ha avanzado con éxito y nos encontramos en la etapa de entrega definitiva.
                      </p>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between text-gray-500 text-xs">
                          <span>Pedido N°:</span>
                          <strong className="font-mono text-gray-700">#{previewOrder.id.slice(0, 8)}</strong>
                        </div>
                        <div className="flex justify-between text-gray-500 text-xs">
                          <span>Inversión Total:</span>
                          <span>{formatMoney(previewOrder.price)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-xs">
                          <span>Anticipo Pagado:</span>
                          <span className="text-green-600">-{formatMoney(previewOrder.depositAmount)}</span>
                        </div>
                        <div className="border-t border-dashed border-gray-300 pt-2 mt-2 flex justify-between items-baseline font-bold">
                          <span className="text-gray-900">Saldo Final a Pagar:</span>
                          <span className="text-[#00695C] text-lg">{formatMoney(previewOrder.price - previewOrder.depositAmount)}</span>
                        </div>
                      </div>

                      <div className="text-center py-2">
                        <span className="inline-block bg-[#00695C] text-white font-bold py-3 px-8 rounded-full shadow text-xs uppercase tracking-wider">
                          Ir a Pagar Saldo Pendiente
                        </span>
                      </div>

                      <p className="text-center text-[11px] text-gray-500 font-mono break-all m-0">
                        {previewOrder.finalPaymentUrl || `${window.location.origin}/final/${previewOrder.id}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / Acciones */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => copyFinalLink(previewOrder)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedId === previewOrder.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copiedId === previewOrder.id ? 'Enlace copiado' : 'Copiar enlace'}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewOrder(null);
                      setSendSuccessMessage(null);
                      setSendErrorMessage(null);
                    }}
                    className="w-1/2 sm:w-auto px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => sendFinalPaymentEmail(previewOrder)}
                    disabled={sendingId === previewOrder.id || !previewOrder.customerEmail}
                    className={`w-1/2 sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                      sendingId === previewOrder.id || !previewOrder.customerEmail
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-primary hover:bg-primaryDark text-white'
                    }`}
                  >
                    {sendingId === previewOrder.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        {previewOrder.finalPaymentLinkSentAt ? 'Reenviar al cliente' : 'Enviar al cliente'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
export default Admin;