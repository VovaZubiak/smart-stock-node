// @ts-ignore
import html2pdf from 'html2pdf.js';

export const generateStockReportPDF = async (products: any[]) => {
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="padding: 20px; font-family: 'Arial', sans-serif; color: #000; background: #FFF;">
      <h1 style="text-align: center; color: #333; margin-bottom: 5px;">ЗВІТ ПРО ЗАЛИШКИ НА СКЛАДІ</h1>
      <p style="text-align: center; color: #666; margin-top: 0; margin-bottom: 20px;">
        Дата формування: ${new Date().toLocaleString('uk-UA')}
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">ID</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Назва товару</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Артикул (SKU)</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Категорія</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Залишок</th>
          </tr>
        </thead>
        <tbody>
          ${products.map((p: any) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.id}</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${p.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.sku}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.category?.name || 'Без категорії'}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: ${p.current_quantity <= p.min_threshold ? 'red' : 'green'}; font-weight: bold;">
                ${p.current_quantity} шт.
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

const opt = {
    margin:       10,
    filename:     `Stock_Report_${new Date().toISOString().slice(0,10)}.pdf`,
    image:        { type: 'jpeg' as 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
  };

  await html2pdf().set(opt).from(element).save();
};