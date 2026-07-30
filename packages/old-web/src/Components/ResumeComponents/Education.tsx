import styled from "styled-components"

export const Education = styled.section`
width: 100%;
height: 100%;
display: flex;
flex-direction: column;
.headers{
  width: 100%;
  height: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  h2{
    font-family: Oxygen;
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    line-height: 18px;
    display: flex;
    align-items: center;
    color: #1D3557;
    padding-left: 2%
  }
  .education{
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    span{
      height: 1px;
      width: 50%;
      background-color: ${({ theme }) => theme.colors.bluePrussian};
    }
  }
}
.content{
  width: 100%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-left: 8%;
}
`;
