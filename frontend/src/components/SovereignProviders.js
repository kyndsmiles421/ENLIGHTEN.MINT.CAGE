/**
 * SovereignProviders.js — V59.0 Consolidated Context Provider Tree
 * 
 * THE GHOST BRAIN: All non-critical context providers consolidated into
 * a single component that can be loaded after first paint.
 * 
 * Critical providers (Auth, Language, BrowserRouter) stay in App.js.
 * Everything else lives here — loaded once, shared everywhere.
 */
import React from 'react';
import { CreditProvider } from '../context/CreditContext';
import { AvatarProvider } from '../context/AvatarContext';
import { TempoProvider } from '../context/TempoContext';
import { MixerProvider } from '../context/MixerContext';
import { FocusProvider } from '../context/FocusContext';
import { ClassProvider } from '../context/ClassContext';
import { TreasuryProvider } from '../context/TreasuryContext';
import { ModalityProvider } from '../context/ModalityContext';
import { ResolutionProvider } from '../context/ResolutionContext';
import { SensoryProvider } from '../context/SensoryContext';
import { CosmicStateProvider } from '../context/CosmicStateContext';
import { CosmicThemeProvider } from '../context/CosmicThemeContext';
import { OrbitalSentinelProvider } from '../context/OrbitalSentinelContext';
import { SovereignProvider } from '../context/SovereignContext';
import { MeshNetworkProvider } from '../context/MeshNetworkContext';
import { EnlightenmentCafeProvider } from '../context/EnlightenmentCafeContext';
import { EnlightenmentProvider } from '../context/EnlightenmentContext';
import { EncryptionProvider } from '../hooks/useCrystalEncryption';
import { PolarityProvider } from '../context/PolarityContext';
import { DepthProvider } from '../context/DepthContext';
import { SageProvider } from '../context/SageContext';
import { VoiceCommandProvider } from '../context/VoiceCommandContext';
import { SplitScreenProvider } from '../components/SplitScreen';
import RecursivePortal from '../components/RecursivePortal';
import { SceneProvider } from '../components/SceneEngine';
import { MixerProvider as SystemMixerProvider } from '../components/UnifiedCreatorConsole';

export default function SovereignProviders({ children }) {
  return (
    <CreditProvider>
    <AvatarProvider>
    <TempoProvider>
    <MixerProvider>
    <FocusProvider>
    <ClassProvider>
    <TreasuryProvider>
    <ModalityProvider>
    <ResolutionProvider>
    <SensoryProvider>
    <CosmicStateProvider>
    <CosmicThemeProvider>
    <OrbitalSentinelProvider>
    <SovereignProvider>
    <MeshNetworkProvider>
    <EnlightenmentCafeProvider>
    <EnlightenmentProvider>
      <EncryptionProvider>
      <PolarityProvider>
      <DepthProvider>
      <SageProvider>
      <VoiceCommandProvider>
      <SplitScreenProvider>
      <RecursivePortal>
      <SceneProvider>
      <SystemMixerProvider>
        {children}
      </SystemMixerProvider>
      </SceneProvider>
      </RecursivePortal>
      </SplitScreenProvider>
      </VoiceCommandProvider>
      </SageProvider>
      </DepthProvider>
      </PolarityProvider>
      </EncryptionProvider>
    </EnlightenmentProvider>
    </EnlightenmentCafeProvider>
    </MeshNetworkProvider>
    </SovereignProvider>
    </OrbitalSentinelProvider>
    </CosmicThemeProvider>
    </CosmicStateProvider>
    </SensoryProvider>
    </ResolutionProvider>
    </ModalityProvider>
    </TreasuryProvider>
    </ClassProvider>
    </FocusProvider>
    </MixerProvider>
    </TempoProvider>
    </AvatarProvider>
    </CreditProvider>
  );
}
