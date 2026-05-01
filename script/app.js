/* KONSTANTA KELAS TAILWIND "biar rapih"*/
const CLS_INPUT = 'w-full bg-surface border border-border rounded-md text-white font-ui text-[.88rem] py-2 px-3 placeholder-[#3a3a3a] outline-none transition-all duration-200 focus:border-red focus:ring-[3px] focus:ring-red-glow appearance-none';

const CLS_SLOT_BASE = 'flex items-center justify-between py-1.5 pr-2.5 pl-3.5 font-ui text-[.88rem] font-semibold cursor-pointer transition-all duration-200 border-b border-white/5 min-h-[34px] gap-1.5 last:border-none hover:bg-white/5';
const CLS_SLOT_WIN = 'text-win font-bold';
const CLS_SLOT_LOSE = 'text-[#444] line-through';
const CLS_SLOT_BYE = 'text-[#2a2a2a] cursor-default italic';
const CLS_SLOT_PENDING = 'text-[#3a3a3a] cursor-default';
const CLS_SLOT_NORMAL = 'text-white';

const CLS_BADGE_BASE = 'score-badge font-head text-[.8rem] font-bold rounded-[3px] py-[1px] px-1.5 shrink-0 min-w-[24px] text-center';
const CLS_BADGE_EMPTY = 'bg-white/5 text-white';
const CLS_BADGE_WIN = 'bg-win/15 text-win';
const CLS_BADGE_LOSE = 'bg-red/10 text-lose';

/* DOM REFS */
const pilihanJumlahTim   = document.getElementById('team-count');
const inputTim           = document.getElementById('team-inputs');
const tombolBuatBracket  = document.getElementById('btn-generate');
const bracketContainer   = document.getElementById('bracket-container');
const pesanStatus        = document.getElementById('status-message');
const pilihanModeBagan   = document.getElementById('bracket-mode');
const inputJumlahCustom  = document.getElementById('custom-team-count');
const customWrap         = document.getElementById('custom-wrap');
const tombolExport       = document.getElementById('btn-export');
const statsPanel         = document.getElementById('stats-panel');
const statsBody          = document.getElementById('stats-body');
const modeBadge          = document.getElementById('bracket-mode-badge');

/* modal */
const modalBackdrop  = document.getElementById('modal-backdrop');
const modalBox       = document.getElementById('modal-box');
const modalTitle     = document.getElementById('modal-title');
const modalLeftName  = document.getElementById('modal-left-name');
const modalRightName = document.getElementById('modal-right-name');
const modalLeftLbl   = document.getElementById('modal-left-label');
const modalRightLbl  = document.getElementById('modal-right-label');
const modalScoreL    = document.getElementById('modal-score-left');
const modalScoreR    = document.getElementById('modal-score-right');
const modalCancel    = document.getElementById('modal-cancel');
const modalConfirm   = document.getElementById('modal-confirm');
const toast          = document.getElementById('toast');

let modeDoubleBracket = false;
let grandPemenangUpper = null;
let grandPemenangLower = null;
let pendingMatchCallback = null;
let toastTimer;

/* MODAL & TOAST LOGIC */
function showToast(msg, type='') {
  toast.textContent = msg;
  const colorClass = type === 'win' ? 'border-l-win' : 'border-l-red';
  toast.className = `fixed bottom-[30px] left-1/2 -translate-x-1/2 z-[200] bg-surface border border-border border-l-[3px] rounded-md py-3 px-5 font-ui text-[.9rem] font-semibold text-white pointer-events-none transition-all duration-300 whitespace-nowrap opacity-100 translate-y-0 ${colorClass}`;
  
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { 
    toast.classList.replace('opacity-100', 'opacity-0');
    toast.classList.replace('translate-y-0', 'translate-y-5');
  }, 2800);
}

