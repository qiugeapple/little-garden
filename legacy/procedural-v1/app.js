import * as T from './vendor/three.module.js';
const $=s=>document.querySelector(s), status=$('#status');
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch(e){$('#error').hidden=false;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;$('#scene').append(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,innerWidth/innerHeight,.1,100),world=new T.Group();scene.add(world);
const ambient=new T.HemisphereLight(0xffffff,0x73866d,2.5);scene.add(ambient);const sun=new T.DirectionalLight(0xffefd5,3);sun.position.set(-3,8,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6});sun.shadow.normalBias=.03;scene.add(sun);
const mat=(c)=>new T.MeshStandardMaterial({color:c,roughness:.9});const soilMat=mat('#715642'),leafMat=mat('#668753'),stemMat=mat('#698849');
function mesh(g,m,x=0,y=0,z=0,parent=world){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
mesh(new T.CylinderGeometry(2.7,2.55,.45,64),mat('#ba9d79'),0,-.3,0);
const soil=mesh(new T.CylinderGeometry(2.48,2.48,.13,64),soilMat,0,-.03,0);
const rim=mesh(new T.TorusGeometry(2.55,.115,12,80),mat('#d4b48a'),0,.01,0);rim.rotation.x=Math.PI/2;
const floor=mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.1}),0,-.54,0,scene);floor.rotation.x=-Math.PI/2;
let seed=22;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(let i=0;i<65;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*2.35;let peb=mesh(new T.SphereGeometry(.025+rnd()*.028,6,4),mat(i%2?'#8c7054':'#9e8260'),Math.cos(a)*r,.045,Math.sin(a)*r);peb.scale.y=.35;}
function flower(type,x,z){const g=new T.Group();g.position.set(x,.04,z);world.add(g);const height=type==='lavender'?.85:.55+Math.random()*.25;mesh(new T.CylinderGeometry(.018,.025,height,6),stemMat,0,height/2,0,g);
 for(let n=0;n<2;n++){let l=mesh(new T.SphereGeometry(1,8,6),leafMat,n%2?-.1:.1,height*(.3+n*.22),0,g);l.scale.set(.15,.045,.065);l.rotation.z=n%2?-.5:.5;}
 if(type==='lavender'){for(let i=0;i<7;i++){const a=i*2.4;const b=mesh(new T.SphereGeometry(.075,8,6),mat(i%2?'#b19bcc':'#9580b4'),Math.cos(a)*.04,height-.12+i*.055,Math.sin(a)*.04,g);b.scale.y=1.3;}}
 else{let petals=type==='poppy'?5:9;for(let i=0;i<petals;i++){const a=i/petals*Math.PI*2;let p=mesh(new T.SphereGeometry(1,10,7),mat(type==='poppy'?'#d98773':'#fff3d5'),Math.cos(a)*.105,height,Math.sin(a)*.105,g);p.scale.set(type==='poppy'?.14:.105,.045,type==='poppy'?.10:.055);p.rotation.y=-a;}
 mesh(new T.SphereGeometry(.065,12,8),mat(type==='poppy'?'#66503b':'#deb85d'),0,height+.025,0,g);}
 g.scale.setScalar(.01);return g;}
