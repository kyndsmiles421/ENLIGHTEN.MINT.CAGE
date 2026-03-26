from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
import math, random

# ========== SACRED CARDOLOGY ==========

CARD_SUITS = {"H": "Hearts", "C": "Clubs", "D": "Diamonds", "S": "Spades"}
CARD_VALUES = {1: "Ace", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "Jack", 12: "Queen", 13: "King"}
SUIT_ELEMENTS = {"H": "Water", "C": "Fire", "D": "Earth", "S": "Air"}
SUIT_THEMES = {
    "H": {"theme": "Love & Relationships", "color": "#FDA4AF", "desc": "Hearts govern emotions, love, family, and the inner world of feelings."},
    "C": {"theme": "Knowledge & Communication", "color": "#22C55E", "desc": "Clubs rule the mind — ideas, learning, communication, and creative expression."},
    "D": {"theme": "Values & Resources", "color": "#FCD34D", "desc": "Diamonds relate to material values, finances, health, and self-worth."},
    "S": {"theme": "Wisdom & Transformation", "color": "#93C5FD", "desc": "Spades represent life's deeper lessons — wisdom through challenge and spiritual growth."},
}
CARD_MEANINGS = {
    "AH": {"title": "Ace of Hearts", "keyword": "The Desire for Love", "desc": "You are driven by deep emotional connections. Your life path centers around love — giving it, receiving it, and understanding it at its highest form.", "love": "You love deeply and seek a soulmate connection. Relationships are your greatest teacher.", "life": "Creativity, compassion, and emotional intelligence guide your journey."},
    "2H": {"title": "Two of Hearts", "keyword": "The Union", "desc": "Partnership is your birthright. You thrive in connection and are a natural peacemaker.", "love": "You are destined for deep, balanced partnerships. Trust the bonds that form naturally.", "life": "Cooperation and diplomacy are your superpowers."},
    "3H": {"title": "Three of Hearts", "keyword": "Creative Love", "desc": "Artistic expression and emotional variety define your path. You spread joy through creative gifts.", "love": "You need creative stimulation in relationships. Variety and depth both call to you.", "life": "Self-expression and social connections fuel your growth."},
    "4H": {"title": "Four of Hearts", "keyword": "Stability in Love", "desc": "You seek security in emotional bonds. Family and home are sacred to you.", "love": "Loyalty and commitment are your foundation. You build love that lasts.", "life": "Creating safe, nurturing spaces is your gift to the world."},
    "5H": {"title": "Five of Hearts", "keyword": "Emotional Change", "desc": "Your path involves transforming through emotional experiences. Each change deepens your wisdom.", "love": "Growth through relationship lessons. Each love teaches you something profound.", "life": "Adaptability and emotional courage define your journey."},
    "6H": {"title": "Six of Hearts", "keyword": "The Peacemaker", "desc": "Harmony and responsibility in love. You carry karmic duties toward family and close ones.", "love": "You bring peace and healing to your relationships. Past-life connections are common.", "life": "Service through love. You heal others by being present."},
    "7H": {"title": "Seven of Hearts", "keyword": "Spiritual Love", "desc": "You are learning to love unconditionally. Your path transcends personal attachment.", "love": "Idealistic in love — seeking the divine in every connection.", "life": "Spiritual growth through emotional mastery."},
    "8H": {"title": "Eight of Hearts", "keyword": "Power of the Heart", "desc": "Emotional power and magnetic charm. You influence others through the depth of your feeling.", "love": "Intense, transformative love experiences. You love with your whole being.", "life": "Leadership through emotional intelligence and authenticity."},
    "9H": {"title": "Nine of Hearts", "keyword": "Universal Love", "desc": "The wish card. You carry the energy of compassion for all beings.", "love": "Your love extends beyond personal — you love humanity itself.", "life": "Philanthropy, healing arts, and emotional wisdom."},
    "10H": {"title": "Ten of Hearts", "keyword": "Success in Love", "desc": "Group happiness and social fulfillment. You succeed when surrounded by community.", "love": "Your love life flourishes in social settings. Friendships become family.", "life": "Public success, popularity, and community leadership."},
    "JH": {"title": "Jack of Hearts", "keyword": "The Sacrificial Love", "desc": "Youthful heart energy. You inspire others through romantic idealism and creative passion.", "love": "A romantic at heart — always seeking the beautiful and poetic in love.", "life": "Creative pursuits and emotional adventures drive your growth."},
    "QH": {"title": "Queen of Hearts", "keyword": "The Loving Mother", "desc": "Nurturing power and emotional mastery. You are the heart of every circle you enter.", "love": "Devoted, warm, and deeply caring. Your love is a sanctuary.", "life": "Healing, teaching, and nurturing are your calling."},
    "KH": {"title": "King of Hearts", "keyword": "The Benevolent Ruler", "desc": "Mastery of the emotional realm. You lead with compassion and wisdom.", "love": "Generous and wise in love. You set the standard for how love should be.", "life": "Authority earned through kindness and emotional depth."},
    "AC": {"title": "Ace of Clubs", "keyword": "The Desire for Knowledge", "desc": "Insatiable curiosity drives you. Your mind is your greatest asset.", "love": "Mental connection is essential. You fall in love with minds first.", "life": "Lifelong learning, teaching, and intellectual exploration."},
    "2C": {"title": "Two of Clubs", "keyword": "The Conversation", "desc": "You thrive through dialogue and intellectual partnership.", "love": "Deep conversations create your deepest bonds.", "life": "Communication, writing, and cooperative thinking."},
    "3C": {"title": "Three of Clubs", "keyword": "Creative Worry", "desc": "A brilliant creative mind that sometimes overthinks. Channel anxiety into art.", "love": "You need intellectual stimulation and variety in partnerships.", "life": "Writing, speaking, and creative problem-solving."},
    "4C": {"title": "Four of Clubs", "keyword": "Mental Foundation", "desc": "Structured thinking and solid knowledge base. You build systems of understanding.", "love": "Stability and intellectual compatibility are paramount.", "life": "Organization, teaching, and systematic knowledge."},
    "5C": {"title": "Five of Clubs", "keyword": "Mental Restlessness", "desc": "A versatile mind that craves new ideas and experiences.", "love": "You need freedom and intellectual adventure in love.", "life": "Travel, change, and diverse learning experiences."},
    "6C": {"title": "Six of Clubs", "keyword": "The Intuitive Mind", "desc": "Strong intuition combined with analytical ability. You know things before you learn them.", "love": "Psychic connections with partners. Trust your gut about people.", "life": "Intuitive decision-making and karmic knowledge."},
    "7C": {"title": "Seven of Clubs", "keyword": "Spiritual Knowledge", "desc": "Seeker of higher truth. You question everything until you find the spiritual core.", "love": "You seek partners who share your quest for deeper meaning.", "life": "Philosophy, spirituality, and metaphysical studies."},
    "8C": {"title": "Eight of Clubs", "keyword": "Mental Power", "desc": "Powerful mind, strong will. You can manifest through focused thought.", "love": "Intellectual equals attract you. Power dynamics must be balanced.", "life": "Business acumen, strategic thinking, and mental fortitude."},
    "9C": {"title": "Nine of Clubs", "keyword": "Universal Knowledge", "desc": "Vast understanding and wisdom. You are a natural teacher and philosopher.", "love": "You attract those who seek your wisdom and guidance.", "life": "Teaching, publishing, and spreading knowledge globally."},
    "10C": {"title": "Ten of Clubs", "keyword": "Success of the Mind", "desc": "Mental achievement and group learning. Your ideas reach many.", "love": "Social intelligence strengthens your bonds.", "life": "Public speaking, education, and thought leadership."},
    "JC": {"title": "Jack of Clubs", "keyword": "The Quick Mind", "desc": "Youthful intellect and clever communication. Always learning, always curious.", "love": "Witty, playful, and intellectually stimulating in relationships.", "life": "Innovation, entrepreneurship, and creative ideas."},
    "QC": {"title": "Queen of Clubs", "keyword": "The Intuitive Organizer", "desc": "Combining intuition with mental clarity. You see patterns others miss.", "love": "Perceptive and nurturing through understanding.", "life": "Organization, intuition-based leadership, service."},
    "KC": {"title": "King of Clubs", "keyword": "The Master Communicator", "desc": "Authority in knowledge and communication. Your words carry weight.", "love": "You lead in love through wisdom and clear expression.", "life": "Mastery of communication, teaching, and mental pursuits."},
    "AD": {"title": "Ace of Diamonds", "keyword": "The Desire for Wealth", "desc": "Driven by material security and self-worth. You create value wherever you go.", "love": "Generosity and shared resources strengthen your bonds.", "life": "Entrepreneurship, finance, and creating abundance."},
    "2D": {"title": "Two of Diamonds", "keyword": "Business Partnerships", "desc": "You excel in financial cooperation and fair exchanges.", "love": "Material compatibility matters — shared goals and values.", "life": "Deals, negotiations, and cooperative ventures."},
    "3D": {"title": "Three of Diamonds", "keyword": "Financial Creativity", "desc": "Creative approaches to money and value. Multiple income streams.", "love": "You express love through thoughtful generosity.", "life": "Diverse talents, multiple projects, creative finance."},
    "4D": {"title": "Four of Diamonds", "keyword": "Financial Stability", "desc": "Security-oriented. You build solid financial foundations.", "love": "Practical and dependable in relationships.", "life": "Real estate, savings, and long-term planning."},
    "5D": {"title": "Five of Diamonds", "keyword": "Financial Change", "desc": "Value shifts define your journey. Learning the true meaning of wealth.", "love": "Growth through changing values. Flexibility in giving and receiving.", "life": "Business pivots, travel, and evolving self-worth."},
    "6D": {"title": "Six of Diamonds", "keyword": "Karmic Debts", "desc": "Settling accounts — financial and spiritual. Fairness is your compass.", "love": "Past-life connections around shared resources.", "life": "Responsibility, fair dealings, and karmic balance."},
    "7D": {"title": "Seven of Diamonds", "keyword": "Spiritual Values", "desc": "Questioning material values to find spiritual wealth.", "love": "Seeking partners who value depth over surface.", "life": "Philanthropy, spiritual economics, and inner riches."},
    "8D": {"title": "Eight of Diamonds", "keyword": "Material Power", "desc": "Business mastery and financial authority. You understand the flow of value.", "love": "Power couples — building empires together.", "life": "Large-scale business, investments, and influence."},
    "9D": {"title": "Nine of Diamonds", "keyword": "Universal Values", "desc": "Philanthropic and generous. Your wealth serves the greater good.", "love": "Love through service and shared abundance.", "life": "Charity, global business, and values-driven leadership."},
    "10D": {"title": "Ten of Diamonds", "keyword": "Blessed Fortune", "desc": "Material success in groups and public settings.", "love": "Social status and shared success strengthen bonds.", "life": "Public wealth, community prosperity, group abundance."},
    "JD": {"title": "Jack of Diamonds", "keyword": "The Salesperson", "desc": "Youthful energy in commerce. Persuasive and quick to spot opportunity.", "love": "Charming and generous. Values grow through relationships.", "life": "Sales, marketing, and entrepreneurial ventures."},
    "QD": {"title": "Queen of Diamonds", "keyword": "The Philanthropist", "desc": "Financial wisdom combined with generosity. You manage resources for the good of all.", "love": "Giving and nurturing through practical support.", "life": "Financial planning, charity, and resource management."},
    "KD": {"title": "King of Diamonds", "keyword": "The Business Master", "desc": "Supreme authority in material matters. Your business sense is legendary.", "love": "Provider and protector through material abundance.", "life": "Empire building, mastery of finance, and leadership."},
    "AS": {"title": "Ace of Spades", "keyword": "The Card of Transformation", "desc": "The most powerful card in the deck. Deep transformation and spiritual awakening.", "love": "Intense, karmic love connections. Nothing shallow satisfies you.", "life": "Profound spiritual journey, death and rebirth cycles."},
    "2S": {"title": "Two of Spades", "keyword": "The Partnership of Work", "desc": "Collaborative labor and shared effort build your character.", "love": "Working together strengthens your deepest bonds.", "life": "Business partnerships, cooperative projects, shared labor."},
    "3S": {"title": "Three of Spades", "keyword": "Creative Indecision", "desc": "Too many choices can paralyze. Learning to commit strengthens your path.", "love": "Exploring many options before finding the right one.", "life": "Creative work, varied interests, eventual mastery."},
    "4S": {"title": "Four of Spades", "keyword": "Satisfaction Through Work", "desc": "Hard work brings deep satisfaction. You find peace through accomplishment.", "love": "Building together, sweating side by side, creates the strongest bonds.", "life": "Discipline, craftsmanship, and earned accomplishment."},
    "5S": {"title": "Five of Spades", "keyword": "Travel and Change", "desc": "Movement and transformation through action. You learn by doing.", "love": "Adventurous love — growing through shared challenges.", "life": "Travel, health transformations, and active growth."},
    "6S": {"title": "Six of Spades", "keyword": "Karmic Responsibility", "desc": "Past-life duties define much of your current work. Fulfillment comes through service.", "love": "Deep karmic ties with partners — old souls reuniting.", "life": "Duty, service, and settling spiritual accounts."},
    "7S": {"title": "Seven of Spades", "keyword": "Spiritual Initiation", "desc": "One of the most spiritual cards. You are here to awaken.", "love": "Transcendent love — beyond the physical into the spiritual.", "life": "Mystic, healer, and spiritual teacher."},
    "8S": {"title": "Eight of Spades", "keyword": "Power Through Work", "desc": "Tremendous work ethic and transformative power. You reshape reality.", "love": "Intense partnerships that transform both people.", "life": "Healing professions, psychology, and organizational power."},
    "9S": {"title": "Nine of Spades", "keyword": "Universal Completion", "desc": "Endings and completions. You help others let go and move forward.", "love": "Deep letting go — releasing what no longer serves love.", "life": "Counseling, end-of-life work, and transformation services."},
    "10S": {"title": "Ten of Spades", "keyword": "Group Transformation", "desc": "Working with groups toward collective evolution.", "love": "Social activism and community transformation through love.", "life": "Public service, group leadership, and mass healing."},
    "JS": {"title": "Jack of Spades", "keyword": "The Spiritual Actor", "desc": "Youthful spiritual energy. Learning through experience and exploration.", "love": "Playful yet deep — always seeking the meaning beneath the surface.", "life": "Acting, psychology, and spiritual exploration."},
    "QS": {"title": "Queen of Spades", "keyword": "The Mystic Queen", "desc": "Deep feminine wisdom and organizational mastery. You see through illusion.", "love": "Perceptive and transformative in relationships.", "life": "Mastery of inner work, therapy, and organizational healing."},
    "KS": {"title": "King of Spades", "keyword": "The Master of Wisdom", "desc": "The most accomplished card. Mastery through lifetimes of experience.", "love": "Wise, patient, and supremely self-aware in love.", "life": "Ultimate authority, wisdom traditions, and legacy."},
    "JK": {"title": "The Joker", "keyword": "The Wild Card", "desc": "Born outside the system. You follow no predetermined path — you create your own.", "love": "Unpredictable and free-spirited. Love must be unconventional.", "life": "Innovation, disruption, and complete creative freedom."},
}

