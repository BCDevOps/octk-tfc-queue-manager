const { getLockedWorkspace } = require('./lib/getLockedWorkspace');
const { createAlert } = require('./lib/createAlert');

module.exports.handler = async () => {

  let rocketChatAlert;
  try {
    const lockedWorkspace = await getLockedWorkspace();
    if (!lockedWorkspace) {
      return 'No locked workspace found.';
    } else {
      const rocketChatPayload = {
        workspaceId: lockedWorkspace['id'],
        workspaceName: lockedWorkspace['attributes']['name'],
        organizationId: lockedWorkspace['relationships']['organization']['data']['id'],
        runId: lockedWorkspace['relationships']['locked-by']['data']['id'],
        createdAt: lockedWorkspace['attributes']['created-at']
      };
      rocketChatAlert = createAlert(rocketChatPayload);
    }
    return rocketChatAlert;
  } catch (err) {
    return err;
  }
};