import { css } from 'styled-components'

// CSS Helper
// Needed for props in Mixins

interface Top {
  topPx: string
}

export const fixedTop = css`
  position: fixed;
  top: ${({ topPx: Top = 0 }) => topPx + 'px'};
  left: 0
`
