import styled from 'styled-components'

interface ButtonProps {
  types: string
}

const Button = styled.button`
background-color: ${(props: ButtonProps) => (props.types === 'cancel' ? 'tomato;' : 'indigo;')};
padding: 5px 10px;
border-radius: 4px;
color: white;
border: none;
outline: none;
`
export {
  Button
}
