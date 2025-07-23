import { Link, useLocation } from "wouter";
import { Shield, BarChart3, Fish, GraduationCap, Brain, FileText, Users, Settings, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, category: "Main" },
  { name: "AI Education Hub", href: "/ai-education-hub", icon: Brain, category: "Main" },

  { name: "Phishing Simulator", href: "/phishing-simulator", icon: Fish, category: "Main" },
  { name: "Reports", href: "/reports", icon: FileText, category: "Analytics" },
  { name: "Email Center", href: "/email-center", icon: Mail, category: "Analytics" },
  { name: "User Management", href: "/users", icon: Users, category: "System" },
  { name: "Settings", href: "/settings", icon: Settings, category: "System" },
];

const categories = ["Main", "Analytics", "System"];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyber-primary rounded-lg flex items-center justify-center">
            <Shield className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DefenseHub</h1>
            <p className="text-sm text-gray-500">AI-Powered Education Hub</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {categories.map((category) => (
          <div key={category}>
            <div className="px-6 py-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {category}
              </h3>
            </div>
            {navigation
              .filter((item) => item.category === category)
              .map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
                        isActive && "text-cyber-primary bg-blue-50 border-r-2 border-cyber-primary"
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <span className={cn("font-medium", isActive && "font-semibold")}>
                        {item.name}
                      </span>
                    </a>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
    </div>
  );
}
