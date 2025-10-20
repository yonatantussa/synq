import * as https from 'https';
import * as url from 'url';
import { shell, BrowserWindow } from 'electron';
import Store from 'electron-store';
const selfsigned = require('selfsigned');

// @ts-ignore - electron-store types may be incomplete
const ElectronStore = Store as any;

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

type StoreSchema = {
  tokens: SpotifyTokens | null;
};

export class AuthServer {
  private server: https.Server | null = null;
  private store: any;
  private mainWindow: BrowserWindow | null = null;
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;
  private readonly REDIRECT_URI: string;
  private readonly SCOPES = 'user-read-currently-playing user-read-playback-state streaming user-read-email user-read-private';

  constructor(mainWindow?: BrowserWindow) {
    // Load credentials from environment variables
    this.CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
    this.CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://127.0.0.1:8888/callback';

    // Validate credentials
    if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
      throw new Error(
        'Missing Spotify credentials! Please create a .env file with SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET'
      );
    }

    this.store = new ElectronStore({
      name: 'synq-config',
      defaults: {
        tokens: null
      }
    });
    this.mainWindow = mainWindow || null;
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  getTokens(): SpotifyTokens | null {
    return this.store.get('tokens');
  }

  async getValidAccessToken(): Promise<string | null> {
    const tokens = this.getTokens();
    if (!tokens) return null;

    // Check if token is expired (with 5 min buffer)
    if (Date.now() >= tokens.expires_at - 300000) {
      // Refresh token
      return await this.refreshAccessToken(tokens.refresh_token);
    }

    return tokens.access_token;
  }

  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(this.CLIENT_ID + ':' + this.CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      const data = await response.json() as any;

      if (data.access_token) {
        const tokens: SpotifyTokens = {
          access_token: data.access_token,
          refresh_token: data.refresh_token || refreshToken,
          expires_at: Date.now() + (data.expires_in * 1000)
        };
        this.store.set('tokens', tokens);
        return data.access_token;
      }

      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  startAuthFlow() {
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${this.CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(this.SCOPES)}`;

    shell.openExternal(authUrl);

    // Only start server if not already running
    if (!this.server) {
      this.startCallbackServer();
    }
  }

  private startCallbackServer() {
    // Don't start if already running
    if (this.server) {
      console.log('Auth server already running');
      return;
    }

    // Generate self-signed certificate for 127.0.0.1
    const attrs = [
      { name: 'commonName', value: '127.0.0.1' },
      { name: 'subjectAltName', value: 'IP:127.0.0.1' }
    ];
    const pems = selfsigned.generate(attrs, {
      days: 365,
      keySize: 2048,
      algorithm: 'sha256'
    });

    const options = {
      key: pems.private,
      cert: pems.cert
    };

    this.server = https.createServer(options, async (req, res) => {
      const parsedUrl = url.parse(req.url || '', true);

      if (parsedUrl.pathname === '/callback') {
        const code = parsedUrl.query.code as string;

        if (code) {
          try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(this.CLIENT_ID + ':' + this.CLIENT_SECRET).toString('base64')
              },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: this.REDIRECT_URI
              })
            });

            const data = await response.json() as any;

            if (data.access_token) {
              const tokens: SpotifyTokens = {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: Date.now() + (data.expires_in * 1000)
              };
              this.store.set('tokens', tokens);

              // Notify renderer that auth is complete
              if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send('auth-complete');
              }

              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end('<html><body><h1>Authentication successful!</h1><p>You can close this window.</p></body></html>');
            } else {
              res.writeHead(400, { 'Content-Type': 'text/html' });
              res.end('<html><body><h1>Authentication failed</h1></body></html>');
            }
          } catch (error) {
            console.error('Auth error:', error);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<html><body><h1>Server error</h1></body></html>');
          }

          this.stopCallbackServer();
        }
      }
    });

    this.server.listen(8888);
  }

  private stopCallbackServer() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}
