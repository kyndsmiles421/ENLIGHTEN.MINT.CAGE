/**
 * ENLIGHTEN.MINT.CAFE — MASTER PRINT
 * V67.0 Sovereign Deployment
 * 
 * Run this in the browser console or as a standalone script.
 * It queries the live API and prints the complete organism structure:
 * every module, every material, every tool, every dive layer, every domain.
 * 
 * Usage (Browser Console):
 *   1. Open the app in your browser
 *   2. Open DevTools → Console
 *   3. Paste this entire script
 *   4. It will print the full organism
 * 
 * Usage (Node.js):
 *   node master-print.js https://your-app-url.com
 */

(async function ENLIGHTEN_MINT_CAFE_MASTER_PRINT() {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const API = typeof window !== 'undefined' 
    ? `${window.location.origin}/api`
    : `${process.argv[2] || 'http://localhost:8001'}/api`;
  
  const fetchJSON = typeof window !== 'undefined'
    ? async (url) => (await fetch(url)).json()
    : async (url) => {
        const https = require(url.startsWith('https') ? 'https' : 'http');
        return new Promise((resolve, reject) => {
          https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
          }).on('error', reject);
        });
      };

  const log = console.log;
  const line = (char = '━', len = 80) => char.repeat(len);
  const header = (text) => {
    log(`\n${line()}`);
    log(`  ${text}`);
    log(line());
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TITLE BLOCK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  log('\n');
  log('  ╔═══════════════════════════════════════════════════════════════════╗');
  log('  ║                                                                   ║');
  log('  ║          E N L I G H T E N . M I N T . C A F E                    ║');
  log('  ║                                                                   ║');
  log('  ║          V67.0 — SOVEREIGN DEPLOYMENT                             ║');
  log('  ║          Master System Print                                      ║');
  log('  ║                                                                   ║');
  log('  ║          176 Nodules | 791KB Metabolic Seal                       ║');
  log('  ║                                                                   ║');
  log('  ╚═══════════════════════════════════════════════════════════════════╝');
  log('\n');
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FETCH REGISTRY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  log(`  Connecting to: ${API}`);
  log(`  Fetching Master Registry...\n`);
  
  let registry;
  try {
    registry = await fetchJSON(`${API}/workshop/registry`);
  } catch (err) {
    log(`  ERROR: Could not connect to API at ${API}`);
    log(`  ${err.message}`);
    return;
  }
  
  const modules = registry.modules;
  const totalModules = registry.total;
  
  // Group by domain
  const domains = {};
  for (const mod of modules) {
    if (!domains[mod.domain]) domains[mod.domain] = [];
    domains[mod.domain].push(mod);
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 1: ORGANISM OVERVIEW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const totalMats = modules.reduce((s, m) => s + m.materialCount, 0);
  const totalTools = modules.reduce((s, m) => s + m.toolCount, 0);
  
  header('1. ORGANISM OVERVIEW');
  log(`  Modules:    ${totalModules}`);
  log(`  Materials:  ${totalMats}`);
  log(`  Tools:      ${totalTools}`);
  log(`  Domains:    ${Object.keys(domains).length}`);
  log(`  Dive Depth: 6 levels (L0-L5) per material`);
  log(`  Knowledge Nodes: ${totalMats * 6} (${totalMats} materials x 6 depths)`);
  log(`  Bundle:     791KB (Metabolic Seal)`);
  log(`  Parity:     ${modules.every(m => m.materialCount === 6) ? '100% (all modules at 6 materials)' : 'INCOMPLETE'}`);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 2: DOMAIN MAP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  header('2. DOMAIN MAP');
  for (const [domain, mods] of Object.entries(domains).sort()) {
    const matCount = mods.reduce((s, m) => s + m.materialCount, 0);
    const toolCount = mods.reduce((s, m) => s + m.toolCount, 0);
    log(`\n  [${domain}] — ${mods.length} modules, ${matCount} materials, ${toolCount} tools`);
    for (const mod of mods.sort((a, b) => a.id.localeCompare(b.id))) {
      log(`    ${mod.id.padEnd(15)} | ${mod.title.padEnd(35)} | ${mod.materialCount} mats | ${mod.toolCount} tools | ${mod.skillKey}`);
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 3: FULL MATERIAL & TOOL MANIFEST
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  header('3. FULL MATERIAL & TOOL MANIFEST (132 Materials, 198 Tools)');
  
  let materialIndex = 0;
  let toolIndex = 0;
  
  for (const mod of modules.sort((a, b) => a.domain.localeCompare(b.domain) || a.id.localeCompare(b.id))) {
    log(`\n  ${'─'.repeat(76)}`);
    log(`  ${mod.domain} > ${mod.title} (${mod.id})`);
    log(`  Route: /workshop/${mod.id} | Skill: ${mod.skillKey} | Accent: ${mod.accentColor}`);
    log(`  ${'─'.repeat(76)}`);
    
    // Fetch materials
    try {
      const matData = await fetchJSON(`${API}/workshop/${mod.id}/materials`);
      const matKey = Object.keys(matData).find(k => Array.isArray(matData[k]));
      const materials = matKey ? matData[matKey] : [];
      
      log(`\n  MATERIALS (${materials.length}):`);
      for (const mat of materials) {
        materialIndex++;
        log(`\n    [${String(materialIndex).padStart(3, '0')}] ${mat.name} (${mat.id})`);
        log(`         Color: ${mat.color} | Origin: ${(mat.origin || '').substring(0, 80)}...`);
        
        // Print dive layers
        if (mat.dive_layers && mat.dive_layers.length > 0) {
          for (const layer of mat.dive_layers) {
            const depth = layer.depth;
            const prefix = depth === 5 ? '>>>' : '   ';
            log(`         ${prefix} L${depth}: ${layer.label.padEnd(30)} | ${layer.desc.substring(0, 90)}...`);
          }
        }
      }
    } catch {
      log(`    [ERROR fetching materials for ${mod.id}]`);
    }
    
    // Fetch tools
    try {
      const toolData = await fetchJSON(`${API}/workshop/${mod.id}/tools`);
      const tools = toolData.tools || [];
      
      log(`\n  TOOLS (${tools.length}):`);
      for (const tool of tools) {
        toolIndex++;
        log(`    [T${String(toolIndex).padStart(3, '0')}] ${tool.name.padEnd(25)} | ${tool.action_verb.padEnd(10)} | ${tool.icon_symbol} | ${tool.xp_per_action} XP | ${tool.color}`);
      }
    } catch {
      log(`    [ERROR fetching tools for ${mod.id}]`);
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 4: ORACLE SEARCH DEMO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  header('4. ORACLE SEARCH — DOMAIN BRIDGING DEMO');
  
  const testQueries = [
    'foundation', 'pressure', 'safety', 'energy', 'resistance',
    'structure', 'flow', 'healing', 'control', 'stoicism',
    'fire', 'water', 'light', 'balance', 'communication'
  ];
  
  for (const query of testQueries) {
    try {
      const results = await fetchJSON(`${API}/workshop/search?q=${encodeURIComponent(query)}`);
      const hits = results.results || [];
      if (hits.length === 0) continue;
      
      const domainSet = [...new Set(hits.map(r => r.domain))];
      const bridge = domainSet.length >= 2 ? `[${domainSet.length} DOMAINS BRIDGED]` : '';
      
      log(`\n  "${query}" → ${hits.length} results ${bridge}`);
      for (const hit of hits.slice(0, 6)) {
        const tags = (hit.matchedTags || []).slice(0, 3).join(', ');
        log(`    ${hit.domain.padEnd(20)} | ${hit.title.padEnd(35)} | score: ${hit.score}${tags ? ' | tags: ' + tags : ''}`);
      }
      if (hits.length > 6) log(`    ... and ${hits.length - 6} more`);
    } catch {
      log(`    [ERROR searching: ${query}]`);
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 5: INTENT TAG UNIVERSE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  header('5. INTENT TAG UNIVERSE');
  
  let totalTags = 0;
  for (const mod of modules.sort((a, b) => a.id.localeCompare(b.id))) {
    const tags = mod.tags || [];
    totalTags += tags.length;
    log(`  ${mod.id.padEnd(15)} | ${tags.join(', ')}`);
  }
  log(`\n  Total Intent Tags: ${totalTags}`);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 6: SKILL DOMAIN WIRING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  header('6. SKILL DOMAIN WIRING (XP Signal Path)');
  
  const SKILL_DOMAINS = {
    'Trade & Craft': ['Masonry_Skill', 'Carpentry_Skill', 'Electrical_Skill', 'Plumbing_Skill', 'Landscaping_Skill', 'Welding_Skill', 'Automotive_Skill', 'HVAC_Skill', 'Machining_Skill'],
    'Healing Arts': ['Nursing_Skill', 'Childcare_Skill', 'Eldercare_Skill', 'Nutrition_Skill', 'FirstAid_Skill'],
    'Mind & Spirit': ['Meditation_Skill'],
    'Science & Physics': ['Robotics_Skill', 'Anatomy_Skill'],
    'Exploration': ['Speaking_Skill', 'Pedagogy_Skill'],
    'Sacred Knowledge': ['Bible_Study_Skill', 'Hermetics_Skill', 'Philosophy_Skill'],
    'Creative Arts': ['(generators, music, soundscapes)'],
  };
  
  for (const [domain, skills] of Object.entries(SKILL_DOMAINS)) {
    log(`\n  [${domain}]`);
    for (const skill of skills) {
      log(`    → ${skill}`);
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 7: HYBRID TITLES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  header('7. HYBRID TITLES (13 Cross-Domain Achievements)');
  
  const TITLES = [
    { title: 'General Contractor', requires: 'Trade >= 20, Science >= 10' },
    { title: 'Master Artisan', requires: 'Trade >= 50, Creative >= 20' },
    { title: 'Sovereign Healer', requires: 'Healing >= 30, Sacred >= 20' },
    { title: 'Quantum Architect', requires: 'Science >= 30, Trade >= 20' },
    { title: 'Renaissance Soul', requires: 'Trade >= 15, Healing >= 15, Mind >= 15, Creative >= 15' },
    { title: 'Cosmic Navigator', requires: 'Exploration >= 40, Science >= 20' },
    { title: 'Sage Oracle', requires: 'Sacred >= 30, Mind >= 30' },
    { title: 'Hardscape Engineer', requires: 'Trade >= 40' },
    { title: 'Biomechanical Engineer', requires: 'Trade >= 25, Science >= 25' },
    { title: 'Climate Architect', requires: 'Trade >= 30, Healing >= 15' },
    { title: 'Sovereign Medic', requires: 'Healing >= 40, Science >= 15' },
    { title: 'Philosopher King', requires: 'Sacred >= 40, Exploration >= 20' },
    { title: 'Sacred Engineer', requires: 'Trade >= 20, Sacred >= 20, Mind >= 20' },
  ];
  
  for (const t of TITLES) {
    log(`  ${t.title.padEnd(25)} | ${t.requires}`);
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 8: DEPTH-5 TRANSMUTATION MAP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  header('8. DEPTH-5 TRANSMUTATION MAP (Physical Tool → Universal Law)');
  log('  Every material\'s Level 5 bridges to universal truth:\n');
  
  for (const mod of modules.sort((a, b) => a.domain.localeCompare(b.domain) || a.id.localeCompare(b.id))) {
    try {
      const matData = await fetchJSON(`${API}/workshop/${mod.id}/materials`);
      const matKey = Object.keys(matData).find(k => Array.isArray(matData[k]));
      const materials = matKey ? matData[matKey] : [];
      
      for (const mat of materials) {
        const l5 = (mat.dive_layers || []).find(l => l.depth === 5);
        if (l5) {
          log(`  ${mod.domain.padEnd(20)} | ${mat.name.padEnd(25)} | L5: ${l5.label}`);
        }
      }
    } catch {}
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FOOTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  log('\n');
  log('  ╔═══════════════════════════════════════════════════════════════════╗');
  log('  ║                                                                   ║');
  log('  ║  MASTER PRINT COMPLETE                                            ║');
  log(`  ║  ${totalModules} Modules | ${totalMats} Materials | ${totalTools} Tools                       ║`);
  log(`  ║  ${totalMats * 6} Knowledge Nodes | ${totalTags} Intent Tags                     ║`);
  log('  ║  13 Hybrid Titles | 7 Skill Domains                              ║');
  log('  ║  791KB Metabolic Seal                                             ║');
  log('  ║                                                                   ║');
  log('  ║  Every road leads to Unity.                                       ║');
  log('  ║                                                                   ║');
  log('  ╚═══════════════════════════════════════════════════════════════════╝');
  log('\n');

})();
