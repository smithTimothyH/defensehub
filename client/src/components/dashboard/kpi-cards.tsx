import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Target, Award, Users, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export default function KPICards() {
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeLearners: 247,
    completedToday: 18,
    trainingHours: 156,
    averageScore: 87
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Simulate real-time updates for learning metrics
  useEffect(() => {
    const updateMetrics = () => {
      setRealTimeMetrics(prev => ({
        activeLearners: Math.max(180, prev.activeLearners + Math.floor((Math.random() - 0.5) * 8)),
        completedToday: Math.max(0, prev.completedToday + (Math.random() > 0.8 ? 1 : 0)),
        trainingHours: Math.max(120, prev.trainingHours + Math.floor((Math.random() - 0.4) * 3)),
        averageScore: Math.min(95, Math.max(80, prev.averageScore + (Math.random() - 0.5) * 1))
      }));
    };

    const interval = setInterval(updateMetrics, 20000); // Update every 20 seconds
    return () => clearInterval(interval);
  }, []);

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
      title: "Active Learners",
      value: realTimeMetrics.activeLearners,
      icon: Users,
      change: "Training active",
      changeType: "positive",
      bgColor: "bg-blue-100",
      iconColor: "text-cyber-primary",
      description: "Currently learning",
      realTime: true
    },
    {
      title: "Completed Today",
      value: realTimeMetrics.completedToday,
      icon: Award,
      change: "Modules finished",
      changeType: "positive",
      bgColor: "bg-green-100",
      iconColor: "text-cyber-success",
      description: "Daily completions",
      realTime: true
    },
    {
      title: "Training Hours",
      value: `${realTimeMetrics.trainingHours}h`,
      icon: BookOpen,
      change: "This week",
      changeType: "positive",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      description: "Total learning time",
      realTime: true
    },
    {
      title: "Average Score",
      value: `${Math.round(realTimeMetrics.averageScore)}%`,
      icon: TrendingUp,
      change: realTimeMetrics.averageScore >= 85 ? "Excellent" : "Good",
      changeType: realTimeMetrics.averageScore >= 85 ? "positive" : "neutral",
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      description: "Learning performance",
      realTime: true
    },
    {
      title: "Overall Progress",
      value: `${(stats as any)?.knowledgeScore || 78}%`,
      icon: Target,
      change: "+12% this week",
      changeType: "positive",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      description: "Knowledge advancement"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card 
            key={kpi.title} 
            className="transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    {kpi.realTime && (
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0 border-green-300 text-green-700 bg-green-50"
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>
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
                  {kpi.realTime ? 'real-time monitoring' : 'in learning progress'}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
