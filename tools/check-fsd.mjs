// Kiểm tra TỰ ĐỘNG các luật của Feature-Sliced Design.   Chạy:  npm run check:fsd
//   1. Tầng trên được import tầng DƯỚI, không được ngược lại:  app > pages > widgets > features > entities > shared
//   2. Hai slice (hai file) CÙNG tầng không được import lẫn nhau
//   3. Mọi import nội bộ phải trỏ tới file tồn tại
// Quy ước: mỗi slice = MỘT file trong thư mục tầng (vd. src/features/create-ticket.jsx).
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../src');
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];   // cao → thấp
const FREE = new Set(['app', 'shared']);                                          // các file trong tầng này được dùng lẫn nhau

const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const where = (file) => { const [layer] = relative(SRC, file).split(sep); return { layer, slice: basename(file, extname(file)) }; };

function resolveSpec(from, spec) {
  let base;
  if (spec.startsWith('@')) {
    const layer = spec.slice(1, spec.indexOf('/'));
    if (!LAYERS.includes(layer)) return null;
    base = join(SRC, layer, spec.slice(spec.indexOf('/') + 1));
  } else if (spec.startsWith('.')) base = resolve(dirname(from), spec);
  else return null;                                                               // thư viện ngoài (react, antd…)
  return [base, ...['.js', '.jsx'].map((e) => base + e)].find((p) => existsSync(p) && statSync(p).isFile()) || base;
}

const errors = []; let count = 0;
for (const file of walk(SRC).filter((f) => /\.(jsx?)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  const me = where(file), rel = relative(SRC, file);
  const specs = [...text.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g)].map((m) => m[1]);
  for (const spec of specs) {
    const target = resolveSpec(file, spec);
    if (!target) continue;
    count++;
    if (!existsSync(target) || !statSync(target).isFile()) { errors.push(`${rel}: import không tồn tại → ${spec}`); continue; }
    if (!/\.(jsx?)$/.test(target)) continue;                                      // css / ảnh: không xét tầng
    const to = where(target);
    if (!LAYERS.includes(to.layer) || !LAYERS.includes(me.layer)) continue;       // main.jsx ngoài các tầng
    const i = LAYERS.indexOf(me.layer), j = LAYERS.indexOf(to.layer);
    if (j < i) errors.push(`${rel}: tầng "${me.layer}" import tầng cao hơn "${to.layer}" → ${spec}`);
    else if (j === i && me.slice !== to.slice && !FREE.has(me.layer)) errors.push(`${rel}: "${me.slice}" import file cùng tầng "${to.slice}" → ${spec}`);
  }
}
if (errors.length) { console.error(errors.join('\n') + `\n\n✗ ${errors.length} lỗi`); process.exit(1); }
console.log(`✓ FSD hợp lệ — kiểm tra ${count} import, không vi phạm luật tầng / slice.`);
