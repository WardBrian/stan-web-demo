import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

import "./App.css";

import StanModel from "./tinystan";

import PosteriorPlot from "./components/Plotting.js";
import ConsoleOutput from "./components/Console.js";
import HighlightCode from "./components/Code.js";
import DataInput from "./components/Data.js";

import createModule from "./tinystan/bernoulli.js";

const App = () => {
  const [stanCode, setStanCode] = useState("// Loading Stan source code...");
  useEffect(() => {
    fetch("bernoulli.stan")
      .then(response => response.text())
      .then(setStanCode);
  }, []);

  const [model, setModel] = useState<StanModel>();
  useEffect(() => {
    StanModel.load(createModule, setOutput).then(setModel);
  }, []);

  const [stanVersion, setStanVersion] = useState("Loading Stan version...");
  useEffect(() => {
    if (model) setStanVersion("Stan Version " + model.version());
  }, [model]);

  const [data, setData] = useState({
    N: 10,
    y: [0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  });
  const [draws, setDraws] = useState<number[]>([]);
  const [output, setOutput] = useState(
    "Stan console output will appear here...",
  );

  return (
    <>
      <h1>Stan Web Demo</h1>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <HighlightCode code={stanCode} language="stan" />
        </Grid>
        <Grid item xs={12} md={5}>
          <DataInput data={data} setData={setData} />
        </Grid>
      </Grid>

      <button
        onClick={() => {
          if (!model) return;
          setDraws(model.sample(data)[0]);
        }}
        disabled={!model ? true : undefined}
      >
        Sample
      </button>
      <br />
      <br />
      <PosteriorPlot draws={draws} />
      <br />
      <ConsoleOutput output={output} />

      <p style={{ fontSize: "0.8rem" }}>
        <span style={{ float: "left" }}>{stanVersion}</span>
        <span style={{ float: "right" }}>
          <a href="https://github.com/WardBrian/stan-web-demo">(source)</a>
        </span>
      </p>
    </>
  );
};

export default App;
