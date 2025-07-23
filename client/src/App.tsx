import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import Dashboard from "@/pages/dashboard";
import PhishingSimulator from "@/pages/phishing-simulator";
import TrainingScenarios from "@/pages/training-scenarios";
import AIEducationHub from "@/pages/ai-education-hub";
import LearningModule from "@/pages/learning-module";
import Reports from "@/pages/reports";


import EmailCenter from "@/pages/email-center";
import PhishingCaught from "@/pages/phishing-caught";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/phishing-simulator" component={PhishingSimulator} />
      <Route path="/training-scenarios" component={TrainingScenarios} />
      <Route path="/ai-education-hub" component={AIEducationHub} />
      <Route path="/learning-module" component={LearningModule} />
      <Route path="/reports" component={Reports} />
      <Route path="/email-center" component={EmailCenter} />
      <Route path="/phishing-caught" component={PhishingCaught} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
