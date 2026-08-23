/* ============================================================
   버전 공통 진화표 렌더러
   VERSIONS / CHARS / TIERS (evo-data.js) 를 읽어
   6개 버전을 완전히 동일한 레이아웃으로 그린다.
   ============================================================ */

function evoImg(id) { return 'chars/' + id + '.png'; }
function evoKo(id)  { return CHARS[id] ? CHARS[id][0] : '?'; }
function evoJp(id)  { return CHARS[id] ? CHARS[id][1] : ''; }
function evoEn(id)  { return CHARS[id] ? CHARS[id][2] : ''; }

/* 받침 유무에 따라 이/가 를 고른다 */
function josa(word, withBatchim, without) {
  var c = word.charCodeAt(word.length - 1);
  var has = (c >= 0xAC00 && c <= 0xD7A3) ? ((c - 0xAC00) % 28 !== 0) : false;
  return word + (has ? withBatchim : without);
}

/* 캐릭터 한 칸 */
function evoCard(id, opts) {
  opts = opts || {};
  if (id == null) {
    return '<div class="evo-card evo-card-unknown"><div class="evo-thumb evo-thumb-empty">?</div>' +
           '<div class="evo-nm">확인 중</div></div>';
  }
  var tag = opts.tag ? '<span class="evo-tag ' + opts.tagCls + '">' + opts.tag + '</span>' : '';
  return '<button class="evo-card' + (opts.cls ? ' ' + opts.cls : '') + '" data-id="' + id + '">' +
           tag +
           '<img class="evo-thumb" src="' + evoImg(id) + '" alt="' + evoKo(id) + '" loading="lazy">' +
           '<span class="evo-nm">' + evoKo(id) + '</span>' +
           '<span class="evo-jp">' + evoJp(id) + '</span>' +
         '</button>';
}

function renderEvo(key) {
  var v = VERSIONS[key];
  if (!v) return '';
  var h = '';

  /* ---- 1) 성장 흐름 : 아기 → 키즈 → 청소년 4갈래 ---- */
  h += '<div class="evo-sec">';
  h += '<div class="evo-h"><span class="evo-h-num">1</span>성장 흐름' +
       '<span class="evo-h-sub">알에서 깨어나 청소년이 되기까지</span></div>';
  h += '<div class="evo-flow">' +
         evoCard(500, { cls: 'evo-lg' }) +
         '<span class="evo-arrow">→</span>' +
         evoCard(v.kids, { cls: 'evo-lg' }) +
         '<span class="evo-arrow">→</span>' +
         '<div class="evo-flow-fan">' +
           v.youngs.map(function (y) { return evoCard(y.id); }).join('') +
         '</div>' +
       '</div>';
  h += '<div class="evo-note-line">🥚 <b>아기</b>는 모든 버전 공통이에요. ' +
       '<b>' + v.field + '</b> 필드에서 타마세포가 4개 모이면 <b>' + evoKo(v.kids) + '</b>가 됩니다.</div>';
  h += '</div>';

  /* ---- 2) 먹이 → 청소년 ---- */
  h += '<div class="evo-sec">';
  h += '<div class="evo-h"><span class="evo-h-num">2</span>어린이 때 먹이가 청소년을 결정' +
       '<span class="evo-h-sub">가장 많이 먹인 먹이 종류로 갈림</span></div>';
  h += '<div class="evo-foods">';
  v.youngs.forEach(function (y) {
    h += '<div class="evo-food">' +
           evoCard(y.id) +
           '<div class="evo-food-txt"><span class="evo-food-k">' + y.food + '</span>' +
           '<span class="evo-food-i">' + y.items + '</span></div>' +
         '</div>';
  });
  h += '</div></div>';

  /* ---- 3) 성체 4x4 ---- */
  h += '<div class="evo-sec">';
  h += '<div class="evo-h"><span class="evo-h-num">3</span>성체 진화표' +
       '<span class="evo-h-sub">가로 = 돌본 정도 · 세로 = 청소년 계열</span></div>';
  h += '<div class="evo-table">';
  h += '<div class="evo-thead"><div class="evo-corner">청소년 ＼ 케어</div>';
  TIERS.forEach(function (t) {
    h += '<div class="evo-th"><span class="cb ' + t.cls + '">' + t.label + '</span>' +
         '<span class="evo-th-desc">' + t.desc + '</span></div>';
  });
  h += '</div>';
  v.youngs.forEach(function (y) {
    h += '<div class="evo-trow">';
    h +=   '<div class="evo-rh">' + evoCard(y.id, { cls: 'evo-sm' }) +
             '<span class="evo-rh-food">' + y.food + '</span></div>';
    h +=   '<div class="evo-cells">';
    y.a.forEach(function (aid, i) {
      h += '<div class="evo-cell' + (i === 0 ? ' evo-cell-best' : '') + '">' +
             '<span class="evo-tier cb ' + TIERS[i].cls + '">' + TIERS[i].label + '</span>' +
             evoCard(aid, i === 0 ? { tag: '최고', tagCls: 'evo-tag-best' } : {}) +
           '</div>';
    });
    h +=   '</div>';
    h += '</div>';
  });
  h += '</div>';
  if (v.note) h += '<div class="evo-note-line evo-note-warn">ℹ️ ' + v.note + '</div>';
  h += '</div>';

  /* ---- 4) 비밀 캐릭터 ---- */
  h += '<div class="evo-sec evo-sec-secret">';
  h += '<div class="evo-h"><span class="evo-h-num">★</span>비밀 캐릭터' +
       '<span class="evo-h-sub">' + v.name + ' 전용</span></div>';
  /* 비밀 캐릭터는 먹이로 갈린 청소년 3종에서만 진화 (골고루 계열 제외) */
  var okYoung = v.youngs.slice(0, 3).map(function (y) { return evoKo(y.id); }).join(' · ');
  var noYoung = evoKo(v.youngs[3].id);
  h += '<div class="evo-secret">' +
         evoCard(v.secret, { cls: 'evo-lg' }) +
         '<div class="evo-secret-txt">' +
           '<div class="evo-secret-nm">' + evoKo(v.secret) + '</div>' +
           '<div class="evo-secret-chips">' +
             '<div class="chip"><span class="chip-icon">📶</span><div>' +
               '<span class="chip-label">통신 조건</span>' +
               '<span class="chip-val">청소년일 때 <b>' + josa(v.name, '이', '가') + ' 아닌 다른 색 기기 2대</b>와 각각 통신 성공</span></div></div>' +
             '<div class="chip"><span class="chip-icon">✅</span><div>' +
               '<span class="chip-label">가능한 청소년</span>' +
               '<span class="chip-val">' + okYoung + '</span></div></div>' +
             '<div class="chip evo-chip-no"><span class="chip-icon">❌</span><div>' +
               '<span class="chip-label">불가 청소년</span>' +
               '<span class="chip-val">' + noYoung + ' (골고루 먹여 키운 계열)</span></div></div>' +
             '<div class="chip"><span class="chip-icon">⭐</span><div>' +
               '<span class="chip-label">케어미스</span>' +
               '<span class="chip-val">케어미스 수와 무관 — 조건만 맞으면 진화!</span></div></div>' +
           '</div>' +
         '</div>' +
       '</div></div>';

  return h;
}

