// Inisiasi disini semua kung pake DOM, nama variabel pake indo biar familiar yah
const pilihanJumlahTim = document.getElementById('team-count');
const inputTim = document.getElementById('team-inputs');
const tombolBuatBracket = document.getElementById('btn-generate');
const bracketContainer = document.getElementById('bracket-container');
const pesanStatus = document.getElementById('status-message');
const pilihanModeBagan = document.getElementById('bracket-mode');
const inputJumlahCustom = document.getElementById('custom-team-count');
let modeDoubleBracket = false;
let grandPemenangUpper = null;
let grandPemenangLower = null;

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

// Render bracket ke html (ini gua ubah dikit penyesuaian buat nampilin lower sama upper nya(tambahan lagi buat nampilin status pertandingan sama buat klik nama tim buat menetapkan si pemenangnya)(Beberapa gua ubah lagi buat nampilin nama tim yang kalah di upper terus masuk ke lower))
function tampilkanBracket(daftarBabak, tipeBagan) {
    const wrapper = document.createElement('div');
    const jumlahTimAwal = Math.pow(2, daftarBabak.length);
    
    let jumlahTimAwalLower = jumlahTimAwal;
    if (tipeBagan === 'Lower' && daftarBabak.length > 0) {
        jumlahTimAwalLower = daftarBabak[0].length * 2;
    }

    if (daftarBabak.length === 0) {
        bracketContainer.textContent = 'Bracket belum ada/dibuat.';
        return;
    }

    // Bersiaplah
    daftarBabak.forEach((pertandinganBabak, indeksBabak) => {
        const sectionBabak = document.createElement('section');
        const judulBabak = document.createElement('h3');
        const daftarPertandingan = document.createElement('div');

        if (modeDoubleBracket) {
            judulBabak.textContent = `${tipeBagan} Bracket ${indeksBabak + 1}`;
        } else {
            if (tipeBagan === 'Upper'){
                judulBabak.textContent = namaBabak(indeksBabak, jumlahTimAwal);
            } else {
                judulBabak.textContent = namaBabak(indeksBabak, jumlahTimAwalLower);
            }
        }
        
        daftarPertandingan.setAttribute('data-round', String(indeksBabak + 1));

        pertandinganBabak.forEach((pertandingan, indeksPertandingan) => {
            const cardPertandingan = document.createElement('article');
            cardPertandingan.style.border = '1px solid #ccc';
            cardPertandingan.style.padding = '10px';
            cardPertandingan.style.marginBottom = '10px';
            cardPertandingan.style.borderRadius = '8px';

            const judulPertandingan = document.createElement('h4');
            judulPertandingan.style.margin = '0 0 10px 0';

            const timKiri = document.createElement('p');
            const timKanan = document.createElement('p');
            const deskripsiBerikutnya = document.createElement('p');

            judulPertandingan.textContent = `Pertandingan ${indeksPertandingan + 1}`;
            timKiri.textContent = pertandingan.left;
            timKanan.textContent = pertandingan.right;
            deskripsiBerikutnya.textContent = `Status: Menunggu Pemenang...`;
            deskripsiBerikutnya.style.fontSize = '0.85em';

            const babakSekarang = indeksBabak + 1;
            const matchSekarang = indeksPertandingan + 1;
            
            timKiri.id = `${tipeBagan}-babak-${babakSekarang}-match-${matchSekarang}-Kiri`;
            timKanan.id = `${tipeBagan}-babak-${babakSekarang}-match-${matchSekarang}-Kanan`;

            if (tipeBagan === 'Lower') {
                if (pertandingan.leftOrigin) {
                    timKiri.id = `${tipeBagan}-slot-babak-${pertandingan.leftOrigin.babak}-pert-${pertandingan.leftOrigin.pertandingan}-Kiri`;
                }
                if (pertandingan.rightOrigin) {
                    timKanan.id = `${tipeBagan}-slot-babak-${pertandingan.rightOrigin.babak}-pert-${pertandingan.rightOrigin.pertandingan}-Kanan`;
                }
            }

            timKiri.style.cursor = 'pointer';
            timKanan.style.cursor = 'pointer';

            const tetapkanPemenang = (elemenPemenang, elemenKalah) => {
                const namaPemenang = elemenPemenang.textContent;

                if (namaPemenang === 'BYE' || namaPemenang.includes('Pemenang') || namaPemenang.includes('Kalah')) {
                    return;
                }

                elemenPemenang.style.fontWeight = 'bold';
                elemenPemenang.style.color = '#28a745';
                elemenPemenang.style.textDecoration = 'none';

                elemenKalah.style.fontWeight = 'normal';
                elemenKalah.style.color = '#dc3545';
                elemenKalah.style.textDecoration = 'line-through';

                deskripsiBerikutnya.textContent = `Lolos: ${elemenPemenang.textContent}`;

                const babakSelanjutnya = babakSekarang + 1;
                const matchSelanjutnya = Math.floor(indeksPertandingan / 2) + 1;
                const posisiSelanjutnya = (indeksPertandingan % 2 === 0) ? 'Kiri' : 'Kanan';

                const targetId = `${tipeBagan}-babak-${babakSelanjutnya}-match-${matchSelanjutnya}-${posisiSelanjutnya}`;
                const slotTujuan = document.getElementById(targetId);

                if (slotTujuan) {
                    slotTujuan.textContent = namaPemenang;
                    slotTujuan.style.fontWeight = 'normal';
                    slotTujuan.style.color = '#000';
                    slotTujuan.style.textDecoration = 'none';
                } else {
                    if (modeDoubleBracket) {
                        if (tipeBagan === 'Upper' && grandPemenangUpper) {
                            grandPemenangUpper.textContent = namaPemenang;
                            grandPemenangUpper.style.fontWeight = 'normal';
                            grandPemenangUpper.style.color = '#000';
                        }
                        if (tipeBagan === 'Lower' && grandPemenangLower) {
                            grandPemenangLower.textContent = namaPemenang;
                            grandPemenangLower.style.fontWeight = 'normal';
                            grandPemenangLower.style.color = '#000';
                        }
                    }
                }

                if (tipeBagan === 'Upper') {
                    const slotLowerId = `Lower-slot-babak-${babakSekarang}-pert-${matchSekarang}-Kiri`;
                    const slotLowerAltId = `Lower-slot-babak-${babakSekarang}-pert-${matchSekarang}-Kanan`;
                    const slotLower = document.getElementById(slotLowerId) || document.getElementById(slotLowerAltId);
                    if (slotLower) {
                        slotLower.textContent = elemenKalah.textContent;
                        slotLower.style.fontWeight = 'bold';
                        slotLower.style.color = '#d39e00';
                        slotLower.style.textDecoration = 'none';
                    }
                }
            };

            timKiri.addEventListener('click', () => tetapkanPemenang(timKiri, timKanan));
            timKanan.addEventListener('click', () => tetapkanPemenang(timKanan, timKiri));
            cardPertandingan.append(judulPertandingan, timKiri, timKanan, deskripsiBerikutnya);
            daftarPertandingan.appendChild(cardPertandingan);
        });

        sectionBabak.append(judulBabak, daftarPertandingan);
        wrapper.appendChild(sectionBabak);
    });
    return wrapper;
}

