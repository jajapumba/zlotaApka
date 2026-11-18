// Baza wiedzy kulinarnej w czasie rzeczywistym (bez zewnętrznej bazy danych)
// Pozwala w locie zmapować wpisane przez użytkownika danie (np. "carbonara", "ramen", "kebab")
// na profil kuchni w OpenStreetMap, synonimy, emoji oraz słowa kluczowe.

export const POPULAR_DISHES = [
  { name: 'Carbonara', query: 'carbonara', emoji: '🍝', cuisine: 'italian;pasta', desc: 'Klasyczny makaron po rzymsku (guanciale, jajko, pecorino)' },
  { name: 'Pizza', query: 'pizza', emoji: '🍕', cuisine: 'pizza;italian', desc: 'Włoska pizza na cienkim lub puszystym cieście' },
  { name: 'Burger', query: 'burger', emoji: '🍔', cuisine: 'burger;american', desc: 'Soczysty burger wołowy lub wegański z frytkami' },
  { name: 'Ramen', query: 'ramen', emoji: '🍜', cuisine: 'ramen;japanese;asian', desc: 'Aromatyczny japoński bulion z makaronem i dodatkami' },
  { name: 'Kebab', query: 'kebab', emoji: '🌯', cuisine: 'kebab;turkish', desc: 'Kebab w cieście, bułce lub na talerzu' },
  { name: 'Pierogi', query: 'pierogi', emoji: '🥟', cuisine: 'polish;regional', desc: 'Ruskie, z mięsem, kapustą i grzybami lub owocami' },
  { name: 'Sushi', query: 'sushi', emoji: '🍣', cuisine: 'sushi;japanese', desc: 'Nigiri, futomaki, uramaki ze świeżą rybą i warzywami' },
  { name: 'Pad Thai', query: 'pad thai', emoji: '🥢', cuisine: 'thai;asian', desc: 'Smażony makaron ryżowy z sosem tamaryndowym i orzeszkami' },
  { name: 'Schabowy', query: 'schabowy', emoji: '🥩', cuisine: 'polish;regional', desc: 'Tradycyjny kotlet schabowy z ziemniakami i kapustą' },
  { name: 'Żurek / Barszcz', query: 'żurek', emoji: '🍲', cuisine: 'polish;regional', desc: 'Staropolskie zupy na zakwasie' }
];

