import { cn } from "@/lib/utils";

const nodes = [
  { x: 40, y: 120 },
  { x: 40, y: 200 },
  { x: 40, y: 280 },
  { x: 150, y: 80 },
  { x: 150, y: 170 },
  { x: 150, y: 260 },
  { x: 150, y: 340 },
  { x: 265, y: 130 },
  { x: 265, y: 220 },
  { x: 265, y: 310 },
  { x: 375, y: 175 },
  { x: 375, y: 265 },
];

const edges: Array<[number, number]> = [
  [0, 3],
  [0, 4],
  [1, 4],
  [1, 5],
  [2, 5],
  [2, 6],
  [3, 7],
  [4, 7],
  [4, 8],
  [5, 8],
  [5, 9],
  [6, 9],
  [7, 10],
  [8, 10],
  [8, 11],
  [9, 11],
];

/** Decorative neural-network / circuit visual built with pure SVG. */
export function NeuralVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden="true">
      <div className="absolute inset-8 rounded-full bg-[image:var(--gradient-pulse)] opacity-25 blur-3xl animate-pulse-ring" />
      <svg viewBox="0 0 420 420" className="relative h-full w-full">
        <defs>
          <linearGradient id="np-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--electric)" />
            <stop offset="55%" stopColor="var(--cyan)" />
            <stop offset="100%" stopColor="var(--magenta)" />
          </linearGradient>
        </defs>

        <circle
          cx="210"
          cy="210"
          r="180"
          fill="none"
          stroke="var(--cyan)"
          strokeOpacity="0.18"
          strokeDasharray="4 10"
        />

        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a]!.x}
            y1={nodes[a]!.y}
            x2={nodes[b]!.x}
            y2={nodes[b]!.y}
            stroke="url(#np-line)"
            strokeWidth="1.2"
            strokeOpacity="0.65"
            strokeDasharray="6 8"
            style={{ animation: `dash-flow ${6 + (i % 5)}s linear infinite` }}
          />
        ))}

        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="11" fill="var(--cyan)" fillOpacity="0.12" />
            <circle cx={n.x} cy={n.y} r="4.5" fill="url(#np-line)" />
          </g>
        ))}
      </svg>
    </div>
  );
}