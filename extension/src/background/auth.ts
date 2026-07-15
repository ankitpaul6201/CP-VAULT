import { StorageService } from './storage';
import { GitHubService } from './github';
import { Logger } from '../shared/utils/logger';

export const AuthService = {
  async handleOAuth(clientId: string, proxyUrl: string): Promise<{ success: boolean; user?: any; error?: string }> {
    const extensionRedirect = chrome.identity.getRedirectURL();
    const authUrl = `${proxyUrl}/api/auth/github/login?client_id=${encodeURIComponent(clientId)}&ext_redirect=${encodeURIComponent(extensionRedirect)}`;

    Logger.info('Launching launchWebAuthFlow...', authUrl);

    return new Promise((resolve) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        async (redirectUrl) => {
          if (chrome.runtime.lastError) {
            const lastErrorMsg = chrome.runtime.lastError.message || '';
            Logger.error('launchWebAuthFlow error:', lastErrorMsg);
            if (lastErrorMsg.toLowerCase().includes('cancel') || lastErrorMsg.toLowerCase().includes('user did not approve')) {
              resolve({ success: false, error: 'Authentication cancelled.' });
            } else {
              resolve({ success: false, error: lastErrorMsg || 'GitHub authentication failed.' });
            }
            return;
          }

          if (!redirectUrl) {
            Logger.error('launchWebAuthFlow returned no redirectUrl (null)');
            resolve({ success: false, error: 'Authentication cancelled.' });
            return;
          }

          try {
            const url = new URL(redirectUrl);
            const token = url.searchParams.get('access_token');

            if (!token) {
              resolve({ success: false, error: 'GitHub authentication failed.' });
              return;
            }

            // Immediately fetch user
            const user = await GitHubService.getUser(token);

            // Fetch user's repos to verify scope and connection
            const repos = await GitHubService.listRepositories(token);

            // Verify if there is a selected repository in the settings.
            const settings = await StorageService.getSettings();
            if (settings.repoOwner && settings.repoName) {
              const exists = repos.some(r => r.name.toLowerCase() === settings.repoName!.toLowerCase());
              if (!exists) {
                const stillExists = await GitHubService.checkRepositoryExists(token, settings.repoOwner, settings.repoName);
                if (!stillExists) {
                  resolve({ success: false, error: 'Repository not found.' });
                  return;
                }
              }
            }

            // Save details: githubToken, githubUsername, githubAvatar, authMethod = oauth
            await StorageService.updateSettings({
              githubToken: token,
              authMethod: 'oauth',
            });
            await StorageService.saveGitHubUser(user);

            resolve({ success: true, user });
          } catch (err: any) {
            Logger.error('Error during OAuth handling:', err);
            let errorMessage = 'GitHub authentication failed.';
            if (err && err.message) {
              errorMessage = err.message;
            }
            resolve({ success: false, error: errorMessage });
          }
        }
      );
    });
  },

  async validateTokenOnStartup(): Promise<void> {
    const settings = await StorageService.getSettings();
    if (!settings.githubToken) return;

    try {
      // Validate by fetching user details
      await GitHubService.getUser(settings.githubToken);
      
      // If there is a selected repo, validate it too
      if (settings.repoOwner && settings.repoName) {
        const stillExists = await GitHubService.checkRepositoryExists(settings.githubToken, settings.repoOwner, settings.repoName);
        if (!stillExists) {
          Logger.warn('Selected repository not found during startup validation. Disconnecting.');
          await StorageService.clearAuth();
        }
      }
    } catch (err) {
      Logger.error('Startup token validation failed, disconnecting automatically:', err);
      await StorageService.clearAuth();
    }
  }
};
