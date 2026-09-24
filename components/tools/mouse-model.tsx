export function MouseModel({ buttons }: { buttons: number }) {
  const active = (mask: number) => (buttons & mask) !== 0;
  return (
    <svg
      className="gaming-mouse-model"
      viewBox="0 0 420 410"
      role="img"
      aria-label="Gaming mouse. Pressed buttons turn silver."
    >
      <defs>
        <linearGradient
          id="mouse-shell"
          x1="100"
          y1="70"
          x2="310"
          y2="350"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61506e" />
          <stop offset=".45" stopColor="#2a2533" />
          <stop offset="1" stopColor="#121117" />
        </linearGradient>
        <linearGradient
          id="mouse-button"
          x1="160"
          y1="75"
          x2="240"
          y2="215"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#544762" />
          <stop offset="1" stopColor="#24202e" />
        </linearGradient>
        <linearGradient
          id="mouse-pressed"
          x1="100"
          y1="70"
          x2="290"
          y2="230"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f3f5fa" />
          <stop offset="1" stopColor="#9ba4b5" />
        </linearGradient>
        <filter id="mouse-shadow" x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="22" stdDeviation="14" floodColor="#030106" floodOpacity=".8" />
        </filter>
      </defs>
      <ellipse cx="220" cy="362" rx="105" ry="19" fill="#a778d3" opacity=".09" />
      <g transform="translate(16 0) rotate(-18 210 205)" filter="url(#mouse-shadow)">
        <path
          d="M126 112Q123 53 211 50Q293 47 303 122L322 266Q327 348 237 361Q137 373 115 301Q103 263 117 208Z"
          fill="#100f15"
          stroke="#45384e"
          strokeWidth="2"
        />
        <path
          d="M130 105Q141 54 212 57Q281 55 293 113L306 255Q312 325 235 340Q156 356 127 295Q108 262 126 204Z"
          fill="url(#mouse-shell)"
          stroke="#8f71a45c"
          strokeWidth="2"
        />
        <path
          d="M137 112Q147 68 207 67L206 191Q168 193 128 174Z"
          fill={active(1) ? 'url(#mouse-pressed)' : 'url(#mouse-button)'}
          stroke={active(1) ? '#e9f0ff' : '#89729e'}
          strokeWidth="1.5"
          className="mouse-button-surface"
          style={{ transform: active(1) ? 'translateY(3px)' : undefined }}
        />
        <path
          d="M216 67Q275 69 283 117L294 179Q251 195 217 191Z"
          fill={active(2) ? 'url(#mouse-pressed)' : 'url(#mouse-button)'}
          stroke={active(2) ? '#e9f0ff' : '#89729e'}
          strokeWidth="1.5"
          className="mouse-button-surface"
          style={{ transform: active(2) ? 'translateY(3px)' : undefined }}
        />
        <rect x="201" y="96" width="21" height="54" rx="10" fill="#100e17" stroke="#7d608d" />
        <rect
          x="205"
          y="100"
          width="13"
          height="45"
          rx="6"
          fill={active(4) ? '#e3e8f3' : '#9879bc'}
          className="mouse-button-surface"
        />
        {[108, 115, 122, 129, 136].map((y) => (
          <path key={y} d={`M206 ${y}H217`} stroke="#28212f" strokeWidth="2" />
        ))}
        <path
          d="M118 187L112 223Q110 230 116 232L125 224L131 188Z"
          fill={active(16) ? '#d5dde9' : '#745588'}
          stroke="#b294c0"
          className="mouse-button-surface"
        />
        <path
          d="M112 238L110 272Q111 280 117 280L123 271L124 234Z"
          fill={active(8) ? '#d5dde9' : '#745588'}
          stroke="#b294c0"
          className="mouse-button-surface"
        />
        <path
          d="M134 288Q161 341 233 329Q290 321 301 282"
          fill="none"
          stroke="#bb8cef"
          strokeWidth="3"
          opacity=".8"
        />
        <path d="M196 255L214 234L211 249H230L209 273L214 255Z" fill="#c8a4ef" />
        <path
          d="M139 206Q133 257 146 282M286 209Q297 253 287 280"
          fill="none"
          stroke="#ad8dc522"
          strokeWidth="3"
        />
        <rect x="202" y="165" width="19" height="8" rx="4" fill="#a986cb" opacity=".6" />
      </g>
      <text x="28" y="377" className="mouse-model-caption">
        LIVE INPUT VISUALIZER
      </text>
      <circle cx="366" cy="373" r="4" fill={buttons ? '#e1e7f0' : '#ac87df'} />
    </svg>
  );
}
