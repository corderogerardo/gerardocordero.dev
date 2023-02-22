import React, { Suspense } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import NotFound404 from "./Components/NotFound404";

const Landing = React.lazy(() => import("./Containers/Landing/Landing"));

const Loading = () => <div>loading...</div>;

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Landing />
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
