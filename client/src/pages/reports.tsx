import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Download, TrendingUp, BarChart, PieChart, LineChart, Settings, Calendar, Users, Target, Shield, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";

export default function Reports() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const { toast } = useToast();
  
  const { data: simulations } = useQuery({
    queryKey: ["/api/simulations"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: reportsData = [], refetch: refetchReports } = useQuery({
    queryKey: ["/api/reports"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportConfig: any) => {
      const response = await apiRequest("POST", "/api/reports/generate", reportConfig);
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Report Generated Successfully",
        description: `${data.report?.title || 'Report'} has been generated and is ready for download.`,
      });
      // Refresh the reports list to show the new report
      refetchReports();
    },
    onError: (error: any) => {
      toast({
        title: "Report Generation Failed",
        description: error.message || "Unable to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = async (templateId: string, title?: string, customizations?: any) => {
    const reportConfig = {
      templateId,
      title,
      customizations,
      format: "pdf",
      dateRange: "last-30-days"
    };
    
    generateReportMutation.mutate(reportConfig);
  };

  const handleCustomReportGeneration = async (formData: any) => {
    const reportConfig = {
      templateId: selectedTemplate?.id,
      title: formData.title || selectedTemplate?.title,
      customizations: formData.customizations,
      format: formData.format || "pdf",
      dateRange: formData.dateRange
    };
    
    generateReportMutation.mutate(reportConfig);
    setShowCustomizeDialog(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const getReportTypeLabel = (type: string) => {
    const typeMap = {
      'executive-summary': 'Executive Summary',
      'security-awareness': 'Security Awareness',
      'phishing-campaign': 'Campaign Analysis', 
      'incident-response': 'Incident Response',
      'compliance-audit': 'Compliance Audit',
      'risk-assessment': 'Risk Assessment'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const reportTypes = [
    {
      id: "executive-summary",
      title: "Executive Security Summary",
      description: "High-level overview of organizational security posture for leadership",
      icon: Target,
      category: "Executive",
      frequency: "Monthly",
      duration: "5-10 min read",
      metrics: ["Overall Security Score", "Key Risk Indicators", "Budget Impact", "Strategic Recommendations"],
      sections: [
        "Executive Summary",
        "Security Score Overview", 
        "Top 5 Security Risks",
        "Training Effectiveness",
        "Budget & ROI Analysis",
        "Strategic Recommendations"
      ],
      customizable: ["Date Range", "Departments", "Risk Threshold", "Executive Recipients"]
    },
    {
      id: "security-awareness", 
      title: "Security Awareness Performance",
      description: "Comprehensive analysis of user training completion and learning effectiveness",
      icon: BarChart,
      category: "Training",
      frequency: "Quarterly", 
      duration: "15-20 min read",
      metrics: ["Training Completion Rates", "Knowledge Retention", "Behavioral Change", "Department Performance"],
      sections: [
        "Training Program Overview",
        "Completion Statistics by Department",
        "Learning Effectiveness Metrics", 
        "Knowledge Retention Analysis",
        "Behavioral Change Indicators",
        "Recommendations for Improvement"
      ],
      customizable: ["Training Modules", "Date Range", "Department Filter", "Performance Thresholds"]
    },
    {
      id: "phishing-campaign",
      title: "Phishing Simulation Analysis", 
      description: "Detailed analysis of phishing campaign results and user susceptibility",
      icon: PieChart,
      category: "Simulation",
      frequency: "Per Campaign",
      duration: "10-15 min read", 
      metrics: ["Click Rates", "Reporting Rates", "User Susceptibility", "Improvement Trends"],
      sections: [
        "Campaign Overview & Methodology",
        "Click Rate Analysis by Department",
        "Reporting Response Times", 
        "User Susceptibility Patterns",
        "Repeat Offender Analysis",
        "Training Recommendations"
      ],
      customizable: ["Campaign Selection", "Department Comparison", "Risk Categorization", "Anonymization Level"]
    },
    {
      id: "incident-response",
      title: "Incident Response Readiness",
      description: "Assessment of organizational preparedness for security incidents",
      icon: AlertTriangle,
      category: "Compliance",
      frequency: "Semi-Annual",
      duration: "20-25 min read",
      metrics: ["Response Time", "Communication Effectiveness", "Decision Quality", "Recovery Speed"],
      sections: [
        "Incident Response Capability Assessment",
        "Crisis Simulation Results",
        "Communication Protocol Effectiveness",
        "Decision-Making Analysis", 
        "Recovery Time Objectives",
        "Readiness Improvement Plan"
      ],
      customizable: ["Incident Types", "Team Roles", "Communication Channels", "Severity Levels"]
    },
    {
      id: "compliance-audit",
      title: "Compliance Documentation Report",
      description: "Comprehensive documentation for regulatory compliance and audit requirements",
      icon: FileText,
      category: "Compliance", 
      frequency: "Annual",
      duration: "30-45 min read",
      metrics: ["Policy Adherence", "Training Records", "Audit Trail", "Control Effectiveness"],
      sections: [
        "Regulatory Framework Overview",
        "Policy Compliance Status",
        "Training Documentation & Records",
        "Security Control Implementation",
        "Audit Trail & Evidence",
        "Gaps & Remediation Plan"
      ],
      customizable: ["Regulatory Framework", "Audit Period", "Control Selection", "Evidence Types"]
    },
    {
      id: "risk-assessment",
      title: "Cybersecurity Risk Assessment",
      description: "Detailed analysis of identified risks, threats, and organizational vulnerabilities",
      icon: Shield,
      category: "Risk Management",
      frequency: "Quarterly",
      duration: "25-30 min read", 
      metrics: ["Risk Scores", "Threat Landscape", "Vulnerability Assessment", "Mitigation Status"],
      sections: [
        "Risk Assessment Methodology",
        "Threat Landscape Analysis",
        "Vulnerability Identification",
        "Risk Scoring & Prioritization",
        "Mitigation Strategy Status",
        "Residual Risk Analysis"
      ],
      customizable: ["Risk Categories", "Threat Sources", "Impact Scenarios", "Mitigation Timeline"]
    }
  ];

  const recentReports = [
    {
      id: 1,
      title: "Q1 2024 Security Awareness Report",
      type: "Security Awareness",
      generatedAt: "2024-01-15",
      status: "completed",
      size: "2.4 MB",
    },
    {
      id: 2,
      title: "Phishing Campaign - December 2023",
      type: "Phishing Analysis",
      generatedAt: "2024-01-01",
      status: "completed",
      size: "1.8 MB",
    },
    {
      id: 3,
      title: "ISO 27001 Compliance Audit",
      type: "Compliance",
      generatedAt: "2023-12-20",
      status: "completed",
      size: "5.2 MB",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports for compliance and performance analysis</p>
        </div>
        <Button className="bg-cyber-primary hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          Generate Custom Report
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-cyber-primary" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{(stats as any)?.securityScore || 0}%</p>
                <p className="text-sm text-gray-600">Security Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-cyber-success" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{(stats as any)?.complianceRate || 0}%</p>
                <p className="text-sm text-gray-600">Compliance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <LineChart className="h-5 w-5 text-cyber-warning" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{(simulations as any)?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Simulations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Reports Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Report Templates</h3>
            <p className="text-sm text-gray-600">Professional templates for different audiences and use cases</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="simulation">Simulation</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="risk">Risk Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-cyber-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {report.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{report.frequency}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{report.duration}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Key Metrics:</p>
                    <div className="flex flex-wrap gap-1">
                      {report.metrics.slice(0, 3).map((metric) => (
                        <Badge key={metric} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                      {report.metrics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{report.metrics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Report Sections:</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {report.sections.slice(0, 3).map((section, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-cyber-success" />
                          <span>{section}</span>
                        </div>
                      ))}
                      {report.sections.length > 3 && (
                        <div className="text-gray-500 ml-5">
                          +{report.sections.length - 3} additional sections
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog open={showCustomizeDialog && selectedTemplate?.id === report.id} onOpenChange={setShowCustomizeDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTemplate(report)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Customize
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Customize {report.title}</DialogTitle>
                        </DialogHeader>
                        {selectedTemplate && (
                          <div className="space-y-6">
                            <div>
                              <Label className="text-sm font-medium">Report Title</Label>
                              <Input 
                                defaultValue={selectedTemplate.title}
                                className="mt-2"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Customization Options</Label>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                {selectedTemplate.customizable?.map((option: string) => (
                                  <div key={option} className="flex items-center space-x-2">
                                    <Checkbox id={option} defaultChecked />
                                    <Label htmlFor={option} className="text-sm">{option}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Date Range</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <Input type="date" placeholder="Start Date" />
                                <Input type="date" placeholder="End Date" />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Additional Notes</Label>
                              <Textarea 
                                placeholder="Add any specific requirements or notes for this report..."
                                className="mt-2"
                                rows={3}
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Output Format</Label>
                              <Select defaultValue="pdf">
                                <SelectTrigger className="mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pdf">PDF Report</SelectItem>
                                  <SelectItem value="excel">Excel Workbook</SelectItem>
                                  <SelectItem value="powerpoint">PowerPoint Presentation</SelectItem>
                                  <SelectItem value="csv">CSV Data Export</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setShowCustomizeDialog(false)}>
                                Cancel
                              </Button>
                              <Button 
                                className="bg-cyber-primary hover:bg-blue-700"
                                onClick={() => handleCustomReportGeneration({ 
                                  title: selectedTemplate?.title,
                                  format: "pdf" 
                                })}
                                disabled={generateReportMutation.isPending}
                              >
                                {generateReportMutation.isPending && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Generate Custom Report
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      className="flex-1 bg-cyber-primary hover:bg-blue-700"
                      onClick={() => handleGenerateReport(report.id, report.title)}
                      disabled={generateReportMutation.isPending}
                    >
                      {generateReportMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Reports ({reportsData.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetchReports()}>
              Refresh Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reportsData.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated Yet</h3>
              <p className="text-gray-500 mb-4">Generate your first report using the templates above.</p>
              <Button className="bg-cyber-primary hover:bg-blue-700" onClick={() => handleGenerateReport('executive-summary', 'Executive Security Summary')}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Sample Report
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reportsData.slice(0, 5).map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-cyber-success" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-500">
                        {getReportTypeLabel(report.type)} • Generated {formatDate(report.createdAt)} • {report.fileSize}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-cyber-success bg-opacity-20 text-cyber-success">
                      {report.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => window.open(report.downloadUrl, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
              {reportsData.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" className="w-full">
                    View All {reportsData.length} Reports
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
