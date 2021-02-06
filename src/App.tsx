import { Suspense } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import "./App.css";


import Landing from "./Containers/Landing/Landing"
import TailwindCSS from "./Experiments/TailwindCSS/TailwindCSS"
import NotFound404 from './Components/NotFound404'

const Loading = () => <div>loading...</div>;

function App() {
  return (
    <Suspense fallback={Loading}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/tailwindcss" component={TailwindCSS} />
          <Route component={NotFound404} />
        </Switch>
      </BrowserRouter>
    </Suspense>

  );
}

export default App;
