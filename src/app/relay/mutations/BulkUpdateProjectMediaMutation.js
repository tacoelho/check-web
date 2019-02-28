import Relay from 'react-relay/classic';

class BulkUpdateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMedia {
      updateProjectMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediaPayload {
        affectedIds
        check_search_project_was { id, number_of_results }
      }
    `;
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      ids: this.props.ids,
      project_id: this.props.dstProject.dbid,
    };
    if (this.props.srcProject) {
      vars.previous_project_id = this.props.srcProject.dbid;
    }
    return vars;
  }

  getOptimisticResponse() {
    const response = {
      affectedIds: this.props.ids,
    };
    return response;
  }

  getConfigs() {
    let configs = [];
    if (this.props.srcProject) {
      configs = [
        {
          type: 'NODE_DELETE',
          parentName: 'check_search_project_was',
          parentID: this.props.srcProject.search_id,
          connectionName: 'medias',
          deletedIDFieldName: 'affectedIds',
        },
        {
          type: 'FIELDS_CHANGE',
          fieldIDs: { check_search_project_was: this.props.srcProject.search_id },
        },
      ];
    }
    return configs;
  }
}

export default BulkUpdateProjectMediaMutation;
