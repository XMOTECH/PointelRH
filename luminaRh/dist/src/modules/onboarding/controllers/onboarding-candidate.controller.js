"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingCandidateController = void 0;
const common_1 = require("@nestjs/common");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const swagger_1 = require("@nestjs/swagger");
const onboarding_session_service_1 = require("../services/onboarding-session.service");
const onboarding_document_service_1 = require("../services/onboarding-document.service");
const submit_candidate_data_dto_1 = require("../dto/submit-candidate-data.dto");
let OnboardingCandidateController = class OnboardingCandidateController {
    sessionService;
    documentService;
    constructor(sessionService, documentService) {
        this.sessionService = sessionService;
        this.documentService = documentService;
    }
    async getCandidateSession(token, clientIp) {
        const session = await this.sessionService.findByToken(token, clientIp);
        return {
            success: true,
            data: session,
        };
    }
    async submitData(token, dto, clientIp) {
        const session = await this.sessionService.submitCandidateData(token, dto, clientIp);
        return {
            success: true,
            message: 'Vos informations ont été transmises avec succès à l\'équipe RH',
            data: session,
        };
    }
    async registerDocument(token, body, clientIp) {
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
};
exports.OnboardingCandidateController = OnboardingCandidateController;
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Get)(':token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter le portail d\'accueil d\'onboarding via Magic Link',
        description: 'Accès sécurisé pour le futur collaborateur avec token à usage unique sans nécessiter de compte préalable.',
    }),
    (0, swagger_1.ApiParam)({ name: 'token', description: 'Token cryptographique reçu par SMS ou email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Données de la session et liste des tâches à accomplir.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lien invalide ou introuvable.' }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OnboardingCandidateController.prototype, "getCandidateSession", null);
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)(':token/submit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Soumettre les informations personnelles, familiales et fiscales',
        description: 'Enregistre les données saisies par le candidat (situation familiale pour le calcul des parts fiscales, contact d\'urgence, RIB).',
    }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_candidate_data_dto_1.SubmitCandidateDataDto, String]),
    __metadata("design:returntype", Promise)
], OnboardingCandidateController.prototype, "submitData", null);
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)(':token/documents'),
    (0, swagger_1.ApiOperation)({
        summary: 'Enregistrer une pièce justificative téléversée par le candidat',
        description: 'Enregistre les métadonnées du document (CNI, RIB, Certificat médical) dans le coffre-fort de la session.',
    }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], OnboardingCandidateController.prototype, "registerDocument", null);
exports.OnboardingCandidateController = OnboardingCandidateController = __decorate([
    (0, swagger_1.ApiTags)('Onboarding Candidate Portal'),
    (0, common_1.Controller)('onboarding/candidate'),
    __metadata("design:paramtypes", [onboarding_session_service_1.OnboardingSessionService,
        onboarding_document_service_1.OnboardingDocumentService])
], OnboardingCandidateController);
//# sourceMappingURL=onboarding-candidate.controller.js.map