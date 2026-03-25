import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Result } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Globe, Calendar, Tag, Image, Shield, MessageSquare, History } from "lucide-react";

export default function ResultDetailPage() {
  const params = useParams<{ id: string }>();
  const resultId = parseInt(params.id || "0");
  const { toast } = useToast();

  const { data: result, isLoading } = useQuery<Result>({
    queryKey: ["/api/results", resultId],
  });

  const classifyMutation = useMutation({
    mutationFn: async (classification: string) => {
      const res = await apiRequest("PATCH", `/api/results/${resultId}/classify`, { classification });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results", resultId] });
      toast({ title: "Clasificación actualizada" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-4">
        <Link href="/searches"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Button></Link>
        <p className="text-muted-foreground">Resultado no encontrado</p>
      </div>
    );
  }

  const classHistory = JSON.parse(result.classificationHistory || "[]");
  const imageAnalysis = JSON.parse(result.imageAnalysis || "{}");

  const sentimentPercent = Math.abs(result.sentimentScore) * 100;
  const identityPercent = result.identityScore * 100;

  return (
    <div className="space-y-4" data-testid="result-detail-page">
      <div className="flex items-center gap-3">
        <Link href={`/searches/${result.searchId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold line-clamp-1">{result.title}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span className="truncate">{result.domain}</span>
            {result.publicationYear && (
              <>
                <Calendar className="h-3 w-3 ml-2" />
                <span>{result.publicationYear}</span>
              </>
            )}
          </div>
        </div>
        <a href={result.url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" data-testid="button-open-url">
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> Abrir URL
          </Button>
        </a>
      </div>

      {/* Quick badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={result.isNew ? "default" : "secondary"} className="text-[10px]">
          {result.isNew ? "Nuevo" : "Existente"}
        </Badge>
        <Badge variant="outline" className="text-[10px] capitalize">{result.sourceType}</Badge>
        {result.matchedKeyword && (
          <Badge variant="secondary" className="text-[10px]">
            <Tag className="h-2.5 w-2.5 mr-1" /> {result.matchedKeyword}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="sentiment" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="sentiment" className="text-xs"><MessageSquare className="h-3 w-3 mr-1" /> Sentimiento</TabsTrigger>
          <TabsTrigger value="identity" className="text-xs"><Shield className="h-3 w-3 mr-1" /> Identidad</TabsTrigger>
          <TabsTrigger value="images" className="text-xs"><Image className="h-3 w-3 mr-1" /> Imágenes</TabsTrigger>
          <TabsTrigger value="classification" className="text-xs"><History className="h-3 w-3 mr-1" /> Clasificación</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Análisis de sentimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`text-xs ${
                  result.sentiment.includes("positive") ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                  result.sentiment === "neutral" ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" :
                  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {result.sentiment === "very_positive" ? "Muy positivo" :
                   result.sentiment === "positive" ? "Positivo" :
                   result.sentiment === "neutral" ? "Neutral" :
                   result.sentiment === "negative" ? "Negativo" : "Muy negativo"}
                </Badge>
                <span className="text-sm text-muted-foreground">Puntaje: {result.sentimentScore.toFixed(2)}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Negativo</span>
                  <span>Positivo</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`absolute h-full rounded-full ${result.sentimentScore >= 0 ? "bg-green-500" : "bg-red-500"}`}
                    style={{
                      left: result.sentimentScore >= 0 ? "50%" : `${50 - sentimentPercent / 2}%`,
                      width: `${sentimentPercent / 2}%`,
                    }}
                  />
                  <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Fragmento del contenido:</p>
                <p className="text-sm">{result.snippet}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Desambiguación de identidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`text-xs ${
                  result.identityConfidence === "high" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                  result.identityConfidence === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  Confianza: {result.identityConfidence === "high" ? "Alta" : result.identityConfidence === "medium" ? "Media" : "Baja"}
                </Badge>
                <span className="text-sm text-muted-foreground">Puntaje: {(result.identityScore * 100).toFixed(0)}%</span>
              </div>
              <Progress value={identityPercent} className="h-2" />
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">Contexto profesional</p>
                  <p className="text-sm font-medium">{(result.identityScore * 0.25 * 100).toFixed(0)}% (peso: 25%)</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">Ubicación geográfica</p>
                  <p className="text-sm font-medium">{(result.identityScore * 0.20 * 100).toFixed(0)}% (peso: 20%)</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">Datos temporales</p>
                  <p className="text-sm font-medium">{(result.identityScore * 0.15 * 100).toFixed(0)}% (peso: 15%)</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">Entidades asociadas</p>
                  <p className="text-sm font-medium">{(result.identityScore * 0.20 * 100).toFixed(0)}% (peso: 20%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Análisis de imágenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.hasClientImage ? (
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                    Imagen del cliente detectada
                  </Badge>
                  {imageAnalysis.confidence && (
                    <p className="text-sm text-muted-foreground">
                      Confianza de reconocimiento facial: {(imageAnalysis.confidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No se detectaron imágenes del cliente en este resultado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classification">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Clasificación y reclasificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm">Clasificación actual:</span>
                <Badge variant="outline" className="text-xs">
                  {result.classification === "main_news" ? "Noticia principal" :
                   result.classification === "secondary_mention" ? "Mención secundaria" :
                   result.classification === "potential_deindex" ? "Posible desindexación" :
                   result.classification === "irrelevant" ? "Irrelevante" : "Revisión pendiente"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Reclasificar:</span>
                <Select onValueChange={(val) => classifyMutation.mutate(val)}>
                  <SelectTrigger className="w-[200px]" data-testid="select-reclassify">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main_news">Noticia principal</SelectItem>
                    <SelectItem value="secondary_mention">Mención secundaria</SelectItem>
                    <SelectItem value="potential_deindex">Posible desindexación</SelectItem>
                    <SelectItem value="irrelevant">Irrelevante</SelectItem>
                    <SelectItem value="pending_review">Revisión pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {classHistory.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Historial de cambios:</p>
                  <div className="space-y-1">
                    {classHistory.map((entry: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{new Date(entry.date).toLocaleDateString("es-CO")}</span>
                        <span>{entry.from} → {entry.to}</span>
                        <Badge variant="outline" className="text-[9px]">{entry.by}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Contenido extraído</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{result.contentText || result.snippet || "Sin contenido disponible."}</p>
        </CardContent>
      </Card>
    </div>
  );
}
