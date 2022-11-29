import { graphic } from "echarts";
import ReactEChart from "echarts-for-react";

function Chart() {
  const option = {
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#FFF",
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: false,
      },
      show: false,
    },
    series: [
      {
        type: "line",
        smooth: true,
        lineStyle: {
          color: "#6C22A7",
          width: "3",
        },
        areaStyle: {
          opacity: 0.5,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(89, 9, 192,0.52)",
            },
            {
              offset: 1,
              color: "rgba(115, 26, 231, 0)",
            },
          ]),
        },
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        showSymbol: false,
      },
    ],
  };

  return (
    <div
      className="
        relative 
        border-[1px]
        border-solid
        border-[rgba(252, 252, 252, 0.2)]
        rounded-[20px]
        mt-[24px]"
    >
      <ReactEChart option={option} />
    </div>
  );
}

export default Chart;
