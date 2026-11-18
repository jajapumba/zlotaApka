import React, { useEffect, useState } from 'react';

function addressLabel(properties) {
 const streetLine=[properties.street,properties.housenumber].filter(Boolean).join(' ');
 const city=properties.city||properties.town||properties.village||properties.county;
 return [properties.name,streetLine,properties.postcode,city,properties.state]
  .filter((value,index,array)=>value&&array.indexOf(value)===index).join(', ');
}

export default function AddressLocation({onSelect,disabled}) {
 const [query,setQuery]=useState('');
 const [results,setResults]=useState([]);
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState('Wpisz ulicę, numer domu i miejscowość.');

 useEffect(()=>{
  const controller=new AbortController();
  setResults([]);
  if(query.trim().length<5||disabled){setLoading(false);setMessage('Wpisz ulicę, numer domu i miejscowość.');return ()=>controller.abort();}
  setLoading(true);setMessage('Szukam adresu…');
  const timer=setTimeout(async()=>{
   try{
    const params=new URLSearchParams({q:query.trim(),limit:'8',lang:'pl'});
    const response=await fetch(`https://photon.komoot.io/api/?${params}`,{signal:controller.signal});
    if(!response.ok)throw new Error('Geokoder jest chwilowo niedostępny.');
    const data=await response.json();
    if(controller.signal.aborted)return;
    const places=(data.features||[]).filter(feature=>feature.properties?.countrycode==='PL'&&Number.isFinite(feature.geometry?.coordinates?.[0])&&Number.isFinite(feature.geometry?.coordinates?.[1]));
    setResults(places);setMessage(places.length?'Wybierz właściwy adres z listy:':'Nie znaleziono tego adresu. Sprawdź ulicę, numer i miejscowość.');
   }catch(error){if(!controller.signal.aborted)setMessage('Nie udało się pobrać adresów. Sprawdź połączenie i spróbuj ponownie.');}
   finally{if(!controller.signal.aborted)setLoading(false);}
  },500);
  return ()=>{clearTimeout(timer);controller.abort();};
 },[query,disabled]);

 return <div className="manual-location address-location">
  <label htmlFor="exact-address">Dokładny adres</label>
  <input id="exact-address" value={query} disabled={disabled} onChange={event=>setQuery(event.target.value)} placeholder="np. Górnośląska 64, Kalisz" autoComplete="street-address" aria-describedby="address-hint" aria-controls="address-options" aria-busy={loading}/>
  <p id="address-hint" role="status">{message}</p>
  {results.length>0&&<ul id="address-options" className="place-options">{results.map((feature,index)=>{
   const props=feature.properties||{};const coords=feature.geometry.coordinates;const label=addressLabel(props)||'Adres bez nazwy';
   const key=props.osm_id?`${props.osm_type}-${props.osm_id}`:`${label}-${index}`;
   return <li key={key}><button disabled={disabled} onClick={()=>onSelect({lat:coords[1],lon:coords[0]},label)}><span className="place-name"><strong>{label}</strong><small>{[props.district,props.city||props.town||props.village,props.state].filter(Boolean).join(' · ')}</small></span><span>Wybierz →</span></button></li>;
  })}</ul>}
  <small>Wybierz wynik, który zawiera właściwy numer domu. Dane adresowe pochodzą z OpenStreetMap.</small>
 </div>;
}
