import styled from "styled-components"

export const Description = styled.p`
width: 80%;
font-family: ${({ theme }) => theme.fontFamily.oxygen};
font-style: normal;
font-weight: normal;
font-size: 12px;
line-height: 20px;
color: ${({ theme }) => theme.colors.black};
`;
