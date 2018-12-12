import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { Link } from 'react-router';
import { Card, CardHeader } from 'material-ui/Card';
import styled from 'styled-components';
import MdAccessTime from 'react-icons/lib/md/access-time';
import MdFormatQuote from 'react-icons/lib/md/format-quote';
import FaFeed from 'react-icons/lib/fa/feed';
import IconInsertPhoto from 'material-ui/svg-icons/editor/insert-photo';
import rtlDetect from 'rtl-detect';
import TimeBefore from '../TimeBefore';
import MediaStatus from './MediaStatus';
import MediaExpanded from './MediaExpanded';
import MediaUtil from './MediaUtil';
import MediaRelatedComponent from './MediaRelatedComponent';
import CheckContext from '../../CheckContext';
import UserUtil from '../user/UserUtil';
import { getStatus, getStatusStyle, bemClassFromMediaStatus } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import {
  Row,
  units,
  black87,
  black38,
  defaultBorderRadius,
  Offset,
  subheading1,
  Text,
  inProgressYellow,
  unstartedRed,
  completedGreen,
} from '../../styles/js/shared';

const messages = defineMessages({
  progress: {
    id: 'mediaDetail.progress',
    defaultMessage: '{answered} required tasks answered, out of {total}',
  },
});

const StyledProgress = styled.span`
  padding: 1px 3px;
  display: inline-block;
  color: white;
  border-radius: ${defaultBorderRadius};
  background: ${props => props.bgColor};
`;

const StyledHeading = styled.h3`
  font: ${subheading1};
  font-weight: 500;
  &,
  a,
  a:visited {
    color: ${black87} !important;
  }
`;

const StyledHeadingContainer = styled.span`
    padding-right: ${units(1)};
    display: inline-flex;
    align-items: center;
    font-size: '16px';
    margin-bottom: ${units(0.5)};
`;

const StyledMediaIconContainer = styled.div`
  display: inline-flex;
  align-items: flex-start;
  height: ${units(2)};
  padding-right: ${units(1)};
  svg {
    width: ${units(2)} !important;
    height: ${units(2)} !important;
    color: ${black38} !important;
  }
`;

const StyledHeaderTextSecondary = styled.div`
  justify-content: flex-start;
  flex-wrap: wrap;
  font-weight: 400;
  white-space: nowrap;
`;

const StyledCardHeader = styled(({ inMediaPage, ...rest }) => <CardHeader {...rest} />)`
  cursor: ${props => props.inMediaPage ? null : 'pointer'};
  > div {
    padding: 0!important;
  }
`;

const StyledMediaDetail = styled.div`
  .card-with-border {
    border-${props => props.fromDirection}: ${units(1)} solid;
    border-color: ${props => props.borderColor};
    border-radius: ${defaultBorderRadius};
    // Disable border in some views
    ${props => (props.hideBorder ? 'border: none;' : null)}
  }

  .media-detail__description {
    margin-top: ${units(1)};
    max-width: ${units(80)};
  }
`;

class MediaDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: props.initiallyExpanded,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleExpandChange = (expanded) => {
    this.setState({ expanded });
  };

  handleToggle = (event, toggle) => {
    this.setState({ expanded: toggle });
  };

  handleExpand = () => {
    this.setState({ expanded: true });
  };

  handleReduce = () => {
    this.setState({ expanded: false });
  };

  handleClickHeader = (event, mediaUrl) => {
    // Prevent navigation if click was on a child element
    if (event.target === event.currentTarget) {
      this.getContext().history.push(mediaUrl);
    }
  };

  render() {
    const {
      media,
      annotated,
      annotatedType,
      intl: { locale },
    } = this.props;
    // TODO drop data variable, use media.embed directly
    const data = typeof media.embed === 'string' ? JSON.parse(media.embed) : media.embed;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';
    const { currentUser } = this.getContext();
    const annotationsCount = UserUtil.myRole(currentUser, media.team.slug) === 'annotator' ?
      null : MediaUtil.notesCount(media, data, this.props.intl);
    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));
    const cardHeaderStatus = (
      <MediaStatus
        media={media}
        readonly={this.props.readonly || media.last_status_obj.locked}
      />
    );
    const sourceName = MediaUtil.sourceName(media, data);
    const createdAt = MediaUtil.createdAt(media);
    const isImage = !!media.media.embed_path;

    let projectId = media.project_id;

    if (!projectId && annotated && annotatedType === 'Project') {
      projectId = annotated.dbid;
    }

    const mediaUrl = projectId && media.team && media.dbid > 0
      ? `/${media.team.slug}/project/${projectId}/media/${media.dbid}`
      : null;

    const sourceUrl = media.team &&
      media.project &&
      media.project_source &&
      media.project_source.dbid ?
      `/${media.team.slug}/project/${media.project.dbid}/source/${media.project_source.dbid}` :
      null;

    const projectTitle = media.project ? media.project.title : null;

    const projectUrl = projectId && media.team
      ? `/${media.team.slug}/project/${projectId}`
      : null;

    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;

    const projectPage = /^\/.*\/project\//.test(path);
    const sourcePage = /^\/.*\/project\/.*\/source\//.test(path);
    const mediaPage = /^\/.*\/project\/.*\/media\//.test(path);

    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;
    media.quoteAttributions = media.media.quoteAttributions;

    const mediaIcon = (() => {
      if (media.dbid === 0) {
        return <MdAccessTime />;
      } else if (media.media.embed_path && media.media.embed_path !== '') {
        return <IconInsertPhoto />;
      } else if (media.quote) {
        return <MdFormatQuote />;
      }
      return MediaUtil.socialIcon(media.domain);
    })();

    const title = MediaUtil.title(media, data, this.props.intl);

    const heading = (
      <StyledHeading className="media__heading">
        <Link to={mediaUrl}>
          {title}
        </Link>
      </StyledHeading>
    );

    // Don't display redundant heading if the card is explicitly expanded with state
    // (or implicitly expanded with initiallyExpanded prop)
    // Always display it if it's been edited
    const shouldDisplayHeading = isImage || MediaUtil.hasCustomTitle(media, data) ||
      (!this.state.expanded && !(this.state.expanded == null && this.props.initiallyExpanded));

    const cardClassName =
      `${bemClassFromMediaStatus('media-detail', mediaLastStatus(media))} ` +
      `media-detail--${MediaUtil.mediaTypeCss(media, data)}`;

    const shouldShowProjectName = projectTitle && (sourcePage || !projectPage);

    const progress = media.assignments_progress;
    let progressColor = null;
    if (progress && progress.total > 0) {
      progressColor = inProgressYellow;
      if (progress.answered === progress.total) {
        progressColor = completedGreen;
      }
      if (progress.answered === 0) {
        progressColor = unstartedRed;
      }
    }

    const cardHeaderText = (
      <div style={{ cursor: media.dbid === 0 ? 'wait' : 'default' }}>
        {shouldDisplayHeading ?
          <StyledHeadingContainer>{heading}</StyledHeadingContainer> : null
        }
        <StyledHeaderTextSecondary>
          <Row flexWrap>
            {createdAt ?
              <Row flexWrap>
                <Row>
                  <StyledMediaIconContainer>
                    {mediaIcon}
                  </StyledMediaIconContainer>
                  <Offset isRtl={isRtl}>
                    <Link className="media-detail__check-timestamp" to={mediaUrl}>
                      <TimeBefore date={createdAt} />
                    </Link>
                  </Offset>
                </Row>

                {shouldShowProjectName ?
                  <Offset isRtl={isRtl} >
                    <Link to={projectUrl} >
                      <Row>
                        <Text noShrink>in&nbsp;</Text>
                        <Text ellipsis maxWidth="300px">{projectTitle}</Text>
                      </Row>
                    </Link>
                  </Offset> : null}

                <Offset isRtl={isRtl}>
                  <Link to={mediaUrl}>
                    <span className="media-detail__check-notes-count">
                      {annotationsCount}
                    </span>
                  </Link>
                </Offset>
              </Row> : null}

            {sourceName ?
              <Offset isRtl={isRtl}>
                <Link to={sourceUrl}>
                  <Row>
                    {/* ideally this would be SourcePicture not FaFeed — CGB 2017-9-13 */}
                    <FaFeed style={{ width: 16 }} />
                    {' '}
                    <Text ellipsis maxWidth="300px">{sourceName}</Text>
                  </Row>
                </Link>
              </Offset> : null}

            {progress && progress.total > 0 ?
              <StyledProgress
                bgColor={progressColor}
                title={
                  this.props.intl.formatMessage(messages.progress, {
                    answered: progress.answered,
                    total: progress.total,
                  })
                }
              >
                {progress.answered} / {progress.total}
              </StyledProgress>
              : null}
          </Row>
        </StyledHeaderTextSecondary>
      </div>
    );

    const borderColor = this.props.borderColor || getStatusStyle(status, 'backgroundColor');

    return (
      <StyledMediaDetail
        className={cardClassName}
        borderColor={borderColor}
        fromDirection={fromDirection}
        hideBorder={this.props.hideBorder}
      >
        <Card
          className="card-with-border"
          initiallyExpanded={this.props.initiallyExpanded}
          expanded={this.state.expanded}
          onExpandChange={this.handleExpandChange}
          style={{ borderColor }}
        >
          <StyledCardHeader
            className="media-detail__card-header"
            title={cardHeaderStatus}
            subtitle={cardHeaderText}
            showExpandableButton={this.props.media.dbid > 0}
            inMediaPage={mediaPage}
            style={{ paddingRight: units(5) }}
            // TODO: dont be clickable on optimistic items
            onClick={mediaPage ? null : (event) => { this.handleClickHeader(event, mediaUrl); }}
          />

          { this.state.expanded ?
            <MediaExpanded
              currentMedia={this.props.media}
              title={title}
              mediaUrl={mediaUrl}
              isRtl={isRtl}
              inMediaPage={mediaPage}
              sourceName={sourceName}
              sourceUrl={sourceUrl}
            /> : null }
        </Card>
        { this.state.expanded && !this.props.hideRelated ?
          <MediaRelatedComponent media={this.props.media} /> : null }
      </StyledMediaDetail>
    );
  }
}

MediaDetail.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

MediaDetail.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(MediaDetail);
