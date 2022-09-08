import Web3 from 'web3'
import TokenContract from './build/contracts/Token.json'
import TreasuryContract from './build/contracts/Treasury.json'
import GovernanceContract from './build/contracts/Governance.json'
import './App.css';
import { useEffect, useState } from 'react';

const TREASURY_CONTRACT_ADDRESS = '0xA76F4AdEcE32F0758728f594B4595F46b69d100c'
const TOKEN_CONTRACT_ADDRESS = '0xf9Be4ACcBA549f6130604736172e413bB5baCe6e'
const GOVERNANCE_CONTRACT_ADDRESS = '0xd23830d856636556964C15B8a376bc7f1d16F887'

function App() {
  const [account, setAccount] = useState()
  const [balance, setBalance] = useState(0)
  const [network, setNetwork] = useState()
  const [treasuryBalance, setTreasuryBalance] = useState(0)
  const [treasuryReleasedStatus, setTreasuryReleasedStatus] = useState(false)

  const web3 = new Web3(Web3.givenProvider || "http://localhost:7545")

  async function loadAccounts() {
    const accounts = await web3.eth.requestAccounts()
    setAccount(accounts[0])
  }

  async function loadBalance() {
    if (account) {
      const network = await web3.eth.net.getNetworkType()
      const balance = await web3.eth.getBalance(account)
      setNetwork(network)
      const balanceETH = Web3.utils.fromWei(balance, 'ether')
      setBalance(balanceETH)
    }
  }

  async function loadTokenContract() {
    const tokenContract = new web3.eth.Contract(TokenContract.abi, TOKEN_CONTRACT_ADDRESS)
    console.log(tokenContract)
    console.log("Token Balance: ", tokenContract.methods.balanceOf(account))
  }

  async function loadTreasuryContract() {
    const treasuryContract = new web3.eth.Contract(TreasuryContract.abi, TREASURY_CONTRACT_ADDRESS)
    const isReleased = await treasuryContract.methods.isReleased().call()
    const treasuryBalance = await web3.eth.getBalance(TREASURY_CONTRACT_ADDRESS)
    const treasuryBalanceETH = Web3.utils.fromWei(treasuryBalance, 'ether')
    setTreasuryReleasedStatus(isReleased?true:false)
    setTreasuryBalance(treasuryBalanceETH)
  }

  async function createProposal() {
    const tokenContract = new web3.eth.Contract(TokenContract.abi, TOKEN_CONTRACT_ADDRESS)
    const governanceContract = new web3.eth.Contract(GovernanceContract.abi, GOVERNANCE_CONTRACT_ADDRESS)
    const treasuryContract = new web3.eth.Contract(TreasuryContract.abi, TREASURY_CONTRACT_ADDRESS)
    const encodedFunction = await treasuryContract.methods.releaseFunds().encodeABI()
    const description = 'Release funds from the Treasury wallet testt11'
    const accounts = await web3.eth.requestAccounts()
    await tokenContract.methods.delegate(accounts[0]).send({from: accounts[0]})
    const tx = await governanceContract.methods.propose([TREASURY_CONTRACT_ADDRESS], [0], [encodedFunction], description).send({
      from: accounts[0]
    })
    const id = tx.events.ProposalCreated.returnValues.proposalId
    let propsalState = await governanceContract.methods.state(id).call()
    console.log("Proposal State: ", propsalState)
    console.log("Proposal Id: ", id)

    let blockNumber = await web3.eth.getBlockNumber()
    console.log(`Current blocknumber: ${blockNumber}\n`)

    const quorum = await governanceContract.methods.quorum(blockNumber - 1).call()
    console.log("Number of votes required to pass: ", web3.utils.fromWei(quorum, 'ether'))

    const vote = await governanceContract.methods.castVote(id, 1).send({ from: accounts[0] })

    await tokenContract.methods.transfer(accounts[0], web3.utils.toWei('5', 'ether')).send({ from: accounts[0] })

    const { againstVotes, forVotes, abstainVotes } = await governanceContract.methods.proposalVotes(id).call()
    console.log(`Votes For: ${web3.utils.fromWei(forVotes.toString(), 'ether')}`)
    console.log(`Votes Against: ${web3.utils.fromWei(againstVotes.toString(), 'ether')}`)
    console.log(`Votes Neutral: ${web3.utils.fromWei(abstainVotes.toString(), 'ether')}\n`)

    blockNumber = await web3.eth.getBlockNumber()
    console.log(`Current blocknumber: ${blockNumber}\n`)
    propsalState = await governanceContract.methods.state(id).call()
    console.log("Proposal State: ", propsalState)


    const hash = web3.utils.sha3("Release Funds from Treasury")
    await governanceContract.methods.queue([TREASURY_CONTRACT_ADDRESS], [0], [encodedFunction], hash).send({ from: accounts[0] })

    propsalState = await governanceContract.methods.state(id).call()
    console.log("Proposal State: ", propsalState)

    await governanceContract.execute([TREASURY_CONTRACT_ADDRESS], [0], [encodedFunction], hash).send({ from: accounts[0] })


    propsalState = await governanceContract.methods.state(id).call()
    console.log("Proposal State: ", propsalState)

  }

  

  useEffect(() => {
    loadAccounts()
    loadBalance()
    loadTreasuryContract()
    // loadTokenContract()
  }, []) 
  useEffect(() => {
    loadBalance()
  }, [account])

  
  return (
    <div className="App">
      <div className="wallet-info">
        <h1> Connected Wallet: {account}</h1>
        <p>Balance: {balance} ETH</p>
        <p>Network: {network} </p>
      </div>
      <hr />
      <div className='treasury-contract-info'>
        <h1>Treasury Contract</h1>
        <p>Treasury Balance: {treasuryBalance} ETH</p>
        <p>Is Treasury Balance Released? {treasuryReleasedStatus ? 'True': "False"}</p>
      </div>
      <button onClick={createProposal}>Create</button>
    </div>
  );
}

export default App;
