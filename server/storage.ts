import { 
  users, simulations, simulationParticipants, phishingScenarios, 
  userInteractions, coachingSessions, complianceMetrics, auditLogs, reports,
  type User, type InsertUser, type Simulation, type InsertSimulation,
  type PhishingScenario, type InsertPhishingScenario, type UserInteraction,
  type InsertUserInteraction, type CoachingSession, type InsertCoachingSession,
  type ComplianceMetric, type InsertComplianceMetric, type AuditLog, type InsertAuditLog,
  type Report, type InsertReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Simulation operations
  getSimulations(): Promise<Simulation[]>;
  getSimulation(id: number): Promise<Simulation | undefined>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  updateSimulationStatus(id: number, status: string): Promise<void>;
  
  // Phishing scenario operations
  createPhishingScenario(scenario: InsertPhishingScenario): Promise<PhishingScenario>;
  getPhishingScenariosBySimulation(simulationId: number): Promise<PhishingScenario[]>;
  
  // User interaction operations
  recordUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;
  getUserInteractions(userId: number): Promise<UserInteraction[]>;
  getSimulationInteractions(simulationId: number): Promise<UserInteraction[]>;
  
  // Coaching operations
  createCoachingSession(session: InsertCoachingSession): Promise<CoachingSession>;
  getUserCoachingSessions(userId: number): Promise<CoachingSession[]>;
  
  // Compliance operations
  getComplianceMetrics(): Promise<ComplianceMetric[]>;
  updateComplianceMetric(metric: InsertComplianceMetric): Promise<ComplianceMetric>;
  
  // Audit operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    activeSimulations: number;
    securityScore: number;
    phishingAttempts: number;
    complianceRate: number;
  }>;

  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReports(limit?: number): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  updateReportStatus(id: number, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getSimulations(): Promise<Simulation[]> {
    return await db.select().from(simulations).orderBy(desc(simulations.createdAt));
  }

  async getSimulation(id: number): Promise<Simulation | undefined> {
    const [simulation] = await db.select().from(simulations).where(eq(simulations.id, id));
    return simulation || undefined;
  }

  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    const [simulation] = await db.insert(simulations).values(insertSimulation).returning();
    return simulation;
  }

  async updateSimulationStatus(id: number, status: string): Promise<void> {
    await db.update(simulations).set({ status }).where(eq(simulations.id, id));
  }

  async createPhishingScenario(insertScenario: InsertPhishingScenario): Promise<PhishingScenario> {
    const [scenario] = await db.insert(phishingScenarios).values(insertScenario).returning();
    return scenario;
  }

  async getPhishingScenariosBySimulation(simulationId: number): Promise<PhishingScenario[]> {
    return await db.select().from(phishingScenarios).where(eq(phishingScenarios.simulationId, simulationId));
  }

  async recordUserInteraction(insertInteraction: InsertUserInteraction): Promise<UserInteraction> {
    const [interaction] = await db.insert(userInteractions).values(insertInteraction).returning();
    return interaction;
  }

  async getUserInteractions(userId: number): Promise<UserInteraction[]> {
    return await db.select().from(userInteractions).where(eq(userInteractions.userId, userId)).orderBy(desc(userInteractions.timestamp));
  }

  async getSimulationInteractions(simulationId: number): Promise<UserInteraction[]> {
    return await db.select().from(userInteractions).where(eq(userInteractions.simulationId, simulationId)).orderBy(desc(userInteractions.timestamp));
  }

  async createCoachingSession(insertSession: InsertCoachingSession): Promise<CoachingSession> {
    const [session] = await db.insert(coachingSessions).values(insertSession).returning();
    return session;
  }

  async getUserCoachingSessions(userId: number): Promise<CoachingSession[]> {
    return await db.select().from(coachingSessions).where(eq(coachingSessions.userId, userId)).orderBy(desc(coachingSessions.createdAt));
  }

  async getComplianceMetrics(): Promise<ComplianceMetric[]> {
    return await db.select().from(complianceMetrics).orderBy(desc(complianceMetrics.lastAssessed));
  }

  async updateComplianceMetric(insertMetric: InsertComplianceMetric): Promise<ComplianceMetric> {
    const existing = await db.select().from(complianceMetrics).where(eq(complianceMetrics.framework, insertMetric.framework));
    
    if (existing.length > 0) {
      const [metric] = await db.update(complianceMetrics)
        .set({ ...insertMetric, lastAssessed: new Date() })
        .where(eq(complianceMetrics.framework, insertMetric.framework))
        .returning();
      return metric;
    } else {
      const [metric] = await db.insert(complianceMetrics).values(insertMetric).returning();
      return metric;
    }
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insertLog).returning();
    return log;
  }

  async recordAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    return this.createAuditLog(insertLog);
  }

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(limit);
  }

  async getDashboardStats(): Promise<{
    activeSimulations: number;
    securityScore: number;
    phishingAttempts: number;
    complianceRate: number;
  }> {
    const activeSimulations = await db.select().from(simulations).where(eq(simulations.status, "active"));
    const phishingAttempts = await db.select().from(userInteractions).where(eq(userInteractions.action, "click"));
    const complianceMetricsData: ComplianceMetric[] = await db.select().from(complianceMetrics);
    
    const avgCompliance = complianceMetricsData.length > 0 
      ? complianceMetricsData.reduce((sum: number, metric: ComplianceMetric) => sum + metric.score, 0) / complianceMetricsData.length 
      : 0;

    // Calculate security score based on various factors
    const securityScore = Math.min(100, Math.max(0, avgCompliance - (phishingAttempts.length * 2)));

    return {
      activeSimulations: activeSimulations.length,
      securityScore: Math.round(securityScore),
      phishingAttempts: phishingAttempts.length,
      complianceRate: Math.round(avgCompliance),
    };
  }

  // Report operations
  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async getReports(limit: number = 10): Promise<Report[]> {
    return await db.select().from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(limit);
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async updateReportStatus(id: number, status: string): Promise<void> {
    await db.update(reports).set({ status }).where(eq(reports.id, id));
  }
}

export const storage = new DatabaseStorage();
