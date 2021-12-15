import * as React from "react";
import '../css/Header.css';
import { Container, Row, Col } from 'react-grid-system';
import logo from '../images/logo.gif';
import mascot1 from '../images/mascot 1.png';
import mascot2 from '../images/mascot 2.png';
import whale_word from '../images/whale-word.png';
import { Link } from 'react-router-dom';
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import TradeContext from '../context/TradeContext';
import metamaskImage from '../images/metamask.svg';
import trustWalletImage from '../images/trustWallet.svg';
import walletConnectImage from '../images/walletConnect.png';
import { useWallet } from 'use-wallet';

import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { blue } from '@material-ui/core/colors';

const connectWalletTypes = ['Metamask', 'TrustWallet', 'WalletConnect'];
const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
});

function SimpleDialog(props) {
    const classes = useStyles();
    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value) => {
        onClose(value);
        console.log(value);
        if (value == "Metamask") props.connectMetamask()
        else if(value == "TrustWallet"){
            props.connectMetamask();
        }
        else props.walletConnect();
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
            <DialogTitle id="simple-dialog-title">Connect to a wallet</DialogTitle>
            <List>
                {connectWalletTypes.map((type) => (
                <ListItem button onClick={() => handleListItemClick(type)} key={type}>
                    <ListItemAvatar>
                        {type == "Metamask" && (
                            <img className="swap-connect-wallet-image" src={metamaskImage} alt="metamaskImage" />
                        )}
                        {type == "TrustWallet" && (
                            <img className="swap-connect-wallet-image" src={trustWalletImage} alt="trustWalletImage" />
                        )}
                        {type == "WalletConnect" && (
                            <img className="swap-connect-wallet-image" src={walletConnectImage} alt="walletConnectImage" />
                        )}
                    </ListItemAvatar>
                    
                    <ListItemText primary={type} />
                </ListItem>
                ))}
            </List>
        </Dialog>
    );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

function Header() {
    const wallet = useWallet();
    const { walletAddress, setWalletAddress, setWeb3Instance, openTransak, metaOpen, setMetaOpen, handleClickMetaOpen } = React.useContext(TradeContext);
    
    const [selectedValue, setSelectedValue] = React.useState(connectWalletTypes[0]);
    
    
    
    
    const handleClose = (value) => {
        setMetaOpen(false);
        setSelectedValue(value);
    };
    
    const connectMetamask = async () => {
        const currentProvider = await detectEthereumProvider();
        if (currentProvider) {
            let web3InstanceCopy = new Web3(currentProvider);
            setWeb3Instance(web3InstanceCopy);
            
            if (!window.ethereum.selectedAddress) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            }
            await window.ethereum.enable();
            let currentAddress = window.ethereum.selectedAddress;
            setWalletAddress(currentAddress);
            console.log("currentAddress", currentAddress);
        } else {
            console.log('Please install MetaMask!');
        }
    }

    const walletConnect = async () => {
        const currentProvider = await detectEthereumProvider();
        if (currentProvider) {
            let web3InstanceCopy = new Web3(currentProvider);
            setWeb3Instance(web3InstanceCopy);
            console.log(web3InstanceCopy);
            try {
                wallet.connect('walletconnect');
            } catch {
                console.log("walletConnect error!");
            }
        }
    }
  
    const getAbbrWalletAddress = (walletAddress) => {
        let abbrWalletAddress = walletAddress.substring(0, 4) + "..." + walletAddress.substring(38, 42);
        return abbrWalletAddress.toUpperCase();
    }

    React.useEffect(async () => {
        console.log('state', wallet.status);
        if (wallet.status == "connected") {
            let currentAddress = wallet.account;
            console.log(currentAddress);
            setWalletAddress(currentAddress);
        }
    })

    return (
        <div className="header">
            <div>
                <SimpleDialog
                    selectedValue={selectedValue}
                    open={metaOpen}
                    onClose={handleClose}
                    connectMetamask={connectMetamask}
                    walletConnect={walletConnect}
                />
            </div>

            <Row>
                <Col xs={12} md={2} sm={2} className="header-section">
                    <Link className="header-link" to= "/">
                        <img src={logo} alt="Logo" style= {{width: '80px'}} />
                    </Link>
                </Col>
                <Col xs={12} md={8} sm={8} className="header-section header-section-none">
                    <div className= "header-swap-div">
                        <Link style= {{textDecoration: 'none'}} to= "/wallet"><span className= "header-swap-btn">Wallet</span></Link>
                        <Link style= {{textDecoration: 'none'}} to="/swap"><span className= "header-swap-btn">Swap</span></Link>
                        <Link style= {{textDecoration: 'none'}} to= "/reward-track"><span className= "header-swap-btn">Reward</span></Link>
                    </div>
                </Col>
                <Col xs={12} md={2} sm={2} className="header-section">
                    {/* <Link className="header-link" to="/" onClick={() => openTransak()}>Buy BNB</Link> */}
                    
                    {walletAddress == "" && (
                        <button className="header-connect-btn" onClick={() => handleClickMetaOpen()}>
                            Connect Wallet
                        </button>
                    )}
                    {walletAddress != "" && (
                        <button className="header-connect-btn" onClick={() => handleClickMetaOpen()}>
                            {getAbbrWalletAddress(walletAddress)}
                        </button>
                    )}
                </Col>
            </Row>
            <Row style={{justifyContent: "center"}}>
                <img src={mascot1} alt="mascot1" style= {{ width: '30vw', marginRight: "6vw"}} />
                <img src={whale_word} alt="whale_word" style= {{ width:'40vw', position: 'absolute', marginTop: "-3vw"}} />
                <img src={mascot2} alt="mascot2" style= {{ width: '30vw', marginLeft: "6vw"}} />
            </Row>
        </div>
    );
}

export default Header;