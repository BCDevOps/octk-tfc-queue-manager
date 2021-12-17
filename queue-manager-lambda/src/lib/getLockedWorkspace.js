const axios = require('axios');
const awsClient = require('aws-sdk');

const getLockedWorkspace = async () => {

  /* eslint-disable no-undef */
  const tfcEndpoint = process.env.TFC_API_ENDPOINT;
  const tfcOrganization = process.env.TFC_ORGANIZATION;
  /* eslint-enable no-undef */

  const ssmClient = new awsClient.SSM({
    apiVersion: '2014-11-06',
    region: 'ca-central-1'
  });

  let tfcOrgBearerToken = {};
  const ssmParams = {
    Name: '/tfc_queue_manager/tfc_org_token',
    WithDecryption: true,
  };
  try {
    tfcOrgBearerToken = await ssmClient.getParameter(ssmParams).promise();
  } catch (err) {
    console.error(err);
  }

  const axiosParams = {
    method: 'get',
    url: `https://${tfcEndpoint}/api/v2/organizations/${tfcOrganization}/workspaces`,
    headers: {
      'Authorization': `Bearer ${tfcOrgBearerToken.Parameter.Value}`,
      'Content-Type': 'application/vnd.api+json',
    },
  };

  let workspaces = [];
  try {
    const response = await axios(axiosParams);
    workspaces = response.data.data;
  } catch (err) {
    const errorResponse = {
      status: err.response.status,
      statusText: err.response.statusText,
      method: err.config.method,
      url: err.config.url,
    };
    console.error(errorResponse);
    return errorResponse;
  }

  for (let workspaceCount = 0; workspaceCount < workspaces.length; workspaceCount++) {
    if (workspaces[workspaceCount]['attributes']['locked']) {
      return workspaces[workspaceCount]; 
    }
  }
};

module.exports.getLockedWorkspace = getLockedWorkspace;
