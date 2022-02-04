const axios = require('axios');
const awsClient = require('aws-sdk');

const getRunInfo = async (runId) => {

  /* eslint-disable no-undef */
  const tfcEndpoint = process.env.TFC_API_ENDPOINT;
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
    url: `https://${tfcEndpoint}/api/v2/runs/${runId}`,
    headers: {
      'Authorization': `Bearer ${tfcOrgBearerToken.Parameter.Value}`,
      'Content-Type': 'application/vnd.api+json',
    },
  };

  try {
    let response = await axios(axiosParams);
    //   console.log(response)
    return response['data']['data'];

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

};

module.exports.getRunInfo = getRunInfo;


const getBlockingRuns = async () => {

  /* eslint-disable no-undef */
  const tfcEndpoint = process.env.TFC_API_ENDPOINT;
  const tfcPageSize = process.env.TFC_API_PAGE_SIZE;
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
    url: `https://${tfcEndpoint}/api/v2/organizations/${tfcOrganization}/workspaces/?page%5Bsize%5D=${tfcPageSize}`,
    headers: {
      'Authorization': `Bearer ${tfcOrgBearerToken.Parameter.Value}`,
      'Content-Type': 'application/vnd.api+json',
    },
  };

  let workspaces = [];
  try {
    let response = await axios(axiosParams);
    let totalPages = response['data']['meta']['pagination']['total-pages'];
    let currentPage = 1;
    while (currentPage <= totalPages) {

      response = await axios({
        method: 'get',
        url: `https://${tfcEndpoint}/api/v2/organizations/${tfcOrganization}/workspaces/?page%5Bnumber%5D=${currentPage}&page%5Bsize%5D=${tfcPageSize}`,
        headers: {
          'Authorization': `Bearer ${tfcOrgBearerToken.Parameter.Value}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });
      workspaces = response['data']['data'];

      for (let workspaceIndex = 0; workspaceIndex < workspaces.length; workspaceIndex++) {
        if (workspaces[workspaceIndex]['attributes']['locked']) {
          console.log(`Workspace ${workspaces[workspaceIndex]['id']} in locked state. Checking if this is the result of blocked run.`)
          try {
            const runInfo = await getRunInfo(workspaces[workspaceIndex]['relationships']['locked-by']['data']['id']);
            const runObject = Object.assign({workspaceName: workspaces[workspaceIndex]['attributes']['name']}, runInfo)
            // Check if run is stuck in planned status and auto-apply is false
            if (runInfo['attributes']['actions']['is-confirmable'] && runInfo['attributes']['status'] === 'cost_estimated') {
              return runObject;
            }
            else if (runInfo['attributes']['actions']['is-confirmable'] && runInfo['attributes']['status'] === 'planned') {
              return runObject;
            }
            else if (runInfo['attributes']['actions']['is-confirmable'] && runInfo['attributes']['status'] === 'policy_checked') {
              return runObject;
            }
          } catch (err) {
            return err;
          }
        }
      }
      currentPage++;
    }

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
};

module.exports.getBlockingRuns = getBlockingRuns;
