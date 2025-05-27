'use client';
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [v1Result, setV1Result] = useState<string>("");
  const [v2Result, setV2Result] = useState<string>("");

  const callApi = (version: "v1" | "v2") => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/${version}/json`);
    xhr.onload = function () {
      if (xhr.status === 200) {
        const json = JSON.parse(xhr.responseText);
        if (version === "v1") setV1Result(JSON.stringify(json, null, 2));
        else setV2Result(JSON.stringify(json, null, 2));
      } else {
        if (version === "v1") setV1Result("Error: " + xhr.status);
        else setV2Result("Error: " + xhr.status);
      }
    };
    xhr.onerror = function () {
      if (version === "v1") setV1Result("Network error");
      else setV2Result("Network error");
    };
    xhr.send();
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Traceparent API Demo</h1>
      <h2 className={styles.subtitle}>XHR Overwrite Example</h2>
      <p className={styles.backendDesc}>
        The following code snippet, present in <b>layout.tsx</b>, demonstrates how the <code>XMLHttpRequest</code> methods are overwritten to conditionally allow or block the <code>traceparent</code> header based on the request URL:
      </p>
      <p>
        Source code for this example is available in <a href="https://github.com/jh-dev-sandbox/xhr-otel-test" style={{ color: '#0070f3' }}>github</a>.
      </p>
      <pre className={styles.codeBlock}>
{`// Example shouldTrack function
function shouldTrackTraceparent(url) {
  return url.includes('v1/json');
}

const originalOpen = XMLHttpRequest.prototype.open;
const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
const xhrUrlMap = new WeakMap();

XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  xhrUrlMap.set(this, url);
  return originalOpen.call(this, method, url, ...rest);
};

XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
  if (name.toLowerCase() === 'traceparent') {
    const url = xhrUrlMap.get(this) || '';
    if (!shouldTrackTraceparent(url)) {
      return;
    }
  }
  return originalSetRequestHeader.call(this, name, value);
};

SplunkRum.init({
  realm: "${process.env.NEXT_PUBLIC_SPLUNK_REALM}",
  rumAccessToken: "${process.env.NEXT_PUBLIC_SPLUNK_RUM_ACCESS_TOKEN}",
  applicationName: "${process.env.NEXT_PUBLIC_SPLUNK_RUM_DEPLOYMENT_ENVIROMENT}",
  deploymentEnvironment: "${process.env.NEXT_PUBLIC_SPLUNK_RUM_DEPLOYMENT_ENVIROMENT}",
  debug: false,
  instrumentations: {
    fetch: {
        applyCustomAttributesOnSpan(span) {
            if(!span.attributes) {
                // Invalid span context, skip
                return 
            }
            
            console.log("fetch.applyCustomAttributesOnSpan", span.spanContext().traceId, span);
            if(shouldTrackTraceparent(span.attributes['http.url'])) {
                span.setAttribute("link.traceId", span.spanContext().traceId);
                span.setAttribute("link.spanId", "0000000000000000");
            } else {
                console.log("fetch.applyCustomAttributesOnSpan - not tracking traceparent for", span);
            }
        }
    },
    xhr: {
        applyCustomAttributesOnSpan(span) {
            if(!span.attributes) {
                // Invalid span context, skip
                return 
            }
            
            console.log("xhr.applyCustomAttributesOnSpan", span.spanContext().traceId, span);
            if(shouldTrackTraceparent(span.attributes['http.url'])) {
                span.setAttribute("link.traceId", span.spanContext().traceId);
                span.setAttribute("link.spanId", "0000000000000000");
            } else {
                console.log("xhr.applyCustomAttributesOnSpan - not tracking traceparent for", span);
            }
        }
    }
  }
});

`}
      </pre>
      <div className={styles.columns}>
        <div className={styles.column}>
          <div className={styles.desc}>Sends a request to <b>/api/v1/json</b> and displays the traceparent header value.</div>
          <button className={styles.button} onClick={() => callApi("v1")}>Call api/v1/json</button>
          <pre className={styles.response} aria-live="polite" style={{ minHeight: '2.5em' }}>{v1Result || '\u00A0'}</pre>
        </div>
        <div className={styles.column}>
          <div className={styles.desc}>Sends a request to <b>/api/v2/json</b> and displays the traceparent header value.</div>
          <button className={styles.button} onClick={() => callApi("v2")}>Call api/v2/json</button>
          <pre className={styles.response} aria-live="polite" style={{ minHeight: '2.5em' }}>{v2Result || '\u00A0'}</pre>
        </div>
      </div>

    </div>
  );
}
