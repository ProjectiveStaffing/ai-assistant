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

/**
 * Mapea códigos de error de SpeechRecognition a mensajes amigables
 */
const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'no-speech': 'No se detectó voz. Intenta de nuevo.',
    'audio-capture': 'No se detectó micrófono.',
    'not-allowed': 'Permiso de micrófono denegado.',
    'network': 'Error de red. Verifica tu conexión.'
  };

  return errorMessages[errorCode] || 'Error en el reconocimiento de voz';
};

/**
 * Procesa los resultados del reconocimiento de voz
 */
const processRecognitionResults = (
  event: SpeechRecognitionEvent
): string => {
  let finalTranscript = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript + ' ';
    }
  }

  return finalTranscript;
};

/**
 * Crea el handler para el evento onresult
 */
const createResultHandler = (
  setTranscript: React.Dispatch<React.SetStateAction<string>>,
  onResult?: (transcript: string) => void
) => {
  return (event: SpeechRecognitionEvent): void => {
    const finalTranscript = processRecognitionResults(event);

    setTranscript(prev => prev + finalTranscript);

    if (finalTranscript && onResult) {
      onResult(finalTranscript.trim());
    }
  };
};

/**
 * Crea el handler para el evento onerror
 */
const createErrorHandler = (
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>,
  onError?: (error: string) => void
) => {
  return (event: SpeechRecognitionErrorEvent): void => {
    const errorMessage = getErrorMessage(event.error);

    setError(errorMessage);
    setIsListening(false);

    if (onError) {
      onError(errorMessage);
    }
  };
};

/**
 * Crea el handler para el evento onend
 */
const createEndHandler = (
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return (): void => {
    setIsListening(false);
  };
};

/**
 * Configura la instancia de SpeechRecognition
 */
const configureSpeechRecognition = (
  recognition: SpeechRecognition,
  continuous: boolean,
  language: string
): void => {
  recognition.continuous = continuous;
  recognition.interimResults = true;
  recognition.lang = language;
  recognition.maxAlternatives = 1;
};

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

    // Configurar reconocimiento
    configureSpeechRecognition(recognition, continuous, language);

    // Asignar event handlers
    recognition.onresult = createResultHandler(setTranscript, onResult);
    recognition.onerror = createErrorHandler(setError, setIsListening, onError);
    recognition.onend = createEndHandler(setIsListening);

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
    } catch {
      setError('Error al iniciar el micrófono');
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
      setIsListening(false);
    } catch {
      // Error silently handled - recognition may not be running
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

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};
