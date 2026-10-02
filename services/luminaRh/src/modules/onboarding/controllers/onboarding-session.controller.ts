import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OnboardingSessionService } from '../services/onboarding-session.service';
import { OnboardingDocumentService } from '../services/onboarding-document.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { ReviewDocumentDto } from '../dto/review-document.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Onboarding Sessions')
@ApiBearerAuth('keycloak-token')
@Controller('onboarding/sessions')
export class OnboardingSessionController {
  constructor(
    private readonly sessionService: OnboardingSessionService,
    private readonly documentService: OnboardingDocumentService,
  ) {}

  @Post()
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Initier une nouvelle session d\'onboarding',
    description: 'Instancie le parcours à partir d\'un modèle, clone les tâches DAG et génère le lien sécurisé Magic Link pour le candidat.',
  })
  @ApiResponse({ status: 201, description: 'Session initiée avec succès.' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') creatorId: string,
    @Body() dto: CreateSessionDto,
  ) {
    const session = await this.sessionService.createSession(companyId, dto, creatorId);
    return {
      success: true,
      message: 'Session d\'onboarding initiée avec succès',
      data: session,
    };
  }

  @Get()
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Lister les sessions d\'onboarding de l\'entreprise' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut (INVITED, IN_REVIEW, READY_FOR_DAY_ONE...)' })
  async findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('status') status?: string,
  ) {
    const sessions = await this.sessionService.findAll(companyId, status);
    return {
      success: true,
      data: sessions,
    };
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Obtenir le détail complet d\'une session d\'onboarding' })
  @ApiParam({ name: 'id', description: 'UUID de la session' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    const session = await this.sessionService.findOne(companyId, id);
    return {
      success: true,
      data: session,
    };
  }

  @Put(':id/tasks/:taskId')
  @Roles({ roles: ['realm:admin', 'realm:manager', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Mettre à jour le statut d\'une tâche d\'onboarding',
    description: 'Valide ou rejette une tâche. Vérifie automatiquement les dépendances du graphe DAG.',
  })
  async updateTask(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const updatedTask = await this.sessionService.updateTaskStatus(companyId, sessionId, taskId, userId, dto);
    return {
      success: true,
      message: 'Statut de la tâche mis à jour avec succès',
      data: updatedTask,
    };
  }

  @Post(':id/documents/:docId/review')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Examiner et valider/rejeter une pièce justificative',
    description: 'Permet aux RH ou HSE de valider ou rejeter un document (CNI, RIB, Certificat médical) avec motif.',
  })
  async reviewDocument(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') reviewerId: string,
    @Param('docId') docId: string,
    @Body() dto: ReviewDocumentDto,
  ) {
    const reviewed = await this.documentService.reviewDocument(companyId, docId, reviewerId, dto);
    return {
      success: true,
      message: dto.status === 'VALIDATED' ? 'Document validé avec succès' : 'Document rejeté',
      data: reviewed,
    };
  }

  @Post(':id/approve-provision')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({
    summary: 'Approuver la revue et déclencher le provisionnement (READY_FOR_DAY_ONE)',
    description: 'Valide le passage en provisionnement, calcule les parts fiscales, crée la fiche employé, le code PIN Kiosque et le solde de congés.',
  })
  async approveReviewAndProvision(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') reviewerId: string,
    @Param('id') sessionId: string,
  ) {
    const result = await this.sessionService.approveReviewAndProvision(companyId, sessionId, reviewerId);
    return {
      success: true,
      message: 'Dossier approuvé et collaborateur provisionné pour le Jour J',
      data: result,
    };
  }

  @Post(':id/cancel')
  @Roles({ roles: ['realm:admin', 'realm:super_admin'] })
  @ApiOperation({ summary: 'Annuler une session d\'onboarding' })
  async cancel(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
    @Body() body: { reason: string },
  ) {
    const result = await this.sessionService.cancelSession(companyId, sessionId, body.reason || 'Annulation administrative', userId);
    return {
      success: true,
      message: 'Session d\'onboarding annulée',
      data: result,
    };
  }
}
