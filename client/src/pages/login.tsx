import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [email, setEmail] = useState("admin@sioac.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({ title: "Bienvenido", description: "Sesión iniciada correctamente" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Credenciales inválidas", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" data-testid="login-page">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={toggleTheme}
        data-testid="login-toggle-theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Card className="w-full max-w-sm" data-testid="login-card">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            S
          </div>
          <CardTitle className="text-xl font-semibold">SIOAC</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sistema Inteligente de Optimización,<br />Análisis y Clasificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Demo: admin@sioac.com / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
