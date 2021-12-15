import * as React from "react";
import { Row, Col } from 'react-grid-system';
import '../css/SwapComponent.css';
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
import { addressSet, swapSet } from '../constant/addressSet';
import {
    pancakeRouterABI, routerAddress,
    pancakePairABI, tokenABI
} from '../constant/contractABI';

import {
    getContractInstance, getAmountOut, getDecimal
} from '../support/coreFunc';

import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Web3 from 'web3'

var token_list= [swapSet, swapSet]
var fromToLabel = ['FROM', 'TO'];

var dialogOrder = 0;
const requireTokenImg = (address) =>{
    try {
        return require("../images/tokens/"+address+".jpg").default;
    }
    catch (e) {
        return require("../images/tokens/default.jpg").default;
    }
}



function TokenListDialog(props) {
    const { selectedValue, open, getBalance, token_list, onClose } = props;
    const [ bnbBalance, setBnbBalance ] = React.useState(0);
    const [ busdBalance, setBusdBalance ] = React.useState(0);
    const [ klearBalance, setKlearBalance ] = React.useState(0);

    const { walletAddress } = React.useContext(TradeContext);

    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value) => {
        onClose(value);
    };


    const DialogListItem = (token) => {
        return (
            <ListItem button onClick={() => handleListItemClick(token)} key={token.name}>
                <ListItemAvatar>
                    <img className="swap-token-image" width= "30px" src={requireTokenImg(token.addr)}/>
                </ListItemAvatar>

                <ListItemText primary={token.name} />
                <div>{token.balance}</div>
            </ListItem>
        );
    }
    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" className="tokenList-dialog" open={open}>
            <DialogTitle id="simple-dialog-title">Select a token</DialogTitle>
            <List>
                {token_list[dialogOrder].map((token_name) => (
                    DialogListItem(token_name)
                ))}

            </List>
        </Dialog>
    );
}

TokenListDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    // selectedValue: PropTypes.string.isRequired,
};

