import styled from "styled-components"
import media from "styled-media-query"

export const Blog = styled.aside`
font-family: ${({ theme }) => theme.fontFamily.oxygen};
display: flex;
align-items: center;
flex-direction: column;
justify-content: space-between;
height: 100%;
width: 100%;
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
