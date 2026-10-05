import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KeycloakAdminService } from './keycloak-admin.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, KeycloakAdminService],
  exports: [AuthService, KeycloakAdminService],
})
export class AuthModule {}

