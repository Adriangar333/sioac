import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ClassificationRule } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Shield, ArrowUpDown } from "lucide-react";

const CLASS_LABELS: Record<string, string> = {
  main_news: "Noticia principal",
  secondary_mention: "Mención secundaria",
  potential_deindex: "Posible desindexación",
  irrelevant: "Irrelevante",
  pending_review: "Revisión pendiente",
};

export default function RulesPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: rules, isLoading } = useQuery<ClassificationRule[]>({
    queryKey: ["/api/rules"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      toast({ title: "Regla eliminada" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/rules", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      setDialogOpen(false);
      toast({ title: "Regla creada" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/rules/${id}`, { isActive: isActive ? 1 : 0 });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
    },
  });

  return (
    <div className="space-y-6" data-testid="rules-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Motor de reglas</h1>
          <p className="text-sm text-muted-foreground">Configura reglas automáticas de clasificación de resultados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-new-rule">
              <Plus className="h-4 w-4 mr-1" /> Nueva regla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva regla de clasificación</DialogTitle>
            </DialogHeader>
            <RuleForm onSubmit={(data) => createMutation.mutate(data)} isSubmitting={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : !rules?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay reglas configuradas
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Condiciones</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead className="text-center">Activa</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map(rule => {
                const conditions = JSON.parse(rule.conditions || "[]");
                return (
                  <TableRow key={rule.id} data-testid={`row-rule-${rule.id}`}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{rule.priority}</TableCell>
                    <TableCell className="text-sm font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {conditions.map((c: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {c.field} {c.operator} {Array.isArray(c.value) ? c.value.join(", ") : c.value}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{CLASS_LABELS[rule.action] || rule.action}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={!!rule.isActive}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: rule.id, isActive: checked })}
                        data-testid={`toggle-rule-${rule.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(rule.id)}
                        data-testid={`button-delete-rule-${rule.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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

function RuleForm({ onSubmit, isSubmitting }: { onSubmit: (data: any) => void; isSubmitting: boolean }) {
  const [name, setName] = useState("");
  const [condField, setCondField] = useState("sentiment");
  const [condOperator, setCondOperator] = useState("eq");
  const [condValue, setCondValue] = useState("");
  const [action, setAction] = useState("pending_review");
  const [priority, setPriority] = useState("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const conditions = [{
      field: condField,
      operator: condOperator,
      value: condOperator === "in" ? condValue.split(",").map(v => v.trim()) : condValue,
    }];
    onSubmit({ name, conditions: JSON.stringify(conditions), action, priority: parseInt(priority), isActive: 1 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Nombre de la regla</Label>
        <Input value={name} onChange={e => setName(e.target.value)} required data-testid="input-rule-name" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label className="text-sm">Campo</Label>
          <Select value={condField} onValueChange={setCondField}>
            <SelectTrigger data-testid="select-cond-field"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sentiment">Sentimiento</SelectItem>
              <SelectItem value="identityConfidence">Confianza</SelectItem>
              <SelectItem value="sourceType">Tipo fuente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Operador</Label>
          <Select value={condOperator} onValueChange={setCondOperator}>
            <SelectTrigger data-testid="select-cond-operator"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="eq">Igual a</SelectItem>
              <SelectItem value="in">Incluye</SelectItem>
              <SelectItem value="neq">Diferente de</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Valor</Label>
          <Input value={condValue} onChange={e => setCondValue(e.target.value)} required placeholder="negative" data-testid="input-cond-value" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm">Acción (clasificar como)</Label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger data-testid="select-rule-action"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="main_news">Noticia principal</SelectItem>
              <SelectItem value="secondary_mention">Mención secundaria</SelectItem>
              <SelectItem value="potential_deindex">Posible desindexación</SelectItem>
              <SelectItem value="irrelevant">Irrelevante</SelectItem>
              <SelectItem value="pending_review">Revisión pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Prioridad</Label>
          <Input type="number" value={priority} onChange={e => setPriority(e.target.value)} min="1" data-testid="input-rule-priority" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-save-rule">
        {isSubmitting ? "Guardando..." : "Guardar regla"}
      </Button>
    </form>
  );
}
