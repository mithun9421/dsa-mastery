// @ts-nocheck
import type { Tab } from '@/lib/types'
import { apiDesignBECategory } from './api-design'
import { authCategory } from './authentication'
import { dbPatternsCategory } from './database-patterns'
import { backendCachingCategory } from './caching-backend'
import { backendSecurityCategory } from './security'
import { observabilityCategory } from './observability'
import { backgroundJobsCategory } from './background-jobs'

export const backendTab: Tab = {
  id: 'backend',
  title: 'Backend',
  description: 'API design, authentication, database patterns, security, observability, and background jobs — the backend engineering handbook.',
  icon: 'Server',
  categories: [
    apiDesignBECategory,
    authCategory,
    dbPatternsCategory,
    backendCachingCategory,
    backendSecurityCategory,
    observabilityCategory,
    backgroundJobsCategory,
  ],
}
