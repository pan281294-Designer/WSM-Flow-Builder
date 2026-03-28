/**
 * Smart Icon Detection Engine
 * Automatically selects the best icon from Lucide + Heroicons
 * based on component type keywords
 */

// ── Lucide Icons ─────────────────────────────────────────────
import {
  Globe, Smartphone, Server, Database, Zap, HardDrive,
  Box, Layers, Table, FileSpreadsheet, Brain, Bot, Sparkles,
  Network, BookOpen, Search, Code, Split, Users, Webhook,
  Container, Shield, Bell, BarChart, Lock, Activity,
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
    keywords: ['web app', 'frontend', 'browser', 'react app', 'vue app', 'next.js', 'angular', 'svelte', 'html', 'spa', 'pwa', 'website', 'portal', 'web client', 'web browser', 'web interface', 'web page'],
    lucideIcon: Globe, untitledIcon: Globe01, preferred: 'untitled',
    colorHint: '#155DFC',
  },
  {
    id: 'mobile-app', label: 'Mobile App',
    keywords: ['mobile app', 'ios app', 'android app', 'mobile client', 'flutter', 'react native', 'swift', 'kotlin', 'mobile device', 'smartphone', 'tablet'],
    lucideIcon: Smartphone, untitledIcon: Phone01, preferred: 'untitled',
    colorHint: '#155DFC',
  },
  {
    id: 'api-server', label: 'API Server',
    keywords: ['api server', 'api gateway', 'rest api', 'graphql', 'grpc', 'express', 'fastapi', 'django', 'rails', 'spring boot', 'nestjs', 'api endpoint', 'microservice', 'backend server', 'web server', 'http server', 'service layer', 'backend api'],
    lucideIcon: Server, untitledIcon: Server01, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'auth', label: 'Auth Service',
    keywords: ['auth service', 'authentication', 'authorization', 'login service', 'jwt', 'oauth', 'keycloak', 'identity provider', 'sso', 'saml', 'access token', 'refresh token', '2fa', 'mfa', 'user auth', 'sign in', 'signup'],
    lucideIcon: Lock, untitledIcon: Lock01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'vector-db', label: 'Vector Database',
    keywords: ['vector database', 'vector store', 'vector db', 'pinecone', 'chroma', 'weaviate', 'qdrant', 'faiss', 'milvus', 'embedding store', 'vector index', 'vector search'],
    lucideIcon: Database, untitledIcon: Database01, preferred: 'untitled',
    colorHint: '#8b5cf6',
  },
  {
    id: 'cache', label: 'Cache',
    keywords: ['cache', 'caching', 'redis', 'memcached', 'in-memory store', 'varnish', 'hazelcast', 'session cache', 'cache layer', 'cache store', 'memory cache'],
    lucideIcon: Zap, untitledIcon: Lightning01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'storage', label: 'Storage',
    keywords: ['file storage', 'object storage', 's3 bucket', 'gcs bucket', 'blob storage', 'minio', 'cloud drive', 'file system', 'object store', 'cloud storage', 'media storage', 'static files', 'cdn storage'],
    lucideIcon: HardDrive, untitledIcon: UntHardDrive, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'data-warehouse', label: 'Data Warehouse',
    keywords: ['data warehouse', 'snowflake', 'bigquery', 'redshift', 'analytics database', 'olap', 'data mart', 'dwh'],
    lucideIcon: Box, untitledIcon: Cube01, preferred: 'untitled',
    colorHint: '#3b82f6',
  },
  {
    id: 'data-lake', label: 'Data Lake',
    keywords: ['data lake', 'hadoop', 'delta lake', 'lakehouse', 'apache spark', 'databricks', 'data platform', 'raw data'],
    lucideIcon: Layers, untitledIcon: LayersTwo01, preferred: 'untitled',
    colorHint: '#3b82f6',
  },
  {
    id: 'sql-table', label: 'SQL Database',
    keywords: ['sql database', 'postgres', 'mysql', 'sqlite', 'mssql', 'relational db', 'rds', 'aurora', 'mariadb', 'database', 'db', 'data store', 'relational database'],
    lucideIcon: Table, untitledIcon: UntTable, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'csv-dataset', label: 'Dataset',
    keywords: ['dataset', 'csv file', 'spreadsheet', 'excel file', 'parquet', 'jsonl', 'data file', 'training data', 'raw dataset', 'data records'],
    lucideIcon: FileSpreadsheet, untitledIcon: FileCheck02, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'llm', label: 'LLM / AI Model',
    keywords: ['llm', 'large language model', 'gpt-4', 'gpt-3', 'chatgpt', 'claude', 'gemini', 'mistral', 'llama', 'openai', 'anthropic', 'ai model', 'language model', 'foundation model', 'generative model', 'inference engine', 'text generation', 'completion api'],
    lucideIcon: Brain, untitledIcon: CpuChip01, preferred: 'untitled',
    colorHint: '#8b5cf6',
  },
  {
    id: 'ai-agent', label: 'AI Agent',
    keywords: ['ai agent', 'autonomous agent', 'llm agent', 'chatbot', 'ai bot', 'autopilot', 'crew ai', 'multi-agent', 'langchain agent', 'langgraph', 'autogpt', 'agent loop', 'agentic', 'reasoning agent'],
    lucideIcon: Bot, untitledIcon: Stars01, preferred: 'untitled',
    colorHint: '#8b5cf6',
  },
  {
    id: 'embeddings', label: 'Embeddings',
    keywords: ['embedding', 'embeddings', 'text embedding', 'vector embedding', 'sentence transformer', 'encoder model', 'ada embedding', 'embed', 'semantic vector', 'vector representation'],
    lucideIcon: Sparkles, untitledIcon: Beaker01, preferred: 'untitled',
    colorHint: '#ec4899',
  },
  {
    id: 'neural-network', label: 'Neural Network',
    keywords: ['neural network', 'deep learning', 'cnn', 'rnn', 'lstm', 'transformer model', 'pytorch', 'tensorflow', 'keras', 'ml model', 'trained model', 'fine-tuned model', 'classification model'],
    lucideIcon: Network, untitledIcon: CpuChip02, preferred: 'untitled',
    colorHint: '#8b5cf6',
  },
  {
    id: 'knowledge-base', label: 'Knowledge Base',
    keywords: ['knowledge base', 'rag', 'document store', 'wiki', 'confluence', 'notion', 'knowledge graph', 'documents', 'knowledge repo', 'document index', 'faq', 'knowledge hub'],
    lucideIcon: BookOpen, untitledIcon: BookOpen01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'semantic-search', label: 'Search',
    keywords: ['semantic search', 'search engine', 'elasticsearch', 'opensearch', 'solr', 'retrieval', 'search index', 'full text search', 'similarity search', 'search service', 'search api', 'search query'],
    lucideIcon: Search, untitledIcon: SearchLg, preferred: 'untitled',
    colorHint: '#06b6d4',
  },
  {
    id: 'trainer', label: 'ML Trainer',
    keywords: ['ml trainer', 'fine-tuning', 'fine-tune', 'model training', 'training pipeline', 'rlhf', 'mlops', 'wandb', 'training job', 'model optimization', 'train loop'],
    lucideIcon: Code, untitledIcon: Code01, preferred: 'untitled',
    colorHint: '#10b981',
  },
  {
    id: 'pipeline', label: 'Pipeline',
    keywords: ['pipeline', 'data pipeline', 'etl pipeline', 'orchestration', 'airflow', 'prefect', 'dagster', 'message queue', 'kafka', 'rabbitmq', 'event stream', 'pubsub', 'workflow engine', 'job queue', 'task queue', 'data flow'],
    lucideIcon: Split, untitledIcon: GitBranch01, preferred: 'untitled',
    colorHint: '#06b6d4',
  },
  {
    id: 'ui', label: 'User Interface',
    keywords: ['user interface', 'ui component', 'dashboard', 'chat interface', 'web ui', 'admin panel', 'control panel', 'user portal', 'client ui', 'frontend ui', 'ui layer'],
    lucideIcon: Users, untitledIcon: Users01, preferred: 'untitled',
    colorHint: '#06b6d4',
  },
  {
    id: 'webhook', label: 'Webhook / Integration',
    keywords: ['webhook', 'third-party integration', 'zapier', 'make.com', 'n8n', 'connector', 'integration layer', 'external api', 'api connector', 'event hook', 'callback url'],
    lucideIcon: Webhook, untitledIcon: Link01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'container', label: 'Container / Infra',
    keywords: ['docker container', 'kubernetes', 'k8s cluster', 'pod', 'deployment', 'cloud infra', 'aws', 'gcp', 'azure', 'infrastructure', 'compute instance', 'serverless', 'lambda function', 'cloud run'],
    lucideIcon: Container, untitledIcon: UntPackage, preferred: 'untitled',
    colorHint: '#3b82f6',
  },
  {
    id: 'monitoring', label: 'Monitoring',
    keywords: ['monitoring', 'observability', 'grafana', 'datadog', 'prometheus', 'log aggregation', 'distributed tracing', 'alert manager', 'uptime', 'health check', 'metrics collector', 'apm'],
    lucideIcon: Activity, untitledIcon: UntActivity, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'security', label: 'Security',
    keywords: ['security layer', 'firewall', 'waf', 'vault', 'secrets manager', 'encryption', 'ssl certificate', 'tls', 'api security', 'rate limiter', 'ddos protection', 'access control'],
    lucideIcon: Shield, untitledIcon: Shield01, preferred: 'untitled',
    colorHint: '#ef4444',
  },
  {
    id: 'notification', label: 'Notification',
    keywords: ['notification', 'email service', 'sms service', 'push notification', 'sendgrid', 'twilio', 'ses', 'mailgun', 'alert notification', 'messaging service', 'notification hub'],
    lucideIcon: Bell, untitledIcon: Bell01, preferred: 'untitled',
    colorHint: '#f59e0b',
  },
  {
    id: 'analytics', label: 'Analytics',
    keywords: ['analytics', 'metrics', 'analytics dashboard', 'business intelligence', 'reporting', 'segment', 'mixpanel', 'amplitude', 'google analytics', 'insights', 'data analytics', 'usage tracking'],
    lucideIcon: BarChart, untitledIcon: BarChart01, preferred: 'untitled',
    colorHint: '#3b82f6',
  },
];

/**
 * Auto-detect the best component definition for a given label/description
 */
export function detectComponent(label) {
  if (!label) return SMART_COMPONENTS[2];
  const lower = label.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const component of SMART_COMPONENTS) {
    let score = 0;
    for (const kw of component.keywords) {
      const kwLower = kw.toLowerCase();
      if (lower === kwLower) {
        score += kw.length * 4; // exact match
      } else if (new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower)) {
        score += kw.length * 2; // word-boundary match
      } else if (lower.includes(kwLower)) {
        score += kw.length; // substring match
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
  return SMART_COMPONENTS.find(c => c.id === id) || null;
}
