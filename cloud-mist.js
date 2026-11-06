import * as T from 'three';
export function cloudMist(){
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{opacity:{value:0},time:{value:0},night:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec2 vUv;uniform float opacity;uniform float time;uniform float night;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.55;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(17.3,9.1);a*=.5;}return v;}
 void main(){vec2 p=(vUv-.5)*vec2(2.,2.7);float n=fbm(vUv*vec2(5.,3.)+vec2(time*.025,0.));float envelope=1.-smoothstep(.16,.95,length(p*vec2(.85,1.)));float density=smoothstep(.16,.70,n)*envelope;vec3 light=mix(vec3(.83,.89,.99),vec3(1.),n);light=mix(light,light*vec3(.66,.74,.94),night*.55);gl_FragColor=vec4(light,density*opacity*.82);
 #include <colorspace_fragment>
 }`});
 return new T.Mesh(new T.PlaneGeometry(2.4,1.35),material);
}