function openModal(leftName, rightName, onConfirm) {
  modalLeftName.textContent  = leftName;
  modalRightName.textContent = rightName;
  modalLeftLbl.textContent   = leftName;
  modalRightLbl.textContent  = rightName;
  modalScoreL.value = '';
  modalScoreR.value = '';
  modalTitle.textContent = 'Input Skor Pertandingan';
  
  modalBackdrop.classList.replace('opacity-0', 'opacity-100');
  modalBackdrop.classList.replace('pointer-events-none', 'pointer-events-auto');
  modalBox.classList.replace('translate-y-5', 'translate-y-0');
  modalBox.classList.replace('scale-95', 'scale-100');
  
  pendingMatchCallback = onConfirm;
  setTimeout(() => modalScoreL.focus(), 200);
}

function closeModal() { 
  modalBackdrop.classList.replace('opacity-100', 'opacity-0');
  modalBackdrop.classList.replace('pointer-events-auto', 'pointer-events-none');
  modalBox.classList.replace('translate-y-0', 'translate-y-5');
  modalBox.classList.replace('scale-100', 'scale-95');
  pendingMatchCallback = null; 
}

modalCancel.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });
modalConfirm.addEventListener('click', () => {
  if (!pendingMatchCallback) return;
  const sl = modalScoreL.value.trim();
  const sr = modalScoreR.value.trim();
  if (sl === '' || sr === '') { showToast('Isi skor kedua tim terlebih dahulu.'); return; }
  const leftScore  = parseInt(sl);
  const rightScore = parseInt(sr);
  if (isNaN(leftScore) || isNaN(rightScore)) { showToast('Skor harus berupa angka.'); return; }
  if (leftScore === rightScore) { showToast('Skor tidak boleh seri (draw). Tentukan pemenang.'); return; }
  pendingMatchCallback(leftScore, rightScore);
  closeModal();
});

/* LOGIKA BRACKET UTAMA */
function buatInputTim(jumlahTim) {
  inputTim.innerHTML = '';
  bracketContainer.innerHTML = '<div class="flex flex-col items-center justify-center gap-3 py-16 px-5 text-border text-center"><svg class="opacity-30" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="10" width="7" height="4" rx="1"/><rect x="14" y="6" width="7" height="4" rx="1"/><rect x="14" y="14" width="7" height="4" rx="1"/><line x1="10" y1="5" x2="12" y2="5"/><line x1="10" y1="12" x2="12" y2="12"/><line x1="12" y1="5" x2="12" y2="16"/><line x1="12" y1="8" x2="14" y2="8"/><line x1="12" y1="16" x2="14" y2="16"/></svg><p class="font-head text-[1.1rem] tracking-[.1em] uppercase">Bracket akan muncul di sini</p></div>';
  pesanStatus.textContent = '';
  tombolExport.style.display = 'none';
  statsPanel.style.display = 'none';

  for (let i = 1; i <= jumlahTim; i++) {
    const inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = `Tim ${i}`;
    inp.id = `team-${i}`; inp.autocomplete = 'off';
    inp.className = CLS_INPUT;
    inputTim.appendChild(inp);
  }
}

function ambilDaftarTim() {
  const daftarInput = inputTim.querySelectorAll('input');
  const daftarTim = Array.from(daftarInput).map(i => i.value.trim());
  if (daftarTim.some(n => n === '')) return { error: 'Semua nama tim wajib diisi.' };
  const lc = daftarTim.map(n => n.toLowerCase());
  if (new Set(lc).size !== lc.length) return { error: 'Nama tim tidak boleh ada yang sama.' };
  return { teams: daftarTim };
}

