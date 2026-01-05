import { TaxInput, TaxCalculationResult, MonthlyTaxResult, AnnualTaxResult } from '../types';
import { TAX_RATES, 起征点 } from './constants';

// 根据应纳税所得额计算税额
const calculateTaxAmount = (taxableIncome: number): number => {
  // 查找适用的税率级别
  const applicableRate = TAX_RATES.find(rate => {
    if (rate.max === null) {
      return taxableIncome >= rate.min;
    }
    return taxableIncome >= rate.min && taxableIncome < rate.max;
  });

  if (!applicableRate) {
    return 0;
  }

  // 计算税额：应纳税所得额 × 税率 - 速算扣除数
  return taxableIncome * applicableRate.rate - applicableRate.quickDeduction;
};

// 计算每月应纳税所得额
const calculateMonthlyTaxableIncome = (
  monthlySalary: number,
  monthlyOtherIncome: number,
  housingFundRatio: number,
  socialSecurityInputType: string,
  socialSecurityRatio: number,
  socialSecurityFixed: number,
  specialDeductionAmount: number,
  otherDeduction: number
): number => {
  // 计算月度总收入
  const totalMonthlyIncome = monthlySalary + monthlyOtherIncome;
  
  // 计算社保扣除（支持两种方式）
  const socialSecurity = socialSecurityInputType === 'fixed' 
    ? socialSecurityFixed 
    : totalMonthlyIncome * socialSecurityRatio;
  
  // 计算公积金扣除
  const housingFund = totalMonthlyIncome * housingFundRatio;
  
  // 计算总扣除
  const totalDeduction = 起征点 + socialSecurity + housingFund + specialDeductionAmount + otherDeduction;
  
  // 应纳税所得额 = 月度总收入 - 各项扣除
  const taxableIncome = totalMonthlyIncome - totalDeduction;
  
  // 应纳税所得额不能为负数
  return Math.max(0, taxableIncome);
};

// 计算专项附加扣除总额
const calculateSpecialDeductionTotal = (specialDeduction: TaxInput['specialDeduction']): number => {
  return (
    specialDeduction.childrenEducation +
    specialDeduction.continuingEducation +
    specialDeduction.大病医疗 +
    specialDeduction.housingLoanInterest +
    specialDeduction.housingRent +
    specialDeduction.supportingElderly
  );
};

// 计算年终奖应纳税额（单独计税方式）
const calculateBonusTaxSeparate = (bonusAmount: number): number => {
  if (bonusAmount <= 0) {
    return 0;
  }
  
  // 年终奖除以12个月，确定适用税率和速算扣除数
  const monthlyBonus = bonusAmount / 12;
  
  // 查找适用的税率级别
  const applicableRate = TAX_RATES.find(rate => {
    if (rate.max === null) {
      return monthlyBonus >= rate.min;
    }
    return monthlyBonus >= rate.min && monthlyBonus < rate.max;
  });
  
  if (!applicableRate) {
    return 0;
  }
  
  // 计算年终奖应纳税额
  return bonusAmount * applicableRate.rate - applicableRate.quickDeduction;
};

// 计算年度税收
const calculateAnnualTax = (input: TaxInput): AnnualTaxResult => {
  const { 
    monthlySalary, 
    monthlyOtherIncome, 
    housingFundRatio, 
    socialSecurityInputType, 
    socialSecurityRatio, 
    socialSecurityFixed, 
    specialDeduction, 
    otherDeduction,
    yearEndBonus,
    bonusTaxType 
  } = input;
  
  const monthlySpecialDeduction = calculateSpecialDeductionTotal(specialDeduction);
  
  // 计算每月应纳税所得额
  const monthlyTaxableIncome = calculateMonthlyTaxableIncome(
    monthlySalary,
    monthlyOtherIncome,
    housingFundRatio,
    socialSecurityInputType,
    socialSecurityRatio,
    socialSecurityFixed,
    monthlySpecialDeduction,
    otherDeduction
  );
  
  const monthlyResults: MonthlyTaxResult[] = [];
  let cumulativeTaxableIncome = 0;
  let cumulativeTaxAmount = 0;
  
  // 计算12个月的税收
  for (let month = 1; month <= 12; month++) {
    // 累计应纳税所得额
    cumulativeTaxableIncome += monthlyTaxableIncome;
    
    // 计算累计应纳税额
    const currentCumulativeTax = calculateTaxAmount(cumulativeTaxableIncome);
    
    // 当月应纳税额 = 累计应纳税额 - 上月累计应纳税额
    const monthlyTax = currentCumulativeTax - cumulativeTaxAmount;
    
    // 更新累计应纳税额
    cumulativeTaxAmount = currentCumulativeTax;
    
    monthlyResults.push({
      month,
      taxableIncome: monthlyTaxableIncome,
      taxAmount: Math.max(0, monthlyTax), // 确保税额不为负数
      cumulativeTaxableIncome,
      cumulativeTaxAmount
    });
  }
  
  // 年度应纳税所得额（不含年终奖）
  const totalTaxableIncome = cumulativeTaxableIncome;
  
  // 年度应纳税额（不含年终奖）
  const totalTaxAmount = cumulativeTaxAmount;
  
  // 计算年终奖税收
  let bonusTaxAmount = 0;
  let bonusTaxableIncome = 0;
  let totalWithBonusTax = totalTaxAmount;
  
  if (yearEndBonus > 0) {
    if (bonusTaxType === 'separate') {
      // 年终奖单独计税
      bonusTaxAmount = calculateBonusTaxSeparate(yearEndBonus);
      bonusTaxableIncome = yearEndBonus;
      totalWithBonusTax = totalTaxAmount + bonusTaxAmount;
    } else {
      // 年终奖并入综合所得计税
      const totalTaxableIncomeWithBonus = totalTaxableIncome + yearEndBonus;
      const totalTaxAmountWithBonus = calculateTaxAmount(totalTaxableIncomeWithBonus);
      bonusTaxAmount = totalTaxAmountWithBonus - totalTaxAmount;
      bonusTaxableIncome = yearEndBonus;
      totalWithBonusTax = totalTaxAmountWithBonus;
    }
  }
  
  // 假设每月已预缴税额等于计算的每月税额，那么年度汇算清缴时退/补税额为0
  // 实际应用中，这里需要根据实际预缴情况计算
  const refundableTax = 0;
  
  return {
    totalTaxableIncome,
    totalTaxAmount,
    refundableTax,
    monthlyResults,
    bonusTaxAmount,
    bonusTaxableIncome,
    totalWithBonusTax
  };
};

// 主税收计算函数
export const calculateTax = (input: TaxInput): TaxCalculationResult => {
  // 计算年度税收结果
  const annualResult = calculateAnnualTax(input);
  
  // 获取当月（第1个月）的应扣税额
  const monthlyTax = annualResult.monthlyResults[0].taxAmount;
  
  return {
    monthlyTax,
    annualResult
  };
};