import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, pin } = await req.json();
    
    console.log('Verifying PIN for email:', email);

    // Validate inputs
    if (!email || !pin) {
      throw new Error('Email and PIN are required');
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits');
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if PIN exists and is valid
    const { data: pinData, error: pinError } = await supabase
      .from('admin_pins')
      .select('*')
      .eq('email', email)
      .eq('pin', pin)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (pinError) {
      console.error('Error checking PIN:', pinError);
      throw new Error('Failed to verify PIN');
    }

    if (!pinData) {
      console.log('Invalid or expired PIN');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired PIN' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // PIN is valid, delete it (one-time use)
    await supabase
      .from('admin_pins')
      .delete()
      .eq('id', pinData.id);

    // Check if user exists
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error checking user:', userError);
      throw new Error('Failed to check user');
    }

    const existingUser = users?.find(u => u.email === email);
    
    // If user doesn't exist, create them
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: email === 'dubem4521@gmail.com' ? 'Taku' : 'Admin'
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        throw new Error('Failed to create user');
      }

      console.log('New user created:', newUser.user?.id);
    }

    // Generate a session token for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (sessionError || !sessionData) {
      console.error('Error generating session:', sessionError);
      throw new Error('Failed to generate session');
    }

    console.log('PIN verified successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        session: sessionData,
        message: 'PIN verified successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in verify-admin-pin:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});