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
import puppeteer from "puppeteer";
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
      console.log("Received simulation data:", JSON.stringify(req.body, null, 2));
      
      // Ensure user exists
      const user = await storage.getUser(req.body.createdBy);
      if (!user) {
        return res.status(400).json({ message: "Invalid user ID. User does not exist." });
      }
      
      const simulationData = insertSimulationSchema.parse(req.body);
      console.log("Parsed simulation data:", JSON.stringify(simulationData, null, 2));
      const simulation = await storage.createSimulation(simulationData);
      

      
      res.json(simulation);
    } catch (error) {
      console.error("Simulation creation error:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        console.error("Validation errors:", (error as any).errors);
        res.status(400).json({ message: "Invalid simulation data", errors: (error as any).errors });
      } else if (error instanceof Error) {
        res.status(400).json({ message: "Invalid simulation data", error: error.message });
      } else {
        res.status(500).json({ message: "Failed to create simulation" });
      }
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

  // Launch phishing campaign
  app.post("/api/phishing-campaigns", async (req, res) => {
    try {
      const { campaignName, emails, simulationId } = req.body;
      
      if (!campaignName || !emails || !simulationId) {
        return res.status(400).json({ message: "Missing required fields: campaignName, emails, simulationId" });
      }

      // Parse email addresses
      const emailList = emails.split('\n').map((email: string) => email.trim()).filter((email: string) => email.length > 0);
      
      if (emailList.length === 0) {
        return res.status(400).json({ message: "No valid email addresses provided" });
      }

      // Create a new simulation entry for this campaign
      const campaign = await storage.createSimulation({
        name: campaignName,
        description: `Phishing campaign targeting ${emailList.length} users`,
        type: 'phishing',
        status: 'active',
        targetAudience: ['custom'],
        userId: 1 // Default user for now
      });

      // Send phishing emails to all targets
      const results = [];
      for (const email of emailList) {
        try {
          const result = await emailService.sendPhishingSimulation([email], {
            subject: "Important: Account Verification Required",
            scenario: "account_verification"
          });
          results.push({ email, status: 'sent', result });
        } catch (emailError: any) {
          results.push({ email, status: 'failed', error: emailError?.message || 'Unknown error' });
        }
      }

      res.json({
        campaignId: campaign.id,
        campaignName,
        targetCount: emailList.length,
        results,
        message: "Phishing campaign launched successfully"
      });
      
    } catch (error) {
      console.error('Phishing campaign error:', error);
      res.status(500).json({ message: "Failed to launch phishing campaign" });
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


      const result = await emailService.sendPhishingSimulation(to, scenario);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send phishing email" });
    }
  });



  // Send security alert
  app.post("/api/email/security-alert", async (req, res) => {
    try {
      const { to, alertData } = req.body;
      
      if (!to || !alertData) {
        return res.status(400).json({ message: "Missing required fields: to, alertData" });
      }



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



      const result = await emailService.sendEmail(to, subject, text, html);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Report Generation API Routes
  
  // Generate report endpoint
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { templateId, title, customizations, format, dateRange } = req.body;
      
      // Generate report data based on template type
      let reportData;
      switch (templateId) {
        case 'executive-summary':
          reportData = await generateExecutiveSummaryReport(dateRange);
          break;
        case 'security-awareness':
          reportData = await generateSecurityAwarenessReport(dateRange);
          break;
        case 'phishing-campaign':
          reportData = await generatePhishingCampaignReport(dateRange);
          break;
        case 'incident-response':
          reportData = await generateIncidentResponseReport(dateRange);
          break;
        case 'compliance-audit':
          reportData = await generateComplianceAuditReport(dateRange);
          break;
        case 'risk-assessment':
          reportData = await generateRiskAssessmentReport(dateRange);
          break;
        default:
          return res.status(400).json({ message: "Unknown template type" });
      }

      // Save report to database
      const savedReport = await storage.createReport({
        title: title || reportData.title,
        templateId,
        type: templateId,
        format: format || 'pdf',
        status: 'completed',
        data: reportData,
        customizations,
        generatedBy: null,
        downloadUrl: `/api/reports/download/[ID]`,
        fileSize: `${Math.round(JSON.stringify(reportData).length / 1024)}KB`
      });



      res.json({
        success: true,
        report: {
          id: savedReport.id,
          title: savedReport.title,
          type: savedReport.type,
          format: savedReport.format,
          generatedAt: savedReport.createdAt?.toISOString(),
          downloadUrl: savedReport.downloadUrl,
          data: reportData
        }
      });
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to generate report",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all reports
  app.get("/api/reports", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const reportsData = await storage.getReports(limit);
      res.json(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Training Resource PDF Downloads
  app.get("/api/training-resources/:type/download", async (req, res) => {
    try {
      const resourceType = req.params.type;
      
      let htmlContent: string;
      let filename: string;
      
      switch (resourceType) {
        case 'email-security':
          htmlContent = generateEmailSecurityGuide();
          filename = 'Email_Security_Guide.pdf';
          break;
        case 'incident-response':
          htmlContent = generateIncidentResponsePlaybook();
          filename = 'Incident_Response_Playbook.pdf';
          break;
        case 'password-policy':
          htmlContent = generatePasswordPolicyTemplate();
          filename = 'Password_Policy_Template.pdf';
          break;
        case 'social-engineering':
          htmlContent = generateSocialEngineeringDefense();
          filename = 'Social_Engineering_Defense.pdf';
          break;
        default:
          return res.status(404).json({ message: "Resource not found" });
      }

      // Generate PDF from HTML using Puppeteer
      const pdfBuffer = await generatePDFFromHTML(htmlContent);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ message: "Failed to generate training resource" });
    }
  });

  // Download report endpoint - returns formatted report content
  app.get("/api/reports/download/:reportId", async (req, res) => {
    try {
      const reportId = parseInt(req.params.reportId);
      const format = req.query.format || 'html';
      
      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (format === 'html') {
        const htmlContent = generateHTMLReport(report);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `inline; filename="${report.title}.html"`);
        res.send(htmlContent);
      } else {
        // For other formats, return the data for now
        res.json({
          success: true,
          report: report,
          message: `${report.title} report data`,
          format
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });

  return httpServer;
}

// Generate professional HTML report
function generateHTMLReport(report: any): string {
  const data = report.data;
  const logoBase64 = "data:image/svg+xml;base64," + Buffer.from(`
    <svg width="180" height="40" viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="8" width="6" height="24" fill="#2563eb"/>
      <rect x="8" y="4" width="6" height="32" fill="#1d4ed8"/>
      <rect x="16" y="0" width="6" height="40" fill="#1e40af"/>
      <text x="30" y="26" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1e293b">DefenseHub</text>
    </svg>
  `).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title} - DefenseHub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #334155; 
            background: #f8fafc;
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); 
            color: white; 
            padding: 2rem; 
            text-align: center;
        }
        .logo { margin-bottom: 1rem; }
        .title { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .subtitle { font-size: 1.1rem; opacity: 0.9; }
        .content { padding: 2rem; }
        .section { margin-bottom: 2.5rem; }
        .section-title { 
            font-size: 1.5rem; 
            font-weight: 600; 
            color: #1e40af; 
            margin-bottom: 1rem; 
            border-bottom: 2px solid #e2e8f0; 
            padding-bottom: 0.5rem;
        }
        .metric-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 1rem; 
            margin-bottom: 2rem;
        }
        .metric-card { 
            background: #f1f5f9; 
            padding: 1.5rem; 
            border-radius: 8px; 
            text-align: center; 
            border-left: 4px solid #2563eb;
        }
        .metric-value { 
            font-size: 2rem; 
            font-weight: 700; 
            color: #1e40af; 
            margin-bottom: 0.5rem;
        }
        .metric-label { font-size: 0.9rem; color: #64748b; }
        .risk-item, .recommendation { 
            background: #fff; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            padding: 1rem; 
            margin-bottom: 0.5rem;
        }
        .risk-high { border-left: 4px solid #dc2626; }
        .risk-medium { border-left: 4px solid #f59e0b; }
        .risk-low { border-left: 4px solid #10b981; }
        .chart-placeholder { 
            background: #f8fafc; 
            border: 2px dashed #cbd5e1; 
            height: 200px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 8px; 
            color: #64748b;
        }
        .footer { 
            background: #f1f5f9; 
            padding: 1.5rem; 
            text-align: center; 
            color: #64748b; 
            font-size: 0.9rem;
        }
        .sample-notice { 
            background: #fef3c7; 
            border: 2px solid #f59e0b; 
            border-radius: 8px; 
            padding: 1rem; 
            margin-bottom: 2rem; 
            text-align: center; 
            color: #92400e; 
            font-weight: 600;
        }
        .status-badge { 
            display: inline-block; 
            padding: 0.25rem 0.75rem; 
            border-radius: 9999px; 
            font-size: 0.875rem; 
            font-weight: 500;
        }
        .status-good { background: #dcfce7; color: #166534; }
        .status-warning { background: #fef3c7; color: #92400e; }
        .status-critical { background: #fee2e2; color: #991b1b; }
        ul { padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; }
        .two-column { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 2rem; 
        }
        @media (max-width: 768px) { 
            .two-column { grid-template-columns: 1fr; }
            .title { font-size: 2rem; }
        }
        @page { margin: 1in; }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="${logoBase64}" alt="DefenseHub" style="height: 40px;">
            </div>
            <h1 class="title">${report.title} - Sample Report</h1>
            <p class="subtitle">Generated on ${new Date(report.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
            <p class="subtitle">Report Period: ${data.period || 'Last 30 days'} • <strong>SAMPLE DATA FOR DEMONSTRATION</strong></p>
        </div>

        <div class="content">
            <div class="sample-notice">
                📋 <strong>SAMPLE REPORT</strong> - This report contains demonstration data for portfolio showcase purposes
            </div>
            ${generateReportContent(report)}
        </div>

        <div class="footer">
            <p><strong>DefenseHub</strong> - AI-Driven Cybersecurity Awareness Platform</p>
            <p><strong>SAMPLE REPORT:</strong> This report contains demonstration data for portfolio showcase purposes.</p>
            <p>Report ID: ${report.id} | Format: ${report.format} | Status: ${report.status}</p>
        </div>
    </div>
</body>
</html>`;
}

function generateReportContent(report: any): string {
  const data = report.data;
  
  switch (report.type) {
    case 'executive-summary':
      return generateExecutiveContent(data);
    case 'security-awareness':
      return generateSecurityAwarenessContent(data);
    case 'phishing-campaign':
      return generatePhishingContent(data);
    case 'incident-response':
      return generateIncidentResponseContent(data);
    case 'compliance-audit':
      return generateComplianceContent(data);
    case 'risk-assessment':
      return generateRiskAssessmentContent(data);
    default:
      return generateDefaultContent(data);
  }
}

function generateExecutiveContent(data: any): string {
  return `
    <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${data.overallSecurityScore || 78}%</div>
                <div class="metric-label">Overall Security Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.trainingEffectiveness || 85}%</div>
                <div class="metric-label">Training Effectiveness</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.budgetImpact || '$12.5K'}</div>
                <div class="metric-label">Cost Savings</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.keyRisks?.length || 3}</div>
                <div class="metric-label">Critical Risks</div>
            </div>
        </div>
    </div>

    <div class="two-column">
        <div class="section">
            <h2 class="section-title">Key Security Risks</h2>
            ${(data.keyRisks || []).map((risk: string, index: number) => `
                <div class="risk-item risk-${index === 0 ? 'high' : index === 1 ? 'medium' : 'low'}">
                    <strong>Risk ${index + 1}:</strong> ${risk}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2 class="section-title">Strategic Recommendations</h2>
            ${(data.recommendations || []).map((rec: string) => `
                <div class="recommendation">
                    • ${rec}
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Security Posture Trend</h2>
        <div class="chart-placeholder">
            📊 Security Score Trend Chart (${data.overallSecurityScore}% current score)
        </div>
    </div>
  `;
}

function generateSecurityAwarenessContent(data: any): string {
  return `
    <div class="section">
        <h2 class="section-title">Training Overview</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${data.completionRate || 92}%</div>
                <div class="metric-label">Training Completion</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.averageScore || 84}%</div>
                <div class="metric-label">Average Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.behaviorChangeIndicators?.phishingReportRate || 68}%</div>
                <div class="metric-label">Phishing Report Rate</div>
            </div>
        </div>
    </div>

    <div class="two-column">
        <div class="section">
            <h2 class="section-title">Top Performing Departments</h2>
            <ul>
                ${(data.topPerformingDepartments || ['IT', 'Finance', 'Legal']).map((dept: string) => `
                    <li><span class="status-badge status-good">${dept}</span></li>
                `).join('')}
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Areas for Improvement</h2>
            <ul>
                ${(data.areasForImprovement || ['Email security', 'Physical security']).map((area: string) => `
                    <li><span class="status-badge status-warning">${area}</span></li>
                `).join('')}
            </ul>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Learning Progress</h2>
        <div class="chart-placeholder">
            📈 Training Progress Chart (${data.completionRate}% completion rate)
        </div>
    </div>
  `;
}

function generatePhishingContent(data: any): string {
  return `
    <div class="section">
        <h2 class="section-title">Campaign Results</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${data.clickRate || 23}%</div>
                <div class="metric-label">Click Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.reportRate || 45}%</div>
                <div class="metric-label">Report Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.avgResponseTime || 12}</div>
                <div class="metric-label">Avg Response Time (min)</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Department Performance</h2>
        <div class="chart-placeholder">
            🎯 Department Click Rates Chart
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Campaign Analysis</h2>
        <p>This phishing simulation campaign targeted ${data.targetCount || 150} employees across multiple departments. 
        The campaign used ${data.scenarioType || 'banking security alert'} scenarios to test user awareness and response times.</p>
        
        <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Key Findings:</h3>
        <ul>
            <li>Click rate of ${data.clickRate || 23}% is ${data.clickRate > 20 ? 'above' : 'below'} industry average</li>
            <li>Report rate of ${data.reportRate || 45}% shows good security awareness</li>
            <li>Average response time of ${data.avgResponseTime || 12} minutes indicates prompt action</li>
        </ul>
    </div>
  `;
}

function generateIncidentResponseContent(data: any): string {
  return `
    <div class="section">
        <h2 class="section-title">Readiness Assessment</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${data.readinessScore || 78}%</div>
                <div class="metric-label">Overall Readiness</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.responseTime || 15}</div>
                <div class="metric-label">Avg Response Time (min)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.communicationScore || 85}%</div>
                <div class="metric-label">Communication Score</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Crisis Simulation Results</h2>
        <div class="chart-placeholder">
            🚨 Incident Response Timeline Visualization
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Capability Assessment</h2>
        <p>This assessment evaluates your organization's preparedness for cybersecurity incidents through simulated crisis scenarios.</p>
        
        <div style="margin-top: 1.5rem;">
            <h3>Response Capabilities:</h3>
            <div class="risk-item risk-high">
                <strong>Detection:</strong> ${data.detectionCapability || 'Automated monitoring systems in place'}
            </div>
            <div class="risk-item risk-medium">
                <strong>Communication:</strong> ${data.communicationCapability || 'Clear escalation procedures defined'}
            </div>
            <div class="risk-item risk-low">
                <strong>Recovery:</strong> ${data.recoveryCapability || 'Business continuity plans tested'}
            </div>
        </div>
    </div>
  `;
}

function generateComplianceContent(data: any): string {
  return `
    <div class="section">
        <h2 class="section-title">Compliance Overview</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${data.overallCompliance || 92}%</div>
                <div class="metric-label">Overall Compliance</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.frameworksAssessed || 4}</div>
                <div class="metric-label">Frameworks Assessed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.controlsEvaluated || 156}</div>
                <div class="metric-label">Controls Evaluated</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Framework Compliance</h2>
        <div class="risk-item risk-low">
            <strong>NIST Cybersecurity Framework:</strong> <span class="status-badge status-good">${data.nistCompliance || 95}% Compliant</span>
        </div>
        <div class="risk-item risk-low">
            <strong>ISO 27001:</strong> <span class="status-badge status-good">${data.isoCompliance || 91}% Compliant</span>
        </div>
        <div class="risk-item risk-medium">
            <strong>GDPR:</strong> <span class="status-badge status-warning">${data.gdprCompliance || 87}% Compliant</span>
        </div>
        <div class="risk-item risk-low">
            <strong>SOC 2:</strong> <span class="status-badge status-good">${data.soc2Compliance || 93}% Compliant</span>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Gap Analysis</h2>
        <div class="chart-placeholder">
            📋 Compliance Gap Analysis Chart
        </div>
    </div>
  `;
}

function generateRiskAssessmentContent(data: any): string {
  return `
    <div class="section">
        <h2 class="section-title">Risk Profile</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${data.overallRiskScore || 68}</div>
                <div class="metric-label">Risk Score (0-100)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.criticalRisks || 3}</div>
                <div class="metric-label">Critical Risks</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.mediumRisks || 7}</div>
                <div class="metric-label">Medium Risks</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.lowRisks || 12}</div>
                <div class="metric-label">Low Risks</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Risk Heat Map</h2>
        <div class="chart-placeholder">
            🔥 Risk Heat Map Visualization
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Top Risk Categories</h2>
        <div class="risk-item risk-high">
            <strong>Critical:</strong> Email-based threats and social engineering attacks
        </div>
        <div class="risk-item risk-medium">
            <strong>High:</strong> Insider threats and privilege escalation
        </div>
        <div class="risk-item risk-medium">
            <strong>Medium:</strong> Third-party vendor security gaps
        </div>
        <div class="risk-item risk-low">
            <strong>Low:</strong> Physical security vulnerabilities
        </div>
    </div>
  `;
}

function generateDefaultContent(data: any): string {
  return `
    <div class="section">
        <h2 class="section-title">Sample Report Summary</h2>
        <p>This sample report demonstrates security analysis and recommendations capabilities for portfolio showcase.</p>
        <div class="chart-placeholder">
            📊 Sample Report Data Visualization
        </div>
    </div>
  `;
}

// Helper functions to generate report data
async function generateExecutiveSummaryReport(dateRange: any) {
  const stats = await storage.getDashboardStats();
  return {
    title: "Executive Security Summary - Sample Report",
    period: dateRange || "Last 30 days",
    overallSecurityScore: stats.knowledgeScore || 78,
    keyRisks: [
      "Email phishing susceptibility higher than industry average",
      "Password security training completion below target",
      "Incident response time needs improvement"
    ],
    trainingEffectiveness: 85,
    budgetImpact: "$12,500 savings from reduced security incidents",
    recommendations: [
      "Increase phishing simulation frequency",
      "Implement advanced password policies",
      "Conduct quarterly crisis response drills"
    ]
  };
}

async function generateSecurityAwarenessReport(dateRange: any) {
  return {
    title: "Security Awareness Performance - Sample Report",
    period: dateRange || "Last quarter",
    completionRate: 92,
    averageScore: 84,
    topPerformingDepartments: ["IT", "Finance", "Legal"],
    areasForImprovement: ["Email security", "Physical security"],
    behaviorChangeIndicators: {
      phishingReportRate: 68,
      passwordPolicyCompliance: 91,
      securityIncidentReduction: 34
    }
  };
}

async function generatePhishingCampaignReport(dateRange: any) {
  const simulations = await storage.getSimulations();
  return {
    title: "Phishing Simulation Analysis - Sample Report",
    period: dateRange || "Last campaign",
    totalCampaigns: simulations.length,
    overallClickRate: 15,
    reportingRate: 45,
    improvementTrend: "+12% reporting increase",
    riskCategories: {
      high: 8,
      medium: 23,
      low: 45
    }
  };
}

async function generateIncidentResponseReport(dateRange: any) {
  return {
    title: "Incident Response Readiness - Sample Report",
    period: dateRange || "Semi-annual review",
    averageResponseTime: "18 minutes",
    communicationEffectiveness: 78,
    decisionQuality: 82,
    readinessScore: 80,
    recommendedActions: [
      "Update communication protocols",
      "Conduct more frequent drills",
      "Improve escalation procedures"
    ]
  };
}

async function generateComplianceAuditReport(dateRange: any) {
  const metrics = await storage.getComplianceMetrics();
  return {
    title: "Compliance Documentation - Sample Report",
    period: dateRange || "Annual audit",
    frameworks: metrics.length > 0 ? metrics : [
      { name: "NIST", score: 85 },
      { name: "ISO 27001", score: 78 },
      { name: "SOC 2", score: 91 }
    ],
    overallCompliance: 84,
    documentsReviewed: 156,
    controlsImplemented: 89,
    gapsIdentified: 12
  };
}

async function generateRiskAssessmentReport(dateRange: any) {
  return {
    title: "Cybersecurity Risk Assessment - Sample Report",
    period: dateRange || "Quarterly assessment",
    overallRiskScore: 68,
    criticalRisks: 3,
    highRisks: 12,
    mediumRisks: 28,
    lowRisks: 45,
    topThreats: [
      "Email-based attacks",
      "Credential compromise", 
      "Social engineering"
    ],
    mitigationProgress: 75
  };
}

// Training Resource PDF Generation Functions
function generateEmailSecurityGuide(): string {
  return generateTrainingHTML("Email Security Guide", `
    <div class="training-section">
      <h2>Introduction to Email Security</h2>
      <p>Email remains one of the most targeted attack vectors for cybercriminals. This comprehensive guide provides essential knowledge for identifying, preventing, and responding to email-based threats.</p>
    </div>

    <div class="training-section">
      <h2>Common Email Threats</h2>
      <div class="threat-list">
        <h3>🎣 Phishing Attacks</h3>
        <p>Fraudulent emails designed to steal credentials or personal information.</p>
        
        <h3>🦠 Malware Distribution</h3>
        <p>Emails containing malicious attachments or links to infected websites.</p>
        
        <h3>📧 Business Email Compromise (BEC)</h3>
        <p>Sophisticated attacks targeting executives and finance personnel.</p>
        
        <h3>🎭 Spoofing</h3>
        <p>Emails appearing to come from trusted sources but originating from attackers.</p>
      </div>
    </div>

    <div class="training-section">
      <h2>Email Security Best Practices</h2>
      <div class="best-practices">
        <h3>✅ Verification Steps</h3>
        <ul>
          <li>Always verify sender identity through independent channels</li>
          <li>Check email headers for suspicious routing</li>
          <li>Examine URLs before clicking (hover to preview)</li>
          <li>Verify attachment authenticity before opening</li>
        </ul>
        
        <h3>🔍 Red Flags to Watch For</h3>
        <ul>
          <li>Urgent language demanding immediate action</li>
          <li>Requests for sensitive information via email</li>
          <li>Generic greetings ("Dear Customer")</li>
          <li>Spelling and grammar errors</li>
          <li>Mismatched or suspicious sender domains</li>
        </ul>
        
        <h3>🛡️ Protective Measures</h3>
        <ul>
          <li>Enable two-factor authentication</li>
          <li>Use strong, unique passwords</li>
          <li>Keep email clients updated</li>
          <li>Configure spam filters properly</li>
          <li>Regular security awareness training</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Incident Response</h2>
      <p><strong>If you receive a suspicious email:</strong></p>
      <ol>
        <li>Do NOT click any links or open attachments</li>
        <li>Report the email to your IT security team</li>
        <li>Forward the email to your security team for analysis</li>
        <li>Delete the email after reporting</li>
        <li>Monitor accounts for unusual activity</li>
      </ol>
    </div>

    <div class="training-section">
      <h2>Key Takeaways</h2>
      <div class="takeaways">
        <p>• Email security is everyone's responsibility</p>
        <p>• When in doubt, verify independently</p>
        <p>• Report suspicious activities immediately</p>
        <p>• Stay informed about current threat trends</p>
        <p>• Practice good digital hygiene consistently</p>
      </div>
    </div>
  `);
}

function generateIncidentResponsePlaybook(): string {
  return generateTrainingHTML("Incident Response Playbook", `
    <div class="training-section">
      <h2>Incident Response Framework</h2>
      <p>This playbook provides step-by-step procedures for responding to cybersecurity incidents effectively and efficiently.</p>
    </div>

    <div class="training-section">
      <h2>Phase 1: Preparation</h2>
      <div class="phase-content">
        <h3>🏗️ Infrastructure Setup</h3>
        <ul>
          <li>Establish incident response team with defined roles</li>
          <li>Create communication channels and contact lists</li>
          <li>Prepare forensic tools and backup systems</li>
          <li>Document network topology and critical assets</li>
        </ul>
        
        <h3>📋 Documentation Requirements</h3>
        <ul>
          <li>Incident response procedures and checklists</li>
          <li>Legal and regulatory compliance requirements</li>
          <li>Vendor contact information and support contracts</li>
          <li>Business continuity and disaster recovery plans</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Phase 2: Detection & Analysis</h2>
      <div class="phase-content">
        <h3>🔍 Incident Identification</h3>
        <ol>
          <li>Monitor security alerts and system logs</li>
          <li>Analyze reported suspicious activities</li>
          <li>Validate potential security incidents</li>
          <li>Categorize incident type and severity</li>
        </ol>
        
        <h3>📊 Initial Assessment</h3>
        <ul>
          <li>Determine scope and impact of the incident</li>
          <li>Identify affected systems and data</li>
          <li>Assess potential business impact</li>
          <li>Document initial findings and timeline</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Phase 3: Containment, Eradication & Recovery</h2>
      <div class="phase-content">
        <h3>🛡️ Containment Strategy</h3>
        <ul>
          <li>Isolate affected systems to prevent spread</li>
          <li>Preserve evidence for forensic analysis</li>
          <li>Implement temporary security measures</li>
          <li>Maintain business operations where possible</li>
        </ul>
        
        <h3>🔧 Eradication Process</h3>
        <ul>
          <li>Remove malware and close attack vectors</li>
          <li>Patch vulnerabilities and security gaps</li>
          <li>Strengthen security controls</li>
          <li>Validate system integrity</li>
        </ul>
        
        <h3>🔄 Recovery Operations</h3>
        <ul>
          <li>Restore systems from clean backups</li>
          <li>Gradually return systems to production</li>
          <li>Monitor for signs of persistent threats</li>
          <li>Verify business process restoration</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Phase 4: Post-Incident Activity</h2>
      <div class="phase-content">
        <h3>📝 Documentation & Reporting</h3>
        <ul>
          <li>Complete detailed incident report</li>
          <li>Document lessons learned and improvements</li>
          <li>Submit required regulatory notifications</li>
          <li>Update incident response procedures</li>
        </ul>
        
        <h3>🎯 Continuous Improvement</h3>
        <ul>
          <li>Conduct post-incident review meetings</li>
          <li>Update security policies and procedures</li>
          <li>Enhance monitoring and detection capabilities</li>
          <li>Provide additional staff training as needed</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Emergency Contacts</h2>
      <div class="contact-grid">
        <div class="contact-card">
          <h3>Internal Team</h3>
          <p>Security Team: ext. 2400</p>
          <p>IT Operations: ext. 2300</p>
          <p>Legal Department: ext. 1500</p>
        </div>
        <div class="contact-card">
          <h3>External Resources</h3>
          <p>FBI Cyber Crime: 855-292-3937</p>
          <p>CISA: 888-282-0870</p>
          <p>Cyber Insurance: [Policy Number]</p>
        </div>
      </div>
    </div>
  `);
}

function generatePasswordPolicyTemplate(): string {
  return generateTrainingHTML("Password Policy Template", `
    <div class="training-section">
      <h2>Password Policy Overview</h2>
      <p>This policy establishes requirements for creating, maintaining, and protecting passwords across all organizational systems and applications.</p>
    </div>

    <div class="training-section">
      <h2>Password Requirements</h2>
      <div class="policy-requirements">
        <h3>🔐 Minimum Standards</h3>
        <ul>
          <li><strong>Length:</strong> Minimum 12 characters (recommended 16+)</li>
          <li><strong>Complexity:</strong> Mix of uppercase, lowercase, numbers, and symbols</li>
          <li><strong>Uniqueness:</strong> No reuse of last 12 passwords</li>
          <li><strong>Expiration:</strong> Change every 90 days for privileged accounts</li>
        </ul>
        
        <h3>🚫 Prohibited Practices</h3>
        <ul>
          <li>Dictionary words or common phrases</li>
          <li>Personal information (names, birthdays, addresses)</li>
          <li>Sequential characters (123456, abcdef)</li>
          <li>Sharing passwords with others</li>
          <li>Writing passwords in unsecured locations</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Multi-Factor Authentication (MFA)</h2>
      <div class="mfa-section">
        <h3>📱 Required Implementation</h3>
        <ul>
          <li>All administrative and privileged accounts</li>
          <li>Access to financial and HR systems</li>
          <li>Remote access to corporate networks</li>
          <li>Cloud-based business applications</li>
        </ul>
        
        <h3>🔧 Approved MFA Methods</h3>
        <ul>
          <li>Hardware security keys (preferred)</li>
          <li>Mobile authenticator applications</li>
          <li>SMS verification (where necessary)</li>
          <li>Biometric authentication</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Password Management</h2>
      <div class="management-guidelines">
        <h3>🛠️ Approved Password Managers</h3>
        <ul>
          <li>Corporate-approved password management solutions</li>
          <li>Encrypted password storage with strong master passwords</li>
          <li>Regular backup and synchronization</li>
          <li>Secure sharing features for team passwords</li>
        </ul>
        
        <h3>💾 Storage Requirements</h3>
        <ul>
          <li>Use approved password managers only</li>
          <li>Never store passwords in browsers or plain text</li>
          <li>Secure master passwords with additional protection</li>
          <li>Regular review and cleanup of stored credentials</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Account Management</h2>
      <div class="account-procedures">
        <h3>🔒 Account Lockout Policy</h3>
        <ul>
          <li>Account locks after 5 failed attempts</li>
          <li>30-minute lockout duration</li>
          <li>Administrative override for urgent access</li>
          <li>Monitoring and alerting for unusual activity</li>
        </ul>
        
        <h3>⚠️ Incident Reporting</h3>
        <ul>
          <li>Immediately report suspected password compromise</li>
          <li>Change passwords if security breach suspected</li>
          <li>Document all password-related security incidents</li>
          <li>Follow incident response procedures</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Compliance and Enforcement</h2>
      <div class="compliance-section">
        <h3>📋 Regular Audits</h3>
        <ul>
          <li>Quarterly password policy compliance reviews</li>
          <li>Annual penetration testing and vulnerability assessments</li>
          <li>Regular training and awareness programs</li>
          <li>Continuous monitoring of authentication systems</li>
        </ul>
        
        <h3>⚖️ Violations and Consequences</h3>
        <ul>
          <li>First violation: Security awareness training</li>
          <li>Repeat violations: Formal disciplinary action</li>
          <li>Severe violations: Account suspension</li>
          <li>All violations documented in personnel records</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Implementation Timeline</h2>
      <div class="timeline">
        <p><strong>Phase 1 (Month 1):</strong> Policy announcement and initial training</p>
        <p><strong>Phase 2 (Month 2):</strong> Password manager deployment</p>
        <p><strong>Phase 3 (Month 3):</strong> MFA implementation for critical systems</p>
        <p><strong>Phase 4 (Month 4):</strong> Full compliance enforcement</p>
      </div>
    </div>
  `);
}

function generateSocialEngineeringDefense(): string {
  return generateTrainingHTML("Social Engineering Defense", `
    <div class="training-section">
      <h2>Understanding Social Engineering</h2>
      <p>Social engineering exploits human psychology rather than technical vulnerabilities. Attackers manipulate people into divulging confidential information or performing actions that compromise security.</p>
    </div>

    <div class="training-section">
      <h2>Common Attack Types</h2>
      <div class="attack-types">
        <h3>📞 Vishing (Voice Phishing)</h3>
        <p>Phone calls impersonating trusted entities to extract information.</p>
        <ul>
          <li>Fake tech support calls</li>
          <li>Impersonation of banks or government agencies</li>
          <li>False emergency situations</li>
        </ul>
        
        <h3>💬 Smishing (SMS Phishing)</h3>
        <p>Text messages containing malicious links or requests for information.</p>
        <ul>
          <li>Fake delivery notifications</li>
          <li>Prize or lottery scams</li>
          <li>Account verification requests</li>
        </ul>
        
        <h3>🎭 Pretexting</h3>
        <p>Creating false scenarios to gain trust and extract information.</p>
        <ul>
          <li>Impersonating IT personnel</li>
          <li>Fake surveys and research calls</li>
          <li>False identity verification</li>
        </ul>
        
        <h3>🪝 Baiting</h3>
        <p>Offering something enticing to trigger curiosity and compromise security.</p>
        <ul>
          <li>Infected USB drives left in public areas</li>
          <li>Free software downloads</li>
          <li>Fake promotions and offers</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Psychological Manipulation Tactics</h2>
      <div class="tactics-grid">
        <div class="tactic-card">
          <h3>⚡ Urgency</h3>
          <p>Creating false time pressure to bypass normal verification processes.</p>
        </div>
        <div class="tactic-card">
          <h3>👑 Authority</h3>
          <p>Impersonating executives or authority figures to compel compliance.</p>
        </div>
        <div class="tactic-card">
          <h3>🤝 Trust</h3>
          <p>Building rapport and false relationships to lower defenses.</p>
        </div>
        <div class="tactic-card">
          <h3>😰 Fear</h3>
          <p>Creating panic about account compromise or legal consequences.</p>
        </div>
      </div>
    </div>

    <div class="training-section">
      <h2>Defense Strategies</h2>
      <div class="defense-strategies">
        <h3>🔍 Verification Protocols</h3>
        <ul>
          <li>Always verify identity through independent channels</li>
          <li>Use official contact information, not provided numbers</li>
          <li>Implement callback procedures for sensitive requests</li>
          <li>Require multiple forms of authentication</li>
        </ul>
        
        <h3>🚨 Warning Signs</h3>
        <ul>
          <li>Unsolicited contact requesting sensitive information</li>
          <li>High-pressure tactics demanding immediate action</li>
          <li>Requests to bypass normal security procedures</li>
          <li>Unusual requests from known contacts</li>
          <li>Offers that seem too good to be true</li>
        </ul>
        
        <h3>🛡️ Protective Measures</h3>
        <ul>
          <li>Establish clear information sharing policies</li>
          <li>Regular security awareness training</li>
          <li>Implement "pause and verify" protocols</li>
          <li>Create reporting mechanisms for suspicious contact</li>
          <li>Practice scenario-based training exercises</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Response Procedures</h2>
      <div class="response-procedures">
        <h3>🚩 If You Receive Suspicious Contact</h3>
        <ol>
          <li>Do not provide any information immediately</li>
          <li>Ask for specific details about the request</li>
          <li>Verify identity through official channels</li>
          <li>Report the incident to your security team</li>
          <li>Document all details of the interaction</li>
        </ol>
        
        <h3>🚨 If You've Been Compromised</h3>
        <ol>
          <li>Immediately report the incident</li>
          <li>Change all potentially affected passwords</li>
          <li>Monitor accounts for unusual activity</li>
          <li>Follow company incident response procedures</li>
          <li>Participate in post-incident analysis</li>
        </ol>
      </div>
    </div>

    <div class="training-section">
      <h2>Building a Security Culture</h2>
      <div class="culture-building">
        <h3>🎯 Training Programs</h3>
        <ul>
          <li>Regular simulated social engineering tests</li>
          <li>Interactive workshops and role-playing exercises</li>
          <li>Real-world case study analysis</li>
          <li>Continuous education on emerging threats</li>
        </ul>
        
        <h3>🏆 Recognition and Rewards</h3>
        <ul>
          <li>Acknowledge employees who report suspicious activity</li>
          <li>Share success stories and lessons learned</li>
          <li>Create security champion programs</li>
          <li>Foster open communication about security concerns</li>
        </ul>
      </div>
    </div>

    <div class="training-section">
      <h2>Quick Reference Guide</h2>
      <div class="quick-reference">
        <h3>🤔 When in Doubt:</h3>
        <p>• STOP - Don't act immediately</p>
        <p>• THINK - Is this request unusual?</p>
        <p>• VERIFY - Confirm through official channels</p>
        <p>• REPORT - Alert your security team</p>
        <p>• LEARN - Help improve organizational defenses</p>
      </div>
    </div>
  `);
}

function generateTrainingHTML(title: string, content: string): string {
  const logoBase64 = "data:image/svg+xml;base64," + Buffer.from(`
    <svg width="180" height="40" viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="8" width="6" height="24" fill="#2563eb"/>
      <rect x="8" y="4" width="6" height="32" fill="#1d4ed8"/>
      <rect x="16" y="0" width="6" height="40" fill="#1e40af"/>
      <text x="30" y="26" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1e293b">DefenseHub</text>
    </svg>
  `).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - DefenseHub Training</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #334155; 
            background: #f8fafc;
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); 
            color: white; 
            padding: 2rem; 
            text-align: center;
        }
        .header img { max-height: 40px; margin-bottom: 1rem; }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .content { padding: 2rem; }
        .training-section { margin-bottom: 2rem; }
        .training-section h2 { 
            color: #1e40af; 
            font-size: 1.5rem; 
            margin-bottom: 1rem; 
            border-left: 4px solid #2563eb; 
            padding-left: 1rem;
        }
        .training-section h3 { 
            color: #374151; 
            font-size: 1.2rem; 
            margin: 1rem 0 0.5rem 0; 
        }
        .training-section p { margin-bottom: 1rem; color: #4b5563; }
        .training-section ul, .training-section ol { 
            margin-left: 1.5rem; 
            margin-bottom: 1rem; 
        }
        .training-section li { margin-bottom: 0.5rem; color: #4b5563; }
        .threat-list, .best-practices, .phase-content, .policy-requirements, 
        .mfa-section, .management-guidelines, .account-procedures, 
        .compliance-section, .attack-types, .defense-strategies, 
        .response-procedures, .culture-building { 
            background: #f1f5f9; 
            padding: 1.5rem; 
            border-radius: 8px; 
            margin: 1rem 0;
        }
        .tactics-grid, .contact-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 1rem; 
            margin: 1rem 0; 
        }
        .tactic-card, .contact-card { 
            background: white; 
            padding: 1rem; 
            border-radius: 6px; 
            border: 1px solid #e2e8f0; 
        }
        .tactic-card h3, .contact-card h3 { 
            color: #2563eb; 
            margin-bottom: 0.5rem; 
        }
        .takeaways { 
            background: #dbeafe; 
            padding: 1rem; 
            border-radius: 6px; 
            border-left: 4px solid #2563eb; 
        }
        .takeaways p { margin-bottom: 0.5rem; font-weight: 500; }
        .timeline { background: #f0f9ff; padding: 1rem; border-radius: 6px; }
        .timeline p { margin-bottom: 0.5rem; }
        .quick-reference { 
            background: #fef3c7; 
            padding: 1rem; 
            border-radius: 6px; 
            border-left: 4px solid #f59e0b; 
        }
        .quick-reference p { margin-bottom: 0.3rem; font-weight: 500; }
        .footer { 
            background: #1e293b; 
            color: white; 
            text-align: center; 
            padding: 1rem; 
            font-size: 0.9rem; 
        }
        @media print {
            .container { box-shadow: none; }
            .header { background: #1e40af !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoBase64}" alt="DefenseHub Logo">
            <h1>${title}</h1>
            <p>Professional Cybersecurity Training Resource</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} DefenseHub - AI-Driven Cybersecurity Training Platform</p>
            <p>This document contains confidential training materials. Distribute only to authorized personnel.</p>
        </div>
    </div>
</body>
</html>`;
}

// Generate PDF from HTML using Puppeteer
async function generatePDFFromHTML(htmlContent: string): Promise<Buffer> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    return pdfBuffer;
  } catch (error) {
    console.error('Puppeteer PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


