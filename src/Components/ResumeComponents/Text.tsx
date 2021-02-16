import styled from "styled-components"

export const Text = styled.div`
font-style: normal;
font-weight: bold;
font-size: 30px;
padding: 0;
margin: 0;
margin-right: ${({ theme }) => theme.spaces.four};
&::first-letter{
  font-size: 40px;
};
`;
