# Sigle-Front

Frontend del sistema SIGLE desarrollado con React y Vite. Tiene dos vistas: el portal del paciente y el dashboard administrativo.

## Stack

- React 19
- Vite
- Firebase Authentication

## Requisitos

- Node.js 18+
- Proyecto Firebase con Email/Password habilitado
- API Gateway corriendo

## Instalación

```bash
npm install
npm run dev
```

Disponible en `http://localhost:5173`

## Variables de entorno

Copiar `.env.example` a `.env` y completar con los datos del proyecto Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_API_BASE_URL=http://localhost:8090
```

## Build producción

```bash
npm run build
```

## Estructura

```
src/
├── components/
│   ├── Login/
│   │   ├── LoginContainer.jsx   # lógica de auth Firebase
│   │   └── LoginView.jsx        # formulario login/registro
│   └── Navbar/
│       └── NavbarView.jsx
├── pages/
│   ├── Dashboard/
│   │   ├── DashboardContainer.jsx
│   │   └── DashboardView.jsx
│   └── PortalPaciente/
│       ├── PortalPacienteContainer.jsx
│       └── PortalPacienteView.jsx
├── firebase.js
└── App.jsx
```

## Roles

- Email con `admin` → Dashboard
- Cualquier otro email → Portal Paciente

## Patrones

**Container/View:** los Container manejan estado y llamadas a la API, los View solo renderizan lo que reciben por props.

**Observer:** `onAuthStateChanged` de Firebase detecta cambios en la sesión automáticamente.
