import { FunctionComponent, useCallback, useState } from "react";

const TestComponent: FunctionComponent = () => {
    const [statusMessage, setStatusMessage] = useState<string>("");
    const handleClick = useCallback(async () => {
        setStatusMessage("Initiating job...");
        const initiateJobUrl = "http://localhost:8083/job/initiate"
        // post
        const a = await fetch(initiateJobUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 1234"
            }
        });
        if (!a.ok) {
            setStatusMessage(`Failed to initiate job: ${a.statusText}`);
            return;
        }
        const resp = await a.json();
        const job_id = resp.job_id;
        if (!job_id) {
            setStatusMessage(`Failed to initiate job: ${JSON.stringify(resp)}`);
            return;
        }

        setStatusMessage(`Job initiated: ${job_id}`);
        const uploadFileUrl = `http://localhost:8083/job/${job_id}/upload/main.stan`;
        const stanProgram = getStanProgram();
        const b = await fetch(uploadFileUrl, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            body: stanProgram
        });
        if (!b.ok) {
            setStatusMessage(`Failed to upload file: ${b.statusText}`);
            return;
        }
        setStatusMessage("File uploaded successfully");

        setStatusMessage("Running job...");
        const runJobUrl = `http://localhost:8083/job/${job_id}/run`;
        const c = await fetch(runJobUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (!c.ok) {
            setStatusMessage(`Failed to run job: ${c.statusText}`);
            return;
        }
        const respC = await c.json();
        if (respC.status === 'completed') {
            setStatusMessage("Job completed successfully");
        }
        else {
            setStatusMessage(`Job failed: ${JSON.stringify(respC)}`);
            return;
        }

        const downloadMainJsUrl = `http://localhost:8083/job/${job_id}/download/main.js`;
        const downloadMainWasmUrl = `http://localhost:8083/job/${job_id}/download/main.wasm`;
        setStatusMessage("Downloading main.js");
        const d = await fetch(downloadMainJsUrl);
        if (!d.ok) {
            setStatusMessage(`Failed to download main.js: ${d.statusText}`);
            return;
        }
        const mainJs = await d.text();
        setStatusMessage("Downloading main.wasm");
        const e = await fetch(downloadMainWasmUrl);
        if (!e.ok) {
            setStatusMessage(`Failed to download main.wasm: ${e.statusText}`);
            return;
        }
        const mainWasm = await e.arrayBuffer();

        console.info('=========================================== main.js ===========================================');
        console.info(mainJs);
        console.info('=========================================== main.wasm ===========================================');
        console.info(mainWasm);
        setStatusMessage("Created main.js and main.wasm files. See the browser console for more details.");

    }, []);
    return (
        <div>
            <h1>WASM Compile Test</h1>
            <pre>Instructions:</pre>
            <pre>Run the docker image:</pre>

            <pre>cd docker</pre>
            <pre>docker build -t stan-web-demo .</pre>
            <pre>docker run -p 8083:8080 -it stan-web-demo</pre>
            <button onClick={handleClick}>Then click me</button>
            <p>{statusMessage}</p>
        </div>
    );
}

const getStanProgram = () => (`
data {
    int<lower=0> N;
    vector[N] x;
    vector[N] y;
}
parameters {
    real alpha;
    real beta;
    real<lower=0> sigma;
}
model {
    y ~ normal(alpha + beta * x, sigma);
}
`)

export default TestComponent;