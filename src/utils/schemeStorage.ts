import { TaxInput } from '../types';

// 存储键名
const STORAGE_KEY = 'tax_calculator_schemes';

// 计算方案类型
export interface CalculationScheme {
  id: string;           // 唯一标识符
  name: string;         // 方案名称
  input: TaxInput;      // 计算输入参数
  createdAt: number;    // 创建时间
  updatedAt: number;    // 更新时间
}

// 获取所有保存的方案
export const getAllSchemes = (): CalculationScheme[] => {
  try {
    const schemesJson = localStorage.getItem(STORAGE_KEY);
    if (schemesJson) {
      return JSON.parse(schemesJson);
    }
  } catch (error) {
    console.error('Failed to get schemes from localStorage:', error);
  }
  return [];
};

// 保存方案
export const saveScheme = (name: string, input: TaxInput): CalculationScheme => {
  try {
    const schemes = getAllSchemes();
    const scheme: CalculationScheme = {
      id: Date.now().toString(),
      name,
      input,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    schemes.push(scheme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes));
    return scheme;
  } catch (error) {
    console.error('Failed to save scheme to localStorage:', error);
    throw error;
  }
};

// 加载方案
export const loadScheme = (id: string): TaxInput | null => {
  try {
    const schemes = getAllSchemes();
    const scheme = schemes.find(s => s.id === id);
    if (scheme) {
      return scheme.input;
    }
  } catch (error) {
    console.error('Failed to load scheme from localStorage:', error);
  }
  return null;
};

// 删除方案
export const deleteScheme = (id: string): boolean => {
  try {
    const schemes = getAllSchemes();
    const newSchemes = schemes.filter(s => s.id !== id);
    if (newSchemes.length < schemes.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchemes));
      return true;
    }
  } catch (error) {
    console.error('Failed to delete scheme from localStorage:', error);
  }
  return false;
};
