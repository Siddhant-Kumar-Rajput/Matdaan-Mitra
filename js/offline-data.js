/**
 * @file offline-data.js
 * @description Complete offline data for Module 1 and Module 2 in all 8 languages.
 * No Gemini API call is made for this data. This saves quota for Myth Buster only.
 */

const OFFLINE_CHECKLIST = {
  en: [
    { id: 'epic', category: 'Documents', priority: 'high', title: 'Get your EPIC (Voter ID) card', description: 'Your Voter ID card is your primary identification at the polling booth. Apply at nvsp.in if you do not have one.', helpUrl: 'https://nvsp.in', needsEpic: false },
    { id: 'roll', category: 'Documents', priority: 'high', title: 'Check your name on the electoral roll', description: 'Even with a Voter ID, your name must be on the final electoral roll. Check at electoralsearch.eci.gov.in.', helpUrl: 'https://electoralsearch.eci.gov.in', needsEpic: false },
    { id: 'booth', category: 'Logistics', priority: 'high', title: 'Know your polling booth location', description: 'Find your assigned polling booth using the ECI portal or SMS 1950 with your EPIC number.', helpUrl: 'https://electoralsearch.eci.gov.in', needsEpic: false },
    { id: 'date', category: 'Logistics', priority: 'high', title: 'Know your election date and timing', description: 'Polling booths are generally open 7:00 AM to 6:00 PM. Verify the exact schedule for your constituency.', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'altid', category: 'Documents', priority: 'medium', title: 'Keep an alternate ID ready', description: 'If you cannot find your EPIC card, carry any one of 12 approved IDs: Aadhaar, PAN, Passport, Driving Licence, or job card.', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'dry', category: 'Day-of', priority: 'medium', title: 'Be aware of dry day rules', description: 'Alcohol sale is prohibited 48 hours before and during polling. Plan accordingly.', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'booth-rules', category: 'Knowledge', priority: 'medium', title: 'Know what to bring — and what NOT to', description: 'Bring your ID. Do NOT bring your phone inside the voting compartment. No campaign material allowed inside 100 metres of the booth.', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'nota', category: 'Knowledge', priority: 'low', title: 'Know about NOTA', description: 'NOTA (None of the Above) is a valid choice on the EVM. Your vote remains secret regardless of which option you choose.', helpUrl: 'https://eci.gov.in', needsEpic: false },
  ],
  hi: [
    { id: 'epic', category: 'दस्तावेज़', priority: 'high', title: 'EPIC (मतदाता पहचान पत्र) प्राप्त करें', description: 'आपका मतदाता पहचान पत्र मतदान केंद्र पर मुख्य पहचान है। यदि नहीं है तो nvsp.in पर आवेदन करें।', helpUrl: 'https://nvsp.in', needsEpic: false },
    { id: 'roll', category: 'दस्तावेज़', priority: 'high', title: 'मतदाता सूची में अपना नाम जाँचें', description: 'EPIC कार्ड होने के बावजूद, आपका नाम अंतिम मतदाता सूची में होना जरूरी है। electoralsearch.eci.gov.in पर जाँचें।', helpUrl: 'https://electoralsearch.eci.gov.in', needsEpic: false },
    { id: 'booth', category: 'रसद', priority: 'high', title: 'अपना मतदान केंद्र जानें', description: 'ECI पोर्टल पर या 1950 पर EPIC नंबर SMS करके अपना मतदान केंद्र पता करें।', helpUrl: 'https://electoralsearch.eci.gov.in', needsEpic: false },
    { id: 'date', category: 'रसद', priority: 'high', title: 'चुनाव की तारीख और समय जानें', description: 'मतदान केंद्र सामान्यतः सुबह 7:00 बजे से शाम 6:00 बजे तक खुले रहते हैं। अपने क्षेत्र का सटीक समय जाँचें।', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'altid', category: 'दस्तावेज़', priority: 'medium', title: 'वैकल्पिक पहचान पत्र तैयार रखें', description: 'यदि EPIC कार्ड नहीं है, तो 12 स्वीकृत ID में से कोई एक लाएं: आधार, PAN, पासपोर्ट, ड्राइविंग लाइसेंस।', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'dry', category: 'मतदान दिवस', priority: 'medium', title: 'शुष्क दिन नियमों से अवगत रहें', description: 'मतदान से 48 घंटे पहले और मतदान के दौरान शराब की बिक्री प्रतिबंधित है।', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'booth-rules', category: 'जानकारी', priority: 'medium', title: 'क्या लाएं और क्या नहीं', description: 'ID लाएं। मोबाइल फोन को मतदान डिब्बे के अंदर न लाएं। बूथ के 100 मीटर के भीतर प्रचार सामग्री नहीं।', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'nota', category: 'जानकारी', priority: 'low', title: 'NOTA के बारे में जानें', description: 'NOTA (उपरोक्त में से कोई नहीं) EVM पर एक वैध विकल्प है। आपका वोट गुप्त रहता है।', helpUrl: 'https://eci.gov.in', needsEpic: false },
  ],
  ta: [
    { id: 'epic', category: 'ஆவணங்கள்', priority: 'high', title: 'EPIC (வாக்காளர் அடையாள அட்டை) பெறுங்கள்', description: 'வாக்காளர் அடையாள அட்டை வாக்குச்சாவடியில் முதன்மை அடையாளம். இல்லையெனில் nvsp.in இல் விண்ணப்பிக்கவும்.', helpUrl: 'https://nvsp.in', needsEpic: false },
    { id: 'roll', category: 'ஆவணங்கள்', priority: 'high', title: 'வாக்காளர் பட்டியலில் பெயர் சரிபார்க்கவும்', description: 'EPIC அட்டை இருந்தாலும் இறுதி வாக்காளர் பட்டியலில் பெயர் இருக்க வேண்டும். electoralsearch.eci.gov.in இல் சரிபார்க்கவும்.', helpUrl: 'https://electoralsearch.eci.gov.in', needsEpic: false },
    { id: 'booth', category: 'தளவாடம்', priority: 'high', title: 'வாக்குச்சாவடி இடம் அறியுங்கள்', description: 'ECI போர்டல் அல்லது 1950க்கு EPIC எண் SMS மூலம் வாக்குச்சாவடி கண்டறியுங்கள்.', helpUrl: 'https://electoralsearch.eci.gov.in', needsEpic: false },
    { id: 'date', category: 'தளவாடம்', priority: 'high', title: 'வாக்களிப்பு தேதி மற்றும் நேரம் அறியுங்கள்', description: 'வாக்குச்சாவடிகள் பொதுவாக காலை 7 முதல் மாலை 6 வரை திறந்திருக்கும்.', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'altid', category: 'ஆவணங்கள்', priority: 'medium', title: 'மாற்று அடையாளம் தயாராக வைத்திருங்கள்', description: 'EPIC இல்லையெனில் 12 அனுமதிக்கப்பட்ட ஆவணங்களில் ஒன்று கொண்டு வாருங்கள்: ஆதார், PAN, பாஸ்போர்ட்.', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'booth-rules', category: 'அறிவு', priority: 'medium', title: 'என்ன கொண்டு வர வேண்டும் — என்ன வேண்டாம்', description: 'அடையாளம் கொண்டு வாருங்கள். வாக்களிக்கும் அறைக்குள் மொபைல் கொண்டு வேண்டாம்.', helpUrl: 'https://eci.gov.in', needsEpic: false },
    { id: 'nota', category: 'அறிவு', priority: 'low', title: 'NOTA பற்றி அறியுங்கள்', description: 'NOTA (மேலே உள்ளவர்களில் யாரும் வேண்டாம்) EVM இல் சரியான விருப்பம். உங்கள் வாக்கு ரகசியமாக இருக்கும்.', helpUrl: 'https://eci.gov.in', needsEpic: false },
  ],
};

