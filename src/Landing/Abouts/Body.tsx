import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const AboutBody = styled.div`
  border: 1px solid red;
  display: flex;
  flex-direction: row;
  align-items: space-around;
  border: 1px solid red;
  width: 100%;
  height: fit-content;
  text-align: left;
  padding: 0 4%;
`;

const Body = () => {
  const { t } = useTranslation();
  return <AboutBody>{t("abouts.old")}</AboutBody>;
};
export default React.memo(Body);
