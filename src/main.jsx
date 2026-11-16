import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { findRestaurants } from './search.js';
import ManualLocation from './ManualLocation.jsx';
import MenuImport from './MenuImport.jsx';
import {loadImports} from './menuImport.js';
import '../style.css';
import './react.css';

function App(){
 const [imports,setImports]=useState(loadImports);
 function saveImport(restaurant){const next=[...imports,restaurant];localStorage.setItem('gdzie-menu-imports',JSON.stringify(next));setImports(next);}
 const [input,setInput]=useState(''),[query,setQuery]=useState('');
 const [origin,setOrigin]=useState(null),[mode,setMode]=useState('');
 const [message,setMessage]=useState("Wybierz swoją lokalizację, aby znaleźć najbliższe restauracje.");
 const [manualOpen,setManualOpen]=useState(false);
 const [locating,setLocating]=useState(false),[budget,setBudget]=useState('1000'),[radius,setRadius]=useState('100000');
 const [menuData,setMenuData]=useState(null),[menuError,setMenuError]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{const controller=new AbortController();setMenuError('');fetch('/api/restaurants',{signal:controller.signal}).then(async r=>{const data=await r.json();if(!r.ok)throw Error(data.error);return data;}).then(setMenuData).catch(e=>{if(!controller.signal.aborted)setMenuError(e.message);});return ()=>controller.abort();},[reload]);
 const results=origin?findRestaurants(query,origin,{budget:Number(budget),radius:Number(radius)},[...(menuData?.restaurants||[]),...imports]):[];
 function locate(){
  if(!navigator.geolocation){setMessage('Ta przeglądarka nie obsługuje lokalizacji. Podaj lokalizację ręcznie.');return;}
  setLocating(true);setMessage('Ustalam lokalizację…');
  navigator.geolocation.getCurrentPosition(p=>{setOrigin({lat:p.coords.latitude,lon:p.coords.longitude});setMode('Twoja lokalizacja');setMessage('Odległości liczone od Twojej lokalizacji.');setLocating(false);},e=>{setMessage(e.code===1?'Brak zgody na lokalizację. Zachowano poprzedni punkt.':'Nie udało się ustalić lokalizacji. Zachowano poprzedni punkt.');setLocating(false);},{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
 }
 return <><header><a className="logo" href="./">Gdzie zjeść?</a><span className="badge">WYBIERZ DANIE, ZNAJDZ RESTAURACJE</span></header><main>
 <section className="hero"><div className="eyebrow">TWOJE ULUBIONE DANIE BLISKO CIEBIE</div><h1>Na co masz<br/><em>ochotę?</em></h1><p>Wpisz danie. Znajdź najbliższą restaurację, która ma je w menu.</p><form onSubmit={e=>{e.preventDefault();setQuery(input.trim());}}><label className="sr-only" htmlFor="dish">Nazwa dania</label><div className="searchbox"><span aria-hidden="true">⌕</span><input id="dish" value={input} onChange={e=>setInput(e.target.value)} placeholder="np. pizza"/><button type="submit">Znajdź restaurację ↗</button></div></form><div className="suggestions"><span>Najpopularniejsze:</span>{['carbonara','pizza','burger','tiramisu'].map(q=><button key={q} onClick={()=>{setInput(q);setQuery(q);}}>{q}</button>)}</div></section>
 <section className="location-panel"><div><strong>⌖ Skąd szukasz?</strong><p role="status">{message}</p>{origin&&<small>{mode}: {origin.lat.toFixed(4)}, {origin.lon.toFixed(4)}</small>}</div><div className="location-actions"><button disabled={locating} onClick={locate}>{locating?'Ustalam lokalizację…':'Użyj mojej lokalizacji'}</button><button disabled={locating} aria-expanded={manualOpen} onClick={()=>setManualOpen(!manualOpen)}>Podaj ręcznie lokalizację</button></div></section>
 {manualOpen&&<ManualLocation disabled={locating} onSelect={(point,label)=>{setOrigin(point);setMode(label);setManualOpen(false);setMessage("Odległości liczone od wybranej miejscowości.");}}/>}
 <section className="discovery">{(menuError||!menuData||menuData.stale)&&<div className="menu-source-status" role="status">{menuError?<>{menuError} <button onClick={()=>setReload(reload+1)}>Spróbuj ponownie</button></>:!menuData?'Pobieram menu restauracji…':menuData.warning}</div>}<div className="section-heading"><div><div className="eyebrow">NAJPIERW NAJBLIŻSZA RESTAURACJA</div><h2>{query?`Gdzie zjesz: ${query}`:'Jakiego dania szukasz?'}</h2></div><span className="location">Odległość w linii prostej</span></div><div className="filters"><label>Cena dania <select value={budget} onChange={e=>setBudget(e.target.value)}><option value="1000">Dowolna</option><option value="30">Do 30 zł</option><option value="40">Do 40 zł</option><option value="50">Do 50 zł</option></select></label><label>Promień <select value={radius} onChange={e=>setRadius(e.target.value)}><option value="100000">Bez limitu</option><option value="1">1 km</option><option value="3">3 km</option><option value="10">10 km</option></select></label><button onClick={()=>{setBudget('1000');setRadius('100000');}}>Wyczyść filtry ↺</button></div>
 <p id="status" role="status">Znalezione restauracje: {results.length} · od najbliższej</p><div className="restaurant-list">{results.map((r,i)=><article className={`restaurant-card ${i===0?'nearest':''}`} key={r.id}><div className="restaurant-art" aria-hidden="true">{query.includes('burger')?'🍔':query.includes('pizza')?'🍕':query.includes('tiramisu')?'🍰':'🍝'}</div><div className="restaurant-content"><div className="restaurant-top"><span className="eyebrow">{i===0?'NAJBLIŻSZA Z TYM DANIEM':'KOLEJNA PROPOZYCJA'}</span><strong>{r.distance<1?`${Math.round(r.distance*1000)} m`:`${r.distance.toFixed(1)} km`}</strong></div><h3>{r.name}</h3><p className="address">{r.address} · {r.imported?'Menu zatwierdzone ze zdjęcia':<a href={r.sourceUrl} target="_blank" rel="noreferrer">Menu restauracji ↗</a>}</p>{r.dishes.map(d=><div className="menu-item" key={d.name}><strong>{d.name}</strong><strong>{d.price} zł</strong></div>)}</div></article>)}{!results.length&&<div className="empty"><h3>{!origin?'Wybierz lokalizację':query?'Nie znaleziono dania w wybranym obszarze':'Wpisz nazwę dania'}</h3><p>Spróbuj „carbonara”, „pizza” lub „burger”. Zmień filtry albo podaj lokalizację.</p><button onClick={()=>{setBudget('1000');setRadius('100000');setManualOpen(true);}}>Podaj lokalizację i wyczyść filtry</button></div>}</div></section><MenuImport onSave={saveImport}/></main></>;
}
createRoot(document.getElementById('root')).render(<App/>);