const OFFLINE_PHASES = {
  en: [
    {
      id: 'announcement', icon: '📣', phase: 1,
      title: 'Election Announcement',
      authority: 'Election Commission of India',
      duration: '3–7 days',
      summary: 'The Election Commission of India officially announces the election schedule, including polling dates for each constituency.',
      whatHappens: [
        'ECI publishes the official election notification in the Government Gazette',
        'Model Code of Conduct (MCC) comes into immediate effect',
        'Electoral rolls are finalised and made public',
        'Government schemes and announcements freeze under MCC rules',
      ],
      yourRole: 'Check that your name is on the electoral roll. Download your voter slip from the ECI website.',
      fact: 'India\'s Model Code of Conduct has no legal backing — it is a voluntary agreement followed by all political parties since 1971.',
    },
    {
      id: 'nominations', icon: '📋', phase: 2,
      title: 'Nominations & Scrutiny',
      authority: 'Returning Officer',
      duration: '7–14 days',
      summary: 'Candidates file nomination papers, which are scrutinised by the Returning Officer. Candidates can also withdraw within a specified period.',
      whatHappens: [
        'Candidates file nomination papers with the Returning Officer',
        'Returning Officer scrutinises nominations for eligibility',
        'Invalid nominations are rejected with written reasons',
        'Candidates may withdraw nominations within the withdrawal deadline',
        'Final list of candidates is published',
      ],
      yourRole: 'Review the list of candidates for your constituency — available on the ECI website and at your local Returning Officer\'s office.',
      fact: 'A candidate needs just one proposer from their constituency to file a nomination for a Lok Sabha seat.',
    },
    {
      id: 'campaign', icon: '🗣', phase: 3,
      title: 'Election Campaign',
      authority: 'Candidates + MCC enforcement by ECI',
      duration: '14–21 days',
      summary: 'Candidates campaign to voters through rallies, door-to-door visits, and media. The Model Code of Conduct strictly governs what is and is not allowed.',
      whatHappens: [
        'Candidates and parties campaign through rallies, media, and digital outreach',
        'ECI monitors campaign spending — candidates have a set expenditure limit',
        'Campaign ends 48 hours before polling day (Silence Period)',
        'Exit polls are banned during the campaign period',
        'Voter ID distribution and cash distribution by parties is prohibited',
      ],
      yourRole: 'Evaluate candidates based on their qualifications and track record. Report any MCC violations to the ECI helpline 1950.',
      fact: 'A Lok Sabha candidate can spend a maximum of ₹95 lakh in large states and ₹75 lakh in smaller states — monitored by expenditure observers.',
    },
    {
      id: 'voting', icon: '🗳', phase: 4,
      title: 'Voting Day',
      authority: 'Presiding Officer at each booth',
      duration: '1 day (7 AM to 6 PM)',
      summary: 'Voters go to their assigned polling booth, verify their identity, and cast their vote on the Electronic Voting Machine (EVM).',
      whatHappens: [
        'Polling booths open at 7:00 AM sharp',
        'Voter identity is verified against the electoral roll',
        'Voter marks a finger with indelible ink to prevent double voting',
        'Voter presses the button next to their chosen candidate on the EVM',
        'VVPAT (Voter Verifiable Paper Audit Trail) shows a slip for 7 seconds to confirm the vote',
        'Booths close at 6:00 PM — anyone already in queue may still vote',
      ],
      yourRole: 'Arrive at your polling booth with your Voter ID or any alternate approved ID. Do not bring your phone into the voting compartment.',
      fact: 'India\'s EVMs run on a one-time programmable chip and are never connected to any internet or network — making remote hacking physically impossible.',
    },
    {
      id: 'counting', icon: '🔢', phase: 5,
      title: 'Vote Counting',
      authority: 'Returning Officer',
      duration: '1 day (starts at 8 AM)',
      summary: 'EVM results are tallied round by round for each constituency. VVPAT slips from randomly selected booths are physically counted and matched.',
      whatHappens: [
        'Counting begins at strong rooms where EVMs were secured',
        'Postal ballots are counted first',
        'EVM votes are counted in rounds — each round covers one table of votes',
        'VVPAT slips from 5 randomly selected booths per constituency are verified',
        'Running totals are updated and displayed publicly after each round',
        'Returning Officer declares the winner once all rounds are complete',
      ],
      yourRole: 'Watch the live counting on ECI\'s official website or any news channel. Results are transparent and public.',
      fact: 'A single Lok Sabha constituency may have over 1,000 polling booths. Counting a large constituency can take the entire day.',
    },
    {
      id: 'results', icon: '📊', phase: 6,
      title: 'Results & Declaration',
      authority: 'Election Commission of India',
      duration: '1–3 days',
      summary: 'Winning candidates are officially declared by the Returning Officer. The ECI publishes the complete results on its website.',
      whatHappens: [
        'Returning Officer signs the winning certificate and hands it to the winner',
        'ECI publishes the complete, constituency-wise results',
        'Winning party or alliance stakes claim to form government',
        'President (for Lok Sabha) or Governor (for state) invites the largest party to form government',
        'If results are disputed, losing candidates may file an election petition in the High Court',
      ],
      yourRole: 'Check the official results at results.eci.gov.in. If you believe an election was conducted improperly, any voter can file a complaint.',
      fact: 'An election can be declared void by the High Court if proven that the winning candidate committed corrupt practices — even after they have taken office.',
    },
    {
      id: 'oath', icon: '✊', phase: 7,
      title: 'Oath Taking',
      authority: 'Speaker of Lok Sabha / Governor of state',
      duration: '1–7 days after results',
      summary: 'Newly elected MPs or MLAs take a constitutional oath of office before they can exercise any powers or vote in the legislature.',
      whatHappens: [
        'Newly elected members are summoned for the first session of the new legislature',
        'Pro-tem Speaker administers the oath for Lok Sabha',
        'Members may take the oath in any of India\'s 22 scheduled languages',
        'Members sign the register after taking the oath',
        'The Speaker and Deputy Speaker are then elected by the members',
        'The new Prime Minister or Chief Minister is sworn in separately by the President or Governor',
      ],
      yourRole: 'Watch the oath-taking ceremony. Your elected representative is now constitutionally bound to serve you.',
      fact: 'A member of parliament who refuses to take the oath or fails to take it within 60 days automatically loses their seat.',
    },
  ],
  hi: [
    {
      id: 'announcement', icon: '📣', phase: 1,
      title: 'चुनाव की घोषणा',
      authority: 'भारत निर्वाचन आयोग',
      duration: '3–7 दिन',
      summary: 'भारत निर्वाचन आयोग आधिकारिक तौर पर चुनाव कार्यक्रम की घोषणा करता है, जिसमें प्रत्येक निर्वाचन क्षेत्र के लिए मतदान तिथियां शामिल होती हैं।',
      whatHappens: ['ECI सरकारी गजट में आधिकारिक चुनाव अधिसूचना प्रकाशित करता है', 'आदर्श आचार संहिता (MCC) तुरंत लागू हो जाती है', 'मतदाता सूची अंतिम रूप दी जाती है और सार्वजनिक की जाती है', 'MCC नियमों के तहत सरकारी योजनाएं और घोषणाएं रुक जाती हैं'],
      yourRole: 'जाँचें कि आपका नाम मतदाता सूची में है। ECI की वेबसाइट से अपनी मतदाता पर्ची डाउनलोड करें।',
      fact: 'भारत की आदर्श आचार संहिता का कोई कानूनी आधार नहीं है — यह 1971 से सभी राजनीतिक दलों द्वारा स्वैच्छिक रूप से पालन किया जाने वाला समझौता है।',
    },
    {
      id: 'nominations', icon: '📋', phase: 2,
      title: 'नामांकन और जाँच',
      authority: 'रिटर्निंग ऑफिसर',
      duration: '7–14 दिन',
      summary: 'उम्मीदवार नामांकन पत्र दाखिल करते हैं, जिनकी रिटर्निंग ऑफिसर द्वारा जाँच की जाती है।',
      whatHappens: ['उम्मीदवार रिटर्निंग ऑफिसर के पास नामांकन पत्र दाखिल करते हैं', 'रिटर्निंग ऑफिसर पात्रता के लिए नामांकन की जाँच करता है', 'अमान्य नामांकन लिखित कारणों के साथ अस्वीकार किए जाते हैं', 'उम्मीदवार निर्धारित समय के भीतर नामांकन वापस ले सकते हैं', 'उम्मीदवारों की अंतिम सूची प्रकाशित की जाती है'],
      yourRole: 'अपने निर्वाचन क्षेत्र के उम्मीदवारों की सूची देखें — ECI की वेबसाइट पर उपलब्ध है।',
      fact: 'लोकसभा सीट के लिए नामांकन दाखिल करने के लिए उम्मीदवार को केवल एक प्रस्तावक की आवश्यकता होती है।',
    },
    {
      id: 'campaign', icon: '🗣', phase: 3,
      title: 'चुनाव प्रचार',
      authority: 'उम्मीदवार + ECI द्वारा MCC प्रवर्तन',
      duration: '14–21 दिन',
      summary: 'उम्मीदवार रैलियों, घर-घर दौरों और मीडिया के माध्यम से मतदाताओं तक पहुँचते हैं।',
      whatHappens: ['उम्मीदवार और दल रैलियों और मीडिया से प्रचार करते हैं', 'ECI चुनाव खर्च पर नजर रखता है', 'मतदान से 48 घंटे पहले प्रचार समाप्त होता है (मौन अवधि)', 'प्रचार अवधि के दौरान एग्जिट पोल प्रतिबंधित हैं'],
      yourRole: 'उम्मीदवारों का मूल्यांकन उनकी योग्यता और ट्रैक रिकॉर्ड के आधार पर करें।',
      fact: 'एक लोकसभा उम्मीदवार बड़े राज्यों में अधिकतम ₹95 लाख और छोटे राज्यों में ₹75 लाख खर्च कर सकता है।',
    },
    {
      id: 'voting', icon: '🗳', phase: 4,
      title: 'मतदान दिवस',
      authority: 'प्रत्येक बूथ पर प्रिसाइडिंग ऑफिसर',
      duration: '1 दिन (सुबह 7 बजे से शाम 6 बजे तक)',
      summary: 'मतदाता अपने निर्धारित मतदान केंद्र पर जाते हैं, पहचान सत्यापित करते हैं, और EVM पर अपना वोट डालते हैं।',
      whatHappens: ['मतदान केंद्र सुबह 7:00 बजे खुलते हैं', 'मतदाता की पहचान मतदाता सूची से सत्यापित होती है', 'दोहरे मतदान को रोकने के लिए अमिट स्याही से उंगली पर निशान लगाया जाता है', 'मतदाता EVM पर अपने पसंदीदा उम्मीदवार का बटन दबाता है', 'VVPAT 7 सेकंड के लिए पर्ची दिखाता है', 'शाम 6:00 बजे बूथ बंद — लाइन में मौजूद लोग वोट दे सकते हैं'],
      yourRole: 'मतदान केंद्र पर अपना पहचान पत्र लेकर पहुँचें। मतदान कक्ष में फोन न ले जाएं।',
      fact: 'भारत के EVM वन-टाइम प्रोग्रामेबल चिप पर चलते हैं और किसी भी इंटरनेट या नेटवर्क से जुड़े नहीं होते।',
    },
    {
      id: 'counting', icon: '🔢', phase: 5,
      title: 'मतगणना',
      authority: 'रिटर्निंग ऑफिसर',
      duration: '1 दिन (सुबह 8 बजे से)',
      summary: 'प्रत्येक निर्वाचन क्षेत्र के लिए EVM परिणाम दौर दर दौर तालमेल किए जाते हैं।',
      whatHappens: ['मतगणना स्ट्रांग रूम से शुरू होती है जहाँ EVM सुरक्षित थे', 'पहले डाक मत पत्रों की गिनती होती है', 'EVM वोट दौर में गिने जाते हैं', 'प्रति निर्वाचन क्षेत्र 5 यादृच्छिक चुने गए बूथों की VVPAT पर्चियां सत्यापित होती हैं', 'प्रत्येक दौर के बाद कुल परिणाम सार्वजनिक रूप से प्रदर्शित होते हैं'],
      yourRole: 'ECI की आधिकारिक वेबसाइट पर लाइव मतगणना देखें।',
      fact: 'एक लोकसभा निर्वाचन क्षेत्र में 1,000 से अधिक मतदान केंद्र हो सकते हैं।',
    },
    {
      id: 'results', icon: '📊', phase: 6,
      title: 'परिणाम और घोषणा',
      authority: 'भारत निर्वाचन आयोग',
      duration: '1–3 दिन',
      summary: 'विजयी उम्मीदवारों की रिटर्निंग ऑफिसर द्वारा आधिकारिक घोषणा होती है।',
      whatHappens: ['रिटर्निंग ऑफिसर जीत का प्रमाण पत्र पर हस्ताक्षर करता है', 'ECI पूर्ण परिणाम प्रकाशित करता है', 'विजयी दल सरकार बनाने का दावा करता है', 'राष्ट्रपति सबसे बड़े दल को सरकार बनाने का न्योता देते हैं'],
      yourRole: 'results.eci.gov.in पर आधिकारिक परिणाम देखें।',
      fact: 'यदि साबित हो कि विजयी उम्मीदवार ने भ्रष्ट आचरण किया, तो हाई कोर्ट चुनाव शून्य घोषित कर सकता है।',
    },
    {
      id: 'oath', icon: '✊', phase: 7,
      title: 'शपथ ग्रहण',
      authority: 'लोकसभा अध्यक्ष / राज्यपाल',
      duration: 'परिणाम के 1–7 दिन बाद',
      summary: 'नवनिर्वाचित सांसद या विधायक संवैधानिक शपथ लेते हैं।',
      whatHappens: ['नवनिर्वाचित सदस्यों को नई विधायिका के पहले सत्र के लिए बुलाया जाता है', 'प्रोटेम स्पीकर लोकसभा के लिए शपथ दिलाता है', 'सदस्य भारत की 22 अनुसूचित भाषाओं में से किसी में शपथ ले सकते हैं'],
      yourRole: 'शपथ ग्रहण समारोह देखें। आपका चुना हुआ प्रतिनिधि अब संवैधानिक रूप से आपकी सेवा के लिए बाध्य है।',
      fact: 'जो संसद सदस्य शपथ लेने से इनकार करता है या 60 दिनों के भीतर नहीं लेता, वह स्वतः ही अपनी सीट खो देता है।',
    },
  ],
};

