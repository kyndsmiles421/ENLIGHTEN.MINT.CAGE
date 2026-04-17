import { HandHeart } from 'lucide-react';
import UniversalWorkshop from '../components/UniversalWorkshop';
export default function ElderCareWorkbench() {
  return <UniversalWorkshop moduleId="eldercare" title="Elderly Care Workshop"
    subtitle="Social Pillar Cell — Tap the care scenario to dive into gerontology. Select a tool to honor dignity."
    icon={HandHeart} accentColor="#A78BFA" skillKey="Eldercare_Skill" matLabel="Scenario" storageKey="emcafe_eldercare_actions" />;
}
