import { Controller, Get, Post, Body, Param, Req, Ip } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OnboardingSessionService } from '../services/onboarding-session.service';
import { OnboardingDocumentService } from '../services/onboarding-document.service';
import { SubmitCandidateDataDto } from '../dto/submit-candidate-data.dto';

@ApiTags('Onboarding Candidate Portal')
@Controller('onboarding/candidate')
export class OnboardingCandidateController {
  constructor(
    private readonly sessionService: OnboardingSessionService,
    private readonly documentService: OnboardingDocumentService,
  ) {}

  @Public()
  @Get(':token')
  @ApiOperation({
    summary: 'Consulter le portail d\'accueil d\'onboarding via Magic Link',
    description: 'Accès sécurisé pour le futur collaborateur avec token à usage unique sans nécessiter de compte préalable.',
  })
  @ApiParam({ name: 'token', description: 'Token cryptographique reçu par SMS ou email' })
  @ApiResponse({ status: 200, description: 'Données de la session et liste des tâches à accomplir.' })
  @ApiResponse({ status: 404, description: 'Lien invalide ou introuvable.' })
  async getCandidateSession(
    @Param('token') token: string,
    @Ip() clientIp: string,
  ) {
    const session = await this.sessionService.findByToken(token, clientIp);
    return {
      success: true,
      data: session,
    };
  }

  @Public()
  @Post(':token/submit')
  @ApiOperation({
    summary: 'Soumettre les informations personnelles, familiales et fiscales',
    description: 'Enregistre les données saisies par le candidat (situation familiale pour le calcul des parts fiscales, contact d\'urgence, RIB).',
  })
  async submitData(
    @Param('token') token: string,
    @Body() dto: SubmitCandidateDataDto,
    @Ip() clientIp: string,
  ) {
    const session = await this.sessionService.submitCandidateData(token, dto, clientIp);
    return {
      success: true,
      message: 'Vos informations ont été transmises avec succès à l\'équipe RH',
      data: session,
    };
  }

  @Public()
  @Post(':token/documents')
  @ApiOperation({
    summary: 'Enregistrer une pièce justificative téléversée par le candidat',
    description: 'Enregistre les métadonnées du document (CNI, RIB, Certificat médical) dans le coffre-fort de la session.',
  })
  async registerDocument(
    @Param('token') token: string,
    @Body() body: {
      documentType: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      storageKey: string;
    },
    @Ip() clientIp: string,
  ) {
    const session = await this.sessionService.findByToken(token, clientIp);
    const doc = await this.documentService.registerDocument({
      companyId: session.companyId,
      sessionId: session.id,
      documentType: body.documentType,
      fileName: body.fileName,
      fileSize: body.fileSize || 0,
      mimeType: body.mimeType || 'application/pdf',
      storageKey: body.storageKey,
      uploadedBy: 'CANDIDATE',
    });

    return {
      success: true,
      message: 'Document téléversé avec succès',
      data: doc,
    };
  }
}
