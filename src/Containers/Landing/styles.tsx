import styled from "styled-components";
import media from "styled-media-query";

const LandingContainer = styled.div`
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  background-image: mySvg;
`;
const Title = styled.h1`
  font-size: var(--font-normal);
  color: black;
  text-align: center;
  ${media.lessThan("medium")``}
  ${media.between("medium", "large")`
    font-size: var(--font-big);
  `}
  ${media.greaterThan("large")`
    font-size: var(--font-big);
  `}
`;
const SubTitle = styled.h2`
  font-size: var(--font-small);
  color: black;
  text-align: center;
  margin: 0;
  padding: 0 10%;
  ${media.lessThan("medium")`
    /* screen width is less than 768px (medium) */
  `}

  ${media.between("medium", "large")`
    /* screen width is between 768px (medium) and 1170px (large) */
    font-size: var(--font-normal);
    padding: 0 20%;
  `}

  ${media.greaterThan("large")`
    /* screen width is greater than 1170px (large) */
    font-size: var(--font-normal);
    padding: 0 20%;
  `}
`;

export { LandingContainer, SubTitle, Title };
