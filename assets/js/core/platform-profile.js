export const PLATFORM_PROFILES = Object.freeze({
  ios: {
    id: 'ios', label: 'iOS PWA', input: 'touch', focus: 'touch-first',
    notes: 'Safe Area + لمس + ضغط مطوّل + سحب بالإصبع'
  },
  android: {
    id: 'android', label: 'Android PWA', input: 'touch', focus: 'touch-first',
    notes: 'لمس + شاشات متعددة المقاسات + تثبيت PWA'
  },
  webos: {
    id: 'webos', label: 'webOS TV PWA', input: 'remote', focus: 'focus-first',
    notes: 'ريموت / D-pad + OK + تنقل بالتركيز'
  },
  desktop: {
    id: 'desktop', label: 'Web/Desktop', input: 'pointer', focus: 'pointer-first',
    notes: 'فأرة + لوحة مفاتيح'
  }
});

export function detectPlatformProfile(userAgent = '') {
  const ua = String(userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')).toLowerCase();
  if (/web0s|webos|netcast/.test(ua)) return PLATFORM_PROFILES.webos;
  if (/iphone|ipad|ipod/.test(ua) || (/macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) return PLATFORM_PROFILES.ios;
  if (/android/.test(ua)) return PLATFORM_PROFILES.android;
  return PLATFORM_PROFILES.desktop;
}
