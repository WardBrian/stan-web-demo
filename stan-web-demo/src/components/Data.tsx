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

type CallbackType = Dispatch<SetStateAction<number>>;
const makeChangeHandler = (callback: CallbackType) => {
  return (_event: Event, newValue: number | number[], activeThumb: number) => {
    if (activeThumb === 0) {
      callback(newValue as number);
    }
  };
};

export type BernoulliData = { N: number; y: number[] };

type DataInputProps = {
  data: BernoulliData;
  setData: Dispatch<SetStateAction<BernoulliData>>;
};

export const DataInput = ({ data, setData }: DataInputProps) => {
  const [N, setN] = useState(10);
  const [k, setK] = useState(2);

  const handleNChanged = makeChangeHandler(setN);
  const handleKChanged = makeChangeHandler(setK);

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
        <span
          className="tooltip"
          title="The number of total coin flips increases our certainty in the
            posterior prediction"
          tabIndex={0}
        >
          {N}
        </span>
      </p>
      <Slider
        defaultValue={10}
        step={1}
        valueLabelDisplay="auto"
        aria-label="Number of coin flips"
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
        aria-label="Number of heads"
        min={0}
        max={N}
        onChange={handleKChanged}
      />
    </div>
  );
};

export default DataInput;
