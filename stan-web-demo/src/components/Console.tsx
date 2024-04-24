import { useEffect, useRef } from "react";

type ConsoleOutputProps = { output: string };

const ConsoleOutput = ({ output }: ConsoleOutputProps) => {
  const textArea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const area = textArea.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [output]);

  return (
    <textarea id="output" rows={8} value={output} ref={textArea} readOnly />
  );
};

export default ConsoleOutput;
