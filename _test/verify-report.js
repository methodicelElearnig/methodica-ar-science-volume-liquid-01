/* Structural + runtime verification of the reporting / issue-reporting / resume layer of
   methodica-ar-science-volume-liquid-01, the Arabic twin of methodica-science-volume-liquid-01
   (this file: the Hebrew suite, ids and keys switched to Arabic, plus section 8 for the Arabic text).

   Every assertion here guards a failure that is SILENT at runtime: the lomda keeps working and
   the data is simply wrong or missing. Screen-level looks (does this option turn green) are loud
   and are checked in a browser instead. Written for this unit's screens and ids — not a port of a
   sibling unit's suite (guide ADDING-REPORTING-AND-RESUME.md §10).

   Static checks need only node and always run. The runtime section needs jsdom and acorn,
   installed OUTSIDE this OneDrive-synced tree and reached through NODE_PATH (see README.md).
   Without them the static checks still run and the rest is reported as skipped.

   Optional argument: a directory to check instead of the repo (e.g. a built package).
     node _test/verify-report.js [dir]
*/
'use strict';
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const UNIT = 'methodica-ar-science-volume-liquid-01';
const PARTS = ['01', '02', '03', '04', '05', '06', '07'];
const PREFIX = 'https://lomdot.education.gov.il/metodica/720active/ar/science/volume-liquid/01/';
const IS_REPO = fs.existsSync(path.join(BASE, '_test'));

const partDir = p => path.join(BASE, UNIT + '-' + p);
const read = f => fs.readFileSync(f, 'utf8');
const readJson = f => JSON.parse(read(f).replace(/^\uFEFF/, ''));
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');

let pass = 0; const failures = []; const skipped = [];
function ok(scope, name, cond, detail) {
  if (cond) { pass++; return; }
  failures.push('  [' + scope + '] ' + name + (detail ? '\n      -> ' + detail : ''));
}
const section = t => console.log('\n' + t);

function tryRequire(m) { try { return require(m); } catch (e) { return null; } }
const acorn = tryRequire('acorn');
const jsdomMod = tryRequire('jsdom');

/* ── per-part sources ── */
const src = {}, html = {}, meta = {};
for (const p of PARTS) {
  src[p]  = read(path.join(partDir(p), 'js', 'main.js'));
  html[p] = read(path.join(partDir(p), 'index.html'));
  const mf = path.join(BASE, 'metadata', UNIT + '-' + p + '.json');
  meta[p] = fs.existsSync(mf) ? readJson(mf) : null;
}
const unitJs = {};
for (const f of fs.readdirSync(path.join(BASE, 'unit-js'))) if (f.endsWith('.js')) unitJs[f] = read(path.join(BASE, 'unit-js', f));

function parseMap(s) {
  const m = /var SCREEN_TO_SUBCONTENT = \{([\s\S]*?)\n\};/.exec(s);
  if (!m) return null;
  const map = {};
  const body = m[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');   // a commented-out key is not a key
  const re = /(\d+)\s*:\s*(null|\[\s*'(\d{3})'\s*,\s*\d+\s*\])/g; let e;
  while ((e = re.exec(body))) map[+e[1]] = e[3] || null;
  return map;
}
const totalScreens = s => { const m = /const TOTAL_SCREENS\s*=\s*(\d+)/.exec(s); return m ? +m[1] : null; };
const strVar = (s, name) => { const m = new RegExp("var " + name + "\\s*=\\s*'([^']*)'").exec(s); return m ? m[1] : null; };

/* ══════════════ 1. catalogue identity ══════════════ */
section('1. catalogue identity');
const ident = unitJs['10-identity.js'];
ok('identity', 'XAPI_ID_PREFIX is the Arabic volume-liquid prefix', strVar(ident, 'XAPI_ID_PREFIX') === PREFIX, strVar(ident, 'XAPI_ID_PREFIX'));
const unitIdM = /window\.XAPI_UNIT_ID = '([^']+)'/.exec(ident);
const unitMeta = readJson(path.join(BASE, 'metadata', UNIT + '_unit.json'));
ok('identity', 'XAPI_UNIT_ID equals metadata _unit.json id (bare slug)', unitIdM && unitIdM[1] === unitMeta.id && unitMeta.id === UNIT, unitIdM && unitIdM[1]);
const metaFiles = fs.readdirSync(path.join(BASE, 'metadata'));
ok('identity', 'metadata holds exactly the unit file + 7 components', metaFiles.filter(f => f.endsWith('.json')).length === 8, metaFiles.join(', '));
ok('identity', 'no "mass-liquid" anywhere in metadata', metaFiles.every(f => !/mass/i.test(f) && !/mass-liquid/i.test(read(path.join(BASE, 'metadata', f)))));
for (const p of PARTS) {
  const s = src[p], md = meta[p], slug = UNIT + '-' + p;
  ok(p, 'metadata file exists', !!md);
  if (!md) continue;
  ok(p, 'XAPI_COMP_SLUG = ' + slug, strVar(s, 'XAPI_COMP_SLUG') === slug, strVar(s, 'XAPI_COMP_SLUG'));
  ok(p, "XAPI_COMP_ID is PREFIX + slug + '/'", /var XAPI_COMP_ID\s*=\s*XAPI_ID_PREFIX \+ XAPI_COMP_SLUG \+ '\/';/.test(s));
  ok(p, 'METADATA.id === PREFIX + slug + "/" (byte for byte)', md.id === PREFIX + slug + '/', md.id);
  ok(p, 'XAPI_METADATA_FILE points at ../metadata/<slug>.json', strVar(s, 'XAPI_METADATA_FILE') === '../metadata/' + slug + '.json');
  ok(p, 'learningUnitId is the unit slug', md.learningUnitId === UNIT, md.learningUnitId);
  (md.subContent || []).forEach(it => {
    ok(p, 'item id shape ' + it.id.slice(-8), new RegExp('^' + md.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + slug + '-\\d{3}/$').test(it.id), it.id);
    (it.questions || []).forEach(q => ok(p, 'questionId is <item id>qN', q.questionId.startsWith(it.id) && /^q\d+$/.test(q.questionId.slice(it.id.length)), q.questionId));
  });
}

