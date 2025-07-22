import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

export default function ComplianceStatus() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/compliance"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default compliance frameworks if no data
  const defaultMetrics = [
    { framework: "NIST Cybersecurity Framework", score: 95 },
    { framework: "ISO 27001", score: 78 },
    { framework: "GDPR Compliance", score: 92 },
    { framework: "SOC 2 Type II", score: 65 },
  ];

  const complianceData = (metrics as any)?.length > 0 ? metrics : defaultMetrics;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-cyber-success";
    if (score >= 75) return "text-cyber-warning";
    return "text-cyber-error";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-cyber-success";
    if (score >= 75) return "bg-cyber-warning";
    return "bg-cyber-error";
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {(complianceData as any[]).map((metric: any) => (
            <div key={metric.framework}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{metric.framework}</span>
                <span className={`text-sm font-medium ${getScoreColor(metric.score)}`}>
                  {metric.score}%
                </span>
              </div>
              <Progress value={metric.score} className="h-2" />
            </div>
          ))}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-cyber-primary mt-0.5 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-cyber-primary">Next Audit: March 15, 2024</p>
                <p className="text-sm text-gray-600 mt-1">
                  SOC 2 Type II requires immediate attention. Consider running additional crisis simulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
