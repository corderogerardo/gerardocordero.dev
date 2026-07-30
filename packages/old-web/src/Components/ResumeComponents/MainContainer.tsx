import styled from "styled-components";
import media from "styled-media-query";

const hugger: any = "1600px";
const extraLarge: any = "1900px";
export const MainContainer = styled.div`
  margin: 0;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  ${media.greaterThan("medium")`
    display: grid;
    grid-template-rows: 60% 40%;
    grid-template-columns: 25% 50% 25%;
    width: 90%;
  `};
  ${media.greaterThan(hugger)`
    width: 65%;
  `};
  ${media.greaterThan(extraLarge)`
    width: 50%;
  `};
`;