# Birthday-to-card mapping: Robert Lee Camp's Magi Formula
# Solar Value = 55 - (2 * month + day)
# SV 0 = Joker, SV 1-13 = Hearts, SV 14-26 = Clubs, SV 27-39 = Diamonds, SV 40-52 = Spades

SOLAR_VALUE_SUITS = [(1, 13, "H"), (14, 26, "C"), (27, 39, "D"), (40, 52, "S")]

PLANETARY_RULERS = {
    1: {"planet": "Mercury", "meaning": "Communication, wit, and versatility", "color": "#22C55E"},
    2: {"planet": "Moon", "meaning": "Emotions, intuition, and the subconscious", "color": "#E2E8F0"},
    3: {"planet": "Venus", "meaning": "Love, beauty, and harmony", "color": "#FDA4AF"},
    4: {"planet": "Mars", "meaning": "Action, courage, and determination", "color": "#EF4444"},
    5: {"planet": "Jupiter", "meaning": "Expansion, wisdom, and abundance", "color": "#8B5CF6"},
    6: {"planet": "Saturn", "meaning": "Discipline, karma, and life lessons", "color": "#6B7280"},
    7: {"planet": "Uranus", "meaning": "Innovation, freedom, and spiritual awakening", "color": "#06B6D4"},
    8: {"planet": "Neptune", "meaning": "Spirituality, dreams, and mysticism", "color": "#93C5FD"},
    9: {"planet": "Mars", "meaning": "Completion, universal love, and release", "color": "#EF4444"},
    10: {"planet": "Pluto", "meaning": "Transformation, power, and rebirth", "color": "#7C3AED"},
    11: {"planet": "Mercury", "meaning": "Quick thinking, youthful creative energy", "color": "#22C55E"},
    12: {"planet": "Venus", "meaning": "Receptive power, nurturing wisdom", "color": "#FDA4AF"},
    13: {"planet": "Sun", "meaning": "Mastery, authority, and leadership", "color": "#FCD34D"},
}

