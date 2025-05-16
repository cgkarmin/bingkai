// modul2_susun_panel/script_modul2_susun_panel.js
// Skrip untuk Modul 2: Susun Panel Komik

document.addEventListener('DOMContentLoaded', () => {
    console.log("M2: DOMContentLoaded - Skrip Modul 2 (Susun Panel) dimulakan.");

    // --- Rujukan Elemen DOM Utama ---
    const tajukProjekAktifDisplayM2 = document.getElementById('tajukProjekAktifDisplayM2');
    const editorAreaM2 = document.getElementById('editorAreaModul2');
    const placeholderPanelUtamaM2 = document.getElementById('placeholderPanelUtamaM2');
    const templatePanelUtamaM2 = document.getElementById('templatePanelUtamaM2');
    const templateSubPanelM2 = document.getElementById('templateSubPanelM2');
    const datalistWatakM2 = document.getElementById('senaraiWatakDatalistM2');

    // Butang Kawalan Editor
    const btnTambahPanelUtamaM2 = document.getElementById('btnTambahPanelUtamaM2');
    const inputMuatNaikJsonEkaM2 = document.getElementById('inputMuatNaikJsonEkaM2');
    const btnMuatNaikJsonEkaM2Trigger = document.getElementById('btnMuatNaikJsonEkaM2Trigger');
    const btnMuatTurunJsonEkaM2 = document.getElementById('btnMuatTurunJsonEkaM2');
    const btnKosongkanSemuaPanelUtamaM2 = document.getElementById('btnKosongkanSemuaPanelUtamaM2');
    
    // Butang Tindakan Utama Modul
    const btnSimpanDanKeModul3 = document.getElementById('btnSimpanDanKeModul3');

    // --- Pemboleh Ubah Global ---
    let projekDataEkaSemasa = {}; 
    let comicDataM2 = []; // Rujukan kepada projekDataEkaSemasa.comicData
    let senaraiNamaWatakM2 = []; 
    let panelUtamaIdCounterM2 = 0; 

    const LOCAL_STORAGE_KEY_EKA = 'projekBCPS_DataLengkap';

    // --- Fungsi Bantuan ---
    function showAlertM2(message, type = 'info') {
        const alertContainer = document.querySelector('main.container');
        if (!alertContainer) { console.warn("M2: Alert container tidak ditemui."); return; }
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = "2090"; // Pastikan z-index tinggi
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
        
        const existingAlert = document.querySelector('.alert.fixed-top-m2-alert');
        if (existingAlert) existingAlert.remove();
        alertDiv.classList.add('fixed-top-m2-alert');
        document.body.appendChild(alertDiv); // Tambah ke body supaya sentiasa di atas
        
        setTimeout(() => {
            if (alertDiv && alertDiv.parentElement) {
                const bsAlert = (typeof bootstrap !== 'undefined' && bootstrap.Alert) ? bootstrap.Alert.getInstance(alertDiv) : null;
                if (bsAlert) bsAlert.close(); else if (alertDiv.parentElement) alertDiv.remove();
            }
        }, 5000);
    }

    function downloadFileM2(filename, content, type) {
        const blob = new Blob([content], { type });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    function kemaskiniPlaceholderPanelUtama() {
        if (placeholderPanelUtamaM2 && editorAreaM2) {
            placeholderPanelUtamaM2.style.display = editorAreaM2.querySelectorAll('.panel-utama-card').length === 0 ? 'block' : 'none';
        }
    }

    function kemaskiniPlaceholderSubPanel(panelUtamaElement) {
        if (!panelUtamaElement) return;
        const subpanelContainer = panelUtamaElement.querySelector('.subpanel-container');
        const placeholder = panelUtamaElement.querySelector('.placeholder-subpanelM2');
        if (placeholder && subpanelContainer) {
            placeholder.style.display = subpanelContainer.querySelectorAll('.sub-panel-card').length === 0 ? 'block' : 'none';
        }
    }

    // --- Pengurusan Projek "JSON Eka" ---
    function muatProjekEkaDariLocalStorageM2() {
        console.log("M2: muatProjekEkaDariLocalStorageM2() bermula.");
        const dataString = localStorage.getItem(LOCAL_STORAGE_KEY_EKA);
        if (dataString) {
            try {
                projekDataEkaSemasa = JSON.parse(dataString);
                // Inisialisasi struktur default jika bahagian tertentu tiada
                projekDataEkaSemasa.infoKomik = projekDataEkaSemasa.infoKomik || { tajukProjek: "Projek Tanpa Tajuk (Dimuatkan)", genreUtama: "Tidak Dinyatakan" };
                projekDataEkaSemasa.senaraiWatak = projekDataEkaSemasa.senaraiWatak || [];
                projekDataEkaSemasa.comicData = projekDataEkaSemasa.comicData || []; 
                projekDataEkaSemasa.drafCeritaAsasBCJunior = projekDataEkaSemasa.drafCeritaAsasBCJunior || [];
                projekDataEkaSemasa.karanganLanjutan = projekDataEkaSemasa.karanganLanjutan || "";
                projekDataEkaSemasa.metadataLain = projekDataEkaSemasa.metadataLain || {};
                if (!projekDataEkaSemasa.idProjekUnik) {
                    projekDataEkaSemasa.idProjekUnik = `proj_m2_${Date.now()}`;
                }
                
                comicDataM2 = projekDataEkaSemasa.comicData; 
                muatSenaraiWatakUntukDatalist();
                renderEditorPanels();
                // showAlertM2(`Meneruskan kerja untuk projek: "${projekDataEkaSemasa.infoKomik.tajukProjek || 'Tanpa Tajuk'}".`, "info");

            } catch (error) {
                console.error("M2: Ralat memuat JSON Eka dari localStorage:", error);
                showAlertM2("Gagal memuat data projek. Memulakan editor panel kosong.", "danger");
                inisialisasiProjekEkaKosongM2(); 
                comicDataM2 = projekDataEkaSemasa.comicData;
                renderEditorPanels();
            }
        } else {
            showAlertM2("Tiada data projek sedia ada. Sila mulakan dari Modul 1 atau buka fail projek.", "warning");
            inisialisasiProjekEkaKosongM2();
            comicDataM2 = projekDataEkaSemasa.comicData;
            renderEditorPanels(); 
        }
        if (tajukProjekAktifDisplayM2) {
            tajukProjekAktifDisplayM2.innerHTML = `Projek Aktif: <strong>${projekDataEkaSemasa.infoKomik.tajukProjek || "Belum Bertajuk"}</strong>`;
        }
    }

    function inisialisasiProjekEkaKosongM2() {
        projekDataEkaSemasa = {
            infoKomik: { tajukProjek: "Projek Baru (Editor Panel)", genreUtama: "Tidak Dinyatakan" },
            senaraiWatak: [],
            comicData: [],
            drafCeritaAsasBCJunior: [],
            karanganLanjutan: "",
            metadataLain: { tarikhDicipta: new Date().toISOString() },
            idProjekUnik: `proj_m2_kosong_${Date.now()}`
        };
        console.warn("M2: Inisialisasi projekDataEkaSemasa kosong kerana tiada data di localStorage.");
    }

    function simpanProjekEkaKeLocalStorageM2() {
        if (!projekDataEkaSemasa || !projekDataEkaSemasa.idProjekUnik) {
            showAlertM2("Tiada data projek aktif untuk disimpan.", "warning");
            return;
        }
        kumpulDataPanelDariDOM(); 
        projekDataEkaSemasa.comicData = comicDataM2;
        projekDataEkaSemasa.metadataLain.tarikhKemasKiniTerakhir = new Date().toISOString();
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_EKA, JSON.stringify(projekDataEkaSemasa));
            showAlertM2("Semua panel dan data projek (JSON Eka) telah disimpan!", "success");
        } catch (error) {
            console.error("M2: Ralat menyimpan JSON Eka ke localStorage:", error);
            showAlertM2("Gagal menyimpan data panel.", "danger");
        }
    }

    function handleMuatNaikJsonEkaM2(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dataDimuat = JSON.parse(e.target.result);
                    if (dataDimuat && dataDimuat.infoKomik && Array.isArray(dataDimuat.senaraiWatak) && 
                        Array.isArray(dataDimuat.comicData) && dataDimuat.idProjekUnik) {
                        
                        if (projekDataEkaSemasa.idProjekUnik && Object.keys(projekDataEkaSemasa).length > 2 &&
                            !confirm("Ini akan menggantikan semua data projek sedia ada. Teruskan?")) {
                            if(inputMuatNaikJsonEkaM2) inputMuatNaikJsonEkaM2.value = ""; 
                            return;
                        }
                        projekDataEkaSemasa = dataDimuat;
                        comicDataM2 = projekDataEkaSemasa.comicData;
                        muatSenaraiWatakUntukDatalist(); // Muat semula datalist watak
                        
                        renderEditorPanels();
                        if (tajukProjekAktifDisplayM2) {
                            tajukProjekAktifDisplayM2.innerHTML = `Projek Aktif: <strong>${projekDataEkaSemasa.infoKomik.tajukProjek || "Belum Bertajuk"}</strong>`;
                        }
                        showAlertM2("Projek JSON Eka berjaya dimuat naik.", "success");
                    } else {
                        throw new Error("Struktur fail JSON Eka tidak sah atau tidak lengkap.");
                    }
                } catch (error) {
                    showAlertM2(`Ralat memproses fail JSON Eka: ${error.message}`, "danger");
                }
            };
            reader.onerror = () => showAlertM2("Gagal membaca fail.", "danger");
            reader.readAsText(file);
        } else {
            showAlertM2("Sila muat naik fail .json sahaja.", "warning");
        }
        if(inputMuatNaikJsonEkaM2) inputMuatNaikJsonEkaM2.value = ""; 
    }

    function handleMuatTurunJsonEkaM2() {
        kumpulDataPanelDariDOM(); 
        projekDataEkaSemasa.comicData = comicDataM2; 
        if (!projekDataEkaSemasa || !projekDataEkaSemasa.idProjekUnik) {
            showAlertM2("Tiada data projek aktif untuk dimuat turun.", "warning");
            return;
        }
        projekDataEkaSemasa.metadataLain.tarikhKemasKiniTerakhir = new Date().toISOString();
        const filename = `BCPS_ProjekPenuh_${(projekDataEkaSemasa.infoKomik.tajukProjek || "TanpaTajuk").replace(/[^a-z0-9]/gi, '_')}_M2.json`;
        downloadFileM2(filename, JSON.stringify(projekDataEkaSemasa, null, 2), "application/json");
    }

    // --- Memuatkan Data Watak untuk Datalist ---
    function muatSenaraiWatakUntukDatalist() {
        if (projekDataEkaSemasa && Array.isArray(projekDataEkaSemasa.senaraiWatak)) {
            senaraiNamaWatakM2 = projekDataEkaSemasa.senaraiWatak.map(w => w.namaWatak).filter(Boolean).sort();
        } else {
            senaraiNamaWatakM2 = [];
        }
        isiDatalistWatakM2();
    }

    function isiDatalistWatakM2() {
        if (datalistWatakM2) {
            datalistWatakM2.innerHTML = ''; 
            senaraiNamaWatakM2.forEach(nama => {
                const option = document.createElement('option');
                option.value = nama;
                datalistWatakM2.appendChild(option);
            });
        }
    }
    
    // --- Logik Render Editor Panel ---
    function renderEditorPanels() {
        if (!editorAreaM2) { console.error("M2: Kontena editorAreaM2 tidak ditemui."); return; }
        editorAreaM2.innerHTML = ''; 
        
        if (!comicDataM2 || comicDataM2.length === 0) {
            kemaskiniPlaceholderPanelUtama();
            return;
        }

        comicDataM2.forEach((panelUtamaData, indexUtama) => {
            const panelUtamaElement = tambahPanelUtamaDOM(indexUtama, panelUtamaData); 
            if (panelUtamaElement && panelUtamaData.subpanel && Array.isArray(panelUtamaData.subpanel) && panelUtamaData.subpanel.length > 0) {
                const subpanelContainer = panelUtamaElement.querySelector('.subpanel-container');
                if (subpanelContainer) {
                    subpanelContainer.innerHTML = ''; 
                    panelUtamaData.subpanel.forEach((subPanelData, indexSub) => {
                        tambahSubPanelDOM(panelUtamaElement, indexUtama, indexSub, subPanelData);
                    });
                }
            }
            kemaskiniPlaceholderSubPanel(panelUtamaElement);
        });
        kemaskiniPlaceholderPanelUtama();
        panelUtamaIdCounterM2 = comicDataM2.length;
    }

    // --- Fungsi Panel Utama ---
    function tambahPanelUtamaDOM(indexPanelUtama, dataPanelUtama = null) {
        if (!templatePanelUtamaM2 || !templatePanelUtamaM2.content) {
            showAlertM2("Ralat: Templat Panel Utama tidak dapat dimuatkan.", "danger"); return null;
        }
        const klonNode = templatePanelUtamaM2.content.cloneNode(true);
        const panelCard = klonNode.querySelector('.panel-utama-card');
        
        const idInternal = (dataPanelUtama && dataPanelUtama.idInternalPanel) ? dataPanelUtama.idInternalPanel : `panelUtamaM2_${Date.now()}_${indexPanelUtama}`;
        panelCard.setAttribute('data-id-internal-panelutama', idInternal);
        panelCard.setAttribute('data-index-pu', indexPanelUtama);

        const titleElement = panelCard.querySelector('.panel-utama-title');
        if (titleElement) titleElement.textContent = `Panel Utama #${indexPanelUtama + 1}`;

        const btnPadam = panelCard.querySelector('.btnPadamPanelUtamaM2');
        if (btnPadam) btnPadam.addEventListener('click', () => handlePadamPanelUtama(indexPanelUtama));
        
        const btnTambahSub = panelCard.querySelector('.btnTambahSubPanelM2');
        if (btnTambahSub) btnTambahSub.addEventListener('click', () => handleTambahSubPanelKeData(indexPanelUtama));

        editorAreaM2.appendChild(klonNode);
        return panelCard;
    }
    
    function handleTambahPanelUtamaM2() {
        const panelUtamaBaru = {
            idInternalPanel: `panelUtamaM2_${Date.now()}_${comicDataM2.length}`,
            subpanel: [] 
        };
        comicDataM2.push(panelUtamaBaru);
        renderEditorPanels(); 
        const panelElements = editorAreaM2.querySelectorAll('.panel-utama-card');
        if (panelElements.length > 0 && panelElements[panelElements.length - 1].scrollIntoView) {
            panelElements[panelElements.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start'});
        }
        showAlertM2(`Panel Utama #${comicDataM2.length} telah ditambah.`, 'success');
    }

    function handlePadamPanelUtama(indexPanelUtama) {
        if (confirm(`Anda pasti mahu memadam Panel Utama #${indexPanelUtama + 1}?`)) {
            if (comicDataM2[indexPanelUtama]) {
                comicDataM2.splice(indexPanelUtama, 1);
                renderEditorPanels(); 
                showAlertM2(`Panel Utama #${indexPanelUtama + 1} telah dipadam.`, 'info');
            }
        }
    }
    
    function handleKosongkanSemuaPanelUtamaM2() {
        if (comicDataM2.length === 0) {
            showAlertM2("Tiada panel untuk dikosongkan.", "info"); return;
        }
        if (confirm("AMARAN: Padam SEMUA panel utama dan sub-panel?")) {
            comicDataM2 = [];
            panelUtamaIdCounterM2 = 0; 
            renderEditorPanels();
            showAlertM2("Semua panel telah dikosongkan.", "info");
        }
    }

    // --- Fungsi Sub-Panel ---
    function handleTambahSubPanelKeData(indexPanelUtama) {
        if (comicDataM2[indexPanelUtama] && Array.isArray(comicDataM2[indexPanelUtama].subpanel)) {
            const subPanelBaru = {
                idInternalSubPanel: `subPanelM2_${indexPanelUtama}_${Date.now()}`,
                watak: "", aksi: "", dialog: "", sudut: "", gaya: "",
                penampilan: { warna_pakaian: "", jenis_pakaian: "", aksesori: "", ekspresi_wajah: "", warna_kulit: "", gaya_rambut: "" }
            };
            comicDataM2[indexPanelUtama].subpanel.push(subPanelBaru);
            renderEditorPanels(); 
            
            const panelUtamaElements = editorAreaM2.querySelectorAll('.panel-utama-card');
            if (panelUtamaElements[indexPanelUtama]) {
                const subPanelCards = panelUtamaElements[indexPanelUtama].querySelectorAll('.sub-panel-card');
                if (subPanelCards.length > 0 && subPanelCards[subPanelCards.length -1].scrollIntoView) {
                    subPanelCards[subPanelCards.length -1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            showAlertM2(`Sub-Panel baru ditambah ke Panel Utama #${indexPanelUtama + 1}.`, 'success');
        } else {
            showAlertM2("Gagal menambah sub-panel.", "danger");
        }
    }

    function tambahSubPanelDOM(panelUtamaElement, indexPanelUtama, indexSub, dataSubPanel = null) {
        if (!templateSubPanelM2 || !templateSubPanelM2.content) return null;
        const subpanelContainer = panelUtamaElement.querySelector('.subpanel-container');
        if (!subpanelContainer) return null;

        const klonNode = templateSubPanelM2.content.cloneNode(true);
        const subPanelCard = klonNode.querySelector('.sub-panel-card');
        
        subPanelCard.setAttribute('data-id-internal-subpanel', (dataSubPanel && dataSubPanel.idInternalSubPanel) ? dataSubPanel.idInternalSubPanel : `subpanel_temp_${Date.now()}`);
        subPanelCard.setAttribute('data-index-pu', indexPanelUtama);
        subPanelCard.setAttribute('data-index-sp', indexSub);

        const subPanelTitle = subPanelCard.querySelector('.subpanel-title');
        if (subPanelTitle) subPanelTitle.textContent = `Sub-Panel #${indexSub + 1}`;
        
        const btnPadamSub = subPanelCard.querySelector('.btnPadamSubPanelM2');
        if (btnPadamSub) btnPadamSub.addEventListener('click', () => handlePadamSubPanel(indexPanelUtama, indexSub));

        if (dataSubPanel) {
            const setInputValue = (selector, value) => {
                const el = subPanelCard.querySelector(selector);
                if (el) el.value = value || "";
            };
            setInputValue('.input-watak', dataSubPanel.watak);
            setInputValue('.input-aksi', dataSubPanel.aksi);
            setInputValue('.input-dialog', dataSubPanel.dialog);
            setInputValue('.input-sudut', dataSubPanel.sudut);
            setInputValue('.input-gaya', dataSubPanel.gaya);
            if (dataSubPanel.penampilan) {
                Object.keys(dataSubPanel.penampilan).forEach(key => {
                    setInputValue(`.input-penampilan-${key.toLowerCase().replace(/_/g, '')}`, dataSubPanel.penampilan[key]);
                });
            }
        }
        
        subPanelCard.querySelectorAll('input, textarea').forEach(inputEl => {
            inputEl.addEventListener('input', () => kumpulDataPanelDariDOM()); // Guna 'input' untuk kemaskini segera
        });
        
        subpanelContainer.appendChild(klonNode);
        return subPanelCard;
    }
    
    function handlePadamSubPanel(indexPanelUtama, indexSub) {
        if (comicDataM2[indexPanelUtama] && comicDataM2[indexPanelUtama].subpanel[indexSub]) {
            if (confirm(`Anda pasti mahu memadam Sub-Panel #${indexSub + 1}?`)) {
                comicDataM2[indexPanelUtama].subpanel.splice(indexSub, 1);
                renderEditorPanels(); 
                showAlertM2(`Sub-Panel telah dipadam.`, 'info');
            }
        }
    }
    
    // --- Mengumpul Data dari DOM ke comicDataM2 ---
    function kumpulDataPanelDariDOM() {
        const newComicData = [];
        const panelUtamaElements = editorAreaM2.querySelectorAll('.panel-utama-card');

        panelUtamaElements.forEach((panelUtamaEl) => {
            const idPU = panelUtamaEl.dataset.idInternalPanelutama;
            const panelUtamaData = {
                idInternalPanel: idPU, 
                subpanel: []
            };
            const subPanelElements = panelUtamaEl.querySelectorAll('.sub-panel-card');
            subPanelElements.forEach((subPanelEl) => {
                const getInputValue = (selector) => {
                    const el = subPanelEl.querySelector(selector);
                    return el ? el.value.trim() : "";
                };
                const subPanelData = {
                    idInternalSubPanel: subPanelEl.dataset.idInternalSubpanel,
                    watak: getInputValue('.input-watak'),
                    aksi: getInputValue('.input-aksi'),
                    dialog: getInputValue('.input-dialog'),
                    sudut: getInputValue('.input-sudut'),
                    gaya: getInputValue('.input-gaya'),
                    penampilan: {
                        warna_pakaian: getInputValue('.input-penampilan-warna_pakaian'),
                        jenis_pakaian: getInputValue('.input-penampilan-jenis_pakaian'),
                        aksesori: getInputValue('.input-penampilan-aksesori'),
                        ekspresi_wajah: getInputValue('.input-penampilan-ekspresi_wajah'),
                        warna_kulit: getInputValue('.input-penampilan-warna_kulit'),
                        gaya_rambut: getInputValue('.input-penampilan-gaya_rambut')
                    }
                };
                panelUtamaData.subpanel.push(subPanelData);
            });
            newComicData.push(panelUtamaData);
        });
        comicDataM2 = newComicData; 
        // Tidak perlu log di sini kerana ia dipanggil setiap kali input berubah
    }

    // --- Logik Butang Utama Modul ---
    function handleSimpanDanKeModul3() {
        simpanProjekEkaKeLocalStorageM2(); 
        showAlertM2("Panel komik disimpan! Meneruskan ke Modul Jana Prompt AI...", "info");
        setTimeout(() => {
            window.location.href = '../terbitkan_komik/ai_terbit.html'; 
        }, 1500);
    }

    // --- Inisialisasi Modul 2 ---
    function initModul2() {
        if (btnTambahPanelUtamaM2) btnTambahPanelUtamaM2.addEventListener('click', handleTambahPanelUtamaM2);
        if (btnMuatNaikJsonEkaM2Trigger && inputMuatNaikJsonEkaM2) {
            btnMuatNaikJsonEkaM2Trigger.addEventListener('click', () => inputMuatNaikJsonEkaM2.click());
            inputMuatNaikJsonEkaM2.addEventListener('change', handleMuatNaikJsonEkaM2);
        }
        if (btnMuatTurunJsonEkaM2) btnMuatTurunJsonEkaM2.addEventListener('click', handleMuatTurunJsonEkaM2);
        if (btnKosongkanSemuaPanelUtamaM2) btnKosongkanSemuaPanelUtamaM2.addEventListener('click', handleKosongkanSemuaPanelUtamaM2);
        if (btnSimpanDanKeModul3) btnSimpanDanKeModul3.addEventListener('click', handleSimpanDanKeModul3);

        muatProjekEkaDariLocalStorageM2(); 
    }

    initModul2(); 
});
