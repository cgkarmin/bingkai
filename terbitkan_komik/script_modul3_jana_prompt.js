// terbitkan_komik/script_modul3_jana_prompt.js
// (atau modul3_jana_prompt/script_modul3_jana_prompt.js jika anda namakan semula folder)
// Skrip untuk Modul 3: Jana Prompt AI

document.addEventListener('DOMContentLoaded', () => {
    console.log("M3: DOMContentLoaded - Skrip Modul 3 (Jana Prompt) dimulakan.");

    // --- Rujukan Elemen DOM Utama ---
    const tajukProjekAktifDisplayM3 = document.getElementById('tajukProjekAktifDisplayM3');
    const pilihanGayaPromptM3 = document.getElementById('pilihanGayaPromptM3');
    const inputKataKunciTambahanM3 = document.getElementById('inputKataKunciTambahanM3');
    const btnJanaSemuaPromptM3 = document.getElementById('btnJanaSemuaPromptM3');
    const loadingIndicatorM3 = document.getElementById('loadingIndicatorM3');
    const summaryPanelDataM3 = document.getElementById('summaryPanelDataM3');
    const promptDisplayAreaM3 = document.getElementById('promptDisplayAreaM3');
    const placeholderPromptsM3 = document.getElementById('placeholderPromptsM3');

    const btnMuatTurunSemuaPromptTxtM3 = document.getElementById('btnMuatTurunSemuaPromptTxtM3');
    const inputMuatNaikJsonEkaM3 = document.getElementById('inputMuatNaikJsonEkaM3');
    const btnMuatNaikJsonEkaM3Trigger = document.getElementById('btnMuatNaikJsonEkaM3Trigger');
    const btnMuatTurunJsonEkaM3 = document.getElementById('btnMuatTurunJsonEkaM3');

    // --- Pemboleh Ubah Global ---
    let projekDataEkaSemasa = {};
    let comicDataM3 = []; // Ini akan diisi dari senaraiPanel dari JSON
    let senaraiWatakM3 = [];
    let generatedPromptsList = [];

    const LOCAL_STORAGE_KEY_EKA = 'projekBCPS_DataLengkap';

    // --- Fungsi Bantuan ---
    function showAlertM3(message, type = 'info') {
        // Gunakan body sebagai container tetap untuk alert
        const alertContainer = document.body;
        if (!alertContainer) { console.warn("M3: Alert container (body) tidak ditemui."); return; }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        // Gunakan position fixed untuk alert di atas
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.left = 'auto'; // Pastikan ia di kanan
        alertDiv.style.zIndex = "2099"; // Z-index tinggi untuk pastikan ia di atas
        alertDiv.style.maxWidth = '400px'; // Hadkan lebar
        alertDiv.style.wordWrap = 'break-word'; // Pastikan teks wrap
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

        // Buang alert sebelumnya jika ada untuk mengelak bertindan
        const existingAlert = document.querySelector('.alert.fixed-top-m3-alert');
        if (existingAlert) existingAlert.remove();

        alertDiv.classList.add('fixed-top-m3-alert'); // Tambah kelas pengenal
        alertContainer.appendChild(alertDiv); // Tambah alert ke body

        // Auto-tutup alert selepas 5 saat
        setTimeout(() => {
            if (alertDiv && alertDiv.parentElement) {
                // Guna Bootstrap's Alert API jika ada, jika tidak, buang manual
                const bsAlert = (typeof bootstrap !== 'undefined' && bootstrap.Alert) ? bootstrap.Alert.getInstance(alertDiv) : null;
                if (bsAlert) bsAlert.close(); else if (alertDiv.parentElement) alertDiv.remove();
            }
        }, 5000);
    }


    function downloadFileM3(filename, content, type) {
        const blob = new Blob([content], { type });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // --- Pengurusan Projek "JSON Eka" ---
    function muatProjekEkaDariLocalStorageM3() {
        console.log("M3: muatProjekEkaDariLocalStorageM3() bermula.");
        const dataString = localStorage.getItem(LOCAL_STORAGE_KEY_EKA);
        let projectLoaded = false;
        if (dataString) {
            try {
                projekDataEkaSemasa = JSON.parse(dataString);
                // Fallbacks - pastikan kunci wujud, tetapkan nilai lalai jika tiada
                projekDataEkaSemasa.versiProjek = projekDataEkaSemasa.versiProjek || "1.0"; // Tetapkan versi default jika tiada
                projekDataEkaSemasa.idProjekUnik = projekDataEkaSemasa.idProjekUnik || `proj_tanpa_unik_${Date.now()}`; // ID default jika tiada
                projekDataEkaSemasa.infoKomik = projekDataEkaSemasa.infoKomik || { tajukProjek: "Projek Tanpa Tajuk (Dimuatkan)", genreUtama: "Tidak Dinyatakan", sinopsisRingkasProjek: "", catatanBCJunior: "" };
                projekDataEkaSemasa.senaraiWatak = projekDataEkaSemasa.senaraiWatak || [];
                 // *** PEMBETULAN: Guna 'senaraiPanel' dari JSON untuk data panel Modul 3 ***
                projekDataEkaSemasa.senaraiPanel = projekDataEkaSemasa.senaraiPanel || []; // Pastikan senaraiPanel wujud

                // projekDataEkaSemasa.comicData = projekDataEkaSemasa.comicData || []; // Kunci 'comicData' mungkin untuk modul lain, tidak digunakan untuk data panel di M3
                // projekDataEkaSemasa.drafCeritaAsasBCJunior = projekDataEkaSemasa.drafCeritaAsasBCJunior || []; // Kunci ini juga ada di M1/M2

                // Salin data ke pemboleh ubah spesifik M3
                comicDataM3 = projekDataEkaSemasa.senaraiPanel; // <--- UBAH: Ambil data panel dari senaraiPanel
                senaraiWatakM3 = projekDataEkaSemasa.senaraiWatak;
                projectLoaded = true; // Boleh buang jika tidak digunakan
                console.log("M3: Data projek dimuatkan dari localStorage.", {projekDataEkaSemasa, comicDataM3, senaraiWatakM3}); // Log data yang dimuat
            } catch (error) {
                console.error("M3: Ralat memuat JSON Eka dari localStorage:", error);
                showAlertM3("Gagal memuat data projek dari penyimpanan tempatan. Sila pastikan data projek sah.", "danger");
                inisialisasiDataKosongM3(); // Mulakan dengan data kosong jika ralat
            }
        } else {
            // Jika tiada data dalam localStorage
            showAlertM3("Tiada data projek sedia ada. Sila mulakan dari Modul 1 atau buka fail projek.", "warning");
            inisialisasiDataKosongM3(); // Mulakan dengan data kosong
        }

        // Kemaskini UI dengan data yang dimuatkan
        if (tajukProjekAktifDisplayM3) {
            tajukProjekAktifDisplayM3.innerHTML = `Projek Aktif: <strong>${projekDataEkaSemasa.infoKomik.tajukProjek || "Belum Bertajuk"}</strong>`;
        }
        updateSummaryPanelData(); // Kemaskini ringkasan panel
        // Tetapkan keadaan awal kawasan prompt
        if (placeholderPromptsM3) placeholderPromptsM3.style.display = 'block';
        if (promptDisplayAreaM3) promptDisplayAreaM3.innerHTML = ''; // Kosongkan kawasan paparan prompt
        if (btnMuatTurunSemuaPromptTxtM3) btnMuatTurunSemuaPromptTxtM3.style.display = 'none'; // Sembunyikan butang muat turun prompt awal

        generatedPromptsList = []; // Kosongkan senarai prompt yang dijana sebelumnya
    }

    function inisialisasiDataKosongM3() {
        projekDataEkaSemasa = {
            versiProjek: "1.0",
            idProjekUnik: `proj_baru_${Date.now()}`,
            infoKomik: { tajukProjek: "Projek Baru", genreUtama: "", sinopsisRingkasProjek: "", catatanBCJunior: "" },
            senaraiWatak: [],
            senaraiPanel: [], // Guna senaraiPanel untuk konsisten
            // comicData: [], // Boleh buang jika tidak digunakan di M3
            // drafCeritaAsasBCJunior: [], // Boleh buang jika tidak digunakan di M3
            metadataLain: { tarikhDicipta: new Date().toISOString(), tarikhKemasKiniTerakhir: new Date().toISOString() }
        };
        comicDataM3 = projekDataEkaSemasa.senaraiPanel; // Pastikan tetap merujuk senaraiPanel
        senaraiWatakM3 = projekDataEkaSemasa.senaraiWatak;
        console.warn("M3: Inisialisasi projekDataEkaSemasa kosong.");
    }

    function updateSummaryPanelData() {
        if (summaryPanelDataM3) {
            // Mengira panel dari comicDataM3 (yang kini sepatutnya senaraiPanel)
            const totalMainPanels = comicDataM3 ? comicDataM3.length : 0;
            let totalSubPanels = 0;
            // Pastikan comicDataM3 adalah array dan setiap item ada subpanel sebelum loop
            if(comicDataM3 && Array.isArray(comicDataM3)){
                comicDataM3.forEach(panel => { // Loop melalui panel utama (item dalam senaraiPanel)
                    if (panel && panel.subpanel && Array.isArray(panel.subpanel)) { // Semak subpanel di dalam panel utama
                        totalSubPanels += panel.subpanel.length;
                    }
                });
            }
            summaryPanelDataM3.textContent = `Data dimuatkan: ${totalMainPanels} Panel Utama, ${totalSubPanels} Sub-Panel.`;

            // Kemaskini placeholder berdasarkan jumlah sub-panel
            if (placeholderPromptsM3) {
                 if (totalSubPanels === 0) {
                    placeholderPromptsM3.textContent = "Tiada sub-panel dalam projek ini untuk menjana prompt.";
                    placeholderPromptsM3.style.display = 'block';
                } else if (generatedPromptsList.length === 0) { // Hanya tunjuk jika belum ada prompt dijana dan ada sub-panel
                    placeholderPromptsM3.textContent = "Sila klik butang \"Jana Prompt\" untuk memulakan penjanaan.";
                    placeholderPromptsM3.style.display = 'block';
                } else {
                     placeholderPromptsM3.style.display = 'none'; // Sembunyikan jika prompt sudah dijana
                }
            }
        }
    }


    function handleMuatNaikJsonEkaM3(event) {
        const file = event.target.files[0];
        if (!file) return; // Keluar jika tiada fail dipilih

        if (file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dataDimuat = JSON.parse(e.target.result);
                    // *** PEMBETULAN: Semakan pengesahan struktur menggunakan 'senaraiPanel' ***
                    // Semak kunci utama yang diperlukan untuk Modul 3
                    if (dataDimuat && dataDimuat.infoKomik && Array.isArray(dataDimuat.senaraiWatak) &&
                        // Semak 'senaraiPanel' kerana ini yang diperlukan untuk data panel di Modul 3
                        Array.isArray(dataDimuat.senaraiPanel) && dataDimuat.idProjekUnik) {

                        console.log("M3: Struktur fail JSON Eka yang dimuat naik disahkan.", dataDimuat); // Log fail yang berjaya dimuat

                        // Simpan data yang sah ke localStorage (ini akan menimpa data sedia ada)
                        localStorage.setItem(LOCAL_STORAGE_KEY_EKA, JSON.stringify(dataDimuat));

                        // Muat semula data ke dalam pemboleh ubah M3 dari localStorage (fungsi ini kini sudah dibetulkan untuk baca senaraiPanel)
                        muatProjekEkaDariLocalStorageM3();

                        // Beri maklum balas kepada pengguna
                        showAlertM3(`Projek "${dataDimuat.infoKomik?.tajukProjek || dataDimuat.idProjekUnik}" berjaya dimuat naik dan ditetapkan sebagai projek aktif.`, "success");

                    } else {
                         // Mesej ralat yang lebih tepat jika struktur tidak sesuai untuk Modul 3
                        throw new Error("Struktur fail JSON Eka tidak sah atau tidak lengkap untuk Modul 3 (perlukan infoKomik, senaraiWatak [Array], senaraiPanel [Array], idProjekUnik).");
                    }
                } catch (error) {
                    // Kendalikan ralat parsing JSON atau ralat struktur
                    showAlertM3(`Ralat memproses fail JSON Eka: ${error.message}`, "danger");
                    console.error("M3: Ralat memproses fail JSON Eka yang dimuat naik:", error);
                    // Anda mungkin ingin memuat semula data sedia ada dari localStorage jika fail baru rosak
                    muatProjekEkaDariLocalStorageM3(); // Cuba muat data sebelumnya jika ada
                }
            };
            reader.onerror = () => showAlertM3("Gagal membaca fail.", "danger");
            reader.readAsText(file); // Baca fail sebagai teks
        } else {
            // Jika fail bukan .json
            showAlertM3("Sila muat naik fail .json sahaja.", "warning");
        }
        // Reset input file supaya acara 'change' berfungsi jika fail yang sama dipilih lagi
        if(inputMuatNaikJsonEkaM3) inputMuatNaikJsonEkaM3.value = "";
    }


    function handleMuatTurunJsonEkaM3() {
        // Pastikan ada data projek aktif sebelum muat turun
        if (!projekDataEkaSemasa || !projekDataEkaSemasa.idProjekUnik) {
            showAlertM3("Tiada data projek aktif untuk dimuat turun.", "warning");
            return;
        }
         // Kemaskini tarikh kemaskini terakhir sebelum muat turun
        if (!projekDataEkaSemasa.metadataLain) {
             projekDataEkaSemasa.metadataLain = {};
        }
        projekDataEkaSemasa.metadataLain.tarikhKemasKiniTerakhir = new Date().toISOString();

        // Tentukan nama fail berdasarkan tajuk projek atau ID unik
        const filename = `BCPS_ProjekPenuh_${(projekDataEkaSemasa.infoKomik?.tajukProjek || projekDataEkaSemasa.idProjekUnik || "TanpaTajuk").replace(/[^a-z0-9]/gi, '_')}.json`;

        // Muat turun objek projekDataEkaSemasa secara keseluruhan
        // Ini memastikan struktur lengkap (termasuk senaraiPanel, senaraiWatak, dll.) disimpan
        downloadFileM3(filename, JSON.stringify(projekDataEkaSemasa, null, 2), "application/json");
        showAlertM3("Projek berjaya dimuat turun.", "success");
    }


    // --- Logik Penjanaan Prompt AI ---
    function generateAllPrompts() {
        console.log("M3: generateAllPrompts() dipanggil.");
        // Semakan kini menggunakan comicDataM3 yang sepatutnya diisi dari senaraiPanel
        // Jika comicDataM3 kosong atau bukan array, atau tiada sub-panel di dalamnya, hentikan penjanaan
        if (!projekDataEkaSemasa || !comicDataM3 || !Array.isArray(comicDataM3) || comicDataM3.length === 0 ||
             !comicDataM3.some(panel => panel && panel.subpanel && Array.isArray(panel.subpanel) && panel.subpanel.length > 0)) {

            showAlertM3("Tiada data sub-panel yang sah dalam projek ini untuk menjana prompt.", "warning");
            updateSummaryPanelData(); // Panggil semula untuk kemaskini placeholder jika kosong
            // Kosongkan paparan dan senarai prompt jika tiada data
            if (promptDisplayAreaM3) promptDisplayAreaM3.innerHTML = '';
            generatedPromptsList = [];
            if (btnMuatTurunSemuaPromptTxtM3) btnMuatTurunSemuaPromptTxtM3.style.display = 'none';
            return;
        }

        if (loadingIndicatorM3) loadingIndicatorM3.style.display = 'block';
        if (placeholderPromptsM3) placeholderPromptsM3.style.display = 'none';
        if (promptDisplayAreaM3) promptDisplayAreaM3.innerHTML = ''; // Kosongkan kawasan paparan sedia ada
        generatedPromptsList = []; // Reset senarai prompt yang akan dijana

        const gayaGlobal = pilihanGayaPromptM3 ? pilihanGayaPromptM3.value.trim() : "";
        const kataKunciGlobal = inputKataKunciTambahanM3 ? inputKataKunciTambahanM3.value.trim() : "";

         // Guna setTimeout kecil untuk biarkan UI kemaskini (loading indicator) sebelum proses berat
         // Proses penjanaan prompt boleh mengambil sedikit masa bergantung pada jumlah sub-panel
        setTimeout(() => {
            try {
                // Loop melalui comicDataM3 (yang kini adalah projekDataEkaSemasa.senaraiPanel)
                comicDataM3.forEach((panelUtama, indexPU) => {
                    // Semak jika 'panelUtama' (yang sebenarnya objek panel utama dari senaraiPanel) mempunyai array 'subpanel'
                    if (panelUtama && panelUtama.subpanel && Array.isArray(panelUtama.subpanel)) { // Semak objek panel dan array subpanel
                        // Loop melalui sub-panel di dalam setiap panel utama
                        panelUtama.subpanel.forEach((subPanel, indexSP) => {
                            let promptParts = [];

                            // 1. Tambah gaya (spesifik sub-panel atau global)
                            if (subPanel.gaya?.trim()) promptParts.push(`${subPanel.gaya.trim()}.`);
                            else if (gayaGlobal) promptParts.push(`${gayaGlobal}.`);
                            else promptParts.push("Comic panel art style."); // Gaya lalai jika tiada

                            // 2. Tambah sudut pandangan
                            if (subPanel.sudut?.trim()) promptParts.push(`${subPanel.sudut.trim()} shot of`); // Ubah "of" sahaja kepada "shot of"
                            else promptParts.push("Scene of"); // Sudut lalai

                            // 3. Tambah perincian watak yang ada dalam sub-panel
                            let watakDeskripsiGabungan = [];
                            if (subPanel.watak?.trim()) {
                                // Pisahkan nama watak jika ada banyak (contoh: "Watak A, Watak B") dan buang spasi/kosong
                                const namaWatakDalamPanel = subPanel.watak.split(',').map(n => n.trim()).filter(n => n !== '');

                                // Untuk setiap nama watak dalam panel ini...
                                namaWatakDalamPanel.forEach(namaWatak => {
                                    // Cari objek watak yang sepadan dalam senaraiWatakM3
                                    const watakObj = senaraiWatakM3.find(w => w.namaWatak === namaWatak);
                                    let deskripsiPenampilanIndividu = [namaWatak]; // Mulakan dengan nama watak

                                    // Jika objek watak ditemui dan ada perincian penampilan visual umum...
                                    if (watakObj && watakObj.penampilanVisual) {
                                        const penampilanPanel = subPanel.penampilan || {}; // Penampilan spesifik panel (jika ada)
                                        const penampilanUmum = watakObj.penampilanVisual; // Penampilan umum dari profil watak

                                        // Gabungkan perincian penampilan, utamakan dari sub-panel jika ada
                                        const pakaian = penampilanPanel.jenis_pakaian?.trim() || penampilanUmum.pakaianLazim?.trim();
                                        if (pakaian) deskripsiPenampilanIndividu.push(`wearing ${pakaian}`);

                                        // Warna pakaian (hanya ambil dari panel jika ada, atau dari umum jika tiada di panel)
                                        const warnaPakaianPanel = penampilanPanel.warna_pakaian?.trim();
                                         const warnaPakaianUmum = penampilanUmum.warnaPakaian?.trim(); // Anda mungkin perlu tambah kunci ini di JSON watak
                                         if (warnaPakaianPanel && pakaian) deskripsiPenampilanIndividu.push(`(${warnaPakaianPanel} color)`);
                                         else if (warnaPakaianUmum && pakaian) deskripsiPenampilanIndividu.push(`(${warnaPakaianUmum} color)`); // Guna warna umum jika tiada panel


                                        const warnaKulit = penampilanPanel.warna_kulit?.trim() || penampilanUmum.warnaKulit?.trim();
                                        if (warnaKulit) deskripsiPenampilanIndividu.push(`${warnaKulit} skin`);

                                        const gayaRambut = penampilanPanel.gaya_rambut?.trim() || penampilanUmum.gayaRambut?.trim(); // Semak nama kunci gaya rambut umum di JSON watak
                                         const warnaRambutUmum = penampilanUmum.warnaRambut?.trim(); // Semak nama kunci warna rambut umum
                                        if (gayaRambut) {
                                             let rambutDeskripsi = gayaRambut;
                                             if(warnaRambutUmum && !gayaRambut.includes(warnaRambutUmum)) rambutDeskripsi = `${warnaRambutUmum} ${gayaRambut}`; // Gabung warna & gaya jika warna ada & belum termasuk
                                             deskripsiPenampilanIndividu.push(`with ${rambutDeskripsi} hair`);
                                        }


                                        const aksesori = penampilanPanel.aksesori?.trim() || penampilanUmum.aksesoriKhas?.trim();
                                        if (aksesori) deskripsiPenampilanIndividu.push(`with ${aksesori}`);
                                    }
                                     // Tambahkan deskripsi watak ini ke senarai gabungan
                                    // Pastikan deskripsi individu tidak hanya nama jika tiada detail lain
                                    if(deskripsiPenampilanIndividu.length > 1 || (deskripsiPenampilanIndividu.length === 1 && namaWatak)){
                                         watakDeskripsiGabungan.push(deskripsiPenampilanIndividu.join(' ')); // Gabung perincian watak dengan spasi
                                    }
                                });
                                // Gabungkan semua deskripsi watak dalam panel ini dengan 'and'
                                if(watakDeskripsiGabungan.length > 0) {
                                     promptParts.push(watakDeskripsiGabungan.join(' and '));
                                } else {
                                     // Kalau tiada watak dikenalpasti atau data watak kosong, guna deskripsi umum 'a scene'
                                     promptParts.push("a scene");
                                }

                            } else {
                                // Jika tiada watak dinyatakan dalam sub-panel
                                promptParts.push("a scene");
                            }

                            // 4. Tambah aksi
                            if (subPanel.aksi?.trim()) promptParts.push(`${subPanel.aksi.trim()}.`);
                            else promptParts.push("."); // Titik jika tiada aksi

                            // 5. Tambah ekspresi wajah (spesifik panel atau umum watak utama)
                            const ekspresiWajahPanel = subPanel.penampilan?.ekspresi_wajah?.trim();
                            // Cari watak utama yang pertama dalam senarai panel
                            const watakUtamaNama = subPanel.watak?.split(',')[0]?.trim(); // Gunakan optional chaining & semak item pertama
                            const watakUtamaObj = watakUtamaNama ? senaraiWatakM3.find(w => w.namaWatak === watakUtamaNama) : null; // Cari watak jika nama ada
                            const ekspresiUmum = watakUtamaObj?.penampilanVisual?.ekspresiWajahTipikal?.trim(); // Gunakan optional chaining
                            // Utamakan ekspresi dari panel, jika tiada guna ekspresi umum
                            const ekspresiFinal = ekspresiWajahPanel || ekspresiUmum;
                            if (ekspresiFinal) promptParts.push(`Facial expression: ${ekspresiFinal}.`);

                            // 6. Tambah dialog sebagai konteks
                            if (subPanel.dialog?.trim()) promptParts.push(`(Dialogue context: "${subPanel.dialog.trim()}").`);

                            // 7. Tambah kata kunci global
                            if (kataKunciGlobal) {
                                promptParts.push(kataKunciGlobal.endsWith('.') ? kataKunciGlobal : `${kataKunciGlobal}.`);
                            }

                            // Gabungkan semua bahagian prompt, bersihkan spasi berlebihan dan titik berganda
                            let finalPrompt = promptParts.join(' ').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();

                            // Simpan prompt yang dijana
                            generatedPromptsList.push({
                                panelUtamaIndex: indexPU,
                                subPanelIndex: indexSP,
                                prompt: finalPrompt
                            });
                        });
                    } else {
                         // Jika panel utama tidak mempunyai subpanel yang sah, log amaran
                         console.warn(`M3: Panel Utama #${indexPU + 1} tidak mempunyai sub-panel yang sah. Prompt tidak dijana untuk panel ini.`, panelUtama);
                    }
                });

                // Paparkan prompt yang dijana jika ada
                 if (generatedPromptsList.length > 0) {
                    displayGeneratedPrompts();
                    showAlertM3(`Berjaya menjana ${generatedPromptsList.length} prompt AI.`, "success");
                 } else {
                     // Jika loop selesai tapi tiada prompt dijana (mungkin tiada sub-panel dalam mana-mana panel utama)
                     showAlertM3("Tiada prompt dijana. Pastikan data projek mempunyai sub-panel yang sah.", "warning");
                     if (placeholderPromptsM3) {
                         placeholderPromptsM3.textContent = "Tiada prompt dijana. Pastikan data projek mempunyai sub-panel yang sah.";
                         placeholderPromptsM3.style.display = 'block';
                     }
                 }


            } catch (error) {
                // Kendalikan sebarang ralat semasa proses penjanaan
                showAlertM3(`Ralat semasa menjana prompt: ${error.message}`, "danger");
                console.error("M3: Ralat penjanaan prompt:", error);
                 if (promptDisplayAreaM3) promptDisplayAreaM3.innerHTML = ''; // Kosongkan paparan
                if (placeholderPromptsM3) {
                    placeholderPromptsM3.style.display = 'block';
                    placeholderPromptsM3.textContent = "Gagal menjana prompt. Sila periksa konsol (F12) untuk butiran ralat.";
                }
                generatedPromptsList = []; // Kosongkan senarai jika gagal
            } finally {
                // Sembunyikan indikator loading dan tunjukkan butang muat turun jika ada prompt
                if (loadingIndicatorM3) loadingIndicatorM3.style.display = 'none';
                if (btnMuatTurunSemuaPromptTxtM3) btnMuatTurunSemuaPromptTxtM3.style.display = generatedPromptsList.length > 0 ? 'inline-block' : 'none';
            }
        }, 50); // Jeda kecil sebelum mula proses
    }

    // --- Memaparkan Prompt yang Dijana ---
    function displayGeneratedPrompts() {
        if (!promptDisplayAreaM3) return; // Keluar jika kawasan paparan tidak ditemui

        promptDisplayAreaM3.innerHTML = ''; // Kosongkan paparan sedia ada
        if (placeholderPromptsM3) placeholderPromptsM3.style.display = 'none'; // Sembunyikan placeholder

        // Jika tiada prompt dijana, paparkan mesej (sepatutnya sudah dikendalikan di generateAllPrompts/updateSummaryPanelData, tapi cek lagi)
        if (generatedPromptsList.length === 0) {
             if (placeholderPromptsM3) {
                placeholderPromptsM3.textContent = "Tiada prompt dijana."; // Mesej lalai jika kosong
                placeholderPromptsM3.style.display = 'block';
            }
            if (btnMuatTurunSemuaPromptTxtM3) btnMuatTurunSemuaPromptTxtM3.style.display = 'none';
            return;
        }

        // Loop melalui senarai prompt yang dijana dan paparkan setiap satu
        generatedPromptsList.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header d-flex justify-content-between align-items-center';
            cardHeader.innerHTML = `
                <span>Panel Utama #${p.panelUtamaIndex + 1}, Sub-Panel #${p.subPanelIndex + 1}</span>
                <button class="btn btn-sm btn-outline-light btn-copy-promptM3" title="Salin Prompt">
                    <i class="bi bi-clipboard"></i> Salin
                </button>
            `;
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            const promptTextarea = document.createElement('textarea'); // Guna textarea untuk prompt
            promptTextarea.readOnly = true; // Jadikan read-only
            promptTextarea.value = p.prompt; // Tetapkan nilai prompt
            // Tetapkan bilangan baris berdasarkan panjang prompt, minimum 4 baris
            promptTextarea.rows = Math.max(4, Math.ceil(p.prompt.length / 70));

            cardBody.appendChild(promptTextarea); // Tambah textarea ke body kad
            card.appendChild(cardHeader); // Tambah header ke kad
            card.appendChild(cardBody); // Tambah body ke kad
            promptDisplayAreaM3.appendChild(card); // Tambah kad ke kawasan paparan

            // Tambah event listener untuk butang salin pada butang yang baru dibuat
            const copyButton = cardHeader.querySelector('.btn-copy-promptM3');
            if (copyButton) {
                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(p.prompt) // Salin prompt ke clipboard
                        .then(() => {
                            // Beri maklum balas visual kepada pengguna
                            copyButton.innerHTML = '<i class="bi bi-check-lg"></i> Disalin!';
                            setTimeout(() => { copyButton.innerHTML = '<i class="bi bi-clipboard"></i> Salin'; }, 2000); // Kembali ke teks asal
                        })
                        .catch(err => {
                            // Kendalikan ralat jika salin gagal (contoh: tidak di https, kebenaran tidak diberi)
                            showAlertM3('Gagal menyalin prompt. Pastikan aplikasi berjalan di persekitaran yang selamat (cth. https).', 'danger');
                            console.error("M3: Gagal menyalin prompt:", err);
                        });
                });
            }
        });

         // Pastikan butang muat turun kelihatan jika ada prompt
         if (btnMuatTurunSemuaPromptTxtM3) btnMuatTurunSemuaPromptTxtM3.style.display = generatedPromptsList.length > 0 ? 'inline-block' : 'none';

    }


    // --- Fungsi Muat Turun Semua Prompt (.txt) ---
    function handleMuatTurunSemuaPromptTxtM3() {
        if (generatedPromptsList.length === 0) {
            showAlertM3("Tiada prompt untuk dimuat turun.", "warning");
            return;
        }
        // Bina kandungan fail teks dari senarai prompt
        let fileContent = `Senarai Prompt AI untuk Projek: ${projekDataEkaSemasa.infoKomik?.tajukProjek || projekDataEkaSemasa.idProjekUnik || 'Tanpa Tajuk'}\n`; // Guna optional chaining
        fileContent += `Tarikh Dijana: ${new Date().toLocaleString('ms-MY')}\n\n`;

        generatedPromptsList.forEach(p => {
            fileContent += `--- Panel Utama #${p.panelUtamaIndex + 1}, Sub-Panel #${p.subPanelIndex + 1} ---\n`;
            fileContent += `${p.prompt}\n\n`;
        });

        // Tentukan nama fail dan muat turun
        const filename = `PromptsAI_${(projekDataEkaSemasa.infoKomik?.tajukProjek || projekDataEkaSemasa.idProjekUnik || "Projek").replace(/[^a-z0-9]/gi, '_')}.txt`; // Guna optional chaining
        downloadFileM3(filename, fileContent.trim(), "text/plain;charset=utf-8;");
        showAlertM3("Fail prompt berjaya dimuat turun.", "success");
    }


    // --- Inisialisasi Modul 3 ---
    function initModul3() {
        // Tambah event listeners kepada butang dan input
        if (btnJanaSemuaPromptM3) {
             console.log("M3: Menambah event listener untuk butang Jana Prompt.");
            btnJanaSemuaPromptM3.addEventListener('click', generateAllPrompts);
        }
        if (btnMuatTurunSemuaPromptTxtM3) btnMuatTurunSemuaPromptTxtM3.addEventListener('click', handleMuatTurunSemuaPromptTxtM3);

        if (btnMuatNaikJsonEkaM3Trigger && inputMuatNaikJsonEkaM3) {
            btnMuatNaikJsonEkaM3Trigger.addEventListener('click', () => inputMuatNaikJsonEkaM3.click());
            inputMuatNaikJsonEkaM3.addEventListener('change', handleMuatNaikJsonEkaM3);
        }
        if (btnMuatTurunJsonEkaM3) btnMuatTurunJsonEkaM3.addEventListener('click', handleMuatTurunJsonEkaM3);

        // Muatkan data projek semasa DOM sudah sedia
        muatProjekEkaDariLocalStorageM3();
    }

    // Mulakan inisialisasi modul
    initModul3();
});