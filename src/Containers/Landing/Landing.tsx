import { useEffect } from "react";
import styled from "styled-components";
import { LandingContainer } from "./styles";

import {
  Linkedin,
  Twitter,
  Github,
  Experiments,
  Portfolio,
} from "../../images";
import { Blog, Card, Footer } from "./../../Components/ResumeComponents";

const Name = styled(Text)``;

export default function Landing() {
  useEffect(() => {}, []);
  return (
    <LandingContainer>
      <MainContainer>
        <Col width="100%" border={false} background={false} order={1}>
          <Title>
            <Name>Gerardo</Name>
            <Name>Cordero</Name>
          </Title>
          <Subtitle>JavaScript Developer</Subtitle>
          <Description>
            I'm an individual contributor focused on JavaScript, React, React
            Native. As part of Outsourcing and Staff augmentation companies,
            I’ve participated in several projects in the business of Education,
            Finance, Travel, and telecommunications.
            <br />
            <span className="more-info">
              <a
                href="https://me.gerardocordero.dev"
                rel="noreferrer"
                target="_blank"
              >
                More info
              </a>
            </span>
          </Description>
          <Images></Images>
        </Col>
        <Col width="100%" border={true} order={2}>
          <PortfolioAndExperiments className="portfolio-experiments">
            <a href="/portfolio" rel="noreferrer" className="portfolio-logos">
              <Portfolio />
            </a>
            <a href="/portfolio" className="portfolio">
              <span className="portfolio-p">P</span>ortfolio
            </a>
            <span className="and">&&</span>
            <a href="/experiments" rel="noreferrer" className="experiments">
              <span>E</span>xperiments
            </a>
            <a
              href="/experiments"
              rel="noreferrer"
              className="experiments-logos"
            >
              <Experiments />
            </a>
          </PortfolioAndExperiments>
        </Col>
        <Blog>
          <h1 className="blogTitle">
            <a
              href="https://blog.gerardocordero.dev"
              rel="noreferrer"
              target="_blank"
            >
              Blog
            </a>
          </h1>
          <a
            className="blog-post"
            href="https://blog.gerardocordero.dev/WIP-What-is-tab-napping-attacks-3299a4a47e9345c7b98cc2055d8d0cc2"
            rel="noreferrer"
            target="_blank"
          >
            What is tab-napping attacks?
          </a>

          <a
            className="blog-post"
            href="https://blog.gerardocordero.dev/React-Native-Architecture-9ddeb379c7c846de987bd3719ca8d6dc"
            rel="noreferrer"
            target="_blank"
          >
            React Native Architecture
          </a>

          <h2 className="blogTitle">
            <a
              href="https://resume.gerardocordero.dev"
              rel="noreferrer"
              target="_blank"
            >
              Resume
            </a>
          </h2>

          <iframe
            src="https://open.spotify.com/embed/playlist/0JDoNVr7hDoSzg3Cme80tn"
            width="100%"
            height="230"
            frameBorder="0"
            title="TheSpaceTravelYouNeed"
          ></iframe>
        </Blog>
        <Col width="100%" background={true} order={6}>
          <address className="address">
            <ContactInfo
              href="tel:+51968661977"
              info="+51968661977"
              name="Phone"
            />
            <ContactInfo
              href="mailto:mail@gerardocordero.dev?subject = Hiring - Project&body = We are looking for a JavaScript Developer."
              info="mail@gerardocordero.dev"
              name="Email"
            />
            <ContactInfo
              href="mailto:cordero.gerard@gmail.com?subject = Hiring - Project&body = We are looking for a JavaScript Developer."
              info="cordero.gerard@gmail.com"
              name="Meet"
            />
            <ContactInfo
              href="tel:cordero_gerardo"
              info="cordero_gerardo"
              name="Skype"
            />
            <ContactInfo
              href="https://www.efset.org/cert/5P9HC2"
              info="C1 Advanced"
              name="English"
            />
          </address>

          <div className="contact-info-social">
            <a
              href="https://twitter.com/officelocation"
              target="_blank"
              rel="noreferrer"
            >
              <Twitter />
            </a>
            <a
              href="https://www.linkedin.com/in/corderogerardo/"
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin />
            </a>
            <a
              href="https://github.com/corderogerardo"
              target="_blank"
              rel="noreferrer"
            >
              <Github />
            </a>
          </div>
        </Col>
        <Col width="100%" order={3}>
          <Experience>
            <section className="headers">
              <div className="experience">
                <h2>EXPERIENCE</h2>
                <span></span>
              </div>
            </section>
            <section className="content">
              <Card>
                <time className="time">2021 - 2022</time>
                <div className="main">
                  <h1>NovaComp</h1>
                  <em>Consultor Senior</em>
                  <p>Working in React Native Apps for US Clients.</p>
                  <p>
                    <b>Projects</b>: SplashSpot, Instatoolz, WeCurl, Hotspotter.
                  </p>
                </div>
              </Card>
              <Card>
                <time className="time">2018 - 2020</time>
                <div className="main">
                  <h1>Bits Kingdom</h1>
                  <em>Full Stack</em>
                  <p>
                    As a Full Stack I took designs to code caring about UX,
                    accessibility, responsiveness, testing and DX, API
                    integrations, propose and implement new libraries.
                  </p>
                  <p>
                    <b>Projects</b>: Clinkky, StartUY, Mamalingua.
                  </p>
                </div>
              </Card>
              <Card>
                <time className="time">2018 - 2019</time>
                <div className="main">
                  <h1>Solera Mobile</h1>
                  <em>Frontend Developer</em>
                  <p>
                    As a frontend developer I mockup designs to code creating
                    components to build a product from scratch and helping add
                    business logic in other products.{" "}
                  </p>
                  <p>
                    <b>Projects</b>: Tuenti Freemium, Dinners backoffice.
                  </p>
                </div>
              </Card>
              {/* <Card>
                <time className="time">2017 - 2017</time>
                <div className="main">
                  <h1>Tuten</h1>
                  <em>Frontend Developer</em>
                  <p>
                    As a frontend developer I added new business logic to the
                    frontend apps, maintain and refactored old code following
                    angular best practice for optimization and performance.{" "}
                  </p>
                  <p>
                    <b>Projects</b>: Tuten.
                  </p>
                </div>
              </Card> */}
            </section>
          </Experience>
        </Col>
        <Col width="100%" order={4}>
          <Education>
            <section className="headers">
              <div className="education">
                <h2>EDUCATION</h2>
                <span></span>
              </div>
            </section>
            <section className="content">
              <Card>
                <time className="time">2006 - 2009</time>
                <div className="main">
                  <h1>IUT Antonio Jose de Sucre, Barquisimeto (Venezuela)</h1>
                  <em>Senior University Technician in Computer Science</em>
                  <p>
                    Learned about POO, system design UML, SQL, C++, networks
                  </p>
                </div>
              </Card>
            </section>
          </Education>
        </Col>
      </MainContainer>
      <Footer>
        <a href="https://gerardocordero.dev">Gerardo Cordero</a>
        <p>2021</p>
      </Footer>
    </LandingContainer>
  );
}
