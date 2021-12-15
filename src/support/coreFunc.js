import Web3 from 'web3';
import {
    pancakeRouterABI, routerAddress,
    pancakePairABI, tokenABI, powABI, distributorAddress, distributorABI
} from '../constant/contractABI';
import { addressSet, swapSet } from '../constant/addressSet';

const getContractInstance = (contractABI, contractAddress) => {
    var bscSeed1= "https://bsc-dataseed1.binance.org/"
    const web3 = new Web3(new Web3.providers.HttpProvider(bscSeed1));
    return new web3.eth.Contract(contractABI, contractAddress);
}

function setDecimals( number, decimals ){
    number = number.toString();
    let numberAbs = number.split('.')[0]
    let numberDecimals = number.split('.')[1] ? number.split('.')[1] : '';
    while( numberDecimals.length < decimals ){
        numberDecimals += "0";
    }
    return numberAbs + numberDecimals;
}

let getDecimal = async (addr) => {
    let decimal = 0;
    let contractInstance = getContractInstance(tokenABI, addr);
    try{
        decimal = await contractInstance.methods.decimals().call();
    }catch(error){
        console.log(error);
    }
    return decimal;
}
let getAmountOut = async (tokenAddr0, tokenAddr1) => {
    var bscSeed1= "https://bsc-dataseed1.binance.org/"
    const web3 = new Web3(new Web3.providers.HttpProvider(bscSeed1));
    const decimal0 = await getDecimal(tokenAddr0);
    const decimal1= await getDecimal(tokenAddr1);
    var tokensToSell = setDecimals(1, decimal0);
    const contractInstance = getContractInstance(pancakeRouterABI, routerAddress);
    var rateTemp= 0
    var amountOuts= []
    try{
        amountOuts = await contractInstance.methods.getAmountsOut(tokensToSell, [tokenAddr0, tokenAddr1]).call()

        rateTemp = amountOuts[1] / Math.pow(10, decimal1);
        
        // return web3.utils.fromWei(amountOuts[1]);
        return rateTemp;
    }catch(error){
        console.log(error);
        amountOuts= await contractInstance.methods.getAmountsOut(tokensToSell, [tokenAddr0, addressSet['BNB'], tokenAddr1]).call();
        rateTemp = amountOuts[2] / Math.pow(10, decimal1);
        return rateTemp;
    }
}

export { 
    getContractInstance, getAmountOut, getDecimal
};