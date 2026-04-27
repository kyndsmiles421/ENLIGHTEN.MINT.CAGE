/**
 * SceneGenerator.js
 * Bridges Light Therapy color/mood states with Gemini Nano Banana image generation.
 * Decoupled module — can be used from LightTherapy, UnifiedCreatorConsole, or any component.
 *
 * V68.52 — On successful generation, the scene's resonance/mood/colors
 * are committed to the ContextBus as `sceneFrame`. This automatically
 * emits a Resonance pulse (the bus's commit runs the payload through
 * the analyzer + user's tuning settings) and primes downstream tools
 * (Story / Forecast / Dream) with the current scene's atmosphere.
 */
import { commit as busCommit } from '../state/ContextBus';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SceneGenerator = {
  /**
   * Generate an immersive scene image from color/mood data.
   * @param {string} resonanceName - e.g. "Anpo Root", "Obsidian Pulse"
   * @param {string[]} colorHexes - e.g. ["#EF4444", "#3B82F6"]
   * @param {string} [mood] - optional mood descriptor
   * @param {string} [sourcePrompt] - optional extra context
   * @returns {Promise<{imageUrl: string, promptUsed: string} | null>}
   */
  async generateScene(resonanceName, colorHexes, mood, sourcePrompt) {
    try {
      const res = await fetch(`${API}/scene-gen/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resonance_name: resonanceName,
          colors: colorHexes,
          mood: mood || null,
          source_prompt: sourcePrompt || null,
        }),
      });
      const data = await res.json();
      if (data.image_url) {
        // V68.52 — commit scene to the ContextBus. Auto-pulses the field
        // and primes the next tool's prompt with the current palette.
        try {
          busCommit('sceneFrame', {
            resonance_name: data.resonance_name || resonanceName,
            colors: colorHexes,
            mood: mood || null,
            source_prompt: sourcePrompt || null,
            prompt_used: data.prompt_used || null,
          }, { moduleId: 'SCENE_GEN' });
        } catch { /* noop */ }
        return {
          imageUrl: `${process.env.REACT_APP_BACKEND_URL}${data.image_url}`,
          promptUsed: data.prompt_used,
          resonanceName: data.resonance_name,
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Build the full image URL from a relative path.
   */
  resolveUrl(relativePath) {
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    return `${process.env.REACT_APP_BACKEND_URL}${relativePath}`;
  },
};

export default SceneGenerator;
