// bina_watak/script_bina_watak.js
// Dikemaskini: 16 Mei 2025 - Debugging Lanjutan v3 untuk Paparan Selepas Muat Naik JSON Eka

document.addEventListener('DOMContentLoaded', () => {
    console.log("BW-DEBUG-V3: DOMContentLoaded - Skrip Bina Watak dimulakan.");

    // --- Rujukan Elemen DOM ---
    const borangWatak = document.getElementById('borangWatak');
    const headerBorangWatak = document.getElementById('headerBorangWatak');
    const senaraiWatakDisplayArea = document.getElementById('senaraiWatakDisplayArea');
    const tajukProjekAktifDisplay = document.getElementById('tajukProjekAktifDisplay'); 
    
    const idUnikWatakInput = document.getElementById('idUnikWatak');
    const namaWatakInput = document.getElementById('namaWatak');
    const perananInput = document.getElementById('peranan');
    // ... (Rujukan elemen DOM lain dikekalkan seperti sebelum ini) ...
    const deskripsiImejRujukanInput = document.getElementById('deskripsiImejRujukan');
    const personalitiKunciInput = document.getElementById('personalitiKunci');
    const motivasiUtamaInput = document.getElementById('motivasiUtama');
    const latarBelakangRingkasInput = document.getElementById('latarBelakangRingkas');
    const kelebihanInput = document.getElementById('kelebihan');
    const kelemahanInput = document.getElementById('kelemahan');
    const sloganInput = document.getElementById('slogan');
    const catatanTambahanInput = document.getElementById('catatanTambahan');

    const jantinaUmurVisualInput = document.getElementById('jantinaUmurVisual');
    const bentukBadanInput = document.getElementById('bentukBadan');
    const warnaRambutGayaInput = document.getElementById('warnaRambutGaya');
    const warnaMataInput = document.getElementById('warnaMata');
    const warnaKulitInput = document.getElementById('warnaKulit');
    const pakaianLazimInput = document.getElementById('pakaianLazim');
    const aksesoriKhasInput = document.getElementById('aksesoriKhas');
    const ekspresiWajahTipikalInput = document.getElementById('ekspresiWajahTipikal');
    const ciriUnikVisualInput = document.getElementById('ciriUnikVisual');

    const btnBatalEditTambah = document.getElementById('btnBatalEditTambah');
    const btnTambahWatakBaruDariPanel = document.getElementById('btnTambahWatakBaruDariPanel');
    const btnSimpanSemuaKeLocalStorage = document.getElementById('btnSimpanSemuaKeLocalStorage');
    const inputMuatNaikJsonProjek = document.getElementById('inputMuatNaikJsonProjek'); 
    const btnMuatNaikJsonProjekTrigger = document.getElementById('btnMuatNaikJsonProjekTrigger'); 
    const btnMuatTurunJsonProjek = document.getElementById('btnMuatTurunJsonProjek'); 
    const btnKosongkanSemuaWatak = document.getElementById('btnKosongkanSemuaWatak');


    // --- Pemboleh Ubah Global ---
    let projekDataLengkap = {}; 
    let senaraiWatak = []; 
    let editingCharacterId = null; 
    const LOCAL_STORAGE_KEY_EKA = 'projekBCPS_DataLengkap';

    // --- Fungsi Bantuan ---
    function generateUniqueIdWatak() {
        return `watak_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    function showAlertBinaWatak(message, type = 'info') {
        console.log(`BW-DEBUG-V3: showAlertBinaWatak - Type: ${type}, Message: ${message}`);
        const alertContainer = document.querySelector('main.container'); 
        if (!alertContainer) {
            console.warn("BW-DEBUG-V3: Alert container (main.container) tidak ditemui.");
            return;
        }
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertDiv.style.zIndex = "2070"; 
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
        
        const existingAlert = alertContainer.querySelector('.alert.fixed-top-bw-alert');
        if (existingAlert) existingAlert.remove();
        alertDiv.classList.add('fixed-top-bw-alert'); 

        if (alertContainer.firstChild) {
            alertContainer.insertBefore(alertDiv, alertContainer.firstChild);
        } else {
            alertContainer.appendChild(alertDiv);
        }
        setTimeout(() => {
            if (alertDiv && alertDiv.parentElement) {
                 const bsAlert = (typeof bootstrap !== 'undefined' && bootstrap.Alert) ? bootstrap.Alert.getInstance(alertDiv) : null;
                 if (bsAlert) bsAlert.close(); else if (alertDiv.parentElement) alertDiv.remove();
            }
        }, 5000);
    }
    
    function downloadFile(filename, content, mimeType = 'application/json') {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // --- Pengurusan localStorage (JSON Eka) ---
    function muatProjekDataDariLocalStorage() {
        console.log("BW-DEBUG-V3: muatProjekDataDariLocalStorage() bermula.");
        const dataString = localStorage.getItem(LOCAL_STORAGE_KEY_EKA);
        console.log("BW-DEBUG-V3: Data dari localStorage (kunci: projekBCPS_DataLengkap):", dataString ? "(Data Ada)" : "(Data Tiada)");

        if (dataString) {
            try {
                projekDataLengkap = JSON.parse(dataString);
                console.log("BW-DEBUG-V3: Data localStorage berjaya diparsing:", JSON.stringify(projekDataLengkap, null, 2));

                projekDataLengkap.infoKomik = projekDataLengkap.infoKomik || { tajukProjek: "Projek Tanpa Tajuk (Default)", genreUtama: "Tidak Dinyatakan" };
                projekDataLengkap.drafCeritaAsasBCJunior = projekDataLengkap.drafCeritaAsasBCJunior || [];
                projekDataLengkap.senaraiWatak = projekDataLengkap.senaraiWatak || [];
                projekDataLengkap.comicData = projekDataLengkap.comicData || [];
                projekDataLengkap.karanganLanjutan = projekDataLengkap.karanganLanjutan || "";
                projekDataLengkap.metadataLain = projekDataLengkap.metadataLain || { tarikhDicipta: new Date().toISOString(), tarikhKemasKiniTerakhir: new Date().toISOString()};
                if (!projekDataLengkap.idProjekUnik) { 
                    projekDataLengkap.idProjekUnik = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                }
            } catch (error) {
                console.error("BW-DEBUG-V3: Ralat memuatkan atau memproses JSON Eka dari localStorage:", error);
                showAlertBinaWatak("Gagal memuatkan data projek. Memulakan struktur kosong.", "danger");
                inisialisasiProjekDataKosong();
            }
        } else {
            console.log("BW-DEBUG-V3: Tiada data projekBCPS_DataLengkap di localStorage. Memanggil inisialisasiProjekDataKosong().");
            inisialisasiProjekDataKosong();
        }
        
        senaraiWatak = projekDataLengkap.senaraiWatak; 
        console.log("BW-DEBUG-V3: senaraiWatak global selepas muat/inisialisasi:", JSON.stringify(senaraiWatak, null, 2));
        renderSenaraiWatak(); 

        if (tajukProjekAktifDisplay) {
            tajukProjekAktifDisplay.innerHTML = `Projek Aktif: <strong>${projekDataLengkap.infoKomik.tajukProjek || "Belum Bertajuk"}</strong>`;
        }
        console.log("BW-DEBUG-V3: muatProjekDataDariLocalStorage() selesai.");
    }

    function inisialisasiProjekDataKosong() {
        console.log("BW-DEBUG-V3: inisialisasiProjekDataKosong() dipanggil.");
        projekDataLengkap = { 
            versiProjek: "1.0",
            idProjekUnik: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            infoKomik: { tajukProjek: "Projek Komik Baru (Bina Watak)", genreUtama: "Tidak Dinyatakan", sinopsisRingkasProjek: "", catatanBCJunior: "" }, 
            drafCeritaAsasBCJunior: [],
            senaraiWatak: [], 
            comicData: [], 
            karanganLanjutan: "",
            metadataLain: { tarikhDicipta: new Date().toISOString(), tarikhKemasKiniTerakhir: new Date().toISOString() }
        };
        console.log("BW-DEBUG-V3: projekDataLengkap diinisialisasi kosong:", JSON.stringify(projekDataLengkap, null, 2));
    }

    function simpanProjekDataKeLocalStorage() {
        // ... (kod simpanProjekDataKeLocalStorage dikekalkan) ...
        console.log("BW-DEBUG-V3: simpanProjekDataKeLocalStorage() dipanggil.");
        if (!projekDataLengkap || !projekDataLengkap.idProjekUnik) {
            if (!projekDataLengkap || Object.keys(projekDataLengkap).length === 0) {
                inisialisasiProjekDataKosong();
            } else if (!projekDataLengkap.idProjekUnik) {
                 projekDataLengkap.idProjekUnik = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            }
        }
        projekDataLengkap.senaraiWatak = senaraiWatak; 
        projekDataLengkap.metadataLain.tarikhKemasKiniTerakhir = new Date().toISOString(); 
        if (!projekDataLengkap.metadataLain.tarikhDicipta) {
            projekDataLengkap.metadataLain.tarikhDicipta = new Date().toISOString();
        }
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_EKA, JSON.stringify(projekDataLengkap));
            showAlertBinaWatak("Projek Penuh (JSON Eka) disimpan ke memori pelayar!", "success");
        } catch (error) {
             console.error("BW-DEBUG-V3: Ralat menyimpan JSON Eka ke localStorage:", error);
             showAlertBinaWatak("Gagal menyimpan data projek.", "danger");
        }
    }

    // --- Pengurusan Borang ---
    function kosongkanBorang() {
        // ... (kod kosongkanBorang dikekalkan) ...
        if (borangWatak) borangWatak.reset();
        if (idUnikWatakInput) idUnikWatakInput.value = '';
        editingCharacterId = null;
        if (headerBorangWatak) headerBorangWatak.innerHTML = '<i class="bi bi-pencil-fill me-2"></i>Tambah Watak Baru';
    }

    function isiBorangDenganDataWatak(watak) {
        // ... (kod isiBorangDenganDataWatak dikekalkan) ...
        kosongkanBorang(); 
        editingCharacterId = watak.idUnikWatak;
        idUnikWatakInput.value = watak.idUnikWatak;
        namaWatakInput.value = watak.namaWatak || "";
        perananInput.value = watak.peranan || "";
        deskripsiImejRujukanInput.value = watak.deskripsiImejRujukan || "";
        personalitiKunciInput.value = watak.personalitiKunci || "";
        motivasiUtamaInput.value = watak.motivasiUtama || "";
        latarBelakangRingkasInput.value = watak.latarBelakangRingkas || "";
        kelebihanInput.value = watak.kelebihan || "";
        kelemahanInput.value = watak.kelemahan || "";
        if (watak.penampilanVisual) {
            jantinaUmurVisualInput.value = watak.penampilanVisual.jantinaUmurVisual || "";
            bentukBadanInput.value = watak.penampilanVisual.bentukBadan || "";
            warnaRambutGayaInput.value = watak.penampilanVisual.warnaRambutGaya || "";
            warnaMataInput.value = watak.penampilanVisual.warnaMata || "";
            warnaKulitInput.value = watak.penampilanVisual.warnaKulit || "";
            pakaianLazimInput.value = watak.penampilanVisual.pakaianLazim || "";
            aksesoriKhasInput.value = watak.penampilanVisual.aksesoriKhas || "";
            ekspresiWajahTipikalInput.value = watak.penampilanVisual.ekspresiWajahTipikal || "";
            ciriUnikVisualInput.value = watak.penampilanVisual.ciriUnikVisual || "";
        } else { 
            jantinaUmurVisualInput.value = ""; bentukBadanInput.value = ""; warnaRambutGayaInput.value = "";
            warnaMataInput.value = ""; warnaKulitInput.value = ""; pakaianLazimInput.value = "";
            aksesoriKhasInput.value = ""; ekspresiWajahTipikalInput.value = ""; ciriUnikVisualInput.value = "";
        }
        sloganInput.value = watak.slogan || "";
        catatanTambahanInput.value = watak.catatanTambahan || "";
        if (headerBorangWatak) headerBorangWatak.innerHTML = `<i class="bi bi-pencil-fill me-2"></i>Edit Watak: ${watak.namaWatak}`;
        if (borangWatakContainer) borangWatakContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- CRUD Watak & Paparan ---
    function handleSimpanWatak(event) {
        // ... (kod handleSimpanWatak dikekalkan) ...
        event.preventDefault(); 
        if (!projekDataLengkap || !Array.isArray(projekDataLengkap.senaraiWatak)) {
            showAlertBinaWatak("Struktur data projek tidak diinisialisasi dengan betul. Sila muat semula.", "danger");
            console.error("BW-DEBUG-V3: projekDataLengkap.senaraiWatak bukan array atau projekDataLengkap tiada semasa simpan watak.");
            return; 
        }
        const watakData = {
            idUnikWatak: editingCharacterId || generateUniqueIdWatak(),
            namaWatak: namaWatakInput.value.trim(),
            peranan: perananInput.value,
            deskripsiImejRujukan: deskripsiImejRujukanInput.value.trim(),
            personalitiKunci: personalitiKunciInput.value.trim(),
            motivasiUtama: motivasiUtamaInput.value.trim(),
            latarBelakangRingkas: latarBelakangRingkasInput.value.trim(),
            kelebihan: kelebihanInput.value.trim(),
            kelemahan: kelemahanInput.value.trim(),
            penampilanVisual: {
                jantinaUmurVisual: jantinaUmurVisualInput.value.trim(),
                bentukBadan: bentukBadanInput.value.trim(),
                warnaRambutGaya: warnaRambutGayaInput.value.trim(),
                warnaMata: warnaMataInput.value.trim(),
                warnaKulit: warnaKulitInput.value.trim(),
                pakaianLazim: pakaianLazimInput.value.trim(),
                aksesoriKhas: aksesoriKhasInput.value.trim(),
                ekspresiWajahTipikal: ekspresiWajahTipikalInput.value.trim(),
                ciriUnikVisual: ciriUnikVisualInput.value.trim()
            },
            slogan: sloganInput.value.trim(),
            catatanTambahan: catatanTambahanInput.value.trim()
        };
        if (!watakData.namaWatak) {
            showAlertBinaWatak("Nama Watak adalah mandatori!", "warning");
            if (namaWatakInput) namaWatakInput.focus();
            return;
        }
        if (editingCharacterId) {
            const index = senaraiWatak.findIndex(w => w.idUnikWatak === editingCharacterId);
            if (index !== -1) {
                senaraiWatak[index] = watakData; 
                showAlertBinaWatak(`Watak "${watakData.namaWatak}" dikemaskini. Tekan 'Simpan Projek Penuh'.`, "success");
            }
        } else {
            senaraiWatak.push(watakData); 
            showAlertBinaWatak(`Watak "${watakData.namaWatak}" ditambah. Tekan 'Simpan Projek Penuh'.`, "success");
        }
        editingCharacterId = null; 
        kosongkanBorang(); 
        renderSenaraiWatak();
    }

    function renderSenaraiWatak() {
        console.log("BW-DEBUG-V3: renderSenaraiWatak() dipanggil.");
        console.log("BW-DEBUG-V3: Kandungan 'senaraiWatak' sebelum render:", JSON.stringify(senaraiWatak, null, 2));
        console.log("BW-DEBUG-V3: Jumlah watak untuk dirender:", senaraiWatak ? senaraiWatak.length : 'senaraiWatak is null/undefined');

        if (!senaraiWatakDisplayArea) {
            console.error("BW-DEBUG-V3: Elemen senaraiWatakDisplayArea tidak ditemui untuk render!");
            return;
        }
        senaraiWatakDisplayArea.innerHTML = ''; 
        if (!senaraiWatak || senaraiWatak.length === 0) {
            senaraiWatakDisplayArea.innerHTML = '<p class="text-muted pop-art-text">Tiada watak dicipta untuk projek ini.</p>';
            console.log("BW-DEBUG-V3: Tiada watak untuk dipaparkan dalam renderSenaraiWatak.");
            return;
        }
        const ul = document.createElement('ul');
        ul.className = 'list-group';
        senaraiWatak.forEach(watak => {
            if (!watak || typeof watak.namaWatak === 'undefined' || watak.namaWatak.trim() === "") { 
                console.warn("BW-DEBUG-V3: Objek watak tidak sah atau tiada namaWatak semasa render:", watak);
                return; 
            }
            console.log("BW-DEBUG-V3: Merender watak:", watak.namaWatak); 
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center pop-art-list-item';
            const watakInfo = document.createElement('span');
            watakInfo.textContent = `${watak.namaWatak} (${watak.peranan || 'Tiada Peranan'})`;
            const butangAksi = document.createElement('div');
            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn btn-sm btn-outline-primary me-2';
            btnEdit.innerHTML = '<i class="bi bi-pencil-square"></i> Edit';
            btnEdit.addEventListener('click', () => isiBorangDenganDataWatak(watak));
            const btnPadam = document.createElement('button');
            btnPadam.className = 'btn btn-sm btn-outline-danger';
            btnPadam.innerHTML = '<i class="bi bi-trash"></i> Padam';
            btnPadam.addEventListener('click', () => handlePadamWatak(watak.idUnikWatak, watak.namaWatak));
            butangAksi.appendChild(btnEdit);
            butangAksi.appendChild(btnPadam);
            li.appendChild(watakInfo);
            li.appendChild(butangAksi);
            ul.appendChild(li);
        });
        senaraiWatakDisplayArea.appendChild(ul);
        console.log("BW-DEBUG-V3: Senarai watak selesai dirender. Jumlah item dalam ul:", ul.children.length);
    }

    function handlePadamWatak(idWatak, namaWatak) {
        // ... (kod handlePadamWatak dikekalkan) ...
        if (confirm(`Anda pasti mahu memadam watak "${namaWatak}"?`)) {
            projekDataLengkap.senaraiWatak = projekDataLengkap.senaraiWatak.filter(w => w.idUnikWatak !== idWatak);
            senaraiWatak = projekDataLengkap.senaraiWatak; 
            if (editingCharacterId === idWatak) kosongkanBorang();
            renderSenaraiWatak();
            showAlertBinaWatak(`Watak "${namaWatak}" dipadam. Tekan 'Simpan Projek Penuh'.`, "info");
        }
    }
    
    function handleKosongkanSemuaWatak() {
        // ... (kod handleKosongkanSemuaWatak dikekalkan) ...
        if (!senaraiWatak || senaraiWatak.length === 0) {
            showAlertBinaWatak("Tiada watak untuk dipadam.", "info");
            return;
        }
        if (confirm("AMARAN: Padam SEMUA watak dari projek ini?")) {
            projekDataLengkap.senaraiWatak = [];
            senaraiWatak = projekDataLengkap.senaraiWatak; 
            editingCharacterId = null;
            kosongkanBorang();
            renderSenaraiWatak();
            showAlertBinaWatak("Semua watak dipadam. Tekan 'Simpan Projek Penuh'.", "warning");
        }
    }

    // --- Fungsi Import/Export JSON (Keseluruhan JSON Eka) ---
    function handleMuatTurunJsonProjek() {
        // ... (kod handleMuatTurunJsonProjek dikekalkan) ...
        console.log("BW-DEBUG-V3: handleMuatTurunJsonProjek() dipanggil.");
        if (!projekDataLengkap || !projekDataLengkap.idProjekUnik) {
            showAlertBinaWatak("Tiada data projek aktif untuk dimuat turun.", "warning");
            return;
        }
        projekDataLengkap.senaraiWatak = senaraiWatak; 
        projekDataLengkap.metadataLain.tarikhKemasKiniTerakhir = new Date().toISOString();
        const filename = `BCPS_Projek_${(projekDataLengkap.infoKomik.tajukProjek || "TanpaTajuk").replace(/[^a-z0-9]/gi, '_')}.json`;
        const jsonData = JSON.stringify(projekDataLengkap, null, 2);
        downloadFile(filename, jsonData, "application/json");
    }

    function handleMuatNaikJsonProjek(event) {
        console.log("BW-DEBUG-V3: handleMuatNaikJsonProjek() dipanggil.");
        const file = event.target.files[0];
        if (!file) {
            console.log("BW-DEBUG-V3: Tiada fail dipilih untuk muat naik.");
            return;
        }

        if (file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dataDimuatString = e.target.result;
                    console.log("BW-DEBUG-V3: Kandungan fail JSON yang dibaca:", dataDimuatString);
                    const dataDimuat = JSON.parse(dataDimuatString);
                    console.log("BW-DEBUG-V3: Data JSON yang diparsing:", JSON.stringify(dataDimuat, null, 2));

                    if (dataDimuat && 
                        typeof dataDimuat.infoKomik === 'object' && 
                        Array.isArray(dataDimuat.senaraiWatak) && 
                        dataDimuat.idProjekUnik && 
                        Array.isArray(dataDimuat.drafCeritaAsasBCJunior) && 
                        Array.isArray(dataDimuat.comicData) &&
                        typeof dataDimuat.metadataLain === 'object'
                        ) { 
                        
                        console.log("BW-DEBUG-V3: Struktur JSON Eka disahkan.");

                        if (projekDataLengkap && projekDataLengkap.idProjekUnik && Object.keys(projekDataLengkap).length > 2 && 
                            !confirm("Ini akan menggantikan semua data projek sedia ada. Teruskan?")) {
                            if(inputMuatNaikJsonProjek) inputMuatNaikJsonProjek.value = ""; 
                            console.log("BW-DEBUG-V3: Pengguna membatalkan penimpaan data.");
                            return;
                        }

                        projekDataLengkap = dataDimuat; 
                        senaraiWatak = projekDataLengkap.senaraiWatak; 
                        console.log("BW-DEBUG-V3: projekDataLengkap dikemaskini dengan data dari fail.");
                        console.log("BW-DEBUG-V3: senaraiWatak kini:", JSON.stringify(senaraiWatak, null, 2));
                        
                        renderSenaraiWatak(); 
                        kosongkanBorang(); 

                        if (tajukProjekAktifDisplay) { 
                            tajukProjekAktifDisplay.innerHTML = `Projek Aktif: <strong>${projekDataLengkap.infoKomik.tajukProjek || "Belum Bertajuk"}</strong>`;
                        }
                        showAlertBinaWatak("Data Projek Penuh (JSON Eka) berjaya dimuat naik. Sila 'Simpan Projek Penuh' jika mahu ia kekal di memori pelayar.", "success");
                    } else {
                        let missingFields = [];
                        if (!dataDimuat) missingFields.push("dataDimuat (objek utama)");
                        if (!(dataDimuat && typeof dataDimuat.infoKomik === 'object')) missingFields.push("infoKomik (objek)");
                        if (!(dataDimuat && Array.isArray(dataDimuat.senaraiWatak))) missingFields.push("senaraiWatak (array)");
                        if (!(dataDimuat && dataDimuat.idProjekUnik)) missingFields.push("idProjekUnik");
                        if (!(dataDimuat && Array.isArray(dataDimuat.drafCeritaAsasBCJunior))) missingFields.push("drafCeritaAsasBCJunior (array)");
                        if (!(dataDimuat && Array.isArray(dataDimuat.comicData))) missingFields.push("comicData (array)");
                        if (!(dataDimuat && typeof dataDimuat.metadataLain === 'object')) missingFields.push("metadataLain (objek)");
                        
                        console.error("BW-DEBUG-V3: Struktur fail JSON Eka tidak sah. Medan yang hilang atau jenis tidak betul:", missingFields.join(', '));
                        throw new Error(`Struktur fail JSON Eka tidak sah. Medan yang diperlukan mungkin hilang atau jenisnya salah: ${missingFields.join(', ')}`);
                    }
                } catch (error) {
                    console.error("BW-DEBUG-V3: Ralat memproses fail JSON Eka:", error);
                    showAlertBinaWatak(`Ralat memproses fail JSON Eka: ${error.message}`, "danger");
                }
            };
            reader.onerror = (error) => {
                console.error("BW-DEBUG-V3: Ralat FileReader:", error);
                showAlertBinaWatak("Gagal membaca fail.", "danger");
            };
            reader.readAsText(file);
        } else {
            showAlertBinaWatak("Sila muat naik fail .json sahaja.", "warning");
        }
        if(inputMuatNaikJsonProjek) inputMuatNaikJsonProjek.value = ""; 
    }

    // --- Inisialisasi & Event Listeners ---
    function initBinaWatak() {
        // ... (kod initBinaWatak dengan semua pemasangan listener dikekalkan) ...
        console.log("BW-DEBUG-V3: initBinaWatak() bermula.");

        if (borangWatak) borangWatak.addEventListener('submit', handleSimpanWatak);
        else console.error("BW-DEBUG-V3: Elemen borangWatak TIDAK ditemui!");

        if (btnBatalEditTambah) btnBatalEditTambah.addEventListener('click', kosongkanBorang);
        else console.error("BW-DEBUG-V3: Elemen btnBatalEditTambah TIDAK ditemui!");

        if (btnTambahWatakBaruDariPanel) btnTambahWatakBaruDariPanel.addEventListener('click', kosongkanBorang);
        else console.error("BW-DEBUG-V3: Elemen btnTambahWatakBaruDariPanel TIDAK ditemui!");

        if (btnSimpanSemuaKeLocalStorage) btnSimpanSemuaKeLocalStorage.addEventListener('click', simpanProjekDataKeLocalStorage);
        else console.error("BW-DEBUG-V3: Elemen btnSimpanSemuaKeLocalStorage TIDAK ditemui!");
        
        if (btnMuatNaikJsonProjekTrigger && inputMuatNaikJsonProjek) {
            btnMuatNaikJsonProjekTrigger.addEventListener('click', () => inputMuatNaikJsonProjek.click());
            inputMuatNaikJsonProjek.addEventListener('change', handleMuatNaikJsonProjek);
        } else { 
            if (!btnMuatNaikJsonProjekTrigger) console.error("BW-DEBUG-V3: Elemen btnMuatNaikJsonProjekTrigger TIDAK ditemui!");
            if (!inputMuatNaikJsonProjek) console.error("BW-DEBUG-V3: Elemen inputMuatNaikJsonProjek TIDAK ditemui!");
        }

        if (btnMuatTurunJsonProjek) btnMuatTurunJsonProjek.addEventListener('click', handleMuatTurunJsonProjek);
        else console.error("BW-DEBUG-V3: Elemen btnMuatTurunJsonProjek TIDAK ditemui!");

        if (btnKosongkanSemuaWatak) btnKosongkanSemuaWatak.addEventListener('click', handleKosongkanSemuaWatak);
        else console.error("BW-DEBUG-V3: Elemen btnKosongkanSemuaWatak TIDAK ditemui!");

        console.log("BW-DEBUG-V3: Memanggil muatProjekDataDariLocalStorage() dalam initBinaWatak.");
        muatProjekDataDariLocalStorage(); 
        console.log("BW-DEBUG-V3: initBinaWatak() selesai.");
    }

    initBinaWatak(); 
});
