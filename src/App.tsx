import React, { Suspense } from "react";
import "./App.css";

import Landing from "./Landing/Landing";

const Loading = () => <div>loading...</div>;

function App() {
  return (
    <Suspense fallback={Loading}>
      <Landing></Landing>
    </Suspense>
  );
}

export default App;
