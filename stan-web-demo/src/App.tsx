import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

import "./App.css";

import PosteriorPlot from "./components/Plotting";
import ConsoleOutput from "./components/Console";
import HighlightCode from "./components/Code";
import DataInput, { BernoulliData } from "./components/Data";
import Footer from "./components/Footer";

import StanModel from "./tinystan";
import createModule from "./tinystan/bernoulli.js";
import TestComponent from "./TestComponent.js";

const queryParams = new URLSearchParams(window.location.search);
const testMode = queryParams.get("test") === "1";

const App = () => {
  const [stanCode, setStanCode] = useState("// Loading Stan source code...");
  const [model, setModel] = useState<StanModel>();
  const [stanVersion, setStanVersion] = useState("Loading Stan version...");
  const [data, setData] = useState<BernoulliData>({
    N: 10,
    y: [0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  });
  const [draws, setDraws] = useState<number[]>([]);
  const [output, setOutput] = useState(
    "Stan console output will appear here...",
  );

  useEffect(() => {
    fetch("bernoulli.stan")
      .then(response => response.text())
      .then(setStanCode);
  }, []);

  useEffect(() => {
    StanModel.load(createModule, setOutput).then(model => {
      setModel(model);
      setStanVersion(`Stan Version ${model.stanVersion()}`);
    });
  }, []);

  if (testMode) {
    return (
      <TestComponent />
    )
  }

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

      <Button
        onClick={() => {
          if (!model) return;
          setDraws(model.sample(data)[0]);
        }}
        variant="contained"
        disabled={!model ? true : undefined}
      >
        Sample
      </Button>

      <PosteriorPlot draws={draws} />

      <ConsoleOutput output={output} />

      <Footer stanVersion={stanVersion} />
    </>
  );
};

export default App;
