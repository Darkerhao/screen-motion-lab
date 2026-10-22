# Motion Lab

面向公司大屏业务的动画特效组件库。项目同时承担三件事：

- 研发可复用的大屏动效组件
- 在 16:9 舞台中实时预览和调参
- 快速进入全屏演示，并获取组件接入代码

## 当前组件

| 组件 | 类型 | 适用方向 |
| --- | --- | --- |
| 粒子星环 Particle Nexus | Canvas | 数据协同、业务连接、中心主视觉 |
| 脉冲雷达 Pulse Radar | Canvas | 态势感知、区域监测、安全告警 |
| 频谱脉冲 Spectrum Wave | Canvas | 信号分析、音频监测、实时波形 |
| 科技边框 Tech Frame | CSS | 模块容器、扫描光效、汇报演示 |

## 开发

```bash
pnpm install
pnpm dev
```

构建与类型检查：

```bash
pnpm typecheck
pnpm build
```

## 使用方式

1. 在左侧组件库选择特效。
2. 在右侧调整速度、密度、光效强度和主题色。
3. 使用 `SPACE` 暂停、`R` 重播、`F` 全屏演示。
4. 点击“接入”查看当前参数对应的 Vue 用法。

演示模式保持 16:9 舞台比例，避免大屏效果在非等比容器中变形。

## 目录结构

```text
src/
  components/
    effects/            特效组件
    CodeDrawer.vue      接入代码
    DemoOverlay.vue     全屏演示
    InspectorPanel.vue  参数调试
    LibraryPanel.vue    组件目录
  composables/
    useAnimatedCanvas.ts
  utils/
    color.ts
  effects.ts            组件注册表
  types.ts              公共属性类型
```

## 新增组件规范

新增特效时保持一个组件对应一个注册项，不引入第二套预览或参数系统：

1. 在 `src/components/effects/` 创建组件。
2. 接收统一的 `MotionEffectProps`：
   - `speed` 动画速度
   - `density` 粒子密度
   - `intensity` 光效强度
   - `accent` 主题色
   - `paused` 播放状态
   - `replayKey` 重播信号
3. 组件填满父容器，不请求业务接口，不依赖页面级状态。
4. 使用 `container-type: size` 和 `cqw` 等单位，保证在预览与演示尺寸下同步缩放。
5. 在 `src/effects.ts` 注册名称、分类、默认参数、使用场景和组件路径。

Canvas 组件统一使用 `useAnimatedCanvas` 管理 DPR、尺寸监听、暂停和重播，避免重复维护渲染生命周期。
