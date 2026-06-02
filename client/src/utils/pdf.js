import html2pdf from 'html2pdf.js';

/**
 * Export the report view as a PDF document.
 * @param {string} elementId - The DOM element ID to capture (not used; we use .report-main)
 * @param {string} tokenName - Token name for the filename
 */
export async function exportReportAsPDF(elementId, tokenName = 'Token') {
  // Target the main report content area
  const element = document.querySelector('.report-main');
  if (!element) {
    console.error('[KONET] PDF export: Could not find .report-main element');
    return;
  }

  const date = new Date().toISOString().split('T')[0];
  const safeName = tokenName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `KONET_Report_${safeName}_${date}.pdf`;

  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#060B14',
      logging: false,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('[KONET] PDF export error:', err);
    throw err;
  }
}
