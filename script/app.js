// Inisiasi disini semua kung pake DOM, nama variabel pake indo biar familiar yah
const pilihanJumlahTim = document.getElementById('team-count');
const inputTim = document.getElementById('team-inputs');
const tombolBuatBracket = document.getElementById('btn-generate');
const bracketContainer = document.getElementById('bracket-container');
const pesanStatus = document.getElementById('status-message');
const pilihanModeBagan = document.getElementById('bracket-mode');
const inputJumlahCustom = document.getElementById('custom-team-count');
const btnExport = document.getElementById('btn-export');
const scoreModal = document.getElementById('score-modal');
const scoreLeftInput = document.getElementById('score-left');
const scoreRightInput = document.getElementById('score-right');
const btnSaveScore = document.getElementById('btn-save-score');
const btnCloseModal = document.getElementById('btn-close-modal');

let currentMatchData = null; 

// Input nama tim
function buatInputTim(jumlahTim) {
    inputTim.innerHTML = '';
    bracketContainer.innerHTML = '';
    pesanStatus.textContent = '';

    for (let nomorTim = 1; nomorTim <= jumlahTim; nomorTim++) {
        const kolomNama = document.createElement('input');
        kolomNama.type = 'text';
        kolomNama.placeholder = `Tim ${nomorTim}`;
        kolomNama.id = `team-${nomorTim}`;
        kolomNama.autocomplete = 'off';
        inputTim.appendChild(kolomNama);
    }
}

// Pokoknya inputan nama tim di proses fungsi yang ini
function ambilDaftarTim() {
    const daftarInput = inputTim.querySelectorAll('input');
    const daftarTim = Array.from(daftarInput).map((kolomNama) => kolomNama.value.trim());

    if (daftarTim.some((namaTim) => namaTim === '')) {
        pesanStatus.textContent = 'Semua nama tim wajib untuk diisi.';
        return { error: 'Semua nama tim wajib untuk diisi.' };
    }

    const namaBaku = daftarTim.map((namaTim) => namaTim.toLowerCase());
    const adaNamaKembar = new Set(namaBaku).size !== namaBaku.length;

    if (adaNamaKembar) {
        pesanStatus.textContent = 'Nama tim tidak boleh ada yang sama.';
        return { error: 'Nama tim tidak boleh ada yang sama.' };
    }

    return { teams: daftarTim };
}

// Ngacak kombinasi tim buat dimasukin ke bracket
function acakUrutanTim(daftarTim) {
    const timAcak = [...daftarTim];
    for (let indeks = timAcak.length - 1; indeks > 0; indeks--) {
        const indeksAcak = Math.floor(Math.random() * (indeks + 1));
        [timAcak[indeks], timAcak[indeksAcak]] = [timAcak[indeksAcak], timAcak[indeks]];
    }
    return timAcak;
}

// Penamaan babak
function namaBabak(indeksBabak, jumlahTimAwal) {
    const timDiBabakIni = jumlahTimAwal / Math.pow(2, indeksBabak);
    if (timDiBabakIni >= 16) return 'Babak 16 Besar';
    if (timDiBabakIni === 8) return 'Perempat Final';
    if (timDiBabakIni === 4) return 'Semifinal';
    if (timDiBabakIni === 2) return 'Final';
    return `Babak ${indeksBabak + 1}`;
}

// Susunin bracket hasil dari acakUrutanTim
function susunBracket(daftarTim) {
    const rounds = [];
    let slotSaatIni = acakUrutanTim(daftarTim).map((namaTim) => ({ label: namaTim }));
    let nomorBabak = 1;

    while (slotSaatIni.length > 1) {
        const pertandinganBabak = [];
        const slotBerikutnya = [];
        for (let indeks = 0; indeks < slotSaatIni.length; indeks += 2) {
            const sisiKiri = slotSaatIni[indeks];
            const sisiKanan = slotSaatIni[indeks + 1] || { label: 'BYE' };
            const nomorPertandingan = pertandinganBabak.length + 1;
            const labelPemenang = `Pemenang Babak ${nomorBabak} M-${nomorPertandingan}`;

            pertandinganBabak.push({
                left: sisiKiri.label,
                right: sisiKanan.label,
                winner: labelPemenang,
            });
            slotBerikutnya.push({ label: labelPemenang });
        }
        rounds.push(pertandinganBabak);
        slotSaatIni = slotBerikutnya;
        nomorBabak += 1;
    }
    return rounds;
}

// Ini Logicnya nampilin pop score buat tiap pertandingan, jadi pas user klik nama timnya bakal muncul modal buat input skor terus nanti bisa disimpen buat nentuin pemenangnya gitu pekerjaan ini[cite: 1]
const bukaModalSkor = (timKiriObj, timKananObj, deskripsi, tipeBagan, babakSekarang, matchSekarang, indeksPertandingan) => {
    if (timKiriObj.textContent === 'BYE' || timKiriObj.textContent.includes('Pemenang') || timKiriObj.textContent.includes('Kalah')) {
        alert("Tim belum lengkap!");
        return;
    }

    currentMatchData = { timKiriObj, timKananObj, deskripsi, tipeBagan, babakSekarang, matchSekarang, indeksPertandingan };
    
    document.getElementById('modal-team-left').textContent = timKiriObj.textContent;
    document.getElementById('modal-team-right').textContent = timKananObj.textContent;
    scoreLeftInput.value = 0;
    scoreRightInput.value = 0;
    scoreModal.style.display = 'flex';
};

