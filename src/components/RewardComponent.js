import * as React from "react";
import '../css/RewardComponent.css';
import telegram from '../images/telegram.png';
import twitter from '../images/twitter.png';
import facebook from '../images/facebook.png';
import website from '../images/website.png';
import TradeContext from '../context/TradeContext';
import { addressSet, walletSet } from '../constant/addressSet';
import {
    pancakeRouterABI, routerAddress,
    pancakePairABI, tokenABI, powABI, distributorAddress, distributorABI
} from '../constant/contractABI';

import {
    getContractInstance, getAmountOut
} from '../support/coreFunc';

import {
    CircularProgressbar,
    CircularProgressbarWithChildren,
    buildStyles
  } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import AnimatedProgressProvider from "./AnimatedProgressProvider";
import { easeQuadInOut } from "d3-ease";
import { Row, Col } from 'react-grid-system';

function RewardComponent(props) {
    const [holding, setHolding] = React.useState(0);
    const [powPrice, setPowPrice] = React.useState(0);
    const [rewarded, setRewarded] = React.useState(0);
    const [totalShares, setTotalShares] = React.useState(0);
    const [percent, setPercent] = React.useState(0);
    const [notClaimed, setNotClaimed] = React.useState(0);
    const [inputAddress, setInputAddress] = React.useState('');
    const { walletAddress, web3Instance, openTransak, setWalletAddress } = React.useContext(TradeContext);

    const requireTokenImg = (address) =>{
        try {
            return require("../images/tokens/"+address+".jpg").default;
        }
        catch (e) {
            return require("../images/tokens/default.jpg").default;
        }
    }

    const setRewardAndPercent = async ()=>{
        try{
            if(!walletAddress){
                setHolding(0);
                setRewarded(0);
            }
            else{
                var discontract= getContractInstance(distributorABI, distributorAddress);
                var data= await discontract.methods.shares(walletAddress).call();
                var price= await getAmountOut(addressSet['POW'], addressSet['BUSD']);
                setPowPrice(price);
                //POW balance
                var walletHolding= parseInt(data.amount)/10**9;
                
                setHolding(walletHolding.toFixed(6));
                //busd rewared.
                var reward= parseInt(data.totalRealised)/10**18;
                setRewarded(reward.toFixed(6));
                var total= walletHolding*price;
                if(total!=0){
                    var percents= 100/total*reward;
                    setPercent(percents.toFixed(2))
                }
                
            }
        }
        catch{
            console.log('invalid address')
        }
        
    }
    const setNotClaimedfun= async ()=>{
        try{
            if(!walletAddress){
                setNotClaimed(0);
            }
            else{
                var discontract= getContractInstance(distributorABI, distributorAddress);
                var data= await discontract.methods.getUnpaidEarnings(walletAddress).call();
                console.log("data", data)
                var notCla= parseInt(data)/10**18;
                
                setNotClaimed(notCla.toFixed(2));
            }
        }
        catch{
            console.log('invalid address')
        }
        
    }
    const setTotalShare = async ()=>{
        var discontract= getContractInstance(distributorABI, distributorAddress);
        var data= await discontract.methods.totalShares().call();
        var totalShare= parseInt(data)/10**18;
        setTotalShares(totalShare.toFixed(6));
    }
    const getContractInstanceForMetaMask = (contractABI, contractAddress) => {
        if (web3Instance) {
            let contract = new web3Instance.eth.Contract(contractABI, contractAddress);
            return contract;
        }
        else {
            return null;
        }
    }
    const handleClaim = async ()=>{
        try{
            var discontract= getContractInstanceForMetaMask(distributorABI, distributorAddress);
            await discontract.methods.claimDividend().send({ from: walletAddress });
            await init();
        }
        catch{
            console.log('not claim address')
        }
        
        
    }
    const handleSearch = async ()=>{
        setWalletAddress(inputAddress);
        await init();
        console.log('inputAddress', inputAddress)
    }
    const init= async()=>{
        await setRewardAndPercent();
        await setTotalShare();
        await setNotClaimedfun();
    }

    React.useEffect(async () => {
        await init();
    },[walletAddress]);

    return (
        <>
            <div className="swap-container">
                <div className="rewards-header">
                    <div>REWARDS TRACKER</div>
                    <div className="rewards-search">
                        <input
                            // type= "text"
                            className="address-value-input"
                            placeholder="Paste your BSC wallet address"
                            value={inputAddress}
                            onChange={(e) => setInputAddress(e.target.value)}
                        />&nbsp;&nbsp;
                        {
                            !web3Instance&&<button className="addr-sch-btn" onClick= {handleSearch} >
                                GO
                            </button>
                        }
                        {
                            web3Instance&&<button className="addr-sch-btn" disabled style= {{backgroundColor: "#808080"}} onClick= {handleSearch} >
                                Connected
                            </button>
                        }
                    </div>
                    <div className="social-links">
                        <a href="https://www.facebook.com/ProjectOneWhale/" target="_blank"><img width="50px" src={facebook}/></a>
                        <a href="https://twitter.com/ProjectOneWhale" target="_blank"><img width="50px" src={twitter}/></a>
                        <a href="https://t.me/ProjectOneWhale" target="_blank"><img width="50px" src={telegram}/></a>
                        <a href="https://www.onewhale.net/" target="_blank"><img width="50px" src={website}/></a>
                    </div>
                </div>
                <div className="wallet-body">
                    <div className="row rewards-body-container">
                        {/* <button className="swap-tokenList-btn" onClick={() => handleClaim()} >
                                Claim Manually
                            </button> */}
                        <div className="col-sm-4 rewards-content">
                            <div className= "token-field">
                                <span><img width= "30px" src={requireTokenImg(addressSet['POW'])}/>POW BALANCE</span>
                            </div>
                            <div className= "value-field">
                                <span>{holding}</span>
                            </div>
                        </div>

                        <div className="col-sm-4 rewards-content">
                            <div className= "token-field">
                                <span><img width= "30px" src={requireTokenImg(addressSet['BUSD'])}/> BUSD REWARDED</span>
                            </div>
                            <div className= "value-field">
                                <span>{rewarded}</span>
                            </div>
                            <div className= "token-field">
                                <span><img width= "30px" src={requireTokenImg(addressSet['BUSD'])}/> ACCUMULATED REWARD <span style= {{color: 'yellow'}}>&nbsp;&nbsp;{notClaimed}</span></span>
                                <div className= "claim-field">
                                    {web3Instance&&notClaimed!=0&&(<button className="claim" onClick={() => handleClaim()} >
                                        Claim Manually
                                    </button>)}
                                    {web3Instance&&notClaimed==0&&(<button disabled className="claim" onClick={() => handleClaim()} >
                                        No Money to Claim
                                    </button>)}
                                    {!web3Instance&&(<button disabled className="claim" onClick={() => handleClaim()} >
                                        CLAIM
                                    </button>)}
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-4 rewards-content">
                            <div className= "token-field">
                                <span><img width= "30px" src={requireTokenImg(addressSet['BUSD'])}/>TOTAL BUSD REWARDED</span>
                            </div>
                            <div className= "value-field">
                                <span>{totalShares}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
        
    );
}

export default RewardComponent;