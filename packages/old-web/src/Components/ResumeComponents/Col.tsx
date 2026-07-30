import styled from "styled-components";
import media from "styled-media-query";
import { DefaultTheme } from "./../../styles/default-theme";

interface ColProps {
  width: string;
  border?: boolean;
  background?: boolean;
  theme: DefaultTheme;
  order?: number;
}

export const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  order: ${(props: ColProps) => props.order};
  background-color: ${(props: ColProps) =>
    props.background
      ? props.theme.colors.redImperial
      : props.theme.colors.white};
  ${media.greaterThan("medium")`
  order: 0;
  border: ${(props: ColProps) => (props.border ? "2px solid" : "none")};
  border-top: none;
  border-color: ${(props: ColProps) =>
    props.border ? props.theme.colors.redImperial : "none"};
  height: 100%;
`};
  .contact-info-social {
    width: 50%;
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }
`;
