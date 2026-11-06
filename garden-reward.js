export const isGardenComplete=plants=>plants.length===12&&plants.every(p=>p.watered&&p.age>=7.5);
export function completionReward({stage,onOpen,onClose,info}){
 const panel=document.querySelector('#reward-scene'),play=panel.querySelector('[data-reward-play]'),close=panel.querySelector('[data-reward-close]');panel.classList.add('realtime');const audio=new Audio('./assets/reward-piano.wav');audio.preload='none';audio.volume=.65;
 let active=false,automatic=false,seen=false,focus,run=0;
 try{seen=localStorage.getItem('little-garden-reward-v1')==='seen';}catch{}
 function finish(completed=true){if(!active)return;run++;stage.cancel();audio.pause();panel.hidden=true;active=false;if(automatic&&completed){seen=true;try{localStorage.setItem('little-garden-reward-v1','seen');}catch{}}onClose({unlocked:seen,preview:!automatic&&completed});focus?.focus();}
 async function open(auto=false){if(active)return;const token=++run;active=true;automatic=auto;focus=document.activeElement;onOpen();panel.hidden=false;play.hidden=true;close.focus();audio.currentTime=0;audio.play().catch(()=>{if(active)play.hidden=false;});try{await stage.play({keep:seen||auto});if(active&&run===token){finish();info(auto?'花园完成了，云上的小屋为你亮起了灯。':'预览结束，种满并浇开 12 朵花后解锁小屋。');}}catch{finish(false);info('小屋暂时没加载成功，请稍后重试。');}}
 play.textContent='开启钢琴声';play.onclick=()=>audio.play().then(()=>play.hidden=true).catch(()=>info('请检查浏览器声音设置。'));close.onclick=()=>finish();panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();finish();}if(e.key==='Tab'){e.preventDefault();const next=!play.hidden&&document.activeElement===close?play:close;next.focus();}});
 return {get active(){return active;},get unlocked(){return seen;},open:()=>open(false),check(plants,idle){if(!seen&&!active&&idle&&isGardenComplete(plants))open(true);}};
}
