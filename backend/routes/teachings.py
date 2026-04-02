from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import random

# ========== SPIRITUAL TEACHINGS ==========

SPIRITUAL_TEACHERS = [
    {
        "id": "buddha",
        "name": "Gautama Buddha",
        "tradition": "Buddhism",
        "era": "563–483 BCE",
        "color": "#FCD34D",
        "image": "https://images.unsplash.com/photo-1609619385002-f40f1df9b5a4?w=400&h=400&fit=crop",
        "bio": "Born as Prince Siddhartha in ancient India, the Buddha renounced his royal life after encountering suffering. After years of ascetic practice, he attained enlightenment under the Bodhi tree and spent the remaining 45 years teaching the path to liberation from suffering.",
        "core_principle": "The Middle Way — neither extreme indulgence nor extreme asceticism leads to awakening.",
        "themes": ["suffering", "mindfulness", "compassion", "impermanence", "consciousness"],
        "teachings": [
            {"id": "four-noble-truths", "title": "The Four Noble Truths", "content": "1. Dukkha — Life contains suffering, dissatisfaction, and impermanence.\n2. Samudaya — Suffering arises from craving, attachment, and aversion.\n3. Nirodha — It is possible to end suffering by letting go of craving.\n4. Magga — The Eightfold Path is the way to end suffering.\n\nThese truths are not pessimistic — they are a diagnosis and cure. Like a physician, Buddha first identifies the illness, then its cause, then declares it curable, then prescribes the medicine.", "practice": "Sit quietly and observe where you feel resistance or craving in your life right now. Don't judge it — simply see it clearly."},
            {"id": "eightfold-path", "title": "The Noble Eightfold Path", "content": "The path to liberation unfolds in eight interconnected practices:\n\nWisdom: Right View (seeing reality as it is), Right Intention (renunciation, goodwill, harmlessness).\n\nEthics: Right Speech (truthful, kind, helpful), Right Action (non-harming, non-stealing, non-exploitation), Right Livelihood (ethical work that doesn't harm others).\n\nMeditation: Right Effort (cultivating wholesome states), Right Mindfulness (present-moment awareness), Right Concentration (deep meditative absorption).\n\nThese are not sequential steps but eight aspects of one integrated path, practiced simultaneously.", "practice": "Choose one aspect of the Eightfold Path to focus on today. Notice how it naturally connects to the others."},
            {"id": "dependent-origination", "title": "Dependent Origination", "content": "Nothing exists independently. Everything arises in dependence upon multiple causes and conditions. This is the deepest teaching of the Buddha:\n\n'When this exists, that comes to be. With the arising of this, that arises. When this does not exist, that does not come to be. With the cessation of this, that ceases.'\n\nThis applies to suffering itself — since suffering arises from conditions, changing those conditions ends suffering. It also reveals the interconnected nature of all existence.", "practice": "Trace one emotion you're feeling right now back through its causes. What conditions gave rise to it?"},
            {"id": "metta-sutta", "title": "Loving-Kindness (Metta)", "content": "The Buddha taught that loving-kindness is both a meditation practice and a way of being:\n\n'May all beings be happy. May all beings be safe. May all beings be healthy. May all beings live with ease.'\n\nBegin with yourself, then extend to loved ones, neutral people, difficult people, and finally all beings everywhere. This practice literally rewires the brain for compassion and reduces the sense of separation between self and other.", "practice": "Spend 5 minutes sending loving-kindness to yourself, then gradually expand to include all beings."},
            {"id": "heart-sutra", "title": "The Heart Sutra — Emptiness", "content": "'Form is emptiness, emptiness is form. Form is not other than emptiness, emptiness is not other than form.'\n\nThis profound teaching points to the ultimate nature of reality: nothing has inherent, independent existence. 'Emptiness' (sunyata) doesn't mean nothingness — it means everything is interdependent, fluid, and without a fixed self. When you truly see this, fear dissolves and compassion naturally arises.", "practice": "Look at any object. Contemplate all the causes and conditions that brought it into being. See how it has no independent existence."}
        ],
        "quotes": [
            "Peace comes from within. Do not seek it without.",
            "The mind is everything. What you think you become.",
            "In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go of things not meant for you.",
            "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
            "Holding on to anger is like grasping a hot coal — you are the one who gets burned.",
            "There is no path to happiness: happiness is the path.",
            "Nothing is permanent. Everything is subject to change. Being is always becoming."
        ]
    },
    {
        "id": "jesus",
        "name": "Jesus of Nazareth",
        "tradition": "Christianity / Mystical Christianity",
        "era": "4 BCE – 30 CE",
        "color": "#3B82F6",
        "image": "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=400&h=400&fit=crop",
        "bio": "A Jewish teacher, healer, and spiritual master from Galilee who taught radical love, forgiveness, and the Kingdom of God as an inner reality. His teachings on compassion, non-judgment, and spiritual transformation have influenced billions across two millennia.",
        "core_principle": "The Kingdom of Heaven is within you — God's presence is accessed through love, forgiveness, and inner transformation.",
        "themes": ["love", "forgiveness", "faith", "consciousness", "service"],
        "teachings": [
            {"id": "sermon-mount", "title": "The Sermon on the Mount", "content": "The Beatitudes reveal a radical spiritual truth — that blessing comes through states the world considers weakness:\n\n'Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth. Blessed are those who hunger and thirst for righteousness. Blessed are the merciful. Blessed are the pure in heart, for they shall see God. Blessed are the peacemakers.'\n\nThis teaching inverts worldly values: true power lies in surrender, true wealth in spiritual poverty, true strength in gentleness.", "practice": "Choose one Beatitude to embody today. Notice how it shifts your perspective on strength and weakness."},
            {"id": "love-commandment", "title": "The Greatest Commandment", "content": "'Love the Lord your God with all your heart, soul, mind, and strength. And love your neighbor as yourself. There is no commandment greater than these.'\n\nJesus collapsed all spiritual law into one principle: Love. Not sentimental affection, but agape — unconditional, sacrificial love that sees the divine in every being. 'As yourself' implies self-love is not selfishness but the foundation of all love.", "practice": "Practice seeing every person you encounter today as worthy of the same love you give yourself."},
            {"id": "parables", "title": "The Parables — Hidden Wisdom", "content": "Jesus taught in parables — stories that bypass the rational mind and plant seeds in the heart:\n\nThe Good Samaritan: True compassion transcends all tribal boundaries.\nThe Prodigal Son: Divine love never rejects — it celebrates your return no matter how far you've wandered.\nThe Mustard Seed: Faith as small as a seed can move mountains because spiritual power doesn't operate by worldly scale.\nThe Pearl of Great Price: When you find truth, surrender everything for it.", "practice": "Choose one parable and sit with it in meditation. Let it speak to your life situation without analyzing it."},
            {"id": "forgiveness", "title": "Radical Forgiveness", "content": "'Father, forgive them, for they know not what they do.'\n\nSpoken from the cross, this teaching reveals the ultimate spiritual mastery: forgiving even in the midst of being harmed. Jesus taught that unforgiveness binds you to the past and blocks the flow of divine grace.\n\n'If you forgive others their trespasses, your heavenly Father will also forgive you.' Forgiveness is not condoning harm — it is releasing yourself from the prison of resentment.", "practice": "Think of someone you haven't forgiven. Without condoning their actions, practice releasing the weight of resentment."},
            {"id": "kingdom-within", "title": "The Kingdom Within", "content": "'The Kingdom of God does not come with observation. Nor will they say, Look here! or Look there! For indeed, the Kingdom of God is within you.'\n\nThis mystical teaching points to the same truth found in all traditions: the divine is not far away but closer than your own breath. Heaven is not a future destination but a present reality accessed through inner transformation. The 'narrow gate' is the present moment, consciousness itself.", "practice": "Close your eyes. Instead of seeking God somewhere 'out there,' turn attention inward. Rest in the silence between thoughts."}
        ],
        "quotes": [
            "Love your enemies, bless those who curse you, do good to those who hate you.",
            "Judge not, that you be not judged.",
            "The truth shall set you free.",
            "Ask and it shall be given; seek and you shall find; knock and it shall be opened unto you.",
            "Be still, and know that I am God.",
            "Where two or three are gathered in my name, there am I among them.",
            "Let he who is without sin cast the first stone."
        ]
    },
    {
        "id": "muhammad",
        "name": "Prophet Muhammad",
        "tradition": "Islam / Sufism",
        "era": "570–632 CE",
        "color": "#22C55E",
        "image": "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&h=400&fit=crop",
        "bio": "The final prophet in the Islamic tradition, Muhammad received divine revelation over 23 years. Beyond the formal religious practices, his teachings contain profound spiritual wisdom about surrender to God (Islam), remembrance (dhikr), and the purification of the heart (tazkiyah).",
        "core_principle": "Islam (surrender) — true peace comes through complete surrender of the ego to the Divine Will.",
        "themes": ["surrender", "compassion", "service", "remembrance", "consciousness"],
        "teachings": [
            {"id": "remembrance", "title": "Dhikr — Remembrance of God", "content": "'Verily, in the remembrance of God do hearts find rest.' (Quran 13:28)\n\nDhikr is the practice of constantly remembering the Divine — through repetition of sacred names, through gratitude, through seeing God's signs in nature. The Sufis developed this into elaborate meditation practices, but at its core, dhikr is simply never forgetting that every breath is a gift.\n\nThe Prophet said: 'There is a polish for everything that takes away rust, and the polish for the heart is the remembrance of God.'", "practice": "Spend 5 minutes silently repeating a divine name or attribute (Al-Rahman — The Compassionate). Let it polish your heart."},
            {"id": "heart-purification", "title": "Purification of the Heart", "content": "The Prophet taught: 'Truly in the body there is a morsel of flesh which, if it be sound, the whole body is sound; and if it is corrupt, the whole body is corrupt. Truly it is the heart.'\n\nIslamic spirituality centers on the heart (qalb) — not the physical organ but the spiritual center of consciousness. Diseases of the heart include arrogance, envy, greed, and heedlessness. The cure is remembrance, gratitude, service, and turning constantly toward God.", "practice": "Examine your heart honestly. What spiritual disease (envy, pride, resentment) is most active? Ask for healing."},
            {"id": "service", "title": "Service to Creation", "content": "'The best of people are those who are most beneficial to others.'\n\nThe Prophet Muhammad emphasized that worship of God without service to humanity is incomplete. He taught by example — mending his own clothes, serving his family, feeding the poor, and treating animals with kindness.\n\n'God does not look at your outward appearance or your wealth; rather He looks at your hearts and your deeds.'", "practice": "Perform an act of service today with zero expectation of recognition or reward. Let it be between you and God alone."},
            {"id": "inner-jihad", "title": "The Greater Jihad — Inner Struggle", "content": "Returning from a battle, the Prophet told his companions: 'We have returned from the lesser jihad to the greater jihad — the jihad of the self (nafs).'\n\nThe greatest spiritual battle is not external but internal: overcoming the ego's tendency toward selfishness, heedlessness, and spiritual sleep. This inner transformation is the foundation of all outer change.", "practice": "Identify one pattern of your ego (nafs) that keeps you from your highest self. Commit to one small act of resistance against it today."},
            {"id": "tawakkul", "title": "Tawakkul — Trust in God", "content": "A man asked the Prophet: 'Should I tie my camel and trust in God, or let it go and trust in God?' He replied: 'Tie your camel and trust in God.'\n\nTawakkul is not passive fatalism — it is taking right action while surrendering the outcome to God. It means doing your absolute best and then releasing anxiety about results. This is the secret to inner peace: full effort, zero attachment.", "practice": "Identify something you're anxious about. Take one practical action toward it, then consciously release the outcome to God."}
        ],
        "quotes": [
            "The best among you are those who have the best manners and character.",
            "Speak good or remain silent.",
            "The strong person is not the one who can wrestle someone else down. The strong person is the one who can control themselves when they are angry.",
            "None of you truly believes until he wishes for his brother what he wishes for himself.",
            "Be in this world as though you were a stranger or a traveler.",
            "God is beautiful and loves beauty.",
            "Whoever is not merciful to others will not be treated mercifully."
        ]
    },
    {
        "id": "krishna",
        "name": "Lord Krishna",
        "tradition": "Hinduism / Bhagavad Gita",
        "era": "~3000 BCE (traditional)",
        "color": "#6366F1",
        "image": "https://images.unsplash.com/photo-1614094082869-cd4e4b2f3da7?w=400&h=400&fit=crop",
        "bio": "Krishna is revered as an avatar of Vishnu and the speaker of the Bhagavad Gita, perhaps the most influential spiritual text in history. Spoken on the battlefield to the warrior Arjuna, the Gita addresses the deepest questions of duty, action, devotion, and the nature of the Self.",
        "core_principle": "You have the right to action but never to its fruits — perform your duty with equanimity, surrendering results to the Divine.",
        "themes": ["duty", "consciousness", "devotion", "detachment", "love"],
        "teachings": [
            {"id": "karma-yoga", "title": "Karma Yoga — The Path of Action", "content": "'You have the right to work, but never to the fruit of work. You should never engage in action for the sake of reward, nor should you long for inaction.'\n\nKarma Yoga is performing action without attachment to results. This doesn't mean not caring — it means giving your full effort while releasing anxiety about outcomes. When you act from duty rather than desire, work becomes worship and every action becomes a form of meditation.", "practice": "Complete one task today with full presence and effort, but zero attachment to how it's received or what it produces."},
            {"id": "bhakti-yoga", "title": "Bhakti Yoga — The Path of Devotion", "content": "'Fill your mind with Me, be My devotee, sacrifice to Me, bow down to Me. Having thus disciplined yourself, and regarding Me as the supreme goal, you will come to Me.'\n\nBhakti is the path of love and devotion — surrendering the heart completely to the Divine. It is considered the most accessible path because it requires no special knowledge or ability, only love. Through devotion, the sense of separation between lover and Beloved dissolves.", "practice": "Choose any form of the Divine that inspires love in your heart. Spend 5 minutes in silent devotion — not asking for anything, simply loving."},
            {"id": "jnana-yoga", "title": "Jnana Yoga — The Path of Knowledge", "content": "'The wise see that there is action in the midst of inaction and inaction in the midst of action.'\n\nJnana Yoga is the path of discriminative wisdom — using the intellect to distinguish the eternal Self (Atman) from the temporary body-mind. Through inquiry ('Who am I?'), one discovers that consciousness itself is unchanging, even as thoughts, emotions, and experiences constantly change.", "practice": "Ask yourself 'Who am I?' and discard every answer that is temporary (body, job, name, role). What remains?"},
            {"id": "self-nature", "title": "The Eternal Self", "content": "'The Self is never born nor does it die. It is not that having been it ceases to be. It is unborn, eternal, ever-existing, undying, and primeval. It is not slain when the body is slain.'\n\nKrishna reveals that your deepest identity is not the body or mind but the Atman — pure consciousness, identical with Brahman (the Absolute). Fear of death dissolves when you realize you are that which cannot be destroyed.", "practice": "Sit quietly and feel the awareness that is watching your thoughts. That awareness has been the same your whole life — unchanging. Rest there."},
            {"id": "equanimity", "title": "Equanimity in All Things", "content": "'The person who is not disturbed by happiness and distress, and is steady in both, is certainly eligible for liberation.'\n\nKrishna teaches that spiritual maturity is measured by equanimity — remaining centered whether facing pleasure or pain, praise or criticism, gain or loss. This is not indifference but a profound stability rooted in the knowledge of the eternal Self.", "practice": "Notice your emotional reactions today. When something pleasant or unpleasant occurs, pause and return to center before responding."}
        ],
        "quotes": [
            "Wherever there is Krishna, the master of yoga, and Arjuna, the supreme archer, there will be everlasting prosperity, victory, happiness, and morality.",
            "Change is the law of the universe. You can be a millionaire or a pauper in an instant.",
            "The soul is neither born, and nor does it die.",
            "Set thy heart upon thy work but never upon its reward.",
            "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.",
            "A person can rise through the efforts of their own mind; they can also degrade themselves. Because each person is their own friend or enemy.",
            "There is neither this world, nor the world beyond, nor happiness for the one who doubts."
        ]
    },
    {
        "id": "laotzu",
        "name": "Lao Tzu",
        "tradition": "Taoism",
        "era": "6th Century BCE",
        "color": "#2DD4BF",
        "image": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop",
        "bio": "The legendary author of the Tao Te Ching, Lao Tzu is the foundational sage of Taoism. His teaching of 'the Way' (Tao) emphasizes harmony with nature, effortless action (wu wei), and the power of yielding over force. His 81 verses remain among the most translated texts in human history.",
        "core_principle": "Wu Wei — effortless action. Like water, which overcomes the hardest stone not through force but through persistence and yielding.",
        "themes": ["harmony", "simplicity", "nature", "consciousness", "impermanence"],
        "teachings": [
            {"id": "tao", "title": "The Tao That Cannot Be Named", "content": "'The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name. The nameless is the beginning of heaven and earth.'\n\nThe Tao is the ultimate reality underlying all existence — but it cannot be captured in words or concepts. The moment you define it, you've lost it. Like trying to catch water by closing your fist, truth must be held with an open hand. This is why Lao Tzu uses paradox: to point beyond the thinking mind.", "practice": "Spend 5 minutes in silence, letting go of all labels and concepts. Experience reality without naming it."},
            {"id": "wu-wei", "title": "Wu Wei — Effortless Action", "content": "'The sage acts without doing and teaches without saying.'\n\nWu wei is not laziness — it is action in perfect harmony with the moment. Like a skilled musician who plays without thinking, or water that finds the lowest point without effort. When you stop forcing and start flowing, life becomes effortless. The hard part is trusting enough to let go of control.", "practice": "Notice where you're forcing something in your life. Experiment with softening your grip and allowing the situation to unfold naturally."},
            {"id": "water-teaching", "title": "The Way of Water", "content": "'Nothing in the world is as soft and yielding as water. Yet for dissolving the hard and inflexible, nothing can surpass it. The soft overcomes the hard; the gentle overcomes the rigid.'\n\nWater is Lao Tzu's supreme metaphor for the Tao. It seeks the lowest place (humility), takes the shape of any container (adaptability), nourishes all things without competing, and over time carves through solid rock. Be like water.", "practice": "In your next conflict or challenge, try the 'water approach': yield, adapt, find the path of least resistance."},
            {"id": "simplicity", "title": "Return to Simplicity", "content": "'In pursuit of learning, every day something is acquired. In pursuit of the Tao, every day something is dropped.'\n\nThe spiritual path is not about accumulating more — more knowledge, more experiences, more possessions. It is about shedding what is unnecessary until you return to your original nature: simple, clear, content. The uncarved block (pu) is the Taoist ideal — pure potential before the world shapes us.", "practice": "Simplify one area of your life today. Remove one unnecessary thing, commitment, or worry. Feel the spaciousness."},
            {"id": "opposites", "title": "The Unity of Opposites", "content": "'When people see things as beautiful, ugliness is created. When people see things as good, evil is created. Being and non-being produce each other. Difficult and easy complement each other.'\n\nLao Tzu reveals that all opposites are interdependent — you cannot have one without the other. This is not nihilism but liberation: when you stop dividing reality into good/bad, the struggle ceases and peace arises naturally.", "practice": "Notice where you're caught in dualistic thinking (good/bad, success/failure). See if you can hold both sides simultaneously."}
        ],
        "quotes": [
            "A journey of a thousand miles begins with a single step.",
            "Nature does not hurry, yet everything is accomplished.",
            "When I let go of what I am, I become what I might be.",
            "He who knows others is wise. He who knows himself is enlightened.",
            "The best fighter is never angry.",
            "Silence is a source of great strength.",
            "Life is a series of natural and spontaneous changes. Don't resist them — that only creates sorrow."
        ]
    },
    {
        "id": "rumi",
        "name": "Jalal ad-Din Rumi",
        "tradition": "Sufism / Islamic Mysticism",
        "era": "1207–1273 CE",
        "color": "#FB923C",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        "bio": "A 13th-century Persian poet, scholar, and Sufi mystic, Rumi's poetry has transcended all cultural and religious boundaries to become the best-selling poet in America 800 years after his death. His work explores the burning love between the soul and the Divine.",
        "core_principle": "The wound is the place where the Light enters you — suffering and love are the doorways to divine union.",
        "themes": ["love", "suffering", "consciousness", "surrender", "impermanence"],
        "teachings": [
            {"id": "divine-love", "title": "The Ocean of Divine Love", "content": "'Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.'\n\nFor Rumi, all of existence is an expression of divine love. The longing you feel — for connection, for meaning, for something you can't name — is God's longing for you. Every love story is ultimately about reunion with the Beloved. When you stop building walls and let love in, you discover it was always there.", "practice": "Identify one wall you've built around your heart. Gently begin to let it dissolve — not forcing, simply allowing."},
            {"id": "guest-house", "title": "The Guest House", "content": "'This being human is a guest house. Every morning a new arrival. A joy, a depression, a meanness — some momentary awareness comes as an unexpected visitor. Welcome and entertain them all!'\n\nRumi teaches radical acceptance: every emotion, even the painful ones, arrives bearing gifts. When you stop resisting your inner experiences and welcome them, they transform. The guest who seemed like a thief may be clearing your house for new delight.", "practice": "Whatever emotion arises today, greet it as a guest. Say 'Welcome' internally instead of resisting. See what happens."},
            {"id": "silence", "title": "The Language of Silence", "content": "'Silence is the language of God; all else is poor translation.'\n\nBeyond words, beyond thought, beyond even feeling — there is a vast silence that is the ground of all being. Rumi spent years in ecstatic poetry, yet always pointed to what lies beyond language. The whirling dance of the Mevlevi dervishes is designed to quiet the mind and open the heart to this silence.", "practice": "Sit in complete silence for 10 minutes. When thoughts arise, let them pass like clouds. Rest in the gap between thoughts."},
            {"id": "transformation", "title": "The Alchemy of Suffering", "content": "'The wound is the place where the Light enters you.'\n\nRumi does not promise a life without pain. Instead, he reveals that suffering is the doorway to transformation. Like a seed that must crack open to grow, or a grape that must be crushed to become wine, our deepest wounds are where the most profound healing and awakening occur.", "practice": "Reflect on a past wound that ultimately led to growth. Can you see the light that entered through that crack?"}
        ],
        "quotes": [
            "The wound is the place where the Light enters you.",
            "What you seek is seeking you.",
            "Don't grieve. Anything you lose comes round in another form.",
            "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
            "Let yourself be silently drawn by the strange pull of what you really love.",
            "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.",
            "You are not a drop in the ocean. You are the entire ocean in a drop."
        ]
    },
    {
        "id": "thich-nhat-hanh",
        "name": "Thich Nhat Hanh",
        "tradition": "Zen Buddhism / Engaged Buddhism",
        "era": "1926–2022",
        "color": "#A78BFA",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
        "bio": "A Vietnamese Zen master, peace activist, and author of over 100 books, Thich Nhat Hanh brought mindfulness to the West in its most accessible form. Nominated for the Nobel Peace Prize by Martin Luther King Jr., he taught 'engaged Buddhism' — applying mindfulness to social action and daily life.",
        "core_principle": "The miracle is not to walk on water but to walk on the green earth in the present moment, dwelling in peace and happiness.",
        "themes": ["mindfulness", "compassion", "impermanence", "love", "suffering"],
        "teachings": [
            {"id": "present-moment", "title": "The Miracle of the Present Moment", "content": "'The present moment is the only moment available to us, and it is the door to all moments.'\n\nThich Nhat Hanh's entire teaching can be summarized in three words: 'I have arrived.' Most of us spend our lives running — toward the future, away from the past. But life is only available in this moment. When you wash dishes, just wash dishes. When you walk, just walk. This simplicity is the deepest practice.", "practice": "Do one ordinary activity today with complete mindfulness — brushing teeth, eating, walking. Be fully there."},
            {"id": "interbeing", "title": "Interbeing", "content": "'If you are a poet, you will see clearly that there is a cloud floating in this sheet of paper. Without a cloud, there will be no rain; without rain, the trees cannot grow; and without trees, we cannot make paper.'\n\nInterbeing is Thich Nhat Hanh's term for dependent origination — the insight that nothing exists by itself. Everything inter-is with everything else. This flower is made of non-flower elements: sun, rain, earth, air. When you see this deeply, separation dissolves and compassion naturally arises.", "practice": "Look at any object and trace its connections to the entire universe. See the sun, rain, and human labor within it."},
            {"id": "breathing", "title": "Conscious Breathing", "content": "'Breathing in, I calm my body. Breathing out, I smile. Dwelling in the present moment, I know this is a wonderful moment.'\n\nThe breath is always available as an anchor to the present. Thich Nhat Hanh taught that simply following your breathing with awareness can transform your entire life. Each breath is a homecoming — a return from the storms of thinking to the peace of being.", "practice": "Practice 10 conscious breaths right now. Breathing in: 'I have arrived.' Breathing out: 'I am home.'"},
            {"id": "deep-listening", "title": "Deep Listening & Loving Speech", "content": "'Deep listening is the kind of listening that can help relieve the suffering of another person. You listen with only one purpose: to help them empty their heart.'\n\nTrue listening is a form of meditation — you are fully present with another person without judgment, without planning your response. This alone can heal. And loving speech means speaking in a way that inspires confidence, joy, and hope.", "practice": "In your next conversation, practice listening without any agenda. Don't plan responses — just be fully present."}
        ],
        "quotes": [
            "Walk as if you are kissing the Earth with your feet.",
            "Because you are alive, everything is possible.",
            "Smile, breathe, and go slowly.",
            "No mud, no lotus.",
            "Understanding someone's suffering is the best gift you can give another person.",
            "When you love someone, the best thing you can offer is your presence.",
            "People have a hard time letting go of their suffering. Out of a fear of the unknown, they prefer suffering that is familiar."
        ]
    },
    {
        "id": "yogananda",
        "name": "Paramahansa Yogananda",
        "tradition": "Kriya Yoga / Vedanta",
        "era": "1893–1952",
        "color": "#EC4899",
        "image": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=400&fit=crop",
        "bio": "Author of 'Autobiography of a Yogi,' Yogananda was one of the first Indian masters to permanently reside in the West. He introduced millions to meditation and Kriya Yoga, emphasizing the direct experience of God-consciousness through scientific techniques of concentration and energy control.",
        "core_principle": "Self-Realization — the knowing in body, mind, and soul that we are one with the omnipresence of God.",
        "themes": ["consciousness", "devotion", "meditation", "love", "faith"],
        "teachings": [
            {"id": "self-realization", "title": "Self-Realization", "content": "'Self-realization is the knowing — in body, mind, and soul — that we are one with the omnipresence of God; that we do not have to pray that it come to us, that we are not merely combatants in this conflict of good and evil, but that we are already the Infinite.'\n\nYogananda taught that enlightenment is not something foreign to be attained but your natural state to be uncovered. The techniques of meditation systematically remove the veils of delusion until the light of the Self shines forth.", "practice": "Meditate for 10 minutes focusing at the point between the eyebrows (the spiritual eye). Feel divine consciousness already present."},
            {"id": "kriya-meditation", "title": "The Science of Meditation", "content": "'Kriya Yoga is the real 'fire rite' often spoken of in the Gita. The yogi casts his human longings into a monotheistic bonfire consecrated to the unparalleled God.'\n\nYogananda presented meditation not as mystical belief but as a scientific technique for expanding consciousness. Through regular practice, the meditator moves through stages: body relaxation, breath calm, thought stillness, and finally, the experience of cosmic consciousness.", "practice": "Sit upright, close your eyes, and gently focus attention at the spiritual eye (between eyebrows). Watch the breath slow naturally."},
            {"id": "divine-will", "title": "Attunement with Divine Will", "content": "'The season of failure is the best time for sowing the seeds of success.'\n\nYogananda taught that true success comes from aligning personal will with divine will through meditation. When your desires are purified and aligned with cosmic purpose, the entire universe conspires to support you. This is not passive — it requires both intense personal effort and deep surrender.", "practice": "Before making a decision today, sit quietly and ask: 'What does my highest Self want in this situation?' Wait for the inner answer."}
        ],
        "quotes": [
            "Be as simple as you can be; you will be astonished to see how uncomplicated and happy your life can become.",
            "Live quietly in the moment and see the beauty of all before you. The future will take care of itself.",
            "You must not let your life run in the ordinary way; do something that nobody else has done, something that will dazzle the world.",
            "The power of unfulfilled desires is the root of all man's slavery.",
            "The season of failure is the best time for sowing the seeds of success.",
            "Be afraid of nothing. You have within you all wisdom, all power, all strength, all understanding."
        ]
    },
    {
        "id": "ramdass",
        "name": "Ram Dass",
        "tradition": "Hindu-inspired / Universal Spirituality",
        "era": "1931–2019",
        "color": "#F472B6",
        "image": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop",
        "bio": "Born Richard Alpert, a Harvard psychology professor who became Ram Dass after meeting his guru Neem Karoli Baba in India. His book 'Be Here Now' became a spiritual classic, bridging Eastern wisdom and Western psychology for an entire generation of seekers.",
        "core_principle": "Be Here Now — the spiritual journey is not about getting somewhere else but being fully present with what is.",
        "themes": ["consciousness", "love", "mindfulness", "service", "faith"],
        "teachings": [
            {"id": "be-here-now", "title": "Be Here Now", "content": "'Be here now. Remember, be here now. This moment is the only moment that matters.'\n\nRam Dass distilled all spiritual teaching into three words. The mind constantly pulls us into memories of the past or fantasies of the future, but life only exists now. The practice is devastatingly simple and endlessly challenging: just be fully present with whatever is happening.", "practice": "Set a timer for 5 minutes. Simply be present with whatever is happening — sounds, sensations, breath. No agenda."},
            {"id": "loving-awareness", "title": "Loving Awareness", "content": "'I am loving awareness. I am loving awareness. I am loving awareness.'\n\nIn his later years, Ram Dass simplified his entire teaching to this mantra. You are not your thoughts, not your body, not your roles — you are the awareness in which all of this appears. And that awareness is inherently loving. When you rest as loving awareness, compassion flows naturally.", "practice": "Repeat silently: 'I am loving awareness.' Let this become the lens through which you experience everything today."},
            {"id": "guru-grace", "title": "The Grace of the Guru", "content": "'My guru said to me: 'I love everyone.' I asked: 'Even criminals?' He said: 'Don't you see? It's all just souls walking each other home.'\n\nRam Dass's guru, Neem Karoli Baba (Maharaji), taught almost entirely through presence and love rather than words. Ram Dass discovered that being in the presence of an awakened being could do more than years of study — it could shatter the ego's illusions and reveal the love that is our true nature.", "practice": "Think of someone who embodies unconditional love. Spend a moment absorbing their quality of presence."},
            {"id": "aging-dying", "title": "Conscious Aging & Dying", "content": "'As long as you have certain desires about how it ought to be, you can't see how it is.'\n\nAfter his severe stroke in 1997, Ram Dass turned his own aging and limitations into teachings. He showed that spiritual growth doesn't require a healthy body — it requires honest presence with whatever is. Aging and dying become the ultimate spiritual practices when met with consciousness rather than denial.", "practice": "Sit with the reality of impermanence. Rather than fearing it, see how awareness of death makes this moment more precious."}
        ],
        "quotes": [
            "We're all just walking each other home.",
            "The quieter you become, the more you can hear.",
            "Treat everyone you meet like God in drag.",
            "The next message you need is always right where you are.",
            "As long as you have certain desires about how it ought to be, you can't see how it is.",
            "Suffering is part of our training program for becoming wise.",
            "I would like my life to be a statement of love and compassion — and where it isn't, that's where my work lies."
        ]
    },
    {
        "id": "watts",
        "name": "Alan Watts",
        "tradition": "Zen / Comparative Mysticism",
        "era": "1915–1973",
        "color": "#06B6D4",
        "image": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=400&fit=crop",
        "bio": "A British-American philosopher who interpreted Eastern wisdom for the Western mind with unmatched clarity and humor. Through his books, lectures, and radio talks, Alan Watts made Zen Buddhism, Taoism, and Hindu philosophy accessible without diluting their depth.",
        "core_principle": "You are the universe experiencing itself — the feeling of being a separate 'self' is a useful illusion, not the ultimate reality.",
        "themes": ["consciousness", "nature", "impermanence", "harmony", "simplicity"],
        "teachings": [
            {"id": "cosmic-game", "title": "The Cosmic Game", "content": "'God likes to play hide-and-seek, but because there is nothing outside of God, he has no one but himself to play with. So he pretends that he is not himself — and in this way the one becomes the many.'\n\nWatts reframed the entire spiritual search with a startling insight: you are not a small creature seeking a vast God. You ARE the vast God pretending to be a small creature. The universe is playing hide-and-seek with itself through you. Enlightenment is simply the game being over — God remembering it was God all along.", "practice": "Look in a mirror. Behind those eyes is the universe looking at itself. Can you feel the cosmic joke?"},
            {"id": "backwards-law", "title": "The Backwards Law", "content": "'Muddy water is best cleared by leaving it alone.'\n\nThe harder you try to be happy, the more unhappy you become. The harder you try to sleep, the more awake you stay. The harder you try to be spiritual, the more ego-driven you get. Watts calls this 'the backwards law': the desire for a positive experience is itself a negative experience. Liberation comes from giving up the struggle.", "practice": "Notice one area where you're trying too hard. Experiment with doing nothing about it. Just let the muddy water settle."},
            {"id": "present-eternal", "title": "The Eternal Now", "content": "'This — the immediate, everyday, and present experience — is IT, the entire and ultimate point for the existence of a universe.'\n\nWatts hammers home that there is no moment other than this one. The past is a memory happening now. The future is a fantasy happening now. All there ever is, was, or will be is NOW. When you truly get this, the anxiety of time dissolves and you discover that eternity is not endless time but the depth of this present moment.", "practice": "Right now, drop all concepts of past and future. There is only THIS. Feel how eternal this moment actually is."},
            {"id": "nature-self", "title": "You Are Nature", "content": "'You didn't come INTO this world. You came OUT of it, like a wave from the ocean. You are not a stranger here.'\n\nThe feeling of being separate from nature is the fundamental illusion. You don't have a body — you ARE a body, and that body is a process of nature, like a wave is a process of the ocean. You are the universe 'peopling' the same way a tree 'apples.' This isn't philosophy — it's biology.", "practice": "Go outside and feel the air on your skin, the ground under your feet. You're not IN nature — you ARE nature, knowing itself."}
        ],
        "quotes": [
            "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
            "Trying to define yourself is like trying to bite your own teeth.",
            "You are a function of what the whole universe is doing in the same way that a wave is a function of what the whole ocean is doing.",
            "The meaning of life is just to be alive. It is so plain and so obvious and so simple.",
            "This is the real secret of life — to be completely engaged with what you are doing in the here and now.",
            "No one is more dangerously insane than one who is sane all the time.",
            "To have faith is to trust yourself to the water. When you swim you don't grab hold of the water, because if you do you will sink and drown."
        ]
    },
    {
        "id": "thoth",
        "name": "Thoth / Hermes Trismegistus",
        "tradition": "Ancient Egyptian Mysticism / Hermeticism",
        "era": "~3000 BCE (mythic) / 2nd–3rd Century CE (Corpus Hermeticum)",
        "color": "#D4AF37",
        "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&h=400&fit=crop",
        "bio": "Thoth (Djehuty) is the Egyptian god of wisdom, writing, magic, and the moon — credited with inventing hieroglyphs, science, and the sacred arts. Later merged with the Greek Hermes as 'Hermes Trismegistus' (Thrice-Great), his teachings became the foundation of Hermeticism, alchemy, and Western esoteric tradition. The Emerald Tablet and Corpus Hermeticum carry his attributed wisdom across millennia.",
        "core_principle": "As above, so below; as within, so without — the microcosm reflects the macrocosm, and understanding one reveals the other.",
        "themes": ["consciousness", "nature", "harmony", "mysticism", "alchemy"],
        "teachings": [
            {"id": "emerald-tablet", "title": "The Emerald Tablet", "content": "'That which is Below corresponds to that which is Above, and that which is Above corresponds to that which is Below, to accomplish the miracle of the One Thing.'\n\nThe Emerald Tablet is the most famous Hermetic text — a dense, cryptic formula for spiritual transformation. Its central teaching: the universe is a hologram, where every part contains the whole. Your body mirrors the cosmos. Your mind mirrors the divine mind. By understanding yourself, you understand everything. By transforming yourself, you transform your world.\n\n'The Sun is its father, the Moon its mother, the Wind hath carried it in its belly, the Earth is its nurse.' This alchemical language describes the creation of the Philosopher's Stone — which is not a physical object but the perfected human consciousness.", "practice": "Sit in stillness and contemplate: 'As above, so below.' Feel how the patterns in your life mirror larger cosmic patterns. What truth about the universe is your life reflecting right now?"},
            {"id": "seven-principles", "title": "The Seven Hermetic Principles", "content": "The Kybalion, attributed to Hermetic tradition, outlines seven universal laws:\n\n1. MENTALISM: 'The All is Mind; the Universe is Mental.' — Reality is consciousness, not matter.\n2. CORRESPONDENCE: 'As above, so below.' — Patterns repeat across all scales of existence.\n3. VIBRATION: 'Nothing rests; everything moves; everything vibrates.' — All matter is energy in motion.\n4. POLARITY: 'Everything is dual; everything has poles; opposites are identical in nature, differing only in degree.' — Heat and cold are the same thing at different vibrations.\n5. RHYTHM: 'Everything flows, out and in; everything has its tides.' — There are cycles in all things.\n6. CAUSE AND EFFECT: 'Every cause has its effect; every effect has its cause.' — Nothing happens by chance.\n7. GENDER: 'Gender is in everything; everything has its masculine and feminine principles.' — Creation requires both receptive and projective forces.\n\nThese principles are not beliefs but observations about how reality operates at every level.", "practice": "Choose one Hermetic Principle. Spend the day observing it in action — in nature, in your relationships, in your own mind."},
            {"id": "book-of-dead", "title": "The Book of Coming Forth by Day", "content": "Mistranslated as 'The Book of the Dead,' this collection of Egyptian funerary texts is actually a guide for spiritual transformation — a manual for the soul's journey through the afterlife (Duat) and its return to the light.\n\nThe Weighing of the Heart: Before Osiris, the deceased's heart is weighed against Ma'at's feather of truth. A heart heavy with regret, deception, or cruelty cannot pass. Only the light heart — one that has lived in truth — achieves immortality.\n\nThe 42 Negative Confessions are not sins to avoid but virtues to embody: 'I have not caused suffering. I have not told lies. I have not caused anyone to weep. I have not been angry without just cause.'\n\nThis is not about death — it is about how to live so that your heart is light.", "practice": "Imagine your heart being weighed against the feather of truth. What would make it heavy? What can you release today to make it lighter?"},
            {"id": "divine-mind", "title": "The Divine Mind — Nous", "content": "'God is not mind, but the cause that mind exists. God is not spirit, but the cause that spirit exists. God is not light, but the cause that light exists.'\n\nIn the Corpus Hermeticum, Thoth/Hermes teaches his student Tat that the ultimate reality (The All) is beyond all categories — beyond being and non-being. Yet this incomprehensible source expresses itself through Mind (Nous), which is the first emanation of God.\n\nHumans are unique in creation because we possess Nous — divine intellect. This is not ordinary thinking but the capacity to know God directly. Most humans are 'asleep' — identified with the body and senses. Awakening means remembering that your truest nature is this divine Mind itself.\n\n'If you do not make yourself equal to God, you cannot understand God; for like is understood by like.'", "practice": "Move beyond thinking and try to sense the awareness behind your thoughts — the Nous. This is not the mind that thinks but the Mind that knows."},
            {"id": "alchemy", "title": "The Great Work — Spiritual Alchemy", "content": "'Solve et Coagula' — Dissolve and Recombine.\n\nAlchemy is not about turning lead into gold. It is about turning the 'lead' of unconscious, conditioned existence into the 'gold' of awakened consciousness. The stages of the Great Work mirror psychological and spiritual transformation:\n\n1. NIGREDO (Blackening): The dark night of the soul. Old structures dissolve. You face your shadow.\n2. ALBEDO (Whitening): Purification. You separate truth from illusion. Clarity emerges.\n3. CITRINITAS (Yellowing): The dawn. Wisdom integrates with experience. The spiritual sun rises within.\n4. RUBEDO (Reddening): The Philosopher's Stone. The fully integrated human — matter and spirit unified. You become the gold.\n\nEvery crisis in your life is an alchemical process. The question is: will you resist the transformation or surrender to it?", "practice": "Reflect on a current challenge. Which alchemical stage are you in? How can you cooperate with the transformation instead of resisting it?"}
        ],
        "quotes": [
            "As above, so below; as within, so without; as the universe, so the soul.",
            "The lips of wisdom are closed, except to the ears of understanding.",
            "Master your words. Master your thoughts. Never allow your body to do anything that degrades your soul.",
            "Close your eyes and let the mind expand. Let no fear of death or darkness arrest its course.",
            "The universe is mental — held in the Mind of the All.",
            "True silence is the rest of the mind, and is to the spirit what sleep is to the body — nourishment and refreshment.",
            "If you would know the invisible, look carefully at the visible.",
            "Men are mortal gods, and gods are immortal men."
        ]
    }
]

