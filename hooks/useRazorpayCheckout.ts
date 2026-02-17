"use client";

import { useState, useCallback } from "react";

interface CheckoutOptions {
  plan: "pro" | "team";
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useRazorpayCheckout() {
  const [loading, setLoading] = useState(false);

  const loadScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const checkout = useCallback(
    async ({ plan, onSuccess, onError }: CheckoutOptions) => {
      setLoading(true);

      try {
        const scriptLoaded = await loadScript();
        if (!scriptLoaded) {
          onError?.("Failed to load Razorpay. Please try again.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/subscription/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await res.json();

        if (!res.ok) {
          onError?.(data.error || "Failed to create subscription");
          setLoading(false);
          return;
        }

        const options = {
          key: data.key,
          subscription_id: data.subscriptionId,
          name: "SnapCode",
          description: `${data.plan} Plan - ₹${data.amount}/month`,
          prefill: {
            name: data.name,
            email: data.email,
          },
          theme: {
            color: "#a855f7",
          },
          handler: () => {
            onSuccess?.();
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
      } catch {
        onError?.("Something went wrong. Please try again.");
        setLoading(false);
      }
    },
    [loadScript]
  );

  return { checkout, loading };
}
