# import_knowledge.py
# Run: python3 import_knowledge.py
# Safe to run multiple times — updates existing, inserts new

import asyncio
import motor.motor_asyncio
from datetime import datetime

client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
db = client.cosmica

KNOWLEDGE = [

    # ════════════════════════════════════════════════════
    # ARIES (MESHA) LAGNA — DESCRIPTION
    # ════════════════════════════════════════════════════
    {
        "type": "rashi", "rashi": "Mesha",
        "text": """Aries (Mesha) Lagna gives a very aggressive personality with a strong desire to dominate and lead in everything. The native wants to be first in all endeavors and does not like to be second to anyone.

The body type is usually not very muscular unless other planetary factors support it. More often the Aries native has a lean, thin, or wiry build. The personality can appear soft or delicate unless a strong planet like Sun is placed in the first house, which significantly strengthens the physique and overall constitution.

Mars, as the ruling planet of this lagna, gives permanent drive, ambition, and the quality of a landowner — someone who stakes their claim and defends it fiercely. The native is naturally pioneering, independent, and action-oriented. They do not wait for opportunities — they create them."""
    },

    # ════════════════════════════════════════════════════
    # MARS IN 12 HOUSES — ARIES LAGNA
    # ════════════════════════════════════════════════════
    {
        "type": "planet_house", "planet": "Mars", "house": 1, "lagna": "Mesha",
        "text": """Mars in the 1st house for Aries Lagna is exceptionally powerful — this is Mars sitting in its own sign in the most important house of the chart. The native becomes an extremely determined fighter who does not give up until the opponent or obstacle is completely destroyed.

The personality is commanding and powerful, like a military general sitting in his own kingdom. There is tremendous drive, physical courage, and an almost warrior-like approach to life's challenges. The body is strong and the vitality is exceptional.

Mars aspects the 4th house from here — this gives a mixed relationship with the mother (some emotional distance is likely) but is excellent for land, vehicles, and property accumulation. Mars aspects the 7th house — this can create a cold war dynamic with the spouse, though if Venus is strong in the chart, mutual understanding is possible and both parties maintain a careful balance. Mars aspects the 8th house from here — this is a powerful combination for longevity, extremely high motivation, and deep interest in hidden subjects including occult, tantra, astrology, and deep research into secret matters."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 2, "lagna": "Mesha",
        "text": """Mars in the 2nd house for Aries Lagna places Mars in Taurus, which is Venus's sign — a sign that is not comfortable for aggressive Mars. This creates noticeable tension in the areas of speech and family life.

The speech becomes harsh and argumentative. The native tends to create unnecessary disputes through the choice of words, often saying things that reopen old wounds. Family members may experience conflict repeatedly, with the same underlying tensions resurfacing despite attempts at resolution. Throat problems are also possible with this placement.

The remedy for this placement is to strengthen Mars through proper nutrition — vitamin K-rich foods, protein-rich diet — and through Hanuman mantras on Tuesdays. Mars aspects the 5th house from here — this is actually beneficial, providing strong protection and security for children's matters and education. The digestive fire (jatharagni) is strengthened. Mars aspects the 8th house — brings interest in insurance, hidden matters, and occasional risk of accidents. Mars aspects the 9th house — creates interest in occult practices and hidden spiritual knowledge."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 3, "lagna": "Mesha",
        "text": """Mars in the 3rd house for Aries Lagna places Mars in Gemini, the sign of Mercury. This creates a personality with extremely high initiative, tremendous courage, and a hard or occasionally cruel attitude especially toward younger siblings.

The native starts tasks with great force and finishes them with equal determination. There is excellent capacity for communication, particularly in digital and media-related fields. The arms and shoulders tend to be strong and physically developed.

Mars aspects the 6th house from here — this is excellent for winning court cases, land disputes, and legal matters. Employees and servants are disciplined and well-managed. Mars aspects the 9th house — the native has strong moral values and will fearlessly challenge anyone on matters of dharma and righteousness. The father's own strength and motivation increases significantly because of the native. Mars aspects the 10th house — there is hidden power operating within the professional sphere. The native achieves big results while maintaining a relatively low public profile."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 4, "lagna": "Mesha",
        "text": """Mars in the 4th house for Aries Lagna places Mars in Cancer, where it is debilitated. This is a complex and sensitive placement that requires careful interpretation.

The relationship with the mother is strained and can involve real emotional or even physical tension if Mars is additionally afflicted. However, this same placement is actually excellent for land, property, and vehicles — gains in these areas tend to increase significantly over the course of the native's life.

If Neecha Bhanga Raj Yoga conditions are present (for example, if the Moon is strong, or other cancellation factors are in place), the results can actually exceed those of an exalted Mars — this becomes one of the most powerful combinations for property and real estate wealth. The remedy for this placement is observing celibacy on Tuesdays and actively serving elders. Mars aspects the 7th house — there can be a cold war quality in the marriage. Mars aspects the 10th house — career and public status receive very strong support. Mars aspects the 11th house — gains from rental property are indicated, but some underlying hidden tension may accompany them."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 5, "lagna": "Mesha",
        "text": """Mars in the 5th house for Aries Lagna places Mars in Leo, the sign of the Sun. This creates a powerful and mutually beneficial planetary relationship since Mars and Sun are great friends.

This position creates the possibility of a Parivartan Raj Yoga combined with Lakshmi Yoga — an exceptionally auspicious combination that can bring tremendous fame, success, and abundance, often with what appears to be relatively little effort compared to the magnitude of results achieved.

The first child born to this native is likely to be male. Education gives strong results, and there is a particular aptitude for medicine, surgery, or any field requiring precision and courage. Mars aspects the 8th house — longevity is strong and there is a tendency toward insurance and security planning. Mars aspects the 11th house — income arrives through educational achievements, certificates, and formal qualifications. Mars aspects the 12th house — if Jupiter is also well-placed in the chart, this combination supports foreign settlement and success in distant lands."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 6, "lagna": "Mesha",
        "text": """Mars in the 6th house for Aries Lagna creates Vipareeta Raj Yoga — the lord of the 8th house placed in the 6th house produces a profound ability to destroy enemies, clear debts, and overcome diseases through one's own effort.

The native is extremely strong in competitive environments and excels in startups, competitive fields, and situations where others give up. Tasks are completed with excellent execution from beginning to end. Employees and servants are disciplined and the team functions well.

Mars aspects the 9th house from here — the native actively helps the father overcome old debts and long-standing health issues. Mars aspects the 12th house — by defeating and overcoming enemies, the native's own personality and confidence shine through even more powerfully. Mars aspects the 1st house directly — this aspect on the lagna itself gives tremendous confidence, physical vitality, and personal motivation that grows stronger over time."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 7, "lagna": "Mesha",
        "text": """Mars in the 7th house for Aries Lagna places the lagna lord in a kendra (angular) house — this creates a powerful Raj Yoga. The native gains huge public status and social influence through their partnerships and public-facing work.

There is typically a cold war quality with the spouse — tension simmers beneath the surface — however, both partners gain their own fame and position independently, and this shared achievement ironically keeps the marriage stable. Partnership business ventures are generally not very suitable for this native due to Mars's naturally aggressive nature. There is high sexual energy with this placement, and if Mars is additionally afflicted, a flirtatious nature may emerge.

Mars aspects the 1st house from here — the physical body and overall personality remain strong. Mars aspects the 10th house — the spouse actively contributes to and increases the native's career status. Mars aspects the 2nd house — speech must be carefully monitored as it has the power to damage relationships."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 8, "lagna": "Mesha",
        "text": """Mars in the 8th house for Aries Lagna places Mars in Scorpio, its own sign — an exceptionally powerful placement for longevity, hidden strength, and deep transformative energy.

The native possesses very long life and remarkable physical and mental courage. There is a natural and deep interest in occult subjects, secrets, investigation, research, defense work, and police or intelligence services. Financial gains from in-laws are likely, and there may be inheritance or hidden financial support from the spouse's side.

Mars aspects the 2nd house from here — speech and communication must be handled carefully to avoid damaging family relationships. Mars aspects the 3rd house — formal communication is strengthened and the native writes or speaks with authority. Mars aspects the 11th house — the income of the in-laws side tends to increase, and the native may benefit from this indirectly."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 9, "lagna": "Mesha",
        "text": """Mars in the 9th house for Aries Lagna places Mars in Sagittarius, the sign of Jupiter — a deeply beneficial placement for dharma, higher wisdom, and the father's overall strength in life.

The father's power, health, and social position increase tremendously when this native is born. The communication style becomes very mature, sharp, and philosophically grounded — excellent for digital media, writing, and public speaking on matters of dharma. There is a strong personal moral code and the native is ready to challenge anyone when matters of truth and righteousness are at stake.

Mars aspects the 12th house from here — expenditure on land, charitable causes, and dharmic activities brings genuinely good results. Mars aspects the 4th house — vehicles and property benefit though there may be occasional tension with the mother. Mars aspects the 5th house — education and children receive strong Mars energy, supporting achievement."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 10, "lagna": "Mesha",
        "text": """Mars in the 10th house for Aries Lagna places Mars in Capricorn — its sign of exaltation. This is the most powerful placement for Mars in the entire zodiac, and for Aries lagna, where Mars is also the lagna lord, this becomes one of the most spectacular career combinations possible.

The native receives exceptional public recognition for their work and achievements. Society acknowledges and respects them through the quality and consistency of their professional contributions. There is tireless capacity for hard work and natural leadership qualities emerge early in life. The physical constitution is very strong and the personal drive and motivation are at their absolute peak.

Mars aspects the 1st house from its exalted position — health, physical vitality, and personal confidence are outstanding. Mars aspects the 4th house — significant property gains are indicated, though the relationship with the mother may have some tension. Mars aspects the 5th house — educational results are strong and children bring pride to the native."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 11, "lagna": "Mesha",
        "text": """Mars in the 11th house for Aries Lagna places Mars in Aquarius — a placement focused on gains, fulfillment of desires, and the strengthening of social networks.

The native's desires and goals are fulfilled with Mars's drive operating through the house of gains. Elder siblings and the friend circle benefit from the native's energy and actions. The social network tends to include powerful, action-oriented people.

Mars aspects the 2nd house from here — harsh and impulsive speech can spoil important financial matters and family relationships. The native must consciously soften their communication style in family settings. Mars aspects the 5th house — during Mars dasha and antardasha, children's matters and educational achievements receive strong positive results. Mars aspects the 6th and 8th houses — enemies are defeated, debts are reduced, and diseases are overcome through the native's own sustained effort."""
    },
    {
        "type": "planet_house", "planet": "Mars", "house": 12, "lagna": "Mesha",
        "text": """Mars in the 12th house for Aries Lagna places Mars in Pisces, the sign of Jupiter — a placement that turns the mind strongly toward foreign lands, spirituality, and liberation.

The native thinks frequently about foreign countries and there is genuine opportunity for success in import-export, digital work with foreign clients, and international business. However, this placement also disturbs sleep — there is a restlessness and an inability to fully switch off mentally. There is a positive quality here around clearing debts — Mars in the 12th tends to help the native escape from financial obligations over time. In the later years of life, a deep interest in moksha and spiritual liberation naturally emerges.

The remedy is vitamin E supplementation and consciously taking the spouse on foreign trips, which strengthens the marriage relationship. Mars aspects the 3rd house — communication and initiative remain strong. Mars aspects the 6th house — competitive strength does not diminish. Mars aspects the 7th house — creates suspicion and doubt in the marriage; this is the primary challenge and requires conscious trust-building."""
    },

    # ════════════════════════════════════════════════════
    # SUN IN 12 HOUSES — ARIES LAGNA
    # ════════════════════════════════════════════════════
    {
        "type": "planet_house", "planet": "Sun", "house": 1, "lagna": "Mesha",
        "text": """Sun in the 1st house for Aries Lagna is an exceptionally powerful placement — the Sun is exalted in Aries, reaching its peak strength around 10 degrees. Even slightly before or after this degree, Sun remains remarkably strong.

This is the 5th lord (Sun rules Leo, the 5th house for Aries lagna) placed in the lagna — a trikona lord in a kendra, in a sign ruled by Mars who is a natural friend of the Sun. This combination produces a very powerful, high-status, and commanding personality with natural leadership quality. The native moves fast, thinks clearly, and carries an almost royal bearing in all their dealings.

Career possibilities include advocacy, politics, high government posts, big business leadership, film direction, public speaking, and medicine. The native has genuine intellectual brilliance and creative intelligence flowing from the 5th lord's energy. One caution — the Sun as karaka for hair means this placement can cause hair thinning or early hair loss, particularly if Sun is additionally afflicted. If Saturn afflicts the Sun here, eye problems and hair issues become more pronounced. To fully judge results, always check Mars's position — if Mars is in houses 2, 3, 4, 10, 11, or 12 from the Sun, the results are excellent. If Mars is in houses 5, 6, 7, 8, or 9 from Sun, there is temporary enmity between them and Sun's results are slightly reduced during those periods."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 2, "lagna": "Mesha",
        "text": """Sun in the 2nd house for Aries Lagna places the 5th lord in Taurus, the sign of Venus. Sun and Venus are natural enemies, which creates a conditional result that depends entirely on their temporary relationship at the time of birth.

If Venus is placed in houses 2, 3, 4, 10, 11, or 12 from the Sun in the natal chart, they become temporary friends — in this case, the results are genuinely good. The native earns through knowledge, creativity, writing, and the power of self-expression. Print media, novel writing, creative content, and speech-based professions do well.

However, if Venus is placed in houses 5, 6, 7, 8, or 9 from the Sun, they become temporary enemies — in this case, family disputes arise repeatedly, the intellect is active but financial struggles recur despite effort. The native works hard intellectually but financial rewards are inconsistent and hard-won."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 3, "lagna": "Mesha",
        "text": """Sun in the 3rd house for Aries Lagna places the 5th lord in Gemini, the sign of Mercury — a natural friend of the Sun. This is a strong and productive placement, as the 3rd house is an upachaya (growing) house and the 5th lord placed three signs from its own house is considered favorably positioned.

This placement is excellent for writers, social media creators, content producers, journalists, and anyone working in communication or creative fields. The intelligence of the 5th lord combined with the communication power of the 3rd house creates a person who can express ideas brilliantly and reach wide audiences. Digital and media-related work is particularly favored.

There may be some differences or tension with the father, as the Sun's placement in the 3rd creates a slight disconnect from the 9th house (father's house). Mercury being a natural friend of the Sun ensures the overall results remain strong and the communication skills are genuinely impressive."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 4, "lagna": "Mesha",
        "text": """Sun in the 4th house for Aries Lagna places the 5th lord in Cancer, the sign of the Moon — a natural friend of the Sun. This creates a generally favorable placement with some important nuances around education and home life.

The 5th lord placed in the 4th often means that education happens away from home — boarding school, studying in a different city, or early independence in the educational journey is common. Strong mother and father figures are present in the native's life. The relationship between them depends on the Moon's condition — if the Moon is well-placed and friendly toward the Sun in the chart, the native is close to the mother and finds emotional security at home. If the Moon is in a strained relationship with the Sun, the father may be distant, busy, or emotionally unavailable.

The native tends to love luxury vehicles, comfortable home environments, and gravitates toward domestic pleasures and comforts. There is a deep attachment to home duties and the family space."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 5, "lagna": "Mesha",
        "text": """Sun in the 5th house for Aries Lagna places the Sun in Leo — its own sign. This is a profoundly strong placement requiring very little additional analysis to confirm its power. The 5th lord sitting in its own house in a friendly sign creates a natural and effortless expression of all 5th house themes.

Politics and government-nominated posts are strongly indicated. Wealth and property accumulate naturally. The native has a fertile and highly creative mind with a genuine interest in scriptures, writing, and intellectual pursuits. The children, though possibly few in number, tend to be exceptionally successful, wealthy, famous, or deeply virtuous.

This placement gives the native real authority in creative and intellectual domains. The mind is sharp, the ego well-directed, and the natural confidence that comes from the Sun in its own house supports long-term success in any field requiring leadership, intelligence, or creative vision."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 6, "lagna": "Mesha",
        "text": """Sun in the 6th house for Aries Lagna is actually a beneficial placement — the 6th house is called Vijay Sthana (the house of victory) for the Sun, which naturally thrives in competitive environments where it can assert dominance and overcome opposition.

The native succeeds in competitions, government examinations, awards, and any situation requiring them to outperform rivals. This placement supports careers as doctors, engineers, technical specialists, government employees, and teachers. The 5th lord's energy in the 6th creates someone who applies their intelligence and creativity specifically to solving problems, overcoming diseases, and defeating competition.

There is genuine competitive drive here — the native does not shy away from challenges and often performs best when under pressure or when opposition is strongest."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 7, "lagna": "Mesha",
        "text": """Sun in the 7th house for Aries Lagna places the Sun in Libra — its sign of debilitation. This is the weakest position for the Sun in the entire zodiac, and being the 5th lord in a debilitated state creates genuine challenges.

The 5th lord debilitated in the 7th house can indicate a tendency toward extramarital affairs or inappropriate romantic involvements. Ego clashes in marriage are common. Notably, relations with the spouse often worsen after the birth of children rather than improving. There can be a dual character quality and social prestige may be lower than deserved.

However, if Jupiter aspects or supports this Sun, the native develops genuine research ability, interest in occult sciences, astrology, tantra, geology, mining, or underground work. The debilitation energy can be channeled productively into depth and investigation rather than superficial status-seeking."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 8, "lagna": "Mesha",
        "text": """Sun in the 8th house for Aries Lagna places the 5th lord in Scorpio — a placement that is considered challenging for the Sun's natural significations, particularly the father. The Sun being in the 8th weakens paternal matters — the father's health, longevity, or the relationship with the father may be strained.

The native develops a deep interest in occult subjects, spirituality, hidden knowledge, tantra, and metaphysical investigation. The intelligence of the 5th lord goes underground, seeking what is concealed rather than what is openly celebrated.

The quality of results depends heavily on Jupiter's condition. If Jupiter is strong and well-placed, this placement produces a deeply spiritual individual with high metaphysical knowledge and genuine wisdom. If Jupiter is weak or afflicted, addictions and negative occult practices can become problematic."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 9, "lagna": "Mesha",
        "text": """Sun in the 9th house for Aries Lagna places the 5th lord in Sagittarius, the sign of Jupiter — a natural friend of the Sun. This creates a very favorable placement for dharma, higher learning, and the relationship with the father.

The father benefits greatly when this native is born — his health, social standing, and overall success tend to improve. The native is drawn toward higher learning, philosophy, and dharmic pursuits. Long-distance journeys and pilgrimages feature prominently in the life story.

Children bring fame and recognition to the native through their own achievements. The 5th lord in the 9th creates a natural connection between intelligence, creativity, and fortune — the native's intellectual gifts align naturally with their dharmic path."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 10, "lagna": "Mesha",
        "text": """Sun in the 10th house for Aries Lagna places the 5th lord in Capricorn — the house of karma and public career. This creates a very bright, publicly visible placement where the native's intelligence, creativity, and leadership qualities are on full display in their professional life.

The 10th house Sun for Aries lagna produces a person oriented toward government service, large-scale networking, and high career achievement. Government jobs, political positions, corporate leadership, and any career requiring public authority and recognition are strongly supported.

The 5th lord's energy in the 10th means that creativity and intelligence become the foundation of the career itself — the native succeeds by thinking better than their peers, not merely by working harder."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 11, "lagna": "Mesha",
        "text": """Sun in the 11th house for Aries Lagna places the 5th lord in Aquarius — a placement that channels creative and intellectual energy toward networking, income generation, and the fulfillment of long-term goals.

The native builds excellent professional and social networks, earning through knowledge, creativity, and intellectual reputation. The 5th house connection means that children tend to be in high-income professions or financially successful social groups.

This is a strong placement for anyone in education, content creation, publishing, or any field where knowledge translates directly into income and influence within a broad network."""
    },
    {
        "type": "planet_house", "planet": "Sun", "house": 12, "lagna": "Mesha",
        "text": """Sun in the 12th house for Aries Lagna places the 5th lord in Pisces, the sign of Jupiter — a natural friend of the Sun. This creates a complex placement where the intelligence and creativity of the 5th lord operate in the hidden, foreign, and spiritual domains of the 12th house.

Children or education going abroad is strongly indicated. However, there is a serious caution — shortcuts, illegal activities, or ethically questionable means of earning abroad must be strictly avoided as the karmic consequences will be severe.

If Jupiter is strong and well-placed, this placement produces genuine spiritual depth, moksha orientation, and meaningful hidden or esoteric work. If Jupiter is weak, there is a risk of negative hidden activities or confused moral boundaries."""
    },

    # ════════════════════════════════════════════════════
    # JUPITER IN 12 HOUSES — ARIES LAGNA
    # ════════════════════════════════════════════════════
    {
        "type": "planet_house", "planet": "Jupiter", "house": 1, "lagna": "Mesha",
        "text": """Jupiter in the 1st house for Aries Lagna creates one of the most respected and wise personalities possible. The native is deeply respectful of teachers, preceptors, and religious figures — they genuinely honor wisdom and experience wherever they find it.

The native is wealthy, learned, intelligent, and holds a good position in government or society. Their character is above reproach and they are known for their faithful, generous, and public-spirited nature. The physical appearance is handsome and healthy, with a kind-hearted and bold personality. They maintain their goodwill effortlessly and earn genuine honor in society.

The native is well-educated and knowledgeable. Children are capable, loved deeply, and become a genuine source of peace and strength in the native's life. There is a yoga for a male child. Memory is sharp and foreign travel brings good results. The native believes in dharma, is on good terms with the father, and takes care of parental responsibilities. Divine help arrives when needed, and the native leads a happy, peaceful, wealthy, and respectable family life. One area of difficulty — there can be some problems with the spouse and domestic happiness may occasionally be disturbed, requiring conscious effort to maintain harmony."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 2, "lagna": "Mesha",
        "text": """Jupiter in the 2nd house for Aries Lagna creates a person who is healthy, semi-fortunate, and blessed with financial intelligence. The finances are generally in good shape and the family is supportive. The tone and speech are sensible, calculative, pleasant, and sweet — Jupiter in the house of speech gives a naturally wise and measured way of communicating.

There are gains through foreign trade, science, learning, publication, travel, invention, and banking. The native is social, respected, religious, and devoted to their country. Secret missions and occult-related work can also bring gains. The native overcomes enemies with intelligence rather than aggression, and the long lifespan brings the benefit of inheritance over time.

The native clears the obstacles of life using intellect and wisdom. Work in fields related to intellect and finances is particularly advantageous. The one challenge area is the relationship with the father — there can be differences and the father's support may not always be forthcoming. If Jupiter is afflicted, loss of money through enemies and generally unfortunate financial conditions can arise."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 3, "lagna": "Mesha",
        "text": """Jupiter in the 3rd house for Aries Lagna creates a person who is lucky and religious, with genuine intellectual curiosity and a love of learning through research, travel, investigation, exploration, and writing. Occult learnings are also indicated through this placement.

The native is not naturally the most bold or courageous person (Jupiter softens Mars's aggressive 3rd house energy), and there can be unhappiness or lack of cooperation from younger brothers and sisters. Despite these challenges, the native is intelligent and hardworking, overcoming hurdles in business through sustained effort.

Hard work will be more than normal throughout life. There is good understanding with the father. The native will be destined and lucky overall, believing in dharma and having the possibility of foreign travel. Elder siblings are favored. Gains are high. Minor health problems persist but are manageable."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 4, "lagna": "Mesha",
        "text": """Jupiter in the 4th house for Aries Lagna is a very significant placement — Jupiter is exalted in Cancer, and the 4th house is Cancer for Aries lagna. This means Jupiter in the 4th house for Aries lagna is in its sign of exaltation, which is an exceptionally powerful combination.

The native rises in life and accumulates significant property. Land, vehicles, and homes are always advantageous to purchase and the native makes a lot of property over the course of life. The native is lucky like a king — wealthy, famous, and respected through business, trade, or other prominent positions. Foreign connections bring gains and the possibility of foreign settlement exists.

One important challenge — the native is not in good terms with the mother, and this relationship requires conscious care and healing. Despite this, the home life overall is happy and peaceful, with religious devotion playing a central role. The native works hard with intelligence and wisdom, and obstacles are removed through sustained effort. If afflicted, secret sufferings and loss through the father can occur."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 5, "lagna": "Mesha",
        "text": """Jupiter in the 5th house for Aries Lagna is one of the most auspicious placements possible — Jupiter, the great benefic and natural significator of the 5th house themes (children, wisdom, dharma), sits in the 5th house itself. For Aries lagna, Jupiter rules the 9th house (dharma) and 12th house (moksha), making this a deeply spiritual and fortunate combination.

The native is intelligent, skillful, and gets higher education. They are a good orator who speaks fluently and with genuine wisdom. There is love for children and deep happiness and strength derived from them. A yoga for a male child is present. The mind is fertile, creative, and deeply interested in religious books and scriptures. Memory is very sharp and the mental constitution is tough with strong willpower.

The native receives honor and appreciation from the government and society. Success in love affairs is indicated. The understanding with the father is excellent. The native is lucky with good destiny, believes in dharma with deep faith, and may successfully work for the expansion of religion. Finances are in good shape. One practical caution — despite all these blessings, the native can sometimes lack sufficient money for day-to-day needs, creating occasional family happiness problems."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 6, "lagna": "Mesha",
        "text": """Jupiter in the 6th house for Aries Lagna is generally considered a challenging placement — Jupiter is the 9th and 12th lord placed in the 6th house of enemies, debts, and disease. The native may struggle with feelings of being unlucky or irreligious, though they genuinely make efforts to cultivate luck and religious practice.

The native always works to control enemies and faces great disputes, but eventually gets victory over them. Intellect and wisdom are the tools used to earn wealth, though the income may not fully meet family needs. Help from others becomes necessary and family members may have creative differences.

However — an important exception: if Vipareeta Raj Yoga is formed and Mars is well-placed, Jupiter gives all good results. In such a case, the native is born into a respectable family, becomes wealthy, and reaches good rank and service. The last part of life becomes comfortable even if the middle years involve debt and difficulty."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 7, "lagna": "Mesha",
        "text": """Jupiter in the 7th house for Aries Lagna creates an intelligent, knowledgeable, and successful personality. The native gets a dignified and sensible spouse — the partner is very wise, well-mannered, and brings genuine quality to the marriage. The native is handsome, good looking, courageous, and influential in their social dealings.

Work partnerships are always good and new avenues for gains through partnership and daily business open up. The native is intelligent and works with energy and strength, succeeding in business and earning adequate wealth. Hard work always proves fruitful. The native's personality improves continually.

The native is wise, tactful, learned, and brave. Gains come through marriage, travels, partnership, and contracts. Younger siblings are loved and cooperative. The native leads a peaceful and comfortable life overall. If Jupiter is afflicted, troubles through deceit and treachery in unions, lawsuits, and marriage difficulties can arise."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 8, "lagna": "Mesha",
        "text": """Jupiter in the 8th house for Aries Lagna is a challenging placement — the great benefic Jupiter sits in the house of transformation, ruling the 9th and 12th houses. The native may struggle with religious faith and the income is often insignificant compared to the heavy expenses carried for the family's happiness.

There are constant attempts to gain more through overseas connections. The native is never in good terms with the father and finances remain in bad shape with obstacles throughout life. Disadvantages regarding gains and misunderstandings with family are persistent themes.

However, purchasing vehicles, land, and home is always advantageous even with this placement. There is benefit of a long life span and inheritance over time. Psychic experiences are possible, along with deep occult knowledge gained through life's difficulties. If Mars is well-placed and in good dignity, Jupiter in the 8th gives considerably better results than expected — the difficulties transform into depth and hidden wisdom."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 9, "lagna": "Mesha",
        "text": """Jupiter in the 9th house for Aries Lagna is one of the most fortunate placements in all of Vedic astrology — Jupiter, which rules the 9th house (Sagittarius) for Aries lagna, sits in its own house. This is Jupiter in its natural domain of dharma, fortune, father, and higher wisdom.

The native is most fortunate and deeply religious in outlook. They believe in the power of God and perform religious duties sincerely, receiving genuine divine help as a result. The personality is handsome, healthy, brave, and bold. The native is courageous, skillful, and industrious — their good intellect and wisdom are applied toward genuine dharmic goals.

The native is very caring toward the father and maintains this relationship with great devotion. A yoga for a male child and a younger brother is present. The native earns sufficient wealth, loves younger siblings, and enjoys their cooperation. Higher education comes with success. Travel for educational, scientific, or religious purposes in foreign countries is indicated. The native is deeply respectable in society and leads a happy, peaceful, and prosperous family life."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 10, "lagna": "Mesha",
        "text": """Jupiter in the 10th house for Aries Lagna places Jupiter in Capricorn — its sign of debilitation. This is a significant challenge because Jupiter is in its weakest sign in the house of career and public action.

The native is intelligent and influential but does not respect the father and loses his support. There are many hurdles and hardships in achieving success in occupation and profession. The native earns some wealth but does not receive special recognition from government or society. Work and profession remain unsettled, particularly during Jupiter's dasha and antardasha. Mental peace is disturbed and finances are in bad shape.

Despite all this, the native appears lucky and strives to become so. With honor, credit, and high position as aspirations, gains and honor through science, literature, or travel are possible if Jupiter regains strength through other chart factors. The native respects the mother, receiving her love and blessings."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 11, "lagna": "Mesha",
        "text": """Jupiter in the 11th house for Aries Lagna creates a fortunate, handsome, healthy, and lucky personality. The native gains sufficient wealth primarily through good fortune and the wisdom to recognize and capitalize on opportunities. They are bold and courageous, striving hard to get success in their ventures.

Fortunate friendships on voyages and gains through foreign lands and foreign friends are strongly indicated. The native is eloquent in speech and achieves success in higher education. Business partnerships are very good and new avenues for gains through partnership and daily business open up consistently.

Finances are always in good shape. Advantages from siblings are present. A yoga for a male child and success in love affairs are indicated. The married life, partnerships, and daily business activities bring good results. The native leads a happy, peaceful, and respectable life. One challenge — elder brothers may be against the native and withhold support, requiring the native to build their success largely through their own efforts and external networks."""
    },
    {
        "type": "planet_house", "planet": "Jupiter", "house": 12, "lagna": "Mesha",
        "text": """Jupiter in the 12th house for Aries Lagna places Jupiter in Pisces — its own sign. This is a complex but deeply significant placement — Jupiter ruling the 9th and 12th houses sits in its own 12th house sign, creating a powerful orientation toward spirituality, hidden knowledge, and eventual liberation.

The native is not conventionally lucky in material terms, but is religious in outlook, worshipping God and participating sincerely in religious activities. Considerable money is spent on religious deeds and there is some financial loss through this generosity. The mother's love, blessings, and benefit from managing land and property are present. The native receives honor and respect in government and society despite the 12th house placement.

Occult abilities develop naturally. Enemies are ultimately powerless. The native is drawn to secret investigations and finds that limitations and obstacles prove to be blessings in disguise by developing inner growth and understanding. In the middle or latter part of life, a genuine seclusion for spiritual development and occult learning naturally occurs. The possibility of foreign settlement is present. Wasteful expenses are high and difficult to control — this is one of the persistent material challenges. Ultimately, through intellect, wisdom, and spiritual grace, the native leads a happy family life."""
    },

    # ════════════════════════════════════════════════════
    # KETU IN 12 HOUSES — ARIES LAGNA
    # ════════════════════════════════════════════════════
    {
        "type": "planet_house", "planet": "Ketu", "house": 1, "lagna": "Mesha",
        "text": """Ketu in the 1st house for Aries Lagna can create a person who feels physically low on energy and mentally restless at times. There can be inner insecurity along with stubborn or impulsive behavior patterns that the native must consciously work to understand and manage. Despite this, the native often shows remarkable patience during genuinely difficult situations — there is a hidden reservoir of endurance.

When Ketu is well-supported, especially by a strong Mars as the lagna lord, it can bring intelligence, courage, leadership ability, and genuine respect. Such individuals may gain status and authority, and success in fields like defense, administration, and spiritual leadership is possible.

Education is generally present, but the native may sometimes consider questionable shortcuts to improve status or wealth — this should be consciously resisted. Spiritual inclination is strong and involvement in religious practices is common and genuinely nourishing. There may be mental stress, minor health concerns particularly related to the stomach, and relationship misunderstandings. However, with strong planetary support throughout the chart, life can become stable, prosperous, and deeply fulfilling."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 2, "lagna": "Mesha",
        "text": """Ketu in the 2nd house for Aries Lagna often creates instability in finances and challenges in family harmony. There may be recurring disagreements within the family and fluctuating wealth that requires careful management and conscious financial discipline.

The person can be fearless and capable of overcoming enemies, but may sometimes rely on unconventional or questionable means to regain financial standing — this pattern requires awareness and correction. Longevity is usually good, and inheritance may play a meaningful role in the financial story of the life. However, speech may become harsh or unpleasant, and there can be a tendency to project an image of being wealthier than one actually is. Internally, the person may feel insecure about career and finances even when external appearances suggest otherwise.

The key work for this native is building genuine financial foundations rather than appearances, and cultivating warm and honest family communication rather than defensive or harsh exchanges."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 3, "lagna": "Mesha",
        "text": """Ketu in the 3rd house for Aries Lagna can reduce natural confidence and courage, making the person hesitant or uncertain in their actions compared to a typical Aries native. Relationships with siblings may be strained and require conscious effort to maintain warmth and cooperation.

Frequent short travels and unnecessary effort without proportional results are common themes in this native's experience. Financial gains may be limited at various life stages, and progress can feel slower than desired. The person may become self-focused in decision-making and might adopt indirect methods in work or business rather than the direct Aries approach.

Despite these challenges, basic longevity and fundamental stability remain intact. Overall life may feel average rather than dramatically successful unless other strong planetary factors compensate. The native benefits from cultivating patience with the process and trusting that consistent honest effort will eventually yield results."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 4, "lagna": "Mesha",
        "text": """Ketu in the 4th house for Aries Lagna can create emotional distance from the mother or from family in general. Domestic peace may be disturbed at various points, and property-related matters may face unexpected delays or complications that require patience and persistence to resolve.

There can be restlessness and dissatisfaction with the home environment — a sense that one never quite feels fully settled or at home where one is. However, this placement often carries a hidden gift: it frequently favors living away from the birthplace, relocating to a different city, or even settling abroad. The restlessness that drives the native away from familiar roots can ultimately lead them to places where they flourish.

While early life may feel emotionally unstable, later stages typically bring mental strength, improved stability, and eventual comfort if the native manages their emotional patterns wisely and builds their chosen home and family with conscious intention."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 5, "lagna": "Mesha",
        "text": """Ketu in the 5th house for Aries Lagna may affect education, mental clarity, and emotional expression. The person may struggle at times to communicate their ideas effectively and may feel genuinely misunderstood by others, despite having meaningful things to express.

There can be challenges related to children — delays in having children, or a sense of dissatisfaction or distance in the parent-child relationship. Health issues, especially related to digestion, may occur periodically. The individual may become secretive, sharp in speech, and mentally complex — the Ketu energy creates an inward-turning quality that others may find difficult to read.

Gains are often inconsistent and require sustained effort to materialize. Faith or spiritual belief may fluctuate — periods of deep devotion may alternate with periods of doubt or disconnection. The 5th house is the house of purva punya (past life merit), and Ketu here suggests that the native is working through karmic patterns related to creativity, children, and intellectual expression."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 6, "lagna": "Mesha",
        "text": """Ketu in the 6th house for Aries Lagna is generally considered a strong and favorable placement. This position gives the native the ability to overcome enemies powerfully, face competition with resilience, and handle life's challenges with sustained effectiveness.

The person can achieve meaningful success through persistence, even when the path involves struggles or delays. Professional growth may take time to manifest clearly, but eventual stability and recognition are achievable through consistent effort. The native has a particular ability to endure difficulties that would defeat others.

However, financial ups and downs, occasional lack of family support, and an aggressive communication style may create difficulties in personal relationships. Despite these friction points, the native often emerges victorious in conflicts, legal matters, and competitive situations. The 6th house is Ketu's natural domain of strength — enemies and obstacles are ultimately unable to defeat this native when they remain disciplined and focused."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 7, "lagna": "Mesha",
        "text": """Ketu in the 7th house for Aries Lagna can create complications in relationships and marriage — emotional distance, dissatisfaction, or a feeling of incompleteness may arise in intimate partnerships. Business partnerships may also face instability, with agreements proving more difficult to sustain than initially anticipated.

There may be delays in marriage or noticeable fluctuations in romantic life before a settled partnership is established. However, if Venus is strong in the chart, this placement can give considerably better relationship harmony and financial gains through partnerships — Venus's strength becomes the key factor to assess.

The person may experiment with different business ventures and may sometimes rely on unconventional methods for achieving success. The 7th house Ketu creates a native who needs to do deep inner work around relationships — understanding what they truly seek in partnership and releasing unrealistic or spiritually confused expectations. With genuine balance and self-awareness, a stable and comfortable life is genuinely possible."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 8, "lagna": "Mesha",
        "text": """Ketu in the 8th house for Aries Lagna brings unpredictability, sudden challenges, and emotional disturbances into the native's life. Health issues, especially related to the lower abdomen or back, may arise periodically and require ongoing attention and management.

There may be instability in finances, family misunderstandings, and a sense of continuous obstacles that makes finding long-term stability difficult. The person may feel unsettled or unable to find a consistent foundation from which to build — there is a quality of the ground shifting unexpectedly beneath the native's feet.

However, the 8th house is also the house of transformation and hidden power. With effort, discipline, and a willingness to embrace rather than resist the transformative energy of this placement, the native can eventually gain genuine recognition and meaningful financial improvement. The journey may be intense and require periods of going inward, but the depth of wisdom gained through this house makes the native resilient in ways that others who have had easier lives are not."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 9, "lagna": "Mesha",
        "text": """Ketu in the 9th house for Aries Lagna is a more favorable placement overall. The person becomes spiritually inclined, internally disciplined, and focused on genuine self-growth and philosophical understanding.

There is strong interest in higher knowledge, philosophy, and religious practices — but the approach tends to be unconventional and deeply personal rather than following established religious structures. The native may explore alternative spiritual paths, esoteric philosophies, or their own synthesized understanding of dharma. Frequent travel and the exploration of deeper aspects of life are natural expressions of this placement.

The relationship with the father may involve some complexity — there may be misunderstandings or philosophical differences that create distance. However, overall growth and success are achievable through this life. With genuinely positive planetary influences elsewhere in the chart, this placement brings fortune, high education, and a deeply meaningful life oriented around wisdom and spiritual purpose."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 10, "lagna": "Mesha",
        "text": """Ketu in the 10th house for Aries Lagna can create instability in career, particularly when navigating relationships with authority figures, superiors, or parental influences in the professional sphere. Public recognition may fluctuate in ways that feel frustrating and unpredictable.

The person is genuinely hardworking and determined, but may face repeated obstacles in professional life that seem to arise just when success appears within reach. Reputation may go through noticeable ups and downs that require the native to rebuild their professional standing more than once. There can be a spiritual or detached quality to the career — the native may not be fully invested in conventional professional success in the way that society expects.

If supported by strong planets like Saturn in the chart, this placement can eventually lead to genuine success, meaningful authority, and lasting respect after sustained effort over many years. The key is persistence without attachment to specific outcomes or timelines."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 11, "lagna": "Mesha",
        "text": """Ketu in the 11th house for Aries Lagna can bring strong desires for success and financial gain — paradoxically, this highly spiritual and detached planet placed in the house of material gains creates an intensified focus on achievement and prosperity.

The person works hard to achieve ambitions and may become highly focused on material growth. There may be unconventional ways of earning that others find unusual or unexpected, and gains can be significant when managed properly and ethically. However, relationships with siblings or social circles may face challenges that require conscious attention and care.

With good planetary support elsewhere in the chart, this placement brings prosperity, the fulfillment of important desires, and a comfortable lifestyle. The native's path to abundance runs through their willingness to do things differently from conventional approaches and to leverage their unique perspective on life's opportunities."""
    },
    {
        "type": "planet_house", "planet": "Ketu", "house": 12, "lagna": "Mesha",
        "text": """Ketu in the 12th house for Aries Lagna is strongly connected to spirituality, detachment, and the process of inner liberation. This is considered one of Ketu's most natural and spiritually productive placements — the planet of moksha in the house of moksha creates a powerful pull toward transcendence, inner development, and eventual freedom from material attachment.

The person may spend heavily and must consciously work to manage expenses without suppressing their natural generosity. There is a deep tendency toward introspection, genuine spiritual practice, and meaningful inner growth. Foreign connections, foreign residence, or living away from the birthplace are all common themes with this placement.

If negatively influenced by other malefic planets in the chart, excessive expenses, mental stress, and emotional instability may become persistent challenges. Otherwise, this placement creates the conditions for a genuinely peaceful, spiritually fulfilling, and inwardly rich life. The native's greatest treasures are accumulated not in the external world but in the depths of their own consciousness and their relationship with the divine."""
    },

    # ════════════════════════════════════════════════════
    # MERCURY IN 12 HOUSES — ARIES LAGNA
    # Mercury rules 3rd (Gemini) and 6th (Virgo) for Aries Lagna
    # ════════════════════════════════════════════════════
    {
        "type": "planet_house", "planet": "Mercury", "house": 1, "lagna": "Mesha",
        "text": """Mercury in the 1st house for Aries Lagna creates an interesting blend of Mars's natural courage with Mercury's quick, analytical mind. The person may appear bold and active on the surface, but internally struggles with indecision and mental restlessness — the mind runs faster than the native can always manage, creating a gap between intention and clear action.

Health issues, though generally minor, tend to persist over time in a nagging way. Relationships with siblings may not be particularly supportive. Life often involves more effort than the results seem to justify, and there is a tendency toward financial leakage through wasteful or impulsive expenditures that the native must consciously work to control.

During Mercury's dasha and antardasha, obstacles can increase — stress, health concerns, and conflicts may all intensify simultaneously. However, the native can defeat enemies and even benefit unexpectedly from disputes or legal situations. There is genuine intelligence and practical execution skill, and gradual improvement in career and business comes through better planning and adaptability. An interest in occult subjects like astrology is often present. Married life can be average but not deeply emotionally satisfying."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 2, "lagna": "Mesha",
        "text": """Mercury in the 2nd house for Aries Lagna connects the sharp intellect of Mercury with the house of finances, speech, and family life. As the ruler of the 3rd and 6th houses placed in the 2nd, this creates a person who can earn through education, writing, communication, travel, and service-related work.

The native is intelligent, hardworking, and genuinely capable of building wealth — however, financial ups and downs remain a persistent feature throughout life. Stability in money does not come easily despite the effort applied. Family relations are average, with limited support from siblings. The communication style is generally pleasant and persuasive, but internal stress related to money and security persists beneath the surface.

Gains from inheritance are possible and the lifespan is generally good. However, disputes related to money, health-related expenses, or issues involving employees can create ongoing financial pressure that requires careful and consistent management."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 3, "lagna": "Mesha",
        "text": """Mercury in the 3rd house for Aries Lagna is a genuinely strong placement — Mercury occupies Gemini, its own sign, in the house of communication, courage, and initiative. This is Mercury at home in its most natural domain, expressing its best qualities freely.

The native becomes bold, hardworking, and remarkably capable of finding creative solutions through sustained effort. Gains come naturally through writing, communication, travel, and education. The ability to influence others through words — whether spoken or written — is exceptional. The native is well-suited to communication-based professions, media work, and any field requiring quick thinking and clear expression.

Relations with siblings may not be very warm or close, but the person still benefits indirectly through sibling connections. Chances of foreign travel are present. The individual tends toward a philosophical or balanced approach to life. They are capable of achieving genuine success through patience and the intelligent application of their considerable mental gifts."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 4, "lagna": "Mesha",
        "text": """Mercury in the 4th house for Aries Lagna brings intelligence and excellent communication skills into the realm of home, property, and domestic life. When well-placed and supported by other beneficial factors, this can give real capability in property matters, domestic management, and the pursuit of comfort and recognition.

However, challenges in domestic life are also common with this placement. There can be misunderstandings with the mother or a lack of emotional depth in the connection. Property-related issues, delays in acquiring assets, or internal family disputes are possible themes. The person may feel mentally restless at home — the mind is always active and may find domestic routine confining without sufficient intellectual stimulation.

Despite difficulties, the native can overcome obstacles and eventually gain genuine respect, financial stability, and social recognition through sustained effort. Support from the maternal family, particularly the maternal grandfather, can prove beneficial at key life moments."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 5, "lagna": "Mesha",
        "text": """Mercury in the 5th house for Aries Lagna is generally a positive placement for intelligence, education, and creative thinking. The person is naturally thoughtful, analytical, and drawn toward gaining higher knowledge in whatever field captures their interest.

There is genuine capacity to earn through intellect, strategic planning, and careful analysis. Interest in academic studies, travel for educational purposes, and continuous learning remains strong throughout life. The native is well-suited to intellectual professions, research, and any work requiring systematic thinking.

However, there can be issues related to children — misunderstandings, delays, or a sense of distance in the parent-child emotional bond. Love relationships may also involve communication challenges or intellectual incompatibility. Occasional health concerns, especially stomach-related, may arise. Gains are possible but not always consistent, and the native may experience noticeable ups and downs in both emotional and financial areas that require patience and adaptability to navigate."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 6, "lagna": "Mesha",
        "text": """Mercury in the 6th house for Aries Lagna is Mercury in its own sign of Virgo — a placement that gives exceptional analytical ability and a powerful capacity to deal with challenges. As the 6th lord placed in the 6th house, this creates a person who is genuinely formidable in competitive situations, legal matters, and any domain requiring precise analysis and methodical problem-solving.

The person excels in defeating enemies, succeeding in competition, and performing with excellence in service-oriented roles. There is a natural inclination toward healing, medicine, research, or social work. The ability to handle complex situations with patience and precision is outstanding.

However, this placement also generates ongoing themes of debts, health vigilance, conflicts, and legal matters that require the native's continued attention. Expenses can increase and stress levels may remain elevated. With strong planetary support — particularly if Mars forms a Vipareeta Raj Yoga — this placement can turn highly favorable, bringing significant success after struggle, even from foreign or unexpected sources."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 7, "lagna": "Mesha",
        "text": """Mercury in the 7th house for Aries Lagna places the rulers of the 3rd and 6th houses in the house of marriage, partnerships, and public dealings. This significantly affects relationships — marriage may involve ongoing dissatisfaction, arguments, or health issues for the partner that create a persistent undercurrent of tension.

The person may struggle to form deep emotional connections but still seeks practical or intellectual companionship. Business partnerships may face instability due to Mercury's tendency to analyze and critique rather than simply trust and commit. Despite this, the person can achieve meaningful business success through persistence, adaptability, and excellent communication skills.

Gains through communication, trade, or partnerships remain possible even with these challenges. There may be recognition in society and support from maternal relatives at key moments. However, personality differences, health concerns in the partner, and the fluctuating nature of key relationships remain persistent themes that require conscious management and emotional maturity."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 8, "lagna": "Mesha",
        "text": """Mercury in the 8th house for Aries Lagna brings a complex and somewhat unstable intellectual energy to the house of transformation, hidden matters, and longevity. The person is genuinely intelligent but may deal with chronic anxiety, low-grade fear, or persistent uncertainty about life's direction and security.

Health issues, especially related to digestion, nervous system, or stress-related conditions, can affect daily life in ongoing ways. Financial instability and family misunderstandings may occur with some regularity. However, there is also a deep and genuine interest in occult knowledge, hidden subjects, research, and investigation — the 8th house Mercury gives a mind that naturally seeks what is concealed.

Gains through inheritance or long-term sustained effort are possible. With strong Mars support elsewhere in the chart, the native can overcome significant obstacles with effectiveness. Success with this placement comes slowly and requires genuine persistence and willingness to embrace the transformative, sometimes difficult nature of the 8th house rather than avoiding it."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 9, "lagna": "Mesha",
        "text": """Mercury in the 9th house for Aries Lagna creates a fascinating internal conflict between the logical, analytical mind of Mercury and the faith, devotion, and broader philosophical vision that the 9th house represents. The person may genuinely question religious doctrines, debate spiritual matters, or struggle to simply believe without evidence — yet they still participate in spiritual and traditional activities as part of their cultural life.

There can be misunderstandings with the father or a sense that his guidance is insufficient or lacking. The person may be naturally argumentative when it comes to matters of belief and life philosophy, which can create distance from teachers and elders who expect respectful deference. Life direction may feel uncertain at various stages.

Despite these challenges, intelligence and consistent hard work help the native achieve meaningful success. Gains come through travel, education, and foreign connections. Ultimately, the person earns recognition and genuine respect through their own efforts, even if their belief system and spiritual framework remain personal, unconventional, and perpetually evolving rather than settling into a fixed orthodoxy."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 10, "lagna": "Mesha",
        "text": """Mercury in the 10th house for Aries Lagna places strong intellectual energy directly in the house of career, public status, and professional achievement. The person is genuinely intelligent and hardworking in their professional sphere, but may face repeated obstacles in the chosen career path despite their capabilities.

Support from the father in career matters may be lacking, and professional growth may depend heavily on external factors such as loans, institutional structures, or working within defined systems rather than through independent initiative. Independent business ventures may prove challenging, while working within structured employment under supervision tends to give better and more consistent results.

There can also be issues related to property, the mother's wellbeing, or domestic stability that create distraction from professional focus. Despite these difficulties, the person can earn genuine respect and professional recognition through persistence, superior skill, and the intelligent application of their communication abilities in the right professional context."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 11, "lagna": "Mesha",
        "text": """Mercury in the 11th house for Aries Lagna connects the analytical intelligence of Mercury with the house of gains, ambitions, social circles, and the fulfillment of long-term desires. The person is intelligent, hardworking, and genuinely capable of achieving meaningful goals through sustained effort and strategic thinking.

However, financial instability may still persist, particularly during Mercury's dasha and antardasha periods. Gains may come with effort but lack the consistency or reliability that the native desires. Relationships with elder siblings may be strained or unsupportive. Health issues may present in ways that are unclear or difficult to diagnose accurately, requiring patience with the process of finding solutions.

Despite these challenges, the person can achieve real success through excellent communication skills, educational achievement, and strategic thinking applied consistently over time. However, complete emotional satisfaction and deep family happiness may remain elusive — the native often achieves their external ambitions while still feeling that something essential in the personal and emotional sphere remains unfulfilled."""
    },
    {
        "type": "planet_house", "planet": "Mercury", "house": 12, "lagna": "Mesha",
        "text": """Mercury in the 12th house for Aries Lagna is Mercury in Pisces — its sign of debilitation. This is a genuinely challenging placement that creates difficulty in clear thinking, decisive communication, and the management of practical affairs. The person may struggle with excessive expenses, persistent mental stress, and a lack of clarity in decision-making that is frustrating given their underlying intelligence.

There is a strong connection with foreign lands, isolation, behind-the-scenes work, and the hidden dimensions of life. Income from overseas sources is possible but may not bring the satisfaction or stability that the native seeks. Health issues, legal complications, and financial instability may persist over extended periods. Communication may become harsh or be misunderstood despite good intentions.

However, if Vipareeta Raj Yoga forms with this placement — which is possible given Mercury's dual rulership of the 3rd and 6th houses — this placement can turn significantly positive, bringing real success in hidden fields, research, investigation, or spiritual pursuits. The person may also develop genuine interest in occult sciences and eventually find balance, peace, and meaningful purpose through deep inner growth and spiritual development."""
    },
]

