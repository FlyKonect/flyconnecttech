import { checkFile, cleanFileName, MAX_FILE_BYTES } from './upload-rules.js';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const PDF = Buffer.from('%PDF-1.7\n');
const ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0]);
const EXE = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);

const file = (name: string, head: Buffer, browserType = '', size = 1000) =>
  checkFile({ name, browserType, size, head });

describe('checkFile', () => {
  it('accepts the allowed kinds and stores our own type', () => {
    expect(file('report-totals.png', PNG, 'image/png')).toEqual({
      ok: true,
      contentType: 'image/png',
      fileName: 'report-totals.png',
    });
    expect(file('invoice.PDF', PDF, 'application/pdf')).toMatchObject({
      ok: true,
      contentType: 'application/pdf',
    });
    expect(
      file('commission-report-oct.xlsx', ZIP, 'application/octet-stream'),
    ).toMatchObject({
      ok: true,
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    expect(
      file(
        'bookings.csv',
        Buffer.from('a,b\n1,2\n'),
        'application/vnd.ms-excel',
      ),
    ).toMatchObject({ ok: true, contentType: 'text/csv' });
  });

  it('refuses a program renamed to look like a picture', () => {
    expect(file('photo.png', EXE, 'image/png')).toEqual({
      ok: false,
      reason: 'the file does not look like a PNG file',
    });
  });

  it('refuses a file whose browser type does not fit its name', () => {
    expect(file('photo.png', PNG, 'text/html').ok).toBe(false);
  });

  it('refuses other kinds of file', () => {
    for (const name of [
      'setup.exe',
      'page.html',
      'image.svg',
      'script.js',
      'noextension',
    ]) {
      expect(file(name, Buffer.from('hello'))).toEqual({
        ok: false,
        reason: 'this type of file is not accepted',
      });
    }
  });

  it('refuses empty and too large files', () => {
    expect(file('a.png', PNG, 'image/png', 0).ok).toBe(false);
    expect(file('a.png', PNG, 'image/png', MAX_FILE_BYTES + 1)).toEqual({
      ok: false,
      reason: 'the file is larger than 10 MB',
    });
  });

  it('refuses a text file with binary content', () => {
    expect(file('notes.txt', Buffer.from([0x41, 0x00, 0x42])).ok).toBe(false);
  });
});

describe('cleanFileName', () => {
  it('drops folders and odd characters, keeps the extension', () => {
    expect(cleanFileName('C:\\Users\\sarah\\report.pdf')).toBe('report.pdf');
    expect(cleanFileName('../../etc/passwd.txt')).toBe('passwd.txt');
    expect(cleanFileName('a"b\u0007.png')).toBe('ab.png');
    const long = `${'x'.repeat(300)}.xlsx`;
    expect(cleanFileName(long)).toHaveLength(200);
    expect(cleanFileName(long).endsWith('.xlsx')).toBe(true);
  });
});
