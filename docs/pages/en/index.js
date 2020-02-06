const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('introduction')}>Introduction</Button>
            <Button href={docUrl('tutorial')}>Getting Started</Button>
            <Button href={docUrl('testing')}>Testing</Button>
            <Button href={docUrl('faq')}>FAQ</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl} = siteConfig;

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content: 'Only a few public interfaces (i.e. combineModelReducers, modelRootSaga, Model, connectModel or equivalent hooks).',
            // image: `${baseUrl}img/undraw_react.svg`,
            // imageAlign: 'top',
            title: 'Easy to use and learn',
          },
          {
            content: 'Less boilerplate (i.e. actions, dispatchers, reducers).',
            // image: `${baseUrl}img/undraw_operating_system.svg`,
            // imageAlign: 'top',
            title: 'Succinct',
          },
          {
            content: 'Immutability with normal JavaScript objects and arrays. No new APIs to learn!',
            // image: `${baseUrl}img/undraw_operating_system.svg`,
            // imageAlign: 'top',
            title: 'Immutable',
          },
          {
            content: 'Async, typescript, memoised selectors, and hooks support.',
            // image: `${baseUrl}img/undraw_operating_system.svg`,
            // imageAlign: 'top',
            title: 'Modern',
          }, {
            content: 'Just ~6KB.',
            // image: `${baseUrl}img/undraw_react.svg`,
            // imageAlign: 'top',
            title: 'Tiny',
          },
        ]}
      </Block>
    );

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
        </div>
      </div>
    );
  }
}

module.exports = Index;
