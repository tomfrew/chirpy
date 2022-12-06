import { CreateTrackingEvent } from "@teamkeel/sdk";
import Pusher from "pusher";

export default CreateTrackingEvent(async (inputs, api) => {

  const allowedUrlsResult = await api.models.allowedUrl.findMany({projectId: inputs.projectId});

  if (allowedUrlsResult.errors && allowedUrlsResult.errors.length) {
    return allowedUrlsResult;
  }

  const allowedUrls = allowedUrlsResult.collection;

  const urlIsInAllowedUrls: () => boolean = () => {
    if (inputs.host === undefined || inputs.host === null) {
      return false;
    }
    return allowedUrls.some((allowedUrl) => {
      console.log("url", allowedUrl.url, inputs.host.endsWith(allowedUrl.url));
      return inputs.host.endsWith(allowedUrl.url);
    });
   }

  const requestComesFromAllowedUrl = 
    allowedUrls.length == 0 || urlIsInAllowedUrls();

  console.log("allowedUrls", allowedUrls, "\n\n");
  console.log("allowedUrls.length == 0", allowedUrls.length == 0);
  console.log("requestComesFromAllowedUrl", requestComesFromAllowedUrl);

  if (!requestComesFromAllowedUrl) {
    return {
      errors: [
        {
          message: "not allowed",
          stack: "",
        },
      ],
    };
  }

  const createResult = await api.models.trackingEvent.create({ ...inputs });

  if (createResult.errors && createResult.errors.length) {
    return createResult;
  }

  const createResultObj = createResult.object!;

  const pusher = new Pusher({
    appId: "1518900",
    key: "0605a8744414f200668e",
    secret: "28f38f7691c0c3286005",
    cluster: "eu",
    useTLS: true,
  });

  const pusherChannel = "proj-" + inputs.projectId;
  const pusherEvent = "track";

  const pushResult = await pusher.trigger(
    pusherChannel,
    pusherEvent,
    createResultObj
  );
  if (!pushResult.ok) {
    return {
      errors: [
        {
          message: "push not ok: " + pushResult.statusText,
          stack: "",
        },
      ],
    };
  }

  return createResult;
});
