import styled from "styled-components"

export const Title = styled.h1`
font-family: ${({ theme }) => theme.fontFamily.oxygen};
width: 80%;
display: flex;
justify-content: flex-start;
color: ${({ theme }) => theme.colors.black};
`;
