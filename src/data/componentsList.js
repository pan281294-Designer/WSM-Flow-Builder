/**
 * Smart Icon Detection Engine
 * Automatically selects the best icon from Lucide + Heroicons
 * based on component type keywords
 */

// ── Lucide Icons ─────────────────────────────────────────────
import {
  Globe, Smartphone, Server, Key, Database, Zap, HardDrive,
  Box, Layers, Table, FileSpreadsheet, Brain, Bot, Sparkles,
  Network, BookOpen, Search, Code, Split, Users, Webhook,
  Container, Shield, Mail, Bell, BarChart, Settings, Cpu,
  Cloud, Lock, GitBranch, Terminal, Workflow,
  MessageSquare, Plug, RefreshCw, FolderOpen, Package,
  AlertTriangle, CheckCircle, Activity, Eye, Filter
} from 'lucide-react';

// ── Untitled UI Icons ─────────────────────────────────────
import {
  Globe01, Phone01, Server01, Lock01, Database01, Lightning01, HardDrive as UntHardDrive,
  Cube01, LayersTwo01, Table as UntTable, FileCheck02, CpuChip01, Stars01,
  Beaker01, CpuChip02, BookOpen01, SearchLg, Code01, GitBranch01,
  Users01, Link01, Package as UntPackage, Activity as UntActivity, Shield01, Bell01, BarChart01
} from '@untitledui/icons';

/**
 * Comprehensive component definitions with smart icon matching.
 * Each entry has:
 * - keywords for detection
 * - lucideIcon + heroIcon — system picks most semantically fitting
 * - preferred: which icon set to show by default
 */
