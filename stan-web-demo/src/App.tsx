import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { Slider, Stack } from '@mui/material';
import Plot from 'react-plotly.js';

import Prism from "prismjs";
import "prismjs/components/prism-stan";
import "./prism-one-light.css";


import './App.css'

import StanModel from './tinystan';
import createModule from './tinystan/bernoulli.js';

const stanCode = (await import("./assets/bernoulli.stan?raw")).default;

const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

const App = () => {
  const [draws, setDraws] = useState<number[]>([0])
  const [output, setOutput] = useState("Stan console output will appear here...")

  const [model, setModel] = useState<StanModel>();
  useEffect(() => {
    StanModel.load(createModule, setOutput).then(setModel);
  }, []);


  const [data, setData] = useState({ N: 10, y: [0, 1, 0, 0, 0, 0, 0, 0, 0, 1] });


  return (
    <>
      <h1>Stan Web Demo</h1>
      <div className="card">
        <Stack direction="row" spacing={2} >
          <HighlightCode code={stanCode} language="stan" />
          <DataComponent data={data} setData={setData} />
        </Stack>


        <button
          onClick={() => {
            if (!model) return;
            setDraws(model.sample(JSON.stringify(data)));
          }}
          disabled={!model ? true : undefined}
        >
          Sample
        </button>
        <p>
          Average of theta is {average(draws).toFixed(4)}
        </p>

        <PosteriorPlot draws={draws} />
        <br />
        <ConsoleOutput output={output} />
      </div>

    </>
  )
}

const HighlightCode = ({ code, language }: { code: string, language: string }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);
  return <div>
    <pre className='line-numbers show-language'>
      <code className={`language-${language}`}>{code}</code>
    </pre>
  </div>;
}

const DataComponent = ({ data, setData }: { data: number, setData: Dispatch<SetStateAction<{ N: number; y: number[]; }>>; }) => {

  const [N, setN] = useState(10);

  const handleNChanged = (_event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (activeThumb === 0) {
      setN(newValue as number);
    }
  };

  const [k, setK] = useState(2);
  const handleKChanged = (_event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (activeThumb === 0) {
      setK(newValue as number);
    }
  };

  useEffect(() => {
    const y = Array(k).fill(1).concat(Array(N - k).fill(0));
    shuffleArray(y);
    setData({ N, y });
  }, [N, k, setData]);

  return <div>
    <h3>Data</h3>
    <textarea id="data" rows={4} value={JSON.stringify(data)}> </textarea>
    <p> Number of trials: {N}</p>
    <Slider defaultValue={10} step={5} valueLabelDisplay="auto" min={k} max={50} onChange={handleNChanged} />
    <p> Number of heads: {k}</p>
    <Slider defaultValue={10} step={1} valueLabelDisplay="auto" marks min={0} max={N} onChange={handleKChanged} />

  </div>
}

const ConsoleOutput = ({ output }: { output: string }) => {
  const textArea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const area = textArea.current;
    if (area)
      area.scrollTop = area.scrollHeight;
  }, [output]);

  return (
    <textarea id="output" rows={8} value={output} ref={textArea}></textarea>
  )
}

const PosteriorPlot = ({ draws }: { draws: number[] }) => {

  if (draws.length === 1) {
    return <Plot
      data={[]}
      layout={{
        autosize: true, title: 'Posterior of Theta', xaxis: { range: [0, 1], title: "Probability of seeing heads" }
      }}
    />
  }

  const avg = average(draws);
  return <Plot
    data={[{
      x: draws,
      type: 'histogram',
      histnorm: 'probability',
      xbins: { start: 0, end: 1, size: 0.0125 },
      name: 'Posterior draws',
    }]}
    layout={{
      autosize: true, title: 'Posterior of Theta', xaxis: { range: [0, 1], title: "Probability of seeing heads" },
      showlegend: true,
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1
      },
      shapes: [{
        type: 'line',
        x0: avg,
        y0: 0,
        x1: avg,
        yref: 'paper',
        y1: 1,
        line: {
          color: 'red',
          width: 2
        },
        showlegend: true,
        name: `Mean (${avg.toFixed(4)})`
      }]
    }}
  />
}


export default App
