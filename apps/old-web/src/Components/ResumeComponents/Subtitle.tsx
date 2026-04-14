import styled from "styled-components"

export const Subtitle = styled.h2`
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
