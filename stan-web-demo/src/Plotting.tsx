import useMeasure from "react-use-measure";

import Plotly from "plotly.js-cartesian-dist";

import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

const PosteriorPlot = ({ draws }: { draws: number[] }) => {
  const [ref, { width }] = useMeasure();

  const avg = average(draws);

  return (
    <div ref={ref}>
      {draws.length === 1 ? (
        <Plot
          data={[{ x: [], type: "histogram" }]}
          layout={{
            width: width,
            autosize: true,
            title: "Posterior of Theta",
            xaxis: {
              range: [0, 1],
              title: "Probability of seeing heads",
            },
            yaxis: { range: [0, 0.2] },
            margin: { t: 50, b: 50, l: 50, r: 50 },
          }}
          config={{ displayModeBar: false }}
        />
      ) : (
        <Plot
          data={[
            {
              x: draws,
              type: "histogram",
              histnorm: "probability",
              xbins: { start: 0, end: 1, size: 0.0125 },
              name: "Posterior draws",
            },
          ]}
          layout={{
            autosize: true,
            width: width,
            title: "Posterior of Theta",
            xaxis: { range: [0, 1], title: "Probability of seeing heads" },
            margin: { t: 50, b: 50, l: 50, r: 50 },
            showlegend: true,
            legend: {
              x: 1,
              xanchor: "right",
              y: 1,
            },
            shapes: [
              {
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
              },
            ],
          }}
          config={{ displayModeBar: false }}
        />
      )}
    </div>
  );
};

export default PosteriorPlot;
