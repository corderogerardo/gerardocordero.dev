import styled from "styled-components"
import { DefaultTheme } from './../../styles/default-theme'

interface ColProps {
  width: string,
  border?: boolean,
  background?: boolean,
  theme: DefaultTheme
};

export const Col = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
height: fit-content;
border: ${(props: ColProps) => props.border ? "2px solid" : 'none'};
border-top: none;
border-color: ${(props: ColProps) => props.border ? props.theme.colors.redImperial : 'none'};
background-color: ${(props: ColProps) => props.background ? props.theme.colors.redImperial : props.theme.colors.white};
position: relative;
border: 2px solid red;
.contact-info-social{
  width: 50%;
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  border: 2px solid red;
}
`;
