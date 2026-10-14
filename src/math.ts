export const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const mod=(n:number,m:number)=>((n%m)+m)%m;
export const angle=(n:number)=>mod(n+Math.PI,Math.PI*2)-Math.PI;
export interface Vec {x:number;z:number}
export const distance=(a:Vec,b:Vec)=>Math.hypot(a.x-b.x,a.z-b.z);
export function rng(seed:number) {return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
