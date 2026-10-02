"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillCategory = exports.ObjectiveStatus = exports.ObjectiveCategory = exports.TemplateCategory = exports.CampaignStatus = exports.EvaluationStatus = void 0;
var EvaluationStatus;
(function (EvaluationStatus) {
    EvaluationStatus["NOT_STARTED"] = "NOT_STARTED";
    EvaluationStatus["SELF_EVALUATION"] = "SELF_EVALUATION";
    EvaluationStatus["MANAGER_REVIEW"] = "MANAGER_REVIEW";
    EvaluationStatus["CALIBRATION"] = "CALIBRATION";
    EvaluationStatus["COMPLETED"] = "COMPLETED";
    EvaluationStatus["CANCELLED"] = "CANCELLED";
})(EvaluationStatus || (exports.EvaluationStatus = EvaluationStatus = {}));
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["DRAFT"] = "DRAFT";
    CampaignStatus["ACTIVE"] = "ACTIVE";
    CampaignStatus["CLOSED"] = "CLOSED";
    CampaignStatus["ARCHIVED"] = "ARCHIVED";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
var TemplateCategory;
(function (TemplateCategory) {
    TemplateCategory["ANNUAL"] = "ANNUAL";
    TemplateCategory["PROBATION"] = "PROBATION";
    TemplateCategory["PROFESSIONAL"] = "PROFESSIONAL";
    TemplateCategory["QUARTERLY"] = "QUARTERLY";
})(TemplateCategory || (exports.TemplateCategory = TemplateCategory = {}));
var ObjectiveCategory;
(function (ObjectiveCategory) {
    ObjectiveCategory["INDIVIDUAL"] = "INDIVIDUAL";
    ObjectiveCategory["TEAM"] = "TEAM";
    ObjectiveCategory["STRATEGIC"] = "STRATEGIC";
})(ObjectiveCategory || (exports.ObjectiveCategory = ObjectiveCategory = {}));
var ObjectiveStatus;
(function (ObjectiveStatus) {
    ObjectiveStatus["NOT_STARTED"] = "NOT_STARTED";
    ObjectiveStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ObjectiveStatus["ACHIEVED"] = "ACHIEVED";
    ObjectiveStatus["EXCEEDED"] = "EXCEEDED";
    ObjectiveStatus["CANCELLED"] = "CANCELLED";
})(ObjectiveStatus || (exports.ObjectiveStatus = ObjectiveStatus = {}));
var SkillCategory;
(function (SkillCategory) {
    SkillCategory["TECHNICAL"] = "TECHNICAL";
    SkillCategory["SOFT"] = "SOFT";
    SkillCategory["LEADERSHIP"] = "LEADERSHIP";
})(SkillCategory || (exports.SkillCategory = SkillCategory = {}));
//# sourceMappingURL=performance.enums.js.map