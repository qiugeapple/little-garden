import {cloudMist} from './cloud-mist.js';
import * as T from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';

function baseCottageReward(scene){
 let pending,model;
 return {setVisible(show){if(model)model.visible=show;},async reveal(){
  if(!pending)pending=new GLTFLoader().loadAsync('./assets/cottage.glb').then(g=>{
   g.scene.name='UnlockedCloudCottage';const mats=new Map();g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const convert=m=>{if(!mats.has(m.uuid)){const color=m.color.clone(),name=m.name||'';if(/muted rose roof/.test(name))color.set('#cda0e4');else if(/dusty blush plaster/.test(name))color.set('#b7dce8');else if(/ivory joinery/.test(name))color.set('#fff4e5');else if(/meadow green/.test(name))color.set('#70a865');else if(/sage door/.test(name))color.set('#69b8c3');const next=new T.MeshStandardMaterial({color,roughness:.52,metalness:0,side:T.DoubleSide,emissive:m.emissive,emissiveIntensity:Math.min(.22,m.emissiveIntensity||0)});if(/honey window/.test(name)){next.color.set('#ffe5b6');next.emissive.set('#ffcc7d');next.emissiveIntensity=.32;}mats.set(m.uuid,next);}return mats.get(m.uuid);};o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);for(const m of Array.isArray(o.material)?o.material:[o.material]){m.envMapIntensity=.7;if(m.isMeshStandardMaterial)m.roughness=Math.max(.38,m.roughness);}}});scene.add(g.scene);model=g.scene;return g.scene;
  }).catch(e=>{pending=null;throw e;});
  return pending;
 }};
}

export function cottageReward(scene){
 const base=baseCottageReward(scene);let model,playing=false,epoch=0,resolvePlay,keep=false,nightness=0;
 const veils=[];const originals=new Map(),smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);
 function restore(){veils.forEach(v=>v.visible=false);for(const [o,p] of originals){o.position.copy(p.position);o.scale.copy(p.scale);o.quaternion.copy(p.quaternion);}if(model)model.visible=keep;}
 const api={
  setVisible(show){if(!playing)base.setVisible(show);},
  async reveal(){model=await base.reveal();if(!originals.size)model.traverse(o=>originals.set(o,{position:o.position.clone(),scale:o.scale.clone(),quaternion:o.quaternion.clone()}));return model;},
  night(n){nightness=n;if(!model)return;model.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.emissive?.getHex())m.emissiveIntensity=.25+n*.65;});},
  cancel(){epoch++;playing=false;restore();resolvePlay?.();resolvePlay=null;},
  async play(options={}){keep=!!options.keep;const loadToken=++epoch;playing=true;model=await api.reveal();if(loadToken!==epoch){playing=false;restore();return;}model.visible=true;const token=++epoch;const house=model.getObjectByName('Flower_cottage_reward_assembly'),steps=[],stars=[];model.traverse(o=>{if(o.name.startsWith('Cloud_approach_floating_step'))steps.push(o);if(o.name.startsWith('Cottage_completion_keepsake'))stars.push(o);});steps.sort((a,b)=>a.name.localeCompare(b.name));if(!veils.length)for(const side of [-1,1]){const group=new T.Group();group.userData.side=side;group.add(cloudMist());scene.add(group);veils.push(group);}const started=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;return new Promise(resolve=>{resolvePlay=resolve;function frame(){if(token!==epoch)return;const t=(performance.now()-started)/1000;veils.forEach(group=>{const part=smooth(2.2,6.1,t);group.visible=!reduced&&t<6.8;group.position.set(group.userData.side*(.35+part*2.1),4.43+part*.12,-1.67);const uniforms=group.children[0].material.uniforms;uniforms.opacity.value=smooth(.3,1.1,t)*(1-smooth(4.6,6.8,t));uniforms.time.value=t;uniforms.night.value=nightness;});if(house){const p=originals.get(house),v=reduced?1:smooth(1,5.2,t);house.scale.copy(p.scale).multiplyScalar(Math.max(.001,v));house.position.copy(p.position);house.position.y-=.24*(1-v);}steps.forEach((o,i)=>{const p=originals.get(o),v=reduced?1:smooth(4.35+i*.25,5.15+i*.25,t);o.scale.copy(p.scale).multiplyScalar(Math.max(.001,v));o.position.copy(p.position);o.position.y-=.18*(1-v);});stars.forEach(o=>{const p=originals.get(o),v=reduced?1:smooth(8.3,10.8,t);o.scale.copy(p.scale).multiplyScalar(Math.max(.001,v));o.position.copy(p.position);o.position.x-=3.8*(1-v);o.position.y+=Math.sin(v*Math.PI)*.65;});if(t<12)requestAnimationFrame(frame);else{playing=false;restore();resolvePlay=null;resolve();}}frame();});}
 };return api;
}