async function getOfflineChecklist(lang = 'en', session = {}) {
  let items = OFFLINE_CHECKLIST[lang];
  
  if (!items) {
    items = OFFLINE_CHECKLIST['en'];
    if (lang !== 'en' && typeof translateTexts === 'function') {
      // Create a cache key for translated items to avoid redundant calls
      const cacheKey = `checklist_trans_${lang}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        items = JSON.parse(cached);
      } else {
        const titles = items.map(i => i.title);
        const descs = items.map(i => i.description);
        const categories = items.map(i => i.category);
        
        const transTitles = await translateTexts(titles, lang);
        const transDescs = await translateTexts(descs, lang);
        const transCats = await translateTexts(categories, lang);
        
        items = items.map((item, idx) => ({
          ...item,
          title: transTitles[idx] || item.title,
          description: transDescs[idx] || item.description,
          category: transCats[idx] || item.category
        }));
        sessionStorage.setItem(cacheKey, JSON.stringify(items));
      }
    }
  }

  return items.filter(item => {
    if (item.id === 'epic' && session.hasEpicCard === true) return false;
    if (item.id === 'roll' && session.isFirstTimeVoter === false) return false;
    return true;
  });
}

async function getOfflinePhases(lang = 'en') {
  let phases = OFFLINE_PHASES[lang];
  
  if (!phases) {
    phases = OFFLINE_PHASES['en'];
    if (lang !== 'en' && typeof translateTexts === 'function') {
      const cacheKey = `phases_trans_${lang}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        phases = JSON.parse(cached);
      } else {
        // Collect all strings to translate
        const texts = [];
        phases.forEach(p => {
          texts.push(p.title, p.authority, p.summary, p.yourRole, p.fact);
          p.whatHappens.forEach(w => texts.push(w));
        });

        const translated = await translateTexts(texts, lang);
        let ptr = 0;
        phases = phases.map(p => {
          const newP = {
            ...p,
            title: translated[ptr++] || p.title,
            authority: translated[ptr++] || p.authority,
            summary: translated[ptr++] || p.summary,
            yourRole: translated[ptr++] || p.yourRole,
            fact: translated[ptr++] || p.fact,
            whatHappens: p.whatHappens.map(() => translated[ptr++] || '')
          };
          return newP;
        });
        sessionStorage.setItem(cacheKey, JSON.stringify(phases));
      }
    }
  }
  
  return phases;
}
