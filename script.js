function generateBarcodes() {
    const inputCodes = document.getElementById('inputCodes').value.split('\n');
    const barcodeContainer = document.getElementById('barcodeContainer');
    barcodeContainer.innerHTML = '';

    inputCodes.forEach((code, index) => {
        if (code.trim() !== '') {
            const barcodeItem = document.createElement('div');
            barcodeItem.className = 'barcode-item';

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            barcodeItem.appendChild(svg);

            const codeText = document.createElement('p');
            codeText.textContent = code;
            barcodeItem.appendChild(codeText);

            barcodeContainer.appendChild(barcodeItem);

            JsBarcode(svg, code, {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: false
            });
        }
    });
}