import { CreateProjectInvite } from '@teamkeel/sdk'

export default CreateProjectInvite(async (inputs, api) => {
  // we disregard the invite expiry that was sent as an input
  const inviteExpiryDays = 7;
  inputs.expiry = new Date();
  inputs.expiry.setDate(inputs.expiry.getDate() + inviteExpiryDays);

  const createResult = await api.models.projectInvite.create(inputs);

  //TODO: sent email

  return createResult;
})