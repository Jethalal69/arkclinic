import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Centralized consultation fee mapping (in paise)
const PRICING_PAISE: Record<string, number> = {
  'online-video': 49900,
  'video': 49900,
  'in-clinic': 39900,
  'in_person': 39900,
  'home-visit': 69900,
  'telephonic': 39900,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { appointment_type, patient_name, email, phone } = await req.json();

    const amountInPaise = PRICING_PAISE[appointment_type] || 39900;
    const amountInInr = amountInPaise / 100;

    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    // If Razorpay API keys are configured, create real Razorpay order via REST API
    if (keyId && keySecret && !keyId.includes('placeholder')) {
      const authHeader = 'Basic ' + btoa(`${keyId}:${keySecret}`);
      const receiptId = `rcpt_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6)}`;

      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            clinic: 'ARK Clinic',
            appointment_type: appointment_type || 'in-clinic',
            patient_name: patient_name || '',
            patient_phone: phone || '',
          },
        }),
      });

      if (!rzpResponse.ok) {
        const errBody = await rzpResponse.text();
        console.error('Razorpay Orders API error:', errBody);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to initiate Razorpay order. Please try again.',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const orderData = await rzpResponse.json();
      return new Response(
        JSON.stringify({
          success: true,
          orderId: orderData.id,
          amount: orderData.amount,
          amountInr: amountInInr,
          currency: orderData.currency || 'INR',
          keyId: keyId,
          mode: 'live_test',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Demo/Development fallback order generator when environment keys are in mock mode
    const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const demoKeyId = keyId || 'rzp_test_arkclinic_demo';

    return new Response(
      JSON.stringify({
        success: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        amountInr: amountInInr,
        currency: 'INR',
        keyId: demoKeyId,
        mode: 'demo_test',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
