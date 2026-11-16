# Gdzie zjeść — Kalisz

React + Vite. Wyszukiwanie konkretnych dań w menu restauracji, sortowanie według odległości od GPS lub miejscowości wybranej ręcznie.

## Uruchomienie

Node.js 22.12+ lub 24:

```powershell
npm.cmd install
npm.cmd start
```

Po zmianie konfiguracji uruchom ponownie serwer. Otwórz adres wypisany w terminalu.

Wersja produkcyjna lokalnie:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Rzeczywiste menu

Pierwsze źródło: Gustosa Ristorante, Górnośląska 64, Kalisz.
https://www.gustosaristorante-kalisz.pl/menu

Backend w server/menus.js pobiera HTML źródła, odczytuje nazwy dań, ceny oraz współrzędne. API /api/restaurants jest obsługiwane przez konfigurację Vite, także w trybie preview. Frontend nie pobiera stron restauracji bezpośrednio.

Kopia menu jest przechowywana w .cache/restaurants.json. Po 6 godzinach następne wywołanie API odświeża dane. Nie jest to zadanie uruchamiane samoczynnie w tle. Równoczesne zapytania korzystają z jednego pobrania. Awaria lub nierozpoznane menu nie nadpisują ostatniej poprawnej kopii. Bez wcześniejszej kopii API zwraca błąd, a interfejs pozwala ponowić próbę.

Wyniki zawierają link do źródła i czas pobrania. Ceny pochodzą z menu internetowego i mogą różnić się od cen na miejscu. Obecnie podłączona jest jedna restauracja; to nie jest pełny katalog Kalisza. Dodanie kolejnych źródeł wymaga sprawdzenia ich struktury i zasad wykorzystania.

Wdrożenie wymaga działającej części serwerowej i zapisywalnego katalogu cache. Sam katalog dist na hostingu statycznym nie wystarczy. Vite preview służy do lokalnej prezentacji; przed publicznym wdrożeniem potrzebny jest serwer produkcyjny.

## Lokalizacja

Ręczne podpowiedzi polskich miejscowości pochodzą z Open-Meteo / GeoNames. Wysyłana jest wpisana nazwa miejscowości. Współrzędne GPS pozostają w stanie React. Geolokalizacja wymaga localhost lub HTTPS. Ręczna lokalizacja oznacza centrum miejscowości, a odległość jest liczona w linii prostej.

## Sprawdzenie

npm.cmd test — testy parsera źródła, odległości i wyszukiwania. Dane fikcyjne występują tylko w testach wyszukiwania.
npm.cmd run build — kompilacja produkcyjna.

## Pokaz

Wybierz ręcznie Kalisz w województwie wielkopolskim, wpisz carbonara i kliknij Znajdź restaurację. Sprawdź źródło menu oraz datę pobrania. Następnie wypróbuj pizza lub lasagne.

## Import menu ze zdjęcia

Pod wynikami znajduje się przycisk „Dodaj menu ze zdjęcia”. Obsługiwane są JPG, PNG i WebP do 10 MB. Tesseract.js odczytuje tekst po polsku i angielsku lokalnie w przeglądarce; silnik i języki są pobierane z CDN. Zdjęcia nie są wysyłane do API OCR ani zapisywane w localStorage.

Po odczycie popraw tekst: jedna pozycja na linię, np. Carbonara | 43,00 zł. Podgląd pokazuje rozpoznane pozycje. Wpisz nazwę, adres i dokładne współrzędne restauracji, potwierdź sprawdzenie danych i zapisz. Menu jest przechowywane w localStorage tej przeglądarki i dołączane do wyników wyszukiwania. Usunięcie danych przeglądarki usuwa importy; nie są współdzielone między urządzeniami.

To import własnego pliku, nie automatyczne pobieranie zdjęć z Google. OCR może błędnie rozpoznawać ceny, układy kolumnowe i tekst na słabych zdjęciach. Linie bez rozpoznanej ceny nie trafiają do podglądu. Aktualizacja zaimportowanych menu nie odbywa się automatycznie.
