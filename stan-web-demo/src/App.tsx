import { useEffect, useRef, useState } from 'react'
import './App.css'

import createModule from './tinystan/bernoulli'
import stanSample, { StanModule } from './sample';

const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

function App() {
  const [draws, setDraws] = useState<number[]>([0])
  const [output, setOutput] = useState("Stan output will appear here...")

  const textArea = useRef<HTMLTextAreaElement>(null);

  // After render, this scrolls the textArea to the bottom.
  useEffect(() => {
    const area = textArea.current;
    if (area)
      area.scrollTop = area.scrollHeight;
  });

  let stdout = "";
  let stanModule: StanModule;
  createModule({
    print: (function (): (args: any[]) => void {
      return (...args: any[]) => {
        const text = args.join(' ');
        stdout = stdout + text + '\n';
      }
    })()
  }).then(instance => { stanModule = instance; });

  return (
    <>
      <h1>Stan Web Demo</h1>
      <div className="card">
        <button onClick={() => {
          stdout = "";
          setDraws(stanSample(stanModule));
          console.log(stdout);
          setOutput(stdout);
        }}>
          Run
        </button>
        <p>
          Average of theta is {average(draws)}
        </p>
      </div>
      <textarea id="output" rows={8} value={output} ref={textArea}></textarea>
    </>
  )
}


export default App