function acakUrutanTim(daftarTim) {
  const t = [...daftarTim];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

function namaBabak(indeks, jumlahAwal) {
  const t = jumlahAwal / Math.pow(2, indeks);
  if (t >= 16) return 'Babak 16 Besar';
  if (t === 8)  return 'Perempat Final';
  if (t === 4)  return 'Semifinal';
  if (t === 2)  return 'Final';
  return `Babak ${indeks + 1}`;
}

function susunBracket(daftarTim) {
  const rounds = [];
  let slots = acakUrutanTim(daftarTim).map(n => ({ label: n }));
  let nb = 1;
  while (slots.length > 1) {
    const babak = []; const next = [];
    for (let i = 0; i < slots.length; i += 2) {
      const l = slots[i], r = slots[i + 1] || null;
      const mp = babak.length + 1;
      babak.push({ left: l.label, right: r ? r.label : 'BYE', winner: `Pemenang Babak ${nb} Pertandingan ${mp}` });
      next.push({ label: `Pemenang Babak ${nb} Pertandingan ${mp}` });
    }
    rounds.push(babak); slots = next; nb++;
  }
  return rounds;
}

function susunLowerBracket(babakUpper) {
  const babak = [];
  let slots = [];
  const jumlahAwal = babakUpper[0].length;
  for (let i = 1; i <= jumlahAwal; i++) {
    slots.push({ label: `Kalah Upper Babak 1 Pertandingan ${i}`, origin: { babak: 1, pertandingan: i } });
  }
  let nb = 1;
  for (let tahap = 0; ; tahap++) {
    if (slots.length === 0) break;
    const babakArr = []; const next = [];
    for (let i = 0; i < slots.length; i += 2) {
      const l = slots[i], r = slots[i + 1] || null;
      const mp = babakArr.length + 1;
      const lbl = `Pemenang Lower Babak ${nb} Pertandingan ${mp}`;
      babakArr.push({ left: l.label, leftOrigin: l.origin, right: r ? r.label : 'BYE', rightOrigin: r ? r.origin : undefined, winner: lbl });
      next.push({ label: lbl });
    }
    babak.push(babakArr);
    const nextUpper = tahap + 1;
    if (nextUpper < babakUpper.length) {
      const nl = babakUpper[nextUpper].length;
      for (let j = 1; j <= nl; j++) {
        next.push({ label: `Kalah Upper Babak ${nextUpper + 1} Pertandingan ${j}`, origin: { babak: nextUpper + 1, pertandingan: j } });
      }
    }
    slots = next; nb++;
    if (slots.length === 1 && nextUpper >= babakUpper.length) break;
  }
  return babak;
}

/* RENDER BRACKET INLINE */
function tampilkanBracket(daftarBabak, tipeBagan) {
  const wrapper = document.createElement('div');
  const jumlahTimAwal = Math.pow(2, daftarBabak.length);
  let jumlahTimAwalLower = jumlahTimAwal;
  if (tipeBagan === 'Lower' && daftarBabak.length > 0) jumlahTimAwalLower = daftarBabak[0].length * 2;

  const scroll = document.createElement('div');
  scroll.className = 'flex gap-0 overflow-x-auto pb-2';

  daftarBabak.forEach((pertandinganBabak, indeksBabak) => {
    const col = document.createElement('div');
    col.className = 'shrink-0 min-w-[180px]';

    let roundLabel;
    if (modeDoubleBracket) { roundLabel = `${tipeBagan} R${indeksBabak + 1}`; } 
    else { roundLabel = tipeBagan === 'Upper' ? namaBabak(indeksBabak, jumlahTimAwal) : namaBabak(indeksBabak, jumlahTimAwalLower); }
    
    const hdr = document.createElement('div');
    hdr.className = 'font-head text-[.7rem] font-bold tracking-[.2em] uppercase text-muted px-2 pb-3 mb-0 text-center border-b border-border';
    hdr.textContent = roundLabel;
    col.appendChild(hdr);

    pertandinganBabak.forEach((pertandingan, indeksPertandingan) => {
      const wrap = document.createElement('div');
      wrap.className = 'flex flex-col justify-center py-3 relative pr-5';

      // Line connector
      if (indeksBabak < daftarBabak.length - 1) {
        const line = document.createElement('div');
        line.className = 'absolute right-0 top-1/2 w-5 h-[1px] bg-border';
        wrap.appendChild(line);
      }

      const card = document.createElement('div');
      card.className = 'bg-surface border border-border rounded-md overflow-hidden my-1 relative transition-all duration-200 hover:border-[#333]';

      const cardAccent = document.createElement('div');
      cardAccent.className = 'absolute left-0 top-0 bottom-0 w-[3px] bg-border transition-colors duration-200';
      card.appendChild(cardAccent);

      const lbl = document.createElement('div');
      lbl.className = 'font-head text-[.65rem] font-bold tracking-[.15em] text-[#3a3a3a] uppercase py-1.5 px-2.5 border-b border-border flex items-center justify-between ml-[3px]';
      lbl.innerHTML = `<span>M${indeksPertandingan + 1}</span>`;
      card.appendChild(lbl);

      const babakSekarang  = indeksBabak + 1;
      const matchSekarang  = indeksPertandingan + 1;

      const slotKiri  = buatSlot(pertandingan.left,  tipeBagan, babakSekarang, matchSekarang, 'Kiri',  pertandingan.leftOrigin);
      const slotKanan = buatSlot(pertandingan.right, tipeBagan, babakSekarang, matchSekarang, 'Kanan', pertandingan.rightOrigin);

      const statusEl = document.createElement('div');
      statusEl.className = 'font-ui text-[.7rem] text-[#3a3a3a] py-1 px-2.5 bg-black/20 border-t border-border ml-[3px]';
      statusEl.textContent = 'Menunggu…';

      const tetapkanPemenang = (pemenangSlot, kalahSlot) => {
        const nm = pemenangSlot.dataset.name;
        const nk = kalahSlot.dataset.name;
        if (!nm || nm === 'BYE' || nm.startsWith('Pemenang') || nm.startsWith('Kalah')) return;

        openModal(nm, nk, (sl, sr) => {
          const pemenang = sl > sr ? nm : nk;
          const kalah    = sl > sr ? nk : nm;
          const pEl      = pemenang === nm ? pemenangSlot : kalahSlot;
          const kEl      = kalah    === nm ? pemenangSlot : kalahSlot;
          const ps       = pemenang === nm ? sl : sr;
          const ks       = kalah    === nm ? sl : sr;

          pEl.dataset.name = pemenang;
          pEl.querySelector('.slot-name').textContent = pemenang;
          pEl.querySelector('.score-badge').textContent = ps;
          pEl.className = `${CLS_SLOT_BASE} ${CLS_SLOT_WIN}`;
          pEl.querySelector('.score-badge').className = `${CLS_BADGE_BASE} ${CLS_BADGE_WIN}`;

          kEl.dataset.name = kalah;
          kEl.querySelector('.slot-name').textContent = kalah;
          kEl.querySelector('.score-badge').textContent = ks;
          kEl.className = `${CLS_SLOT_BASE} ${CLS_SLOT_LOSE}`;
          kEl.querySelector('.score-badge').className = `${CLS_BADGE_BASE} ${CLS_BADGE_LOSE}`;

          statusEl.textContent = `Lolos: ${pemenang}`;
          statusEl.classList.replace('text-[#3a3a3a]', 'text-win');
          cardAccent.classList.replace('bg-border', 'bg-win');

          /* propagate winner forward */
          const babakSelanjutnya = babakSekarang + 1;
          const matchSelanjutnya = Math.floor(indeksPertandingan / 2) + 1;
          const posisiSelanjutnya = (indeksPertandingan % 2 === 0) ? 'Kiri' : 'Kanan';
          const targetId = `${tipeBagan}-babak-${babakSelanjutnya}-match-${matchSelanjutnya}-${posisiSelanjutnya}`;
          const slotTujuan = document.getElementById(targetId);
          if (slotTujuan) {
            slotTujuan.dataset.name = pemenang;
            slotTujuan.querySelector('.slot-name').textContent = pemenang;
            slotTujuan.className = `${CLS_SLOT_BASE} ${CLS_SLOT_NORMAL}`;
          } else if (modeDoubleBracket) {
            if (tipeBagan === 'Upper' && grandPemenangUpper) {
              grandPemenangUpper.dataset.name = pemenang;
              grandPemenangUpper.querySelector('.grand-slot-name').textContent = pemenang;
            }
            if (tipeBagan === 'Lower' && grandPemenangLower) {
              grandPemenangLower.dataset.name = pemenang;
              grandPemenangLower.querySelector('.grand-slot-name').textContent = pemenang;
            }
          }

          /* propagate loser to lower */
          if (tipeBagan === 'Upper') {
            const slotLowerId = `Lower-slot-babak-${babakSekarang}-pert-${matchSekarang}-Kiri`;
            const slotLowerAltId = `Lower-slot-babak-${babakSekarang}-pert-${matchSekarang}-Kanan`;
            const slotLower = document.getElementById(slotLowerId) || document.getElementById(slotLowerAltId);
            if (slotLower) {
              slotLower.dataset.name = kalah;
              slotLower.querySelector('.slot-name').textContent = kalah;
              slotLower.className = `${CLS_SLOT_BASE} ${CLS_SLOT_NORMAL}`;
            }
          }

          showToast(`🏆 ${pemenang} melaju ke babak berikutnya!`, 'win');
        });
      };

      slotKiri.addEventListener('click',  () => tetapkanPemenang(slotKiri,  slotKanan));
      slotKanan.addEventListener('click', () => tetapkanPemenang(slotKanan, slotKiri));
      
      const wrapSlot = document.createElement('div');
      wrapSlot.className = "ml-[3px]";
      wrapSlot.append(slotKiri, slotKanan);
      
      card.append(wrapSlot, statusEl);
      wrap.appendChild(card);
      col.appendChild(wrap);
    });

    scroll.appendChild(col);
  });

  wrapper.appendChild(scroll);
  return wrapper;
}

function buatSlot(label, tipeBagan, babak, match, sisi, origin) {
  const el = document.createElement('div');
  const isPending = label && (label.startsWith('Pemenang') || label.startsWith('Kalah'));
  const isBye     = label === 'BYE';
  
  let stateClass = CLS_SLOT_NORMAL;
  if (isBye) stateClass = CLS_SLOT_BYE;
  else if (isPending) stateClass = CLS_SLOT_PENDING;

  el.className = `${CLS_SLOT_BASE} ${stateClass}`;
  el.dataset.name = label || '';

  let idStr;
  if (tipeBagan === 'Lower' && origin) { idStr = `Lower-slot-babak-${origin.babak}-pert-${origin.pertandingan}-${sisi}`; } 
  else { idStr = `${tipeBagan}-babak-${babak}-match-${match}-${sisi}`; }
  el.id = idStr;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'slot-name';
  nameSpan.textContent = isBye ? 'BYE' : isPending ? '—' : (label || '—');

  const scoreBadge = document.createElement('span');
  scoreBadge.className = `${CLS_BADGE_BASE} ${CLS_BADGE_EMPTY}`;
  scoreBadge.textContent = '';

  el.append(nameSpan, scoreBadge);
  return el;
}

function tampilkanStats(jumlahTim, mode) {
  const totalMatch = jumlahTim - 1;
  const babak = Math.log2(jumlahTim);
  statsBody.innerHTML = '';

  const items = [
    { label: 'Total Tim', value: jumlahTim },
    { label: 'Total Match', value: mode === 'double' ? totalMatch * 2 + 1 : totalMatch },
    { label: 'Jumlah Babak', value: mode === 'double' ? babak * 2 : babak },
    { label: 'Mode', value: mode === 'double' ? 'Double Elim' : 'Single Elim' },
  ];
  items.forEach(({ label, value }) => {
    const div = document.createElement('div');
    div.className = "bg-surface border border-border rounded-md p-3 text-center";
    div.innerHTML = `<div class="font-head text-[1.5rem] font-black text-red leading-none">${value}</div><div class="font-ui text-[.7rem] tracking-[.15em] uppercase text-muted mt-1">${label}</div>`;
    statsBody.appendChild(div);
  });
  statsPanel.style.display = '';
}

tombolBuatBracket.addEventListener('click', () => {
  const hasil = ambilDaftarTim();
  const mode  = pilihanModeBagan.value;

  if (hasil.error) {
    pesanStatus.textContent = hasil.error;
    return;
  }
  pesanStatus.textContent = '';

  modeDoubleBracket = mode === 'double';
  grandPemenangUpper = null;
  grandPemenangLower = null;

  bracketContainer.innerHTML = '';
  modeBadge.textContent = mode === 'double' ? 'Double Elimination' : 'Single Elimination';

  const daftarBabakUpper = susunBracket(hasil.teams);

  /* Upper */
  const lblUpper = document.createElement('div');
  lblUpper.className = 'flex items-center gap-3 mt-6 mb-4 first:mt-0';
  lblUpper.innerHTML = `<h2 class="font-head text-[1.3rem] font-black tracking-[.15em] uppercase text-white">Upper Bracket</h2><div class="flex-1 h-[1px] bg-gradient-to-r from-border to-transparent"></div>`;
  bracketContainer.appendChild(lblUpper);
  bracketContainer.appendChild(tampilkanBracket(daftarBabakUpper, 'Upper'));

  if (mode === 'double') {
    const daftarBabakLower = susunLowerBracket(daftarBabakUpper);

    const div1 = document.createElement('hr'); div1.className = 'border-none border-t border-border my-7';
    bracketContainer.appendChild(div1);

    const lblLower = document.createElement('div');
    lblLower.className = 'flex items-center gap-3 mt-6 mb-4 first:mt-0';
    lblLower.innerHTML = `<h2 class="font-head text-[1.3rem] font-black tracking-[.15em] uppercase text-amber-500">Lower Bracket</h2><div class="flex-1 h-[1px] bg-gradient-to-r from-border to-transparent"></div>`;
    bracketContainer.appendChild(lblLower);
    bracketContainer.appendChild(tampilkanBracket(daftarBabakLower, 'Lower'));

    /* Grand Final */
    const div2 = document.createElement('hr'); div2.className = 'border-none border-t border-border my-7';
    bracketContainer.appendChild(div2);
    const lblGrand = document.createElement('div');
    lblGrand.className = 'flex items-center gap-3 mt-6 mb-4 first:mt-0';
    lblGrand.innerHTML = `<h2 class="font-head text-[1.3rem] font-black tracking-[.15em] uppercase text-red">Grand Final</h2><div class="flex-1 h-[1px] bg-gradient-to-r from-border to-transparent"></div>`;
    bracketContainer.appendChild(lblGrand);

    const grandCard = document.createElement('div');
    grandCard.className = 'border border-red-dim rounded-md p-5 max-w-[380px] relative overflow-hidden bg-gradient-to-br from-[#1a0808] via-[#1a1208] to-bg';
    grandCard.innerHTML = `<div class="absolute -top-1.5 right-4 font-head text-[.65rem] font-black tracking-[.3em] text-red bg-bg px-2">GRAND FINAL</div>`;

    const upperSlot = document.createElement('div');
    upperSlot.className = 'flex items-center justify-between py-3 border-b border-border last:border-none';
    const lowerSlot = document.createElement('div');
    lowerSlot.className = 'flex items-center justify-between py-3 border-b border-border last:border-none';

    const uNameEl = document.createElement('div');
    uNameEl.className = 'grand-slot-name font-head text-[1.3rem] font-black tracking-[.05em] cursor-pointer transition-colors duration-200 hover:text-red';
    uNameEl.textContent = '—';
    upperSlot.innerHTML = `<div><div class="font-head text-[.65rem] tracking-[.2em] text-muted uppercase mb-1">Upper Winner</div></div>`;
    upperSlot.querySelector('div div').after(uNameEl); 

    const lNameEl = document.createElement('div');
    lNameEl.className = 'grand-slot-name font-head text-[1.3rem] font-black tracking-[.05em] cursor-pointer transition-colors duration-200 hover:text-red';
    lNameEl.textContent = '—';
    lowerSlot.innerHTML = `<div><div class="font-head text-[.65rem] tracking-[.2em] text-muted uppercase mb-1">Lower Winner</div></div>`;
    lowerSlot.querySelector('div div').after(lNameEl);

    grandPemenangUpper = { dataset: {}, querySelector: (s) => s === '.grand-slot-name' ? uNameEl : null };
    grandPemenangLower = { dataset: {}, querySelector: (s) => s === '.grand-slot-name' ? lNameEl : null };

    const grandStatus = document.createElement('div');
    grandStatus.id = 'Grand-Status';
    grandStatus.className = 'font-ui text-[.8rem] text-muted mt-3 tracking-[.05em]';
    grandStatus.textContent = 'Menunggu kedua finalis…';

    const champDiv = document.createElement('div');
    champDiv.className = 'items-center gap-3 mt-4 p-3 bg-red/10 border border-red-dim rounded-md hidden';
    champDiv.innerHTML = `<div class="text-2xl">🏆</div><div><div class="font-head text-[.65rem] tracking-[.25em] text-muted uppercase">Champion</div><div class="font-head text-[1.4rem] font-black text-red tracking-[.06em]" id="champ-name">—</div></div>`;

    const setChampion = (wEl, lEl) => {
      const wName = wEl.textContent;
      const lName = lEl.textContent;
      if (!wName || wName === '—') return;
      openModal(wName, lName, (sl, sr) => {
        const champ = sl > sr ? wName : lName;
        if(sl > sr) wEl.classList.add('text-red');
        else lEl.classList.add('text-red');
        grandStatus.textContent = '';
        champDiv.classList.replace('hidden', 'flex');
        document.getElementById('champ-name').textContent = champ;
        showToast(`👑 ${champ} adalah CHAMPION!`, 'win');
      });
    };
    uNameEl.addEventListener('click', () => setChampion(uNameEl, lNameEl));
    lNameEl.addEventListener('click', () => setChampion(lNameEl, uNameEl));

    grandCard.append(upperSlot, lowerSlot, grandStatus, champDiv);
    bracketContainer.appendChild(grandCard);
  }

  tombolExport.style.display = 'inline-flex';
  tampilkanStats(hasil.teams.length, mode);
  showToast('Bracket berhasil dibuat!', 'win');
});

pilihanJumlahTim.addEventListener('change', function () {
  if (this.value === 'other') {
    customWrap.style.display = '';
    inputJumlahCustom.focus();
    inputTim.innerHTML = '';
  } else {
    customWrap.style.display = 'none';
    inputJumlahCustom.value = '';
    buatInputTim(parseInt(this.value, 10));
  }
});

inputJumlahCustom.addEventListener('input', function () {
  let n = parseInt(this.value, 10);
  if (isNaN(n)) { inputTim.innerHTML = ''; return; }
  if (n > 16) { n = 16; this.value = '16'; pesanStatus.textContent = 'Maksimum 16 tim.'; }
  else pesanStatus.textContent = '';
  if (n >= 2) buatInputTim(n);
  else inputTim.innerHTML = '';
});

tombolExport.addEventListener('click', () => {
  if (typeof html2canvas === 'undefined') { alert('html2canvas tidak tersedia.'); return; }
  html2canvas(bracketContainer, { backgroundColor: '#0a0a0a', scale: 2 }).then(canvas => {
    const a = document.createElement('a');
    a.download = 'action-bracket.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('Bracket berhasil di-export!', 'win');
  });
});

buatInputTim(parseInt(pilihanJumlahTim.value, 10));