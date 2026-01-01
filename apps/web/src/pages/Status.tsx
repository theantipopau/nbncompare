import React, { useEffect, useState } from "react";

export default function Status() {
  const [status, setStatus] = useState<any | null>(null);
  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(console.error);
  }, []);

  if (!status) return <div>Loading...</div>;
  return (
    <div>
      <h2>Site status</h2>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
