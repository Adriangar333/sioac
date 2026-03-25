import {
  type User, type InsertUser, users,
  type Client, type InsertClient, clients,
  type ClientImage, type InsertClientImage, clientImages,
  type Search, type InsertSearch, searches,
  type SearchQuery, type InsertSearchQuery, searchQueries,
  type Result, type InsertResult, results,
  type ClassificationRule, type InsertClassificationRule, classificationRules,
  type ExportJob, type InsertExportJob, exportJobs,
  type AuditLog, type InsertAuditLog, auditLog,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, and, sql, count } from "drizzle-orm";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

export const db = drizzle(pool);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<void>;

  // Client Images
  getClientImages(clientId: number): Promise<ClientImage[]>;
  createClientImage(image: InsertClientImage): Promise<ClientImage>;

  // Searches
  getSearches(): Promise<Search[]>;
  getSearch(id: number): Promise<Search | undefined>;
  getSearchesByClient(clientId: number): Promise<Search[]>;
  createSearch(search: InsertSearch): Promise<Search>;
  updateSearch(id: number, data: Partial<InsertSearch>): Promise<Search | undefined>;

  // Search Queries
  getSearchQueries(searchId: number): Promise<SearchQuery[]>;
  createSearchQuery(query: InsertSearchQuery): Promise<SearchQuery>;

  // Results
  getResults(searchId: number): Promise<Result[]>;
  getResult(id: number): Promise<Result | undefined>;
  getResultsByClient(clientId: number): Promise<Result[]>;
  createResult(result: InsertResult): Promise<Result>;
  updateResult(id: number, data: Partial<InsertResult>): Promise<Result | undefined>;
  getAllResults(): Promise<Result[]>;

  // Classification Rules
  getRules(): Promise<ClassificationRule[]>;
  getRule(id: number): Promise<ClassificationRule | undefined>;
  createRule(rule: InsertClassificationRule): Promise<ClassificationRule>;
  updateRule(id: number, data: Partial<InsertClassificationRule>): Promise<ClassificationRule | undefined>;
  deleteRule(id: number): Promise<void>;

  // Export Jobs
  getExportJobs(): Promise<ExportJob[]>;
  getExportJob(id: number): Promise<ExportJob | undefined>;
  createExportJob(job: InsertExportJob): Promise<ExportJob>;
  updateExportJob(id: number, data: Partial<InsertExportJob>): Promise<ExportJob | undefined>;

  // Audit Log
  getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  // Stats
  getDashboardStats(): Promise<any>;
}

