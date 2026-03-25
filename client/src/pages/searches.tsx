import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Search, Client } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  completed: { label: "Completada", variant: "default", icon: CheckCircle2 },
  running: { label: "Ejecutando", variant: "secondary", icon: Loader2 },
  pending: { label: "Pendiente", variant: "outline", icon: Clock },
  failed: { label: "Fallida", variant: "destructive", icon: XCircle },
};

export default function SearchesPage() {
  const { data: searchList, isLoading: searchesLoading } = useQuery<Search[]>({
    queryKey: ["/api/searches"],
  });

  const { data: clientList } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const getClientName = (clientId: number) =>
    clientList?.find(c => c.id === clientId)?.name || `Cliente #${clientId}`;

  return (
    <div className="space-y-6" data-testid="searches-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Búsquedas</h1>
        <Link href="/searches/new">
          <Button size="sm" data-testid="button-new-search">
            <Plus className="h-4 w-4 mr-1" /> Nueva búsqueda
          </Button>
        </Link>
      </div>

      {searchesLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : !searchList?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay búsquedas registradas
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Consultas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchList.map(search => {
                const status = STATUS_MAP[search.status] || STATUS_MAP.pending;
                const StatusIcon = status.icon;
                return (
                  <TableRow key={search.id} data-testid={`row-search-${search.id}`}>
                    <TableCell className="font-mono text-xs">#{search.id}</TableCell>
                    <TableCell className="text-sm font-medium">{getClientName(search.clientId)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(search.createdAt).toLocaleDateString("es-CO")}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="text-[10px] gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{search.completedQueries}/{search.totalQueries}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/searches/${search.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs" data-testid={`button-view-search-${search.id}`}>
                          <FileText className="h-3 w-3 mr-1" /> Ver resultados
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
