import styled from "styled-components"
import { DefaultTheme } from './../../styles/default-theme'

interface ContactProps {
  info: string,
  href: string,
  name: string,
  className?: string,
  theme: DefaultTheme,

}

function Contact({ info, href, name, className }: ContactProps) {
  return (
    <div className={className}>
      <span>
        {name}:
              </span>
      <a href={`${href}`} rel="noreferrer" target="_blank">{info}</a>
    </div>
  )
};

export const ContactInfo = styled(Contact)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
  font-family: ${({ theme }) => theme.fontFamily.oxygen};
  font-size: 13px;
  span{
    width: auto;
    color: ${({ theme }) => theme.colors.honeydew};
  }
  a{
    width: 75%;
    color: ${({ theme }) => theme.colors.honeydew};
    text-decoration: none;
    cursor: pointer;
    &:hover{
      color: ${({ theme }) => theme.colors.bluePrussian};
      text-decoration: underline;
    }
  }
`;