TEACHING_THEMES = {
    "love": {"label": "Love & Devotion", "color": "#FB923C", "teachers": ["buddha", "jesus", "rumi", "krishna", "ramdass"]},
    "suffering": {"label": "Suffering & Transformation", "color": "#EF4444", "teachers": ["buddha", "rumi", "jesus", "thich-nhat-hanh"]},
    "consciousness": {"label": "Consciousness & Awakening", "color": "#A78BFA", "teachers": ["buddha", "krishna", "watts", "yogananda", "ramdass", "thoth"]},
    "mindfulness": {"label": "Mindfulness & Presence", "color": "#22C55E", "teachers": ["buddha", "thich-nhat-hanh", "ramdass", "watts"]},
    "surrender": {"label": "Surrender & Trust", "color": "#3B82F6", "teachers": ["muhammad", "krishna", "rumi", "laotzu"]},
    "compassion": {"label": "Compassion & Service", "color": "#EC4899", "teachers": ["buddha", "jesus", "muhammad", "thich-nhat-hanh"]},
    "impermanence": {"label": "Impermanence & Change", "color": "#06B6D4", "teachers": ["buddha", "laotzu", "watts", "ramdass"]},
    "nature": {"label": "Nature & Harmony", "color": "#2DD4BF", "teachers": ["laotzu", "watts", "thich-nhat-hanh", "thoth"]},
    "simplicity": {"label": "Simplicity & Letting Go", "color": "#FCD34D", "teachers": ["laotzu", "thich-nhat-hanh", "watts", "yogananda"]},
    "mysticism": {"label": "Mysticism & Alchemy", "color": "#D4AF37", "teachers": ["thoth", "rumi", "yogananda", "krishna"]},
    "alchemy": {"label": "Sacred Transformation", "color": "#C084FC", "teachers": ["thoth", "rumi", "buddha", "jesus"]},
}

