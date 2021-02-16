import styled from "styled-components"

interface RowProps {
  height: string
}

export const Row = styled.div`
display: flex;
width: 100%;
height: ${(props: RowProps) => props.height};
background-color: ${({ theme }) => theme.colors.white};
position: relative;
`;
