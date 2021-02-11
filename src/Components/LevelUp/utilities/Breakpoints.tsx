import { css } from 'styled-components'

interface BreakPoint {
  small: number;
  med: number;
  large: number;
}

const size: BreakPoint = {
  small: 400,
  med: 960,
  large: 1140
};

export const above = Object.keys(size).reduce((acc, label) => {
  acc[label] = (...args) => css`
    @media (min-width: ${size[label] / 16}em){
      ${css(...args)}
    }
  `;
  return acc;
}, {});

export const below = Object.keys(size).reduce((acc, label) => {
  acc[label] = (...args) => css`
    @media (max-width: ${size[label] / 16}em){
      ${css(...args)}
    }
  `;
  return acc;
}, {});
