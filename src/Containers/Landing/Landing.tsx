import { useEffect } from 'react'
import styled from "styled-components"
import { LandingContainer } from './styles'

import { Row, Col, Title, Subtitle, Description, Images, Text } from './../../Components/ResumeComponents'

const MainContainer = styled.div`
display: flex;
flex-direction: column;
width: 90%;
height: 85%;
background-color: ${({ theme }) => theme.colors.white}
`

const Name = styled(Text)``;

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
          <Col width="30%" background={true}>

          </Col>
          <Col width="70%"> </Col>
        </Row>

      </MainContainer>
    </LandingContainer>
  );
}
