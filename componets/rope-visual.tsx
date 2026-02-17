"use client"

import { useEffect, useRef } from "react"

interface RopeVisualProps {
  hp: number
  size?: number
  animated?: boolean
}

export function RopeVisual({ hp, size = 200, animated = true }: RopeVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scale = window.devicePixelRatio || 1
    canvas.width = size * scale
    canvas.height = size * scale
    ctx.scale(scale, scale)

    const colors = ["#ef4444", "#22c55e", "#3b82f6"]
    const healthPercent = hp / 100

    function drawRope(time: number) {
      if (!ctx) return
      ctx.clearRect(0, 0, size, size)

      const cx = size / 2
      const cy = size / 2
      const radius = size * 0.3

      for (let r = 0; r < 3; r++) {
        const baseAngle = (r * Math.PI * 2) / 3
        const frayed = 1 - healthPercent

        ctx.beginPath()
        ctx.strokeStyle = colors[r]
        ctx.lineWidth = 3 + healthPercent * 3
        ctx.lineCap = "round"

        const segments = 60
        for (let i = 0; i <= segments; i++) {
          const t = i / segments
          const angle = baseAngle + t * Math.PI * 4

          const wobble = animated
            ? Math.sin(time * 0.002 + t * 10 + r * 2) * frayed * 15
            : 0
          const frayOffset = frayed * Math.sin(t * 20 + r * 5) * 12

          const currentRadius = radius + Math.sin(angle * 1.5) * 20 + frayOffset + wobble

          const x = cx + Math.cos(angle) * currentRadius * (0.6 + t * 0.4)
          const y = cy + Math.sin(angle) * currentRadius * (0.6 + t * 0.4)

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        const opacity = healthPercent > 0.4 ? 1 : healthPercent > 0.1 ? 0.5 + healthPercent : 0.3
        ctx.globalAlpha = opacity
        ctx.stroke()
        ctx.globalAlpha = 1

        // Glow effect when healthy
        if (healthPercent > 0.7) {
          ctx.shadowColor = colors[r]
          ctx.shadowBlur = 8
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }

      // Center knot
      if (healthPercent > 0.3) {
        ctx.beginPath()
        ctx.arc(cx, cy, 8 + healthPercent * 8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 68, 68, ${healthPercent * 0.4})`
        ctx.fill()
        ctx.strokeStyle = `rgba(239, 68, 68, ${healthPercent * 0.8})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Break indicators when low HP
      if (healthPercent < 0.4) {
        for (let i = 0; i < 3; i++) {
          const bx = cx + Math.cos(time * 0.001 + i * 2) * radius * 0.8
          const by = cy + Math.sin(time * 0.001 + i * 2) * radius * 0.8

          ctx.beginPath()
          ctx.arc(bx, by, 2, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(239, 68, 68, 0.5)"
          ctx.fill()
        }
      }
    }

    function animate(time: number) {
      timeRef.current = time
      drawRope(time)
      if (animated) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    if (animated) {
      frameRef.current = requestAnimationFrame(animate)
    } else {
      drawRope(0)
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [hp, size, animated])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="mx-auto"
      aria-label={`チームHP: ${hp}%`}
    />
  )
}
