"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingAuditAction = exports.OffboardingTaskStatus = exports.OffboardingTargetRole = exports.OffboardingTaskCategory = exports.NoticePeriodType = exports.DepartureReason = exports.OffboardingStatus = void 0;
var OffboardingStatus;
(function (OffboardingStatus) {
    OffboardingStatus["INITIATED"] = "INITIATED";
    OffboardingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OffboardingStatus["PENDING_DOCUMENTS"] = "PENDING_DOCUMENTS";
    OffboardingStatus["COMPLETED"] = "COMPLETED";
    OffboardingStatus["CANCELLED"] = "CANCELLED";
})(OffboardingStatus || (exports.OffboardingStatus = OffboardingStatus = {}));
var DepartureReason;
(function (DepartureReason) {
    DepartureReason["RESIGNATION"] = "RESIGNATION";
    DepartureReason["DISMISSAL"] = "DISMISSAL";
    DepartureReason["END_OF_CONTRACT"] = "END_OF_CONTRACT";
    DepartureReason["TRIAL_PERIOD_TERMINATION"] = "TRIAL_PERIOD_TERMINATION";
    DepartureReason["MUTUAL_AGREEMENT"] = "MUTUAL_AGREEMENT";
    DepartureReason["RETIREMENT"] = "RETIREMENT";
    DepartureReason["OTHER"] = "OTHER";
})(DepartureReason || (exports.DepartureReason = DepartureReason = {}));
var NoticePeriodType;
(function (NoticePeriodType) {
    NoticePeriodType["WORKED"] = "WORKED";
    NoticePeriodType["EXEMPTED_PAID"] = "EXEMPTED_PAID";
    NoticePeriodType["EXEMPTED_UNPAID"] = "EXEMPTED_UNPAID";
    NoticePeriodType["NONE"] = "NONE";
})(NoticePeriodType || (exports.NoticePeriodType = NoticePeriodType = {}));
var OffboardingTaskCategory;
(function (OffboardingTaskCategory) {
    OffboardingTaskCategory["IT"] = "it";
    OffboardingTaskCategory["SECURITY"] = "security";
    OffboardingTaskCategory["HR"] = "hr";
    OffboardingTaskCategory["FINANCE"] = "finance";
    OffboardingTaskCategory["MANAGER"] = "manager";
    OffboardingTaskCategory["LOGISTICS"] = "logistics";
    OffboardingTaskCategory["ADMINISTRATIVE"] = "administrative";
})(OffboardingTaskCategory || (exports.OffboardingTaskCategory = OffboardingTaskCategory = {}));
var OffboardingTargetRole;
(function (OffboardingTargetRole) {
    OffboardingTargetRole["ADMIN"] = "admin";
    OffboardingTargetRole["MANAGER"] = "manager";
    OffboardingTargetRole["IT"] = "it";
    OffboardingTargetRole["HR"] = "hr";
    OffboardingTargetRole["EMPLOYEE"] = "employee";
})(OffboardingTargetRole || (exports.OffboardingTargetRole = OffboardingTargetRole = {}));
var OffboardingTaskStatus;
(function (OffboardingTaskStatus) {
    OffboardingTaskStatus["PENDING"] = "PENDING";
    OffboardingTaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OffboardingTaskStatus["COMPLETED"] = "COMPLETED";
    OffboardingTaskStatus["WAIVED"] = "WAIVED";
})(OffboardingTaskStatus || (exports.OffboardingTaskStatus = OffboardingTaskStatus = {}));
var OffboardingAuditAction;
(function (OffboardingAuditAction) {
    OffboardingAuditAction["SESSION_CREATED"] = "SESSION_CREATED";
    OffboardingAuditAction["STATUS_CHANGED"] = "STATUS_CHANGED";
    OffboardingAuditAction["TASK_UPDATED"] = "TASK_UPDATED";
    OffboardingAuditAction["TASK_COMPLETED"] = "TASK_COMPLETED";
    OffboardingAuditAction["TASK_WAIVED"] = "TASK_WAIVED";
    OffboardingAuditAction["EXIT_INTERVIEW_SAVED"] = "EXIT_INTERVIEW_SAVED";
    OffboardingAuditAction["HANDOVER_NOTES_SAVED"] = "HANDOVER_NOTES_SAVED";
    OffboardingAuditAction["SESSION_COMPLETED"] = "SESSION_COMPLETED";
    OffboardingAuditAction["SESSION_CANCELLED"] = "SESSION_CANCELLED";
})(OffboardingAuditAction || (exports.OffboardingAuditAction = OffboardingAuditAction = {}));
//# sourceMappingURL=offboarding.enums.js.map