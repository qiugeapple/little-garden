import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const name of ['garden.glb','botanical-flowers.glb','meadow.glb','cottage.glb','voile.glb','cloud-panorama.jpg','night-sky.jpg','cloud-pet.png','curtain-film.jpg','crt-screen.jpg','reward-piano.wav'])assert(fs.statSync(path.join(root,'assets',name)).size>0,name);
function glb(name){const b=fs.readFileSync(path.join(root,'assets',name));assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);return JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));}
const flowers=glb('botanical-flowers.glb');
for(const type of ['daisy','cosmos','lavender','lily','bellflower','ranunculus'])assert(flowers.nodes.some(n=>n.name==='Flower_'+type),type);
assert(glb('cottage.glb').nodes.some(n=>n.name==='Flower cottage reward assembly'));
assert(glb('meadow.glb').meshes.length>=20);
assert(glb('voile.glb').meshes.filter(m=>m.primitives.some(p=>p.targets?.length)).length===2);
assert.equal(fs.readFileSync(path.join(root,'assets','reward-piano.wav')).toString('ascii',0,4),'RIFF');
console.log('Runtime assets, six botanical models, cottage, groundcover, curtain morphs and piano WAV passed.');
