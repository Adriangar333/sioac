import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ExportJob, Search, Client } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, FileSpreadsheet, FileText, File, Clock, CheckCircle2, Loader2 } from "lucide-react";

const FORMAT_ICONS: Record<string, any> = {
  xlsx: FileSpreadsheet,
  csv: FileText,
  pdf: File,
};

export default function ExportsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: jobs, isLoading } = useQuery<ExportJob[]>({
    queryKey: ["/api/exports"],
  });

  const { data: searchList } = useQuery<Search[]>({
    queryKey: ["/api/searches"],
  });

  const { data: clientList } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/exports", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exports"] });
      setDialogOpen(false);
      toast({ title: "Exportación creada", description: "El archivo se generará en unos segundos" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const getClientName = (searchId: number | null) => {
    if (!searchId) return "Todos";
    const search = searchList?.find(s => s.id === searchId);
    if (!search) return `Búsqueda #${searchId}`;
    return clientList?.find(c => c.id === search.clientId)?.name || `Cliente #${search.clientId}`;
  };

  const handleDownload = async (jobId: number) => {
    try {
      const res = await fetch(`/api/exports/${jobId}/download`);
      if (!res.ok) throw new Error("Error al descargar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-${jobId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6" data-testid="exports-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Exportaciones</h1>
          <p className="text-sm text-muted-foreground">Genera y descarga informes de resultados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-new-export">
              <Plus className="h-4 w-4 mr-1" /> Nueva exportación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva exportación</DialogTitle>
            </DialogHeader>
            <ExportForm
              searches={searchList || []}
              clients={clientList || []}
              onSubmit={(data) => createMutation.mutate(data)}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : !jobs?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay exportaciones registradas
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Búsqueda / Cliente</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map(job => {
                const FormatIcon = FORMAT_ICONS[job.format] || File;
                return (
                  <TableRow key={job.id} data-testid={`row-export-${job.id}`}>
                    <TableCell className="font-mono text-xs">#{job.id}</TableCell>
                    <TableCell className="text-sm">{getClientName(job.searchId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <FormatIcon className="h-3 w-3" />
                        {job.format.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={job.status === "completed" ? "default" : job.status === "processing" ? "secondary" : "outline"}
                        className="text-[10px] gap-1"
                      >
                        {job.status === "completed" ? <CheckCircle2 className="h-3 w-3" /> :
                         job.status === "processing" ? <Loader2 className="h-3 w-3 animate-spin" /> :
                         <Clock className="h-3 w-3" />}
                        {job.status === "completed" ? "Completada" : job.status === "processing" ? "Procesando" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(job.createdAt).toLocaleDateString("es-CO")}</TableCell>
                    <TableCell className="text-right">
                      {job.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDownload(job.id)}
                          data-testid={`button-download-export-${job.id}`}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> Descargar
                        </Button>
                      )}
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

function ExportForm({ searches, clients, onSubmit, isSubmitting }: { searches: any[]; clients: any[]; onSubmit: (data: any) => void; isSubmitting: boolean }) {
  const [searchId, setSearchId] = useState("");
  const [format, setFormat] = useState("xlsx");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  const getClientName = (clientId: number) => clients.find((c: any) => c.id === clientId)?.name || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      searchId: searchId ? parseInt(searchId) : null,
      format,
      filters: JSON.stringify({ sentiment: sentimentFilter }),
      status: "pending",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Búsqueda</Label>
        <Select value={searchId} onValueChange={setSearchId}>
          <SelectTrigger data-testid="select-export-search"><SelectValue placeholder="Seleccionar búsqueda..." /></SelectTrigger>
          <SelectContent>
            {searches.filter(s => s.status === "completed").map(s => (
              <SelectItem key={s.id} value={s.id.toString()}>
                #{s.id} — {getClientName(s.clientId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm">Formato</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger data-testid="select-export-format"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              <SelectItem value="csv">CSV (.csv)</SelectItem>
              <SelectItem value="pdf">PDF (.pdf)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Filtro sentimiento</Label>
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger data-testid="select-export-sentiment"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="negative">Solo negativos</SelectItem>
              <SelectItem value="positive">Solo positivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-create-export">
        {isSubmitting ? "Creando..." : "Crear exportación"}
      </Button>
    </form>
  );
}