export const DISH_DATABASE = [
  {
    aliases: ['carbonara', 'karbonara', 'spaghetti carbonara', 'carbonary', 'carbonare', 'makaron carbonara'],
    name: 'Carbonara',
    emoji: '🍝',
    category: 'Kuchnia włoska / Makarony',
    cuisines: ['italian', 'pasta', 'pizza', 'mediterranean'],
    keywords: ['trattoria', 'pasta', 'makaron', 'spaghetti', 'włoska', 'italiana', 'ristorante', 'osteria'],
    confidenceExpl: 'Restauracja włoska / trattoria – specjalizuje się w daniach z makaronem (niemal na pewno ma Carbonarę w karcie)'
  },
  {
    aliases: ['bolognese', 'boloński', 'spaghetti bolognese', 'lasagne', 'lasagna', 'tagliatelle', 'gnocchi', 'ravioli', 'makaron'],
    name: 'Makarony włoskie',
    emoji: '🍝',
    category: 'Kuchnia włoska / Makarony',
    cuisines: ['italian', 'pasta', 'mediterranean', 'pizza'],
    keywords: ['trattoria', 'pasta', 'makaron', 'spaghetti', 'włoska', 'ristorante'],
    confidenceExpl: 'Restauracja włoska / z makaronami'
  },
  {
    aliases: ['pizza', 'margherita', 'margerita', 'napoletana', 'capricciosa', 'quattro formaggi', 'pepperoni', 'diavola'],
    name: 'Pizza',
    emoji: '🍕',
    category: 'Pizzeria / Włoska',
    cuisines: ['pizza', 'italian'],
    keywords: ['pizzeria', 'pizza', 'napoletana', 'trattoria', 'piec'],
    confidenceExpl: 'Pizzeria / lokal z piecem do pizzy'
  },
  {
    aliases: ['ramen', 'tonkotsu', 'shoyu', 'miso ramen', 'tantanmen', 'japonia'],
    name: 'Ramen',
    emoji: '🍜',
    category: 'Kuchnia japońska / azjatycka',
    cuisines: ['ramen', 'japanese', 'asian', 'noodle'],
    keywords: ['ramen', 'ramen-ya', 'japońska', 'asian', 'orient'],
    confidenceExpl: 'Ramen shop / restauracja japońska serwująca autentyczny ramen'
  },
  {
    aliases: ['sushi', 'uramaki', 'futomaki', 'nigiri', 'sashimi', 'hosomaki', 'rolki'],
    name: 'Sushi',
    emoji: '🍣',
    category: 'Kuchnia japońska / Sushi',
    cuisines: ['sushi', 'japanese', 'asian'],
    keywords: ['sushi', 'koku sushi', 'sakura', 'japońska'],
    confidenceExpl: 'Sushi bar / restauracja japońska'
  },
  {
    aliases: ['kebab', 'kebap', 'rollo', 'doner', 'durum', 'kebabie', 'pita', 'lawasz', 'kapsalon'],
    name: 'Kebab',
    emoji: '🌯',
    category: 'Kuchnia turecka / Kebab',
    cuisines: ['kebab', 'turkish', 'middle_eastern', 'fast_food'],
    keywords: ['kebab', 'kebap', 'doner', 'döner', 'grill', 'orient'],
    confidenceExpl: 'Kebab / lokal z kuchnią bliskowschodnią'
  },
  {
    aliases: ['burger', 'burgera', 'burgery', 'cheeseburger', 'angus', 'smash burger'],
    name: 'Burgery',
    emoji: '🍔',
    category: 'Burgery / Amerykańska',
    cuisines: ['burger', 'american', 'fast_food'],
    keywords: ['burger', 'burgers', 'slow food', 'grill', 'wołowina'],
    confidenceExpl: 'Burgerownia / lokal serwujący burgery'
  },
  {
    aliases: ['pierogi', 'pierogarnia', 'pierogów', 'ruskie', 'pierogi z mięsem', 'uszka'],
    name: 'Pierogi',
    emoji: '🥟',
    category: 'Kuchnia polska / Pierogarnia',
    cuisines: ['polish', 'regional', 'pierogi'],
    keywords: ['pierogarnia', 'pierogi', 'lepione', 'bistro', 'kuchnia polska', 'domowe'],
    confidenceExpl: 'Pierogarnia lub restauracja tradycyjna z kuchnią polską'
  },
  {
    aliases: ['schabowy', 'kotlet schabowy', 'de volaille', 'dewolaj', 'mielony', 'obiad domowy', 'zrazy'],
    name: 'Tradycyjny obiad / Schabowy',
    emoji: '🥩',
    category: 'Kuchnia polska / Tradycyjna',
    cuisines: ['polish', 'regional'],
    keywords: ['obiady domowe', 'kuchnia polska', 'restauracja', 'gospoda', 'karczma', 'bistro'],
    confidenceExpl: 'Restauracja z tradycyjną kuchnią polską i obiadami domowymi'
  },
  {
    aliases: ['żurek', 'zurek', 'barszcz', 'rosół', 'pomidorowa', 'kwaśnica', 'flaki', 'zupa'],
    name: 'Tradycyjne zupy',
    emoji: '🍲',
    category: 'Kuchnia polska / Zupy',
    cuisines: ['polish', 'regional'],
    keywords: ['kuchnia polska', 'karczma', 'gospoda', 'bistro', 'obiady'],
    confidenceExpl: 'Tradycyjna restauracja polska serwująca zupy domowe'
  },
  {
    aliases: ['pad thai', 'padthai', 'curry', 'tom yum', 'tajska', 'tajskie'],
    name: 'Pad Thai / Kuchnia tajska',
    emoji: '🥢',
    category: 'Kuchnia tajska / Azjatycka',
    cuisines: ['thai', 'asian', 'vietnamese'],
    keywords: ['thai', 'tajska', 'azjatycka', 'wok', 'pad thai'],
    confidenceExpl: 'Restauracja tajska / azjatycka serwująca dania z woka'
  },
  {
    aliases: ['tacos', 'burrito', 'quesadilla', 'meksyk', 'nachos'],
    name: 'Tacos / Meksykańska',
    emoji: '🌮',
    category: 'Kuchnia meksykańska',
    cuisines: ['mexican', 'tex-mex'],
    keywords: ['tacos', 'burrito', 'mexican', 'meksykańska'],
    confidenceExpl: 'Lokal serwujący dania kuchni meksykańskiej'
  },
  {
    aliases: ['naleśniki', 'nalesniki', 'pancakes', 'crêpes', 'pankejki'],
    name: 'Naleśniki',
    emoji: '🥞',
    category: 'Naleśnikarnia / Śniadania',
    cuisines: ['pancake', 'crepe', 'breakfast'],
    keywords: ['naleśnikarnia', 'nalesniki', 'manekin', 'crepes'],
    confidenceExpl: 'Naleśnikarnia / kawiarnia śniadaniowa'
  },
  {
    aliases: ['krewetki', 'ryba', 'ryby', 'dorsz', 'łosoś', 'owoce morza', 'kalmary'],
    name: 'Ryby i Owoce Morza',
    emoji: '🦐',
    category: 'Ryby / Owoce morza',
    cuisines: ['seafood', 'fish'],
    keywords: ['smażalnia', 'rybna', 'seafood', 'ryby'],
    confidenceExpl: 'Smażalnia ryb lub restauracja z owocami morza'
  },
  {
    aliases: ['butter chicken', 'tikka masala', 'chleb naan', 'naan', 'indyjska'],
    name: 'Kuchnia indyjska',
    emoji: '🍛',
    category: 'Kuchnia indyjska',
    cuisines: ['indian', 'south_asian'],
    keywords: ['indian', 'indyjska', 'curry', 'namaste'],
    confidenceExpl: 'Restauracja indyjska'
  },
  {
    aliases: ['falafel', 'hummus', 'shakshuka', 'szakszuka', 'wege', 'wegańskie'],
    name: 'Falafel / Kuchnia wegetariańska',
    emoji: '🧆',
    category: 'Wegetariańska / Bliskowschodnia',
    cuisines: ['vegetarian', 'vegan', 'middle_eastern', 'lebanese'],
    keywords: ['falafel', 'hummus', 'wege', 'vegan'],
    confidenceExpl: 'Lokal wegetariański / bliskowschodni'
  }
];

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Rozpoznaje danie wpisane przez użytkownika na żywo
 */
