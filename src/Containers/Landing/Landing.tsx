import { useEffect } from 'react'
import styled from "styled-components"
import { LandingContainer } from './styles'

import { Linkedin, Twitter, Github, Experiments, Portfolio } from '../../images';
import { Row, Col, Title, Subtitle, Description, Images, Text, ContactInfo } from './../../Components/ResumeComponents'

const MainContainer = styled.div`
display: flex;
flex-direction: column;
width: 90%;
height: 85%;
background-color: ${({ theme }) => theme.colors.white}
`

const Name = styled(Text)``;
const PortfolioExperiments = styled.section`
display: flex;
justify-content: space-around;
align-items: center;
flex-direction: column;
height: 85%;
.portfolio-logos{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.experiments-logos{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  display: grid;
};

.and{
  display: flex;
  font-family: ${({ theme }) => theme.fontFamily.major};
  font-size: 24px;
  justify-content: center;
  width: 100%;
}
.portfolio{
  font-style: normal;
  font-weight: normal;
  font-family: ${({ theme }) => theme.fontFamily.oxygen};
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: #000000;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 48px;
  width: 100%;
  margin: 0;
  padding: 0;
  span{
    margin: 0;
    padding: 0;
    font-size: 72px;
  }
}
.experiments{
  font-style: normal;
  font-weight: normal;
  font-family: ${({ theme }) => theme.fontFamily.major};
  display: flex;
  justify-content: center;
  align-items: flex-end;
  color: #000000;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 48px;
  width: 100%;
  margin: 0;
  padding: 0;
  span{
    margin: 0;
    padding: 0;
    font-size: 72px;
  }
}
`

const BlogContainer = styled.section`
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

const ExperienceAndEducation = styled.section`
  border: 1px solid green;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .headers{
    border: 2px solid blue;
    width: 100%;
    height: 20%;
    display: flex;
    flex-direction: row;
    .experience{

    }
    .education{

    }
  }
  .content{
    border: 1px solid green;
    width: 100%;
    height: 80%;
    display: flex;
    flex-direction: column;
    .experience
    .education{

    }
  }

`;

export default function Landing() {
  useEffect(() => {

  }, [])
  return (
    <LandingContainer>
      <MainContainer>
        <Row height="60%">
          <Col width="25%" border={false} background={false}>
            <Title>
              <Name>
                Gerardo
            </Name>
              <Name>
                Cordero
            </Name>
            </Title>
            <Subtitle>JavaScript Developer</Subtitle>
            <Description>
              I'm an individual contributor focused on JavaScript, React, React Native.

              As part of Outsourcing and Staff augmentation companies, I’ve participated in several projects in the business of Education, Finance, Travel, and telecommunications.
              <h3 className="more-info"><a href="https://me.gerardocordero.dev" rel="noreferrer" target="_blank">More info</a></h3>
            </Description>
            <Images></Images>
          </Col>
          <Col width="55%" border={true}>
            <PortfolioExperiments className="portfolio-experiments">
              <Row height="10%">
                <a href="/portfolio" rel="noreferrer" className="portfolio-logos">
                  <Portfolio />
                </a>
              </Row>
              <Row height="20%">
                <a href="/portfolio" className="portfolio"> <span className="portfolio-p">P</span>ortfolio</a>
              </Row>
              <Row height="5%">
                <span className="and">&&</span>
              </Row>
              <Row height="20%">
                <a href="/experiments" rel="noreferrer" className="experiments"><span>E</span>xperiments</a>
              </Row>
              <Row height="10%">
                <a href="/experiments" rel="noreferrer" className="experiments-logos">
                  <Experiments />
                </a>
              </Row>
            </PortfolioExperiments>
          </Col>
          <Col width="20%" background={true}>
            <BlogContainer>
              <h1 className="blogTitle"><a href="https://blog.gerardocordero.dev" rel="noreferrer" target="_blank">Blog</a></h1>
              <a className="blog-post" href="https://blog.gerardocordero.dev/WIP-What-is-tab-napping-attacks-3299a4a47e9345c7b98cc2055d8d0cc2" rel="noreferrer" target="_blank">What is tab-napping attacks?</a>

              <a className="blog-post" href="https://blog.gerardocordero.dev/React-Native-Architecture-9ddeb379c7c846de987bd3719ca8d6dc" rel="noreferrer" target="_blank">React Native Architecture</a>

              <h2 className="blogTitle"><a href="https://resume.gerardocordero.dev" rel="noreferrer" target="_blank">Resume</a></h2>

              <iframe src="https://open.spotify.com/embed/playlist/0JDoNVr7hDoSzg3Cme80tn" width="100%" height="230" frameborder="0" allowtransparency="true" allow="encrypted-media" title="TheSpaceTravelYouNeed"></iframe>
            </BlogContainer>
          </Col>
        </Row>
        <Row height="40%">
          <Col width="25%" background={true}>
            <ContactInfo href="tel:+51968661977" info="+51968661977" name="Phone" />
            <ContactInfo href="mailto:mail@gerardocordero.dev?subject = Hiring - Project&body = We are looking for a JavaScript Developer." info="mail@gerardocordero.dev" name="Email" />
            <ContactInfo href="tel:cordero_gerardo" info="cordero_gerardo" name="Skype" />
            <ContactInfo href="https://www.efset.org/cert/5P9HC2" info="C1 Advanced" name="English" />
            <div className="contact-info-social">
              <a href="https://twitter.com/gecordero" target="_blank" rel="noreferrer"><Twitter /></a>
              <a href="https://www.linkedin.com/in/corderogerardo/" target="_blank" rel="noreferrer"><Linkedin /></a>
              <a href="https://github.com/corderogerardo" target="_blank" rel="noreferrer"><Github /></a>
            </div>

          </Col>
          <Col width="75%">
            <ExperienceAndEducation>

            </ExperienceAndEducation>

          </Col>
        </Row>

      </MainContainer>
    </LandingContainer>
  );
}