def get_birth_card(month: int, day: int):
    solar_value = 55 - (2 * month + day)
    if solar_value <= 0:
        return "JK"
    if solar_value > 52:
        return "JK"
    for lo, hi, suit in SOLAR_VALUE_SUITS:
        if lo <= solar_value <= hi:
            val = solar_value - lo + 1
            val_codes = {1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K"}
            return val_codes[val] + suit
    return "JK"

def get_card_details(code):
    info = CARD_MEANINGS.get(code, CARD_MEANINGS.get("JK"))
    # Handle Joker case explicitly
    if code == "JK":
        return {
            "code": code,
            "suit": "Joker",
            "value": "Joker",
            "element": "Spirit",
            "suit_theme": SUIT_THEMES.get("H"),  # Default theme for Joker
            "planet": {"planet": "All Planets", "meaning": "The wild card transcends all planetary influences", "color": "#D8B4FE"},
            **info,
        }
    suit_code = code[-1] if len(code) <= 3 else code[-1]
    val_str = code[:-1]
    val_map = {"A": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13}
    val = val_map.get(val_str, 0)
    suit_info = SUIT_THEMES.get(suit_code, SUIT_THEMES["H"])
    planet = PLANETARY_RULERS.get(val, PLANETARY_RULERS[1])
    return {
        "code": code,
        "suit": CARD_SUITS.get(suit_code, "Joker"),
        "value": CARD_VALUES.get(val, "Joker"),
        "element": SUIT_ELEMENTS.get(suit_code, "Spirit"),
        "suit_theme": suit_info,
        "planet": planet,
        **info,
    }


@router.get("/cardology/birth-card")
async def get_birth_card_reading(month: int, day: int):
    if month < 1 or month > 12 or day < 1 or day > 31:
        raise HTTPException(status_code=400, detail="Invalid date")
    code = get_birth_card(month, day)
    details = get_card_details(code)
    solar_value = 55 - (2 * month + day)
    details["solar_value"] = solar_value
    details["magi_formula"] = f"55 - (2 x {month} + {day}) = {solar_value}"
    return {"card": details}


@router.get("/cardology/compatibility")
async def get_compatibility(month1: int, day1: int, month2: int, day2: int):
    code1 = get_birth_card(month1, day1)
    code2 = get_birth_card(month2, day2)
    card1 = get_card_details(code1)
    card2 = get_card_details(code2)

    # Compatibility scoring
    score = 50
    if card1["suit"] == card2["suit"]:
        score += 20  # Same suit = strong connection
    if card1["element"] == card2["element"]:
        score += 15
    # Hearts + Diamonds = complementary, Clubs + Spades = complementary
    comp_pairs = {("H", "D"), ("D", "H"), ("C", "S"), ("S", "C")}
    s1, s2 = code1[-1], code2[-1]
    if (s1, s2) in comp_pairs:
        score += 10
    # Same value = mirror connection
    if code1[:-1] == code2[:-1]:
        score += 15
    score = min(100, score)

    messages = []
    if score >= 80:
        messages.append("A deeply karmic and harmonious connection. You share soul-level resonance.")
    elif score >= 60:
        messages.append("Strong natural compatibility. Your energies complement and support each other.")
    else:
        messages.append("An opportunity for growth. Your differences create dynamic tension that catalyzes evolution.")

    if card1["suit"] == card2["suit"]:
        messages.append(f"Both {card1['suit']} — you speak the same emotional language.")
    if card1["element"] == card2["element"]:
        messages.append(f"Shared {card1['element']} element creates natural understanding.")

    return {
        "person1": card1,
        "person2": card2,
        "score": score,
        "messages": messages,
    }


@router.get("/cardology/daily-card")
async def get_daily_card(user=Depends(get_current_user_optional)):
    from datetime import date
    today = date.today()
    seed = (today.year * 1000 + today.timetuple().tm_yday)
    rng = random.Random(seed)
    month = rng.randint(1, 12)
    day = rng.randint(1, 28)
    code = get_birth_card(month, day)
    details = get_card_details(code)
    details["date"] = today.isoformat()
    return {"card": details}


PLANETARY_PERIODS = [
    {"planet": "Mercury", "meaning": "Communication, learning, short trips, mental activity, new information", "color": "#22C55E", "focus": "Mind & Communication"},
    {"planet": "Venus", "meaning": "Love, relationships, beauty, art, social connections, money", "color": "#FDA4AF", "focus": "Love & Beauty"},
    {"planet": "Mars", "meaning": "Action, ambition, competition, physical energy, courage, conflict", "color": "#EF4444", "focus": "Action & Drive"},
    {"planet": "Jupiter", "meaning": "Expansion, abundance, luck, travel, higher learning, wisdom", "color": "#8B5CF6", "focus": "Growth & Abundance"},
    {"planet": "Saturn", "meaning": "Discipline, karma, life lessons, health, structure, endings", "color": "#6B7280", "focus": "Lessons & Structure"},
    {"planet": "Uranus", "meaning": "Sudden changes, psychic development, liberation, surprises, real estate", "color": "#06B6D4", "focus": "Change & Liberation"},
    {"planet": "Neptune", "meaning": "Spirituality, travel by water, dreams, secrets, institutions, hidden influences", "color": "#93C5FD", "focus": "Spirit & Mystery"},
]

# All 52 cards + Joker in the Grand Solar Spread natural order
GRAND_SOLAR_ORDER = [
    "AH","2H","3H","4H","5H","6H","7H","8H","9H","10H","JH","QH","KH",
    "AC","2C","3C","4C","5C","6C","7C","8C","9C","10C","JC","QC","KC",
    "AD","2D","3D","4D","5D","6D","7D","8D","9D","10D","JD","QD","KD",
    "AS","2S","3S","4S","5S","6S","7S","8S","9S","10S","JS","QS","KS",
]

def get_yearly_spread(birth_month, birth_day, birth_year):
    from datetime import date
    today = date.today()
    birth_card = get_birth_card(birth_month, birth_day)
    age = today.year - birth_year
    if (today.month, today.day) < (birth_month, birth_day):
        age -= 1
    card_year = max(0, age)

    birth_sv = 55 - (2 * birth_month + birth_day)
    if birth_card in GRAND_SOLAR_ORDER:
        birth_pos = GRAND_SOLAR_ORDER.index(birth_card)
    else:
        birth_pos = 0

    periods = []
    birthday_this_year = date(today.year, birth_month, min(birth_day, 28))
    if birthday_this_year > today:
        birthday_this_year = date(today.year - 1, birth_month, min(birth_day, 28))

    for i, pp in enumerate(PLANETARY_PERIODS):
        offset = (birth_pos + card_year * 7 + i * 3 + birth_sv) % 52
        period_card_code = GRAND_SOLAR_ORDER[offset]
        period_card = get_card_details(period_card_code)

        from datetime import timedelta
        period_start = birthday_this_year + timedelta(days=i * 52)
        period_end = period_start + timedelta(days=51)

        is_current = period_start <= today <= period_end

        periods.append({
            "period_number": i + 1,
            "planet": pp["planet"],
            "planet_meaning": pp["meaning"],
            "planet_color": pp["color"],
            "focus": pp["focus"],
            "card": period_card,
            "start_date": period_start.isoformat(),
            "end_date": period_end.isoformat(),
            "is_current": is_current,
        })

    current_period = next((p for p in periods if p["is_current"]), periods[0])

    return {
        "birth_card": get_card_details(birth_card),
        "age": card_year,
        "card_year": card_year + 1,
        "year_start": birthday_this_year.isoformat(),
        "periods": periods,
        "current_period": current_period,
    }


@router.get("/cardology/yearly-spread")
async def get_yearly_spread_reading(month: int, day: int, birth_year: int):
    if month < 1 or month > 12 or day < 1 or day > 31:
        raise HTTPException(status_code=400, detail="Invalid date")
    if birth_year < 1900 or birth_year > 2025:
        raise HTTPException(status_code=400, detail="Invalid birth year")
    spread = get_yearly_spread(month, day, birth_year)
    return {"spread": spread}



