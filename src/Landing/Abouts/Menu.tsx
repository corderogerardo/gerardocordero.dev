import React from "react";
import styled from "styled-components";

const AboutsMenu = styled.header`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const NavAbout = styled.nav`
  display: flex;
  width: 30%;
  align-items: center;
  justify-content: space-around;
`;

const AAbout = styled.a`
  display: flex;
  justify-content: center;
  border: 1px solid green;
  width: 100px;
  text-decoration: none;
  color: green;
`;

const lastYears = ["2020", "Oldest"];

const Menu = () => {
  return (
    <AboutsMenu>
      <NavAbout>
        {lastYears.map((year) => (
          <AAbout href={`/${year}`} key="year">
            {year}
          </AAbout>
        ))}
      </NavAbout>
    </AboutsMenu>
  );
};

export default Menu;
