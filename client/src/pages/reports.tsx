import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, BarChart, PieChart, LineChart } from "lucide-react";

export default function Reports() {
  const { data: simulations } = useQuery({
    queryKey: ["/api/simulations"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const reportTypes = [
    {
      id: "security-awareness",
      title: "Security Awareness Report",
      description: "Comprehensive analysis of user training performance and security posture",
      icon: BarChart,
      metrics: ["User Performance", "Training Completion", "Risk Assessment"],
    },
    {
      id: "phishing-campaign",
      title: "Phishing Campaign Analysis",
      description: "Detailed breakdown of phishing simulation results and user responses",
      icon: PieChart,
      metrics: ["Click Rates", "Report Rates", "User Behavior"],
    },
    {
      id: "compliance-audit",
      title: "Compliance Audit Trail",
      description: "Full audit documentation for regulatory compliance requirements",
      icon: FileText,
      metrics: ["Policy Adherence", "Training Records", "Incident Response"],
    },
    {
      id: "crisis-response",
      title: "Crisis Response Performance",
      description: "Analysis of decision-making and response times during crisis simulations",
      icon: TrendingUp,
      metrics: ["Response Times", "Decision Quality", "Communication"],
    },
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Templates</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-cyber-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Includes:</p>
                    <div className="flex flex-wrap gap-2">
                      {report.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="pdf">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="flex-1 bg-cyber-primary hover:bg-blue-700">
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
            <CardTitle>Recent Reports</CardTitle>
            <Button variant="outline" size="sm">
              View All Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-cyber-success" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                    <p className="text-sm text-gray-500">
                      {report.type} • Generated {report.generatedAt} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-cyber-success bg-opacity-20 text-cyber-success">
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
