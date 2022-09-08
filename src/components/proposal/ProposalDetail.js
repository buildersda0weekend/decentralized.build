import React from "react";
import { useWeb3React } from "@web3-react/core";
import Grid from "@mui/material/Grid";
import ProgressBar from "@ramonak/react-progress-bar";
import Button from '@mui/material/Button'
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import yesImage from "../../assets/yes1.svg"
import noImage from "../../assets/no.svg"
import useContract from '../../hooks/contracts/useContract';
import getProposalStatus from "../../utils/ProposalStatus";
import { ToastContainer,toast } from 'react-toastify';

const successCreated = () => toast.success("Your vote for Yes has been added.", {
  theme:'colored'
}) ;
const failedCreated = () => toast("Your vote for No has been added.");


export const ProposalDetail = () => {
  const {account} = useWeb3React()
  const [proposalInfo, setProposalInfo] = useState([])
  const [hasVoted, setHasVoted] = useState(false)
  const [votingMessage, setVotingMessage] = useState("Already Voted!!!")
  const [proposalStatus, setProposalStatus] = useState('Pending')
    let navigate = useNavigate ();                                                                                    
    function redirectedToProposals () {
     navigate("/proposal")
   }
   const {state} = useLocation();
   const { proposalIndex } = state || {};
  const [id, setId] = useState()
  
  const [tokenContract, governanceContract, treasuryContract] = useContract()

  const castVote = async (event, voteValue) => {
    event.preventDefault()
    const voteTx = await governanceContract.methods.castVote(proposalInfo.id, voteValue).send({
      from: account
    })
    console.log(voteValue)
    if(voteValue === 1) {
      successCreated()
    }else {
      failedCreated()
    }
    setHasVoted(true)
    setVotingMessage("Successfully voted!!!")
   }
  

    const getProposalDetails = async() => {
      if (!governanceContract || !account) return

      let index = proposalIndex
      const proposal = await governanceContract.methods.proposals(index).call()
      setProposalInfo(proposal)

      const individualId = proposal.id.substring(0, 5) + '...' + proposal.id.substring(71, 77)
      setId(individualId)
      const proposalStatusCode = await governanceContract.methods.state(proposal.id).call()
      setProposalStatus(getProposalStatus(proposalStatusCode))

      const voteStatus = await governanceContract.methods.hasVoted(proposal.id, account).call()
      setHasVoted(voteStatus)
    }
    const status = (e)=> {
        if(e ===  "Active") {
          return 'activeStatus'
        }
        else if (e ===  "Pending"){
          return 'pendingStatus'
        }else if(e === "Succeeded") {
          return "succeededStatus"
        }else if(e === "Defeated") {
        return "defeatedStatus"
        }else {
          return "Status"
        }
      }


   useEffect(() => {
    getProposalDetails()
  }, [governanceContract, account, hasVoted])

  return (
    <>
      <Grid container className="proposal-details">
      <Grid xs={12} container  sx={{ marginX: 2, marginY:2 }}>
        <Grid xs={6}
        display="flex"
        alignItems="center"
        >
          <span className="proposal-heading">Proposal Details</span>
        </Grid>
        <Grid xs={6}  
        display="flex"
        justifyContent="end">
          <Button  size="medium" className="view-all-proposal" onClick={redirectedToProposals}type="submit">View all</Button>
        </Grid>
        </Grid>
        <Grid xs={12} className="proposal-box">
            <Grid xs={3} className="left-content"
            display="flex"
            justifyContent="center"
        flexDirection="column"
        alignItems="center">
              <span className="proposal-detail-text">{proposalInfo.description}</span>
              <span className="proposal-detail-text">{id}</span>
              </Grid>
              <Grid xs={3}  className="right-content"
               display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center">
              <span className="proposal-detail-status" id={status(proposalStatus)}>{proposalStatus}</span>
              <div className="vote-percentage">
              <div className="for-yes">
                <span>For Yes: 2</span>
                {/* <ProgressBar
                completed={60}
                maxCompleted={100}
                isLabelVisible={false}
                height='10px'
                width={200}
                className="proposal-detail-progressBar"
              /> */}
              </div>
              <div className="for-no">
                <span>For No:  1</span>
                {/* <ProgressBar
                completed={30}
                isLabelVisible={false}
                height='10px'
                width={200}
                className="proposal-detail-progressBar"
              /> */}
              </div>
              <ToastContainer
        position="top-right"
        autoClose={5000}
        type="colored"
        hideProgressBar={false}
        closeOnClick
       />
            </div>
            {hasVoted ? 
              <span className="text-center">{ votingMessage }</span>
              :
              <div className="yes-no-btn">
                <img src={yesImage} alt="" width={70} className="yes-vote" onClick={e => castVote(e, 1)} />
                <img src={noImage} alt="" width={70} className="no-vote" onClick={e => castVote(e, 0)} />
              </div>
            }
             </Grid>
        </Grid>
      </Grid>
    </>
  );
};
