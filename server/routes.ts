import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, seedDemoData } from "./storage";
import { insertClientSchema, insertSearchSchema, insertClassificationRuleSchema, insertExportJobSchema, loginSchema, registerSchema } from "@shared/schema";
import { z } from "zod";

// Search query generator module
function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function generateNameVariations(fullName: string): string[] {
  const parts = fullName.trim().split(/\s+/);
  const variations: Set<string> = new Set();

  // Full name
  variations.add(fullName);
  variations.add(removeAccents(fullName));

  // First + Last
  if (parts.length >= 2) {
    variations.add(`${parts[0]} ${parts[parts.length - 1]}`);
    variations.add(removeAccents(`${parts[0]} ${parts[parts.length - 1]}`));
  }

  // First + Second to last (common in Spanish naming)
  if (parts.length >= 3) {
    variations.add(`${parts[0]} ${parts[parts.length - 2]}`);
    variations.add(`${parts[0]} ${parts[1]}`);
    variations.add(`${parts[0]} ${parts[1]} ${parts[parts.length - 1]}`);
  }

  if (parts.length >= 4) {
    variations.add(`${parts[0]} ${parts[1]} ${parts[2]}`);
    variations.add(`${parts[2]} ${parts[3]}`);
  }

  // Initials
  if (parts.length >= 2) {
    const initials = parts.map(p => p[0].toUpperCase() + ".").join(" ");
    variations.add(initials);
    variations.add(`${parts[0][0].toUpperCase()}.${parts[1][0].toUpperCase()}. ${parts[parts.length - 1]}`);
  }

  return Array.from(variations);
}

function generateMisspellings(name: string): string[] {
  const misspellings: Set<string> = new Set();
  const lower = name.toLowerCase();

  // Spanish phonetic substitutions
  const rules: [RegExp, string][] = [
    [/b/g, "v"], [/v/g, "b"],
    [/s/g, "c"], [/c(?=[ei])/g, "s"],
    [/z/g, "s"], [/s/g, "z"],
    [/g(?=[ei])/g, "j"], [/j/g, "g"],
    [/ll/g, "y"], [/y/g, "ll"],
    [/h/g, ""],  // h omission
  ];

  for (const [pattern, replacement] of rules) {
    const result = lower.replace(pattern, replacement);
    if (result !== lower) {
      // Capitalize first letter of each word
      misspellings.add(result.replace(/\b\w/g, c => c.toUpperCase()));
    }
  }

  return Array.from(misspellings);
}

