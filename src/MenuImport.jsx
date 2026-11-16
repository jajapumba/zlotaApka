import React, {useState,useRef,useEffect} from 'react';
import {parseMenuText} from './menuImport.js';

export default function MenuImport({onSave}){
 const [open,setOpen]=useState(false),[file,setFile]=useState(null),[preview,setPreview]=useState('');
 const [busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[text,setText]=useState(''),[error,setError]=useState('');
 const [name,setName]=useState(''),[address,setAddress]=useState(''),[lat,setLat]=useState(''),[lon,setLon]=useState('');
 const [reviewed,setReviewed]=useState(false);
 const workerRef=useRef(null),alive=useRef(true);
 useEffect(()=>{alive.current=true;return ()=>{alive.current=false;workerRef.current?.terminate();};},[]);
 useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return ()=>URL.revokeObjectURL(url);},[file]);
 const dishes=parseMenuText(text);
 async function recognize(){
  if(!file)return;
  setBusy(true);setError('');setReviewed(false);setProgress('Pobieram silnik rozpoznawania…');
  let worker;
  try{
   const {createWorker}=await import('tesseract.js');
   worker=await createWorker('pol+eng',1,{logger:m=>{if(alive.current)setProgress(m.status==='recognizing text'?`Odczytywanie: ${Math.round(m.progress*100)}%`:'Przygotowuję rozpoznawanie…');}});
   if(!alive.current){await worker.terminate();return;}
   workerRef.current=worker;
   const result=await worker.recognize(file);
   if(alive.current){setText(result.data.text);setProgress('Odczyt zakończony. Popraw tekst i sprawdź podgląd dań.');}
  }catch{if(alive.current)setError('Nie udało się odczytać zdjęcia. Sprawdź internet lub wpisz tekst ręcznie.');}
  finally{if(worker)await worker.terminate();workerRef.current=null;if(alive.current)setBusy(false);}
 }
 function save(e){
  e.preventDefault();setError('');
  const latitude=Number(lat.replace(',','.')),longitude=Number(lon.replace(',','.'));
  if(!name.trim()||!address.trim()||!lat.trim()||!lon.trim()||!Number.isFinite(latitude)||Math.abs(latitude)>90||!Number.isFinite(longitude)||Math.abs(longitude)>180||!dishes.length||!reviewed){setError('Uzupełnij lokal, poprawne współrzędne i co najmniej jedno danie. Potwierdź sprawdzenie menu.');return;}
  const restaurant={id:crypto.randomUUID(),name:name.trim(),address:address.trim(),lat:latitude,lon:longitude,menu:dishes,imported:true,importedAt:new Date().toISOString()};
  try{onSave(restaurant);setProgress('Menu zapisane. Możesz już wyszukiwać te dania.');setText('');setFile(null);setReviewed(false);}catch{setError('Nie udało się zapisać menu w przeglądarce. Sprawdź ustawienia pamięci.');}
 }
 return <section className="menu-import"><button className="import-toggle" onClick={()=>setOpen(!open)} aria-expanded={open}>{open?'Zwiń import menu':'Dodaj menu ze zdjęcia'} <span>↗</span></button>{open&&<div className="import-body"><h2>Od zdjęcia do wyszukiwalnego menu</h2><p>Dodaj zdjęcie menu, do którego masz prawo użycia. Sprawdź odczytane nazwy i ceny przed zapisaniem.</p><label>Zdjęcie menu (JPG, PNG lub WebP, do 10 MB)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{const f=e.target.files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10*1024*1024){setError('Wybierz JPG, PNG lub WebP do 10 MB.');e.target.value='';return;}setFile(f);setText('');setError('');setProgress('');setReviewed(false);}}/></label>{preview&&<img className="menu-preview" src={preview} alt="Wybrane zdjęcie menu"/>}<button type="button" disabled={!file||busy} onClick={recognize}>{busy?'Odczytuję…':'Odczytaj zdjęcie'}</button><p role="status">{progress}</p><p className="import-privacy">Zdjęcie jest przetwarzane na Twoim urządzeniu. Internet jest potrzebny do pobrania silnika i języków OCR. Zapisane menu będzie dostępne tylko w tej przeglądarce.</p><form onSubmit={save}><label>Tekst menu — popraw odczyt lub wpisz ręcznie<textarea value={text} disabled={busy} onChange={e=>{setText(e.target.value);setReviewed(false);}} placeholder={'Carbonara | 43,00 zł\nPizza Margherita | 35,00 zł'} rows={7}/></label><small>Jedno danie na linię, cena na końcu. Usuń gramatury i rozdziel pozycje z kilku kolumn.</small><h3>Podgląd do zatwierdzenia · {dishes.length} dań</h3><div className="import-dishes">{dishes.map((d,i)=><div key={i}><span>{d.name}</span><strong>{d.price.toFixed(2)} zł</strong></div>)}{!dishes.length&&<p>Tu pojawią się rozpoznane pozycje z cenami.</p>}</div><div className="import-fields"><label>Nazwa restauracji<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Adres restauracji<input required value={address} onChange={e=>setAddress(e.target.value)}/></label><label>Szerokość geograficzna<input required inputMode="decimal" placeholder="np. 51.761" value={lat} onChange={e=>setLat(e.target.value)}/></label><label>Długość geograficzna<input required inputMode="decimal" placeholder="np. 18.091" value={lon} onChange={e=>setLon(e.target.value)}/></label></div><small>Podaj współrzędne lokalu, aby prawidłowo obliczać odległość.</small><label className="import-confirm"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>Sprawdziłem nazwy dań, ceny i lokalizację.</label><button disabled={busy||!reviewed||!dishes.length} type="submit">Zapisz menu restauracji</button></form>{error&&<p role="alert">{error}</p>}</div>}</section>;
}
