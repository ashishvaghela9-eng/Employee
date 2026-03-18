import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2 } from "lucide-react";
import lightLogo from "@assets/logo_1773643382976.jpg";

export default function Login() {
  const [email, setEmail] = useState("ashish.vaghela@lightfinance.com");
  const [password, setPassword] = useState("admin@123");
  const { login } = useAuth();
  const { toast } = useToast();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Image */}
      <div className="hidden lg:flex flex-1 relative bg-sidebar overflow-hidden">
        {/* Abstract background image */}
        <img 
          src={`${import.meta.env.BASE_URL}images/login-bg.jpg`} 
          alt="Login Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-16 w-full max-w-2xl">
          <div className="mb-8">
            <img src={lightLogo} alt="Light Finance" className="h-16 w-auto object-contain rounded-2xl bg-white px-3 py-2 shadow-2xl" />
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
            Employee <br/>Master System
          </h1>
          <p className="text-lg text-sidebar-foreground/80 leading-relaxed">
            Centralized platform for managing employee records, system accesses, 
            and lifecycle events securely and efficiently.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <div className="lg:hidden mx-auto mb-6 w-fit">
              <img src={lightLogo} alt="Light Finance" className="h-12 w-auto object-contain rounded-xl bg-white px-2 py-1.5 shadow-md" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground">Sign in</h2>
            <p className="mt-2 text-muted-foreground">Enter your credentials to access the portal</p>
          </div>

          <div className="bg-card p-8 rounded-3xl shadow-xl shadow-black/5 border border-border/50 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@lightfinance.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-background"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
