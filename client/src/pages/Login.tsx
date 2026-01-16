import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    // Dev mode: skip auth and go straight to the dashboard
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg shadow-primary/20">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight">SOLESTATS</h1>
          <p className="text-muted-foreground text-lg">
            Track trends. Manage your collection. Stay ahead.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Button
  className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
  size="lg"
  onClick={() => {
    window.location.href = "/dashboard";
  }}
>
  {"Let's See Your Solection"}
</Button>
        </div>
      </div>
    </div>
  );
}
