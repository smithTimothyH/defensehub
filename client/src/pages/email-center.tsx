import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Send, 
  AlertTriangle, 
  FileText, 
  Shield, 
  CheckCircle, 
  Clock,
  Users,
  MessageSquare
} from "lucide-react";

export default function EmailCenter() {
  const [emailResult, setEmailResult] = useState<any>(null);
  const queryClient = useQueryClient();

  // Test email connection
  const { data: connectionStatus, isLoading: connectionLoading } = useQuery({
    queryKey: ['/api/email/test'],
    enabled: true
  });

  // Phishing email form
  const [phishingForm, setPhishingForm] = useState({
    to: '',
    scenarioType: 'urgent-security',
    targetUrl: 'https://example-phishing-site.com/login'
  });

  // Security alert form
  const [alertForm, setAlertForm] = useState({
    to: '',
    title: '',
    severity: 'Medium',
    description: '',
    recommendations: ''
  });

  // Custom email form
  const [customForm, setCustomForm] = useState({
    to: '',
    subject: '',
    text: '',
    html: ''
  });

  // Send phishing email mutation
  const sendPhishingEmail = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/email/phishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.to,
          scenario: {
            type: data.scenarioType,
            targetUrl: data.targetUrl
          }
        })
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setEmailResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/audit-logs'] });
    }
  });

  // Send security alert mutation
  const sendSecurityAlert = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/email/security-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.to,
          alertData: {
            title: data.title,
            severity: data.severity,
            description: data.description,
            recommendations: data.recommendations.split('\n').filter((r: string) => r.trim())
          }
        })
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setEmailResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/audit-logs'] });
    }
  });

  // Send custom email mutation
  const sendCustomEmail = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setEmailResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/audit-logs'] });
    }
  });

  // Send compliance report mutation
  const sendComplianceReport = useMutation({
    mutationFn: async (to: string) => {
      const reportData = {
        overallScore: 87,
        frameworks: [
          { name: 'NIST CSF', score: 92 },
          { name: 'ISO 27001', score: 89 },
          { name: 'GDPR', score: 95 },
          { name: 'SOC 2', score: 72 }
        ]
      };
      
      const response = await fetch('/api/email/compliance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, reportData })
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setEmailResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/audit-logs'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Center</h2>
          <p className="text-gray-600">Send phishing simulations, security alerts, and compliance reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={(connectionStatus as any)?.success ? "default" : "destructive"}>
            {connectionLoading ? (
              <Clock className="h-4 w-4 mr-1" />
            ) : (connectionStatus as any)?.success ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-1" />
            )}
            {connectionLoading ? 'Testing...' : (connectionStatus as any)?.success ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Connection Status Alert */}
      {!connectionLoading && !(connectionStatus as any)?.success && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Email service is not configured. Please set up SMTP credentials in your environment variables:
            SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT, SMTP_SECURE
          </AlertDescription>
        </Alert>
      )}

      {/* Email Result Display */}
      {emailResult && (
        <Alert className={emailResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {emailResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={emailResult.success ? "text-green-800" : "text-red-800"}>
            {emailResult.success 
              ? `Email sent successfully! Message ID: ${emailResult.messageId}`
              : `Failed to send email: ${emailResult.error}`
            }
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="phishing" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="phishing" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Phishing Simulation</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Security Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Compliance Reports</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Custom Email</span>
          </TabsTrigger>
        </TabsList>

        {/* Phishing Simulation */}
        <TabsContent value="phishing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-cyber-primary" />
                <span>Send Phishing Simulation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phishing-to">Target Email</Label>
                  <Input
                    id="phishing-to"
                    type="email"
                    placeholder="user@company.com"
                    value={phishingForm.to}
                    onChange={(e) => setPhishingForm({ ...phishingForm, to: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="scenario-type">Scenario Type</Label>
                  <Select
                    value={phishingForm.scenarioType}
                    onValueChange={(value) => setPhishingForm({ ...phishingForm, scenarioType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent-security">Urgent Security Alert</SelectItem>
                      <SelectItem value="software-update">Software Update</SelectItem>
                      <SelectItem value="invoice-scam">Invoice Scam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="target-url">Target URL (for tracking)</Label>
                <Input
                  id="target-url"
                  placeholder="https://your-tracking-site.com"
                  value={phishingForm.targetUrl}
                  onChange={(e) => setPhishingForm({ ...phishingForm, targetUrl: e.target.value })}
                />
              </div>
              <Button 
                onClick={() => sendPhishingEmail.mutate(phishingForm)}
                disabled={sendPhishingEmail.isPending || !phishingForm.to}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendPhishingEmail.isPending ? 'Sending...' : 'Send Phishing Simulation'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Alerts */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-cyber-error" />
                <span>Send Security Alert</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alert-to">Recipient Email(s)</Label>
                  <Input
                    id="alert-to"
                    type="email"
                    placeholder="admin@company.com"
                    value={alertForm.to}
                    onChange={(e) => setAlertForm({ ...alertForm, to: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select
                    value={alertForm.severity}
                    onValueChange={(value) => setAlertForm({ ...alertForm, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="alert-title">Alert Title</Label>
                <Input
                  id="alert-title"
                  placeholder="Potential Security Breach Detected"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="alert-description">Description</Label>
                <Textarea
                  id="alert-description"
                  placeholder="Describe the security incident or concern..."
                  value={alertForm.description}
                  onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="recommendations">Recommended Actions (one per line)</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Change all passwords immediately&#10;Review access logs&#10;Enable MFA"
                  value={alertForm.recommendations}
                  onChange={(e) => setAlertForm({ ...alertForm, recommendations: e.target.value })}
                />
              </div>
              <Button 
                onClick={() => sendSecurityAlert.mutate(alertForm)}
                disabled={sendSecurityAlert.isPending || !alertForm.to || !alertForm.title}
                className="w-full"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {sendSecurityAlert.isPending ? 'Sending...' : 'Send Security Alert'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Reports */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-cyber-primary" />
                <span>Send Compliance Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-to">Recipient Email(s)</Label>
                <Input
                  id="report-to"
                  type="email"
                  placeholder="compliance@company.com, ceo@company.com"
                  onChange={(e) => setCustomForm({ ...customForm, to: e.target.value })}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Report Preview</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Overall Compliance Score: 87%</p>
                  <p>• NIST CSF: 92%</p>
                  <p>• ISO 27001: 89%</p>
                  <p>• GDPR: 95%</p>
                  <p>• SOC 2: 72%</p>
                </div>
              </div>
              <Button 
                onClick={() => sendComplianceReport.mutate(customForm.to)}
                disabled={sendComplianceReport.isPending || !customForm.to}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                {sendComplianceReport.isPending ? 'Sending...' : 'Send Compliance Report'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Email */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-cyber-primary" />
                <span>Send Custom Email</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom-to">Recipient Email</Label>
                  <Input
                    id="custom-to"
                    type="email"
                    placeholder="recipient@company.com"
                    value={customForm.to}
                    onChange={(e) => setCustomForm({ ...customForm, to: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-subject">Subject</Label>
                  <Input
                    id="custom-subject"
                    placeholder="Email subject"
                    value={customForm.subject}
                    onChange={(e) => setCustomForm({ ...customForm, subject: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="custom-text">Message (Plain Text)</Label>
                <Textarea
                  id="custom-text"
                  placeholder="Your email message..."
                  value={customForm.text}
                  onChange={(e) => setCustomForm({ ...customForm, text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="custom-html">HTML Content (Optional)</Label>
                <Textarea
                  id="custom-html"
                  placeholder="<html><body>Your HTML email content...</body></html>"
                  value={customForm.html}
                  onChange={(e) => setCustomForm({ ...customForm, html: e.target.value })}
                />
              </div>
              <Button 
                onClick={() => sendCustomEmail.mutate(customForm)}
                disabled={sendCustomEmail.isPending || !customForm.to || !customForm.subject || !customForm.text}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendCustomEmail.isPending ? 'Sending...' : 'Send Custom Email'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}