// Absolute age sampling stays stable when a completed plant is rendered repeatedly.
export function growthScale(age){
 const a=Math.max(0,Math.min(7.5,Number.isFinite(age)?age:0));
 const keys=[[0,.08,.08],[3.2,.45,.34],[4.6,.65,.55],[7.5,1,1]];
 for(let i=1;i<keys.length;i++)if(a<=keys[i][0]){const p=keys[i-1],q=keys[i],t=(a-p[0])/(q[0]-p[0]);return [p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t,p[1]+(q[1]-p[1])*t];}
 return [1,1,1];
}
export function applyPlantGrowth(root,age){const stem=root.getObjectByName('GrowthStem');if(!stem)return false;stem.scale.set(...growthScale(age));return true;}
