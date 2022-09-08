import React, { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3'
// import useWeb3 from '../web3/useWeb3'
import TokenContract from '../../build/contracts/Token.json'
import TreasuryContract from '../../build/contracts/TimeLock.json'
import GovernanceContract from '../../build/contracts/Governance.json'
import { useWeb3React } from '@web3-react/core'


const TOKEN_CONTRACT_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS
const GOVERNANCE_CONTRACT_ADDRESS = process.env.REACT_APP_GOVERNANCE_CONTRACT_ADDRESS
const TREASURY_CONTRACT_ADDRESS = process.env.REACT_APP_TREASURY_CONTRACT_ADDRESS

const useContract = () => {
  const [tokenContract, setTokenContract] = useState();
  const [governanceContract, setGovernanceContract] = useState();
  const [treasuryContract, setTreasuryContract] = useState();
  const { library } = useWeb3React()

  useEffect(() => {

    if (!TOKEN_CONTRACT_ADDRESS || !GOVERNANCE_CONTRACT_ADDRESS || !TREASURY_CONTRACT_ADDRESS) {
      return
    }
    
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    
    const token = new web3.eth.Contract(TokenContract.abi, TOKEN_CONTRACT_ADDRESS)
    const governance = new web3.eth.Contract(GovernanceContract.abi, GOVERNANCE_CONTRACT_ADDRESS)
    const treasury = new web3.eth.Contract(TreasuryContract.abi, TREASURY_CONTRACT_ADDRESS)
    setTokenContract(token)
    setGovernanceContract(governance)
    setTreasuryContract(treasury)
  }, [])

  return [tokenContract, governanceContract, treasuryContract]
}


export default useContract