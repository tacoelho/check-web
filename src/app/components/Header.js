import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/lib/flat-button';
import TeamHeader from './team/TeamHeader';
import ProjectHeader from './project/ProjectHeader';

class Header extends Component {
  render() {
    const { state } = this.props;
    const path = this.props.location ? this.props.location.pathname : null;

    if (!state.app.token) {
      return null;
    }

    if (this.isProjectRoute(path)) {
      return (
        <header className='header header--project'>
          <div className='header__team'><TeamHeader {...this.props} /></div>
          <ProjectHeader {...this.props} />
        </header>
      );

    } else if (this.isMediaRoute(path)) {
      return (
        <header className='header header--media'>
          <div className='header__team'><TeamHeader {...this.props} /></div>
          {/* TODO: get media's project for rendering a <ProjectHeader {...this.props} /> */}
        </header>
      );

    } else {
      return (
        <header className='header header--todo'>
          <img className='header--todo__brand' src='/img/logo/logo-1.svg'/>
        </header>
      );
    }
  }

  isProjectRoute(path) {
    return path && path.match(/project\/[0-9]+/);
  }

  isMediaRoute(path) {
    return path && path.match(/media\/[0-9]+/);
  }
}

export default Header;
