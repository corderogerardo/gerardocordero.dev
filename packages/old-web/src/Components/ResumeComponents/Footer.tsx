import styled from "styled-components";
import media from "styled-media-query";

export const Footer = styled.footer`
  color: ${({ theme }) => theme.colors.honeydew};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  height: 40px;
  a {
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.colors.honeydew};
    background-color: none;
    text-decoration: none;
    width: 100px;
  }
  p {
    margin: 0;
    padding: 0;
    width: 30px;
  }
  ${media.greaterThan("medium")`
      flex-direction: row;
      width: 100%;
      height: 40px;
      position: absolute;
      bottom: 1%;
      background-color: ${({ theme }) => theme.colors.bluePrussian};
  `};
`;