// Dropdown yang pilih jumlah tim (ini ada perubahan biar si user bisa pilih bebas jumlah timnya pek(pak pek pak pek))
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

// ini buat nampilin text box jumlah tim custom yang diinput user pek
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

    modeDoubleBracket = modeBagan === 'double';
    grandPemenangUpper = null;
    grandPemenangLower = null;

    const headerUpper = document.createElement('h2');
    headerUpper.textContent = 'Upper Bracket';
    bracketContainer.appendChild(headerUpper);
    bracketContainer.appendChild(tampilkanBracket(daftarBabakUpper, 'Upper'));

    if (modeBagan === 'double') {
        const daftarBabakLower = susunLowerBracket(daftarBabakUpper);

        const divider = document.createElement('hr');
        const headerLower = document.createElement('h2');
        headerLower.textContent = 'Lower Bracket';

        bracketContainer.appendChild(divider);
        bracketContainer.appendChild(headerLower);
        bracketContainer.appendChild(tampilkanBracket(daftarBabakLower, 'Lower'));

        const divider2 = document.createElement('hr');
        const headerGrand = document.createElement('h2');
        headerGrand.textContent = 'Grand Final';
        const grandWrap = document.createElement('div');

        const upLabel = document.createElement('p');
        upLabel.textContent = 'Upper Winner';
        const lowLabel = document.createElement('p');
        lowLabel.textContent = 'Lower Winner';

        grandPemenangUpper = document.createElement('p');
        grandPemenangUpper.id = 'Grand-Upper';
        grandPemenangUpper.textContent = '---';
        grandPemenangUpper.style.cursor = 'pointer';

        grandPemenangLower = document.createElement('p');
        grandPemenangLower.id = 'Grand-Lower';
        grandPemenangLower.textContent = '---';
        grandPemenangLower.style.cursor = 'pointer';

        const grandStatus = document.createElement('p');
        grandStatus.id = 'Grand-Status';
        grandStatus.textContent = 'Menunggu kedua sisi...';

        const setChampion = (winnerEl, loserEl) => {
            if (winnerEl.textContent === '---' || winnerEl.textContent === '') return;
            winnerEl.style.fontWeight = 'bold';
            winnerEl.style.color = '#28a745';
            loserEl.style.fontWeight = 'normal';
            loserEl.style.color = '#dc3545';
            grandStatus.textContent = `Champion: ${winnerEl.textContent}`;
        };

        grandPemenangUpper.addEventListener('click', () => setChampion(grandPemenangUpper, grandPemenangLower));
        grandPemenangLower.addEventListener('click', () => setChampion(grandPemenangLower, grandPemenangUpper));

        grandWrap.append(upLabel, grandPemenangUpper, lowLabel, grandPemenangLower, grandStatus);
        bracketContainer.appendChild(divider2);
        bracketContainer.appendChild(headerGrand);
        bracketContainer.appendChild(grandWrap);
    }
});

