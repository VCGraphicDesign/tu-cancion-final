
import React, { useState } from 'react';
import AudioPlayer from '../components/AudioPlayer';

interface ExampleSong {
  id: number;
  title: string;
  src: string;
}

// Golden Standard: Use standard sharing links. 
// The AudioPlayer component handles the embed transformation.
const EXAMPLES: ExampleSong[] = [
    {
        id: 1,
        title: "Tu Historia en Canción",
        src: "https://firebasestorage.googleapis.com/v0/b/tu-cancion-final.firebasestorage.app/o/audio%2FEjemplos%2FTu%20Historia%20en%20Cancion.wav?alt=media&token=9f58e09a-0ea2-4994-83fb-759e20180a97"
    },
    {
        id: 2,
        title: "Cómo te extraño",
        src: "https://firebasestorage.googleapis.com/v0/b/tu-cancion-final.firebasestorage.app/o/audio%2FEjemplos%2FComo%20te%20extra%C3%B1o_expff.mp3?alt=media&token=c50fe5da-6285-47e2-8605-d0fe323e185e"
    },
    {
        id: 3,
        title: "Resonance",
        src: "https://firebasestorage.googleapis.com/v0/b/tu-cancion-final.firebasestorage.app/o/audio%2FEjemplos%2FResonance_ejpff.wav?alt=media&token=df16b4f2-96c5-4911-962e-7ff1e6f933c6"
    },
    {
        id: 4,
        title: "60...",
        src: "https://firebasestorage.googleapis.com/v0/b/tu-cancion-final.firebasestorage.app/o/audio%2FEjemplos%2F60..._expff.wav?alt=media&token=cbfb7c50-d372-447f-9c79-e9cd8dd5e68d"
    },
    {
        id: 5,
        title: "No soy el amor",
        src: "https://firebasestorage.googleapis.com/v0/b/tu-cancion-final.firebasestorage.app/o/audio%2FEjemplos%2FNo%20soy%20el%20amor_ejpff.wav?alt=media&token=544823bf-10fd-4cf7-9247-01a5bbd698d3"
    },
    {
        id: 6,
        title: "No soy el amor (Acústico)",
        src: "https://firebasestorage.googleapis.com/v0/b/tu-cancion-final.firebasestorage.app/o/audio%2FEjemplos%2FNo%20soy%20el%20amor_acustico_ejpff.mp3?alt=media&token=b6fed574-82b8-4d37-8567-da544bb3c16c"
    },
    {
        id: 7,
        title: "Encuéntrala",
        src: "https://firebasestorage.googleapis.com/v0/b/tu-cancion-final.firebasestorage.app/o/audio%2FEjemplos%2FEncuentrala_ejpff.wav?alt=media&token=d324d0b3-bd77-46f9-9db1-f2b028d4d607"
    },
    {
        id: 8,
        title: "Invisible",
        src: "https://firebasestorage.googleapis.com/v0/b/tu-cancion-final.firebasestorage.app/o/audio%2FEjemplos%2FInvisible_ejpff.wav?alt=media&token=69ba04e8-5994-44d1-ba4e-239ce69d03d5"
    }
];

const Examples: React.FC = () => {
  const [activeAudioId, setActiveAudioId] = useState<number | null>(null);

  const handleAudioPlay = (songId: number) => {
    setActiveAudioId(songId);
  };

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4 pb-32">
        <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
                <span className="text-accent text-xs font-bold tracking-widest uppercase mb-2 block">Nuestro Portafolio</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Ejemplos Reales</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Escucha cómo hemos transformado historias en canciones. 
                    Desde baladas románticas hasta ritmos intensos.
                </p>
                <div className="h-1 w-24 bg-accent mx-auto rounded-full mt-6"></div>
            </div>

            {/* Compact Grid Layout */}
            <div className="grid md:grid-cols-2 gap-4">
                {EXAMPLES.map((song, index) => (
                    <div key={song.id} className="bg-surface border border-white/10 rounded-xl p-3 hover:border-accent/30 transition-all hover:bg-white/5 flex items-center gap-3 shadow-lg">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/5 flex items-center justify-center text-gray-400 text-sm font-bold">
                            {index + 1}
                        </div>
                        <div className="flex-grow min-w-0">
                            <h3 className="font-bold text-white text-sm mb-2 truncate px-1">{song.title}</h3>
                            {/* Slim Player Container */}
                            <div className="w-full">
                                <AudioPlayer 
                                    src={song.src} 
                                    title={song.title} 
                                    className="border-none p-0 shadow-none bg-transparent"
                                    isActive={song.id === activeAudioId}
                                    onPlay={() => handleAudioPlay(song.id)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-16 text-center">
                 <p className="text-gray-400 text-sm mb-4">¿Te gustó lo que escuchaste?</p>
                 <a href="/#/create" className="inline-block px-8 py-3 bg-primary hover:bg-primaryDark text-white font-bold rounded-full transition-colors shadow-lg shadow-primary/20">
                    Crear mi canción ahora
                 </a>
            </div>
        </div>
    </div>
  );
};

export default Examples;
