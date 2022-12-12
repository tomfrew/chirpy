import { CreateProjectInvite } from '@teamkeel/sdk'
import fetch from "node-fetch";

// should be a secret
const POSTMARK_SERVER_TOKEN = "371a6b7b-5973-41e6-966c-c78929b0d9be"

export default CreateProjectInvite(async (inputs, api) => {
  // we disregard the invite expiry that was sent as an input
  const inviteExpiryDays = 7;
  inputs.expiry = new Date();
  inputs.expiry.setDate(inputs.expiry.getDate() + inviteExpiryDays);

  const createResult = await api.models.projectInvite.create(inputs);

  await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN,
    },
    body: JSON.stringify({
      "From": "chirpy@keel.xyz",
      "To": inputs.email,
      "Subject": "You've been invited to a project",
      "HtmlBody": "<strong>Hello</strong> dear Chirper, you've been invited to a project",
      "MessageStream": "chirpy"
    }),
}).catch(reason => {
    console.error("Couldn't track event of page being opened due to ", reason);
});

  return createResult;
})