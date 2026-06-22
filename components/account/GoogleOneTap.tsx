"use client";

import Script from "next/script";
import { signIn } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
};

type GooglePromptMomentNotification = {
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    context?: "signin" | "signup" | "use";
    cancel_on_tap_outside?: boolean;
    itp_support?: boolean;
  }) => void;
  prompt: (listener?: (notification: GooglePromptMomentNotification) => void) => void;
  cancel: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

export default function GoogleOneTap({
  clientId,
  returnTo,
  enabled,
  allowedOrigins,
}: {
  clientId: string;
  returnTo: string;
  enabled: boolean;
  allowedOrigins: string[];
}) {
  const [scriptReady, setScriptReady] = useState(false);
  const [promptUnavailable, setPromptUnavailable] = useState(false);
  const initializedRef = useRef(false);
  const originAllowedRef = useRef(false);
  const submittingRef = useRef(false);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      const credential = response.credential?.trim();
      if (!credential || submittingRef.current) return;
      submittingRef.current = true;

      const result = await signIn("google-one-tap", {
        credential,
        redirect: false,
        redirectTo: returnTo,
      });

      if (result?.ok) {
        window.location.assign(result.url ?? returnTo);
        return;
      }

      submittingRef.current = false;
      setPromptUnavailable(true);
    },
    [returnTo],
  );

  useEffect(() => {
    if (!enabled || !clientId || !scriptReady || initializedRef.current) return;
    originAllowedRef.current = allowedOrigins.includes(window.location.origin);
    if (!originAllowedRef.current) {
      setPromptUnavailable(true);
      return;
    }
    const googleId = window.google?.accounts?.id;
    if (!googleId) return;

    initializedRef.current = true;
    googleId.initialize({
      client_id: clientId,
      callback: handleCredential,
      context: "signin",
      cancel_on_tap_outside: true,
      itp_support: true,
    });
    googleId.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setPromptUnavailable(true);
      }
    });

    return () => googleId.cancel();
  }, [allowedOrigins, clientId, enabled, handleCredential, scriptReady]);

  if (!enabled || !clientId) return null;

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      {promptUnavailable ? (
        <p className="account-one-tap-note">Google One Tap is not available in this browser session. Use the button below to continue.</p>
      ) : null}
    </>
  );
}
