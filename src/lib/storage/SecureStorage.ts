import * as Keychain from 'react-native-keychain';
import atob from 'atob';

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  emailVerified?: boolean;
}

enum StorageKeys {
  AUTH_TOKENS = 'foodapp_auth_tokens',
  USER_DATA = 'foodapp_user_data',
}

class SecureStorage {
  /**
   * Save authentication tokens securely in Keychain/Keystore
   * @param tokens - JWT tokens from authentication
   */
  async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Keychain.setGenericPassword(
        StorageKeys.AUTH_TOKENS,
        JSON.stringify(tokens),
        {
          service: StorageKeys.AUTH_TOKENS,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        }
      );
    } catch (error) {
      console.error('Failed to save auth tokens:', error);
      throw new Error('Failed to save authentication data');
    }
  }

  /**
   * Retrieve stored authentication tokens from Keychain/Keystore
   * @returns Stored tokens or null if not found
   */
  async getTokens(): Promise<AuthTokens | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: StorageKeys.AUTH_TOKENS,
      });

      if (credentials && credentials.password) {
        return JSON.parse(credentials.password);
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve auth tokens:', error);
      return null;
    }
  }

  /**
   * Save user data securely in Keychain/Keystore
   * @param user - Authenticated user data
   */
  async saveUser(user: AuthUser): Promise<void> {
    try {
      await Keychain.setGenericPassword(
        StorageKeys.USER_DATA,
        JSON.stringify(user),
        {
          service: StorageKeys.USER_DATA,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        }
      );
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Retrieve stored user data from Keychain/Keystore
   * @returns Stored user or null if not found
   */
  async getUser(): Promise<AuthUser | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: StorageKeys.USER_DATA,
      });

      if (credentials && credentials.password) {
        return JSON.parse(credentials.password);
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data from Keychain/Keystore
   * Called during logout or when tokens are invalid
   */
  async clearAll(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: StorageKeys.AUTH_TOKENS });
      await Keychain.resetGenericPassword({ service: StorageKeys.USER_DATA });
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }

  /**
   * Get just the ID token for API requests
   * @returns ID token or null if not found
   */
  async getToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.idToken || null;
  }

  /**
   * Save complete authentication data (tokens + user)
   * @param data - Authentication response data
   */
  async saveAuthData(data: {
    token: string;
    userId: string;
    email: string;
    displayName: string;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<void> {
    try {
      await this.saveTokens({
        idToken: data.token,
        accessToken: data.accessToken || '',
        refreshToken: data.refreshToken || '',
      });

      await this.saveUser({
        userId: data.userId,
        email: data.email,
        displayName: data.displayName,
      });
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw error;
    }
  }

  /**
   * Clear authentication data (alias for clearAll)
   */
  async clearAuth(): Promise<void> {
    return this.clearAll();
  }

  /**
   * Check if user is authenticated based on stored tokens
   * @returns true if valid tokens exist
   */
  async hasValidSession(): Promise<boolean> {
    const tokens = await this.getTokens();
    if (!tokens?.idToken) {
      return false;
    }

    // Validate JWT expiration
    return this.isTokenValid(tokens.idToken);
  }

  /**
   * Validate JWT token expiration
   * @param token - JWT token to validate
   * @returns true if token is valid and not expired
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.parseJWT(token);
      if (!payload.exp) {
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Parse JWT token payload
   * @param token - JWT token
   * @returns Decoded payload
   */
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
      // Decode base64 in React Native
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
  
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token format');
    }
  }
  
}

export default new SecureStorage();
