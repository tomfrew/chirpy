import { MostRecent } from '@teamkeel/sdk'
export default MostRecent(async (inputs, api) => {
  const result = await api.models.trackingEvent.where({projectId: inputs.projectId}).order({createdAt: "DESC"}).all()

  // Instead of slicind the array there should be a way to limit to a max number above.
  // We currently only support `.all()` and `.findOne()`
  result.collection = result.collection.slice(0, inputs.count);

  return result
})