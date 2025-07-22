import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    // For development, you can use Gmail, Outlook, or any SMTP service
    // For production, consider services like SendGrid, AWS SES, or Mailgun
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to: string | string[], subject: string, text: string, html?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"SentinelSim Security" <${process.env.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html: html || text,
      });

      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Phishing simulation email templates
  generatePhishingEmail(scenario: any): EmailTemplate {
    const templates = {
      'urgent-security': {
        subject: '🚨 Urgent: Security Alert - Immediate Action Required',
        text: `Dear Employee,

We've detected suspicious activity on your account. Please verify your credentials immediately to prevent unauthorized access.

Click here to secure your account: ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/phishing-caught` : 'https://example.com/phishing-caught'}

This is time-sensitive - please act within the next 2 hours.

Best regards,
IT Security Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
              <h1>🚨 Security Alert</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <p>Dear Employee,</p>
              <p>We've detected <strong>suspicious activity</strong> on your account. Please verify your credentials immediately to prevent unauthorized access.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/phishing-caught` : 'https://example.com/phishing-caught'}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Secure Your Account Now</a>
              </div>
              <p style="color: #dc2626; font-weight: bold;">⏰ This is time-sensitive - please act within the next 2 hours.</p>
              <p>Best regards,<br>IT Security Team</p>
            </div>
          </div>
        `
      },
      'software-update': {
        subject: 'Required: Critical Software Update Available',
        text: `Hello,

A critical security update is available for your work applications. Please install it immediately to maintain system security.

Download the update: ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/phishing-caught` : 'https://example.com/phishing-caught'}

Installation must be completed by end of business today.

IT Department`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2563eb; color: white; padding: 20px;">
              <h1>Software Update Required</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hello,</p>
              <p>A <strong>critical security update</strong> is available for your work applications. Please install it immediately to maintain system security.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/phishing-caught` : 'https://example.com/phishing-caught'}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Download Update</a>
              </div>
              <p><strong>Installation must be completed by end of business today.</strong></p>
              <p>IT Department</p>
            </div>
          </div>
        `
      },
      'invoice-scam': {
        subject: 'Invoice #INV-2024-0892 - Payment Required',
        text: `Dear Customer,

Your invoice #INV-2024-0892 for $1,247.99 is now overdue. Please review and make payment immediately to avoid service interruption.

View Invoice: ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/phishing-caught` : 'https://example.com/phishing-caught'}

Payment due: 3 days overdue
Amount: $1,247.99

Accounts Receivable`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f59e0b; color: white; padding: 20px;">
              <h1>Payment Required</h1>
            </div>
            <div style="padding: 20px;">
              <p>Dear Customer,</p>
              <p>Your invoice <strong>#INV-2024-0892</strong> for <strong>$1,247.99</strong> is now overdue.</p>
              <div style="background-color: #fef3c7; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>Payment Status:</strong> 3 days overdue<br>
                <strong>Amount Due:</strong> $1,247.99</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/phishing-caught` : 'https://example.com/phishing-caught'}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View Invoice</a>
              </div>
              <p>Please make payment immediately to avoid service interruption.</p>
              <p>Accounts Receivable</p>
            </div>
          </div>
        `
      }
    };

    return templates[scenario.type as keyof typeof templates] || templates['urgent-security'];
  }

  // Send phishing simulation email
  async sendPhishingSimulation(to: string, scenario: any) {
    const template = this.generatePhishingEmail(scenario);
    
    // Add clear training indicators to avoid spam filters
    const trainingDisclaimer = '\n\n---\n🛡️ This is a phishing simulation for security training purposes.\nGenerated by SentinelSim - Cybersecurity Training Platform';
    const htmlDisclaimer = '<div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 5px; font-size: 12px;"><strong>🛡️ TRAINING SIMULATION</strong><br>This is a phishing simulation for security training purposes.<br><em>Generated by SentinelSim - Cybersecurity Training Platform</em></div>';
    
    const mailOptions = {
      from: `"SentinelSim Training" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `[TRAINING] ${template.subject}`,
      text: template.text + trainingDisclaimer,
      html: template.html + htmlDisclaimer,
      headers: {
        'X-Priority': '3',
        'X-SentinelSim-Type': 'phishing-simulation',
        'X-Training-Exercise': 'true'
      }
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Phishing simulation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Phishing email sending failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send compliance report
  async sendComplianceReport(to: string | string[], reportData: any) {
    const subject = `Compliance Report - ${new Date().toLocaleDateString()}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background-color: #1e40af; color: white; padding: 20px;">
          <h1>📊 Compliance Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="padding: 20px;">
          <h2>Overall Compliance Score</h2>
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="font-size: 2em; font-weight: bold; color: #1e40af;">${reportData.overallScore}%</div>
            <p>Security compliance across all frameworks</p>
          </div>
          
          <h2>Framework Breakdown</h2>
          ${reportData.frameworks?.map((framework: any) => `
            <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 5px;">
              <strong>${framework.name}</strong>: ${framework.score}%
              <div style="background-color: #f3f4f6; height: 8px; border-radius: 4px; margin-top: 5px;">
                <div style="background-color: ${framework.score >= 90 ? '#10b981' : framework.score >= 75 ? '#f59e0b' : '#ef4444'}; height: 8px; width: ${framework.score}%; border-radius: 4px;"></div>
              </div>
            </div>
          `).join('') || '<p>No framework data available</p>'}
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <p><strong>This report was generated automatically by SentinelSim.</strong></p>
            <p>For detailed analysis, please log into your dashboard.</p>
          </div>
        </div>
      </div>
    `;

    const text = `Compliance Report - ${new Date().toLocaleDateString()}
    
Overall Compliance Score: ${reportData.overallScore}%

Framework Breakdown:
${reportData.frameworks?.map((f: any) => `- ${f.name}: ${f.score}%`).join('\n') || 'No framework data available'}

This report was generated automatically by SentinelSim.`;

    return await this.sendEmail(to, subject, text, html);
  }

  // Send security alert
  async sendSecurityAlert(to: string | string[], alertData: any) {
    const subject = `🚨 Security Alert: ${alertData.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc2626; color: white; padding: 20px;">
          <h1>🚨 Security Alert</h1>
        </div>
        <div style="padding: 20px;">
          <h2>${alertData.title}</h2>
          <p><strong>Severity:</strong> <span style="color: ${alertData.severity === 'High' ? '#dc2626' : alertData.severity === 'Medium' ? '#f59e0b' : '#10b981'}">${alertData.severity}</span></p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          
          <div style="background-color: #fef2f2; padding: 15px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Description:</strong></p>
            <p>${alertData.description}</p>
          </div>
          
          ${alertData.recommendations ? `
            <h3>Recommended Actions:</h3>
            <ul>
              ${alertData.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
          ` : ''}
          
          <p>Please review and take appropriate action immediately.</p>
          <p><strong>SentinelSim Security Team</strong></p>
        </div>
      </div>
    `;

    const text = `Security Alert: ${alertData.title}

Severity: ${alertData.severity}
Time: ${new Date().toLocaleString()}

Description: ${alertData.description}

${alertData.recommendations ? `Recommended Actions:\n${alertData.recommendations.map((rec: string) => `- ${rec}`).join('\n')}` : ''}

Please review and take appropriate action immediately.

SentinelSim Security Team`;

    return await this.sendEmail(to, subject, text, html);
  }

  // Test email connectivity
  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }
}

export const emailService = new EmailService();