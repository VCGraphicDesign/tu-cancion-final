
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Scale, FileText, Lock } from 'lucide-react';

const Legal: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
        window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4 text-gray-300">
      <div className="container mx-auto max-w-4xl bg-surface border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8 text-center border-b border-white/10 pb-6">
          Información Legal y Términos de Servicio
        </h1>

        {/* Términos y Condiciones */}
        <section id="terminos" className="mb-12 scroll-mt-32">
          <div className="flex items-center gap-3 mb-4 text-accent">
            <Scale size={24} />
            <h2 className="text-2xl font-bold text-white">1. Términos de Venta</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Bienvenido a <strong>Tu Canción</strong>. Al contratar nuestros servicios, aceptas los siguientes términos regidos por la legislación de la República de Chile.
            </p>
            <h3 className="font-bold text-white mt-4">Naturaleza del Servicio</h3>
            <p>
              Ofrecemos la creación de composiciones musicales personalizadas basadas en las historias proporcionadas por el cliente. El resultado es un archivo de audio digital.
            </p>
            <h3 className="font-bold text-white mt-4">Proceso de Pago</h3>
            <p>
              El servicio opera bajo un modelo 50/50:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>50% Inicial (Depósito):</strong> Requisito para iniciar la producción. No reembolsable una vez iniciado el trabajo creativo.</li>
                <li><strong>50% Final:</strong> Se paga tras la aprobación del "Avance" (preview) para liberar la descarga del archivo completo en alta calidad.</li>
              </ul>
            </p>
            <h3 className="font-bold text-white mt-4">Derecho a Retracto (Ley 19.496)</h3>
            <p>
              Conforme a la letra b) del artículo 3° bis de la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores, <strong>no aplica el derecho a retracto</strong> (devolución sin causa en 10 días) para este servicio, dado que se trata de bienes confeccionados conforme a las especificaciones del consumidor (personalizados).
            </p>
          </div>
        </section>

        {/* Propiedad Intelectual */}
        <section id="propiedad" className="mb-12 scroll-mt-32">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <FileText size={24} />
            <h2 className="text-2xl font-bold text-white">2. Propiedad Intelectual y Licencias</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed">
            <h3 className="font-bold text-white mt-4">Derechos de Autor (Ley 17.336)</h3>
            <p>
              "Tu Canción" y sus compositores retienen la titularidad de los derechos morales y patrimoniales sobre la composición musical y la letra, salvo acuerdo escrito en contrario.
            </p>
            <h3 className="font-bold text-white mt-4">Licencia al Cliente</h3>
            <p>
              Al completar el pago total, se otorga al cliente una <strong>Licencia de Uso Personal Perpetua</strong>.
              El cliente reconoce y acepta expresamente que <strong>nunca tendrá derechos de autoría</strong> sobre las canciones personalizadas, manteniendo "Tu Canción" la autoría intelectual integral de la obra.
              <br />
              <strong>Permitido:</strong> Uso privado, compartir en redes sociales personales, regalar a terceros, reproducir en eventos familiares (matrimonios, cumpleaños).
              <br />
              <strong>No Permitido:</strong> Reventa, adjudicación de autoría, distribución comercial en plataformas de streaming (Spotify, Apple Music) con fines de lucro, o uso en publicidad comercial sin una licencia comercial adicional.
            </p>
          </div>
        </section>

        {/* Reembolsos */}
        <section id="reembolso" className="mb-12 scroll-mt-32">
          <div className="flex items-center gap-3 mb-4 text-red-400">
            <Shield size={24} />
            <h2 className="text-2xl font-bold text-white">3. Política de Garantía y Reembolso</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Nos esforzamos por capturar la esencia de tu historia. Si el primer avance no es de tu agrado, ofrecemos una (1) ronda de revisión para ajustes menores en la letra o mezcla sin costo adicional.
            </p>
            <p>
              Dado el costo operativo de la creación de tu canción personalizada, el depósito inicial del 50% <strong>no es reembolsable</strong> si el cliente decide cancelar el pedido después de que la producción ha comenzado.
            </p>
          </div>
        </section>

        {/* Privacidad */}
        <section id="privacidad" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <Lock size={24} />
            <h2 className="text-2xl font-bold text-white">4. Privacidad y Datos (Ley 19.628)</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Respetamos la confidencialidad de tu historia. Los textos y audios proporcionados ("Tu Historia") serán utilizados exclusivamente por nuestro equipo de producción para la creación de la canción.
            </p>
            <p>
              "Tu Canción" se reserva el derecho de utilizar fragmentos anónimos de la obra finalizada para su portafolio de ejemplos, a menos que el cliente solicite explícitamente privacidad total al momento de la contratación.
            </p>
            
            <h3 className="font-bold text-white mt-4">Retención de Archivos</h3>
            <p className="bg-white/5 border-l-4 border-accent p-4 rounded-r text-gray-300">
              <strong>Importante:</strong> Las canciones terminadas y sus archivos adjuntos se mantendrán almacenados en nuestros servidores por un período máximo de <strong>tres (3) meses</strong> contados desde la fecha de entrega final. Transcurrido este plazo, los archivos serán <strong>eliminados de forma permanente</strong> de nuestra base de datos para garantizar la seguridad y privacidad. Es responsabilidad exclusiva del cliente descargar y respaldar su canción en sus propios dispositivos dentro de este periodo.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Legal;
