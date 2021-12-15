import * as React from 'react';
import logo from './logo.svg';
import Header from './components/Header';
import SwapComponent from './components/SwapComponent';
import WalletComponent from './components/WalletComponent';
import RewardComponent from './components/RewardComponent'
import { BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import './App.css';
import TradeContext from './context/TradeContext';
import { UseWalletProvider } from 'use-wallet'
import TransakSDK from "@transak/transak-sdk";
import backgroundImg from './images/Background.png';

function App() {
    const [walletAddress, setWalletAddress] = React.useState("");
    const [web3Instance, setWeb3Instance] = React.useState(null);
    const [metaOpen, setMetaOpen] = React.useState(false);
    const handleClickMetaOpen = () => {
        if (walletAddress === "") {
            setMetaOpen(true);
        } else {
            setWalletAddress("");
            setWeb3Instance(null);
        }
    }
    const settings = {
        apiKey: '7feeae5c-001c-42ed-813a-df1a992d4bec',  // Your API Key
        environment: 'STAGING', // STAGING/PRODUCTION
        defaultCryptoCurrency: 'BNB',
        themeColor: '#242222', // App theme color
        hostURL: window.location.origin,
        widgetHeight: "600px",
        widgetWidth: "400px",
    }

    const openTransak = () => {
        const transak = new TransakSDK(settings);
    
        transak.init();
        // To get all the events
        transak.on(transak.ALL_EVENTS, (data) => {
            console.log(data)
        });
    
        // This will trigger when the user marks payment is made.
        transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
            console.log(orderData);
            transak.close();
        });
    }
    return (
        <UseWalletProvider
            chainId={56}
            connectors={{
                walletconnect: { rpcUrl: 'https://bsc-dataseed.binance.org/' },
            }}
        >
            <BrowserRouter basename="">
                <Switch>
                    <TradeContext.Provider value={{ walletAddress, setWalletAddress, web3Instance, setWeb3Instance, openTransak, metaOpen, setMetaOpen, handleClickMetaOpen }} >
                        <Route exact path="/">
                            <Redirect to="/wallet" />
                        </Route> 
                        <Route path= "/wallet">
                            <div className="App" >
                                <Header />
                                <div className="main-container">
                                    <WalletComponent status="none"/>
                                </div>
                            </div>
                        </Route>
                        <Route path= "/swap">
                            <div className="App" >
                                <Header />
                                <div className="main-container">
                                    <SwapComponent status="none"/>
                                </div>
                            </div>
                        </Route>
                        <Route path= "/reward-track">
                            <div className="App" >
                                <Header />
                                <div className="main-container">
                                    <RewardComponent status="none"/>
                                </div>
                            </div>
                        </Route> 
                    </TradeContext.Provider>
                </Switch>
            </BrowserRouter>
        </UseWalletProvider>
        
    );
}

export default App;
