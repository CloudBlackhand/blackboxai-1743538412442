const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

async function generatePdf(content) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load a standard font
  const font = await pdfDoc.embedFont('Helvetica');

  // Add a new page
  const page = pdfDoc.addPage([595, 842]); // A4 size in points

  // Draw the document content
  page.drawText(content, {
    x: 50,
    y: 800,
    size: 12,
    font,
    color: rgb(0, 0, 0),
    maxWidth: 500
  });

  // Add signature placeholder
  page.drawText('Assinatura Eletrônica:', {
    x: 50,
    y: 100,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5)
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}

module.exports = {
  generatePdf
};