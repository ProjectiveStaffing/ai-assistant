'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { PlayFab, PlayFabClient } from 'playfab-sdk';
import Link from 'next/link';

if (!process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID) {
  throw new Error("NEXT_PUBLIC_PLAYFAB_TITLE_ID is not defined");
}

PlayFab.settings.titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    //alert(`Correo: ${email}\nContraseña: ${password}`);


    const loginRequestEmail = {
      TitleId: PlayFab.settings.titleId,
      Email: email,
      Password: password,
    };

    // PlayFabClient.RegisterPlayFabUser(createUser, (error, result) => {
    //   if (error) {
    //     console.error("Fallo el registro:", error);
    //   } else {
    //     console.log("Registro exitoso:", result);
    //   }
    // });

    PlayFabClient.LoginWithEmailAddress(loginRequestEmail, (error, result) => {
      if (error) {
        console.error("Fallo el login:", error);
      } else {
        console.log("Login exitoso:", result);
        if(result.data.SessionTicket) 
          sessionStorage.setItem('playfabTicket', result.data.SessionTicket);

        router.replace('/assistant');
      }
    });

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E] text-white p-6">
      <div className="w-full max-w-md p-8 bg-[#202124] rounded-2xl shadow-lg border border-[#3C4043]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login <span className="text-[#8AB4F8]">Youtask</span>
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-[#BDC1C6]">email</label>
            <input
              type="text"
              className="w-full mt-1 p-3 rounded-lg bg-[#2D2F31] border border-[#3C4043] text-white placeholder:text-[#BDC1C6] outline-none"
              placeholder="yourmail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-[#BDC1C6]">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 rounded-lg bg-[#2D2F31] border border-[#3C4043] text-white placeholder:text-[#BDC1C6] outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-[#BDC1C6] mt-6 text-center">
          Do you have an account? <Link href="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