btnSaveScore.addEventListener('click', () => {
    const sLeft = parseInt(scoreLeftInput.value);
    const sRight = parseInt(scoreRightInput.value);

    if (sLeft === sRight) {
        alert("Skor tidak boleh seri!");
        return;
    }

    const { timKiriObj, timKananObj, deskripsi, tipeBagan, babakSekarang, matchSekarang, indeksPertandingan } = currentMatchData;
    let pemenang, kalah, skorTeks;

    if (sLeft > sRight) {
        pemenang = timKiriObj; kalah = timKananObj; skorTeks = `(${sLeft}-${sRight})`;
    } else {
        pemenang = timKananObj; kalah = timKiriObj; skorTeks = `(${sRight}-${sLeft})`;
    }

    // Update Visual
    pemenang.style.fontWeight = 'bold'; pemenang.style.color = '#28a745'; pemenang.style.textDecoration = 'none';
    kalah.style.fontWeight = 'normal'; kalah.style.color = '#dc3545'; kalah.style.textDecoration = 'line-through';
    deskripsi.textContent = `Lolos: ${pemenang.textContent} ${skorTeks}`;

    // Kirim ke Babak Selanjutnya
    const babakSelanjutnya = babakSekarang + 1;
    const matchSelanjutnya = Math.floor(indeksPertandingan / 2) + 1;
    const posisiSelanjutnya = (indeksPertandingan % 2 === 0) ? 'Kiri' : 'Kanan';
    const targetId = `${tipeBagan}-babak-${babakSelanjutnya}-match-${matchSelanjutnya}-${posisiSelanjutnya}`;
    
    const slotTujuan = document.getElementById(targetId);
    if (slotTujuan) {
        slotTujuan.textContent = pemenang.textContent;
        slotTujuan.style.color = '#000';
        slotTujuan.style.textDecoration = 'none';
        slotTujuan.style.fontWeight = 'normal';
    }

    // Logika Lower Bracket (Kalah Upper pindah ke Lower)[cite: 1]
    if (tipeBagan === 'Upper' && babakSekarang === 1) {
        const slotLower = document.getElementById(`Lower-slot-${matchSekarang}`);
        if (slotLower) {
            slotLower.textContent = kalah.textContent;
            slotLower.style.color = '#d39e00';
            slotLower.style.textDecoration = 'none';
            slotLower.style.fontWeight = 'bold';
        }
    }

    scoreModal.style.display = 'none';
});

btnCloseModal.onclick = () => scoreModal.style.display = 'none';

// Render bracket ke html (ini gua ubah dikit penyesuaian buat nampilin lower sama upper nya(tambahan lagi buat nampilin status pertandingan sama buat klik nama tim buat menetapkan si pemenangnya))
// Tamabahan lagi buat nampilin status pertandingan sama buat klik nama tim buat menetapkan si pemenangnya)
function tampilkanBracket(daftarBabak, tipeBagan) {
    const wrapper = document.createElement('div');
    const jumlahTimAwal = Math.pow(2, daftarBabak.length);

    if (daftarBabak.length === 0) {
        bracketContainer.textContent = 'Bracket belum ada/dibuat.';
        return;
    }
    // Bersiaplah
    daftarBabak.forEach((pertandinganBabak, indeksBabak) => {
        const sectionBabak = document.createElement('section');
        const judulBabak = document.createElement('h3');
        const daftarPertandingan = document.createElement('div');
        
        judulBabak.textContent = (tipeBagan === 'Upper') ? namaBabak(indeksBabak, jumlahTimAwal) : `Lower Bracket ${indeksBabak + 1}`;
        
        pertandinganBabak.forEach((pertandingan, indeksPertandingan) => {
            const cardPertandingan = document.createElement('article');
            cardPertandingan.className = 'match-card';
            cardPertandingan.style.border = '1px solid #ccc'; cardPertandingan.style.padding = '10px'; cardPertandingan.style.marginBottom = '10px'; cardPertandingan.style.borderRadius = '8px';

            const timKiri = document.createElement('p');
            const timKanan = document.createElement('p');
            const deskripsi = document.createElement('p');
            
            const babakSekarang = indeksBabak + 1;
            const matchSekarang = indeksPertandingan + 1;

            timKiri.textContent = pertandingan.left;
            timKanan.textContent = pertandingan.right;
            deskripsi.textContent = `Status: Menunggu...`;
            deskripsi.style.fontSize = '0.85em';

            timKiri.id = `${tipeBagan}-babak-${babakSekarang}-match-${matchSekarang}-Kiri`;
            timKanan.id = `${tipeBagan}-babak-${babakSekarang}-match-${matchSekarang}-Kanan`;

            // Khusus ID Lower dari Upper Babak 1[cite: 1]
            if (tipeBagan === 'Lower' && babakSekarang === 1) {
                if (pertandingan.left.includes('Kalah')) timKiri.id = `Lower-slot-${matchSekarang * 2 - 1}`;
                if (pertandingan.right.includes('Kalah')) timKanan.id = `Lower-slot-${matchSekarang * 2}`;
            }

            timKiri.style.cursor = 'pointer';
            timKanan.style.cursor = 'pointer';

            // EVENT CLICK: Buka Pop-up Score[cite: 1]
            cardPertandingan.addEventListener('click', () => {
                bukaModalSkor(timKiri, timKanan, deskripsi, tipeBagan, babakSekarang, matchSekarang, indeksPertandingan);
            });

            cardPertandingan.append(timKiri, timKanan, deskripsi);
            daftarPertandingan.appendChild(cardPertandingan);
        });
        sectionBabak.append(judulBabak, daftarPertandingan);
        wrapper.appendChild(sectionBabak);
    });
    return wrapper;
}

