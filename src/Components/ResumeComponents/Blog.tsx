import styled from "styled-components"
import media from "styled-media-query"

export const Blog = styled.aside`
font-family: ${({ theme }) => theme.fontFamily.oxygen};
display: flex;
align-items: center;
flex-direction: column;
justify-content: space-between;
height: 400px;
width: 100%;
order: 5;
background-color: ${(props) => props.theme.colors.redImperial};
${media.greaterThan("medium")`
  order: 0;
  height: 100%;
`};
.blogTitle {
  font-size: 16px;
  a{
    text-decoration: none;
    color: ${({ theme }) => theme.colors.honeydew};
    &:hover{
      color: ${({ theme }) => theme.colors.bluePrussian};
      text-decoration: underline;
    }
  }
}
.blog-post{
    font-size: 12px;
    color: ${({ theme }) => theme.colors.honeydew};
    text-decoration: none;
    &:hover{
      color: ${({ theme }) => theme.colors.bluePrussian};
      text-decoration: underline;
    }
  }
`
