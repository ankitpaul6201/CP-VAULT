import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting behind reverse proxies (like Railway)
app.set('trust proxy', 1);

// Enable secure HTTP headers
app.use(helmet());

// Restrict CORS to allowed origins (Chrome Extension protocols and dev localhosts)
const allowedOriginRegex = /^chrome-extension:\/\/[a-z]{32}$/;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || allowedOriginRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const STATE_SECRET = process.env.STATE_SECRET || crypto.randomBytes(32).toString('hex');

// Rate limiting to prevent brute-force/DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use(limiter);

// 1. Initial Login Endpoint - starts the OAuth redirect with HMAC signed state
app.get('/api/auth/github/login', (req, res) => {
  const extRedirect = req.query.ext_redirect;
  const clientId = req.query.client_id || CLIENT_ID;

  if (!extRedirect) {
    return res.status(400).send('Missing ext_redirect parameter');
  }

  if (!clientId) {
    return res.status(400).send('Missing client_id configuration');
  }

  // Validate extRedirect format to prevent open redirects or injection attacks
  try {
    const redirectUrl = new URL(extRedirect.toString());
    if (redirectUrl.protocol !== 'chrome-extension:') {
      return res.status(400).send('Invalid redirect protocol. Must be chrome-extension://');
    }
  } catch (err) {
    return res.status(400).send('Invalid ext_redirect URI format');
  }

  // Generate stateless HMAC signed state to prevent CSRF and state spoofing
  const payload = Buffer.from(extRedirect.toString()).toString('base64');
  const signature = crypto.createHmac('sha256', STATE_SECRET).update(payload).digest('base64url');
  const state = `${payload}.${signature}`;

  const callbackUrl = 'https://cp-vault-production.up.railway.app/api/auth/github/callback';

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId.toString())}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
    `&scope=${encodeURIComponent('repo user')}` +
    `&state=${encodeURIComponent(state)}`;

  res.redirect(githubAuthUrl);
});

// 2. Callback Endpoint - receives code, validates signature, exchanges for token, and redirects
app.get('/api/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  if (!state) {
    return res.status(400).send('Missing state parameter');
  }

  try {
    // Verify HMAC signature of the state
    const parts = state.toString().split('.');
    if (parts.length !== 2) {
      return res.status(400).send('Invalid state format');
    }

    const [payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', STATE_SECRET).update(payload).digest('base64url');

    if (signature !== expectedSignature) {
      return res.status(400).send('OAuth state verification failed. Possible CSRF attack.');
    }

    // Decode extension redirect URL
    const extRedirect = Buffer.from(payload, 'base64').toString('ascii');

    // Exchange code for Access Token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).send(`GitHub OAuth Error: ${tokenData.error_description || tokenData.error}`);
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return res.status(400).send('Failed to retrieve access token');
    }

    // Redirect user back to the Chrome Extension with the access token
    const targetUrl = new URL(extRedirect);
    targetUrl.searchParams.set('access_token', accessToken);

    res.redirect(targetUrl.toString());
  } catch (err) {
    console.error('Error during token exchange:', err);
    res.status(500).send('Internal Server Error during token exchange');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('CP Vault Secure OAuth Proxy Server is running!');
});

app.listen(PORT, () => {
  console.log(`CP Vault Secure OAuth Proxy Server running on port ${PORT}`);
});