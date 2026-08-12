import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Get an admin token from the master realm to perform administrative operations.
   */
  private async getAdminToken(): Promise<string> {
    const defaultUrl = process.env.NODE_ENV === 'production' ? 'http://keycloak:8080' : (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://keycloak:8080');
    const adminUser = this.config.get<string>('KEYCLOAK_ADMIN_USER', 'admin');
    const adminPass = this.config.get<string>('KEYCLOAK_ADMIN_PASS', 'admin');

    const urlsToTry = [
      defaultUrl,
      'http://keycloak:8080',
      'http://localhost:8085',
    ].filter((v, i, a) => a.indexOf(v) === i);

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', 'admin-cli');
    params.append('username', adminUser);
    params.append('password', adminPass);

    for (const authServerUrl of urlsToTry) {
      const tokenUrl = `${authServerUrl}/realms/master/protocol/openid-connect/token`;

      try {
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
          signal: AbortSignal.timeout(2000),
        });

        if (response.ok) {
          const data = await response.json();
          return data.access_token;
        }
      } catch (err) {
        this.logger.debug(`Keycloak master token attempt failed on ${authServerUrl}: ${err}`);
      }
    }

    throw new InternalServerErrorException('Impossible d\'obtenir le token d\'administration Keycloak');
  }

  /**
   * Create a user in the target realm and assign them a temporary password and realm role.
   */
  async createUser(payload: {
    email: string;
    firstName: string;
    lastName: string;
    tempPassword: string;
    role: string; // 'employee', 'manager', 'admin'
  }): Promise<string> {
    const authServerUrl = this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8085');
    const realm = this.config.get<string>('KEYCLOAK_REALM', 'luminarh');
    const adminToken = await this.getAdminToken();

    // 1. Create the user
    const createUserUrl = `${authServerUrl}/admin/realms/${realm}/users`;
    const userPayload = {
      username: payload.email,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      enabled: true,
      emailVerified: true,
      requiredActions: [],
      credentials: [
        {
          type: 'password',
          value: payload.tempPassword,
          temporary: false,
        },
      ],
    };

    let userId: string;

    try {
      const response = await fetch(createUserUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPayload),
        signal: AbortSignal.timeout(2500),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Failed to create user in Keycloak: ${errText}`);
        if (response.status === 409) {
          // L'utilisateur existe déjà : réinitialiser son compte Keycloak (effacer requiredActions, temporary: false)
          this.logger.log(`Réinitialisation du compte Keycloak existant pour ${payload.email}`);
          const resetId = await this.resetUserCredentials(payload.email, payload.tempPassword);
          if (resetId) return resetId;
        }
        throw new InternalServerErrorException('Erreur lors de la création du compte dans Keycloak');
      }

      // Keycloak returns the user ID in the Location header
      const location = response.headers.get('Location');
      if (!location) {
        throw new InternalServerErrorException('ID utilisateur introuvable dans la réponse de Keycloak');
      }
      const parts = location.split('/');
      userId = parts[parts.length - 1];
    } catch (error) {
      this.logger.error(`Error creating user in Keycloak realm ${realm}`, error);
      throw error;
    }

    // 2. Fetch target role configuration
    const rolesUrl = `${authServerUrl}/admin/realms/${realm}/roles`;
    try {
      const response = await fetch(rolesUrl, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new InternalServerErrorException('Impossible de récupérer les rôles de Keycloak');
      }

      const roles = await response.json();
      const targetRole = roles.find((r: any) => r.name === payload.role);

      if (targetRole) {
        // 3. Map role to the user
        const mapRoleUrl = `${authServerUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`;
        const roleMappingResponse = await fetch(mapRoleUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              id: targetRole.id,
              name: targetRole.name,
            },
          ]),
        });

        if (!roleMappingResponse.ok) {
          const errText = await roleMappingResponse.text();
          this.logger.error(`Failed to map role to Keycloak user: ${errText}`);
        }
      } else {
        this.logger.warn(`Role ${payload.role} not found in Keycloak realm roles`);
      }
    } catch (error) {
      this.logger.error(`Error mapping role to user ${userId}`, error);
    }

    return userId;
  }

  /**
   * Reset required actions and update credentials to temporary: false for a Keycloak user.
   */
  async resetUserCredentials(email: string, newPassword?: string): Promise<string | null> {
    try {
      const authServerUrl = this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8085');
      const realm = this.config.get<string>('KEYCLOAK_REALM', 'luminarh');
      const adminToken = await this.getAdminToken();

      // 1. Search user by email
      const searchUrl = `${authServerUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email)}`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      if (!searchRes.ok) return null;
      const users = await searchRes.json();
      if (!users || users.length === 0) return null;

      const user = users[0];
      const userId = user.id;

      // 2. Clear requiredActions and enable user
      const updateUserUrl = `${authServerUrl}/admin/realms/${realm}/users/${userId}`;
      await fetch(updateUserUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          enabled: true,
          emailVerified: true,
          requiredActions: [],
        }),
      });

      // 3. Reset password with temporary: false if provided
      if (newPassword) {
        const resetPassUrl = `${authServerUrl}/admin/realms/${realm}/users/${userId}/reset-password`;
        await fetch(resetPassUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'password',
            value: newPassword,
            temporary: false,
          }),
        });
      }

      this.logger.log(`Accès Keycloak débloqué avec succès pour ${email}`);
      return userId;
    } catch (err) {
      this.logger.error(`Erreur lors du déblocage Keycloak pour ${email}:`, err);
      return null;
    }
  }
}
