import { markRaw, type Component } from 'vue'
import DataRadar from './components/effects/DataRadar.vue'
import ParticleNexus from './components/effects/ParticleNexus.vue'
import SpectrumWave from './components/effects/SpectrumWave.vue'
import TechFrame from './components/effects/TechFrame.vue'
import type { MotionSettings } from './types'

export interface EffectDefinition {
  id: string
  name: string
  enName: string
  category: string
  description: string
  tags: string[]
  component: Component
  componentPath: string
  defaultSettings: MotionSettings
  scenes: string[]
}

export const swatches = [
  { name: '深海青', value: '#43d9ff' },
  { name: '极光绿', value: '#42f5c4' },
  { name: '脉冲蓝', value: '#8194ff' },
  { name: '警戒橙', value: '#ff9a5c' },
  { name: '信号紫', value: '#c277ff' },
]

export const effectDefinitions: EffectDefinition[] = [
  {
    id: 'particle-nexus',
    name: '粒子星环',
    enName: 'Particle Nexus',
    category: '空间氛围',
    description: '以动态粒子网络构成中心视觉，适合表达数据协同、业务连接与实时计算。',
    tags: ['Canvas', '网络拓扑', '中心主视觉'],
    component: markRaw(ParticleNexus),
    componentPath: 'src/components/effects/ParticleNexus.vue',
    defaultSettings: {
      speed: 0.9,
      density: 58,
      intensity: 0.86,
      accent: '#43d9ff',
    },
    scenes: ['指挥中心主视觉', '数据中台首页', '业务关系网络'],
  },
  {
    id: 'data-radar',
    name: '脉冲雷达',
    enName: 'Pulse Radar',
    category: '数据可视化',
    description: '雷达扫描、目标标记与状态面板组合，适合态势感知、区域监测与安全场景。',
    tags: ['Canvas', '目标追踪', '态势感知'],
    component: markRaw(DataRadar),
    componentPath: 'src/components/effects/DataRadar.vue',
    defaultSettings: {
      speed: 1.05,
      density: 72,
      intensity: 0.9,
      accent: '#42f5c4',
    },
    scenes: ['安全监测大屏', '区域态势雷达', '运维告警中心'],
  },
  {
    id: 'spectrum-wave',
    name: '频谱脉冲',
    enName: 'Spectrum Pulse',
    category: '数据可视化',
    description: '环形频谱与动态波形叠加，适合实时信号、音频监测与高频数据展示。',
    tags: ['Canvas', '频谱分析', '实时波形'],
    component: markRaw(SpectrumWave),
    componentPath: 'src/components/effects/SpectrumWave.vue',
    defaultSettings: {
      speed: 0.95,
      density: 82,
      intensity: 0.92,
      accent: '#8194ff',
    },
    scenes: ['实时信号监测', '音频分析大屏', '设备健康中心'],
  },
  {
    id: 'tech-frame',
    name: '科技边框',
    enName: 'Tech Frame',
    category: '容器装饰',
    description: '为业务模块提供统一的科技感容器，包含扫描线、边角结构与状态装饰。',
    tags: ['CSS', '模块容器', '扫描光效'],
    component: markRaw(TechFrame),
    componentPath: 'src/components/effects/TechFrame.vue',
    defaultSettings: {
      speed: 1,
      density: 46,
      intensity: 0.78,
      accent: '#58a6ff',
    },
    scenes: ['首页核心模块', '安全监测面板', '汇报演示容器'],
  },
]

export const effectCategories = ['全部', ...new Set(effectDefinitions.map((effect) => effect.category))]
