import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Search, Zap, Eye, Rocket } from "lucide-react";

const STEPS = [
  { label: "Cliente", icon: "👤" },
  { label: "Palabras clave", icon: "🔑" },
  { label: "Motores", icon: "🔍" },
  { label: "Vista previa", icon: "👁" },
  { label: "Ejecutar", icon: "🚀" },
];

export default function SearchWizardPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [keywords, setKeywords] = useState("");
  const [extraVariations, setExtraVariations] = useState("");
  const [includeMisspellings, setIncludeMisspellings] = useState(true);
  const [engines, setEngines] = useState<string[]>(["google"]);
  const [countries, setCountries] = useState<string[]>(["CO"]);
  const [preview, setPreview] = useState<any>(null);

  const { data: clientList, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const selectedClient = clientList?.find(c => c.id === parseInt(selectedClientId));

  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClient) throw new Error("Cliente requerido");
      const clientKeywords = JSON.parse(selectedClient.keywords || "[]") as string[];
      const clientVariations = JSON.parse(selectedClient.variations || "[]") as string[];
      const allKeywords = [
        ...clientKeywords,
        ...keywords.split(",").map(k => k.trim()).filter(Boolean),
      ];
      const allVariations = [
        ...clientVariations,
        ...extraVariations.split(",").map(v => v.trim()).filter(Boolean),
      ];
      const res = await apiRequest("POST", "/api/generator/preview", {
        clientName: selectedClient.name,
        variations: allVariations,
        keywords: allKeywords,
        includeMisspellings,
      });
      return res.json();
    },
    onSuccess: (data) => setPreview(data),
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const createSearchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/searches", {
        clientId: parseInt(selectedClientId),
        status: "completed",
        totalQueries: preview?.totalQueries || 0,
        completedQueries: preview?.totalQueries || 0,
        config: JSON.stringify({ engines, countries, keywords: keywords.split(",").map(k => k.trim()).filter(Boolean) }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/searches"] });
      toast({ title: "Búsqueda creada", description: `Se generaron ${preview?.totalQueries || 0} consultas` });
      navigate(`/searches/${data.id}`);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const canAdvance = () => {
    if (step === 0) return !!selectedClientId;
    if (step === 1) return true;
    if (step === 2) return engines.length > 0;
    if (step === 3) return !!preview;
    return true;
  };

  const handleNext = () => {
    if (step === 2) {
      previewMutation.mutate();
    }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const toggleEngine = (engine: string) => {
    setEngines(prev => prev.includes(engine) ? prev.filter(e => e !== engine) : [...prev, engine]);
  };

  const toggleCountry = (country: string) => {
    setCountries(prev => prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]);
  };

  return (
    <div className="space-y-6 max-w-3xl" data-testid="search-wizard-page">
      <h1 className="text-xl font-semibold">Nueva búsqueda</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer
                ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
              `}
              onClick={() => i < step && setStep(i)}
              data-testid={`step-indicator-${i}`}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-6 h-px mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {step === 0 && (
            <div className="space-y-4" data-testid="step-select-client">
              <Label className="text-sm font-medium">Seleccionar cliente</Label>
              {clientsLoading ? (
                <Skeleton className="h-10" />
              ) : (
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger data-testid="select-search-client"><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
                  <SelectContent>
                    {clientList?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name} — {c.company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedClient && (
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">{selectedClient.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedClient.company} · {selectedClient.industry} · {selectedClient.country}</p>
                  <div className="flex gap-1 flex-wrap">
                    {JSON.parse(selectedClient.keywords || "[]").map((kw: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4" data-testid="step-keywords">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Palabras clave adicionales (separadas por coma)</Label>
                <Input
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="demanda, investigación, multa"
                  data-testid="input-extra-keywords"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Variaciones adicionales del nombre</Label>
                <Input
                  value={extraVariations}
                  onChange={e => setExtraVariations(e.target.value)}
                  placeholder="J.C. Martínez, Juan C."
                  data-testid="input-extra-variations"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="misspellings"
                  checked={includeMisspellings}
                  onCheckedChange={(checked) => setIncludeMisspellings(!!checked)}
                  data-testid="checkbox-misspellings"
                />
                <Label htmlFor="misspellings" className="text-sm">
                  Incluir errores ortográficos comunes (sustituciones fonéticas en español)
                </Label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4" data-testid="step-engines">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Motores de búsqueda</Label>
                <div className="flex gap-2 flex-wrap">
                  {["google", "bing", "yahoo"].map(engine => (
                    <Button
                      key={engine}
                      variant={engines.includes(engine) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleEngine(engine)}
                      data-testid={`toggle-engine-${engine}`}
                    >
                      {engine.charAt(0).toUpperCase() + engine.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Países</Label>
                <div className="flex gap-2 flex-wrap">
                  {[{code: "CO", name: "Colombia"}, {code: "MX", name: "México"}, {code: "AR", name: "Argentina"}, {code: "ES", name: "España"}, {code: "CL", name: "Chile"}, {code: "US", name: "EE.UU."}].map(c => (
                    <Button
                      key={c.code}
                      variant={countries.includes(c.code) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCountry(c.code)}
                      data-testid={`toggle-country-${c.code}`}
                    >
                      {c.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4" data-testid="step-preview">
              {previewMutation.isPending ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-32" />
                </div>
              ) : preview ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{preview.totalVariations}</p>
                      <p className="text-[10px] text-muted-foreground">Variaciones</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{preview.totalQueries}</p>
                      <p className="text-[10px] text-muted-foreground">Consultas totales</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{preview.misspellings?.length || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Errores fonéticos</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Variaciones del nombre generadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {preview.nameVariations?.map((v: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{v}</Badge>
                      ))}
                    </div>
                  </div>

                  {preview.misspellings?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Errores ortográficos detectados:</p>
                      <div className="flex flex-wrap gap-1">
                        {preview.misspellings?.map((v: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px] text-orange-600">{v}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Muestra de consultas ({Math.min(10, preview.sampleQueries?.length || 0)} de {preview.totalQueries}):</p>
                    <div className="bg-muted/30 rounded-lg p-3 space-y-1 max-h-40 overflow-auto">
                      {preview.sampleQueries?.slice(0, 10).map((q: string, i: number) => (
                        <p key={i} className="text-xs font-mono text-muted-foreground">{q}</p>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Generando vista previa...</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center py-6" data-testid="step-launch">
              <Rocket className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Listo para ejecutar</h3>
              <p className="text-sm text-muted-foreground">
                Se ejecutarán <strong>{preview?.totalQueries || 0}</strong> consultas
                en <strong>{engines.length}</strong> motor(es)
                para <strong>{selectedClient?.name}</strong>
              </p>
              <Button
                size="lg"
                className="mt-4"
                onClick={() => createSearchMutation.mutate()}
                disabled={createSearchMutation.isPending}
                data-testid="button-launch-search"
              >
                {createSearchMutation.isPending ? "Creando..." : "Ejecutar búsqueda"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {step < 4 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            data-testid="button-prev-step"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
            data-testid="button-next-step"
          >
            Siguiente <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
