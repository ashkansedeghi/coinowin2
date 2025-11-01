import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

html = html.replace(/<link[^>]+href="([^"']+\.css)"[^>]*>/g, (_, href) => {
  const cssPath = path.join(distDir, href);
  const css = fs.readFileSync(cssPath, 'utf-8');
  return `<style>${css}</style>`;
});

html = html.replace(/<script[^>]+src="([^"']+\.js)"[^>]*><\/script>/g, (_, src) => {
  const scriptPath = path.join(distDir, src);
  const code = fs.readFileSync(scriptPath, 'utf-8');
  return `<script>${code}</script>`;
});

const logo = fs.readFileSync(path.resolve('web/src/assets/logo-coinoWin.svg'), 'utf-8');
const iconData = `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`;
html = html.replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="${iconData}">`);

const inject = ['markets', 'orderbooks', 'trades'].map(name => {
  const file = fs.readFileSync(path.resolve(`mock/${name}.json`), 'utf-8');
  return `<script type="application/json" id="mock-${name}">${file}</script>`;
});

html = html.replace('</body>', `${inject.join('\n')}</body>`);

fs.writeFileSync('index-standalone.html', html, 'utf-8');
console.log('✓ index-standalone.html built');
