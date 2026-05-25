import { useState } from "react";

export const Roulette = () => {

  type RouletteColor = "black" | "red" | "green";

  type RouletteNumber = {

    value: number,

    color: RouletteColor,

  }

  type OutsideBet = {

    label?: string,

    type?: string,

    color?: RouletteColor

  }

  type Point = {

    x: number,

    y: number

  }

  const CELL = 60;

  const numbers: RouletteNumber[][] = [

    [

      {value: 3, color: "red"},

      {value: 6, color: "black"},

      {value: 9, color: "red"},

      {value: 12, color: "red"},

      {value: 15, color: "black"},

      {value: 18, color: "red"},

      {value: 21, color: "red"},

      {value: 24, color: "black"},

      {value: 27, color: "red"},

      {value: 30, color: "red"},

      {value: 33, color: "black"},

      {value: 36, color: "red"}

    ],

    [

      {value: 2, color: "black"},

      {value: 5, color: "red"},

      {value: 8, color: "black"},

      {value: 11, color: "black"},

      {value: 14, color: "red"},

      {value: 17, color: "black"},

      {value: 20, color: "black"},

      {value: 23, color: "red"},

      {value: 26, color: "black"},

      {value: 29, color: "black"},

      {value: 32, color: "red"},

      {value: 35, color: "black"}

    ],

    [

      {value: 1, color: "red"},

      {value: 4, color: "black"},

      {value: 7, color: "red"},

      {value: 10, color: "black"},

      {value: 13, color: "black"},

      {value: 16, color: "red"},

      {value: 19, color: "red"},

      {value: 22, color: "black"},

      {value: 25, color: "red"},

      {value: 28, color: "black"},

      {value: 31, color: "black"},

      {value: 34, color: "red"}

    ]

  ];

  const outsideBets : OutsideBet[] = [

    {label: "1-18"},

    {label: "Parzyste"},

    {type: "diamond", color: "red"},

    {type: "diamond", color: "black"},

    {label: "Nieparzyste" },

    {label: "19-36" },

  ]



  const Diamond = (x: number, y: number, width: number, height: number, padding: number) => {

    const left = x + padding;

    const top = y + padding;



    const innerWidth = width - padding * 2;

    const innerHeight = height - padding * 2;



    const centerX = left + innerWidth / 2;

    const centerY = top + innerHeight / 2;

    return `${centerX},${top}

            ${left + innerWidth},${centerY}

            ${centerX},${top + innerHeight}

            ${left},${centerY}`;

  }

  function polarToCartesian(cx: number, cy: number, r: number, angle: number): Point {

  const rad = (angle - 90) * Math.PI / 180;

  return {

    x: cx + r * Math.cos(rad),

    y: cy + r * Math.sin(rad)

  };

}



function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {

  const start = polarToCartesian(cx, cy, r, endAngle);

  const end = polarToCartesian(cx, cy, r, startAngle);



  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";



  return [

    `M ${cx} ${cy}`,

    `L ${start.x} ${start.y}`,

    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,

    "Z"

  ].join(" ");

}

const spin = () => {

  const index = Math.floor(Math.random() * wheelNumbers.length);



  const landingAngle = index * step;



  setAngle(prev => prev + 360 * 5 + (360 - landingAngle));

};





const wheelNumbers: RouletteNumber[] = [

  { value: 0, color: "green" },



  { value: 32, color: "red" },

  { value: 15, color: "black" },

  { value: 19, color: "red" },

  { value: 4, color: "black" },

  { value: 21, color: "red" },

  { value: 2, color: "black" },

  { value: 25, color: "red" },

  { value: 17, color: "black" },

  { value: 34, color: "red" },

  { value: 6, color: "black" },

  { value: 27, color: "red" },

  { value: 13, color: "black" },

  { value: 36, color: "red" },

  { value: 11, color: "black" },

  { value: 30, color: "red" },

  { value: 8, color: "black" },

  { value: 23, color: "red" },

  { value: 10, color: "black" },

  { value: 5, color: "red" },

  { value: 24, color: "black" },

  { value: 16, color: "red" },

  { value: 33, color: "black" },

  { value: 1, color: "red" },

  { value: 20, color: "black" },

  { value: 14, color: "red" },

  { value: 31, color: "black" },

  { value: 9, color: "red" },

  { value: 22, color: "black" },

  { value: 18, color: "red" },

  { value: 29, color: "black" },

  { value: 7, color: "red" },

  { value: 28, color: "black" },

  { value: 12, color: "red" },

  { value: 35, color: "black" },

  { value: 3, color: "red" },

  { value: 26, color: "black" }

];

const step = 360 / wheelNumbers.length;

const midAngle = step / 2;

const pos = polarToCartesian(250, 250, 160, midAngle);

const [angle, setAngle] = useState(0);

  return (

    <div className="content">

      <h1>Ruletka</h1>



      <svg viewBox="0 0 500 500" width={400} height={500} style={{display: "block", margin: "0 auto"}}>

  <g transform={`rotate(${angle}, 250, 250)`}>

    {wheelNumbers.map((item, i) => {

      const startAngle = i * step;

      const endAngle = step;



      return (

        <g key={i} transform={`rotate(${startAngle}, 250, 250)`}>

          <path

            d={describeArc(250, 250, 200, 0, step)}

            fill={item.color}

          />

          <text

            x={pos.x}

            y={pos.y}

            textAnchor="middle"

            fill="white"

            transform={`rotate(${step / 2}, 250, 250)`}

          >

            {item.value}

          </text>

<circle

  cx="250"

  cy="250"

  r="200"

  fill="none"

  stroke="rgba(255,255,255,0.4)"

  strokeWidth="3"

/>

        </g>

      );

    })}

  </g>



  {/* wskaźnik */}

  <polygon points="245,10 255,10 250,30" fill="gold" />

</svg>

      <p>

        Każdy spin ma takie samo prawdopodobieństwo.

        Systemy nie zmieniają matematyki.

      </p>

      <svg width={CELL * 14} height={CELL * 3}>

      <g>

        <rect x={0} y={0} width={CELL} height={CELL * 3} fill="#5dbe49" stroke="white"/>

        <text x={CELL / 2} y={CELL * 3 / 2} textAnchor="middle" dominantBaseline="middle" fill="white">0</text>

      </g>

      {numbers.map((row, rowIndex) =>

        row.map((num, colIndex) => {



          const x = (colIndex + 1) * CELL;

          const y = rowIndex * CELL;



          return (

            <g key={`${rowIndex}-${colIndex}`}>



              <rect x={x} y={y} width={CELL} height={CELL} fill = {num.color == "black" ? "#272223" : "#ee3534"}/>

              {/*PRAWA KRAWĘDŹ*/}

              <line x1={x + CELL} y1={y} x2={x + CELL} y2={y+ CELL} stroke="white"/>

              {/*DOLNA KRAWĘDŹ*/}

              <line x1={x} y1={y + CELL} x2={x + CELL} y2={y + CELL} stroke="white"/>

              {/*GÓRNA KRAWĘDŹ*/}

              {rowIndex == 0 && <line x1={x} y1={y} x2={x + CELL} y2={y} stroke="white"/>}

              {/*LEWA KRAWĘDŹ*/}

              {/* {colIndex == 0 && <line x1={x} y1={y} x2={x} y2={y + CELL} stroke="white"/>} */}



              <text

                x={x + CELL/2}

                y={y + CELL/2}

                textAnchor="middle"

                dominantBaseline="middle"

                fill="white"

              >

                {num.value}

              </text>

            </g>

          );

      })

    )}

    {numbers.map((_, rowIndex) => {

      const x = CELL * 13;

      const y = rowIndex * CELL;

      return(

        <g key={`row-${rowIndex}`}>

          <rect x={x} y={y} width={CELL} height={CELL} fill="#111"/>

          {/*KRAWĘDŹ GÓRNA*/}

          {rowIndex == 0 && <line x1={x} y1={y} x2={x + CELL} y2={y} stroke="white"/>}

          {/*PRAWA KRAWĘDŹ*/}

          <line x1={x + CELL} y1={y} x2={x + CELL} y2={y+ CELL} stroke="white"/>

          {/*DOLNA KRAWĘDŹ*/}

          <line x1={x} y1={y + CELL} x2={x + CELL} y2={y + CELL} stroke="white"/>



          <text x={x + CELL / 2} y={y + CELL / 2} textAnchor="middle" dominantBaseline="middle" fill="white">2:1</text>

        </g>

      );

    })}

  </svg>





  <svg width={CELL * 13} height={CELL}>

    {numbers.map((_, colIndex) => {

      const x = CELL * (4 * colIndex + 1);

      const y = 0;

      return(

        <g key={colIndex}>

          <rect x={x} y={y} width={CELL * 4} height={CELL} fill="black"/>

          <text x={x + CELL * 2} y={CELL / 2} dominantBaseline="middle" textAnchor="middle" fill="white">Tuzin {colIndex + 1}</text>

          {/*KRAWĘDŹ LEWA*/}

          {colIndex == 0 && <line x1={x} y1={y} x2={x} y2={y + CELL} stroke="white"/>}

          {/*KRAWĘDŹ PRAWA*/}

          <line x1={x + CELL * 4} y1={y} x2={x + CELL * 4} y2={y+ CELL} stroke="white"/>

          {/*KRAWĘDŹ DOLNA*/}

          <line x1={x} y1={y + CELL} x2={x + CELL * 4} y2={y + CELL} stroke="white"/>

        </g>

      );

    })}

  </svg>





  <svg width={CELL * 13} height={CELL}>

    {outsideBets.map((bet, colIndex) => {

      const x = CELL * (colIndex * 2 + 1);

      return(

        <g key={colIndex}>

          <rect x={x} y={0} width={CELL * 2} height={CELL} fill="black"/>

          {/*KRAWĘDŹ PRAWA*/}

          <line x1={x + CELL * 2} y1={0} x2={x + CELL * 2} y2={CELL} stroke="white"/>

          {/*KRAWĘDŹ DOLNA*/}

          <line x1={x} y1={CELL} x2={x + CELL * 2} y2={CELL} stroke="white"/>

          {/*KRAWĘDŹ LEWA*/}

          {colIndex == 0 && <line x1={x} y1={0} x2={x} y2={CELL} stroke="white"/>}

          {bet.label && <text x={x + CELL} y={CELL / 2} textAnchor="middle" dominantBaseline="middle" fill="white">{bet.label}</text>}

          {bet.type && <polygon points={Diamond(x, 0, CELL * 2, CELL, 5)} fill={bet.color == "red" ? "#ee3534" : "#111"} stroke="gray"/>}

        </g>

      )

    })}

  </svg>

      <button>Zakręć</button>

    </div>

  )

}