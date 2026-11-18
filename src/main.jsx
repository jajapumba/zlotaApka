import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ManualLocation from './ManualLocation.jsx';
import AddressLocation from './AddressLocation.jsx';
import '../style.css';
import './react.css';

function App(){
 const [origin,setOrigin]=useState(null);
 const [locationName,setLocationName]=useState('');
 const [radius,setRadius]=useState(5);
 const [restaurants,setRestaurants]=useState([]);
 const [message,setMessage]=useState('Wybierz lokalizację, aby zobaczyć restauracje w pobliżu.');
 const [manualOpen,setManualOpen]=useState(false);
 const [addressOpen,setAddressOpen]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 async function searchNearby(point,label,range=radius){
  setOrigin(point);setLocationName(label);setRadius(range);setLoading(true);setError('');setMessage(`Szukam restauracji w promieniu ${range} km…`);
  try{
   const response=await fetch(`/api/nearby?lat=${encodeURIComponent(point.lat)}&lon=${encodeURIComponent(point.lon)}&radius=${range}`);
   const data=await response.json();if(!response.ok)throw Error(data.error||'Nie udało się pobrać restauracji.');
   setRestaurants(data.restaurants||[]);setMessage(`Restauracje w promieniu ${range} km od: ${label}`);
  }catch(e){setRestaurants([]);setError(e.message);setMessage('Nie udało się pobrać restauracji.');}
  finally{setLoading(false);}
 }
 function locate(){if(!navigator.geolocation){setError('Przeglądarka nie obsługuje lokalizacji. Wpisz miejscowość ręcznie.');return;}setLoading(true);navigator.geolocation.getCurrentPosition(p=>searchNearby({lat:p.coords.latitude,lon:p.coords.longitude},'Twoja lokalizacja'),()=>{setLoading(false);setError('Nie udało się ustalić lokalizacji. Wpisz miejscowość ręcznie.');},{timeout:10000,maximumAge:60000});}
 return <><header><a className="logo" href="./">Gdzie zjeść?</a><span className="badge">ZNAJDŹ RESTAURACJE W OKOLICY</span></header><main>
  <section className="hero"><div className="eyebrow">ODKRYJ MIEJSCA BLISKO CIEBIE</div><h1>Gdzie dziś<br/><em>zjesz?</em></h1><p>Podaj miejscowość i wybierz, jak daleko chcesz szukać.</p>
   <div className="location-panel"><div><strong>⌖ Twoja okolica</strong><p role="status">{message}</p></div><div className="location-actions"><button disabled={loading} onClick={locate}>Użyj mojej lokalizacji</button><button aria-expanded={manualOpen} onClick={()=>{setManualOpen(!manualOpen);setAddressOpen(false);}}>Podaj miejscowość</button><button aria-expanded={addressOpen} onClick={()=>{setAddressOpen(!addressOpen);setManualOpen(false);}}>Podaj dokładny adres</button></div></div>
   {manualOpen&&<ManualLocation disabled={loading} onSelect={(point,label)=>{setManualOpen(false);searchNearby(point,label);}}/>}
   {addressOpen&&<AddressLocation disabled={loading} onSelect={(point,label)=>{setAddressOpen(false);searchNearby(point,label);}}/>}
   <div className="radius-picker"><span>Promień wyszukiwania</span><div>{[2,5,10].map(n=><button key={n} className={radius===n?'selected':''} aria-pressed={radius===n} disabled={loading} onClick={()=>origin&&searchNearby(origin,locationName,n)}>{n} km</button>)}</div></div>
  </section>
  <section className="discovery"><div className="section-heading"><div><div className="eyebrow">W TWOJEJ OKOLICY</div><h2>{origin?`Restauracje · ${radius} km`:'Najbliższe restauracje'}</h2></div><span className="location">{restaurants.length} miejsc</span></div>
   {loading&&<p role="status">Szukam restauracji…</p>}{error&&<p role="alert">{error}</p>}
   {!loading&&!error&&restaurants.length>0&&<div className="restaurant-list">{restaurants.map((r,i)=><article className="restaurant-card" key={r.id||r.name}><div className="restaurant-art" aria-hidden="true">🍽️</div><div className="restaurant-content"><div className="restaurant-top"><span className="eyebrow">{i===0?'NAJBLIŻEJ CIEBIE':'RESTAURACJA W OKOLICY'}</span><strong>{r.distance<1?`${Math.round(r.distance*1000)} m`:`${r.distance.toFixed(1)} km`}</strong></div><h3>{r.name}</h3><p className="address">{r.address}</p><p className="address">{r.category||'Lokal gastronomiczny'}</p>{r.website&&<a href={r.website} target="_blank" rel="noreferrer">Otwórz stronę ↗</a>}</div></article>)}</div>}
   {!loading&&!error&&!restaurants.length&&<div className="empty"><h3>{origin?'Nie znaleziono restauracji w tym promieniu':'Wybierz miejscowość, aby rozpocząć'}</h3><p>{origin?'Zwiększ promień wyszukiwania.':'Pokażemy restauracje w okolicy, bez listy dań.'}</p></div>}
   <p className="map-credit">Dane lokali: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>. Kompletność informacji zależy od mapy.</p>
  </section>
 </main></>;
}
createRoot(document.getElementById('root')).render(<App/>);
