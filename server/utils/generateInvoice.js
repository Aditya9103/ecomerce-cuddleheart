const PDFDocument = require('pdfkit');

/**
 * Generates an invoice PDF stream
 * @param {Object} order - The populated Order object
 * @param {Object} storeSettings - Store Settings
 * @param {Object} dataCallback - Function to call when data chunks are available
 * @param {Object} endCallback - Function to call when stream ends
 */
const generateInvoice = (order, storeSettings, dataCallback, endCallback) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  generateHeader(doc, storeSettings, order);
  generateCustomerInformation(doc, order);
  generateInvoiceTable(doc, order);
  generateFooter(doc);

  doc.end();
};

function generateHeader(doc, storeSettings, order) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text(storeSettings?.storeName || 'Cuddle Hearts', 50, 57)
    .fontSize(10)
    .text(storeSettings?.address || '', 50, 80)
    .text(`Email: ${storeSettings?.contactEmail || ''}`, 50, 95)
    .text(`Phone: ${storeSettings?.contactPhone || ''}`, 50, 110)
    .moveDown();

  doc
    .fontSize(20)
    .text('TAX INVOICE', 400, 50, { align: 'right' })
    .fontSize(10)
    .text(`Invoice Number: INV-${order._id.toString().slice(-6).toUpperCase()}`, 400, 75, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' })
    .moveDown();
    
  doc.moveTo(50, 140).lineTo(550, 140).stroke();
}

function generateCustomerInformation(doc, order) {
  doc.fillColor('#444444').fontSize(12).text('Bill To & Ship To:', 50, 160);

  doc
    .fontSize(10)
    .text(order.shippingAddress.fullName || '', 50, 180)
    .text(order.shippingAddress.flatHouse || '', 50, 195)
    .text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.pincode || ''}`, 50, 210)
    .text(`Phone: ${order.shippingAddress.phone || ''}`, 50, 225)
    .moveDown();
    
  doc.moveTo(50, 250).lineTo(550, 250).stroke();
}

function generateTableRow(doc, y, item, quantity, unitPrice, total) {
  doc
    .fontSize(10)
    .text(item, 50, y, { width: 250 })
    .text(quantity, 320, y, { width: 50, align: 'center' })
    .text(unitPrice, 400, y, { width: 70, align: 'right' })
    .text(total, 480, y, { width: 70, align: 'right' });
}

function generateInvoiceTable(doc, order) {
  let i;
  const invoiceTableTop = 280;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item',
    'Quantity',
    'Unit Price',
    'Total'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  let position = invoiceTableTop + 30;

  for (i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    generateTableRow(
      doc,
      position,
      item.name,
      item.quantity,
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${(item.price * item.quantity).toFixed(2)}`
    );

    generateHr(doc, position + 20);
    position += 30;
    
    // Page break logic if too many items
    if (position > 700) {
      doc.addPage();
      position = 50;
    }
  }

  // Summary
  const summaryTop = position + 10;
  
  doc.font('Helvetica-Bold');
  
  doc.text('Subtotal:', 350, summaryTop, { width: 120, align: 'right' });
  doc.text(`Rs. ${order.subtotal.toFixed(2)}`, 480, summaryTop, { width: 70, align: 'right' });
  
  doc.text('Shipping:', 350, summaryTop + 20, { width: 120, align: 'right' });
  doc.text(`Rs. ${order.shippingFee.toFixed(2)}`, 480, summaryTop + 20, { width: 70, align: 'right' });
  
  if (order.discount > 0) {
    doc.text(`Discount (${order.couponCode || 'Promo'}):`, 350, summaryTop + 40, { width: 120, align: 'right' });
    doc.text(`-Rs. ${order.discount.toFixed(2)}`, 480, summaryTop + 40, { width: 70, align: 'right' });
  }

  const taxTop = order.discount > 0 ? summaryTop + 60 : summaryTop + 40;
  
  doc.fontSize(12);
  doc.text('Final Total:', 350, taxTop, { width: 120, align: 'right' });
  doc.text(`Rs. ${order.totalAmount.toFixed(2)}`, 480, taxTop, { width: 70, align: 'right' });
  
  doc.fontSize(10).font('Helvetica');
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      'Payment is due within 15 days. Thank you for your business.',
      50,
      780,
      { align: 'center', width: 500 }
    );
}

function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

module.exports = { generateInvoice };
