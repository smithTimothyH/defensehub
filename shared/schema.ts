import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"), // user, admin, security_admin
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // phishing, crisis, training
  status: text("status").notNull().default("active"), // active, completed, paused
  configuration: jsonb("configuration").notNull(), // AI settings, scenarios, etc.
  targetAudience: text("target_audience").array().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const simulationParticipants = pgTable("simulation_participants", {
  id: serial("id").primaryKey(),
  simulationId: integer("simulation_id").references(() => simulations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, active, completed
  score: integer("score"),
  responses: jsonb("responses"), // User actions and responses
  completedAt: timestamp("completed_at"),
});

export const phishingScenarios = pgTable("phishing_scenarios", {
  id: serial("id").primaryKey(),
  simulationId: integer("simulation_id").references(() => simulations.id).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  difficulty: text("difficulty").notNull(), // basic, intermediate, advanced
  indicators: jsonb("indicators").notNull(), // Red flags and security indicators
  generatedBy: text("generated_by").notNull(), // ai, template
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  simulationId: integer("simulation_id").references(() => simulations.id),
  scenarioId: integer("scenario_id").references(() => phishingScenarios.id),
  action: text("action").notNull(), // click, submit, report, ignore
  details: jsonb("details"), // Additional context
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  simulationId: integer("simulation_id").references(() => simulations.id),
  feedback: text("feedback").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceMetrics = pgTable("compliance_metrics", {
  id: serial("id").primaryKey(),
  framework: text("framework").notNull(), // NIST, ISO27001, GDPR, SOC2
  score: integer("score").notNull(),
  details: jsonb("details").notNull(),
  lastAssessed: timestamp("last_assessed").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  simulations: many(simulations),
  participations: many(simulationParticipants),
  interactions: many(userInteractions),
  coachingSessions: many(coachingSessions),
  auditLogs: many(auditLogs),
}));

export const simulationsRelations = relations(simulations, ({ one, many }) => ({
  creator: one(users, {
    fields: [simulations.createdBy],
    references: [users.id],
  }),
  participants: many(simulationParticipants),
  scenarios: many(phishingScenarios),
  interactions: many(userInteractions),
}));

export const simulationParticipantsRelations = relations(simulationParticipants, ({ one }) => ({
  simulation: one(simulations, {
    fields: [simulationParticipants.simulationId],
    references: [simulations.id],
  }),
  user: one(users, {
    fields: [simulationParticipants.userId],
    references: [users.id],
  }),
}));

export const phishingScenariosRelations = relations(phishingScenarios, ({ one, many }) => ({
  simulation: one(simulations, {
    fields: [phishingScenarios.simulationId],
    references: [simulations.id],
  }),
  interactions: many(userInteractions),
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userInteractions.userId],
    references: [users.id],
  }),
  simulation: one(simulations, {
    fields: [userInteractions.simulationId],
    references: [simulations.id],
  }),
  scenario: one(phishingScenarios, {
    fields: [userInteractions.scenarioId],
    references: [phishingScenarios.id],
  }),
}));

export const coachingSessionsRelations = relations(coachingSessions, ({ one }) => ({
  user: one(users, {
    fields: [coachingSessions.userId],
    references: [users.id],
  }),
  simulation: one(simulations, {
    fields: [coachingSessions.simulationId],
    references: [simulations.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertPhishingScenarioSchema = createInsertSchema(phishingScenarios).omit({
  id: true,
  createdAt: true,
});

export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({
  id: true,
  timestamp: true,
});

export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceMetricSchema = createInsertSchema(complianceMetrics).omit({
  id: true,
  lastAssessed: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type SimulationParticipant = typeof simulationParticipants.$inferSelect;
export type PhishingScenario = typeof phishingScenarios.$inferSelect;
export type InsertPhishingScenario = z.infer<typeof insertPhishingScenarioSchema>;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;
export type ComplianceMetric = typeof complianceMetrics.$inferSelect;
export type InsertComplianceMetric = z.infer<typeof insertComplianceMetricSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
