import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Shield, Users, TrendingUp, AlertTriangle, Activity, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from "react";

export default function LearningProgress() {
  const [viewMode, setViewMode] = useState<'learning' | 'progress' | 'analytics'>('learning');
  const [threatData, setThreatData] = useState<any[]>([]);
  const [securityTrends, setSecurityTrends] = useState<any[]>([]);

  // Generate real-time threat landscape data
  useEffect(() => {
    const generateThreatData = () => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          phishing: Math.floor(Math.random() * 50) + 20,
          malware: Math.floor(Math.random() * 30) + 10,
          socialEng: Math.floor(Math.random() * 25) + 15,
          ransomware: Math.floor(Math.random() * 15) + 5,
          total: 0
        };
      });
      
      last7Days.forEach(day => {
        day.total = day.phishing + day.malware + day.socialEng + day.ransomware;
      });
      
      setThreatData(last7Days);
    };

    const generateSecurityTrends = () => {
      const trends = [
        { name: 'Phishing', value: 45, color: '#ef4444' },
        { name: 'Malware', value: 25, color: '#f97316' },
        { name: 'Social Engineering', value: 20, color: '#eab308' },
        { name: 'Ransomware', value: 10, color: '#dc2626' }
      ];
      setSecurityTrends(trends);
    };

    generateThreatData();
    generateSecurityTrends();
    
    // Update every 30 seconds for real-time effect
    const interval = setInterval(() => {
      generateThreatData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Educational learning paths with realistic progress data
  const learningPaths = [
    {
      title: "Phishing Detection Basics",
      description: "Learn to identify common phishing techniques",
      progress: 85,
      icon: Shield,
      skills: ["Email Analysis", "URL Inspection", "Social Engineering"],
      level: "Beginner",
      estimatedTime: "2 hours",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Advanced Threat Recognition",
      description: "Master sophisticated attack vectors",
      progress: 60,
      icon: Brain,
      skills: ["APT Detection", "Spear Phishing", "Business Email Compromise"],
      level: "Advanced", 
      estimatedTime: "4 hours",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Incident Response Fundamentals",
      description: "Essential crisis management skills",
      progress: 40,
      icon: Users,
      skills: ["Communication", "Documentation", "Escalation"],
      level: "Intermediate",
      estimatedTime: "3 hours", 
      color: "bg-green-100 text-green-700"
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const renderThreatLandscape = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">7-Day Threat Trends</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={threatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#1d4ed8" 
                strokeWidth={3}
                dot={{ fill: '#1d4ed8', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Threat Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={securityTrends}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {securityTrends.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Percentage']}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {securityTrends.map((threat, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: threat.color }}
              />
              <div>
                <p className="text-xs font-medium text-gray-900">{threat.name}</p>
                <p className="text-sm text-gray-600">{threat.value}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Threat Volume</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={threatData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="phishing" fill="#ef4444" name="Phishing" />
            <Bar dataKey="malware" fill="#f97316" name="Malware" />
            <Bar dataKey="socialEng" fill="#eab308" name="Social Eng." />
            <Bar dataKey="ransomware" fill="#dc2626" name="Ransomware" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-lg font-bold text-red-900">
                  {threatData.length > 0 ? threatData[threatData.length - 1]?.total || 0 : 0}
                </p>
                <p className="text-sm text-red-700">Today's Threats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-lg font-bold text-blue-900">98.2%</p>
                <p className="text-sm text-blue-700">Detection Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-lg font-bold text-green-900">2.1m</p>
                <p className="text-sm text-green-700">Blocked Attacks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {viewMode === 'learning' && <BookOpen className="h-5 w-5 mr-2 text-cyber-primary" />}
            {viewMode === 'progress' && <TrendingUp className="h-5 w-5 mr-2 text-cyber-primary" />}
            {viewMode === 'analytics' && <Activity className="h-5 w-5 mr-2 text-cyber-primary" />}
            {viewMode === 'learning' ? 'Learning Progress' : 
             viewMode === 'progress' ? 'Module Progress' : 'Learning Analytics'}
          </h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={viewMode === 'learning' ? 'default' : 'outline'}
              onClick={() => setViewMode('learning')}
              className={viewMode === 'learning' ? 'bg-cyber-primary hover:bg-blue-700' : ''}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Learning
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'progress' ? 'default' : 'outline'}
              onClick={() => setViewMode('progress')}
              className={viewMode === 'progress' ? 'bg-cyber-primary hover:bg-blue-700' : ''}
            >
              <Eye className="h-4 w-4 mr-1" />
              Progress
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'analytics' ? 'default' : 'outline'}
              onClick={() => setViewMode('analytics')}
              className={viewMode === 'analytics' ? 'bg-cyber-primary hover:bg-blue-700' : ''}
            >
              <Activity className="h-4 w-4 mr-1" />
              Analytics
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'learning' && (
          <div className="space-y-6">
            {learningPaths.map((path, index) => {
            const Icon = path.icon;
            return (
              <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${path.color.split(' ')[0]} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${path.color.split(' ')[1]} ${path.color.split(' ')[2]}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{path.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{path.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {path.level}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{path.estimatedTime}</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{path.progress}%</span>
                  </div>
                  <Progress value={path.progress} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {path.skills.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        )}
        
        {viewMode === 'progress' && renderThreatLandscape()}
        {viewMode === 'analytics' && renderAnalytics()}
      </CardContent>
    </Card>
  );
}
