import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export const useSpeechRecognition = ({
  onResult,
  onError,
  continuous = true,
  language = 'es-ES'
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Verificar soporte del navegador
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    // Crear instancia de SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    // Evento cuando se obtienen resultados
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(prev => prev + finalTranscript);

      if (finalTranscript && onResult) {
        onResult(finalTranscript.trim());
      }
    };

    // Evento cuando hay un error
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = 'Error en el reconocimiento de voz';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No se detectó voz. Intenta de nuevo.';
          break;
        case 'audio-capture':
          errorMessage = 'No se detectó micrófono.';
          break;
        case 'not-allowed':
          errorMessage = 'Permiso de micrófono denegado.';
          break;
        case 'network':
          errorMessage = 'Error de red. Verifica tu conexión.';
          break;
      }

      setError(errorMessage);
      setIsListening(false);

      if (onError) {
        onError(errorMessage);
      }
    };

    // Evento cuando termina el reconocimiento
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, continuous, language, onResult, onError]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = 'Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setError(null);
    setTranscript('');

    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error al iniciar reconocimiento:', error);
      setError('Error al iniciar el micrófono');
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error al detener reconocimiento:', error);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
};

// Declaración de tipos para TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};
