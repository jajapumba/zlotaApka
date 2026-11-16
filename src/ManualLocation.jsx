import React, { useEffect, useState } from 'react';

export default function ManualLocation({ onSelect, disabled }) {
 const [name,setName]=useState('');
 const [places,setPlaces]=useState([]);
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState('Wpisz co najmniej 2 znaki nazwy miejscowości.');
 useEffect(()=>{
  const controller=new AbortController();
  let timeout;
  setPlaces([]);setLoading(false);
  if(name.trim().length<2||disabled){setMessage('Wpisz co najmniej 2 znaki nazwy miejscowości.');return ()=>controller.abort();}
  setMessage('Szukam miejscowości…');setLoading(true);
  const timer=setTimeout(async()=>{
   timeout=setTimeout(()=>controller.abort('timeout'),10000);
   try{
    const params=new URLSearchParams({name:name.trim(),count:'8',language:'pl',format:'json',countryCode:'PL'});
    const response=await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`,{signal:controller.signal});
    if(!response.ok)throw Error('Niedostępne');
    const data=await response.json();
    if(controller.signal.aborted)return;
    const results=(data.results||[]).filter(p=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude));
    setPlaces(results);setMessage(results.length?'Wybierz miejscowość z właściwym województwem:':'Brak wyników. Spróbuj innej nazwy miejscowości.');
   }catch{if(!controller.signal.aborted||controller.signal.reason==='timeout')setMessage('Nie udało się pobrać miejscowości. Zmień wpisaną nazwę, aby spróbować ponownie.');}
   finally{clearTimeout(timeout);if(!controller.signal.aborted||controller.signal.reason==='timeout')setLoading(false);}
  },450);
  return ()=>{clearTimeout(timer);clearTimeout(timeout);controller.abort();};
 },[name,disabled]);
 return <div className="manual-location"><label htmlFor="city">Podaj miejscowość</label><div className="manual-location-input"><input autoFocus id="city" value={name} disabled={disabled} onChange={e=>setName(e.target.value)} placeholder="np. Warszawa" autoComplete="off" aria-describedby="location-hint" aria-controls="place-options" aria-busy={loading}/></div><p id="location-hint" role="status">{message}</p>{places.length>0&&<ul id="place-options" className="place-options">{places.map(p=>{const details=[p.admin2,p.admin1,p.country].filter(Boolean);const label=[p.name,...details].join(', ');return <li key={p.id}><button disabled={disabled} onClick={()=>onSelect({lat:p.latitude,lon:p.longitude},label)}><span className="place-name"><strong>{p.name}</strong><small>{details.join(' · ')}</small></span><span>Wybierz →</span></button></li>;})}</ul>}<small>Odległości liczymy od centrum wybranej miejscowości.</small><small className="geocoding-credit">Dane: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> / <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a></small></div>;
}
