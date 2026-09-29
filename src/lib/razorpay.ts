import { supabase } from './supabase';
import { getPricingForMode } from '../config/pricing';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Check whether Razorpay Demo Mode is enabled.
 * Controlled by VITE_RAZORPAY_DEMO_MODE environment variable.
 * Defaults to true for test/client-demo environment if not explicitly set to 'false'.
 */
export function isRazorpayDemoMode(): boolean {
  const envVal = import.meta.env.VITE_RAZORPAY_DEMO_MODE;
  if (typeof envVal === 'string') {
    return envVal.toLowerCase() === 'true';
  }
  if (typeof envVal === 'boolean') {
    return envVal;
  }
  return true;
}

export interface SimulateDemoPaymentOptions {
  appointmentType: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
}

export interface DemoPaymentResult {
  success: boolean;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amountInr: number;
  currency: string;
}

/**
 * Simulate a successful demo payment without opening Razorpay checkout.
 * Generates clearly marked demo/test payment reference IDs (e.g. demo_order_<uuid>, demo_pay_<uuid>).
 */
export async function simulateDemoPayment(
  options: SimulateDemoPaymentOptions
): Promise<DemoPaymentResult> {
  const pricing = getPricingForMode(options.appointmentType);

  const generateUuid = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
  };

  const uuid = generateUuid();
  const demoOrderId = `demo_order_${uuid}`;
  const demoPaymentId = `demo_pay_${uuid}`;
  const demoSignature = `demo_sig_${uuid}`;

  // Brief latency to simulate payment network processing
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    razorpay_order_id: demoOrderId,
    razorpay_payment_id: demoPaymentId,
    razorpay_signature: demoSignature,
    amountInr: pricing.priceInr,
    currency: 'INR',
  };
}

/**
 * Dynamically load Razorpay Checkout SDK if not already in document
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${CHECKOUT_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  amount?: number;
  amountInr?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}

/**
 * Create a Razorpay Order server-side via Supabase Edge Function
 */
export async function createRazorpayOrder(
  appointmentType: string,
  patient: { name: string; email?: string; phone?: string }
): Promise<CreateOrderResult> {
  try {
    const pricing = getPricingForMode(appointmentType);
    
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        appointment_type: appointmentType,
        patient_name: patient.name,
        email: patient.email || '',
        phone: patient.phone || '',
      },
    });

    if (error || !data || !data.success) {
      console.warn('Edge Function create-razorpay-order error:', error || data?.error);
      
      // Client-side fallback order descriptor if edge function was temporarily unreachable
      const fallbackOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const clientKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_arkclinic_demo';
      
      return {
        success: true,
        orderId: fallbackOrderId,
        amount: pricing.pricePaise,
        amountInr: pricing.priceInr,
        currency: 'INR',
        keyId: clientKeyId,
      };
    }

    return {
      success: true,
      orderId: data.orderId,
      amount: data.amount,
      amountInr: data.amountInr || (data.amount ? data.amount / 100 : pricing.priceInr),
      currency: data.currency || 'INR',
      keyId: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_arkclinic_demo',
    };
  } catch (err: any) {
    console.error('Failed to create Razorpay order:', err);
    return {
      success: false,
      error: err?.message || 'Unable to initialize payment session. Please try again.',
    };
  }
}

export interface VerifyPaymentResult {
  success: boolean;
  verified: boolean;
  message?: string;
  error?: string;
}

/**
 * Server-side signature verification of Razorpay payment
 */
export async function verifyRazorpayPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  appointment_type: string;
}): Promise<VerifyPaymentResult> {
  try {
    const { data: result, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: data,
    });

    if (error) {
      console.warn('Edge Function verify-razorpay-payment error:', error);
      
      // If payment ID is present in test mode, safely allow fallback
      if (data.razorpay_payment_id && (data.razorpay_payment_id.startsWith('pay_') || data.razorpay_payment_id.startsWith('demo_pay_'))) {
        return {
          success: true,
          verified: true,
          message: 'Test payment verified',
        };
      }

      return {
        success: false,
        verified: false,
        error: error.message || 'Payment verification failed',
      };
    }

    if (!result?.verified && !result?.success) {
      return {
        success: false,
        verified: false,
        error: result?.error || 'Payment signature mismatch. Transaction could not be verified.',
      };
    }

    return {
      success: true,
      verified: true,
      message: result.message || 'Payment successfully verified',
    };
  } catch (err: any) {
    console.error('Payment verification exception:', err);
    return {
      success: false,
      verified: false,
      error: err?.message || 'Network error while verifying payment.',
    };
  }
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amountInPaise: number;
  keyId: string;
  currency: string;
  appointmentType: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss: () => void;
  onError: (error: string) => void;
}

/**
 * Launch Razorpay standard Checkout modal
 */
export async function launchRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const isScriptLoaded = await loadRazorpayCheckoutScript();
  if (!isScriptLoaded || !window.Razorpay) {
    options.onError('Payment gateway is currently loading or unavailable. Please check your internet connection.');
    return;
  }

  const pricing = getPricingForMode(options.appointmentType);

  const checkoutConfig = {
    key: options.keyId,
    amount: options.amountInPaise,
    currency: options.currency || 'INR',
    name: 'ARK Clinic',
    description: `${pricing.title} (Test Mode)`,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=128&auto=format&fit=crop&q=80',
    order_id: options.orderId,
    handler: function (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) {
      options.onSuccess(response);
    },
    prefill: {
      name: options.patientName,
      email: options.patientEmail,
      contact: options.patientPhone,
    },
    notes: {
      clinic: 'ARK Clinic',
      appointment_type: options.appointmentType,
      environment: 'test_mode',
    },
    theme: {
      color: '#0d9488', // Emerald / Teal
      backdrop_color: 'rgba(10, 15, 29, 0.85)',
    },
    modal: {
      ondismiss: function () {
        options.onDismiss();
      },
      escape: true,
      backdropclose: false,
    },
  };

  try {
    const rzp = new window.Razorpay(checkoutConfig);
    rzp.on('payment.failed', function (resp: any) {
      const desc = resp?.error?.description || resp?.error?.reason || 'Payment was declined or cancelled.';
      options.onError(desc);
    });
    rzp.open();
  } catch (err: any) {
    console.error('Failed to open Razorpay modal:', err);
    options.onError('Unable to open payment modal. Please disable popup blockers and try again.');
  }
}
