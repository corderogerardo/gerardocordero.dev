import React, { Suspense } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import "./App.css";

import NotFound404 from "./Components/NotFound404";

const Landing = React.lazy(() => import("./Containers/Landing/Landing"));
const TailwindCSS = React.lazy(
  () => import("./Experiments/TailwindCSS/TailwindCSS")
);

const Loading = () => <div>loading...</div>;

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Landing></Landing>
          </Route>
          <Route exact path="/tailwindcss">
            <TailwindCSS></TailwindCSS>
          </Route>
          <Route>
            <NotFound404></NotFound404>
          </Route>
        </Switch>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
