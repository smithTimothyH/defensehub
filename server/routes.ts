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

  // Send compliance report
  app.post("/api/email/compliance-report", async (req, res) => {
    try {
      const { to, reportData } = req.body;
      
      if (!to || !reportData) {
        return res.status(400).json({ message: "Missing required fields: to, reportData" });
      }



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
    overallSecurityScore: stats.securityScore || 78,
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
