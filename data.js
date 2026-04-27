/* === Pattaya Gym Directory — Data === */
/*
 * Schema (all fields optional except id/name/category/area):
 *   id, name, category, area, address, phone, website, social { facebook, instagram }
 *   hours, priceRange (฿ to ฿฿฿฿), description, tags, mapsUrl, detailFile, verified
 *
 * detailFile points at venues/<id>.md which contains the long-form research content
 * (history, trainers, alumni, pricing details, schedules, pros/cons, sources).
 *
 * Add new venues by appending to GYMS. Keep entries sorted within their category.
 */

const CATEGORIES = [
  { key: "muay-thai",     label: "Muay Thai",          emoji: "MT" },
  { key: "mma",           label: "MMA",                emoji: "MMA" },
  { key: "bjj",           label: "BJJ / Grappling",    emoji: "BJJ" },
  { key: "boxing",        label: "Boxing",             emoji: "BOX" },
  { key: "crossfit",      label: "CrossFit / Functional", emoji: "CF" },
  { key: "fitness",       label: "Fitness / Gym",      emoji: "GYM" },
  { key: "yoga",          label: "Yoga / Pilates",     emoji: "YOGA" },
  { key: "golf",          label: "Golf",               emoji: "GOLF" },
  { key: "racquet",       label: "Tennis / Padel / Squash", emoji: "TEN" },
  { key: "swimming",      label: "Swimming",           emoji: "SW" },
  { key: "watersports",   label: "Watersports",        emoji: "WAVE" },
  { key: "climbing",      label: "Climbing",           emoji: "CL" },
  { key: "clubs",         label: "Running / Cycling Clubs", emoji: "RUN" }
];

