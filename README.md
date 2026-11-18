# Gdzie zjeść?

Aplikacja wyszukuje restauracje i lokale gastronomiczne w pobliżu wskazanej miejscowości, dokładnego adresu lub bieżącej lokalizacji. Wybierz promień 2, 5 albo 10 km. Wyniki pochodzą z OpenStreetMap i są sortowane według odległości w linii prostej.

## Uruchomienie

Wymagany Node.js 22.12+ lub 24:

```powershell
npm.cmd install
npm.cmd start
```

Otwórz adres pokazany w terminalu. API wyszukiwania działa przez middleware Vite, więc katalog `dist` samodzielnie nie wystarcza do wdrożenia. Do publikacji potrzebny będzie serwer z obsługą endpointu `/api/nearby`.

## Lokalizacja i dane

Podpowiedzi miejscowości pochodzą z Open-Meteo / GeoNames, a wyszukiwanie dokładnego adresu korzysta z Photon i danych OpenStreetMap. Wyniki lokali są pobierane z Overpass API. Ręcznie wybrana miejscowość oznacza centrum miejscowości; adres wskazuje wybrany punkt. Geolokalizacja przeglądarki wymaga localhost lub HTTPS.

Dane OpenStreetMap mogą być niepełne lub nieaktualne. Nazwy, adresy i kategorie zależą od wpisów mapowych; aplikacja nie udostępnia menu ani ocen lokali. Przy wynikach widoczna jest atrybucja OpenStreetMap.
