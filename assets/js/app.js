import { SoundEngine } from './core/sound-engine.js';
import { ArabicText } from './core/arabic-text.js';
import { confetti } from './core/confetti-lite.js';
import { WordExerciseEngine } from './core/exercise-engine.js';
import { PhraseExerciseEngine } from './core/phrase-exercise-engine.js';
import { detectPlatformProfile } from './core/platform-profile.js';
import { createPlatformAdapter } from './core/platform-adapter.js';
import { BOARD_CAPABILITIES, pieceCan, createHarakaPiece as createCanonicalHarakaPiece, createSpacePiece as createCanonicalSpacePiece, createLigaturePiece as createCanonicalLigaturePiece, fromLegacyLetterPiece } from './core/board-piece.js';
import { ArabicIdentity } from './core/arabic-identity.js';
import { createLamAlifLigature, mergeLamAlifUnits, composeLigatureText } from './core/ligature-engine.js';
import { renderAttachedHaraka, renderShaddaKasraStack, renderFreeHaraka } from './core/harakat-renderer.js';
import { BoardState, saveBoardState, loadBoardState } from './core/board-state.js';
import { BoardHistory } from './core/board-history.js';
import { BOARD_COMMANDS, applyBoardCommand } from './core/board-commands.js';
import { decorateBoardPieceElement } from './ui/board-piece-view.js';