function SwapComponent(props) {
    const [open, setOpen] = React.useState(false);
    const [token_list, setToken_list] = React.useState([swapSet, swapSet])
    const [selectedValue, setSelectedValue] = React.useState(token_list[0][0].name);
    
    const [balanceValue, setBalanceValue] = React.useState([0.0, 0.0]);
    const [token_names, setToken_names] = React.useState([token_list[0][0], token_list[1][1]]);
    const [amountValue, setAmountValue] = React.useState([0, 0]);
    const [approved, setApproved] = React.useState(true);
    const [insufficiant, setInsufficiant] = React.useState(false);

    const [rate, setRate] = React.useState(0);
    const { walletAddress, web3Instance, openTransak, metaOpen, setMetaOpen, handleClickMetaOpen } = React.useContext(TradeContext);
    const amountMax = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

    // const getContractInstance = (contractABI, contractAddress) => {
    //     if (web3Instance) {
    //         let contract = new web3Instance.eth.Contract(contractABI, contractAddress);
    //         return contract;
    //     }
    //     else {
    //         return null;
    //     }
    // }

    const checkApproval = async (addr) => {
        let contractTokenInstance = getContractInstanceForMetaMask(tokenABI, addr);
        let allowance = await getAllowance(contractTokenInstance);
        if (allowance == 0) return false;
        else return true;
    }

    const handleClickOpen = (num) => {
        dialogOrder = num;
        setSelectedValue(token_names[num]);
        setOpen(true);
    };

    const handleClose = async (value) => {
        setOpen(false);
        setSelectedValue(value);
        let balance = await getBalance(value);
        let token_name_tmp = token_names;
        
        if (dialogOrder) {
            token_name_tmp = [token_names[0], value];
        } else {
            token_name_tmp = [value, token_names[1]];
        }

        setToken_names(token_name_tmp);

        if (dialogOrder == 0) setBalanceValue([balance, balanceValue[1]]);
        else setBalanceValue([balanceValue[0], balance]);
        await setRateFunction(token_name_tmp);

        if (token_name_tmp[0].name != "BNB") {
            let flag = await checkApproval(token_name_tmp[0].addr);
            setApproved(flag);
        } else {
            setApproved(true);
        }
    };

    const getBalance = async (token) => {
        console.log("walletAddress", walletAddress)
        if(!walletAddress){
            return "0"
        }
        else{
            let balance = 0;
            let decimals = 18;
            if (!web3Instance) return 0;
            else {
                if (token.name == 'BNB') {
                    await web3Instance.eth.getBalance(walletAddress)
                        .then((result) => {
                            balance = result / Math.pow(10, decimals);
                        })
                }
                else{
                    let contractAddress = token.addr;
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
            }
            return balance;
        }
        
    }

    const getPairAddress = (token_list) => {
        let pairAddress = "";
        if ((token_list[0] != "BNB") && (token_list[1] != "BNB")) {
            pairAddress = addressSet.busdKlear;
        } else if (token_list[0] == "KLEAR" || token_list[1] == "KLEAR") {
            pairAddress = addressSet.bnbKlear;
        } else {
            pairAddress = addressSet.bnbBusd;
        }
        return pairAddress;
    }



    const setRateFunction = async (token_list)=>{
        console.log("token_list", token_list)
        var amountOuts = await getAmountOut(token_list[0].addr, token_list[1].addr);
        console.log("amoutOuts", amountOuts);
        var rateTemp= amountOuts;
        setRate(rateTemp);
        // return amountOuts;
    }
    const handleChangeInput = (e, order) => {
        let amount = e.target.value;
        if (walletAddress == "") {
            if (order == 0) setAmountValue([amount, amountValue[1]]);
            else setAmountValue([amountValue[0], amount])
        } else {
            if (order == 0){
                setAmountValue([amount, amount * rate]);
                if(amount>balanceValue[0]){
                    setInsufficiant(true)
                }
                else{
                    setInsufficiant(false)
                }
            }
            else if (rate !== 0){
                setAmountValue([amount / rate, amount]);
                if(amount/rate> balanceValue[0]){
                    setInsufficiant(true)
                }
                else{
                    setInsufficiant(false)
                }
            }
            else {
                if(amountValue[0]> balanceValue[0]){
                    setInsufficiant(true)
                }
                else{
                    setInsufficiant(false)
                }
                setAmountValue([amountValue[0], amount]);
            }
        }

        // if (amount == 0) {
        //     if (order == 0) setAmountValue(["", amountValue[1]]);
        //     else setAmountValue([amountValue[0], ""]);
        // }
    }

    const handleMax = () => {
        setAmountValue([balanceValue[0], balanceValue[0] * rate]);
    }

    const getAllowance = async (contractTokenInstance) => {
        if(!walletAddress){
            return 0
        }
        let allowance = 0;
        if (contractTokenInstance) {
            await contractTokenInstance.methods.allowance(walletAddress, routerAddress).call()
            .then((result) => {
                allowance = result;
            })
            .catch((err) => {
                console.log('allowance err');
            });
        }
        return allowance;
    }
    
    const approveFunction = async (contractTokenInstance) => {
        try {
            await contractTokenInstance.methods.approve(
                routerAddress,
                amountMax
            ).send({ from: walletAddress });
            setApproved(true)
        } catch (error) {
            console.log(error)
        }
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
    const handleSubmit = async () => {
        if (!approved) {
            let contractTokenInstance = getContractInstanceForMetaMask(tokenABI, token_names[0].addr);
            await approveFunction(contractTokenInstance);
        }
        else {
            if (token_names[0].addr== token_names[1].addr) {
                return;
            }
            if (amountValue[0]<= 0) {
                return;
            }
            if (amountValue[0] > balanceValue[0]) {
                return;
            }
            let token0_address = token_names[0].addr
            let token1_address = token_names[1].addr
            let contractPancakeRouter = getContractInstanceForMetaMask(pancakeRouterABI, routerAddress);
            let deadline = 2000000000;

            if (token_names[0].name == "BNB") {
                let path = [token0_address, token1_address];
                let value = amountValue[0] * Math.pow(10, 18);
                let amountOutMin = 0;
    
                try {
                    await contractPancakeRouter.methods.swapExactETHForTokens(
                        amountOutMin.toString(),
                        path,
                        walletAddress,
                        deadline
                    ).send({ from: walletAddress, value: value.toString() });
                } catch (error) {
                    console.log(error)
                }
            } else if (token_names[1].name == "BNB") {
                var decimal= await getDecimal(token0_address)
                let amountIn = amountValue[0] * Math.pow(10, decimal);
                let path = [token0_address, token1_address];
                let amountOutMin = 0;
                try {
                    await contractPancakeRouter.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
                        amountIn.toString(),
                        amountOutMin.toString(),
                        path,
                        walletAddress,
                        deadline
                    ).send({ from: walletAddress });
                } catch (error) {
                    console.log(error)
                }
            } else {
                let decimals = 18;
                var decimal0= await getDecimal(token0_address)
                
                var decimal1= await getDecimal(token1_address)
                let amountIn = amountValue[0] * Math.pow(10, decimal0);

                
                let path = [token0_address, addressSet['BNB'], token1_address];

                let amountOutMin = 0;
                
                try {
                    await contractPancakeRouter.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                        amountIn.toString(),
                        amountOutMin.toString(),
                        path,
                        walletAddress,
                        deadline
                    ).send({ from: walletAddress });
                } catch (error) {
                    console.log(error)
                }
            }
            await setBalanceAgain()
        }
    }

    const handleConvert = async () => {
        var converted= [token_names[1], token_names[0]];
        setToken_names([...converted]);
        setBalanceValue([balanceValue[1], balanceValue[0]]);
        setAmountValue([amountValue[1], amountValue[0]]);
        // token_list = [token_list[1], token_list[0]];
        if(rate) setRate(1 / rate);
        if (converted[0].name == "BNB") setApproved(true);
        else {
            let flag = await checkApproval(converted[0].addr);
            setApproved(flag);
        }
    }
    const setBalanceAgain= async()=>{
        var token_list_upgrade= await Promise.all(token_list[dialogOrder].map( async(one)=>{
            var balance= await getBalance(one)
            return {...one, balance}
        }));
        setToken_list([token_list_upgrade, token_list_upgrade]);
    }
    React.useEffect(async () => {
        if (walletAddress != "") {
            let balance0 = await getBalance(token_names[0]);
            let balance1 = await getBalance(token_names[1]);
            setBalanceValue([balance0, balance1]);
            setRateFunction(token_names);
            
            // console.log("---", web3Instance.eth);
            // console.log("kill", amountValue[0]);
        }
        await setBalanceAgain();
        if (props.status === "buy") {
            openTransak();
        }
    }, [walletAddress]);

    const SwapTokenComponent = (order) => {
        return (
            <div className="swap-token">
                <div className="swap-balance">
                    <Row>
                        <Col xs={4} md={8} className="from-div">
                            {fromToLabel[order]}
                        </Col>
                        {walletAddress != "" && (
                            <Col xs={4} md={2} className="balance-div" style={{ padding: "0px" }}>
                                Balance:
                            </Col>
                        )}
                        {walletAddress != "" && (
                            <Col xs={4} md={2} className="balanceValue-div" style={{ padding: "2px" }}>
                                {parseFloat(balanceValue[order]).toFixed(6)}
                            </Col>
                        )}
                    </Row>
                </div>
                <div className="swap-value">
                    <Row>
                        <Col xs={12} md={6} style={{marginBottom: '5px'}}>
                            <input
                                // type= "text"
                                className="swap-value-input"
                                placeholder=""
                                value={amountValue[order]}
                                onChange={(e) => handleChangeInput(e, order)}
                            />
                        </Col>
                        <Col xs={12} md={3} style={{marginBottom: '5px'}}>
                            {order == 0 && (
                                <button className="swap-max-btn" onClick={handleMax}>
                                    MAX
                                </button>
                            )}
                            {order == 1 && (
                                <button className="swap-max-btn max-empty" style={{ opacity: "0" }}>
                                    MAX
                                </button>
                            )}
                        </Col>
                        <Col xs={12} md={3} style={{paddingLeft:'15px'}} style={{marginBottom: '5px'}}>
                            <button className="swap-tokenList-btn" onClick={() => handleClickOpen(order)} >
                                <img className= "swap-token-image" src= {requireTokenImg(token_names[order].addr)}/>
                                &nbsp;{token_names[order].name}
                                <img className="swap-token-image" src={arrowDown} alt="arrowDown" />
                            </button>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }

    return (
        <div className="swap-container">
            <div>
                <TokenListDialog
                    selectedValue={selectedValue}
                    open={open}
                    token_list= {token_list}
                    onClose={handleClose}
                    getBalance={getBalance}
                />
            </div>


            <div className="swap-header">
                SWAP
            </div>
            <div className="swap-body">
                <div className="swap-body-container">
                    {SwapTokenComponent(0)}
                    <div className="swap-button">
                        <Row>
                            <Col xs={12} md={6}>
                                <button className="swap-convert-btn" onClick={handleConvert} >
                                    <span style={{fontSize:'50px', color: 'rgb(248,200,70)', fontWeight:'bold'}}>&#x2193;</span>
                                    {/*<img className="swap-convert-image" src={swapBtnImage} alt="swapBtnImage" />*/}
                                </button>
                            </Col>
                        </Row>
                    </div>
                    {SwapTokenComponent(1)}
                    <div className="swap-price">
                        <Row>
                            <Col xs={12} md={5} className="from-div">
                                Price
                            </Col>
                            <Col xs={12} md={4} className="balance-div" style={{ paddingRight: "5px" }}>
                                {rate}
                            </Col>
                            <Col xs={12} md={3} className="balanceValue-div" >
                                {token_names[1].name} per {token_names[0].name}
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
            <div className="swap-footer">
                {walletAddress && !insufficiant && approved && (
                    <button className="swap-submit-btn" onClick={handleSubmit}>
                        Exchange
                    </button>
                )}
                {walletAddress && !insufficiant && !approved && (
                    <button className="swap-submit-btn" onClick={handleSubmit}>
                        Approve
                    </button>
                )}
                {walletAddress && insufficiant && (
                    <button className="swap-submit-btn-insufficiant" disabled onClick={handleSubmit}>
                        Insufficiant fund
                    </button>
                )}
                {walletAddress == "" && (
                    <button className="header-connect-btn" onClick={() => handleClickMetaOpen()}>
                        CONNECT WALLET
                    </button>
                )}
            </div>
        </div>
    );
}

export default SwapComponent;