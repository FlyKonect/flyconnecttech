import { csvCell, toCsv } from './csv.js';

describe('CSV downloads', () => {
  it('quotes every cell and doubles quotes', () => {
    expect(csvCell('Payment "times out", again')).toBe(
      '"Payment ""times out"", again"',
    );
    expect(csvCell(null)).toBe('""');
    expect(csvCell(3)).toBe('"3"');
  });

  it('never lets a spreadsheet run a cell as a formula', () => {
    expect(csvCell('=HYPERLINK("http://x")')).toBe(
      '"\'=HYPERLINK(""http://x"")"',
    );
    expect(csvCell('+44 20 7946 0321')).toBe('"\'+44 20 7946 0321"');
    expect(csvCell('@sum')).toBe('"\'@sum"');
  });

  it('starts with a byte order mark and ends each line with CRLF', () => {
    const csv = toCsv(['Code', 'Title'], [['TKT-1', 'Café £5']]);
    expect(csv.startsWith('﻿"Code","Title"\r\n')).toBe(true);
    expect(csv.endsWith('"TKT-1","Café £5"\r\n')).toBe(true);
  });
});
