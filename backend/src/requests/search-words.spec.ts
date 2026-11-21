import { fullTextQuery } from './search-words.js';

describe('the request search words', () => {
  it('needs every word, each as the start of a word', () => {
    expect(fullTextQuery('Hotel pric')).toBe('+hotel* +pric*');
  });

  it("drops the full-text index's own signs and short words", () => {
    expect(fullTextQuery('"payment" -page (on) @mobile')).toBe(
      '+payment* +page* +mobile*',
    );
    expect(fullTextQuery('a b')).toBeNull();
  });
});
