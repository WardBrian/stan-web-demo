import useMeasure from "react-use-measure";

import Plotly from "../plotly.js-histogram-dist";
import type {Layout, Data, Shape } from "plotly.js";

import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

const defaultLayout: Partial<Layout> = {
  autosize: true,
  title: "Posterior of Theta",
  xaxis: {
    range: [0, 1],
    title: "Probability of seeing heads",
  },
  margin: { t: 50, b: 50, l: 50, r: 50 },
  showlegend: true,
  legend: {
    x: 1,
    xanchor: "right",
    y: 1,
  },
};

const defaultConfig = { displayModeBar: false };

type PosteriorPlotProps = { draws: number[] };

const PosteriorPlot = ({ draws }: PosteriorPlotProps) => {
  const [ref, { width }] = useMeasure();

  const histogram: Partial<Data> = {
    x: draws,
    type: "histogram",
    histnorm: "probability",
    xbins: { start: 0, end: 1, size: 0.0125 },
    name: "Posterior draws",
  };

  const layout: Partial<Layout> = { width: width, ...defaultLayout };

  if (draws.length === 0) {
    // reasonable default zoom when no data
    layout["yaxis"] = { range: [0, 0.2] };
  } else {
    // add a line for the mean

    const avg = average(draws);
    const meanLine: Partial<Shape> = {
      type: "line",
      x0: avg,
      y0: 0,
      x1: avg,
      yref: "paper",
      y1: 1,
      line: {
        color: "red",
        width: 2,
      },
      showlegend: true,
      name: `Mean (${avg.toFixed(4)})`,
    };

    layout["shapes"] = [meanLine];
  }

  return (
    <div ref={ref} className="plot-holder">
      <Plot data={[histogram]} layout={layout} config={defaultConfig} />
    </div>
  );
};

export default PosteriorPlot;