/* 캐릭터 카드 클릭 → 상세 팝업 */
function evoDetail(id) {
  var lb = document.getElementById('lightbox');
  document.getElementById('lbImg').src = evoImg(id);
  document.getElementById('lbCap').innerHTML =
    evoKo(id) + '<span class="lb-hint">' + evoJp(id) + ' · ' + evoEn(id) + '</span>';
  lb.classList.remove('zoomed');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function buildEvoCharts() {
  document.querySelectorAll('.evo[data-v]').forEach(function (el) {
    if (el.dataset.built) return;
    el.innerHTML = renderEvo(el.dataset.v);
    el.dataset.built = '1';
  });
  document.addEventListener('click', function (e) {
    var card = e.target.closest('.evo-card[data-id]');
    if (card) evoDetail(card.dataset.id);
  });
}

/* ============================================================
   전체 캐릭터 도감 — 6버전 전부를 한 판에
   ============================================================ */
function dexCard(id, stage, stageCls) {
  return '<button class="dex-card ' + stageCls + '" data-id="' + id + '">' +
           '<img class="dex-thumb" src="' + evoImg(id) + '" alt="' + evoKo(id) + '" loading="lazy">' +
           '<span class="dex-nm">' + evoKo(id) + '</span>' +
           '<span class="dex-stage">' + stage + '</span>' +
         '</button>';
}

function renderDex() {
  var h = '';

  h += '<div class="dex-block">' +
         '<div class="dex-head"><span class="dex-head-nm">🥚 모든 버전 공통</span>' +
         '<span class="dex-head-ct">2종</span></div>' +
         '<div class="dex-grid">' +
           dexCard(500, '아기', 'dex-baby') +
           dexCard(516, '방치', 'dex-baby') +
         '</div>' +
         '<div class="dex-note">아기를 4시간 동안 돌보지 않으면 빅베이비 마루치가 되고, 더는 자라지 않아요.</div>' +
       '</div>';

  Object.keys(VERSIONS).forEach(function (key) {
    var v = VERSIONS[key];
    var ids = [];
    ids.push([v.kids, '키즈', 'dex-kid']);
    v.youngs.forEach(function (y) { ids.push([y.id, '청소년', 'dex-young']); });
    v.youngs.forEach(function (y) {
      y.a.forEach(function (aid, i) {
        if (aid != null) ids.push([aid, i === 0 ? '성체·최고' : '성체', i === 0 ? 'dex-best' : 'dex-adult']);
      });
    });
    ids.push([v.secret, '비밀', 'dex-secret']);

    h += '<div class="dex-block dex-' + key + '">' +
           '<div class="dex-head"><span class="dex-head-nm">' + v.emoji + ' ' + v.name + '</span>' +
           '<span class="dex-head-fd">' + v.field + '</span>' +
           '<span class="dex-head-ct">' + ids.length + '종</span></div>' +
           '<div class="dex-grid">' +
             ids.map(function (r) { return dexCard(r[0], r[1], r[2]); }).join('') +
           '</div>' +
         '</div>';
  });
  return h;
}

function buildDex() {
  document.querySelectorAll('.dex').forEach(function (el) {
    if (el.dataset.built) return;
    el.innerHTML = renderDex();
    el.dataset.built = '1';
  });
  document.addEventListener('click', function (e) {
    var c = e.target.closest('.dex-card[data-id]');
    if (c) evoDetail(c.dataset.id);
  });
}
