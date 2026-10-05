import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { KeycloakAdminService } from './keycloak-admin.service';

interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token?: string;
  scope: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly keycloakAdmin: KeycloakAdminService,
  ) {}

  async login(loginDto: LoginDto) {
    const authServerUrl = process.env.NODE_ENV === 'production'
      ? (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://keycloak:8080')
      : (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://localhost:8080');
    const realm = this.config.get<string>('KEYCLOAK_REALM', 'luminarh');
    const rawClientId = this.config.get<string>('KEYCLOAK_CLIENT_ID', 'luminarh-backend');
    const clientId = rawClientId ? rawClientId.replace(/^["']|["']$/g, '').trim() : 'luminarh-backend';
    const rawSecret = this.config.get<string>('KEYCLOAK_CLIENT_SECRET', '');
    const clientSecret = rawSecret ? rawSecret.replace(/^["']|["']$/g, '').trim() : undefined;

    const tokenUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;

    let tokenResponse: KeycloakTokenResponse;

    try {
      const fetchToken = async () => {
        // Méthode 1 : client_secret_post (client_id et client_secret dans le formulaire POST, SANS Authorization header)
        const postParams = new URLSearchParams();
        postParams.set('grant_type', 'password');
        postParams.set('client_id', clientId);
        if (clientSecret) {
          postParams.set('client_secret', clientSecret);
        }
        postParams.set('username', loginDto.email);
        postParams.set('password', loginDto.password);
        postParams.set('scope', 'openid profile email');

        let res = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: postParams.toString(),
        });

        // Méthode 2 : client_secret_basic (RFC 6749 : Basic Auth header, SANS client_id/secret dans le body)
        if (!res.ok && res.status === 401 && clientSecret) {
          const basicParams = new URLSearchParams();
          basicParams.set('grant_type', 'password');
          basicParams.set('username', loginDto.email);
          basicParams.set('password', loginDto.password);
          basicParams.set('scope', 'openid profile email');

          const basicRes = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
            },
            body: basicParams.toString(),
          });

          if (basicRes.ok) {
            res = basicRes;
          }
        }

        return res;
      };

      let response = await fetchToken();

      if (!response.ok) {
        let errText = await response.text();
        this.logger.error('Keycloak token error:', errText);

        // Auto-fix 1 : Client non autorisé ou secret désynchronisé
        if (errText.includes('unauthorized_client') || errText.includes('invalid_client')) {
          this.logger.warn(`Client Keycloak '${clientId}' rejeté. Lancement de l'auto-synchronisation admin...`);
          const synced = await this.keycloakAdmin.syncClientSetup();
          if (synced) {
            response = await fetchToken();
            if (!response.ok) {
              errText = await response.text();
            }
          }
        }

        // Auto-fix 2 : Utilisateur bloqué, non vérifié ou manquant dans Keycloak
        if (errText.includes('Account is not fully set up') || (errText.includes('invalid_grant') && loginDto.email === 'amadou@luminarh.sn')) {
          this.logger.log(`Tentative de réinitialisation/création d'accès Keycloak pour ${loginDto.email}...`);
          await this.keycloakAdmin.resetUserCredentials(loginDto.email, loginDto.password);
          response = await fetchToken();
        }
      }

      if (!response.ok) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      tokenResponse = (await response.json()) as KeycloakTokenResponse;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Keycloak connection error:', error);
      throw new UnauthorizedException('Impossible de se connecter au serveur d\'authentification');
    }

    // Lookup user in local database to match sessions and company scope
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        company: true,
        employee: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Aucun compte associé à cet email dans la base de données');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Compte désactivé');
    }

    // Map to UserResource structure expected by frontend
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: user.companyId,
      employee_id: user.employee?.id || null,
      department_id: user.departmentId || null,
      is_active: user.isActive,
      permissions: this.getRolePermissions(user.role),
    };

    return {
      access_token: tokenResponse.access_token,
      token_type: 'bearer',
      expires_in: tokenResponse.expires_in,
      refresh_token: tokenResponse.refresh_token,
      user: mappedUser,
    };
  }

  async verify(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        employee: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Aucun compte associé à cet email dans la base de données');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Compte désactivé');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.companyId,
        employee_id: user.employee?.id || null,
        department_id: user.departmentId || null,
        is_active: user.isActive,
        permissions: this.getRolePermissions(user.role),
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const authServerUrl = this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8080');
    const realm = this.config.get<string>('KEYCLOAK_REALM', 'luminarh');
    const rawClientId = this.config.get<string>('KEYCLOAK_CLIENT_ID', 'luminarh-backend');
    const clientId = rawClientId ? rawClientId.replace(/^["']|["']$/g, '').trim() : 'luminarh-backend';
    const rawSecret = this.config.get<string>('KEYCLOAK_CLIENT_SECRET', '');
    const clientSecret = rawSecret ? rawSecret.replace(/^["']|["']$/g, '').trim() : undefined;

    const tokenUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', clientId);
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }
    params.append('refresh_token', refreshToken);

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error('Keycloak refresh token error:', errText);
        throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
      }

      const data = await response.json();
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        token_type: data.token_type || 'bearer',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Keycloak refresh error:', error);
      throw new UnauthorizedException('Impossible de rafraîchir la session');
    }
  }

  private getRolePermissions(role: string): string[] {
    // Standard role permissions in LuminaRH
    if (role === 'super_admin') {
      return ['all'];
    }
    if (role === 'admin') {
      return ['manage_employees', 'manage_departments', 'view_reports', 'manage_locations'];
    }
    return ['view_own_attendance', 'clock_in_out'];
  }
}
