import React from "react";
import styled from "styled-components";

import MenuAbout from "./Menu";
import BodyAbout from "./Body";

const Container = () => {
  return (
    <div>
      <MenuAbout></MenuAbout>
      <BodyAbout></BodyAbout>
    </div>
  );
};
export default React.memo(Container);
