'use client'

interface PixelLogoProps {
  size?: number
  className?: string
}

export function PixelLogo({ size = 32, className = '' }: PixelLogoProps) {
  const pixelSize = size / 8

  const pixels = [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ]

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {pixels.map((row, y) =>
        row.map(
          (pixel, x) =>
            pixel === 1 && (
              <div
                key={`${x}-${y}`}
                className="absolute bg-foreground"
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  left: x * pixelSize,
                  top: y * pixelSize,
                }}
              />
            )
        )
      )}
    </div>
  )
}