let records=[],flowers=[],type='daisy',night=false,angle=.55,elevation=.65,distance=10.5,hasSaved=false;
try{const saved=JSON.parse(localStorage.getItem('little-garden-v1'));if(Array.isArray(saved)){hasSaved=true;records=saved.filter(a=>a&&['daisy','poppy','lavender'].includes(a.type)&&Number.isFinite(a.x)&&Number.isFinite(a.z)&&Math.hypot(a.x,a.z)<2.25).slice(0,24);}}catch{}
if(!hasSaved)records=[{type:'daisy',x:-.6,z:.2},{type:'poppy',x:.2,z:-.3},{type:'lavender',x:.8,z:.45}];
records.forEach(a=>flowers.push(flower(a.type,a.x,a.z)));
function update(){ $('#count').textContent=records.length;$('#undo').disabled=!records.length;try{localStorage.setItem('little-garden-v1',JSON.stringify(records));}catch{} }update();
document.querySelectorAll('.seed').forEach(b=>b.onclick=()=>{type=b.dataset.type;document.querySelectorAll('.seed').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});status.textContent='已选'+b.textContent.trim()+' · 点击泥土种下它';});
function removeLast(){if(!flowers.length)return;const o=flowers.pop();world.remove(o);o.traverse(c=>{if(c.isMesh){c.geometry.dispose();}});records.pop();update();}
$('#undo').onclick=()=>{removeLast();status.textContent='退回一步，也可以重新开始。';};
$('#reset').onclick=()=>{if(!records.length)return;if(!confirm('清空花园，重新种植吗？'))return;while(flowers.length)removeLast();status.textContent='一块新的泥土，等你种下第一朵花。';};
$('#night').onclick=()=>{night=!night;document.body.classList.toggle('night',night);$('#night').textContent=night?'☀ 切换白天':'☾ 切换夜晚';$('#night').setAttribute('aria-pressed',String(night));ambient.intensity=night?.8:2.5;sun.intensity=night?1:3;sun.color.set(night?'#c0d4ff':'#ffefd5');};
const ray=new T.Raycaster(),pointer=new T.Vector2(),pointers=new Map();let start=null,last=null,moved=false,pinch=0;
renderer.domElement.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});renderer.domElement.setPointerCapture(e.pointerId);if(pointers.size===1){start={x:e.clientX,y:e.clientY};last=start;moved=false;}else moved=true;});
renderer.domElement.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)distance=T.MathUtils.clamp(distance+(pinch-d)*.025,7,17);pinch=d;moved=true;return;}if(last){const dx=e.clientX-last.x,dy=e.clientY-last.y;angle-=dx*.008;elevation=T.MathUtils.clamp(elevation+dy*.004,.25,1.15);if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>7)moved=true;last={x:e.clientX,y:e.clientY};}});
function release(e){pointers.delete(e.pointerId);pinch=0;last=null;if(e.type==='pointercancel'||moved||!start)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(soil)[0];if(!hit)return;const local=world.worldToLocal(hit.point.clone());if(Math.hypot(local.x,local.z)>2.2){status.textContent='往泥土中间一点，给花留点空间。';return;}if(records.length>=24){status.textContent='花园已经盛满 24 朵花啦。可以撤回一朵再种。';return;}if(records.some(a=>Math.hypot(a.x-local.x,a.z-local.z)<.28)){status.textContent='这里有花啦，换一个空位置吧。';return;}records.push({type,x:local.x,z:local.z});flowers.push(flower(type,local.x,local.z));update();status.textContent=records.length===24?'24 朵花，今天的小花园完成了。':'又一朵小小的快乐，正在生长。';}
renderer.domElement.addEventListener('pointerup',release);renderer.domElement.addEventListener('pointercancel',release);renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=T.MathUtils.clamp(distance+e.deltaY*.008,7,17);},{passive:false});
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function animate(t){requestAnimationFrame(animate);world.position.set(innerWidth>700?1.1:0,innerWidth>700?0:-.7,0);camera.position.set(Math.sin(angle)*Math.cos(elevation)*distance,Math.sin(elevation)*distance,Math.cos(angle)*Math.cos(elevation)*distance);camera.lookAt(0,0,0);camera.setViewOffset(innerWidth,innerHeight,innerWidth>700?-innerWidth*.06:0,innerWidth>700?0:-innerHeight*.04,innerWidth,innerHeight);flowers.forEach((f,i)=>{f.scale.lerp(new T.Vector3(1,1,1),.09);if(!reduced)f.rotation.z=Math.sin(t*.001+i)*.018;});renderer.render(scene,camera);}requestAnimationFrame(animate);
