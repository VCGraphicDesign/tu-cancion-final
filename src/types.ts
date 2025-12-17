
export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface SongRequest {
  package: 'single' | 'duo' | 'trio';
  genre: string;
  mood: string;
  occasion: string;
  singer: string;
  instruments: string[];
  storyText: string;
  storyAudio?: File | null;
  audioStoragePath?: string; // Ruta para guardar en DB real
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending_payment' | 'deposit_paid' | 'in_progress' | 'preview_ready' | 'completed';
  request: SongRequest;
  price: number;
  depositAmount: number;
  createdAt: number;
  previewUrl?: string;
  finalUrl?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export const GENRES: SelectOption[] = [
  { label: 'Rock', value: 'Rock' },
  { label: 'Pop', value: 'Pop' },
  { label: 'Balada Romántica', value: 'Balada Romántica' },
  { label: 'Funk', value: 'Funk' },
  { label: 'Reguetón', value: 'Reguetón' },
  { label: 'Flamenco', value: 'Flamenco' },
  { label: 'Electrónica', value: 'Electrónica' },
  { label: 'Clásica', value: 'Clásica' },
  { label: 'Folk', value: 'Folk' },
  { label: 'Otro', value: 'Otro' },
];

export const MOODS: SelectOption[] = [
  { label: 'Alegre', value: 'Alegre' },
  { label: 'Triste', value: 'Triste' },
  { label: 'Bailable', value: 'Bailable' },
  { label: 'Romántico', value: 'Romántico' },
  { label: 'Melancólico', value: 'Melancólico' },
  { label: 'Inspirador', value: 'Inspirador' },
];

export const OCCASIONS: SelectOption[] = [
  { label: 'Aniversario', value: 'Aniversario' },
  { label: 'Cumpleaños', value: 'Cumpleaños' },
  { label: 'Despedida', value: 'Despedida' },
  { label: 'Amor', value: 'Amor' },
  { label: 'Nacimiento', value: 'Nacimiento' },
  { label: 'Matrimonio', value: 'Matrimonio' },
  { label: 'Otro', value: 'Otro' },
];

export const SINGERS: SelectOption[] = [
  { label: 'Hombre', value: 'Hombre' },
  { label: 'Mujer', value: 'Mujer' },
  { label: 'Dúo (Hombre y mujer)', value: 'Dúo' },
];

export const INSTRUMENTS: SelectOption[] = [
  { label: 'Guitarra acústica', value: 'Guitarra acústica' },
  { label: 'Guitarra eléctrica', value: 'Guitarra eléctrica' },
  { label: 'Bajo', value: 'Bajo' },
  { label: 'Piano', value: 'Piano' },
  { label: 'Violín', value: 'Violín' },
  { label: 'Batería', value: 'Batería' },
  { label: 'Cuerdas', value: 'Cuerdas' },
  { label: 'Saxofón', value: 'Saxofón' },
  { label: 'Flauta', value: 'Flauta' },
  { label: 'Otros', value: 'Otros' },
];