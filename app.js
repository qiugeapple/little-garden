import {applyPlantGrowth} from './plant-growth.js';
import {cottageReward} from './garden-cottage.js';
import {completionReward,isGardenComplete} from './garden-reward.js';
import {gardenLife} from './garden-life.js';
import {variation,effects,music} from './garden-effects.js';
import * as T from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
const $=s=>document.querySelector(s),host=$('#scene'),labels={daisy:'小雏菊',cosmos:'波斯菊',lavender:'薰衣草',lily:'铃兰',bellflower:'风铃草',ranunculus:'毛茛'};
document.querySelectorAll('main button,main input').forEach(el=>el.disabled=true);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.86;renderer.setClearColor('#86afd5');renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.append(renderer.domElement);
const scene=new T.Scene(),pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
scene.add(new T.HemisphereLight(0xdbeaff,0x637a9f,.72));const sun=new T.DirectionalLight(0xfff5e5,2.5);sun.position.set(-3,7,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:25});sun.shadow.normalBias=.018;sun.shadow.bias=-.00015;scene.add(sun);const fill=new T.DirectionalLight(0xb6d5ff,.72);fill.position.set(5,4,1);scene.add(fill);
const fx=effects(scene),ambientMusic=music();let musicStarted=false;
let garden,camera,camHome,can,canHome,canQuat,mouth,ready=false,species='daisy',tool='seed',plants=[],records=[],templates={},demo=false,playing=false,demoTime=0,demoMixer,demoActions=[],returning=false,cloudMap,cloudMaterial,statusTimer,life;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets=[],previewRoots=[],originalDrops=[],ray=new T.Raycaster(),pointer=new T.Vector2();
const ring=new T.Mesh(new T.RingGeometry(.23,.27,40),new T.MeshBasicMaterial({color:0xaedcfa,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);
const liveDrops=[];const dropGeometry=new T.SphereGeometry(.025,7,5),dropMat=new T.MeshPhysicalMaterial({color:0xb5e9ff,metalness:.1,roughness:.12,transparent:true,opacity:.85});for(let i=0;i<25;i++){const d=new T.Mesh(dropGeometry,dropMat);d.scale.y=1.7;d.visible=false;scene.add(d);liveDrops.push(d);}
function info(text){const el=$('#status');el.textContent=text;el.classList.add('show');clearTimeout(statusTimer);statusTimer=setTimeout(()=>el.classList.remove('show'),4800);}
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
function materialPass(root){const changed=new Set();root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;for(let m of Array.isArray(o.material)?o.material:[o.material]){
 if(/Sky image/.test(m.name)){
  cloudMaterial=new T.ShaderMaterial({uniforms:{panorama:{value:cloudMap},night:{value:cloudMap},nightMix:{value:0},offset:{value:0}},side:T.DoubleSide,toneMapped:false,
   vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
   fragmentShader:'uniform sampler2D panorama; uniform sampler2D night; uniform float nightMix; uniform float offset; varying vec2 vUv; void main(){float x=fract(vUv.x+offset);float w=smoothstep(0.0,0.055,x)*smoothstep(0.0,0.055,1.0-x);vec3 a=texture2D(panorama,vec2(x,vUv.y)).rgb;vec3 b=texture2D(panorama,vec2(fract(x+0.5),vUv.y)).rgb;vec3 na=texture2D(night,vec2(x,vUv.y)).rgb;vec3 nb=texture2D(night,vec2(fract(x+0.5),vUv.y)).rgb;gl_FragColor=vec4(mix(mix(b,a,w)*0.92,mix(nb,na,w),nightMix),1.0);\n#include <colorspace_fragment>\n}'});
  o.material=cloudMaterial;o.castShadow=o.receiveShadow=false;continue;
 }
 if(changed.has(m))continue;changed.add(m);m.envMapIntensity=.55;
 if(/glass/i.test(m.name)&&m.isMeshPhysicalMaterial){m.transparent=false;m.opacity=1;m.transmission=.76;m.thickness=.06;m.ior=1.46;m.roughness=.11;m.metalness=0;m.clearcoat=.8;m.clearcoatRoughness=.08;m.envMapIntensity=1.05;m.side=T.FrontSide;
  m.color.set(/purpleglass/.test(m.name)?'#b494ef':/pinkglass/.test(m.name)?'#ef93c1':'#8bd9e8');
  if(/Thin film/.test(m.name)){m.transmission=.96;m.thickness=.005;m.iridescence=1;m.iridescenceIOR=1.33;m.iridescenceThicknessRange=[160,420];m.color.set('#daeaff');}
 }
 if(/silver/.test(m.name)){m.metalness=.95;m.roughness=.23;m.envMapIntensity=.9;}
 if(/optical/.test(m.name)&&m.isMeshPhysicalMaterial){m.iridescence=1;m.iridescenceThicknessRange=[100,430];m.metalness=.8;m.roughness=.17;}
 if(m.name==='WEB_tile'){m.color.set('#a9c9e8');m.roughness=.52;}
 if(m.name==='WEB_blue'){m.color.set('#81a7d6');m.roughness=.45;}
 if(m.name==='WEB_ivory'){m.color.set('#fff4e8');m.roughness=.38;}
 if(m.name==='WEB_soil'){m.color.set('#685044');m.roughness=1;}
 if(m.name==='WEB_Detailed teal PCB'){m.color.set('#8eccc4');m.roughness=.48;}
 m.needsUpdate=true;
 }if((Array.isArray(o.material)?o.material:[o.material]).some(m=>/glass/i.test(m.name)))o.castShadow=false;});}
