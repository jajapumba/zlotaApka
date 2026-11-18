import { defineConfig } from 'vite';
const lastRequest=new Map();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const overpassServers=[
 'https://ovp.dresel.systems/api/interpreter',
 'https://overpass.private.coffee/api/interpreter',
 'https://overpass-api.de/api/interpreter',
];
async function fetchOverpass(query){
 const controllers=overpassServers.map(()=>new AbortController());
 const timeout=setTimeout(()=>controllers.forEach(controller=>controller.abort()),15000);
 try{
  return await Promise.any(overpassServers.map(async(endpoint,index)=>{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'GdzieZjescStudent/1.0 (nearby restaurant search)'},body:new URLSearchParams({data:query}),signal:controllers[index].signal});
   if(!response.ok)throw new Error(`Overpass zwrócił HTTP ${response.status}`);
   return response.json();
  }));
 }finally{
  clearTimeout(timeout);
  controllers.forEach(controller=>controller.abort());
 }
}
function nearbyApi(server){server.middlewares.use('/api/nearby',async(req,res)=>{res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');if(req.method!=='GET'){res.statusCode=405;res.end(JSON.stringify({error:'Metoda niedozwolona'}));return;}const url=new URL(req.url,'http://localhost');const lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon')),radius=Number(url.searchParams.get('radius'));if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||![2,5,10].includes(radius)){res.statusCode=400;res.end(JSON.stringify({error:'Nieprawidłowa lokalizacja lub promień.'}));return;}const key=`${lat.toFixed(3)},${lon.toFixed(3)},${radius}`;try{const cached=globalThis.__nearbyCache?.get(key);if(cached&&Date.now()-cached.time<600000){res.end(JSON.stringify(cached.data));return;}const wait=Math.max(0,1100-(Date.now()-(lastRequest.get('overpass')||0)));if(wait)await sleep(wait);lastRequest.set('overpass',Date.now());const query=`[out:json][timeout:15];(node[amenity~"restaurant|cafe|fast_food|food_court|bar"](around:${radius*1000},${lat},${lon});way[amenity~"restaurant|cafe|fast_food|food_court|bar"](around:${radius*1000},${lat},${lon});relation[amenity~"restaurant|cafe|fast_food|food_court|bar"](around:${radius*1000},${lat},${lon}););out center tags;`;const raw=await fetchOverpass(query);const restaurants=(raw.elements||[]).map(el=>{const tags=el.tags||{},p=el.center||el;const dLat=p.lat-lat,dLon=(p.lon-lon)*Math.cos(lat*Math.PI/180),distance=111.195*Math.hypot(dLat,dLon);return{id:`osm-${el.type}-${el.id}`,name:tags.name||tags['name:pl']||({restaurant:'Restauracja',cafe:'Kawiarnia',fast_food:'Lokal fast food',food_court:'Strefa gastronomiczna',bar:'Bar'}[tags.amenity]||'Lokal gastronomiczny'),address:[tags['addr:street'],tags['addr:housenumber'],tags['addr:city']].filter(Boolean).join(' ')||'Adres niepodany',distance,category:tags.amenity,rating:null,website:tags.website||tags['contact:website']||`https://www.openstreetmap.org/${el.type}/${el.id}`};}).sort((a,b)=>a.distance-b.distance);const data={restaurants};globalThis.__nearbyCache??=new Map();globalThis.__nearbyCache.set(key,{time:Date.now(),data});res.end(JSON.stringify(data));}catch(error){res.statusCode=502;const message=error instanceof AggregateError||error.name==='TimeoutError'?'Serwery map nie odpowiedziały w ciągu 15 sekund. Spróbuj ponownie.':'Nie można połączyć się ze źródłem map. Sprawdź internet i uruchom ponownie aplikację.';res.end(JSON.stringify({error:message}));}});}
export default defineConfig({plugins:[{name:'nearby-restaurants-api',configureServer:nearbyApi,configurePreviewServer:nearbyApi}]});
