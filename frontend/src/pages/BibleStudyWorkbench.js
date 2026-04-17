import { BookOpen } from 'lucide-react';
import UniversalWorkshop from '../components/UniversalWorkshop';
export default function BibleStudyWorkbench() {
  return <UniversalWorkshop moduleId="bible" title="Bible Study Workshop"
    subtitle="Sacred Knowledge Cell — Tap the scripture to dive into original language. Select a tool to study the Word."
    icon={BookOpen} accentColor="#D4AF37" skillKey="Bible_Study_Skill" matLabel="Scripture" storageKey="emcafe_bible_actions" />;
}
