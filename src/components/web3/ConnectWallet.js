import { useWeb3React } from "@web3-react/core"
import * as React from 'react';
import {injected} from './Connector'
import "./main.css"
import Button from '@mui/material/Button'
import { useEffect, useState } from "react";
import Web3 from "web3";
import { Link} from 'react-router-dom';
import { useNavigate } from "react-router-dom"


export default function ConnectWallet() {
  let navigate = useNavigate ();                                                                                    
   function redirectedToMember () {
    navigate("/members")
  }
  function redirectedToOverview() {
          navigate("/")
  }
  
  const { active, account, activate, deactivate} = useWeb3React()
  const [balance, setBalance] = useState(0);
  async function loadWallet() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    if (account) {
      const balance = await web3.eth.getBalance(account);
      const balanceETH = Web3.utils.fromWei(balance, "ether");
      const roundedOffBalance = parseFloat(balanceETH).toFixed(2)
      setBalance(roundedOffBalance);
    } else {
      connect()
    }
  }

  async function connect() {
    try {
      await activate(injected)
    } catch (ex) {
      console.log(ex)
    }
    async function disconnect() {
      try {
        deactivate()
      } catch (ex) {
        console.log(ex)
      }
    }
  }
  function showAccount() {
    let firstFourLetter = account.substring(0,4)
    console.log(firstFourLetter)
  }
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem('isWalletConnected') === 'true') {
        try {
          await activate(injected)
        } catch (ex) {
          console.log(ex)
        }
      }
    }
    connectWalletOnPageLoad()
  }, []);
  useEffect(() => {
    loadWallet();
  }, [account]);
  return (
    <div>
    <div className="Navbar">
    <div className="logo">
          <span className="dao-logo">;BuildersDAO/</span>
          <span className="dao-logo-text">We build web3 stuff.</span>
        </div>
        <div className="mid-btn">
        <Link to="/proposal">
        <Button className="nav-center-button" id="mid-btn-one">Proposals</Button>
        </Link>
      <Button className="nav-center-button" id="mid-btn-two" value="forum" onClick={redirectedToOverview} >OverView</Button>
      <Button className="nav-center-button"  value="docs" onClick={redirectedToMember}>Members</Button>
    </div>
        <div className="wallet">
      {active ? (
        <Button size="medium" className="connect-address-btn">{account.substring(0,5) + '...' + account.substring(38,42)}</Button>
       ) : (
        <Button size="medium" onClick={connect}  className="connect-btn" >Connect Wallet</Button>
       )}
      <span className='balance'>{balance} ETH</span>
      </div>
       </div>
    </div>
  )
}