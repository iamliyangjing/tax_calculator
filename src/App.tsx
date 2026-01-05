import { useState } from 'react';
import InputForm from './components/InputForm';
import TaxResult from './components/TaxResult';
import { TaxInput, TaxCalculationResult } from './types';
import { calculateTax } from './utils/taxCalculator';

function App() {
  const [taxResult, setTaxResult] = useState<TaxCalculationResult | null>(null);
  const [currentInput, setCurrentInput] = useState<TaxInput | null>(null);

  const handleCalculate = (data: TaxInput) => {
    const result = calculateTax(data);
    setTaxResult(result);
    setCurrentInput(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">工资税收计算器</h1>
          <p className="text-gray-600">输入您的工资信息，计算每月应扣税额及年度退/补税额</p>
        </header>
        
        <div className="grid grid-cols-1 gap-8">
          {/* 输入表单 */}
          <InputForm onCalculate={handleCalculate} />
          
          {/* 计算结果 */}
          <TaxResult result={taxResult} input={currentInput} />
        </div>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2024 工资税收计算器 | 计算结果仅供参考，实际税额以税务部门核算为准</p>
        </footer>
      </div>
    </div>
  );
}

export default App;