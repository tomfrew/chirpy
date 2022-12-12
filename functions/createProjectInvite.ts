import { CreateProjectInvite } from "@teamkeel/sdk";
import { create } from "domain";
import fetch from "node-fetch";

// should be a secret
const POSTMARK_SERVER_TOKEN = "371a6b7b-5973-41e6-966c-c78929b0d9be";

export default CreateProjectInvite(async (inputs, api) => {
  // we disregard the invite expiry that was sent as an input
  const inviteExpiryDays = 7;
  inputs.expiry = new Date();
  inputs.expiry.setDate(inputs.expiry.getDate() + inviteExpiryDays);

  const createResult = await api.models.projectInvite.create(inputs);

  if (!createResult.object) {
    return createResult;
  }

  await fetch("https://api.postmarkapp.com/email/withTemplate", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN,
    },
    body: JSON.stringify({
      From: "chirpy@keel.xyz",
      To: inputs.email,
      TemplateAlias: "chirpy-project-invite",
      TemplateModel: {
        product_url: "https://getchirpy.netlify.app/",
        project_name: createResult.object.name,
        action_url:
          "https://getchirpy.netlify.app/?inviteID=" + createResult.object.id,
      },
    }),
  }).catch((reason) => {
    console.error("Couldn't send invite email: ", reason);
  });

  return createResult;
});
