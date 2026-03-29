export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type TabId = 'algorithms' | 'dsa' | 'system-design' | 'frontend' | 'backend' | 'architecture'

export interface ComplexityAnalysis {
  best?: string
  average?: string
  worst?: string
}

export interface CodeExample {
  language: string
  label: string
  code: string
}

export interface Concept {
  id: string
  title?: string
  description?: string
  timeComplexity?: ComplexityAnalysis
  spaceComplexity?: string
  keyPoints: string[]
  codeExamples?: CodeExample[]
  useCases?: string[]
  commonPitfalls?: string[]
  interviewTips?: string[]
  relatedConcepts?: string[]
  difficulty?: Difficulty
  tags?: string[]
  proTip?: string
  ascii?: string
}

export interface Category {
  id: string
  title?: string
  description?: string
  icon?: string
  concepts: Concept[]
}

export interface Tab {
  id: TabId
  title?: string
  description?: string
  icon: string
  categories: Category[]
}
