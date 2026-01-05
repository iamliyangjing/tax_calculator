import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaxInput } from '../types';
import { 
  DEFAULT_HOUSING_FUND_RATIO, 
  DEFAULT_SOCIAL_SECURITY_RATIO, 
  DEFAULT_SPECIAL_DEDUCTION,
  DEFAULT_MONTHLY_OTHER_INCOME,
  DEFAULT_SOCIAL_SECURITY_FIXED,
  DEFAULT_YEAR_END_BONUS
} from '../utils/constants';
import { 
  getAllSchemes, 
  saveScheme, 
  loadScheme,
  CalculationScheme 
} from '../utils/schemeStorage';

// 表单验证schema
const formSchema = z.object({
  monthlySalary: z.number().min(0, '月工资收入不能为负数'),
  monthlyOtherIncome: z.number().min(0, '其他收入不能为负数'),
  housingFundRatio: z.number().min(0, '公积金比例不能为负数').max(1, '公积金比例不能超过100%'),
  socialSecurityInputType: z.enum(['ratio', 'fixed']),
  socialSecurityRatio: z.number().min(0, '社保比例不能为负数').max(1, '社保比例不能超过100%'),
  socialSecurityFixed: z.number().min(0, '社保固定金额不能为负数'),
  specialDeduction: z.object({
    childrenEducation: z.number().min(0, '子女教育扣除不能为负数'),
    continuingEducation: z.number().min(0, '继续教育扣除不能为负数'),
    majorDiseaseMedical: z.number().min(0, '大病医疗扣除不能为负数'),
    housingLoanInterest: z.number().min(0, '住房贷款利息扣除不能为负数'),
    housingRent: z.number().min(0, '住房租金扣除不能为负数'),
    supportingElderly: z.number().min(0, '赡养老人扣除不能为负数'),
  }),
  otherDeduction: z.number().min(0, '其他扣除不能为负数'),
  yearEndBonus: z.number().min(0, '年终奖不能为负数'),
  bonusTaxType: z.enum(['separate', 'integrated']),
});

// 表单数据类型
type FormData = z.infer<typeof formSchema>;