// Dropdown yang pilih jumlah tim (ini ada perubahan biar si user bisa pilih bebas jumlah timnya pek)
pilihanJumlahTim.addEventListener('change', function () {
    if (this.value === 'other') {
        inputJumlahCustom.style.display = 'inline-block';
        inputJumlahCustom.focus();
        inputTim.innerHTML = '';
    } else {
        inputJumlahCustom.style.display = 'none';
        buatInputTim(parseInt(this.value, 10));
    }
});
//  ini buat nampilin text box jumlah tim custom yang diinput user pek
inputJumlahCustom.addEventListener('input', function () {
    let jumlah = parseInt(this.value, 10);
    if (isNaN(jumlah)) return;
    if (jumlah > 16) {
        jumlah = 16;
        this.value = '16';
        pesanStatus.textContent = 'Maksimum 16 tim.';
    } else {
        pesanStatus.textContent = '';
    }
    if (jumlah >= 2) buatInputTim(jumlah);
});

// Generate bracketnya (ini juga ada beberapa penyesuaian buat nampilin lower sama upper nya)
tombolBuatBracket.addEventListener('click', function () {
    const hasil = ambilDaftarTim();
    if (hasil.error) {
        pesanStatus.textContent = hasil.error;
        return;
    }
    
    bracketContainer.innerHTML = '';
    const daftarBabakUpper = susunBracket(hasil.teams);
    
    const hUpper = document.createElement('h2'); hUpper.textContent = 'Upper Bracket';
    bracketContainer.append(hUpper, tampilkanBracket(daftarBabakUpper, 'Upper'));

    if (pilihanModeBagan.value === 'double') {
        const daftarBabakLower = susunLowerBracket(daftarBabakUpper[0].length);
        const hLower = document.createElement('h2'); hLower.textContent = 'Lower Bracket';
        bracketContainer.append(document.createElement('hr'), hLower, tampilkanBracket(daftarBabakLower, 'Lower'));
    }

    btnExport.style.display = 'block'; 
});

// Fitur Export yang gw buat guys ~ Lian, jadi nanti user bisa simpan hasil bracketnya dalam bentuk gambar, tinggal klik tombol exportnya aja nanti bakal otomatis download gambarnya[cite: 1]
btnExport.addEventListener('click', () => {
    html2canvas(bracketContainer).then(canvas => {
        const link = document.createElement('a');
        link.download = 'bracket-action.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});

// Awal
buatInputTim(parseInt(pilihanJumlahTim.value, 10));

// pokonya ini buat nyusun si lower nya trus dapetnya dari si upper, ya gampang nya yang kalah di upper bakal turun dulu ke lower ini gitu pek
function susunLowerBracket(jumlahPertandinganAwalUpper) {
    const rounds = [];
    let slotSaatIni = [];
    for (let i = 1; i <= jumlahPertandinganAwalUpper; i++) {
        slotSaatIni.push({ label: `Kalah Upper Match ${i}` });
    }
    let nomorBabak = 1;
    while (slotSaatIni.length > 1) {
        const pertandinganBabak = [];
        const slotBerikutnya = [];
        for (let indeks = 0; indeks < slotSaatIni.length; indeks += 2) {
            const sisiKiri = slotSaatIni[indeks];
            const sisiKanan = slotSaatIni[indeks + 1] || { label: 'BYE' };
            const labelPemenang = `Pemenang Lower B${nomorBabak} M${pertandinganBabak.length + 1}`;
            pertandinganBabak.push({ left: sisiKiri.label, right: sisiKanan.label });
            slotBerikutnya.push({ label: labelPemenang });
        }
        rounds.push(pertandinganBabak);
        slotSaatIni = slotBerikutnya;
        nomorBabak++;
    }
    return rounds;
}