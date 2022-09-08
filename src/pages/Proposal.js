import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid';
import ProgressBar from "@ramonak/react-progress-bar";
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useContract from '../hooks/contracts/useContract';
import getProposalStatus from "../utils/ProposalStatus";
import Typed from "react-typed"
import Web3 from "web3";
import OutlinedInput from '@mui/material/OutlinedInput';

const TREASURY_CONTRACT_ADDRESS = process.env.REACT_APP_TREASURY_CONTRACT_ADDRESS


const Proposal = () => {
  const { account } = useWeb3React()
  const [description, setDescription] = useState("")
  const [proposals, setProposals] = useState([])
  const [textErr, setTextErr] = useState(false)
  const [fundErr, setFundErr] = useState(false)
  const [addressErr, setAddressErr] = useState(false)
  const [fundAmount, setFundAmount] = useState(0)
  const [receiptAddress, setReceiptAddress] = useState("")
  const [tokenContract, governanceContract, treasuryContract] = useContract()

  const successCreated = () => toast.success("Your proposal has been created.", {
    theme: 'colored',
    type: "success"
  });
  const failedCreated = () => toast.error("Unable to created the proposal.Please try again", {
    theme: 'colored',
    type: "error"
  });

  const getProposal = async () => {
    if (!governanceContract) return
    const totalProposalCount = await governanceContract.methods.totalProposals().call()
    let proposalList = []
    for (let i = 1; i <= totalProposalCount; i++) {
      let proposal = await governanceContract.methods.proposals(i).call()
      const proposalStatusCode = await governanceContract.methods.state(proposal.id).call()
      proposal = {
        ...proposal,
        status: getProposalStatus(proposalStatusCode) || "Pending"
      }
      proposalList.push(proposal)
    }
    setProposals(proposalList)
  }
  useEffect(() => {
    getProposal()
  }, [governanceContract])

  useEffect(() => {
  }, [])

  function getProposalStatusColor(e) {
    if (e === "Active") {
      return 'activeStatus'
    }
    else if (e === "Pending") {
      return 'pendingStatus'
    } else if (e === "Succeeded") {
      return "succeededStatus"
    } else if (e === "Defeated") {
      return "defeatedStatus"
    } else {
      return "Status"
    }
  }

  let navigate = useNavigate();
  function redirectedToProposalDetail(e) {
    navigate("/proposalDetail", {
      state: {
        proposalIndex: e.target.value,
        title: 'hello',
        proposalStatus: 'proposalStatus'
      }
    })
  }


  async function createProposal(event) {
    console.log(receiptAddress)
    if (description.length < 1) {
      setTextErr(true)
    }
    if (receiptAddress.length < 1) {
      setAddressErr(true)
    }
    if (!Web3.utils.isAddress(receiptAddress)) {
      setAddressErr(true)
    }
    try {
      console.log("Fund Amount: ", fundAmount)
      console.log("Receipt Address: ", receiptAddress)
      const amount = Web3.utils.toWei(fundAmount)
      const encodedFunction = await treasuryContract.methods.releaseFunds(receiptAddress, amount.toString()).encodeABI()
      const tx = await governanceContract.methods.createProposal([TREASURY_CONTRACT_ADDRESS], [0], [encodedFunction], description).send({
        from: account
      })
      const id = tx.events.ProposalCreated.returnValues.proposalId
      if (id) {
        successCreated()
        getProposal()
      } else {
        failedCreated()
      }
    } catch (err) {
    }
  }

  function handleDescriptionChange(event) {
    if (event.target.value < 1) {
      setTextErr(true)
    } else {
      setTextErr(false)
      setDescription(event.target.value)
    }
  }
  function HandleFundAmount(event) {
    if (event.target.value.length < 1) {
      setFundErr(true)
    } else {
      setFundErr(false)
    }
    setFundAmount(event.target.value)
  }
  function HandleTreasuryAddress(event) {
    console.log(event.target.value.length)
    if (event.target.value.length < 1) {
      setAddressErr(true)
    } else {
      setAddressErr(false)
      setReceiptAddress(event.target.value)
    }
  }
  return (
    <div>
      <div className="create-proposals">
        <span className="create-heading">Create a New Proposal</span>
        <span style={{ marginBottom: '10px' }}>Description</span>
        <textarea id="proposal-description" name="description" onChange={(event) => handleDescriptionChange(event)} />
        {textErr ?
          <span className="validation-error">please add the description.</span>
          : ""}

        <span style={{ marginTop: '20px' }}>Amount to Fund :</span>
        <OutlinedInput style={{ marginTop: '10px' }} placeholder="Please enter the amount" inputProps={{ style: { fontFamily: 'nunito', color: 'white', borderColor: 'red' } }} className="fund-transfer" type="number" value={fundAmount} onChange={event => HandleFundAmount(event)} error={fundErr} />
        {fundErr ?
          <span className="validation-error">please add the amount.</span>
          : ""}
        <span style={{ marginTop: '20px' }}>Receipt Address :</span>
        <OutlinedInput style={{ marginTop: '10px' }} placeholder="Please enter receipt address" onChange={event => HandleTreasuryAddress(event)} error={addressErr} />
        {addressErr ?
          <span className="validation-error">please add the amount.</span>
          : ""}
        <Button sx={{ marginTop: 2 }} size="medium" className="connect-address-btn" type="submit" onClick={(event) => createProposal(event)}>Submit</Button>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          type="success"
          colored
          hideProgressBar={false}
          closeOnClick
        />
        <Grid xs={12} sx={{ marginTop: 4 }}>
          <span className="create-heading">Proposal List</span>
        </Grid>
      </div>
      {proposals.length > 0 ?
        <Grid container rowSpacing={2} spacing={4} className="proposal-list-container">
          {proposals.map((proposal, i) => (
            <Grid item xs={4} sx={{ marginTop: 4 }} className="proposal-status" id='proposal-list' key={proposal.id}>
              <span className="proposal-detail-text">{proposal.description}</span>
              <span>{proposal.id.substring(0, 6) + '...' + proposal.id.substring(71, 77)}</span>
              <ProgressBar completed={100} maxCompleted={100} isLabelVisible={false} height='10px' className="proposal-progressBar" />
              <span id={getProposalStatusColor(proposal.status)}> {proposal.status}</span>
              <Button className="view-proposal-btn" onClick={redirectedToProposalDetail} value={i + 1}>View Proposal</Button>
              {/* <button value="1" onClick={event => { castVote(event, proposal.proposalId) }}>Yes</button>
            <button value="0" onClick={event => { castVote(event, proposal.proposalId) }}>No</button> */}
            </Grid>
          ))}
        </Grid>
        :
        <Typed className="not-available"
          strings={[
            "No proposals are available.",
            "Create a new Proposal.",
            "Created Proposal will be appear here.",
          ]}
          typeSpeed={50}
          backSpeed={50}
          loop
        />
      }
    </div>
  )
}

export default Proposal;
