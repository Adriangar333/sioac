import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  Users,
  Search as SearchIcon,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

const SENTIMENT_COLORS: Record<string, string> = {
  very_positive: "#22c55e",
  positive: "#86efac",
  neutral: "#94a3b8",
  negative: "#f87171",
  very_negative: "#dc2626",
};

const SENTIMENT_LABELS: Record<string, string> = {
  very_positive: "Muy positivo",
  positive: "Positivo",
  neutral: "Neutral",
  negative: "Negativo",
  very_negative: "Muy negativo",
};

const CLASS_COLORS: Record<string, string> = {
  main_news: "#01696F",
  secondary_mention: "#64748b",
  potential_deindex: "#dc2626",
  irrelevant: "#9ca3af",
  pending_review: "#eab308",
};

const CLASS_LABELS: Record<string, string> = {
  main_news: "Noticia principal",
  secondary_mention: "Mención secundaria",
  potential_deindex: "Posible desindexación",
  irrelevant: "Irrelevante",
  pending_review: "Revisión pendiente",
};

const SOURCE_COLORS: Record<string, string> = {
  web: "#01696F",
  news: "#3b82f6",
  social: "#a855f7",
  blog: "#f59e0b",
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="dashboard-loading">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const sentimentData = stats ? Object.entries(stats.sentimentDistribution).map(([key, val]) => ({
    name: SENTIMENT_LABELS[key] || key,
    value: val as number,
    fill: SENTIMENT_COLORS[key] || "#94a3b8",
  })).filter(d => d.value > 0) : [];

  const classData = stats ? Object.entries(stats.classificationDistribution).map(([key, val]) => ({
    name: CLASS_LABELS[key] || key,
    value: val as number,
    fill: CLASS_COLORS[key] || "#94a3b8",
  })).filter(d => d.value > 0) : [];

  const sourceData = stats ? Object.entries(stats.sourceDistribution).map(([key, val]) => ({
    name: key === "web" ? "Web" : key === "news" ? "Noticias" : key === "social" ? "Redes sociales" : "Blog",
    value: val as number,
    fill: SOURCE_COLORS[key] || "#94a3b8",
  })) : [];

  const timelineData = stats?.timeline || [];

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Badge variant="outline" className="text-xs">
          Última actualización: {new Date().toLocaleString("es-CO")}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card data-testid="kpi-total-results">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total resultados</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalResults || 0}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="kpi-negative">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">% Negativo</p>
                <p className="text-2xl font-bold mt-1 text-destructive">{stats?.negativePercent || 0}%</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="kpi-high-confidence">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">% Alta confianza</p>
                <p className="text-2xl font-bold mt-1">{stats?.highConfidencePercent || 0}%</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="kpi-new-results">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Nuevos</p>
                <p className="text-2xl font-bold mt-1">{stats?.newResults || 0}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="kpi-clients">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalClients || 0}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="kpi-searches">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Búsquedas</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalSearches || 0}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <SearchIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sentiment Distribution */}
        <Card data-testid="chart-sentiment">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribución por sentimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {sentimentData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card data-testid="chart-source">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resultados por fuente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sourceData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Classification Breakdown */}
        <Card data-testid="chart-classification">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clasificación de resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={classData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, value }) => `${value}`}
                  labelLine={false}
                >
                  {classData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card data-testid="chart-timeline">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Línea temporal de resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(183, 98%, 22%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
