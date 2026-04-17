import { Droplets } from 'lucide-react';
import UniversalWorkshop from '../components/UniversalWorkshop';
export default function PlumbingWorkbench() {
  return <UniversalWorkshop moduleId="plumbing" title="Plumbing Workshop"
    subtitle="Circular Workshop — Tap the pipe to dive into fluid dynamics. Select a tool to learn the trade."
    icon={Droplets} accentColor="#3B82F6" skillKey="Plumbing_Skill" matLabel="Pipe" storageKey="emcafe_plumbing_actions" />;
}
