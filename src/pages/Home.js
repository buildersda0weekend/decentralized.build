import Grid from '@mui/material/Grid';
import Item from "@mui/material/Box";
import { useState, useEffect } from 'react';
import ProgressBar from "@ramonak/react-progress-bar";
import useContract from '../hooks/contracts/useContract';
import Web3 from 'web3';

const Home = () => {
  const [proposalCount, setProposalCount] = useState(0)
  const [ongoingProposalCount, setongoingProposalCount] = useState(0)
  const [voters, setVoters] = useState(0)
  const [treasuryFunds, setTreasuryFunds] = useState(0)
  const [treasuryAddress, setTreasuryAddress] = useState("")
  const [passRate, setPassRate] = useState(0)
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0)
  const [tokenContract, governanceContract, treasuryContract] = useContract()
  const web3 = new Web3('http://localhost:7545')

  const totalProposalCount = async () => {
    if (!governanceContract || !treasuryContract) return
    const totalProposalCount = await governanceContract.methods.totalProposals().call()
    setProposalCount(totalProposalCount)
    const totalMembersCount = await governanceContract.methods.totalMembers().call()
    setVoters(totalMembersCount)
    let ongoingCount = 0
    for (let i = 1; i <= totalProposalCount; i++) {
      let proposal = await governanceContract.methods.proposals(i).call()
      const Ongoing = await governanceContract.methods.state(proposal.id).call()
      if (Ongoing === '1' || Ongoing === '0') {
        ongoingCount++
      }
    }
    setongoingProposalCount(ongoingCount)
  }
  const loadTreasury = async () => {
    if (!treasuryContract) return
    setTreasuryAddress(treasuryContract.options.address)
    const fundsInWei = await web3.eth.getBalance(treasuryContract.options.address)
    const fundsInETH = web3.utils.fromWei(fundsInWei, 'ether')
    setTreasuryFunds(fundsInETH)
  }

  const initialMount = async () => {
    if(!governanceContract || !tokenContract) return
    const totalSupplyInWei = await tokenContract.methods.totalSupply().call()
    const totalSupplyInETH = web3.utils.fromWei(totalSupplyInWei.toString(), 'ether')
    const blockNumber = await web3.eth.getBlockNumber()
    const quorumInWei = await governanceContract.methods.quorum(blockNumber - 1).call()
    const quorumInETH = web3.utils.fromWei(quorumInWei.toString(), 'ether')
    const totalSupply = parseInt(totalSupplyInETH)
    const quorum = parseInt(quorumInETH)
    const quorumRate = (quorum / totalSupply) * 100
    setTokenTotalSupply(totalSupply)
    setPassRate(quorumRate)
  }

  useEffect(() => {
    initialMount()
    totalProposalCount()
    loadTreasury()

  }, [governanceContract, treasuryContract, tokenContract])

  return (
    <>
      <Grid container className="proposal-container" >
        <Grid item xs={12} >
          <span className='governance-overview'>Governance Overview</span>
        </Grid>
        <Grid xs={6}>
          <div className="box-1">
            <div className='created-with-bar'>
              <span>Proposal Created</span>
              <span className='proposal-number'>{proposalCount}</span>
            </div>
            <Grid xs={6}>
              <span >Pass rate</span>
              <ProgressBar completed={passRate} maxCompleted={tokenTotalSupply} className="progressBar" />
            </Grid>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className="box-2">
            <span>Eligible Voters</span>
            <span className='proposal-number'>{voters}</span>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className="box-3">
            <span>Ongoing Proposals</span>
            <span className='proposal-number'>{ongoingProposalCount}</span>
          </div>
        </Grid>
        <Grid item xs={12} >
          <Item sx={{ marginTop: 7 }}>
            <span className='governance-overview'>Treasury Overview</span>
          </Item>
        </Grid>
        <Grid xs={8}>
          <div className="box-2">
            <span>Treasury account</span>
            <span className='proposal-number'>{treasuryAddress}</span>
          </div>
        </Grid>
        <Grid xs={4}>
          <div className="box-2">
            <span>Treasury balance</span>
            <span className='proposal-number'>{treasuryFunds} ETH</span>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default Home;
