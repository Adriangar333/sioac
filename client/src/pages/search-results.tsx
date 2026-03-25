import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { Result, Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Search, Download, Filter } from "lucide-react";

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

const CLASS_BADGE: Record<string, { label: string; className: string }> = {
  main_news: { label: "Noticia principal", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  secondary_mention: { label: "Mención secundaria", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  potential_deindex: { label: "Posible desindexación", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  irrelevant: { label: "Irrelevante", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  pending_review: { label: "Revisión pendiente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
};

export default function SearchResultsPage() {
  const params = useParams<{ id: string }>();
  const searchId = parseInt(params.id || "0");
  const [searchText, setSearchText] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const { data: searchData, isLoading } = useQuery<any>({
    queryKey: ["/api/searches", searchId],
  });

  const { data: clientList } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const results: Result[] = searchData?.results || [];
  const clientName = clientList?.find(c => c.id === searchData?.clientId)?.name || "";

  const filtered = results.filter(r => {
    if (searchText && !r.title.toLowerCase().includes(searchText.toLowerCase()) && !r.url.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (sentimentFilter !== "all" && r.sentiment !== sentimentFilter) return false;
    if (confidenceFilter !== "all" && r.identityConfidence !== confidenceFilter) return false;
    if (classFilter !== "all" && r.classification !== classFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="search-results-page">
      <div className="flex items-center gap-3">
        <Link href="/searches"><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-semibold">Resultados de búsqueda #{searchId}</h1>
          <p className="text-sm text-muted-foreground">{clientName} · {results.length} resultados</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título o URL..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-results"
                />
              </div>
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[140px]" data-testid="filter-sentiment"><SelectValue placeholder="Sentimiento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="very_positive">Muy positivo</SelectItem>
                <SelectItem value="positive">Positivo</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negativo</SelectItem>
                <SelectItem value="very_negative">Muy negativo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="w-[130px]" data-testid="filter-confidence"><SelectValue placeholder="Confianza" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[170px]" data-testid="filter-classification"><SelectValue placeholder="Clasificación" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="main_news">Noticia principal</SelectItem>
                <SelectItem value="secondary_mention">Mención secundaria</SelectItem>
                <SelectItem value="potential_deindex">Posible desindexación</SelectItem>
                <SelectItem value="irrelevant">Irrelevante</SelectItem>
                <SelectItem value="pending_review">Revisión pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{filtered.length} de {results.length} resultados</p>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[250px]">Título / URL</TableHead>
                <TableHead>Sentimiento</TableHead>
                <TableHead>Confianza</TableHead>
                <TableHead>Clasificación</TableHead>
                <TableHead className="hidden md:table-cell">Fuente</TableHead>
                <TableHead className="hidden md:table-cell">Keyword</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(result => {
                const sentBadge = SENTIMENT_BADGE[result.sentiment] || SENTIMENT_BADGE.neutral;
                const confBadge = CONFIDENCE_BADGE[result.identityConfidence] || CONFIDENCE_BADGE.medium;
                const classBadge = CLASS_BADGE[result.classification] || CLASS_BADGE.pending_review;

                return (
                  <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <Link href={`/results/${result.id}`}>
                          <span className="text-sm font-medium hover:text-primary cursor-pointer line-clamp-1" data-testid={`link-result-${result.id}`}>
                            {result.isNew ? <Badge variant="outline" className="text-[9px] mr-1.5 text-primary border-primary">NUEVO</Badge> : null}
                            {result.title}
                          </span>
                        </Link>
                        <p className="text-[10px] text-muted-foreground truncate">{result.domain}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${sentBadge.className}`}>{sentBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${confBadge.className}`}>{confBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${classBadge.className}`}>{classBadge.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground capitalize">{result.sourceType}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{result.matchedKeyword}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/results/${result.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-view-result-${result.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
