import React, { useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  Loader2, 
  Lock, 
  CreditCard, 
  ExternalLink,
  AlertCircle,
  Upload,
  FileText,
  X
} from 'lucide-react';
import { User } from '../types';
import { storage, db } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface PaymentGatewayProps {
  user: User | null;
}

// Límite documentado: 10 MB para comprobantes (imágenes o PDF)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId: paramOrderId } = useParams<{ orderId?: string }>();
  
  // Obtener orderId del estado de navegación o parámetro de ruta
  const stateOrderId = (location.state as any)?.orderId;
  const orderId = stateOrderId || paramOrderId;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (máximo 10 MB)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('El archivo excede el tamaño máximo permitido de 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validación de tipo MIME (imágenes y PDF)
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

    if (!orderId) {
      setErrorMessage('No se encontró el identificador del pedido. Por favor, regresa al proceso anterior.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Por favor, adjunta el comprobante de transferencia bancaria antes de enviar.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Subir archivo a Firebase Storage: receipts/{userId}/{orderId}/{fileName}
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `receipts/${user.uid}/${orderId}/${sanitizedFileName}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, selectedFile);

      // 2. Obtener la URL de descarga oficial
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // 3. Actualizar Firestore: metadatos del comprobante
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        receiptUrl: downloadUrl,
        receiptFileName: selectedFile.name,
        receiptUploadedAt: serverTimestamp(),
        status: 'deposit_paid'
      });

      // 4. Enviar notificación por correo
      try {
        await fetch('https://tucancion.app/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderId
          })
        });
      } catch (emailError) {
        console.error('Error al enviar notificación por correo:', emailError);
      }

      // 5. Confirmación únicamente tras completar Storage y Firestore
      setIsProcessing(false);
      setIsSuccess(true);

    } catch (uploadError: any) {
      console.error('Error al procesar el comprobante:', uploadError);
      setIsProcessing(false);
      setErrorMessage(uploadError?.message || 'Ocurrió un error al subir el comprobante. Por favor, intenta nuevamente.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-in zoom-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Confirmación</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            ¡Gracias por tu compra!<br />
            Hemos recibido tu comprobante de pago. Revisaremos la transferencia y nos pondremos en contacto contigo a la brevedad para confirmar tu pedido y continuar con el proceso de creación de tu canción.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
          >
            Ir a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 flex items-center justify-center">
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Finalizar Compra</h2>
        
        {/* AVISO IMPORTANTE */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
            <AlertCircle size={18} className="text-amber-400 shrink-0" />
            <span>IMPORTANTE</span>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Cuando realices la transferencia, necesitarás enviar el comprobante de pago. Te recomendamos guardar el comprobante o tomar una captura de pantalla antes de cerrar la aplicación de tu banco.
          </p>
        </div>

        {/* DATOS PARA LA TRANSFERENCIA */}
        <div className="mb-6 p-5 bg-[#141414] border border-white/10 rounded-2xl text-left">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-orange-500" />
            Datos para la transferencia
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-gray-400">Titular</span>
              <span className="font-semibold text-white">Viviana Castillo Letelier</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-gray-400">RUT</span>
              <span className="font-semibold text-white">13.052.799-k</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-gray-400">Banco</span>
              <span className="font-semibold text-white">Banco Estado</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-gray-400">Tipo de cuenta</span>
              <span className="font-semibold text-white">Cuenta Corriente</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-gray-400">Número de cuenta</span>
              <span className="font-semibold text-white font-mono">00006425712</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400">Correo</span>
              <span className="font-semibold text-white">contacto@tucancion.app</span>
            </div>
          </div>
        </div>

        {/* MÉTODO DE PAGO: TRANSFERENCIA DIRECTA */}
        <div className="mb-6">
          <button
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-white bg-white/5 transition-all"
          >
            <div className="text-white">
              <ExternalLink size={24} />
            </div>
            <span className="font-bold text-white">Transferencia Directa</span>
            <div className="ml-auto">
              <CheckCircle2 size={20} className="text-white" />
            </div>
          </button>
        </div>

        {/* CONTROL DE SELECCIÓN DE ARCHIVOS (COMPROBANTE) */}
        <div className="mb-6 p-5 bg-[#141414] border border-white/10 rounded-2xl text-left">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload size={18} className="text-orange-500" />
              Adjuntar comprobante de pago
            </h3>
            <span className="text-[11px] text-orange-400 font-semibold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              Requerido
            </span>
          </div>

          <p className="text-gray-400 text-xs mb-3">
            Formatos aceptados: Imágenes (JPG, PNG, WebP) o documentos PDF (máx. 10 MB).
          </p>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,application/pdf"
            className="hidden" 
            id="receipt-file-input"
            disabled={isProcessing}
          />

          {!selectedFile ? (
            <label 
              htmlFor="receipt-file-input"
              className={`border-2 border-dashed border-white/20 hover:border-orange-500/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.04] group ${
                isProcessing ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload size={20} className="text-gray-400 group-hover:text-orange-400 transition-colors" />
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                Seleccionar comprobante
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Haz clic para buscar tu archivo
              </span>
            </label>
          ) : (
            <div className="bg-white/5 border border-white/15 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-sm font-semibold text-white truncate max-w-[210px]" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleRemoveFile}
                disabled={isProcessing}
                className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                title="Quitar archivo"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* MENSAJE DE ERROR */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-red-400 text-xs text-left animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* BOTÓN ENVIAR COMPROBANTE */}
        <button
          onClick={handlePayment}
          disabled={isProcessing || !selectedFile}
          className={`w-full py-4 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            isProcessing || !selectedFile
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-[0.99]'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Subiendo comprobante...</span>
            </>
          ) : (
            <>
              <Upload size={18} />
              <span>Enviar comprobante</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentGateway;