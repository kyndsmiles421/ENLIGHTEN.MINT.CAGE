import { Leaf } from 'lucide-react';
import UniversalWorkshop from '../components/UniversalWorkshop';
export default function LandscapingWorkbench() {
  return <UniversalWorkshop moduleId="landscaping" title="Landscaping Workshop"
    subtitle="Circular Workshop — Tap the soil to dive into earth science. Select a tool to learn the trade."
    icon={Leaf} accentColor="#22C55E" skillKey="Landscaping_Skill" matLabel="Material" storageKey="emcafe_landscaping_actions" />;
}
