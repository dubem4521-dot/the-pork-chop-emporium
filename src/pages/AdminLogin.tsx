import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in and is admin
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (roles) {
          navigate("/admin/dashboard");
        }
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const emailInput = formData.get("admin-email") as string;
    setEmail(emailInput);

    try {
      // Call edge function to send 4-digit PIN
      const { data, error } = await supabase.functions.invoke('send-admin-pin', {
        body: { email: emailInput }
      });

      if (error) {
        toast.error(error.message || 'Failed to send PIN');
        setIsLoading(false);
        return;
      }

      toast.success("4-digit PIN sent to your email");
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const pin = formData.get("otp") as string;

    try {
      // Call edge function to verify 4-digit PIN
      const { data, error } = await supabase.functions.invoke('verify-admin-pin', {
        body: { email, pin }
      });

      if (error || !data?.success) {
        toast.error(data?.error || error?.message || 'Invalid PIN');
        setIsLoading(false);
        return;
      }

      // Sign in with the session from the edge function
      if (data.session?.properties?.hashed_token) {
        const { error: signInError } = await supabase.auth.verifyOtp({
          token_hash: data.session.properties.hashed_token,
          type: 'magiclink',
        });

        if (signInError) {
          toast.error('Failed to establish session');
          setIsLoading(false);
          return;
        }
      }

      // Verify admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication failed");
        setIsLoading(false);
        return;
      }

      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roles) {
        await supabase.auth.signOut();
        toast.error("Access denied. Admin credentials required.");
        setIsLoading(false);
        return;
      }

      toast.success("Admin access granted");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            {step === 'email' ? (
              <Mail className="h-8 w-8 text-primary" />
            ) : (
              <Lock className="h-8 w-8 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Access</h1>
          <p className="text-muted-foreground">
            {step === 'email' 
              ? 'Enter your admin email to receive a verification code' 
              : 'Enter the 4-digit code sent to your email'}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                name="admin-email"
                type="email"
                placeholder="Email"
                required
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending Code..." : "Send Verification Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="0000"
                maxLength={4}
                required
                className="text-center text-3xl tracking-widest"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify & Access Dashboard"}
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={() => setStep('email')}
              className="w-full"
            >
              Use Different Email
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-sm"
          >
            Back to Main Site
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
