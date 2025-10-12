import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    console.log('Sending PIN to email:', email);

    // Validate email
    if (!email || typeof email !== 'string') {
      throw new Error('Valid email is required');
    }

    // Initialize Supabase client with service role key (for admin access)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store PIN in database with 10-minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    // Delete any existing PINs for this email
    await supabase
      .from('admin_pins')
      .delete()
      .eq('email', email);
    
    // Insert new PIN
    const { error: insertError } = await supabase
      .from('admin_pins')
      .insert({
        email,
        pin,
        expires_at: expiresAt
      });

    if (insertError) {
      console.error('Error storing PIN:', insertError);
      throw new Error('Failed to store PIN');
    }

    // Send email with PIN using Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
    
    const { error: emailError } = await resend.emails.send({
      from: 'Admin Access <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Admin Login PIN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Admin Login Verification</h1>
          <p style="font-size: 16px; color: #666;">Your 4-digit verification PIN is:</p>
          <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${pin}</span>
          </div>
          <p style="font-size: 14px; color: #999;">This PIN will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #999;">If you didn't request this PIN, please ignore this email.</p>
        </div>
      `
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw new Error('Failed to send email');
    }

    console.log('PIN sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'PIN sent successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-admin-pin:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});