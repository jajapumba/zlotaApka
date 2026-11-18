// Ścisły silnik kwalifikacji potraw i restauracji w czasie rzeczywistym
// Gwarantuje, że pokazywane są WYŁĄCZNIE restauracje ściśle związane z poszukiwanym daniem

export const CUISINE_RULES = {
  italian: {
    label: 'Kuchnia włoska / Pizzeria / Pasta Bar',
    emoji: '🍝',
    dishKeywords: [
      'carbonara', 'karbonara', 'spaghetti', 'bolognese', 'boloński', 'lasagne', 'lasagna',
      'pizza', 'margherita', 'tagliatelle', 'gnocchi', 'ravioli', 'penne', 'pasta', 'makaron',
      'risotto', 'calzone', 'focaccia', 'tiramisu', 'włoskie', 'wloskie'
    ],
    // Wzorce nazw lokali serwujących dania włoskie
    restaurantPatterns: [
      'trattoria', 'pizzeria', 'pasta', 'spaghetti', 'ristorante', 'italiano', 'włoska', 'wloska',
      'osteria', 'bella', 'soprano', 'roma', 'tutti', 'gusto', 'sicilia', 'napoli', 'da grasso',
      'peperoncino', 'boscaiola', 'vesuvio', 'piccola', 'italia', 'forno', 'focaccia', 'calzone',
      'san marzano', 'ragu', 'cucina', 'karafka', 'venezia', 'mamma', 'ciao', 'bologna', 'milano',
      'la strada', 'pizza hut', 'telepizza', 'bravissimo', 'fiore', 'ancora', 'campione', 'amici',
      'dominium', 'basilico', 'oregano', 'presto', 'toscania', 'toskania'
    ],
    // Wykluczenia - te profile NIGDY nie pasują do dań włoskich (np. carbonary)
    disqualifiedPatterns: [
      'kebab', 'kebap', 'sushi', 'ramen', 'burger', 'doner', 'döner', 'pasibus', 'viet', 'thai',
      'tajska', 'japońska', 'azjatycka', 'orient', 'zahir', 'damaszek', 'cukiernia', 'lodziarnia',
      'lody', 'kawiarnia', 'cafe', 'pączki', 'piekarnia', 'rybna', 'smażalnia'
    ],
    dishes: {
      carbonara: {
        dishName: 'Spaghetti alla Carbonara',
        price: '36 – 44 zł',
        ingredients: 'Tradycyjny włoski makaron, sos na bazie żółtek, dojrzewający boczek (guanciale), ser Pecorino Romano, świeżo mielony czarny pieprz',
        tags: ['Klasyk rzymski', 'Na ciepło']
      },
      bolognese: {
        dishName: 'Tagliatelle al Ragù Bolognese',
        price: '34 – 42 zł',
        ingredients: 'Długo duszony sos mięsno-pomidorowy z warzywami, parmezan Grana Padano, świeże zioła',
        tags: ['Wołowina', 'Tradycyjne']
      },
      lasagne: {
        dishName: 'Lasagne alla Bolognese',
        price: '38 – 46 zł',
        ingredients: 'Płaty makaronu zapiekane z sosem mięsnym, kremowym beszamelem i serem mozzarella',
        tags: ['Zapiekane', 'Syte']
      },
      pizza: {
        dishName: 'Pizza Włoska / Margherita / Wybrana',
        price: '32 – 48 zł',
        ingredients: 'Ciasto na bazie włoskiej mąki tipo 00, sos z pomidorów San Marzano, ser Mozzarella Fior di Latte, świeża bazylia',
        tags: ['Piec szamotowy', 'Włoska']
      },
      makaron: {
        dishName: 'Świeży makaron rzemieślniczy (Pasta Fresca)',
        price: '34 – 45 zł',
        ingredients: 'Domowy makaron z wybranym sosem włoskim (carbonara, arrabbiata, pesto)',
        tags: ['Pasta Fresca']
      }
    }
  },

  asian: {
    label: 'Kuchnia azjatycka / Japońska / Ramen / Sushi',
    emoji: '🍜',
    dishKeywords: [
      'ramen', 'sushi', 'pad thai', 'padthai', 'udon', 'tom yum', 'pho', 'curry', 'butter chicken',
      'gyoza', 'bao', 'dim sum', 'kaczka po pekińsku', 'sashimi', 'nigiri', 'uramaki', 'azjatyckie'
    ],
    restaurantPatterns: [
      'ramen', 'sushi', 'thai', 'tajska', 'asian', 'azjatycka', 'orient', 'japońska', 'japonska',
      'wok', 'viet', 'pho', 'tokyo', 'koku', 'sakura', 'namaste', 'curry', 'indie', 'bambu',
      'panda', 'dragon', 'hanoi', 'kyoto', 'yoko', 'haiku', 'shabu', 'samurai', 'wasabi'
    ],
    disqualifiedPatterns: [
      'pizzeria', 'trattoria', 'kebab', 'kebap', 'burger', 'doner', 'pasibus', 'pierogarnia',
      'karczma', 'gospoda', 'cukiernia', 'lodziarnia', 'kawiarnia', 'cafe'
    ],
    dishes: {
      ramen: {
        dishName: 'Ramen Tonkotsu / Shoyu / Miso',
        price: '38 – 49 zł',
        ingredients: 'Aromatyczny wywar gotowany 12h, sprężysty makaron ramen, boczek chashu, marynowane jajo ajitsuke, grzyby mun, dymka, nori',
        tags: ['Japoński', 'Gorący bulion']
      },
      sushi: {
        dishName: 'Zestaw Sushi (Futomaki / Uramaki / Nigiri)',
        price: '45 – 85 zł',
        ingredients: 'Świeży łosoś, tuńczyk, krewetka w tempurze, awokado, ogórek, serek philadelphia, sos sojowy, wasabi, imbir',
        tags: ['Świeża ryba', 'Japońskie']
      },
      'pad thai': {
        dishName: 'Pad Thai z krewetkami lub kurczakiem',
        price: '36 – 46 zł',
        ingredients: 'Smażony makaron ryżowy, tofu, sos z tamaryndowca, jajko, kiełki fasoli mung, orzeszki ziemne, limonka, kolendra',
        tags: ['Kuchnia tajska', 'Wok']
      }
    }
  },

  burger: {
    label: 'Burgery / Kuchnia amerykańska',
    emoji: '🍔',
    dishKeywords: ['burger', 'burgera', 'burgery', 'cheeseburger', 'frytki', 'skrzydełka', 'wings', 'bbq', 'smash', 'angus'],
    restaurantPatterns: [
      'burger', 'burgers', 'pasibus', 'slow food', 'grill', 'american', 'steak', 'beef', 'roadhouse',
      'barbecue', 'barn', 'cowboy', 'meat', 'chilli', 'bobby burger', 'max burgers'
    ],
    disqualifiedPatterns: [
      'pizzeria', 'trattoria', 'sushi', 'ramen', 'kebab', 'doner', 'pierogarnia', 'cukiernia', 'lodziarnia', 'cafe'
    ],
    dishes: {
      burger: {
        dishName: 'Craft Smash Burger Wołowy / Klasyk',
        price: '32 – 45 zł',
        ingredients: '100% soczystej siekanej wołowiny, maślana bułka brioche, ser cheddar, bekon, pikle, prażona cebulka, sos autorski',
        tags: ['100% Wołowina', 'Brioche']
      }
    }
  },

  kebab: {
    label: 'Kebab / Kuchnia bliskowschodnia',
    emoji: '🌯',
    dishKeywords: ['kebab', 'kebap', 'rollo', 'durum', 'kapsalon', 'doner', 'döner', 'falafel', 'pita', 'lawasz', 'hummus', 'szawarma'],
    restaurantPatterns: [
      'kebab', 'kebap', 'doner', 'döner', 'zahir', 'damaszek', 'ali', 'orient', 'pasha', 'istanboul',
      'efes', 'grill kebab', 'amrit', 'habibi', 'king kebab', 'berlin kebab', 'kebabownia'
    ],
    disqualifiedPatterns: [
      'pizzeria', 'trattoria', 'sushi', 'ramen', 'pierogarnia', 'cukiernia', 'lodziarnia', 'kawiarnia', 'cafe'
    ],
    dishes: {
      kebab: {
        dishName: 'Kebab Rollo / Pudełko / Pita',
        price: '22 – 35 zł',
        ingredients: 'Opiekane mięso (baranina-wołowina lub kurczak), chrupiący chlebek pita lub ciasto lawasz, świeży mix surówek, sos czosnkowy i ostry',
        tags: ['Szybki obiad', 'Świeże warzywa']
      },
      falafel: {
        dishName: 'Falafel Box / Wrap wegetariański',
        price: '20 – 30 zł',
        ingredients: 'Chrupiące kotleciki z ciecierzycy i ziół, kremowy hummus, pikle, pomidor, sałata, sos tahini',
        tags: ['100% Wege', 'Ciecierzyca']
      }
    }
  },

  polish: {
    label: 'Kuchnia polska / Tradycyjna',
    emoji: '🥟',
    dishKeywords: [
      'schabowy', 'kotlet', 'pierogi', 'żurek', 'barszcz', 'rosół', 'pomidorowa', 'mielony',
      'de volaille', 'dewolaj', 'placki ziemniaczane', 'golonka', 'gołąbki', 'bigos', 'zrazy'
    ],
    restaurantPatterns: [
      'obiady domowe', 'kuchnia polska', 'pierogarnia', 'karczma', 'gospoda', 'bistro', 'zapiecek',
      'jadłodajnia', 'staropolska', 'gościniec', 'dworek', 'chata', 'pod zegarem', 'piwnica ratuszowa',
      'kataryniarz', 'cechowa', 'u babci', 'pod kominkiem', 'chłopskie jadło', 'bursztynowe'
    ],
    disqualifiedPatterns: [
      'sushi', 'ramen', 'kebab', 'kebap', 'pizzeria', 'trattoria', 'burger', 'cukiernia', 'lodziarnia', 'cafe'
    ],
    dishes: {
      schabowy: {
        dishName: 'Tradycyjny Kotlet Schabowy z kością / bez',
        price: '32 – 44 zł',
        ingredients: 'Ręcznie rozbijany schab wieprzowy, złocista chrupiąca panierka, młode ziemniaki z koperkiem, zasmażana kapusta lub mizeria',
        tags: ['Klasyk polski', 'Obiad domowy']
      },
      pierogi: {
        dishName: 'Pierogi Ręcznie Lepione (Ruskie / Mięso / Grzyby)',
        price: '26 – 36 zł',
        ingredients: 'Delikatne ciasto, farsz: twaróg z ziemniakami i cebulką lub aromatyczne mięso, okrasa z wytopionego boczku i złotej cebulki',
        tags: ['Ręcznie lepione', '8-10 sztuk']
      },
      żurek: {
        dishName: 'Staropolski Żurek na naturalnym zakwasie',
        price: '22 – 30 zł',
        ingredients: 'Aromatyczny wywar z wędzonki, biała kiełbasa, jajko gotowane, majeranek, chrzan, serwowany w chlebku lub czarce',
        tags: ['Tradycyjna zupa', 'Na zakwasie']
      }
    }
  }
};

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Rozpoznaje kuchnię poszukiwanego dania
 */
