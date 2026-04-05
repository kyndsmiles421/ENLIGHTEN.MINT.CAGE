import asyncio
import uuid
import math
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body, HTTPException, Query
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter()

# ─── Bible Book Data ───
# Comprehensive: Protestant Canon (66) + Deuterocanonical (7) + Lost/Apocryphal (15+)

BIBLE_CATEGORIES = [
    {"id": "old-testament", "name": "Old Testament", "color": "#D97706", "description": "The foundational texts of the Hebrew Bible — from Genesis to Malachi", "icon": "scroll"},
    {"id": "new-testament", "name": "New Testament", "color": "#DC2626", "description": "The life of Jesus Christ and the early Christian church", "icon": "cross"},
    {"id": "deuterocanonical", "name": "Deuterocanonical", "color": "#7C3AED", "description": "Books included in Catholic and Orthodox canons — Wisdom, Sirach, Maccabees, and more", "icon": "book-open"},
    {"id": "lost-apocryphal", "name": "Lost & Apocryphal", "color": "#0891B2", "description": "Ancient texts excluded from mainstream canons — mystical gospels, apocalypses, and hidden wisdom", "icon": "eye"},
    {"id": "torah-talmud", "name": "Torah & Talmud", "color": "#2563EB", "description": "The oral and written law of Judaism — Mishnah, Talmud, Midrash, and the wisdom of the sages", "icon": "star"},
    {"id": "kabbalah", "name": "Kabbalah", "color": "#E879F9", "description": "Jewish mysticism — the Zohar, Sefer Yetzirah, and the hidden dimensions of creation", "icon": "sparkles"},
    {"id": "quran", "name": "The Quran", "color": "#059669", "description": "The holy revelation of Islam — 114 Surahs of divine guidance, mercy, and wisdom", "icon": "moon"},
]

