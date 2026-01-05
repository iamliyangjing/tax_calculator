// 税率表类型
export interface TaxRate {
  min: number;      // 应纳税所得额下限
  max: number | null; // 应纳税所得额上限，null表示无上限
  rate: number;     // 税率
  quickDeduction: number; // 速算扣除数
}

// 专项附加扣除类型
export interface SpecialDeduction {
  childrenEducation: number;        // 子女教育
  continuingEducation: number;      // 继续教育
  majorDiseaseMedical: number;      // 大病医疗
  housingLoanInterest: number;      // 住房贷款利息
  housingRent: number;              // 住房租金
  supportingElderly: number;        // 赡养老人
}

// 社保输入方式枚举
export enum SocialSecurityInputType {
  Ratio = 'ratio',      // 按比例计算
  FixedAmount = 'fixed' // 固定金额
}

// 年终奖计税方式枚举
export enum BonusTaxType {
  Separate = 'separate',     // 单独计税
  Integrated = 'integrated'  // 并入综合所得计税
}

// 税收计算输入类型
export interface TaxInput {
  monthlySalary: number;                   // 月工资收入
  monthlyOtherIncome: number;              // 其他月度收入（如交通补贴等）
  housingFundRatio: number;                // 公积金缴纳比例（个人）
  socialSecurityInputType: SocialSecurityInputType; // 社保输入方式
  socialSecurityRatio: number;             // 社保缴纳比例（个人）
  socialSecurityFixed: number;             // 社保固定金额（个人）
  specialDeduction: SpecialDeduction;      // 专项附加扣除
  otherDeduction: number;                  // 其他扣除项
  yearEndBonus: number;                    // 年终奖金额
  bonusTaxType: BonusTaxType;              // 年终奖计税方式
}

// 每月税收计算结果类型
export interface MonthlyTaxResult {
  month: number;                   // 月份
  taxableIncome: number;           // 应纳税所得额
  taxAmount: number;               // 应纳税额
  cumulativeTaxableIncome: number; // 累计应纳税所得额
  cumulativeTaxAmount: number;     // 累计应纳税额
}

// 年度税收汇总结果类型
export interface AnnualTaxResult {
  totalTaxableIncome: number;      // 年度应纳税所得额
  totalTaxAmount: number;          // 年度应纳税额
  refundableTax: number;           // 退/补税额（正数为退，负数为补）
  monthlyResults: MonthlyTaxResult[]; // 每月计算结果
  // 年终奖相关结果
  bonusTaxAmount: number;          // 年终奖应纳税额
  bonusTaxableIncome: number;      // 年终奖应纳税所得额
  totalWithBonusTax: number;       // 包含年终奖的总应纳税额
  // 最优计税方式推荐
  recommendedBonusTaxType?: BonusTaxType; // 推荐的年终奖计税方式
  recommendedTaxAmount?: number;          // 推荐方式下的总应纳税额
  taxSavings?: number;                    // 推荐方式下的节税额
  separateTaxAmount?: number;             // 单独计税方式下的总应纳税额
  integratedTaxAmount?: number;           // 并入综合所得计税方式下的总应纳税额
}

// 综合税收计算结果类型
export interface TaxCalculationResult {
  monthlyTax: number;              // 当月应扣税额
  annualResult: AnnualTaxResult;   // 年度计算结果
}