function generateSearchCombinations(
  nameVariations: string[],
  keywords: string[],
  additionalVariations: string[] = []
): { queries: string[]; totalCount: number } {
  const allVariations = [...new Set([...nameVariations, ...additionalVariations])];
  const queries: string[] = [];

  // Name variations alone (quoted)
  for (const v of allVariations) {
    queries.push(`"${v}"`);
  }

  // Cross-product with keywords
  if (keywords.length > 0) {
    for (const v of allVariations) {
      for (const kw of keywords) {
        queries.push(`"${v}" ${kw}`);
      }
    }
  }

  return { queries, totalCount: queries.length };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed demo data on startup
  seedDemoData();

  // ========== AUTH ==========
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user || user.passwordHash !== data.password) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      const { passwordHash, ...safeUser } = user;
      res.json({ user: safeUser, token: `demo-token-${user.id}` });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(409).json({ message: "El correo ya está registrado" });
      }
      const user = await storage.createUser({
        email: data.email,
        passwordHash: data.password,
        name: data.name,
        role: "analyst",
      });
      const { passwordHash, ...safeUser } = user;
      res.json({ user: safeUser, token: `demo-token-${user.id}` });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    // Simple token-based auth for demo
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer demo-token-")) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const userId = parseInt(auth.replace("Bearer demo-token-", ""));
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  // ========== CLIENTS ==========
  app.get("/api/clients", async (_req, res) => {
    const clientList = await storage.getClients();
    res.json(clientList);
  });

  app.get("/api/clients/:id", async (req, res) => {
    const client = await storage.getClient(parseInt(req.params.id));
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(client);
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const data = insertClientSchema.parse(req.body);
      const client = await storage.createClient(data);
      res.status(201).json(client);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.updateClient(parseInt(req.params.id), req.body);
      if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
      res.json(client);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    await storage.deleteClient(parseInt(req.params.id));
    res.json({ success: true });
  });

  // ========== SEARCHES ==========
  app.get("/api/searches", async (_req, res) => {
    const searchList = await storage.getSearches();
    res.json(searchList);
  });

  app.get("/api/searches/:id", async (req, res) => {
    const search = await storage.getSearch(parseInt(req.params.id));
    if (!search) return res.status(404).json({ message: "Búsqueda no encontrada" });
    const searchResults = await storage.getResults(search.id);
    const queries = await storage.getSearchQueries(search.id);
    res.json({ ...search, results: searchResults, queries });
  });

  app.get("/api/searches/:id/results", async (req, res) => {
    const searchResults = await storage.getResults(parseInt(req.params.id));
    // Apply filters from query params
    let filtered = searchResults;
    const { sentiment, confidence, classification, sourceType } = req.query;
    if (sentiment && sentiment !== "all") {
      filtered = filtered.filter(r => r.sentiment === sentiment);
    }
    if (confidence && confidence !== "all") {
      filtered = filtered.filter(r => r.identityConfidence === confidence);
    }
    if (classification && classification !== "all") {
      filtered = filtered.filter(r => r.classification === classification);
    }
    if (sourceType && sourceType !== "all") {
      filtered = filtered.filter(r => r.sourceType === sourceType);
    }
    res.json(filtered);
  });

  app.post("/api/searches", async (req, res) => {
    try {
      const data = insertSearchSchema.parse(req.body);
      const search = await storage.createSearch(data);
      res.status(201).json(search);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ========== RESULTS ==========
  app.get("/api/results/:id", async (req, res) => {
    const result = await storage.getResult(parseInt(req.params.id));
    if (!result) return res.status(404).json({ message: "Resultado no encontrado" });
    res.json(result);
  });

  app.patch("/api/results/:id/classify", async (req, res) => {
    try {
      const { classification } = req.body;
      if (!classification) return res.status(400).json({ message: "Clasificación requerida" });
      const existing = await storage.getResult(parseInt(req.params.id));
      if (!existing) return res.status(404).json({ message: "Resultado no encontrado" });
      const history = JSON.parse(existing.classificationHistory);
      history.push({ date: new Date().toISOString(), from: existing.classification, to: classification, by: "manual" });
      const updated = await storage.updateResult(parseInt(req.params.id), {
        classification,
        classificationHistory: JSON.stringify(history),
      });
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ========== ANALYSIS (simulated) ==========
  app.post("/api/analyze/sentiment", async (req, res) => {
    const { resultIds } = req.body;
    if (!Array.isArray(resultIds)) return res.status(400).json({ message: "resultIds requerido" });
    const sentiments = ["very_positive", "positive", "neutral", "negative", "very_negative"];
    const updated = [];
    for (const id of resultIds) {
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      const score = sentiment.includes("positive") ? Math.random() * 0.5 + 0.5 : sentiment === "neutral" ? (Math.random() - 0.5) * 0.2 : -(Math.random() * 0.5 + 0.5);
      const result = await storage.updateResult(id, { sentiment, sentimentScore: parseFloat(score.toFixed(2)) });
      if (result) updated.push(result);
    }
    res.json({ message: `Análisis de sentimiento completado para ${updated.length} resultados`, updated });
  });

  app.post("/api/analyze/identity", async (req, res) => {
    const { resultIds } = req.body;
    if (!Array.isArray(resultIds)) return res.status(400).json({ message: "resultIds requerido" });
    const confidences = ["high", "medium", "low"];
    const updated = [];
    for (const id of resultIds) {
      const confidence = confidences[Math.floor(Math.random() * confidences.length)];
      const score = confidence === "high" ? Math.random() * 0.2 + 0.8 : confidence === "medium" ? Math.random() * 0.3 + 0.5 : Math.random() * 0.5;
      const result = await storage.updateResult(id, { identityConfidence: confidence, identityScore: parseFloat(score.toFixed(2)) });
      if (result) updated.push(result);
    }
    res.json({ message: `Análisis de identidad completado para ${updated.length} resultados`, updated });
  });

  app.post("/api/analyze/images", async (req, res) => {
    const { resultIds } = req.body;
    if (!Array.isArray(resultIds)) return res.status(400).json({ message: "resultIds requerido" });
    const updated = [];
    for (const id of resultIds) {
      const hasImage = Math.random() > 0.6;
      const analysis = hasImage ? { found: true, confidence: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)) } : { found: false };
      const result = await storage.updateResult(id, { hasClientImage: hasImage ? 1 : 0, imageAnalysis: JSON.stringify(analysis) });
      if (result) updated.push(result);
    }
    res.json({ message: `Análisis de imágenes completado para ${updated.length} resultados`, updated });
  });

  // ========== SEARCH GENERATOR ==========
  app.post("/api/generator/preview", async (req, res) => {
    try {
      const { clientName, variations = [], keywords = [], includeMisspellings = true } = req.body;
      if (!clientName) return res.status(400).json({ message: "Nombre de cliente requerido" });

      const nameVariations = generateNameVariations(clientName);
      const misspellings = includeMisspellings ? generateMisspellings(clientName) : [];
      const allVariations = [...nameVariations, ...variations, ...misspellings];
      const { queries, totalCount } = generateSearchCombinations(allVariations, keywords);

      res.json({
        nameVariations,
        misspellings,
        totalVariations: allVariations.length,
        sampleQueries: queries.slice(0, 20),
        totalQueries: totalCount,
      });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ========== CLASSIFICATION RULES ==========
  app.get("/api/rules", async (_req, res) => {
    const rules = await storage.getRules();
    res.json(rules);
  });

  app.post("/api/rules", async (req, res) => {
    try {
      const data = insertClassificationRuleSchema.parse(req.body);
      const rule = await storage.createRule(data);
      res.status(201).json(rule);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.put("/api/rules/:id", async (req, res) => {
    try {
      const rule = await storage.updateRule(parseInt(req.params.id), req.body);
      if (!rule) return res.status(404).json({ message: "Regla no encontrada" });
      res.json(rule);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/rules/:id", async (req, res) => {
    await storage.deleteRule(parseInt(req.params.id));
    res.json({ success: true });
  });

  // ========== EXPORTS ==========
  app.get("/api/exports", async (_req, res) => {
    const jobs = await storage.getExportJobs();
    res.json(jobs);
  });

  app.get("/api/exports/:id", async (req, res) => {
    const job = await storage.getExportJob(parseInt(req.params.id));
    if (!job) return res.status(404).json({ message: "Exportación no encontrada" });
    res.json(job);
  });

  app.post("/api/exports", async (req, res) => {
    try {
      const data = insertExportJobSchema.parse(req.body);
      const job = await storage.createExportJob({ ...data, status: "processing" });
      // Simulate export processing
      setTimeout(async () => {
        await storage.updateExportJob(job.id, { status: "completed", fileUrl: `/exports/export-${job.id}.${data.format || "xlsx"}` });
      }, 2000);
      res.status(201).json(job);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/exports/:id/download", async (req, res) => {
    try {
      const job = await storage.getExportJob(parseInt(req.params.id));
      if (!job) return res.status(404).json({ message: "Exportación no encontrada" });
      if (job.status !== "completed") return res.status(400).json({ message: "Exportación no completada" });

      // Generate Excel file on the fly
      const XLSX = await import("xlsx");
      const searchResults = job.searchId ? await storage.getResults(job.searchId) : await storage.getAllResults();

      const data = searchResults.map(r => ({
        "URL": r.url,
        "Dominio": r.domain,
        "Título": r.title,
        "Fragmento": r.snippet,
        "Sentimiento": r.sentiment,
        "Puntaje Sentimiento": r.sentimentScore,
        "Confianza Identidad": r.identityConfidence,
        "Puntaje Identidad": r.identityScore,
        "Clasificación": r.classification,
        "Tipo Fuente": r.sourceType,
        "Año Publicación": r.publicationYear || "",
        "Palabra Clave": r.matchedKeyword || "",
        "Es Nuevo": r.isNew ? "Sí" : "No",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Resultados");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=export-${job.id}.xlsx`);
      res.send(buf);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ========== DASHBOARD ==========
  app.get("/api/dashboard/stats", async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // ========== AUDIT LOG ==========
  app.get("/api/audit-log", async (req, res) => {
    const { entityType, entityId } = req.query;
    const logs = await storage.getAuditLogs(
      entityType as string | undefined,
      entityId ? parseInt(entityId as string) : undefined,
    );
    res.json(logs);
  });

  return httpServer;
}
