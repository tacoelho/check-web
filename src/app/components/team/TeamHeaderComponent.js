import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import { injectIntl, FormattedMessage } from 'react-intl';
import CheckContext from '../../CheckContext';
import {
  Text,
  Row,
  defaultBorderRadius,
  subheading2,
  ellipsisStyles,
  avatarStyle,
  headerHeight,
  avatarSize,
  mediaQuery,
  black87,
  black54,
  white,
  units,
  caption,
} from '../../styles/js/variables';
import { stringHelper } from '../../customHelpers';

const drawerTopOffset = '90px';

const styles = {
  drawerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: white,
    padding: `${units(2)} ${units(4)}`,
  },
  drawerFooterLink: {
    font: caption,
  },
  drawerProjects: {
    overflow: 'auto',
    marginBottom: 'auto',
  },
  drawerProjectsAndFooter: {
    display: 'flex',
    flexDirection: 'column',
    height: `calc(100vh - ${drawerTopOffset})`,
  },
};

class TeamHeaderComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  componentWillMount() {
    this.updateContext();
  }

  componentWillUpdate() {
    this.updateContext();
  }

  updateContext() {
    new CheckContext(this).setContextStore({ team: this.props.team });
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  render() {
    const team = this.props.team;
    const isProjectUrl = /(.*\/project\/[0-9]+)/.test(window.location.pathname);


    const TosMenuItem = (
      <Link style={styles.drawerFooterLink} to={stringHelper('TOS_URL')}>
        <FormattedMessage
          id="headerActions.tos"
          defaultMessage="Terms"
        />
      </Link>
    );

    const privacyMenuItem = (
      <Link style={styles.drawerFooterLink} to={stringHelper('PP_URL')}>
        <FormattedMessage
          id="headerActions.privacyPolicy"
          defaultMessage="Privacy"
        />
      </Link>
    );

    const aboutMenuItem = (
      <Link style={styles.drawerFooterLink} to={stringHelper('ABOUT_URL')}>
        <FormattedMessage
          id="headerActions.about"
          defaultMessage="About"
        />
      </Link>
    );

    const contactMenuItem = (
      <Link
        style={styles.drawerFooterLink}
        to={stringHelper('CONTACT_HUMAN_URL')}
      >
        <FormattedMessage
          id="headerActions.contactHuman"
          defaultMessage="Contact"
        />
      </Link>
    );

    const TeamLink = styled(Link)`
      align-items: center;
      display: flex;
      height: 100%;
      overflow: hidden;
      width: 100%;
      cursor: pointer;

      &,
      &:hover {
        text-decoration: none;
      }

      &,
      &:visited {
        color: inherit;
      }
    `;

    const TeamNav = styled.nav`
      border-radius: ${defaultBorderRadius};
      display: flex;
      height: ${headerHeight};
      overflow: hidden;
    `;

    const TeamName = styled.h3`
      ${ellipsisStyles}
      font: ${subheading2};
      color: ${black54};
      ${mediaQuery.handheld`
         max-width: 35vw;
      `}
    `;

    const Headline = styled.h2`
      font: ${subheading2};
      font-weight: 600;
      line-height: ${units(6.5)};
      color: ${black87};
    `;

    const TeamAvatar = styled.div`
      ${avatarStyle}
      background-image: url(${team.avatar});
      width: ${avatarSize};
      height: ${avatarSize};
    `;

    const projectList = this.props.team.projects.edges
      .sortp((a, b) => a.node.title.localeCompare(b.node.title))
      .map((p) => {
        const projectPath = `/${this.props.team.slug}/project/${p.node.dbid}`;

        return (
          <MenuItem key={p.node.dbid} href={projectPath}>
            <Text ellipsis>{p.node.title}</Text>
          </MenuItem>
        );
      });

    return (
      <div>
        <TeamNav>
          <TeamLink
            onClick={this.handleToggle}
            title={team.name}
            className="team-header__avatar"
          >
            {isProjectUrl
              ? <TeamAvatar />
              : <Row>
                <TeamAvatar />
                <TeamName style={{ margin: `0 ${units(2)}` }}>
                  {team.name}
                </TeamName>
              </Row>}
          </TeamLink>
        </TeamNav>
        <Drawer
          docked={false}
          open={this.state.open}
          onRequestChange={open => this.setState({ open })}
          style={{ position: 'relative' }}
        >
          <MenuItem className="team-header__drawer-team-link" leftIcon={<TeamAvatar />} href={`/${this.props.team.slug}/`}>
            <Headline>{team.name}</Headline>
          </MenuItem>
          <Divider />
          <div style={styles.drawerProjectsAndFooter}>
            <div style={styles.drawerProjects}>
              {projectList}
            </div>

            <div style={styles.drawerFooter}>
              {TosMenuItem}
              {privacyMenuItem}
              {aboutMenuItem}
              {contactMenuItem}
            </div>
          </div>
        </Drawer>
      </div>
    );
  }
}

TeamHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(TeamHeaderComponent);