export const SMART_COMPONENTS = [
  {
    id: 'web-app', label: 'Web App',
    keywords: ['web', 'frontend', 'browser', 'react', 'vue', 'next', 'angular', 'svelte', 'html', 'spa', 'pwa', 'website', 'portal'],
    lucideIcon: Globe, untitledIcon: Globe01, preferred: 'untitled',
    colorHint: '#06b6d4',
  },
  {
    id: 'mobile-app', label: 'Mobile App',
    keywords: ['mobile', 'ios', 'android', 'phone', 'flutter', 'react native', 'swift', 'kotlin', 'app'],
    lucideIcon: Smartphone, untitledIcon: Phone01, preferred: 'untitled',
    colorHint: '#06b6d4',
  },
  {
    id: 'api-server', label: 'API Server',
    keywords: ['api', 'rest', 'graphql', 'grpc', 'express', 'fastapi', 'django', 'ruby', 'rails', 'spring', 'nest', 'gateway', 'route', 'endpoint', 'microservice', 'backend'],
    lucideIcon: Server, untitledIcon: Server01, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'auth', label: 'Auth Service',
    keywords: ['auth', 'login', 'jwt', 'oauth', 'keycloak', 'identity', 'sso', 'saml', 'session', 'token', 'fingerprint', '2fa', 'mfa'],
    lucideIcon: Lock, untitledIcon: Lock01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'vector-db', label: 'Vector Database',
    keywords: ['vector', 'pinecone', 'chroma', 'weaviate', 'qdrant', 'faiss', 'milvus', 'embedding store', 'ann'],
    lucideIcon: Database, untitledIcon: Database01, preferred: 'untitled',
    colorHint: '#8b5cf6',
  },
  {
    id: 'cache', label: 'Cache',
    keywords: ['cache', 'redis', 'memcache', 'in-memory', 'cdn', 'varnish', 'hazelcast'],
    lucideIcon: Zap, untitledIcon: Lightning01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'storage', label: 'Storage',
    keywords: ['storage', 's3', 'gcs', 'blob', 'file', 'object store', 'minio', 'drive', 'cdn', 'bucket'],
    lucideIcon: HardDrive, untitledIcon: UntHardDrive, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'data-warehouse', label: 'Data Warehouse',
    keywords: ['warehouse', 'snowflake', 'bigquery', 'redshift', 'analytics db', 'olap'],
    lucideIcon: Box, untitledIcon: Cube01, preferred: 'untitled',
    colorHint: '#3b82f6',
  },
  {
    id: 'data-lake', label: 'Data Lake',
    keywords: ['data lake', 'hadoop', 'delta lake', 'lakehouse', 'spark', 'databricks'],
    lucideIcon: Layers, untitledIcon: LayersTwo01, preferred: 'untitled',
    colorHint: '#3b82f6',
  },
  {
    id: 'sql-table', label: 'SQL Database',
    keywords: ['sql', 'postgres', 'mysql', 'sqlite', 'mssql', 'database', 'db', 'rds', 'aurora', 'maria'],
    lucideIcon: Table, untitledIcon: UntTable, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'csv-dataset', label: 'Dataset',
    keywords: ['csv', 'dataset', 'spreadsheet', 'excel', 'parquet', 'jsonl', 'data file'],
    lucideIcon: FileSpreadsheet, untitledIcon: FileCheck02, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'llm', label: 'LLM / AI Model',
    keywords: ['llm', 'gpt', 'claude', 'gemini', 'mistral', 'llama', 'language model', 'openai', 'anthropic', 'inference', 'generative', 'foundation model', 'ai model'],
    lucideIcon: Brain, untitledIcon: CpuChip01, preferred: 'untitled',
    colorHint: '#8b5cf6',
  },
  {
    id: 'ai-agent', label: 'AI Agent',
    keywords: ['agent', 'autonomous', 'ai agent', 'bot', 'autopilot', 'crew', 'multi-agent', 'langchain', 'langgraph', 'autogpt'],
    lucideIcon: Bot, untitledIcon: Stars01, preferred: 'untitled',
    colorHint: '#8b5cf6',
  },
  {
    id: 'embeddings', label: 'Embeddings',
    keywords: ['embedding', 'encode', 'encoder', 'ada', 'text-embedding', 'sentence transformer', 'vector representation'],
    lucideIcon: Sparkles, untitledIcon: Beaker01, preferred: 'untitled',
    colorHint: '#ec4899',
  },
  {
    id: 'neural-network', label: 'Neural Network',
    keywords: ['neural', 'deep learning', 'cnn', 'transformer', 'pytorch', 'tensorflow', 'keras', 'model'],
    lucideIcon: Network, untitledIcon: CpuChip02, preferred: 'untitled',
    colorHint: '#8b5cf6',
  },
  {
    id: 'knowledge-base', label: 'Knowledge Base',
    keywords: ['knowledge', 'rag', 'document store', 'wiki', 'confluence', 'notion', 'kb', 'docs'],
    lucideIcon: BookOpen, untitledIcon: BookOpen01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'semantic-search', label: 'Search',
    keywords: ['search', 'semantic search', 'elasticsearch', 'opensearch', 'solr', 'retrieval', 'query'],
    lucideIcon: Search, untitledIcon: SearchLg, preferred: 'untitled',
    colorHint: '#06b6d4',
  },
  {
    id: 'trainer', label: 'ML Trainer',
    keywords: ['train', 'fine-tune', 'finetune', 'trainer', 'optimize', 'rlhf', 'mlops', 'wandb'],
    lucideIcon: Code, untitledIcon: Code01, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'pipeline', label: 'Pipeline',
    keywords: ['pipeline', 'etl', 'orchestrat', 'airflow', 'prefect', 'dagster', 'queue', 'kafka', 'rabbitmq', 'workflow', 'stream', 'pubsub'],
    lucideIcon: Split, untitledIcon: GitBranch01, preferred: 'untitled',
    colorHint: '#06b6d4',
  },
  {
    id: 'ui', label: 'User Interface',
    keywords: ['user', 'form', 'dashboard', 'chat', 'notification', 'ui', 'ux', 'interface'],
    lucideIcon: Users, untitledIcon: Users01, preferred: 'untitled',
    colorHint: '#06b6d4',
  },
  {
    id: 'webhook', label: 'Webhook / Integration',
    keywords: ['webhook', 'integration', 'third party', 'zapier', 'make', 'n8n', 'connector', 'plugin'],
    lucideIcon: Webhook, untitledIcon: Link01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'container', label: 'Container / Infra',
    keywords: ['docker', 'container', 'kubernetes', 'k8s', 'pod', 'deploy', 'server', 'infra', 'cloud', 'aws', 'gcp', 'azure'],
    lucideIcon: Container, untitledIcon: UntPackage, preferred: 'untitled',
    colorHint: '#3b82f6',
  },
  {
    id: 'monitoring', label: 'Monitoring',
    keywords: ['monitor', 'observabilit', 'grafana', 'datadog', 'prometheus', 'logging', 'trace', 'alert'],
    lucideIcon: Activity, untitledIcon: UntActivity, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'security', label: 'Security',
    keywords: ['security', 'firewall', 'waf', 'vault', 'secrets', 'encrypt', 'ssl', 'tls', 'cert'],
    lucideIcon: Shield, untitledIcon: Shield01, preferred: 'untitled',
    colorHint: '#ef4444',
  },
  {
    id: 'notification', label: 'Notification',
    keywords: ['email', 'sms', 'push', 'notification', 'sendgrid', 'twilio', 'ses', 'mailgun', 'bell'],
    lucideIcon: Bell, untitledIcon: Bell01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'analytics', label: 'Analytics',
    keywords: ['analytics', 'metrics', 'dashboard', 'report', 'segment', 'mixpanel', 'amplitude', 'insight'],
    lucideIcon: BarChart, untitledIcon: BarChart01, preferred: 'untitled',
    colorHint: '#3b82f6',
  },
];

