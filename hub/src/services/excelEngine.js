/**
 * OfficeAIM Library & Loan Tracker - Excel Engine (SheetJS)
 * Multi-sheet export with Resumen sheet + genre sheets + XLSX import parsing
 */

import * as XLSX from 'xlsx';

/**
 * Export library inventory to a multi-sheet .xlsx workbook
 */
export function exportLibraryToExcel(books, customGenres = []) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. Calculate Summary (Resumen) KPIs
  const totalBooks = books.length;
  const totalLoaned = books.filter((b) => b.status === 'prestado').length;
  const totalUnclassified = books.filter((b) => b.genre === 'Sin clasificar' || !b.genre).length;
  const totalIlegible = books.filter(
    (b) => (b.title || '').includes('[ilegible]') || (b.author || '').includes('[ilegible]')
  ).length;

  // Count by genre
  const genreCounts = {};
  books.forEach((b) => {
    const g = b.genre || 'Sin clasificar';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });

  // Prepare Resumen Sheet Data
  const resumenRows = [
    ['REPORTE DE INVENTARIO - OFFICEAIM LIBRARY & LOAN TRACKER'],
    ['Fecha de Exportación:', dateStr],
    [],
    ['RESUMEN GENERAL (KPIs)'],
    ['Métrica', 'Valor'],
    ['Total de Libros en Inventario', totalBooks],
    ['Actualmente Prestados', totalLoaned],
    ['Sin Clasificar (Pendientes de Revisión)', totalUnclassified],
    ['Registros con Texto [ilegible]', totalIlegible],
    [],
    ['DISTRIBUCIÓN POR GÉNERO'],
    ['Género', 'Cantidad de Libros'],
  ];

  Object.entries(genreCounts).forEach(([genre, count]) => {
    resumenRows.push([genre, count]);
  });

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
  wsResumen['!cols'] = [{ wch: 45 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // 2. Create individual sheets per Genre
  const genresInUse = Array.from(new Set(books.map((b) => b.genre || 'Sin clasificar')));

  // Ensure "Sin clasificar" comes first if present
  genresInUse.sort((a, b) => {
    if (a === 'Sin clasificar') return -1;
    if (b === 'Sin clasificar') return 1;
    return a.localeCompare(b);
  });

  genresInUse.forEach((genre) => {
    const genreBooks = books.filter((b) => (b.genre || 'Sin clasificar') === genre);

    const sheetRows = [
      ['Genre', 'Titel', 'Schrijver (Last, First)', 'Uitgeleend aan', 'Uitleendatum', 'Estado', 'Notas AI / Estado OCR'],
    ];

    genreBooks.forEach((b) => {
      let aiNote = '';
      if ((b.title || '').includes('[ilegible]') || (b.author || '').includes('[ilegible]')) {
        aiNote = '⚠️ REVISIÓN REQUERIDA: Contiene campos [ilegible]';
      } else if (b.genre === 'Sin clasificar') {
        aiNote = '⚠️ Género sin clasificar';
      }

      sheetRows.push([
        b.genre || 'Sin clasificar',
        b.title || '[ilegible]',
        b.author || '[ilegible]',
        b.borrower || '',
        b.loan_date || '',
        b.status === 'prestado' ? 'Prestado' : 'Disponible',
        aiNote,
      ]);
    });

    const wsGenre = XLSX.utils.aoa_to_sheet(sheetRows);

    // Auto-fit column widths
    wsGenre['!cols'] = [
      { wch: 22 }, // Genre
      { wch: 35 }, // Title
      { wch: 30 }, // Author
      { wch: 25 }, // Borrower
      { wch: 15 }, // Loan date
      { wch: 15 }, // Status
      { wch: 45 }, // AI Notes
    ];

    // Sheet names in Excel cannot exceed 31 chars and cannot contain invalid chars \ / ? * : [ ]
    let cleanSheetName = genre.replace(/[\\/?*:[\]]/g, '').substring(0, 30);
    if (!cleanSheetName) cleanSheetName = 'Género';

    // If sheet name already exists, append number
    let sheetNameFinal = cleanSheetName;
    let counter = 1;
    while (wb.SheetNames.includes(sheetNameFinal)) {
      sheetNameFinal = `${cleanSheetName.substring(0, 27)}_${counter}`;
      counter++;
    }

    XLSX.utils.book_append_sheet(wb, wsGenre, sheetNameFinal);
  });

  // Write and trigger browser download
  XLSX.writeFile(wb, `OfficeAIM_Biblioteca_Inventario_${dateStr}.xlsx`);
}

/**
 * Parse an uploaded .xlsx or .xls file and extract book records
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const importedBooks = [];

        workbook.SheetNames.forEach((sheetName) => {
          if (sheetName === 'Resumen') return; // Skip summary sheet

          const sheet = workbook.Sheets[sheetName];
          const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          if (jsonRows.length <= 1) return;

          // Find header row indices
          const headerRow = jsonRows[0] || [];
          let titleIdx = 1;
          let authorIdx = 2;
          let genreIdx = 0;
          let borrowerIdx = 3;
          let loanDateIdx = 4;
          let statusIdx = 5;

          headerRow.forEach((col, idx) => {
            const colStr = String(col || '').toLowerCase();
            if (colStr.includes('titel') || colStr.includes('título') || colStr.includes('title')) titleIdx = idx;
            if (colStr.includes('schrijver') || colStr.includes('autor') || colStr.includes('author')) authorIdx = idx;
            if (colStr.includes('genre') || colStr.includes('género')) genreIdx = idx;
            if (colStr.includes('uitgeleend') || colStr.includes('prestado a') || colStr.includes('borrower')) borrowerIdx = idx;
            if (colStr.includes('uitleendatum') || colStr.includes('fecha')) loanDateIdx = idx;
            if (colStr.includes('estado') || colStr.includes('status')) statusIdx = idx;
          });

          // Process rows
          for (let i = 1; i < jsonRows.length; i++) {
            const row = jsonRows[i];
            if (!row || row.length === 0) continue;

            const title = String(row[titleIdx] || '').trim();
            const author = String(row[authorIdx] || '').trim();
            if (!title && !author) continue; // skip empty rows

            const genre = String(row[genreIdx] || sheetName || 'Sin clasificar').trim();
            const borrower = String(row[borrowerIdx] || '').trim();
            const loanDate = String(row[loanDateIdx] || '').trim();
            const statusRaw = String(row[statusIdx] || '').toLowerCase();
            const status = statusRaw.includes('prestado') || borrower ? 'prestado' : 'disponible';

            importedBooks.push({
              id: `imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              title: title || '[ilegible]',
              author: author || '[ilegible]',
              genre: genre || 'Sin clasificar',
              status,
              borrower,
              loan_date: loanDate,
              imported_from_excel: true,
            });
          }
        });

        resolve(importedBooks);
      } catch (err) {
        reject(new Error(`Error al leer el archivo Excel: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Error al abrir el archivo.'));
    reader.readAsArrayBuffer(file);
  });
}
