import { useEffect } from 'react'
import styled from "styled-components"
import { LandingContainer } from './styles'

const MainContainer = styled.div`
width: 90%;
height: 90%;
background-color: ${({ theme }) => theme.colors.white}
`

export default function Landing() {
  useEffect(() => {

  }, [])
  return (
    <LandingContainer>
      <MainContainer></MainContainer>
    </LandingContainer>
  );
}
