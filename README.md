# GdzieZjem? 🍝 · Wyszukiwarka dań na żywo
> Projekt na ogólnopolski konkurs programistyczny **„Złota Apka – Code with Calisia”**

Aplikacja rozwiązuje codzienny problem: **„Mam ochotę na konkretne danie (np. carbonara, ramen, burger, pierogi) – gdzie zjem je najbliżej i jak tam dotrzeć?”**

Działa w **100% w czasie rzeczywistym (live)**, bez konieczności utrzymywania własnej bazy danych SQL czy ręcznego wprowadzania lokali.

---

## 🚀 Jak to działa?

1. **Wyszukiwanie dań (Dish-First UX):** Użytkownik wpisuje w pole wyszukiwania dowolną potrawę (np. `carbonara`, `ramen`, `kebab`, `schabowy`, `pad thai`, `sushi`, `naleśniki` itp.) lub wybiera z szybkich propozycji.
2. **Silnik klasyfikacji kulinarnej w locie (`dishKnowledge.js`):** Aplikacja w ułamku sekundy analizuje profil potrawy, dobiera odpowiednie tagi kuchni oraz słowa kluczowe.
3. **Pobieranie na żywo z OpenStreetMap (Overpass API):** Aplikacja wyszukuje lokale gastronomiczne w wybranym promieniu (2, 5, 10 lub 15 km) od podanego punktu.
4. **Punktacja i inteligentne sortowanie:** Lokale o profilu odpowiadającym potrawie (np. trattorie i restauracje włoskie dla carbonary) otrzymują wyróżnienie i są sortowane od najbliższego w metrach wraz z szacowanym czasem dojścia pieszo.
5. **Akcje jednym kliknięciem:**
   - 📖 **Sprawdź danie w menu (Google Maps):** Bezpośredni dynamiczny link do karty dań, recenzji i zdjęć wpisanej potrawy w tym lokalu.
   - 🧭 **Prowadź do lokalu:** Uruchomienie nawigacji pieszej/samochodowej.
   - 🌐 **Strona WWW:** Bezpośrednie przejście do oficjalnej witryny lokalu.

---

## 🛠️ Uruchomienie lokalne

Wymagany Node.js (wersja 20, 22 lub 24):

```powershell
npm install
npm start
```

Otwórz adres w przeglądarce: [http://localhost:5173](http://localhost:5173).

---

## 🏛️ Dedykowany tryb demonstracyjny (Kalisz)

Aplikacja domyślnie startuje z widokiem na Główny Rynek w **Kaliszu** (stolicy konkursu *Code with Calisia*), z wbudowanym zabezpieczeniem buforującym na wypadek problemów z siecią zewnętrzną serwerów map podczas prezentacji przed jury.
Można również użyć **własnej geolokalizacji GPS** lub wpisać dowolną miejscowość i adres w Polsce.
