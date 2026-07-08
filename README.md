# Sigle-Front

Frontend del sistema SIGLE desarrollado con React y Vite. Cuenta con tres portales según el rol del usuario: Dashboard administrativo, Portal Médico y Portal Paciente, además de una página 404 personalizada.

## Stack

- React 19
- Vite
- React Router DOM
- Firebase Authentication
- Vitest + Testing Library (testing)
- Nginx (servir build en producción)
- pnpm (gestor de paquetes)

## Requisitos

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Proyecto Firebase con Email/Password habilitado
- API Gateway corriendo

## Instalación

```bash
pnpm install
pnpm dev
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

## Tests

```bash
pnpm test
```

Corre con Vitest + Testing Library. Incluye tests de `LoginView`, `NavbarView`, `DashboardView` y `PortalPacienteView`.

## Build producción

```bash
pnpm build
```

## Docker

Build multi-stage: compila con Vite y sirve el resultado con Nginx.

```bash
docker build -t sigle-front .
docker run -p 8080:80 sigle-front
```

`nginx.conf` redirige todas las rutas a `index.html` para que funcione el enrutamiento de React Router (SPA).

## Estructura
src/
├── components/
│   ├── Login/
│   │   ├── LoginContainer.jsx   # lógica de auth Firebase
│   │   └── LoginView.jsx        # formulario login/registro
│   └── Navbar/
│       └── NavbarView.jsx
├── pages/
│   ├── Dashboard/                # Vista ADMIN
│   │   ├── DashboardContainer.jsx
│   │   └── DashboardView.jsx
│   ├── Medico/                   # Vista MEDICO
│   │   ├── MedicoContainer.jsx
│   │   └── MedicoView.jsx
│   ├── PortalPaciente/           # Vista PACIENTE
│   │   ├── PortalPacienteContainer.jsx
│   │   └── PortalPacienteView.jsx
│   └── NotFound/
│       └── NotFoundView.jsx
├── firebase.js
└── App.jsx

## Roles y rutas

El rol **no** se determina en el Front por el texto del email; se sincroniza con CoreService en cada login.

1. Al iniciar sesión, `App.jsx` llama a `POST /api/auth/usuario` (CoreService) con el `firebaseUid` y el `email` del usuario. Esto crea al usuario la primera vez, o simplemente lo retorna si ya existe.
2. CoreService decide el rol real (`PACIENTE`, `MEDICO`, `ADMINISTRATIVO` o `DIRECCION`) — por ejemplo, `MEDICO` se asigna automático si el correo termina en el dominio corporativo `@rednorte-medico.com`. Ver el README de CoreService para el detalle completo de esta lógica.
3. El Front mapea ese rol de backend a la vista que corresponde:

| Rol backend (CoreService) | Rol Front | Ruta | Vista |
|---|---|---|---|
| `ADMINISTRATIVO` / `DIRECCION` | `ADMIN` | `/dashboard` | Dashboard administrativo |
| `MEDICO` | `MEDICO` | `/medico` | Portal Médico |
| `PACIENTE` (o cualquier otro) | `PACIENTE` | `/paciente` | Portal Paciente |
| — | — | Ruta no reconocida o rol no reconocido | Página 404 |

El token de Firebase (`getIdToken`) se envía como `Authorization: Bearer <token>` en cada petición al API Gateway.

## Patrones

**Container/View:** los Container manejan estado y llamadas a la API, los View solo renderizan lo que reciben por props.

**Observer:** `onAuthStateChanged` de Firebase detecta cambios en la sesión automáticamente.

**Routing declarativo:** React Router define las rutas protegidas por rol, con `<Navigate>` para redirigir accesos no permitidos.