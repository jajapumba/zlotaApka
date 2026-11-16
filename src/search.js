export const demoOrigin = { lat: 52.2297, lon: 21.0122 };
const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').trim();
export function distanceKm(a,b){const rad=n=>n*Math.PI/180;const h=Math.sin(rad(b.lat-a.lat)/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lon-a.lon)/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
export function findRestaurants(query,origin,{budget=Infinity,radius=Infinity}={},restaurants=[]){
 const words=normalize(query).split(/\s+/).filter(Boolean);
 if(!words.length)return [];
 return restaurants.map(r=>({...r,distance:distanceKm(origin,r),dishes:r.menu.filter(d=>words.every(w=>normalize(d.name).includes(w))&&d.price<=budget)})).filter(r=>r.dishes.length&&r.distance<=radius).sort((a,b)=>a.distance-b.distance);
}