const GYMS = [
  // === MUAY THAI ===
  {
    id: "fairtex-pattaya",
    name: "Fairtex Training Center Pattaya",
    category: "muay-thai",
    area: "Naklua / North Pattaya",
    address: "179/185-212 Moo 5, North Pattaya Rd, Naklua, Bang Lamung, Chonburi 20150",
    phone: "+66 38 253 889",
    website: "https://fairtextrainingcenter.com/",
    social: { facebook: "fairtex.muaythai.pattaya" },
    hours: "Mon-Sat 07:30-10:30 and 15:30-18:30",
    priceRange: "฿฿฿",
    description: "World-renowned Muay Thai resort camp founded 1975 in Bangkok, relocated to Pattaya 2005. Multiple rings, 60+ bags, on-site hotel and 25m pool. Championship lineage including Yodsanklai, Stamp, and Saemapetch Fairtex.",
    tags: ["world-class", "accommodation", "pool", "english-friendly", "beginners-welcome"],
    mapsUrl: "https://maps.google.com/?q=Fairtex+Training+Center+Pattaya",
    detailFile: "venues/fairtex-pattaya.md",
    verified: "2026-04-27"
  },
  {
    id: "sityodtong-pattaya",
    name: "Sityodtong Pattaya",
    category: "muay-thai",
    area: "Naklua / Nong Prue",
    address: "36/7 Moo 6, Nong Prue, Bang Lamung, Chonburi 20150",
    phone: "+66 38 251 489",
    website: "https://sityodtongthailand.com/",
    social: { facebook: "sityodtongmuaythai" },
    hours: "Mon-Sat 08:00-10:00 and 15:00-17:30",
    priceRange: "฿฿",
    description: "Founded 1960 by Kru Yodtong Senanan. 57+ world champions including Samart Payakaroon. Trained Rob Kaman and Ramon Dekkers. Authentic Thai camp, one of the most historically significant gyms in the world.",
    tags: ["legendary", "authentic", "traditional", "lineage", "fighter-track"],
    mapsUrl: "https://maps.google.com/?q=Sityodtong+Pattaya",
    detailFile: "venues/sityodtong-pattaya.md",
    verified: "2026-04-27"
  },
  {
    id: "wko-muay-thai",
    name: "WKO Muay Thai and Fitness Pattaya",
    category: "muay-thai",
    area: "Central Pattaya / Pattaya Klang",
    address: "503/16 Moo 9, Pattaya Klang Rd, Nong Prue, Bang Lamung",
    phone: "+66 38 411 555",
    website: "https://www.muaythaipattaya.com/",
    social: { facebook: "ISS.Muay.Thai" },
    hours: "Muay Thai class 15:30-17:00 daily; gym extended hours",
    priceRange: "฿",
    description: "Owner Robert McInnes was first Westerner to referee Lumpinee (1993). Resident trainer Sakmongkol is a golden-age Thai legend. Around 4000 baht/month for serious training. One afternoon session per day.",
    tags: ["budget", "legendary-trainer", "central", "expat-favorite", "single-session"],
    mapsUrl: "https://maps.google.com/?q=WKO+Pattaya+Klang",
    detailFile: "venues/wko-muay-thai.md",
    verified: "2026-04-27"
  },
  {
    id: "kombat-group-thailand",
    name: "Kombat Group Thailand",
    category: "muay-thai",
    area: "Huai Yai / East Pattaya",
    address: "49/1 Moo 4, Soi Chaknok 19, Huai Yai, Bang Lamung, Chonburi 20150",
    phone: "+66 81 099 9333",
    website: "https://www.kombatgroup.com/",
    social: { facebook: "kombatgroup" },
    hours: "Year-round, two sessions/day, varies by program",
    priceRange: "฿฿฿",
    description: "All-inclusive multi-discipline camp founded by Christian Daghio (1969-2018), 6x Muay Thai world champion and WBA Asia boxing champion. Muay Thai, Boxing, MMA, BJJ, Krav Maga. 3 rings, MMA cage, pool, kitchen, daily massage. Top-3 rated combat camp in Thailand on TripAdvisor.",
    tags: ["all-inclusive", "multi-discipline", "accommodation", "premium", "european-friendly"],
    mapsUrl: "https://maps.google.com/?q=Kombat+Group+Thailand+Pattaya",
    detailFile: "venues/kombat-group-thailand.md",
    verified: "2026-04-27"
  },
  {
    id: "battle-conquer-gym",
    name: "Battle Conquer Gym Pattaya",
    category: "muay-thai",
    area: "Central Pattaya / near Pattaya Beach",
    address: "Central Pattaya, near Pattaya Beach (verify exact at gym)",
    phone: "+66 98 085 3053",
    website: "https://battleconquerpattaya.com/",
    social: { facebook: "battleconquerpattaya" },
    hours: "7 days/week, twice-daily group classes (morning + afternoon)",
    priceRange: "฿฿",
    description: "Pattaya's only fully air-conditioned Muay Thai gym. Combines authentic training with serious weight room, sauna, and ice plunge. 7-day flexible scheduling, English-speaking trainers, on-site cafe with smoothies.",
    tags: ["air-conditioned", "near-beach", "weight-room", "sauna", "ice-plunge", "flexible"],
    mapsUrl: "https://maps.google.com/?q=Battle+Conquer+Gym+Pattaya",
    detailFile: "venues/battle-conquer-gym.md",
    verified: "2026-04-27"
  },
  {
    id: "sor-klinmee",
    name: "Sor Klinmee Muay Thai Gym",
    category: "muay-thai",
    area: "Nong Prue / East Pattaya",
    address: "Nong Prue, Bang Lamung, Chonburi 20150 (off Soi Khao Talo area)",
    phone: "",
    website: "",
    social: { facebook: "sorklinmeegym" },
    hours: "Mon-Sat, two-a-day (morning + afternoon)",
    priceRange: "฿",
    description: "Family-run authentic Thai camp, founded 2009 by Mit Klinmee (Tappaya Sit Or). Home of Sudsakorn Sor Klinmee (278 wins from 330 fights). Adjacent to Rambaa M16. Drop-ins around 200-300 baht, among the best value training in Pattaya.",
    tags: ["authentic", "family-run", "budget", "fighter-camp", "thai-traditional"],
    mapsUrl: "https://maps.google.com/?q=Sor+Klinmee+Pattaya",
    detailFile: "venues/sor-klinmee.md",
    verified: "2026-04-27"
  },
  {
    id: "petchrungruang-gym",
    name: "Petchrungruang Gym",
    category: "muay-thai",
    area: "South Pattaya / Sukhumvit",
    address: "Soi Sukhumvit-Pattaya 50, off Sukhumvit Rd, Bang Lamung",
    phone: "",
    website: "",
    social: { facebook: "petchrungruanggym" },
    hours: "3 sessions/day (~05:00 kids, ~08:00, ~15:30); Mon-Sat",
    priceRange: "฿",
    description: "Beloved family camp founded 1986 by Bamrung Petchrungruang (still ringside at 70+). Head trainer Kru Nu is a Lumpinee champion. Home gym of Sylvie von Duuglas-Ittu (250+ pro fights, most of any female fighter ever). Authentic Thai pedagogy.",
    tags: ["family-camp", "authentic", "lumpinee-champion-trainer", "sylvie-petchrungruang", "kids-program"],
    mapsUrl: "https://maps.google.com/?q=Petchrungruang+Gym+Pattaya",
    detailFile: "venues/petchrungruang-gym.md",
    verified: "2026-04-27"
  },
  {
    id: "rambaa-somdet-m16",
    name: "Rambaa Somdet M16 Muay Thai and MMA",
    category: "muay-thai",
    area: "Nong Prue / East Pattaya",
    address: "Nong Prue, Bang Lamung, adjacent to Sor Klinmee",
    phone: "",
    website: "",
    social: { instagram: "m16_pattaya" },
    hours: "Mon-Sat, two-a-day",
    priceRange: "฿฿",
    description: "Personal camp of Rambaa M16 Somdet, Thailand's first MMA world champion (Shooto Flyweight 2009) and Muay Thai legend (~100 fights, 70+ wins). Genuine cross-training in Muay Thai AND MMA with cage on site. 100m from Sor Klinmee.",
    tags: ["mma", "muay-thai", "world-champion-coach", "cage", "cross-training"],
    mapsUrl: "https://maps.google.com/?q=Rambaa+M16+Pattaya",
    detailFile: "venues/rambaa-somdet-m16.md",
    verified: "2026-04-27"
  },

  {
    id: "venum-training-camp",
    name: "Venum Training Camp Pattaya",
    category: "muay-thai",
    area: "Off Thepprasit Rd / near Jomtien",
    address: "Soi Khopai 12, off Thepprasit Rd, Bang Lamung, Chonburi 20150 (~3km from Jomtien Beach)",
    phone: "",
    website: "https://venom-mt.com/",
    social: { facebook: "venumtrainingcamp" },
    hours: "Mon-Sat 07:00-09:00 and 15:00-18:00; MMA, BJJ, S&C, kids extra slots",
    priceRange: "฿฿",
    description: "Modern multi-discipline combat sports facility near Jomtien Beach. Muay Thai, MMA, BJJ, Combat Fitness, S&C, and kids program under one roof. Two rings, MMA cage/mat zone, English-speaking coaches.",
    tags: ["multi-discipline", "modern", "near-beach", "kids-program", "english-coaches"],
    mapsUrl: "https://maps.google.com/?q=Venum+Training+Camp+Pattaya",
    detailFile: "venues/venum-training-camp.md",
    verified: "2026-04-27"
  },
  {
    id: "rage-fight-academy",
    name: "Rage Fight Academy",
    category: "muay-thai",
    area: "Jomtien / South Pattaya",
    address: "South Pattaya, 5 min from Dongtan and Jomtien beaches (verify exact at gym)",
    phone: "",
    website: "https://ragefightacademy.com/",
    social: { facebook: "ragefightacademy", instagram: "ragefightacademy" },
    hours: "Mon-Sat, multi-discipline daily schedule",
    priceRange: "฿฿",
    description: "Multi-discipline academy: Muay Thai, Boxing, BJJ, MMA, Cross Training, Fitness. 3 full-size rings + spacious BJJ/MMA mat zone. Active fight team. Drop-in 500 baht, monthly 8500. Sponsors Muay Thai Education Visas for long-stay students.",
    tags: ["multi-discipline", "bjj-strong", "fight-team", "education-visa", "near-beach"],
    mapsUrl: "https://maps.google.com/?q=Rage+Fight+Academy+Pattaya",
    detailFile: "venues/rage-fight-academy.md",
    verified: "2026-04-27"
  },
  {
    id: "silk-muay-thai",
    name: "Silk Muay Thai",
    category: "muay-thai",
    area: "Pattaya (verify exact)",
    address: "Pattaya, Bang Lamung, Chonburi (confirm at gym)",
    phone: "",
    website: "https://silkmuaythai.com/",
    social: { facebook: "Silkmuaythai" },
    hours: "Mon-Sat 07:00-09:30 and 15:00-18:00",
    priceRange: "฿฿฿",
    description: "Premium boutique camp. 4.9/5 rated. All-inclusive packages: training + private room + pool/sauna/spa + meals. From 25,500 baht/month (1 session/day + 1 meal) to 33,000 baht/month (2 sessions + 2 meals). Personalized attention.",
    tags: ["boutique", "premium", "accommodation", "pool", "spa", "wellness-retreat"],
    mapsUrl: "https://maps.google.com/?q=Silk+Muay+Thai+Pattaya",
    detailFile: "venues/silk-muay-thai.md",
    verified: "2026-04-27"
  },
  {
    id: "pattaya-thai-boxing-fitness",
    name: "Pattaya Thai Boxing and Fitness Gym (Jomtien)",
    category: "muay-thai",
    area: "Jomtien Beach",
    address: "Soi 7, off Jomtien Beach Road, Pattaya",
    phone: "",
    website: "",
    social: {},
    hours: "Afternoons (closes ~17:00)",
    priceRange: "฿",
    description: "Walk-in budget Muay Thai gym in Jomtien. Around 300 baht for equipment + 4-5 rounds of pad work. Pro fighter Champ on the trainer roster. Air fans (no AC). Walking distance to Jomtien Beach. Afternoon-only.",
    tags: ["budget", "walk-in", "near-beach", "casual", "pro-trainer"],
    mapsUrl: "https://maps.google.com/?q=Pattaya+Thai+Boxing+Fitness+Jomtien",
    detailFile: "venues/pattaya-thai-boxing-fitness.md",
    verified: "2026-04-27"
  },

  // === FITNESS / COMMERCIAL GYMS ===
  {
    id: "tonys-gym",
    name: "Tony's Gym",
    category: "fitness",
    area: "Central Pattaya",
    address: "Soi Diana Inn, Central Pattaya",
    phone: "+66 38 425 795",
    website: "",
    social: { facebook: "tonysgympattaya" },
    hours: "Daily 6:00-23:00",
    priceRange: "฿",
    description: "Legendary old-school bodybuilding gym. Massive free-weight selection, no-frills atmosphere, low monthly rates. A Pattaya institution.",
    tags: ["bodybuilding", "free-weights", "budget", "iconic"],
    mapsUrl: "https://maps.google.com/?q=Tony's+Gym+Pattaya",
    verified: "2026-04-27"
  },
  {
    id: "platinum-fitness",
    name: "Platinum Fitness Club",
    category: "fitness",
    area: "Central Pattaya",
    address: "Pattaya Klang, Central Pattaya",
    phone: "+66 38 412 412",
    website: "",
    social: {},
    hours: "Daily 5:30-23:00",
    priceRange: "฿฿",
    description: "Modern, air-conditioned commercial gym. Cardio floor, weight machines, group classes, sauna.",
    tags: ["commercial", "air-con", "classes", "sauna"],
    mapsUrl: "https://maps.google.com/?q=Platinum+Fitness+Pattaya",
    verified: "2026-04-27"
  },

  // === CROSSFIT / FUNCTIONAL ===
  {
    id: "crossfit-pattaya",
    name: "CrossFit Pattaya @ The Jungle Gym",
    category: "crossfit",
    area: "Nong Prue / Central-East Pattaya",
    address: "165/4 Moo 6, Nong Prue, Bang Lamung, Chonburi 20150",
    phone: "",
    website: "https://www.junglegympattaya.com/",
    social: { facebook: "JungleGymPattaya", instagram: "junglegympattaya" },
    hours: "CrossFit Mon-Fri 09:00-10:00 and 19:00-20:00; Sat 09:00-10:00",
    priceRange: "฿฿",
    description: "The only CrossFit affiliate in Pattaya. Hybrid Jungle Gym facility — CrossFit + MMA + archery + dodgeball + slacklining + nutrition + DNA testing. Coach Murray strongly reviewed. Under Armour & Decathlon partnerships.",
    tags: ["crossfit-affiliate", "multi-discipline", "archery", "english-coaches", "open-gym"],
    mapsUrl: "https://maps.google.com/?q=Jungle+Gym+Pattaya",
    detailFile: "venues/crossfit-pattaya.md",
    verified: "2026-04-27"
  },

  // === YOGA / PILATES ===
  {
    id: "yoga-pattaya-studio",
    name: "Yoga Pattaya Studio",
    category: "yoga",
    area: "Thepprasit / Jomtien",
    address: "315/327 Thepprasit Soi 12, Pattaya, Chonburi",
    phone: "+66 95 573 9376",
    website: "https://yogapattaya.com/",
    social: { facebook: "yogapattaya" },
    hours: "Daily morning + evening classes (schedule on yogapattaya.com)",
    priceRange: "฿฿",
    description: "Pattaya's first dedicated international yoga studio. Comprehensive style range: Ashtanga, Mysore, Hatha, Hatha Vinyasa, Vinyasa Flow, Stretching, Fitness Yoga. Instruction in English, Russian, Thai. 2-week unlimited from ฿2,900.",
    tags: ["ashtanga", "mysore", "vinyasa", "trilingual", "established", "near-jomtien"],
    mapsUrl: "https://maps.google.com/?q=Yoga+Pattaya+Studio+Thepprasit",
    detailFile: "venues/yoga-pattaya-studio.md",
    verified: "2026-04-27"
  },
  {
    id: "yoga-haus-pattaya",
    name: "Yoga Haus Pattaya",
    category: "yoga",
    area: "Pattaya Klang / Central",
    address: "Pattaya Klang Road, Central Pattaya (verify exact at studio)",
    phone: "",
    website: "",
    social: {},
    hours: "Group and private classes most days (confirm at studio)",
    priceRange: "฿฿",
    description: "Pattaya's most prominent hot yoga studio. Modern fitness-forward yoga venue with hot yoga, Fit Ball, and traditional formats. Central Pattaya location, walkable from many central accommodations.",
    tags: ["hot-yoga", "fit-ball", "central", "modern", "fitness-yoga"],
    mapsUrl: "https://maps.google.com/?q=Yoga+Haus+Pattaya+Klang",
    detailFile: "venues/yoga-haus-pattaya.md",
    verified: "2026-04-27"
  },

  // === GOLF ===
  {
    id: "siam-country-club",
    name: "Siam Country Club Pattaya",
    category: "golf",
    area: "East Pattaya",
    address: "50 Moo 9, Pong, Banglamung, Chonburi",
    phone: "+66 38 909 700",
    website: "https://www.siamcountryclub.com/",
    social: {},
    hours: "Daily 6:00-19:00",
    priceRange: "฿฿฿฿",
    description: "Multiple championship 18-hole courses including Old Course, Plantation, and Waterside. One of Asia's premier golf destinations.",
    tags: ["championship", "multiple-courses", "premier"],
    mapsUrl: "https://maps.google.com/?q=Siam+Country+Club+Pattaya",
    verified: "2026-04-27"
  },

  // === RACQUET SPORTS ===
  {
    id: "pattaya-tennis",
    name: "Pattaya Tennis Club",
    category: "racquet",
    area: "Central Pattaya",
    address: "Central Pattaya",
    phone: "+66 89 100 0000",
    website: "",
    social: {},
    hours: "Daily 6:00-22:00",
    priceRange: "฿฿",
    description: "Multiple courts, coaching, equipment rental, social play nights.",
    tags: ["coaching", "social-play", "court-rental"],
    mapsUrl: "https://maps.google.com/?q=Pattaya+Tennis+Club",
    verified: "2026-04-27"
  },

  // === WATERSPORTS ===
  {
    id: "mermaids-dive",
    name: "Mermaid's Dive Center",
    category: "watersports",
    area: "Jomtien",
    address: "Soi White House, Jomtien Beach Road",
    phone: "+66 38 232 219",
    website: "https://mermaidsdive.com/",
    social: { facebook: "mermaidsdive" },
    hours: "Daily 8:00-19:00",
    priceRange: "฿฿฿",
    description: "PADI 5-Star IDC dive center. Day trips, courses from beginner to instructor, technical diving available.",
    tags: ["padi-5-star", "courses", "day-trips", "technical"],
    mapsUrl: "https://maps.google.com/?q=Mermaid's+Dive+Pattaya",
    verified: "2026-04-27"
  },

  // === RUNNING / CYCLING CLUBS ===
  {
    id: "pattaya-hash-house",
    name: "Pattaya Hash House Harriers",
    category: "clubs",
    area: "Various",
    address: "Weekly run from rotating start points",
    phone: "",
    website: "https://pattayahash.com/",
    social: { facebook: "pattayahash" },
    hours: "Mondays 16:00 (winter) / 17:00 (summer)",
    priceRange: "฿",
    description: "The world's largest weekly running club, a 'drinking club with a running problem'. Open to visitors, social atmosphere.",
    tags: ["social", "weekly", "expat", "open-to-visitors"],
    mapsUrl: "https://maps.google.com/?q=Pattaya+Hash+House+Harriers",
    verified: "2026-04-27"
  }
];

