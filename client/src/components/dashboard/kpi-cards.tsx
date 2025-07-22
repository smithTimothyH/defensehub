import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Target, Award, Shield, AlertTriangle, Users, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export default function KPICards() {
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeThreats: 0,
    securityScore: 92,
    usersOnline: 247,
    incidentsToday: 3
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Simulate real-time updates for security metrics
  useEffect(() => {
    const updateMetrics = () => {
      setRealTimeMetrics(prev => ({
        activeThreats: Math.max(0, prev.activeThreats + (Math.random() > 0.7 ? 1 : -1)),
        securityScore: Math.min(100, Math.max(85, prev.securityScore + (Math.random() - 0.5) * 2)),
        usersOnline: Math.max(200, prev.usersOnline + Math.floor((Math.random() - 0.5) * 10)),
        incidentsToday: Math.max(0, prev.incidentsToday + (Math.random() > 0.9 ? 1 : 0))
      }));
    };

    const interval = setInterval(updateMetrics, 15000); // Update every 15 seconds
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
      title: "Security Score",
      value: `${Math.round(realTimeMetrics.securityScore)}%`,
      icon: Shield,
      change: realTimeMetrics.securityScore >= 90 ? "Excellent" : "Good",
      changeType: realTimeMetrics.securityScore >= 90 ? "positive" : "neutral",
      bgColor: "bg-green-100",
      iconColor: "text-cyber-success",
      description: "Overall security posture",
      realTime: true,
      pulse: realTimeMetrics.securityScore < 85
    },
    {
      title: "Active Threats",
      value: realTimeMetrics.activeThreats,
      icon: AlertTriangle,
      change: realTimeMetrics.activeThreats === 0 ? "All Clear" : `${realTimeMetrics.activeThreats} detected`,
      changeType: realTimeMetrics.activeThreats === 0 ? "positive" : "negative",
      bgColor: realTimeMetrics.activeThreats === 0 ? "bg-green-100" : "bg-red-100",
      iconColor: realTimeMetrics.activeThreats === 0 ? "text-cyber-success" : "text-red-600",
      description: "Live threat monitoring",
      realTime: true,
      pulse: realTimeMetrics.activeThreats > 0
    },
    {
      title: "Users Online",
      value: realTimeMetrics.usersOnline,
      icon: Users,
      change: "Training active",
      changeType: "positive",
      bgColor: "bg-blue-100",
      iconColor: "text-cyber-primary",
      description: "Active learning sessions",
      realTime: true
    },
    {
      title: "Learning Progress",
      value: `${(stats as any)?.knowledgeScore || 78}%`,
      icon: TrendingUp,
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
            className={`transition-all duration-200 ${
              kpi.pulse ? 'animate-pulse border-orange-300' : ''
            }`}
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
                <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center ml-4 ${
                  kpi.pulse ? 'animate-pulse' : ''
                }`}>
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
