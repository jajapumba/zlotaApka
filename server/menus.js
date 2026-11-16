import { load } from 'cheerio';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

export const sourceUrl='https://www.gustosaristorante-kalisz.pl/menu';
const cacheFile=new URL('../.cache/restaurants.json',import.meta.url);
const maxAge=6*60*60*1000;
let pending;
export function parseMenu(html){
 const $=load(html);
 const lat=Number($('[itemprop="latitude"]').attr('content'));
 const lon=Number($('[itemprop="longitude"]').attr('content'));
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||!$('[itemprop="latitude"]').length||lat<51||lat>53||lon<17||lon>19)throw Error('Brak poprawnej lokalizacji źródła');
 const menu=[];
 $('[itemtype="http://schema.org/Product"]').each((_,element)=>{
  const node=$(element);
  const name=node.find('.product-name').first().text().replace(/\s+/g,' ').trim();
  const text=node.find('.product-price').first().text().replace(/\s+/g,' ').trim();
  const match=text.match(/^(\d+(?:[,.]\d{1,2})?)\s*zł$/);
  if(!name||!match)return;
  const price=Number(match[1].replace(',','.'));
  const category=node.closest('.menucat').find('.category-name').first().text().trim();
  if(price>0)menu.push({name,price,category});
 });
 if(menu.length<5)throw Error('Nie rozpoznano menu — struktura strony mogła się zmienić');
 return {id:'gustosa-kalisz',name:'Gustosa Ristorante',address:'Górnośląska 64, Kalisz',lat,lon,sourceUrl,menu};
}
export async function getMenus(){
 let cached;
 try{cached=JSON.parse(await readFile(cacheFile,'utf8'));}catch{}
 if(cached&&Date.now()-Date.parse(cached.fetchedAt)<maxAge)return {...cached,stale:false};
 if(pending)return pending;
 pending=(async()=>{
  try{
   const response=await fetch(sourceUrl,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'GdzieZjesc-StudentPrototype/0.3'}});
   if(!response.ok)throw Error(`Źródło zwróciło ${response.status}`);
   const restaurant=parseMenu(await response.text());
   const data={fetchedAt:new Date().toISOString(),restaurants:[restaurant]};
   await mkdir(new URL('../.cache/',import.meta.url),{recursive:true});
   await writeFile(cacheFile,JSON.stringify(data,null,2));
   return {...data,stale:false};
  }catch(error){
   if(cached)return {...cached,stale:true,warning:'Nie udało się odświeżyć menu. Wyświetlamy ostatnią pobraną wersję.'};
   throw error;
  }
 })();
 try{return await pending;}finally{pending=undefined;}
}
