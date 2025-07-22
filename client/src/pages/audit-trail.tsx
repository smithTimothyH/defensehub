import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Download, Search, Filter, Eye, Calendar } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
  });

  const { data: userInteractions, isLoading: interactionsLoading } = useQuery({
    queryKey: ["/api/users", 1, "interactions"], // Default user for demo
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create_simulation":
        return "🚀";
      case "login":
        return "🔐";
      case "phishing_click":
        return "🎣";
      case "report_phishing":
        return "🛡️";
      case "crisis_decision":
        return "⚠️";
      case "generate_report":
        return "📊";
      default:
        return "📝";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create_simulation":
        return "bg-cyber-primary bg-opacity-20 text-cyber-primary";
      case "login":
        return "bg-cyber-success bg-opacity-20 text-cyber-success";
      case "phishing_click":
        return "bg-cyber-error bg-opacity-20 text-cyber-error";
      case "report_phishing":
        return "bg-cyber-success bg-opacity-20 text-cyber-success";
      case "crisis_decision":
        return "bg-cyber-warning bg-opacity-20 text-cyber-warning";
      case "generate_report":
        return "bg-purple-500 bg-opacity-20 text-purple-600";
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-600";
    }
  };

  const getSeverityLevel = (action: string) => {
    switch (action) {
      case "phishing_click":
      case "crisis_decision":
        return "High";
      case "create_simulation":
      case "generate_report":
        return "Medium";
      case "login":
      case "report_phishing":
        return "Low";
      default:
        return "Medium";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-cyber-error bg-opacity-20 text-cyber-error";
      case "Medium":
        return "bg-cyber-warning bg-opacity-20 text-cyber-warning";
      case "Low":
        return "bg-cyber-success bg-opacity-20 text-cyber-success";
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-600";
    }
  };

  // Combine audit logs and user interactions for comprehensive trail
  const combinedLogs = [
    ...((auditLogs as any[]) || []).map((log: any) => ({
      ...log,
      type: "system",
      severity: getSeverityLevel(log.action),
    })),
    ...((userInteractions as any[]) || []).map((interaction: any) => ({
      ...interaction,
      type: "user",
      action: interaction.action,
      severity: getSeverityLevel(interaction.action),
      timestamp: interaction.timestamp,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = combinedLogs.filter((log) => {
    const matchesSearch = searchTerm === "" || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesUser = userFilter === "all" || log.userId?.toString() === userFilter;
    
    return matchesSearch && matchesAction && matchesUser;
  });

  const uniqueActions = [...new Set(combinedLogs.map((log: any) => log.action))].filter(Boolean);
  const uniqueUsers = [...new Set(combinedLogs.map((log: any) => log.userId))].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
          <p className="text-gray-600">Complete log of all system activities and user interactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button className="bg-cyber-primary hover:bg-blue-700">
            <ClipboardList className="h-4 w-4 mr-2" />
            Generate Audit Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-cyber-primary" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{combinedLogs.length}</p>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-cyber-success" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {combinedLogs.filter(log => log.type === "user").length}
                </p>
                <p className="text-sm text-gray-600">User Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-cyber-warning" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {combinedLogs.filter(log => 
                    new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
                <p className="text-sm text-gray-600">Last 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-cyber-error" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {combinedLogs.filter(log => getSeverityLevel(log.action) === "High").length}
                </p>
                <p className="text-sm text-gray-600">High Severity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((userId) => (
                  <SelectItem key={userId} value={userId.toString()}>
                    User {userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => {
              setSearchTerm("");
              setActionFilter("all");
              setUserFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || interactionsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 50).map((log: any, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getActionIcon(log.action)}</span>
                          <div>
                            <Badge className={getActionColor(log.action)}>
                              {log.action?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Unknown"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-cyber-primary rounded-full flex items-center justify-center text-white text-xs">
                            {log.userId || "S"}
                          </div>
                          <span className="text-sm text-gray-600">
                            {log.userId ? `User ${log.userId}` : "System"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {log.resource || log.simulationId ? `Simulation ${log.simulationId}` : "System"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900">
                            {format(new Date(log.timestamp), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), "HH:mm:ss")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No audit logs found.</p>
              <p className="text-sm text-gray-400">Activity will appear here as users interact with the system.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Retention Policy</h4>
              <p className="text-sm text-gray-600 mb-4">
                Audit logs are retained for 7 years to comply with regulatory requirements including SOX, HIPAA, and GDPR.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Storage:</span>
                  <span className="font-medium">2.1 GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Oldest Record:</span>
                  <span className="font-medium">Jan 1, 2023</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Access Control</h4>
              <p className="text-sm text-gray-600 mb-4">
                Audit trail access is restricted to security administrators and compliance officers with proper authorization.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Access Level:</span>
                  <span className="font-medium">Security Admin</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Export:</span>
                  <span className="font-medium">Jan 15, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
