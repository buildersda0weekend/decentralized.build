import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'
import { BrowserRouter as Router, useRoutes } from 'react-router-dom'
import Home from './pages/Home'
import Proposal from './pages/Proposal'
import ConnectWallet from './components/web3/ConnectWallet'
import { ProposalDetail } from './components/proposal/ProposalDetail'
import Member from './pages/Member'
function getLibrary(provider) {
  return new Web3(provider)
}

const App = () => {
  let routes = useRoutes([
    { path: '/', element: <Home /> },
    { path: '/proposal', element: <Proposal />},
    { path: '/proposalDetail', element: <ProposalDetail />},
    { path: '/members', element: <Member />},
  ])
  return routes
}

const AppWrapper = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Router>
        <div className='App'>
          <ConnectWallet />
          <App />
        </div>
      </Router>
    </Web3ReactProvider>
  );
};


export default AppWrapper
