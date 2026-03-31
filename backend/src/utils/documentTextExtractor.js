import path from 'path';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.csv', '.json']);

async function extractSingleFileText(file) {
  const extension = path.extname(file.originalname || '').toLowerCase();

  if (extension === '.pdf') {
    const parsed = await pdf(file.buffer);
    return parsed.text || '';
  }

  if (extension === '.docx') {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return parsed.value || '';
  }

  if (TEXT_EXTENSIONS.has(extension)) {
    return file.buffer.toString('utf8');
  }

  return '';
}

export async function extractTextFromFiles(files) {
  const extracted = [];

  for (const file of files) {
    const text = (await extractSingleFileText(file)).trim();
    if (!text) continue;

    extracted.push(`File: ${file.originalname}\n${text}`);
  }

  return extracted.join('\n\n---\n\n').trim();
}
