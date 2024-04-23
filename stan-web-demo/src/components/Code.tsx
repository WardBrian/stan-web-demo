import { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-stan";
import "./prism-one-light.css";

const HighlightCode = ({
  code,
  language,
}: {
  code: string;
  language: string;
}) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);
  return (
    <div>
      <h3>Code</h3>
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export default HighlightCode;
