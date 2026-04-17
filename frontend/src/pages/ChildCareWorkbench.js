import { Baby } from 'lucide-react';
import UniversalWorkshop from '../components/UniversalWorkshop';
export default function ChildCareWorkbench() {
  return <UniversalWorkshop moduleId="childcare" title="Child Care Workshop"
    subtitle="Social Pillar Cell — Tap the developmental scenario to dive into child psychology. Select a tool to practice the art of nurturing."
    icon={Baby} accentColor="#F472B6" skillKey="Childcare_Skill" matLabel="Scenario" storageKey="emcafe_childcare_actions" />;
}
