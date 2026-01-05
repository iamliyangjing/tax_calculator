import React from 'react';
import { TaxCalculationResult, TaxInput } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TaxResultProps {
  result: TaxCalculationResult | null;
  input?: TaxInput;
}

const TaxResult: React.FC<TaxResultProps> = ({ result, input }) => {
  if (!result) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">计算结果</h2>
        <p className="text-gray-600">请输入工资信息并点击计算按钮查看结果</p>
      </div>
    );
  }

  const { monthlyTax, annualResult } = result;
  const { totalTaxAmount, monthlyResults } = annualResult;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-gray-800">计算结果</h2>
      
      {/* 当月税收 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">当月税收情况</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">当月应扣税额</p>
          <p className="text-3xl font-bold text-blue-600">¥{monthlyTax.toFixed(2)}</p>
        </div>
      </div>
      
      {/* 收入与扣除明细 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">收入与扣除明细</h3>
        {input && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 收入部分 */}
            <div>
              <h4 className="text-md font-medium mb-2 text-gray-700">收入部分</h4>
              <div className="space-y-2">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">月度工资收入</p>
                    <p className="text-sm font-bold text-green-600">¥{input.monthlySalary.toFixed(2)}</p>
                  </div>
                </div>
                {input.monthlyOtherIncome > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">其他月度收入</p>
                      <p className="text-sm font-bold text-yellow-600">¥{input.monthlyOtherIncome.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">月度总收入</p>
                    <p className="text-sm font-bold text-blue-600">¥{(input.monthlySalary + input.monthlyOtherIncome).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 扣除部分 */}
            <div>
              <h4 className="text-md font-medium mb-2 text-gray-700">扣除部分</h4>
              <div className="space-y-2">
                {/* 社保扣除 */}
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">
                      社保扣除 ({input.socialSecurityInputType === 'ratio' ? `${(input.socialSecurityRatio * 100).toFixed(1)}%` : '固定金额'})
                    </p>
                    <p className="text-sm font-bold text-orange-600">
                      ¥{input.socialSecurityInputType === 'fixed' 
                        ? input.socialSecurityFixed.toFixed(2) 
                        : ((input.monthlySalary + input.monthlyOtherIncome) * input.socialSecurityRatio).toFixed(2)
                      }
                    </p>
                  </div>
                </div>
                
                {/* 公积金扣除 */}
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">公积金扣除 ({(input.housingFundRatio * 100).toFixed(1)}%)</p>
                    <p className="text-sm font-bold text-purple-600">
                      ¥{((input.monthlySalary + input.monthlyOtherIncome) * input.housingFundRatio).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {/* 其他扣除 */}
                {input.otherDeduction > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">其他扣除</p>
                      <p className="text-sm font-bold text-red-600">¥{input.otherDeduction.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 年度税收汇总 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">年度税收汇总</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">年度应纳税额（不含年终奖）</p>
            <p className="text-2xl font-bold text-green-600">¥{totalTaxAmount.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">年终奖应纳税额</p>
            <p className="text-2xl font-bold text-orange-600">¥{annualResult.bonusTaxAmount.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">年度总应纳税额（含年终奖）</p>
            <p className="text-2xl font-bold text-purple-600">¥{annualResult.totalWithBonusTax.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {/* 年终奖税收情况 */}
      {annualResult.bonusTaxableIncome > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">年终奖税收情况</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">年终奖金额</p>
                <p className="text-xl font-bold text-gray-800">¥{annualResult.bonusTaxableIncome.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">年终奖应纳税额</p>
                <p className="text-xl font-bold text-gray-800">¥{annualResult.bonusTaxAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 最优计税方式推荐 */}
      {annualResult.bonusTaxableIncome > 0 && annualResult.recommendedBonusTaxType && (
        <div className="mb-8 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">最优计税方式推荐</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">推荐计税方式</p>
              <p className="text-xl font-bold text-yellow-600">
                {annualResult.recommendedBonusTaxType === 'separate' ? '单独计税' : '并入综合所得计税'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">推荐方式下总应纳税额</p>
                <p className="text-lg font-bold text-green-600">¥{annualResult.recommendedTaxAmount?.toFixed(2)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">节税额</p>
                <p className="text-lg font-bold text-green-600">¥{annualResult.taxSavings?.toFixed(2)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">当前选择方式总应纳税额</p>
                <p className={`text-lg font-bold ${annualResult.taxSavings && annualResult.taxSavings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ¥{annualResult.totalWithBonusTax.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">单独计税总应纳税额</p>
                <p className="text-lg font-bold text-gray-700">¥{annualResult.separateTaxAmount?.toFixed(2)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">并入综合所得总应纳税额</p>
                <p className="text-lg font-bold text-gray-700">¥{annualResult.integratedTaxAmount?.toFixed(2)}</p>
              </div>
            </div>
            {annualResult.taxSavings && annualResult.taxSavings > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  💡 <strong>建议</strong>：您选择的计税方式与推荐方式相比，需多缴纳 ¥{annualResult.taxSavings.toFixed(2)} 的税款。
                  建议改为「{annualResult.recommendedBonusTaxType === 'separate' ? '单独计税' : '并入综合所得计税'}」，以节省税款。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 税收变化趋势图 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">月度税收变化趋势</h3>
        <div className="h-80 bg-gray-50 p-4 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyResults}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                label={{ value: '月份', position: 'insideBottom', offset: -5 }} 
                tickFormatter={(month) => `${month}月`}
              />
              <YAxis 
                label={{ value: '金额 (元)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `¥${value.toFixed(0)}`}
              />
              <Tooltip 
                formatter={(value: number | undefined) => [`¥${value?.toFixed(2) || '0.00'}`, '']}
                labelFormatter={(label) => `${label}月`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="taxAmount" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="当月应纳税额" 
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeTaxAmount" 
                stroke="#10b981" 
                strokeWidth={2}
                name="累计应纳税额" 
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 每月税收明细 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">每月税收明细</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  月份
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  应纳税所得额 (元)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  当月应纳税额 (元)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  累计应纳税所得额 (元)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  累计应纳税额 (元)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyResults.map((item) => (
                <tr key={item.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.month}月
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ¥{item.taxableIncome.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ¥{item.taxAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ¥{item.cumulativeTaxableIncome.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ¥{item.cumulativeTaxAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 税收说明 */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold mb-2 text-gray-700">税收说明</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 计算结果仅供参考，实际税额以税务部门核算为准</li>
          <li>• 年度汇算清缴时，若已预缴税额大于年度应纳税额，可申请退税</li>
          <li>• 若已预缴税额小于年度应纳税额，则需要补缴税款</li>
          <li>• 专项附加扣除需在个人所得税APP中如实申报</li>
        </ul>
      </div>
    </div>
  );
};

export default TaxResult;