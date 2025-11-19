/**
 * Custom hook for sign up logic with PlayFab
 * Following BEST_PRACTICES.md: Separation of concerns, Error handling
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayFab, PlayFabClient } from 'playfab-sdk';

interface SignUpData {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

interface SignUpError {
  code?: number;
  error?: string;
  errorMessage?: string;
}

interface UseSignUpReturn {
  isLoading: boolean;
  error: string | null;
  signUp: (data: SignUpData) => Promise<void>;
}

// Initialize PlayFab settings
if (!process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID) {
  throw new Error('NEXT_PUBLIC_PLAYFAB_TITLE_ID is not defined');
}
PlayFab.settings.titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID;

export function useSignUp(): UseSignUpReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signUp = async (data: SignUpData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const createUser = {
        Username: data.username,
        DisplayName: data.displayName,
        Email: data.email,
        Password: data.password,
      };

      return new Promise((resolve, reject) => {
        PlayFabClient.RegisterPlayFabUser(
          createUser,
          (error: SignUpError | null, result) => {
            setIsLoading(false);

            if (error) {
              const errorMessage = error.errorMessage || 'Error en el registro';
              setError(errorMessage);
              reject(new Error(errorMessage));
              return;
            }

            if (result?.data?.SessionTicket) {
              sessionStorage.setItem('playfabTicket', result.data.SessionTicket);
            }

            router.replace('/login');
            resolve();
          }
        );
      });
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    isLoading,
    error,
    signUp,
  };
}
