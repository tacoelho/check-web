import React, { Component, PropTypes } from 'react';
import MediaCard from './MediaCard';

class Medias extends Component {
  render() {
    const props = this.props;
    
    return (
      <div>
        <ul className="medias-list">
        {props.medias.map(function(node) {
          const media = node.node;
          
          return (
            <li className="media-card-link">
              <MediaCard media={media} />
            </li>
          );
        })}
        </ul>
      </div>
    );
  }
}

export default Medias;
