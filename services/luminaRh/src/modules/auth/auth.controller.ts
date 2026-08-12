import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Headers, UnauthorizedException } from '@nestjs/common';
import { Roles, Public } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser, CurrentUserDto } from '../../common/decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { KeycloakAdminService } from './keycloak-admin.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

import { randomBytes } from 'crypto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}


  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Connexion de l\'utilisateur',
    description: 'Valide les identifiants de l\'utilisateur contre Keycloak (Direct Grant) et renvoie un JWT d\'accès accompagné des données du profil.'
  })
  @ApiResponse({ status: 200, description: 'Connexion réussie.' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vérifier la session et le token de l\'utilisateur',
    description: 'Valide le token d\'accès JWT fourni et renvoie les données de profil utilisateur associées pour restaurer sa session.'
  })
  @ApiResponse({ status: 200, description: 'Session valide.' })
  @ApiResponse({ status: 401, description: 'Session non authentifiée ou expirée.' })
  async verify(@CurrentUser() user: CurrentUserDto, @Headers('authorization') authHeader?: string) {
    if (user && user.id) {
      return {
        success: true,
        data: { user },
      };
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const email = payload.email || payload.preferred_username;
        if (email) {
          const result = await this.authService.verify(email);
          return {
            success: true,
            data: result,
          };
        }
      } catch {
        // Ignorer l'erreur de décodage
      }
    }

    throw new UnauthorizedException('Session expirée ou invalide');
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le token d\'accès JWT' })
  async refresh(@Body('refresh_token') refreshToken?: string, @Headers('x-refresh-token') headerRefresh?: string) {
    const token = refreshToken || headerRefresh;
    if (!token) {
      throw new UnauthorizedException('Refresh token manquant');
    }
    return this.authService.refreshToken(token);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déconnexion' })
  async logout() {
    return { success: true, message: 'Déconnexion réussie' };
  }

  /**
   * Compatibility endpoint for the frontend employee-creation saga.
   * In the monolith, the User record is already created atomically inside
   * EmployeeService.create(), so this endpoint is a no-op that simply
   * returns success to satisfy the frontend's second API call.
   */
  @Post('users')
  @ApiBearerAuth('keycloak-token')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un compte utilisateur (compatibilité)',
    description: 'Dans le monolithe, le compte utilisateur est déjà créé lors de la création de l\'employé. Ce endpoint retourne un succès pour la compatibilité du frontend.',
  })
  @ApiResponse({ status: 201, description: 'Utilisateur créé (ou déjà existant).' })
  async createUser(@Body() body: CreateUserDto) {
    // Cryptographically secure temporary password (16 hex chars + uppercase, digit, special char)
    const tempPassword = randomBytes(8).toString('hex') + 'A1!';

    // Get name components (firstName, lastName) from body.name or default
    const nameParts = (body.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Prénom';
    const lastName = nameParts.slice(1).join(' ') || 'Nom';

    // Create user in Keycloak using the admin REST API
    try {
      await this.keycloakAdmin.createUser({
        email: body.email,
        firstName,
        lastName,
        tempPassword,
        role: body.role || 'employee',
      });
    } catch (err) {
      this.logger.error(`[KeycloakAdmin] Création utilisateur Keycloak ignorée ou déjà existante:`, err);
    }

    // Lookup employee from local database to get full details for the email event
    const employee = await this.prisma.employee.findFirst({
      where: { email: body.email },
      include: {
        department: true,
        schedule: true,
      },
    });

    // Emit event so NotificationService can send the activation email via Gmail SMTP
    this.eventEmitter.emit('employee.created', {
      employee: employee || {
        firstName,
        lastName,
        email: body.email,
      },
      password: tempPassword,
    });

    return {
      success: true,
      message: 'Compte utilisateur créé dans Keycloak avec succès',
      data: {
        email: body.email,
        role: body.role || 'employee',
        temp_password: tempPassword,
      },
    };
  }
}

