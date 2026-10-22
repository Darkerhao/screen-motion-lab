export interface MotionSettings {
  speed: number
  density: number
  intensity: number
  accent: string
}

export interface MotionEffectProps extends MotionSettings {
  paused: boolean
  replayKey: number
}
