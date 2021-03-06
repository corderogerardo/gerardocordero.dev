import styled from "styled-components";
import media from "styled-media-query";

const CodeWars = () => (
  <div>
    <a href="https://www.codewars.com/users/corderogerardo" rel="noreferrer">
      <img
        width="100px"
        height="25px"
        src="https://www.codewars.com/users/corderogerardo/badges/micro"
        alt="Code Wars Profile"
      />
    </a>{" "}
    <a href="https://leetcode.com/corderogerardo/" rel="noreferrer">
      <img
        width="100px"
        height="25px"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/LeetCode_Logo_black_with_text.svg/1280px-LeetCode_Logo_black_with_text.svg.png"
        alt="Leet Code Profile"
      />
    </a>
  </div>
);

export const Images = styled(CodeWars)`
  ${media.greaterThan("medium")`
  bottom: 0;
  position: absolute;
  `};
`;
