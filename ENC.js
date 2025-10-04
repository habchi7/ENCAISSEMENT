
(function() {
    'use strict';

    const stopTime = new Date("2025-10-01T18:48:00+01:00");

    if (new Date() >= stopTime) {
        console.log("⏹ Script");
        return; 
    }
  
/////////////////////////////////////////////////////////////////////////////////////
  
  
    const allowedModes = ["VIR", "CHQ", "LCR", "AUT"];
    // Function to extract C_8 data (main form)
function extractC8Data() {
    const container = document.querySelector('[lid="C_8"]');
    if (!container) return {};
    const numero = document.querySelector('input.s_sedit.s_f.s_nav_sedit_top[title*="Zone de recherche"]');
    const etablissement = container.querySelector('div[style*="top: 52px"][style*="left: 219px"] .s_dn');
    const clientCode = container.querySelector('div[style*="top: 52px"][style*="left: 496px"] .s_dn');
    const affaire = container.querySelector('div[style*="top: 80px"][style*="left: 219px"] .s_dn');
    const type = container.querySelector('div[style*="top: 109px"][style*="left: 219px"] .s_dn');
    const client = container.querySelector('div[style*="top: 52px"][style*="left: 587px"] .s_dn');
    const montant = container.querySelector('div[style*="top: 136px"][style*="left: 763px"] .s_dn');
    return {
        'Numero': numero ? numero.value.trim() : '',
        'Etablissement': etablissement?.textContent.trim() || '',
        'Client Code': clientCode?.textContent.trim() || '',
        'Affaire': affaire?.textContent.trim() || '',
        'Type recouvrement': type?.textContent.trim() || '',
        'Client': client?.textContent.trim() || '',
        'Montant': montant?.textContent.trim() || ''
    };
}
    // Function to extract C_9 data (summary section)
    function extractC9Data() {
        const container = document.querySelector('[lid="C_9"]');
        if (!container) return {};
        const totalFacture = container.querySelector('div[style*="top: 25px"][style*="left: 100px"] .s_dn');
        const totalRegle = container.querySelector('div[style*="top: 25px"][style*="left: 325px"] .s_dn');
        const solde = container.querySelector('div[style*="top: 26px"][style*="left: 552px"] .s_dn');
        return {
            'Total Facturé': totalFacture?.textContent.trim() || '',
            'Total Réglé': totalRegle?.textContent.trim() || '',
            'Solde': solde?.textContent.trim() || ''
        };
    }
    // Function to extract table data (page 2 - facture)
    function extractTableData() {
        const tbody = document.querySelector('tbody tr.selected');
        if (!tbody) return {};
        const cells = tbody.querySelectorAll('td');
        if (cells.length < 6) return {};
        const numeroFacture = cells[2]?.textContent.trim() || '';
        const montant = cells[3]?.textContent.trim() || '';
        return {
            'N° Facture': numeroFacture,
            'Montant Facture': montant
        };
    }
    // Helper function to check if a string represents a negative number
    function isNegativeAmount(amountStr) {
        if (!amountStr || !amountStr.trim()) return false;
        const cleanAmount = amountStr.replace(/\s/g, '').replace(',', '');
        return cleanAmount.startsWith('-') || cleanAmount.includes('(-)');
    }
    // Function to extract règlement data with negative amount filtering
    function extractReglementData() {
        const rows = document.querySelectorAll("table tbody tr");
        if (!rows.length) return [];
        let count = 0;
        const reglementData = [];
        rows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length === 4) {
                const mode = cells[1].innerText.trim();
                const montant = cells[3].innerText.trim();
                if (allowedModes.includes(mode) && !isNegativeAmount(montant)) {
                    count++;
                    reglementData.push({
                        num: count,
                        reference: cells[0].innerText.trim(),
                        mode: mode,
                        date: cells[2].innerText.trim(),
                        montant: montant
                    });
                }
            }
        });
        return reglementData;
    }
