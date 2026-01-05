import { TaxRate } from '../types';

// 个人所得税税率表（综合所得适用）
export const TAX_RATES: TaxRate[] = [
  { min: 0, max: 36000, rate: 0.03, quickDeduction: 0 },
  { min: 36000, max: 144000, rate: 0.1, quickDeduction: 2520 },
  { min: 144000, max: 300000, rate: 0.2, quickDeduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, quickDeduction: 31920 },
  { min: 420000, max: 660000, rate: 0.3, quickDeduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, quickDeduction: 85920 },
  { min: 960000, max: null, rate: 0.45, quickDeduction: 181920 },
];

// 起征点
export const 起征点 = 5000;

// 社保缴纳比例参考值（个人部分）
export const DEFAULT_SOCIAL_SECURITY_RATIO = 0.105; // 养老8% + 医疗2% + 失业0.5%

// 公积金缴纳比例参考值（个人部分）
export const DEFAULT_HOUSING_FUND_RATIO = 0.12; // 公积金12%

// 专项附加扣除参考值
export const DEFAULT_SPECIAL_DEDUCTION = {
  childrenEducation: 0,
  continuingEducation: 0,
  majorDiseaseMedical: 0,
  housingLoanInterest: 0,
  housingRent: 0,
  supportingElderly: 0,
};

// 其他收入默认值
export const DEFAULT_MONTHLY_OTHER_INCOME = 0;

// 社保固定金额默认值
export const DEFAULT_SOCIAL_SECURITY_FIXED = 0;

// 年终奖默认值
export const DEFAULT_YEAR_END_BONUS = 0;