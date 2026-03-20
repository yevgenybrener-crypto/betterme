// ─── Book Library ─────────────────────────────────────────────────────────────
// Curated list of books with genres, bestseller flag, and short descriptions.

export const GENRES = [
  { id: 'productivity', label: 'Productivity' },
  { id: 'business',     label: 'Business' },
  { id: 'psychology',   label: 'Psychology' },
  { id: 'finance',      label: 'Finance' },
  { id: 'history',      label: 'History' },
  { id: 'health',       label: 'Health' },
  { id: 'philosophy',   label: 'Philosophy' },
  { id: 'fiction',      label: 'Fiction' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'leadership',   label: 'Leadership' },
]

// ─── Global book list ─────────────────────────────────────────────────────────
export const BOOKS = [
  // Productivity
  { id: 'b1',  title: 'Atomic Habits',                author: 'James Clear',          genres: ['productivity', 'psychology'], bestseller: true,  emoji: '📗', desc: 'Tiny changes, remarkable results. The definitive guide to building good habits.' },
  { id: 'b2',  title: 'Deep Work',                    author: 'Cal Newport',          genres: ['productivity'],              bestseller: true,  emoji: '📕', desc: 'Rules for focused success in a distracted world.' },
  { id: 'b3',  title: 'Getting Things Done',          author: 'David Allen',          genres: ['productivity'],              bestseller: false, emoji: '📒', desc: 'The art of stress-free productivity.' },
  { id: 'b4',  title: 'The One Thing',                author: 'Gary Keller',          genres: ['productivity', 'business'],  bestseller: true,  emoji: '📘', desc: 'The surprisingly simple truth behind extraordinary results.' },
  { id: 'b5',  title: 'Essentialism',                 author: 'Greg McKeown',         genres: ['productivity', 'philosophy'],bestseller: true,  emoji: '📙', desc: 'The disciplined pursuit of less.' },

  // Psychology & Mindset
  { id: 'b6',  title: 'Thinking, Fast and Slow',      author: 'Daniel Kahneman',      genres: ['psychology'],                bestseller: true,  emoji: '📗', desc: 'A tour of the mind and an explanation of the two systems that drive the way we think.' },
  { id: 'b7',  title: 'Mindset',                      author: 'Carol S. Dweck',       genres: ['psychology'],                bestseller: true,  emoji: '📘', desc: 'The new psychology of success.' },
  { id: 'b8',  title: 'The Power of Now',             author: 'Eckhart Tolle',        genres: ['psychology', 'philosophy'],  bestseller: true,  emoji: '📕', desc: 'A guide to spiritual enlightenment.' },
  { id: 'b9',  title: "Man's Search for Meaning",     author: 'Viktor Frankl',        genres: ['psychology', 'philosophy'],  bestseller: true,  emoji: '📒', desc: "A Holocaust survivor's lessons about finding purpose." },
  { id: 'b10', title: 'Influence',                    author: 'Robert Cialdini',      genres: ['psychology', 'business'],    bestseller: true,  emoji: '📙', desc: 'The psychology of persuasion.' },

  // Business & Leadership
  { id: 'b11', title: 'Zero to One',                  author: 'Peter Thiel',          genres: ['business'],                  bestseller: true,  emoji: '📘', desc: 'Notes on startups, or how to build the future.' },
  { id: 'b12', title: 'Good to Great',                author: 'Jim Collins',          genres: ['business', 'leadership'],    bestseller: true,  emoji: '📗', desc: "Why some companies make the leap and others don't." },
  { id: 'b13', title: 'The Lean Startup',             author: 'Eric Ries',            genres: ['business'],                  bestseller: true,  emoji: '📒', desc: 'How today\'s entrepreneurs use continuous innovation.' },
  { id: 'b14', title: 'Start with Why',               author: 'Simon Sinek',          genres: ['business', 'leadership'],    bestseller: true,  emoji: '📙', desc: 'How great leaders inspire everyone to take action.' },
  { id: 'b15', title: 'The Hard Thing About Hard Things', author: 'Ben Horowitz',     genres: ['business', 'leadership'],    bestseller: true,  emoji: '📕', desc: 'Building a business when there are no easy answers.' },
  { id: 'b16', title: 'Principles',                   author: 'Ray Dalio',            genres: ['business', 'philosophy'],    bestseller: true,  emoji: '📘', desc: 'Life and work principles from a legendary investor.' },

  // Finance
  { id: 'b17', title: 'The Psychology of Money',      author: 'Morgan Housel',        genres: ['finance', 'psychology'],     bestseller: true,  emoji: '📙', desc: 'Timeless lessons on wealth, greed, and happiness.' },
  { id: 'b18', title: 'Rich Dad Poor Dad',            author: 'Robert Kiyosaki',      genres: ['finance'],                   bestseller: true,  emoji: '📗', desc: 'What the rich teach their kids about money.' },
  { id: 'b19', title: 'The Millionaire Next Door',    author: 'Thomas Stanley',       genres: ['finance'],                   bestseller: false, emoji: '📒', desc: "The surprising secrets of America's wealthy." },
  { id: 'b20', title: 'I Will Teach You to Be Rich',  author: 'Ramit Sethi',          genres: ['finance'],                   bestseller: true,  emoji: '📘', desc: 'A practical, no-BS guide to getting your finances right.' },

  // History & Science
  { id: 'b21', title: 'Sapiens',                      author: 'Yuval Noah Harari',    genres: ['history'],                   bestseller: true,  emoji: '📘', desc: 'A brief history of humankind.' },
  { id: 'b22', title: 'Homo Deus',                    author: 'Yuval Noah Harari',    genres: ['history', 'philosophy'],     bestseller: true,  emoji: '📕', desc: 'A brief history of tomorrow.' },
  { id: 'b23', title: 'The Innovators',               author: 'Walter Isaacson',      genres: ['history', 'business'],       bestseller: false, emoji: '📒', desc: 'How a group of hackers, geniuses, and geeks created the digital revolution.' },
  { id: 'b24', title: 'Guns, Germs, and Steel',       author: 'Jared Diamond',        genres: ['history'],                   bestseller: true,  emoji: '📗', desc: 'The fates of human societies.' },

  // Health & Lifestyle
  { id: 'b25', title: 'Why We Sleep',                 author: 'Matthew Walker',       genres: ['health'],                    bestseller: true,  emoji: '📙', desc: 'Unlocking the power of sleep and dreams.' },
  { id: 'b26', title: 'The Body Keeps the Score',     author: 'Bessel van der Kolk',  genres: ['health', 'psychology'],      bestseller: true,  emoji: '📕', desc: 'Brain, mind, and body in the healing of trauma.' },
  { id: 'b27', title: 'Born to Run',                  author: 'Christopher McDougall',genres: ['health'],                    bestseller: true,  emoji: '📗', desc: 'A hidden tribe, superathletes, and the greatest race the world has never seen.' },
  { id: 'b28', title: 'Breath',                       author: 'James Nestor',         genres: ['health'],                    bestseller: false, emoji: '📘', desc: 'The new science of a lost art.' },

  // Relationships
  { id: 'b29', title: 'The 5 Love Languages',         author: 'Gary Chapman',         genres: ['relationships'],             bestseller: true,  emoji: '📕', desc: 'The secret to love that lasts.' },
  { id: 'b30', title: 'Nonviolent Communication',     author: 'Marshall Rosenberg',   genres: ['relationships', 'psychology'],bestseller: false, emoji: '📒', desc: 'A language of life.' },
  { id: 'b31', title: 'Attached',                     author: 'Amir Levine',          genres: ['relationships', 'psychology'],bestseller: true,  emoji: '📗', desc: 'The new science of adult attachment.' },
  { id: 'b32', title: 'Hold Me Tight',                author: 'Sue Johnson',          genres: ['relationships'],             bestseller: false, emoji: '📘', desc: 'Seven conversations for a lifetime of love.' },

  // Philosophy
  { id: 'b33', title: 'Meditations',                  author: 'Marcus Aurelius',      genres: ['philosophy'],                bestseller: true,  emoji: '📙', desc: 'Personal writings of the Roman Emperor. Stoic wisdom for modern life.' },
  { id: 'b34', title: 'The Alchemist',                author: 'Paulo Coelho',         genres: ['fiction', 'philosophy'],     bestseller: true,  emoji: '📕', desc: 'A magical story about following your dreams.' },
  { id: 'b35', title: 'Siddhartha',                   author: 'Hermann Hesse',        genres: ['philosophy'],                bestseller: false, emoji: '📗', desc: 'A spiritual novel about self-discovery.' },

  // Fiction
  { id: 'b36', title: '1984',                         author: 'George Orwell',        genres: ['fiction'],                   bestseller: true,  emoji: '📘', desc: 'A dystopian masterpiece. Still terrifyingly relevant.' },
  { id: 'b37', title: 'The Great Gatsby',             author: 'F. Scott Fitzgerald',  genres: ['fiction'],                   bestseller: true,  emoji: '📒', desc: 'A tale of the American dream.' },
  { id: 'b38', title: 'Dune',                         author: 'Frank Herbert',        genres: ['fiction'],                   bestseller: true,  emoji: '📙', desc: 'The greatest science-fiction novel ever written.' },
  { id: 'b39', title: "The Hitchhiker's Guide to the Galaxy", author: 'Douglas Adams', genres: ['fiction'],                 bestseller: true,  emoji: '📗', desc: "Don't panic. The answer is 42." },

  // Bonus
  { id: 'b40', title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', genres: ['relationships', 'business'], bestseller: true, emoji: '📕', desc: 'The ultimate classic on human relations.' },
  { id: 'b41', title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', genres: ['productivity', 'leadership'], bestseller: true, emoji: '📘', desc: 'Powerful lessons in personal change.' },
  { id: 'b42', title: 'Outliers',                     author: 'Malcolm Gladwell',     genres: ['psychology', 'history'],     bestseller: true,  emoji: '📒', desc: 'The story of success.' },
  { id: 'b43', title: 'Blink',                        author: 'Malcolm Gladwell',     genres: ['psychology'],                bestseller: true,  emoji: '📗', desc: 'The power of thinking without thinking.' },
  { id: 'b44', title: 'Never Split the Difference',   author: 'Chris Voss',           genres: ['psychology', 'business'],    bestseller: true,  emoji: '📙', desc: 'Negotiating as if your life depended on it.' },
  { id: 'b45', title: "Can't Hurt Me",                author: 'David Goggins',        genres: ['health', 'productivity'],    bestseller: true,  emoji: '📕', desc: 'Master your mind and defy the odds.' },
  { id: 'b46', title: 'Shoe Dog',                     author: 'Phil Knight',          genres: ['business'],                  bestseller: true,  emoji: '📗', desc: 'A memoir by the creator of Nike.' },
  { id: 'b47', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson',   genres: ['philosophy', 'psychology'],  bestseller: true,  emoji: '📘', desc: 'A counterintuitive approach to living a good life.' },
  { id: 'b48', title: 'Antifragile',                  author: 'Nassim Nicholas Taleb',genres: ['philosophy', 'business'],    bestseller: false, emoji: '📒', desc: 'Things that gain from disorder.' },
  { id: 'b49', title: 'The 48 Laws of Power',         author: 'Robert Greene',        genres: ['philosophy', 'business'],    bestseller: true,  emoji: '📙', desc: 'Master the subtle science of power and influence.' },
  { id: 'b50', title: 'The Power of Habit',           author: 'Charles Duhigg',       genres: ['psychology', 'productivity'],bestseller: true,  emoji: '📕', desc: 'Why we do what we do in life and business.' },
]

// ─── Israeli local bestsellers ────────────────────────────────────────────────
// Israeli authors + books hugely popular in Israel — Hebrew titles & descriptions
export const BOOKS_IL = [
  {
    id: 'il1', emoji: '📘', local: true, bestseller: true,
    genres: ['history'],
    title: 'קיצור תולדות האנושות',
    titleEn: 'Sapiens',
    author: 'יובל נח הררי',
    desc: 'מסע מרתק בתולדות המין האנושי — מהאבולוציה ועד לעידן המודרני. אחד הספרים הנמכרים ביותר בישראל ובעולם.',
  },
  {
    id: 'il2', emoji: '📕', local: true, bestseller: true,
    genres: ['history', 'philosophy'],
    title: 'הומו דאוס: קיצור תולדות המחר',
    titleEn: 'Homo Deus',
    author: 'יובל נח הררי',
    desc: 'לאן פני האנושות? הררי בוחן את העתיד הקרוב — בינה מלאכותית, חיי נצח וסוף הסדר הישן.',
  },
  {
    id: 'il3', emoji: '📗', local: true, bestseller: true,
    genres: ['philosophy', 'history'],
    title: '21 מחשבות על המאה ה-21',
    titleEn: '21 Lessons for the 21st Century',
    author: 'יובל נח הררי',
    desc: 'מה קורה לנו עכשיו? הררי מתמודד עם השאלות הדחופות ביותר של זמננו — פוליטיקה, טכנולוגיה, משמעות.',
  },
  {
    id: 'il4', emoji: '📒', local: true, bestseller: true,
    genres: ['fiction'],
    title: 'אישה בורחת מבשורה',
    titleEn: 'To the End of the Land',
    author: 'דוד גרוסמן',
    desc: 'אורה יוצאת לטיול בגליל כדי לא להיות בבית אם יבואו לבשר לה. אחד הספרים הגדולים שנכתבו בעברית.',
  },
  {
    id: 'il5', emoji: '📙', local: true, bestseller: true,
    genres: ['fiction', 'history'],
    title: 'סיפור על אהבה וחושך',
    titleEn: 'A Tale of Love and Darkness',
    author: 'עמוס עוז',
    desc: 'זיכרונות ילדות בירושלים של תש״ח — הקמת המדינה, האם שאבדה, והנער שנעשה לסופר.',
  },
  {
    id: 'il6', emoji: '📕', local: true, bestseller: true,
    genres: ['fiction'],
    title: 'פתאום דפיקה בדלת',
    titleEn: 'Suddenly, a Knock on the Door',
    author: 'אתגר קרת',
    desc: 'סיפורים קצרים שמחזיקים עולם שלם. קרת הוא הקול הספרותי הישראלי המוכר ביותר בחו״ל.',
  },
  {
    id: 'il7', emoji: '📗', local: true, bestseller: false,
    genres: ['fiction'],
    title: 'המנהרה',
    titleEn: 'The Tunnel',
    author: 'א.ב. יהושע',
    desc: 'ספרו האחרון של א.ב. יהושע — על זיכרון, זהות, ואהבה בצל דמנציה.',
  },
  {
    id: 'il8', emoji: '📘', local: true, bestseller: true,
    genres: ['history'],
    title: 'ארץ המובטחת שלי',
    titleEn: 'My Promised Land',
    author: 'ארי שביט',
    desc: 'פורטרט אמיץ של ישראל — ניצחון וטרגדיה, חלום ומחיר. רב מכר בינלאומי שנכתב על ידי ישראלי.',
  },
  {
    id: 'il9', emoji: '📒', local: true, bestseller: true,
    genres: ['business', 'history'],
    title: 'מדינת הסטארטאפ',
    titleEn: 'Startup Nation',
    author: 'דן סנור וסול סינגר',
    desc: 'למה ישראל — מדינה קטנה במזרח התיכון — מייצרת יותר חברות סטארטאפ ממרבית המדינות הגדולות?',
  },
  {
    id: 'il10', emoji: '📙', local: true, bestseller: true,
    genres: ['business', 'leadership'],
    title: 'חוצפה',
    titleEn: 'Chutzpah',
    author: 'ענבל אריאלי',
    desc: 'מה הופך ילדים ישראלים ליזמים? ספר על גידול, חינוך וחדשנות בתרבות הישראלית.',
  },
  {
    id: 'il11', emoji: '📕', local: true, bestseller: false,
    genres: ['fiction', 'history'],
    title: 'חזרה מהודו',
    titleEn: 'Return from India',
    author: 'א.ב. יהושע',
    desc: 'רומן על זוגיות, זרות ומסע פנימי. יהושע במיטבו.',
  },
  {
    id: 'il12', emoji: '📗', local: true, bestseller: true,
    genres: ['fiction'],
    title: 'עד קצה הלילה',
    titleEn: 'To the End of the Night',
    author: 'אורלי קסטל-בלום',
    desc: 'ספרות ישראלית מודרנית שמתמודדת עם המציאות הסוריאליסטית של החיים כאן.',
  },
  {
    id: 'il13', emoji: '📘', local: true, bestseller: false,
    genres: ['psychology', 'philosophy'],
    title: 'להיות מאושר',
    titleEn: 'Being Happy',
    author: 'תל בן-שחר',
    desc: 'הפסיכולוג הישראלי שלימד את הקורס הפופולרי ביותר בהרוורד על אושר ומשמעות.',
  },
  {
    id: 'il14', emoji: '📒', local: true, bestseller: true,
    genres: ['fiction'],
    title: 'שני עולמות',
    titleEn: 'Two Worlds',
    author: 'עמוס עוז',
    desc: 'עוז מציג את הקיטוב בחברה הישראלית דרך עיניים אנושיות ורגישות.',
  },
  {
    id: 'il15', emoji: '📙', local: true, bestseller: true,
    genres: ['business'],
    title: 'הגורם האנושי',
    titleEn: 'The Human Factor',
    author: 'גיל אלון',
    desc: 'ניהול, מנהיגות ואנשים — לקחים מהתעשייה הישראלית עבור כל מנהל שרוצה להשתפר.',
  },
]

// ─── Store link helpers ───────────────────────────────────────────────────────
// Returns the buy URL for a book — Steimatzky for Israel, Amazon for others
export function getBuyUrl(book, isIsrael = false) {
  const q = encodeURIComponent(`${book.title} ${book.author}`)
  if (isIsrael) {
    return `https://www.steimatzky.co.il/catalogsearch/result/?q=${encodeURIComponent(book.title)}`
  }
  return `https://www.amazon.com/s?k=${q}`
}

export function getStoreName(isIsrael = false) {
  return isIsrael ? 'Steimatzky' : 'Amazon'
}

export function getStoreEmoji(isIsrael = false) {
  return isIsrael ? '🇮🇱' : '🛒'
}

// ─── Genre color mapping ──────────────────────────────────────────────────────
export const GENRE_COLORS = {
  productivity:  { bg: 'rgba(108,99,255,0.1)',   text: '#6C63FF' },
  business:      { bg: 'rgba(92,124,250,0.12)',   text: '#5C7CFA' },
  psychology:    { bg: 'rgba(77,171,247,0.12)',   text: '#4DABF7' },
  finance:       { bg: 'rgba(255,212,59,0.15)',   text: '#E6A817' },
  history:       { bg: 'rgba(67,233,123,0.12)',   text: '#2EAD65' },
  health:        { bg: 'rgba(255,101,132,0.12)',  text: '#FF6584' },
  philosophy:    { bg: 'rgba(155,89,182,0.12)',   text: '#9B59B6' },
  fiction:       { bg: 'rgba(255,107,107,0.12)',  text: '#E53E3E' },
  relationships: { bg: 'rgba(255,101,132,0.15)',  text: '#FF6584' },
  leadership:    { bg: 'rgba(67,233,123,0.1)',    text: '#2EAD65' },
}

// ─── Recommendation helpers ───────────────────────────────────────────────────
export function getPersonalizedBooks(readBookIds = [], includeLocal = false, limit = 10) {
  const allBooks = includeLocal ? [...BOOKS, ...BOOKS_IL] : BOOKS
  const readSet = new Set(readBookIds)
  const readBooks = allBooks.filter(b => readSet.has(b.id))

  const genreScore = {}
  readBooks.forEach(b => {
    b.genres.forEach(g => { genreScore[g] = (genreScore[g] || 0) + 1 })
  })

  return allBooks
    .filter(b => !readSet.has(b.id))
    .map(b => ({
      ...b,
      score: b.genres.reduce((s, g) => s + (genreScore[g] || 0), 0) + (b.bestseller ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function getBestsellers(readBookIds = [], limit = 15) {
  const readSet = new Set(readBookIds)
  return BOOKS.filter(b => b.bestseller && !readSet.has(b.id)).slice(0, limit)
}

export function getLocalBestsellers(readBookIds = []) {
  const readSet = new Set(readBookIds)
  return BOOKS_IL.filter(b => !readSet.has(b.id))
}

export function getBooksByGenre(genre, readBookIds = [], includeLocal = false) {
  const allBooks = includeLocal ? [...BOOKS, ...BOOKS_IL] : BOOKS
  const readSet = new Set(readBookIds)
  return allBooks.filter(b => b.genres.includes(genre) && !readSet.has(b.id))
}
