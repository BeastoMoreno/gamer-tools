export function GamingArt() {
  return (
    <div className="gaming-art" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <span className="art-spark spark-one">+</span>
      <span className="art-spark spark-two">+</span>
      <div className="floating-chip chip-top">
        <span className="status-dot" /> GAME READY
      </div>
      <svg className="controller-art" viewBox="0 0 480 360" fill="none">
        <defs>
          <linearGradient
            id="body"
            x1="150"
            y1="70"
            x2="310"
            y2="290"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#eeebff" />
            <stop offset=".42" stopColor="#bdb0e7" />
            <stop offset="1" stopColor="#716095" />
          </linearGradient>
          <linearGradient
            id="edge"
            x1="200"
            y1="120"
            x2="230"
            y2="310"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#81719e" />
            <stop offset="1" stopColor="#352a51" />
          </linearGradient>
          <linearGradient
            id="pad"
            x1="120"
            y1="120"
            x2="310"
            y2="260"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#383046" />
            <stop offset="1" stopColor="#161320" />
          </linearGradient>
          <radialGradient id="stick">
            <stop stopColor="#62566e" />
            <stop offset=".75" stopColor="#2c2538" />
            <stop offset="1" stopColor="#100e18" />
          </radialGradient>
          <filter id="shadow" x="-40%" y="-40%" width="180%" height="200%">
            <feDropShadow dx="0" dy="25" stdDeviation="16" floodColor="#160b2f" floodOpacity=".7" />
          </filter>
        </defs>
        <g className="controller-float" filter="url(#shadow)">
          <path
            d="M119 129L132 95Q151 82 178 99L185 123M289 124L299 94Q327 88 348 111L353 145"
            stroke="#312639"
            strokeWidth="17"
            strokeLinecap="round"
          />
          <path
            d="M113 140Q128 112 161 122L191 135H279L316 123Q350 118 365 151L394 259Q405 297 382 305Q364 314 338 282L301 246H177L139 283Q110 316 89 300Q71 287 83 253Z"
            fill="url(#edge)"
          />
          <path
            d="M111 126Q129 96 164 110L193 124H279L311 111Q346 99 363 134L391 241Q402 278 380 289Q362 298 336 266L301 234H177L141 271Q113 303 91 287Q73 274 85 240Z"
            fill="url(#body)"
            stroke="#e1d8f3"
            strokeOpacity=".45"
            strokeWidth="2"
          />
          <path
            d="M163 145Q167 128 186 130H284Q305 129 311 147L325 204Q330 226 305 237L286 248Q271 250 259 231L218 230Q204 253 187 244L165 231Q145 222 151 198Z"
            fill="url(#pad)"
          />
          <path d="M186 132H284L275 178H199Z" fill="#514560" stroke="#766685" strokeWidth="1.5" />
          <path d="M202 178H272" stroke="#ad89ff" strokeWidth="3" />
          <circle cx="190" cy="211" r="28" fill="#847393" />
          <circle cx="190" cy="208" r="24" fill="url(#stick)" stroke="#a292b0" strokeWidth="2" />
          <circle cx="190" cy="207" r="16" stroke="#776783" strokeDasharray="2 2" />
          <circle cx="286" cy="211" r="28" fill="#847393" />
          <circle cx="286" cy="208" r="24" fill="url(#stick)" stroke="#a292b0" strokeWidth="2" />
          <circle cx="286" cy="207" r="16" stroke="#776783" strokeDasharray="2 2" />
          <path
            d="M127 144H141V158H155V172H141V186H127V172H113V158H127Z"
            fill="#352e40"
            stroke="#766982"
            strokeWidth="2"
          />
          <circle cx="328" cy="143" r="10" fill="#42384f" />
          <path d="M328 138L333 146H323Z" stroke="#bc9bf5" strokeWidth="1.5" />
          <circle cx="349" cy="164" r="10" fill="#42384f" />
          <circle cx="349" cy="164" r="4" stroke="#f3a8c3" strokeWidth="1.5" />
          <circle cx="307" cy="164" r="10" fill="#42384f" />
          <path d="M303 160H311V168H303Z" stroke="#a9c5f4" strokeWidth="1.5" />
          <circle cx="328" cy="185" r="10" fill="#42384f" />
          <path d="M324 181L332 189M332 181L324 189" stroke="#ade4ce" strokeWidth="1.5" />
          <circle cx="237" cy="206" r="9" fill="#8e7ca7" />
          <path d="M235 201L240 205L234 210" stroke="#e4daff" strokeWidth="2" />
          <path d="M213 188H261" stroke="#807089" strokeWidth="2" strokeDasharray="2 4" />
          <path
            d="M102 236Q98 263 107 271M374 239Q380 260 374 270"
            stroke="#e2d7f0"
            strokeOpacity=".25"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div className="floating-chip chip-bottom">
        <span className="mini-crosshair">⌖</span>
        <div>
          YOUR NEXT LEVEL<span>Loading potential...</span>
        </div>
        <span className="chip-bars">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
