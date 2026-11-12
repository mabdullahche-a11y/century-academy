import { readFile, writeFile } from 'node:fs/promises';
const read = file => readFile(new URL(file, import.meta.url), 'utf8');
export async function bundle() {
  const styles = (await Promise.all(['fonts', 'base', 'refinements'].map(name => read('./src/' + name + '.css')))).join('\n');
  const css = styles.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
    .replace(/\s*([{};])\s*/g, '$1').replace(/:\s+/g, ':').replace(/,\s+/g, ',').replace(/;}/g, '}').trim();
  const scripts = await Promise.all(['interactions', 'assessment-contact'].map(name => read('./src/' + name + '.js')));
  await Promise.all([
    writeFile(new URL('./dist/theme.css', import.meta.url), css),
    writeFile(new URL('./dist/site.js', import.meta.url), scripts.join('\n\n')),
  ]);
}
