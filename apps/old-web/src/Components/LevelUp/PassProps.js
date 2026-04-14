import styled from "styled-components";

const Button = styled.button`
  background-color: ${(props) =>
    props.types === "cancel" ? "tomato;" : "indigo;"};
  padding: 5px 10px;
  border-radius: 4px;
  color: white;
  border: none;
  outline: none;
`;
export { Button };
