import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, Edit, ExternalLink, Building2, MapPin } from "lucide-react";

export default function ClientsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const { data: clientList, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setDialogOpen(false);
      toast({ title: "Cliente creado", description: "El cliente se ha creado correctamente" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Cliente eliminado" });
    },
  });

  const filtered = clientList?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6" data-testid="clients-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-new-client">
              <Plus className="h-4 w-4 mr-1" /> Nuevo cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editClient ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
            </DialogHeader>
            <ClientForm
              initial={editClient}
              onSubmit={(data) => createMutation.mutate(data)}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-clients"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No se encontraron clientes
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Empresa</TableHead>
                <TableHead className="hidden md:table-cell">Industria</TableHead>
                <TableHead className="hidden sm:table-cell">País</TableHead>
                <TableHead className="hidden lg:table-cell">Palabras clave</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => {
                const keywords = JSON.parse(client.keywords || "[]") as string[];
                return (
                  <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                    <TableCell>
                      <Link href={`/clients/${client.id}`}>
                        <span className="font-medium text-sm hover:text-primary cursor-pointer" data-testid={`link-client-${client.id}`}>
                          {client.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {client.company || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{client.industry || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {client.country}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {keywords.slice(0, 3).map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{kw}</Badge>
                        ))}
                        {keywords.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">+{keywords.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/clients/${client.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-view-client-${client.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(client.id)}
                          data-testid={`button-delete-client-${client.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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

function ClientForm({ initial, onSubmit, isSubmitting }: { initial?: Client | null; onSubmit: (data: any) => void; isSubmitting: boolean }) {
  const [name, setName] = useState(initial?.name || "");
  const [company, setCompany] = useState(initial?.company || "");
  const [industry, setIndustry] = useState(initial?.industry || "");
  const [country, setCountry] = useState(initial?.country || "CO");
  const [language, setLanguage] = useState(initial?.language || "es");
  const [keywords, setKeywords] = useState(initial ? JSON.parse(initial.keywords).join(", ") : "");
  const [variations, setVariations] = useState(initial ? JSON.parse(initial.variations).join(", ") : "");
  const [notes, setNotes] = useState(initial?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      company,
      industry,
      country,
      language,
      keywords: JSON.stringify(keywords.split(",").map(k => k.trim()).filter(Boolean)),
      variations: JSON.stringify(variations.split(",").map(v => v.trim()).filter(Boolean)),
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label className="text-sm">Nombre completo *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required data-testid="input-client-name" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Empresa</Label>
          <Input value={company} onChange={e => setCompany(e.target.value)} data-testid="input-client-company" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Industria</Label>
          <Input value={industry} onChange={e => setIndustry(e.target.value)} data-testid="input-client-industry" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">País</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger data-testid="select-client-country"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CO">Colombia</SelectItem>
              <SelectItem value="MX">México</SelectItem>
              <SelectItem value="AR">Argentina</SelectItem>
              <SelectItem value="ES">España</SelectItem>
              <SelectItem value="CL">Chile</SelectItem>
              <SelectItem value="PE">Perú</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Idioma</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger data-testid="select-client-language"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">Inglés</SelectItem>
              <SelectItem value="pt">Portugués</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label className="text-sm">Palabras clave (separadas por coma)</Label>
          <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="empresa, fraude, CEO" data-testid="input-client-keywords" />
        </div>
        <div className="col-span-2 space-y-2">
          <Label className="text-sm">Variaciones del nombre (separadas por coma)</Label>
          <Input value={variations} onChange={e => setVariations(e.target.value)} placeholder="J. García, Juan G." data-testid="input-client-variations" />
        </div>
        <div className="col-span-2 space-y-2">
          <Label className="text-sm">Notas</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} data-testid="input-client-notes" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-save-client">
        {isSubmitting ? "Guardando..." : "Guardar cliente"}
      </Button>
    </form>
  );
}
