import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, PawPrint, Heart, Stethoscope, User, Phone, ArrowLeft, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

export default function SignupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { fullName, email, contact, password, confirmPassword } = form;
    if (!fullName || !email || !contact || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: fullName, contact },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    // Save contact on the owner record if we have a session
    if (data.session) {
      await supabase.from("owners").update({ contact }).eq("user_id", data.user!.id);
    }
    toast({
      title: "Account created",
      description: data.session
        ? `Welcome, ${fullName}!`
        : `Welcome, ${fullName}! Please check your email to confirm, then sign in.`,
    });
    navigate(data.session ? "/user" : "/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-12 text-primary-foreground">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary-foreground/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary-foreground/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-primary-foreground/10 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-md text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-primary-foreground/15 backdrop-blur-sm p-5 rounded-2xl">
              <img src={logo} alt="Harbourside Veterinary Clinic" width={80} height={80} />
            </div>
          </div>
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">Join Harbourside</h1>
            <p className="text-primary-foreground/80 text-lg mt-2">Care that follows your pet, anywhere</p>
          </div>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-primary-foreground/15 p-2.5 rounded-lg shrink-0">
                <PawPrint className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Track Your Pets</p>
                <p className="text-primary-foreground/70 text-xs">Profiles, history, and reminders in one place</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-primary-foreground/15 p-2.5 rounded-lg shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Book Appointments</p>
                <p className="text-primary-foreground/70 text-xs">Schedule check-ups in just a few taps</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-primary-foreground/15 p-2.5 rounded-lg shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Stay Notified</p>
                <p className="text-primary-foreground/70 text-xs">Vaccination & care alerts when it matters</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src={logo} alt="Harbourside Veterinary Clinic" width={64} height={64} className="mb-3" />
            <h1 className="font-heading text-2xl font-bold text-foreground">Create your account</h1>
          </div>

          <div className="mb-8 hidden lg:block">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
            <h2 className="font-heading text-2xl font-bold text-foreground">Create your account</h2>
            <p className="text-muted-foreground text-sm mt-1">Sign up as a pet owner to get started</p>
          </div>

          <Card className="border-0 shadow-xl shadow-primary/5">
            <CardContent className="p-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-name" placeholder="Jane Doe" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="pl-10 h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-10 h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-contact" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-contact" placeholder="+63 900 000 0000" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="pl-10 h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pl-10 pr-10 h-11" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-confirm" type={showPassword ? "text" : "password"} placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="pl-10 h-11" />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 text-center font-medium">{error}</p>
                )}

                <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
