import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, TrendingUp, Target, Award } from "lucide-react";

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
      title: "Learning Modules",
      value: (stats as any)?.learningModules || 12,
      icon: BookOpen,
      change: "3 new topics",
      changeType: "positive",
      bgColor: "bg-blue-100",
      iconColor: "text-cyber-primary",
      description: "Available training scenarios"
    },
    {
      title: "Knowledge Score",
      value: `${(stats as any)?.knowledgeScore || 78}%`,
      icon: TrendingUp,
      change: "+12% improvement",
      changeType: "positive",
      bgColor: "bg-green-100",
      iconColor: "text-cyber-success",
      description: "Average learning progress"
    },
    {
      title: "Scenarios Completed",
      value: (stats as any)?.scenariosCompleted || 24,
      icon: Target,
      change: "8 this week",
      changeType: "positive",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      description: "Training exercises finished"
    },
    {
      title: "Skills Mastered",
      value: (stats as any)?.skillsMastered || 6,
      icon: Award,
      change: "2 new badges",
      changeType: "positive",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      description: "Cybersecurity competencies"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                </div>
                <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center ml-4`}>
                  <Icon className={`${kpi.iconColor} w-6 h-6`} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span
                  className={`text-sm font-medium ${
                    kpi.changeType === "positive"
                      ? "text-cyber-success"
                      : kpi.changeType === "negative"
                      ? "text-cyber-error"
                      : "text-cyber-success"
                  }`}
                >
                  ✓ {kpi.change}
                </span>
                <span className="text-gray-500 text-sm ml-1">
                  in learning progress
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