/* ══════════════ 2. screen map ══════════════ */
section('2. screen map vs metadata');
for (const p of PARTS) {
  const map = parseMap(src[p]), N = totalScreens(src[p]), md = meta[p];
  ok(p, 'SCREEN_TO_SUBCONTENT parses as a literal', !!map);
  if (!map || !md) continue;
  const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
  ok(p, 'exactly TOTAL_SCREENS keys, 0..N-1', N !== null && keys.length === N && keys.every((k, i) => k === i), keys.join(',') + ' / N=' + N);
  ok(p, '.screen sections in index.html = TOTAL_SCREENS', (html[p].replace(/<!--[\s\S]*?-->/g, '').match(/<section class="screen[ "]/g) || []).length === N);
  const mapped = new Set(Object.values(map).filter(Boolean));
  const items = new Set((md.subContent || []).map(it => it.id.replace(/\/$/, '').split('-').pop()));
  ok(p, 'every mapped suffix exists in metadata', [...mapped].every(x => items.has(x)), [...mapped].filter(x => !items.has(x)).join(','));
  ok(p, 'every catalogue item has a screen', [...items].every(x => mapped.has(x)), [...items].filter(x => !mapped.has(x)).join(','));
  const evalM = /var XAPI_EVAL_ITEMS\s*=\s*\{([^}]*)\}/.exec(src[p]);
  const evals = evalM ? (evalM[1].match(/'(\d{3})'/g) || []).map(x => x.slice(1, -1)) : null;
  const withQ = new Set((md.subContent || []).filter(it => (it.questions || []).length).map(it => it.id.replace(/\/$/, '').split('-').pop()));
  ok(p, 'XAPI_EVAL_ITEMS = the items that declare questions', evals && evals.length === withQ.size && evals.every(x => withQ.has(x)), evals && evals.join(','));
  const endBtn = strVar(src[p], 'XAPI_END_BTN');
  ok(p, 'XAPI_END_BTN names a button in index.html', endBtn && new RegExp('id="' + endBtn + '"').test(html[p]), endBtn);
}

