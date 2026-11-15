import {
  isWebAddress,
  linkSchema,
  testimonialSchema,
} from './website-rules.js';

describe('the live-project link', () => {
  it('takes full web addresses only', () => {
    expect(isWebAddress('https://dev.flyconnect.co.uk')).toBe(true);
    expect(isWebAddress('http://flyconnect.co.uk/booking')).toBe(true);
    expect(isWebAddress('dev.flyconnect.co.uk')).toBe(false);
    expect(isWebAddress('javascript:alert(1)')).toBe(false);
    expect(isWebAddress('https://localhost')).toBe(false);
    expect(isWebAddress('')).toBe(false);
  });

  it('says how to fix a bad one', () => {
    const result = linkSchema.safeParse({ liveProjectUrl: 'flyconnect' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Enter a full web address starting with https://',
    );
  });
});

describe('a testimonial', () => {
  const valid = {
    quote: '  They rebuilt our booking site in six weeks.  ',
    name: 'Sarah Mitchell',
    role: '',
    company: 'Bluewave Holidays',
    showOnHome: true,
    showOnCaseStudy: false,
  };

  it('trims the words and saves empty optional ones as nothing', () => {
    expect(testimonialSchema.parse(valid)).toEqual({
      quote: 'They rebuilt our booking site in six weeks.',
      name: 'Sarah Mitchell',
      role: null,
      company: 'Bluewave Holidays',
      showOnHome: true,
      showOnCaseStudy: false,
    });
  });

  it('needs a quote and a name, and keeps the quote short', () => {
    const messages = (input: object) =>
      testimonialSchema
        .safeParse({ ...valid, ...input })
        .error?.issues.map((issue) => issue.message);
    expect(messages({ quote: ' ' })).toEqual(['Write the quote']);
    expect(messages({ name: '' })).toEqual(["Enter the client's name"]);
    expect(messages({ quote: 'x'.repeat(401) })).toEqual([
      'Keep this under 400 characters',
    ]);
  });
});
