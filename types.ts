
export interface ConditionReport {
  conditionName: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Minimal' | 'Not Detected';
  explanation: string;
  symptoms: string[];
}

export interface AnalysisResult {
  summary: string;
  conditions: ConditionReport[];
}
