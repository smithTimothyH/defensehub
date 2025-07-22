import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface PhishingScenarioConfig {
  difficulty: "basic" | "intermediate" | "advanced";
  targetAudience: string[];
  companyName?: string;
  industry?: string;
}

export interface PhishingScenarioResult {
  subject: string;
  content: string;
  indicators: string[];
  difficulty: string;
}

export interface CoachingFeedback {
  feedback: string;
  recommendations: string[];
  securityTips: string[];
}

export interface CrisisScenario {
  title: string;
  description: string;
  phases: {
    phase: string;
    description: string;
    decisions: string[];
  }[];
}

export async function generatePhishingScenario(config: PhishingScenarioConfig): Promise<PhishingScenarioResult> {
  const prompt = `Generate a realistic phishing email scenario with the following requirements:
- Difficulty level: ${config.difficulty}
- Target audience: ${config.targetAudience.join(", ")}
- Company: ${config.companyName || "Generic Corporation"}
- Industry: ${config.industry || "Technology"}

Create a phishing email that includes:
1. A compelling subject line
2. Email content that uses social engineering tactics
3. Red flag indicators that users should identify
4. Appropriate difficulty for the target level

Respond in JSON format with the following structure:
{
  "subject": "Email subject line",
  "content": "Full email content with HTML formatting",
  "indicators": ["List of red flags and security indicators"],
  "difficulty": "${config.difficulty}"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity expert specializing in creating realistic phishing scenarios for security awareness training. Generate educational content that helps users learn to identify threats."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      subject: result.subject || "Security Alert",
      content: result.content || "Please verify your account immediately.",
      indicators: result.indicators || ["Generic warning signs"],
      difficulty: config.difficulty,
    };
  } catch (error) {
    console.error("Error generating phishing scenario:", error);
    
    // Fallback to pre-defined scenarios when OpenAI fails
    const fallbackScenarios = {
      basic: {
        subject: "Action Required: Verify Your Account",
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #1a73e8;">Account Verification Required</h2>
            <p>Dear User,</p>
            <p>We have detected unusual activity on your account. For your security, please verify your identity by clicking the link below:</p>
            <p><a href="http://suspicious-link.example.com/verify" style="background: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Account</a></p>
            <p>If you do not verify within 24 hours, your account will be suspended.</p>
            <p>Best regards,<br>Security Team</p>
          </div>
        `,
        indicators: [
          "Generic greeting instead of personalized name",
          "Creates urgency with account suspension threat",
          "Suspicious URL domain",
          "Poor grammar and formatting",
          "Requests immediate action"
        ]
      },
      intermediate: {
        subject: "Important: System Maintenance Notification",
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIj48dGV4dCB4PSIxMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzNyI+Q29tcGFueSBMb2dvPC90ZXh0Pjwvc3ZnPg==" alt="Company Logo" style="margin-bottom: 20px;">
            <h2 style="color: #d73527;">Scheduled System Maintenance</h2>
            <p>Dear Team Member,</p>
            <p>Our IT department will be performing critical system maintenance this weekend. To ensure uninterrupted access to your files, please backup your data using our secure portal:</p>
            <p><a href="http://backup-portal-secure.net/login" style="background: #d73527; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Backup Portal</a></p>
            <p>This maintenance is mandatory and failure to backup may result in data loss.</p>
            <p>Technical Support Team<br>IT Department</p>
          </div>
        `,
        indicators: [
          "Uses company-like branding but generic logo",
          "Creates fear of data loss",
          "External domain not matching company",
          "Urgent deadline pressure",
          "Requests credential entry on external site"
        ]
      },
      advanced: {
        subject: "Re: Q4 Budget Review - Action Items",
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <p style="color: #666; font-size: 12px;">This message was sent from: accounting@company-internal.org</p>
            <h3 style="color: #2d5aa0;">Budget Review Follow-up</h3>
            <p>Hi there,</p>
            <p>Following our meeting yesterday, I've compiled the budget adjustments as requested. The revised spreadsheet includes the Q4 allocations we discussed.</p>
            <p>Please review the attached document and confirm the changes by EOD:</p>
            <p><a href="http://docs-sharing-platform.net/download/budget-q4-final.xlsx" style="color: #2d5aa0; text-decoration: underline;">Q4_Budget_Review_Final.xlsx</a></p>
            <p>Let me know if you have any questions about the revised numbers.</p>
            <p>Best,<br>Sarah Mitchell<br>Finance Team</p>
            <p style="font-size: 11px; color: #999;">This email was sent from a secure company server. If you received this in error, please delete immediately.</p>
          </div>
        `,
        indicators: [
          "Domain spoofing with similar but incorrect domain",
          "Uses realistic business context and names",
          "External file download link",
          "Professional formatting to build trust",
          "References to recent meetings to establish credibility",
          "Adds false security notice to appear legitimate"
        ]
      }
    };

    const scenario = fallbackScenarios[config.difficulty] || fallbackScenarios.basic;
    return {
      subject: scenario.subject,
      content: scenario.content,
      indicators: scenario.indicators,
      difficulty: config.difficulty,
    };
  }
}

export async function generateCoachingFeedback(
  userAction: string,
  scenarioDetails: any,
  wasCorrectResponse: boolean
): Promise<CoachingFeedback> {
  const prompt = `Provide personalized coaching feedback for a user who ${userAction} in response to a phishing simulation.

Scenario context: ${JSON.stringify(scenarioDetails)}
User's response was ${wasCorrectResponse ? "correct" : "incorrect"}.

Provide constructive feedback that:
1. Explains what the user did well or what they missed
2. Offers specific recommendations for improvement
3. Provides actionable security tips for the future

Respond in JSON format:
{
  "feedback": "Personalized feedback message",
  "recommendations": ["Specific improvement recommendations"],
  "securityTips": ["Practical security tips"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert cybersecurity coach providing supportive, educational feedback to help users improve their security awareness."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      feedback: result.feedback || "Thank you for participating in the security training.",
      recommendations: result.recommendations || ["Continue practicing security awareness"],
      securityTips: result.securityTips || ["Always verify sender identity"],
    };
  } catch (error) {
    console.error("Error generating coaching feedback:", error);
    throw new Error("Failed to generate coaching feedback");
  }
}

export async function generateCrisisScenario(
  scenarioType: string,
  complexity: "basic" | "intermediate" | "advanced"
): Promise<CrisisScenario> {
  const prompt = `Generate a realistic cybersecurity crisis simulation scenario for GRC training.

Scenario type: ${scenarioType}
Complexity level: ${complexity}

Create a multi-phase crisis scenario that includes:
1. Initial incident description
2. Multiple decision phases with realistic choices
3. Escalating complexity based on the level
4. Realistic stakeholder interactions

Respond in JSON format:
{
  "title": "Crisis scenario title",
  "description": "Initial scenario description",
  "phases": [
    {
      "phase": "Phase name",
      "description": "What happens in this phase",
      "decisions": ["Decision option 1", "Decision option 2", "Decision option 3"]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity crisis management expert creating realistic GRC training scenarios for enterprise organizations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      title: result.title || "Cybersecurity Crisis",
      description: result.description || "A critical security incident has occurred.",
      phases: result.phases || [
        {
          phase: "Initial Response",
          description: "Immediate actions required",
          decisions: ["Contact IT team", "Notify management", "Document incident"]
        }
      ],
    };
  } catch (error) {
    console.error("Error generating crisis scenario:", error);
    throw new Error("Failed to generate crisis scenario");
  }
}
