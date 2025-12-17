
import React from 'react';
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
        src: "https://drive.google.com/file/d/1MDh3WHPjFOP3ovKsz9DaeQmAyiCmF_ho/view?usp=sharing"
    },
    {
        id: 2,
        title: "Cómo te extraño",
        src: "https://drive.google.com/file/d/1kbjApoVsndajoCx_1Lgf_l3V1QC98tzv/view?usp=sharing"
    },
    {
        id: 3,
        title: "Resonance",
        src: "https://drive.google.com/file/d/1bryr-ljHkA9hOKKtRj8kXSRf3-gInHtk/view?usp=sharing"
    },
    {
        id: 4,
        title: "60...",
        src: "https://drive.google.com/file/d/1c3bTkC9N8MD_ogmOzwMXcLKJKzooCIz7/view?usp=sharing"
    },
    {
        id: 5,
        title: "No soy el amor",
        src: "https://drive.google.com/file/d/18nL-ilIzR0aF1P-3YPr8e17OWnZ-97kZ/view?usp=sharing"
    },
    {
        id: 6,
        title: "No soy el amor (Acústico)",
        src: "https://drive.google.com/file/d/1SAfuiRMiVqBoybLOlQTJeJXWoGN-nVeR/view?usp=sharing"
    },
    {
        id: 7,
        title: "Encuéntrala",
        src: "https://drive.google.com/file/d/1CxpI3xYL7qFmplWGW-njRpxV2ygO6Pt5/view?usp=sharing"
    },
    {
        id: 8,
        title: "Invisible",
        src: "https://drive.google.com/file/d/1NAqmQVKgYnxauE2p-a2jQNKvBak8d2Tm/view?usp=sharing"
    }
];

const Examples: React.FC = () => {
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
