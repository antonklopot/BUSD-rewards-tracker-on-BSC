import * as React from "react";
import { Row, Col } from 'react-grid-system';
import '../css/WalletComponent.css';
import swapBtnImage from '../images/swapBtn.png';
import klearImage from '../images/logo.png';
import bnbImage from '../images/bnb-logo.png';
import busdImage from '../images/busd-logo.png';
import neonImage0 from '../images/neon/1.png';
import neonImage1 from '../images/neon/12.png';
import neonImage2 from '../images/neon/32.png';
import neonImage3 from '../images/neon/6.png';
import neonImage4 from '../images/neon/38.png';
import neonImage5 from '../images/neon/22.png';
import neonImage6 from '../images/neon/27.png';
import neonImage7 from '../images/neon/66.png';
import neonImage8 from '../images/neon/65.png';
import neonImage9 from '../images/neon/64.png';
import arrowDown from '../images/arrow-down.png';
import TradeContext from '../context/TradeContext';
import { addressSet, walletSet } from '../constant/addressSet';
import {
    pancakeRouterABI, routerAddress,
    pancakePairABI, tokenABI
} from '../constant/contractABI';

import Web3 from 'web3'
import axios from 'axios'


function WalletComponent(props) {

    const [balanceValue, setBalanceValue] = React.useState([0, 0]);
    const [tokens, setTokens] = React.useState(walletSet);
    const [amountValue, setAmountValue] = React.useState(["", ""]);
    const { walletAddress, web3Instance, openTransak } = React.useContext(TradeContext);

    const requireTokenImg = (address) =>{
        try {
            return require("../images/tokens/"+address+".jpg").default;
        }
        catch (e) {
            return require("../images/tokens/default.jpg").default;
        }
    }

    const getContractInstance = (contractABI, contractAddress) => {
        var bscSeed1= "https://bsc-dataseed1.binance.org/"
        const web3 = new Web3(new Web3.providers.HttpProvider(bscSeed1));
        return new web3.eth.Contract(contractABI, contractAddress);
    }

    const getBalance = async (address) => {

        if(!walletAddress){
            return "0"
        }
        else{
            let balance = 0;
            let decimals = 18;
            if (!web3Instance) return 0;
            else {
                let contractAddress = address;
                let contractInstance = getContractInstance(tokenABI, contractAddress);

                await contractInstance.methods.decimals().call()
                    .then((result) => {
                        decimals = result;
                    })
                    .catch((err) => {
                        console.log('decimal balance err');
                    });

                await contractInstance.methods.balanceOf(walletAddress).call()
                    .then((result) => {
                        balance = result / Math.pow(10, decimals);
                    })
                    .catch((err) => {
                        console.log('token balance err---');
                    });
            }
            return balance;
        }
        
    }
    const getAmountsOut= async (tokenIn, tokenOut)=>{
        
        var contract= getContractInstance(pancakeRouterABI, routerAddress);
        var amountOuts = await contract.methods.getAmountsOut(1, [tokenIn, tokenOut]).call()
        return amountOuts;
    }
    const getTokenPrice= async (address)=>{
        try{
            var data= await axios.get("https://api.pancakeswap.info/api/v2/tokens/"+address);
            var price= parseFloat(data.data.data.price).toFixed(12)
            return price
        }
        catch{
            return 0;
        }
        
    }


    const getAmountOut = (amountIn, reserveIn, reserveOut) => {
        let amountInWithFee = amountIn * 998;
        let numerator = amountInWithFee * reserveOut;
        let denominator = reserveIn * 1000 + amountInWithFee;
        let amountOut = numerator / denominator;
        return amountOut;
    }


    React.useEffect(async () => {
        var modified= await Promise.all(tokens.map( async (one)=>{
            var balance= await getBalance(one.addr)

            var price= await getTokenPrice(one.addr)
            return {...one, balance, price}; 
        }));
        setTokens(modified);
        // console.log("---", web3Instance.eth);
        // console.log("kill", amountValue[0]);

        if (props.status === "buy") {
            openTransak();
        }
    },[walletAddress]);

    return (
        <div className="swap-container">
            <div className="swap-header">
                WALLET
            </div>
            <div className="wallet-body">
                <div className="swap-body-container">
                    {
                        tokens.map(function(item, i){
                            return (
                                <div className="wallet-content row m-0" key= {i}>
                                    <div className= "col-md-3">
                                        <span><img width= "30px" src={requireTokenImg(item.addr)}/>  {item.name}</span>
                                    </div>
                                    <div className= "col-md-5">
                                        <span>${item.price}</span>
                                    </div>
                                    <div className= "col-md-4">
                                        <span>{item.balance}</span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export default WalletComponent;