BIBLE_BOOKS = [
    # ─── OLD TESTAMENT (39 books) ───
    {"id": "genesis", "title": "Genesis", "category": "old-testament", "chapters": 50, "description": "The book of beginnings — creation, the fall, the flood, and the patriarchs Abraham, Isaac, Jacob, and Joseph.", "era": "~1400 BCE", "themes": ["Creation", "Covenant", "Faith"]},
    {"id": "exodus", "title": "Exodus", "category": "old-testament", "chapters": 40, "description": "The liberation of Israel from Egyptian slavery, the Ten Commandments, and the covenant at Sinai.", "era": "~1400 BCE", "themes": ["Liberation", "Law", "Divine Presence"]},
    {"id": "leviticus", "title": "Leviticus", "category": "old-testament", "chapters": 27, "description": "Laws of holiness, sacrifice, and priestly duties — the blueprint for sacred living.", "era": "~1400 BCE", "themes": ["Holiness", "Sacrifice", "Purity"]},
    {"id": "numbers", "title": "Numbers", "category": "old-testament", "chapters": 36, "description": "Israel's wilderness wanderings — census, rebellion, and faithfulness tested.", "era": "~1400 BCE", "themes": ["Faithfulness", "Wandering", "Obedience"]},
    {"id": "deuteronomy", "title": "Deuteronomy", "category": "old-testament", "chapters": 34, "description": "Moses' farewell speeches — a second giving of the law before entering the Promised Land.", "era": "~1400 BCE", "themes": ["Covenant Renewal", "Law", "Love of God"]},
    {"id": "joshua", "title": "Joshua", "category": "old-testament", "chapters": 24, "description": "The conquest and settlement of the Promised Land under Joshua's leadership.", "era": "~1350 BCE", "themes": ["Conquest", "Promise", "Courage"]},
    {"id": "judges", "title": "Judges", "category": "old-testament", "chapters": 21, "description": "A cycle of rebellion and deliverance through divinely appointed leaders.", "era": "~1200 BCE", "themes": ["Cycle", "Deliverance", "Human Weakness"]},
    {"id": "ruth", "title": "Ruth", "category": "old-testament", "chapters": 4, "description": "A beautiful story of loyalty, redemption, and love in the lineage of King David.", "era": "~1100 BCE", "themes": ["Loyalty", "Redemption", "Providence"]},
    {"id": "1-samuel", "title": "1 Samuel", "category": "old-testament", "chapters": 31, "description": "The rise of the monarchy — Samuel, Saul, and young David.", "era": "~1050 BCE", "themes": ["Kingship", "Calling", "Faith vs. Pride"]},
    {"id": "2-samuel", "title": "2 Samuel", "category": "old-testament", "chapters": 24, "description": "David's reign, triumphs, and failures — a portrait of flawed leadership and grace.", "era": "~1000 BCE", "themes": ["Grace", "Consequence", "Worship"]},
    {"id": "1-kings", "title": "1 Kings", "category": "old-testament", "chapters": 22, "description": "Solomon's wisdom, the Temple, and the divided kingdom.", "era": "~970 BCE", "themes": ["Wisdom", "Temple", "Division"]},
    {"id": "2-kings", "title": "2 Kings", "category": "old-testament", "chapters": 25, "description": "The fall of Israel and Judah — prophets, kings, and exile.", "era": "~850 BCE", "themes": ["Judgment", "Prophecy", "Exile"]},
    {"id": "1-chronicles", "title": "1 Chronicles", "category": "old-testament", "chapters": 29, "description": "Israel's history retold with focus on David's preparations for the Temple.", "era": "~450 BCE", "themes": ["Worship", "Genealogy", "Temple"]},
    {"id": "2-chronicles", "title": "2 Chronicles", "category": "old-testament", "chapters": 36, "description": "The Temple era through exile — worship, reform, and judgment.", "era": "~450 BCE", "themes": ["Reform", "Worship", "Restoration"]},
    {"id": "ezra", "title": "Ezra", "category": "old-testament", "chapters": 10, "description": "The return from exile and rebuilding of the Temple.", "era": "~450 BCE", "themes": ["Return", "Rebuilding", "Repentance"]},
    {"id": "nehemiah", "title": "Nehemiah", "category": "old-testament", "chapters": 13, "description": "Rebuilding Jerusalem's walls and renewing the covenant.", "era": "~445 BCE", "themes": ["Leadership", "Restoration", "Prayer"]},
    {"id": "esther", "title": "Esther", "category": "old-testament", "chapters": 10, "description": "A Jewish queen saves her people from genocide in the Persian Empire.", "era": "~470 BCE", "themes": ["Providence", "Courage", "Identity"]},
    {"id": "job", "title": "Job", "category": "old-testament", "chapters": 42, "description": "The profound mystery of suffering — a righteous man's dialogue with God.", "era": "~2000 BCE", "themes": ["Suffering", "Faith", "Divine Mystery"]},
    {"id": "psalms", "title": "Psalms", "category": "old-testament", "chapters": 150, "description": "The songbook of ancient Israel — 150 hymns of praise, lament, wisdom, and worship.", "era": "~1000-400 BCE", "themes": ["Worship", "Lament", "Trust"]},
    {"id": "proverbs", "title": "Proverbs", "category": "old-testament", "chapters": 31, "description": "Practical wisdom for daily living — the fear of the Lord is the beginning of knowledge.", "era": "~950 BCE", "themes": ["Wisdom", "Character", "Daily Living"]},
    {"id": "ecclesiastes", "title": "Ecclesiastes", "category": "old-testament", "chapters": 12, "description": "The preacher's search for meaning — vanity of vanities, all is vanity.", "era": "~935 BCE", "themes": ["Meaning", "Mortality", "Enjoyment"]},
    {"id": "song-of-solomon", "title": "Song of Solomon", "category": "old-testament", "chapters": 8, "description": "A love poem celebrating romantic and spiritual love.", "era": "~960 BCE", "themes": ["Love", "Beauty", "Union"]},
    {"id": "isaiah", "title": "Isaiah", "category": "old-testament", "chapters": 66, "description": "The greatest of the prophets — visions of judgment, the Messiah, and ultimate restoration.", "era": "~740 BCE", "themes": ["Prophecy", "Messiah", "Hope"]},
    {"id": "jeremiah", "title": "Jeremiah", "category": "old-testament", "chapters": 52, "description": "The weeping prophet — warnings of judgment and promises of a new covenant.", "era": "~626 BCE", "themes": ["Warning", "New Covenant", "Perseverance"]},
    {"id": "lamentations", "title": "Lamentations", "category": "old-testament", "chapters": 5, "description": "Poems of grief over Jerusalem's destruction.", "era": "~586 BCE", "themes": ["Grief", "Hope in Suffering", "Faithfulness"]},
    {"id": "ezekiel", "title": "Ezekiel", "category": "old-testament", "chapters": 48, "description": "Visions of God's glory, the valley of dry bones, and the future Temple.", "era": "~593 BCE", "themes": ["Glory", "Restoration", "Visions"]},
    {"id": "daniel", "title": "Daniel", "category": "old-testament", "chapters": 12, "description": "Faith in exile — prophecies, dreams, and the lion's den.", "era": "~605 BCE", "themes": ["Faith", "Prophecy", "Sovereignty"]},
    {"id": "hosea", "title": "Hosea", "category": "old-testament", "chapters": 14, "description": "God's unfailing love portrayed through Hosea's marriage.", "era": "~750 BCE", "themes": ["Faithful Love", "Repentance", "Restoration"]},
    {"id": "joel", "title": "Joel", "category": "old-testament", "chapters": 3, "description": "The Day of the Lord and the outpouring of the Spirit.", "era": "~835 BCE", "themes": ["Judgment", "Spirit", "Restoration"]},
    {"id": "amos", "title": "Amos", "category": "old-testament", "chapters": 9, "description": "A shepherd-prophet demands justice for the poor and oppressed.", "era": "~760 BCE", "themes": ["Justice", "Righteousness", "Social Concern"]},
    {"id": "obadiah", "title": "Obadiah", "category": "old-testament", "chapters": 1, "description": "The shortest Old Testament book — judgment on Edom's pride.", "era": "~586 BCE", "themes": ["Pride", "Judgment", "Justice"]},
    {"id": "jonah", "title": "Jonah", "category": "old-testament", "chapters": 4, "description": "A reluctant prophet, a great fish, and God's mercy for all nations.", "era": "~760 BCE", "themes": ["Mercy", "Obedience", "Compassion"]},
    {"id": "micah", "title": "Micah", "category": "old-testament", "chapters": 7, "description": "Do justice, love mercy, walk humbly — hope for the coming ruler from Bethlehem.", "era": "~735 BCE", "themes": ["Justice", "Mercy", "Humility"]},
    {"id": "nahum", "title": "Nahum", "category": "old-testament", "chapters": 3, "description": "The fall of Nineveh — God's patience has limits.", "era": "~663 BCE", "themes": ["Judgment", "Sovereignty", "Justice"]},
    {"id": "habakkuk", "title": "Habakkuk", "category": "old-testament", "chapters": 3, "description": "Wrestling with God over injustice — the just shall live by faith.", "era": "~609 BCE", "themes": ["Faith", "Justice", "Trust"]},
    {"id": "zephaniah", "title": "Zephaniah", "category": "old-testament", "chapters": 3, "description": "The Day of the Lord and the promise of a humble remnant.", "era": "~630 BCE", "themes": ["Judgment", "Humility", "Joy"]},
    {"id": "haggai", "title": "Haggai", "category": "old-testament", "chapters": 2, "description": "A call to rebuild the Temple after exile.", "era": "~520 BCE", "themes": ["Priorities", "Temple", "Glory"]},
    {"id": "zechariah", "title": "Zechariah", "category": "old-testament", "chapters": 14, "description": "Apocalyptic visions and messianic prophecies.", "era": "~520 BCE", "themes": ["Messiah", "Visions", "Restoration"]},
    {"id": "malachi", "title": "Malachi", "category": "old-testament", "chapters": 4, "description": "The final Old Testament prophet — a call to faithfulness before 400 years of silence.", "era": "~430 BCE", "themes": ["Faithfulness", "Tithing", "Coming Messenger"]},

    # ─── NEW TESTAMENT (27 books) ───
    {"id": "matthew", "title": "Matthew", "category": "new-testament", "chapters": 28, "description": "Jesus as the promised Messiah-King, told from a Jewish perspective.", "era": "~60 CE", "themes": ["Kingdom", "Fulfillment", "Teaching"]},
    {"id": "mark", "title": "Mark", "category": "new-testament", "chapters": 16, "description": "The action-packed gospel — Jesus the Servant who came to give His life.", "era": "~55 CE", "themes": ["Service", "Suffering", "Discipleship"]},
    {"id": "luke", "title": "Luke", "category": "new-testament", "chapters": 24, "description": "Jesus the compassionate healer — for all people, especially the marginalized.", "era": "~60 CE", "themes": ["Compassion", "Universality", "Holy Spirit"]},
    {"id": "john", "title": "John", "category": "new-testament", "chapters": 21, "description": "Jesus as the divine Word made flesh — the most theological gospel.", "era": "~90 CE", "themes": ["Divinity", "Belief", "Eternal Life"]},
    {"id": "acts", "title": "Acts", "category": "new-testament", "chapters": 28, "description": "The birth and explosive growth of the early Christian church through the Holy Spirit.", "era": "~62 CE", "themes": ["Holy Spirit", "Mission", "Church Growth"]},
    {"id": "romans", "title": "Romans", "category": "new-testament", "chapters": 16, "description": "Paul's masterwork on salvation by faith — the gospel in its fullest theological expression.", "era": "~57 CE", "themes": ["Justification", "Grace", "Faith"]},
    {"id": "1-corinthians", "title": "1 Corinthians", "category": "new-testament", "chapters": 16, "description": "Practical wisdom for a divided church — love, spiritual gifts, and resurrection.", "era": "~55 CE", "themes": ["Love", "Unity", "Resurrection"]},
    {"id": "2-corinthians", "title": "2 Corinthians", "category": "new-testament", "chapters": 13, "description": "Strength in weakness — Paul's most personal and vulnerable letter.", "era": "~56 CE", "themes": ["Weakness", "Comfort", "Generosity"]},
    {"id": "galatians", "title": "Galatians", "category": "new-testament", "chapters": 6, "description": "Freedom in Christ — we are justified by faith, not by the law.", "era": "~49 CE", "themes": ["Freedom", "Grace", "Spirit"]},
    {"id": "ephesians", "title": "Ephesians", "category": "new-testament", "chapters": 6, "description": "The cosmic purpose of the church — unity, spiritual warfare, and God's eternal plan.", "era": "~60 CE", "themes": ["Unity", "Spiritual Warfare", "Purpose"]},
    {"id": "philippians", "title": "Philippians", "category": "new-testament", "chapters": 4, "description": "Joy in all circumstances — Paul's letter of encouragement from prison.", "era": "~61 CE", "themes": ["Joy", "Humility", "Contentment"]},
    {"id": "colossians", "title": "Colossians", "category": "new-testament", "chapters": 4, "description": "The supremacy of Christ over all creation and philosophy.", "era": "~60 CE", "themes": ["Supremacy of Christ", "Fullness", "New Life"]},
    {"id": "1-thessalonians", "title": "1 Thessalonians", "category": "new-testament", "chapters": 5, "description": "Encouragement about Christ's return and holy living.", "era": "~51 CE", "themes": ["Second Coming", "Holiness", "Comfort"]},
    {"id": "2-thessalonians", "title": "2 Thessalonians", "category": "new-testament", "chapters": 3, "description": "Clarity about the Day of the Lord and perseverance.", "era": "~51 CE", "themes": ["Perseverance", "Truth", "Work"]},
    {"id": "1-timothy", "title": "1 Timothy", "category": "new-testament", "chapters": 6, "description": "Pastoral guidance for church leadership and sound doctrine.", "era": "~64 CE", "themes": ["Leadership", "Sound Doctrine", "Godliness"]},
    {"id": "2-timothy", "title": "2 Timothy", "category": "new-testament", "chapters": 4, "description": "Paul's final letter — a charge to guard the faith.", "era": "~67 CE", "themes": ["Endurance", "Scripture", "Legacy"]},
    {"id": "titus", "title": "Titus", "category": "new-testament", "chapters": 3, "description": "Instructions for godly living and church order on the island of Crete.", "era": "~65 CE", "themes": ["Good Works", "Grace", "Order"]},
    {"id": "philemon", "title": "Philemon", "category": "new-testament", "chapters": 1, "description": "A personal letter about forgiveness and receiving a runaway slave as a brother.", "era": "~60 CE", "themes": ["Forgiveness", "Reconciliation", "Brotherhood"]},
    {"id": "hebrews", "title": "Hebrews", "category": "new-testament", "chapters": 13, "description": "Christ as the ultimate high priest — the new covenant surpasses the old.", "era": "~68 CE", "themes": ["High Priest", "Faith", "New Covenant"]},
    {"id": "james", "title": "James", "category": "new-testament", "chapters": 5, "description": "Faith without works is dead — practical wisdom for living out your beliefs.", "era": "~49 CE", "themes": ["Works", "Wisdom", "Perseverance"]},
    {"id": "1-peter", "title": "1 Peter", "category": "new-testament", "chapters": 5, "description": "Hope and resilience through suffering — living as strangers in the world.", "era": "~64 CE", "themes": ["Suffering", "Hope", "Holy Living"]},
    {"id": "2-peter", "title": "2 Peter", "category": "new-testament", "chapters": 3, "description": "Warning against false teachers and the promise of Christ's return.", "era": "~67 CE", "themes": ["Knowledge", "False Teachers", "Return"]},
    {"id": "1-john", "title": "1 John", "category": "new-testament", "chapters": 5, "description": "God is love — assurance of salvation and walking in the light.", "era": "~90 CE", "themes": ["Love", "Light", "Assurance"]},
    {"id": "2-john", "title": "2 John", "category": "new-testament", "chapters": 1, "description": "Walking in truth and love — a brief warning about deceivers.", "era": "~90 CE", "themes": ["Truth", "Love", "Discernment"]},
    {"id": "3-john", "title": "3 John", "category": "new-testament", "chapters": 1, "description": "A commendation of hospitality and faithful service.", "era": "~90 CE", "themes": ["Hospitality", "Truth", "Service"]},
    {"id": "jude", "title": "Jude", "category": "new-testament", "chapters": 1, "description": "Contend for the faith — a fierce warning against ungodly teachers.", "era": "~65 CE", "themes": ["Contending", "Warning", "Mercy"]},
    {"id": "revelation", "title": "Revelation", "category": "new-testament", "chapters": 22, "description": "The apocalyptic vision of John — the final triumph of God over evil and the new creation.", "era": "~95 CE", "themes": ["Apocalypse", "Victory", "New Creation"]},

    # ─── DEUTEROCANONICAL (7+ books) ───
    {"id": "tobit", "title": "Tobit", "category": "deuterocanonical", "chapters": 14, "description": "A tale of faith, family, and angelic intervention during the Assyrian exile.", "era": "~200 BCE", "themes": ["Faith", "Family", "Angels"]},
    {"id": "judith", "title": "Judith", "category": "deuterocanonical", "chapters": 16, "description": "A brave widow saves Israel by defeating the Assyrian general Holofernes.", "era": "~150 BCE", "themes": ["Courage", "Faith", "Deliverance"]},
    {"id": "wisdom-of-solomon", "title": "Wisdom of Solomon", "category": "deuterocanonical", "chapters": 19, "description": "A philosophical meditation on wisdom, righteousness, and immortality.", "era": "~50 BCE", "themes": ["Wisdom", "Immortality", "Justice"]},
    {"id": "sirach", "title": "Sirach (Ecclesiasticus)", "category": "deuterocanonical", "chapters": 51, "description": "Practical wisdom for daily life — one of the most quoted books in early Christianity.", "era": "~175 BCE", "themes": ["Wisdom", "Ethics", "Worship"]},
    {"id": "baruch", "title": "Baruch", "category": "deuterocanonical", "chapters": 6, "description": "Jeremiah's scribe writes of confession, wisdom, and hope during exile.", "era": "~200 BCE", "themes": ["Confession", "Hope", "Wisdom"]},
    {"id": "1-maccabees", "title": "1 Maccabees", "category": "deuterocanonical", "chapters": 16, "description": "The historical account of the Maccabean revolt and the rededication of the Temple (Hanukkah).", "era": "~100 BCE", "themes": ["Revolt", "Faith", "Dedication"]},
    {"id": "2-maccabees", "title": "2 Maccabees", "category": "deuterocanonical", "chapters": 15, "description": "A theological reflection on the Maccabean period — martyrdom, resurrection, and prayer for the dead.", "era": "~100 BCE", "themes": ["Martyrdom", "Resurrection", "Prayer"]},

    # ─── LOST & APOCRYPHAL BOOKS (15+ books) ───
    {"id": "book-of-enoch", "title": "Book of Enoch (1 Enoch)", "category": "lost-apocryphal", "chapters": 108, "description": "The most famous lost book — Enoch's visions of fallen angels (Watchers), the Nephilim, heavenly journeys, and the coming Messiah. Quoted in the Book of Jude.", "era": "~300 BCE", "themes": ["Angels", "Judgment", "Messiah", "Watchers"]},
    {"id": "gospel-of-thomas", "title": "Gospel of Thomas", "category": "lost-apocryphal", "chapters": 114, "description": "A collection of 114 sayings attributed to Jesus, discovered at Nag Hammadi. Some overlap with canonical gospels; many are uniquely mystical.", "era": "~50-140 CE", "themes": ["Gnosis", "Inner Kingdom", "Sayings"]},
    {"id": "gospel-of-mary", "title": "Gospel of Mary Magdalene", "category": "lost-apocryphal", "chapters": 8, "description": "Mary Magdalene as a spiritual leader receiving private teachings from Jesus about the soul's ascent.", "era": "~120 CE", "themes": ["Soul", "Feminine Wisdom", "Inner Vision"]},
    {"id": "gospel-of-philip", "title": "Gospel of Philip", "category": "lost-apocryphal", "chapters": 15, "description": "A Gnostic sacramental text discovered at Nag Hammadi — explores the bridal chamber, sacraments, and hidden truth.", "era": "~180 CE", "themes": ["Sacraments", "Gnosis", "Sacred Union"]},
    {"id": "gospel-of-judas", "title": "Gospel of Judas", "category": "lost-apocryphal", "chapters": 8, "description": "A radical retelling where Judas is Jesus' most trusted disciple, asked to betray him to release his spirit.", "era": "~150 CE", "themes": ["Betrayal", "Liberation", "Hidden Truth"]},
    {"id": "book-of-jubilees", "title": "Book of Jubilees", "category": "lost-apocryphal", "chapters": 50, "description": "A retelling of Genesis through Exodus divided into jubilee periods — with expanded angelic narratives.", "era": "~160 BCE", "themes": ["Sacred Calendar", "Angels", "Covenant"]},
    {"id": "shepherd-of-hermas", "title": "Shepherd of Hermas", "category": "lost-apocryphal", "chapters": 15, "description": "Visions, commandments, and parables given by an angel in shepherd form — nearly included in the New Testament canon.", "era": "~100 CE", "themes": ["Repentance", "Visions", "Ethics"]},
    {"id": "apocalypse-of-peter", "title": "Apocalypse of Peter", "category": "lost-apocryphal", "chapters": 10, "description": "Vivid visions of heaven and hell shown to Peter by Jesus — one of the earliest detailed afterlife descriptions.", "era": "~135 CE", "themes": ["Afterlife", "Judgment", "Visions"]},
    {"id": "gospel-of-barnabas", "title": "Gospel of Barnabas", "category": "lost-apocryphal", "chapters": 20, "description": "A controversial text claiming to be written by Barnabas — presents an alternative narrative of Jesus' ministry.", "era": "Disputed", "themes": ["Alternative Gospel", "Prophecy", "Controversy"]},
    {"id": "acts-of-thomas", "title": "Acts of Thomas", "category": "lost-apocryphal", "chapters": 14, "description": "The apostle Thomas' missionary journey to India — includes the famous 'Hymn of the Pearl' about the soul's origin.", "era": "~220 CE", "themes": ["Mission", "Hymn of Pearl", "Soul Journey"]},
    {"id": "book-of-adam-and-eve", "title": "Life of Adam and Eve", "category": "lost-apocryphal", "chapters": 12, "description": "An expanded narrative of Adam and Eve after their expulsion from Eden — their repentance, visions, and death.", "era": "~100 CE", "themes": ["Fall", "Repentance", "Mortality"]},
    {"id": "testament-of-solomon", "title": "Testament of Solomon", "category": "lost-apocryphal", "chapters": 10, "description": "King Solomon's account of commanding demons to build the Temple using a divine ring — a key text in esoteric tradition.", "era": "~100-300 CE", "themes": ["Demons", "Temple", "Divine Authority"]},
    {"id": "odes-of-solomon", "title": "Odes of Solomon", "category": "lost-apocryphal", "chapters": 42, "description": "42 early Christian hymns of mystical devotion — among the earliest Christian poetry outside the New Testament.", "era": "~100 CE", "themes": ["Mysticism", "Worship", "Joy"]},
    {"id": "epistle-of-barnabas", "title": "Epistle of Barnabas", "category": "lost-apocryphal", "chapters": 21, "description": "An early Christian letter interpreting the Old Testament through allegory — once considered for the canon.", "era": "~130 CE", "themes": ["Allegory", "Covenant", "Two Ways"]},
    {"id": "didache", "title": "The Didache", "category": "lost-apocryphal", "chapters": 16, "description": "The 'Teaching of the Twelve Apostles' — the earliest known Christian catechism on ethics, worship, and church order.", "era": "~70 CE", "themes": ["Ethics", "Baptism", "Eucharist", "Church Order"]},
    {"id": "infancy-gospel-thomas", "title": "Infancy Gospel of Thomas", "category": "lost-apocryphal", "chapters": 19, "description": "Stories of Jesus' childhood miracles from age 5 to 12 — raising the dead, animating clay birds, and astonishing teachers.", "era": "~150 CE", "themes": ["Childhood", "Miracles", "Wonder"]},
    {"id": "pistis-sophia", "title": "Pistis Sophia", "category": "lost-apocryphal", "chapters": 20, "description": "A Gnostic text of Jesus' post-resurrection teachings to his disciples about the fall and redemption of the divine feminine 'Pistis Sophia'.", "era": "~250 CE", "themes": ["Divine Feminine", "Redemption", "Gnosis"]},

    # ─── TORAH & TALMUD (12 texts) ───
    {"id": "pirke-avot", "title": "Pirke Avot (Ethics of the Fathers)", "category": "torah-talmud", "chapters": 6, "description": "The most widely studied tractate of the Mishnah — timeless ethical teachings and wisdom sayings of the great rabbis.", "era": "~200 CE", "themes": ["Ethics", "Wisdom", "Character"]},
    {"id": "mishnah-berachot", "title": "Mishnah Berachot (Blessings)", "category": "torah-talmud", "chapters": 9, "description": "Laws of prayer, blessings, and the Shema — the foundation of Jewish daily worship and gratitude.", "era": "~200 CE", "themes": ["Prayer", "Blessings", "Devotion"]},
    {"id": "mishnah-shabbat", "title": "Mishnah Shabbat", "category": "torah-talmud", "chapters": 24, "description": "The laws of the Sabbath — rest, holiness, and the sacred rhythm of creation and cessation.", "era": "~200 CE", "themes": ["Sabbath", "Rest", "Holiness"]},
    {"id": "talmud-sanhedrin", "title": "Talmud Sanhedrin", "category": "torah-talmud", "chapters": 11, "description": "The tractate on courts, justice, and capital law — includes 'He who saves one life saves the entire world.'", "era": "~500 CE", "themes": ["Justice", "Courts", "Life"]},
    {"id": "talmud-bava-metzia", "title": "Talmud Bava Metzia", "category": "torah-talmud", "chapters": 10, "description": "Civil law, lost property, labor relations — the ethics of commerce and interpersonal responsibility.", "era": "~500 CE", "themes": ["Commerce", "Ethics", "Responsibility"]},
    {"id": "midrash-rabbah-genesis", "title": "Midrash Rabbah (Genesis)", "category": "torah-talmud", "chapters": 12, "description": "Rabbinic commentary on Genesis — rich allegories, parables, and hidden meanings within creation.", "era": "~400 CE", "themes": ["Commentary", "Allegory", "Creation"]},
    {"id": "midrash-rabbah-exodus", "title": "Midrash Rabbah (Exodus)", "category": "torah-talmud", "chapters": 10, "description": "Midrashic explorations of the Exodus — liberation, revelation, and covenant.", "era": "~400 CE", "themes": ["Liberation", "Revelation", "Covenant"]},
    {"id": "talmud-berakhot", "title": "Talmud Berakhot", "category": "torah-talmud", "chapters": 9, "description": "The first tractate of the Babylonian Talmud — discussions on prayer, dreams, and divine encounter.", "era": "~500 CE", "themes": ["Prayer", "Dreams", "Divine Encounter"]},
    {"id": "mekhilta", "title": "Mekhilta de-Rabbi Ishmael", "category": "torah-talmud", "chapters": 8, "description": "Halakhic midrash on Exodus — legal and narrative interpretations of the giving of the Torah.", "era": "~300 CE", "themes": ["Law", "Passover", "Interpretation"]},
    {"id": "sifra", "title": "Sifra (Torat Kohanim)", "category": "torah-talmud", "chapters": 10, "description": "Halakhic midrash on Leviticus — the holiness code interpreted through rabbinic reasoning.", "era": "~300 CE", "themes": ["Holiness", "Law", "Priesthood"]},
    {"id": "tanya-book", "title": "Tanya", "category": "torah-talmud", "chapters": 53, "description": "Foundational text of Chabad Hasidism by Rabbi Schneur Zalman — the soul's journey and divine service.", "era": "1797 CE", "themes": ["Soul", "Divine Service", "Unity"]},
    {"id": "derech-hashem", "title": "Derech Hashem (The Way of God)", "category": "torah-talmud", "chapters": 8, "description": "Rabbi Luzzatto's systematic guide to God's purpose in creation, free will, prophecy, and the soul.", "era": "1736 CE", "themes": ["Purpose", "Free Will", "Prophecy"]},

    # ─── KABBALAH (10 texts) ───
    {"id": "zohar", "title": "The Zohar", "category": "kabbalah", "chapters": 25, "description": "The masterwork of Jewish mysticism — mystical commentary on the Torah revealing hidden dimensions of God, creation, and the human soul.", "era": "~1290 CE", "themes": ["Mysticism", "Sefirot", "Hidden Torah"]},
    {"id": "sefer-yetzirah", "title": "Sefer Yetzirah (Book of Formation)", "category": "kabbalah", "chapters": 6, "description": "The oldest kabbalistic text — how God created the universe through 10 Sefirot and 22 Hebrew letters.", "era": "~200 CE", "themes": ["Creation", "Letters", "Sefirot"]},
    {"id": "sefer-bahir", "title": "Sefer HaBahir (Book of Illumination)", "category": "kabbalah", "chapters": 12, "description": "Cryptic parables on divine light, the Sefirot, and the mystical structure of the soul.", "era": "~1100 CE", "themes": ["Light", "Parables", "Soul Structure"]},
    {"id": "etz-chaim", "title": "Etz Chaim (Tree of Life)", "category": "kabbalah", "chapters": 15, "description": "The Ari's revolutionary kabbalistic system — Tzimtzum, the shattering of vessels, and Tikkun Olam.", "era": "~1590 CE", "themes": ["Tzimtzum", "Tikkun", "Lurianic Kabbalah"]},
    {"id": "tikkunei-zohar", "title": "Tikkunei Zohar", "category": "kabbalah", "chapters": 70, "description": "70 mystical commentaries on the first word of Torah 'Bereishit' — each revealing a different dimension of divine reality.", "era": "~1290 CE", "themes": ["Bereishit", "70 Faces", "Mystical Torah"]},
    {"id": "sefer-raziel", "title": "Sefer Raziel HaMalakh", "category": "kabbalah", "chapters": 7, "description": "The Book of the Angel Raziel — angel names, mystical formulas, and cosmic secrets.", "era": "~1200 CE", "themes": ["Angels", "Mysteries", "Protection"]},
    {"id": "pardes-rimonim", "title": "Pardes Rimonim (Orchard of Pomegranates)", "category": "kabbalah", "chapters": 32, "description": "Rabbi Cordovero's encyclopedia of Kabbalah — mapping the Sefirot, divine names, and the architecture of all worlds.", "era": "1548 CE", "themes": ["Sefirot", "Systematic Kabbalah", "Divine Names"]},
    {"id": "shaarei-orah", "title": "Sha'arei Orah (Gates of Light)", "category": "kabbalah", "chapters": 10, "description": "Joseph Gikatilla's guide to the divine names of each Sefirah — a luminous map of prayer ascending through heavenly spheres.", "era": "~1290 CE", "themes": ["Divine Names", "Prayer", "Sefirot"]},
    {"id": "sefer-ha-temunah", "title": "Sefer HaTemunah", "category": "kabbalah", "chapters": 5, "description": "The Book of the Figure — cosmic cycles (Shemitot), the shapes of Hebrew letters, and seven cosmic sabbaticals.", "era": "~1250 CE", "themes": ["Cosmic Cycles", "Letters", "Sabbaticals"]},
    {"id": "nefesh-ha-chaim", "title": "Nefesh HaChaim", "category": "kabbalah", "chapters": 4, "description": "How human actions impact all spiritual worlds — the soul, prayer, Torah study, and cosmic responsibility.", "era": "1824 CE", "themes": ["Soul", "Prayer", "Spiritual Impact"]},

    # ─── THE QURAN (114 Surahs — grouped as composite texts for deeper exploration) ───
    {"id": "al-fatiha", "title": "Al-Fatiha (The Opening)", "category": "quran", "chapters": 1, "description": "The most recited prayer in Islam — a supplication for divine guidance on the straight path.", "era": "610 CE", "themes": ["Guidance", "Mercy", "Worship"]},
    {"id": "al-baqarah", "title": "Al-Baqarah (The Cow)", "category": "quran", "chapters": 40, "description": "The longest surah — comprehensive guidance on faith, law, stories of the prophets, and the nature of divine covenant.", "era": "624 CE", "themes": ["Law", "Faith", "Covenant"]},
    {"id": "al-imran", "title": "Al-Imran (Family of Imran)", "category": "quran", "chapters": 20, "description": "The family of Mary and Jesus in Islamic tradition — interfaith dialogue and steadfastness in faith.", "era": "625 CE", "themes": ["Jesus & Mary", "Patience", "Unity"]},
    {"id": "an-nisa", "title": "An-Nisa (The Women)", "category": "quran", "chapters": 24, "description": "Rights of women, orphans, and family law — justice, inheritance, and social ethics.", "era": "625 CE", "themes": ["Women's Rights", "Justice", "Family"]},
    {"id": "al-maidah", "title": "Al-Ma'idah (The Table Spread)", "category": "quran", "chapters": 16, "description": "Covenants, dietary laws, and the table from heaven — the completion of divine law.", "era": "631 CE", "themes": ["Covenant", "Law", "Interfaith"]},
    {"id": "al-anam", "title": "Al-An'am (The Cattle)", "category": "quran", "chapters": 20, "description": "The oneness of God, rejection of idolatry, and Abraham's journey to monotheism.", "era": "621 CE", "themes": ["Monotheism", "Abraham", "Creation"]},
    {"id": "al-araf", "title": "Al-A'raf (The Heights)", "category": "quran", "chapters": 24, "description": "The barrier between paradise and hellfire — stories of Adam, Noah, Moses.", "era": "620 CE", "themes": ["Judgment", "Prophets", "Consequences"]},
    {"id": "yusuf", "title": "Yusuf (Joseph)", "category": "quran", "chapters": 12, "description": "The 'most beautiful of stories' — Joseph's journey from betrayal to power, and the triumph of faith.", "era": "620 CE", "themes": ["Beauty", "Forgiveness", "Providence"]},
    {"id": "al-isra", "title": "Al-Isra (The Night Journey)", "category": "quran", "chapters": 12, "description": "Muhammad's miraculous night journey and ascension — ethical commandments and spiritual elevation.", "era": "621 CE", "themes": ["Night Journey", "Ascension", "Ethics"]},
    {"id": "al-kahf", "title": "Al-Kahf (The Cave)", "category": "quran", "chapters": 12, "description": "The sleepers of the cave, Moses and Khidr — four parables of faith, knowledge, wealth, and power.", "era": "618 CE", "themes": ["Faith", "Hidden Knowledge", "Humility"]},
    {"id": "maryam", "title": "Maryam (Mary)", "category": "quran", "chapters": 6, "description": "The miraculous birth of Jesus, Mary's devotion — divine mercy across generations.", "era": "615 CE", "themes": ["Mary", "Jesus", "Mercy"]},
    {"id": "ta-ha", "title": "Ta-Ha", "category": "quran", "chapters": 8, "description": "Moses in extraordinary detail — from the burning bush to Pharaoh's defeat, and Adam's repentance.", "era": "618 CE", "themes": ["Moses", "Revelation", "Repentance"]},
    {"id": "ya-sin", "title": "Ya-Sin (Heart of the Quran)", "category": "quran", "chapters": 5, "description": "Called the Heart of the Quran — resurrection, signs in nature, and a parable of the messengers.", "era": "618 CE", "themes": ["Heart", "Resurrection", "Signs"]},
    {"id": "ar-rahman", "title": "Ar-Rahman (The Most Merciful)", "category": "quran", "chapters": 4, "description": "The most lyrical surah — 'Which of your Lord's favors will you deny?' A hymn to divine mercy.", "era": "614 CE", "themes": ["Mercy", "Beauty", "Creation"]},
    {"id": "al-waqiah", "title": "Al-Waqi'ah (The Event)", "category": "quran", "chapters": 3, "description": "The three groups on Judgment Day — the forerunners, the right, and the left.", "era": "618 CE", "themes": ["Judgment", "Groups", "Destiny"]},
    {"id": "al-mulk", "title": "Al-Mulk (Sovereignty)", "category": "quran", "chapters": 3, "description": "The sovereignty of God — creation of death and life as a test, protection from the grave.", "era": "618 CE", "themes": ["Sovereignty", "Test", "Protection"]},
    {"id": "al-jinn", "title": "Al-Jinn (The Jinn)", "category": "quran", "chapters": 2, "description": "The jinn who heard the Quran and believed — the unseen world and the limits of knowledge.", "era": "619 CE", "themes": ["Jinn", "Unseen", "Belief"]},
    {"id": "al-muzzammil", "title": "Al-Muzzammil (The Enshrouded One)", "category": "quran", "chapters": 2, "description": "Rise at night for prayer — the night vigil, patience, and the sweetness of recitation.", "era": "610 CE", "themes": ["Night Prayer", "Solitude", "Recitation"]},
    {"id": "al-insan", "title": "Al-Insan (The Human)", "category": "quran", "chapters": 2, "description": "Was there not a time when human was nothing? — creation, free will, and the reward of gratitude.", "era": "614 CE", "themes": ["Creation", "Free Will", "Gratitude"]},
    {"id": "al-alaq", "title": "Al-Alaq (The Clot / First Revelation)", "category": "quran", "chapters": 1, "description": "Read! The first revelation to Muhammad — humanity created from a clot, the pen, and knowledge.", "era": "610 CE", "themes": ["First Revelation", "Reading", "Knowledge"]},
    {"id": "al-qadr", "title": "Al-Qadr (The Night of Power)", "category": "quran", "chapters": 1, "description": "The Night of Power is better than a thousand months — angels descend, peace until dawn.", "era": "614 CE", "themes": ["Night of Power", "Angels", "Peace"]},
    {"id": "al-ikhlas", "title": "Al-Ikhlas (Sincerity / Purity)", "category": "quran", "chapters": 1, "description": "Say: He is God, the One. Equal to one-third of the Quran — absolute monotheism distilled.", "era": "614 CE", "themes": ["Oneness", "Purity", "Monotheism"]},
    {"id": "al-hujurat", "title": "Al-Hujurat (The Chambers)", "category": "quran", "chapters": 3, "description": "Charter of Islamic social ethics — no racism, no backbiting, all humanity from one soul.", "era": "630 CE", "themes": ["Social Ethics", "Equality", "Brotherhood"]},
    {"id": "an-nas", "title": "An-Nas (Humankind)", "category": "quran", "chapters": 1, "description": "The final surah — seek refuge in the Lord of humankind from the whisperer among jinn and humans.", "era": "614 CE", "themes": ["Protection", "Humankind", "Refuge"]},
]


