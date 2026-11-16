import { defineConfig } from 'vite';
import { getMenus } from './server/menus.js';

function menuApi(server){
 server.middlewares.use('/api/restaurants',async(req,res)=>{
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){res.statusCode=405;res.end(JSON.stringify({error:'Metoda niedozwolona'}));return;}
  try{res.end(JSON.stringify(await getMenus()));}
  catch{res.statusCode=502;res.end(JSON.stringify({error:'Nie udało się pobrać menu restauracji. Spróbuj ponownie później.'}));}
 });
}
export default defineConfig({plugins:[{name:'restaurant-menu-api',configureServer:menuApi,configurePreviewServer:menuApi}]});
