import { Zap } from 'lucide-react';
import UniversalWorkshop from '../components/UniversalWorkshop';
export default function ElectricalWorkbench() {
  return <UniversalWorkshop moduleId="electrical" title="Electrical Workshop"
    subtitle="Circular Workshop — Tap the conductor to dive into electron flow. Select a tool to learn the trade."
    icon={Zap} accentColor="#B87333" skillKey="Electrical_Skill" matLabel="Conductor" storageKey="emcafe_electrical_actions" />;
}
