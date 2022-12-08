import { CreateProjectInvite } from '@teamkeel/sdk'

export default CreateProjectInvite(async (inputs, api) => {
  // we disregard the invite code that was sent as an input
  const inviteCodeLength = 8;
  inputs.code = makeCode(inviteCodeLength);
  // we disregard the invite expiry that was sent as an input
  const inviteExpiryDays = 7;
  inputs.expiry = new Date()
  inputs.expiry.setDate(inputs.expiry.getDate() + inviteExpiryDays);

  const createResult = await api.models.projectInvite.create(inputs);
  return createResult;
})

function makeCode(length) {
  let result = '';
  // all uppercase letters except "o" and all numbers except zero because those two might be confusing to users
  // who decide to write the code instead of copy-paste
  const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}