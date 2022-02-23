import styled from "styled-components";
import media from "styled-media-query";

export const Footer = styled.footer`
  width: 100%;
  color: ${({ theme }) => theme.colors.honeydew};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  a {
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.colors.honeydew};
    background-color: none;
    text-decoration: none;
    width: fit-content;
  }
  p {
    margin: 0;
    padding: 0;
    width: fit-content;
    margin-left: 1%;
  }
  ${media.greaterThan("medium")`
      flex-direction: row;
      width: 100%;
      position: absolute;
      bottom: 1%;
      background-color: ${({ theme }) => theme.colors.bluePrussian};
  `};
`;