async def import_all():
    inserted = 0
    updated  = 0

    for item in KNOWLEDGE:
        if item["type"] == "rashi":
            result = await db.rashi_knowledge.update_one(
                {"rashi": item["rashi"]},
                {"$set": {"rashi": item["rashi"], "text": item["text"], "updated_at": datetime.utcnow()}},
                upsert=True
            )
            label = f"Rashi — {item['rashi']}"

        elif item["type"] == "planet_house":
            query = {"planet": item["planet"], "house": item["house"], "lagna": item.get("lagna")}
            result = await db.planet_house_knowledge.update_one(
                query,
                {"$set": {**query, "text": item["text"], "updated_at": datetime.utcnow()}},
                upsert=True
            )
            lagna_label = f" for {item['lagna']} Lagna" if item.get("lagna") else ""
            label = f"{item['planet']} in House {item['house']}{lagna_label}"

        elif item["type"] == "nakshatra":
            result = await db.nakshatra_knowledge.update_one(
                {"nakshatra": item["nakshatra"]},
                {"$set": {"nakshatra": item["nakshatra"], "text": item["text"], "updated_at": datetime.utcnow()}},
                upsert=True
            )
            label = f"Nakshatra — {item['nakshatra']}"

        if result.upserted_id:
            print(f"  ✅ Inserted: {label}")
            inserted += 1
        else:
            print(f"  🔄 Updated:  {label}")
            updated += 1

    print(f"\n{'='*55}")
    print(f"✅ Done! Inserted: {inserted} | Updated: {updated} | Total: {inserted+updated}")
    print(f"{'='*55}")

if __name__ == "__main__":
    print("\n🪐 Cosmica Knowledge Import")
    print("="*55)
    asyncio.run(import_all())