@router.get("/bible/categories")
async def get_bible_categories():
    for cat in BIBLE_CATEGORIES:
        cat["book_count"] = len([b for b in BIBLE_BOOKS if b["category"] == cat["id"]])
    return {"categories": BIBLE_CATEGORIES, "total_books": len(BIBLE_BOOKS)}


@router.get("/bible/books")
async def get_bible_books(category: str = Query(default=None)):
    books = BIBLE_BOOKS
    if category:
        books = [b for b in books if b["category"] == category]
    result = []
    for b in books:
        result.append({
            "id": b["id"],
            "title": b["title"],
            "category": b["category"],
            "chapters": b["chapters"],
            "description": b["description"],
            "era": b["era"],
            "themes": b["themes"],
        })
    return {"books": result, "total": len(result)}


@router.get("/bible/books/{book_id}")
async def get_bible_book(book_id: str):
    book = next((b for b in BIBLE_BOOKS if b["id"] == book_id), None)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    chapter_list = []
    for i in range(1, book["chapters"] + 1):
        ch_id = f"{book_id}-ch-{i}"
        generated = await db.bible_chapters.find_one(
            {"book_id": book_id, "chapter_num": i}, {"_id": 0, "content": 0}
        )
        chapter_list.append({
            "number": i,
            "id": ch_id,
            "generated": generated is not None,
            "title": generated.get("title") if generated else None,
        })

    return {
        **{k: v for k, v in book.items()},
        "chapter_list": chapter_list,
    }


