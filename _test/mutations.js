/* Mutation check for verify-report.js (guide §10.4: an assertion that cannot fail proves nothing).
   Each mutation breaks one thing the harness claims to guard, runs verify-report.js, and expects
   it to FAIL naming that thing; the file is restored afterwards (also on a crash, via finally).
   Run from the repo root with the same NODE_PATH as verify-report.js:
     node _test/mutations.js
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const P = rel => path.join(ROOT, rel);
const M5 = 'methodica-ar-science-volume-liquid-01-05/js/main.js';
const MUTATIONS = [
  { name: 'screen map loses a key', file: M5, from: "  3: ['002', 2]     // video", to: "  //3: ['002', 2]     // video", expect: 'exactly TOTAL_SCREENS keys' },
  { name: 'component slug typo', file: M5, from: "var XAPI_COMP_SLUG     = 'methodica-ar-science-volume-liquid-01-05';", to: "var XAPI_COMP_SLUG     = 'methodica-ar-science-volume-liquid-01-5';", expect: 'XAPI_COMP_SLUG' },
  { name: 'a check loses its flush', file: M5, from: "  }\n  try { flushResumeSave(); } catch (e) {}   // after the last commitment, every path (guide §8.3)\n}\n\nfunction s1qMark(", to: "  }\n}\n\nfunction s1qMark(", expect: 's1qCheck: a flush follows' },
  { name: 'widget_referrer comes back', file: M5, from: "  const p = ['enablejsapi=1',", to: "  const vars = { widget_referrer: window.location.href };\n  const p = ['enablejsapi=1',", expect: 'no widget_referrer' },
  { name: 'a cross-part hop loses its DEV_NAV guard', file: 'unit-js/30-nav.js', from: "function goToPart(folder) {\n  if (typeof DEV_NAV === 'undefined' || !DEV_NAV) return;", to: "function goToPart(folder) {", expect: 'cross-part hop is behind a DEV_NAV guard' },
  { name: 'a painter throws', file: 'unit-js/45-resume-paint.js', from: "  var correct = c.selected === c.correctId;", to: "  var correct = c.selected === c.correctId; undefinedName.x = 1;", expect: 'raises no [resume] error' },
  { name: 'one part loses a ?v=', file: 'methodica-ar-science-volume-liquid-01-03/index.html', from: '<script src="../unit-js/20-xapi.js?v=3"></script>', to: '<script src="../unit-js/20-xapi.js"></script>', expect: 'carries ?v=' },
  { name: 'O-8: items fall back to the library aggregate again', file: 'unit-js/20-xapi.js', from: '  return _xapiIsEval(item) ? _xapiDefaultItemResult(item) : null;', to: '  return null;', expect: 'O-8' },
  { name: 'Hebrew text comes back on screen', file: M5, from: "'فيديو: ملعقة تنقذ الأرواح'", to: "'סרטון: כפית שמצילה חיים'", expect: 'no Hebrew outside comments' },
  { name: 'a question id in the ?q= shape', file: 'metadata/methodica-ar-science-volume-liquid-01-02.json', from: '-002/q2"', to: '-002/?q=q2"', expect: 'questionId is <item id>qN' },
  { name: '007 falls back to the default (escape path fails again)', file: 'methodica-ar-science-volume-liquid-01-01/js/main.js', from: "var XAPI_ITEM_RESULT = {\n  '007': function", to: "var XAPI_ITEM_RESULT_OFF = {\n  '007': function", expect: '007: escape path (q2 only), correct' },
  { name: 'the old character key comes back', file: 'unit-js/00-util.js', from: "  let c = null;", to: "  let c = localStorage.getItem('lomda_selectedCharacter');", expect: "'lomda_selectedCharacter' is not read" },
  /* 2026-11-05: MOE monday items, response format, resume hardening, -l leave save */
  { name: 'the drain captures the live page again', file: 'unit-js/40-resume.js', from: "    try { persistUnitState(_unitState); } catch (e) { console.error('[resume] drain', e); }", to: "    try { persistUnitState(captureUnitState()); } catch (e) { console.error('[resume] drain', e); }", expect: 'b: the drain persists the document AS READ' },
  { name: 'the leave save bypasses saveState720OnLeave', file: 'unit-js/40-resume.js', from: "  if (_leavingToNextPart) return;\n  flushResumeSaveLeaving();", to: "  if (_leavingToNextPart) return;\n  flushResumeSave();", expect: 'pagehide saves through saveState720OnLeave' },
  { name: 'true/false sends the label again', file: 'methodica-ar-science-volume-liquid-01-02/js/main.js', from: "{ value: s17qSelectedParts.b === 'yes' }", to: "xapiAnswerText(document.querySelector('#s2 .scq-opt[data-part=\"b\"][data-id=\"' + s17qSelectedParts.b + '\"]'))", expect: '002 q2 true-false passes a boolean' },
  { name: 'multi-select joins with ", " again', file: 'methodica-ar-science-volume-liquid-01-03/js/main.js', from: "{ choices: [...s2mcSelected].map(id => xapiAnswerText(document.querySelector('#s2 .s5q-card[data-id=\"' + id + '\"]'))) }", to: "[...s2mcSelected].map(id => xapiAnswerText(document.querySelector('#s2 .s5q-card[data-id=\"' + id + '\"]'))).join(', ')", expect: 'no xapiAnswered call joins' },
  { name: 'a metadata answer drifts from the screen', file: 'metadata/methodica-ar-science-volume-liquid-01-06.json', from: '"مخبار مدرّج بسِعة 50 ملل",', to: '"مخبار مدرّج بسِعة 50 مل",', expect: 'resolves to a metadata answer' }
];

let caught = 0;
for (const m of MUTATIONS) {
  const file = P(m.file); const orig = fs.readFileSync(file, 'utf8');
  if (!orig.includes(m.from)) { console.log('SKIP (anchor gone): ' + m.name); continue; }
  try {
    fs.writeFileSync(file, orig.replace(m.from, m.to));
    const r = spawnSync(process.execPath, [path.join(__dirname, 'verify-report.js')], { encoding: 'utf8', env: process.env });
    const out = r.stdout + r.stderr;
    const hit = r.status !== 0 && out.includes(m.expect);
    if (hit) caught++;
    console.log((hit ? 'caught ' : 'MISSED ') + m.name + (hit ? '' : '\n  exit=' + r.status + ' ' + out.split('\n').filter(l => /FAIL|->|\[/.test(l)).slice(0, 4).join('\n  ')));
  } finally { fs.writeFileSync(file, orig); }
}
console.log('\n' + caught + ' / ' + MUTATIONS.length + ' mutations caught');
process.exit(caught === MUTATIONS.length ? 0 : 1);
