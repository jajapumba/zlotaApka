import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseMenu} from './menus.js';
const product=(name,price)=>`<div itemtype="http://schema.org/Product"><div class="product-name">${name}</div><div class="product-price">${price}</div></div>`;
const location='<meta itemprop="latitude" content="51.75034"><meta itemprop="longitude" content="18.075726">';
test('parser reads Polish prices and ignores invalid products',()=>{
 const html=location+Array.from({length:5},(_,i)=>product(`Danie ${i}`,'43,50 zł')).join('')+product('Brak ceny','zapytaj');
 const result=parseMenu(html);
 assert.equal(result.menu.length,5);assert.equal(result.menu[0].price,43.5);assert.equal(result.lat,51.75034);
});
test('broken source is rejected instead of replacing menu',()=>{assert.throws(()=>parseMenu('<html>Nowa strona</html>'));assert.throws(()=>parseMenu(location+product('Carbonara','43 zł')));});
