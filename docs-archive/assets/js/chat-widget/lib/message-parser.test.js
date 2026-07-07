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

  test('removes undefined template artifact before text', () => {
    const parser = createParser();
    const html = parser.parse(
      'undefinedTerminal Jarvis - What it does: A CLI tool.'
    );
    const dom = new JSDOM(html);

    expect(dom.window.document.body.textContent).toContain('Terminal Jarvis');
    expect(dom.window.document.body.textContent).not.toMatch(/undefined/);
  });

  test('removes undefined template artifact after text', () => {
    const parser = createParser();
    const html = parser.parse(
      'Terminal Jarvisundefined - What it does: A CLI tool.'
    );
    const dom = new JSDOM(html);

    expect(dom.window.document.body.textContent).toContain('Terminal Jarvis');
    expect(dom.window.document.body.textContent).not.toMatch(/undefined/);
  });

  test('removes undefined artifacts surrounding project name', () => {
    const parser = createParser();
    const html = parser.parse([
      'Brandon\u2019s current open\u2010source work',
      '',
      'undefinedTerminal Jarvisundefined - What it does: A CLI tool.',
      'undefinedCoder Infrastructureundefined - Templates for dev environments.',
      'undefinedMy Life as a Devundefined - A documentation portfolio.',
    ].join('\n'));
    const dom = new JSDOM(html);

    const text = dom.window.document.body.textContent;
    expect(text).toContain('Terminal Jarvis');
    expect(text).toContain('Coder Infrastructure');
    expect(text).toContain('My Life as a Dev');
    expect(text).not.toMatch(/undefined/);
  });

  test('removes undefined before whitespace-separated text', () => {
    const parser = createParser();
    const html = parser.parse('undefined What it does: A CLI tool.');
    const dom = new JSDOM(html);

    expect(dom.window.document.body.textContent).toContain('What it does');
    expect(dom.window.document.body.textContent).not.toMatch(/undefined/);
  });

  test('preserves code blocks containing the word undefined', () => {
    const parser = createParser();
    const html = parser.parse(
      'Use `typeof x === "undefined"` to check.\n\n```js\nconst x = undefined;\n```'
    );
    const dom = new JSDOM(html);

    expect(dom.window.document.body.textContent).toContain('typeof x === "undefined"');
    expect(dom.window.document.body.textContent).toContain('const x = undefined;');
  });

  test('parses asterisk bullet points correctly', () => {
    const parser = createParser();
    const html = parser.parse([
      '* Item one',
      '* Item two',
      '  * Nested item',
    ].join('\n'));
    const dom = new JSDOM(html);

    const items = dom.window.document.querySelectorAll('.ai-chat-list-item-content');
    const texts = Array.from(items).map((el) => el.textContent);
    expect(texts).toContain('Item one');
    expect(texts).toContain('Item two');
    expect(texts).toContain('Nested item');
  });

  test('preserves numbered lists', () => {
    const parser = createParser();
    const html = parser.parse([
      '1. First step',
      '2. Second step',
      '3. Third step',
    ].join('\n'));
    const dom = new JSDOM(html);

    expect(dom.window.document.querySelectorAll('ol.ai-chat-list')).toHaveLength(1);
    const items = dom.window.document.querySelectorAll('.ai-chat-list-item-content');
    expect(items).toHaveLength(3);
  });
});