buatInputTim(parseInt(pilihanJumlahTim.value, 10));

// pokonya ini buat nyusun si lower nya trus dapetnya dari si upper, ya gampang nya yang kalah di upper bakal turun dulu ke lower ini gitu pek (Ini juga ada yang gua ubah sama tambahan buat nampilin nama tim yang kalah di upper terus masuk ke lower, jadi bukan cuma slot kosong doang yang turun ke lower, tapi nama timnya juga langsung turun ke lower)
function susunLowerBracket(babakUpper) {
    const babak = [];

    let slotSaatIni = [];
    const jumlahAwal = babakUpper[0].length;
    for (let i = 1; i <= jumlahAwal; i++) {
        slotSaatIni.push({ label: `Kalah Upper Babak 1 Pertandingan ${i}`, origin: { babak: 1, pertandingan: i } });
    }

    let nomorBabak = 1;
    for (let tahap = 0; ; tahap++) {
        if (slotSaatIni.length === 0) break;

        const pertandinganBabak = [];
        const slotBerikutnya = [];

        for (let indeks = 0; indeks < slotSaatIni.length; indeks += 2) {
            const sisiKiri = slotSaatIni[indeks];
            const sisiKanan = slotSaatIni[indeks + 1] || null;
            const nomorPertandingan = pertandinganBabak.length + 1;
            const labelPemenang = `Pemenang Lower Babak ${nomorBabak} Pertandingan ${nomorPertandingan}`;

            pertandinganBabak.push({
                left: sisiKiri.label,
                leftOrigin: sisiKiri.origin,
                right: sisiKanan ? sisiKanan.label : 'BYE',
                rightOrigin: sisiKanan ? sisiKanan.origin : undefined,
                winner: labelPemenang,
            });

            slotBerikutnya.push({ label: labelPemenang });
        }

        babak.push(pertandinganBabak);

        const indexUpperBerikut = tahap + 1;
        if (indexUpperBerikut < babakUpper.length) {
            const jumlahLoser = babakUpper[indexUpperBerikut].length;
            for (let j = 1; j <= jumlahLoser; j++) {
                slotBerikutnya.push({ label: `Kalah Upper Babak ${indexUpperBerikut + 1} Pertandingan ${j}`, origin: { babak: indexUpperBerikut + 1, pertandingan: j } });
            }
        }

        slotSaatIni = slotBerikutnya;
        nomorBabak += 1;

        if (slotSaatIni.length === 1 && indexUpperBerikut >= babakUpper.length) break;
    }

    return babak;
}