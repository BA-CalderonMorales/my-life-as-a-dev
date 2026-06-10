import { describe, expect, test } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import vm from 'node:vm';

function createParser() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://ba-calderonmorales.github.io/my-life-as-a-dev/projects/',
  });
  const code = fs.readFileSync('docs/assets/js/chat-widget/lib/message-parser.js', 'utf8');
  const sandbox = {
    window: dom.window,
    document: dom.window.document,
    module: { exports: {} },
    exports: {},
    console,
    URL: dom.window.URL,
  };
  vm.runInNewContext(code, sandbox);
  return new sandbox.module.exports();
}

describe('MessageParser response formatting', () => {
  test('preserves nested bullet indentation', () => {
    const parser = createParser();
    const html = parser.parse([
      '- Project work',
      '  - Terminal Jarvis',
      '    - CLI orchestration',
      '- Writing',
    ].join('\n'));

    const dom = new JSDOM(html);
    const nestedLists = dom.window.document.querySelectorAll('ul.ai-chat-list ul.ai-chat-list');

    expect(nestedLists.length).toBe(2);
    expect(dom.window.document.body.textContent).toContain('CLI orchestration');
  });

  test('renders markdown horizontal rules as separators', () => {
    const parser = createParser();
    const html = parser.parse('Summary\n\n---\n\nDetails');
    const dom = new JSDOM(html);

    expect(dom.window.document.querySelectorAll('hr.ai-chat-separator')).toHaveLength(1);
    expect(dom.window.document.body.textContent).toContain('Summary');
    expect(dom.window.document.body.textContent).toContain('Details');
  });

  test('only renders trusted URLs as clickable links', () => {
    const parser = createParser();
    const html = parser.parse(
      'Trusted [GitHub](https://github.com/BA-CalderonMorales/my-life-as-a-dev) and ' +
        'untrusted [fake](https://unknown.example.com/fake).'
    );
    const dom = new JSDOM(html);
    const hrefs = Array.from(dom.window.document.querySelectorAll('a.ai-chat-link')).map(
      (link) => link.href
    );

    expect(hrefs).toEqual(['https://github.com/BA-CalderonMorales/my-life-as-a-dev']);
    expect(dom.window.document.body.textContent).toContain('fake');
  });

  test('removes emoji from assistant responses', () => {
    const parser = createParser();
    const html = parser.parse('Great question 🚀. ✅ Brandon focuses on developer tooling.');
    const dom = new JSDOM(html);

    expect(dom.window.document.body.textContent).toBe(
      'Great question . Brandon focuses on developer tooling.'
    );
  });
});
