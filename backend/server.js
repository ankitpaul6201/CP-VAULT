import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// 1. Initial Login Endpoint - starts the OAuth redirect
app.get('/api/auth/github/login', (req, res) => {
  const extRedirect = req.query.ext_redirect;
  const clientId = req.query.client_id || CLIENT_ID;

  if (!extRedirect) {
    return res.status(400).send('Missing ext_redirect parameter');
  }

  if (!clientId) {
    return res.status(400).send('Missing client_id configuration');
  }

  // Base64 encode the extension redirect URI to store in state
  const state = Buffer.from(extRedirect.toString()).toString('base64');
const callbackUrl =
'https://cp-vault-production.up.railway.app/api/auth/github/callback';

const githubAuthUrl =
`https://github.com/login/oauth/authorize` +
`?client_id=${encodeURIComponent(clientId)}` +
`&redirect_uri=${encodeURIComponent(callbackUrl)}` +
`&scope=${encodeURIComponent('repo user')}` +
`&state=${encodeURIComponent(state)}`;
  res.redirect(githubAuthUrl);
});

// 2. Callback Endpoint - receives code and state, exchanges for token, redirects to extension
app.get('/api/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  if (!state) {
    return res.status(400).send('Missing state parameter');
  }

  try {
    // Decode extension redirect URL from state
    const extRedirect = Buffer.from(state.toString(), 'base64').toString('ascii');

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
  res.send('CP Vault OAuth Server is running!');
});

app.listen(PORT, () => {
  console.log(`CP Vault OAuth Proxy Server running on port ${PORT}`);
});