function resize(){if(!camera)return;const w=host.clientWidth,h=host.clientHeight,a=w/h;renderer.setSize(w,h);const width=Math.max(13,7.35*a),height=width/a;Object.assign(camera,{left:-width/2,right:width/2,top:height/2,bottom:-height/2});camera.updateProjectionMatrix();}addEventListener('resize',resize);
function save(){try{localStorage.setItem('little-garden-window-v1',JSON.stringify(records));}catch{}$('#count').textContent=plants.length+' / 12';$('#undo').disabled=!plants.length;}
function choose(type){if(!ready)return;if(demo)resetDemo();species=type;tool='seed';$('#water').classList.remove('active');$('#drag-hint').hidden=true;document.querySelectorAll('.seed').forEach(b=>{b.classList.toggle('active',b.dataset.type===type);b.setAttribute('aria-pressed',String(b.dataset.type===type));});$('#selected-label').textContent='已选：'+labels[type]+' · 点击花槽里的泥土';info('已选'+labels[type]+'，点击泥土种下它。');}
function spawn(r,persist=true){const t=templates[r.type],root=t.scene.clone(true);root.visible=true;root.position.set(r.x,.851,r.z);scene.add(root);const phase=variation(root,r);const mixer=new T.AnimationMixer(root);for(const c of t.animations){const a=mixer.clipAction(c);a.setLoop(T.LoopOnce);a.clampWhenFinished=true;a.play();}const p={root,mixer,age:r.grown?7.5:0,watered:!!r.grown,moisture:r.grown?1:0,phase,impulse:0,record:r};mixer.setTime(p.age);applyPlantGrowth(root,p.age);plants.push(p);if(persist){records.push(r);save();}return p;}
function resetDemo(){demo=false;playing=false;demoTime=0;demoActions.forEach(a=>a.reset().play());demoMixer.setTime(0);previewRoots.forEach(o=>o.visible=false);originalDrops.forEach(o=>o.visible=false);plants.forEach(p=>p.root.visible=true);can.position.copy(canHome);can.quaternion.copy(canQuat);$('#stop').hidden=true;$('#timeline').hidden=true;$('#time').hidden=true;$('#demo').textContent='▷ 看看花开';ring.visible=false;info('选择花种点击泥土；按住水壶拖到花朵上方浇水。');}
function startDemo(play=true){if(!ready)return;demo=true;playing=play;drag=null;returning=false;demoActions.forEach(a=>a.reset().play());plants.forEach(p=>p.root.visible=false);previewRoots.forEach(o=>o.visible=true);originalDrops.forEach(o=>o.visible=true);liveDrops.forEach(d=>d.visible=false);ring.visible=false;$('#stop').hidden=false;$('#timeline').hidden=false;$('#time').hidden=false;$('#demo').textContent=play?'Ⅱ 暂停':'▷ 继续';info('试映中的花不计入你的种植记录。');}
function setWaterTool(){if(!ready)return;if(demo)resetDemo();tool=tool==='water'?'seed':'water';$('#water').classList.toggle('active',tool==='water');$('#drag-hint').hidden=tool!=='water';$('#selected-label').textContent=tool==='water'?'浇水模式 · 按住水壶，拖到花朵上方':'已选：'+labels[species]+' · 点击泥土';info(tool==='water'?'按住右侧水壶拖动，花朵下出现圆环后停留，松手归位。':'点击泥土种下'+labels[species]+'。');}
document.querySelectorAll('.seed').forEach(b=>b.onclick=()=>choose(b.dataset.type));$('#water').onclick=setWaterTool;$('#undo').onclick=()=>{if(demo)resetDemo();const p=plants.pop();if(p){scene.remove(p.root);p.mixer.stopAllAction();records.pop();save();info('撤回一株，空位留给下一朵喜欢的花。');}};
$('#demo').onclick=()=>{if(!demo){demoTime=0;startDemo()}else{if(demoTime>=9.9){demoTime=0;demoActions.forEach(a=>a.reset().play());}playing=!playing;$('#demo').textContent=playing?'Ⅱ 暂停':'▷ 继续';}};$('#stop').onclick=resetDemo;$('#timeline').oninput=e=>{startDemo(false);demoTime=+e.target.value;demoMixer.setTime(demoTime)};
$('#sound').onclick=()=>{if(camera){camera.position.copy(camHome);camera.updateMatrixWorld();info('已经回到最初的窗边。');}};
function anchorPanel(panel,object){if(!object||!camera)return;const v=object.getWorldPosition(new T.Vector3());v.y+=1;v.project(camera);const w=panel.offsetWidth||340,h=panel.offsetHeight||240;panel.style.left=Math.max(16,Math.min(innerWidth-w-16,(v.x*.5+.5)*innerWidth+35))+'px';panel.style.top=Math.max(24,Math.min(innerHeight-h-24,(-v.y*.5+.5)*innerHeight-h*.25))+'px';}
function toggleSeeds(){const w=$('#seed-window');w.hidden=!w.hidden;$('#help-window').hidden=true;$('#hover-label').hidden=true;if(!w.hidden)anchorPanel(w,garden?.getObjectByName('Interact_Handheld'));}
for(const id of ['desktop-seeds','menu-seeds','open-seeds','start'])$('#'+id).onclick=toggleSeeds;$('#close-seeds').onclick=()=>$('#seed-window').hidden=true;
for(const id of ['desktop-help','menu-help'])$('#'+id).onclick=()=>{$('#help-window').hidden=!$('#help-window').hidden;$('#seed-window').hidden=true;};$('#close-help').onclick=()=>$('#help-window').hidden=true;
for(const b of document.querySelectorAll('[data-pick]'))b.onclick=()=>{choose(b.dataset.pick);$('#seed-window').hidden=true;};
for(const id of ['desktop-garden','task-garden'])$('#'+id).onclick=()=>{$('#seed-window').hidden=$('#help-window').hidden=true;$('.app-window').scrollIntoView({behavior:'smooth',block:'start'});};
function photo(){if(!ready)return;renderer.render(scene,camera);const a=document.createElement('a');a.download='my-little-garden.png';a.href=renderer.domElement.toDataURL('image/png');a.click();$('#photo-flash').classList.remove('on');void $('#photo-flash').offsetWidth;$('#photo-flash').classList.add('on');info('花园照片已保存，留住这一刻的小小快乐。');}$('#desktop-photo').onclick=photo;
$('#panel-seeds').onclick=toggleSeeds;$('#panel-photo').onclick=photo;
addEventListener('keydown',e=>{if(e.key==='Escape'){$('#seed-window').hidden=$('#help-window').hidden=true;finishDrag();}});
function updateClock(){$('#clock').textContent=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});}updateClock();setInterval(updateClock,30000);
function aim(e){const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);}
function ancestor(o,prefix){for(let p=o;p;p=p.parent)if(p.name.startsWith(prefix))return p;return null;}
function pick(){return ray.intersectObjects(garden.children,true).find(h=>visible(h.object)&&!h.object.name.startsWith('PlantingZone_')&&!ancestor(h.object,'PreviewGrow_')&&!ancestor(h.object,'WaterDrop_'));}
let down=null,drag=null;
function beginDrag(e){if(demo)resetDemo();returning=false;const normal=camera.getWorldDirection(new T.Vector3());const point=can.getWorldPosition(new T.Vector3());const plane=new T.Plane().setFromNormalAndCoplanarPoint(normal,point);const hit=ray.ray.intersectPlane(plane,new T.Vector3());drag={plane,offset:point.clone().sub(hit||point),target:null,x:e.clientX,y:e.clientY};can.position.y+=.18;$('#drag-hint').hidden=false;host.style.cursor='grabbing';info('把壶嘴移到花朵上方，出现圆环后停留浇水。');
 // Water-tool alternative: press and hold a plant to pour at that exact location.
 if(tool==='water'){
  const soilHit=ray.intersectObjects(targets,true)[0];let p=null;
  if(soilHit)p=plants.filter(p=>!p.watered).sort((a,b)=>a.root.position.distanceTo(soilHit.point)-b.root.position.distanceTo(soilHit.point))[0];
  if(p&&p.root.position.distanceTo(soilHit.point)>=.65)p=null;
  if(!p){const rect=host.getBoundingClientRect();let best=85;for(const candidate of plants){if(candidate.watered)continue;const v=candidate.root.position.clone();v.y+=.35;v.project(camera);const dx=(v.x-pointer.x)*rect.width/2,dy=(v.y-pointer.y)*rect.height/2;const d=Math.hypot(dx,dy);if(d<best){best=d;p=candidate}}}
  if(p){
   can.quaternion.copy(canQuat).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),.57));
   const currentMouth=mouth.getWorldPosition(new T.Vector3()),wanted=p.root.position.clone();wanted.y+=.95;
   can.position.add(wanted.sub(currentMouth));drag.target=p;ring.position.copy(p.root.position);ring.position.y=.867;ring.visible=true;
  }
 }
}
function moveDrag(e){if(drag.released)return;aim(e);const hit=ray.ray.intersectPlane(drag.plane,new T.Vector3());if(hit){hit.add(drag.offset);can.position.set(T.MathUtils.clamp(hit.x,-4.8,5.1),T.MathUtils.clamp(hit.y+.22,1.3,3.4),hit.z);}
 // Align the nozzle with nearby plant positions in screen space.
 const mouthPos=mouth.getWorldPosition(new T.Vector3()).project(camera),rect=host.getBoundingClientRect();let best=null,dist=Infinity;
 for(const p of plants){if(p.watered)continue;const pos=p.root.position.clone();pos.y+=.35;pos.project(camera);const dx=(pos.x-mouthPos.x)*rect.width/2,dy=(pos.y-mouthPos.y)*rect.height/2;const d=Math.hypot(dx,dy*.3);if(d<dist&&Math.abs(dx)<85&&dy<170&&dy> -200){dist=d;best=p;}}
 drag.target=best;if(best){ring.visible=true;ring.position.copy(best.root.position);ring.position.y=.867;}else ring.visible=false;
}
function finishDrag(){if(!drag)return;const p=drag.target;drag=null;returning=true;ring.visible=false;$('#drag-hint').hidden=tool!=='water';host.style.cursor='default';info(p?.watered?'浇好啦，花正在慢慢开放。':'水壶已放回。拖到花朵上方，停留到浇水完成。');}
host.addEventListener('pointerdown',e=>{if(!ready||reward.active||e.button!==0)return;host.setPointerCapture(e.pointerId);aim(e);const h=pick();if(!musicStarted&&!ancestor(h?.object,'Interact_CDPlayer')){musicStarted=true;ambientMusic.toggle().catch(()=>{});}life?.interact('touch');down={x:e.clientX,y:e.clientY};if(ancestor(h?.object,'Interact_WateringCan')||tool==='water')beginDrag(e);});
host.addEventListener('pointermove',e=>{if(!ready)return;if(drag){$('#hover-label').hidden=true;moveDrag(e);return;}aim(e);const h=pick(),obj=ancestor(h?.object,'Interact_'),tip=$('#hover-label');const texts={Interact_Handheld:'选择花种',Interact_WateringCan:'按住拖动浇水',Interact_Camera:'保存花园照片',Interact_CRT:'查看花园记录',Interact_CDPlayer:'播放 / 暂停轻音乐'};const soil=ray.intersectObjects(targets,true).length;const text=texts[obj?.name]||(soil?'种下'+labels[species]:'');host.style.cursor=obj?.name==='Interact_WateringCan'?'grab':text?'pointer':'default';tip.hidden=!text;if(text){tip.textContent=text;tip.style.left=Math.min(innerWidth-170,e.clientX+16)+'px';tip.style.top=Math.max(12,e.clientY-36)+'px';}});
host.addEventListener('pointerleave',()=>$('#hover-label').hidden=true);
host.addEventListener('pointerup',e=>{if(!ready)return;if(drag){if(tool==='water'&&drag.target&&!drag.target.watered&&down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<7){drag.released=true;down=null;return;}finishDrag();down=null;return;}if(!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y)>7;down=null;if(moved)return;if(demo)resetDemo();aim(e);const h=pick();if(ancestor(h?.object,'Interact_Handheld')){life?.interact('device');toggleSeeds();return}if(ancestor(h?.object,'Interact_CDPlayer')){musicStarted=true;ambientMusic.toggle().then(on=>info(on?'轻音乐已开启 · 点击 CD 播放器暂停':'音乐已暂停'));return}if(ancestor(h?.object,'Interact_Camera')){photo();return}if(ancestor(h?.object,'Interact_CRT')){life?.interact('device');$('#help-window').hidden=false;$('#seed-window').hidden=true;anchorPanel($('#help-window'),garden.getObjectByName('Interact_CRT'));return}
 if(!$('#seed-window').hidden||!$('#help-window').hidden){$('#seed-window').hidden=$('#help-window').hidden=true;return;}
 const hit=ray.intersectObjects(targets,true)[0];if(!hit){info('点击花槽上方的泥土种花；按住右侧水壶拖动浇水。');return;}if(plants.length>=12){info('花槽已种满 12 株，撤回一株再试试。');return;}if(records.some(r=>Math.hypot(r.x-hit.point.x,r.z-hit.point.z)<.3)){info('这里已经有花，给它留一点生长空间吧。');return;}spawn({type:species,x:hit.point.x,z:hit.point.z,grown:false});info('种下'+labels[species]+'。现在可以拖动水壶，为它浇水。');});
