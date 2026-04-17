import { Heart } from 'lucide-react';
import UniversalWorkshop from '../components/UniversalWorkshop';
export default function NursingWorkbench() {
  return <UniversalWorkshop moduleId="nursing" title="Nursing Workshop"
    subtitle="Healing Arts Cell — Tap the patient scenario to dive into physiology. Select a tool to practice the art."
    icon={Heart} accentColor="#EF4444" skillKey="Nursing_Skill" matLabel="Scenario" storageKey="emcafe_nursing_actions" />;
}
