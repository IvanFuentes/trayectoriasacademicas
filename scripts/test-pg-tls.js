const fs = require('fs');
const tls = require('tls');

const env = fs.readFileSync('..\\.env', 'utf8')
  .split(/\r?\n/)
  .reduce((envVars, line) => {
    if (!line || line.startsWith('#')) return envVars;
    const [key, ...rest] = line.split('=');
    envVars[key.trim()] = rest.join('=').trim();
    return envVars;
  }, {});

const host = env.MOODLE_DB_HOST;
const port = parseInt(env.MOODLE_DB_PORT || '5432', 10);

console.log('Testing TLS connection to', host, port);

const socket = tls.connect({ host, port, rejectUnauthorized: false }, () => {
  console.log('TLS handshake success');
  console.log('authorized', socket.authorized);
  console.log('authorizationError', socket.authorizationError);
  console.log('encrypted', socket.encrypted);
  socket.end();
});

socket.on('error', err => {
  console.error('TLS connection error:', err.message);
});

socket.on('close', hadError => {
  console.log('Connection closed', { hadError });
});
