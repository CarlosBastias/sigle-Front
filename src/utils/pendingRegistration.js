// Firebase dispara onAuthStateChanged apenas se crea la cuenta, antes de que
// el flujo de registro termine de ejecutarse. Guardamos aquí nombre/apellido
// de forma síncrona (sin await de por medio) justo antes de crear la cuenta,
// para que App.jsx pueda leerlos al sincronizar el usuario con el backend.

let datosPendientes = null;

export function setDatosRegistroPendiente(datos) {
  datosPendientes = datos;
}

export function tomarDatosRegistroPendiente() {
  const datos = datosPendientes;
  datosPendientes = null;
  return datos;
}