import styled from "styled-components";
import media from "styled-media-query";

export const Experience = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .headers {
    width: 100%;
    height: 20%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    h2 {
      font-family: Oxygen;
      font-style: normal;
      font-weight: bold;
      font-size: 14px;
      line-height: 18px;
      display: flex;
      align-items: center;
      color: #1d3557;
      padding-left: 2%;
    }
    .experience {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      span {
        height: 1px;
        width: 50%;
        background-color: ${({ theme }) => theme.colors.bluePrussian};
      }
    }
  }
  .content {
    width: 100%;
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-left: 8%;
    ${media.greaterThan("medium")`
      flex-direction: row;
      width: 100%;
    `};
  }
`;
