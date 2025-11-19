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
 * Maps SpeechRecognition error codes to friendly messages
 */
const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'no-speech': 'No speech detected. Please try again.',
    'audio-capture': 'No microphone detected.',
    'not-allowed': 'Microphone permission denied.',
    'network': 'Network error. Please check your connection.'
  };

  return errorMessages[errorCode] || 'Speech recognition error';
};

/**
 * Processes speech recognition results
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
 * Creates handler for onresult event
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
 * Creates handler for onerror event
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
 * Creates handler for onend event
 */
const createEndHandler = (
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return (): void => {
    setIsListening(false);
  };
};

/**
 * Configures SpeechRecognition instance
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

  // Check browser support
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    // Create SpeechRecognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure recognition
    configureSpeechRecognition(recognition, continuous, language);

    // Assign event handlers
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
      const errorMsg = 'Your browser does not support speech recognition. Use Chrome, Edge, or Safari.';
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
      setError('Error starting microphone');
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

// TypeScript type declarations
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
