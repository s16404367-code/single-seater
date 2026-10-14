export class EngineAudio {
  ctx?:AudioContext;osc?:OscillatorNode;gain?:GainNode;muted=false;volume=.16;
  start(){try{if(!this.ctx){this.ctx=new AudioContext();this.osc=this.ctx.createOscillator();this.gain=this.ctx.createGain();const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;this.osc.type='sawtooth';this.osc.connect(filter);filter.connect(this.gain);this.gain.connect(this.ctx.destination);this.gain.gain.value=0;this.osc.start();}void this.ctx.resume().catch(()=>{});}catch{/* Audio is optional; HUD remains usable. */}}
  update(rpm:number,throttle:number,active:boolean){if(!this.ctx||!this.osc||!this.gain)return;this.osc.frequency.setTargetAtTime(rpm/45,this.ctx.currentTime,.07);this.gain.gain.setTargetAtTime(active&&!this.muted?this.volume*(.12+throttle*.22):0,this.ctx.currentTime,.08);}
}
