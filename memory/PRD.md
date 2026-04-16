# ENLIGHTEN.MINT.CAFE — V55.1 SOVEREIGN LIBRARY
## Last Verified: April 16, 2026

### Sovereign Cultural Library — 10 Traditions × 6 Dimensions
Every tradition accessible from every module system-wide.

| # | Tradition | Region | Core Teaching | Mixer Tags |
|---|-----------|--------|---------------|------------|
| 1 | Lakota/Oceti Sakowin | Great Plains | Mitakuye Oyasin | lakota_drum, heartbeat_60bpm, plains_flute |
| 2 | Kemetic/Egyptian | Nile Valley | As above, so below | sistrum_rattle, temple_drum_72, nile_harp |
| 3 | Vedic/Hindu | India | Tat Tvam Asi | om_drone_136hz, tabla_taal, tanpura_drone |
| 4 | Yoruba/West African | Nigeria/Benin | Iwa Pele | djembe_polyrhythm, bata_orisha, dundun_talking |
| 5 | Mayan | Central America | In Lak'ech | tun_drum, turtle_percussion, conch_call |
| 6 | Aboriginal | Australia | The Dreaming | didgeridoo_drone, clapstick_rhythm, songline_vocal |
| 7 | Celtic | British Isles | The Otherworld overlaps | bodhran_pulse, celtic_harp, uilleann_drone |
| 8 | Kabbalistic | Israel/diaspora | Ein Sof | shofar_blast, niggun_chant, kabbalistic_drone |
| 9 | Taoist/Chinese | China | Wu Wei | guqin_meditation, temple_bell, wooden_fish |
| 10 | Sufi/Islamic | Middle East/Global | La ilaha illallah | ney_flute, sufi_daf, qawwali_vocal |

### Each Tradition Has 6 Dimensions:
- **wisdom**: Philosophy, key concepts, virtues
- **rhythm**: Instruments, tempo, mixer tags, ceremony music
- **geometry**: Primary form, sacred forms, principle
- **healing**: Modalities, plants, principle
- **stars**: Tradition name, key stars, principle
- **practices**: Specific practices users can engage with

### API Endpoints
- GET /api/omni-bridge/traditions — list all 10
- GET /api/omni-bridge/tradition/{id} — full tradition detail
- GET /api/omni-bridge/tradition/{id}/{dimension} — specific dimension
- GET /api/omni-bridge/mixer-tags — all mixer audio tags
- GET /api/omni-bridge/geometry-forms — all sacred geometry
- POST /api/omni-bridge/cross-tradition — AI bridges 2+ traditions on a topic
- POST /api/omni-bridge/insight — AI insight for any module with all cultural context