/* ══════════════ 3. layer wiring ══════════════ */
section('3. layer wiring');
const ORDER = ['10-identity', '20-xapi', '25-report', '40-resume', '45-resume-paint', '50-loader'];
const refsOf = h => [...h.matchAll(/(?:src|href)="(\.\.\/unit-(?:js|css|assets)\/[^"?]+)(\?v=(\d+))?"/g)].map(m => ({ ref: m[1], v: m[3] }));
const vByRef = {};
for (const p of PARTS) {
  const h = html[p];
  const scripts = [...h.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1].replace(/\?v=\d+$/, ''));
  const pos = n => scripts.indexOf('../unit-js/' + n + '.js');
  ok(p, 'reporting layer tags in guide order (10 20 25 40 45 50)', ORDER.every((n, i) => pos(n) >= 0 && (i === 0 || pos(n) > pos(ORDER[i - 1]))), scripts.join(' '));
  ok(p, 'js/main.js after the layer, 90-boot.js last', scripts.indexOf('js/main.js') > pos('50-loader') && scripts[scripts.length - 1] === '../unit-js/90-boot.js');
  ok(p, 'every code reference carries ?v=', [...h.matchAll(/(?:src|href)="((?:\.\.\/unit-(?:js|css)|js|css)\/[^"]+)"/g)].every(m => /\?v=\d+$/.test(m[1])));
  const iStyle = h.indexOf('css/style.css'), iRep = h.indexOf('unit-css/25-report.css');
  ok(p, '25-report.css linked after the part stylesheet', iStyle > 0 && iRep > iStyle);
  for (const r of refsOf(h)) (vByRef[r.ref] = vByRef[r.ref] || new Set()).add(r.v || '-');
  /* dialogs */
  const appStart = h.indexOf('<div id="app">'), appEnd = h.indexOf('</div><!-- /#app -->');
  ['report-modal', 'report-thanks-modal', 'report-confirm-modal'].forEach(id => {
    const i = h.indexOf('id="' + id + '"');
    ok(p, id + ' inside #app, starts hidden', i > appStart && i < appEnd && /^[^>]*\bhidden\b/.test(h.slice(i, h.indexOf('>', i))));
  });
  const lastScreenEnd = h.lastIndexOf('</section>');
  ok(p, 'dialogs sit outside every .screen', h.indexOf('id="report-modal"') > lastScreenEnd);
  ok(p, 'exactly 3 report-select options', (h.match(/class="report-select-option"/g) || []).length === 3);
  ok(p, 'a .flag-btn exists', /class="flag-btn"/.test(h));
  const cover = h.indexOf('id="boot-cover"');
  ok(p, 'boot cover in the markup, before #app (a sibling, not a child)', cover > 0 && cover < appStart);
  ok(p, 'no Google Fonts link', !/fonts\.(googleapis|gstatic)\.com/.test(h));
  if (IS_REPO) ok(p, 'index_dev.html frames index.html?dev=1', /src="index\.html\?dev=1"/.test(read(path.join(partDir(p), 'index_dev.html'))));
  else ok(p, 'index_dev.html is NOT in the package', !fs.existsSync(path.join(partDir(p), 'index_dev.html')));
}
for (const [ref, vs] of Object.entries(vByRef)) ok('all', '?v= identical across parts: ' + ref, vs.size === 1, [...vs].join(' / '));
const loader = unitJs['50-loader.js'];
const letter = /'xapi-720-([a-z])\.js'\s*:\s*'xapi-720-([a-z])\.js'/.exec(loader);
const rx = /XAPI_USING_G = \/xapi-720-\[([a-z]+)\]\\\.js\//.exec(loader);
ok('loader', 'resume library letter and the -i letter are inside the XAPI_USING_G regex', letter && rx && rx[1].includes(letter[1]) && rx[1].includes(letter[2]), letter && letter.slice(1).join(',') + ' / ' + (rx && rx[1]));
ok('loader', 'the local stub name matches the regex', fs.existsSync(path.join(BASE, '_test')) ? /xapi-720-k\.js/.test(fs.readdirSync(path.join(BASE, '_test')).join(' ')) : true);
ok('identity', 'RESUME_ENABLED is on', /var RESUME_ENABLED = true;/.test(ident));
ok('identity', 'DEV_NAV needs ?dev=1 AND no ?registration', /DEV_NAV = _devQ\.get\('dev'\) === '1' && !_devQ\.has\('registration'\)/.test(ident));
const css = read(path.join(BASE, 'unit-css', '25-report.css'));
ok('css', '.report-modal-overlay[hidden] { display: none } exists', /\.report-modal-overlay\[hidden\]\s*\{[^}]*display:\s*none/.test(css));
const report = unitJs['25-report.js'];
ok('report', 'the one 720 Google form target', /REPORT_FORM_ACTION\s*=\s*\n?\s*'https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/formResponse'/.test(report));

