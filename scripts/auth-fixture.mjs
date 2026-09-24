// Local protocol fixture for UI integration tests only. Not an authentication
// service: tokens are deliberately unsigned, and no real credentials are used.
import { createServer } from 'node:http';
const id = '11111111-1111-4111-8111-111111111111';
const user = {
  id,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'player@example.test',
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { display_name: 'Test Player' },
};
let profile = null;
const token = () =>
  [
    { alg: 'HS256', typ: 'JWT' },
    {
      sub: id,
      aud: 'authenticated',
      role: 'authenticated',
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    },
  ]
    .map((value) => Buffer.from(JSON.stringify(value)).toString('base64url'))
    .join('.') + '.fixture_signature';
const session = () => ({
  access_token: token(),
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'fixture-refresh-token',
  user,
});
const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3100');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'authorization,apikey,content-type,x-client-info,x-supabase-api-version,prefer,x-upsert,accept-profile,content-profile',
  );
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  response.setHeader('Content-Type', 'application/json');
  const send = (value, status = 200) => {
    response.statusCode = status;
    response.end(JSON.stringify(value));
  };
  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }
  const url = new URL(request.url, 'http://127.0.0.1:54329');
  let raw = '';
  for await (const chunk of request) raw += chunk;
  let body = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    send({ message: 'Invalid JSON' }, 400);
    return;
  }
  if (url.pathname === '/health') return send({ ok: true });
  if (url.pathname === '/auth/v1/token') {
    if (body.password === 'wrong-password')
      return send({ code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400);
    return send(session());
  }
  if (url.pathname === '/auth/v1/signup') return send({ user, session: null });
  if (url.pathname === '/auth/v1/user') return send(user);
  if (url.pathname === '/auth/v1/logout' || url.pathname === '/auth/v1/recover') return send({});
  if (url.pathname === '/rest/v1/profiles') {
    if (!request.headers.authorization?.startsWith('Bearer '))
      return send({ message: 'Unauthorized' }, 401);
    if (request.method === 'POST') {
      if (body.username === 'taken_handle')
        return send({ code: '23505', message: 'Unique violation' }, 409);
      profile = { ...body, id, updated_at: new Date().toISOString() };
      return send(profile);
    }
    return send(profile ? [profile] : []);
  }
  send({ message: 'Fixture endpoint not implemented' }, 404);
});
server.listen(54329, '127.0.0.1');
