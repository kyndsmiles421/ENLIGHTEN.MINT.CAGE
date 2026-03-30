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

    system_msg = f"""You are a biblical scholar and sacred text narrator for The Cosmic Collective, a spiritual wellness platform.

You are generating content for Chapter {chapter_num} of {book['title']}.
{"This is from the Lost/Apocryphal texts — present the content faithfully while noting its non-canonical status." if is_apocryphal else ""}
{"This is a Deuterocanonical text — present with the same reverence as canonical scripture." if is_deutero else ""}

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
        "You are a wise biblical scholar, theologian, and spiritual guide in The Cosmic Collective. "
        "Answer questions about the Bible, its lost books, and related spiritual topics with depth, "
        "scholarship, and compassion. Reference specific verses and historical context. "
        "Be interfaith-respectful while deeply knowledgeable about Christian scripture. "
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