/* ══════════════ 4. names, routing, D-1, character, legacy ══════════════ */
section('4. names, routing, the YouTube leak, the character, legacy files');
function topNames(code) {
  if (!acorn) return null;
  return acorn.parse(code, { ecmaVersion: 'latest' }).body.flatMap(n => n.type === 'FunctionDeclaration' ? [n.id.name]
    : n.type === 'VariableDeclaration' ? n.declarations.map(d => d.id.name) : []);
}
if (acorn) {
  const layerNames = new Map();
  for (const [f, code] of Object.entries(unitJs)) for (const n of topNames(code)) layerNames.set(n, f);
  const HOOKS = ['capturePartPayload', 'applyResumeVars', 'applyResumeDom', 'restoreScreenUI'];
  for (const p of PARTS) {
    const names = topNames(src[p]);
    const clash = names.filter(n => layerNames.has(n) && !HOOKS.includes(n));
    ok(p, 'no top-level name declared in both the shared layer and main.js', clash.length === 0, clash.map(n => n + ' (' + layerNames.get(n) + ')').join(', '));
  }
} else skipped.push('name-clash scan (acorn not found)');
const allCode = Object.assign({}, ...PARTS.map(p => ({ ['main.js ' + p]: src[p] })), unitJs);
for (const [f, code] of Object.entries(allCode)) {
  const c = stripComments(code);
  const hops = [...c.matchAll(/location\.(href\s*=[^=]|replace\()/g)];
  if (!hops.length) continue;
  /* every hop must sit in a function that is guarded by DEV_NAV */
  const guarded = hops.every(m => { const fnStart = c.lastIndexOf('function ', m.index); return fnStart >= 0 && /DEV_NAV/.test(c.slice(fnStart, m.index)); });
  ok('routing', f + ': every cross-part hop is behind a DEV_NAV guard', guarded);
}
ok('routing', 'no unit-level completed (xapiCompleteUnit) anywhere', Object.values(allCode).every(c => !/xapiCompleteUnit\s*\(/.test(stripComments(c))));
const p05 = stripComments(src['05']);
ok('D-1', 'part 05: no widget_referrer', !/widget_referrer/.test(p05));
ok('D-1', 'part 05: YT.Player attaches to our own iframe (ytMountIframe), no videoId/host/playerVars', /ytMountIframe\(/.test(p05) && !/new YT\.Player\('/.test(p05) && !/videoId\s*:/.test(p05) && !/playerVars/.test(p05));
ok('D-1', 'part 05: the embed origin comes from location.origin, never href', /location\.origin/.test(p05) && !/src\s*=.*location\.href/.test(p05));
/* MOE 2026-10-08: the challenge (05) reports its real score; success only at >= 60% of the 2 declared questions. */
ok('01', '007 is scored over the questions of the path taken (XAPI_ITEM_RESULT[\'007\'])',
  /var XAPI_ITEM_RESULT = \{\s*'007': function/.test(stripComments(src['01'])));
ok('05', 'challenge: goToNextPart sends success = correct/2 >= 0.6 with the real scaled score',
  /var _s = xapiCorrectCount\(\) \/ 2;\s*xapiEndComponent\(\{ success: _s >= 0\.6, score: \{ scaled: _s \} \}/.test(p05) && !/success: true/.test(/function goToNextPart\(\) \{[\s\S]*?\n\}/.exec(p05)[0]));
ok('character', 'UI_CHARACTER_KEY is namespaced to this unit', /UI_CHARACTER_KEY = 'methodica_ar_science_volume_liquid_01_selectedCharacter'/.test(unitJs['40-resume.js']));
ok('character', "the origin-wide 'lomda_selectedCharacter' is not read or written", Object.values(allCode).every(c => !/lomda_selectedCharacter/.test(stripComments(c))));
ok('character', 'part 01 S0 writes through setUnitCharacter', /setUnitCharacter\(cardEl\.dataset\.value\)/.test(src['01']));
for (const p of PARTS) {
  ok(p, 'no per-part motion copies grew back', !fs.existsSync(path.join(partDir(p), 'js', 'motion.js')) && !fs.existsSync(path.join(partDir(p), 'css', 'motion.css')));
  ok(p, 'no .ttf fonts grew back', !fs.existsSync(path.join(partDir(p), 'assets', 'fonts')) || fs.readdirSync(path.join(partDir(p), 'assets', 'fonts')).every(f => !/\.ttf$/i.test(f)));
}
if (IS_REPO) ok('legacy', 'scripts/sync-motion.ps1 did not grow back', !fs.existsSync(path.join(BASE, 'scripts', 'sync-motion.ps1')));

/* ══════════════ 5. resume wiring (static) ══════════════ */
section('5. resume wiring');
for (const p of PARTS) {
  const s = src[p];
  ['capturePartPayload', 'applyResumeVars', 'applyResumeDom', 'restoreScreenUI'].forEach(h => ok(p, 'hook ' + h + ' defined', new RegExp('function ' + h + '\\(').test(s)));
  const g = /function goTo\(n\) \{[\s\S]*?\n\}/.exec(s);
  const body = g ? g[0] : '';
  const iR = body.indexOf('repaintScreen(n)'), iX = body.indexOf('xapiOnScreen(n)'), iS = body.indexOf('scheduleResumeSave()'), iA = body.indexOf("classList.add('active')");
  ok(p, "goTo: .active, then repaintScreen, xapiOnScreen, scheduleResumeSave", iA > 0 && iR > iA && iX > iR && iS > iX);
  ok(p, 'restoreScreenUI never throws (wrapped)', /function restoreScreenUI\(n\) \{\s*try \{/.test(s));
}
/* The flush contract (guide §8.3, D-13): in every function that commits an answer (calls
   xapiAnswered), a flushResumeSave follows the commitment, and every return after the first
   commitment is preceded by a flush. Brace-matched by the parser, not by naming convention. */
if (acorn) {
  let walk = tryRequire('acorn-walk');
  for (const p of PARTS) {
    const ast = acorn.parse(src[p], { ecmaVersion: 'latest' });
    let committing = 0;
    for (const fn of ast.body.filter(n => n.type === 'FunctionDeclaration')) {
      const code = src[p].slice(fn.start, fn.end);
      const firstAns = code.indexOf('xapiAnswered(');
      if (firstAns < 0) continue;
      committing++;
      const flushes = [...code.matchAll(/flushResumeSave\(\)/g)].map(m => m.index);
      const lastCommit = Math.max(code.lastIndexOf('Finish('), code.lastIndexOf('Done = true'), code.lastIndexOf('Done    = true'), firstAns);
      ok(p, fn.id.name + ': a flush follows the last commitment', flushes.some(i => i > lastCommit), 'last commit @' + lastCommit + ', flushes @' + flushes.join(','));
      /* returns of THIS function only — a return inside a nested callback (e.g. an answer-text
         builder's .map) does not leave the check */
      const rets = [];
      (function visit(node, top) {
        if (!node || typeof node.type !== 'string') return;
        if (!top && /Function/.test(node.type)) return;
        if (node.type === 'ReturnStatement') rets.push(node.start - fn.start);
        for (const k of Object.keys(node)) { const v = node[k]; if (Array.isArray(v)) v.forEach(c => visit(c, false)); else if (v && typeof v.type === 'string') visit(v, false); }
      })(fn.body, true);
      rets.splice(0, rets.length, ...rets.filter(i => i > firstAns));
      const badRet = rets.filter(r => !flushes.some(f => f > firstAns && f < r));
      ok(p, fn.id.name + ': no return between a commitment and its flush', badRet.length === 0, badRet.length + ' unflushed return(s)');
    }
    ok(p, 'has committing functions', committing > 0 || p === '04');
  }
} else skipped.push('flush-order scan (acorn not found)');

/* ══════════════ 6. asset contract ══════════════ */
section('6. asset contract');
const ASSET = /(?:\.\.\/)*(?:unit-)?assets\/[A-Za-z0-9_\-./]+\.(?:png|PNG|jpg|jpeg|svg|gif|webp|mp4|mp3|woff2|ttf)/g;
function existsExact(full) {
  if (!fs.existsSync(full)) return false;
  const rel = path.relative(BASE, full).split(path.sep); let cur = BASE;
  for (const seg of rel) { if (!fs.readdirSync(cur).includes(seg)) return false; cur = path.join(cur, seg); }
  return true;
}
let refs = 0; const broken = [];
function scanRefs(file, baseDir) {
  let t = read(file);
  if (file.endsWith('.css')) t = t.replace(/\/\*[\s\S]*?\*\//g, '');
  if (file.endsWith('.html')) t = t.replace(/<!--[\s\S]*?-->/g, '');
  for (const m of t.matchAll(ASSET)) { refs++; const full = path.resolve(baseDir, m[0]); if (!existsExact(full)) broken.push(path.relative(BASE, file) + ' -> ' + m[0]); }
}
for (const p of PARTS) {
  scanRefs(path.join(partDir(p), 'index.html'), partDir(p));
  scanRefs(path.join(partDir(p), 'js', 'main.js'), partDir(p));
  scanRefs(path.join(partDir(p), 'css', 'style.css'), path.join(partDir(p), 'css'));
}
for (const f of fs.readdirSync(path.join(BASE, 'unit-css'))) scanRefs(path.join(BASE, 'unit-css', f), path.join(BASE, 'unit-css'));
ok('assets', 'every literal asset path resolves with exact case (' + refs + ' refs)', broken.length === 0 && refs > 150, broken.slice(0, 5).join('; '));

/* ══════════════ 7. runtime (jsdom + the local stub) ══════════════ */
section('7. runtime (jsdom)');
async function boot(p, query) {
  const { JSDOM, VirtualConsole, requestInterceptor } = jsdomMod;
  const root = path.dirname(BASE);   // the server root: <parent>/<unit>/<part>/index.html
  const TYPES = { '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html' };
  /* Local files are served from disk; every external host (the CDN library, YouTube) gets a 404,
     which is exactly what the loader's onerror path and the off-platform regression gate expect. */
  const local = requestInterceptor(request => {
    const u = new URL(request.url);
    const f = path.join(root, decodeURIComponent(u.pathname));
    if (u.hostname === 'localhost' && fs.existsSync(f) && fs.statSync(f).isFile())
      return new Response(fs.readFileSync(f), { headers: { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' } });
    return new Response('', { status: 404 });
  });
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('error', (...a) => errors.push(a.map(String).join(' ')));
  vc.on('jsdomError', e => { if (!/Not implemented|Could not load (script|iframe|img|link|video|audio)/.test(e.message)) errors.push('jsdom: ' + e.message); });
  const url = 'http://localhost/' + path.basename(BASE) + '/' + UNIT + '-' + p + '/index.html' + (query || '');
  const dom = new JSDOM(html[p], {
    url, runScripts: 'dangerously', resources: { interceptors: [local] }, pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.HTMLMediaElement.prototype.play = () => Promise.resolve();
      w.HTMLMediaElement.prototype.pause = () => {};
      w.HTMLMediaElement.prototype.load = () => {};
      w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ({ data: new Uint8ClampedArray(4) })), set: (t, k, v) => { t[k] = v; return true; } });
      w.fetch = u => { const f = path.join(root, new URL(u, url).pathname); const ok2 = fs.existsSync(f);
        return Promise.resolve({ ok: ok2, status: ok2 ? 200 : 404, json: () => Promise.resolve(JSON.parse(fs.readFileSync(f, 'utf8'))), text: () => Promise.resolve(fs.readFileSync(f, 'utf8')) }); };
      w.scrollTo = () => {};
    }
  });
  const w = dom.window;
  const until = async (cond, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (cond()) return true; } catch (e) {} await new Promise(r => setTimeout(r, 50)); } return false; };
  await until(() => w.document.readyState === 'complete', 5000);
  return { dom, w, errors, until };
}
async function runtime() {
  for (const p of PARTS) {
    /* (a) the regression gate: off-platform nothing can be sent, and scoring still works */
    const off = await boot(p, '');
    await new Promise(r => setTimeout(r, 400));
    ok(p, 'off-platform: sendStatement720 is absent (CDN library never loads)', typeof off.w.sendStatement720 !== 'function');
    ok(p, 'off-platform: xapiOnScreen is a silent no-op', (() => { try { off.w.xapiOnScreen(0); off.w.xapiOnScreen(1); return true; } catch (e) { return false; } })());
    ok(p, 'off-platform: xapiAnswered still records the score', (() => { off.w.xapiAnswered('999', 'q1', true, true, 'x'); return off.w.XAPI_Q_RESULTS['999/q1'] === true; })());
    ok(p, 'off-platform: DEV_NAV is false', off.w.eval('DEV_NAV') === false);
    const back = off.w.document.getElementById(off.w.eval("typeof S0_BACK_ID !== 'undefined' ? S0_BACK_ID : 's0-back'"));
    if (back) ok(p, 'off-platform: the first-screen back is hidden (attribute and inline display)', back.hidden && back.style.display === 'none');
    off.dom.window.close();

    /* (b) with the stub: statement flow over every screen boundary, driven only by the map */
    const on = await boot(p, '?xapiLib=../_test/xapi-720-k.js&registration=verify-' + p + '&resetState');
    const w = on.w;
    const ready = await on.until(() => w.__stmts && w.eval('_resumeReady') === true && w.__stmts().length > 0, 8000);
    ok(p, 'stub: the loader boots and resume becomes ready', ready);
    if (!ready) { on.dom.window.close(); continue; }
    const map = parseMap(src[p]); const N = totalScreens(src[p]);
    const idOf = sfx => PREFIX + UNIT + '-' + p + '/' + UNIT + '-' + p + '-' + sfx + '/';
    const evalSet = new Set(Object.keys(w.eval('XAPI_EVAL_ITEMS')));
    const first = w.__stmts();
    ok(p, 'boot: one component initialized', first.filter(s => s.verb === 'initialized' && s.objectType === 'onlinelesson').length === 1);
    ok(p, 'boot: landing item initialized iff screen 0 is mapped', first.filter(s => s.verb === 'initialized' && s.objectType === 'question').length === (map[0] ? 1 : 0));
    let open = map[0] || null, seen = w.__stmts().length, flowOk = true, detail = '';
    for (let n = 1; n < N; n++) {
      w.goTo(n);
      const got = w.__stmts().slice(seen).map(s => s.verb + ' ' + (s.opts && s.opts.objectId));
      seen = w.__stmts().length;
      const want = []; const next = map[n] || null;
      if (next !== open) {
        if (open && !evalSet.has(open)) want.push('completed ' + idOf(open));   // unanswered evaluated items are not closed (B-1)
        if (next) want.push('initialized ' + idOf(next));
        open = next;
      }
      if (JSON.stringify(got) !== JSON.stringify(want)) { flowOk = false; detail = 'goTo(' + n + '): got ' + JSON.stringify(got) + ' want ' + JSON.stringify(want); break; }
    }
    ok(p, 'flow: every boundary sends exactly the map\'s completed/initialized pairs', flowOk, detail);
    ok(p, 'flow: no statement ever uses the unit id as its object', w.__stmts().every(s => !(s.opts && s.opts.objectId === UNIT)));
    ok(p, 'flow: METADATA.id matches XAPI_COMP_ID', w.METADATA && w.METADATA.id === w.eval('XAPI_COMP_ID'));

    /* (c) resume: capture/apply round trip is stable, and no painter throws (rule 7 sweep) */
    const before = on.errors.filter(e => /resume/.test(e)).length;
    const round = w.eval('(function(){ var a = JSON.stringify(capturePartPayload()); applyResumeVars(JSON.parse(a)); return a === JSON.stringify(capturePartPayload()); })()');
    ok(p, 'resume: capture -> apply -> capture is stable', round);
    w.eval(`(function(){ var snap = capturePartPayload();
      (function force(o){ Object.keys(o).forEach(function(k){ if (k === 'd' || k === 'ans') o[k] = true; else if (o[k] && typeof o[k] === 'object') force(o[k]); }); })(snap);
      applyResumeVars(snap); applyResumeDom(snap);
      for (var n = 0; n < TOTAL_SCREENS; n++) { goTo(n); restoreScreenUI(n); } })()`);
    ok(p, 'resume: forcing every question answered and walking every screen raises no [resume] error', on.errors.filter(e => /resume/.test(e)).length === before, on.errors.filter(e => /resume/.test(e)).slice(0, 2).join(' | '));
    const doc = w.__state();
    ok(p, 'resume: the document is v5, this component, with the four ledgers', doc && doc.v === 5 && doc.component === UNIT + '-' + p && doc.done && doc.doneItems && doc.hints && doc.picks);
    ok(p, 'runtime: no unexpected console.error', on.errors.filter(e => !/resume|\[xAPI\] failed to load/.test(e)).length === 0, on.errors.filter(e => !/resume|failed to load/.test(e)).slice(0, 3).join(' | '));
    on.dom.window.close();
  }  /* (d) O-8 (QA 2026-10-02): an item's result survives a reload. The library scores an item from an
     in-memory aggregate that a reload wipes, so the content must supply it from the restored
     XAPI_Q_RESULTS. U1's walk only passed by coincidence (1/2 after the reload = 2/4 overall). */
  const o8 = async (p, before, after, item) => {
    const lib = '?xapiLib=../_test/xapi-720-k.js&registration=o8-' + p + '-' + Math.random().toString(36).slice(2) + '&resetState';
    const a = await boot(p, lib);
    await a.until(() => a.w.__stmts && a.w.eval('_resumeReady') === true, 8000);
    /* answered the way the part's handlers do: 06 also records the section in peakResults (its score) */
    const answer = (w, q, c) => { w.xapiAnswered(item, q, c, true, 'x'); if (p === '06') w.eval('peakResults[' + (Number(q.slice(1)) + 1) + '] = ' + (c ? "'correct'" : "'wrong'")); };
    before.forEach(([q, c]) => answer(a.w, q, c));
    const snap = a.w.eval('JSON.stringify(capturePartPayload())');
    a.dom.window.close();
    const b = await boot(p, lib);
    await b.until(() => b.w.__stmts && b.w.eval('_resumeReady') === true, 8000);
    b.w.eval('window.xapiItemAnswered = window.xapiItemAnswered || {}; applyExecutionState(' + snap + ');');
    after.forEach(([q, c]) => answer(b.w, q, c));
    b.w.eval("xapiCurrentItem = '" + item + "'; xapiFinishItems();");
    const c = b.w.__stmts().filter(s => s.verb === 'completed' && s.objectType === 'question' && /-0\d-\d{3}\/$/.test(String(s.opts && s.opts.objectId)) && s.opts.objectId.indexOf('-' + item + '/') !== -1);
    b.dom.window.close();
    return c;
  };
  let o = await o8('06', [['q1', true], ['q2', false]], [['q3', false], ['q4', true]], '001');
  ok('06', 'O-8: after a reload item 001 completes once, with the component result of all four sections (2/4: success false, 0.5)',
    o.length === 1 && o[0].result && o[0].result.success === false && o[0].result.score.scaled === 0.5, JSON.stringify(o.map(s => s.result)));
  o = await o8('06', [['q1', false], ['q2', false]], [['q3', true], ['q4', true]], '001');
  ok('06', 'O-8: two wrong before the reload are still counted (0.5, not the post-reload 1.0)',
    o.length === 1 && o[0].result && o[0].result.score.scaled === 0.5, JSON.stringify(o.map(s => s.result)));
  o = await o8('02', [['q1', true]], [['q2', false]], '002');
  ok('02', 'O-8: a two-question item answered across a reload reports both (success false, 0.5)',
    o.length === 1 && o[0].result && o[0].result.success === false && o[0].result.score.scaled === 0.5, JSON.stringify(o.map(s => s.result)));
  /* 01-007 spans the two learning paths: q1 (S8 hotspot) only on the scratch-card path, q2 on both.
     It is scored over the questions offered (live test 2026-11-02: the escape path got 0.5, false). */
  const res = r => JSON.stringify(r.map(s => s.result));
  const is = (r, succ, sc) => r.length === 1 && r[0].result && r[0].result.success === succ && r[0].result.score.scaled === sc;
  o = await o8('01', [], [['q2', true]], '007');
  ok('01', '007: escape path (q2 only), correct -> success true, 1', is(o, true, 1), res(o));
  o = await o8('01', [['q2', false]], [['q2', true]], '007');
  ok('01', '007: escape path, wrong before the reload then right -> success true, 1', is(o, true, 1), res(o));
  o = await o8('01', [['q1', true]], [['q2', true]], '007');
  ok('01', '007: scratch path, q1 and q2 right across a reload -> success true, 1', is(o, true, 1), res(o));
  o = await o8('01', [['q1', false]], [['q2', true]], '007');
  ok('01', '007: scratch path, q1 wrong -> success false, 0.5 (as before)', is(o, false, 0.5), res(o));
  /* (e) MOE 2026-10-08: the challenge (05) reports its real score; success only at >= 60% of the
     2 declared questions (001 q1, 002 q1). No gate: the learner continues either way. */
  const ch = await boot('05', '?xapiLib=../_test/xapi-720-k.js&registration=thr-05-' + Math.random().toString(36).slice(2) + '&resetState');
  await ch.until(() => ch.w.__stmts && ch.w.eval('_resumeReady') === true, 8000);
  const thr = JSON.parse(ch.w.eval('(function(){ var orig = xapiEndComponent, out = [];' +
    ' xapiEndComponent = function (r) { out.push(r); };' +
    ' [0, 1, 2].forEach(function (n) { Object.keys(XAPI_Q_RESULTS).forEach(function (k) { delete XAPI_Q_RESULTS[k]; });' +
    '   ["001/q1", "002/q1"].forEach(function (k, i) { XAPI_Q_RESULTS[k] = i < n; }); goToNextPart(); });' +
    ' xapiEndComponent = orig; return JSON.stringify(out); })()'));
  ch.dom.window.close();
  ok('05', 'challenge: success only at >= 60%, real score (0/2, 1/2 fail; 2/2 passes)',
    thr.length === 3 && thr.map(r => r.success + ':' + r.score.scaled).join(',') === 'false:0,false:0.5,true:1', JSON.stringify(thr));
}

/* ══════════════ 8. Arabic build ══════════════
   What a learner sees must be Arabic. Hebrew is allowed only in comments, in console messages
   (developer-facing) and in REPORT_TYPE_LABELS — the value posted to the issue form all 720 units
   share, kept Hebrew so the sheet stays filterable; the learner sees REPORT_TYPE_DISPLAY. */
section('8. Arabic build');
const HEB = /[֐-׿]/;
const stripHtmlComments = s => s.replace(/<!--[\s\S]*?-->/g, '');
const hebLines = (s, f) => s.split('\n').map((l, i) => [f + ':' + (i + 1), l]).filter(([, l]) => HEB.test(l)).map(([w, l]) => w + ' ' + l.trim().slice(0, 80));
for (const p of PARTS) {
  ok(p, 'index.html is lang="ar" dir="rtl"', /<html lang="ar" dir="rtl">/.test(html[p]));
  if (IS_REPO) ok(p, 'index_dev.html is lang="ar"', /<html lang="ar"/.test(read(path.join(partDir(p), 'index_dev.html'))));
  const heb = [].concat(
    hebLines(stripHtmlComments(html[p]), 'index.html'),
    hebLines(stripComments(src[p]), 'main.js'),
    hebLines(stripComments(read(path.join(partDir(p), 'css', 'style.css'))), 'style.css'));
  ok(p, 'no Hebrew outside comments', heb.length === 0, heb.slice(0, 3).join(' | '));
}
for (const f of fs.readdirSync(path.join(BASE, 'unit-css'))) {
  const heb = hebLines(stripComments(read(path.join(BASE, 'unit-css', f))), f);
  ok('unit-css', f + ': no Hebrew outside comments', heb.length === 0, heb.slice(0, 3).join(' | '));
}
for (const [f, code] of Object.entries(unitJs)) {
  const c = stripComments(code)
    .replace(/console\.\w+\([\s\S]*?\);/g, '')
    .replace(/var REPORT_TYPE_LABELS = \{[\s\S]*?\};/, '');
  const heb = hebLines(c, f);
  ok('unit-js', f + ': no Hebrew outside comments, console and REPORT_TYPE_LABELS', heb.length === 0, heb.slice(0, 3).join(' | '));
}
ok('report', 'the type dropdown shows REPORT_TYPE_DISPLAY (Arabic)', /valSpan\.textContent = REPORT_TYPE_DISPLAY\[hidden\.value\]/.test(report) && /'technical':\s*'[؀-ۿ]/.test(report));
ok('resume', 'NAV_EDGE_KEY is the Arabic unit key', /var NAV_EDGE_KEY = 'lomda_nav_edges::methodica-ar-science-volume-liquid-01';/.test(unitJs['40-resume.js']));
const allSrc = Object.assign({}, ...PARTS.map(p => ({ ['main.js ' + p]: src[p], ['index.html ' + p]: html[p] })), unitJs);
const heIds = Object.entries(allSrc).filter(([, c]) => /methodica[-_]science[-_]volume[-_]liquid/.test(stripComments(stripHtmlComments(c)))).map(([f]) => f);
ok('identity', 'no Hebrew-unit slug or key left in code (outside comments)', heIds.length === 0, heIds.join(', '));

(async () => {
  if (jsdomMod && acorn && IS_REPO) await runtime();
  else skipped.push('runtime section (' + (!IS_REPO ? 'not a repo checkout' : 'jsdom/acorn not on NODE_PATH') + ')');
  console.log('\n' + '='.repeat(60));
  console.log('pass=' + pass + ' fail=' + failures.length + (skipped.length ? ' skipped: ' + skipped.join('; ') : ''));
  if (failures.length) { console.log('\nFAILURES:\n' + failures.join('\n')); process.exit(1); }
})();
