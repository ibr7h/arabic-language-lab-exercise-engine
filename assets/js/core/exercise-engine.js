export class WordExerciseEngine {
  constructor(ArabicText) {
    this.ArabicText = ArabicText;
    this.counter = 0;
  }

  unitKey(unit, includeHarakat = true) {
    const base = this.ArabicText.base(unit);
    if (!base) return '';
    if (!includeHarakat) return base;
    return `${base}${this.ArabicText.marks(unit).join('')}`;
  }

  sanitizeWord(word) {
    return String(word || '').trim().replace(/\s+/g, ' ');
  }

  create(word, options = {}) {
    const clean = this.sanitizeWord(word);
    const targetUnits = this.ArabicText.letterUnits(clean);
    if (!targetUnits.length) throw new Error('NO_ARABIC_LETTERS');
    const settings = {
      includeHarakat: options.includeHarakat !== false,
      contextualShapes: Boolean(options.contextualShapes),
      showTarget: options.showTarget !== false,
      autoCheck: Boolean(options.autoCheck)
    };
    return {
      id: `exercise_${++this.counter}_${Date.now()}`,
      targetWord: clean,
      targetUnits,
      targetKeys: targetUnits.map(unit => this.unitKey(unit, settings.includeHarakat)),
      settings,
      status: 'active',
      attempts: 0,
      createdAt: Date.now()
    };
  }

  scrambleIndices(length, random = Math.random) {
    const original = Array.from({ length }, (_, i) => i);
    const result = [...original];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    if (length > 1 && result.every((value, index) => value === index)) {
      [result[0], result[1]] = [result[1], result[0]];
    }
    return result;
  }

  compare(exercise, slotUnits) {
    const target = exercise?.targetKeys || [];
    const actual = (slotUnits || []).map(unit => unit == null ? null : this.unitKey(unit, exercise.settings.includeHarakat));
    const correctPositions = target.map((key, index) => actual[index] === key);
    const filled = actual.filter(value => value != null).length;
    const correctCount = correctPositions.filter(Boolean).length;
    return {
      filled,
      total: target.length,
      correctCount,
      correctPositions,
      complete: filled === target.length,
      correct: target.length > 0 && filled === target.length && correctCount === target.length
    };
  }
}
