import { useState } from "react";
import { DealerButton } from "../../components/Table";

export default function Test() {
  const [moved, setMoved] = useState(false);
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <DealerButton onMove={() => setMoved(true)}>Dealer</DealerButton>
      {moved && <p data-testid="moved">moved!</p>}
    </div>
  );
}