// Function to click on Facture item
function clickFacture() {
    const links = document.querySelectorAll('div.swt-tree-item.s_f.s_pr.popup-0 a.s_pr.s_db.content');
    const target = Array.from(links).find(a => a.textContent.trim() === "Facture");
    if (target) {
        target.click();
        console.log("✅ Clicked on 'Facture'");
        return true;
    } else {
        console.log("⏳ Facture item not found");
        return false;
    }
}
// Function to click on Règlement item
function clickReglement() {
    const links = document.querySelectorAll('div.swt-tree-item.s_f.s_pr.popup-0 a.s_pr.s_db.content');
    const target = Array.from(links).find(a => a.textContent.trim() === "Règlement");
    if (target) {
        target.click();
        console.log("✅ Clicked on 'Règlement'");
        return true;
    } else {
        console.log("⏳ Règlement item not found");
        return false;
    }
}
// Function to click on Général item
function clickGeneral() {
    const links = document.querySelectorAll('div.swt-tree-item.s_f.s_pr.popup-0 a.s_pr.s_db.content');
    const target = Array.from(links).find(a => a.textContent.trim() === "Général");
    if (target) {
        target.click();
        console.log("✅ Clicked on 'Général'");
        return true;
    } else {
        console.log("⏳ Général item not found");
        return false;
    }
}
    // Main execution function for data extraction
    function executeDataExtraction() {
        console.log("🔄 Step 0: Ensuring General page is loaded...");
        clickGeneral(); // Ensure we're on General page first

        setTimeout(() => {
            console.log("🔄 Step 1: Extracting General data...");
            const c8Data = extractC8Data();
            const c9Data = extractC9Data();
            console.log("🔄 Step 2: Clicking Facture...");
            const factureClicked = clickFacture();
            setTimeout(() => {
                console.log("🔄 Step 3: Extracting Facture data...");
                const tableData = extractTableData();
                console.log("🔄 Step 4: Clicking Règlement...");
                const reglementClicked = clickReglement();
                setTimeout(() => {
                    console.log("🔄 Step 5: Extracting Règlement data...");
                    const reglementData = extractReglementData();
                    console.log("📊 Generating final result...");
                    const result = createFinalResult(c8Data, c9Data, tableData, reglementData);
                    console.log("🔄 Step 6: Returning to General page...");
                    clickGeneral();
                    const progressElement = document.getElementById("progressContainer");
                    if (progressElement) {
                        progressElement.remove();
                        console.log("Progress container removed");
                    }
                    setTimeout(() => {
                        createPopupWithAutoFill(result, reglementData);
                    }, 500);
                }, 800);
            }, 800);
        }, 800);
    }
    // Function to create the final formatted result
    function createFinalResult(c8Data, c9Data, tableData, reglementData) {
        const resultLines = [];
        const c8Order = ['Numero', 'Etablissement', 'Client Code', 'Affaire', 'Type recouvrement', 'Client', 'Montant'];
        c8Order.forEach(key => {
            if (c8Data[key] && c8Data[key].trim()) {
                resultLines.push(`${key}: ${c8Data[key]}`);
            }
        });
        const c9Order = ['Total Facturé', 'Total Réglé', 'Solde'];
        c9Order.forEach(key => {
            if (c9Data[key] && c9Data[key].trim()) {
                resultLines.push(`${key}: ${c9Data[key]}`);
            }
        });
        const tableOrder = ['N° Facture', 'Montant Facture'];
        tableOrder.forEach(key => {
            if (tableData[key] && tableData[key].trim()) {
                resultLines.push(`${key}: ${tableData[key]}`);
            }
        });
        if (reglementData.length > 0) {
            resultLines.push("");
            reglementData.forEach(item => {
                resultLines.push(`Référence (${item.num}): ${item.reference}`);
                resultLines.push(`Mode (${item.num}): ${item.mode}`);
                resultLines.push(`Date (${item.num}): ${item.date}`);
                resultLines.push(`Montant règlement (${item.num}): ${item.montant}`);
            });
        }
        return resultLines.join('\n');
    }
    // Create and style button
    const button = document.createElement("button");
    button.textContent = "Comptabiliser l'encaissement";
    Object.assign(button.style, {
        padding: "0px 20px",
        background: "#ffffff",
        color: "#007e45",
        border: "none",
        borderRadius: "6px",
        fontWeight: "400",
        cursor: "pointer",
        textAlign: "center",
        marginTop: "10px",
        fontSize: "16px"
    });
    // Button click handler with debouncing
    let lastClickTime = 0;
    const clickDelay = 1000;
    button.addEventListener("click", async () => {
        const currentTime = Date.now();
        if (currentTime - lastClickTime < clickDelay) {
            console.log("Button click ignored: Please wait before clicking again.");
            return;
        }
        lastClickTime = currentTime;
        console.log("Comptabiliser button clicked");
        const progressContainer = document.createElement("div");
        progressContainer.id = "progressContainer";
        Object.assign(progressContainer.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: "10001",
            textAlign: "center"
        });
        progressContainer.innerHTML = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Line Loader — Bigger</title>
<style>
  body, html {
    height: 100%;
    margin: 0;
    display: grid;
    place-items: center;
    background: #f7f7f7;
  }
  .loader {
    position: relative;
    width: 300px;
    height: 9px;
    background: #ddd;
    overflow: hidden;
    border-radius: 6px;
  }
  .loader::before {
    content: "";
    position: absolute;
    top: 0;
    left: -50%;
    width: 50%;
    height: 100%;
    background: #0a754c;
    animation: moveRight 0.8s linear infinite;
  }
  @keyframes moveRight {
    0% { left: -50%; }
    100% { left: 100%; }
  }
</style>
</head>
<body>
  <div class="loader"></div>
</body>
</html>
        `;
        document.body.appendChild(progressContainer);

        // Ensure we're on General page before starting extraction
        console.log("🔄 Initializing: Ensuring General page is loaded...");
        clickGeneral();

        setTimeout(() => {
            executeDataExtraction();
        }, 200);
    });
    // Function to create popup with auto-filled form
    function createPopupWithAutoFill(extractedData, reglementData) {
        const dataLines = extractedData.split('\n').filter(line => line.trim());
        const dataMap = {};
        dataLines.forEach(line => {
            const [key, value] = line.split(': ');
            if (key && value) {
                dataMap[key.trim()] = value.trim();
            }
        });
        console.log('Extracted data map:', dataMap);
        let numberVirementOptions = '<option value="" disabled selected>Select Number virement</option>';
        if (reglementData.length > 0) {
            reglementData.forEach(item => {
                numberVirementOptions += `<option value="${item.num}">${item.num}</option>`;
            });
        } else {
            numberVirementOptions += '<option value="" disabled>No virements available</option>';
        }
        const popup = document.createElement("div");
        Object.assign(popup.style, {
            position: 'fixed',
            top: '50%',
            left: '85%',
            transform: 'translate(-50%, -50%)',
            background: '#2a2a2a',
            padding: '25px 25px 20px 25px',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.7)',
            zIndex: '10000',
            width: '400px',
            maxWidth: '90vw',
            height: '955px',
            minWidth: '300px',
            minHeight: '300px',
            fontFamily: "'Segoe UI', Tahoma, sans-serif",
            animation: 'slideInRight 0.3s ease forwards',
            overflow: 'hidden'
        });
        const scrollContainer = document.createElement("div");
        Object.assign(scrollContainer.style, {
            height: '100%',
            overflowY: 'scroll',
            overflowX: 'hidden',
            paddingRight: '0px',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE and Edge */
            /* Webkit browsers */
            WebkitOverflowScrolling: 'touch',
            '-webkit-overflow-scrolling': 'touch'
        });
        scrollContainer.id = "scrollContainer";
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
            from {
             transform: translate(100%, -50%);
              opacity: 0;
              }
           to {
              transform: translate(-50%, -50%);
             opacity: 1;
               }
             }
            #factureForm {
                display: flex;
                flex-direction: column;
                gap: 15px;
                padding-bottom: 10px;
            }
            #factureForm label {
                display: flex;
                flex-direction: column;
                font-size: 14px;
                color: #e0e0e0;
                font-weight: 500;
            }
            #factureForm input, #factureForm select {
                margin-top: 5px;
                padding: 10px;
                border: 1px solid #444;
                border-radius: 5px;
                font-size: 14px;
                background: #3a3a3a;
                color: #e0e0e0;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
                width: 100%;
            }
            #factureForm input:focus, #factureForm select:focus {
                outline: none;
                border-color: #1e90ff;
            }
            #saveBtn, #closeBtn {
                transition: all 0.3s ease;
                margin-top: 5px;
            }
            #saveBtn {
                background: #2e7d32;
                color: #e0e0e0;
            }
            #saveBtn:hover {
                background: #388e3c;
                transform: scale(1.02);
            }
            #closeBtn {
                background: #c62828;
                color: #e0e0e0;
            }
            #closeBtn:hover {
                background: #d32f2f;
                transform: scale(1.02);
            }
            #chequeFields {
                display: none;
                flex-direction: column;
                gap: 15px;
            }
            .button-container {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                margin-top: 5px;
                padding-top: 10px;
                border-top: 1px solid #444;
            }
            /* Enhanced scrollbar hiding for all browsers */
            #scrollContainer::-webkit-scrollbar {
                display: none;
                width: 0;
                height: 0;
            }
            #scrollContainer::-webkit-scrollbar-track {
                display: none;
                background: transparent;
            }
            #scrollContainer::-webkit-scrollbar-thumb {
                display: none;
                background: transparent;
            }
            #scrollContainer {
                -ms-overflow-style: none; /* Internet Explorer 10+ */
                scrollbar-width: none; /* Firefox */
                scroll-behavior: smooth;
            }
            /* Touch device scrolling enhancement */
            @media (hover: none) and (pointer: coarse) {
                #scrollContainer {
                    -webkit-overflow-scrolling: touch;
                }
            }
        `;
        document.head.appendChild(style);
        scrollContainer.innerHTML = `
            <form id="factureForm">
                <label>Établissement:
                    <select name="etablissement" required>
                        <option value="" disabled selected>Sélectionnez l'établissement</option>
                        <option value="CA">CA</option>
                        <option value="AG">AG</option>
                        <option value="SA">SA</option>
                        <option value="NA">NA</option>
                    </select>
                </label>
                <label>Type de recouvrement:
                    <select name="type_facture" required>
                        <option value="" disabled selected>Sélectionnez le type</option>
                        <option value="PROFORMA">PROFORMA</option>
                        <option value="DEFINITIVE">DEFINITIVE</option>
                    </select>
                </label>
                <label>Client:
                    <input type="text" name="client" required>
                </label>
                <label>Code:
                    <input type="text" name="code" required>
                </label>
                <label>Affaire:
                    <input type="text" name="affaire" required>
                </label>
                <label>N° Facture:
                    <input type="text" name="num_facture" required>
                </label>
                <label>Montant:
                    <input type="number" name="ttc" step="0.01" required>
                </label>
                <label>N° d'encaissement:
                    <select name="Sélectionner un encaissement" id="numberVirement" required>
                        ${numberVirementOptions}
                    </select>
                </label>
                <label>Mode d'encaissement:
                    <select name="type_encaissement" id="typeEncaissement" required>
                        <option value="" disabled selected>Sélectionnez le type de paiement</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Virement">Virement</option>
                    </select>
                </label>
                <div id="chequeFields">
                    <label>N° Cheque:
                        <input type="text" name="num_cheque" id="numCheque" placeholder="Seuls les chiffres sont autorisés">
                    </label>
                    <label>Date de chèque:
                        <input type="date" name="date_cheque">
                    </label>
                </div>
                <label>Date de virement/ Bordereau:
                    <input type="date" name="date_virement" required>
                </label>
                <label>Banque:
                    <select name="banque" required>
                        <option value="" disabled selected>Sélectionnez la banque</option>
                        <option value="BSO">BSO</option>
                        <option value="TSO">TSO</option>
                    </select>
                </label>
                <div class="button-container">
                    <button type="submit" id="saveBtn"
                        style="flex: 1; padding: 12px; border: none; border-Radius: 8px; cursor: pointer; background-color: #0a754c; font-size: 16px; font-weight: 500; font-family: Arial, sans-serif;">
                        Comptabiliser
                    </button>
                    <button type="button" id="closeBtn"
                        style="flex: 1; padding: 12px; border: none; border-Radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; font-family: Arial, sans-serif;">
                        Fermer
                    </button>
                </div>
            </form>
        `;
        popup.appendChild(scrollContainer);
        document.body.appendChild(popup);
        const form = scrollContainer.querySelector("#factureForm");
        function formatDateString(dateStr) {
            if (!dateStr || typeof dateStr !== 'string') return "";
            const parts = dateStr.split('/');
            if (parts.length !== 3) return "";
            const [day, month, year] = parts;
            const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
            return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0];
        }
        const typeRecouvrement = dataMap['Type recouvrement']?.toUpperCase() || '';
        const isProforma = typeRecouvrement.includes('PROFORMA');
        const isDefinitive = typeRecouvrement.includes('DEFINITIVE') || typeRecouvrement.includes('CAUTION') || typeRecouvrement.includes('ANNUELLE');
        const mappings = {
            etablissement: dataMap['Etablissement'] || '',
            client: dataMap['Client'] || '',
            code: dataMap['Client Code'] || '',
            affaire: dataMap['Affaire'] || '',
            num_facture: isDefinitive ? `${dataMap['N° Facture'] || ''}` : isProforma ? `${dataMap['Numero'] || ''}` : (dataMap['N° Facture'] || ''),
            ttc: dataMap['Montant règlement (1)'] || dataMap['Montant'] || '',
            num_cheque: dataMap['Référence (1)'] || '',
            date_virement: formatDateString(dataMap['Date (1)'] || ''),
            date_cheque: formatDateString(dataMap['Date (1)'] || '')
        };
        if (isProforma) {
            mappings.type_facture = 'PROFORMA';
        } else if (isDefinitive) {
            mappings.type_facture = 'DEFINITIVE';
        }
        console.log('Auto-fill mappings:', mappings);
        Object.entries(mappings).forEach(([name, value]) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input && value) {
                input.value = value;
                console.log(`Auto-filled ${name}: ${value}`);
            }
        });
        const numberVirementSelect = scrollContainer.querySelector("#numberVirement");
        const typeEncaissementSelect = scrollContainer.querySelector("#typeEncaissement");
        const chequeFields = scrollContainer.querySelector("#chequeFields");
        const numCheque = scrollContainer.querySelector("#numCheque");
        const dateCheque = scrollContainer.querySelector("input[name='date_cheque']");
        const dateVirement = scrollContainer.querySelector("input[name='date_virement']");
        const ttcInput = scrollContainer.querySelector("input[name='ttc']");
        function cleanChequeNumber() {
            if (numCheque) {
                const currentValue = numCheque.value;
                const cleanedValue = currentValue.replace(/[^0-9]/g, '');
                if (currentValue !== cleanedValue) {
                    numCheque.value = cleanedValue;
                    console.log(`Cleaned num_cheque: ${cleanedValue}`);
                }
            }
        }
        if (numCheque) {
            numCheque.addEventListener('input', cleanChequeNumber);
            numCheque.addEventListener('paste', function(e) {
                setTimeout(cleanChequeNumber, 0);
            });
        }
        function updateFieldsFromVirementNumber() {
            if (!numberVirementSelect || !reglementData) return;
            const selectedNum = parseInt(numberVirementSelect.value);
            if (isNaN(selectedNum) || selectedNum < 1 || selectedNum > reglementData.length) {
                console.log("Invalid virement number selected");
                return;
            }
            const selectedReglement = reglementData.find(item => item.num === selectedNum);
            if (!selectedReglement) return;
            console.log(`Updating fields for virement #${selectedNum}:`, selectedReglement);
            const mode = selectedReglement.mode;
            let newTypeEncaissement = 'Virement';
            if (mode === 'CHQ') {
                newTypeEncaissement = 'Cheque';
            }
            typeEncaissementSelect.value = newTypeEncaissement;
            console.log(`Updated type_encaissement to: ${newTypeEncaissement}`);
            if (numCheque) {
                const reference = selectedReglement.reference.replace(/[^0-9]/g, '');
                numCheque.value = reference;
                console.log(`Updated num_cheque to: ${reference}`);
            }
            const cleanMontant = selectedReglement.montant.replace(/\s/g, '').replace(',', '.');
            const montantNum = parseFloat(cleanMontant);
            ttcInput.value = isNaN(montantNum) ? '' : montantNum;
            console.log(`Updated ttc to: ${ttcInput.value}`);
            const formattedDate = formatDateString(selectedReglement.date);
            if (formattedDate) {
                if (newTypeEncaissement === 'Virement') {
                    dateVirement.value = formattedDate;
                    if (dateCheque) dateCheque.value = '';
                    if (numCheque) numCheque.value = '';
                    console.log(`Virement: Updated date_virement to: ${formattedDate}, cleared date_cheque and num_cheque`);
                } else if (newTypeEncaissement === 'Cheque') {
                    if (dateCheque) dateCheque.value = formattedDate;
                    dateVirement.value = '';
                    console.log(`Cheque: Updated date_cheque to: ${formattedDate}, cleared date_virement`);
                }
            }
            toggleChequeFields();
        }
        function toggleChequeFields() {
            if (typeEncaissementSelect && chequeFields && numCheque && dateCheque) {
                const isCheque = typeEncaissementSelect.value === "Cheque";
                if (isCheque) {
                    chequeFields.style.display = "flex";
                    numCheque.setAttribute("required", "");
                    dateCheque.setAttribute("required", "");
                    dateVirement.value = '';
                    console.log("Cheque selected: cleared date_virement");
                } else {
                    chequeFields.style.display = "none";
                    numCheque.removeAttribute("required");
                    dateCheque.removeAttribute("required");
                    numCheque.value = '';
                    dateCheque.value = '';
                    console.log("Virement selected: cleared num_cheque and date_cheque");
                }
                console.log(`Cheque fields ${isCheque ? "shown" : "hidden"}`);
            }
        }
        if (numberVirementSelect) {
            numberVirementSelect.addEventListener("change", updateFieldsFromVirementNumber);
            console.log("Added event listener for Number virement changes");
            if (reglementData.length > 0) {
                numberVirementSelect.value = '1';
                updateFieldsFromVirementNumber();
            }
        }
        if (typeEncaissementSelect) {
            typeEncaissementSelect.addEventListener("change", toggleChequeFields);
            toggleChequeFields();
        }
        scrollContainer.querySelector("#closeBtn").addEventListener("click", () => {

            console.log("Closing popup");
            setTimeout(() => {
                popup.remove();
            }, 500);
        });
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Form submitted");
            const data = Object.fromEntries(new FormData(e.target).entries());
            data.num_cheque = (data.num_cheque || "").replace(/[^0-9]/g, '');
            console.log("Form data:", data);
            const requiredFields = ['etablissement', 'type_facture', 'client', 'code', 'affaire', 'num_facture', 'ttc', 'type_encaissement', 'date_virement', 'banque'];
            if (data.type_encaissement === "Cheque") {
                requiredFields.push('num_cheque', 'date_cheque');
            }
            const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
            if (missingFields.length > 0) {
                console.error("Missing required fields:", missingFields);
                alert("Veuillez remplir tous les champs requis.");
                return;
            }
            function formatDate(dateStr) {
                const date = new Date(dateStr);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
            const headers = [
                "Etablissement", "DATE", "Journal", "Type de piece", "Compte general",
                "TIERS", "Libelle piece", "N° FACTURE", "Mode paiement", "Type ecriture",
                "MONTANT", "SENS", "Section analytique"
            ];
            const formattedTtc = data.ttc ? data.ttc.toString().replace('.', ',') : '';
            let rows = [];
            if (data.type_encaissement === "Virement") {
                const libellePiece = `VIRT RECU - ${data.client}/ FAC ${data.type_facture === 'DEFINITIVE' ? 'DF.' : data.type_facture === 'PROFORMA' ? 'PF.' : data.type_facture} N° ${data.num_facture} - AFF: ${data.affaire}`;
                const accountCode = data.type_facture === 'DEFINITIVE' ? '342100' : '442100';
                const bankAccount = data.banque === 'BSO' ? '514110' : data.banque === 'TSO' ? '514301' : '514121';
                const formattedDateVirement = formatDate(data.date_virement);
                rows = [
                    [
                        `${data.etablissement}`, `${formattedDateVirement}`, `${data.banque}`, `OD`, `${bankAccount}`,
                        ``, `${libellePiece}`, `${data.num_facture}`, ``, `0`,
                        `${formattedTtc}`, `D`, ``
                    ],
                    [
                        `${data.etablissement}`, `${formattedDateVirement}`, `${data.banque}`, `OD`, `${accountCode}`,
                        `${data.code}`, `${libellePiece}`, `${data.num_facture}`, ``, `X`,
                        `${formattedTtc}`, `C`, ``
                    ]
                ];
            } else if (data.type_encaissement === "Cheque") {
                const libellePiece1 = `CH. N°${data.num_cheque} - FAC ${data.type_facture === 'DEFINITIVE' ? 'DF.' : data.type_facture === 'PROFORMA' ? 'PF.' : data.type_facture} N° ${data.num_facture} ${data.client}// AFF: ${data.affaire}`;
                const libellePiece2 = `VERST/ CH. N°${data.num_cheque} - FAC ${data.type_facture === 'DEFINITIVE' ? 'DF' : data.type_facture === 'PROFORMA' ? 'PF' : data.type_facture} N°${data.num_facture} ${data.client}// AFF: ${data.affaire}`;
                const accountCode = data.type_facture === 'DEFINITIVE' ? '342100' : '442100';
                const bankAccount = data.banque === 'BSO' ? '514110' : data.banque === 'TSO' ? '514301' : '514121';
                const NFT = `VERST/ ${data.num_facture}`;
                const formattedDateVirement = formatDate(data.date_virement);
                const formattedDateCheque = formatDate(data.date_cheque);
                rows = [
                    [
                        `${data.etablissement}`, `${formattedDateVirement}`, `${data.banque}`, `OD`, `${bankAccount}`,
                        ``, `${libellePiece1}`, `${data.num_facture}`, ``, `0`,
                        `${formattedTtc}`, `D`, ``
                    ],
                    [
                        `${data.etablissement}`, `${formattedDateVirement}`, `${data.banque}`, `OD`, `511500`,
                        ``, `${libellePiece1}`, `${data.num_facture}`, ``, `0`,
                        `${formattedTtc}`, `C`, ``
                    ],
                    [
                        `${data.etablissement}`, `${formattedDateVirement}`, `CAE`, `OD`, `511500`,
                        ``, `${libellePiece2}`, `${NFT}`, ``, `0`,
                        `${formattedTtc}`, `D`, ``
                    ],
                    [
                        `${data.etablissement}`, `${formattedDateVirement}`, `CAE`, `OD`, `511100`,
                        ``, `${libellePiece2}`, `${NFT}`, ``, `0`,
                        `${formattedTtc}`, `C`, ``
                    ],
                    [
                        `${data.etablissement}`, `${formattedDateCheque}`, `CAE`, `OD`, `511100`,
                        ``, `${libellePiece1}`, `${data.num_facture}`, ``, `0`,
                        `${formattedTtc}`, `D`, ``
                    ],
                    [
                        `${data.etablissement}`, `${formattedDateCheque}`, `CAE`, `OD`, `${accountCode}`,
                        `${data.code}`, `${libellePiece1}`, `${data.num_facture}`, ``, `X`,
                        `${formattedTtc}`, `C`, ``
                    ]
                ];
            }
            const csvContent = [
                '\uFEFF' + headers.join(";"),
                ...rows.map(row => row.join(";"))
            ].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const fileName = `ENC ${data.num_facture}.csv`;
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            console.log("Initiating CSV download:", fileName);
            link.click();
            URL.revokeObjectURL(link.href);
            console.log("Simulating F3 key press");
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'F3',
                code: 'F3',
                keyCode: 114,
                which: 114,
                bubbles: true,
                cancelable: true
            }));

            setTimeout(() => {
                console.log("Executing delayed actions");
                const inputElement = document.querySelector('input[tabindex="1"][type="text"][autocomplete="off"][class="s_edit_input swtFontEdit"][maxlength="32"]');
                const anchorElement = document.querySelector('a[class="s_ns swt-speed-button s_f s_pa"][style="top: 111px; left: 774px; width: 20px; height: 19px; line-height: 19px;"]');
                if (inputElement) {
                    inputElement.focus();
                    inputElement.value = "Importation des écritures comptables & analytiques";
                    console.log("Input value set:", inputElement.value);
                    const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    });
                    inputElement.dispatchEvent(enterEvent);
                    console.log("Enter key event dispatched");
                } else {
                    console.error("Input element not found");
                }
                if (anchorElement) {
                    anchorElement.click();
                    console.log("Anchor element clicked");
                } else {
                    console.error("Anchor element not found");
                }
                popup.remove();
            }, 1000);
        });
    }
    // Insert button into table
    function insertButton() {
        const table = document.querySelector('table.s_pr.swt-tf.swt-vt.s_db');
        if (!table) {
            console.warn("Table not found for button insertion.");
            return false;
        }
        const lastCell = table.querySelector('tr:first-child td.last') || table.querySelector('tr:first-child td:last-child');
        if (lastCell && !lastCell.contains(button)) {
            lastCell.appendChild(button);
            console.log('✅ Button added inside table.');
            return true;
        }
        return false;
    }
    // Check every 500ms until span is found and button is inserted
    const interval = setInterval(() => {
        const spans = document.querySelectorAll('span.s_ns.caption-text');
        let conditionMet = false;
        spans.forEach(span => {
            if (span.textContent.includes("SBP - Fiche de recouvrement Globale")) {
                conditionMet = true;
            }
        });
        if (conditionMet && insertButton()) {
            clearInterval(interval);
        }
    }, 500);
  
/////////////////////////////////////////////////////////////////////////////////////
  
    console.log("✅ Script");
})();