function now() {
  return new Date().toISOString();
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0];
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0];
  }
  async createUser(user: InsertUser): Promise<User> {
    const rows = await db.insert(users).values({ ...user, createdAt: now() }).returning();
    return rows[0];
  }
  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(desc(clients.createdAt));
  }
  async getClient(id: number): Promise<Client | undefined> {
    const rows = await db.select().from(clients).where(eq(clients.id, id));
    return rows[0];
  }
  async createClient(client: InsertClient): Promise<Client> {
    const rows = await db.insert(clients).values({ ...client, createdAt: now(), updatedAt: now() }).returning();
    return rows[0];
  }
  async updateClient(id: number, data: Partial<InsertClient>): Promise<Client | undefined> {
    const rows = await db.update(clients).set({ ...data, updatedAt: now() }).where(eq(clients.id, id)).returning();
    return rows[0];
  }
  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Client Images
  async getClientImages(clientId: number): Promise<ClientImage[]> {
    return db.select().from(clientImages).where(eq(clientImages.clientId, clientId));
  }
  async createClientImage(image: InsertClientImage): Promise<ClientImage> {
    const rows = await db.insert(clientImages).values({ ...image, createdAt: now() }).returning();
    return rows[0];
  }

  // Searches
  async getSearches(): Promise<Search[]> {
    return db.select().from(searches).orderBy(desc(searches.createdAt));
  }
  async getSearch(id: number): Promise<Search | undefined> {
    const rows = await db.select().from(searches).where(eq(searches.id, id));
    return rows[0];
  }
  async getSearchesByClient(clientId: number): Promise<Search[]> {
    return db.select().from(searches).where(eq(searches.clientId, clientId)).orderBy(desc(searches.createdAt));
  }
  async createSearch(search: InsertSearch): Promise<Search> {
    const rows = await db.insert(searches).values({ ...search, createdAt: now() }).returning();
    return rows[0];
  }
  async updateSearch(id: number, data: Partial<InsertSearch>): Promise<Search | undefined> {
    const rows = await db.update(searches).set(data).where(eq(searches.id, id)).returning();
    return rows[0];
  }

  // Search Queries
  async getSearchQueries(searchId: number): Promise<SearchQuery[]> {
    return db.select().from(searchQueries).where(eq(searchQueries.searchId, searchId));
  }
  async createSearchQuery(query: InsertSearchQuery): Promise<SearchQuery> {
    const rows = await db.insert(searchQueries).values({ ...query, createdAt: now() }).returning();
    return rows[0];
  }

  // Results
  async getResults(searchId: number): Promise<Result[]> {
    return db.select().from(results).where(eq(results.searchId, searchId)).orderBy(desc(results.createdAt));
  }
  async getResult(id: number): Promise<Result | undefined> {
    const rows = await db.select().from(results).where(eq(results.id, id));
    return rows[0];
  }
  async getResultsByClient(clientId: number): Promise<Result[]> {
    return db.select().from(results).where(eq(results.clientId, clientId));
  }
  async createResult(result: InsertResult): Promise<Result> {
    const rows = await db.insert(results).values({ ...result, createdAt: now(), updatedAt: now() }).returning();
    return rows[0];
  }
  async updateResult(id: number, data: Partial<InsertResult>): Promise<Result | undefined> {
    const rows = await db.update(results).set({ ...data, updatedAt: now() }).where(eq(results.id, id)).returning();
    return rows[0];
  }
  async getAllResults(): Promise<Result[]> {
    return db.select().from(results).orderBy(desc(results.createdAt));
  }

  // Classification Rules
  async getRules(): Promise<ClassificationRule[]> {
    return db.select().from(classificationRules).orderBy(classificationRules.priority);
  }
  async getRule(id: number): Promise<ClassificationRule | undefined> {
    const rows = await db.select().from(classificationRules).where(eq(classificationRules.id, id));
    return rows[0];
  }
  async createRule(rule: InsertClassificationRule): Promise<ClassificationRule> {
    const rows = await db.insert(classificationRules).values({ ...rule, createdAt: now() }).returning();
    return rows[0];
  }
  async updateRule(id: number, data: Partial<InsertClassificationRule>): Promise<ClassificationRule | undefined> {
    const rows = await db.update(classificationRules).set(data).where(eq(classificationRules.id, id)).returning();
    return rows[0];
  }
  async deleteRule(id: number): Promise<void> {
    await db.delete(classificationRules).where(eq(classificationRules.id, id));
  }

  // Export Jobs
  async getExportJobs(): Promise<ExportJob[]> {
    return db.select().from(exportJobs).orderBy(desc(exportJobs.createdAt));
  }
  async getExportJob(id: number): Promise<ExportJob | undefined> {
    const rows = await db.select().from(exportJobs).where(eq(exportJobs.id, id));
    return rows[0];
  }
  async createExportJob(job: InsertExportJob): Promise<ExportJob> {
    const rows = await db.insert(exportJobs).values({ ...job, createdAt: now() }).returning();
    return rows[0];
  }
  async updateExportJob(id: number, data: Partial<InsertExportJob>): Promise<ExportJob | undefined> {
    const rows = await db.update(exportJobs).set(data).where(eq(exportJobs.id, id)).returning();
    return rows[0];
  }

  // Audit Log
  async getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]> {
    if (entityType && entityId) {
      return db.select().from(auditLog)
        .where(and(eq(auditLog.entityType, entityType), eq(auditLog.entityId, entityId)))
        .orderBy(desc(auditLog.createdAt));
    }
    return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(100);
  }
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const rows = await db.insert(auditLog).values({ ...log, createdAt: now() }).returning();
    return rows[0];
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    const totalResults = await db.select({ count: count() }).from(results);
    const allResults = await db.select().from(results);
    const totalClients = await db.select({ count: count() }).from(clients);
    const totalSearches = await db.select({ count: count() }).from(searches);

    const negativeCount = allResults.filter(r => r.sentiment === 'negative' || r.sentiment === 'very_negative').length;
    const highConfCount = allResults.filter(r => r.identityConfidence === 'high').length;
    const newCount = allResults.filter(r => r.isNew === 1).length;
    const total = totalResults[0]?.count || 0;

    // Sentiment distribution
    const sentimentDist: Record<string, number> = { very_positive: 0, positive: 0, neutral: 0, negative: 0, very_negative: 0 };
    allResults.forEach(r => { sentimentDist[r.sentiment] = (sentimentDist[r.sentiment] || 0) + 1; });

    // Classification distribution
    const classDist: Record<string, number> = {};
    allResults.forEach(r => { classDist[r.classification] = (classDist[r.classification] || 0) + 1; });

    // Source distribution
    const sourceDist: Record<string, number> = {};
    allResults.forEach(r => { sourceDist[r.sourceType] = (sourceDist[r.sourceType] || 0) + 1; });

    // Monthly timeline (group by month)
    const timeline: Record<string, number> = {};
    allResults.forEach(r => {
      const month = r.createdAt.substring(0, 7);
      timeline[month] = (timeline[month] || 0) + 1;
    });

    return {
      totalResults: total,
      totalClients: totalClients[0]?.count || 0,
      totalSearches: totalSearches[0]?.count || 0,
      negativePercent: total > 0 ? Math.round((negativeCount / total) * 100) : 0,
      highConfidencePercent: total > 0 ? Math.round((highConfCount / total) * 100) : 0,
      newResults: newCount,
      sentimentDistribution: sentimentDist,
      classificationDistribution: classDist,
      sourceDistribution: sourceDist,
      timeline: Object.entries(timeline).map(([month, cnt]) => ({ month, count: cnt })),
    };
  }
}

