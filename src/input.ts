import {idleInput,type Input} from './physics';
export class Controls {
  keys=new Set<string>();onAction:(key:string)=>void=()=>{};
  constructor(){window.addEventListener('keydown',e=>{if((e.target as HTMLElement).matches('input,select,textarea,button')&&e.code!=='Escape')return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(!e.repeat)this.onAction(e.code);this.keys.add(e.code);});window.addEventListener('keyup',e=>this.keys.delete(e.code));window.addEventListener('blur',()=>this.clear());}
  clear(){this.keys.clear();}
  read():Input {const k=this.keys;return {...idleInput(),throttle:k.has('KeyW')||k.has('ArrowUp')?1:0,brake:k.has('KeyS')||k.has('ArrowDown')?1:0,steer:(k.has('KeyD')||k.has('ArrowRight')?1:0)-(k.has('KeyA')||k.has('ArrowLeft')?1:0),reverse:k.has('KeyX'),ers:k.has('Space')||k.has('ShiftLeft'),drs:k.has('KeyF')};}
}
