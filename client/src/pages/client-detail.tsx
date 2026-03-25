import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { Client, Search } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Building2, MapPin, Calendar, FileText, Search as SearchIcon, Plus } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = parseInt(params.id || "0");

  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: ["/api/clients", clientId],
  });

  const { data: allSearches } = useQuery<Search[]>({
    queryKey: ["/api/searches"],
  });

  const clientSearches = allSearches?.filter(s => s.clientId === clientId) || [];

  if (clientLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <Link href="/clients"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Button></Link>
        <p className="text-muted-foreground">Cliente no encontrado</p>
      </div>
    );
  }

  const keywords = JSON.parse(client.keywords || "[]") as string[];
  const variations = JSON.parse(client.variations || "[]") as string[];

  return (
    <div className="space-y-6" data-testid="client-detail-page">
      <div className="flex items-center gap-3">
        <Link href="/clients"><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-semibold">{client.name}</h1>
          <p className="text-sm text-muted-foreground">{client.company} · {client.industry}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Perfil del cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{client.company || "Sin empresa"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{client.country} · {client.language}</span>
            </div>
            {client.birthYear && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Año de nacimiento: {client.birthYear}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5">Palabras clave</p>
              <div className="flex flex-wrap gap-1">
                {keywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{kw}</Badge>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5">Variaciones del nombre</p>
              <div className="flex flex-wrap gap-1">
                {variations.map((v, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">{v}</Badge>
                ))}
              </div>
            </div>
            {client.notes && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-sm">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Searches History */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Historial de búsquedas</CardTitle>
            <Link href="/searches/new">
              <Button size="sm" data-testid="button-new-search-from-client">
                <Plus className="h-3.5 w-3.5 mr-1" /> Nueva búsqueda
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {clientSearches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay búsquedas registradas para este cliente
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Consultas</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientSearches.map(search => (
                    <TableRow key={search.id}>
                      <TableCell className="font-mono text-xs">#{search.id}</TableCell>
                      <TableCell className="text-sm">{new Date(search.createdAt).toLocaleDateString("es-CO")}</TableCell>
                      <TableCell>
                        <Badge variant={search.status === "completed" ? "default" : search.status === "failed" ? "destructive" : "secondary"} className="text-[10px]">
                          {search.status === "completed" ? "Completada" : search.status === "running" ? "Ejecutando" : search.status === "failed" ? "Fallida" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{search.completedQueries}/{search.totalQueries}</TableCell>
                      <TableCell>
                        <Link href={`/searches/${search.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" /> Ver resultados
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
