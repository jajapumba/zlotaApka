export function parseMenuText(text){
 return text.split(/\r?\n/).flatMap(line=>{
  const match=line.trim().match(/^(.+?)\s*(?:\||[.·…]{2,}|\s)\s*(\d{1,4}(?:[,.]\d{1,2})?)\s*(?:zł|zl|PLN)?\s*$/i);
  if(!match)return [];
  const name=match[1].replace(/[.·…\s]+$/,'').trim();
  const price=Number(match[2].replace(',','.'));
  return name.length>1&&price>0?[{name,price}]:[];
 });
}
export function validRestaurant(r){return r&&typeof r.name==='string'&&typeof r.address==='string'&&Number.isFinite(r.lat)&&Math.abs(r.lat)<=90&&Number.isFinite(r.lon)&&Math.abs(r.lon)<=180&&Array.isArray(r.menu)&&r.menu.length>0&&r.menu.every(d=>typeof d.name==='string'&&Number.isFinite(d.price)&&d.price>0);}
export function loadImports(){try{const value=JSON.parse(localStorage.getItem('gdzie-menu-imports')||'[]');return Array.isArray(value)?value.filter(validRestaurant):[];}catch{return [];}}
