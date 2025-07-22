import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ShieldCheck, Fish, Scale } from "lucide-react";

export default function KPICards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Active Simulations",
      value: (stats as any)?.activeSimulations || 0,
      icon: Play,
      change: "+12%",
      changeType: "positive",
      bgColor: "bg-blue-100",
      iconColor: "text-cyber-primary",
    },
    {
      title: "Security Score",
      value: `${(stats as any)?.securityScore || 0}%`,
      icon: ShieldCheck,
      change: "+5%",
      changeType: "positive",
      bgColor: "bg-green-100",
      iconColor: "text-cyber-success",
    },
    {
      title: "Phishing Attempts",
      value: (stats as any)?.phishingAttempts || 0,
      icon: Fish,
      change: "+8",
      changeType: "negative",
      bgColor: "bg-orange-100",
      iconColor: "text-cyber-warning",
    },
    {
      title: "Compliance Rate",
      value: `${(stats as any)?.complianceRate || 0}%`,
      icon: Scale,
      change: "On track",
      changeType: "neutral",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${kpi.iconColor} text-xl`} />
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={`text-sm font-medium ${
                    kpi.changeType === "positive"
                      ? "text-cyber-success"
                      : kpi.changeType === "negative"
                      ? "text-cyber-error"
                      : "text-cyber-success"
                  }`}
                >
                  {kpi.change}
                </span>
                <span className="text-gray-500 text-sm ml-1">
                  {kpi.changeType === "neutral" ? "for audit" : "from last month"}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
