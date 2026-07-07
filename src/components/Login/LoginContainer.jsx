import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import { setDatosRegistroPendiente } from '../../utils/pendingRegistration';
import LoginView from './LoginView';

const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export default function LoginContainer() {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erroresForm, setErroresForm] = useState({});

  const validar = () => {
    const errores = {};
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) errores.email = 'El correo es obligatorio';
    else if (!emailValido.test(email)) errores.email = 'El correo no es válido';

    if (!password.trim()) errores.password = 'La contraseña es obligatoria';
    else if (password.length < 6) errores.password = 'Mínimo 6 caracteres';

    if (modo === 'registro') {
      if (!confirmPassword.trim()) errores.confirmPassword = 'Confirma tu contraseña';
      else if (password !== confirmPassword) errores.confirmPassword = 'Las contraseñas no coinciden';

      if (!nombre.trim()) errores.nombre = 'El nombre es obligatorio';
      else if (!SOLO_LETRAS.test(nombre)) errores.nombre = 'El nombre solo puede contener letras';

      if (!apellido.trim()) errores.apellido = 'El apellido es obligatorio';
      else if (!SOLO_LETRAS.test(apellido)) errores.apellido = 'El apellido solo puede contener letras';
    }

    return errores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errores = validar();
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }
    setErroresForm({});
    setLoading(true);

    try {
      if (modo === 'registro') {
        const nombreLimpio = nombre.trim();
        const apellidoLimpio = apellido.trim();

        // Se guarda ANTES de crear la cuenta (síncrono, sin await de por
        // medio) para que App.jsx pueda leerlo apenas Firebase dispare
        // onAuthStateChanged, sin importar el orden en que resuelvan las promesas.
        setDatosRegistroPendiente({ nombre: nombreLimpio, apellido: apellidoLimpio });

        const credenciales = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credenciales.user, {
          displayName: `${nombreLimpio} ${apellidoLimpio}`.trim()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Inicia sesión.');
      } else if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) {
        setError('Credenciales incorrectas. Verifique por favor.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido.');
      } else {
        setError('Ocurrió un error. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNombre('');
    setApellido('');
    setErroresForm({});
  };

  return (
    <LoginView
      modo={modo}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      nombre={nombre}
      apellido={apellido}
      error={error}
      loading={loading}
      erroresForm={erroresForm}
      onSubmit={handleSubmit}
      onCambiarModo={cambiarModo}
      onEmailChange={(e) => { setEmail(e.target.value); setErroresForm({...erroresForm, email: ''}); }}
      onPasswordChange={(e) => { setPassword(e.target.value); setErroresForm({...erroresForm, password: ''}); }}
      onConfirmPasswordChange={(e) => { setConfirmPassword(e.target.value); setErroresForm({...erroresForm, confirmPassword: ''}); }}
      onNombreChange={(e) => { setNombre(e.target.value); setErroresForm({...erroresForm, nombre: ''}); }}
      onApellidoChange={(e) => { setApellido(e.target.value); setErroresForm({...erroresForm, apellido: ''}); }}
    />
  );
}