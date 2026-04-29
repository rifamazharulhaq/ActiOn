// Inisiasi disini semua kung pake DOM, nama variabel pake indo biar familiar yah
const pilihanJumlahTim = document.getElementById('team-count');
const inputTim = document.getElementById('team-inputs');
const tombolBuatBracket = document.getElementById('btn-generate');
const bracketContainer = document.getElementById('bracket-container');
const pesanStatus = document.getElementById('status-message');
const pilihanModeBagan = document.getElementById('bracket-mode');
const inputJumlahCustom = document.getElementById('custom-team-count');

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
        return { 
            error: 'Semua nama tim wajib untuk diisi.' 
        };
    }

    const namaBaku = daftarTim.map((namaTim) => namaTim.toLowerCase());
    const adaNamaKembar = new Set(namaBaku).size !== namaBaku.length;

    if (adaNamaKembar) {
        pesanStatus.textContent = 'Nama tim tidak boleh ada yang sama.';
        return { 
            error: 'Nama tim tidak boleh ada yang sama.' 
        };
    }

    return { 
        teams: daftarTim 
    };
}

// Ngacak kombinasi tim buat dimasukin ke bracket, ribet pokoknya pake AI guwah
function acakUrutanTim(daftarTim) {
    const timAcak = [...daftarTim];

    for (let indeks = timAcak.length - 1; indeks > 0; indeks--) {
        const indeksAcak = Math.floor(Math.random() * (indeks + 1));
        [timAcak[indeks], timAcak[indeksAcak]] = [timAcak[indeksAcak], timAcak[indeks]];
    }

    return timAcak;
}

// Penamaan babak sesuai tim yang ada, misal
function namaBabak(indeksBabak, jumlahTimAwal) {
    const timDiBabakIni = jumlahTimAwal / Math.pow(2, indeksBabak);

    if (timDiBabakIni >= 16) {
        return 'Babak 16 Besar';
    }

    if (timDiBabakIni === 8) {
        return 'Perempat Final';
    }

    if (timDiBabakIni === 4) {
        return 'Semifinal';
    }

    if (timDiBabakIni === 2) {
        return 'Final';
    }

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
            const sisiKanan = slotSaatIni[indeks + 1] || null;
            const nomorPertandingan = pertandinganBabak.length + 1;
            const labelPemenang = `Pemenang Babak ${nomorBabak} Pertandingan ${nomorPertandingan}`;

            pertandinganBabak.push({
                left: sisiKiri.label,
                right: sisiKanan ? sisiKanan.label : 'BYE',
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

// Render bracket ke html (ini gua ubah dikit penyesuaian buat nampilin lower sama upper nya)
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

        if (tipeBagan === 'Upper'){
            judulBabak.textContent = namaBabak(indeksBabak, jumlahTimAwal);
        } else {
            judulBabak.textContent = `Lower Bracket ${indeksBabak + 1}`;
        }
        
        daftarPertandingan.setAttribute('data-round', String(indeksBabak + 1));

        pertandinganBabak.forEach((pertandingan, indeksPertandingan) => {
            const cardPertandingan = document.createElement('article');
            const judulPertandingan = document.createElement('h4');
            const timKiri = document.createElement('p');
            const timKanan = document.createElement('p');
            const deskripsiBerikutnya = document.createElement('p');

            judulPertandingan.textContent = `Pertandingan ${indeksPertandingan + 1}`;
            timKiri.textContent = pertandingan.left;
            timKanan.textContent = pertandingan.right;
            deskripsiBerikutnya.textContent = `Berikutnya: ${pertandingan.winner}`;

            cardPertandingan.append(judulPertandingan, timKiri, timKanan, deskripsiBerikutnya);
            daftarPertandingan.appendChild(cardPertandingan);
        });

        sectionBabak.append(judulBabak, daftarPertandingan);
        bracketContainer.appendChild(sectionBabak);
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
        inputJumlahCustom.value = '';

        buatInputTim(parseInt(this.value, 10));
    }
});

inputJumlahCustom.addEventListener('input', function () {
    let jumlah = parseInt(this.value, 10);

    if (isNaN(jumlah)) {
        inputTim.innerHTML = '';
        return;
    }

    if (jumlah > 16) {
        jumlah = 16;
        this.value = '16';
        pesanStatus.textContent = 'Maksimum jumlah tim adalah 16.';
    } else {
        pesanStatus.textContent = '';
    }

    if (jumlah >= 2) {
        buatInputTim(jumlah);
    } else {
        inputTim.innerHTML = '';
    }
});

// Generate bracketnya (ini juga ada beberapa penyesuaian buat nampilin lower sama upper nya)
tombolBuatBracket.addEventListener('click', function () {
    const hasil = ambilDaftarTim();
    const modeBagan = pilihanModeBagan.value;

    if (hasil.error) {
        bracketContainer.innerHTML = '';
        pesanStatus.textContent = hasil.error;
        return;
    }

    const daftarBabakUpper = susunBracket(hasil.teams);
    bracketContainer.innerHTML = '';

    const headerUpper = document.createElement('h2');
    headerUpper.textContent = '🏆 Upper Bracket';
    bracketContainer.appendChild(headerUpper);
    bracketContainer.appendChild(tampilkanBracket(daftarBabakUpper, 'Upper'));

    if (modeBagan === 'double') {
        const jumlahPertandinganAwalUpper = daftarBabakUpper[0].length;
        const daftarBabakLower = susunLowerBracket(jumlahPertandinganAwalUpper);

        const divider = document.createElement('hr');
        const headerLower = document.createElement('h2');
        headerLower.textContent = '🛡️ Lower Bracket';

        bracketContainer.appendChild(divider);
        bracketContainer.appendChild(headerLower);
        bracketContainer.appendChild(tampilkanBracket(daftarBabakLower, 'Lower'));
    }
});

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
            const sisiKanan = slotSaatIni[indeks + 1] || null;
            const nomorPertandingan = pertandinganBabak.length + 1;
            const labelPemenang = `Pemenang Lower Babak ${nomorBabak} M-${nomorPertandingan}`;

            pertandinganBabak.push({
                left: sisiKiri.label,
                right: sisiKanan ? sisiKanan.label : 'BYE',
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