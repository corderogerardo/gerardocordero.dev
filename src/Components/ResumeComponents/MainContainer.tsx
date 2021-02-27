import styled from "styled-components"
import media from "styled-media-query"

export const MainContainer = styled.div`
margin: 0;
padding: 0;
background-color: ${({ theme }) => theme.colors.white};
${media.greaterThan("medium")`
  display: grid;
  grid-template-rows: 60% 40%;
  grid-template-columns: 25% 50% 25%;
  `};
`
