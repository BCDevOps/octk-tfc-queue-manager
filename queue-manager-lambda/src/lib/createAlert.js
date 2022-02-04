const axios = require('axios');
const awsClient = require('aws-sdk');

const createAlert = async (tfcChatPayload) => {

  /* eslint-disable no-undef */
  const rocketChatEndpoint = process.env.ROCKETCHAT_ENDPOINT;
  const tfcEndpoint = process.env.TFC_API_ENDPOINT;
  const tfcOrganization = process.env.TFC_ORGANIZATION;
  /* eslint-enable no-undef */

  const ssmClient = new awsClient.SSM({
    apiVersion: '2014-11-06',
    region: 'ca-central-1'
  });

  let rocketChatBearerToken = {};
  const ssmParams = {
    Name: '/tfc_queue_manager/rocketchat_token',
    WithDecryption: true,
  };
  try {
    rocketChatBearerToken = await ssmClient.getParameter(ssmParams).promise();
  } catch (err) {
    console.error(err);
  }

  // TFC Queue Manager: TFC run: < > in workspace <> is currently in <> status and auto-apply is set to <>.  This is blocking the queue.

  /* eslint-disable quotes */
  const tfcJobInfo = {
    text: `TFC Queue Manager. TFC run:` +
        ` [${tfcChatPayload.runId}](https://${tfcEndpoint}/app/${tfcOrganization}/workspaces/${tfcChatPayload.workspaceName}/runs/${tfcChatPayload.runId})` +
        ` in workspace: [${tfcChatPayload.workspaceName}](https://${tfcEndpoint}/app/${tfcOrganization}/workspaces/${tfcChatPayload.workspaceName})` +
        ` is currently in ${tfcChatPayload.status} status and auto-apply is ${tfcChatPayload.autoApply}.`,
  };
  /* eslint-enable quotes */

  const axiosParams = {
    method: 'post',
    url: `https://${rocketChatEndpoint}/hooks/${rocketChatBearerToken.Parameter.Value}`,
    headers: {
      'Authorization': `Bearer ${rocketChatBearerToken.Parameter.Value}`,
      'Content-Type': 'application/json',
    },
    data: tfcJobInfo
  };

  try {
    const successResponse = await axios(axiosParams);
    return {
      status: successResponse.status,
      statusText: successResponse.statusText,
      statusMessage: `Successfully posted message to RocketChat server: ${successResponse.request.socket.servername}`,
      method: successResponse.config.method,
      postedMessage: JSON.parse(successResponse.config.data).text
    };
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

module.exports.createAlert = createAlert;
