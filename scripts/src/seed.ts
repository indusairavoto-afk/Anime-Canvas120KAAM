import { db } from "@workspace/db";
import { animeTable, episodeTable, commentTable, communityPostTable } from "@workspace/db";

// Public demo videos (all confirmed 200 OK)
const STREAMS = [
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/movie.mp4",
  "https://media.w3.org/2010/05/video/movie_300.mp4",
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/movie.mp4",
  "https://media.w3.org/2010/05/video/movie_300.mp4",
];

// MAL CDN thumbnails (stable public URLs)
const THUMBS = [
  "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
  "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
  "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
  "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
  "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
  "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
  "https://cdn.myanimelist.net/images/anime/5/73199.jpg",
  "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
];

function stream(i: number) { return STREAMS[i % STREAMS.length]; }
function thumb(i: number) { return THUMBS[i % THUMBS.length]; }

async function main() {
  console.log("Clearing existing data...");
  await db.delete(commentTable);
  await db.delete(communityPostTable);
  await db.delete(episodeTable);
  await db.delete(animeTable);

  console.log("Seeding anime...");
  const animeData = await db.insert(animeTable).values([
    {
      title: "Hunter x Hunter (2011)",
      japaneseTitle: "ハンター×ハンター",
      description: "Gon Freecss aspires to become a Hunter, an exceptional being capable of greatness. With his friends, he'll face the darkest corners of the world.",
      coverImage: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/1337/99013l.jpg",
      trailerUrl: null,
      genre: ["Action", "Adventure", "Fantasy"],
      status: "completed",
      rating: 9.0,
      totalEpisodes: 148,
      releaseYear: 2011,
      studio: "Madhouse",
      type: "both",
      viewCount: 2100000,
      isTrending: true,
      isFeatured: true,
    },
    {
      title: "Attack on Titan",
      japaneseTitle: "進撃の巨人",
      description: "Humanity cowers behind massive walls protecting them from giant man-eating humanoids called Titans. Eren Yeager joins the military with his friends after his hometown is devastated.",
      coverImage: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
      trailerUrl: null,
      genre: ["Action", "Drama", "Fantasy", "Horror"],
      status: "completed",
      rating: 9.0,
      totalEpisodes: 87,
      releaseYear: 2013,
      studio: "Wit Studio / MAPPA",
      type: "both",
      viewCount: 1980000,
      isTrending: true,
      isFeatured: false,
    },
    {
      title: "Fullmetal Alchemist: Brotherhood",
      japaneseTitle: "鋼の錬金術師 FULLMETAL ALCHEMIST",
      description: "Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother goes wrong and leaves them in damaged physical forms.",
      coverImage: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
      trailerUrl: null,
      genre: ["Action", "Adventure", "Drama", "Fantasy"],
      status: "completed",
      rating: 9.1,
      totalEpisodes: 64,
      releaseYear: 2009,
      studio: "Bones",
      type: "both",
      viewCount: 1750000,
      isTrending: false,
      isFeatured: false,
    },
    {
      title: "Death Note",
      japaneseTitle: "デスノート",
      description: "A high school student discovers a supernatural notebook that grants its user the ability to kill anyone whose name is written in its pages.",
      coverImage: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg",
      trailerUrl: null,
      genre: ["Mystery", "Psychological", "Supernatural", "Thriller"],
      status: "completed",
      rating: 8.6,
      totalEpisodes: 37,
      releaseYear: 2006,
      studio: "Madhouse",
      type: "both",
      viewCount: 1600000,
      isTrending: false,
      isFeatured: false,
    },
    {
      title: "Demon Slayer: Kimetsu no Yaiba",
      japaneseTitle: "鬼滅の刃",
      description: "A family is slaughtered by a demon leaving the eldest son and his sister who has become a demon herself. He becomes a demon slayer to find a cure.",
      coverImage: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
      trailerUrl: null,
      genre: ["Action", "Fantasy", "Historical"],
      status: "ongoing",
      rating: 8.7,
      totalEpisodes: 44,
      releaseYear: 2019,
      studio: "ufotable",
      type: "both",
      viewCount: 1890000,
      isTrending: true,
      isFeatured: false,
    },
    {
      title: "Jujutsu Kaisen",
      japaneseTitle: "呪術廻戦",
      description: "A boy swallows a cursed talisman — the finger of a demon — and finds himself involved in a war of curses after he gains the power of the demon.",
      coverImage: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
      trailerUrl: null,
      genre: ["Action", "Fantasy", "School", "Supernatural"],
      status: "ongoing",
      rating: 8.7,
      totalEpisodes: 47,
      releaseYear: 2020,
      studio: "MAPPA",
      type: "both",
      viewCount: 1820000,
      isTrending: true,
      isFeatured: false,
    },
    {
      title: "Steins;Gate",
      japaneseTitle: "シュタインズ・ゲート",
      description: "A self-proclaimed mad scientist discovers a way to send messages to the past, attracting SERN, a shadowy organization that has been doing human experiments.",
      coverImage: "https://cdn.myanimelist.net/images/anime/5/73199.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/5/73199l.jpg",
      trailerUrl: null,
      genre: ["Drama", "Sci-Fi", "Thriller"],
      status: "completed",
      rating: 9.1,
      totalEpisodes: 24,
      releaseYear: 2011,
      studio: "White Fox",
      type: "both",
      viewCount: 1450000,
      isTrending: false,
      isFeatured: false,
    },
    {
      title: "My Hero Academia",
      japaneseTitle: "僕のヒーローアカデミア",
      description: "In a world of superheroes, one powerless boy dreams of becoming the greatest hero of all. When the world's top hero offers him his power, his journey begins.",
      coverImage: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/10/78745l.jpg",
      trailerUrl: null,
      genre: ["Action", "Comedy", "School", "Superhero"],
      status: "completed",
      rating: 8.0,
      totalEpisodes: 138,
      releaseYear: 2016,
      studio: "Bones",
      type: "both",
      viewCount: 1680000,
      isTrending: true,
      isFeatured: false,
    },
    {
      title: "One Piece",
      japaneseTitle: "ワンピース",
      description: "A young pirate sets out on a journey to find the legendary treasure and become the King of the Pirates.",
      coverImage: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
      trailerUrl: null,
      genre: ["Action", "Adventure", "Comedy", "Fantasy"],
      status: "ongoing",
      rating: 9.0,
      totalEpisodes: 1100,
      releaseYear: 1999,
      studio: "Toei Animation",
      type: "both",
      viewCount: 2300000,
      isTrending: true,
      isFeatured: false,
    },
    {
      title: "That Time I Got Reincarnated as a Slime",
      japaneseTitle: "転生したらスライムだった件",
      description: "Corporate worker Mikami Satoru is stabbed by a random killer and reincarnates in a fantasy world as a slime with unique abilities.",
      coverImage: "https://cdn.myanimelist.net/images/anime/1190/92399.jpg",
      bannerImage: "https://cdn.myanimelist.net/images/anime/1190/92399l.jpg",
      trailerUrl: null,
      genre: ["Adventure", "Comedy", "Fantasy"],
      status: "ongoing",
      rating: 8.1,
      totalEpisodes: 48,
      releaseYear: 2018,
      studio: "8bit",
      type: "both",
      viewCount: 1200000,
      isTrending: true,
      isFeatured: false,
    },
  ]).returning();

  console.log(`Inserted ${animeData.length} anime`);

  // ── Episodes ──────────────────────────────────────────────────────────────
  type Ep = { season: number; number: number; title: string; desc?: string; date: string; dur: number };

  const hxh: Ep[] = [
    { season: 1, number: 1, title: "Departure × And × Friends", desc: "Gon lives on Whale Island and dreams of becoming a Hunter like his father.", date: "2011-10-02", dur: 23 },
    { season: 1, number: 2, title: "Test × Is × Trouble", desc: "Gon, Kurapika, and Leorio board a ship heading for the Hunter Exam location.", date: "2011-10-09", dur: 23 },
    { season: 1, number: 3, title: "Rivals × For × Survival", desc: "The examinees navigate the sea during a terrible storm to prove themselves.", date: "2011-10-16", dur: 23 },
    { season: 1, number: 4, title: "Who × Wants × To × Fight?", desc: "The candidates must pass a series of challenges to enter the exam.", date: "2011-10-23", dur: 23 },
    { season: 1, number: 5, title: "Hisoka × Is × Sneaky", desc: "The examinees traverse Zaban City in search of the exam hall.", date: "2011-10-30", dur: 23 },
    { season: 1, number: 6, title: "A × Surprising × Trick", desc: "The applicants face the first phase of the Hunter Exam.", date: "2011-11-06", dur: 23 },
    { season: 1, number: 7, title: "Obligatory × And × Reserved", desc: "Gon and the others push through the Numere Wetlands.", date: "2011-11-13", dur: 23 },
    { season: 1, number: 8, title: "Encounter × In × The × Storm", desc: "The group faces Hisoka who tests their mettle.", date: "2011-11-20", dur: 23 },
    { season: 2, number: 9, title: "Beware × The × Trap", desc: "The second phase of the Hunter Exam begins in a chef's kitchen.", date: "2011-11-27", dur: 23 },
    { season: 2, number: 10, title: "Trick × To × The × Trick", desc: "The examinees must prepare a dish using a dangerous pig.", date: "2011-12-04", dur: 23 },
    { season: 2, number: 11, title: "Kalluto × And × Killua", desc: "Killua reveals his assassin background during the exam.", date: "2011-12-11", dur: 23 },
    { season: 2, number: 12, title: "Last × Test × Of × Resolve", desc: "The third phase begins at the top of Trick Tower.", date: "2011-12-18", dur: 23 },
  ];

  const aot: Ep[] = [
    { season: 1, number: 1, title: "To You, in 2000 Years: The Fall of Shiganshina, Part 1", desc: "After 100 years of peace, the Colossal Titan breaches Wall Maria.", date: "2013-04-07", dur: 24 },
    { season: 1, number: 2, title: "That Day: The Fall of Shiganshina, Part 2", desc: "The Titans invade and Eren's mother is devoured before his eyes.", date: "2013-04-14", dur: 24 },
    { season: 1, number: 3, title: "A Dim Light Amid Despair: Humanity's Comeback, Part 1", desc: "Five years later, Eren joins the Training Corps.", date: "2013-04-21", dur: 24 },
    { season: 1, number: 4, title: "The Night of the Closing Ceremony: Humanity's Comeback, Part 2", desc: "The top graduates choose their military branches.", date: "2013-04-28", dur: 24 },
    { season: 1, number: 5, title: "First Battle: The Struggle for Trost, Part 1", desc: "The Colossal Titan appears again and breaches Wall Rose.", date: "2013-05-05", dur: 24 },
    { season: 1, number: 6, title: "The World the Girl Saw: The Struggle for Trost, Part 2", desc: "Mikasa recalls her past as she fights to survive.", date: "2013-05-12", dur: 24 },
    { season: 2, number: 1, title: "Beast Titan", desc: "Scouts discover Titans inside Wall Rose. A mysterious Beast Titan appears.", date: "2017-04-01", dur: 23 },
    { season: 2, number: 2, title: "I'm Home", desc: "Connie returns to his village to find everyone transformed into Titans.", date: "2017-04-08", dur: 23 },
    { season: 3, number: 1, title: "Smoke Signal", desc: "Erwin's plan to retake Wall Maria begins with an elaborate deception.", date: "2018-07-23", dur: 23 },
    { season: 3, number: 2, title: "Pain", desc: "Kenny Ackerman's squad pursues Levi and the others relentlessly.", date: "2018-07-30", dur: 23 },
    { season: 4, number: 1, title: "The Other Side of the Sea", desc: "The Eldian army storms Fort Slava in a brutal offensive.", date: "2020-12-07", dur: 23 },
    { season: 4, number: 2, title: "Midnight Train", desc: "Reiner and Porco deal with the aftermath of the battle.", date: "2020-12-14", dur: 23 },
  ];

  const fmab: Ep[] = [
    { season: 1, number: 1, title: "Fullmetal Alchemist", desc: "Ed and Al visit a corrupt priest claiming to perform miracles through alchemy.", date: "2009-04-05", dur: 24 },
    { season: 1, number: 2, title: "The First Day", desc: "Ed and Al recount their past and the terrible night they tried to resurrect their mother.", date: "2009-04-12", dur: 24 },
    { season: 1, number: 3, title: "City of Heresy", desc: "The brothers arrive in Liore where a corrupt religious leader uses alchemy.", date: "2009-04-19", dur: 24 },
    { season: 1, number: 4, title: "An Alchemist's Anguish", desc: "The brothers encounter a chimera and are horrified by what alchemy has wrought.", date: "2009-04-26", dur: 24 },
    { season: 1, number: 5, title: "Rain of Sorrows", desc: "Ed and Al investigate a missing persons case at a military base.", date: "2009-05-03", dur: 24 },
    { season: 1, number: 6, title: "Road of Hope", desc: "The Elric brothers meet Dr. Marcoh who holds the secrets of the Philosopher's Stone.", date: "2009-05-10", dur: 24 },
    { season: 1, number: 7, title: "Hidden Truths", desc: "Ed deciphers Dr. Marcoh's research notes revealing a terrible truth.", date: "2009-05-17", dur: 24 },
    { season: 1, number: 8, title: "The Fifth Laboratory", desc: "Ed breaks into Laboratory Five to learn the truth of the Philosopher's Stone.", date: "2009-05-24", dur: 24 },
  ];

  const deathNote: Ep[] = [
    { season: 1, number: 1, title: "Rebirth", desc: "Light Yagami discovers the Death Note dropped by a Shinigami.", date: "2006-10-04", dur: 23 },
    { season: 1, number: 2, title: "Confrontation", desc: "Light begins using the Death Note to create a world without criminals.", date: "2006-10-11", dur: 23 },
    { season: 1, number: 3, title: "Dealings", desc: "Light makes a Faustian bargain to give up half his lifespan for eyes.", date: "2006-10-18", dur: 23 },
    { season: 1, number: 4, title: "Pursuit", desc: "The mysterious detective L announces he will catch Kira.", date: "2006-10-25", dur: 23 },
    { season: 1, number: 5, title: "Tactics", desc: "Light devises a plan to uncover L's true identity.", date: "2006-11-01", dur: 23 },
    { season: 1, number: 6, title: "Manipulation", desc: "Light meets L face-to-face for the first time at To-Oh University.", date: "2006-11-08", dur: 23 },
    { season: 1, number: 7, title: "Overcast", desc: "Light befriends L while both keep a close watch on each other.", date: "2006-11-15", dur: 23 },
    { season: 1, number: 8, title: "Glare", desc: "Raye Penber investigates Kira under L's direction.", date: "2006-11-22", dur: 23 },
  ];

  const demonSlayer: Ep[] = [
    { season: 1, number: 1, title: "Cruelty", desc: "Tanjiro returns home to find his family slaughtered by demons, with sister Nezuko transformed.", date: "2019-04-06", dur: 23 },
    { season: 1, number: 2, title: "Trainer Sakonji Urokodaki", desc: "Tanjiro is sent to train under the former Water Hashira.", date: "2019-04-13", dur: 23 },
    { season: 1, number: 3, title: "Sabito and Makomo", desc: "Tanjiro trains on the mountain and encounters mysterious children.", date: "2019-04-20", dur: 23 },
    { season: 1, number: 4, title: "Final Selection", desc: "Tanjiro enters Final Selection on a mountain inhabited by demons.", date: "2019-04-27", dur: 23 },
    { season: 1, number: 5, title: "My Own Steel", desc: "Tanjiro receives his Nichirin blade and begins his first mission.", date: "2019-05-04", dur: 23 },
    { season: 2, number: 1, title: "Sound Hashira Tengen Uzui", desc: "Tanjiro, Zenitsu and Inosuke go undercover in the entertainment district.", date: "2021-12-05", dur: 23 },
    { season: 2, number: 2, title: "Infiltrating the Entertainment District", desc: "The three boys begin their search for the demon tormenting the district.", date: "2021-12-12", dur: 23 },
    { season: 3, number: 1, title: "Someone's Dream", desc: "Tanjiro travels to the Swordsmith Village to repair his blade.", date: "2023-04-09", dur: 23 },
  ];

  const jjk: Ep[] = [
    { season: 1, number: 1, title: "Ryomen Sukuna", desc: "Yuji Itadori swallows a cursed finger to save his friends and becomes host to the King of Curses.", date: "2020-10-03", dur: 23 },
    { season: 1, number: 2, title: "For Myself", desc: "Yuji is scheduled for execution but Gojo convinces higher-ups to let him consume all cursed fingers.", date: "2020-10-10", dur: 23 },
    { season: 1, number: 3, title: "Girl of Steel", desc: "Yuji trains under Gojo and meets his classmates Megumi and Nobara.", date: "2020-10-17", dur: 23 },
    { season: 1, number: 4, title: "Curse Womb Must Die", desc: "Yuji, Megumi and Nobara go on their first official mission to a juvenile detention center.", date: "2020-10-24", dur: 23 },
    { season: 1, number: 5, title: "Curse Womb Must Die -II-", desc: "The team faces Special Grade Cursed Spirit Finger Bearer.", date: "2020-10-31", dur: 23 },
    { season: 1, number: 6, title: "After Rain", desc: "Gojo investigates a conspiracy involving the death of cursed spirit hands.", date: "2020-11-07", dur: 23 },
    { season: 2, number: 1, title: "It's Like That", desc: "Young Gojo and Geto are assigned to escort the Star Plasma Vessel.", date: "2023-07-06", dur: 23 },
    { season: 2, number: 2, title: "Misfortune", desc: "Gojo and Geto face off against the Time Vessel Association.", date: "2023-07-13", dur: 23 },
  ];

  const sg: Ep[] = [
    { season: 1, number: 1, title: "Turning Point 1.048596", desc: "Self-proclaimed mad scientist Rintaro Okabe discovers time travel with a microwave and a phone.", date: "2011-04-06", dur: 24 },
    { season: 1, number: 2, title: "Time Travel Paranoia", desc: "Okabe investigates the IBN 5100 computer and SERN's involvement with time travel.", date: "2011-04-13", dur: 24 },
    { season: 1, number: 3, title: "Parallel World Paranoia", desc: "Okabe discovers he can send text messages to the past using his Phone Microwave.", date: "2011-04-20", dur: 24 },
    { season: 1, number: 4, title: "Interpreter Rendezvous", desc: "SERN investigates the lab and Okabe fears they've been found out.", date: "2011-04-27", dur: 24 },
    { season: 1, number: 5, title: "Starmine Rendezvous", desc: "Okabe, Kurisu and Daru attempt to crack SERN's encrypted database.", date: "2011-05-04", dur: 24 },
    { season: 1, number: 6, title: "Butterfly Effect's Divergence", desc: "They successfully hack SERN, reading the disturbing truth about time travel experiments.", date: "2011-05-11", dur: 24 },
    { season: 1, number: 7, title: "Divergence Singularity", desc: "Okabe begins to suspect their time travel experiments are altering reality.", date: "2011-05-18", dur: 24 },
    { season: 1, number: 8, title: "Chaos Theory Homeostasis I", desc: "Okabe sends a D-mail for Ruka that causes unexpected consequences.", date: "2011-05-25", dur: 24 },
  ];

  const mha: Ep[] = [
    { season: 1, number: 1, title: "Izuku Midoriya: Origin", desc: "In a world of superheroes, Izuku Midoriya is the rare individual born without powers.", date: "2016-04-03", dur: 23 },
    { season: 1, number: 2, title: "What It Takes to Be a Hero", desc: "Izuku meets All Might and learns the truth about his power.", date: "2016-04-10", dur: 23 },
    { season: 1, number: 3, title: "Roaring Muscles", desc: "Izuku trains for 10 months under All Might's strict regimen to receive One For All.", date: "2016-04-17", dur: 23 },
    { season: 1, number: 4, title: "Start Line", desc: "Izuku arrives at U.A. for entrance exams and must earn enough points using his new quirk.", date: "2016-04-24", dur: 23 },
    { season: 1, number: 5, title: "What I Can Do for Now", desc: "The Battle Trial begins as the class is split into hero and villain teams.", date: "2016-05-01", dur: 23 },
    { season: 2, number: 1, title: "That's the Idea, Ochaco", desc: "The U.A. Sports Festival begins and every student wants to impress pro heroes.", date: "2017-04-01", dur: 23 },
    { season: 2, number: 2, title: "Roaring Sports Festival", desc: "The first event of the Sports Festival: an obstacle course race.", date: "2017-04-08", dur: 23 },
    { season: 3, number: 1, title: "Game Start", desc: "Class 1-A and 1-B head to a training camp in the woods.", date: "2018-04-07", dur: 23 },
  ];

  const op: Ep[] = [
    { season: 1, number: 1, title: "I'm Luffy! The Man Who Will Become the Pirate King!", desc: "Monkey D. Luffy rescues Coby from the pirate Alvida and sets off to find the greatest pirate treasure.", date: "1999-10-20", dur: 24 },
    { season: 1, number: 2, title: "Enter the Great Swordsman! Pirate Hunter Roronoa Zoro!", desc: "Luffy searches for Roronoa Zoro, the world's greatest swordsman, held captive at a marine base.", date: "1999-10-27", dur: 24 },
    { season: 1, number: 3, title: "Morgan vs. Luffy! Who's the Strange Fellow?", desc: "Luffy and Zoro work together to take down the corrupt marine captain Axe-Hand Morgan.", date: "1999-11-03", dur: 24 },
    { season: 1, number: 4, title: "Luffy's Past! The Red-Haired Shanks Appears!", desc: "Koby joins the Marine Corps and Luffy recalls his childhood with the pirate Red-Haired Shanks.", date: "1999-11-10", dur: 24 },
    { season: 1, number: 5, title: "A Terrifying Mysterious Power! Captain Buggy, the Clown Pirate!", desc: "Luffy and Zoro arrive at Orange Town, terrorized by the Buggy Pirates.", date: "1999-11-17", dur: 24 },
    { season: 2, number: 1, title: "The Town of the Beginning and the End! Landfall at Logue Town", desc: "The crew arrives at Logue Town where the Pirate King was born and executed.", date: "2000-09-27", dur: 24 },
    { season: 3, number: 1, title: "Baroque Works! Shadow Lurking in the Grand Line!", desc: "The crew enters the Grand Line and encounters Nami's illness.", date: "2001-06-06", dur: 24 },
  ];

  const tensura: Ep[] = [
    { season: 1, number: 1, title: "The Storm Dragon, Veldora", desc: "Satoru Mikami is reincarnated as a slime and meets the storm dragon Veldora.", date: "2018-10-02", dur: 24 },
    { season: 1, number: 2, title: "Meeting the Goblins", desc: "Rimuru encounters a goblin village and names their chief, gaining new abilities.", date: "2018-10-09", dur: 24 },
    { season: 1, number: 3, title: "Battle at the Goblin Village", desc: "Rimuru leads the goblins against a pack of dire wolves threatening the village.", date: "2018-10-16", dur: 24 },
    { season: 1, number: 4, title: "Gabiru Is Here!", desc: "A lizardman named Gabiru arrives demanding the goblin village's loyalty.", date: "2018-10-23", dur: 24 },
    { season: 1, number: 5, title: "Hero King, Gazel Dwargo", desc: "Rimuru travels to the dwarven kingdom of Dwargon to find skilled craftsmen.", date: "2018-10-30", dur: 24 },
    { season: 1, number: 6, title: "Shizu", desc: "Rimuru meets a mysterious female adventurer named Shizu who wears a mask.", date: "2018-11-06", dur: 24 },
    { season: 2, number: 1, title: "The Demon Lord's Seed", desc: "Rimuru must evolve into a Demon Lord to save his people from an attack.", date: "2021-01-05", dur: 24 },
    { season: 2, number: 2, title: "Walpurgis", desc: "Rimuru attends the Demon Lords' banquet as the newest Demon Lord.", date: "2021-01-12", dur: 24 },
  ];

  const allEpisodes: Array<{
    animeTitle: string;
    episodes: Ep[];
  }> = [
    { animeTitle: "Hunter x Hunter (2011)", episodes: hxh },
    { animeTitle: "Attack on Titan", episodes: aot },
    { animeTitle: "Fullmetal Alchemist: Brotherhood", episodes: fmab },
    { animeTitle: "Death Note", episodes: deathNote },
    { animeTitle: "Demon Slayer: Kimetsu no Yaiba", episodes: demonSlayer },
    { animeTitle: "Jujutsu Kaisen", episodes: jjk },
    { animeTitle: "Steins;Gate", episodes: sg },
    { animeTitle: "My Hero Academia", episodes: mha },
    { animeTitle: "One Piece", episodes: op },
    { animeTitle: "That Time I Got Reincarnated as a Slime", episodes: tensura },
  ];

  let epIdx = 0;
  const episodeInserts = [];
  for (const { animeTitle, episodes } of allEpisodes) {
    const anime = animeData.find((a) => a.title === animeTitle);
    if (!anime) { console.warn("No anime found for", animeTitle); continue; }
    for (const ep of episodes) {
      episodeInserts.push({
        animeId: anime.id,
        title: ep.title,
        season: ep.season,
        episodeNumber: ep.number,
        duration: ep.dur,
        description: ep.desc ?? null,
        thumbnailUrl: thumb(epIdx),
        streamUrl: stream(epIdx),
        releaseDate: ep.date,
        viewCount: Math.floor(Math.random() * 500000) + 50000,
        type: "sub" as const,
      });
      epIdx++;
    }
  }
  await db.insert(episodeTable).values(episodeInserts);
  console.log(`Inserted ${episodeInserts.length} episodes`);

  // ── Community Posts ────────────────────────────────────────────────────────
  await db.insert(communityPostTable).values([
    { username: "SilentWatcher", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SilentWatcher", title: "Hunter x Hunter ending — is it ever coming back?", content: "Togashi's health issues have delayed the manga for years. With the anime at episode 148, do you think a sequel or continuation is realistic at this point?", category: "Discussion", likes: 842, commentCount: 47 },
    { username: "AoTFanatic", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AoTFanatic", title: "Attack on Titan finale review — spoilers inside", content: "After years of anticipation, the finale both satisfied and divided the fanbase. The animation from MAPPA was stunning, but the ending choices were controversial.", category: "Review", likes: 2103, commentCount: 186 },
    { username: "AlchemistFan", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlchemistFan", title: "FMA Brotherhood is still the gold standard for anime", content: "Years later, I still think FMAB remains the best complete anime series. The pacing, character development, and payoff are unmatched.", category: "Discussion", likes: 1547, commentCount: 93 },
    { username: "NightOwl", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=NightOwl", title: "Death Note vs. Steins;Gate — which has the better mind games?", content: "Both anime feature genius protagonists engaged in complex psychological warfare. Death Note's cat-and-mouse is classic, but Steins;Gate's time loop mechanics are on another level.", category: "Poll", likes: 731, commentCount: 64 },
    { username: "SlimeFanatic", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SlimeFanatic", title: "Rimuru is the most OP isekai protagonist and that's okay", content: "Some say Rimuru is too overpowered, but that's the point. It's a power fantasy that knows exactly what it is. The world-building around Rimuru is what makes the show great.", category: "Discussion", likes: 489, commentCount: 38 },
  ]);

  // ── Comments ───────────────────────────────────────────────────────────────
  const epIds = await db.select().from(episodeTable).limit(3);
  const postIds = await db.select().from(communityPostTable).limit(3);

  const commentInserts = [];
  for (const ep of epIds) {
    commentInserts.push(
      { episodeId: ep.id, username: "AnimeFanatic", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnimeFanatic", content: "This episode is absolutely legendary. The animation is top tier.", likes: 142 },
      { episodeId: ep.id, username: "Kurisu_Time", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kurisu_Time", content: "I've rewatched this at least 5 times and it hits differently every single time.", likes: 87 },
      { episodeId: ep.id, username: "GonFreecss", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=GonFreecss", content: "The music in this scene is so good it gives me chills.", likes: 63 },
    );
  }
  for (const post of postIds) {
    commentInserts.push(
      { communityPostId: post.id, username: "WingzOfFreedom", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=WingzOfFreedom", content: "Great post! Totally agree with everything you said.", likes: 24 },
      { communityPostId: post.id, username: "ErenYeager", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ErenYeager", content: "I disagree — but I respect the opinion. The debate is what makes this community great.", likes: 17 },
    );
  }
  await db.insert(commentTable).values(commentInserts);
  console.log(`Inserted ${commentInserts.length} comments`);

  console.log("✅ Seed complete!");
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
