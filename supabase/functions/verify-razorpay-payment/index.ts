import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Helper: Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Verify HMAC-SHA256 Signature using Web Crypto API
async function verifyHmacSha256(secret: string, data: string, expectedSignature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
    const generatedHex = bufferToHex(signatureBuffer);
    return generatedHex.toLowerCase() === expectedSignature.toLowerCase();
  } catch (e) {
    console.error('HMAC computation error:', e);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return new Response(
        JSON.stringify({ success: false, verified: false, error: 'Missing payment details' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    // If Razorpay secret is configured and real signature provided
    if (keySecret && !keySecret.includes('placeholder')) {
      if (!razorpay_signature) {
        return new Response(
          JSON.stringify({ success: false, verified: false, error: 'Missing Razorpay signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const isValid = await verifyHmacSha256(keySecret, text, razorpay_signature);

      if (!isValid) {
        return new Response(
          JSON.stringify({
            success: false,
            verified: false,
            error: 'Invalid payment signature. Verification failed.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          message: 'Payment signature verified successfully',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Demo/Development mode verification (accepts valid mock payment IDs)
    if (razorpay_payment_id.startsWith('pay_') || razorpay_payment_id.startsWith('demo_pay_')) {
      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          mode: 'demo_test',
          message: 'Demo test payment verified',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, verified: false, error: 'Unrecognized payment identifier' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, verified: false, error: err?.message || 'Verification error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
