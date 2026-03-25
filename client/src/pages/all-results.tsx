import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Search, Client, Result } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, ExternalLink } from "lucide-react";

const SENTIMENT_BADGE: Record<string, { label: string; className: string }> = {
  very_positive: { label: "Muy positivo", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  positive: { label: "Positivo", className: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  neutral: { label: "Neutral", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  negative: { label: "Negativo", className: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  very_negative: { label: "Muy negativo", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

const CONFIDENCE_BADGE: Record<string, { label: string; className: string }> = {
  high: { label: "Alta", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  medium: { label: "Media", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  low: { label: "Baja", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

export default function AllResultsPage() {
  const [searchText, setSearchText] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  const { data: searchList, isLoading: searchesLoading } = useQuery<Search[]>({
    queryKey: ["/api/searches"],
  });

  const { data: clientList } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Collect results from all completed searches
  const allSearchIds = searchList?.filter(s => s.status === "completed").map(s => s.id) || [];

  // We'll fetch all search results individually
  const searchQueries = allSearchIds.map(id => ({
    queryKey: ["/api/searches", id],
  }));

  // For simplicity, show a link to each search instead
  const getClientName = (clientId: number) =>
    clientList?.find(c => c.id === clientId)?.name || `Cliente #${clientId}`;

  return (
    <div className="space-y-6" data-testid="all-results-page">
      <h1 className="text-xl font-semibold">Resultados</h1>
      <p className="text-sm text-muted-foreground">
        Seleccione una búsqueda para ver sus resultados detallados.
      </p>

      {searchesLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchList?.filter(s => s.status === "completed").map(search => (
            <Link key={search.id} href={`/searches/${search.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer" data-testid={`card-search-${search.id}`}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-muted-foreground">Búsqueda #{search.id}</span>
                    <Badge variant="default" className="text-[10px]">Completada</Badge>
                  </div>
                  <p className="text-sm font-medium">{getClientName(search.clientId)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {search.completedQueries} consultas · {new Date(search.createdAt).toLocaleDateString("es-CO")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
