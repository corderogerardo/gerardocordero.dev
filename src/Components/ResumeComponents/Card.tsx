import styled from "styled-components"
import media from "styled-media-query"

export const Card = styled.section`
width: 300px;
height: 200px;
font-family: ${({ theme }) => theme.fontFamily.oxygen};
display: flex;
flex-direction: row;
position: relative;
align-items: center;
justify-content: center;
${media.greaterThan("medium")`
  width: 200px;
  height: 200px;
`};
.time{
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  position: absolute;
  left: -20px;
  top: 40px;
  color: #000000;
  transform: rotate(-90deg);
  font-family: ${({ theme }) => theme.fontFamily.oxygen};
}
.main{
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 90%;
  height: 100%;
  font-family: ${({ theme }) => theme.fontFamily.oxygen};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  padding-left: ${({ theme }) => theme.spaces.eigth};

  h1{
    width: 100%;
    font-size: 12px;
  }
  em{
    width: 100%;
    font-family: ${({ theme }) => theme.fontFamily.major};
    font-size: 10px;
  }
  p{
    width: 85%;
    font-size: 10px;
  }
}

`;
