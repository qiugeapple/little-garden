import assert from 'node:assert/strict';
import {growthScale,applyPlantGrowth} from '../plant-growth.js';
const scale={set(...v){this.value=v;}},root={getObjectByName:()=>({scale})};
for(let i=0;i<500;i++){assert(applyPlantGrowth(root,7.5));assert.deepEqual(scale.value,[1,1,1]);}
assert.deepEqual(growthScale(100),[1,1,1]);
assert.deepEqual(growthScale(-1),[.08,.08,.08]);
assert(growthScale(3.2)[1]<growthScale(4.6)[1]);
assert.equal(applyPlantGrowth({getObjectByName:()=>null},7.5),false);
console.log('Completed growth stays full-size for 500 frames; restored mature age and boundaries passed.');