/* ====================================================================
       Sound System (Tactile Magnetic Clicks + Web Speech API for Arabic)
       ==================================================================== */
    /* Comprehensive Database of all 28 Arabic Letters with their 4 Shapes */
    const ALL_ARABIC_LETTERS_DATA = [
      { char: 'م', name: 'ميم', init: 'مـ', med: 'ـمـ', fin: 'ـم', iso: 'م', exInit: 'مَلْعَب', exMed: 'شَمْس', exFin: 'قَلَم', exIso: 'نُجُوم' },
      { char: 'ح', name: 'حاء', init: 'حـ', med: 'ـحـ', fin: 'ـح', iso: 'ح', exInit: 'حَبْل', exMed: 'بَحْر', exFin: 'قَمْح', exIso: 'تُفَّاح' },
      { char: 'ا', name: 'ألف', init: 'ا', med: 'ـا', fin: 'ـا', iso: 'ا', exInit: 'اِبْن', exMed: 'سَائِل', exFin: 'عَصَا', exIso: 'هَذَا' },
      { char: 'ج', name: 'جيم', init: 'جـ', med: 'ـجـ', fin: 'ـج', iso: 'ج', exInit: 'جَمَل', exMed: 'نَجْم', exFin: 'ثَلْج', exIso: 'دُرْج' },
      { char: 'ص', name: 'صاد', init: 'صـ', med: 'ـصـ', fin: 'ـص', iso: 'ص', exInit: 'صَقْر', exMed: 'بَصَل', exFin: 'قَفَص', exIso: 'إِجَّاص' },
      { char: 'ن', name: 'نون', init: 'نـ', med: 'ـنـ', fin: 'ـن', iso: 'ن', exInit: 'نَهْر', exMed: 'عِنَب', exFin: 'عَيْن', exIso: 'رُمَّان' },
      { char: 'ب', name: 'باء', init: 'بـ', med: 'ـبـ', fin: 'ـب', iso: 'ب', exInit: 'بَاب', exMed: 'خُبْز', exFin: 'حَلِيب', exIso: 'كَوْكَب' },
      { char: 'ت', name: 'تاء', init: 'تـ', med: 'ـتـ', fin: 'ـت', iso: 'ت', exInit: 'تَمْر', exMed: 'كِتَاب', exFin: 'بَيْت', exIso: 'تُوت' },
      { char: 'ث', name: 'ثاء', init: 'ثـ', med: 'ـثـ', fin: 'ـث', iso: 'ث', exInit: 'ثَعْلَب', exMed: 'عُثْمَان', exFin: 'غَيْث', exIso: 'أَثَاث' },
      { char: 'خ', name: 'خاء', init: 'خـ', med: 'ـخـ', fin: 'ـخ', iso: 'خ', exInit: 'خَرُوف', exMed: 'نَخْلَة', exFin: 'بِطِّيخ', exIso: 'كُوخ' },
      { char: 'د', name: 'دال', init: 'د', med: 'ـد', fin: 'ـد', iso: 'د', exInit: 'دَرَاجَة', exMed: 'هَدِيَّة', exFin: 'يَد', exIso: 'وَرْد' },
      { char: 'ذ', name: 'ذال', init: 'ذ', med: 'ـذ', fin: 'ـذ', iso: 'ذ', exInit: 'ذَهَب', exMed: 'جَذْر', exFin: 'مُنْقِذ', exIso: 'رَذَاذ' },
      { char: 'ر', name: 'راء', init: 'ر', med: 'ـر', fin: 'ـر', iso: 'ر', exInit: 'رَسُول', exMed: 'قِرْد', exFin: 'قَمَر', exIso: 'قِطَار' },
      { char: 'ز', name: 'زاي', init: 'ز', med: 'ـز', fin: 'ـز', iso: 'ز', exInit: 'زَهْرَة', exMed: 'مَزْرَعَة', exFin: 'خُبْز', exIso: 'مَوْز' },
      { char: 'س', name: 'سين', init: 'سـ', med: 'ـسـ', fin: 'ـس', iso: 'س', exInit: 'سَمَكَة', exMed: 'مَسْجِد', exFin: 'شَمْس', exIso: 'فَرَس' },
      { char: 'ش', name: 'شين', init: 'شـ', med: 'ـشـ', fin: 'ـش', iso: 'ش', exInit: 'شَجَرَة', exMed: 'مِشْمِش', exFin: 'رِيش', exIso: 'فَرَاش' },
      { char: 'ض', name: 'ضاد', init: 'ضـ', med: 'ـضـ', fin: 'ـض', iso: 'ض', exInit: 'ضِفْدَع', exMed: 'خُضَار', exFin: 'بَيْض', exIso: 'حَوْض' },
      { char: 'ط', name: 'طاء', init: 'طـ', med: 'ـطـ', fin: 'ـط', iso: 'ط', exInit: 'طَبِيب', exMed: 'مَطَر', exFin: 'بَطّ', exIso: 'أُخْطُبُوط' },
      { char: 'ظ', name: 'ظاء', init: 'ظـ', med: 'ـظـ', fin: 'ـظ', iso: 'ظ', exInit: 'ظَرْف', exMed: 'نَظَّارَة', exFin: 'حَافِظ', exIso: 'مَحْظُوظ' },
      { char: 'ع', name: 'عين', init: 'عـ', med: 'ـعـ', fin: 'ـع', iso: 'ع', exInit: 'عَصِير', exMed: 'ثَعْلَب', exFin: 'مُذِيع', exIso: 'شُمُوع' },
      { char: 'غ', name: 'غين', init: 'غـ', med: 'ـغـ', fin: 'ـغ', iso: 'غ', exInit: 'غَزَال', exMed: 'مَغْرِب', exFin: 'صَمْغ', exIso: 'فَرَاغ' },
      { char: 'ف', name: 'فاء', init: 'فـ', med: 'ـفـ', fin: 'ـف', iso: 'ف', exInit: 'فَرَاشَة', exMed: 'طِفْل', exFin: 'سَيْف', exIso: 'صُوف' },
      { char: 'ق', name: 'قاف', init: 'قـ', med: 'ـقـ', fin: 'ـق', iso: 'ق', exInit: 'قَمَر', exMed: 'صَقْر', exFin: 'طَرِيق', exIso: 'سُوق' },
      { char: 'ك', name: 'كاف', init: 'كـ', med: 'ـكـ', fin: 'ـك', iso: 'ك', exInit: 'كِتَاب', exMed: 'مَكْتَبَة', exFin: 'مَلِك', exIso: 'شُبَّاك' },
      { char: 'ل', name: 'لام', init: 'لـ', med: 'ـلـ', fin: 'ـل', iso: 'ل', exInit: 'لَيْمُون', exMed: 'قَلَم', exFin: 'جَمَل', exIso: 'غَزَال' },
      { char: 'هـ', name: 'هاء', init: 'هـ', med: 'ـهـ', fin: 'ـه', iso: 'ه', exInit: 'هِلَال', exMed: 'نَهْر', exFin: 'وَجْه', exIso: 'مِيَاه' },
      { char: 'و', name: 'واو', init: 'و', med: 'ـو', fin: 'ـو', iso: 'و', exInit: 'وَرْدَة', exMed: 'طَاوُوس', exFin: 'دَلْو', exIso: 'عُصْفُور' },
      { char: 'ي', name: 'ياء', init: 'يـ', med: 'ـيـ', fin: 'ـي', iso: 'ي', exInit: 'يَد', exMed: 'بَيْت', exFin: 'كُرْسِي', exIso: 'شَاي' }
    ];

    const ALIF_VARIANTS = [
      { char: 'ا', name: 'ألف بلا همزة', init: 'ا', med: 'ـا', fin: 'ـا', iso: 'ا', exInit: 'الْبَيْت', exMed: 'بَاب', exFin: 'دَعَا', exIso: 'هَذَا' },
      { char: 'أ', name: 'ألف بهمزة فوق', init: 'أ', med: 'ـأ', fin: 'ـأ', iso: 'أ', exInit: 'أَسَد', exMed: 'سَأَلَ', exFin: 'بَدَأَ', exIso: 'قَرَأَ' },
      { char: 'إ', name: 'ألف بهمزة تحت', init: 'إ', med: 'ـإ', fin: 'ـإ', iso: 'إ', exInit: 'إِبِل', exMed: 'بِإِذْن', exFin: '—', exIso: 'إِيمَان' },
      { char: 'آ', name: 'ألف ممدودة', init: 'آ', med: 'ـآ', fin: 'ـآ', iso: 'آ', exInit: 'آمَال', exMed: 'ظَمْآن', exFin: '—', exIso: 'آدَم' }
    ];

    const RED_HARAKAT = [
      { mark: 'ـَ', name: 'فتحة', sym: 'َ' },
      { mark: 'ـُ', name: 'ضمة', sym: 'ُ' },
      { mark: 'ـِ', name: 'كسرة', sym: 'ِ' },
      { mark: 'ـْ', name: 'سكون', sym: 'ْ' },
      { mark: 'ـّ', name: 'شدة', sym: 'ّ' },
      { mark: 'ـً', name: 'تنوين فتح', sym: 'ً' },
      { mark: 'ـٌ', name: 'تنوين ضم', sym: 'ٌ' },
      { mark: 'ـٍ', name: 'تنوين كسر', sym: 'ٍ' }
    ];
    const LAM_ALIF_TOOLBOX = [
      { alif: 'ا', plain: 'لا', connected: 'ـلا', name: 'لام ألف' },
      { alif: 'أ', plain: 'لأ', connected: 'ـلأ', name: 'لام ألف بهمزة فوق' },
      { alif: 'إ', plain: 'لإ', connected: 'ـلإ', name: 'لام ألف بهمزة تحت' },
      { alif: 'آ', plain: 'لآ', connected: 'ـلآ', name: 'لام ألف ممدودة' }
    ];

    const LETTER_ORDER_ALPHABETIC = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];
    // ترتيب تدريس الحروف في كتاب لغتي للصف الأول: الوحدات 1–5.
    const LETTER_ORDER_LUGHATI = ['م','ب','ل','د','ن','ر','ص','ف','س','ق','ت','ح','ا','ط','ز','و','ج','ش','ض','ع','ك','خ','ي','ذ','ه','ث','غ','ظ'];
    const PRIMARY_HARAKAT = new Set(['َ','ُ','ِ','ْ','ً','ٌ','ٍ']);
    const HARAKA_CALIBRATION_DEFAULTS = Object.freeze({
      size: 100,
      xOffset: 0,
      topGap: 0.34,
      bottomGap: 0.14,
      shaddaStackTop: 0.30,
      shaddaKasraGap: 16,
      dammatanSize: 100,
      dammatanGap: 10,
      dammatanX: 0,
      dammatanY: 0
    });
    const HARAKA_CALIBRATION_LIMITS = Object.freeze({
      size: [50, 190],
      xOffset: [-40, 40],
      topGap: [0, 1.2],
      bottomGap: [0, 1],
      shaddaStackTop: [0, 1],
      shaddaKasraGap: [0, 60],
      dammatanSize: [40, 180],
      dammatanGap: [0, 32],
      dammatanX: [-35, 35],
      dammatanY: [-35, 35]
    });
    const boardPlatformAdapter = createPlatformAdapter(detectPlatformProfile());

    /* ====================================================================
       Magnetic Board Manager — multi-word, selection, contextual harakat
       ==================================================================== */
    const boardManager = {
      state: new BoardState(),
      history: new BoardHistory(80),
      storageKey: 'arabic-language-lab.board.v1',
      restoredFromStorage: false,
      get items() { return this.state.items; },
      set items(value) { this.state.replace(value); },
      activeLetterChar: 'ص',
      activePositionFilter: 'ALL',
      letterOrderMode: 'lughati',
      showBaseline: true,
      dragState: null,
      selectedIds: new Set(),
      activeItemId: null,
      selectionMode: 'none',
      longPressMs: 460,
      wordCounter: 0,
      harakaPlacementMode: 'attached',
      harakaCalibrationStorageKey: 'arabic-language-lab.haraka-calibration.v1',
      harakaDisplayStorageKey: 'arabic-language-lab.haraka-display.v1',
      harakaCalibration: { ...HARAKA_CALIBRATION_DEFAULTS },
      harakaCalibrationScope: 'global',
      shaddaKasraMode: 'school',
      showPieceFrames: true,

      init() {
        this.loadHarakaCalibration();
        this.loadHarakaDisplayPreferences();
        this.populateQuickLetterSelect();
        this.renderHarakat();
        this.renderLamAlifToolbar();
        this.renderLetterShapesSpotlight();
        this.renderAlifVariantsBar();
        this.renderFoamLettersGrid();
        this.setupBoardInteraction();
        this.restoredFromStorage = this.restorePersisted();
        if (!this.restoredFromStorage) this.loadPresetWord('صَالِحٌ');
        else this.renderBoard();
      },

      normalizeHarakaCalibration(input = {}) {
        const next = { ...HARAKA_CALIBRATION_DEFAULTS };
        for (const key of Object.keys(next)) {
          const n = Number(input[key]);
          if (!Number.isFinite(n)) continue;
          const [min, max] = HARAKA_CALIBRATION_LIMITS[key];
          next[key] = Math.max(min, Math.min(max, n));
        }
        return next;
      },

      loadHarakaCalibration() {
        let stored = null;
        try {
          stored = typeof localStorage !== 'undefined'
            ? JSON.parse(localStorage.getItem(this.harakaCalibrationStorageKey) || 'null')
            : null;
        } catch (_) {
          stored = null;
        }
        this.harakaCalibration = this.normalizeHarakaCalibration(stored || HARAKA_CALIBRATION_DEFAULTS);
        this.applyHarakaCalibration();
        this.syncHarakaCalibrationUI();
      },

      saveHarakaCalibration() {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.harakaCalibrationStorageKey, JSON.stringify(this.harakaCalibration));
          }
        } catch (_) {}
      },

      loadHarakaDisplayPreferences() {
        let stored = null;
        try {
          stored = typeof localStorage !== 'undefined'
            ? JSON.parse(localStorage.getItem(this.harakaDisplayStorageKey) || 'null')
            : null;
        } catch (_) {
          stored = null;
        }
        this.shaddaKasraMode = stored?.shaddaKasraMode === 'uthmani' ? 'uthmani' : 'school';
        this.showPieceFrames = stored?.showPieceFrames !== false;
      },

      saveHarakaDisplayPreferences() {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.harakaDisplayStorageKey, JSON.stringify({
              shaddaKasraMode: this.shaddaKasraMode,
              showPieceFrames: this.showPieceFrames
            }));
          }
        } catch (_) {}
      },

      getCalibrationTargetItem() {
        const item = this.items.find(entry => entry.id === this.activeItemId);
        return item && ['letter','ligature'].includes(item.type) ? item : null;
      },

      getEffectiveHarakaCalibration(item = null) {
        const override = item?.metadata?.harakaCalibration;
        return this.normalizeHarakaCalibration({ ...this.harakaCalibration, ...(override || {}) });
      },

      getCalibrationEditingValues() {
        if (this.harakaCalibrationScope === 'selected') {
          const target = this.getCalibrationTargetItem();
          if (target) return this.getEffectiveHarakaCalibration(target);
        }
        return { ...this.harakaCalibration };
      },

      setCalibrationCssVariables(style, values) {
        if (!style || !values) return;
        style.setProperty('--haraka-attached-scale', String(values.size / 100));
        style.setProperty('--haraka-x-offset', `${values.xOffset}px`);
        style.setProperty('--haraka-top-offset', `${-Math.abs(values.topGap)}em`);
        style.setProperty('--haraka-bottom-offset', `${-Math.abs(values.bottomGap)}em`);
        style.setProperty('--haraka-stack-top-offset', `${-Math.abs(values.shaddaStackTop)}em`);
        style.setProperty('--haraka-stack-kasra-top', `${values.shaddaKasraGap}%`);
        style.setProperty('--dammatan-scale', String(values.dammatanSize / 100));
        style.setProperty('--dammatan-lobe-a-x', `${-(values.dammatanGap / 2)}px`);
        style.setProperty('--dammatan-lobe-b-x', `${values.dammatanGap / 2}px`);
        style.setProperty('--dammatan-x-offset', `${values.dammatanX}px`);
        style.setProperty('--dammatan-y-offset', `${values.dammatanY}px`);
      },

      applyHarakaCalibration() {
        if (typeof document === 'undefined') return;
        this.setCalibrationCssVariables(document.documentElement.style, this.harakaCalibration);
      },

      applyHarakaCalibrationToElement(el, item) {
        if (!el || !item) return;
        this.setCalibrationCssVariables(el.style, this.getEffectiveHarakaCalibration(item));
      },

      setHarakaCalibrationScope(scope) {
        this.harakaCalibrationScope = scope === 'selected' ? 'selected' : 'global';
        this.syncHarakaCalibrationUI();
      },

      setShaddaKasraMode(mode) {
        this.shaddaKasraMode = mode === 'uthmani' ? 'uthmani' : 'school';
        this.saveHarakaDisplayPreferences();
        this.syncHarakaCalibrationUI();
        this.renderBoard();
        app.showToast(this.shaddaKasraMode === 'school'
          ? 'نمط الشدة والكسرة: تعليمي'
          : 'نمط الشدة والكسرة: عثماني');
      },

      togglePieceFrames() {
        this.showPieceFrames = !this.showPieceFrames;
        this.saveHarakaDisplayPreferences();
        this.renderBoard();
      },

      syncPieceFrameUI() {
        const btn = document.getElementById('pieceFrameToggleBtn');
        if (!btn) return;
        btn.classList.toggle('active', this.showPieceFrames);
        btn.setAttribute('aria-pressed', this.showPieceFrames ? 'true' : 'false');
        btn.textContent = this.showPieceFrames ? '▣ إطار القطع: ظاهر' : '□ إطار القطع: مخفي';
      },

      syncHarakaCalibrationUI() {
        if (typeof document === 'undefined') return;
        const target = this.getCalibrationTargetItem();
        if (this.harakaCalibrationScope === 'selected' && !target) {
          this.harakaCalibrationScope = 'global';
        }
        const v = this.getCalibrationEditingValues();
        const fields = {
          size: ['calHarakaSize','calHarakaSizeOut'],
          xOffset: ['calHarakaXOffset','calHarakaXOffsetOut'],
          topGap: ['calHarakaTopGap','calHarakaTopGapOut'],
          bottomGap: ['calHarakaBottomGap','calHarakaBottomGapOut'],
          shaddaStackTop: ['calShaddaStackTop','calShaddaStackTopOut'],
          shaddaKasraGap: ['calShaddaKasraGap','calShaddaKasraGapOut'],
          dammatanSize: ['calDammatanSize','calDammatanSizeOut'],
          dammatanGap: ['calDammatanGap','calDammatanGapOut'],
          dammatanX: ['calDammatanX','calDammatanXOut'],
          dammatanY: ['calDammatanY','calDammatanYOut']
        };
        for (const [key, ids] of Object.entries(fields)) {
          const input = document.getElementById(ids[0]);
          const output = document.getElementById(ids[1]);
          if (input) input.value = String(v[key]);
          if (output) output.textContent = String(v[key]);
        }
        const scope = document.getElementById('harakaCalibrationScope');
        if (scope) scope.value = this.harakaCalibrationScope;
        const mode = document.getElementById('shaddaKasraMode');
        if (mode) mode.value = this.shaddaKasraMode;
        const hint = document.getElementById('harakaCalibrationScopeHint');
        if (hint) {
          hint.textContent = this.harakaCalibrationScope === 'selected' && target
            ? `معايرة خاصة بالقطعة المحددة: ${this.composePieceValue(target)}. لن تتغير القيم العامة.`
            : 'تعديل القيم الافتراضية العامة.';
        }
        const summary = document.getElementById('harakaCalibrationSummary');
        if (summary) summary.textContent = this.getHarakaCalibrationSummary();
        this.syncPieceFrameUI();
      },

      getHarakaCalibrationSummary() {
        const v = this.getCalibrationEditingValues();
        return `scope=${this.harakaCalibrationScope} | size=${v.size} | x=${v.xOffset} | top=${v.topGap} | bottom=${v.bottomGap} | stackTop=${v.shaddaStackTop} | shaddaKasra=${v.shaddaKasraGap} | dammatanSize=${v.dammatanSize} | dammatanGap=${v.dammatanGap} | dammatanX=${v.dammatanX} | dammatanY=${v.dammatanY}`;
      },

      updateHarakaCalibration(key, rawValue) {
        if (!(key in HARAKA_CALIBRATION_DEFAULTS)) return;
        const n = Number(rawValue);
        if (!Number.isFinite(n)) return;
        const [min, max] = HARAKA_CALIBRATION_LIMITS[key];
        const value = Math.max(min, Math.min(max, n));

        if (this.harakaCalibrationScope === 'selected') {
          const target = this.getCalibrationTargetItem();
          if (!target) {
            this.harakaCalibrationScope = 'global';
            app.showToast('حددي حرفًا أو وصلة أولًا للمعايرة الخاصة');
          } else {
            target.metadata = target.metadata || {};
            target.metadata.harakaCalibration = {
              ...(target.metadata.harakaCalibration || {}),
              [key]: value
            };
          }
        }
        if (this.harakaCalibrationScope === 'global') {
          this.harakaCalibration[key] = value;
          this.applyHarakaCalibration();
          this.saveHarakaCalibration();
        }

        this.renderBoard();
        this.syncHarakaCalibrationUI();
      },

      resetHarakaCalibration() {
        if (this.harakaCalibrationScope === 'selected') {
          const target = this.getCalibrationTargetItem();
          if (target?.metadata?.harakaCalibration) {
            delete target.metadata.harakaCalibration;
            this.renderBoard();
            this.syncHarakaCalibrationUI();
            app.showToast('تمت إزالة المعايرة الخاصة بالقطعة');
            return;
          }
        }
        this.harakaCalibration = { ...HARAKA_CALIBRATION_DEFAULTS };
        this.applyHarakaCalibration();
        this.saveHarakaCalibration();
        this.renderBoard();
        this.syncHarakaCalibrationUI();
        app.showToast('تمت إعادة قيم معايرة الحركات العامة');
      },

      toggleHarakaCalibrationPanel() {
        const panel = document.getElementById('harakaCalibrationPanel');
        if (!panel) return;
        panel.classList.toggle('hidden');
        this.syncHarakaCalibrationUI();
      },

      async copyHarakaCalibration() {
        const text = this.getHarakaCalibrationSummary();
        try {
          await navigator.clipboard.writeText(text);
          app.showToast('تم نسخ قيم معايرة الحركات');
        } catch (_) {
          const summary = document.getElementById('harakaCalibrationSummary');
          if (summary) {
            const range = document.createRange();
            range.selectNodeContents(summary);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
          app.showToast('القيم محددة الآن؛ انسخها يدويًا');
        }
      },

      checkpoint(label = '') {
        this.history.checkpoint(this.state.snapshot(), label);
      },

      runCommand(command, { checkpoint = true, render = true } = {}) {
        if (checkpoint) this.checkpoint(command?.type || 'BOARD_COMMAND');
        applyBoardCommand(this.state, command);
        if (render) this.renderBoard();
        return this.items;
      },

      persistBoard() {
        if (typeof localStorage === 'undefined') return false;
        return saveBoardState(localStorage, this.storageKey, this.state, {
          mode: typeof exerciseBoard !== 'undefined' ? exerciseBoard.mode : 'free',
          harakaPlacementMode: this.harakaPlacementMode
        });
      },

      restorePersisted() {
        if (typeof localStorage === 'undefined') return false;
        const saved = loadBoardState(localStorage, this.storageKey);
        if (!saved?.items?.length) return false;
        this.state.restore(saved.items);
        this.harakaPlacementMode = saved.meta?.harakaPlacementMode === 'free' ? 'free' : 'attached';
        this.history.clear();
        return true;
      },

      undo() {
        const snapshot = this.history.undo(this.state.snapshot());
        if (!snapshot) { app.showToast('لا توجد خطوة للتراجع'); return; }
        this.state.restore(snapshot);
        this.setSelection([], 'none', null);
        this.renderBoard();
        app.showToast('تم التراجع');
      },

      redo() {
        const snapshot = this.history.redo(this.state.snapshot());
        if (!snapshot) { app.showToast('لا توجد خطوة للإعادة'); return; }
        this.state.restore(snapshot);
        this.setSelection([], 'none', null);
        this.renderBoard();
        app.showToast('تمت إعادة الخطوة');
      },

      normalizeLetterKey(char) {
        return ArabicIdentity.canonicalLetter(ArabicText.base(char) || char);
      },

      visualLookupKey(char) {
        return ArabicIdentity.visualLookupKey(ArabicText.base(char) || char);
      },

      isAlifVariant(char) {
        return ArabicIdentity.isAlifVariant(ArabicText.base(char) || char);
      },

      getLetterData(char) {
        const key = this.normalizeLetterKey(char);
        const alif = ALIF_VARIANTS.find(item => item.char === key);
        if (alif) return alif;
        return ALL_ARABIC_LETTERS_DATA.find(item => this.normalizeLetterKey(item.char) === key) || null;
      },

      getOrderedLetters() {
        const order = this.letterOrderMode === 'alphabetic' ? LETTER_ORDER_ALPHABETIC : LETTER_ORDER_LUGHATI;
        const map = new Map(ALL_ARABIC_LETTERS_DATA.map(item => [this.normalizeLetterKey(item.char), item]));
        return order.map(key => map.get(key)).filter(Boolean);
      },

      changeLetterOrder(mode) {
        this.letterOrderMode = mode === 'alphabetic' ? 'alphabetic' : 'lughati';
        SoundEngine.playSnap();
        this.populateQuickLetterSelect();
        this.renderFoamLettersGrid();
        const label = this.letterOrderMode === 'alphabetic' ? 'الترتيب الهجائي' : 'ترتيب كتاب لغتي';
        app.showToast(`تم تفعيل ${label}`);
      },

      populateQuickLetterSelect() {
        const sel = document.getElementById('quickLetterSelect');
        if (!sel) return;
        const ordered = this.getOrderedLetters();
        sel.innerHTML = ordered.map(item => {
          if (item.char === 'ا') {
            return ALIF_VARIANTS.map(v => `<option value="${v.char}">${v.char} — ${v.name}</option>`).join('');
          }
          return `<option value="${item.char}">حرف (${this.normalizeLetterKey(item.char)}) - ${item.name}</option>`;
        }).join('');
        const exists = ordered.some(item => item.char === this.activeLetterChar || this.normalizeLetterKey(item.char) === this.normalizeLetterKey(this.activeLetterChar));
        if (!exists && ordered[0]) this.activeLetterChar = ordered[0].char;
        sel.value = ordered.find(item => this.normalizeLetterKey(item.char) === this.normalizeLetterKey(this.activeLetterChar))?.char || this.activeLetterChar;
      },

      onLetterSelectChange(char) {
        this.activeLetterChar = char;
        SoundEngine.playSnap();
        SoundEngine.speakArabic(`حرف ${this.normalizeLetterKey(char)}`);
        const hanging = document.getElementById('hangingLetterChar');
        if (hanging) hanging.textContent = this.normalizeLetterKey(char);
        this.renderLetterShapesSpotlight();
        this.renderAlifVariantsBar();
        this.renderFoamLettersGrid();
      },

      renderAlifVariantsBar() {
        const bar = document.getElementById('alifVariantsBar');
        if (!bar) return;
        if (!this.isAlifVariant(this.activeLetterChar)) {
          bar.classList.add('hidden');
          bar.innerHTML = '';
          return;
        }
        bar.classList.remove('hidden');
        bar.innerHTML = `<span class="alif-variants-label">أشكال الألف:</span>${ALIF_VARIANTS.map(v => `<button type="button" class="alif-variant-btn${this.normalizeLetterKey(this.activeLetterChar) === v.char ? ' active' : ''}" data-onclick="boardManager.onLetterSelectChange('${v.char}')" title="${v.name}">${v.char}</button>`).join('')}`;
      },

      setPositionFilter(filter) {
        SoundEngine.playSnap();
        this.activePositionFilter = filter;
        document.querySelectorAll('.filter-tab-btn').forEach(b => {
          b.classList.remove('bg-slate-800', 'text-white', 'ring-2', 'ring-slate-400');
        });
        const activeBtn = document.getElementById(`filterBtn-${filter}`);
        if (activeBtn) activeBtn.classList.add('bg-slate-800', 'text-white');
        this.renderFoamLettersGrid();
      },

      renderLetterShapesSpotlight() {
        const container = document.getElementById('letterShapesSpotlight');
        if (!container) return;
        const lData = this.getLetterData(this.activeLetterChar) || ALL_ARABIC_LETTERS_DATA[0];
        container.innerHTML = `
          <button data-onclick="boardManager.addFoamPiece('${lData.init}', 'glyph-purple', 'أول الكلمة')" class="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-purple-50 transition group" title="أول الكلمة">
            <span class="foam-glyph glyph-purple text-3xl sm:text-4xl group-hover:scale-110 transition-transform">${lData.init}</span><span class="text-[9px] font-bold text-purple-700 mt-1">أول</span>
          </button>
          <button data-onclick="boardManager.addFoamPiece('${lData.med}', 'glyph-green', 'وسط الكلمة')" class="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-emerald-50 transition group" title="وسط الكلمة">
            <span class="foam-glyph glyph-green text-3xl sm:text-4xl group-hover:scale-110 transition-transform">${lData.med}</span><span class="text-[9px] font-bold text-emerald-700 mt-1">وسط</span>
          </button>
          <button data-onclick="boardManager.addFoamPiece('${lData.fin}', 'glyph-blue', 'آخر متصل')" class="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-blue-50 transition group" title="آخر متصل">
            <span class="foam-glyph glyph-blue text-3xl sm:text-4xl group-hover:scale-110 transition-transform">${lData.fin}</span><span class="text-[9px] font-bold text-blue-700 mt-1">متصل</span>
          </button>
          <button data-onclick="boardManager.addFoamPiece('${lData.iso}', 'glyph-red', 'منفصل')" class="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-rose-50 transition group" title="منفصل">
            <span class="foam-glyph glyph-red text-3xl sm:text-4xl group-hover:scale-110 transition-transform">${lData.iso}</span><span class="text-[9px] font-bold text-rose-700 mt-1">منفصل</span>
          </button>`;
      },

      renderHarakat() {
        const row = document.getElementById('harakatButtonsRow');
        if (!row) return;
        row.innerHTML = RED_HARAKAT.map(h => `
          <button data-onclick="boardManager.addHaraka('${h.sym}', '${h.name}')" class="p-1 rounded-lg hover:bg-rose-100 transition flex items-center gap-1 group" title="${h.name}">
            <span class="foam-glyph glyph-haraka text-2xl font-black group-hover:scale-125 transition-transform">${h.mark}</span>
            <span class="text-[9px] text-rose-700 font-bold hidden sm:inline">${h.name}</span>
          </button>`).join('');
      },

      renderLamAlifToolbar() {
        const row = document.getElementById('lamAlifButtonsRow');
        if (!row) return;
        row.innerHTML = LAM_ALIF_TOOLBOX.map(item => `
          <div class="lam-alif-tool-pair" aria-label="${item.name}">
            <button type="button" class="lam-alif-tool-btn" data-lam-alif="${item.plain}" data-onclick="boardManager.addLamAlifPiece('${item.alif}', false)" title="${item.name} منفصلة">${item.plain}</button>
            <button type="button" class="lam-alif-tool-btn connected" data-lam-alif="${item.connected}" data-onclick="boardManager.addLamAlifPiece('${item.alif}', true)" title="${item.name} متصلة بما قبلها">${item.connected}</button>
          </div>`).join('');
      },

      renderFoamLettersGrid() {
        const grid = document.getElementById('foamLettersGrid');
        if (!grid) return;
        const letters = this.getOrderedLetters();
        let html = '';
        if (this.activePositionFilter === 'ALL') {
          html = letters.map(l => `
            <div class="bg-slate-50/80 hover:bg-white rounded-xl p-1 flex flex-col items-center border border-slate-200 transition">
              <span class="text-[9px] font-black text-slate-400 mb-0.5">${this.normalizeLetterKey(l.char)}</span>
              <div class="grid grid-cols-2 gap-0.5 w-full items-center justify-center">
                <button data-onclick="boardManager.addFoamPiece('${l.init}', 'glyph-purple', 'أول الكلمة')" class="foam-glyph glyph-purple py-0.5 text-lg font-black hover:scale-115 transition-transform" title="أول">${l.init}</button>
                <button data-onclick="boardManager.addFoamPiece('${l.med}', 'glyph-green', 'وسط الكلمة')" class="foam-glyph glyph-green py-0.5 text-lg font-black hover:scale-115 transition-transform" title="وسط">${l.med}</button>
                <button data-onclick="boardManager.addFoamPiece('${l.fin}', 'glyph-blue', 'آخر متصل')" class="foam-glyph glyph-blue py-0.5 text-lg font-black hover:scale-115 transition-transform" title="متصل">${l.fin}</button>
                <button data-onclick="boardManager.addFoamPiece('${l.iso}', 'glyph-red', 'منفصل')" class="foam-glyph glyph-red py-0.5 text-lg font-black hover:scale-115 transition-transform" title="منفصل">${l.iso}</button>
              </div>
            </div>`).join('');
        } else {
          const meta = {
            init: ['init', 'glyph-purple', 'أول الكلمة', 'hover:bg-purple-50'],
            med: ['med', 'glyph-green', 'وسط الكلمة', 'hover:bg-emerald-50'],
            fin: ['fin', 'glyph-blue', 'آخر متصل', 'hover:bg-blue-50'],
            iso: ['iso', 'glyph-red', 'منفصل', 'hover:bg-rose-50']
          }[this.activePositionFilter];
          if (meta) {
            const [key, color, label, hover] = meta;
            html = letters.map(l => `
              <button data-onclick="boardManager.addFoamPiece('${l[key]}', '${color}', '${label}')" class="h-14 flex items-center justify-center rounded-xl ${hover} transition">
                <span class="foam-glyph ${color} text-3xl sm:text-4xl hover:scale-115 transition-transform">${l[key]}</span>
              </button>`).join('');
          }
        }
        grid.innerHTML = html;
      },

      toggleBaseline() {
        this.showBaseline = !this.showBaseline;
        const line = document.getElementById('whiteboardBaseline');
        const btn = document.getElementById('baselineToggleBtn');
        if (line) line.style.display = this.showBaseline ? 'block' : 'none';
        if (btn) btn.textContent = this.showBaseline ? 'سطر الكتابة: مُفعّل' : 'سطر الكتابة: مُخفى';
        SoundEngine.playSnap();
      },

      splitGlyph(glyph) {
        const marks = ArabicText.marks(glyph);
        const baseGlyph = Array.from(String(glyph || '')).filter(ch => !ArabicText.DIACRITIC_RE.test(ch)).join('');
        return { baseGlyph, marks };
      },

      composePieceValue(item) {
        if (!item) return '';
        if (item.type === 'ligature') {
          const components = Array.isArray(item.components) && item.components.length >= 2
            ? item.components.map(value => ArabicText.base(value) || value)
            : Array.from(item.baseText || item.logicalText || 'لا').filter(ch => ArabicText.LETTER_RE.test(ch)).slice(0, 2);
          return composeLigatureText(components, item.markAttachments || []);
        }
        if (item.type !== 'letter') return item.value || '';
        const marks = item.marks || [];
        if (!marks.length) return item.baseGlyph || item.value || '';
        const chars = Array.from(item.baseGlyph || item.value || '');
        const idx = chars.findIndex(ch => ArabicText.LETTER_RE.test(ch));
        if (idx < 0) return `${item.baseGlyph || ''}${marks.join('')}`;
        chars[idx] = chars[idx] + marks.join('');
        return chars.join('');
      },

      accessiblePieceLabel(item) {
        if (!item) return 'قطعة';
        if (item.type === 'haraka') return `حركة ${item.label || item.mark || ''}، قابلة للتحريك والتكبير`;
        if (item.type === 'ligature') return `وصلة لام ألف ${item.logicalText || ''}`;
        if (item.type === 'letter') return `حرف ${item.logicalChar || ArabicText.base(item.value) || ''}`;
        if (item.type === 'space') return 'مسافة';
        return 'قطعة سبورة';
      },

      getMarkAnchor(item, mark = '', componentIndex = 0) {
        if (item?.type === 'ligature') {
          return componentIndex === 0 ? 68 : 34;
        }
        const base = item?.logicalChar || ArabicText.base(item?.baseGlyph || item?.value || '');
        if (mark === 'ِ' && base === 'إ') return 58;
        const name = item?.posName || '';
        if (name.includes('أول')) return 66;
        if (name.includes('آخر')) return 36;
        return 50;
      },

      getMarkAttachments(item) {
        if (!item) return [];
        if (item.type === 'ligature') {
          return Array.isArray(item.markAttachments)
            ? item.markAttachments.map(entry => ({ mark: entry.mark, componentIndex: Number(entry.componentIndex) || 0 }))
            : [];
        }
        return (item.marks || []).map(mark => ({ mark, componentIndex: 0 }));
      },

      renderMarkOverlays(item) {
        const attachments = this.getMarkAttachments(item);
        if (!attachments.length) return '';

        const groups = new Map();
        attachments.forEach(entry => {
          const key = Number(entry.componentIndex) || 0;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(entry.mark);
        });

        const html = [];
        for (const [componentIndex, marks] of groups.entries()) {
          const hasShadda = marks.includes('ّ');
          const hasKasra = marks.includes('ِ');

          if (hasShadda && hasKasra && this.shaddaKasraMode === 'school') {
            const anchor = this.getMarkAnchor(item, 'ّ', componentIndex);
            html.push(renderShaddaKasraStack({ anchor }));
            for (const mark of marks) {
              if (mark === 'ّ' || mark === 'ِ') continue;
              html.push(renderAttachedHaraka(mark, {
                anchor: this.getMarkAnchor(item, mark, componentIndex),
                withShadda: true
              }));
            }
            continue;
          }

          for (const mark of marks) {
            const isUthmaniKasra = this.shaddaKasraMode === 'uthmani' && hasShadda && mark === 'ِ';
            html.push(renderAttachedHaraka(mark, {
              anchor: this.getMarkAnchor(item, mark, componentIndex),
              withShadda: isUthmaniKasra ? false : hasShadda
            }));
          }
        }
        return html.join('');
      },

      composeGlyphWithMarks(glyph, marks = []) {
        const chars = Array.from(String(glyph || ''));
        const idx = chars.findIndex(ch => ArabicText.LETTER_RE.test(ch));
        if (idx < 0) return `${glyph || ''}${Array.from(marks).join('')}`;
        chars[idx] = chars[idx] + Array.from(marks).join('');
        return chars.join('');
      },

      createLetterPiece(glyph, colorClass, positionName, x, y, extras = {}) {
        const split = this.splitGlyph(glyph);
        const legacy = {
          id: extras.id || `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type: 'letter',
          baseGlyph: split.baseGlyph,
          marks: split.marks,
          value: glyph,
          color: colorClass,
          posName: positionName,
          x, y,
          wordId: extras.wordId || null,
          wordLabel: extras.wordLabel || null,
          scale: Number.isFinite(extras.scale) ? extras.scale : 1,
          exerciseId: extras.exerciseId || null,
          exerciseUnit: extras.exerciseUnit || null,
          exerciseTargetIndex: Number.isInteger(extras.exerciseTargetIndex) ? extras.exerciseTargetIndex : null,
          exerciseSlot: Number.isInteger(extras.exerciseSlot) ? extras.exerciseSlot : null
        };
        const canonical = fromLegacyLetterPiece(legacy);
        return { ...legacy, logicalChar: canonical.logicalChar, displayGlyph: canonical.displayGlyph, capabilities: canonical.capabilities, rotation: canonical.rotation, metadata: canonical.metadata };
      },

      createLigaturePiece(data, x, y, extras = {}) {
        const canonical = createCanonicalLigaturePiece({
          logicalText: data.logicalText,
          baseText: data.baseText || (data.components || []).map(value => ArabicText.base(value) || value).join(''),
          components: data.components,
          markAttachments: data.markAttachments || [],
          displayGlyph: data.glyph || data.displayGlyph || data.baseText || data.logicalText,
          x, y,
          scale: Number.isFinite(extras.scale) ? extras.scale : 1,
          metadata: { positionName: data.name || 'وصلة لام ألف' }
        });
        return {
          ...canonical,
          id: extras.id || canonical.id,
          value: canonical.logicalText,
          baseText: canonical.baseText,
          baseGlyph: canonical.displayGlyph,
          markAttachments: canonical.markAttachments,
          color: data.color || 'glyph-red',
          posName: data.name || 'وصلة لام ألف',
          wordId: extras.wordId || null,
          wordLabel: extras.wordLabel || null,
          exerciseId: extras.exerciseId || null,
          exerciseUnit: extras.exerciseUnit || null,
          exerciseTargetIndex: Number.isInteger(extras.exerciseTargetIndex) ? extras.exerciseTargetIndex : null,
          exerciseSlot: Number.isInteger(extras.exerciseSlot) ? extras.exerciseSlot : null
        };
      },

      setupBoardInteraction() {
        const canvas = document.getElementById('boardCanvas');
        if (!canvas || canvas.dataset.pointerReady === '1') return;
        canvas.dataset.pointerReady = '1';

        const onPointerMove = (e) => {
          if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
          e.preventDefault();
          let dx = e.clientX - this.dragState.startClientX;
          let dy = e.clientY - this.dragState.startClientY;
          if (Math.abs(dx) + Math.abs(dy) > 3) {
            this.dragState.moved = true;
            if (this.dragState.longPressTimer) { clearTimeout(this.dragState.longPressTimer); this.dragState.longPressTimer = null; }
          }
          const rect = canvas.getBoundingClientRect();
          // قيد الحركة كمجموعة واحدة حتى لا تتشوه المسافات عند ملامسة الحواف.
          const origins = [...this.dragState.origins.values()];
          if (origins.length) {
            const minX = Math.min(...origins.map(o => o.x));
            const maxX = Math.max(...origins.map(o => o.x));
            const minY = Math.min(...origins.map(o => o.y));
            const maxY = Math.max(...origins.map(o => o.y));
            const maxScale = Math.max(1, ...this.items.filter(i => this.selectedIds.has(i.id) && pieceCan(i, BOARD_CAPABILITIES.MOVABLE)).map(i => Number(i.scale) || 1));
            dx = Math.max(4 - minX, Math.min(dx, (rect.width - 72 * maxScale) - maxX));
            dy = Math.max(4 - minY, Math.min(dy, (rect.height - 86 * maxScale) - maxY));
          }
          this.dragState.origins.forEach((origin, id) => {
            const item = this.items.find(i => i.id === id);
            if (!item) return;
            item.x = origin.x + dx;
            item.y = origin.y + dy;
            const el = canvas.querySelector(`[data-piece-id="${CSS.escape(id)}"]`);
            if (el) {
              el.style.left = `${item.x}px`;
              el.style.top = `${item.y}px`;
            }
          });
        };

        const onPointerUp = (e) => {
          if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
          if (this.dragState.longPressTimer) clearTimeout(this.dragState.longPressTimer);
          const droppedId = this.dragState.itemId;
          canvas.querySelectorAll('.free-foam-piece.is-dragging').forEach(el => el.classList.remove('is-dragging'));
          this.dragState = null;
          SoundEngine.playSnap();
          if (exerciseBoard.mode === 'build' && exerciseBoard.activeExercise) {
            exerciseBoard.onPieceDrop(droppedId);
          } else {
            this.updateWordPreviewFromPositions();
            // Dragging updates live objects directly; persist the final
            // coordinates now so reloads/PWA updates cannot restore an older
            // position.
            this.persistBoard();
          }
        };

        canvas.addEventListener('pointerdown', (e) => {
          if (e.target.closest('.free-foam-piece')) return;
          if (!this.selectedIds.size && !this.activeItemId) return;
          this.setSelection([], 'none', null);
          this.renderBoard();
        });

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      },

      setSelection(ids, mode = 'multi', activeId = null) {
        this.selectedIds = new Set((ids || []).filter(Boolean));
        this.selectionMode = this.selectedIds.size ? mode : 'none';
        this.activeItemId = activeId && this.selectedIds.has(activeId) ? activeId : (this.selectedIds.values().next().value || null);
      },

      getWordIds(wordId) {
        if (!wordId) return [];
        return this.items.filter(i => i.wordId === wordId).map(i => i.id);
      },

      isWholeWordSelected(item) {
        if (!item?.wordId || this.selectionMode !== 'word') return false;
        const ids = this.getWordIds(item.wordId);
        return ids.length > 1 && ids.length === this.selectedIds.size && ids.every(id => this.selectedIds.has(id));
      },

      refreshSelectionClasses() {
        const canvas = document.getElementById('boardCanvas');
        if (!canvas) return;
        canvas.querySelectorAll('.free-foam-piece').forEach(el => {
          const selected = this.selectedIds.has(el.dataset.pieceId);
          el.classList.toggle('is-selected', selected);
          el.classList.toggle('is-word-selected', selected && this.selectionMode === 'word');
          el.classList.toggle('is-letter-selected', selected && this.selectionMode === 'letter');
          el.classList.toggle('is-multi-selected', selected && !['word','letter'].includes(this.selectionMode));
        });
        this.updateSelectionUI();
      },

      selectOnly(id) {
        this.setSelection(id ? [id] : [], id ? 'letter' : 'none', id || null);
        this.renderBoard();
      },

      selectAll() {
        const selectable = this.items.filter(i => pieceCan(i, BOARD_CAPABILITIES.SELECTABLE));
        this.setSelection(selectable.map(i => i.id), 'all', selectable.find(i => i.type === 'letter')?.id || selectable[0]?.id || null);
        SoundEngine.playSnap();
        this.renderBoard();
        app.showToast(`تم تحديد ${this.selectedIds.size} قطعة`);
      },

      clearSelection() {
        this.setSelection([], 'none', null);
        this.renderBoard();
      },

      selectItemForInteraction(item, { additive = false, forceLetter = false } = {}) {
        if (!item) return;
        if (additive) {
          const next = new Set(this.selectedIds);
          if (next.has(item.id)) next.delete(item.id);
          else next.add(item.id);
          this.setSelection([...next], next.size === 1 ? 'letter' : 'multi', item.id);
          return;
        }
        if (forceLetter || !item.wordId) {
          const mode = item.type === 'haraka' ? 'haraka' : (item.type === 'ligature' ? 'ligature' : 'letter');
          this.setSelection([item.id], mode, item.id);
          return;
        }
        const wordIds = this.getWordIds(item.wordId);
        if (this.isWholeWordSelected(item)) {
          // الضغطة الثانية على حرف داخل الكلمة المحددة تنتقل إلى الحرف وحده.
          this.setSelection([item.id], 'letter', item.id);
        } else {
          // الضغطة الأولى تحدد الكلمة كاملة.
          this.setSelection(wordIds, 'word', item.id);
        }
      },

      getActiveWordId() {
        const active = this.items.find(i => i.id === this.activeItemId);
        if (active?.wordId) return active.wordId;
        const selected = this.items.filter(i => this.selectedIds.has(i.id) && i.wordId);
        if (!selected.length) return null;
        const ids = new Set(selected.map(i => i.wordId));
        return ids.size === 1 ? selected[0].wordId : null;
      },

      detachSelectedWord() {
        const wordId = this.getActiveWordId();
        if (!wordId) {
          app.showToast('حددي كلمة مكتملة أولًا');
          return;
        }
        const members = this.items.filter(i => i.wordId === wordId && i.type === 'letter');
        if (members.length < 2) {
          app.showToast('لا توجد كلمة متعددة الحروف لفكها');
          return;
        }
        const label = members.find(i => i.wordLabel)?.wordLabel || '';
        members.forEach(item => {
          item.detachedFrom = wordId;
          item.detachedLabel = label;
          item.wordId = null;
          item.wordLabel = null;
        });
        this.setSelection(members.map(i => i.id), 'multi', this.activeItemId);
        SoundEngine.playSnap();
        this.renderBoard();
        app.showToast('تم فك الكلمة؛ يمكنك الآن تحريك كل حرف منفردًا');
      },

      regroupSelection() {
        let members = this.items.filter(i => ['letter','ligature'].includes(i.type) && this.selectedIds.has(i.id));
        let detachedKey = null;
        if (members.length === 1 && members[0].detachedFrom) {
          detachedKey = members[0].detachedFrom;
          members = this.items.filter(i => i.type === 'letter' && i.detachedFrom === detachedKey);
        } else if (members.length > 1) {
          const keys = new Set(members.map(i => i.detachedFrom).filter(Boolean));
          if (keys.size === 1) detachedKey = [...keys][0];
        }
        if (members.length < 2) {
          app.showToast('حددي حرفين على الأقل، أو حرفًا من كلمة سبق فكها');
          return;
        }
        const wordId = detachedKey || `word_${++this.wordCounter}_${Date.now()}`;
        const sorted = [...members].sort((a, b) => b.x - a.x);
        const label = members.find(i => i.detachedLabel)?.detachedLabel || sorted.map(i => this.composePieceValue(i)).join('').replace(/ـ+/g, '');
        members.forEach(item => {
          item.wordId = wordId;
          item.wordLabel = label;
          delete item.detachedFrom;
          delete item.detachedLabel;
        });
        this.setSelection(members.map(i => i.id), 'word', this.activeItemId && members.some(i => i.id === this.activeItemId) ? this.activeItemId : members[0].id);
        SoundEngine.playSnap();
        this.renderBoard();
        app.showToast('تم تجميع الحروف في كلمة واحدة');
      },

      resizeSelected(delta) {
        const selected = this.items.filter(i => this.selectedIds.has(i.id) && pieceCan(i, BOARD_CAPABILITIES.SCALABLE));
        if (!selected.length) {
          app.showToast('حددي قطعة قابلة للتكبير أولًا');
          return;
        }
        this.checkpoint('RESIZE_PIECES');
        applyBoardCommand(this.state, {
          type: BOARD_COMMANDS.RESIZE_PIECES,
          ids: selected.map(i => i.id),
          delta: Number(delta) || 0,
          min: 0.35,
          max: 3
        });
        SoundEngine.playSnap();
        this.renderBoard();
      },

      resetSelectedSize() {
        const selected = this.items.filter(i => this.selectedIds.has(i.id) && pieceCan(i, BOARD_CAPABILITIES.SCALABLE));
        if (!selected.length) return;
        this.checkpoint('RESET_SCALE');
        selected.forEach(item => { item.scale = 1; });
        SoundEngine.playSnap();
        this.renderBoard();
      },

      deleteSelected() {
        if (!this.selectedIds.size) return;
        const removable = this.items.filter(i => this.selectedIds.has(i.id) && pieceCan(i, BOARD_CAPABILITIES.DELETABLE));
        if (!removable.length) return;
        this.checkpoint('DELETE_PIECES');
        applyBoardCommand(this.state, { type: BOARD_COMMANDS.DELETE_PIECES, ids: removable.map(i => i.id) });
        const count = removable.length;
        this.setSelection([], 'none', null);
        SoundEngine.playSnap();
        this.renderBoard();
        app.showToast(`تم حذف ${count} قطعة`);
      },

      addFoamPiece(glyph, colorClass, positionName) {
        SoundEngine.playSnap();
        SoundEngine.speakArabic(glyph);
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 400, height: 320 };
        let newX = rect.width * 0.72 - (this.items.length * 52) % Math.max(180, rect.width * 0.62);
        let newY = Math.max(30, rect.height * 0.42);
        if (newX < 30) newX = rect.width * 0.75;
        const piece = this.createLetterPiece(glyph, colorClass, positionName, newX, newY);
        this.checkpoint('ADD_PIECE');
        applyBoardCommand(this.state, { type: BOARD_COMMANDS.ADD_PIECE, piece });
        this.setSelection([piece.id], 'letter', piece.id);
        this.renderBoard();
      },

      getHarakaTarget() {
        let item = this.items.find(i => i.id === this.activeItemId && ['letter','ligature'].includes(i.type));
        if (!item) {
          const selectedTarget = [...this.items].reverse().find(i => this.selectedIds.has(i.id) && ['letter','ligature'].includes(i.type));
          if (selectedTarget) item = selectedTarget;
        }
        if (!item) item = [...this.items].reverse().find(i => ['letter','ligature'].includes(i.type));
        return item || null;
      },

      setHarakaPlacementMode(mode) {
        this.harakaPlacementMode = mode === 'free' ? 'free' : 'attached';
        document.getElementById('harakaModeAttached')?.classList.toggle('active', this.harakaPlacementMode === 'attached');
        document.getElementById('harakaModeFree')?.classList.toggle('active', this.harakaPlacementMode === 'free');
        const label = document.getElementById('harakaTargetLabel');
        if (label && this.harakaPlacementMode === 'free') label.textContent = 'الحركة ستُضاف كقطعة حرة قابلة للسحب والتكبير';
        app.showToast(this.harakaPlacementMode === 'free' ? 'الحركات الآن قطع حرة' : 'الحركات الآن مرتبطة بالحرف');
      },

      addFreeHaraka(sym, name) {
        this.checkpoint('ADD_FREE_HARAKA');
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 400, height: 320 };
        const offset = this.items.filter(i => i.type === 'haraka').length * 18;
        const piece = createCanonicalHarakaPiece({
          mark: sym, label: name,
          x: Math.max(22, rect.width * 0.58 - (offset % Math.max(90, rect.width * .3))),
          y: Math.max(28, rect.height * 0.38 + (offset % 64)),
          scale: 1
        });
        piece.value = sym; piece.color = 'glyph-haraka'; piece.posName = 'حركة حرة';
        this.items.push(piece);
        this.setSelection([piece.id], 'haraka', piece.id);
        this.renderBoard();
        app.showToast(`أضيفت ${name} كقطعة حرة`);
      },

      attachMarkToTarget(target, mark, componentIndex = 0) {
        if (!target) return;
        if (target.type === 'ligature') {
          target.markAttachments = Array.isArray(target.markAttachments) ? [...target.markAttachments] : [];
          if (mark === 'ّ') {
            const exists = target.markAttachments.some(entry => entry.componentIndex === componentIndex && entry.mark === 'ّ');
            if (!exists) target.markAttachments.push({ mark, componentIndex });
          } else {
            target.markAttachments = target.markAttachments.filter(entry => entry.componentIndex !== componentIndex || !PRIMARY_HARAKAT.has(entry.mark));
            target.markAttachments.push({ mark, componentIndex });
          }
          target.logicalText = this.composePieceValue(target);
          target.value = target.logicalText;
          return;
        }
        target.marks = Array.isArray(target.marks) ? [...target.marks] : [];
        if (mark === 'ّ') {
          if (!target.marks.includes('ّ')) target.marks.push('ّ');
        } else {
          target.marks = target.marks.filter(value => !PRIMARY_HARAKAT.has(value));
          target.marks.push(mark);
        }
        target.value = this.composePieceValue(target);
      },

      addHaraka(sym, name) {
        SoundEngine.playSnap();
        SoundEngine.speakArabic(name);
        if (this.harakaPlacementMode === 'free') {
          this.addFreeHaraka(sym, name);
          return;
        }
        const target = this.getHarakaTarget();
        if (!target) {
          app.showToast('اختاري حرفًا أو وصلة لام–ألف أولًا، أو فعّلي «حركة حرة»');
          return;
        }
        this.checkpoint('SET_HARAKA');
        if (sym === 'ّ' && target.type === 'letter' && target.marks?.includes('ّ')) {
          target.marks = target.marks.filter(mark => mark !== 'ّ');
          target.value = this.composePieceValue(target);
        } else {
          this.attachMarkToTarget(target, sym, 0);
        }
        this.setSelection([target.id], target.type === 'ligature' ? 'ligature' : 'letter', target.id);
        this.renderBoard();
        app.showToast(`تم ضبط الحركة إلى: ${name}`);
      },

      attachSelectedHaraka() {
        const markPiece = this.items.find(i => this.selectedIds.has(i.id) && i.type === 'haraka');
        if (!markPiece) { app.showToast('حددي حركة حرة أولًا'); return; }
        const targets = this.items.filter(i => ['letter','ligature'].includes(i.type));
        if (!targets.length) { app.showToast('لا يوجد حرف أو وصلة لام–ألف لربط الحركة بها'); return; }
        this.checkpoint('ATTACH_HARAKA');
        let target = targets[0], best = Infinity;
        for (const candidate of targets) {
          const d = Math.hypot((candidate.x||0)-(markPiece.x||0), (candidate.y||0)-(markPiece.y||0));
          if (d < best) { best = d; target = candidate; }
        }
        this.attachMarkToTarget(target, markPiece.mark, 0);
        this.items = this.items.filter(i => i.id !== markPiece.id);
        this.setSelection([target.id], target.type === 'ligature' ? 'ligature' : 'letter', target.id);
        this.renderBoard();
        app.showToast('تم ربط الحركة بأقرب حرف أو وصلة');
      },

      detachSelectedHaraka() {
        const target = this.getHarakaTarget();
        if (!target) { app.showToast('حددي حرفًا أو وصلة عليها حركة أولًا'); return; }

        this.checkpoint('DETACH_HARAKA');
        let mark = '';
        if (target.type === 'ligature') {
          const attachments = Array.isArray(target.markAttachments) ? [...target.markAttachments] : [];
          if (!attachments.length) { app.showToast('الوصلة المحددة لا تحتوي حركة قابلة للفصل'); return; }
          const detached = attachments.pop();
          mark = detached.mark;
          target.markAttachments = attachments;
          target.logicalText = this.composePieceValue(target);
          target.value = target.logicalText;
        } else {
          if (!target.marks?.length) { app.showToast('الحرف المحدد لا يحتوي حركة قابلة للفصل'); return; }
          mark = target.marks[target.marks.length - 1];
          target.marks = target.marks.slice(0, -1);
          target.value = this.composePieceValue(target);
        }

        const piece = createCanonicalHarakaPiece({
          mark,
          label: 'حركة مفصولة',
          x: (target.x||0)+34,
          y: Math.max(12,(target.y||0)-34),
          scale: Number(target.scale)||1
        });
        piece.value = mark; piece.color = 'glyph-haraka'; piece.posName = 'حركة حرة';
        this.items.push(piece);
        this.setSelection([piece.id], 'haraka', piece.id);
        this.renderBoard();
        app.showToast('تم فصل الحركة وأصبحت قابلة للسحب والتكبير');
      },

      clearHaraka() {
        const target = this.getHarakaTarget();
        if (!target) return;
        this.checkpoint('CLEAR_HARAKA');
        if (target.type === 'ligature') {
          target.markAttachments = [];
          target.logicalText = this.composePieceValue(target);
          target.value = target.logicalText;
        } else {
          target.marks = [];
          target.value = this.composePieceValue(target);
        }
        SoundEngine.playSnap();
        this.renderBoard();
        app.showToast('تمت إزالة الحركة من القطعة المحددة');
      },

      addLamAlifPiece(alifVariant = 'ا', connected = false) {
        const alif = ['ا','أ','إ','آ'].includes(alifVariant) ? alifVariant : 'ا';
        const data = createLamAlifLigature('ل', alif, ArabicText, { connectPrev: Boolean(connected) });
        if (!data) return;
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 400, height: 320 };
        const count = this.items.filter(item => item.type === 'ligature').length;
        const x = Math.max(24, rect.width * .68 - ((count * 74) % Math.max(140, rect.width * .5)));
        const y = Math.max(32, rect.height * .40 + ((count * 24) % 80));
        this.checkpoint('ADD_LAM_ALIF');
        const piece = this.createLigaturePiece({
          ...data,
          glyph: data.displayGlyph,
          color: connected ? 'glyph-blue' : 'glyph-red',
          name: connected ? 'لام–ألف متصلة بما قبلها' : 'لام–ألف منفصلة'
        }, x, y);
        this.items.push(piece);
        this.setSelection([piece.id], 'ligature', piece.id);
        this.renderBoard();
        SoundEngine.playSnap();
        SoundEngine.speakArabic(data.logicalText);
        app.showToast(`أضيفت ${data.displayGlyph} كوصلة قابلة للتحرير`);
      },

      addSpace() {
        SoundEngine.playSnap();
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 400, height: 320 };
        const item = createCanonicalSpacePiece({ x: rect.width * 0.5, y: rect.height * 0.45, width: 1 });
        item.value = ' '; item.color = ''; item.wordId = null;
        this.checkpoint('ADD_SPACE');
        applyBoardCommand(this.state, { type: BOARD_COMMANDS.ADD_PIECE, piece: item });
        this.renderBoard();
      },

      removePieceById(id) {
        const item = this.items.find(i => i.id === id);
        if (!item || !pieceCan(item, BOARD_CAPABILITIES.DELETABLE)) return;
        this.checkpoint('DELETE_PIECE');
        applyBoardCommand(this.state, { type: BOARD_COMMANDS.DELETE_PIECES, ids: [id] });
        SoundEngine.playSnap();
        this.selectedIds.delete(id);
        if (this.activeItemId === id) this.activeItemId = null;
        this.renderBoard();
      },

      placeCurrentLetterRow() {
        this.checkpoint('ADD_LETTER_FORMS');
        SoundEngine.playVictory();
        const lData = this.getLetterData(this.activeLetterChar) || ALL_ARABIC_LETTERS_DATA[0];
        const shapes = [
          { glyph: lData.init, color: 'glyph-purple', name: 'أول الكلمة' },
          { glyph: lData.med, color: 'glyph-green', name: 'وسط الكلمة' },
          { glyph: lData.fin, color: 'glyph-blue', name: 'آخر متصل' },
          { glyph: lData.iso, color: 'glyph-red', name: 'منفصل' }
        ];
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 500, height: 340 };
        const y = this.getNextWordY(rect.height);
        const spacing = Math.min(85, (rect.width - 60) / 4);
        const startX = rect.width - 80;
        const wordId = `forms_${++this.wordCounter}_${Date.now()}`;
        shapes.forEach((s, i) => this.items.push(this.createLetterPiece(s.glyph, s.color, s.name, startX - i * spacing, y, { wordId, wordLabel: `أشكال ${this.normalizeLetterKey(lData.char)}` })));
        this.ensureBoardHeight();
        this.renderBoard();
        app.showToast(`تمت إضافة أشكال حرف (${this.normalizeLetterKey(lData.char)}) الأربعة`);
      },

      canConnectToNext(base) {
        return base && !ArabicText.NON_CONNECTING_AFTER.has(base) && base !== 'ء';
      },

      contextualGlyph(base, connectPrev, connectNext) {
        // حافظ على هيئة الألف وهمزاتها كما كتبها المستخدم: ا / أ / إ / آ.
        const preserveExact = new Set(['ة','ى','ء','ؤ','ئ']);
        const data = preserveExact.has(base) ? null : this.getLetterData(base);
        if (data) {
          if (connectPrev && connectNext) return { glyph: data.med, color: 'glyph-green', name: 'وسط الكلمة' };
          if (!connectPrev && connectNext) return { glyph: data.init, color: 'glyph-purple', name: 'أول الكلمة' };
          if (connectPrev && !connectNext) return { glyph: data.fin, color: 'glyph-blue', name: 'آخر متصل' };
          return { glyph: data.iso, color: 'glyph-red', name: 'منفصل' };
        }
        let glyph = base;
        if (connectPrev && connectNext) glyph = `ـ${base}ـ`;
        else if (!connectPrev && connectNext) glyph = `${base}ـ`;
        else if (connectPrev && !connectNext) glyph = `ـ${base}`;
        const color = connectPrev && connectNext ? 'glyph-green' : (!connectPrev && connectNext ? 'glyph-purple' : (connectPrev ? 'glyph-blue' : 'glyph-red'));
        const name = connectPrev && connectNext ? 'وسط الكلمة' : (!connectPrev && connectNext ? 'أول الكلمة' : (connectPrev ? 'آخر متصل' : 'منفصل'));
        return { glyph, color, name };
      },

      wordToPiecesData(word, options = {}) {
        const units = ArabicText.letterUnits(word);
        if (options.mergeLigatures === false) {
          return units.map((unit, i) => {
            const base = ArabicText.base(unit);
            const prevBase = i > 0 ? ArabicText.base(units[i - 1]) : '';
            const nextBase = i < units.length - 1 ? ArabicText.base(units[i + 1]) : '';
            const form = this.contextualGlyph(base, Boolean(prevBase)&&this.canConnectToNext(prevBase)&&base!=='ء', Boolean(nextBase)&&this.canConnectToNext(base)&&nextBase!=='ء');
            return { type:'letter', unit, glyph:`${form.glyph}${ArabicText.marks(unit).join('')}`, color:form.color, name:form.name };
          });
        }
        const visual=mergeLamAlifUnits(units,ArabicText,base=>this.canConnectToNext(base));
        let sourceIndex=0;
        return visual.map(token=>{
          if(token.type==='ligature'){
            const prevBase=sourceIndex>0?ArabicText.base(units[sourceIndex-1]):'';
            const connectPrev=Boolean(prevBase)&&this.canConnectToNext(prevBase);
            const baseText=token.baseText || (token.components || []).map(value=>ArabicText.base(value)||value).join('');
            sourceIndex+=2;
            return {
              type:'ligature',
              glyph:`${connectPrev?'ـ':''}${baseText}`,
              baseText,
              logicalText:token.logicalText,
              components:token.components,
              markAttachments:Array.isArray(token.markAttachments)?token.markAttachments.map(entry=>({...entry})):[],
              color:connectPrev?'glyph-blue':'glyph-red',
              name:'وصلة لام–ألف'
            };
          }
          const unit=token.unit, base=ArabicText.base(unit);
          const prevBase=sourceIndex>0?ArabicText.base(units[sourceIndex-1]):'';
          const nextBase=sourceIndex<units.length-1?ArabicText.base(units[sourceIndex+1]):'';
          const connectPrev=Boolean(prevBase)&&this.canConnectToNext(prevBase)&&base!=='ء';
          const connectNext=Boolean(nextBase)&&this.canConnectToNext(base)&&nextBase!=='ء';
          const form=this.contextualGlyph(base,connectPrev,connectNext);
          sourceIndex+=1;
          return {type:'letter',unit,glyph:`${form.glyph}${ArabicText.marks(unit).join('')}`,color:form.color,name:form.name};
        });
      },

      textToPiecesData(text, options = {}) {
        const source = String(text || '');
        const parts = source.split(/(\s+)/u).filter(Boolean);
        const result = [];
        for (const part of parts) {
          if (/^\s+$/u.test(part)) {
            result.push({
              type: 'space',
              width: Math.max(0.9, Math.min(2.8, part.length * 0.9)),
              value: ' '
            });
            continue;
          }
          result.push(...this.wordToPiecesData(part, options));
        }
        return result;
      },

      getNextWordY(currentHeight = 400) {
        const groups = [...new Set(this.items.filter(i => i.wordId).map(i => i.wordId))];
        const row = groups.length;
        const y = 34 + row * 98;
        return Math.max(22, Math.min(y, Math.max(34, currentHeight - 82)));
      },

      ensureBoardHeight() {
        const canvas = document.getElementById('boardCanvas');
        if (!canvas) return;
        const groups = new Set(this.items.filter(i => i.wordId).map(i => i.wordId)).size;
        canvas.style.minHeight = `${Math.max(400, 110 + groups * 98)}px`;
      },

      addCompletedWord(word, { clear = false } = {}) {
        const clean = String(word || '').trim();
        if (!clean) {
          app.showToast('اكتبي كلمة أولًا');
          return;
        }
        const piecesData = this.textToPiecesData(clean);
        if (!piecesData.some(piece => piece.type !== 'space')) {
          app.showToast('لم أتعرف على حروف عربية في النص');
          return;
        }
        this.checkpoint(clear ? 'LOAD_COMPLETED_WORD' : 'ADD_COMPLETED_WORD');
        if (clear) {
          this.items = [];
          this.setSelection([], 'none', null);
        }
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 560, height: 400 };
        const wordId = `word_${++this.wordCounter}_${Date.now()}`;
        const y = this.getNextWordY(rect.height);
        const usableWidth = Math.max(220, rect.width - 120);
        const weightedUnits = piecesData.reduce((sum, piece) => sum + (piece.type === 'space' ? (Number(piece.width) || 0.9) : 1), 0);
        const spacing = Math.min(76, usableWidth / Math.max(1, weightedUnits));
        let cursorX = rect.width - 82;

        for (const p of piecesData) {
          const px = Math.max(14, cursorX);
          if (p.type === 'space') {
            const piece = createCanonicalSpacePiece({
              x: px,
              y,
              width: Number(p.width) || 0.9,
              metadata: { phraseSpace: true }
            });
            piece.value = ' ';
            piece.wordId = wordId;
            piece.wordLabel = clean;
            this.items.push(piece);
            cursorX -= spacing * (Number(p.width) || 0.9);
            continue;
          }

          const piece = p.type === 'ligature'
            ? this.createLigaturePiece(p, px, y, { wordId, wordLabel: clean })
            : this.createLetterPiece(p.glyph, p.color, p.name, px, y, { wordId, wordLabel: clean });
          this.items.push(piece);
          cursorX -= spacing;
        }

        this.setSelection([], 'none', null);
        this.ensureBoardHeight();
        this.renderBoard();
        app.showToast(`${clear ? 'تم تحميل' : 'تمت إضافة'}: ${clean}`);
      },

      loadPresetWord(word) {
        SoundEngine.playSnap();
        this.addCompletedWord(word, { clear: true });
      },

      addPresetWord(word) {
        SoundEngine.playSnap();
        this.addCompletedWord(word, { clear: false });
      },

      addCustomCompletedWord() {
        const input = document.getElementById('customBoardWord');
        const word = input?.value?.trim() || '';
        this.addCompletedWord(word, { clear: false });
        if (input && word) input.value = '';
      },

      autoAlignRow() {
        if (!this.items.length) return;
        this.checkpoint('AUTO_ALIGN');
        SoundEngine.playSnap();
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas.getBoundingClientRect();
        const grouped = new Map();
        this.items.forEach(item => {
          const key = item.wordId || '__free__';
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key).push(item);
        });
        let row = 0;
        grouped.forEach(group => {
          group.sort((a, b) => b.x - a.x);
          const y = 34 + row * 98;
          const usable = Math.max(180, rect.width - 120);
          const weightedUnits = group.reduce((sum, item) => sum + (item.type === 'space' ? (Number(item.width) || 0.9) : 1), 0);
          const spacing = Math.min(76, usable / Math.max(1, weightedUnits));
          let cursorX = rect.width - 82;
          group.forEach(item => {
            item.x = Math.max(12, cursorX);
            item.y = y;
            cursorX -= spacing * (item.type === 'space' ? (Number(item.width) || 0.9) : 1);
          });
          row += 1;
        });
        this.ensureBoardHeight();
        this.renderBoard();
        app.showToast('تم ترتيب النص مع الحفاظ على المسافات');
      },

      scatterPieces() {
        if (!this.items.length) return;
        this.checkpoint('SCATTER_PIECES');
        SoundEngine.playSnap();
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas.getBoundingClientRect();
        const targets = this.selectedIds.size ? this.items.filter(item => this.selectedIds.has(item.id)) : this.items;
        targets.forEach(item => {
          item.x = 20 + Math.random() * Math.max(30, rect.width - 100);
          item.y = 20 + Math.random() * Math.max(30, rect.height - 110);
        });
        this.renderBoard();
        app.showToast(this.selectedIds.size ? 'تم نثر القطع المحددة' : 'تم نثر الحروف للتركيب الحر');
      },

      escapeHtml(text) {
        return String(text ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
      },

      getWordGroups() {
        const groups = new Map();
        this.items.filter(i => ['letter','ligature','space'].includes(i.type)).forEach(item => {
          const key = item.wordId || '__free__';
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(item);
        });
        return [...groups.entries()].map(([id, items]) => {
          const visible = items.filter(i => i.type !== 'space');
          const y = visible.length ? Math.min(...visible.map(i => i.y)) : 0;
          const text = [...items].sort((a, b) => b.x - a.x).map(i => {
            if (i.type === 'letter') return this.composePieceValue(i);
            if (i.type === 'ligature') return i.logicalText || i.value || '';
            return ' ';
          }).join('').replace(/ـ+/g, '').replace(/\s+/g, ' ').trim();
          return { id, items, y, text, label: visible.find(i => i.wordLabel)?.wordLabel || text };
        }).filter(g => g.text).sort((a, b) => a.y - b.y);
      },

      updateWordPreviewFromPositions() {
        const preview = document.getElementById('currentWordPreview');
        if (!preview) return;
        const groups = this.getWordGroups();
        if (!groups.length) {
          preview.innerHTML = '<span class="board-preview-empty">--</span>';
          return;
        }
        preview.innerHTML = groups.map((g, idx) => `<button type="button" class="board-word-chip" data-onclick="boardManager.speakWordGroup('${this.escapeHtml(g.id)}')"><span>${idx + 1}</span>${this.escapeHtml(g.text)}</button>`).join('');
      },

      speakWordGroup(id) {
        const group = this.getWordGroups().find(g => g.id === id);
        if (!group?.text) return;
        SoundEngine.playSnap();
        SoundEngine.speakArabic(group.text);
      },

      updateSelectionUI() {
        const count = document.getElementById('selectedPieceCount');
        if (count) {
          if (this.selectionMode === 'word') count.textContent = 'كلمة محددة';
          else if (this.selectionMode === 'letter') count.textContent = 'حرف واحد';
          else if (this.selectionMode === 'haraka') count.textContent = 'حركة حرة';
          else if (this.selectionMode === 'ligature') count.textContent = 'وصلة لام–ألف';
          else count.textContent = `${this.selectedIds.size} محدد`;
        }
        const target = this.items.find(i => i.id === this.activeItemId);
        const label = document.getElementById('harakaTargetLabel');
        if (label) {
          if (this.harakaPlacementMode === 'free') label.textContent = target?.type === 'haraka' ? 'الحركة الحرة محددة ويمكن سحبها وتكبيرها' : 'الحركة ستُضاف كقطعة حرة قابلة للسحب والتكبير';
          else if (target?.type === 'letter') label.textContent = `الحرف النشط: ${this.composePieceValue(target)}`;
          else if (target?.type === 'ligature') label.textContent = `وصلة لام–ألف نشطة: ${this.composePieceValue(target)}`;
          else label.textContent = 'اختاري حرفًا أو وصلة لام–ألف لتغيير حركتها';
        }
        const scaleOut = document.getElementById('boardLetterScaleValue');
        if (scaleOut) {
          const selected = this.items.filter(i => this.selectedIds.has(i.id) && pieceCan(i, BOARD_CAPABILITIES.SCALABLE));
          const avg = selected.length ? selected.reduce((sum, i) => sum + (Number(i.scale) || 1), 0) / selected.length : 1;
          scaleOut.textContent = `${Math.round(avg * 100)}%`;
        }
        this.syncHarakaCalibrationUI();
      },

      renderBoard() {
        const container = document.getElementById('boardCanvas');
        if (!container) return;
        container.classList.toggle('piece-frames-hidden', !this.showPieceFrames);
        this.syncPieceFrameUI();
        const emptyHint = document.getElementById('emptyBoardHint');
        const countSpan = document.getElementById('boardPieceCount');
        if (countSpan) countSpan.textContent = `${this.items.length} قطع فوم`;
        container.querySelectorAll('.free-foam-piece').forEach(el => el.remove());

        if (!this.items.length) {
          if (emptyHint) emptyHint.style.display = 'flex';
          this.updateWordPreviewFromPositions();
          this.updateSelectionUI();
          this.persistBoard();
          return;
        }
        if (emptyHint) emptyHint.style.display = 'none';

        this.items.forEach(item => {
          if (item.type === 'space') return;
          const el = document.createElement('div');
          const isSelected = this.selectedIds.has(item.id);
          let pieceHtml = '';
          if (item.type === 'haraka') pieceHtml = `<span class="foam-piece-glyph free-haraka-piece-glyph pointer-events-none">${renderFreeHaraka(item.mark)}</span>`;
          else if (item.type === 'ligature') pieceHtml = `<span class="foam-piece-glyph lam-alif-ligature pointer-events-none" dir="rtl">${item.displayGlyph || item.baseGlyph || item.baseText || 'لا'}${this.renderMarkOverlays(item)}</span>`;
          else {
            const base = item.baseGlyph || this.splitGlyph(item.value).baseGlyph;
            pieceHtml = `<span class="foam-piece-glyph pointer-events-none">${base}${this.renderMarkOverlays(item)}</span>`;
          }
          decorateBoardPieceElement(el, {
            item,
            selected: isSelected,
            selectionMode: this.selectionMode,
            mobile: Boolean(window.matchMedia?.('(max-width: 640px)').matches),
            minTouchTarget: ['ios','android'].includes(boardPlatformAdapter.id) ? boardPlatformAdapter.minTarget : 0,
            contentHtml: pieceHtml,
            deleteAction: `<button data-onclick="event.stopPropagation(); boardManager.removePieceById('${item.id}')" class="piece-delete-btn" title="حذف القطعة">✕</button>`
          });
          this.applyHarakaCalibrationToElement(el, item);
          el.setAttribute('aria-label', this.accessiblePieceLabel(item));

          el.addEventListener('keydown', (e) => {
            const action = boardPlatformAdapter.actionForKey(e.key);
            if (!action) return;
            e.preventDefault();
            if (action.type === 'move' && pieceCan(item, BOARD_CAPABILITIES.MOVABLE)) {
              this.checkpoint('KEYBOARD_MOVE');
              const rect = container.getBoundingClientRect();
              item.x = Math.max(4, Math.min((item.x || 0) + action.dx, Math.max(4, rect.width - 52)));
              item.y = Math.max(4, Math.min((item.y || 0) + action.dy, Math.max(4, rect.height - 52)));
              this.renderBoard();
              requestAnimationFrame(() => container.querySelector(`[data-piece-id="${CSS.escape(item.id)}"]`)?.focus());
              return;
            }
            if (action.type === 'delete') { this.removePieceById(item.id); return; }
            if (action.type === 'activate') {
              this.selectItemForInteraction(item, { forceLetter: item.type === 'letter' && Boolean(item.wordId) });
              this.renderBoard();
              requestAnimationFrame(() => container.querySelector(`[data-piece-id="${CSS.escape(item.id)}"]`)?.focus());
            }
          });

          el.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button')) return;
            e.preventDefault();
            const additive = Boolean(e.ctrlKey || e.metaKey || e.shiftKey);
            this.checkpoint('MOVE_PIECES');

            // If the user already selected one specific piece, keep that
            // selection when dragging it. Previously pointerdown re-ran the
            // word-selection toggle and could turn the drag back into a
            // whole-word move.
            const preserveSingleSelection =
              !additive &&
              this.selectedIds.size === 1 &&
              this.selectedIds.has(item.id) &&
              ['letter','ligature','haraka'].includes(this.selectionMode);
            if (!preserveSingleSelection) {
              this.selectItemForInteraction(item, { additive });
            }
            this.refreshSelectionClasses();
            const origins = new Map(this.items.filter(i => this.selectedIds.has(i.id) && pieceCan(i, BOARD_CAPABILITIES.MOVABLE)).map(i => [i.id, { x: i.x, y: i.y }]));
            const state = {
              pointerId: e.pointerId,
              pointerType: e.pointerType || 'mouse',
              startClientX: e.clientX, startClientY: e.clientY,
              origins, moved: false, itemId: item.id, longPressTriggered: false, longPressTimer: null
            };
            // على الهاتف/اللوحي: الضغط المطول يحوّل التحديد مباشرة إلى الحرف نفسه.
            if (!additive && item.wordId && state.pointerType !== 'mouse') {
              state.longPressTimer = setTimeout(() => {
                if (this.dragState !== state || state.moved) return;
                state.longPressTriggered = true;
                this.selectItemForInteraction(item, { forceLetter: true });
                state.origins = new Map([[item.id, { x: item.x, y: item.y }]]);
                state.startClientX = e.clientX;
                state.startClientY = e.clientY;
                this.refreshSelectionClasses();
                try { navigator.vibrate?.(18); } catch (_) {}
              }, this.longPressMs);
            }
            this.dragState = state;
            el.classList.add('is-dragging');
            try { el.setPointerCapture(e.pointerId); } catch (_) {}
          });

          el.addEventListener('dblclick', (e) => {
            e.preventDefault();
            const mode = item.type === 'haraka' ? 'haraka' : (item.type === 'ligature' ? 'ligature' : 'letter');
            this.setSelection([item.id], mode, item.id);
            SoundEngine.speakArabic(item.type === 'haraka' ? item.mark : (item.type === 'ligature' ? item.logicalText : this.composePieceValue(item)));
            this.renderBoard();
          });

          container.appendChild(el);
        });
        this.updateWordPreviewFromPositions();
        this.updateSelectionUI();
        this.persistBoard();
      },

      pronounceBoard() {
        const groups = this.getWordGroups();
        const text = groups.map(g => g.text).join(' ').trim();
        if (!text) {
          app.showToast('السبورة فارغة، أضيفي بعض الحروف أولاً');
          return;
        }
        SoundEngine.playVictory();
        SoundEngine.speakArabic(text);
        confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
      },

      clearBoard() {
        if (this.items.length) this.checkpoint('CLEAR_BOARD');
        this.state.replace([]);
        this.setSelection([], 'none', null);
        const canvas = document.getElementById('boardCanvas');
        if (canvas) canvas.style.minHeight = '';
        this.renderBoard();
        app.showToast('تم تفريغ السبورة');
      }
    };

    /* ====================================================================
       Exercise Board Adapter — platform-neutral learning activity layer
       ==================================================================== */
    const exerciseCore = new WordExerciseEngine(ArabicText);
    const phraseExerciseCore = new PhraseExerciseEngine(ArabicText);
    const platformProfile = boardPlatformAdapter.profile;

    const exerciseBoard = {
      mode: 'free',
      activeExercise: null,
      lastResult: null,
      hintSlot: null,
      platform: platformProfile,
      _resizeTimer: null,

      init() {
        document.body.dataset.platform = this.platform.id;
        const badge = document.getElementById('platformProfileBadge');
        if (badge) badge.textContent = `${this.platform.label} • ${boardPlatformAdapter.describe()}`;

        // Preserve a restored board; the baseline branch remains available for comparison.
        boardManager.setSelection([], 'none', null);
        this.setMode('free', true);
        boardManager.renderBoard();

        window.addEventListener('resize', () => {
          clearTimeout(this._resizeTimer);
          this._resizeTimer = setTimeout(() => {
            if (this.mode === 'build' && this.activeExercise) this.resnapAll();
          }, 100);
        });
      },

      setMode(mode, silent = false) {
        const next = ['free', 'build', 'completed'].includes(mode) ? mode : 'free';
        const changed = this.mode !== next;
        if (changed) {
          this.activeExercise = null;
          this.lastResult = null;
          this.hintSlot = null;
          boardManager.items = [];
          boardManager.setSelection([], 'none', null);
          const canvas = document.getElementById('boardCanvas');
          if (canvas) canvas.style.minHeight = '';
        }
        this.mode = next;
        document.body.dataset.boardMode = next;

        const btnMap = { free: 'exerciseModeFree', build: 'exerciseModeBuild', completed: 'exerciseModeCompleted' };
        Object.entries(btnMap).forEach(([key, id]) => document.getElementById(id)?.classList.toggle('active', key === next));
        document.getElementById('exerciseBuildControls')?.classList.toggle('hidden', next !== 'build');
        document.getElementById('exerciseAssemblyZone')?.classList.toggle('hidden', !(next === 'build' && this.activeExercise));

        const title = document.getElementById('boardModeTitle');
        const hint = document.getElementById('boardInteractionHint');
        const emptyTitle = document.getElementById('emptyBoardTitle');
        const emptyDesc = document.getElementById('emptyBoardDescription');
        if (next === 'free') {
          if (title) title.textContent = 'السبورة الحرة — كل حرف قطعة مستقلة';
          if (hint) hint.textContent = 'اسحب أي حرف منفردًا • لا توجد إجابة مفروضة • الفراغ يلغي التحديد';
          if (emptyTitle) emptyTitle.textContent = 'الوضع الحر جاهز للتركيب!';
          if (emptyDesc) emptyDesc.textContent = 'أضف أي حرف من الحقيبة، ثم حرّكه وشكّله وكبّره بحرية.';
        } else if (next === 'build') {
          if (title) title.textContent = 'نشاط تكوين كلمة — حروف مستقلة + خانات ترتيب RTL';
          if (hint) hint.textContent = 'اسحب كل حرف إلى خانة «رتّب هنا» • تستطيع تغيير مكانه في أي وقت';
          if (emptyTitle) emptyTitle.textContent = 'اختر كلمة الهدف ثم انثر حروفها';
          if (emptyDesc) emptyDesc.textContent = 'لن تُربط الحروف مسبقًا؛ الطالب هو من يعيد ترتيبها.';
          this.setStatus('اكتب كلمة ثم اضغط «نثر حروف الكلمة».', 'info');
        } else {
          if (title) title.textContent = 'الكلمات المكتملة — نقل الكلمة أو فكها إلى حروف';
          if (hint) hint.textContent = 'ضغطة: الكلمة كاملة • ضغطة ثانية: حرف واحد • فك الكلمة يجعل الحروف مستقلة';
          if (emptyTitle) emptyTitle.textContent = 'أضف كلمة مكتملة من الشريط العلوي';
          if (emptyDesc) emptyDesc.textContent = 'يمكن نقل الكلمة كمجموعة، ثم فكها أو إعادة تجميعها.';
        }
        boardManager.renderBoard();
        if (!silent && changed) app.showToast(next === 'free' ? 'تم تفعيل الوضع الحر' : next === 'build' ? 'تم تفعيل نشاط تكوين كلمة' : 'تم تفعيل وضع الكلمات المكتملة');
      },

      readOptions() {
        return {
          includeHarakat: document.getElementById('exerciseIncludeMarks')?.checked !== false,
          contextualShapes: Boolean(document.getElementById('exerciseContextualShapes')?.checked),
          showTarget: document.getElementById('exerciseShowTarget')?.checked !== false,
          autoCheck: Boolean(document.getElementById('exerciseAutoCheck')?.checked)
        };
      },

      exerciseKind() {
        return document.getElementById('exerciseKind')?.value === 'phrase' ? 'phrase' : 'word';
      },

      currentCore() {
        return this.activeExercise?.kind === 'phrase' ? phraseExerciseCore : exerciseCore;
      },

      movableTargetIndices(exercise = this.activeExercise) {
        return (exercise?.targetUnits || []).map((unit,index)=>unit === ' ' ? null : index).filter(index=>index != null);
      },

      contextualDataForExercise(exercise) {
        const output = Array(exercise?.targetUnits?.length || 0).fill(null);
        const units = exercise?.targetUnits || [];
        let start=0;
        while(start<units.length){
          while(start<units.length && units[start]===' ') start+=1;
          if(start>=units.length) break;
          let end=start;
          while(end<units.length && units[end]!==' ') end+=1;
          const word=units.slice(start,end).join('');
          const shapes=boardManager.wordToPiecesData(word,{mergeLigatures:false});
          shapes.forEach((shape,offset)=>{ output[start+offset]=shape; });
          start=end+1;
        }
        return output;
      },

      usePreset(word) {
        const input = document.getElementById('exerciseTargetWord');
        if (input) input.value = word;
        this.startBuildWord();
      },

      startBuildWord() {
        if (this.mode !== 'build') this.setMode('build');
        const input = document.getElementById('exerciseTargetWord');
        const word = input?.value?.trim() || '';
        const core = this.exerciseKind() === 'phrase' ? phraseExerciseCore : exerciseCore;
        let exercise;
        try {
          exercise = core.create(word, this.readOptions());
          if (!exercise.kind) exercise.kind = 'word';
        } catch (_) {
          this.setStatus('اكتب نصًا عربيًا صحيحًا أولًا.', 'error');
          app.showToast('اكتب كلمة أو عبارة عربية أولًا');
          return;
        }
        this.activeExercise = exercise;
        this.lastResult = null;
        this.hintSlot = null;
        boardManager.checkpoint('START_EXERCISE');
        boardManager.items = [];
        boardManager.setSelection([], 'none', null);

        const contextual = this.contextualDataForExercise(exercise);
        const movableIndices = this.movableTargetIndices(exercise);
        const shuffled = core.scrambleIndices(movableIndices.length).map(i => movableIndices[i]);
        const positions = this.makeScatterPositions(shuffled.length);
        shuffled.forEach((targetIndex, positionIndex) => {
          const unit = exercise.targetUnits[targetIndex];
          const visual = this.visualForUnit(unit, targetIndex, contextual);
          const pos = positions[positionIndex];
          const piece = boardManager.createLetterPiece(visual.glyph, visual.color, visual.name, pos.x, pos.y, {
            exerciseId: exercise.id,
            exerciseUnit: unit,
            exerciseTargetIndex: targetIndex
          });
          applyBoardCommand(boardManager.state,{type:BOARD_COMMANDS.ADD_PIECE,piece});
        });

        document.getElementById('exerciseAssemblyZone')?.classList.remove('hidden');
        this.renderSlots();
        boardManager.renderBoard();
        this.updateTargetBadge();
        this.setStatus(`تم نثر ${movableIndices.length} قطع. اسحبها إلى الخانات من اليمين إلى اليسار.`, 'info');
        SoundEngine.playVictory();
      },

      visualForUnit(unit, targetIndex, contextualData) {
        const exercise = this.activeExercise;
        const marks = exercise.settings.includeHarakat ? ArabicText.marks(unit).join('') : '';
        const base = ArabicText.base(unit);
        if (exercise.settings.contextualShapes && contextualData[targetIndex]) {
          const split = boardManager.splitGlyph(contextualData[targetIndex].glyph);
          return {
            glyph: `${split.baseGlyph}${marks}`,
            color: contextualData[targetIndex].color,
            name: contextualData[targetIndex].name
          };
        }
        const special = new Set(['ة','ى','ء','ؤ','ئ']);
        const data = special.has(base) ? null : boardManager.getLetterData(base);
        const isolated = data?.iso || base;
        return { glyph: `${isolated}${marks}`, color: 'glyph-red', name: 'حرف مستقل للنشاط' };
      },

      makeScatterPositions(count) {
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas?.getBoundingClientRect() || { width: 560, height: 400 };
        const width = Math.max(260, rect.width);
        const safeHeight = Math.max(150, rect.height - 165);
        const cols = Math.max(2, Math.min(count, Math.floor((width - 50) / 82)));
        const rows = Math.max(1, Math.ceil(count / cols));
        const cellW = Math.max(68, (width - 44) / cols);
        const cellH = Math.max(72, safeHeight / rows);
        return Array.from({ length: count }, (_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const jitterX = ((i * 29) % 17) - 8;
          const jitterY = ((i * 19) % 15) - 7;
          return {
            x: Math.max(10, width - 38 - (col + 1) * cellW + cellW * .2 + jitterX),
            y: Math.max(10, 18 + row * cellH + jitterY)
          };
        });
      },

      reshuffle() {
        if (!this.activeExercise) {
          this.startBuildWord();
          return;
        }
        const items = this.exerciseItems();
        const order = this.currentCore().scrambleIndices(items.length);
        const positions = this.makeScatterPositions(items.length);
        order.forEach((itemIndex, positionIndex) => {
          const item = items[itemIndex];
          item.exerciseSlot = null;
          item.x = positions[positionIndex].x;
          item.y = positions[positionIndex].y;
        });
        this.lastResult = null;
        this.hintSlot = null;
        boardManager.setSelection([], 'none', null);
        this.renderSlots();
        boardManager.renderBoard();
        this.setStatus('أعيد نثر الحروف. ابدأ الترتيب من جديد.', 'info');
        SoundEngine.playSnap();
      },

      exerciseItems() {
        if (!this.activeExercise) return [];
        return boardManager.items.filter(item => item.exerciseId === this.activeExercise.id && item.type === 'letter');
      },

      slotItems() {
        const targets=this.activeExercise?.targetUnits || [];
        const slots=targets.map(unit=>unit===' ' ? { fixedSpace:true, exerciseUnit:' ' } : null);
        this.exerciseItems().forEach(item => {
          if (Number.isInteger(item.exerciseSlot) && item.exerciseSlot >= 0 && item.exerciseSlot < slots.length && targets[item.exerciseSlot] !== ' ') slots[item.exerciseSlot] = item;
        });
        return slots;
      },

      slotValues() {
        return this.slotItems().map(item => item?.fixedSpace ? ' ' : (item?.exerciseUnit ?? null));
      },

      renderSlots() {
        const wrap = document.getElementById('exerciseSlots');
        const zone = document.getElementById('exerciseAssemblyZone');
        if (!wrap || !zone) return;
        if (this.mode !== 'build' || !this.activeExercise) {
          zone.classList.add('hidden');
          wrap.innerHTML = '';
          return;
        }
        zone.classList.remove('hidden');
        const slots = this.slotItems();
        wrap.innerHTML = slots.map((item, index) => {
          if (item?.fixedSpace) return '<div class="exercise-slot fixed-space" aria-label="مسافة"><strong>␣</strong></div>';
          const resultClass = this.lastResult ? (this.lastResult.correctPositions[index] ? ' correct' : ' wrong') : '';
          const hintClass = this.hintSlot === index ? ' hint' : '';
          return `<div class="exercise-slot${item ? ' filled' : ''}${resultClass}${hintClass}" data-exercise-slot="${index}"><span>${index + 1}</span></div>`;
        }).join('');
        this.updateTargetBadge();
      },

      updateTargetBadge() {
        const badge = document.getElementById('exerciseTargetBadge');
        if (!badge) return;
        if (!this.activeExercise) { badge.textContent = ''; return; }
        badge.textContent = this.activeExercise.settings.showTarget ? `الهدف: ${this.activeExercise.targetWord}` : 'الهدف مخفي';
      },

      onPieceDrop(itemId) {
        if (!this.activeExercise) return;
        const item = boardManager.items.find(piece => piece.id === itemId && piece.exerciseId === this.activeExercise.id);
        if (!item) return;
        const pieceEl = document.querySelector(`[data-piece-id="${CSS.escape(item.id)}"]`);
        const zone = document.getElementById('exerciseAssemblyZone');
        const slotEls = [...document.querySelectorAll('[data-exercise-slot]')];
        if (!pieceEl || !zone || !slotEls.length) return;
        const pieceRect = pieceEl.getBoundingClientRect();
        const zoneRect = zone.getBoundingClientRect();
        const cx = pieceRect.left + pieceRect.width / 2;
        const cy = pieceRect.top + pieceRect.height / 2;
        const inside = cx >= zoneRect.left - 10 && cx <= zoneRect.right + 10 && cy >= zoneRect.top - 18 && cy <= zoneRect.bottom + 18;

        if (!inside) {
          if (Number.isInteger(item.exerciseSlot)) {
            item.exerciseSlot = null;
            this.lastResult = null;
            this.hintSlot = null;
            this.renderSlots();
            this.setStatus(this.progressMessage(), 'info');
          }
          return;
        }

        let nearest = 0;
        let nearestDistance = Infinity;
        slotEls.forEach(el => {
          const r = el.getBoundingClientRect();
          const sx = r.left + r.width / 2;
          const sy = r.top + r.height / 2;
          const d = (cx - sx) ** 2 + (cy - sy) ** 2;
          if (d < nearestDistance) { nearestDistance = d; nearest = Number(el.dataset.exerciseSlot); }
        });

        const oldSlot = Number.isInteger(item.exerciseSlot) ? item.exerciseSlot : null;
        const occupant = this.exerciseItems().find(other => other.id !== item.id && other.exerciseSlot === nearest);
        if (occupant) {
          if (oldSlot != null) occupant.exerciseSlot = oldSlot;
          else {
            occupant.exerciseSlot = null;
            this.moveItemToScatter(occupant, nearest + 1);
          }
        }
        item.exerciseSlot = nearest;
        this.lastResult = null;
        this.hintSlot = null;
        this.renderSlots();
        boardManager.renderBoard();
        requestAnimationFrame(() => this.resnapAll());
        this.setStatus(this.progressMessage(), 'info');

        const slotsNow = this.slotItems();
        const filled = slotsNow.filter(item => item && !item.fixedSpace).length;
        const movableTotal = this.movableTargetIndices().length;
        if (filled === movableTotal && this.activeExercise.settings.autoCheck) {
          setTimeout(() => this.checkAnswer(), 120);
        }
      },

      moveItemToScatter(item, seed = 0) {
        const positions = this.makeScatterPositions(Math.max(2, this.exerciseItems().length));
        const pos = positions[seed % positions.length];
        item.x = pos.x;
        item.y = pos.y;
      },

      snapItemToSlot(item) {
        if (!Number.isInteger(item.exerciseSlot)) return;
        const canvas = document.getElementById('boardCanvas');
        const slot = document.querySelector(`[data-exercise-slot="${item.exerciseSlot}"]`);
        if (!canvas || !slot) return;
        const cr = canvas.getBoundingClientRect();
        const sr = slot.getBoundingClientRect();
        const scale = Number(item.scale) || 1;
        const approxW = 68 * scale;
        const approxH = 76 * scale;
        item.x = sr.left - cr.left + (sr.width - approxW) / 2;
        item.y = sr.top - cr.top + (sr.height - approxH) / 2 - 2;
        const el = canvas.querySelector(`[data-piece-id="${CSS.escape(item.id)}"]`);
        if (el) { el.style.left = `${item.x}px`; el.style.top = `${item.y}px`; }
      },

      resnapAll() {
        if (!this.activeExercise || this.mode !== 'build') return;
        this.exerciseItems().forEach(item => this.snapItemToSlot(item));
      },

      progressMessage() {
        if (!this.activeExercise) return 'لا يوجد نشاط حالي.';
        const filled = this.slotItems().filter(item => item && !item.fixedSpace).length;
        const total = this.movableTargetIndices().length;
        if (!filled) return 'الخانات فارغة — اسحب الحروف إلى منطقة «رتّب هنا».';
        if (filled < total) return `تم وضع ${filled} من ${total} قطع. أكمل الترتيب.`;
        return `اكتملت الخانات (${total}/${total}). اضغط «تحقق من الترتيب».`;
      },

      checkAnswer() {
        if (!this.activeExercise) {
          this.setStatus('ابدأ نشاطًا أولًا.', 'error');
          return;
        }
        const slots = this.slotItems();
        const result = this.currentCore().compare(this.activeExercise, this.slotValues());
        this.activeExercise.attempts += 1;
        this.lastResult = result;
        this.hintSlot = null;
        this.renderSlots();
        requestAnimationFrame(() => this.resnapAll());
        if (!result.complete) {
          const missing = this.movableTargetIndices().length - this.slotItems().filter(item => item && !item.fixedSpace).length;
          this.setStatus(`بقي ${missing} قطع خارج الخانات.`, 'error');
          SoundEngine.playSnap();
          return;
        }
        if (result.correct) {
          this.activeExercise.status = 'solved';
          this.setStatus(`أحسنت! رتبت «${this.activeExercise.targetWord}» ترتيبًا صحيحًا.`, 'success');
          SoundEngine.playVictory();
          SoundEngine.speakArabic(this.activeExercise.targetWord);
          confetti({ particleCount: 55, spread: 65, origin: { y: .58 } });
        } else {
          const spaceCount = this.activeExercise.targetUnits.filter(unit=>unit===' ').length;
          this.setStatus(`هناك ${Math.max(0,result.correctCount-spaceCount)} من ${this.movableTargetIndices().length} قطع في أماكنها الصحيحة. حاول مرة أخرى.`, 'error');
          SoundEngine.playSnap();
        }
      },

      hint() {
        if (!this.activeExercise) {
          this.setStatus('ابدأ نشاطًا أولًا.', 'error');
          return;
        }
        const slots = this.slotItems();
        const result = this.currentCore().compare(this.activeExercise, this.slotValues());
        const index = result.correctPositions.findIndex(ok => !ok);
        if (index < 0) {
          this.setStatus('الترتيب صحيح بالفعل — اضغط تحقق.', 'success');
          return;
        }
        this.hintSlot = index;
        this.lastResult = null;
        this.renderSlots();
        requestAnimationFrame(() => this.resnapAll());
        const expected = this.activeExercise.targetUnits[index];
        const shown = this.activeExercise.settings.includeHarakat ? expected : ArabicText.base(expected);
        this.setStatus(`تلميح: الخانة رقم ${index + 1} تحتاج «${shown}».`, 'info');
        SoundEngine.speakArabic(shown);
      },

      finishExercise() {
        if (this.activeExercise) {
          this.exerciseItems().forEach(item => {
            item.exerciseId = null;
            item.exerciseUnit = null;
            item.exerciseTargetIndex = null;
            item.exerciseSlot = null;
          });
        }
        this.activeExercise = null;
        this.lastResult = null;
        this.hintSlot = null;
        this.mode = 'free';
        document.getElementById('exerciseAssemblyZone')?.classList.add('hidden');
        this.setMode('free', true);
        boardManager.renderBoard();
        app.showToast('انتهى النشاط؛ أصبحت القطع حرة');
      },

      setStatus(message, type = '') {
        const el = document.getElementById('exerciseStatus');
        if (!el) return;
        el.textContent = message;
        el.classList.remove('success', 'error', 'info');
        if (type) el.classList.add(type);
      }
    };


    /* ====================================================================
       Vowel Posters Manager (3 Mouth Panels)
       ==================================================================== */
    const vowelPosters = {
      currentLetter: 'ص',
      database: {
        'ص': {
          hanging: 'ص',
          fatha: { short: 'صَـ', long: 'صَا', ex1: 'صَدِيقِي', ex2: 'صَالِح' },
          damma: { short: 'صُـ', long: 'صُو', ex1: 'صُنْدُوق', ex2: 'صُورَة' },
          kasra: { short: 'صِـ', long: 'صِي', ex1: 'صِحَّتِي', ex2: 'عَصِير' }
        },
        'ب': {
          hanging: 'ب',
          fatha: { short: 'بَـ', long: 'بَا', ex1: 'بَقَرَة', ex2: 'بَاب' },
          damma: { short: 'بُـ', long: 'بُو', ex1: 'بُرْتُقَال', ex2: 'بُومَة' },
          kasra: { short: 'بِـ', long: 'بِي', ex1: 'بِنْت', ex2: 'طَبِيب' }
        },
        'م': {
          hanging: 'م',
          fatha: { short: 'مَـ', long: 'مَا', ex1: 'مَطَر', ex2: 'مَاء' },
          damma: { short: 'مُـ', long: 'مُو', ex1: 'مُعَلِّمَة', ex2: 'لَيْمُون' },
          kasra: { short: 'مِـ', long: 'مِي', ex1: 'مِفْتَاح', ex2: 'مِيلَاد' }
        },
        'د': {
          hanging: 'د',
          fatha: { short: 'دَ', long: 'دَا', ex1: 'دَرَجَة', ex2: 'دَار' },
          damma: { short: 'دُ', long: 'دُو', ex1: 'دُبّ', ex2: 'دُودَة' },
          kasra: { short: 'دِ', long: 'دِي', ex1: 'دِرْهَم', ex2: 'دِيك' }
        },
        'ر': {
          hanging: 'ر',
          fatha: { short: 'رَ', long: 'رَا', ex1: 'رَجُل', ex2: 'رَاعِي' },
          damma: { short: 'رُ', long: 'رُو', ex1: 'رُمَّان', ex2: 'خَرُوف' },
          kasra: { short: 'رِ', long: 'رِي', ex1: 'رِيشَة', ex2: 'رِيق' }
        }
      },

      init() {
        const picker = document.getElementById('vowelsLetterPicker');
        if (!picker) return;
        picker.innerHTML = Object.keys(this.database).map(l => `
          <option value="${l}">حرف (${l})</option>
        `).join('');
        this.updateView();
      },

      changeLetter(letter) {
        SoundEngine.playSnap();
        this.currentLetter = letter;
        this.updateView();
      },

      updateView() {
        const d = this.database[this.currentLetter] || this.database['ص'];
        
        const setEl = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        };

        setEl('fathaShortChar', d.fatha.short);
        setEl('fathaLongChar', d.fatha.long);
        setEl('fathaEx1', d.fatha.ex1);
        setEl('fathaEx2', d.fatha.ex2);

        setEl('dammaShortChar', d.damma.short);
        setEl('dammaLongChar', d.damma.long);
        setEl('dammaEx1', d.damma.ex1);
        setEl('dammaEx2', d.damma.ex2);

        setEl('kasraShortChar', d.kasra.short);
        setEl('kasraLongChar', d.kasra.long);
        setEl('kasraEx1', d.kasra.ex1);
        setEl('kasraEx2', d.kasra.ex2);
      },

      speakSound(type) {
        SoundEngine.playSnap();
        const d = this.database[this.currentLetter] || this.database['ص'];
        if (type === 'fatha_short') SoundEngine.speakArabic(d.fatha.short);
        if (type === 'fatha_long') SoundEngine.speakArabic(d.fatha.long);
        if (type === 'damma_short') SoundEngine.speakArabic(d.damma.short);
        if (type === 'damma_long') SoundEngine.speakArabic(d.damma.long);
        if (type === 'kasra_short') SoundEngine.speakArabic(d.kasra.short);
        if (type === 'kasra_long') SoundEngine.speakArabic(d.kasra.long);
      },

      speakWord(type) {
        SoundEngine.playVictory();
        const d = this.database[this.currentLetter] || this.database['ص'];
        if (type === 'fatha_ex1') SoundEngine.speakArabic(d.fatha.ex1);
        if (type === 'fatha_ex2') SoundEngine.speakArabic(d.fatha.ex2);
        if (type === 'damma_ex1') SoundEngine.speakArabic(d.damma.ex1);
        if (type === 'damma_ex2') SoundEngine.speakArabic(d.damma.ex2);
        if (type === 'kasra_ex1') SoundEngine.speakArabic(d.kasra.ex1);
        if (type === 'kasra_ex2') SoundEngine.speakArabic(d.kasra.ex2);
      }
    };

    /* ====================================================================
       Font Studio & Children Typography Testing Controller
       ==================================================================== */
    const FONT_REPOSITORY = [
      {
        id: 'font-baloo',
        nameAr: 'خط الأطفال والمرح (Baloo Bhaijaan 2)',
        nameEn: 'Baloo Bhaijaan 2',
        fontFamily: "'Baloo Bhaijaan 2', cursive, sans-serif",
        category: 'أطفال ورياض أطفال',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        desc: 'خط مستدير الحواف وممتلئ كقطع الفوم الإسفنجية؛ مثالي لرياض الأطفال والمراحل الأولية لبناء الألفة البصرية.',
        sampleLetters: 'صَـ   صُـ   صِـ   صّ   صَالِحٌ'
      },
      {
        id: 'font-marhey',
        nameAr: 'خط مَرِح اللطيف (Marhey)',
        nameEn: 'Marhey',
        fontFamily: "'Marhey', cursive, sans-serif",
        category: 'أطفال ورسوم متحركة',
        badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
        desc: 'خط فني كرتوني مبهج ومرح يعشقه الصغار، مصمم خصيصاً للقصص المصورة وألعاب الحروف التفاعلية.',
        sampleLetters: 'جَـ   ـمَـ   ـلٌ   نَهْرٌ'
      },
      {
        id: 'font-lalezar',
        nameAr: 'خط لاله زار الكرتوني (Lalezar)',
        nameEn: 'Lalezar',
        fontFamily: "'Lalezar', cursive, sans-serif",
        category: 'عناوين ومجلات الأطفال',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        desc: 'خط عريض جداً وبارز بروح مجلات الأطفال الكلاسيكية، يمنح الحروف سماكة ممتازة تحاكي الفوم السميك.',
        sampleLetters: 'حَـ   حُـ   حِـ   حَرِيصٌ'
      },
      {
        id: 'font-changa',
        nameAr: 'خط المكعبات والكتل (Changa)',
        nameEn: 'Changa',
        fontFamily: "'Changa', cursive, sans-serif",
        category: 'مكعبات وألعاب تعليمية',
        badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
        desc: 'خط كتلوي هندسي جريء يشبه مكعبات الحروف وألعاب التركيب الخشبية، ممتاز للتمييز الحركي والمكاني.',
        sampleLetters: 'كَتَبَ   دَرَسَ   رَسَمَ'
      },
      {
        id: 'font-naskh',
        nameAr: 'خط النسخ المدرسي المعتمد (Noto Naskh)',
        nameEn: 'Noto Naskh Arabic',
        fontFamily: "'Noto Naskh Arabic', serif",
        category: 'المناهج المدرسية (لغتي)',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        desc: 'المطابق بدقة لخط كتب القراءة والإملاء المعتمدة في المناهج المدرسية؛ رائع لتعليم السطر وقواعد الرسم الصحيح.',
        sampleLetters: 'الصَّلَاةَ   مَدْرَسَةٌ'
      },
      {
        id: 'font-cairo',
        nameAr: 'خط كايرو الهندسي (Cairo)',
        nameEn: 'Cairo',
        fontFamily: "'Cairo', sans-serif",
        category: 'وضوح فائق وقراءة سهلة',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        desc: 'خط حديث ذو خطوط واضحة ونسب دقيقة يسهل على العين الصغيرة تمييز الحروف المتشابهة وحركاتها دون لبس.',
        sampleLetters: 'صُنْدُوقٌ   صَحِيفَةٌ'
      },
      {
        id: 'font-readex',
        nameAr: 'خط القراءة البسيطة (Readex Pro)',
        nameEn: 'Readex Pro',
        fontFamily: "'Readex Pro', sans-serif",
        category: 'بساطة وعصرية',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        desc: 'خط تعليمي بسيط جداً ومجرد من الزوائد المعقدة؛ يريح عين الطفل في القراءة الهرمية والمقاطع.',
        sampleLetters: 'عُصْفُورٌ   كِتَابٌ'
      },
      {
        id: 'font-tajawal',
        nameAr: 'خط تجوال الناعم (Tajawal)',
        nameEn: 'Tajawal',
        fontFamily: "'Tajawal', sans-serif",
        category: 'ناعم ومتناسق',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        desc: 'حروف رشيقة وناعمة تتناغم على شاشات الجوال والأجهزة اللوحية دون تشويش أو تشابك مع الحركات.',
        sampleLetters: 'قَرَأَ   صَدَقَ   نُورٌ'
      },
      {
        id: 'font-amiri',
        nameAr: 'خط أميري التراثي (Amiri)',
        nameEn: 'Amiri',
        fontFamily: "'Amiri', serif",
        category: 'نسخ تراثي فصيح',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        desc: 'يمثل أصالة وجمال الخط العربي الكلاسيكي لتعويد الطفل على فصاحة ورشاقة الحرف العربي الأصيل.',
        sampleLetters: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
      },
      {
        id: 'font-ruqaa',
        nameAr: 'خط الرقعة الفني (Aref Ruqaa)',
        nameEn: 'Aref Ruqaa',
        fontFamily: "'Aref Ruqaa', cursive, serif",
        category: 'خط الرقعة العربي',
        badgeColor: 'bg-slate-200 text-slate-800 border-slate-300',
        desc: 'خط الرقعة الشهير، ممتاز لتعليم الطلاب مقارنة شكل الحرف بين خط النسخ وخط الرقعة وإثراء التذوق البصري.',
        sampleLetters: 'الْعِلْمُ نُورٌ وَالْجَهْلُ ظَلَامٌ'
      }
    ];

    const fontStudio = {
      testText: 'صَالِحٌ حَرِيصٌ عَلَى الصَّلَاةِ فِي الْمَسْجِدِ',

      init() {
        this.renderCards();
        this.updateActiveBadge();
      },

      openModal() {
        SoundEngine.playSnap();
        const modal = document.getElementById('fontStudioModal');
        if (!modal) return;
        this.renderCards();
        this.updateActiveBadge();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      },

      closeModal() {
        SoundEngine.playSnap();
        const modal = document.getElementById('fontStudioModal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      },

      setPresetText(text) {
        SoundEngine.playSnap();
        this.testText = text;
        const inp = document.getElementById('fontStudioLiveInput');
        if (inp) inp.value = text;
        this.renderCards();
      },

      onTestTextChange(val) {
        this.testText = val || 'صَالِحٌ حَرِيصٌ عَلَى الصَّلَاةِ';
        this.renderCards();
      },

      applyFontFromStudio(fontId) {
        app.changeAppFont(fontId);
        SoundEngine.playVictory();
        this.renderCards();
        this.updateActiveBadge();
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      },

      updateActiveBadge() {
        const badge = document.getElementById('activeFontBadge');
        if (!badge) return;
        const current = FONT_REPOSITORY.find(f => f.id === app.currentFont);
        if (current) badge.textContent = current.nameAr;
      },

      renderCards() {
        const container = document.getElementById('fontCardsContainer');
        if (!container) return;

        container.innerHTML = FONT_REPOSITORY.map(f => {
          const isActive = (app.currentFont === f.id);
          return `
            <div class="bg-white rounded-2xl p-4 border-2 ${isActive ? 'border-amber-500 ring-2 ring-amber-300 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-xs'} transition flex flex-col justify-between">
              
              <div>
                <!-- Card Header -->
                <div class="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 class="text-sm font-black text-slate-900">${f.nameAr}</h4>
                    <span class="text-[10px] text-slate-400 font-bold">${f.nameEn}</span>
                  </div>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${f.badgeColor}">
                    ${f.category}
                  </span>
                </div>

                <p class="text-xs text-slate-500 font-bold mb-3 leading-relaxed">${f.desc}</p>

                <!-- Live Test Showcase Box -->
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-3 overflow-hidden">
                  <span class="text-[10px] font-black text-slate-400 block mb-1">المعاينة الحية:</span>
                  <div class="text-xl sm:text-2xl font-black text-slate-900 text-center py-2" style="font-family: ${f.fontFamily}; line-height: 1.5;">
                    ${this.testText}
                  </div>
                  <!-- Sample Shapes & Harakat preview -->
                  <div class="mt-1 pt-1.5 border-t border-slate-200 text-center text-sm font-black text-amber-700 tracking-wider" style="font-family: ${f.fontFamily};">
                    ${f.sampleLetters}
                  </div>
                </div>
              </div>

              <!-- Action button -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <span class="text-[11px] font-bold text-slate-400">
                  ${isActive ? '✅ الخط المعتمد حالياً' : 'جاهز للتطبيق'}
                </span>
                <button data-onclick="fontStudio.applyFontFromStudio('${f.id}')" 
                        class="px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${isActive ? 'bg-emerald-600 text-white shadow-xs' : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'}">
                  <span>${isActive ? '✓ الخط مفعّل' : '👈 تجربة وتفعيل هذا الخط'}</span>
                </button>
              </div>

            </div>
          `;
        }).join('');
      }
    };

    /* ====================================================================
       Positions Table Manager (4 Contextual Shapes)
       ==================================================================== */
    const positionsTable = {
      selectedLetterChar: 'م',

      init() {
        const sel = document.getElementById('positionsLetterSelect');
        const tbody = document.getElementById('matrixTableBody');
        if (!sel || !tbody) return;

        const selectorItems = ALL_ARABIC_LETTERS_DATA.flatMap(m =>
          m.char === 'ا' ? ALIF_VARIANTS : [m]
        );
        sel.innerHTML = selectorItems.map(m => `
          <option value="${m.char}">حرف (${m.char}) - ${m.name}</option>
        `).join('');

        const matrixItems = ALL_ARABIC_LETTERS_DATA.flatMap(m =>
          m.char === 'ا' ? ALIF_VARIANTS : [m]
        );
        tbody.innerHTML = matrixItems.map(m => `
          <tr data-onclick="positionsTable.selectLetter('${m.char}')" class="hover:bg-slate-50 cursor-pointer transition ${['أ','إ','آ'].includes(m.char) ? 'bg-amber-50/50' : ''}">
            <td class="p-2.5 font-black text-slate-800">${m.char}</td>
            <td class="p-2.5 text-purple-700 font-black">${m.init}</td>
            <td class="p-2.5 text-emerald-700 font-black">${m.med}</td>
            <td class="p-2.5 text-blue-700 font-black">${m.fin}</td>
            <td class="p-2.5 text-rose-700 font-black">${m.iso}</td>
          </tr>
        `).join('');

        this.selectLetter('م');
      },

      selectLetter(char) {
        SoundEngine.playSnap();
        this.selectedLetterChar = char;
        const item = boardManager.getLetterData(char) || ALL_ARABIC_LETTERS_DATA[0];

        const sel = document.getElementById('positionsLetterSelect');
        if (sel) sel.value = char;

        const setEl = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        };

        setEl('dispInitial', item.init);
        setEl('dispMedial', item.med);
        setEl('dispFinalConn', item.fin);
        setEl('dispIsolated', item.iso);

        const exInit = document.getElementById('exInitial');
        if (exInit) exInit.innerHTML = `مثال: <span class="text-purple-600 font-black">${item.init}</span> (${item.exInit})`;
        const exMed = document.getElementById('exMedial');
        if (exMed) exMed.innerHTML = `مثال: <span class="text-emerald-600 font-black">${item.med}</span> (${item.exMed})`;
        const exFin = document.getElementById('exFinalConn');
        if (exFin) exFin.innerHTML = `مثال: <span class="text-blue-600 font-black">${item.fin}</span> (${item.exFin})`;
        const exIso = document.getElementById('exIsolated');
        if (exIso) exIso.innerHTML = `مثال: <span class="text-rose-600 font-black">${item.iso}</span> (${item.exIso})`;
      },

      speakPosition(pos) {
        SoundEngine.playSnap();
        const item = boardManager.getLetterData(this.selectedLetterChar) || ALL_ARABIC_LETTERS_DATA[0];
        if (pos === 'init') SoundEngine.speakArabic(`${item.init} في أول الكلمة مثل ${item.exInit}`);
        if (pos === 'med') SoundEngine.speakArabic(`${item.med} في وسط الكلمة مثل ${item.exMed}`);
        if (pos === 'fin') SoundEngine.speakArabic(`${item.fin} في آخر الكلمة متصل مثل ${item.exFin}`);
        if (pos === 'iso') SoundEngine.speakArabic(`${item.iso} منفصل مثل ${item.exIso}`);
      },

      sendAllToBoard() {
        const item = boardManager.getLetterData(this.selectedLetterChar) || ALL_ARABIC_LETTERS_DATA[0];
        boardManager.activeLetterChar = item.char;
        boardManager.placeCurrentLetterRow();
        app.switchTab('giant-board');
      }
    };

    /* ====================================================================
       Pyramid Reading Manager (Dual 47*32 cm Boards - Declared ONCE)
       ==================================================================== */
    const pyramidManager = {
      activeBoardType: 'short',

      presetsShort: {
        'كَتَبَ': { t1: 'كَـ', t2: 'كَتَـ', t3: 'كَتَبَ' },
        'دَرَسَ': { t1: 'دَ', t2: 'دَرَ', t3: 'دَرَسَ' },
        'رَسَمَ': { t1: 'رَ', t2: 'رَسَـ', t3: 'رَسَمَ' },
        'جَمَلٌ': { t1: 'جَـ', t2: 'جَمَـ', t3: 'جَمَلٌ' },
        'قَرَأَ': { t1: 'قَـ', t2: 'قَرَ', t3: 'قَرَأَ' },
        'صَدَقَ': { t1: 'صَـ', t2: 'صَدَ', t3: 'صَدَقَ' }
      },

      presetsMadd: {
        'صَالِحٌ': { t1: 'صَـ', t2: 'صَا', t3: 'صَالِحٌ' },
        'سِيرَةٌ': { t1: 'سِـ', t2: 'سِي', t3: 'سِيرَةٌ' },
        'نُورٌ': { t1: 'نُـ', t2: 'نُو', t3: 'نُورٌ' },
        'تَاجِرٌ': { t1: 'تَـ', t2: 'تَا', t3: 'تَاجِرٌ' },
        'طَبِيبٌ': { t1: 'طَـ', t2: 'طَبِي', t3: 'طَبِيبٌ' },
        'حُورٌ': { t1: 'حُـ', t2: 'حُو', t3: 'حُورٌ' }
      },

      current: null,

      init() {
        this.switchBoard('short');
      },

      switchBoard(type) {
        this.activeBoardType = type;
        SoundEngine.playSnap();

        const btnShort = document.getElementById('pyrBoardShortBtn');
        const btnMadd = document.getElementById('pyrBoardMaddBtn');
        const titleSpan = document.getElementById('currentPyrBoardTitle');

        if (type === 'short') {
          if (btnShort) btnShort.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-white shadow-xs text-blue-800 transition';
          if (btnMadd) btnMadd.className = 'px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 hover:text-slate-900 transition';
          if (titleSpan) titleSpan.textContent = 'لوحة ١: الحركات القصيرة والكلمات الثلاثية (47 × 32 سم)';
          this.renderPresetsList(this.presetsShort);
          this.loadWord('كَتَبَ', this.presetsShort['كَتَبَ']);
        } else {
          if (btnMadd) btnMadd.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-white shadow-xs text-blue-800 transition';
          if (btnShort) btnShort.className = 'px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 hover:text-slate-900 transition';
          if (titleSpan) titleSpan.textContent = 'لوحة ٢: المدود والتركيب التدرجي (47 × 32 سم)';
          this.renderPresetsList(this.presetsMadd);
          this.loadWord('صَالِحٌ', this.presetsMadd['صَالِحٌ']);
        }
      },

      renderPresetsList(dict) {
        const container = document.getElementById('pyramidPresetsList');
        if (!container) return;
        container.innerHTML = Object.keys(dict).map(w => `
          <button data-onclick="pyramidManager.loadWord('${w}')" 
                  class="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-extrabold text-xs transition">
            ${w}
          </button>
        `).join('');
      },

      loadWord(word, customObj) {
        SoundEngine.playSnap();
        const dict = this.activeBoardType === 'short' ? this.presetsShort : this.presetsMadd;
        const p = customObj || dict[word] || this.presetsShort['كَتَبَ'];
        this.current = p;

        const t1 = document.getElementById('tier1');
        const t2 = document.getElementById('tier2');
        const t3 = document.getElementById('tier3');
        if (t1) t1.textContent = p.t1;
        if (t2) t2.textContent = p.t2;
        if (t3) t3.textContent = p.t3;
      },

      speakTier(step) {
        if (!this.current) return;
        SoundEngine.playSnap();
        if (step === 1) SoundEngine.speakArabic(this.current.t1);
        if (step === 2) SoundEngine.speakArabic(this.current.t2);
        if (step === 3) {
          SoundEngine.playVictory();
          SoundEngine.speakArabic(this.current.t3);
          confetti({ particleCount: 30, spread: 55, origin: { y: 0.7 } });
        }
      },

      async readFullStepByStep() {
        if (!this.current) return;
        SoundEngine.playSnap();

        await SoundEngine.speakSequence(
          [this.current.t1, this.current.t2, this.current.t3],
          stepIndex => {
            const step = stepIndex + 1;
            this.highlightTier(step);
            if (step === 3) {
              SoundEngine.playVictory();
              confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
            }
          }
        );
      },

      highlightTier(step) {
        [1, 2, 3].forEach(s => {
          const btn = document.getElementById(`tierBtn${s}`);
          if (btn) btn.classList.remove('ring-4', 'ring-amber-400', 'scale-105');
        });
        const active = document.getElementById(`tierBtn${step}`);
        if (active) {
          active.classList.add('ring-4', 'ring-amber-400', 'scale-105');
          setTimeout(() => active.classList.remove('ring-4', 'ring-amber-400', 'scale-105'), 1200);
        }
      },

      buildCustom() {
        const inp = document.getElementById('customPyramidWord');
        const val = (inp && inp.value ? inp.value.trim() : '');
        const units = ArabicText.letterUnits(val);

        if (units.length < 2 || units.length > 3) {
          app.showToast("اكتبي كلمة من حرفين أو ثلاثة حروف، مع الحركات إن وجدت");
          return;
        }

        const first = units[0];
        const firstTwo = units.slice(0, 2).join('');
        const t1 = ArabicText.addDisplayTail(first, units[0]);
        const t2 = ArabicText.addDisplayTail(firstTwo, units[1]);
        const t3 = units.join('');

        this.current = { t1, t2, t3 };
        const el1 = document.getElementById('tier1');
        const el2 = document.getElementById('tier2');
        const el3 = document.getElementById('tier3');
        if (el1) el1.textContent = t1;
        if (el2) el2.textContent = t2;
        if (el3) el3.textContent = t3;
        SoundEngine.playVictory();
        app.showToast(`تم بناء هرم الكلمة: ${t3}`);
      }
    };

    /* ====================================================================
       Bear Analyzer Manager (Dual-Faced 29*21 cm Cards - Declared ONCE)
       ==================================================================== */
    const bearManager = {
      activeSide: 'phonetic',
      
      presetData: {
        'صُنْدُوقٌ': {
          phonetic: { parts: ['صُنْ', 'دُو', 'قٌ', '—'], rules: ['مقطع ساكن', 'مد بالواو', 'تنوين ضم', 'فارغة'] },
          letters: { parts: ['صُـ', 'ـنْـ', 'ـدُ', 'و'], rules: ['حرف الصاد', 'حرف النون', 'حرف الدال', 'حرف الواو'] }
        },
        'صَحِيفَةٌ': {
          phonetic: { parts: ['صَـ', 'حِي', 'فَـ', 'ةٌ'], rules: ['متحرك', 'مد بالياء', 'متحرك', 'تاء مربوطة'] },
          letters: { parts: ['صَـ', 'ـحِـ', 'ـيـ', 'ـفَـ'], rules: ['حرف الصاد', 'حرف الحاء', 'حرف الياء', 'حرف الفاء'] }
        },
        'مَدْرَسَةٌ': {
          phonetic: { parts: ['مَدْ', 'رَ', 'سَ', 'ةٌ'], rules: ['مقطع ساكن', 'متحرك', 'متحرك', 'تاء مربوطة'] },
          letters: { parts: ['مَـ', 'ـدْ', 'رَ', 'سَـ'], rules: ['حرف الميم', 'حرف الدال', 'حرف الراء', 'حرف السين'] }
        },
        'كِتَابٌ': {
          phonetic: { parts: ['كِـ', 'تَا', 'بٌ', '—'], rules: ['متحرك', 'مد بالألف', 'تنوين ضم', 'فارغة'] },
          letters: { parts: ['كِـ', 'ـتَـ', 'ا', 'بٌ'], rules: ['حرف الكاف', 'حرف التاء', 'حرف الألف', 'حرف الباء'] }
        },
        'عُصْفُورٌ': {
          phonetic: { parts: ['عُصْ', 'فُو', 'رٌ', '—'], rules: ['مقطع ساكن', 'مد بالواو', 'تنوين ضم', 'فارغة'] },
          letters: { parts: ['عُـ', 'ـصْـ', 'ـفُـ', 'و'], rules: ['حرف العين', 'حرف الصاد', 'حرف الفاء', 'حرف الواو'] }
        }
      },

      init() {
        this.loadWord('صُنْدُوقٌ');
      },

      setCardSide(side) {
        SoundEngine.playSnap();
        this.activeSide = side;

        const btnPhonetic = document.getElementById('bearSidePhoneticBtn');
        const btnLetters = document.getElementById('bearSideLettersBtn');
        const indicator = document.getElementById('bearSideIndicator');

        if (side === 'phonetic') {
          if (btnPhonetic) btnPhonetic.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-xs transition';
          if (btnLetters) btnLetters.className = 'px-3 py-1.5 rounded-xl text-xs font-black text-amber-900 hover:bg-amber-100 transition';
          if (indicator) indicator.textContent = 'الوجه الأول: التحليل الصوتي المقطعي (الساكن مع قبله والمد مع الممدود)';
        } else {
          if (btnLetters) btnLetters.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-xs transition';
          if (btnPhonetic) btnPhonetic.className = 'px-3 py-1.5 rounded-xl text-xs font-black text-amber-900 hover:bg-amber-100 transition';
          if (indicator) indicator.textContent = 'الوجه الثاني: التحليل الهجائي وتجريد الحروف الفردية';
        }

        const inputWord = (document.getElementById('bearWordInput')?.value || '').trim() || 'صُنْدُوقٌ';
        this.loadWord(inputWord);
      },

      loadWord(word) {
        SoundEngine.playSnap();
        const input = document.getElementById('bearWordInput');
        if (input) input.value = word;

        // نعيد التحليل ديناميكيًا حتى تظهر هيئة كل حرف بحسب موقعه الحقيقي داخل الكلمة.
        this.analyzeDynamic(word);
      },

      displayParts(parts, rules) {
        for (let i = 1; i <= 4; i++) {
          const p = parts[i - 1] || '—';
          const r = rules ? (rules[i - 1] || '') : '';
          const box = document.getElementById(`bearBox${i}`);
          if (box) box.textContent = p;
          const ruleEl = document.getElementById(`bearRule${i}`);
          if (ruleEl) ruleEl.textContent = r || (p === '—' ? 'فارغة' : 'مقطع');
        }
      },

      analyzeInput() {
        const word = (document.getElementById('bearWordInput')?.value || '').trim();
        if (!word) return;
        SoundEngine.playVictory();
        this.loadWord(word);
        app.showToast(`تم تحليل كلمة: ${word}`);
      },

      contextualUnit(unit, index, units) {
        const base = ArabicText.base(unit);
        const prevBase = index > 0 ? ArabicText.base(units[index - 1]) : '';
        const nextBase = index < units.length - 1 ? ArabicText.base(units[index + 1]) : '';
        const connectPrev = Boolean(prevBase) && boardManager.canConnectToNext(prevBase) && base !== 'ء';
        const connectNext = Boolean(nextBase) && boardManager.canConnectToNext(base) && nextBase !== 'ء';
        const form = boardManager.contextualGlyph(base, connectPrev, connectNext);
        return boardManager.composeGlyphWithMarks(form.glyph, ArabicText.marks(unit));
      },

      joinContextualUnits(units, indexes) {
        return indexes.map(i => this.contextualUnit(units[i], i, units)).join('').replace(/ـ{2,}/g, 'ـ');
      },

      contextualPhoneticParts(word) {
        const units = ArabicText.letterUnits(word);
        const parts = [];
        const rules = [];
        let i = 0;
        while (i < units.length) {
          const current = units[i];
          const next = units[i + 1];
          if (next && ArabicText.hasMark(next, 'ْ')) {
            parts.push(this.joinContextualUnits(units, [i, i + 1]));
            rules.push('مقطع ساكن');
            i += 2;
            continue;
          }
          if (next && ArabicText.isMaddPair(current, next)) {
            parts.push(this.joinContextualUnits(units, [i, i + 1]));
            rules.push(ArabicText.maddRule(current, next));
            i += 2;
            continue;
          }
          parts.push(this.joinContextualUnits(units, [i]));
          rules.push(ArabicText.unitRule(current));
          i += 1;
        }
        return { parts, rules };
      },

      analyzeDynamic(word) {
        let parts = [];
        let rules = [];
        const units = ArabicText.letterUnits(word);

        if (this.activeSide === 'letters') {
          parts = units.map((unit, index) => this.contextualUnit(unit, index, units));
          rules = units.map(unit => {
            const base = ArabicText.base(unit);
            const meta = boardManager.getLetterData(base);
            return meta ? `حرف ${meta.name}` : ArabicText.unitRule(unit);
          });
        } else {
          const analyzed = this.contextualPhoneticParts(word);
          parts = analyzed.parts;
          rules = analyzed.rules;
        }

        const fitted = ArabicText.fitToFour(parts, rules);
        this.displayParts(fitted.parts, fitted.rules);
      },

      speakBox(idx) {
        const box = document.getElementById(`bearBox${idx}`);
        if (!box) return;
        const text = box.textContent.replace('—', '').trim();
        if (!text) return;
        SoundEngine.playSnap();
        SoundEngine.speakArabic(text);
      },

      pronounceAllParts() {
        const getB = id => document.getElementById(id)?.textContent.replace('—', '').trim() || '';
        const parts = [getB('bearBox1'), getB('bearBox2'), getB('bearBox3'), getB('bearBox4')].filter(Boolean);

        if (parts.length === 0) return;
        SoundEngine.playVictory();
        SoundEngine.speakArabic(parts.join(' .. '));
      }
    };

    /* ====================================================================
       Reward Cards Manager (40 Cards)
       ==================================================================== */
    const rewardsManager = {
      category: 'spelling',

      cardsSpelling: [
        { title: 'ملكة الإملاء', icon: '👑', text: 'لكل حرف رسمتِه بإتقان.. دمتِ فخراً ومعلمة للمستقبل!' },
        { title: 'عبقرية الهمزات', icon: '⚡', text: 'همزاتكِ ثابتة كالنجوم في سماء الإتقان والتميز!' },
        { title: 'فارسة التنوين', icon: '✨', text: 'ألحان التنوين تشرق بجمال في خطك الجميل!' },
        { title: 'أميرة التاء المربوطة', icon: '🌸', text: 'فرّقتِ بين التاء والهاء بذكاء وفطنة فائقة!' },
        { title: 'نجمة الخط والضبط', icon: '⭐', text: 'خطكِ المنظم وحركاتكِ تزيد الكلمات بهاءً!' },
        { title: 'صائدة الأخطاء', icon: '🎯', text: 'عينكِ الذكية تكتشف وتصحح بكل ثقة وتفوق!' },
        { title: 'ملكة اللام الشمسية', icon: '☀️', text: 'تألق مشرق في تمييز اللام الشمسية وحركاتها!' },
        { title: 'ملكة اللام القمرية', icon: '🌙', text: 'نور اللام القمرية ساطع في إملائكِ الراقي!' },
        { title: 'فراشة الإملاء', icon: '🦋', text: 'تتنقلين بين الكلمات بخفة وإبداع لا يُضاهى!' },
        { title: 'درّة الصف المتقنة', icon: '💎', text: 'إتقان نادر وجوهرة متألقة بين التلميذات!' },
        { title: 'وسام الشجاعة الإملائية', icon: '🏅', text: 'تنتصرين على أصعب الكلمات بثقة وبراعة!' },
        { title: 'مبتكرة الجمل', icon: '🎨', text: 'تأليف رائع وإملاء سليم يبهج القلب!' },
        { title: 'تاج المثابرة', icon: '👸', text: 'بجهدكِ اليومي حققتِ أعلى درجات التفوق!' },
        { title: 'نبع الإتقان', icon: '🌊', text: 'في كل سطر تسطرينه يفيض الإتقان كالنبع!' },
        { title: 'سفيرة الفصاحة', icon: '🕊️', text: 'حروفكِ تعكس لغة الضاد بكل هيبة وجمال!' },
        { title: 'فارسة السكون', icon: '🪐', text: 'وقوفكِ الهادئ عند السكون علامة المتقنين!' },
        { title: 'شعلة الإبداع', icon: '🔥', text: 'حماسكِ في حصة الإملاء يضيء الفصل كاملاً!' },
        { title: 'زهرة الصف', icon: '🌷', text: 'جمال الحرف ورقة الأسلوب عنوان إبداعك!' },
        { title: 'ملكة الكلمات الذهبية', icon: '🥇', text: 'حروفكِ من ذهب وفهمكِ في القمة دائماً!' },
        { title: 'درع التميز الإملائي', icon: '🛡️', text: 'استحقاق كامل لأعلى وسام في لغتي الجميلة!' }
      ],

      cardsReading: [
        { title: 'قارئة المستقبل', icon: '🚀', text: 'صوتكِ الواثق ينبئ بمستقبل مشرق وعظيم!' },
        { title: 'فراشة القراءة', icon: '🦋', text: 'تطيرين بين سطور الكتاب بأناقة وطلاقة ساحرة!' },
        { title: 'نغمة الفصاحة', icon: '🎶', text: 'قراءتكِ عذبة كأجمل الألحان الفصيحة!' },
        { title: 'طلاقة بلا تردد', icon: '⚡', text: 'تجاوزتِ العقبات وقرأتِ بانسجام ويسر!' },
        { title: 'مستكشفة القصص', icon: '🗺️', text: 'شغفكِ بالقراءة يفتح أمامكِ عوالم المعرفة!' },
        { title: 'صاحبة الصوت الرنان', icon: '🔔', text: 'نبراتكِ المعبرة تحيي معاني الكلمات بجمال!' },
        { title: 'تاج التميز القرائي', icon: '👑', text: 'توجتِ جهودكِ بطلاقة تستحق كل التصفيق!' },
        { title: 'لؤلؤة البيان', icon: '🦪', text: 'بيان ساحر ومخارج حروف متقنة كاللؤلؤ!' },
        { title: 'بطلة الفهم والاستيعاب', icon: '💡', text: 'تقرئين بعقلكِ وقلبكِ وتفهمين ما وراء السطور!' },
        { title: 'قارئة الشغف', icon: '❤️', text: 'حبكِ للغة العربية ينبض في كل صفحة تقرئينها!' },
        { title: 'أميرة الأداء التعبيري', icon: '🎭', text: 'تلوين صوتكِ يجذب انتباه الجميع بحماس!' },
        { title: 'فارسة الوقوف والوصل', icon: '🚦', text: 'تراعين علامات الترقيم كقارئة محترفة!' },
        { title: 'شمس القراءة', icon: '🌞', text: 'طلتكِ عند القراءة تملأ الفصل بهجة وضياء!' },
        { title: 'عاشقة الكتب', icon: '📚', text: 'الكتاب صديقكِ الأوفى ورفيق دربكِ نحو القمة!' },
        { title: 'بلبل الصف الصداح', icon: '🐦', text: 'صوتكِ الجميل يغرد بأحلى الكلمات العربية!' },
        { title: 'ملكة الحوار والنقاش', icon: '💬', text: 'تقرئين وتناقشين بذكاء ولطف وأدب جم!' },
        { title: 'قدوة في الطلاقة', icon: '🌟', text: 'زميلاتكِ يتعلمن منكِ الثقة وسلامة النطق!' },
        { title: 'حارسة مخارج الحروف', icon: '🗝️', text: 'كل حرف يأخذ حقه ومستحقه بلسان فصيح!' },
        { title: 'سفيرة القراءة الحرة', icon: '📖', text: 'تتحدين ذاتكِ في قراءة أكبر عدد من الكتب!' },
        { title: 'وسام الشرف اللغوي', icon: '🎖️', text: 'تقدير استثنائي لإتقانكِ الباهر في القراءة!' }
      ],

      init() {
        this.render();
      },

      setCategory(cat) {
        SoundEngine.playSnap();
        this.category = cat;
        const spBtn = document.getElementById('catSpellingBtn');
        const rdBtn = document.getElementById('catReadingBtn');

        if (cat === 'spelling') {
          if (spBtn) spBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-pink-600 text-white shadow-sm flex items-center gap-1.5 transition';
          if (rdBtn) rdBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition';
        } else {
          if (spBtn) spBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition';
          if (rdBtn) rdBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-purple-600 text-white shadow-sm flex items-center gap-1.5 transition';
        }
        this.render();
      },

      render() {
        const container = document.getElementById('rewardCardsContainer');
        if (!container) return;
        const list = this.category === 'spelling' ? this.cardsSpelling : this.cardsReading;

        container.innerHTML = list.map((card, i) => `
          <div data-onclick="rewardsManager.openAward('${card.title}', '${card.text}')" 
               class="bg-white rounded-3xl p-3 sm:p-4 border-2 border-slate-200 hover:border-pink-300 shadow-sm transition transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center group">
            <span class="text-3xl sm:text-4xl mb-1 group-hover:scale-110 transition-transform">${card.icon}</span>
            <h4 class="text-xs sm:text-sm font-black text-slate-900">${card.title}</h4>
            <span class="text-[10px] text-pink-600 font-extrabold bg-pink-50 px-2 py-0.5 rounded-full mt-1">بطاقة #${i + 1}</span>
            <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">${card.text}</p>
            <button class="mt-2 text-[11px] text-white bg-pink-600 group-hover:bg-pink-700 font-bold px-3 py-1 rounded-xl shadow-xs transition">
              منح البطاقة 🎖️
            </button>
          </div>
        `).join('');
      },

      openAward(title, quote) {
        SoundEngine.playVictory();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });

        const student = (document.getElementById('rewardStudentName')?.value || 'سارة').trim();
        const titleEl = document.getElementById('modalAwardTitle');
        const stEl = document.getElementById('modalAwardStudent');
        const quoteEl = document.getElementById('modalAwardQuote');
        if (titleEl) titleEl.textContent = title;
        if (stEl) stEl.textContent = student;
        if (quoteEl) quoteEl.textContent = `"${quote}"`;

        const modal = document.getElementById('badgeAwardModal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }

        SoundEngine.speakArabic(`مبارك يا ${student}! حصلتِ على وسام: ${title}`);
      },

      closeAwardModal() {
        const modal = document.getElementById('badgeAwardModal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      },

      cheer() {
        SoundEngine.playVictory();
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
      }
    };

    /* ====================================================================
       Whiteboard Pen Controller
       ==================================================================== */
    const whiteboardPen = {
      canvas: null,
      ctx: null,
      drawing: false,
      color: '#2563EB',
      size: 5,
      isEraser: false,
      strokes: [],
      currentStroke: null,
      cssWidth: 1,
      cssHeight: 1,
      dpr: 1,

      init() {
        this.canvas = document.getElementById('interactiveCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.canvas.style.touchAction = 'none';
        this.applyGuideBackground();
        this.resize({ preserve: true });

        let resizeTimer = null;
        const requestResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => this.resize({ preserve: true }), 80);
        };
        window.addEventListener('resize', requestResize);
        window.visualViewport?.addEventListener('resize', requestResize);
        if (window.ResizeObserver && this.canvas.parentElement) {
          this._resizeObserver = new ResizeObserver(requestResize);
          this._resizeObserver.observe(this.canvas.parentElement);
        }

        this.canvas.addEventListener('pointerdown', e => this.start(e), { passive: false });
        this.canvas.addEventListener('pointermove', e => this.draw(e), { passive: false });
        this.canvas.addEventListener('pointerup', e => this.stop(e), { passive: false });
        this.canvas.addEventListener('pointercancel', e => this.stop(e), { passive: false });
        this.canvas.addEventListener('pointerleave', e => {
          if (e.pointerType === 'mouse' && this.drawing) this.stop(e);
        });

        // دعم احتياطي لأجهزة iOS/Android القديمة التي لا ترسل Pointer Events للـCanvas بصورة مستقرة.
        if (!('PointerEvent' in window)) {
          this.canvas.addEventListener('touchstart', e => this.startTouch(e), { passive: false });
          this.canvas.addEventListener('touchmove', e => this.drawTouch(e), { passive: false });
          this.canvas.addEventListener('touchend', e => this.stopTouch(e), { passive: false });
          this.canvas.addEventListener('touchcancel', e => this.stopTouch(e), { passive: false });
        }
      },

      applyGuideBackground() {
        if (!this.canvas) return;
        this.canvas.style.backgroundColor = '#ffffff';
        this.canvas.style.backgroundImage = 'repeating-linear-gradient(to bottom, transparent 0, transparent 44px, #e2e8f0 44px, #e2e8f0 45.5px)';
        this.canvas.style.backgroundSize = '100% 45px';
      },

      resize() {
        if (!this.canvas) return;
        const host = this.canvas.parentElement || this.canvas;
        const rect = host.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width || this.canvas.getBoundingClientRect().width));
        const height = Math.max(260, Math.round(rect.height || this.canvas.getBoundingClientRect().height || 320));
        const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
        if (width === this.cssWidth && height === this.cssHeight && dpr === this.dpr && this.canvas.width > 0) return;

        this.cssWidth = width;
        this.cssHeight = height;
        this.dpr = dpr;
        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.applyGuideBackground();
        this.redraw();
      },

      pointFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: Math.max(0, Math.min(this.cssWidth, e.clientX - rect.left)),
          y: Math.max(0, Math.min(this.cssHeight, e.clientY - rect.top)),
          pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5
        };
      },

      normalizePoint(point) {
        return {
          x: this.cssWidth ? point.x / this.cssWidth : 0,
          y: this.cssHeight ? point.y / this.cssHeight : 0,
          pressure: point.pressure ?? 0.5
        };
      },

      denormalizePoint(point) {
        return {
          x: point.x * this.cssWidth,
          y: point.y * this.cssHeight,
          pressure: point.pressure ?? 0.5
        };
      },

      start(e) {
        if (!this.ctx || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault();
        this.drawing = true;
        try { this.canvas.setPointerCapture(e.pointerId); } catch (_) {}
        const point = this.pointFromEvent(e);
        this.currentStroke = {
          color: this.color,
          size: this.size,
          eraser: this.isEraser,
          points: [this.normalizePoint(point)]
        };
        // نقطة صغيرة عند اللمس/النقر وحده.
        this.drawDot(point, this.currentStroke);
      },

      draw(e) {
        if (!this.drawing || !this.currentStroke || !this.ctx) return;
        e.preventDefault();
        const coalesced = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
        const samples = coalesced && coalesced.length ? coalesced : [e];
        for (const sample of samples) {
          const p = this.pointFromEvent(sample);
          const normalized = this.normalizePoint(p);
          const last = this.currentStroke.points[this.currentStroke.points.length - 1];
          if (last) {
            const dx = normalized.x - last.x;
            const dy = normalized.y - last.y;
            if ((dx * dx + dy * dy) < 0.000002) continue;
          }
          this.currentStroke.points.push(normalized);
          this.drawLatestSegment(this.currentStroke);
        }
      },

      stop(e) {
        if (!this.drawing) return;
        this.drawing = false;
        if (this.currentStroke?.points?.length) this.strokes.push(this.currentStroke);
        this.currentStroke = null;
        if (this.ctx) this.ctx.globalCompositeOperation = 'source-over';
        if (e) {
          try { this.canvas.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      },

      touchPoint(touch) {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: Math.max(0, Math.min(this.cssWidth, touch.clientX - rect.left)),
          y: Math.max(0, Math.min(this.cssHeight, touch.clientY - rect.top)),
          pressure: Number.isFinite(touch.force) && touch.force > 0 ? touch.force : 0.5
        };
      },

      startTouch(e) {
        if (!e.touches?.length || !this.ctx) return;
        e.preventDefault();
        this.drawing = true;
        const point = this.touchPoint(e.touches[0]);
        this.currentStroke = { color: this.color, size: this.size, eraser: this.isEraser, points: [this.normalizePoint(point)] };
        this.drawDot(point, this.currentStroke);
      },

      drawTouch(e) {
        if (!this.drawing || !this.currentStroke || !e.touches?.length) return;
        e.preventDefault();
        const point = this.touchPoint(e.touches[0]);
        this.currentStroke.points.push(this.normalizePoint(point));
        this.drawLatestSegment(this.currentStroke);
      },

      stopTouch(e) {
        e?.preventDefault?.();
        this.stop();
      },

      configureStroke(stroke, pressure = 0.5) {
        const ctx = this.ctx;
        ctx.globalCompositeOperation = stroke.eraser ? 'destination-out' : 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.color;
        const pressureFactor = 0.82 + Math.min(1, Math.max(0, pressure)) * 0.36;
        ctx.lineWidth = (stroke.eraser ? stroke.size * 3.4 : stroke.size) * pressureFactor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      },

      drawDot(point, stroke) {
        this.configureStroke(stroke, point.pressure);
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, Math.max(1, this.ctx.lineWidth / 2), 0, Math.PI * 2);
        this.ctx.fill();
      },

      drawLatestSegment(stroke) {
        const points = stroke.points;
        if (points.length < 2) return;
        const p1 = this.denormalizePoint(points[Math.max(0, points.length - 3)]);
        const p2 = this.denormalizePoint(points[points.length - 2]);
        const p3 = this.denormalizePoint(points[points.length - 1]);
        this.configureStroke(stroke, p3.pressure);
        this.ctx.beginPath();
        if (points.length === 2) {
          this.ctx.moveTo(p2.x, p2.y);
          this.ctx.lineTo(p3.x, p3.y);
        } else {
          const mid1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
          const mid2 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
          this.ctx.moveTo(mid1.x, mid1.y);
          this.ctx.quadraticCurveTo(p2.x, p2.y, mid2.x, mid2.y);
        }
        this.ctx.stroke();
      },

      drawStroke(stroke) {
        if (!stroke.points?.length) return;
        if (stroke.points.length === 1) {
          this.drawDot(this.denormalizePoint(stroke.points[0]), stroke);
          return;
        }
        const pts = stroke.points.map(p => this.denormalizePoint(p));
        this.configureStroke(stroke, pts[0].pressure);
        this.ctx.beginPath();
        this.ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i + 1].x) / 2;
          const midY = (pts[i].y + pts[i + 1].y) / 2;
          this.ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }
        const last = pts[pts.length - 1];
        this.ctx.lineTo(last.x, last.y);
        this.ctx.stroke();
      },

      redraw() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        for (const stroke of this.strokes) this.drawStroke(stroke);
        if (this.currentStroke) this.drawStroke(this.currentStroke);
        this.ctx.globalCompositeOperation = 'source-over';
      },

      drawGuideLines() { this.applyGuideBackground(); },

      setColor(c) {
        SoundEngine.playSnap();
        this.color = c;
        this.isEraser = false;
        const btn = document.getElementById('penEraserBtn');
        if (btn) btn.classList.remove('ring-2', 'ring-pink-500');
      },

      setSize(value) {
        const n = Number(value);
        if (Number.isFinite(n)) this.size = Math.max(2, Math.min(18, n));
        const out = document.getElementById('penSizeValue');
        if (out) out.textContent = `${this.size}px`;
      },

      setEraser() {
        SoundEngine.playSnap();
        this.isEraser = true;
        const btn = document.getElementById('penEraserBtn');
        if (btn) btn.classList.add('ring-2', 'ring-pink-500');
      },

      undo() {
        if (!this.strokes.length) return;
        this.strokes.pop();
        SoundEngine.playSnap();
        this.redraw();
      },

      clear() {
        SoundEngine.playSnap();
        this.strokes = [];
        this.currentStroke = null;
        this.redraw();
        this.applyGuideBackground();
      }
    };


    /* ====================================================================
       App Main Controller
       ==================================================================== */
    const app = {
      currentFont: 'font-baloo',

      init() {
        // Apply default kid-friendly font class
        document.body.classList.add(this.currentFont);
        this.syncArabicFontVariable();

        boardManager.init();
        exerciseBoard.init();
        vowelPosters.init();
        positionsTable.init();
        pyramidManager.init();
        bearManager.init();
        rewardsManager.init();
        whiteboardPen.init();
        fontStudio.init();

        document.body.addEventListener('click', () => {
          SoundEngine.init();
        }, { once: true });
      },

      syncArabicFontVariable() {
        if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') return;
        const family = getComputedStyle(document.body).fontFamily || "system-ui, 'SF Arabic', 'Geeza Pro', sans-serif";
        document.documentElement.style.setProperty('--arabic-font-family', family);
      },

      changeAppFont(fontClass) {
        SoundEngine.playSnap();
        // Remove previous font classes
        FONT_REPOSITORY.forEach(f => document.body.classList.remove(f.id));
        
        this.currentFont = fontClass;
        document.body.classList.add(fontClass);
        this.syncArabicFontVariable();

        const sel = document.getElementById('appFontPicker');
        if (sel && sel.value !== fontClass) sel.value = fontClass;

        const fontMeta = FONT_REPOSITORY.find(f => f.id === fontClass);
        const fontName = fontMeta ? fontMeta.nameAr : fontClass;

        this.showToast(`تم تفعيل الخط: ${fontName}`);
        
        fontStudio.updateActiveBadge();
        
        // Refresh board and shapes spotlight to sync layout
        boardManager.renderBoard();
        boardManager.renderLetterShapesSpotlight();
      },

      switchTab(tabId) {
        SoundEngine.playSnap();
        document.querySelectorAll('.station-view').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById(`station-${tabId}`);
        if (target) target.classList.remove('hidden');

        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.className = 'tab-btn px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 text-slate-700 hover:bg-slate-200 transition';
        });
        const active = document.getElementById(`tab-${tabId}`);
        if (active) {
          active.className = 'tab-btn active px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 bg-rose-600 text-white shadow-sm transition';
        }
      },

      toggleAudio() {
        SoundEngine.isMuted = !SoundEngine.isMuted;
        const icon = document.getElementById('soundIcon');
        const label = document.getElementById('soundLabel');
        if (SoundEngine.isMuted) {
          if (icon) icon.textContent = '🔇';
          if (label) label.textContent = 'صامت';
          this.showToast("تم كتم المؤثرات الصوتية");
        } else {
          if (icon) icon.textContent = '🔊';
          if (label) label.textContent = 'الصوت مفعّل';
          SoundEngine.playSnap();
          this.showToast("تم تفعيل المؤثرات الصوتية");
        }
      },

      toggleWhiteboardOverlay() {
        SoundEngine.playSnap();
        const modal = document.getElementById('whiteboardOverlayModal');
        if (!modal) return;
        if (modal.classList.contains('hidden')) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          requestAnimationFrame(() => requestAnimationFrame(() => whiteboardPen.resize({ preserve: true })));
        } else {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      },

      showToast(msg) {
        const toast = document.getElementById('toast');
        const label = document.getElementById('toastMsg');
        if (!toast || !label) return;
        label.textContent = msg;
        toast.style.opacity = '1';
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
          toast.style.opacity = '0';
        }, 2200);
      }
    };

    
// Security-hardened declarative UI dispatcher.
// No eval/new Function. Only explicit controllers and method names are callable.
const ACTION_ROOTS = Object.freeze({
  app,
  boardManager,
  exerciseBoard,
  vowelPosters,
  positionsTable,
  pyramidManager,
  bearManager,
  rewardsManager,
  whiteboardPen,
  fontStudio
});

function parseActionArg(raw, element) {
  const token = raw.trim();
  if (!token) return undefined;
  if (token === 'this.value') return element?.value;
  if (token === 'true') return true;
  if (token === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(token)) return Number(token);
  const quote = token[0];
  if ((quote === "'" || quote === '"') && token[token.length - 1] === quote) {
    return token.slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  throw new Error('Unsupported UI action argument');
}

function splitActionArgs(source) {
  const text = source.trim();
  if (!text) return [];
  const parts = [];
  let buf = '', quote = null, escaped = false;
  for (const ch of text) {
    if (escaped) { buf += ch; escaped = false; continue; }
    if (ch === '\\') { buf += ch; escaped = true; continue; }
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') { quote = ch; buf += ch; continue; }
    if (ch === ',') { parts.push(buf); buf = ''; continue; }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);
  return parts;
}

function invokeDeclaredAction(action, element, event) {
  let text = String(action || '').trim();
  if (!text) return;

  // Allow only the explicit propagation-control prefix used by piece delete buttons.
  if (text.startsWith('event.stopPropagation();')) {
    event.stopPropagation();
    text = text.slice('event.stopPropagation();'.length).trim();
  }

  // The only conditional handler in the static UI: Enter to add a custom word.
  const enterMatch = text.match(/^if\(event\.key===['"]Enter['"]\)\{(.+)\}$/);
  if (enterMatch) {
    if (event.key !== 'Enter') return;
    return invokeDeclaredAction(enterMatch[1], element, event);
  }

  const match = text.match(/^([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\((.*)\)$/s);
  if (!match) throw new Error('Blocked unrecognized UI action');
  const [, rootName, methodName, argsSource] = match;
  const root = ACTION_ROOTS[rootName];
  if (!root || methodName.startsWith('_') || typeof root[methodName] !== 'function') {
    throw new Error('Blocked unauthorized UI action');
  }
  const args = splitActionArgs(argsSource).map(arg => parseActionArg(arg, element));
  return root[methodName](...args);
}

function installDeclarativeUiHandlers() {
  const mappings = [
    ['click', 'data-onclick'],
    ['change', 'data-onchange'],
    ['input', 'data-oninput'],
    ['keydown', 'data-onkeydown'],
    ['keyup', 'data-onkeyup']
  ];

  for (const [eventName, attrName] of mappings) {
    document.addEventListener(eventName, event => {
      const target = event.target instanceof Element ? event.target.closest(`[${attrName}]`) : null;
      if (!target) return;
      try {
        invokeDeclaredAction(target.getAttribute(attrName), target, event);
      } catch (error) {
        console.warn('Blocked UI action:', error);
      }
    });
  }
}

// Node-only bridge for local unit tests. It is never exposed in browsers.
if (typeof process !== 'undefined' && process.versions?.node) {
  Object.assign(globalThis.window || globalThis, {
    SoundEngine, ArabicText, boardManager, exerciseBoard, vowelPosters, positionsTable,
    pyramidManager, bearManager, rewardsManager, whiteboardPen, fontStudio, app
  });
}

window.addEventListener('DOMContentLoaded', () => {
  installDeclarativeUiHandlers();
  app.init();
});
