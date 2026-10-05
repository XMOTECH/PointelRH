import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { CurrentUser, CurrentUserDto } from '../../../common/decorators/current-user.decorator';
import { PerformanceEvaluationService } from '../services/performance-evaluation.service';
import { SubmitSelfReviewDto } from '../dto/submit-self-review.dto';
import { SubmitManagerReviewDto } from '../dto/submit-manager-review.dto';
import { SignEvaluationDto } from '../dto/sign-evaluation.dto';

@ApiTags('Performance - Sessions d\'Évaluation')
@ApiBearerAuth('keycloak-token')
@Controller('performance/evaluations')
export class PerformanceEvaluationController {
  constructor(private readonly evaluationService: PerformanceEvaluationService) {}

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister les évaluations accessibles à l\'utilisateur connecté (selon rôle et hiérarchie)' })
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  async findAll(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser() user: CurrentUserDto,
    @Query('campaignId') campaignId?: string,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    const data = await this.evaluationService.findAll(companyId, user, {
      campaignId,
      status,
      employeeId,
    });
    return { success: true, data };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Consulter une session d\'évaluation complète' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
  ) {
    const data = await this.evaluationService.findOne(companyId, id, user);
    return { success: true, data };
  }

  @Post(':id/start-self-evaluation')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Démarrer formellement l\'auto-évaluation du collaborateur' })
  async startSelfEvaluation(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
  ) {
    const data = await this.evaluationService.startSelfEvaluation(companyId, id, user);
    return { success: true, data };
  }

  @Put(':id/draft-self-review')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Enregistrer un brouillon d\'auto-évaluation en cours de saisie' })
  async saveDraftSelfReview(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: SubmitSelfReviewDto,
  ) {
    const data = await this.evaluationService.saveDraftSelfReview(companyId, id, user, dto);
    return { success: true, data };
  }

  @Post(':id/submit-self-review')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Soumettre définitivement l\'auto-évaluation au manager' })
  async submitSelfReview(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: SubmitSelfReviewDto,
  ) {
    const data = await this.evaluationService.submitSelfReview(companyId, id, user, dto);
    return { success: true, data };
  }

  @Post(':id/submit-manager-review')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Valider et soumettre l\'évaluation managériale' })
  async submitManagerReview(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: SubmitManagerReviewDto,
  ) {
    const data = await this.evaluationService.submitManagerReview(companyId, id, user, dto);
    return { success: true, data };
  }

  @Post(':id/sign')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:employee', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Signer électroniquement l\'entretien d\'évaluation (Collaborateur ou Manager)' })
  async sign(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: SignEvaluationDto,
  ) {
    const data = await this.evaluationService.signEvaluation(companyId, id, user, dto);
    return { success: true, data };
  }
}
