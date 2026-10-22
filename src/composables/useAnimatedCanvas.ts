import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

export interface CanvasFrame {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  time: number
}

interface CanvasOptions {
  paused: Readonly<Ref<boolean>>
  replayKey: Readonly<Ref<number>>
}

export function useAnimatedCanvas(
  draw: (frame: CanvasFrame) => void,
  options: CanvasOptions,
) {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const containerRef = ref<HTMLElement | null>(null)

  let context: CanvasRenderingContext2D | null = null
  let observer: ResizeObserver | null = null
  let animationFrame = 0
  let width = 0
  let height = 0
  let elapsed = 0
  let previousTime = 0

  function render() {
    if (!context || !width || !height) return
    draw({ ctx: context, width, height, time: elapsed })
  }

  function resize() {
    const canvas = canvasRef.value
    const container = containerRef.value
    if (!canvas || !container) return

    const bounds = container.getBoundingClientRect()
    width = Math.max(1, bounds.width)
    height = Math.max(1, bounds.height)

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * pixelRatio)
    canvas.height = Math.round(height * pixelRatio)

    context = canvas.getContext('2d')
    context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    render()
  }

  function stop() {
    if (animationFrame) cancelAnimationFrame(animationFrame)
    animationFrame = 0
  }

  function tick(now: number) {
    if (!previousTime) previousTime = now
    elapsed += Math.min(now - previousTime, 48)
    previousTime = now
    render()

    if (options.paused.value) {
      animationFrame = 0
      return
    }
    animationFrame = requestAnimationFrame(tick)
  }

  function play() {
    stop()
    if (options.paused.value) {
      render()
      return
    }
    previousTime = 0
    animationFrame = requestAnimationFrame(tick)
  }

  function redraw() {
    render()
  }

  watch(options.paused, (paused) => {
    if (paused) {
      stop()
      render()
      return
    }
    play()
  })

  watch(options.replayKey, () => {
    elapsed = 0
    render()
  })

  onMounted(() => {
    resize()
    observer = new ResizeObserver(resize)
    if (containerRef.value) observer.observe(containerRef.value)
    play()
  })

  onBeforeUnmount(() => {
    stop()
    observer?.disconnect()
  })

  return { canvasRef, containerRef, redraw }
}
