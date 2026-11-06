import {GLTFLoader} from './vendor/GLTFLoader.js';
import * as T from 'three';

// All motion is expressed in seconds so a slow frame does not speed it up.
export async function gardenLife({scene,garden,sun,fill,sky,reducedMotion}){
 const loader=new T.TextureLoader();
 const [night,pet,film]=await Promise.all(['night-sky.jpg','cloud-pet.png','curtain-film.jpg'].map(n=>loader.loadAsync('./assets/'+n)));
 for(const t of [night,pet,film])t.colorSpace=T.SRGBColorSpace;
 night.flipY=false;night.wrapS=T.RepeatWrapping;
 sky.uniforms.night.value=night;
 const image=pet.image,hemi=scene.children.find(o=>o.isHemisphereLight);
 let time=0,nightness=0,manual=null,happyUntil=0,lastFrame=-1,lastNoise=-10,lastCount=0,wasPouring=false;
 const audio=atmosphereAudio();
 function collect(re){const a=[];garden.traverse(o=>{if(re.test(o.name.replaceAll('_',' ')))a.push(o)});return a;}
 function pivot(items){const group=new T.Group(),box=new T.Box3();items.forEach(o=>box.union(new T.Box3().setFromObject(o)));group.position.copy(box.getCenter(new T.Vector3()));scene.add(group);items.forEach(o=>group.attach(o));return group;}
 garden.updateMatrixWorld(true);
 const bubbles=collect(/^Soap bubble/).map((o,i)=>{const suffix=o.name.replaceAll('_',' ').slice('Soap bubble'.length),parts=[o,...collect(new RegExp('^Bubble (lavender rim|highlight)'+suffix.replace('.','\\.')+'$'))];const group=pivot(parts);return {group,home:group.position.clone(),phase:i*1.7};});
 const star=collect(/^Silver wishing star$/)[0],starGroup=star?pivot([star]):null;
 const wings=collect(/^Butterfly wing/);
 const butterflies=collect(/^Butterfly body/).map((body,i)=>{const center=new T.Box3().setFromObject(body).getCenter(new T.Vector3());const near=wings.filter(w=>new T.Box3().setFromObject(w).getCenter(new T.Vector3()).distanceTo(center)<.65);const group=pivot([body,...near]);return {group,home:group.position.clone(),wings:near.map(w=>({pivot:pivotWing(w,group),sign:new T.Box3().setFromObject(w).getCenter(new T.Vector3()).x<center.x?-1:1})),phase:i*2.1};});
 function pivotWing(w,parent){const g=new T.Group();g.position.copy(new T.Box3().setFromObject(w).getCenter(new T.Vector3()));scene.add(g);g.attach(w);parent.attach(g);return g;}

 // Actual Blender grass and branching leaves replace the old spherical border.
 const meadow=await new GLTFLoader().loadAsync('./assets/meadow.glb');const grass=[];const materials=new Map();meadow.scene.name='BlenderMeadow';meadow.scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;const convert=m=>{if(!materials.has(m.uuid))materials.set(m.uuid,new T.MeshStandardMaterial({color:m.color.clone().multiplyScalar(.48),roughness:.84,side:T.DoubleSide}));return materials.get(m.uuid);};o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);grass.push(o);});scene.add(meadow.scene);

 const sparkleGeo=new T.PlaneGeometry(.12,.12),sparkles=[];
 const starCanvas=document.createElement('canvas');starCanvas.width=starCanvas.height=64;const sc=starCanvas.getContext('2d');const grad=sc.createRadialGradient(32,32,0,32,32,30);grad.addColorStop(0,'white');grad.addColorStop(.2,'#e8dcff');grad.addColorStop(1,'transparent');sc.fillStyle=grad;sc.beginPath();sc.moveTo(32,0);sc.quadraticCurveTo(35,29,64,32);sc.quadraticCurveTo(35,35,32,64);sc.quadraticCurveTo(29,35,0,32);sc.quadraticCurveTo(29,29,32,0);sc.fill();const smap=new T.CanvasTexture(starCanvas);
 for(let i=0;i<14;i++){const m=new T.MeshBasicMaterial({map:smap,transparent:true,depthWrite:false,toneMapped:false});const o=new T.Mesh(sparkleGeo,m);o.position.set(-4.6+(i*1.371%9.1),2.1+(i*.731%3.2),-.4);scene.add(o);sparkles.push(o);}
 // The material atlas contributes its silk grain to the actual curtain mesh.
 const curtainMap=film.clone();curtainMap.repeat.set(.5,1);curtainMap.needsUpdate=true;
 const curtains=scene.children.filter(o=>o.userData.curtain);for(const o of curtains){o.material.map=curtainMap;o.material.needsUpdate=true;}
 collect(/Silver wishing star|Bubble lavender rim/).forEach(o=>{if(o.material?.isMeshPhysicalMaterial){o.material.iridescence=1;o.material.iridescenceThicknessRange=[180,480];}});

 const screens=[];
 function canvasScreen(target,kind){if(!target)return;const canvas=document.createElement('canvas');canvas.width=kind==='crt'?512:256;canvas.height=kind==='crt'?384:256;const ctx=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.minFilter=T.LinearFilter;
  const mat=new T.MeshBasicMaterial({map:texture,toneMapped:false});
  if(kind==='crt'){texture.flipY=false;target.material=mat;}
  else{target.geometry.computeBoundingBox();const b=target.geometry.boundingBox,size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());const plane=new T.Mesh(new T.PlaneGeometry(size.x*.95,size.y*.95),mat);plane.position.set(center.x,center.y,b.max.z+.10);target.add(plane);}
  screens.push({canvas,ctx,texture,kind,material:mat});
 }
 canvasScreen(garden.getObjectByName('CRT_Page_Surface'),'crt');
 canvasScreen(collect(/^Lavender handheld LCD$/)[0],'pet');
 canvasScreen(collect(/^Pink pager LCD$/)[0],'pager');
 function drawScreen(s,frame,staticOn){const {canvas:c,ctx:g,kind}=s,w=c.width,h=c.height;g.imageSmoothingEnabled=false;
  g.fillStyle=kind==='pet'?'#a8c2b0':kind==='pager'?'#d8c6de':'#b7cad9';g.fillRect(0,0,w,h);g.fillStyle='#526b79';g.fillRect(10,10,w-20,kind==='crt'?30:18);g.fillStyle='#f0f7f1';g.font=kind==='crt'?'16px monospace':'12px monospace';g.fillText(kind==='crt'?'little garden / home':kind==='pet'?'CLOUD BUNNY':'GARDEN MAIL',18,kind==='crt'?31:24);
  if(kind==='crt'){g.fillStyle='#f0f3e9';g.fillRect(25,61,w-50,h-95);g.fillStyle='#718d8a';g.font='24px Georgia';g.fillText(nightness>.5?'Good night, garden.':'A little room to grow.',46,108);g.font='14px monospace';g.fillText(`${lastCount} little seeds / ${nightness>.5?'moonlight':'daylight'}`,46,141);g.fillStyle='#cadbd0';g.fillRect(46,166,220,128);g.fillStyle='#6d9681';for(let i=0;i<5;i++){const x=70+i*40;g.fillRect(x,220,3,55);g.fillStyle=['#d8b6db','#f3dfad','#b6c5eb'][i%3];g.beginPath();g.arc(x+1,212+Math.sin(time+i)*2,13,0,7);g.fill();g.fillStyle='#6d9681';}}
  else if(kind==='pager'){g.fillStyle='#675878';g.font='16px monospace';g.fillText(nightness>.5?'SWEET DREAMS':'YOU HAVE MAIL',26,77);g.font='13px monospace';g.fillText('a tiny hello',28,111);g.fillText('from your garden',28,132);}
  const cellW=image.width/4,cellH=image.height/2;const n=nightness>.6?4+(frame%2):time<happyUntil?2+(frame%2):Math.floor(time)%12>9?6+(frame%2):frame%2;
  const dw=kind==='crt'?130:kind==='pager'?100:180,x=kind==='crt'?320:kind==='pager'?80:38,y=kind==='crt'?186:kind==='pager'?148:48;
  g.drawImage(image,(n%4)*cellW,Math.floor(n/4)*cellH,cellW,cellH,x,y,dw,dw);
  g.fillStyle='rgba(20,40,45,.055)';for(let y=0;y<h;y+=4)g.fillRect(0,y,w,1);
  if(staticOn){for(let i=0;i<140;i++){const v=Math.random()*255|0;g.fillStyle=`rgba(${v},${v},${v},.25)`;g.fillRect(Math.random()*w,Math.random()*h,4+Math.random()*30,2);}g.fillStyle='rgba(245,255,255,.13)';g.fillRect(0,((time*145)%h),w,7);}
  s.material.color.setScalar(1-nightness*.15);s.texture.needsUpdate=true;
 }
 function interact(kind){happyUntil=time+4;audio.start();if(kind==='device'){lastNoise=time;audio.crackle();}}
 function cycle(){manual=manual===null?1:manual===1?0:manual===0?.45:null;return manual===null?'自动昼夜':manual===1?'夜晚':manual===0?'白天':'黄昏';}
 function update(dt,t,{pouring=false,count=0}={}){time+=dt;if(!reducedMotion)grass.forEach((o,i)=>{o.rotation.z=.025*Math.sin(time*1.6+i*.7);});if(pouring&&!wasPouring)happyUntil=time+4;wasPouring=pouring;if(Math.floor(time/37)!==Math.floor((time-dt)/37)){lastNoise=time;audio.crackle();}if(count!==lastCount){happyUntil=time+4;lastCount=count;}
  const target=manual??(reducedMotion?0:(1-Math.cos(time/240*Math.PI*2))*.5);nightness=T.MathUtils.damp(nightness,target,1.2,dt);sky.uniforms.nightMix.value=nightness;
  sun.intensity=T.MathUtils.lerp(2.5,.30,nightness);sun.color.setRGB(1,.97-nightness*.18,.94);fill.intensity=T.MathUtils.lerp(.72,.40,nightness);if(hemi)hemi.intensity=T.MathUtils.lerp(.72,.34,nightness);scene.environmentIntensity=1-nightness*.6;
  if(!reducedMotion){bubbles.forEach(({group,home,phase})=>{group.position.set(home.x+Math.sin(time*.32+phase)*.14,home.y+((time*.065+phase*.2)%1.7)-.5,home.z);});if(starGroup)starGroup.rotation.y=Math.sin(time*.35)*.65;butterflies.forEach(({group,home,wings,phase})=>{const moving=Math.sin(time*.13+phase)>.05;group.position.copy(home);if(moving){group.position.x+=Math.sin(time*.4+phase)*.6;group.position.y+=Math.cos(time*.55+phase)*.26;group.position.z+=Math.sin(time*.3+phase)*.12;}wings.forEach(w=>w.pivot.rotation.y=w.sign*Math.sin(time*(moving?12:2.5)+phase)*(moving?.65:.12));});}
  sparkles.forEach((o,i)=>{o.material.opacity=(.12+nightness*.65)*(reducedMotion?.6:Math.max(0,Math.sin(time*.8+i*2.4))**6);o.rotation.z=reducedMotion?0:time*.07;});
  const frame=Math.floor(time*4);if(frame!==lastFrame){lastFrame=frame;screens.forEach(s=>drawScreen(s,frame,time-lastNoise<.2));}
  audio.update(dt,pouring);if(Math.floor(time/19)!==Math.floor((time-dt)/19))audio.chime();
 }
 return {update,interact,cycle,toggleSound:()=>audio.toggle(),get nightness(){return nightness}};
}

function atmosphereAudio(){let ctx,master,water,on=true;
 function start(){if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.gain.value=.22;master.connect(ctx.destination);const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1500;water=ctx.createGain();water.gain.value=0;source.connect(filter);filter.connect(water);water.connect(master);source.start();}ctx.resume().catch(()=>{});}
 function chime(){if(!ctx||!on)return;[1046,1568,2093].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.17;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+2.3);o.connect(g);g.connect(master);o.start(t);o.stop(t+2.4);});}
 function crackle(){if(!ctx||!on)return;const b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.1),ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*5);const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;g.gain.value=.06;s.connect(g);g.connect(master);s.start();}
 return {start,chime,crackle,update(dt,pouring){if(ctx)water.gain.setTargetAtTime(on&&pouring?.14:0,ctx.currentTime,.12);},toggle(){start();on=!on;master.gain.setTargetAtTime(on?.22:0,ctx.currentTime,.2);return on;}};
}
