import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("analyst"), // admin, analyst, viewer
  createdAt: text("created_at").notNull().default(""),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// 2. Clients
export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  variations: text("variations").notNull().default("[]"), // JSON array
  keywords: text("keywords").notNull().default("[]"), // JSON array
  country: text("country").notNull().default("CO"),
  language: text("language").notNull().default("es"),
  industry: text("industry").notNull().default(""),
  company: text("company").notNull().default(""),
  birthYear: integer("birth_year"),
  notes: text("notes").notNull().default(""),
  createdBy: integer("created_by"),
  createdAt: text("created_at").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(""),
});

export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// 3. Client Images
export const clientImages = sqliteTable("client_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: integer("client_id").notNull(),
  imageUrl: text("image_url").notNull(),
  isReference: integer("is_reference").notNull().default(1),
  createdAt: text("created_at").notNull().default(""),
});

export const insertClientImageSchema = createInsertSchema(clientImages).omit({ id: true, createdAt: true });
export type InsertClientImage = z.infer<typeof insertClientImageSchema>;
export type ClientImage = typeof clientImages.$inferSelect;

// 4. Searches
export const searches = sqliteTable("searches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: integer("client_id").notNull(),
  createdBy: integer("created_by"),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  totalQueries: integer("total_queries").notNull().default(0),
  completedQueries: integer("completed_queries").notNull().default(0),
  config: text("config").notNull().default("{}"), // JSON
  createdAt: text("created_at").notNull().default(""),
  completedAt: text("completed_at"),
});

export const insertSearchSchema = createInsertSchema(searches).omit({ id: true, createdAt: true, completedAt: true });
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;

// 5. Search Queries
export const searchQueries = sqliteTable("search_queries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  searchId: integer("search_id").notNull(),
  queryText: text("query_text").notNull(),
  engine: text("engine").notNull().default("google"),
  status: text("status").notNull().default("pending"),
  resultsCount: integer("results_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(""),
});

export const insertSearchQuerySchema = createInsertSchema(searchQueries).omit({ id: true, createdAt: true });
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type SearchQuery = typeof searchQueries.$inferSelect;

// 6. Results
export const results = sqliteTable("results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  searchId: integer("search_id").notNull(),
  clientId: integer("client_id").notNull(),
  url: text("url").notNull(),
  domain: text("domain").notNull().default(""),
  title: text("title").notNull().default(""),
  snippet: text("snippet").notNull().default(""),
  contentText: text("content_text").notNull().default(""),
  publicationYear: integer("publication_year"),
  country: text("country"),
  language: text("language"),
  matchedKeyword: text("matched_keyword"),
  sourceType: text("source_type").notNull().default("web"), // web, social, news, blog
  sentiment: text("sentiment").notNull().default("neutral"), // very_positive, positive, neutral, negative, very_negative
  sentimentScore: real("sentiment_score").notNull().default(0),
  identityConfidence: text("identity_confidence").notNull().default("medium"), // high, medium, low
  identityScore: real("identity_score").notNull().default(0.5),
  classification: text("classification").notNull().default("pending_review"), // main_news, secondary_mention, potential_deindex, irrelevant, pending_review
  classificationHistory: text("classification_history").notNull().default("[]"), // JSON
  hasClientImage: integer("has_client_image").notNull().default(0),
  imageAnalysis: text("image_analysis").notNull().default("{}"), // JSON
  isNew: integer("is_new").notNull().default(1),
  createdAt: text("created_at").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(""),
});

export const insertResultSchema = createInsertSchema(results).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof results.$inferSelect;

// 7. Classification Rules
export const classificationRules = sqliteTable("classification_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  conditions: text("conditions").notNull().default("[]"), // JSON array of conditions
  action: text("action").notNull(), // classification to assign
  priority: integer("priority").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  createdBy: integer("created_by"),
  createdAt: text("created_at").notNull().default(""),
});

export const insertClassificationRuleSchema = createInsertSchema(classificationRules).omit({ id: true, createdAt: true });
export type InsertClassificationRule = z.infer<typeof insertClassificationRuleSchema>;
export type ClassificationRule = typeof classificationRules.$inferSelect;

// 8. Export Jobs
export const exportJobs = sqliteTable("export_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  searchId: integer("search_id"),
  format: text("format").notNull().default("xlsx"), // xlsx, pdf, csv
  filters: text("filters").notNull().default("{}"), // JSON
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  fileUrl: text("file_url"),
  createdBy: integer("created_by"),
  createdAt: text("created_at").notNull().default(""),
});

export const insertExportJobSchema = createInsertSchema(exportJobs).omit({ id: true, createdAt: true });
export type InsertExportJob = z.infer<typeof insertExportJobSchema>;
export type ExportJob = typeof exportJobs.$inferSelect;

// 9. Audit Log
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  oldValue: text("old_value"), // JSON
  newValue: text("new_value"), // JSON
  createdAt: text("created_at").notNull().default(""),
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLog.$inferSelect;

// Login schema for auth
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});
export type RegisterInput = z.infer<typeof registerSchema>;
