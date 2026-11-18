import React, { useEffect, useState, useRef } from 'react';

export default function AddressLocation({ onSelect, disabled, selectedLabel }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // Przechowuje tekst ostatnio wybranego adresu — blokuje geocoding dopóki użytkownik nie wpisze czegoś innego
  const lockedQueryRef = useRef('');

  useEffect(() => {
    // Jeśli query dokładnie pasuje do ostatnio wybranego adresu → nie szukaj ponownie
    // (dotyczy też przypadku gdy disabled się zmienia podczas ładowania restauracji)
    if (lockedQueryRef.current && query === lockedQueryRef.current) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setResults([]);

    if (query.trim().length < 3 || disabled) {
      setLoading(false);
      setMessage('');
      return () => controller.abort();
    }

    setLoading(true);
    setMessage('');

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Serwer geokodowania chwilowo niedostępny.');
        const data = await response.json();
        if (controller.signal.aborted) return;

        setResults(data || []);
        setMessage(
          data.length > 0
            ? ''
            : 'Nie znaleziono adresu. Sprawdź nazwę ulicy lub miejscowości.'
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setMessage('Nie udało się pobrać adresów. Sprawdź połączenie.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, disabled]);

  function handlePick(item) {
    lockedQueryRef.current = item.label; // zablokuj ten tekst — nie szukaj dopóki użytkownik nie zmieni
    setQuery(item.label);
    setResults([]);
    setMessage('');
    onSelect({ lat: item.lat, lon: item.lon }, item.label);
  }

  return (
    <div className="manual-location address-location" style={{ marginTop: '24px' }}>
      <label htmlFor="exact-address" style={{ fontSize: '15px', fontWeight: 700, color: '#25372c' }}>
        📍 Podaj dokładny adres lub miejscowość
      </label>
      <input
        id="exact-address"
        value={query}
        disabled={disabled}
        onChange={event => {
          lockedQueryRef.current = ''; // użytkownik pisze ponownie — odblokuj geocoding
          setQuery(event.target.value);
        }}
        placeholder="Wpisz ulicę, miasto lub miejscowość, np. Główny Rynek, Kalisz"
        autoComplete="street-address"
        aria-describedby="address-hint"
        aria-busy={loading}
      />
      {selectedLabel && !query && (
        <small style={{ color: '#304e39', fontWeight: 600, display: 'block', marginTop: '6px' }}>
          ✓ Aktualnie wybrano: {selectedLabel}
        </small>
      )}
      {message && <p id="address-hint" role="status" style={{ margin: '8px 0 4px', fontSize: '13px' }}>{message}</p>}

      {results.length > 0 && (
        <ul className="place-options" style={{ marginTop: '10px' }}>
          {results.map((item, index) => (
            <li key={`${item.lat}-${item.lon}-${index}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handlePick(item)}
              >
                <span className="place-name">
                  <strong>{item.label}</strong>
                  {item.city && <small>{item.city} {item.state ? `· ${item.state}` : ''}</small>}
                </span>
                <span>Wybierz →</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
