import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseMenuText,validRestaurant} from './menuImport.js';
test('OCR: Polish prices and dotted leaders',()=>{assert.deepEqual(parseMenuText('Carbonara | 43,00 zł\nPizza .... 35 PLN\nZupa 18.50 zl'),[{name:'Carbonara',price:43},{name:'Pizza',price:35},{name:'Zupa',price:18.5}]);});
test('OCR: ignores headings, empty lines and zero prices',()=>{assert.deepEqual(parseMenuText('MAKARONY\n\nCarbonara 0 zł'),[]);});
test('import validation rejects malformed coordinates and prices',()=>{const r={name:'Lokal',address:'Kalisz',lat:51.7,lon:18,menu:[{name:'Pizza',price:30}]};assert.ok(validRestaurant(r));assert.equal(validRestaurant({...r,lat:100}),false);assert.equal(validRestaurant({...r,menu:[{name:'Pizza',price:-5}]}),false);});
