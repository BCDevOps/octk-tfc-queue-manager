const { getBlockingRuns } = require('./lib/workspaceRunInfo');
const { createAlert } = require('./lib/createAlert');

module.exports.handler = async () => {

  let rocketChatAlert;
  try {
    const blockingRun = await getBlockingRuns();
    if (!blockingRun) {
      console.log('No blocking runs found.');
    } else {
      const rocketChatPayload = {
        workspaceName: blockingRun['workspaceName'],
        workspaceId: blockingRun['relationships']['workspace']['data']['id'],
        runId: blockingRun['id'],
        autoApply: blockingRun['attributes']['auto-apply'],
        createdAt: blockingRun['attributes']['created-at'],
        status: blockingRun['attributes']['status']
      };
      rocketChatAlert = createAlert(rocketChatPayload);
    }
    return rocketChatAlert;
  } catch (err) {
    return err;
  }
};