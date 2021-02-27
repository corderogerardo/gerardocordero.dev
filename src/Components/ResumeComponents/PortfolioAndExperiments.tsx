import styled from "styled-components"
import media from "styled-media-query"

export const PortfolioAndExperiments = styled.section`
display: flex;
justify-content: space-around;
align-items: center;
flex-direction: column;
height: 450px;
.portfolio-logos{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.experiments-logos{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  display: grid;
};

.and{
  display: flex;
  font-family: ${({ theme }) => theme.fontFamily.major};
  font-size: 24px;
  justify-content: center;
  width: 100%;
}
.portfolio{
  font-style: normal;
  font-weight: normal;
  font-family: ${({ theme }) => theme.fontFamily.oxygen};
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: #000000;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 48px;
  width: 100%;
  margin: 0;
  padding: 0;
  span{
    margin: 0;
    padding: 0;
    font-size: 72px;
  }
}
.experiments{
  font-style: normal;
  font-weight: normal;
  font-family: ${({ theme }) => theme.fontFamily.major};
  display: flex;
  justify-content: center;
  align-items: flex-end;
  color: #000000;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 48px;
  width: 100%;
  margin: 0;
  padding: 0;
  span{
    margin: 0;
    padding: 0;
    font-size: 72px;
  }
}
`
