const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env');
const targetPath = path.resolve(__dirname, '..', 'src', 'environments', 'environment.ts');

if (!fs.existsSync(envPath)) {
  console.error('.env file not found. Create it from .env.example.');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8')
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...rest] = line.split('=');
    acc[key.trim()] = rest.join('=').trim();
    return acc;
  }, {});

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const content = `export const environment = {
  supabaseUrl: ${JSON.stringify(supabaseUrl)},
  supabaseKey: ${JSON.stringify(supabaseKey)}
};
`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log(`Wrote ${targetPath}`);