export function analyzeDishQuery(query) {
  const normQuery = normalize(query || 'carbonara');

  for (const [cKey, rule] of Object.entries(CUISINE_RULES)) {
    for (const kw of rule.dishKeywords) {
      if (normQuery.includes(normalize(kw)) || normalize(kw).includes(normQuery)) {
        let matchedDishKey = Object.keys(rule.dishes).find(dk => normQuery.includes(dk) || dk.includes(normQuery)) || Object.keys(rule.dishes)[0];
        return {
          query: query ? query.trim() : 'carbonara',
          cuisineKey: cKey,
          cuisine: rule,
          matchedDishKey,
          matchedDish: rule.dishes[matchedDishKey] || Object.values(rule.dishes)[0]
        };
      }
    }
  }

  // Jeśli danie nietypowe
  return {
    query: query ? query.trim() : 'Danie',
    cuisineKey: 'general',
    cuisine: {
      label: 'Danie gastronomiczne',
      emoji: '🍽️',
      restaurantPatterns: [normQuery],
      disqualifiedPatterns: ['cukiernia', 'lodziarnia', 'kawiarnia', 'cafe'],
      dishKeywords: [normQuery]
    },
    matchedDishKey: 'custom',
    matchedDish: {
      dishName: query ? query.trim() : 'Danie z karty',
      price: 'Cena w lokalu',
      ingredients: `Pozycja z karty lokalu – "${query}"`,
      tags: ['Na zamówienie']
    }
  };
}

