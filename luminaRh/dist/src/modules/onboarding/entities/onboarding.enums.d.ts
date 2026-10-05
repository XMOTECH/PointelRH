export declare enum OnboardingStatus {
    DRAFT = "DRAFT",
    INVITED = "INVITED",
    COLLECTING_DATA = "COLLECTING_DATA",
    IN_REVIEW = "IN_REVIEW",
    PROVISIONING = "PROVISIONING",
    READY_FOR_DAY_ONE = "READY_FOR_DAY_ONE",
    IN_ORIENTATION = "IN_ORIENTATION",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum TaskCategory {
    ADMINISTRATIVE = "administrative",
    LEGAL = "legal",
    HSE_SECURITY = "hse_security",
    IT_ACCESS = "it_access",
    TRAINING = "training"
}
export declare enum TargetRole {
    CANDIDATE = "candidate",
    HR_ADMIN = "hr_admin",
    MANAGER = "manager",
    HSE_OFFICER = "hse_officer",
    IT_ADMIN = "it_admin"
}
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE",
    REJECTED = "REJECTED",
    SKIPPED = "SKIPPED"
}
export declare enum DocumentType {
    CNI = "cni",
    PASSPORT = "passport",
    RIB = "rib",
    IPRES_AFFILIATION = "ipres_affiliation",
    CSS_AFFILIATION = "css_affiliation",
    MEDICAL_CERTIFICATE = "medical_certificate",
    DIPLOMA = "diploma",
    CRIMINAL_RECORD = "criminal_record",
    CONTRACT_SIGNED = "contract_signed",
    EPI_RECEIPT = "epi_receipt",
    OTHER = "other"
}
export declare enum DocumentStatus {
    PENDING = "PENDING",
    VALIDATED = "VALIDATED",
    REJECTED = "REJECTED"
}
export declare enum AuditAction {
    SESSION_CREATED = "SESSION_CREATED",
    MAGIC_LINK_GENERATED = "MAGIC_LINK_GENERATED",
    MAGIC_LINK_OPENED = "MAGIC_LINK_OPENED",
    DATA_SUBMITTED = "DATA_SUBMITTED",
    DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",
    DOCUMENT_REVIEWED = "DOCUMENT_REVIEWED",
    TASK_UPDATED = "TASK_UPDATED",
    STATUS_CHANGED = "STATUS_CHANGED",
    PROVISIONING_TRIGGERED = "PROVISIONING_TRIGGERED",
    SESSION_COMPLETED = "SESSION_COMPLETED",
    SESSION_CANCELLED = "SESSION_CANCELLED"
}