/**
 * Auto-detect the best component definition for a given label/description
 */
export function detectComponent(label) {
  const lower = label.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const component of SMART_COMPONENTS) {
    let score = 0;
    for (const kw of component.keywords) {
      if (lower.includes(kw)) {
        score += kw.length; // longer keyword = more specific = higher weight
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = component;
    }
  }

  return bestMatch || SMART_COMPONENTS[2]; // default to API Server
}

// ─── Legacy compatibility (for Sidebar) ─────────────────────
export const COMPONENT_CATEGORIES = [
  {
    id: 'client', name: 'CLIENT',
    items: SMART_COMPONENTS.filter(c => ['web-app','mobile-app'].includes(c.id)).map(c => ({
      ...c, icon: c.untitledIcon, iconColor: `text-cyan-600 dark:text-cyan-400`, iconBg: `bg-cyan-100 dark:bg-[#142939]`
    }))
  },
  {
    id: 'backend', name: 'BACKEND',
    items: SMART_COMPONENTS.filter(c => ['api-server','auth','security'].includes(c.id)).map(c => ({
      ...c, icon: c.untitledIcon, iconColor: `text-emerald-600 dark:text-emerald-400`, iconBg: `bg-emerald-100 dark:bg-[#112d26]`
    }))
  },
  {
    id: 'data-storage', name: 'DATA & STORAGE',
    items: SMART_COMPONENTS.filter(c => ['vector-db','cache','storage','data-warehouse','data-lake','sql-table','csv-dataset'].includes(c.id)).map(c => ({
      ...c, icon: c.untitledIcon, iconColor: `text-emerald-600 dark:text-emerald-400`, iconBg: `bg-emerald-100 dark:bg-[#112d26]`
    }))
  },
  {
    id: 'core-ai-ml', name: 'CORE AI / ML',
    items: SMART_COMPONENTS.filter(c => ['llm','ai-agent','embeddings','neural-network'].includes(c.id)).map(c => ({
      ...c, icon: c.untitledIcon, iconColor: `text-violet-600 dark:text-violet-400`, iconBg: `bg-violet-100 dark:bg-[#1a1535]`
    }))
  },
  {
    id: 'knowledge', name: 'KNOWLEDGE & RETRIEVAL',
    items: SMART_COMPONENTS.filter(c => ['knowledge-base','semantic-search'].includes(c.id)).map(c => ({
      ...c, icon: c.untitledIcon, iconColor: `text-amber-600 dark:text-amber-400`, iconBg: `bg-amber-100 dark:bg-[#2d1f0a]`
    }))
  },
  {
    id: 'pipelines', name: 'PIPELINES & FLOW',
    items: SMART_COMPONENTS.filter(c => ['pipeline','trainer'].includes(c.id)).map(c => ({
      ...c, icon: c.untitledIcon, iconColor: `text-cyan-600 dark:text-cyan-400`, iconBg: `bg-cyan-100 dark:bg-[#142939]`
    }))
  },
  {
    id: 'integration', name: 'INTEGRATION & INFRA',
    items: SMART_COMPONENTS.filter(c => ['ui','webhook','container','monitoring','notification','analytics'].includes(c.id)).map(c => ({
      ...c, icon: c.untitledIcon, iconColor: `text-blue-600 dark:text-blue-400`, iconBg: `bg-blue-100 dark:bg-[#0f1f3d]`
    }))
  },
];

export function getComponentDetails(id) {
  return SMART_COMPONENTS.find(c => c.id === id) || SMART_COMPONENTS[2];
}
