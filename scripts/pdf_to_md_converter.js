const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

// Configuration
const sourceDir = path.join(__dirname, '../Gemas/_originals_pdf');
const outputDir = path.join(__dirname, '../Gemas');

/**
 * Fixes spaced-out text often found in PDF headers (e.g., "O F F I C E A I M" -> "OFFICEAIM")
 * Looks for sequences of single uppercase letters separated by single spaces.
 */
function compactSpacedText(text) {
    // Match 3+ uppercase letters each separated by exactly one space
    return text.replace(/(?:[A-Z]\s){2,}[A-Z]/g, (match) => {
        return match.replace(/\s/g, '');
    });
}

function cleanText(text) {
    // First compact spaced headers
    let result = compactSpacedText(text);
    // Remove form feed / page break markers
    result = result.replace(/\f/g, '\n---\n');
    // Remove lone page numbers
    result = result.replace(/^\s*\d+\s*$/gm, '');
    // Normalize multiple blank lines to max 2
    result = result.replace(/\n{3,}/g, '\n\n');
    // Trim trailing whitespace per line
    result = result.split('\n').map(l => l.trimEnd()).join('\n').trim();
    return result;
}

function pdfToText(filePath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1); // raw text mode

        pdfParser.on('pdfParser_dataError', (errData) => {
            reject(new Error(errData.parserError));
        });

        pdfParser.on('pdfParser_dataReady', (pdfData) => {
            const text = pdfParser.getRawTextContent();
            resolve({ text, pages: pdfData.Pages ? pdfData.Pages.length : 0 });
        });

        pdfParser.loadPDF(filePath);
    });
}

async function convertPdfs() {
    console.log('🚀 Starting PDF to Markdown conversion with Header Fix...');
    console.log(`📂 Source:  ${sourceDir}`);
    console.log(`📂 Output:  ${outputDir}\n`);

    const files = fs.readdirSync(sourceDir);
    const pdfFiles = files.filter(f => path.extname(f).toLowerCase() === '.pdf');

    if (pdfFiles.length === 0) {
        console.log('⚠️  No PDF files found.');
        return;
    }

    console.log(`Found ${pdfFiles.length} PDF files.\n`);
    let success = 0, failed = 0;

    for (const file of pdfFiles) {
        const filePath = path.join(sourceDir, file);
        const baseName = file.replace(/\.pdf$/i, '');
        process.stdout.write(`📄 Converting: ${file}... `);

        try {
            const { text, pages } = await pdfToText(filePath);
            const cleaned = cleanText(text);
            const md = `# ${baseName}\n\n${cleaned}\n`;
            const outPath = path.join(outputDir, baseName + '.md');
            fs.writeFileSync(outPath, md, 'utf8');
            const kb = (Buffer.byteLength(md, 'utf8') / 1024).toFixed(1);
            console.log(`✅ Saved and Formatted: ${baseName}.md (${pages}p, ${kb}KB)`);
            success++;
        } catch (err) {
            console.log(`❌ FAILED: ${err.message}`);
            failed++;
        }
    }

    console.log(`\n✨ All files converted and headers compacted successfully!`);
    console.log(`   ✅ ${success} formatted | ❌ ${failed} failed`);
    console.log(`📂 Location: ${outputDir}`);
}

convertPdfs().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
