# app/data/synastry_interpretations.py
# Complete synastry aspect interpretations
# All 9 planets × all 5 aspects × both directions

SYNASTRY_INTERP = {

  # ══════════════════════════════════════════════
  # SUN COMBINATIONS
  # ══════════════════════════════════════════════

  ('Sun','Sun','conjunction'): {
    'title':'Sun Conjunct Sun — Mirror Souls',
    'summary':'Identical life force and ego — powerful recognition but potential ego clash.',
    'detailed':"""When two Suns conjoin, both people immediately recognize each other as kindred spirits. They share the same fundamental life purpose, pride, and drive for recognition. There is an instant sense of "I know you" — the kind of deep soul recognition that feels destined.

The strength of this aspect is extraordinary mutual understanding. Neither person has to explain their ambitions, need for respect, or desire for leadership. Both intuitively get what drives the other. In practical terms, they make excellent partners in shared endeavors, creative projects, and any area requiring aligned vision.

The challenge is that two strong solar energies in the same space create competition. Both naturally want to lead, both need to shine, and neither easily concedes the spotlight. This can manifest as subtle power struggles where each person unconsciously undermines the other's authority. The relationship works best when both carve distinct domains — one handles career, the other handles home, for example — where each can be the unquestioned leader.

In Vedic astrology, this conjunction also means they likely share the same sun sign, creating a karmic bond from past lives where they played complementary roles to each other.""",
    'positives':['Immediate deep understanding','Shared life vision and goals','Natural creative partnership','Strong sense of purpose together','Mutual respect for ambition'],
    'challenges':['Ego competition and power struggles','Both want to lead and be right','Can feel too similar — lack of polarity','Burnout from constant equal energy','Neither naturally nurtures the other'],
    'romance':'Strong initial attraction but needs conscious polarity to maintain romantic spark.',
    'marriage':'Works well when roles are clearly defined. Respect each other\'s leadership domains.',
    'friendship':'Excellent — natural allies and champions of each other\'s success.',
  },

  ('Sun','Sun','trine'): {
    'title':'Sun Trine Sun — Natural Champions',
    'summary':'Effortless mutual support and inspiration — each makes the other shine brighter.',
    'detailed':"""The Sun trine Sun is one of the most naturally harmonious connections two people can share. The trine flows effortlessly — their life forces complement and amplify each other without friction or competition. Both people genuinely celebrate each other's success.

This aspect creates a relationship where both partners naturally encourage each other's growth, ambition and self-expression. When one is struggling, the other intuitively knows how to restore their confidence. When one succeeds, the other feels genuine joy rather than envy. This mutual cheerleading creates an upward spiral of confidence and achievement for both.

In Vedic astrology terms, their fire or earth or air or water energies flow in the same direction, creating a sense of effortless alignment. They likely share similar life philosophies, approach challenges with compatible strategies, and have a natural rhythm in how they navigate the world.

The trine doesn't create burning passion on its own — it creates warmth, steadiness and enduring support. This is the aspect of lifelong friends who happen to be lovers, or business partners who trust each other completely. It forms the foundation upon which a relationship can build through decades without the solar energy ever becoming adversarial.""",
    'positives':['Each makes the other more confident','Effortless mutual encouragement','Shared life philosophy and ethics','Natural leadership that complements rather than competes','Lasting friendship within romance'],
    'challenges':['May lack passionate tension','Too comfortable — can stagnate','Need to consciously create growth challenges'],
    'romance':'Warm, steady, deeply supportive. The relationship feels right and natural from the start.',
    'marriage':'Excellent foundation — enduring mutual respect that only deepens over time.',
    'friendship':'Natural allies who genuinely celebrate each other\'s wins.',
  },

  ('Sun','Sun','sextile'): {
    'title':'Sun Sextile Sun — Complementary Paths',
    'summary':'Different enough to be interesting, similar enough to understand each other.',
    'detailed':"""The Sun sextile Sun creates an energizing and intellectually stimulating connection. Unlike the trine which flows effortlessly, the sextile requires some conscious effort to activate — but when both people engage, the rewards are substantial.

Both people come from slightly different life orientations and have developed different strengths. The sextile allows these differences to be complementary rather than conflicting. Person A's leadership style fills a gap in Person B's approach, and vice versa. Together they cover more ground than either could alone.

This is an excellent aspect for partnerships of any kind — romantic, business or friendship. The slight difference in approach keeps things interesting and prevents the stagnation that can come from being too similar. Each person continues to grow and learn from the other's different perspective on life, identity and purpose.

In practical terms, this aspect creates productive collaboration. When they work together on a shared goal, their different but compatible energies produce results greater than the sum of their parts. The sextile is particularly supportive for couples who share professional lives or creative projects.""",
    'positives':['Productive complementary energies','Learning and growth from each other','Interesting differences that attract','Good for shared professional pursuits','Motivated by each other\'s approach'],
    'challenges':['Must actively cultivate the connection','Less effortless than the trine','May initially overlook each other'],
    'romance':'Good — creates interest and growth. Not instant but builds into something solid.',
    'marriage':'Supportive for shared endeavors and evolving together.',
    'friendship':'Energizing — they bring out different sides of each other.',
  },

  ('Sun','Sun','square'): {
    'title':'Sun Square Sun — Creative Friction',
    'summary':'Powerful tension that can create dynamic growth or exhausting power struggles.',
    'detailed':"""The Sun square Sun is one of the most dynamic and challenging aspects in synastry. Both people approach life, identity and self-expression from fundamentally different angles — and these differences create constant friction.

This friction is not inherently destructive. In fact, the square between two Suns can create an intensely motivating relationship where both people push each other to grow, to be better, to step up. The classic example is the couple that argues constantly but produces extraordinary results together — because each person refuses to accept the other's limitations.

The core challenge is ego. Both people have strong senses of self, but they define selfhood differently. What one considers essential, the other considers trivial. What one sees as strength, the other sees as stubbornness. These differences can feel personally threatening rather than intellectually interesting.

In Vedic astrology, the square creates a challenging karma between two souls who must work out significant differences in how they see the world. This relationship often carries the feeling of "this person drives me crazy but I cannot imagine life without them." The growth potential is enormous — but only if both people commit to understanding rather than winning.""",
    'positives':['Intense motivation to grow','Neither allows the other to be complacent','Dynamic creative tension','Pushes both to their best potential','Unforgettable and transformative'],
    'challenges':['Persistent ego conflicts','Power struggles over decisions','Each can undermine the other\'s confidence','Exhausting constant negotiation of dominance','Risk of resentment building over time'],
    'romance':'Intensely magnetic — the chemistry can be electric. But requires maturity to sustain.',
    'marriage':'Challenging but possible with mutual respect. Define clear roles and honor them.',
    'friendship':'Can be stimulating but also draining — requires clear boundaries.',
  },

  ('Sun','Sun','opposition'): {
    'title':'Sun Opposition Sun — Opposite Suns',
    'summary':'The classic polarity — irresistibly attracted to what the other represents.',
    'detailed':"""The Sun opposition Sun is astrology\'s classic "opposites attract" configuration. Both people represent what the other is not — one is bold where the other is cautious, one is expressive where the other is reserved, one leads where the other follows. This polarity creates magnetic attraction.

The initial draw is powerful precisely because each person sees in the other what they themselves lack. Person A is drawn to Person B's qualities that they secretly wish they had more of — and vice versa. This creates an almost symbiotic dynamic where together they feel complete.

The challenge emerges when the attraction fades and the differences feel like incompatibilities rather than complementary strengths. What was once fascinating becomes frustrating. The very qualities that attracted now irritate. This is especially true when life decisions need to be made — their opposite solar orientations mean they often want to go in different directions.

The highest expression of this aspect is when both people learn to integrate each other's approach rather than simply bouncing between extremes. Person A learns courage and expressiveness from Person B; Person B learns patience and depth from Person A. They become more whole as individuals through the relationship.""",
    'positives':['Magnetic mutual attraction','Each has what the other needs','Creates sense of wholeness together','Fascinating and endlessly interesting','Can balance each other beautifully'],
    'challenges':['Different life directions and priorities','What attracted can later frustrate','Neither naturally accommodates the other','Decision-making conflicts on major life choices','Can feel like constantly bridging a gap'],
    'romance':'Intensely magnetic — one of the most romantically charged of all Sun aspects.',
    'marriage':'Requires conscious integration of differences. The polarity must become complementary.',
    'friendship':'Fascinating but requires accepting fundamental differences in outlook.',
  },

  # ── Sun-Moon ──
  ('Sun','Moon','conjunction'): {
    'title':'Sun Conjunct Moon — Solar-Lunar Union',
    'summary':'One of the most powerful romantic bonds — the masculine and feminine principles merge.',
    'detailed':"""The Sun-Moon conjunction in synastry is considered one of the most significant romantic and marriage indicators in Vedic astrology. When Person A's Sun touches Person B's Moon (or vice versa), the two most fundamental astrological archetypes — the conscious self and the emotional soul — merge into unity.

The Sun person illuminates, energizes and gives life to the Moon person's emotional world. The Moon person receives, nurtures and provides a home for the Sun person's self-expression. This creates a relationship where both people feel fundamentally fulfilled by the other's presence — the Sun person feels truly seen and nourished, the Moon person feels protected and given direction.

This aspect often creates relationships that feel predestined. Both people experience a sense of "coming home" when they are together. The Sun person naturally supports the Moon person's emotional needs without even trying; the Moon person naturally adapts to and supports the Sun person's goals and ambitions.

In Vedic astrology, this conjunction is particularly powerful when it occurs in the 7th house of either person's chart, indicating a strong karmic marriage bond. Even outside the 7th house, the Sun-Moon conjunction creates a relationship that feels necessary — as if both people were specifically designed to be together.""",
    'positives':['Deep sense of belonging with each other','Natural nurturing between partners','Sun energizes Moon\'s dreams; Moon grounds Sun\'s ambitions','One of the strongest marriage indicators','Creates feeling of home in each other'],
    'challenges':['Moon person can become dependent on Sun person\'s approval','Sun person may dominate the relationship\'s direction','Moon person\'s moods can destabilize the Sun person','Need to maintain individual identities'],
    'romance':'Exceptionally romantic — one of the most beautiful aspects in synastry for love.',
    'marriage':'Excellent — naturally creates the complementary dynamic ideal for lasting union.',
    'friendship':'Deep and enduring — these two feel like family to each other.',
  },

  ('Sun','Moon','trine'): {
    'title':'Sun Trine Moon — Effortless Harmony',
    'summary':'Natural emotional flow between partners — understanding comes without effort.',
    'detailed':"""The Sun trine Moon creates one of the most beautifully harmonious emotional connections in synastry. The trine allows the solar and lunar energies to flow together naturally, creating a relationship where both people instinctively understand each other's needs, moods and desires.

The Sun person's vitality and direction effortlessly supports the Moon person's emotional security. When the Moon person is anxious or insecure, the Sun person naturally knows how to restore their confidence. When the Sun person needs encouragement and recognition, the Moon person intuitively provides exactly the right emotional support.

This aspect creates emotional safety — both people feel they can be completely themselves without judgment. The Moon person can express all their emotional complexity without the Sun person taking it personally. The Sun person can express their ambitions and need for recognition without the Moon person feeling threatened or left behind.

In Vedic astrology, this trine suggests a positive karmic history between these two souls. They have helped and supported each other in previous lives, and that positive karma flows into this life as natural emotional ease. This is the aspect of relationships where people say "we never fight" — not because conflict never arises, but because they have a natural emotional language that resolves tension before it escalates.""",
    'positives':['Natural emotional understanding','Safe space for vulnerability','Instinctive support of each other\'s needs','Past life karmic ease','Relationships feels comfortable from day one'],
    'challenges':['May be too comfortable — lack of edge or passion','Need to consciously create growth','Risk of taking each other\'s support for granted'],
    'romance':'Deeply satisfying — the emotional comfort creates lasting romantic warmth.',
    'marriage':'One of the best marriage aspects — enduring emotional harmony.',
    'friendship':'Deeply supportive — like emotional family to each other.',
  },

  ('Sun','Moon','sextile'): {
    'title':'Sun Sextile Moon — Nurturing Partnership',
    'summary':'Good emotional flow with room to grow — supports each other\'s development.',
    'detailed':"""The Sun sextile Moon is a warm and supportive aspect that creates good emotional understanding between partners. Unlike the trine which flows effortlessly, the sextile requires some conscious effort — but this effort is rewarding and produces genuine growth for both people.

The Sun person can learn to understand and honor the emotional complexity of the Moon person, expanding their own emotional intelligence in the process. The Moon person can learn from the Sun person's clarity of purpose and confidence, becoming more directed and self-assured.

This aspect is particularly good for relationships where both people genuinely want to support each other's growth. The sextile creates opportunities for emotional learning — both people regularly surprise and delight each other with new dimensions of themselves that the other hadn't fully appreciated.

In Vedic astrology, this sextile indicates a positive but somewhat unfamiliar soul connection — these two may not have extensive past-life history together, but what history they do share is positive. They meet as potential allies and have genuine opportunity to build something meaningful together through this lifetime.""",
    'positives':['Good emotional understanding','Growth-oriented connection','Opportunities to deepen the bond','Genuine care for each other\'s wellbeing','Positive new karmic beginning'],
    'challenges':['Less automatic than the trine','Must work to understand emotional needs','Can miss each other\'s cues without attention'],
    'romance':'Good and growing — the connection deepens as they invest in understanding each other.',
    'marriage':'Positive — builds stronger over time with mutual investment.',
    'friendship':'Warm and supportive — good emotional allies.',
  },

  ('Sun','Moon','square'): {
    'title':'Sun Square Moon — Emotional Tension',
    'summary':'Powerful attraction with inherent tension between ego and emotion.',
    'detailed':"""The Sun square Moon is one of the most psychologically complex aspects in synastry. The Sun person's sense of self and the Moon person's emotional nature operate from fundamentally different places, creating constant tension that is simultaneously frustrating and compulsively magnetic.

The core tension is between the Sun person's need for recognition, achievement and forward movement versus the Moon person's need for emotional security, stability and depth of feeling. The Sun person can seem cold, ambitious and emotionally unavailable to the Moon person. The Moon person can seem overly sensitive, clingy and emotionally demanding to the Sun person.

Yet despite this friction — or perhaps because of it — the attraction is often intense. The Moon person is drawn to the Sun person's confidence and direction; the Sun person is fascinated by the Moon person's emotional depth and sensitivity. Each has what the other secretly needs.

The relationship works when both people develop genuine respect for the other's fundamental nature. The Sun person must learn to honor emotional needs without dismissing them as weakness. The Moon person must learn to respect the Sun person's need for achievement without taking it as abandonment. When this integration happens, the square becomes profoundly transformative for both.""",
    'positives':['Intense magnetic attraction','Enormous psychological growth potential','Push each other out of comfort zones','Complementary strengths that can unite','Unforgettable emotional experiences'],
    'challenges':['Sun person can feel emotionally overwhelmed by Moon person','Moon person can feel emotionally dismissed by Sun person','Timing conflicts — Sun wants to move, Moon wants to process','Past wounds can be triggered frequently','Risk of emotional manipulation'],
    'romance':'Intensely magnetic but emotionally complex — requires emotional maturity.',
    'marriage':'Challenging but transformative. Requires deep emotional respect from both sides.',
    'friendship':'Can be emotionally draining without clear boundaries.',
  },

  ('Sun','Moon','opposition'): {
    'title':'Sun Opposition Moon — Full Moon Connection',
    'summary':'The Full Moon dynamic — complete polarity that creates wholeness when balanced.',
    'detailed':"""The Sun opposition Moon mirrors the astronomical Full Moon — when the Sun and Moon are on exactly opposite sides. In synastry, this creates a relationship of profound polarity where both people represent complementary halves of a complete whole.

The Sun person embodies conscious direction, external achievement and individual expression. The Moon person embodies unconscious feeling, internal processing and relational sensitivity. These are not contradictory qualities — they are complementary aspects of a complete human experience. When they come together in a relationship, both people can experience dimensions of life they rarely access alone.

This opposition often creates a relationship that feels cosmically significant — like a yin-yang symbol brought to life. Both people sense that the other has something essential that they lack. This creates deep attraction and also profound challenge, because living with your complement means constantly confronting what you have suppressed in yourself.

In Vedic astrology, the Sun-Moon opposition carries echoes of past-life relationships where these souls played dramatically different roles to each other. The current life relationship is an opportunity to integrate those experiences and develop the full spectrum of solar and lunar qualities within each individual.""",
    'positives':['Creates sense of wholeness together','Deeply complementary qualities','Past-life soul recognition','Each has what the other needs','Can create extraordinary balance'],
    'challenges':['Opposite emotional processing styles','Can feel like perpetual balancing act','Timing issues between action and feeling','Easy to project onto each other','Needs conscious effort to find middle ground'],
    'romance':'Deeply romantic — the Full Moon energy creates powerful attraction and emotional resonance.',
    'marriage':'Significant — requires conscious integration. The potential for depth is extraordinary.',
    'friendship':'Fascinating and illuminating — they show each other hidden aspects of themselves.',
  },

  # ── Sun-Venus ──
  ('Sun','Venus','conjunction'): {
    'title':'Sun Conjunct Venus — The Beloved',
    'summary':'One of the most romantic aspects — the Sun person feels the Venus person is their ideal love.',
    'detailed':"""The Sun conjunct Venus in synastry is one of astrology\'s most celebrated romantic aspects. The Venus person embodies exactly the kind of beauty, grace and love that the Sun person finds irresistible. The Sun person shines their light on the Venus person and feels genuinely enchanted by what they illuminate.

The Venus person, in turn, adores the Sun person's vitality, confidence and warmth. The Sun person makes the Venus person feel beautiful and appreciated; the Venus person makes the Sun person feel loved and admired. This mutual appreciation creates a relationship that feels blessed from the beginning.

In Vedic astrology, Venus represents the highest refinement of worldly pleasure, art, love and beauty. When the Sun — the soul's core identity — touches Venus in synastry, the Sun person literally sees their highest ideal of love made flesh in the Venus person. This is the stuff of love poetry and devotion.

The potential challenge is idealization. The Sun person may initially project so much beauty onto the Venus person that disappointment becomes possible when reality asserts itself. The Venus person may feel pressure to maintain the Sun person's idealized image of them. Both must eventually see each other as full human beings rather than ideals.

Despite this, the Sun-Venus conjunction often produces relationships of genuine beauty, creativity and mutual appreciation that can sustain over many years. It is found frequently in the charts of successful, long-term loving partnerships.""",
    'positives':['Intense romantic attraction from day one','Genuine mutual appreciation and admiration','Natural aesthetic harmony — they beautify each other\'s lives','Sun person genuinely adores Venus person','Creates beauty and pleasure together'],
    'challenges':['Risk of idealization leading to disappointment','Venus person may feel pressure to stay "beautiful"','Sun person may take Venus person\'s love for granted','Can create dependency rather than genuine love'],
    'romance':'Exceptionally romantic — one of the top romantic aspects in all of synastry.',
    'marriage':'Very positive — the appreciation tends to deepen rather than fade.',
    'friendship':'Warm and aesthetically rich — they enjoy beauty and pleasure together.',
  },

  ('Sun','Venus','trine'): {
    'title':'Sun Trine Venus — Natural Affection',
    'summary':'Easy, warm love that flows naturally — genuine affection without drama.',
    'detailed':"""The Sun trine Venus is a classic indicator of genuine romantic affection that flows naturally and easily. Unlike the conjunction which can create intense idealization, the trine creates a warm, steady current of appreciation between both people that endures through the ordinary moments of life.

The Sun person finds the Venus person genuinely delightful — their beauty, grace, artistic sensibility and capacity for love all resonate naturally with the Sun person's soul. The Venus person feels naturally at ease around the Sun person's confidence and warmth, and expresses their love freely without fear.

This aspect creates relationships that age beautifully. The initial romantic warmth doesn't dramatically fade — it simply transforms into a deeper, quieter appreciation that makes both people feel continuously lucky to have found each other. They genuinely enjoy each other's company, not just in romantic or passionate moments, but in all the small everyday moments of shared life.

In Vedic astrology, this trine suggests these souls have loved each other before and carry forward the ease and affection of those previous connections. Their love feels familiar, warm and right — like returning to something precious they had somehow temporarily misplaced.""",
    'positives':['Enduring natural warmth and affection','Easy expression of love','Genuine enjoyment of each other\'s company','Aesthetic harmony in shared life','Love that deepens naturally over time'],
    'challenges':['May need to consciously maintain passion','Risk of pleasant comfort turning to routine','Need other chart factors for intensity'],
    'romance':'Beautifully warm and lasting — one of the finest romantic aspects.',
    'marriage':'Excellent — the appreciation and warmth endure through all life seasons.',
    'friendship':'Deeply warm and supportive — they genuinely care for each other.',
  },

  ('Sun','Venus','square'): {
    'title':'Sun Square Venus — Love With Friction',
    'summary':'Strong attraction mixed with ego and values tension — compelling but complicated.',
    'detailed':"""The Sun square Venus creates powerful attraction between two people whose fundamental natures and values operate from different angles. The Sun person is drawn to the Venus person's beauty and grace; the Venus person is drawn to the Sun person's confidence and vitality. But once the initial attraction brings them together, differences in how they approach love, pleasure and values create friction.

The Sun person may feel that the Venus person is too focused on pleasure, beauty and social harmony at the expense of genuine achievement and purpose. The Venus person may feel that the Sun person is too self-focused, achievement-oriented and unwilling to slow down and appreciate the finer qualities of life and relationship.

Despite this friction — or perhaps because of it — the attraction can be compulsive. The square creates a dynamic tension that generates heat and intensity. Many people with this aspect describe their partner as "maddening but irresistible." The relationship doesn't flow easily, but the magnetic pull keeps bringing both people back.

The highest expression of this aspect is when the Sun person learns from the Venus person to slow down, appreciate beauty and prioritize love alongside achievement; and when the Venus person learns from the Sun person to channel their love of beauty and pleasure into purposeful creative expression.""",
    'positives':['Intense magnetic attraction','Each challenges the other to grow','Dynamic creative tension','Can produce great art or projects together','Passion that doesn\'t easily fade'],
    'challenges':['Values and priority conflicts','Sun person can overshadow Venus person','Venus person can feel the Sun person doesn\'t truly appreciate them','Financial disagreements common','Social style clashes'],
    'romance':'Intensely magnetic but requires navigating real differences.',
    'marriage':'Challenging — requires deep values alignment work. But passion can sustain.',
    'friendship':'Interesting but can involve tension around social values and priorities.',
  },

  ('Sun','Venus','opposition'): {
    'title':'Sun Opposition Venus — Magnetic Polarity',
    'summary':'Classic romantic polarity — each represents what the other most desires in love.',
    'detailed':"""The Sun opposition Venus is one of the most romantically magnetic aspects in synastry. The opposition creates a powerful polarity where the Sun person represents vitality, purpose and the masculine principle of active self-expression, while the Venus person represents beauty, receptivity and the feminine principle of loving reception.

This polarization creates irresistible attraction. The Sun person sees in the Venus person the embodiment of beauty, love and everything that makes life worth achieving for. The Venus person sees in the Sun person the strength, purpose and vitality that gives love its context and protection.

The challenge of the opposition is that what initially attracts can later create distance. The Sun person's drive and ambition can leave the Venus person feeling overlooked and taken for granted. The Venus person's focus on harmony and beauty can frustrate the Sun person who feels their larger goals are being minimized.

In Vedic astrology, this opposition suggests a strong past-life romantic bond — these souls have been drawn to each other across multiple lifetimes by this same polarity. The current life offers the opportunity to transcend the polarity and achieve a genuine meeting of equals — where the Sun's purpose and Venus's love create something greater than either alone.""",
    'positives':['One of the most romantic aspects in synastry','Profound physical and romantic attraction','Each offers what the other needs','Sense of completion together','Strong past-life love bond'],
    'challenges':['Sun person can feel Venus person is too focused on comfort','Venus person can feel Sun person doesn\'t prioritize love enough','Decision-making conflicts','Different social values','May idealize each other initially'],
    'romance':'Intensely romantic — magnetic, beautiful and deeply felt.',
    'marriage':'Requires conscious balance. When integrated, creates beautiful lasting union.',
    'friendship':'Warm and aesthetically rich — genuine enjoyment of each other.',
  },

  # ── Sun-Mars ──
  ('Sun','Mars','conjunction'): {
    'title':'Sun Conjunct Mars — Electric Passion',
    'summary':'Raw, electric attraction — dynamic energy that can be passionate or combative.',
    'detailed':"""The Sun conjunct Mars is one of the most dynamically charged aspects in synastry. When Person A's Sun meets Person B's Mars in close conjunction, two potent forces of energy, will and vitality combine to create an intensely charged connection.

This aspect creates immediate physical attraction and energetic excitement. The Mars person activates and excites the Sun person's vitality; the Sun person gives the Mars person's drive a clear target and purpose. Together they feel capable of accomplishing anything — their combined energy creates a force that can move mountains.

The challenge is that Mars energy is inherently aggressive and combative. When Mars meets the Sun — the core self — conflicts become personal very quickly. Disagreements escalate rapidly because both people have strong wills and neither easily backs down. The same energy that creates passion can erupt into genuine anger.

In Vedic astrology, the Sun-Mars conjunction carries powerful warrior energy. These souls have fought alongside each other in past lives, and the relationship carries that charge of battle — sometimes fighting together against the world, sometimes fighting each other. The key is ensuring their combat is always directed outward toward shared challenges, never inward toward each other.""",
    'positives':['Intense physical attraction','Shared drive and ambition','Dynamic energy to accomplish great things','Protective — each defends the other fiercely','Exciting, never boring'],
    'challenges':['Quick to anger with each other','Power struggles and dominance conflicts','Can be aggressive and hurtful','Impulsive decisions together','Risk of physical tension becoming aggression'],
    'romance':'Intensely passionate — explosive chemistry. Requires maturity to channel.',
    'marriage':'Challenging without emotional maturity — the anger must be consciously managed.',
    'friendship':'Dynamic and exciting — best when channeling energy into shared projects.',
  },

  ('Sun','Mars','trine'): {
    'title':'Sun Trine Mars — Energizing Partnership',
    'summary':'The Mars person energizes and activates the Sun person — dynamic, motivating, positive.',
    'detailed':"""The Sun trine Mars creates one of the most energizing and motivating connections in synastry. Unlike the conjunction which can turn volatile, the trine allows Mars energy to flow into the Sun person's life in a consistently supportive way.

The Mars person becomes the Sun person's greatest champion and motivator. They believe in the Sun person's potential and push them toward their highest expression without the aggression or ego-clashing that can accompany the conjunction or square. The Sun person, in turn, gives the Mars person's energy clear direction and purpose — the Mars person knows exactly where to direct their drive when they are with the Sun person.

Together they accomplish more than either could alone. Projects get started and completed. Goals that seemed distant become achievable. The Mars person provides the fuel; the Sun person provides the direction. This is an excellent aspect for any partnership requiring sustained effort and drive.

In terms of romance, the trine creates a relationship with enduring physical attraction and natural chemistry that maintains itself over time. The energy between them stays alive without requiring constant crisis or drama to sustain it. This is the couple that remains physically affectionate and motivated together decades into their relationship.""",
    'positives':['Enduring physical attraction','Natural motivation and drive together','Accomplish great things as partners','Sun person feels energized and supported','Mars person feels purposeful and directed'],
    'challenges':['Can become competitive if not conscious','Need to balance ambition with emotional connection','May prioritize action over feeling'],
    'romance':'Excellent — sustained physical chemistry and energizing attraction.',
    'marriage':'Very positive — they motivate each other and achieve great things together.',
    'friendship':'Dynamic and productive — powerful allies.',
  },

  ('Sun','Mars','square'): {
    'title':'Sun Square Mars — The Sparring Partners',
    'summary':'The most challenging Sun-Mars aspect — intense attraction mixed with genuine conflict.',
    'detailed':"""The Sun square Mars is perhaps the most challenging and simultaneously most compulsive aspect in synastry. The energy between these two people is extraordinary — intensely magnetic, deeply stimulating, often infuriating and consistently impossible to ignore.

The fundamental challenge is that Mars is the planet of aggression, conflict and raw power, and when it squares the Sun — the core identity — conflicts feel existentially threatening. The Sun person experiences the Mars person as aggressive, forceful and threatening to their sense of self. The Mars person experiences the Sun person as arrogant, domineering and dismissive of their power.

And yet — the attraction is often overwhelming. There is something about the Mars person's raw energy and directness that the Sun person finds irresistible, even as it provokes them. The Sun person's confidence and vitality activates the Mars person in ways that feel exciting even when frustrating.

Many intense, transformative romantic relationships carry this aspect. The relationship becomes a crucible for growth — both people are forced to develop emotional intelligence, learn to manage anger constructively, and discover the difference between genuine conflict and compulsive combat. When both partners achieve this, the square becomes one of the most dynamic and productive connections imaginable.""",
    'positives':['Electrifying, unforgettable connection','Forces genuine emotional growth','Intense physical and energetic attraction','Neither lets the other become complacent','Can channel into extraordinary shared achievement'],
    'challenges':['Quick and intense arguments','Ego battles that escalate rapidly','Mars person can feel dominant; Sun person reactive','High risk of hurtful words and actions','Exhausting without emotional tools'],
    'romance':'Intensely magnetic — but can be tumultuous. The passion is real but so is the conflict.',
    'marriage':'Requires significant emotional maturity. Counseling can help channel the energy.',
    'friendship':'Stimulating but potentially exhausting — clear boundaries essential.',
  },

  # ── Moon-Moon ──
  ('Moon','Moon','conjunction'): {
    'title':'Moon Conjunct Moon — Emotional Twins',
    'summary':'Deep emotional resonance — they feel each other\'s feelings naturally.',
    'detailed':"""When two Moons conjoin in synastry, something remarkable happens: both people feel immediately emotionally understood in a way they rarely experience with anyone else. Their emotional needs, instinctive responses, moods and ways of processing feeling are so similar that communication on the emotional level becomes almost telepathic.

This aspect creates extraordinary emotional safety. Both people can be completely vulnerable with each other because they instinctively understand emotional reactions that might confuse others. When one person is moody, the other doesn't take it personally — they've been there themselves. When one needs to retreat into silence, the other understands without explanation.

The potential challenge is emotional amplification. When both people experience the same emotional state simultaneously, difficult emotions can intensify rather than being balanced. If both are anxious, the anxiety compounds. If both are sad, the sadness deepens. There is no natural emotional counterbalance unless both have developed significant emotional self-awareness.

In Vedic astrology, same-Moon or very closely aspected Moon placements suggest these souls have shared deeply intimate emotional spaces in multiple previous lifetimes — often as family members or very close friends. The familiarity is genuine and runs extraordinarily deep.""",
    'positives':['Extraordinary emotional understanding','Immediate sense of being truly known','Emotional safety and vulnerability','Shared instincts and responses','Deep past-life emotional bond'],
    'challenges':['Can amplify difficult emotions','Both sensitive simultaneously — no natural stabilizer','Risk of emotional codependency','May enable each other\'s emotional avoidance','Hard to challenge each other\'s emotional patterns'],
    'romance':'Deeply intimate and emotionally rich — though may lack polarity.',
    'marriage':'Emotionally safe and nurturing — like emotional family to each other.',
    'friendship':'Profound — they can tell each other everything.',
  },

  ('Moon','Moon','trine'): {
    'title':'Moon Trine Moon — Emotional Harmony',
    'summary':'Natural emotional flow and mutual understanding — comfortable from day one.',
    'detailed':"""The Moon trine Moon creates beautiful emotional harmony between two people. Their emotional natures are different enough to be interesting, but their fundamental emotional orientations flow in the same compatible direction. Neither person has to explain their emotional needs extensively — the other simply understands.

This aspect creates relationships that feel emotionally comfortable from the very beginning. There is an ease of emotional communication that most people spend years trying to achieve. Both people's emotional rhythms — when they need connection, when they need space, how they process difficult feelings — align naturally enough that frustration rarely arises.

The trine also creates a positive emotional environment for shared life. Both people help each other process difficulties effectively, celebrate joys genuinely and maintain emotional equilibrium through life's inevitable challenges. This emotional stability becomes the foundation on which everything else in the relationship is built.

The potential gentle challenge is that this trine is so comfortable it can occasionally lead to emotional complacency. Both people feel so emotionally at ease that they may neglect to actively deepen their emotional connection, taking the harmony for granted. Conscious investment in emotional intimacy ensures this beautiful trine continues to grow.""",
    'positives':['Natural emotional ease','Excellent emotional communication','Mutually supportive emotional environment','Both feel understood without extensive explanation','Creates stable foundation for relationship'],
    'challenges':['May take emotional harmony for granted','Risk of emotional complacency','Need other aspects for passion and depth'],
    'romance':'Deeply emotionally satisfying — creates lasting intimate connection.',
    'marriage':'Excellent — the emotional stability supports all other areas of partnership.',
    'friendship':'Warm and nurturing — genuinely good for each other\'s emotional health.',
  },

  ('Moon','Moon','square'): {
    'title':'Moon Square Moon — Emotional Friction',
    'summary':'Emotionally stimulating but challenging — very different emotional natures.',
    'detailed':"""The Moon square Moon creates significant emotional complexity between two people. Their emotional natures, instinctive responses and ways of processing feeling operate from fundamentally different orientations. What feels comforting to one feels unfamiliar or even threatening to the other.

One person may process emotions by talking about them extensively while the other needs silent space. One may need physical closeness when distressed while the other withdraws. One may express feelings dramatically while the other processes quietly. These differences mean that at the exact moments when both people need emotional support, they have conflicting needs for how to receive it.

Despite this challenge, the Moon square Moon can create a profoundly growth-oriented relationship. Being with someone whose emotional nature is so different forces both people to develop emotional intelligence they wouldn't develop alone. Both expand their emotional repertoire by learning to honor and understand an emotional style entirely unlike their own.

In Vedic astrology, this square indicates these souls are working out significant karmic differences in emotional nature. They have come together in this life with quite different emotional conditioning, and the relationship's purpose is partly to help each person transcend their limited emotional patterns and develop a more complete emotional range.""",
    'positives':['Forces emotional growth','Develops emotional intelligence','Helps both expand emotional range','Interesting and non-boring emotional dynamic','Can create profound mutual understanding through effort'],
    'challenges':['Frequent emotional misunderstandings','Different needs at critical moments','Emotional timing conflicts','One partner\'s needs can feel alien to the other','High emotional maintenance required'],
    'romance':'Emotionally complex — requires significant empathy and patience.',
    'marriage':'Challenging — emotional differences need conscious work. Counseling helpful.',
    'friendship':'Emotionally stimulating but can be draining without boundaries.',
  },

  # ── Moon-Venus ──
  ('Moon','Venus','conjunction'): {
    'title':'Moon Conjunct Venus — Love Made Tender',
    'summary':'One of the most beautiful romantic aspects — emotional depth meets love\'s grace.',
    'detailed':"""The Moon conjunct Venus is considered one of the most beautiful and harmonious romantic aspects in all of synastry. When these two planets of emotion, beauty, love and receptivity merge, a relationship of extraordinary tenderness, warmth and emotional richness is created.

The Moon person finds in the Venus person the most loving, beautiful and emotionally responsive partner they could imagine. Everything about the Venus person — their warmth, their grace, their capacity for love, their sensitivity to beauty — touches the Moon person at the deepest emotional level. The Venus person feels genuinely received, appreciated and emotionally safe with the Moon person. The Moon person's emotional depth and caring nature is exactly what the Venus person needs to open their heart fully.

This aspect creates relationships of great tenderness and genuine mutual care. Both people naturally want to protect each other, please each other, and create beauty in their shared life. Arguments are rare and resolve quickly because neither person truly wants to hurt the other. They have a natural instinct to soften their approach when they sense they've caused pain.

In Vedic astrology, the Moon-Venus conjunction suggests these two souls have shared lives of love and emotional beauty together before. The ease and warmth they feel reflects genuine karmic affection — they have loved each other before and the love comes back naturally, like a familiar song.

This aspect is particularly powerful for romantic partnerships and marriage, but also creates the warmest and most emotionally nourishing friendships. Wherever these two come together, beauty and emotional richness follow.""",
    'positives':['Extraordinary tenderness and warmth','Genuine mutual care and affection','Natural emotional and aesthetic harmony','Creates beautiful shared life together','Deep emotional intimacy and safety','Both want to please and protect the other'],
    'challenges':['Can be overly indulgent together','May avoid difficult conversations to maintain harmony','Risk of emotional over-sensitivity on both sides','Can enable each other\'s emotional avoidance'],
    'romance':'One of the most beautiful romantic aspects — tender, warm and deeply loving.',
    'marriage':'Excellent — genuine mutual care creates enduring loving partnership.',
    'friendship':'Deeply warm and emotionally nourishing — like emotional family.',
  },

  ('Moon','Venus','trine'): {
    'title':'Moon Trine Venus — Tender Harmony',
    'summary':'Natural flow of love and emotional warmth — one of the finest romantic aspects.',
    'detailed':"""The Moon trine Venus is universally recognized as one of the most beautiful aspects in synastry for romantic relationships. The trine creates an effortless flow of emotional warmth, genuine affection and mutual care that makes both people feel loved, beautiful and emotionally nourished.

The Moon person's emotional sensitivity and depth resonates perfectly with the Venus person's capacity for love, beauty and harmony. Neither person has to work hard to express care — it flows naturally and is naturally received. When the Moon person is emotionally vulnerable, the Venus person responds with exactly the right blend of comfort and appreciation. When the Venus person needs to feel beautiful and loved, the Moon person instinctively provides deep emotional validation.

What makes this trine particularly special is its durability. Many romantic aspects fade as initial excitement gives way to familiarity. The Moon-Venus trine deepens over time. The longer both people are together, the more deeply the emotional warmth and loving appreciation roots itself in the relationship. This creates one of those rare relationships that literally gets more loving and tender as years pass.

This aspect also creates natural aesthetic harmony between partners. They likely share similar tastes in home environment, art, food and social life — the practical aesthetics of shared living are naturally aligned, reducing the friction that different aesthetic sensibilities can create in long-term cohabitation.

In Vedic astrology, this trine indicates a blessed karmic bond of mutual loving support across lifetimes. These souls have cared for each other before, and that care flows forward into the present relationship with remarkable ease and beauty.""",
    'positives':['Natural, effortless emotional warmth','Genuine loving appreciation that deepens over time','Shared aesthetic sensibility in home and life','Both feel consistently loved and beautiful','Creates enduring romantic tender connection','Rare ease of emotional and loving communication'],
    'challenges':['May become too comfortable — need to maintain intentional romance','Risk of taking each other\'s love for granted','May avoid necessary difficult conversations'],
    'romance':'One of the finest romantic aspects in synastry — warm, beautiful and enduring.',
    'marriage':'Excellent — the loving warmth creates a genuinely beautiful shared life.',
    'friendship':'Deeply nourishing and genuinely warm — exceptional emotional friends.',
  },

  ('Moon','Venus','sextile'): {
    'title':'Moon Sextile Venus — Warm Affection',
    'summary':'Good emotional-romantic flow with room to grow — genuine affection and warmth.',
    'detailed':"""The Moon sextile Venus creates a warm and genuinely affectionate connection between two people. While it requires more conscious cultivation than the trine, the rewards of that effort are real and lasting.

The emotional warmth between Moon and Venus here is genuine — both people truly care about each other's feelings and wellbeing. The Moon person's emotional sensitivity resonates with the Venus person's loving nature, creating a relationship with real tenderness at its core.

The sextile suggests these two can build something beautiful together through conscious investment in their connection. Each time they choose to express care, to appreciate each other's beauty, to honor each other's emotional needs, they strengthen a bond that has genuine potential to become deeply loving.

This is also a good aspect for aesthetic collaboration. They may enjoy decorating a shared space, cooking together, creating art, or simply appreciating beautiful things in the world. Their shared capacity for pleasure and beauty in life is a genuine source of ongoing delight.""",
    'positives':['Genuine warmth and affection','Good emotional-romantic resonance','Shared appreciation for beauty and pleasure','Grows more loving with investment','Natural caring instinct toward each other'],
    'challenges':['Requires conscious cultivation','Less automatic than the trine','Can miss expressing care without attention'],
    'romance':'Good and growing — deepens with mutual investment.',
    'marriage':'Positive — genuine care creates good foundation.',
    'friendship':'Warm and nourishing — good emotional support.',
  },

  ('Moon','Venus','square'): {
    'title':'Moon Square Venus — Love\'s Challenge',
    'summary':'Deep attraction with tension between emotional needs and loving values.',
    'detailed':"""The Moon square Venus creates a relationship of genuine attraction mixed with real tension. The Moon person's emotional nature and the Venus person's loving values operate from different orientations that can create significant misunderstanding despite genuine affection.

The Moon person needs deep emotional security, vulnerability and the sense of being truly known. The Venus person needs beauty, harmony, appreciation and pleasant social connection. These needs are not necessarily incompatible — but the way each person pursues and expresses them can create friction.

The Moon person may find the Venus person superficial — too focused on appearances, social harmony and pleasantness rather than emotional depth. The Venus person may find the Moon person overly demanding, emotionally intense or creating disharmony with their emotional needs. Both assessments contain partial truth, which is precisely what makes the square challenging.

Despite this tension, the attraction is often real and persistent. The Venus person finds the Moon person's emotional depth and vulnerability genuinely touching; the Moon person finds the Venus person's beauty and loving warmth genuinely irresistible. The relationship has genuine substance — but it requires both people to expand beyond their natural comfort zones to access it.

The growth opportunity is profound: the Moon person learns to appreciate beauty and social harmony as genuine expressions of love; the Venus person learns to honor emotional depth and vulnerability as the most genuine beauty of all.""",
    'positives':['Genuine attraction and care','Each has something the other needs','Growth opportunity for both','The love, though challenged, is real','Can create deep appreciation through work'],
    'challenges':['Different love languages create misunderstandings','Moon person can feel Venus person is superficial','Venus person can feel Moon person is emotionally demanding','Harmony-conflict over social vs emotional needs','Potential hurt feelings when needs conflict'],
    'romance':'Real attraction but emotionally complex — requires empathy and understanding.',
    'marriage':'Challenging — love languages must be consciously learned and honored.',
    'friendship':'Warm but occasionally complicated by different emotional-social needs.',
  },

  ('Moon','Venus','opposition'): {
    'title':'Moon Opposition Venus — Emotional-Love Polarity',
    'summary':'Compelling romantic polarity — emotional depth meets loving grace in perfect tension.',
    'detailed':"""The Moon opposition Venus creates one of the most romantically compelling polarities in synastry. The Moon's emotional depth, vulnerability and need for genuine intimate connection stands in direct polarity to Venus's loving grace, beauty, harmony and receptive warmth.

This opposition creates irresistible attraction because both planets are fundamentally concerned with love and connection — but they approach it from opposite directions. The Moon represents love as deep emotional intimacy and vulnerability. Venus represents love as beauty, harmony and graceful giving. Neither is more or less loving than the other — they simply inhabit different dimensions of the vast territory of love.

The Moon person is drawn to the Venus person's graceful expression of love, their beauty and their capacity to create harmony. The Venus person is drawn to the Moon person's emotional depth, vulnerability and the sense that being loved by the Moon person means being truly, deeply known.

The challenge is that these two approaches to love can feel like they're speaking different languages. The Moon person may want to go deep into emotional processing while the Venus person wants to restore harmony and beauty. The Venus person may want to express love through beautiful gestures while the Moon person wants to express love through emotional vulnerability and shared feeling.

When both people honor both dimensions — when the Moon person appreciates Venus's beauty and the Venus person honors the Moon's depth — the opposition becomes the most beautifully complete expression of love possible.""",
    'positives':['Deeply romantic and compelling','Each represents the other\'s romantic ideal','Sense of completing each other in love','Enduring attraction across time','Can create the most beautiful love when integrated'],
    'challenges':['Different love languages at their core','Emotional needs vs harmony needs in tension','Can feel like never quite meeting fully','Moon person\'s moodiness vs Venus person\'s harmony-seeking'],
    'romance':'Deeply romantic — one of the most compelling love-oriented oppositions.',
    'marriage':'Beautiful potential — requires conscious honoring of both love styles.',
    'friendship':'Warm and aesthetically rich — genuine care for each other.',
  },

  # ── Venus-Mars ──
  ('Venus','Mars','conjunction'): {
    'title':'Venus Conjunct Mars — Pure Romantic Chemistry',
    'summary':'The classic romantic and physical chemistry aspect — yin and yang of love.',
    'detailed':"""The Venus conjunct Mars is perhaps the most celebrated romantic and physical chemistry aspect in all of synastry. Venus — the principle of feminine receptivity, beauty and love — and Mars — the principle of masculine drive, passion and desire — come together in their purest expression.

When Person A's Venus meets Person B's Mars (or vice versa), an almost electric romantic and physical attraction is created. The Mars person desires the Venus person with real intensity — they pursue, they initiate, they are genuinely captivated. The Venus person receives the Mars person's desire with genuine pleasure — they feel beautiful, wanted and genuinely alive in the Mars person's presence.

This aspect often creates the experience of instant chemistry that people describe as "there was just something between us from the moment we met." It's not imaginary — this aspect creates a genuine energetic dynamic that most people spend their lives hoping to find.

The Mars person feels motivated and directional by the Venus person's love; the Venus person feels beautiful and appreciated by the Mars person's desire. Together they create the fundamental polarity of romantic love: pursuit and reception, active and receptive, giving and receiving.

In Vedic astrology, Venus and Mars are natural complementary forces — Venus is the karaka of love and Mars the karaka of passion. When they conjoin in synastry, the relationship carries powerful creative and procreative potential. This aspect is found frequently in the charts of couples who produce either children or creative works together — sometimes both.""",
    'positives':['Intense physical and romantic chemistry','Genuine passionate attraction','Natural polarity of desire and reception','Highly creative together','Classic romance aspect — enduring allure'],
    'challenges':['Mars person can be too aggressive for Venus person','Venus person can seem passive to Mars person','Physical attraction can substitute for emotional depth','Conflict when Mars drives and Venus retreats','Jealousy if either feels desired by others'],
    'romance':'One of the most powerfully romantic aspects in synastry — classic passionate love.',
    'marriage':'Excellent for keeping the passion alive. Add emotional depth for full partnership.',
    'friendship':'Warm with underlying romantic tension — can be complicated.',
  },

  ('Venus','Mars','trine'): {
    'title':'Venus Trine Mars — Enduring Attraction',
    'summary':'Natural romantic chemistry that sustains itself beautifully over time.',
    'detailed':"""The Venus trine Mars creates romantic and physical attraction that flows naturally and sustains beautifully over time. Unlike the conjunction which can create explosive intensity that requires management, the trine creates a steady, enduring current of romantic attraction that maintains itself through all seasons of the relationship.

The Mars person's drive and passion flows naturally toward the Venus person, who receives it with genuine pleasure. The Venus person's beauty and loving warmth naturally activates the Mars person's protective devotion. This natural flow means that romantic and physical attraction between them doesn't require effort to maintain — it simply is.

This trine is particularly valuable in long-term partnerships because it addresses one of the most common challenges of enduring relationships: the fading of physical attraction over time. The trine between Venus and Mars creates an attraction that actually deepens with familiarity rather than fading. The more these two people know each other, the more they desire each other.

They also enjoy a natural creative harmony. Projects they undertake together balance Venus's aesthetic sensibility with Mars's drive and execution. They can create beautiful things together — whether those things are a home, a family, art or a business.""",
    'positives':['Enduring romantic and physical attraction','Natural creative harmony','Desire grows with familiarity','Easy romantic expression','Protective devotion from Mars, loving reception from Venus'],
    'challenges':['May lack the intensity of the conjunction','Need conscious effort to maintain passion peaks','Other chart factors needed for depth'],
    'romance':'Excellent — sustained romantic attraction that deepens over time.',
    'marriage':'Very positive — keeps romantic energy alive through all life seasons.',
    'friendship':'Warm with natural easy rapport — pleasant and comfortable.',
  },

  # ── Jupiter combinations ──
  ('Jupiter','Moon','conjunction'): {
    'title':'Jupiter Conjunct Moon — Emotional Expansion',
    'summary':'Jupiter expands and blesses the Moon person\'s emotional world — one of the most benevolent aspects.',
    'detailed':"""The Jupiter conjunct Moon in synastry is one of the most benevolent and positive aspects two people can share. Jupiter — the Great Benefic, the planet of expansion, wisdom, fortune and divine grace — touches the Moon — the seat of emotion, security and the inner self. The result is a relationship that genuinely makes both people feel blessed.

The Jupiter person has an almost miraculous positive effect on the Moon person's emotional life. In the Jupiter person's presence, the Moon person feels more hopeful, more expansive, more emotionally generous and more trusting of life. Old emotional wounds seem less severe; fears become more manageable; the future looks brighter. The Jupiter person doesn't have to do anything special to create this effect — their presence alone has this enriching quality for the Moon person.

The Moon person, in return, provides the Jupiter person with the kind of emotional home and grounded nurturing that allows Jupiter's wisdom to deepen into genuine understanding rather than remaining purely philosophical. The Moon person helps Jupiter feel rather than merely think about the truths they carry.

In Vedic astrology, Jupiter is the guru and the Moon is the mind. When the guru touches the mind, illumination follows. This is a relationship where both people genuinely grow and become wiser through their connection. The Moon person develops philosophical depth and optimism; the Jupiter person develops emotional intelligence and genuine compassion.

This aspect is found frequently in the charts of teacher-student relationships, mentor-mentee bonds, and marriages where both people report that their partner has made them "a better person." The effect is genuine — Jupiter's expansion of the Moon creates real emotional and spiritual growth.""",
    'positives':['Jupiter person genuinely uplifts Moon person\'s spirits','Creates sense of abundance and emotional wealth','Both grow philosophically and emotionally','Generous and optimistic emotional environment','Genuine sense of divine blessing in the relationship'],
    'challenges':['Jupiter person can promise more than they deliver emotionally','Moon person can become dependent on Jupiter\'s optimism','Jupiter may gloss over emotional depth with philosophy','Can encourage unrealistic optimism'],
    'romance':'Deeply warm and uplifting — Moon person feels truly blessed in Jupiter\'s presence.',
    'marriage':'Excellent — creates genuine sense of growth and blessing in the partnership.',
    'friendship':'One of the finest friendship aspects — Jupiter genuinely improves the Moon person\'s life.',
  },

  ('Jupiter','Venus','conjunction'): {
    'title':'Jupiter Conjunct Venus — Abundance in Love',
    'summary':'The most auspicious romantic aspect — love, beauty and fortune flow abundantly.',
    'detailed':"""The Jupiter conjunct Venus in synastry is frequently called the "lottery of love" — when the planet of fortune, expansion and divine grace meets the planet of love, beauty and pleasure, the result is a relationship that genuinely feels blessed from the cosmos.

Both Venus and Jupiter are natural benefics in Vedic astrology — they bring good things wherever they go. When they conjoin in synastry, their combined beneficence creates a relationship of extraordinary warmth, generosity, beauty and genuine good fortune. Both people feel luckier, more beautiful and more loved when they are together.

The Jupiter person expands the Venus person's capacity for love and beauty — helping them love more generously, appreciate beauty more deeply and express their affectionate nature more freely. The Venus person softens and beautifies Jupiter's philosophical expansion, helping Jupiter's wisdom become genuinely loving rather than merely intellectual.

Together they create an abundant environment — financially, socially, emotionally and spiritually. This couple tends to attract good things: beautiful homes, social recognition, creative success, financial stability and genuine happiness. Their combined energy is magnetic to positive experiences.

In Vedic astrology, this conjunction is one of the most sought-after indicators of a truly happy and prosperous marriage. It suggests these souls have accumulated significant positive karma together across lifetimes, and that positive karma now manifests as a relationship of genuine abundance and blessing.""",
    'positives':['One of the most auspicious romantic aspects','Genuine sense of cosmic blessing','Creates abundance — financial, emotional, social','Both feel luckier in each other\'s presence','Generous, warm and joyful shared life'],
    'challenges':['Can encourage overindulgence together','May avoid necessary difficulties in favor of pleasure','Risk of taking good fortune for granted','Financial extravagance possible'],
    'romance':'One of the most auspicious romantic aspects — love feels genuinely blessed.',
    'marriage':'Excellent — creates abundance, warmth and genuine happiness together.',
    'friendship':'Deeply positive — each genuinely improves the other\'s fortune and wellbeing.',
  },

  # ── Saturn combinations ──
  ('Saturn','Moon','conjunction'): {
    'title':'Saturn Conjunct Moon — The Karmic Bond',
    'summary':'Deep karmic obligation — Saturn disciplines and structures the Moon\'s emotional world.',
    'detailed':"""The Saturn conjunct Moon in synastry is one of the most karmic and complex aspects two people can share. Saturn — the planet of karma, discipline, restriction and time — touches the Moon — the seat of emotion, vulnerability and the inner child. This creates a bond of profound karmic weight and significance.

The Saturn person has a deeply stabilizing and sometimes restricting effect on the Moon person's emotional expression. In the Saturn person's presence, the Moon person may feel more serious, more responsible and more contained — sometimes this creates genuine security and groundedness, and sometimes it creates emotional inhibition and a sense of being controlled or criticized.

The Moon person may initially experience the Saturn person as cold, demanding or emotionally unavailable. The Saturn person may initially experience the Moon person as too emotional, needy or unstable. Yet despite these apparent incompatibilities, the attraction and the bond tend to be remarkably persistent — even when both people know consciously that the relationship is challenging, they find it difficult to separate.

This persistence reflects the karmic nature of the connection. In Vedic astrology, Saturn represents past-life karma that must be worked through. The Moon person has soul-level work to do with the Saturn person — and vice versa. The relationship, however challenging, contains exactly what both souls need for their spiritual development.

The highest expression of this aspect is when the Saturn person provides genuine structure and wisdom that helps the Moon person's emotional life become more sustainable and grounded, and the Moon person helps the Saturn person access genuine emotional warmth and vulnerability. When this integration happens, the relationship becomes one of extraordinary depth, loyalty and enduring commitment.""",
    'positives':['Deep karmic bond of genuine significance','Saturn provides structure for Moon\'s emotions','Can create extraordinary commitment and loyalty','Profound mutual growth through challenge','Enduring bond that transcends surface ease'],
    'challenges':['Moon person can feel emotionally restricted or criticized','Saturn person can seem cold or demanding to Moon','Emotional inhibition in relationship','Moon person may feel they can\'t fully express feelings','Can create dependency mixed with resentment'],
    'romance':'Complex and intense — felt as destiny or burden or both simultaneously.',
    'marriage':'Common in long-term marriages — the karmic weight creates commitment.',
    'friendship':'Deep and obligatory — they feel responsible for each other.',
  },

  ('Saturn','Venus','trine'): {
    'title':'Saturn Trine Venus — Love That Endures',
    'summary':'Lasting, committed love — Saturn gives Venus relationship the quality of time.',
    'detailed':"""The Saturn trine Venus is one of the finest indicators of lasting, committed love in synastry. Saturn — the planet of time, commitment and endurance — trines Venus — the planet of love and beauty — creating a relationship where love and commitment naturally support each other.

The Saturn person provides the Venus person's love with structure, durability and genuine seriousness of purpose. The relationship isn't merely romantic — it becomes a genuine life partnership built on real commitment. The Venus person helps soften Saturn's seriousness, bringing beauty, warmth and genuine affection into what might otherwise become overly dutiful and dry.

This trine creates love that genuinely improves with time. Unlike purely Venus-flavored relationships that may burn brightly and fade, the Saturn trine Venus creates love that deepens as years pass. Both people become more committed, more appreciative and more genuinely loving toward each other as they share more of life's journey.

In Vedic astrology, this trine suggests these souls have been committed to each other across lifetimes. The current relationship carries that accumulated karmic commitment as a natural ease of enduring love. They don't have to force themselves to stay committed — commitment is simply the natural expression of what they feel for each other.""",
    'positives':['Love deepens and grows more committed over time','Natural durability and staying power','Saturn takes Venus\'s love seriously and honors it','Genuine life partnership quality','Past-life commitment flows naturally forward'],
    'challenges':['Can be somewhat serious — need to cultivate lightness','Saturn may occasionally dampen Venus\'s spontaneous joy','Must balance duty with pleasure consciously'],
    'romance':'Deeply romantic with enduring quality — love that genuinely lasts.',
    'marriage':'One of the finest marriage aspects — commitment and love naturally aligned.',
    'friendship':'Deeply loyal and enduring — they stay through everything.',
  },

  # ── Rahu combinations ──
  ('Rahu','Sun','conjunction'): {
    'title':'Rahu Conjunct Sun — Obsessive Fascination',
    'summary':'Rahu amplifies and obsesses over the Sun person — intensely magnetic, karmically complex.',
    'detailed':"""The Rahu conjunct Sun in synastry creates one of the most intensely magnetic and karmically significant connections in all of astrology. Rahu — the north node, representing obsession, amplification, desire and karmic hunger — touches the Sun — the core self, vitality and life purpose. The result is a relationship that feels destined, compelling and sometimes overwhelming.

The Rahu person is almost compulsively drawn to the Sun person. There is something about the Sun person's vitality, confidence and way of being in the world that the Rahu person finds endlessly fascinating. They may not be able to fully explain or rationalize this fascination — it simply exists with irresistible intensity. The Rahu person wants to be near the Sun person, to absorb their energy, to somehow access what the Sun person embodies.

The Sun person, in turn, often feels strangely amplified in the Rahu person's presence — more vital, more significant, more radiant. But they may also feel slightly unsettled, as though the Rahu person is asking something of them they cannot fully define.

In Vedic astrology, Rahu represents karmic hunger — what the soul desperately needs to experience and integrate in this lifetime. When Rahu touches another person's Sun, it suggests the Rahu person has a significant karmic purpose involving this person's life force and self-expression. This is not a casual connection — it carries the weight of genuine soul curriculum.

The challenge is that Rahu amplifies everything it touches, including the Sun's shadow qualities — the ego, the need for recognition, the potential arrogance. Both people must navigate the Rahu amplification consciously to prevent the relationship from becoming a hall of mirrors where the Sun person's ego expands without check.""",
    'positives':['Intensely magnetic connection','Rahu person helps Sun person realize their potential','Creates sense of destiny and significance','Deeply memorable relationship','Genuine karmic growth for both souls'],
    'challenges':['Can become obsessive or compulsive','Rahu may amplify Sun\'s negative qualities','Sun person may feel overwhelmed by Rahu\'s intensity','Risk of codependency','Can feel like can\'t live with or without each other'],
    'romance':'Intensely magnetic — often described as "fated." Can become all-consuming.',
    'marriage':'Significant and karmic — requires conscious awareness of Rahu\'s intensity.',
    'friendship':'Fascinating and memorable — rarely casual.',
  },

  ('Rahu','Moon','conjunction'): {
    'title':'Rahu Conjunct Moon — Eclipse Energy',
    'summary':'Rahu eclipses and amplifies the Moon — emotionally intense, psychically charged.',
    'detailed':"""The Rahu conjunct Moon is one of the most psychically and emotionally intense aspects in synastry. Rahu is the north node — the point of karmic hunger and destined growth — and when it touches the Moon — the seat of emotion, psyche and the inner self — the result is a connection of extraordinary emotional power and complexity.

The Rahu person has a profound and often disorienting effect on the Moon person's emotional world. In the Rahu person's presence, the Moon person may experience emotions more intensely than usual — both positive and negative. Old emotional patterns and wounds may surface. The Moon person may feel simultaneously drawn and disturbed by the Rahu person's presence.

The Eclipse metaphor is apt: just as Rahu (the lunar node) causes eclipses by obscuring the Moon's light, in synastry, the Rahu person can temporarily obscure the Moon person's emotional clarity, creating a kind of psychic fog that feels fascinating and disorienting simultaneously.

The Moon person often has an almost psychic connection to the Rahu person — sensing their moods, needs and states without logical explanation. This creates deep intimacy but also makes clear emotional boundaries difficult to maintain.

In Vedic astrology, this conjunction is found frequently in karmic relationships — relationships with strong past-life resonance that must be consciously worked through in this lifetime. The emotional intensity serves a purpose: it activates deep psychological material in both people that needs to be addressed for their soul's growth.""",
    'positives':['Psychically deep connection','Activates important emotional growth','Felt as deeply meaningful and significant','Profound past-life emotional bond','Can catalyze major psychological healing'],
    'challenges':['Emotional boundaries become unclear','Moon person can feel psychically overwhelmed','Rahu amplifies emotional extremes','Risk of emotional codependency','Can feel disorienting and destabilizing'],
    'romance':'Psychically intense — deeply bonding but emotionally complex.',
    'marriage':'Deeply karmic — requires conscious emotional boundaries and psychological awareness.',
    'friendship':'Psychically intimate — can feel like soul family.',
  },

  ('Ketu','Moon','conjunction'): {
    'title':'Ketu Conjunct Moon — Past Life Soul Recognition',
    'summary':'Immediate soul recognition — past life bond creates deep but detached emotional connection.',
    'detailed':"""The Ketu conjunct Moon is one of the most spiritually significant connections in synastry. Ketu — the south node, representing past life karma, release and spiritual liberation — touches the Moon — the seat of emotion, memory and the soul's most intimate expression. The result is a connection of immediate and profound soul recognition.

When these two people meet, there is often a sensation of "I know you" that cannot be rationally explained. The Ketu person seems immediately familiar to the Moon person — like meeting someone they have known in a dream, or recognizing a piece of their own soul reflected back. This recognition goes beyond ordinary familiarity — it is the recognition of a soul known across many lifetimes.

The Ketu person holds the key to deep past-life memories for the Moon person. Being with the Ketu person can trigger intuitive memories, déjà vu experiences and a profound sense of soul-level familiarity. The Moon person may feel they can be completely themselves with the Ketu person in a way they cannot with anyone else — as though all performance and social masking is impossible between them.

The challenge is Ketu's fundamental quality of release and detachment. Ketu represents what the soul is moving away from — past-life territory that has already been fully lived. The Ketu person may feel familiar but ultimately cannot fully engage with the Moon person's emotional needs, because the relationship represents past rather than present soul curriculum. There is often a quality of spiritual familiarity mixed with emotional unavailability.

In Vedic astrology, this aspect is common in relationships that feel deeply spiritually significant but somehow incomplete — as though the highest expression of the bond exists in another dimension, and the earthly relationship is only a partial reflection of that deeper connection.""",
    'positives':['Immediate soul recognition','Deep spiritual bond','Moon person feels completely known','Profound past-life connection','Spiritual growth through the relationship'],
    'challenges':['Ketu person may be emotionally unavailable','Relationship can feel both intimate and detached','Moon person may feel unreachable emotional closeness','Past-life karma to be released, not continued','Can create longing that can\'t be fulfilled'],
    'romance':'Spiritually profound but emotionally complex — feels like unfinished soul business.',
    'marriage':'Deeply karmic — requires understanding the release quality of Ketu.',
    'friendship':'Spiritually intimate — past-life soul family.',
  },

  ('Rahu','Venus','conjunction'): {
    'title':'Rahu Conjunct Venus — Obsessive Love',
    'summary':'Rahu amplifies Venus love into fascination and obsession — magnetic but consuming.',
    'detailed':"""The Rahu conjunct Venus in synastry creates one of the most compelling and potentially consuming romantic connections. Rahu — with its qualities of amplification, obsession and karmic hunger — meets Venus — the planet of love, beauty, pleasure and romantic longing. The combination creates a relationship where romantic desire becomes genuinely intense, possibly obsessive and almost impossible to ignore.

The Rahu person is magnetically drawn to everything the Venus person represents. The Venus person's beauty, grace, capacity for love and aesthetic refinement feel like exactly what the Rahu person's soul has been seeking. There is a quality of "finally" in the Rahu person's attraction — as though they have been searching for this person or what this person represents across lifetimes.

The Venus person, in the Rahu person's presence, feels strangely amplified — more beautiful, more desirable, more romantically potent than usual. The Rahu person's fascination can be genuinely flattering and activating for the Venus person.

The challenge is the quality of obsession that Rahu brings. Love in this relationship can become consuming for the Rahu person — thinking about the Venus person constantly, wanting to be with them always, feeling their absence acutely. This intensity can be wonderful in the early stages of a relationship but can become suffocating over time.

In Vedic astrology, Rahu on Venus often indicates a relationship where learning to love without obsession or possession is the primary karmic lesson. The soul must learn to honor love's beauty without grasping it so tightly that it loses its natural grace.""",
    'positives':['Intensely magnetic romantic connection','Rahu person truly adores and is fascinated by Venus person','Venus person feels genuinely beautiful and desired','Strong karmic romantic purpose','Can be genuinely beautiful and intense love'],
    'challenges':['Risk of romantic obsession','Rahu person can become possessive','Venus person may feel overwhelmed by intensity','Amplifies romantic shadows — jealousy, possessiveness','Can become consuming rather than liberating'],
    'romance':'Intensely magnetic — one of the most compulsive romantic attractions.',
    'marriage':'Significant karmic purpose — requires conscious non-attachment to love.',
    'friendship':'Difficult to maintain as "just friends" — the attraction is too strong.',
  },

  ('Ketu','Venus','conjunction'): {
    'title':'Ketu Conjunct Venus — Love Beyond Worldly',
    'summary':'Past life love — spiritually deep but with quality of release rather than attachment.',
    'detailed':"""The Ketu conjunct Venus in synastry creates a relationship with qualities unlike any other romantic connection. Ketu — representing past life karma, spiritual liberation and release — touches Venus — the planet of earthly love, beauty and pleasure. The result is a love that feels simultaneously deeply familiar and somehow beyond ordinary romantic attachment.

When these two people meet, there is often an immediate sense of having loved before — not as a metaphor, but as a genuine soul-level recognition. The Ketu person looks at the Venus person and feels they have always loved them. The Venus person feels strangely comfortable with the Ketu person's gaze — as though being truly seen by someone who has known them across many lifetimes.

This can create one of the most spiritually profound romantic connections possible. The love between these two people transcends ordinary romantic categories — it is not merely attraction, not merely affection, but something closer to the recognition of one beloved soul by another across the veil of time.

The challenge is Ketu's quality of release and non-attachment. Ketu represents past-life territory that the soul must complete and release rather than continue developing. The relationship, however beautiful, may have a quality of impermanence or spiritual completion — as though both souls are finishing something rather than beginning it. This can create exquisite love mixed with a quality of poignant inevitability.

In Vedic astrology, this aspect is found in deeply spiritual love relationships — the kind that leave both people permanently changed and more fully themselves for having been loved by the other, even if the earthly relationship itself is impermanent.""",
    'positives':['Deeply spiritual and transcendent love','Profound sense of past-life beloved','Love that transforms both people','Spiritual growth through romantic union','Most profound romantic soul recognition'],
    'challenges':['Relationship may have quality of completion rather than beginning','Ketu\'s non-attachment can create distance in love','May feel like the relationship is "already over" even while happening','Difficulty maintaining worldly relationship structures'],
    'romance':'Spiritually profound — the most soul-level romantic connection possible.',
    'marriage':'Deeply karmic — love with spiritual purpose and quality of completion.',
    'friendship':'Can be the deepest possible friendship — past life beloved.',
  },
}