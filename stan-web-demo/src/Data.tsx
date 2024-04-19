import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Slider } from "@mui/material";

const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

export const DataInput = ({
  data,
  setData,
}: {
  data: { N: number; y: number[] };
  setData: Dispatch<SetStateAction<{ N: number; y: number[] }>>;
}) => {
  const [N, setN] = useState(10);

  const handleNChanged = (
    _event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (activeThumb === 0) {
      setN(newValue as number);
    }
  };

  const [k, setK] = useState(2);
  const handleKChanged = (
    _event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (activeThumb === 0) {
      setK(newValue as number);
    }
  };

  useEffect(() => {
    const y = Array(k)
      .fill(1)
      .concat(Array(N - k).fill(0));
    shuffleArray(y);
    setData({ N, y });
  }, [N, k, setData]);

  return (
    <div>
      <h3>Data</h3>
      <textarea id="data" rows={5} value={JSON.stringify(data)} readOnly />
      <p>
        {" "}
        Number of coin flips:&nbsp;
        <span className="tooltip">
          {N}
          <span className="tooltiptext">
            The number of total coin flips increases our certainty in the
            posterior prediction
          </span>
        </span>
      </p>
      <Slider
        defaultValue={10}
        step={1}
        valueLabelDisplay="auto"
        min={k}
        max={50}
        onChange={handleNChanged}
      />
      <p> Number of heads: {k}</p>
      <Slider
        defaultValue={2}
        step={1}
        valueLabelDisplay="auto"
        marks
        min={0}
        max={N}
        onChange={handleKChanged}
      />
    </div>
  );
};

export default DataInput;