host.addEventListener('pointercancel',()=>{finishDrag();down=null;});host.addEventListener('lostpointercapture',()=>{if(!drag?.released)finishDrag();down=null;});addEventListener('blur',()=>{finishDrag();down=null;});
const cottage=cottageReward(scene);
const reward=completionReward({stage:cottage,onOpen(){finishDrag();$('#help-window').hidden=$('#seed-window').hidden=true;ambientMusic.duck(true);},onClose(state){ambientMusic.duck(false);if(state.unlocked&&isGardenComplete(plants))cottage.reveal().catch(()=>info('小屋模型暂时没加载成功，请稍后重试奖励预览。'));},info});
$('#preview-reward').onclick=()=>reward.open();
const clock=new T.Clock();let elapsed=0,ticks=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;if(!ready)return;
 if(cloudMaterial&&!reducedMotion)cloudMaterial.uniforms.offset.value=(cloudMaterial.uniforms.offset.value+dt*.003)%1;
 if(demo){if(playing){demoTime=Math.min(9.95,demoTime+dt);if(demoTime>=9.95)playing=false;}demoMixer.setTime(demoTime);$('#timeline').value=demoTime;$('#time').textContent=demoTime.toFixed(1)+'s';}
 else{
  plants.forEach(p=>{p.age=Math.min(p.watered?7.5:3.2,p.age+dt*3);if(!applyPlantGrowth(p.root,p.age))p.mixer.setTime(p.age)});
  if(drag){const tilt=canQuat.clone().multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),.57));can.quaternion.slerp(tilt,1-Math.exp(-dt*20));const p=drag.target;
   if(p){ring.material.opacity=.6+.2*Math.sin(elapsed*5);}
    }else if(returning){can.position.lerp(canHome,.13);can.quaternion.slerp(canQuat,.13);if(can.position.distanceTo(canHome)<.005){can.position.copy(canHome);can.quaternion.copy(canQuat);returning=false;}}
 }
 const nozzle=mouth.getWorldPosition(new T.Vector3());fx.update(dt,elapsed,nozzle,!!drag,plants);
 plants.forEach(p=>{if(!p.watered&&p.moisture>=1){p.watered=true;p.record.grown=true;p.age=Math.max(4.6,p.age);save();info(labels[p.record.type]+'喝饱水啦，正在开花。');}p.impulse*=Math.exp(-dt*7);p.root.rotation.z=(p.phase-.5)*.07+Math.sin(elapsed*8)*p.impulse;});
 cottage.setVisible(isGardenComplete(plants));if(reward.unlocked&&isGardenComplete(plants)&&!reward.active)cottage.reveal().catch(()=>{});reward.check(plants,!drag&&!returning&&!demo);life?.update(dt,elapsed,{pouring:!!drag,count:plants.length});cottage.night(life?.nightness||0);renderer.render(scene,camera);if(++ticks%60===0)$('#metrics').textContent=plants.filter(p=>p.watered).length+' 朵花开 · 自动保存';
}
animate();
try{
 const [gltf,panorama]=await Promise.all([new GLTFLoader().loadAsync('./assets/garden.glb?v=4',e=>{const pct=Math.min(100,Math.round(e.loaded/(e.total||3750484)*100));$('#load-text').textContent='正在加载花园… '+pct+'%';$('#load-progress').style.width=pct+'%';}),new T.TextureLoader().loadAsync('./assets/cloud-panorama.jpg')]);cloudMap=panorama;cloudMap.flipY=false;cloudMap.colorSpace=T.SRGBColorSpace;cloudMap.wrapS=T.RepeatWrapping;garden=gltf.scene;materialPass(garden);scene.add(garden);camera=gltf.cameras[0];camHome=camera.position.clone();can=garden.getObjectByName('Interact_WateringCan');
 garden.traverse(o=>{if(o.name.startsWith('PlantingZone_')){targets.push(o);o.visible=false}if(o.name.startsWith('PreviewGrow_')){previewRoots.push(o);o.visible=false}if(o.name.startsWith('WaterDrop_')){originalDrops.push(o);o.visible=false}});
 demoMixer=new T.AnimationMixer(garden);gltf.animations.forEach(c=>{const a=demoMixer.clipAction(c);a.setLoop(T.LoopOnce);a.clampWhenFinished=true;a.play();demoActions.push(a)});demoMixer.setTime(0);canHome=can.position.clone();canQuat=can.quaternion.clone();
 const nozzleCandidates=[];can.traverse(o=>{if(o.isMesh){const b=new T.Box3().setFromObject(o);nozzleCandidates.push({o,box:b});}});
 // Export combines fixed mesh parts: use a local point transformed with the can for its nozzle.
 const canInverse=new T.Matrix4().copy(can.matrixWorld).invert();const originalNozzle=new T.Vector3(3.87,1.75,-.15);mouth=new T.Object3D();mouth.name='LiveWaterNozzle';mouth.position.copy(originalNozzle.applyMatrix4(canInverse));can.add(mouth);
 for(const type of ['daisy','cosmos','lavender']){const source=garden.getObjectByName('PreviewGrow_'+type),clone=source.clone(true);clone.position.set(0,0,0);clone.visible=true;const names=new Set();source.traverse(o=>names.add(o.name));const tracks=gltf.animations.flatMap(c=>c.tracks).filter(t=>names.has(t.name.slice(0,t.name.lastIndexOf('.'))));const wrapper=new T.Group();wrapper.add(clone);templates[type]={scene:wrapper,animations:[new T.AnimationClip('Grow_'+type,-1,tracks)]};}
 await loadBotanicalTemplates();
 try{const data=JSON.parse(localStorage.getItem('little-garden-window-v1'));if(Array.isArray(data)&&data.length>12&&!localStorage.getItem('little-garden-original-24-backup'))localStorage.setItem('little-garden-original-24-backup',JSON.stringify(data));if(Array.isArray(data))for(const r of data.slice(0,12)){if(templates[r.type]&&Number.isFinite(r.x)&&Number.isFinite(r.z)&&r.x>=-4.4&&r.x<=3.9&&r.z>=-1.2&&r.z<=-.4){records.push(r);spawn(r,false)}}}catch{}
 life=await gardenLife({scene,garden,sun,fill,sky:cloudMaterial,reducedMotion});fx.installCurtains(await new GLTFLoader().loadAsync('./assets/voile.glb'));fx.startEntrance();if(reward.unlocked&&isGardenComplete(plants))cottage.reveal().catch(()=>{});
 document.querySelectorAll('main button,main input').forEach(el=>el.disabled=false);ready=true;save();resize();$('#loading').hidden=true;info('选择花种点击泥土；按住右侧水壶，拖到花朵上方浇水。');
}catch(e){console.error(e);$('#load-text').textContent='花园暂时没打开：'+e.message;info('请确认本地预览服务已启动。');}


$('#cycle-light').onclick=()=>info('光线：'+life.cycle());
$('#ambient-sound').onclick=()=>{const on=life.toggleSound();$('#ambient-sound').textContent=on?'环境音：开':'环境音：关';};
$('#replay-entry').onclick=()=>{$('#help-window').hidden=true;fx.startEntrance();};

async function loadBotanicalTemplates(){const g=await new GLTFLoader().loadAsync('./assets/botanical-flowers.glb');const mats=new Map();g.scene.traverse(o=>{if(o.isMesh){const convert=m=>{if(!mats.has(m.uuid))mats.set(m.uuid,new T.MeshStandardMaterial({color:m.color,roughness:.64,side:T.DoubleSide}));return mats.get(m.uuid);};o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);o.castShadow=o.receiveShadow=true;}});for(const type of Object.keys(labels)){const source=g.scene.getObjectByName('Flower_'+type);if(!source)throw Error('缺少花朵模型 '+type);const model=source.clone(true);model.name='GrowthStem';const wrapper=new T.Group();wrapper.add(model);templates[type]={scene:wrapper,animations:[]};}}
