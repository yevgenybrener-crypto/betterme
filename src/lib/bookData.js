// ─── Book Library ─────────────────────────────────────────────────────────────
// Curated list of ~50 books with genres, bestseller flag, and short descriptions.

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
  { id: 'b9',  title: 'Man\'s Search for Meaning',    author: 'Viktor Frankl',        genres: ['psychology', 'philosophy'],  bestseller: true,  emoji: '📒', desc: 'A Holocaust survivor\'s lessons about finding purpose.' },
  { id: 'b10', title: 'Influence',                    author: 'Robert Cialdini',      genres: ['psychology', 'business'],    bestseller: true,  emoji: '📙', desc: 'The psychology of persuasion.' },

  // Business & Leadership
  { id: 'b11', title: 'Zero to One',                  author: 'Peter Thiel',          genres: ['business'],                  bestseller: true,  emoji: '📘', desc: 'Notes on startups, or how to build the future.' },
  { id: 'b12', title: 'Good to Great',                author: 'Jim Collins',          genres: ['business', 'leadership'],    bestseller: true,  emoji: '📗', desc: 'Why some companies make the leap and others don\'t.' },
  { id: 'b13', title: 'The Lean Startup',             author: 'Eric Ries',            genres: ['business'],                  bestseller: true,  emoji: '📒', desc: 'How today\'s entrepreneurs use continuous innovation.' },
  { id: 'b14', title: 'Start with Why',               author: 'Simon Sinek',          genres: ['business', 'leadership'],    bestseller: true,  emoji: '📙', desc: 'How great leaders inspire everyone to take action.' },
  { id: 'b15', title: 'The Hard Thing About Hard Things', author: 'Ben Horowitz',     genres: ['business', 'leadership'],    bestseller: true,  emoji: '📕', desc: 'Building a business when there are no easy answers.' },
  { id: 'b16', title: 'Principles',                   author: 'Ray Dalio',            genres: ['business', 'philosophy'],    bestseller: true,  emoji: '📘', desc: 'Life and work principles from a legendary investor.' },

  // Finance
  { id: 'b17', title: 'The Psychology of Money',      author: 'Morgan Housel',        genres: ['finance', 'psychology'],     bestseller: true,  emoji: '📙', desc: 'Timeless lessons on wealth, greed, and happiness.' },
  { id: 'b18', title: 'Rich Dad Poor Dad',            author: 'Robert Kiyosaki',      genres: ['finance'],                   bestseller: true,  emoji: '📗', desc: 'What the rich teach their kids about money.' },
  { id: 'b19', title: 'The Millionaire Next Door',    author: 'Thomas Stanley',       genres: ['finance'],                   bestseller: false, emoji: '📒', desc: 'The surprising secrets of America\'s wealthy.' },
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
  { id: 'b39', title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', genres: ['fiction'],               bestseller: true,  emoji: '📗', desc: 'Don\'t panic. The answer is 42.' },

  // Bonus
  { id: 'b40', title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', genres: ['relationships', 'business'], bestseller: true, emoji: '📕', desc: 'The ultimate classic on human relations.' },
  { id: 'b41', title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', genres: ['productivity', 'leadership'], bestseller: true, emoji: '📘', desc: 'Powerful lessons in personal change.' },
  { id: 'b42', title: 'Outliers',                     author: 'Malcolm Gladwell',     genres: ['psychology', 'history'],     bestseller: true,  emoji: '📒', desc: 'The story of success.' },
  { id: 'b43', title: 'Blink',                        author: 'Malcolm Gladwell',     genres: ['psychology'],                bestseller: true,  emoji: '📗', desc: 'The power of thinking without thinking.' },
  { id: 'b44', title: 'Never Split the Difference',   author: 'Chris Voss',           genres: ['psychology', 'business'],    bestseller: true,  emoji: '📙', desc: 'Negotiating as if your life depended on it.' },
  { id: 'b45', title: 'Can\'t Hurt Me',               author: 'David Goggins',        genres: ['health', 'productivity'],    bestseller: true,  emoji: '📕', desc: 'Master your mind and defy the odds.' },
  { id: 'b46', title: 'Shoe Dog',                     author: 'Phil Knight',          genres: ['business'],                  bestseller: true,  emoji: '📗', desc: 'A memoir by the creator of Nike.' },
  { id: 'b47', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson',   genres: ['philosophy', 'psychology'],  bestseller: true,  emoji: '📘', desc: 'A counterintuitive approach to living a good life.' },
  { id: 'b48', title: 'Antifragile',                  author: 'Nassim Nicholas Taleb',genres: ['philosophy', 'business'],    bestseller: false, emoji: '📒', desc: 'Things that gain from disorder.' },
  { id: 'b49', title: 'The 48 Laws of Power',         author: 'Robert Greene',        genres: ['philosophy', 'business'],    bestseller: true,  emoji: '📙', desc: 'Master the subtle science of power and influence.' },
  { id: 'b50', title: 'Viktor Frankl\'s Logotherapy', author: 'Viktor Frankl',        genres: ['psychology', 'philosophy'],  bestseller: false, emoji: '📕', desc: 'Finding meaning in even the most difficult circumstances.' },
]

// Genre color mapping
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

// Given a list of read book IDs, return suggested books:
// - Not already read
// - Sorted by: matching genres first, then bestsellers
export function getPersonalizedBooks(readBookIds = [], limit = 10) {
  const readSet = new Set(readBookIds)
  const readBooks = BOOKS.filter(b => readSet.has(b.id))
  
  // Collect genres the user likes (by frequency)
  const genreScore = {}
  readBooks.forEach(b => {
    b.genres.forEach(g => { genreScore[g] = (genreScore[g] || 0) + 1 })
  })

  const unread = BOOKS.filter(b => !readSet.has(b.id))

  return unread
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

export function getBooksByGenre(genre, readBookIds = []) {
  const readSet = new Set(readBookIds)
  return BOOKS.filter(b => b.genres.includes(genre) && !readSet.has(b.id))
}
