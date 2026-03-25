import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface UseGoogleLoginOptions {
  onSuccess: (idToken: string) => void;
  onError?: (error: string) => void;
}

export function useGoogleLogin({ onSuccess, onError }: UseGoogleLoginOptions) {
  const initialized = useRef(false);

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError?.('Aucun credential reçu de Google');
      }
    },
    [onSuccess, onError]
  );

  useEffect(() => {
    if (initialized.current) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      initialized.current = true;
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleCredentialResponse]);

  const renderButton = useCallback(
    (element: HTMLElement | null) => {
      if (!element || !window.google || !initialized.current) return;
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: element.offsetWidth,
        text: 'signin_with',
        locale: 'fr',
      });
    },
    []
  );

  return { renderButton };
}
