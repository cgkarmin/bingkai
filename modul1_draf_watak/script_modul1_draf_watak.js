// modul1_draf_watak/script_modul1_draf_watak.js
// Skrip untuk Modul 1: Draf Cerita & Pembangunan Watak Asas

document.addEventListener('DOMContentLoaded', () => {
    console.log("Modul 1: DOMContentLoaded - Skrip Draf & Watak dimulakan.");

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

    const LOCAL_STORAGE_KEY_EKA = 'projekBCPS_DataLengkap';
    let projekDataEkaSemasa = {}; 
    let senaraiWatakModul1 = []; 
    let editingCharacterIdM1 = null;

    const inputTajukProjekM1 = document.getElementById('inputTajukProjekM1');
    const inputGenreUtamaM1 = document.getElementById('inputGenreUtamaM1');
    const inputSinopsisM1 = document.getElementById('inputSinopsisM1');
    const inputCatatanBCJM1 = document.getElementById('inputCatatanBCJM1');
    const tajukProjekAktifDisplayM1 = document.getElementById('tajukProjekAktifDisplayM1');

    const inputFailJsonEkaM1 = document.getElementById('inputFailJsonEkaM1');
    const btnBukaProjekJsonEkaM1 = document.getElementById('btnBukaProjekJsonEkaM1');
    const btnMuatTurunJsonEkaM1 = document.getElementById('btnMuatTurunJsonEkaM1');
    const btnMulakanProjekBaruM1 = document.getElementById('btnMulakanProjekBaruM1'); 

    const bcTableM1Body = document.getElementById('bcBodyM1');
    const bcTableM1HeaderRow = document.querySelector("#bcTableM1 thead tr");

    const btnToggleEditorKaranganM1 = document.getElementById('btnToggleEditorKaranganM1');
    const richEditorContainerM1 = document.getElementById('richEditorContainerM1');
    const richEditorM1 = document.getElementById('richEditorM1');

    const borangWatakM1 = document.getElementById('borangWatakM1');
    const headerBorangWatakM1 = document.getElementById('headerBorangWatakM1');
    const idUnikWatakInputM1 = document.getElementById('idUnikWatakM1');
    const namaWatakInputM1 = document.getElementById('namaWatakM1');
    const perananInputM1 = document.getElementById('perananM1');
    const deskripsiImejRujukanInputM1 = document.getElementById('deskripsiImejRujukanM1');
    const personalitiKunciInputM1 = document.getElementById('personalitiKunciM1');
    const motivasiUtamaInputM1 = document.getElementById('motivasiUtamaM1');
    const jantinaUmurVisualInputM1 = document.getElementById('jantinaUmurVisualM1');
    const bentukBadanInputM1 = document.getElementById('bentukBadanM1');
    const warnaRambutGayaInputM1 = document.getElementById('warnaRambutGayaM1');
    const warnaMataInputM1 = document.getElementById('warnaMataM1');
    const warnaKulitInputM1 = document.getElementById('warnaKulitM1');
    const pakaianLazimInputM1 = document.getElementById('pakaianLazimM1');
    const aksesoriKhasInputM1 = document.getElementById('aksesoriKhasM1');
    const btnBatalEditTambahM1 = document.getElementById('btnBatalEditTambahM1');

    const senaraiWatakDisplayAreaM1 = document.getElementById('senaraiWatakDisplayAreaM1');
    const btnSimpanDanTeruskanKeModul2 = document.getElementById('btnSimpanDanTeruskanKeModul2');

    function showAlertM1(message, type = 'info') {
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
        document.body.appendChild(alertDiv); 
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

    function generateUniqueId() { 
        return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

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
            panduanAIPanel: { // Arahan AI Global Ditambah Di Sini
                arahanSusunan: "Untuk AI Penjana Imej: Sila hasilkan imej panel demi panel mengikut urutan yang diberikan.",
                peringatanPolisi: "PENTING: Pastikan semua deskripsi panel mematuhi polisi kandungan AI."
            },
            comicData: [],      
            senaraiPanel: [],   
            metadataLain: {
                tarikhDicipta: new Date().toISOString(),
                tarikhKemasKiniTerakhir: new Date().toISOString()
            }
        };
        senaraiWatakModul1 = projekDataEkaSemasa.senaraiWatak; 
        console.log("Modul 1: Projek Eka kosong telah diinisialisasi dengan ID baru:", projekDataEkaSemasa.idProjekUnik);
    }

    function muatProjekEkaDariLocalStorage() {
        const dataString = localStorage.getItem(LOCAL_STORAGE_KEY_EKA);
        if (dataString) {
            try {
                projekDataEkaSemasa = JSON.parse(dataString);
                projekDataEkaSemasa.infoKomik = projekDataEkaSemasa.infoKomik || { tajukProjek: "Projek Dimuatkan (Tanpa Tajuk)"};
                projekDataEkaSemasa.drafCeritaAsasBCJunior = projekDataEkaSemasa.drafCeritaAsasBCJunior || [];
                projekDataEkaSemasa.karanganLanjutan = projekDataEkaSemasa.karanganLanjutan || "";
                projekDataEkaSemasa.senaraiWatak = projekDataEkaSemasa.senaraiWatak || [];
                projekDataEkaSemasa.panduanAIPanel = projekDataEkaSemasa.panduanAIPanel || { // Default untuk panduanAIPanel jika tiada
                    arahanSusunan: "Untuk AI Penjana Imej: Sila hasilkan imej panel demi panel mengikut urutan yang diberikan.",
                    peringatanPolisi: "PENTING: Pastikan semua deskripsi panel mematuhi polisi kandungan AI."
                };
                projekDataEkaSemasa.comicData = projekDataEkaSemasa.comicData || [];
                projekDataEkaSemasa.senaraiPanel = projekDataEkaSemasa.senaraiPanel || [];
                projekDataEkaSemasa.metadataLain = projekDataEkaSemasa.metadataLain || {tarikhDicipta: new Date().toISOString(), tarikhKemasKiniTerakhir: new Date().toISOString()};
                if (!projekDataEkaSemasa.idProjekUnik) projekDataEkaSemasa.idProjekUnik = generateUniqueId();

                senaraiWatakModul1 = projekDataEkaSemasa.senaraiWatak;
                isiSemuaBorangDariProjekEka();
                showAlertM1(`Projek "${projekDataEkaSemasa.infoKomik.tajukProjek || 'Tanpa Tajuk'}" (ID: ${projekDataEkaSemasa.idProjekUnik}) dimuatkan.`, "info");
            } catch (error) {
                console.error("Modul 1: Ralat memuat JSON Eka dari localStorage:", error);
                showAlertM1("Gagal memuat data projek. Memulakan projek baru.", "danger");
                inisialisasiProjekEkaKosong();
                isiSemuaBorangDariProjekEka(); 
            }
        } else {
            inisialisasiProjekEkaKosong();
            isiSemuaBorangDariProjekEka(); 
        }
         if (tajukProjekAktifDisplayM1 && projekDataEkaSemasa.infoKomik) {
             tajukProjekAktifDisplayM1.innerHTML = `Projek Aktif: <strong>${projekDataEkaSemasa.infoKomik.tajukProjek || "Belum Bertajuk"}</strong> (ID: ${projekDataEkaSemasa.idProjekUnik || "Tiada ID"})`;
         }
    }

    function simpanProjekEkaKeLocalStorage() {
        if (!projekDataEkaSemasa || !projekDataEkaSemasa.idProjekUnik) {
             inisialisasiProjekEkaKosong(); 
        }
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
        if (!projekDataEkaSemasa) {
             console.error("Modul 1: projekDataEkaSemasa tidak wujud semasa cuba isi borang.");
             inisialisasiProjekEkaKosong(); 
        }
        
        if (inputTajukProjekM1) inputTajukProjekM1.value = projekDataEkaSemasa.infoKomik?.tajukProjek || "";
        if (inputGenreUtamaM1) inputGenreUtamaM1.value = projekDataEkaSemasa.infoKomik?.genreUtama || "";
        if (inputSinopsisM1) inputSinopsisM1.value = projekDataEkaSemasa.infoKomik?.sinopsisRingkasProjek || "";
        if (inputCatatanBCJM1) inputCatatanBCJM1.value = projekDataEkaSemasa.infoKomik?.catatanBCJunior || "";

        if (tajukProjekAktifDisplayM1 && projekDataEkaSemasa.infoKomik) {
             tajukProjekAktifDisplayM1.innerHTML = `Projek Aktif: <strong>${projekDataEkaSemasa.infoKomik.tajukProjek || "Belum Bertajuk"}</strong> (ID: ${projekDataEkaSemasa.idProjekUnik || "Tiada ID"})`;
        }

        if (Array.isArray(projekDataEkaSemasa.drafCeritaAsasBCJunior)) {
            loadDataToTableM1(projekDataEkaSemasa.drafCeritaAsasBCJunior);
        } else {
            loadDataToTableM1([]); 
        }

        if (richEditorM1) richEditorM1.innerHTML = projekDataEkaSemasa.karanganLanjutan || "Tampal hasil adunan cerita dari AI atau tulis karangan penuh di sini...";
        
        // Panduan AI Panel tidak dipaparkan di UI Modul 1, hanya disimpan dalam data.

        senaraiWatakModul1 = projekDataEkaSemasa.senaraiWatak || []; 
        renderSenaraiWatakM1();
        kosongkanBorangWatakM1(); 
    }

    function kumpulDataKeProjekEka() {
        if (!projekDataEkaSemasa) inisialisasiProjekEkaKosong(); 

        projekDataEkaSemasa.infoKomik = {
            tajukProjek: inputTajukProjekM1?.value.trim() || projekDataEkaSemasa.infoKomik?.tajukProjek || "Projek Tanpa Tajuk",
            genreUtama: inputGenreUtamaM1?.value.trim() || projekDataEkaSemasa.infoKomik?.genreUtama || "",
            sinopsisRingkasProjek: inputSinopsisM1?.value.trim() || projekDataEkaSemasa.infoKomik?.sinopsisRingkasProjek || "",
            catatanBCJunior: inputCatatanBCJM1?.value.trim() || projekDataEkaSemasa.infoKomik?.catatanBCJunior || ""
        };
        projekDataEkaSemasa.drafCeritaAsasBCJunior = getTableDataM1();
        projekDataEkaSemasa.karanganLanjutan = richEditorM1?.innerHTML || "";
        projekDataEkaSemasa.senaraiWatak = senaraiWatakModul1; 
        // Pastikan panduanAIPanel kekal jika sudah ada, atau dari inisialisasi
        projekDataEkaSemasa.panduanAIPanel = projekDataEkaSemasa.panduanAIPanel || { 
            arahanSusunan: "Untuk AI Penjana Imej: Sila hasilkan imej panel demi panel mengikut urutan yang diberikan.",
            peringatanPolisi: "PENTING: Pastikan semua deskripsi panel mematuhi polisi kandungan AI."
        };
        projekDataEkaSemasa.comicData = projekDataEkaSemasa.comicData || []; 
        projekDataEkaSemasa.senaraiPanel = projekDataEkaSemasa.senaraiPanel || []; 
    }

    function handleMuatNaikJsonEkaM1(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dataDimuat = JSON.parse(e.target.result);

                    if (dataDimuat && dataDimuat.infoKomik &&
                        Array.isArray(dataDimuat.drafCeritaAsasBCJunior) &&
                        Array.isArray(dataDimuat.senaraiWatak) &&
                        dataDimuat.idProjekUnik) {

                        dataDimuat.panduanAIPanel = dataDimuat.panduanAIPanel || { 
                            arahanSusunan: "Untuk AI Penjana Imej: Sila hasilkan imej panel demi panel mengikut urutan yang diberikan.",
                            peringatanPolisi: "PENTING: Pastikan semua deskripsi panel mematuhi polisi kandungan AI."
                        };
                        dataDimuat.comicData = Array.isArray(dataDimuat.comicData) ? dataDimuat.comicData : [];
                        dataDimuat.senaraiPanel = Array.isArray(dataDimuat.senaraiPanel) ? dataDimuat.senaraiPanel : [];

                        if (projekDataEkaSemasa.idProjekUnik && projekDataEkaSemasa.idProjekUnik !== "id_0_default" && 
                            !confirm("Ini akan menggantikan semua data projek semasa. Teruskan?")) {
                            if(inputFailJsonEkaM1) inputFailJsonEkaM1.value = "";
                            return;
                        }
                        projekDataEkaSemasa = dataDimuat;
                        senaraiWatakModul1 = projekDataEkaSemasa.senaraiWatak; 
                        isiSemuaBorangDariProjekEka(); 
                        showAlertM1("Projek JSON Eka berjaya dimuat naik!", "success");

                    } else {
                        let missingParts = [];
                        if (!dataDimuat) missingParts.push("data utama");
                        if (!(dataDimuat && dataDimuat.infoKomik)) missingParts.push("infoKomik");
                        // ... (tambah pemeriksaan lain jika perlu)
                        if (!(dataDimuat && dataDimuat.idProjekUnik)) missingParts.push("idProjekUnik");
                        throw new Error(`Struktur fail JSON Eka tidak sah. Bahagian penting mungkin hilang: ${missingParts.join(', ')}.`);
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
        kumpulDataKeProjekEka(); 
        if (!projekDataEkaSemasa || !projekDataEkaSemasa.idProjekUnik) {
            showAlertM1("Tiada data projek aktif untuk dimuat turun. Sila simpan atau mulakan projek baru.", "warning");
            return;
        }
        const tajukFail = (projekDataEkaSemasa.infoKomik.tajukProjek || "ProjekTanpaTajuk").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        downloadFileM1(`BCPS_ProjekPenuh_${tajukFail}_M1.json`, JSON.stringify(projekDataEkaSemasa, null, 2), "application/json");
    }

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
        if (!bcTableM1Body) { 
            console.error("Modul 1: Elemen tbody #bcBodyM1 tidak ditemui semasa loadDataToTableM1.");
            return; 
        }
        [...bcTableM1Body.querySelectorAll("td textarea")].forEach(textarea => textarea.value = "");

        if (Array.isArray(dataToLoad) && dataToLoad.length > 0) {
            dataToLoad.forEach((dataRow, rowIndex) => {
                if (rowIndex < bcTableM1Body.rows.length && dataRow && typeof dataRow === 'object') {
                    const tr = bcTableM1Body.rows[rowIndex];
                    if (tr) { 
                        const textareas = tr.querySelectorAll("td textarea");
                        colsConfigM1.forEach((colConf, colIndex) => {
                            if (textareas[colIndex] && typeof dataRow[colConf.key] !== 'undefined') {
                                textareas[colIndex].value = dataRow[colConf.key] || "";
                            }
                        });
                    }
                }
            });
        }
    }
    
    function toggleEditorKaranganM1() {
        if (richEditorContainerM1) {
            const isVisible = richEditorContainerM1.style.display === "block";
            richEditorContainerM1.style.display = isVisible ? "none" : "block";
            if (btnToggleEditorKaranganM1) btnToggleEditorKaranganM1.querySelector('i').className = isVisible ? "bi bi-arrows-expand" : "bi bi-arrows-collapse";
            if (!isVisible && richEditorContainerM1.scrollIntoView) richEditorContainerM1.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function kosongkanBorangWatakM1() {
        if (borangWatakM1) borangWatakM1.reset();
        if (idUnikWatakInputM1) idUnikWatakInputM1.value = '';
        editingCharacterIdM1 = null;
        if (headerBorangWatakM1) headerBorangWatakM1.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Tambah Watak Baru';
    }

    function isiBorangDenganDataWatakM1(watak) {
        kosongkanBorangWatakM1(); 
        editingCharacterIdM1 = watak.idUnikWatak;
        if (idUnikWatakInputM1) idUnikWatakInputM1.value = watak.idUnikWatak;
        if (namaWatakInputM1) namaWatakInputM1.value = watak.namaWatak || "";
        // ... (semua medan watak lain diisi seperti sebelumnya) ...
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
        }

        if (headerBorangWatakM1) headerBorangWatakM1.innerHTML = `<i class="bi bi-pencil-fill me-2"></i>Edit Watak: ${watak.namaWatak}`;
        const borangCard = document.getElementById('borangWatakModul1Card');
        if (borangCard && borangCard.scrollIntoView) borangCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function handleSimpanWatakM1(event) {
        event.preventDefault(); 
        if (!projekDataEkaSemasa || !Array.isArray(projekDataEkaSemasa.senaraiWatak)) {
            showAlertM1("Struktur data projek tidak diinisialisasi. Cuba muat semula atau mulakan projek baru.", "danger");
            return; 
        }
        const watakData = {
            idUnikWatak: editingCharacterIdM1 || generateUniqueId(),
            namaWatak: namaWatakInputM1.value.trim(),
            peranan: perananInputM1.value,
            deskripsiImejRujukan: deskripsiImejRujukanInputM1.value.trim(),
            personalitiKunci: personalitiKunciInputM1.value.trim(),
            motivasiUtama: motivasiUtamaInputM1.value.trim(),
            penampilanVisual: {
                jantinaUmurVisual: jantinaUmurVisualInputM1.value.trim(),
                bentukBadan: bentukBadanInputM1.value.trim(),
                warnaRambutGaya: warnaRambutGayaInputM1.value.trim(),
                warnaMata: warnaMataInputM1.value.trim(),
                warnaKulit: warnaKulitInputM1.value.trim(),
                pakaianLazim: pakaianLazimInputM1.value.trim(),
                aksesoriKhas: aksesoriKhasInputM1.value.trim(),
            }
        };
        if (!watakData.namaWatak) {
            showAlertM1("Nama Watak adalah mandatori!", "warning");
            if (namaWatakInputM1) namaWatakInputM1.focus();
            return;
        }

        const isEditing = editingCharacterIdM1 !== null;
        if (isEditing) {
            const index = senaraiWatakModul1.findIndex(w => w.idUnikWatak === editingCharacterIdM1);
            if (index !== -1) senaraiWatakModul1[index] = watakData; 
        } else {
            senaraiWatakModul1.push(watakData); 
        }
        projekDataEkaSemasa.senaraiWatak = senaraiWatakModul1; 
        
        kosongkanBorangWatakM1(); 
        renderSenaraiWatakM1();
        showAlertM1(`Watak "${watakData.namaWatak}" ${isEditing ? 'dikemaskini' : 'ditambah'}. Sila simpan projek untuk kekalkan perubahan.`, "success");
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
            showAlertM1(`Watak "${namaWatak}" dipadam. Sila simpan projek untuk kekalkan perubahan.`, "info");
        }
    }

    function adunDanSalinPromptAIM1(platformAI) {
        // ... (fungsi ini kekal sama seperti versi penuh terakhir) ...
        const tableData = getTableDataM1();
        if (tableData.length === 0 || tableData.every(row => colsConfigM1.every(col => !(row[col.key] && row[col.key].trim())))) {
            showAlertM1("Tiada data di papan cerita untuk diadun.", "warning"); return;
        }
        let promptTeks = "Arahan untuk AI: Berdasarkan elemen cerita ini, hasilkan karangan naratif pendek (~260 perkataan) yang koheren.\n\n";
        const tajukProjekVal = inputTajukProjekM1 ? inputTajukProjekM1.value.trim() : "";
        const tajukCadangan = tajukProjekVal !== "" ? tajukProjekVal : (projekDataEkaSemasa.infoKomik?.tajukProjek || "Sebuah Kisah Epik");
        promptTeks += `JUDUL CADANGAN: '${tajukCadangan}'\n\n`;
        tableData.forEach(row => {
            promptTeks += `## TAHAP PLOT: ${row.plot_label}\n`;
            colsConfigM1.forEach(col => {
                const nilai = row[col.key] || "";
                if (nilai.trim() !== "") promptTeks += `    * ${col.label}: ${nilai}\n`;
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
    
    function handleSimpanDanTeruskanKeModul2() {
        kumpulDataKeProjekEka(); 
        simpanProjekEkaKeLocalStorage(); 
        showAlertM1("Projek disimpan! Meneruskan ke Modul Susun Panel...", "info");
        setTimeout(() => {
            window.location.href = '../modul2_susun_panel/modul2_susun_panel.html'; 
        }, 1500);
    }

    function handleMulakanProjekBaruM1() {
        if (confirm("Anda pasti mahu mengosongkan semua data dalam modul ini dan memulakan draf projek baru? Semua perubahan yang belum disimpan akan hilang.")) {
            inisialisasiProjekEkaKosong(); 
            isiSemuaBorangDariProjekEka(); 

            renderSenaraiWatakM1();
            kosongkanBorangWatakM1();

            if (tajukProjekAktifDisplayM1 && projekDataEkaSemasa.infoKomik) {
                tajukProjekAktifDisplayM1.innerHTML = `Projek Aktif: <strong>${projekDataEkaSemasa.infoKomik.tajukProjek || "Belum Bertajuk"}</strong> (ID: ${projekDataEkaSemasa.idProjekUnik})`;
            }
            showAlertM1("Semua medan telah dikosongkan. Sedia untuk draf projek baru.", "info");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function initModul1() {
        populateTableHeaderM1();
        populateTableM1(); 
        muatProjekEkaDariLocalStorage(); 

        if (btnBukaProjekJsonEkaM1 && inputFailJsonEkaM1) {
            btnBukaProjekJsonEkaM1.addEventListener('click', () => inputFailJsonEkaM1.click());
            inputFailJsonEkaM1.addEventListener('change', handleMuatNaikJsonEkaM1);
        }
        if (btnMuatTurunJsonEkaM1) btnMuatTurunJsonEkaM1.addEventListener('click', handleMuatTurunJsonEkaM1);
        
        if (btnMulakanProjekBaruM1) {
            btnMulakanProjekBaruM1.addEventListener('click', handleMulakanProjekBaruM1);
        }
        
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

        if (btnSimpanDanTeruskanKeModul2) btnSimpanDanTeruskanKeModul2.addEventListener('click', handleSimpanDanTeruskanKeModul2);
    }

    initModul1(); 
});