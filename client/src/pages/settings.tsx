import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Key, User, Bell, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [serperKey, setSerperKey] = useState("");
  const [serpApiKey, setSerpApiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [googleNlKey, setGoogleNlKey] = useState("");
  const [jinaKey, setJinaKey] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(true);

  const handleSaveKeys = () => {
    toast({ title: "Configuración guardada", description: "Las claves API se han actualizado (demo)" });
  };

  return (
    <div className="space-y-6 max-w-3xl" data-testid="settings-page">
      <h1 className="text-xl font-semibold">Configuración</h1>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="api" className="text-xs"><Key className="h-3 w-3 mr-1" /> Claves API</TabsTrigger>
          <TabsTrigger value="profile" className="text-xs"><User className="h-3 w-3 mr-1" /> Perfil</TabsTrigger>
          <TabsTrigger value="system" className="text-xs"><Shield className="h-3 w-3 mr-1" /> Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Configuración de APIs</CardTitle>
              <CardDescription className="text-xs">
                Configure las claves de acceso para los servicios externos utilizados por SIOAC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Serper API Key</Label>
                <Input
                  type="password"
                  value={serperKey}
                  onChange={e => setSerperKey(e.target.value)}
                  placeholder="••••••••••"
                  data-testid="input-serper-key"
                />
                <p className="text-[10px] text-muted-foreground">Servicio primario para búsquedas en Google</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">SerpAPI Key</Label>
                <Input
                  type="password"
                  value={serpApiKey}
                  onChange={e => setSerpApiKey(e.target.value)}
                  placeholder="••••••••••"
                  data-testid="input-serpapi-key"
                />
                <p className="text-[10px] text-muted-foreground">Servicio de respaldo para Bing y Yahoo</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Claude API Key</Label>
                <Input
                  type="password"
                  value={claudeKey}
                  onChange={e => setClaudeKey(e.target.value)}
                  placeholder="••••••••••"
                  data-testid="input-claude-key"
                />
                <p className="text-[10px] text-muted-foreground">Análisis profundo de contenido negativo</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Google Cloud NL API Key</Label>
                <Input
                  type="password"
                  value={googleNlKey}
                  onChange={e => setGoogleNlKey(e.target.value)}
                  placeholder="••••••••••"
                  data-testid="input-google-nl-key"
                />
                <p className="text-[10px] text-muted-foreground">Análisis de sentimiento de entidades</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Jina Reader API Key</Label>
                <Input
                  type="password"
                  value={jinaKey}
                  onChange={e => setJinaKey(e.target.value)}
                  placeholder="••••••••••"
                  data-testid="input-jina-key"
                />
                <p className="text-[10px] text-muted-foreground">Extracción de contenido de URLs</p>
              </div>
              <Button onClick={handleSaveKeys} className="w-full" data-testid="button-save-keys">
                <Save className="h-4 w-4 mr-1" /> Guardar configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Perfil de usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Badge variant="secondary" className="ml-auto text-[10px]">{user?.role || "analyst"}</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Nombre</Label>
                <Input defaultValue={user?.name} data-testid="input-profile-name" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Correo electrónico</Label>
                <Input defaultValue={user?.email} disabled data-testid="input-profile-email" />
              </div>
              <Button variant="outline" className="w-full" data-testid="button-save-profile">
                <Save className="h-4 w-4 mr-1" /> Guardar cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Preferencias del sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Notificaciones de nuevos resultados</p>
                  <p className="text-xs text-muted-foreground">Recibir alertas cuando se detecte contenido nuevo</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} data-testid="toggle-notifications" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Análisis automático</p>
                  <p className="text-xs text-muted-foreground">Ejecutar análisis de sentimiento e identidad automáticamente</p>
                </div>
                <Switch checked={autoAnalysis} onCheckedChange={setAutoAnalysis} data-testid="toggle-auto-analysis" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