@router.get("/teachings/teachers")
async def get_teachers():
    teachers = []
    for t in SPIRITUAL_TEACHERS:
        teachers.append({
            "id": t["id"], "name": t["name"], "tradition": t["tradition"],
            "era": t["era"], "color": t["color"], "image": t["image"],
            "bio": t["bio"], "core_principle": t["core_principle"],
            "themes": t["themes"], "teaching_count": len(t["teachings"]),
            "quote_count": len(t["quotes"]),
        })
    return {"teachers": teachers}

@router.get("/teachings/themes")
async def get_teaching_themes():
    return {"themes": TEACHING_THEMES}

@router.get("/teachings/teacher/{teacher_id}")
async def get_teacher(teacher_id: str):
    teacher = next((t for t in SPIRITUAL_TEACHERS if t["id"] == teacher_id), None)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.get("/teachings/theme/{theme_id}")
async def get_teachings_by_theme(theme_id: str):
    theme = TEACHING_THEMES.get(theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    results = []
    for tid in theme["teachers"]:
        teacher = next((t for t in SPIRITUAL_TEACHERS if t["id"] == tid), None)
        if teacher:
            themed = [te for te in teacher["teachings"] if theme_id in teacher.get("themes", [])]
            results.append({"teacher_id": teacher["id"], "teacher_name": teacher["name"], "color": teacher["color"], "teachings": themed[:2], "quotes": teacher["quotes"][:3]})
    return {"theme": theme, "teachers": results}

@router.post("/teachings/contemplate")
async def generate_contemplation(data: dict = Body(...), user=Depends(get_current_user)):
    teacher_id = data.get("teacher_id", "")
    teaching_id = data.get("teaching_id", "")
    teacher = next((t for t in SPIRITUAL_TEACHERS if t["id"] == teacher_id), None)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    teaching = next((te for te in teacher["teachings"] if te["id"] == teaching_id), None)
    if not teaching:
        raise HTTPException(status_code=404, detail="Teaching not found")
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"contemplate-{uuid.uuid4().hex[:8]}",
            system_message=f"You are a wise, compassionate spiritual guide deeply versed in the teachings of {teacher['name']} ({teacher['tradition']})."
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        prompt = f"""Create a short, immersive guided contemplation (4-5 paragraphs) based on this teaching:

Title: {teaching['title']}
Content: {teaching['content']}

The contemplation should:
1. Begin with a grounding breath
2. Guide the practitioner into the heart of this teaching
3. Use sensory, poetic language (not academic)
4. Include a specific inner exercise or visualization
5. End with an integration moment connecting the teaching to daily life

Write in second person ("you"), present tense. Keep it under 300 words. Make it feel like sitting at the feet of {teacher['name']}."""
        response = await chat.send_message(UserMessage(text=prompt))
        return {"contemplation": response, "teacher": teacher["name"], "teaching": teaching["title"]}
    except Exception:
        return {"contemplation": f"Close your eyes and breathe deeply. Reflect on this teaching from {teacher['name']}:\n\n{teaching['content']}\n\nLet this wisdom settle into your heart. Consider: {teaching['practice']}", "teacher": teacher["name"], "teaching": teaching["title"], "fallback": True}


@router.get("/teachings/daily-wisdom")
async def get_daily_wisdom():
    today = datetime.now(timezone.utc)
    day_seed = today.year * 1000 + today.timetuple().tm_yday
    rng = random.Random(day_seed)
    teacher = rng.choice(SPIRITUAL_TEACHERS)
    teaching = rng.choice(teacher["teachings"])
    quote = rng.choice(teacher["quotes"])
    return {
        "teacher_id": teacher["id"],
        "teacher_name": teacher["name"],
        "tradition": teacher["tradition"],
        "color": teacher["color"],
        "quote": quote,
        "teaching_title": teaching["title"],
        "teaching_excerpt": teaching["content"][:200] + "...",
        "practice": teaching.get("practice", ""),
        "date": today.strftime("%Y-%m-%d"),
    }


# ========== WISDOM JOURNAL ==========

@router.get("/wisdom-journal")
async def get_wisdom_journal(user=Depends(get_current_user)):
    entries = await db.wisdom_journal.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"entries": entries}

@router.post("/wisdom-journal")
async def create_journal_entry(data: dict = Body(...), user=Depends(get_current_user)):
    entry = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "teacher_id": data.get("teacher_id", ""),
        "teacher_name": data.get("teacher_name", ""),
        "teaching_id": data.get("teaching_id", ""),
        "teaching_title": data.get("teaching_title", ""),
        "quote": data.get("quote", ""),
        "reflection": data.get("reflection", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.wisdom_journal.insert_one(entry)
    entry.pop("_id", None)
    return {"entry": entry}

@router.delete("/wisdom-journal/{entry_id}")
async def delete_journal_entry(entry_id: str, user=Depends(get_current_user)):
    result = await db.wisdom_journal.delete_one({"id": entry_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"status": "deleted"}