export const storage = new DatabaseStorage();

// Seed demo data
export async function seedDemoData() {
  try {
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) return;

    // Create admin user (password: admin123)
    await db.insert(users).values({
      email: "admin@sioac.com",
      passwordHash: "admin123",
      name: "Administrador SIOAC",
      role: "admin",
      createdAt: now(),
    });

    // Create 3 sample clients
    const [client1] = await db.insert(clients).values({
      name: "Juan Carlos Martínez López",
      variations: JSON.stringify(["Juan Martínez", "J.C. Martínez", "Juan C. Martinez"]),
      keywords: JSON.stringify(["empresa", "fraude", "escándalo", "director", "CEO"]),
      country: "CO",
      language: "es",
      industry: "Financiero",
      company: "Grupo Inversiones del Pacífico",
      birthYear: 1975,
      notes: "Cliente prioritario. Monitorear menciones negativas en medios colombianos.",
      createdBy: 1,
      createdAt: "2025-11-15T10:00:00Z",
      updatedAt: "2026-01-20T14:30:00Z",
    }).returning();

    const [client2] = await db.insert(clients).values({
      name: "María Elena Rodríguez Gómez",
      variations: JSON.stringify(["María Rodríguez", "M.E. Rodríguez", "Maria Rodriguez"]),
      keywords: JSON.stringify(["política", "senadora", "congreso", "partido", "elecciones"]),
      country: "CO",
      language: "es",
      industry: "Político",
      company: "Senado de la República",
      birthYear: 1968,
      notes: "Figura pública. Seguimiento de cobertura mediática.",
      createdBy: 1,
      createdAt: "2025-12-01T08:00:00Z",
      updatedAt: "2026-02-10T09:00:00Z",
    }).returning();

    const [client3] = await db.insert(clients).values({
      name: "Andrés Felipe Vargas Ruiz",
      variations: JSON.stringify(["Andrés Vargas", "A.F. Vargas", "Andres Vargas"]),
      keywords: JSON.stringify(["tecnología", "startup", "innovación", "CTO", "app"]),
      country: "CO",
      language: "es",
      industry: "Tecnología",
      company: "TechVida S.A.S.",
      birthYear: 1990,
      notes: "Emprendedor tech. Monitoreo de reputación corporativa.",
      createdBy: 1,
      createdAt: "2026-01-10T12:00:00Z",
      updatedAt: "2026-03-01T16:00:00Z",
    }).returning();

    // Create 2 searches
    const [search1] = await db.insert(searches).values({
      clientId: client1.id,
      createdBy: 1,
      status: "completed",
      totalQueries: 24,
      completedQueries: 24,
      config: JSON.stringify({ engines: ["google", "bing"], countries: ["CO", "MX"] }),
      createdAt: "2026-02-15T10:00:00Z",
      completedAt: "2026-02-15T10:45:00Z",
    }).returning();

    const [search2] = await db.insert(searches).values({
      clientId: client2.id,
      createdBy: 1,
      status: "completed",
      totalQueries: 18,
      completedQueries: 18,
      config: JSON.stringify({ engines: ["google"], countries: ["CO"] }),
      createdAt: "2026-03-01T08:00:00Z",
      completedAt: "2026-03-01T08:30:00Z",
    }).returning();

    // Seed results for search 1
    const sampleDomains = ["eltiempo.com", "semana.com", "elespectador.com", "portafolio.co", "dinero.com", "larepublica.co", "rcnradio.com", "caracol.com.co", "twitter.com", "linkedin.com", "facebook.com", "bluradio.com"];
    const sentiments: Array<"very_positive" | "positive" | "neutral" | "negative" | "very_negative"> = ["very_positive", "positive", "neutral", "negative", "very_negative"];
    const confidences: Array<"high" | "medium" | "low"> = ["high", "medium", "low"];
    const classifications: Array<"main_news" | "secondary_mention" | "potential_deindex" | "irrelevant" | "pending_review"> = ["main_news", "secondary_mention", "potential_deindex", "irrelevant", "pending_review"];
    const sourceTypes: Array<"web" | "news" | "social" | "blog"> = ["web", "news", "social", "blog"];

    const sampleTitles1 = [
      "Juan Carlos Martínez López nombrado nuevo CEO de Grupo Inversiones del Pacífico",
      "Grupo Inversiones del Pacífico anuncia expansión regional bajo liderazgo de Martínez",
      "Controversia por decisiones financieras en Grupo Inversiones del Pacífico",
      "Juan Martínez López participa en Foro Económico de Cartagena",
      "Investigación sobre prácticas empresariales cuestiona a directivos del sector financiero",
      "Entrevista exclusiva: J.C. Martínez habla sobre el futuro del sector financiero colombiano",
      "Grupo Inversiones del Pacífico reporta ganancias récord en tercer trimestre",
      "Críticas a la gestión de Juan Carlos Martínez en foro empresarial",
      "Martínez López recibe reconocimiento de la Cámara de Comercio",
      "Nuevas denuncias contra directivos de empresas financieras en Colombia",
      "Juan Carlos Martínez López - Perfil en LinkedIn",
      "Publicación en Twitter sobre Grupo Inversiones del Pacífico genera polémica",
      "Análisis del sector financiero colombiano: principales actores y controversias",
      "Martínez López dona a fundación educativa en Cali",
      "Blog: Los 10 empresarios más influyentes de Colombia 2025",
      "Noticia falsa sobre Juan Martínez circula en redes sociales",
      "Demanda colectiva contra Grupo Inversiones del Pacífico avanza en tribunales",
      "Juan Carlos Martínez participa en panel sobre ética empresarial",
      "Reseña del libro 'Liderazgo Transformador' escrito por J.C. Martínez",
      "Comunicado oficial de Grupo Inversiones del Pacífico sobre rumores de fraude",
      "Otro Juan Carlos Martínez López gana premio deportivo en Medellín",
      "Fallo judicial a favor de Grupo Inversiones del Pacífico en caso laboral",
      "Martínez López anuncia plan de responsabilidad social empresarial",
      "Análisis de inversión: ¿Es seguro invertir en Grupo Inversiones del Pacífico?",
    ];

    for (let i = 0; i < sampleTitles1.length; i++) {
      const sentIdx = i % 5 === 0 ? 3 : i % 3 === 0 ? 4 : i % 4 === 0 ? 0 : i % 2 === 0 ? 2 : 1;
      const confIdx = i % 3 === 0 ? 2 : i < 15 ? 0 : 1;
      const classIdx = i % 7 === 0 ? 2 : i % 5 === 0 ? 3 : i % 3 === 0 ? 4 : i % 2 === 0 ? 1 : 0;
      const domain = sampleDomains[i % sampleDomains.length];

      await db.insert(results).values({
        searchId: search1.id,
        clientId: client1.id,
        url: `https://${domain}/article-${1000 + i}`,
        domain,
        title: sampleTitles1[i],
        snippet: sampleTitles1[i].substring(0, 80) + "... Contenido resumido del artículo encontrado en la búsqueda.",
        contentText: `Contenido completo del artículo: ${sampleTitles1[i]}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        publicationYear: 2025 + (i % 2),
        country: "CO",
        language: "es",
        matchedKeyword: ["empresa", "fraude", "escándalo", "director", "CEO"][i % 5],
        sourceType: sourceTypes[i % 4],
        sentiment: sentiments[sentIdx],
        sentimentScore: [0.85, 0.65, 0.0, -0.72, -0.91][sentIdx],
        identityConfidence: confidences[confIdx],
        identityScore: [0.92, 0.67, 0.35][confIdx],
        classification: classifications[classIdx],
        classificationHistory: JSON.stringify([{ date: now(), from: "pending_review", to: classifications[classIdx], by: "system" }]),
        hasClientImage: i % 5 === 0 ? 1 : 0,
        imageAnalysis: JSON.stringify(i % 5 === 0 ? { found: true, confidence: 0.87 } : {}),
        isNew: i < 8 ? 1 : 0,
        createdAt: `2026-02-${String(15 + (i % 14)).padStart(2, "0")}T${String(8 + (i % 12)).padStart(2, "0")}:00:00Z`,
        updatedAt: now(),
      });
    }

    // Seed results for search 2
    const sampleTitles2 = [
      "Senadora María Elena Rodríguez presenta proyecto de ley sobre educación",
      "María Elena Rodríguez Gómez lidera debate en el Congreso sobre reforma tributaria",
      "Polémica declaración de la senadora Rodríguez sobre el proceso de paz",
      "María Rodríguez Gómez denuncia corrupción en entidades gubernamentales",
      "Encuesta revela alta aprobación para la senadora María Elena Rodríguez",
      "Críticas a María Elena Rodríguez por ausencia en sesiones del Congreso",
      "Rodríguez Gómez anuncia candidatura a la gobernación del Valle",
      "Escándalo por presuntos vínculos de senadora con contratistas cuestionados",
      "María Elena Rodríguez recibe premio de Naciones Unidas por labor social",
      "Blog político: Análisis de la carrera de M.E. Rodríguez en el Senado",
      "Rodríguez Gómez participa en foro internacional sobre derechos humanos",
      "Otra María Rodríguez Gómez, empresaria de Bogotá, inaugura restaurante",
      "La senadora Rodríguez rechaza acusaciones de conflicto de intereses",
      "Perfil de María Elena Rodríguez en redes sociales alcanza millón de seguidores",
      "Debate televisivo: Rodríguez vs. oposición sobre política económica",
      "Comunicado del partido sobre posición de senadora Rodríguez",
      "Análisis de votaciones: cómo ha votado María Elena Rodríguez en 2025",
      "Fundación de la senadora Rodríguez beneficia a 500 familias en Cali",
      "Rumores de dimisión de María Elena Rodríguez son desmentidos",
      "Editorial: El legado político de María Elena Rodríguez Gómez",
    ];

    for (let i = 0; i < sampleTitles2.length; i++) {
      const sentIdx = i % 4 === 0 ? 1 : i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : i % 6 === 0 ? 4 : 0;
      const confIdx = i < 12 ? 0 : i < 17 ? 1 : 2;
      const classIdx = i % 6 === 0 ? 1 : i % 7 === 0 ? 2 : i % 4 === 0 ? 0 : i % 5 === 0 ? 3 : 4;
      const domain = sampleDomains[i % sampleDomains.length];

      await db.insert(results).values({
        searchId: search2.id,
        clientId: client2.id,
        url: `https://${domain}/article-${2000 + i}`,
        domain,
        title: sampleTitles2[i],
        snippet: sampleTitles2[i].substring(0, 80) + "... Resumen del contenido encontrado.",
        contentText: `Contenido: ${sampleTitles2[i]}. Texto completo del artículo con análisis detallado.`,
        publicationYear: 2025 + (i % 2),
        country: "CO",
        language: "es",
        matchedKeyword: ["política", "senadora", "congreso", "partido", "elecciones"][i % 5],
        sourceType: sourceTypes[i % 4],
        sentiment: sentiments[sentIdx],
        sentimentScore: [0.78, 0.55, 0.0, -0.65, -0.88][sentIdx],
        identityConfidence: confidences[confIdx],
        identityScore: [0.95, 0.62, 0.28][confIdx],
        classification: classifications[classIdx],
        classificationHistory: JSON.stringify([{ date: now(), from: "pending_review", to: classifications[classIdx], by: "system" }]),
        hasClientImage: i % 4 === 0 ? 1 : 0,
        imageAnalysis: JSON.stringify(i % 4 === 0 ? { found: true, confidence: 0.92 } : {}),
        isNew: i < 5 ? 1 : 0,
        createdAt: `2026-03-${String(1 + (i % 20)).padStart(2, "0")}T${String(8 + (i % 12)).padStart(2, "0")}:00:00Z`,
        updatedAt: now(),
      });
    }

    // Seed classification rules
    await db.insert(classificationRules).values({
      name: "Negativo + Alta Confianza → Posible Desindexación",
      conditions: JSON.stringify([
        { field: "sentiment", operator: "in", value: ["negative", "very_negative"] },
        { field: "identityConfidence", operator: "eq", value: "high" },
      ]),
      action: "potential_deindex",
      priority: 1,
      isActive: 1,
      createdBy: 1,
      createdAt: now(),
    });

    await db.insert(classificationRules).values({
      name: "Baja Confianza → Irrelevante",
      conditions: JSON.stringify([
        { field: "identityConfidence", operator: "eq", value: "low" },
      ]),
      action: "irrelevant",
      priority: 2,
      isActive: 1,
      createdBy: 1,
      createdAt: now(),
    });

    await db.insert(classificationRules).values({
      name: "Positivo + Alta Confianza → Noticia Principal",
      conditions: JSON.stringify([
        { field: "sentiment", operator: "in", value: ["positive", "very_positive"] },
        { field: "identityConfidence", operator: "eq", value: "high" },
      ]),
      action: "main_news",
      priority: 3,
      isActive: 1,
      createdBy: 1,
      createdAt: now(),
    });

    // Seed export jobs
    await db.insert(exportJobs).values({
      searchId: search1.id,
      format: "xlsx",
      filters: JSON.stringify({ sentiment: "all", classification: "all" }),
      status: "completed",
      fileUrl: "/exports/report-martinez-2026-02.xlsx",
      createdBy: 1,
      createdAt: "2026-02-16T09:00:00Z",
    });

    await db.insert(exportJobs).values({
      searchId: search2.id,
      format: "csv",
      filters: JSON.stringify({ sentiment: "negative" }),
      status: "completed",
      fileUrl: "/exports/report-rodriguez-negative.csv",
      createdBy: 1,
      createdAt: "2026-03-05T11:00:00Z",
    });

    console.log("Demo data seeded successfully!");
  } catch (err) {
    console.error("Error seeding demo data:", err);
  }
}
