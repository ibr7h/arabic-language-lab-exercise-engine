export class PlatformAdapter {
  constructor(profile={}) {
    this.profile={...profile};
    this.id=profile.id||'desktop';
    this.minTarget=(this.id==='ios'||this.id==='android')?44:36;
    this.moveStep=this.id==='webos'?18:12;
  }
  actionForKey(key) {
    const step=this.moveStep;
    if(key==='ArrowRight') return {type:'move',dx:step,dy:0};
    if(key==='ArrowLeft') return {type:'move',dx:-step,dy:0};
    if(key==='ArrowUp') return {type:'move',dx:0,dy:-step};
    if(key==='ArrowDown') return {type:'move',dx:0,dy:step};
    if(key==='Enter'||key===' ') return {type:'activate'};
    if(key==='Delete'||key==='Backspace') return {type:'delete'};
    return null;
  }
  describe() {
    if(this.id==='webos') return 'ريموت/D-pad + OK + تركيز مرئي';
    if(this.id==='ios') return 'لمس iOS + ضغط مطوّل + منطقة لمس 44px';
    if(this.id==='android') return 'لمس Android + منطقة لمس 44px';
    return 'فأرة + لوحة مفاتيح';
  }
}
export function createPlatformAdapter(profile){ return new PlatformAdapter(profile); }
