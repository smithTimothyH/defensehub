import KPICards from "@/components/dashboard/kpi-cards";
import RecentSimulations from "@/components/dashboard/recent-simulations";
import QuickActions from "@/components/dashboard/quick-actions";
import LearningProgress from "@/components/dashboard/security-trends";
import SkillMastery from "@/components/dashboard/compliance-status";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentSimulations />
        <QuickActions />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningProgress />
        <SkillMastery />
      </div>
    </div>
  );
}
