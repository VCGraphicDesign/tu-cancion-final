import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  CreditCard,
  ExternalLink,
  AlertCircle,
  Upload,
  FileText,
  X,
  Music2
} from 'lucide-react';
import { User, Order } from '../types';
import { storage, db } from '../services/firebase';
import { orderService } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface FinalPaymentProps {
  user: User | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const FinalPayment: React.FC<FinalPaymentProps> = ({ user }) => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!orderId) {
      setOrderError('Enlace de pago inválido.');
      setLoadingOrder(false);
      return;
    }
    orderService.getOrder(orderId).then((o) => {
      if (!o) {
        setOrderError('No se encontró el pedido asociado a este enlace.');
      } else if (o.status === 'completed') {
        setOrderError('Este pedido ya está completamente pagado.');
      } else if (o.status === 'pending_payment') {
        setOrderError('El anticipo de este pedido aún no ha sido confirmado.');
      } else {
        setOrder(o);
      }
      setLoadingOrder(false);
    }).catch(() => {
      setOrderError('Error al cargar el pedido. Por favor intenta nuevamente.');
      setLoadingOrder(false);
    });
  }, [orderId]);

  const remainingAmount = order ? order.price - order.depositAmount : 0;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('El archivo excede el tamaño máximo permitido de 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isImage && !isPdf) {
      setErrorMessage('Formato no válido. Solo se aceptan imágenes (JPG, PNG, WebP) o documentos PDF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePayment = async () => {
    setErrorMessage(null);
    if (!user || !user.uid) {
      setErrorMessage('Debes iniciar sesión para registrar tu comprobante de pago.');
      return;
    }
    if (!orderId || !order) {
      setErrorMessage('No se encontró el identificador del pedido.');
      return;
    }
    if (!selectedFile) {
      setErrorMessage('Por favor, adjunta el comprobante de transferencia bancaria antes de enviar.');
      return;
    }
    setIsProcessing(true);
    try {
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `receipts-final/${user.uid}/${orderId}/${sanitizedFileName}`;
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        finalReceiptUrl: downloadUrl,
        finalReceiptFileName: selectedFile.name,
        finalReceiptUploadedAt: serverTimestamp(),
        status: 'completed'
      });

      try {
        await fetch('https://tucancion.app/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });
      } catch (emailError) {
        console.error('Error al enviar notificación por correo:', emailError);
      }

      setIsProcessing(false);
      setIsSuccess(true);
    } catch (uploadError: any) {
      console.error('Error al procesar el comprobante:', uploadError);
      setIsProcessing(false);
      setErrorMessage(uploadError?.message || 'Ocurrió un error al subir el comprobante. Por favor, intenta nuevamente.');
    }
  };

  if (loadingOrder) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (orderError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Enlace no válido</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">{orderError}</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all">
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">¡Pago Final Enviado!</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            Hemos recibido tu comprobante de pago final.<br />
            Verificaremos la transferencia y te notificaremos cuando tu pedido esté completamente finalizado.
          </p>
          <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all">
            Ir a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 flex items-center justify-center">
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full">

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Music2 size={28} className="text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Pago Final</h2>
          <p className="text-gray-400 text-sm mt-1">Saldo pendiente de tu pedido</p>
        </div>

        {/* RESUMEN */}
        <div className="mb-6 p-4 bg-[#141414] border border-white/10 rounded-2xl text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Precio total</span>
            <span className="text-white font-semibold">{formatMoney(order!.price)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Anticipo pagado</span>
            <span className="text-green-400 font-semibold">− {formatMoney(order!.depositAmount)}</span>
          </div>
          <div className="border-t border-white/10 mt-3 pt-3 flex justify-between items-center">
            <span className="text-white font-bold">Saldo pendiente</span>
            <span className="text-orange-400 text-xl font-bold">{formatMoney(remainingAmount)}</span>
          </div>
        </div>

        {/* AVISO */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>IMPORTANTE</span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            Realiza la transferencia por el saldo pendiente y luego adjunta el comprobante. Guarda el comprobante antes de cerrar tu aplicación bancaria.
          </p>
        </div>

        {/* DATOS BANCARIOS */}
        <div className="mb-6 p-5 bg-[#141414] border border-white/10 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-orange-500" />
            Datos para la transferencia
          </h3>
          <div className="space-y-2.5 text-sm">
            {[
              ['Titular', 'Viviana Castillo Letelier'],
              ['RUT', '13.052.799-k'],
              ['Banco', 'Banco Estado'],
              ['Tipo de cuenta', 'Cuenta Corriente'],
              ['Número de cuenta', '00006425712'],
              ['Correo', 'contacto@tucancion.app']
            ].map(([label, value], i, arr) => (
              <div key={label} className={`flex justify-between items-center py-1 ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                <span className="text-gray-400">{label}</span>
                <span className={`font-semibold text-white ${label === 'Número de cuenta' ? 'font-mono' : ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MÉTODO */}
        <div className="mb-6">
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-white bg-white/5 cursor-default">
            <ExternalLink size={24} className="text-white" />
            <span className="font-bold text-white">Transferencia Directa</span>
            <div className="ml-auto"><CheckCircle2 size={20} className="text-white" /></div>
          </button>
        </div>

        {/* COMPROBANTE */}
        <div className="mb-6 p-5 bg-[#141414] border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload size={18} className="text-orange-500" />
              Adjuntar comprobante de pago
            </h3>
            <span className="text-[11px] text-orange-400 font-semibold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">Requerido</span>
          </div>
          <p className="text-gray-400 text-xs mb-3">Formatos aceptados: Imágenes (JPG, PNG, WebP) o documentos PDF (máx. 10 MB).</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" id="final-receipt-input" disabled={isProcessing} />
          {!selectedFile ? (
            <label htmlFor="final-receipt-input" className={`border-2 border-dashed border-white/20 hover:border-orange-500/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.04] group ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload size={20} className="text-gray-400 group-hover:text-orange-400 transition-colors" />
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">Seleccionar comprobante</span>
              <span className="text-xs text-gray-500 mt-1">Haz clic para buscar tu archivo</span>
            </label>
          ) : (
            <div className="bg-white/5 border border-white/15 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0"><FileText size={18} /></div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate max-w-[200px]" title={selectedFile.name}>{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button type="button" onClick={handleRemoveFile} disabled={isProcessing} className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"><X size={18} /></button>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-red-400 text-xs text-left">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={isProcessing || !selectedFile}
          className={`w-full py-4 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${isProcessing || !selectedFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-[0.99]'}`}
        >
          {isProcessing ? (
            <><Loader2 className="animate-spin" size={20} /><span>Subiendo comprobante...</span></>
          ) : (
            <><Upload size={18} /><span>Enviar comprobante de pago final</span></>
          )}
        </button>
      </div>
    </div>
  );
};

export default FinalPayment;
