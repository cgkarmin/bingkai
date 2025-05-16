// modul1_draf_watak/script_modul1_draf_watak.js
// Skrip untuk Modul 1: Draf Cerita & Pembangunan Watak Asas

document.addEventListener('DOMContentLoaded', () => {
    console.log("Modul 1: DOMContentLoaded - Skrip Draf & Watak dimulakan.");

    // --- Konfigurasi Jadual Papan Cerita Asas ---
    const rowsConfigM1 = [
        { label: "Mula Cerita", title: "Bahagian permulaan cerita – Siapa & di mana?" },
        { label: "Masalah", title: "Apa konflik, cabaran atau kejadian utama?" },
        { label: "Penyelesaian", title: "Tindakan atau keputusan yang menyelesaikan masalah" },
        { label: "Akhir Cerita", title: "Kesudahan cerita – bagaimana ia tamat?" }
    ];
    const colsConfigM1 = [
        { label: "Orang & Tempat", key: "orang_tempat" },
        { label: "Peristiwa", key: "peristiwa" },
        { label: "Perasaan", key: "perasaan" },
        { label: "Dialog Ringkas", key: "dialog_ringkas" }
    ];

    // --- Kunci localStorage & Pemboleh Ubah Global Projek ---
    const LOCAL_STORAGE_KEY_EKA = 'projekBCPS_DataLengkap';
    let projekDataEkaSemasa = {}; // Objek utama untuk menyimpan keseluruhan JSON Eka
    let senaraiWatakModul1 = []; // Rujukan kepada projekDataEkaSemasa.senaraiWatak
    let editingCharacterIdM1 = null;

    // --- Rujukan Elemen DOM Utama ---
    // Maklumat Projek
    const inputTajukProjekM1 = document.getElementById('inputTajukProjekM1');
    const inputGenreUtamaM1 = document.getElementById('inputGenreUtamaM1');
    const inputSinopsisM1 = document.getElementById('inputSinopsisM1');
    const inputCatatanBCJM1 = document.getElementById('inputCatatanBCJM1');

    // Alat & Tindakan Projek
    const inputFailJsonEkaM1 = document.getElementById('inputFailJsonEkaM1');
    const btnBukaProjekJsonEkaM1 = document.getElementById('btnBukaProjekJsonEkaM1');
    const btnMuatTurunJsonEkaM1 = document.getElementById('btnMuatTurunJsonEkaM1');
    // Butang dalam dropdown Adun AI akan dipasang listener secara berasingan

    // Papan Cerita Asas
    const bcTableM1Body = document.getElementById('bcBodyM1');
    const bcTableM1HeaderRow = document.querySelector("#bcTableM1 thead tr");

    // Editor Karangan Lanjutan
    const btnToggleEditorKaranganM1 = document.getElementById('btnToggleEditorKaranganM1');
    const richEditorContainerM1 = document.getElementById('richEditorContainerM1');
    const richEditorM1 = document.getElementById('richEditorM1');

    // Borang Watak
    const borangWatakM1 = document.getElementById('borangWatakM1');
    const headerBorangWatakM1 = document.getElementById('headerBorangWatakM1');
    const idUnikWatakInputM1 = document.getElementById('idUnikWatakM1');
    const namaWatakInputM1 = document.getElementById('namaWatakM1');
    const perananInputM1 = document.getElementById('perananM1');
    const deskripsiImejRujukanInputM1 = document.getElementById('deskripsiImejRujukanM1');
    const personalitiKunciInputM1 = document.getElementById('personalitiKunciM1');
    const motivasiUtamaInputM1 = document.getElementById('motivasiUtamaM1');
    // Tambah rujukan untuk medan borang watak yang lain (latar belakang, kelebihan, kelemahan - jika ada dalam HTML)
    const jantinaUmurVisualInputM1 = document.getElementById('jantinaUmurVisualM1');
    const bentukBadanInputM1 = document.getElementById('bentukBadanM1');
    const warnaRambutGayaInputM1 = document.getElementById('warnaRambutGayaM1');
    const warnaMataInputM1 = document.getElementById('warnaMataM1');
    const warnaKulitInputM1 = document.getElementById('warnaKulitM1');
    const pakaianLazimInputM1 = document.getElementById('pakaianLazimM1');
    const aksesoriKhasInputM1 = document.getElementById('aksesoriKhasM1');
    // Tambah rujukan untuk medan penampilan visual lain jika ada

    const btnBatalEditTambahM1 = document.getElementById('btnBatalEditTambahM1');
    // btnSimpanWatakM1 akan diuruskan oleh event submit borangWatakM1

    // Senarai Watak
    const senaraiWatakDisplayAreaM1 = document.getElementById('senaraiWatakDisplayAreaM1');

    // Butang Tindakan Utama Modul
    const btnSimpanDanTeruskanKeModul2 = document.getElementById('btnSimpanDanTeruskanKeModul2');


    // --- Fungsi Bantuan (Alert, Download, Generate ID) ---
    function showAlertM1(message, type = 'info') {
        // Implementasi fungsi alert yang konsisten
        const alertContainer = document.querySelector('main.container');
        if (!alertContainer) { console.warn("Modul 1: Alert container tidak ditemui."); return; }
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = "2090";
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
        const existingAlert = document.querySelector('.alert.fixed-top-m1-alert');
        if (existingAlert) existingAlert.remove();
        alertDiv.classList.add('fixed-top-m1-alert');
        document.body.appendChild(alertDiv); // Tambah ke body supaya sentiasa di atas
        setTimeout(() => {
            if (alertDiv && alertDiv.parentElement) {
                const bsAlert = (typeof bootstrap !== 'undefined' && bootstrap.Alert) ? bootstrap.Alert.getInstance(alertDiv) : null;
                if (bsAlert) bsAlert.close(); else if (alertDiv.parentElement) alertDiv.remove();
            }
        }, 5000);
    }

    function downloadFileM1(filename, content, type) {
        const blob = new Blob([content], { type });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    function generateUniqueId() { // ID umum untuk projek atau watak
        return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    // --- Pengurusan Projek "JSON Eka" ---
    function inisialisasiProjekEkaKosong() {
        projekDataEkaSemasa = {
            versiProjek: "1.0",
            idProjekUnik: generateUniqueId(),
            infoKomik: {
                tajukProjek: "Projek Komik Baru Tanpa Tajuk",
                genreUtama: "",
                sinopsisRingkasProjek: "",
                catatanBCJunior: ""
            },
            drafCeritaAsasBCJunior: [],
            karanganLanjutan: "",
            senaraiWatak: [],
            comicData: [],
            metadataLain: {
                tarikhDicipta: new Date().toISOString(),
                tarikhKemasKiniTerakhir: new Date().toISOString()
            }
        };
        senaraiWatakModul1 = projekDataEkaSemasa.senaraiWatak; // Set rujukan
        console.log("Modul 1: Projek Eka kosong diinisialisasi.", projekDataEkaSemasa);
    }

    function muatProjekEkaDariLocalStorage() {
        const dataString = localStorage.getItem(LOCAL_STORAGE_KEY_EKA);
        if (dataString) {
            try {
                projekDataEkaSemasa = JSON.parse(dataString);
                // Pastikan semua bahagian utama wujud
                projekDataEkaSemasa.infoKomik = projekDataEkaSemasa.infoKomik || {};
                projekDataEkaSemasa.drafCeritaAsasBCJunior = projekDataEkaSemasa.drafCeritaAsasBCJunior || [];
                projekDataEkaSemasa.karanganLanjutan = projekDataEkaSemasa.karanganLanjutan || "";
                projekDataEkaSemasa.senaraiWatak = projekDataEkaSemasa.senaraiWatak || [];
                projekDataEkaSemasa.comicData = projekDataEkaSemasa.comicData || [];
                projekDataEkaSemasa.metadataLain = projekDataEkaSemasa.metadataLain || {};
                if (!projekDataEkaSemasa.idProjekUnik) projekDataEkaSemasa.idProjekUnik = generateUniqueId();

                senaraiWatakModul1 = projekDataEkaSemasa.senaraiWatak;
                isiSemuaBorangDariProjekEka();
                showAlertM1(`Projek "${projekDataEkaSemasa.infoKomik.tajukProjek || 'Tanpa Tajuk'}" dimuatkan.`, "info");
            } catch (error) {
                console.error("Modul 1: Ralat memuat JSON Eka dari localStorage:", error);
                showAlertM1("Gagal memuat data projek. Memulakan projek baru.", "danger");
                inisialisasiProjekEkaKosong();
                isiSemuaBorangDariProjekEka(); // Isi borang dengan data kosong
            }
        } else {
            inisialisasiProjekEkaKosong();
            isiSemuaBorangDariProjekEka(); // Isi borang dengan data kosong
        }
    }

    function simpanProjekEkaKeLocalStorage() {
        if (!projekDataEkaSemasa || !projekDataEkaSemasa.idProjekUnik) {
            console.warn("Modul 1: Tiada data projek aktif untuk disimpan.");
            // inisialisasiProjekEkaKosong(); // Mungkin tidak perlu inisialisasi jika hanya simpan
            // return;
        }
        // Kumpul data terkini dari semua input sebelum simpan
        kumpulDataKeProjekEka(); 
        
        projekDataEkaSemasa.metadataLain.tarikhKemasKiniTerakhir = new Date().toISOString();
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_EKA, JSON.stringify(projekDataEkaSemasa));
            showAlertM1("Projek berjaya disimpan ke memori pelayar!", "success");
        } catch (error) {
            console.error("Modul 1: Ralat menyimpan JSON Eka ke localStorage:", error);
            showAlertM1("Gagal menyimpan projek.", "danger");
        }
    }
    
    function isiSemuaBorangDariProjekEka() {
        // Isi Maklumat Asas Projek
        if (inputTajukProjekM1) inputTajukProjekM1.value = projekDataEkaSemasa.infoKomik?.tajukProjek || "";
        if (inputGenreUtamaM1) inputGenreUtamaM1.value = projekDataEkaSemasa.infoKomik?.genreUtama || "";
        if (inputSinopsisM1) inputSinopsisM1.value = projekDataEkaSemasa.infoKomik?.sinopsisRingkasProjek || "";
        if (inputCatatanBCJM1) inputCatatanBCJM1.value = projekDataEkaSemasa.infoKomik?.catatanBCJunior || "";

        // Isi Papan Cerita Asas
        if (Array.isArray(projekDataEkaSemasa.drafCeritaAsasBCJunior)) {
            loadDataToTableM1(projekDataEkaSemasa.drafCeritaAsasBCJunior);
        }

        // Isi Editor Karangan Lanjutan
        if (richEditorM1) richEditorM1.innerHTML = projekDataEkaSemasa.karanganLanjutan || "";
        
        // Isi Senarai Watak
        renderSenaraiWatakM1();
        kosongkanBorangWatakM1(); // Pastikan borang watak bersih selepas muat projek
    }

    function kumpulDataKeProjekEka() {
        if (!projekDataEkaSemasa) inisialisasiProjekEkaKosong(); // Pastikan objek utama wujud

        projekDataEkaSemasa.infoKomik = {
            tajukProjek: inputTajukProjekM1?.value.trim() || projekDataEkaSemasa.infoKomik?.tajukProjek || "Projek Tanpa Tajuk",
            genreUtama: inputGenreUtamaM1?.value.trim() || projekDataEkaSemasa.infoKomik?.genreUtama || "",
            sinopsisRingkasProjek: inputSinopsisM1?.value.trim() || projekDataEkaSemasa.infoKomik?.sinopsisRingkasProjek || "",
            catatanBCJunior: inputCatatanBCJM1?.value.trim() || projekDataEkaSemasa.infoKomik?.catatanBCJunior || ""
        };
        projekDataEkaSemasa.drafCeritaAsasBCJunior = getTableDataM1();
        projekDataEkaSemasa.karanganLanjutan = richEditorM1?.innerHTML || "";
        projekDataEkaSemasa.senaraiWatak = senaraiWatakModul1; // senaraiWatakModul1 sepatutnya sudah terkini
        // comicData tidak diuruskan di modul ini, jadi kekalkan apa yang ada
        projekDataEkaSemasa.comicData = projekDataEkaSemasa.comicData || []; 
    }

    function handleMuatNaikJsonEkaM1(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dataDimuat = JSON.parse(e.target.result);
                    // Pengesahan struktur asas JSON Eka
                    if (dataDimuat && dataDimuat.infoKomik && dataDimuat.drafCeritaAsasBCJunior &&
                        dataDimuat.senaraiWatak && dataDimuat.comicData && dataDimuat.idProjekUnik) {
                        
                        if (projekDataEkaSemasa.idProjekUnik && !confirm("Ini akan menggantikan semua data projek semasa. Teruskan?")) {
                            if(inputFailJsonEkaM1) inputFailJsonEkaM1.value = "";
                            return;
                        }
                        projekDataEkaSemasa = dataDimuat;
                        senaraiWatakModul1 = projekDataEkaSemasa.senaraiWatak; // Kemaskini rujukan
                        isiSemuaBorangDariProjekEka(); // Isi semua borang dengan data baru
                        showAlertM1("Projek JSON Eka berjaya dimuat naik!", "success");
                    } else {
                        throw new Error("Struktur fail JSON Eka tidak sah atau tidak lengkap.");
                    }
                } catch (error) {
                    showAlertM1(`Ralat memproses fail JSON Eka: ${error.message}`, "danger");
                }
            };
            reader.onerror = () => showAlertM1("Gagal membaca fail.", "danger");
            reader.readAsText(file);
        } else {
            showAlertM1("Sila muat naik fail .json sahaja.", "warning");
        }
        if (inputFailJsonEkaM1) inputFailJsonEkaM1.value = null; 
    }

    function handleMuatTurunJsonEkaM1() {
        kumpulDataKeProjekEka(); // Pastikan data terkini dikumpul
        if (!projekDataEkaSemasa || !projekDataEkaSemasa.idProjekUnik) {
            showAlertM1("Tiada data projek aktif untuk dimuat turun.", "warning");
            return;
        }
        const tajukFail = (projekDataEkaSemasa.infoKomik.tajukProjek || "ProjekTanpaTajuk").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        downloadFileM1(`BCPS_ProjekPenuh_${tajukFail}_M1.json`, JSON.stringify(projekDataEkaSemasa, null, 2), "application/json");
    }


    // --- Logik Papan Cerita Asas (Adaptasi dari script_jc.js) ---
    function populateTableHeaderM1() {
        if (!bcTableM1HeaderRow) { console.error("Modul 1: Elemen thead tr #bcTableM1 tidak ditemui."); return; }
        bcTableM1HeaderRow.innerHTML = ""; 
        const thPlot = document.createElement("th");
        thPlot.textContent = "🧠 Plot Cerita"; 
        bcTableM1HeaderRow.appendChild(thPlot);
        colsConfigM1.forEach(col => {
            const th = document.createElement("th");
            th.textContent = col.label;
            bcTableM1HeaderRow.appendChild(th);
        });
    }

    function populateTableM1() {
        if (!bcTableM1Body) { console.error("Modul 1: Elemen tbody #bcBodyM1 tidak ditemui."); return; }
        bcTableM1Body.innerHTML = ""; 
        rowsConfigM1.forEach((rowConf) => { 
            const tr = document.createElement("tr");
            const th = document.createElement("th"); 
            th.textContent = rowConf.label;
            tr.appendChild(th);
            colsConfigM1.forEach((colConf) => { 
                const td = document.createElement("td");
                const textarea = document.createElement("textarea");
                textarea.classList.add('form-control', 'pop-art-textarea-table'); 
                textarea.setAttribute('aria-label', `${rowConf.label} - ${colConf.label}`);
                textarea.rows = 3; 
                td.appendChild(textarea);
                tr.appendChild(td);
            });
            bcTableM1Body.appendChild(tr);
        });
    }

    function getTableDataM1() {
        const data = [];
        if (!bcTableM1Body || !bcTableM1Body.rows || bcTableM1Body.rows.length === 0) return data; 
        [...bcTableM1Body.rows].forEach((tr, rowIndex) => {
            const rowLabel = rowsConfigM1[rowIndex] ? rowsConfigM1[rowIndex].label : `Baris ${rowIndex + 1}`;
            const inputs = [...tr.querySelectorAll("td textarea")].map(input => input.value.trim());
            const rowDataObject = { plot_label: rowLabel };
            colsConfigM1.forEach((col, colIndex) => {
                rowDataObject[col.key] = inputs[colIndex] || "";
            });
            data.push(rowDataObject);
        });
        return data;
    }

    function loadDataToTableM1(dataToLoad) {
        if (!bcTableM1Body || !bcTableM1Body.rows) { return; }
        [...bcTableM1Body.rows].forEach(tr => {
            [...tr.querySelectorAll("td textarea")].forEach(textarea => textarea.value = "");
        });
        if (Array.isArray(dataToLoad)) {
            dataToLoad.forEach((dataRow, rowIndex) => {
                if (rowIndex < bcTableM1Body.rows.length && dataRow && typeof dataRow === 'object') {
                    const tr = bcTableM1Body.rows[rowIndex];
                    const textareas = tr.querySelectorAll("td textarea");
                    colsConfigM1.forEach((colConf, colIndex) => {
                        if (textareas[colIndex] && typeof dataRow[colConf.key] !== 'undefined') {
                            textareas[colIndex].value = dataRow[colConf.key] || "";
                        }
                    });
                }
            });
        }
    }
    
    // --- Logik Editor Karangan Lanjutan ---
    function toggleEditorKaranganM1() {
        if (richEditorContainerM1) {
            const isVisible = richEditorContainerM1.style.display === "block";
            richEditorContainerM1.style.display = isVisible ? "none" : "block";
            if (!isVisible && richEditorContainerM1.scrollIntoView) richEditorContainerM1.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // --- Logik Pembangunan Watak (Adaptasi dari script_bina_watak.js) ---
    function kosongkanBorangWatakM1() {
        if (borangWatakM1) borangWatakM1.reset();
        if (idUnikWatakInputM1) idUnikWatakInputM1.value = '';
        editingCharacterIdM1 = null;
        if (headerBorangWatakM1) headerBorangWatakM1.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Tambah Watak Baru';
        if (namaWatakInputM1) namaWatakInputM1.focus();
    }

    function isiBorangDenganDataWatakM1(watak) {
        kosongkanBorangWatakM1(); 
        editingCharacterIdM1 = watak.idUnikWatak;
        if (idUnikWatakInputM1) idUnikWatakInputM1.value = watak.idUnikWatak;
        if (namaWatakInputM1) namaWatakInputM1.value = watak.namaWatak || "";
        if (perananInputM1) perananInputM1.value = watak.peranan || "";
        if (deskripsiImejRujukanInputM1) deskripsiImejRujukanInputM1.value = watak.deskripsiImejRujukan || "";
        if (personalitiKunciInputM1) personalitiKunciInputM1.value = watak.personalitiKunci || "";
        if (motivasiUtamaInputM1) motivasiUtamaInputM1.value = watak.motivasiUtama || "";
        
        if (watak.penampilanVisual) {
            if (jantinaUmurVisualInputM1) jantinaUmurVisualInputM1.value = watak.penampilanVisual.jantinaUmurVisual || "";
            if (bentukBadanInputM1) bentukBadanInputM1.value = watak.penampilanVisual.bentukBadan || "";
            if (warnaRambutGayaInputM1) warnaRambutGayaInputM1.value = watak.penampilanVisual.warnaRambutGaya || "";
            if (warnaMataInputM1) warnaMataInputM1.value = watak.penampilanVisual.warnaMata || "";
            if (warnaKulitInputM1) warnaKulitInputM1.value = watak.penampilanVisual.warnaKulit || "";
            if (pakaianLazimInputM1) pakaianLazimInputM1.value = watak.penampilanVisual.pakaianLazim || "";
            if (aksesoriKhasInputM1) aksesoriKhasInputM1.value = watak.penampilanVisual.aksesoriKhas || "";
        } else { 
            if (jantinaUmurVisualInputM1) jantinaUmurVisualInputM1.value = ""; 
            // ... kosongkan medan penampilan lain
        }
        if (headerBorangWatakM1) headerBorangWatakM1.innerHTML = `<i class="bi bi-pencil-fill me-2"></i>Edit Watak: ${watak.namaWatak}`;
        const borangCard = document.getElementById('borangWatakModul1Card');
        if (borangCard && borangCard.scrollIntoView) borangCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function handleSimpanWatakM1(event) {
        event.preventDefault(); 
        if (!projekDataEkaSemasa || !Array.isArray(projekDataEkaSemasa.senaraiWatak)) {
            showAlertM1("Struktur data projek tidak diinisialisasi dengan betul.", "danger");
            return; 
        }
        const watakData = {
            idUnikWatak: editingCharacterIdM1 || generateUniqueId(),
            namaWatak: namaWatakInputM1.value.trim(),
            peranan: perananInputM1.value,
            deskripsiImejRujukan: deskripsiImejRujukanInputM1.value.trim(),
            personalitiKunci: personalitiKunciInputM1.value.trim(),
            motivasiUtama: motivasiUtamaInputM1.value.trim(),
            // Tambah pengambilan data untuk medan watak lain yang ada dalam HTML
            penampilanVisual: {
                jantinaUmurVisual: jantinaUmurVisualInputM1.value.trim(),
                bentukBadan: bentukBadanInputM1.value.trim(),
                warnaRambutGaya: warnaRambutGayaInputM1.value.trim(),
                warnaMata: warnaMataInputM1.value.trim(),
                warnaKulit: warnaKulitInputM1.value.trim(),
                pakaianLazim: pakaianLazimInputM1.value.trim(),
                aksesoriKhas: aksesoriKhasInputM1.value.trim(),
                // Tambah pengambilan data untuk medan penampilan lain
            }
        };
        if (!watakData.namaWatak) {
            showAlertM1("Nama Watak adalah mandatori!", "warning");
            if (namaWatakInputM1) namaWatakInputM1.focus();
            return;
        }
        if (editingCharacterIdM1) {
            const index = senaraiWatakModul1.findIndex(w => w.idUnikWatak === editingCharacterIdM1);
            if (index !== -1) senaraiWatakModul1[index] = watakData; 
        } else {
            senaraiWatakModul1.push(watakData); 
        }
        projekDataEkaSemasa.senaraiWatak = senaraiWatakModul1; // Pastikan objek utama dikemaskini
        editingCharacterIdM1 = null; 
        kosongkanBorangWatakM1(); 
        renderSenaraiWatakM1();
        showAlertM1(`Watak "${watakData.namaWatak}" ${editingCharacterIdM1 ? 'dikemaskini' : 'ditambah'}. Simpan projek untuk kekalkan.`, "success");
    }

    function renderSenaraiWatakM1() {
        if (!senaraiWatakDisplayAreaM1) return;
        senaraiWatakDisplayAreaM1.innerHTML = ''; 
        if (!senaraiWatakModul1 || senaraiWatakModul1.length === 0) {
            senaraiWatakDisplayAreaM1.innerHTML = '<p class="text-muted pop-art-text">Tiada watak dicipta untuk projek ini.</p>';
            return;
        }
        const ul = document.createElement('ul');
        ul.className = 'list-group';
        senaraiWatakModul1.forEach(watak => {
            if (!watak || typeof watak.namaWatak === 'undefined') return; 
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center pop-art-list-item';
            const watakInfo = document.createElement('span');
            watakInfo.textContent = `${watak.namaWatak} (${watak.peranan || 'Tiada Peranan'})`;
            const butangAksi = document.createElement('div');
            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn btn-sm btn-outline-primary me-2';
            btnEdit.innerHTML = '<i class="bi bi-pencil-square"></i> Edit';
            btnEdit.addEventListener('click', () => isiBorangDenganDataWatakM1(watak));
            const btnPadam = document.createElement('button');
            btnPadam.className = 'btn btn-sm btn-outline-danger';
            btnPadam.innerHTML = '<i class="bi bi-trash"></i> Padam';
            btnPadam.addEventListener('click', () => handlePadamWatakM1(watak.idUnikWatak, watak.namaWatak));
            butangAksi.appendChild(btnEdit);
            butangAksi.appendChild(btnPadam);
            li.appendChild(watakInfo);
            li.appendChild(butangAksi);
            ul.appendChild(li);
        });
        senaraiWatakDisplayAreaM1.appendChild(ul);
    }

    function handlePadamWatakM1(idWatak, namaWatak) {
        if (confirm(`Anda pasti mahu memadam watak "${namaWatak}"?`)) {
            projekDataEkaSemasa.senaraiWatak = projekDataEkaSemasa.senaraiWatak.filter(w => w.idUnikWatak !== idWatak);
            senaraiWatakModul1 = projekDataEkaSemasa.senaraiWatak; 
            if (editingCharacterIdM1 === idWatak) kosongkanBorangWatakM1();
            renderSenaraiWatakM1();
            showAlertM1(`Watak "${namaWatak}" dipadam. Simpan projek untuk kekalkan.`, "info");
        }
    }

    // --- Logik "Adun & Salin Prompt AI (Jadual)" (Adaptasi dari script_jc.js) ---
    function adunDanSalinPromptAIM1(platformAI) {
        const tableData = getTableDataM1();
        if (tableData.length === 0 || tableData.every(row => colsConfigM1.every(col => !(row[col.key] && row[col.key].trim())))) {
            showAlertM1("Tiada data di papan cerita untuk diadun.", "warning"); return;
        }
        let promptTeks = "Arahan untuk AI: Berdasarkan elemen cerita ini, hasilkan karangan naratif pendek (~260 perkataan) yang koheren.\n\n";
        const tajukProjekVal = inputTajukProjekM1 ? inputTajukProjekM1.value.trim() : "";
        const tajukCadangan = tajukProjekVal !== "" ? tajukProjekVal : "Sebuah Kisah Epik";
        promptTeks += `JUDUL CADANGAN: '${tajukCadangan}'\n\n`;
        tableData.forEach(row => {
            promptTeks += `## TAHAP PLOT: ${row.plot_label}\n`;
            colsConfigM1.forEach(col => {
                const nilai = row[col.key] || "";
                if (nilai.trim() !== "") promptTeks += `  * ${col.label}: ${nilai}\n`;
            });
            promptTeks += "\n";
        });
        promptTeks += "Pastikan output adalah satu blok karangan naratif yang mengalir.\n";
        navigator.clipboard.writeText(promptTeks).then(() => {
            let urlAI = "", namaAI = "";
            switch (platformAI) {
                case 'gemini': urlAI = "https://gemini.google.com/app"; namaAI = "Google Gemini"; break;
                case 'chatgpt': urlAI = "https://chat.openai.com/"; namaAI = "ChatGPT"; break;
                case 'claude': urlAI = "https://claude.ai/"; namaAI = "Claude"; break;
                case 'umum': showAlertM1("✅ Prompt disalin! Sila tampal di platform AI pilihan anda.", "success"); return;
                default: showAlertM1("Platform AI tidak dikenali.", "warning"); return;
            }
            if (urlAI) window.open(urlAI, "_blank");
            showAlertM1(`✅ Prompt disalin! Sila tampal di ${namaAI} ${urlAI ? 'yang telah dibuka.' : '.'}`, "success");
        }).catch(err => {
            showAlertM1("Gagal menyalin prompt. Sila salin manual dari konsol (F12).", "warning");
            console.error('Modul 1: Gagal menyalin prompt: ', err); console.log("--- PROMPT UNTUK DISALIN MANUAL ---\n", promptTeks);
        });
    }
    
    // --- Logik Butang Utama Modul: Simpan & Teruskan ---
    function handleSimpanDanTeruskanKeModul2() {
        kumpulDataKeProjekEka(); // Pastikan semua data terkini dari borang dikumpul ke projekDataEkaSemasa
        simpanProjekEkaKeLocalStorage(); // Simpan versi terkini ke localStorage
        showAlertM1("Projek disimpan! Meneruskan ke Modul Susun Panel...", "info");
        setTimeout(() => {
            // Anda perlu cipta halaman Modul 2 ini, contohnya: ../modul2_susun_panel/modul2_susun_panel.html
            window.location.href = '../modul2_susun_panel/modul2_susun_panel.html'; 
        }, 1500);
    }

    // --- Inisialisasi Modul 1 & Pemasangan Event Listener ---
    function initModul1() {
        // Inisialisasi rujukan DOM info projek di sini selepas DOM sedia
        // inputTajukProjekM1 = document.getElementById('inputTajukProjekM1'); // Sudah di atas
        // inputGenreUtamaM1 = document.getElementById('inputGenreUtamaM1'); // Sudah di atas
        // inputSinopsisM1 = document.getElementById('inputSinopsisM1');     // Sudah di atas

        populateTableHeaderM1();
        populateTableM1();
        muatProjekEkaDariLocalStorage(); // Muat data projek sedia ada atau inisialisasi baru

        if (btnBukaProjekJsonEkaM1 && inputFailJsonEkaM1) {
            btnBukaProjekJsonEkaM1.addEventListener('click', () => inputFailJsonEkaM1.click());
            inputFailJsonEkaM1.addEventListener('change', handleMuatNaikJsonEkaM1);
        }
        if (btnMuatTurunJsonEkaM1) btnMuatTurunJsonEkaM1.addEventListener('click', handleMuatTurunJsonEkaM1);
        
        // Listener untuk dropdown Adun AI
        const btnAdunGemini = document.getElementById('btnAdunGeminiM1');
        if (btnAdunGemini) btnAdunGemini.addEventListener('click', () => adunDanSalinPromptAIM1('gemini'));
        const btnAdunChatGPT = document.getElementById('btnAdunChatGPTM1');
        if (btnAdunChatGPT) btnAdunChatGPT.addEventListener('click', () => adunDanSalinPromptAIM1('chatgpt'));
        const btnAdunClaude = document.getElementById('btnAdunClaudeM1');
        if (btnAdunClaude) btnAdunClaude.addEventListener('click', () => adunDanSalinPromptAIM1('claude'));
        const btnAdunUmum = document.getElementById('btnAdunUmumM1');
        if (btnAdunUmum) btnAdunUmum.addEventListener('click', () => adunDanSalinPromptAIM1('umum'));

        if (btnToggleEditorKaranganM1) btnToggleEditorKaranganM1.addEventListener('click', toggleEditorKaranganM1);
        
        if (borangWatakM1) borangWatakM1.addEventListener('submit', handleSimpanWatakM1);
        if (btnBatalEditTambahM1) btnBatalEditTambahM1.addEventListener('click', kosongkanBorangWatakM1);
        // Anda mungkin perlukan butang "Tambah Watak Baru" yang berasingan jika mahu,
        // atau pengguna boleh terus isi borang dan "Simpan Watak" akan menambah baru jika tiada mod edit.

        if (btnSimpanDanTeruskanKeModul2) btnSimpanDanTeruskanKeModul2.addEventListener('click', handleSimpanDanTeruskanKeModul2);
    }

    initModul1(); // Mulakan Modul 1
});
