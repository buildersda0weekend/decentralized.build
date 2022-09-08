import { useState } from 'react'
import Web3 from 'web3'


const useWeb3 = async () => {
  const [web3, setWeb3] = useState()
  const web3Instance = new Web3(Web3.givenProvider || "http://localhost:7545");
  setWeb3(web3Instance)
  return web3
}

export default useWeb3