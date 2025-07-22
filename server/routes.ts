import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  generatePhishingScenario, 
  generateCoachingFeedback, 
  generateCrisisScenario,
  type PhishingScenarioConfig 
} from "./services/openai";
import { emailService } from "./services/email";
import { 
  insertSimulationSchema, 
  insertPhishingScenarioSchema,
  insertUserInteractionSchema,
  insertCoachingSessionSchema,
  insertAuditLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time crisis simulations
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections
  const connections = new Map<string, WebSocket>();
  
  wss.on('connection', (ws, req) => {
    const connectionId = Math.random().toString(36).substring(7);
    connections.set(connectionId, ws);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'crisis_response') {
          // Handle crisis simulation responses
          await storage.recordUserInteraction({
            userId: data.userId,
            simulationId: data.simulationId,
            action: 'crisis_decision',
            details: { decision: data.decision, phase: data.phase }
          });
          
          // Broadcast to other participants if needed
          connections.forEach((conn, id) => {
            if (id !== connectionId && conn.readyState === WebSocket.OPEN) {
              conn.send(JSON.stringify({
                type: 'crisis_update',
                data: data.decision
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      connections.delete(connectionId);
    });
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Get recent simulations
  app.get("/api/simulations", async (req, res) => {
    try {
      const simulations = await storage.getSimulations();
      res.json(simulations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch simulations" });
    }
  });

  // Create new simulation
  app.post("/api/simulations", async (req, res) => {
    try {
      const simulationData = insertSimulationSchema.parse(req.body);
      const simulation = await storage.createSimulation(simulationData);
      
      // Log audit trail
      await storage.createAuditLog({
        userId: simulationData.createdBy,
        action: 'create_simulation',
        resource: 'simulation',
        details: { simulationId: simulation.id, type: simulation.type }
      });
      
      res.json(simulation);
    } catch (error) {
      res.status(400).json({ message: "Invalid simulation data" });
    }
  });

  // Generate AI phishing scenario
  app.post("/api/simulations/:id/phishing-scenario", async (req, res) => {
    try {
      const simulationId = parseInt(req.params.id);
      const config = req.body as PhishingScenarioConfig;
      
      const scenario = await generatePhishingScenario(config);
      
      const savedScenario = await storage.createPhishingScenario({
        simulationId,
        subject: scenario.subject,
        content: scenario.content,
        difficulty: scenario.difficulty,
        indicators: scenario.indicators,
        generatedBy: 'ai'
      });
      
      res.json(savedScenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate phishing scenario" });
    }
  });

  // Record user interaction
  app.post("/api/interactions", async (req, res) => {
    try {
      const interactionData = insertUserInteractionSchema.parse(req.body);
      const interaction = await storage.recordUserInteraction(interactionData);
      
      // Generate AI coaching feedback
      if (interactionData.action === 'click' || interactionData.action === 'report') {
        const wasCorrect = interactionData.action === 'report';
        const feedback = await generateCoachingFeedback(
          interactionData.action,
          interactionData.details,
          wasCorrect
        );
        
        await storage.createCoachingSession({
          userId: interactionData.userId,
          simulationId: interactionData.simulationId,
          feedback: feedback.feedback,
          recommendations: feedback.recommendations
        });
      }
      
      res.json(interaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid interaction data" });
    }
  });

  // Get user coaching sessions
  app.get("/api/users/:id/coaching", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const sessions = await storage.getUserCoachingSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaching sessions" });
    }
  });

  // Generate crisis scenario
  app.post("/api/crisis-scenarios", async (req, res) => {
    try {
      const { scenarioType, complexity } = req.body;
      const scenario = await generateCrisisScenario(scenarioType, complexity);
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate crisis scenario" });
    }
  });

  // Get compliance metrics
  app.get("/api/compliance", async (req, res) => {
    try {
      const metrics = await storage.getComplianceMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch compliance metrics" });
    }
  });

  // Get audit logs
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Get user interactions
  app.get("/api/users/:id/interactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const interactions = await storage.getUserInteractions(userId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user interactions" });
    }
  });

  // Get simulation interactions
  app.get("/api/simulations/:id/interactions", async (req, res) => {
    try {
      const simulationId = parseInt(req.params.id);
      const interactions = await storage.getSimulationInteractions(simulationId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch simulation interactions" });
    }
  });

  // Email API Routes
  
  // Test email connection
  app.get("/api/email/test", async (req, res) => {
    try {
      const result = await emailService.testConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to test email connection" });
    }
  });

  // Send phishing simulation email
  app.post("/api/email/phishing", async (req, res) => {
    try {
      const { to, scenario } = req.body;
      
      if (!to || !scenario) {
        return res.status(400).json({ message: "Missing required fields: to, scenario" });
      }

      // Log the email attempt
      await storage.recordAuditLog({
        action: "send_phishing_email",
        userId: req.body.userId || null,
        resource: `email:${to}`,
        details: { scenarioType: scenario.type }
      });

      const result = await emailService.sendPhishingSimulation(to, scenario);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send phishing email" });
    }
  });

  // Send compliance report
  app.post("/api/email/compliance-report", async (req, res) => {
    try {
      const { to, reportData } = req.body;
      
      if (!to || !reportData) {
        return res.status(400).json({ message: "Missing required fields: to, reportData" });
      }

      await storage.recordAuditLog({
        action: "send_compliance_report",
        userId: req.body.userId || null,
        resource: `email:${Array.isArray(to) ? to.join(',') : to}`,
        details: { reportType: "compliance" }
      });

      const result = await emailService.sendComplianceReport(to, reportData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send compliance report" });
    }
  });

  // Send security alert
  app.post("/api/email/security-alert", async (req, res) => {
    try {
      const { to, alertData } = req.body;
      
      if (!to || !alertData) {
        return res.status(400).json({ message: "Missing required fields: to, alertData" });
      }

      await storage.recordAuditLog({
        action: "send_security_alert",
        userId: req.body.userId || null,
        resource: `email:${Array.isArray(to) ? to.join(',') : to}`,
        details: { alertTitle: alertData.title, severity: alertData.severity }
      });

      const result = await emailService.sendSecurityAlert(to, alertData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send security alert" });
    }
  });

  // Send custom email
  app.post("/api/email/send", async (req, res) => {
    try {
      const { to, subject, text, html } = req.body;
      
      if (!to || !subject || !text) {
        return res.status(400).json({ message: "Missing required fields: to, subject, text" });
      }

      await storage.recordAuditLog({
        action: "send_email",
        userId: req.body.userId || null,
        resource: `email:${Array.isArray(to) ? to.join(',') : to}`,
        details: { subject }
      });

      const result = await emailService.sendEmail(to, subject, text, html);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  return httpServer;
}