interface InputFormProps {
  onCalculate: (data: TaxInput) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onCalculate }) => {
  // 状态管理
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [schemeName, setSchemeName] = useState('');
  const [schemes, setSchemes] = useState<CalculationScheme[]>(getAllSchemes());
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlySalary: 10000,
      monthlyOtherIncome: DEFAULT_MONTHLY_OTHER_INCOME,
      housingFundRatio: DEFAULT_HOUSING_FUND_RATIO,
      socialSecurityInputType: 'ratio',
      socialSecurityRatio: DEFAULT_SOCIAL_SECURITY_RATIO,
      socialSecurityFixed: DEFAULT_SOCIAL_SECURITY_FIXED,
      specialDeduction: DEFAULT_SPECIAL_DEDUCTION,
      otherDeduction: 0,
      yearEndBonus: DEFAULT_YEAR_END_BONUS,
      bonusTaxType: 'separate',
    },
  });

  // 表单数据
  const formData = watch();
  
  // 实时计算：当表单数据变化时自动计算
  React.useEffect(() => {
    // 延迟计算，避免频繁触发
    const timer = setTimeout(() => {
      // 验证表单数据
      const validationResult = formSchema.safeParse(formData);
      if (validationResult.success) {
        // 将表单数据转换为TaxInput类型，处理枚举类型转换
        const taxInput = {
          ...validationResult.data,
          socialSecurityInputType: validationResult.data.socialSecurityInputType as any,
          bonusTaxType: validationResult.data.bonusTaxType as any
        };
        onCalculate(taxInput);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData, onCalculate]);

  const onSubmit = (data: FormData) => {
    // 将表单数据转换为TaxInput类型，处理枚举类型转换
    const taxInput = {
      ...data,
      socialSecurityInputType: data.socialSecurityInputType as any,
      bonusTaxType: data.bonusTaxType as any
    };
    onCalculate(taxInput);
  };
  
  // 保存方案
  const handleSaveScheme = () => {
    if (!schemeName.trim()) return;
    
    try {
      const taxInput: TaxInput = {
        ...formData,
        socialSecurityInputType: formData.socialSecurityInputType as any,
        bonusTaxType: formData.bonusTaxType as any
      };
      saveScheme(schemeName.trim(), taxInput);
      setSchemes(getAllSchemes());
      setShowSaveModal(false);
      setSchemeName('');
    } catch (error) {
      console.error('Failed to save scheme:', error);
    }
  };
  
  // 加载方案
  const handleLoadScheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schemeId = e.target.value;
    if (!schemeId) return;
    
    const loadedInput = loadScheme(schemeId);
    if (loadedInput) {
      reset(loadedInput);
      onCalculate(loadedInput);
    }
    
    // 重置选择
    e.target.value = '';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-gray-800">工资税收计算</h2>
      
      {/* 方案管理 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-3 text-gray-700">方案管理</h3>
        <div className="flex flex-wrap gap-3">
          {/* 保存方案按钮 */}
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm transition-colors duration-200"
          >
            保存当前方案
          </button>
          
          {/* 加载方案选择 */}
          <div className="flex items-center gap-2">
            <label htmlFor="loadScheme" className="text-sm text-gray-700">加载方案：</label>
            <select
              id="loadScheme"
              onChange={handleLoadScheme}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">-- 选择方案 --</option>
              {schemes.map(scheme => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.name} ({new Date(scheme.updatedAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 月工资收入 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="monthlySalary" className="block text-sm font-medium text-gray-700 mb-1">
              月工资收入 (元)
            </label>
            <input
              type="number"
              id="monthlySalary"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('monthlySalary', { valueAsNumber: true })}
            />
            {errors.monthlySalary && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlySalary.message}</p>
            )}
          </div>

          {/* 其他月度收入 */}
          <div>
            <label htmlFor="monthlyOtherIncome" className="block text-sm font-medium text-gray-700 mb-1">
              其他月度收入 (元) (如交通补贴、餐补等)
            </label>
            <input
              type="number"
              id="monthlyOtherIncome"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('monthlyOtherIncome', { valueAsNumber: true })}
            />
            {errors.monthlyOtherIncome && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyOtherIncome.message}</p>
            )}
          </div>

          {/* 公积金比例 */}
          <div>
            <label htmlFor="housingFundRatio" className="block text-sm font-medium text-gray-700 mb-1">
              公积金缴纳比例 (个人) {watch('housingFundRatio') * 100}%
            </label>
            <input
              type="range"
              id="housingFundRatio"
              min="0"
              max="1"
              step="0.01"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              {...register('housingFundRatio', { valueAsNumber: true })}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
            {errors.housingFundRatio && (
              <p className="mt-1 text-sm text-red-600">{errors.housingFundRatio.message}</p>
            )}
          </div>

          {/* 社保输入方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              社保缴纳方式
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="ratio"
                  {...register('socialSecurityInputType')}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">按比例计算</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="fixed"
                  {...register('socialSecurityInputType')}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">固定金额</span>
              </label>
            </div>
          </div>

          {/* 社保比例 */}
          {watch('socialSecurityInputType') === 'ratio' && (
            <div>
              <label htmlFor="socialSecurityRatio" className="block text-sm font-medium text-gray-700 mb-1">
                社保缴纳比例 (个人) {watch('socialSecurityRatio') * 100}%
              </label>
              <input
                type="range"
                id="socialSecurityRatio"
                min="0"
                max="1"
                step="0.01"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                {...register('socialSecurityRatio', { valueAsNumber: true })}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
              {errors.socialSecurityRatio && (
                <p className="mt-1 text-sm text-red-600">{errors.socialSecurityRatio.message}</p>
              )}
            </div>
          )}

          {/* 社保固定金额 */}
          {watch('socialSecurityInputType') === 'fixed' && (
            <div>
              <label htmlFor="socialSecurityFixed" className="block text-sm font-medium text-gray-700 mb-1">
                社保固定金额 (元)
              </label>
              <input
              type="number"
              id="socialSecurityFixed"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('socialSecurityFixed', { valueAsNumber: true })}
            />
              {errors.socialSecurityFixed && (
                <p className="mt-1 text-sm text-red-600">{errors.socialSecurityFixed.message}</p>
              )}
            </div>
          )}

          {/* 其他扣除 */}
          <div>
            <label htmlFor="otherDeduction" className="block text-sm font-medium text-gray-700 mb-1">
              其他扣除项 (元)
            </label>
            <input
              type="number"
              id="otherDeduction"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('otherDeduction', { valueAsNumber: true })}
            />
            {errors.otherDeduction && (
              <p className="mt-1 text-sm text-red-600">{errors.otherDeduction.message}</p>
            )}
          </div>
        </div>

        {/* 专项附加扣除 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">专项附加扣除 (元/月)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 子女教育 */}
            <div>
              <label htmlFor="childrenEducation" className="block text-sm font-medium text-gray-700 mb-1">
                子女教育
              </label>
              <input
              type="number"
              id="childrenEducation"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('specialDeduction.childrenEducation', { valueAsNumber: true })}
            />
              {errors.specialDeduction?.childrenEducation && (
                <p className="mt-1 text-sm text-red-600">{errors.specialDeduction.childrenEducation.message}</p>
              )}
            </div>

            {/* 继续教育 */}
            <div>
              <label htmlFor="continuingEducation" className="block text-sm font-medium text-gray-700 mb-1">
                继续教育
              </label>
              <input
              type="number"
              id="continuingEducation"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('specialDeduction.continuingEducation', { valueAsNumber: true })}
            />
              {errors.specialDeduction?.continuingEducation && (
                <p className="mt-1 text-sm text-red-600">{errors.specialDeduction.continuingEducation.message}</p>
              )}
            </div>

            {/* 大病医疗 */}
            <div>
              <label htmlFor="majorDiseaseMedical" className="block text-sm font-medium text-gray-700 mb-1">
                大病医疗
              </label>
              <input
              type="number"
              id="majorDiseaseMedical"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('specialDeduction.majorDiseaseMedical', { valueAsNumber: true })}
            />
              {errors.specialDeduction?.majorDiseaseMedical && (
                <p className="mt-1 text-sm text-red-600">{errors.specialDeduction.majorDiseaseMedical.message}</p>
              )}
            </div>

            {/* 住房贷款利息 */}
            <div>
              <label htmlFor="housingLoanInterest" className="block text-sm font-medium text-gray-700 mb-1">
                住房贷款利息
              </label>
              <input
              type="number"
              id="housingLoanInterest"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('specialDeduction.housingLoanInterest', { valueAsNumber: true })}
            />
              {errors.specialDeduction?.housingLoanInterest && (
                <p className="mt-1 text-sm text-red-600">{errors.specialDeduction.housingLoanInterest.message}</p>
              )}
            </div>

            {/* 住房租金 */}
            <div>
              <label htmlFor="housingRent" className="block text-sm font-medium text-gray-700 mb-1">
                住房租金
              </label>
              <input
              type="number"
              id="housingRent"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('specialDeduction.housingRent', { valueAsNumber: true })}
            />
              {errors.specialDeduction?.housingRent && (
                <p className="mt-1 text-sm text-red-600">{errors.specialDeduction.housingRent.message}</p>
              )}
            </div>

            {/* 赡养老人 */}
            <div>
              <label htmlFor="supportingElderly" className="block text-sm font-medium text-gray-700 mb-1">
                赡养老人
              </label>
              <input
              type="number"
              id="supportingElderly"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('specialDeduction.supportingElderly', { valueAsNumber: true })}
            />
              {errors.specialDeduction?.supportingElderly && (
                <p className="mt-1 text-sm text-red-600">{errors.specialDeduction.supportingElderly.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 年终奖 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">年终奖信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="yearEndBonus" className="block text-sm font-medium text-gray-700 mb-1">
                年终奖金额 (元)
              </label>
              <input
              type="number"
              id="yearEndBonus"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('yearEndBonus', { valueAsNumber: true })}
            />
              {errors.yearEndBonus && (
                <p className="mt-1 text-sm text-red-600">{errors.yearEndBonus.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年终奖计税方式
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="separate"
                    {...register('bonusTaxType')}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">单独计税</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="integrated"
                    {...register('bonusTaxType')}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">并入综合所得</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 计算按钮 */}
        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
          >
            计算税收
          </button>
        </div>
      </form>
      
      {/* 保存方案模态框 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">保存计算方案</h3>
            <div className="mb-4">
              <label htmlFor="schemeName" className="block text-sm font-medium text-gray-700 mb-1">
                方案名称
              </label>
              <input
                type="text"
                id="schemeName"
                value={schemeName}
                onChange={(e) => setSchemeName(e.target.value)}
                placeholder="请输入方案名称"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveScheme}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputForm;