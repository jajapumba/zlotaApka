import React, { useEffect, useState } from 'react';

export default function AddressLocation({ onSelect, disabled }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Wpisz ulicę, numer domu lub miejscowość.');

  useEffect(() => {
    const controller = new AbortController();
    setResults([]);

    if (query.trim().length < 3 || disabled) {
      setLoading(false);
      setMessage('Wpisz co najmniej 3 znaki adresu (np. ulica i miasto).');
      return () => controller.abort();
    }

    setLoading(true);
    setMessage('Szukam adresu na mapie…');

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
            ? 'Wybierz właściwy adres z listy:'
            : 'Nie znaleziono tego adresu. Sprawdź poprawność ulicy i miejscowości.'
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setMessage('Nie udało się pobrać adresów. Sprawdź połączenie i spróbuj ponownie.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, disabled]);

  return (
    <div className="manual-location address-location">
      <label htmlFor="exact-address">Podaj dokładny adres</label>
      <input
        id="exact-address"
        autoFocus
        value={query}
        disabled={disabled}
        onChange={event => setQuery(event.target.value)}
        placeholder="np. Piotrkowska 100, Łódź lub Rynek 5, Wrocław"
        autoComplete="street-address"
        aria-describedby="address-hint"
        aria-busy={loading}
      />
      <p id="address-hint" role="status">{message}</p>

      {results.length > 0 && (
        <ul className="place-options">
          {results.map((item, index) => (
            <li key={`${item.lat}-${item.lon}-${index}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect({ lat: item.lat, lon: item.lon }, item.label)}
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
      <small>Wybierz wynik z listy, aby wyznaczyć punkt wyszukiwania.</small>
    </div>
  );
}
