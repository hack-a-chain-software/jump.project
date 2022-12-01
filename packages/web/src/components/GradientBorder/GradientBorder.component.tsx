type GradientBorderProps = {
  className?: string;
  stroke?: number;
  width?: number;
  height?: number;
  radius?: number;
  colors: string[];
  direction:
    | "to-top"
    | "to-top-left"
    | "to-top-right"
    | "to-right"
    | "to-bottom"
    | "to-bottom-left"
    | "to-bottom-right"
    | "to-left";
};

function GradientBorder(props: GradientBorderProps) {
  const box = document.getElementById("gradient-border");
  const width = props.width
    ? props.width
    : box?.clientWidth
    ? box?.clientWidth
    : 1;
  const height = props.height
    ? props.height
    : box?.clientHeight
    ? box?.clientHeight
    : 1;

  const stroke = props.stroke || 1;
  const radius = props.radius || 20;

  let direction = { x1: 0, y1: 0, x2: 0, y2: 0 };
  switch (props.direction) {
    case "to-top":
      direction = { x1: width / 2, y1: height, x2: width / 2, y2: 0 };
      break;
    case "to-top-left":
      direction = { x1: width, y1: height, x2: 0, y2: 0 };
      break;
    case "to-top-right":
      direction = { x1: 0, y1: height, x2: width, y2: 0 };
      break;
    case "to-right":
      direction = { x1: 0, y1: height / 2, x2: width, y2: height / 2 };
      break;
    case "to-bottom":
      direction = { x1: width / 2, y1: 0, x2: width / 2, y2: height };
      break;
    case "to-bottom-left":
      direction = { x1: width, y1: 0, x2: 0, y2: height };
      break;
    case "to-bottom-right":
      direction = { x1: 0, y1: 0, x2: width, y2: height };
      break;
    case "to-left":
      direction = { x1: width, y1: height / 2, x2: 0, y2: height / 2 };
      break;
  }

  function renderStopColor(color: string, key: number) {
    return <stop key={key} offset={key ? key : undefined} stopColor={color} />;
  }

  return (
    <svg
      id="gradient-border"
      className={`absolute inset-0 pointer-events-none w-full h-full ${
        props.className || ""
      }`}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width={width - stroke}
        height={height - stroke}
        rx={radius}
        stroke="url(#paint)"
        strokeWidth={stroke}
      />
      <defs>
        <linearGradient
          id="paint"
          x1={direction.x1}
          y1={direction.y1}
          x2={direction.x2}
          y2={direction.y2}
          gradientUnits="userSpaceOnUse"
        >
          {props.colors.map(renderStopColor)}
        </linearGradient>
      </defs>
    </svg>
  );
}

export default GradientBorder;
