import { defineConfig } from 'vite';

const lastRequest = new Map();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const overpassEndpoints = [
  'https://ovp.dresel.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

/**
 * Zapytanie do Overpass API pobierające 100% lokali gastronomicznych (node + way),
 * w tym lokale oznaczone jako restaurant, fast_food, bistro, bar, pub i cafe.
 */
async function fetchOverpassAll(lat, lon, radiusKm) {
  const query = `[out:json][timeout:20];(node[amenity~"restaurant|fast_food|bar|bistro|pub|cafe"](around:${radiusKm * 1000},${lat},${lon});way[amenity~"restaurant|fast_food|bar|bistro|pub|cafe"](around:${radiusKm * 1000},${lat},${lon}););out center tags;`;

  let lastErr = null;
  for (const endpoint of overpassEndpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'OverpassTurbo/1.8.2 (https://overpass-turbo.eu)'
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.elements)) {
          return data.elements;
        }
      }
      lastErr = new Error(`Overpass ${endpoint} zwrócił kod HTTP ${response.status}`);
    } catch (err) {
      lastErr = err;
    } finally {
      clearTimeout(timeout);
    }
    await sleep(200);
  }
  throw lastErr || new Error('Serwery Overpass są chwilowo niedostępne.');
}

/**
 * Fallback Nominatim z viewbox
 */
async function fetchNominatimRestaurants(lat, lon, radiusKm) {
  const deltaLat = (radiusKm * 1.05) / 111.1;
  const deltaLon = (radiusKm * 1.05) / (111.1 * Math.cos(lat * Math.PI / 180));

  const minLon = (lon - deltaLon).toFixed(5);
  const maxLat = (lat + deltaLat).toFixed(5);
  const maxLon = (lon + deltaLon).toFixed(5);
  const minLat = (lat - deltaLat).toFixed(5);

  const url = `https://nominatim.openstreetmap.org/search?amenity=restaurant&format=json&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=150`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ZlotaApkaCalisia/2.0 (local food search)',
      'Accept-Language': 'pl'
    }
  });

  if (!response.ok) throw new Error(`Nominatim zwrócił ${response.status}`);
  const data = await response.json();

  return (data || []).map(item => ({
    id: item.osm_id,
    type: item.osm_type || 'node',
    lat: Number(item.lat),
    lon: Number(item.lon),
    tags: {
      name: item.name || item.display_name?.split(',')?.[0] || 'Restauracja',
      amenity: 'restaurant',
      'addr:full': item.display_name
    }
  }));
}

function nearbyApi(server) {
  // Geokoder
  server.middlewares.use('/api/geocode', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Metoda niedozwolona' }));
      return;
    }

    const url = new URL(req.url, 'http://localhost');
    const q = url.searchParams.get('q');
    if (!q || q.trim().length < 2) {
      res.end(JSON.stringify([]));
      return;
    }

    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q.trim())}&format=json&addressdetails=1&countrycodes=pl&limit=8`;
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'ZlotaApkaCalisia/2.0 (geocoding lookup)',
          'Accept-Language': 'pl'
        }
      });

      if (!response.ok) throw new Error(`Nominatim zwrócił ${response.status}`);
      const data = await response.json();

      const results = (data || []).map(item => {
        const addr = item.address || {};
        const road = addr.road || addr.street || '';
        const house = addr.house_number || '';
        const city = addr.city || addr.town || addr.village || addr.municipality || '';
        const state = addr.state || '';

        let label = item.display_name;
        if (road && house && city) {
          label = `${road} ${house}, ${city} (${state})`;
        } else if (road && city) {
          label = `${road}, ${city} (${state})`;
        } else if (city) {
          label = `${city} (${state})`;
        }

        return {
          lat: Number(item.lat),
          lon: Number(item.lon),
          label,
          city,
          state
        };
      });

      res.end(JSON.stringify(results));
    } catch (err) {
      console.error('Błąd geokodera:', err.message);
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'Nie udało się pobrać adresu.' }));
    }
  });

  // Główny endpoint pobierania lokali z OpenStreetMap
  server.middlewares.use('/api/nearby', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Metoda niedozwolona' }));
      return;
    }

    const url = new URL(req.url, 'http://localhost');
    const lat = Number(url.searchParams.get('lat'));
    const lon = Number(url.searchParams.get('lon'));
    const radius = Number(url.searchParams.get('radius')) || 5;

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Nieprawidłowa lokalizacja.' }));
      return;
    }

    try {
      // Krótki odstęp rate-limit dla Overpass
      const wait = Math.max(0, 400 - (Date.now() - (lastRequest.get('overpass') || 0)));
      if (wait) await sleep(wait);
      lastRequest.set('overpass', Date.now());

      let rawElements = null;
      try {
        rawElements = await fetchOverpassAll(lat, lon, radius);
      } catch (overpassErr) {
        console.warn('Overpass timeout, używam Nominatim viewbox:', overpassErr.message);
        rawElements = await fetchNominatimRestaurants(lat, lon, radius);
      }

      // Mapowanie i przeliczanie dokładnej odległości dla każdego lokalu
      const restaurants = (rawElements || [])
        .map(el => {
          const tags = el.tags || {};
          const p = el.center || el;
          const pLat = Number(p.lat);
          const pLon = Number(p.lon);

          const dLat = (pLat - lat) * (Math.PI / 180);
          const dLon = (pLon - lon) * (Math.PI / 180);
          const lat1 = lat * (Math.PI / 180);
          const lat2 = pLat * (Math.PI / 180);

          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = 6371 * c;

          const categoryNames = {
            restaurant: 'Restauracja',
            cafe: 'Kawiarnia',
            fast_food: 'Fast Food',
            food_court: 'Strefa gastronomiczna',
            bar: 'Bar / Bistro',
            bistro: 'Bistro',
            pub: 'Pub / Bar'
          };

          const addressParts = [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean);
          const address = addressParts.length ? addressParts.join(' ') : (tags['addr:full'] || 'Adres na mapie');

          return {
            id: `osm-${el.type || 'node'}-${el.id}`,
            name: tags.name || tags['name:pl'] || categoryNames[tags.amenity] || 'Lokal gastronomiczny',
            address,
            distance,
            lat: pLat,
            lon: pLon,
            category: categoryNames[tags.amenity] || tags.amenity || 'Gastronomia',
            cuisine: tags.cuisine || tags['diet:vegetarian'] || tags['diet:vegan'] || '',
            phone: tags.phone || tags['contact:phone'] || null,
            website: tags.website || tags['contact:website'] || null,
            source: 'osm'
          };
        })
        .filter(r => r.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      res.end(JSON.stringify({
        restaurants,
        count: restaurants.length,
        source: 'osm',
        sourceName: 'OpenStreetMap Live'
      }));
    } catch (error) {
      console.error('Błąd /api/nearby:', error.message);
      res.statusCode = 502;
      res.end(JSON.stringify({
        error: 'Serwery map nie odpowiedziały. Spróbuj ponownie za moment.'
      }));
    }
  });
}

export default defineConfig({
  plugins: [
    {
      name: 'nearby-restaurants-api',
      configureServer: nearbyApi,
      configurePreviewServer: nearbyApi
    }
  ]
});
