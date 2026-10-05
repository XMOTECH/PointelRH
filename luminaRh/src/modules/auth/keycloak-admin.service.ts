import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakAdminService.name);

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    // Tenter la synchronisation initiale après 5s pour laisser le temps à Keycloak de démarrer
    setTimeout(() => {
      this.syncClientSetup().catch((err) => {
        this.logger.debug(`Synchronisation initiale Keycloak différée : ${err?.message || err}`);
      });
    }, 5000);
  }

  /**
   * Get an admin token from the master realm to perform administrative operations.
   */
  private async getAdminToken(): Promise<string> {
    const defaultUrl = process.env.NODE_ENV === 'production'
      ? (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://keycloak:8080')
      : (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://localhost:8080');

    const adminUser = this.config.get<string>('KEYCLOAK_ADMIN_USER')
      || (process.env.NODE_ENV !== 'production' ? 'admin' : undefined);
    const adminPass = this.config.get<string>('KEYCLOAK_ADMIN_PASS')
      || (process.env.NODE_ENV !== 'production' ? 'admin' : undefined);

    if (!adminUser || !adminPass) {
      throw new InternalServerErrorException(
        'Les identifiants KEYCLOAK_ADMIN_USER et KEYCLOAK_ADMIN_PASS doivent être définis dans les variables d\'environnement.',
      );
    }

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
          signal: AbortSignal.timeout(3000),
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
   * Synchronise et configure le realm, client et rôles dans Keycloak via l'API d'administration
   */
  async syncClientSetup(): Promise<boolean> {
    try {
      const authServerUrl = process.env.NODE_ENV === 'production'
        ? (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://keycloak:8080')
        : (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://localhost:8080');
      const realm = this.config.get<string>('KEYCLOAK_REALM', 'luminarh');
      const rawClientId = this.config.get<string>('KEYCLOAK_CLIENT_ID', 'luminarh-backend');
      const clientId = rawClientId ? rawClientId.replace(/^["']|["']$/g, '').trim() : 'luminarh-backend';
      const rawSecret = this.config.get<string>('KEYCLOAK_CLIENT_SECRET');
      const clientSecret = rawSecret ? rawSecret.replace(/^["']|["']$/g, '').trim() : 'z9yDCh9WO3B8PclSsZirS5nXLZWmCRVU';

      const adminToken = await this.getAdminToken();

      // 1. Vérifier si le realm existe, sinon le créer
      const checkRealmRes = await fetch(`${authServerUrl}/admin/realms/${realm}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (checkRealmRes.status === 404) {
        this.logger.log(`Création automatique du realm '${realm}' dans Keycloak...`);
        await fetch(`${authServerUrl}/admin/realms`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: realm,
            realm: realm,
            enabled: true,
          }),
        });
      }

      // 2. Vérifier si les rôles essentiels du realm existent
      const rolesRes = await fetch(`${authServerUrl}/admin/realms/${realm}/roles`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (rolesRes.ok) {
        const roles = await rolesRes.json();
        const roleNames = Array.isArray(roles) ? roles.map((r: any) => r.name) : [];
        for (const requiredRole of ['admin', 'manager', 'employee', 'super_admin']) {
          if (!roleNames.includes(requiredRole)) {
            await fetch(`${authServerUrl}/admin/realms/${realm}/roles`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: requiredRole }),
            });
          }
        }
      }

      // 3. Vérifier ou configurer le client backend
      const getClientsRes = await fetch(
        `${authServerUrl}/admin/realms/${realm}/clients?clientId=${encodeURIComponent(clientId)}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );

      let clientInternalId: string | null = null;
      if (getClientsRes.ok) {
        const clients = await getClientsRes.json();
        if (Array.isArray(clients) && clients.length > 0) {
          clientInternalId = clients[0].id;
        }
      }

      const clientPayload: Record<string, any> = {
        clientId,
        name: 'LuminaRH Backend Client',
        enabled: true,
        clientAuthenticatorType: 'client-secret',
        secret: clientSecret,
        standardFlowEnabled: true,
        directAccessGrantsEnabled: true,
        serviceAccountsEnabled: true,
        publicClient: false,
        protocol: 'openid-connect',
        redirectUris: ['*'],
        webOrigins: ['*'],
      };

      if (!clientInternalId) {
        this.logger.log(`Création du client '${clientId}' dans Keycloak...`);
        await fetch(`${authServerUrl}/admin/realms/${realm}/clients`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientPayload),
        });
      } else {
        this.logger.log(`Mise à jour du client '${clientId}' (${clientInternalId}) dans Keycloak...`);
        await fetch(`${authServerUrl}/admin/realms/${realm}/clients/${clientInternalId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: clientInternalId,
            ...clientPayload,
          }),
        });
      }

      // 4. Débloquer ou initialiser l'utilisateur admin par défaut
      await this.resetUserCredentials('amadou@luminarh.sn', 'password');

      return true;
    } catch (err: any) {
      this.logger.error(`Erreur synchronisation Keycloak: ${err?.message || err}`);
      return false;
    }
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
    const authServerUrl = process.env.NODE_ENV === 'production'
      ? (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://keycloak:8080')
      : (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://localhost:8080');
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
      const authServerUrl = process.env.NODE_ENV === 'production'
        ? (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://keycloak:8080')
        : (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://localhost:8080');
      const realm = this.config.get<string>('KEYCLOAK_REALM', 'luminarh');
      const adminToken = await this.getAdminToken();

      // 1. Search user by email
      const searchUrl = `${authServerUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email)}`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      if (!searchRes.ok) return null;
      const users = await searchRes.json();
      if (!users || users.length === 0) {
        // L'utilisateur n'existe pas encore dans Keycloak : le créer automatiquement avec le rôle admin
        this.logger.log(`Utilisateur ${email} introuvable dans Keycloak, création automatique...`);
        return await this.createUser({
          email,
          firstName: email.split('@')[0],
          lastName: 'Admin',
          tempPassword: newPassword || 'password',
          role: 'admin',
        });
      }

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
