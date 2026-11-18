import React, { useState, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ManualLocation from './ManualLocation.jsx';
import AddressLocation from './AddressLocation.jsx';
import { POPULAR_DISHES } from './dishKnowledge.js';
import { analyzeDishQuery, qualifyRestaurantForDish } from './dishEngine.js';
import '../style.css';
import './react.css';

function estimateWalkTime(distanceKm) {
  const minutes = Math.round((distanceKm / 4.8) * 60);
  if (minutes < 1) return 'mniej niż 1 min pieszo';
  if (minutes < 60) return `ok. ${minutes} min pieszo`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `ok. ${hours} godz. ${remMinutes} min pieszo`;
}

function App() {
  const [dishInput, setDishInput] = useState('carbonara');
  const [activeDish, setActiveDish] = useState('');
  const [origin, setOrigin] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [radius, setRadius] = useState(5);
  const [rawRestaurants, setRawRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Referencja do ostatniego punktu geograficznego (aby wiedzieć, czy punkt uległ zmianie)
  const lastPointRef = useRef(null);

  // Analiza potrawy w locie
  const dishAnalysis = useMemo(() => analyzeDishQuery(activeDish || dishInput), [activeDish, dishInput]);

  // Pobieranie restauracji z API z zachowywaniem i kumulowaniem lokali z mniejszych promieni
  async function fetchNearby(point, range = radius, isNewLocation = false) {
    if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) {
      setError('Wybierz najpierw lokalizację.');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        lat: point.lat,
        lon: point.lon,
        radius: range
      });
      const res = await fetch(`/api/nearby?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nie udało się pobrać lokali z serwerów map.');

      const newBatch = data.restaurants || [];

      setRawRestaurants(prev => {
        // Jeśli zmieniono miejscowość/adres – resetujemy listę
        if (isNewLocation || !lastPointRef.current ||
            Math.abs(lastPointRef.current.lat - point.lat) > 0.005 ||
            Math.abs(lastPointRef.current.lon - point.lon) > 0.005) {
          lastPointRef.current = point;
          return newBatch;
        }

        // Kumulujemy wyniki: lokale z mniejszego promienia ZAWSZE zostają zachowane!
        const map = new Map();
        for (const r of prev) {
          map.set(r.id || `${r.name}-${r.lat}-${r.lon}`, r);
        }
        for (const r of newBatch) {
          map.set(r.id || `${r.name}-${r.lat}-${r.lon}`, r);
        }
        return Array.from(map.values());
      });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Wystąpił problem z pobraniem danych mapy.');
    } finally {
      setLoading(false);
    }
  }

  // Wyszukanie dania
  function handleDishSearch(e) {
    if (e) e.preventDefault();
    const query = (dishInput || '').trim();
    if (!query) {
      setError('Wpisz nazwę dania, którego szukasz.');
      return;
    }

    setActiveDish(query);

    if (origin) {
      fetchNearby(origin, radius);
    } else {
      if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          pos => {
            const point = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setOrigin(point);
            setLocationName('Twoja bieżąca lokalizacja GPS');
            fetchNearby(point, radius, true);
          },
          () => {
            setLoading(false);
            setError('Podaj miejscowość lub adres w panelu poniżej.');
            setManualOpen(true);
          },
          { timeout: 8000 }
        );
      } else {
        setError('Podaj miejscowość lub adres poniżej, aby wyszukać restauracje.');
        setManualOpen(true);
      }
    }
  }

  // Kliknięcie szybkiej pigułki potrawy
  function selectQuickDish(dish) {
    setDishInput(dish.name);
    setActiveDish(dish.name);
    if (origin) {
      fetchNearby(origin, radius);
    } else {
      setError('Wskaż swoją lokalizację poniżej (GPS, miasto lub adres), aby znaleźć najbliższe lokale.');
    }
  }

  // Pobranie pozycji z GPS przeglądarki
  function locate() {
    if (!navigator.geolocation) {
      setError('Twoja przeglądarka nie obsługuje geolokalizacji.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const point = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setOrigin(point);
        setLocationName('Twoja bieżąca lokalizacja GPS');
        setManualOpen(false);
        setAddressOpen(false);
        const query = dishInput.trim() || 'carbonara';
        setActiveDish(query);
        fetchNearby(point, radius, true);
      },
      () => {
        setLoading(false);
        setError('Nie udało się ustalić pozycji GPS. Wpisz miejscowość lub adres ręcznie.');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }

  // Zmiana promienia (2, 5, 10, 15 km)
  function handleRadiusChange(newRadius) {
    setRadius(newRadius);
    if (origin && hasSearched) {
      fetchNearby(origin, newRadius, false);
    }
  }

  // Kwalifikowanie restauracji pod kątem dania ze ścisłym filtrem promienia
  const matchedRestaurants = useMemo(() => {
    if (!hasSearched) return [];
    const qualified = [];
    for (const r of rawRestaurants) {
      // Żelazny filtr promienia
      if (r.distance > radius) continue;

      const item = qualifyRestaurantForDish(r, dishAnalysis);
      if (item) {
        qualified.push(item);
      }
    }

    return qualified.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.distance - b.distance;
    });
  }, [rawRestaurants, dishAnalysis, hasSearched, radius]);

  return (
    <>
      <header>
        <a className="logo" href="./">
          Gdzie<span>Zjem?</span>
        </a>
        <span className="badge">WYSZUKIWARKA DAŃ NA ŻYWO (LIVE OSM)</span>
      </header>

      <main>
        {/* Sekcja Hero z formularzem wyszukiwania */}
        <section className="hero">
          <div className="eyebrow">ZNAJDŹ SWOJE ULUBIONE DANIE W OKOLICY</div>
          <h1>
            Gdzie dziś zjesz<br />
            <em>{activeDish ? activeDish : (dishInput ? dishInput : 'coś pysznego')}?</em>
          </h1>
          <p>
            Wpisz konkretne danie (np. carbonara, ramen, burger, schabowy, pizza),
            a aplikacja na żywo znajdzie najbliższe restauracje w wybranym promieniu.
          </p>

          {/* Główny formularz wyszukiwarki dań */}
          <form className="searchbox" onSubmit={handleDishSearch} role="search">
            <span aria-hidden="true">{dishAnalysis?.cuisine?.emoji || '🍽️'}</span>
            <input
              type="text"
              value={dishInput}
              onChange={e => setDishInput(e.target.value)}
              placeholder="Wpisz danie, np. carbonara, ramen, burger, pierogi..."
              aria-label="Nazwa potrawy"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Szukam…' : 'Znajdź danie 🔍'}
            </button>
          </form>

          {/* Szybki wybór popularnych potraw */}
          <div className="suggestions">
            <span>Szybki wybór:</span>
            {POPULAR_DISHES.map(d => (
              <button
                key={d.query}
                type="button"
                className={activeDish.toLowerCase() === d.query ? 'selected-dish-chip' : ''}
                onClick={() => selectQuickDish(d)}
                disabled={loading}
              >
                {d.emoji} {d.name}
              </button>
            ))}
          </div>

          {/* Panel wyboru lokalizacji */}
          <div className="location-panel" style={{ marginTop: '28px' }}>
            <div>
              <strong>⌖ Lokalizacja wyszukiwania</strong>
              <p role="status">
                {locationName ? locationName : 'Lokalizacja nieustalona – kliknij przycisk obok'}
              </p>
              <small>Promień: {radius} km · Wyniki na żywo</small>
            </div>
            <div className="location-actions">
              <button type="button" disabled={loading} onClick={locate} title="Pobierz z GPS">
                📍 Użyj GPS
              </button>
              <button
                type="button"
                aria-expanded={manualOpen}
                disabled={loading}
                onClick={() => { setManualOpen(!manualOpen); setAddressOpen(false); }}
              >
                🏙️ Podaj miejscowość
              </button>
              <button
                type="button"
                aria-expanded={addressOpen}
                disabled={loading}
                onClick={() => { setAddressOpen(!addressOpen); setManualOpen(false); }}
              >
                🏠 Podaj dokładny adres
              </button>
            </div>
          </div>

          {manualOpen && (
            <ManualLocation
              disabled={loading}
              onSelect={(point, label) => {
                setManualOpen(false);
                setOrigin(point);
                setLocationName(label);
                const query = dishInput.trim() || 'carbonara';
                setActiveDish(query);
                fetchNearby(point, radius, true);
              }}
            />
          )}

          {addressOpen && (
            <AddressLocation
              disabled={loading}
              onSelect={(point, label) => {
                setAddressOpen(false);
                setOrigin(point);
                setLocationName(label);
                const query = dishInput.trim() || 'carbonara';
                setActiveDish(query);
                fetchNearby(point, radius, true);
              }}
            />
          )}

          <div className="radius-picker">
            <span>Promień wyszukiwania:</span>
            <div>
              {[2, 5, 10, 15].map(n => (
                <button
                  key={n}
                  type="button"
                  className={radius === n ? 'selected' : ''}
                  aria-pressed={radius === n}
                  disabled={loading}
                  onClick={() => handleRadiusChange(n)}
                >
                  {n} km
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Sekcja wyników */}
        <section className="discovery">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                {hasSearched ? `${dishAnalysis.cuisine?.emoji} ${dishAnalysis.cuisine?.label || 'WYNIKI WYSZUKIWANIA'}` : 'W TWOJEJ OKOLICY'}
              </div>
              <h2>
                {hasSearched
                  ? <>Miejsca serwujące: <span style={{ color: '#eb714b' }}>{activeDish}</span></>
                  : 'Wyszukaj danie powyżej'}
              </h2>
            </div>
            {hasSearched && (
              <span className="location">{matchedRestaurants.length} znalezionych w promieniu {radius} km</span>
            )}
          </div>

          {loading && (
            <div className="empty">
              <h3>🔍 Szukam restauracji na mapie…</h3>
              <p>Pobieram lokale w promieniu do {radius} km od: {locationName}</p>
            </div>
          )}

          {error && (
            <div role="alert" style={{ color: '#b3261e', padding: '16px 20px', background: '#fdf2f0', borderRadius: '12px', margin: '20px 0' }}>
              <strong>⚠️ Informacja:</strong> {error}
            </div>
          )}

          {/* Stan początkowy przed pierwszym wyszukaniem */}
          {!loading && !hasSearched && (
            <div className="empty" style={{ padding: '48px 24px' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🍽️</span>
              <h3>Wpisz danie i wskaż lokalizację</h3>
              <p style={{ maxWidth: '560px', margin: 'auto' }}>
                Wpisz w polu powyżej potrawę (np. <strong>carbonara</strong>, <strong>ramen</strong>, <strong>burger</strong>, <strong>schabowy</strong>)
                oraz kliknij <strong>Użyj GPS</strong>, <strong>Podaj miejscowość</strong> lub <strong>Podaj adres</strong>,
                aby na żywo znaleźć najbliższe restauracje.
              </p>
            </div>
          )}

          {/* Lista znalezionych restauracji (wyłącznie w zadanym promieniu) */}
          {!loading && hasSearched && matchedRestaurants.length > 0 && (
            <div className="restaurant-list">
              {matchedRestaurants.map((r, i) => {
                const isNearest = i === 0;
                const targetDish = activeDish || dishInput;
                const gmapsQuery = `${targetDish} ${r.name} ${r.address}`;
                const gmapsDishUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gmapsQuery)}`;
                const gmapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`;

                return (
                  <article
                    className={`restaurant-card matched-card ${isNearest ? 'nearest' : ''}`}
                    key={r.id || `${r.name}-${i}`}
                  >
                    <div className="restaurant-art" aria-hidden="true">
                      {dishAnalysis.cuisine?.emoji || '🍽️'}
                    </div>

                    <div className="restaurant-content">
                      <div className="restaurant-top">
                        <span className="eyebrow highlight-badge">
                          {isNearest ? '🏆 NAJBLIŻEJ CIEBIE' : (r.matchBadge || 'RESTAURACJA W OKOLICY')}
                        </span>
                        <div>
                          <strong>
                            {r.distance < 1
                              ? `${Math.round(r.distance * 1000)} m`
                              : `${r.distance.toFixed(1)} km`}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#7a8474', display: 'block', textAlign: 'right' }}>
                            {estimateWalkTime(r.distance)}
                          </span>
                        </div>
                      </div>

                      <h3>{r.name}</h3>
                      <p className="address">📍 {r.address}</p>

                      {/* Boks konkretnego dania */}
                      {r.dishItem && (
                        <div className="dish-showcase">
                          <div className="dish-header">
                            <span className="dish-title">
                              {dishAnalysis.cuisine?.emoji} {r.dishItem.name}
                            </span>
                            <span className="dish-price">{r.dishItem.price}</span>
                          </div>
                          <p className="dish-ingredients">{r.dishItem.ingredients}</p>
                          {r.dishItem.tags && r.dishItem.tags.length > 0 && (
                            <div className="dish-tags">
                              {r.dishItem.tags.map(t => (
                                <span key={t} className="dish-tag">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="dish-match-box">
                        <span className="dish-reason">
                          ℹ️ {r.matchReason}
                        </span>
                      </div>

                      {/* Przyciski akcji */}
                      <div className="card-actions">
                        <a
                          href={gmapsDishUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="action-btn menu-btn"
                          title="Sprawdź recenzje, zdjęcia i menu w Google Maps"
                        >
                          📖 Sprawdź "{targetDish}" w menu Google ↗
                        </a>
                        <a
                          href={gmapsNavUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="action-btn dir-btn"
                          title="Wyznacz trasę"
                        >
                          🧭 Prowadź do lokalu
                        </a>
                        {r.website && (
                          <a
                            href={r.website}
                            target="_blank"
                            rel="noreferrer"
                            className="action-btn web-btn"
                            title="Otwórz stronę lokalu"
                          >
                            🌐 Strona WWW
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Komunikat o braku wyników w zadanym promieniu */}
          {!loading && hasSearched && matchedRestaurants.length === 0 && (
            <div className="empty">
              <h3>Brak lokali serwujących "{activeDish || dishInput}" w promieniu {radius} km</h3>
              <p>
                W wybranym obszarze do {radius} km wokół "{locationName}" nie znaleziono lokali o tym profilu kuchni.
                Zwiększ promień na 10 km lub 15 km, albo wskaż inne miasto.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button type="button" onClick={() => handleRadiusChange(10)}>
                  Rozszerz promień do 10 km
                </button>
                <button type="button" onClick={() => handleRadiusChange(15)}>
                  Rozszerz do 15 km
                </button>
              </div>
            </div>
          )}

          <p className="map-credit">
            Dane lokali i współrzędne: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>. Wyszukiwanie w 100% na żywo.
          </p>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
