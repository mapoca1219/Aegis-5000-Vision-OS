export interface ProjectBlueprint {
  title: string;
  codename: string;
  tagline: string;
  targetPrizes: string[];
  totalPrizeValue: string;
  summary: string;
  problemStatement: string;
  solutionOverview: string;
  keyDifferentiators: string[];
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  opencvFunction: string;
  gApiNode: string;
  executionTimeArm64: number; // in ms
  executionTimeX86: number; // in ms
}

export interface AgenticStep {
  stepNumber: number;
  phase: 'Perception' | 'Decision / Tool Call' | 'Actuation / Hardware' | 'Re-Perception' | 'Final Action';
  action: string;
  detail: string;
  opencvInputOutput: string;
  agentDecisionEvidence: string;
  status: 'pending' | 'running' | 'completed';
}

export interface CoolBenchmarkMetric {
  workload: string;
  resolution: string;
  x86Instance: string;
  x86Fps: number;
  x86LatencyMs: number;
  x86CostPerMillion: number;
  gravitonCoolInstance: string;
  gravitonCoolFps: number;
  gravitonCoolLatencyMs: number;
  gravitonCoolCostPerMillion: number;
  speedupFactor: number;
  costSavingsPercent: number;
}

export interface InspectionSample {
  id: string;
  title: string;
  category: string;
  description: string;
  defectType: string;
  groundTruthLocation: { x: number; y: number; width: number; height: number };
  sampleColor: string;
  patternType: 'wafer' | 'pcb' | 'turbine' | 'solar';
}

export interface EvaluationResult {
  totalScore: number;
  breakdown: {
    technicalExecution: { score: number; max: number; feedback: string };
    innovation: { score: number; max: number; feedback: string };
    realWorldImpact: { score: number; max: number; feedback: string };
    userExperience: { score: number; max: number; feedback: string };
    documentationPresentation: { score: number; max: number; feedback: string };
    cloudDeliveryCOOL: { score: number; max: number; feedback: string };
  };
  strengths: string[];
  weaknessesAndRisks: string[];
  winningRecommendations: string[];
}
