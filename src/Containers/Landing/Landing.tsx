import { useEffect } from 'react'
import styled from "styled-components"
import { LandingContainer } from './styles'
import { DefaultTheme } from './../../styles/default-theme'

import MainTech from './../../Components/MainTech/MainTech'

const MainContainer = styled.div`
display: flex;
flex-direction: column;
width: 90%;
height: 85%;
background-color: ${({ theme }) => theme.colors.white}
`

interface RowProps {
  height: string
}
interface ColProps {
  width: string,
  border?: boolean,
  background?: boolean,
  theme: DefaultTheme
};

const Row = styled.div`
display: flex;
width: 100%;
height: ${(props: RowProps) => props.height};
background-color: ${({ theme }) => theme.colors.white};
position: relative;
`;
const Col = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
width: ${(props: ColProps) => props.width};
height: 100%;
border: ${(props: ColProps) => props.border ? "2px solid" : 'none'};
border-top: none;
border-color: ${(props: ColProps) => props.border ? props.theme.colors.redImperial : 'none'};
background-color: ${(props: ColProps) => props.background ? props.theme.colors.redImperial : props.theme.colors.white};
position: relative;
`;

const Title = styled.h1`
font-family: ${({ theme }) => theme.fontFamily.oxygen};
width: 80%;
display: flex;
justify-content: flex-start;
color: ${({ theme }) => theme.colors.black};
`;
const Text = styled.div`
font-style: normal;
font-weight: bold;
font-size: 30px;
padding: 0;
margin: 0;
margin-right: ${({ theme }) => theme.spaces.four};
&::first-letter{
  font-size: 40px;
};
`;
const Name = styled(Text)``;

const Subtitle = styled.h2`
width: 80%;
font-family: ${({ theme }) => theme.fontFamily.major};
font-style: normal;
font-weight: normal;
font-size: 12px;
line-height: 16px;
display: flex;
align-items: center;
color: ${({ theme }) => theme.colors.black};
`;

const Description = styled.p`
width: 80%;
font-family: ${({ theme }) => theme.fontFamily.oxygen};
font-style: normal;
font-weight: normal;
font-size: 12px;
line-height: 20px;
color: ${({ theme }) => theme.colors.black};
`;

const Images = styled(MainTech)`
position: absolute;
bottom: 5%;
`;

export default function Landing() {
  useEffect(() => {

  }, [])
  return (
    <LandingContainer>
      <MainContainer>
        <Row height="60%">
          <Col width="30%" border={false} background={false}>
            <Title>
              <Name>
                Gerardo
            </Name>
              <Name>
                Cordero
            </Name>
            </Title>
            <Subtitle>JavaScript Developer</Subtitle>
            <Description>
              I'm an individual contributor focused on JavaScript, React, React Native.

              As part of Outsourcing and Staff augmentation companies, I’ve participated in several projects in the business of Education, Finance, Travel, and telecommunications.
            </Description>
            <Images></Images>
          </Col>
          <Col width="50%" border={true}> </Col>
          <Col width="20%" background={true}> </Col>
        </Row>
        <Row height="40%">
          <Col width="30%" background={true}> </Col>
          <Col width="70%"> </Col>
        </Row>

      </MainContainer>
    </LandingContainer>
  );
}
