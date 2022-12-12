import { AcceptInvite } from '@teamkeel/sdk'

export default AcceptInvite(async (inputs, api) => {
  // there should only be one but the fields aren't unique, as it's a linking table and only the pair is unique
  const projectInvitesResult = await api.models.projectInvite.findMany({ id: inputs.projectInviteId });

  if (projectInvitesResult.errors && projectInvitesResult.errors.length) {
    return { errors: projectInvitesResult.errors };
  }

  const projectInvites = projectInvitesResult.collection!;

  if (projectInvites.length !== 1) {
    return {
      errors: [
        {
          message: "internal server error",
          stack: "",
        },
      ],
    };
  }

  const projectInvite = projectInvites[0];

  const inviteHasExpired = projectInvite.expiry < new Date();

  if (inviteHasExpired) {
    return {
      errors: [
        {
          message: "invite has expired",
          stack: "",
        },
      ],
    };
  }


  const createAccountProjectResult = await api.models.accountProject.create({
    accountId: inputs.accountId,
    projectId: inputs.projectId,
  });

  if (createAccountProjectResult.errors && createAccountProjectResult.errors.length) {
    return { errors: createAccountProjectResult.errors };
  }


  const deleteResult = await api.models.projectInvite.delete(projectInvite.id);

  if (deleteResult.errors && deleteResult.errors.length) {
    return deleteResult;
  }


  return createAccountProjectResult;
})