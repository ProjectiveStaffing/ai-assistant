'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { PlayFab, PlayFabClient } from 'playfab-sdk';
import Link from 'next/link';

if (!process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID) {
  throw new Error("NEXT_PUBLIC_PLAYFAB_TITLE_ID is not defined");
}

PlayFab.settings.titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID;

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordMatch, setShowPasswordMatch] = useState(false);
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  // Validar email en tiempo real
  const validateEmail = (emailValue: string) => {
    if (emailValue.length === 0) {
      setEmailError('');
      return true;
    }

    // Regex para validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailValue)) {
      setEmailError('Por favor ingresa un email válido');
      return false;
    }

    setEmailError('');
    return true;
  };

  // Validar contraseñas en tiempo real
  const validatePasswords = (pass: string, confirmPass: string) => {
    if (confirmPass.length === 0) {
      setPasswordError('');
      setShowPasswordMatch(false);
      return;
    }

    setShowPasswordMatch(true);

    if (pass !== confirmPass) {
      setPasswordError('Las contraseñas no coinciden');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePasswords(value, confirmPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    validatePasswords(password, value);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de email
    if (!validateEmail(email)) {
      return;
    }

    // Validación final antes de enviar
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    //alert(`Correo: ${email}\nContraseña: ${password}`);

    const createUser = {
      Username: email,
      DisplayName: email,
      Email: email,
      Password: password,
    }

    // PlayFabClient.RegisterPlayFabUser(createUser, (error, result) => {
    //   if (error) {
    //     console.error("Fallo el registro:", error);
    //   } else {
    //     console.log("Registro exitoso:", result);
    //   }
    // });


    PlayFabClient.RegisterPlayFabUser(createUser, (error, result) => {
      if (error) {
        console.error("Sign up failed:", error);
      } else {
        console.log("Sign up successful:", result);
        if(result.data.SessionTicket) 
          sessionStorage.setItem('playfabTicket', result.data.SessionTicket);

        router.replace('/login');
      }
    });

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E] text-white p-6">
      <div className="w-full max-w-md p-8 bg-[#202124] rounded-2xl shadow-lg border border-[#3C4043]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Sign up <span className="text-[#8AB4F8]">Youtask</span>
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-[#BDC1C6]">Email</label>
            <div className="relative">
              <input
                type="email"
                className={`w-full mt-1 p-3 rounded-lg bg-[#2D2F31] border ${
                  emailError
                    ? 'border-red-500'
                    : email && !emailError
                    ? 'border-green-500'
                    : 'border-[#3C4043]'
                } text-white placeholder:text-[#BDC1C6] outline-none focus:border-blue-500 pr-10`}
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
              {/* Indicador visual */}
              {email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailError ? (
                    <span className="text-red-500 text-xl">✗</span>
                  ) : (
                    <span className="text-green-500 text-xl">✓</span>
                  )}
                </div>
              )}
            </div>
            {/* Mensaje de error */}
            {emailError && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {emailError}
              </p>
            )}
            {/* Mensaje de éxito */}
            {!emailError && email && (
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <span>✓</span>
                Email válido
              </p>
            )}
          </div>
          <div>
            <label className="text-sm text-[#BDC1C6]">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 rounded-lg bg-[#2D2F31] border border-[#3C4043] text-white placeholder:text-[#BDC1C6] outline-none focus:border-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-[#BDC1C6] mt-1">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label className="text-sm text-[#BDC1C6]">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                className={`w-full mt-1 p-3 rounded-lg bg-[#2D2F31] border ${
                  passwordError
                    ? 'border-red-500'
                    : confirmPassword && !passwordError
                    ? 'border-green-500'
                    : 'border-[#3C4043]'
                } text-white placeholder:text-[#BDC1C6] outline-none focus:border-blue-500 pr-10`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
              />
              {/* Indicador visual */}
              {showPasswordMatch && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {passwordError ? (
                    <span className="text-red-500 text-xl">✗</span>
                  ) : (
                    <span className="text-green-500 text-xl">✓</span>
                  )}
                </div>
              )}
            </div>
            {/* Mensaje de error */}
            {passwordError && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {passwordError}
              </p>
            )}
            {/* Mensaje de éxito */}
            {!passwordError && confirmPassword && showPasswordMatch && (
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <span>✓</span>
                Las contraseñas coinciden
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!email || !password || !confirmPassword || !!emailError || !!passwordError || password.length < 6}
            className={`w-full mt-4 p-3 rounded-lg font-semibold transition-all ${
              !email || !password || !confirmPassword || !!emailError || !!passwordError || password.length < 6
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-pink-500 text-white hover:opacity-90'
            }`}
          >
            Lets go
          </button>
        </form>
        <p className="text-sm text-[#BDC1C6] mt-6 text-center">
          Dont you have an account? <Link href="/login">login</Link>
        </p>
      </div>
    </div>
  );
}
