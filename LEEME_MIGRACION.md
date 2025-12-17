
# Guía de Migración a Producción (Firebase)

Esta app actualmente usa `mockBackend.ts` para simular datos. Sigue estos pasos para hacerla real.

## Paso 1: Configuración en Google
1. Ve a [Firebase Console](https://console.firebase.google.com).
2. Crea un proyecto nuevo llamado "Tu Canción".
3. Activa **Authentication** (Google y Email/Password).
4. Activa **Firestore Database** (Modo producción).
5. Activa **Storage** (Para subir los audios).

## Paso 2: Código Local
1. En tu terminal, instala la librería oficial:
   ```bash
   npm install firebase
   ```
2. Abre `services/firebase.ts` y descomenta el código.
3. Pega las credenciales que te dio la consola de Firebase.

## Paso 3: Reemplazar Simulaciones
En los archivos de la app (`Auth.tsx`, `CreateRequest.tsx`, `Dashboard.tsx`), cambia las importaciones:

**Donde dice:**
```javascript
import { mockAuth, mockOrders } from '../services/mockBackend';
```

**Cámbialo por llamadas reales a Firebase:**
(Tendrás que crear funciones en `firebase.ts` que usen `signInWithPopup`, `addDoc`, etc.)

## Paso 4: Pagos Reales (Backend)
Para cobrar dinero real, necesitas "Cloud Functions".
1. Instala las herramientas de Firebase: `npm install -g firebase-tools`
2. Ejecuta `firebase init functions` en tu carpeta.
3. Ahí escribirás el código para conectar con Stripe/MercadoPago.

## Paso 5: Despliegue (GitHub)
1. Sube este código a GitHub.
2. Conecta tu repositorio con **Firebase Hosting** o **Vercel**.
3. ¡Tu app estará online en `tucancion.com`!
