import React from "react";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>hola mundo</h2>
        <button onClick={methodDoesNotExist}>Break the world</button>;
      </header>
    </div>
  );
}

export default App;
