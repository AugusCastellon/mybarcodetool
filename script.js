function getFormattedDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const month = months[now.getMonth()];
  const year = String(now.getFullYear()).slice(-2);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year}  ${hours}:${minutes}`;
}

function generateBarcodes() {
  const inputCodes = document.getElementById("inputCodes").value.split("\n");
  const barcodeContainer = document.getElementById("barcodeContainer");
  barcodeContainer.innerHTML = "";

  inputCodes.forEach((code, index) => {
    if (code.trim() !== "") {
      const barcodeItem = document.createElement("div");
      barcodeItem.className = "barcode-item";

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      barcodeItem.appendChild(svg);

      const codeText = document.createElement("p");
      codeText.textContent = code;
      barcodeItem.appendChild(codeText);

      barcodeContainer.appendChild(barcodeItem);

      JsBarcode(svg, code, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: false,
      });
    }
  });
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Define grid layout
  const cols = 3;
  const rows = 10;
  const marginX = 10;
  const marginY = 15;
  const barcodeWidth = (pageWidth - marginX * 2) / cols;
  const barcodeHeight = (pageHeight - marginY * 2) / rows;

  // Get all barcodes
  const barcodes = document.querySelectorAll(".barcode-item");
  let currentPage = 1;

  // Get current date time string
  const dateTimeStr = getFormattedDateTime();

  // Add header text to first page
  doc.setFontSize(10);
  doc.text(dateTimeStr, marginX, 10);

  barcodes.forEach((barcode, index) => {
    const col = index % cols;
    const row = Math.floor((index % (cols * rows)) / cols);
    const x = marginX + col * barcodeWidth;
    const y = marginY + row * barcodeHeight;

    // If we've filled a page, add a new one
    if (index > 0 && index % (cols * rows) === 0) {
      doc.addPage();
      currentPage++;
      // Add header text to new page
      doc.setFontSize(10);
      doc.text(dateTimeStr, marginX, 10);
    }

    // Convert SVG to data URL
    const svg = barcode.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const DOMURL = window.URL || window.webkitURL || window;
    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = canvas.toDataURL("image/png");

      // Add barcode image
      doc.addImage(imgData, "PNG", x, y, barcodeWidth - 5, 20);

      // Add text below barcode
      const code = barcode.querySelector("p").textContent;
      doc.setFontSize(10);
      doc.text(code, x + 20, y + 22, { maxWidth: barcodeWidth - 100 });

      DOMURL.revokeObjectURL(url);

      // If this is the last barcode, save the PDF
      if (index === barcodes.length - 1) {
        // Add footer text to last page
        doc.text(dateTimeStr, marginX, pageHeight - 10);
        doc.save("barcodes.pdf");
      }
    };
    img.src = url;
  });
}
