import { SocialContributionsBreakdown } from './payroll-engine.types';
export declare class SenegalSocialCalculator {
    static calculate(grossCotisable: number, grossTaxable: number, isCadre?: boolean, customCssAtRate?: number): SocialContributionsBreakdown;
}
