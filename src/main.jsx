import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
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
  const [activeDish, setActiveDish] = useState('Carbonara');
  const [origin, setOrigin] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [radius, setRadius] = useState(5);
  const [rawRestaurants, setRawRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dotCount, setDotCount] = useState(0);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showAllNearby, setShowAllNearby] = useState(false);

  const lastPointRef = useRef(null);

  // Animacja kropeczek: 0 -> 1 -> 2 -> 3 -> 0 -> 1 -> 2 -> 3 ...
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, [loading]);

  const animatedDots = '.'.repeat(dotCount);

  // Analiza potrawy w locie
  const dishAnalysis = useMemo(() => analyzeDishQuery(activeDish), [activeDish]);

  // Pobieranie restauracji z OpenStreetMap na żywo
  async function fetchNearby(point, range = radius, dish = activeDish, isNewLocation = false) {
    if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) {
      setError('Podaj najpierw adres lub miejscowość w polu powyżej.');
      return;
    }

    setLoading(true);
    setDotCount(0);
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
        if (isNewLocation || !lastPointRef.current ||
            Math.abs(lastPointRef.current.lat - point.lat) > 0.005 ||
            Math.abs(lastPointRef.current.lon - point.lon) > 0.005) {
          lastPointRef.current = point;
          return newBatch;
        }

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

  // Wybór potrawy z kafelków
  function selectDish(dish) {
    setActiveDish(dish.name);
    setShowAllNearby(false);
    if (origin) {
      fetchNearby(origin, radius, dish.name, false);
    } else {
      setError('Podaj adres lub miejscowość w polu poniżej, aby wyszukać restauracje.');
    }
  }

  // Zmiana promienia
  function handleRadiusChange(newRadius) {
    setRadius(newRadius);
    if (origin && hasSearched) {
      fetchNearby(origin, newRadius, activeDish, false);
    }
  }

  // Wszystkie lokale w zadanym promieniu
  const allInRadius = useMemo(() => {
    return rawRestaurants.filter(r => r.distance <= radius);
  }, [rawRestaurants, radius]);

  // Kwalifikowanie restauracji pod kątem potrawy
  const matchedRestaurants = useMemo(() => {
    if (!hasSearched) return [];
    const qualified = [];

    for (const r of allInRadius) {
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
  }, [allInRadius, dishAnalysis, hasSearched]);

  // Lista wyświetlana
  const displayedRestaurants = useMemo(() => {
    if (showAllNearby) {
      return allInRadius;
    }
    return matchedRestaurants;
  }, [showAllNearby, allInRadius, matchedRestaurants]);

  return (
    <>
      <header>
        <a className="logo" href="./">
          Gdzie<span>Zjem?</span>
        </a>
        <span className="badge">WYSZUKIWARKA DAŃ</span>
      </header>

      <main>
        {/* Sekcja Hero */}
        <section className="hero">
          <div className="eyebrow">WYBIERZ DANIE I ZNAJDŹ NAJBLIŻSZY LOKAL</div>
          <h1>
            Gdzie dziś zjesz<br />
            <em>{activeDish ? activeDish : 'coś pysznego'}?</em>
          </h1>

          {/* Kafelki wyboru potraw (bez etykiety 'Szybki wybór' i bez inputu) */}
          <div className="suggestions" style={{ marginTop: '14px' }}>
            {POPULAR_DISHES.map(d => (
              <button
                key={d.query}
                type="button"
                className={activeDish.toLowerCase() === d.name.toLowerCase() ? 'selected-dish-chip' : ''}
                onClick={() => selectDish(d)}
                disabled={loading}
              >
                {d.emoji} {d.name}
              </button>
            ))}
          </div>

          {/* Samodzielny input dokładnego adresu (bez przycisków otwierających) */}
          <AddressLocation
            disabled={loading}
            selectedLabel={locationName}
            onSelect={(point, label) => {
              setOrigin(point);
              setLocationName(label);
              fetchNearby(point, radius, activeDish, true);
            }}
          />

          {/* Wybór promienia */}
          <div className="radius-picker" style={{ marginTop: '20px' }}>
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
                  : 'Wybierz danie i podaj adres'}
              </h2>
            </div>

            {hasSearched && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`filter-match-toggle ${!showAllNearby ? 'active' : ''}`}
                  onClick={() => setShowAllNearby(false)}
                >
                  🎯 Tylko {activeDish} ({matchedRestaurants.length})
                </button>
                <button
                  type="button"
                  className={`filter-match-toggle ${showAllNearby ? 'active' : ''}`}
                  onClick={() => setShowAllNearby(true)}
                  title="Pokaż wszystkie lokale w okolicy"
                >
                  🌐 Wszystkie w promieniu ({allInRadius.length})
                </button>
              </div>
            )}
          </div>

          {/* Mini animacja ładowania z pulsującą ikonką i dynamicznymi kropkami */}
          {loading && (
            <div className="empty loading-box">
              <div className="search-pulse-icon" aria-hidden="true">
                {dishAnalysis?.cuisine?.emoji || '🍽️'}
              </div>
              <h3 className="loading-dots-title">
                Szukam lokali<span className="animated-dots">{animatedDots}</span>
              </h3>
              <p>Szukam {activeDish} w promieniu do {radius} km od: {locationName}</p>
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
              <h3>Wybierz danie powyżej i wpisz adres</h3>
              <p style={{ maxWidth: '560px', margin: 'auto' }}>
                Kliknij potrawę (np. <strong>Carbonara</strong>, <strong>Pizza</strong>, <strong>Ramen</strong>, <strong>Burger</strong>)
                oraz wpisz ulicę i miasto w polu adresu, aby znaleźć najbliższe restauracje.
              </p>
            </div>
          )}

          {/* Lista restauracji */}
          {!loading && hasSearched && displayedRestaurants.length > 0 && (
            <div className="restaurant-list">
              {displayedRestaurants.map((r, i) => {
                const isNearest = i === 0;
                const gmapsQuery = `${activeDish} ${r.name} ${r.address}`;
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
                          {isNearest ? '🏆 NAJBLIŻEJ CIEBIE' : (r.matchBadge || 'LOKAL W OKOLICY')}
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

                      {/* Boks dania */}
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
                          ℹ️ {r.matchReason || (r.cuisine ? `Profil kuchni: ${r.cuisine}` : 'Lokal w Twojej okolicy')}
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
                          📖 Sprawdź "{activeDish}" w Google Maps ↗
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
                            title="Otwórz oficjalną stronę lokalu"
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
          {!loading && hasSearched && displayedRestaurants.length === 0 && (
            <div className="empty">
              <h3>Brak lokali serwujących "{activeDish}" w promieniu {radius} km</h3>
              <p>
                W wybranym obszarze do {radius} km wokół "{locationName}" nie znaleziono lokali o profilu pasującym do tego dania.
              </p>
              {allInRadius.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <button type="button" onClick={() => setShowAllNearby(true)}>
                    Pokaż wszystkie restauracje w okolicy ({allInRadius.length})
                  </button>
                </div>
              )}
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
            Dane mapowe i współrzędne: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>.
          </p>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
