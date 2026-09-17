import { WordExerciseEngine } from './exercise-engine.js';

export class PhraseExerciseEngine extends WordExerciseEngine {
  phraseUnits(text) {
    const clean=this.sanitizeWord(text);
    if(!clean) return [];
    const words=clean.split(' ');
    const units=[];
    words.forEach((word,index)=>{
      if(index>0) units.push(' ');
      units.push(...this.ArabicText.letterUnits(word));
    });
    return units;
  }

  unitKey(unit, includeHarakat=true) {
    if (unit === ' ') return '␠';
    return super.unitKey(unit, includeHarakat);
  }

  create(phrase, options={}) {
    const clean=this.sanitizeWord(phrase);
    const targetUnits=this.phraseUnits(clean);
    const letters=targetUnits.filter(unit=>unit!==' ');
    if(!letters.length) throw new Error('NO_ARABIC_LETTERS');
    const settings={
      includeHarakat: options.includeHarakat !== false,
      contextualShapes: Boolean(options.contextualShapes),
      showTarget: options.showTarget !== false,
      autoCheck: Boolean(options.autoCheck)
    };
    return {
      id:`phrase_${++this.counter}_${Date.now()}`,
      kind:'phrase',
      targetWord:clean,
      targetUnits,
      targetKeys:targetUnits.map(unit=>this.unitKey(unit,settings.includeHarakat)),
      settings,
      status:'active',
      attempts:0,
      createdAt:Date.now()
    };
  }
}
