import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@harbourside.com" && password === "admin123") {
      navigate("/admin");
    } else if (email === "user@harbourside.com" && password === "user123") {
      navigate("/user");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Harbourside Veterinary Clinic" width={72} height={72} className="mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground">Harbourside Veterinary</h1>
          <p className="text-muted-foreground text-sm mt-1">Clinic Management System</p>
        </div>

        <Card className="shadow-lg border-0 shadow-primary/5">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-heading text-lg">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@harbourside.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2 text-center">{error}</p>
              )}

              <Button type="submit" className="w-full">Login</Button>

              <Button type="button" variant="link" className="w-full text-sm">
                Forgot Password?
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
              <p><strong>Admin:</strong> admin@harbourside.com / admin123</p>
              <p><strong>User:</strong> user@harbourside.com / user123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