@router.post("/bible/books/{book_id}/chapters/{chapter_num}/generate")
async def generate_bible_chapter(book_id: str, chapter_num: int, user=Depends(get_current_user)):
    book = next((b for b in BIBLE_BOOKS if b["id"] == book_id), None)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if chapter_num < 1 or chapter_num > book["chapters"]:
        raise HTTPException(status_code=400, detail="Invalid chapter number")

    existing = await db.bible_chapters.find_one(
        {"book_id": book_id, "chapter_num": chapter_num}, {"_id": 0}
    )
    if existing:
        return existing

    is_apocryphal = book["category"] == "lost-apocryphal"
    is_deutero = book["category"] == "deuterocanonical"
    is_torah = book["category"] == "torah-talmud"
    is_kabbalah = book["category"] == "kabbalah"
    is_quran = book["category"] == "quran"

    tradition_note = ""
    if is_apocryphal:
        tradition_note = "This is from the Lost/Apocryphal texts — present faithfully while noting its non-canonical status."
    elif is_deutero:
        tradition_note = "This is a Deuterocanonical text — present with the same reverence as canonical scripture."
    elif is_torah:
        tradition_note = "This is from the Jewish oral tradition (Talmud/Mishnah/Midrash). Present with deep respect for rabbinic discourse, including multiple perspectives of the sages where relevant."
    elif is_kabbalah:
        tradition_note = "This is a Kabbalistic text from the Jewish mystical tradition. Present with reverence for the esoteric symbolism, the Sefirot, and the hidden dimensions of Torah."
    elif is_quran:
        tradition_note = "This is a Surah from the Holy Quran. Present with deep reverence for Islamic scripture. Use 'peace be upon him' after prophets' names. Include the Arabic transliteration of key phrases where meaningful."

    system_msg = f"""You are a scholar of world sacred texts and spiritual narrator for The ENLIGHTEN.MINT.CAFE, a spiritual wellness platform.

You are generating content for Chapter/Section {chapter_num} of {book['title']}.
{tradition_note}

Provide three sections:

1. RETELLING: A rich, immersive 4-6 paragraph retelling of this chapter in beautiful modern English. Preserve the spiritual depth and key themes. Make it engaging and vivid.

2. KEY_VERSES: 3-5 of the most important or memorable verses/passages from this chapter, formatted as quotes with verse numbers where applicable.

3. COMMENTARY: 2-3 paragraphs of scholarly and spiritual commentary — historical context, theological significance, and how this teaching applies to spiritual seekers today.

Write with reverence, beauty, and depth. Return the text in the format specified."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"bible-{book_id}-{chapter_num}",
            system_message=system_msg,
        )
        chat.with_model("openai", "gpt-4o")
        result = await asyncio.wait_for(
            chat.send_message(UserMessage(text=f"Generate the full content for {book['title']} Chapter {chapter_num}.")),
            timeout=30,
        )
        response_text = result.strip() if isinstance(result, str) else str(result)

        retelling = ""
        key_verses = ""
        commentary = ""
        current = "retelling"

        lines = response_text.split("\n")
        buffer = []

        for line in lines:
            stripped = line.strip()
            upper = stripped.upper().replace("#", "").strip()

            if upper.startswith("RETELLING"):
                if buffer and current:
                    text = "\n".join(buffer).strip()
                    if current == "retelling":
                        retelling = text
                    elif current == "key_verses":
                        key_verses = text
                    elif current == "commentary":
                        commentary = text
                buffer = []
                current = "retelling"
                remainder = stripped.split(":", 1)[-1].strip() if ":" in stripped else ""
                if remainder:
                    buffer.append(remainder)
                continue
            elif upper.startswith("KEY") and ("VERSE" in upper or "PASSAGE" in upper):
                if buffer and current:
                    text = "\n".join(buffer).strip()
                    if current == "retelling":
                        retelling = text
                    elif current == "key_verses":
                        key_verses = text
                    elif current == "commentary":
                        commentary = text
                buffer = []
                current = "key_verses"
                remainder = stripped.split(":", 1)[-1].strip() if ":" in stripped else ""
                if remainder:
                    buffer.append(remainder)
                continue
            elif upper.startswith("COMMENTARY") or upper.startswith("SCHOLARLY"):
                if buffer and current:
                    text = "\n".join(buffer).strip()
                    if current == "retelling":
                        retelling = text
                    elif current == "key_verses":
                        key_verses = text
                    elif current == "commentary":
                        commentary = text
                buffer = []
                current = "commentary"
                remainder = stripped.split(":", 1)[-1].strip() if ":" in stripped else ""
                if remainder:
                    buffer.append(remainder)
                continue

            # Skip top-level title lines like "# Genesis Chapter 1..."
            if stripped.startswith("#") and not stripped.startswith("##"):
                if "chapter" in stripped.lower() or "genesis" in stripped.lower() or "offering" in stripped.lower():
                    continue

            buffer.append(line)

        # Flush final buffer
        if buffer and current:
            text = "\n".join(buffer).strip()
            if current == "retelling":
                retelling = text
            elif current == "key_verses":
                key_verses = text
            elif current == "commentary":
                commentary = text

        doc = {
            "book_id": book_id,
            "chapter_num": chapter_num,
            "title": f"{book['title']} — Chapter {chapter_num}",
            "retelling": retelling.strip(),
            "key_verses": key_verses.strip(),
            "commentary": commentary.strip(),
            "book_title": book["title"],
            "category": book["category"],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.bible_chapters.insert_one({**doc, "user_id": user["id"]})
        return {k: v for k, v in doc.items() if k != "_id"}

    except Exception as e:
        logger.error(f"Bible chapter generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate chapter content")


@router.post("/bible/ask")
async def bible_ai_question(data: dict = Body(...), user=Depends(get_current_user)):
    """AI deep-dive — ask any question about a Bible passage or topic."""
    question = data.get("question", "")
    context_book = data.get("book_title", "")
    context_chapter = data.get("chapter_num", "")
    context_text = data.get("context_text", "")

    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    system_msg = (
        "You are a wise scholar of world sacred texts, theologian, and spiritual guide in The ENLIGHTEN.MINT.CAFE. "
        "You have deep knowledge of the Bible (all canons), Torah, Talmud, Midrash, Kabbalah, and the Quran. "
        "Answer questions with depth, scholarship, and compassion. Reference specific verses and historical context. "
        "Be interfaith-respectful and deeply knowledgeable about all Abrahamic traditions. "
        "Keep answers focused and 2-4 paragraphs."
    )

    prompt_parts = [f"Question: {question}"]
    if context_book:
        prompt_parts.append(f"Context: Currently reading {context_book}" + (f" Chapter {context_chapter}" if context_chapter else ""))
    if context_text:
        prompt_parts.append(f"Relevant passage: {context_text[:500]}")

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"bible-ask-{user['id'][:8]}",
            system_message=system_msg,
        )
        chat.with_model("openai", "gpt-4o")
        answer = await asyncio.wait_for(
            chat.send_message(UserMessage(text="\n".join(prompt_parts))),
            timeout=25,
        )
        answer_text = answer.strip() if isinstance(answer, str) else str(answer)
        return {"answer": answer_text, "question": question}
    except Exception as e:
        logger.error(f"Bible AI question error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate answer")


@router.get("/bible/bookmarks")
async def get_bookmarks(user=Depends(get_current_user)):
    bookmarks = await db.bible_bookmarks.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"bookmarks": bookmarks}


@router.post("/bible/bookmarks")
async def add_bookmark(data: dict = Body(...), user=Depends(get_current_user)):
    bookmark = {
        "user_id": user["id"],
        "book_id": data.get("book_id"),
        "book_title": data.get("book_title"),
        "chapter_num": data.get("chapter_num"),
        "note": data.get("note", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bible_bookmarks.insert_one(bookmark)
    del bookmark["_id"]
    return bookmark


@router.delete("/bible/bookmarks/{book_id}/{chapter_num}")
async def remove_bookmark(book_id: str, chapter_num: int, user=Depends(get_current_user)):
    await db.bible_bookmarks.delete_one({
        "user_id": user["id"], "book_id": book_id, "chapter_num": chapter_num
    })
    return {"deleted": True}
