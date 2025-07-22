import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Scale, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Calendar,
  Target,
  Shield,
  AlertCircle,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Compliance() {
  const [selectedFramework, setSelectedFramework] = useState("nist");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/compliance"],
  });

  const { data: simulations } = useQuery({
    queryKey: ["/api/simulations"],
  });

  const updateComplianceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/compliance", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Compliance Updated",
        description: "Compliance metrics have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update compliance metrics.",
        variant: "destructive",
      });
    },
  });

  // Default frameworks if no data from API
  const defaultFrameworks = [
    {
      framework: "NIST Cybersecurity Framework",
      score: 95,
      details: {
        identify: 98,
        protect: 94,
        detect: 96,
        respond: 92,
        recover: 95,
        lastAssessment: "2024-01-15",
        nextReview: "2024-04-15",
        criticalGaps: ["Incident Response Automation", "Recovery Testing"],
        strengths: ["Asset Management", "Access Control", "Awareness Training"]
      }
    },
    {
      framework: "ISO 27001",
      score: 78,
      details: {
        leadership: 85,
        planning: 75,
        support: 80,
        operation: 76,
        evaluation: 82,
        improvement: 72,
        lastAssessment: "2023-12-10",
        nextReview: "2024-03-10",
        criticalGaps: ["Risk Assessment Documentation", "Business Continuity"],
        strengths: ["Information Security Policy", "Human Resources Security"]
      }
    },
    {
      framework: "GDPR Compliance",
      score: 92,
      details: {
        lawfulness: 95,
        consent: 88,
        dataMinimization: 94,
        accuracy: 90,
        retention: 92,
        security: 96,
        lastAssessment: "2024-01-20",
        nextReview: "2024-07-20",
        criticalGaps: ["Data Subject Rights Automation", "Cross-border Transfers"],
        strengths: ["Privacy by Design", "Data Protection Impact Assessments"]
      }
    },
    {
      framework: "SOC 2 Type II",
      score: 65,
      details: {
        security: 70,
        availability: 68,
        processing: 62,
        confidentiality: 60,
        privacy: 65,
        lastAssessment: "2023-11-30",
        nextReview: "2024-02-28",
        criticalGaps: ["System Monitoring", "Change Management", "Vendor Management"],
        strengths: ["Access Controls", "Data Encryption"]
      }
    }
  ];

  const complianceData = (metrics as any)?.length > 0 ? metrics : defaultFrameworks;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-cyber-success";
    if (score >= 75) return "text-cyber-warning";
    return "text-cyber-error";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-cyber-success";
    if (score >= 75) return "bg-cyber-warning";
    return "bg-cyber-error";
  };

  const getFrameworkIcon = (framework: string) => {
    if (framework.includes("NIST")) return <Shield className="h-5 w-5" />;
    if (framework.includes("ISO")) return <Target className="h-5 w-5" />;
    if (framework.includes("GDPR")) return <Scale className="h-5 w-5" />;
    if (framework.includes("SOC")) return <FileText className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  const getOverallComplianceScore = () => {
    const total = (complianceData as any[]).reduce((sum: number, metric: any) => sum + metric.score, 0);
    return Math.round(total / (complianceData as any[]).length);
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 90) return { status: "Excellent", color: "bg-cyber-success", description: "Fully compliant with minimal gaps" };
    if (score >= 75) return { status: "Good", color: "bg-cyber-warning", description: "Generally compliant with some improvements needed" };
    return { status: "Needs Attention", color: "bg-cyber-error", description: "Significant gaps require immediate attention" };
  };

  const selectedFrameworkData = (complianceData as any[]).find((f: any) => 
    f.framework.toLowerCase().includes(selectedFramework)
  ) || (complianceData as any[])[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Management</h2>
          <p className="text-gray-600">Monitor and manage compliance across multiple frameworks and standards</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-cyber-primary hover:bg-blue-700">
            <Scale className="h-4 w-4 mr-2" />
            Schedule Assessment
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-cyber-primary rounded-full flex items-center justify-center">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{getOverallComplianceScore()}%</h3>
                  <p className="text-gray-600">Overall Compliance Score</p>
                  <Badge className={`${getScoreBgColor(getOverallComplianceScore())} text-white mt-2`}>
                    {getComplianceStatus(getOverallComplianceScore()).status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                {getComplianceStatus(getOverallComplianceScore()).description}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Frameworks Monitored</span>
                <span className="font-semibold text-gray-900">{(complianceData as any[]).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Simulations</span>
                <span className="font-semibold text-gray-900">{(simulations as any)?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Assessment</span>
                <span className="font-semibold text-gray-900">Jan 20, 2024</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Critical Gaps</span>
                <span className="font-semibold text-cyber-error">
                  {(complianceData as any[]).filter((f: any) => f.score < 75).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Compliant Frameworks</span>
                <span className="font-semibold text-cyber-success">
                  {(complianceData as any[]).filter((f: any) => f.score >= 90).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next Review</span>
                <span className="font-semibold text-gray-900">Feb 28, 2024</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Framework Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Frameworks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(complianceData as any[]).map((metric: any) => (
              <div key={metric.framework} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${getScoreBgColor(metric.score)} bg-opacity-20 rounded-lg flex items-center justify-center`}>
                      {getFrameworkIcon(metric.framework)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{metric.framework}</h4>
                      <p className="text-sm text-gray-500">
                        Last assessed: {metric.details?.lastAssessment || "Not assessed"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}%
                    </span>
                    <Badge 
                      className={`${getScoreBgColor(metric.score)} text-white ml-2`}
                    >
                      {getComplianceStatus(metric.score).status}
                    </Badge>
                  </div>
                </div>
                <Progress value={metric.score} className="h-2 mb-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Next review: {metric.details?.nextReview || "TBD"}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedFramework(metric.framework.toLowerCase().split(' ')[0])}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-cyber-error bg-red-50">
              <AlertTriangle className="h-4 w-4 text-cyber-error" />
              <AlertDescription>
                <span className="font-medium text-cyber-error">SOC 2 Type II requires immediate attention</span>
                <br />
                Score is below 75%. Consider running additional crisis simulations and improving system monitoring.
              </AlertDescription>
            </Alert>

            <Alert className="border-cyber-warning bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-cyber-warning" />
              <AlertDescription>
                <span className="font-medium text-cyber-warning">ISO 27001 assessment due</span>
                <br />
                Scheduled review approaching in 6 weeks. Begin preparation for documentation updates.
              </AlertDescription>
            </Alert>

            <Alert className="border-cyber-success bg-green-50">
              <CheckCircle className="h-4 w-4 text-cyber-success" />
              <AlertDescription>
                <span className="font-medium text-cyber-success">NIST CSF performing well</span>
                <br />
                Excellent compliance score. Continue current practices and maintain regular assessments.
              </AlertDescription>
            </Alert>

            <div className="pt-4">
              <Button className="w-full bg-cyber-primary hover:bg-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Remediation Planning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Framework View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Framework Deep Dive</CardTitle>
            <Tabs value={selectedFramework} onValueChange={setSelectedFramework}>
              <TabsList>
                <TabsTrigger value="nist">NIST CSF</TabsTrigger>
                <TabsTrigger value="iso">ISO 27001</TabsTrigger>
                <TabsTrigger value="gdpr">GDPR</TabsTrigger>
                <TabsTrigger value="soc">SOC 2</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Control Areas Performance</h4>
              <div className="space-y-4">
                {selectedFrameworkData.details && Object.entries(selectedFrameworkData.details)
                  .filter(([key]) => typeof selectedFrameworkData.details[key] === 'number')
                  .map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`text-sm font-medium ${getScoreColor(value as number)}`}>
                          {value as number}%
                        </span>
                      </div>
                      <Progress value={value as number} className="h-2" />
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Critical Gaps</h4>
                <div className="space-y-2">
                  {selectedFrameworkData.details?.criticalGaps?.map((gap: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-cyber-error" />
                      <span className="text-sm text-gray-700">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Key Strengths</h4>
                <div className="space-y-2">
                  {selectedFrameworkData.details?.strengths?.map((strength: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-cyber-success" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full bg-cyber-primary hover:bg-blue-700"
                  onClick={() => updateComplianceMutation.mutate({
                    framework: selectedFrameworkData.framework,
                    score: selectedFrameworkData.score,
                    details: selectedFrameworkData.details
                  })}
                  disabled={updateComplianceMutation.isPending}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {updateComplianceMutation.isPending ? "Updating..." : "Update Assessment"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Compliance Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-cyber-warning bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-cyber-warning" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">SOC 2 Type II Audit Preparation</h4>
                  <p className="text-sm text-gray-600">Due: February 28, 2024</p>
                </div>
              </div>
              <Badge className="bg-cyber-warning bg-opacity-20 text-cyber-warning">
                Upcoming
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-cyber-primary bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-cyber-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">ISO 27001 Quarterly Review</h4>
                  <p className="text-sm text-gray-600">Due: March 10, 2024</p>
                </div>
              </div>
              <Badge className="bg-cyber-primary bg-opacity-20 text-cyber-primary">
                Scheduled
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-cyber-success bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-cyber-success" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">NIST CSF Annual Assessment</h4>
                  <p className="text-sm text-gray-600">Due: April 15, 2024</p>
                </div>
              </div>
              <Badge className="bg-cyber-success bg-opacity-20 text-cyber-success">
                On Track
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