/**
 * Rygorystycznie kwalifikuje lokal:
 * Zwraca obiekt lokalu z pozycją menu TYLKO wtedy, gdy lokal jest REALNIE związany z daniem.
 * Jeśli lokal NIE PASUJE do dania (np. sushi bar dla carbonary), zwraca null!
 */
export function qualifyRestaurantForDish(restaurant, dishAnalysis) {
  const nameNorm = normalize(restaurant.name);
  const cuisineTag = normalize(restaurant.cuisine || '');
  const { cuisine, cuisineKey, matchedDish, query } = dishAnalysis;

  // 1. DYSKWALIFIKACJA: jeśli lokal ma nazwę/tag ze sprzecznego profilu (np. sushi dla carbonary)
  if (cuisine.disqualifiedPatterns) {
    const isDisqualified = cuisine.disqualifiedPatterns.some(dp => nameNorm.includes(dp) || cuisineTag.includes(dp));
    if (isDisqualified) {
      return null; // Odrzucamy natychmiast!
    }
  }

  let matchScore = 0;
  let matchBadge = '';
  let matchReason = '';

  // 2. Czy nazwa lokalu bezpośrednio zawiera szukane słowo (np. "Restauracja Carbonara")
  if (nameNorm.includes(normalize(query))) {
    matchScore += 90;
    matchBadge = '🔥 Specjalność w nazwie lokalu';
    matchReason = `Lokal wprost dedykowany daniu "${query}"`;
  }

  // 3. Czy nazwa pasuje do profilu kuchni tego dania (np. Trattoria / Pizzeria dla carbonary)
  if (cuisine.restaurantPatterns) {
    for (const pat of cuisine.restaurantPatterns) {
      if (nameNorm.includes(normalize(pat))) {
        matchScore += 60;
        matchBadge = `⭐ ${cuisine.label}`;
        matchReason = `Lokal włoski / specjalizacja: "${pat.toUpperCase()}"`;
        break;
      }
    }
  }

  // 4. Czy tag cuisine z mapy OSM pasuje do tego dania
  if (cuisineTag) {
    if (cuisineKey === 'italian' && (cuisineTag.includes('italian') || cuisineTag.includes('pizza') || cuisineTag.includes('pasta') || cuisineTag.includes('mediterranean'))) {
      matchScore += 50;
      matchBadge = '🍝 Kuchnia włoska (z mapy)';
      matchReason = 'Profil na mapie: restauracja włoska i dania z makaronem';
    } else if (cuisineKey === 'asian' && (cuisineTag.includes('asian') || cuisineTag.includes('japanese') || cuisineTag.includes('sushi') || cuisineTag.includes('thai') || cuisineTag.includes('ramen'))) {
      matchScore += 50;
      matchBadge = '🍜 Kuchnia azjatycka (z mapy)';
      matchReason = 'Profil na mapie: dania kuchni orientalnej i ramen';
    } else if (cuisineKey === 'burger' && (cuisineTag.includes('burger') || cuisineTag.includes('american'))) {
      matchScore += 50;
      matchBadge = '🍔 Burgerownia (z mapy)';
      matchReason = 'Profil na mapie: burgery i dania z grilla';
    } else if (cuisineKey === 'kebab' && (cuisineTag.includes('kebab') || cuisineTag.includes('turkish'))) {
      matchScore += 50;
      matchBadge = '🌯 Kebab (z mapy)';
      matchReason = 'Profil na mapie: kebaby i dania kuchni tureckiej';
    } else if (cuisineKey === 'polish' && (cuisineTag.includes('polish') || cuisineTag.includes('regional'))) {
      matchScore += 50;
      matchBadge = '🥟 Kuchnia polska (z mapy)';
      matchReason = 'Profil na mapie: tradycyjne dania kuchni polskiej';
    }
  }

  // 5. ŚCISŁA REGUŁA: Jeśli lokal NIE ZDOBYŁ ani jednego punktu dopasowania do profilu potrawy,
  // ZOSTAJE CAŁKOWICIE ODRZUCONY!
  // (Koniec z pokazywaniem przypadkowych restauracji!)
  if (matchScore === 0) {
    return null;
  }

  return {
    ...restaurant,
    matchScore,
    matchBadge,
    matchReason,
    dishItem: {
      name: matchedDish.dishName,
      price: matchedDish.price,
      ingredients: matchedDish.ingredients,
      tags: matchedDish.tags || []
    }
  };
}