export function identifyDish(userInput) {
  if (!userInput || !userInput.trim()) return null;
  const cleaned = normalize(userInput);

  // Szukanie bezpośredniego dopasowania do aliasów
  for (const item of DISH_DATABASE) {
    if (item.aliases.some(alias => cleaned.includes(normalize(alias)) || normalize(alias).includes(cleaned))) {
      return {
        ...item,
        isCustom: false,
        rawQuery: userInput.trim()
      };
    }
  }

  // W przypadku dania spoza głównej listy – inteligentny profil generyczny
  return {
    name: userInput.trim(),
    emoji: '🍽️',
    category: 'Danie gastronomiczne',
    cuisines: [],
    keywords: [cleaned],
    confidenceExpl: `Szukam lokali mogących serwować "${userInput.trim()}"`,
    isCustom: true,
    rawQuery: userInput.trim()
  };
}

/**
 * Ocenia dopasowanie restauracji do wybranego dania
 * Zwraca wynik punktowy (0-100) oraz powód trafienia
 */
export function evaluateRestaurantMatch(restaurant, dishProfile) {
  if (!dishProfile) {
    return { score: 50, badge: 'Lokal w okolicy', isDirectMatch: false };
  }

  const nameNorm = normalize(restaurant.name);
  const cuisineTag = normalize(restaurant.cuisine || '');
  const categoryNorm = normalize(restaurant.category || '');
  const dishNameNorm = normalize(dishProfile.rawQuery || dishProfile.name);

  let score = 10;
  let reasons = [];

  // 1. Nazwa lokalu zawiera bezpośrednio nazwę potrawy (np. "Restauracja Carbonara", "Pizzeria...")
  if (nameNorm.includes(dishNameNorm)) {
    score += 70;
    reasons.push(`Nazwa lokalu zawiera "${dishProfile.rawQuery}"`);
  }

  // 2. Słowa kluczowe w nazwie (np. "Trattoria", "Pasta Bar" dla carbonary)
  for (const kw of dishProfile.keywords || []) {
    if (nameNorm.includes(normalize(kw))) {
      score += 45;
      reasons.push(`Specjalizacja: ${kw}`);
      break;
    }
  }

  // 3. Zgodność tagu cuisine z OSM
  for (const c of dishProfile.cuisines || []) {
    if (cuisineTag.includes(c)) {
      score += 40;
      reasons.push(`Kuchnia mapowa: ${c}`);
      break;
    }
  }

  // 4. Kategoria lokalu
  if (dishProfile.category && categoryNorm.includes('restaurant')) {
    score += 10;
  }

  const isDirectMatch = score >= 50;

  let badge = 'Lokal gastronomiczny';
  if (score >= 70) {
    badge = `🔥 Idealne dopasowanie (${dishProfile.name})`;
  } else if (score >= 40) {
    badge = `✨ Prawdopodobnie serwuje (${dishProfile.category || dishProfile.name})`;
  }

  return {
    score,
    isDirectMatch,
    badge,
    reason: reasons[0] || dishProfile.confidenceExpl
  };
}