window.GYMS = GYMS;
window.CATEGORIES = CATEGORIES;
  },

  // === WATERSPORTS ===
  {
    id: "mermaids-dive",
    name: "Mermaid's Dive Center",
    category: "watersports",
    area: "Jomtien",
    address: "Soi White House, Jomtien Beach Road",
    phone: "+66 38 232 219",
    website: "https://mermaidsdive.com/",
    social: { facebook: "mermaidsdive" },
    hours: "Daily 8:00-19:00",
    priceRange: "฿฿฿",
    description: "PADI 5-Star IDC dive center. Day trips, courses from beginner to instructor, technical diving available.",
    tags: ["padi-5-star", "courses", "day-trips", "technical"],
    mapsUrl: "https://maps.google.com/?q=Mermaid's+Dive+Pattaya",
    verified: "2026-04-27"
  },

  // === RUNNING / CYCLING CLUBS ===
  {
    id: "pattaya-hash-house",
    name: "Pattaya Hash House Harriers",
    category: "clubs",
    area: "Various",
    address: "Weekly run from rotating start points",
    phone: "",
    website: "https://pattayahash.com/",
    social: { facebook: "pattayahash" },
    hours: "Mondays 16:00 (winter) / 17:00 (summer)",
    priceRange: "฿",
    description: "The world's largest weekly running club, a 'drinking club with a running problem'. Open to visitors, social atmosphere.",
    tags: ["social", "weekly", "expat", "open-to-visitors"],
    mapsUrl: "https://maps.google.com/?q=Pattaya+Hash+House+Harriers",
    verified: "2026-04-27"
  }
];

window.GYMS = GYMS;
window.CATEGORIES = CATEGORIES;
