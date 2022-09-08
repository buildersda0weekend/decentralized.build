export const getProposalStatus = (proposalStatusCode) => {
  if (proposalStatusCode === '0') return 'Pending'
  else if (proposalStatusCode === '1') return 'Active'
  else if (proposalStatusCode === '2') return 'Canceled'
  else if (proposalStatusCode === '3') return 'Defeated'
  else if (proposalStatusCode === '4') return 'Succeeded'
  else if (proposalStatusCode === '5') return 'Queued'
  else if (proposalStatusCode === '6') return 'Expired'
  else if (proposalStatusCode === '7') return 'Executed'
}

export default getProposalStatus