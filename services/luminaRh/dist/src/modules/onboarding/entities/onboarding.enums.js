"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.DocumentStatus = exports.DocumentType = exports.TaskStatus = exports.TargetRole = exports.TaskCategory = exports.OnboardingStatus = void 0;
var OnboardingStatus;
(function (OnboardingStatus) {
    OnboardingStatus["DRAFT"] = "DRAFT";
    OnboardingStatus["INVITED"] = "INVITED";
    OnboardingStatus["COLLECTING_DATA"] = "COLLECTING_DATA";
    OnboardingStatus["IN_REVIEW"] = "IN_REVIEW";
    OnboardingStatus["PROVISIONING"] = "PROVISIONING";
    OnboardingStatus["READY_FOR_DAY_ONE"] = "READY_FOR_DAY_ONE";
    OnboardingStatus["IN_ORIENTATION"] = "IN_ORIENTATION";
    OnboardingStatus["COMPLETED"] = "COMPLETED";
    OnboardingStatus["CANCELLED"] = "CANCELLED";
})(OnboardingStatus || (exports.OnboardingStatus = OnboardingStatus = {}));
var TaskCategory;
(function (TaskCategory) {
    TaskCategory["ADMINISTRATIVE"] = "administrative";
    TaskCategory["LEGAL"] = "legal";
    TaskCategory["HSE_SECURITY"] = "hse_security";
    TaskCategory["IT_ACCESS"] = "it_access";
    TaskCategory["TRAINING"] = "training";
})(TaskCategory || (exports.TaskCategory = TaskCategory = {}));
var TargetRole;
(function (TargetRole) {
    TargetRole["CANDIDATE"] = "candidate";
    TargetRole["HR_ADMIN"] = "hr_admin";
    TargetRole["MANAGER"] = "manager";
    TargetRole["HSE_OFFICER"] = "hse_officer";
    TargetRole["IT_ADMIN"] = "it_admin";
})(TargetRole || (exports.TargetRole = TargetRole = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["DONE"] = "DONE";
    TaskStatus["REJECTED"] = "REJECTED";
    TaskStatus["SKIPPED"] = "SKIPPED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["CNI"] = "cni";
    DocumentType["PASSPORT"] = "passport";
    DocumentType["RIB"] = "rib";
    DocumentType["IPRES_AFFILIATION"] = "ipres_affiliation";
    DocumentType["CSS_AFFILIATION"] = "css_affiliation";
    DocumentType["MEDICAL_CERTIFICATE"] = "medical_certificate";
    DocumentType["DIPLOMA"] = "diploma";
    DocumentType["CRIMINAL_RECORD"] = "criminal_record";
    DocumentType["CONTRACT_SIGNED"] = "contract_signed";
    DocumentType["EPI_RECEIPT"] = "epi_receipt";
    DocumentType["OTHER"] = "other";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "PENDING";
    DocumentStatus["VALIDATED"] = "VALIDATED";
    DocumentStatus["REJECTED"] = "REJECTED";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["SESSION_CREATED"] = "SESSION_CREATED";
    AuditAction["MAGIC_LINK_GENERATED"] = "MAGIC_LINK_GENERATED";
    AuditAction["MAGIC_LINK_OPENED"] = "MAGIC_LINK_OPENED";
    AuditAction["DATA_SUBMITTED"] = "DATA_SUBMITTED";
    AuditAction["DOCUMENT_UPLOADED"] = "DOCUMENT_UPLOADED";
    AuditAction["DOCUMENT_REVIEWED"] = "DOCUMENT_REVIEWED";
    AuditAction["TASK_UPDATED"] = "TASK_UPDATED";
    AuditAction["STATUS_CHANGED"] = "STATUS_CHANGED";
    AuditAction["PROVISIONING_TRIGGERED"] = "PROVISIONING_TRIGGERED";
    AuditAction["SESSION_COMPLETED"] = "SESSION_COMPLETED";
    AuditAction["SESSION_CANCELLED"] = "SESSION_CANCELLED";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
//# sourceMappingURL=onboarding.enums.js.map