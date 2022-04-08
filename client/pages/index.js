import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from '../utils/WavePortal.json';
import Lottie from 'react-lottie';
import animationData from '../lottie/data-center.json'

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [wavesCount, setWavesCount] = useState(0);
  const [allWaves, setAllWaves] = useState([])
  const contractAddress = "0x9d7c4dD2da15BE18cfAF6bD8d16caF29A51Bf752"
  const contractABI = abi.abi;

  const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const getAllWaves = async () => {
    try {
      const {ethereum } = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = []
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        })

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object does not exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    try {
      if(!ethereum) {
        console.log("Make sure you have metamask")
        return
      } else {
       // console.log("We have the ethereum object ", ethereum )
      }

      const accounts = await ethereum.request({method: "eth_accounts"});

      if(accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found and authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
      
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window

      if(!ethereum) {
        alert("Get Metamask")
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      console.log("connected", accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const getTotalWaves = async () => {
    try {
      const { ethereum } = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
        let count = await wavePortalContract.getTotalWaves();
        setWavesCount(count.toNumber())
      } else {
        console.log("Ethereum object does not exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    const waveMsg = document.getElementById('waveMsgBox');

    if(waveMsg.value.length < 1 ) {
      alert("Please enter a short message")
      return;
    }

    try {

      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(waveMsg.value, {gasLimit: 300000});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash)

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setWavesCount(count.toNumber())
        // getAllWaves();
        
      } else {
        console.log("Ethereum object doesn't exist!")
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    getTotalWaves()
    getAllWaves()
  }, [])

  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

  return (
    <div className="flex h-screen justify-center items-center bg-gradient-to-r from-sky-200 to-gray-300">

      <div className="dataContainer">
        <Lottie 
          options={defaultOptions}
          height={200}
          width={200}
        />
        <div className="header">
        👋 Hey Web 3.0 Students!
        </div>

        <div className="bio">
        I am Uduak and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!      
        </div>
        <div className="wavesCount">waves - {wavesCount}</div>

        <textarea id="waveMsgBox"  name="waveMsg" placeholder="short message here" />
        <div className="flex justify-center w-full">
          <button className="waveButton bg-indigo-600 mb-4 w-1/4 text-white" onClick={wave}>
            Wave at Me
          </button>
        </div>

        {!currentAccount &&
          (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>  
          )
        }

        <div className="h-96 overflow-y-scroll">
        { allWaves.map((wave, index) => {
          return (
            <div key={index} style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Address: {wave.address}</div>  
              <div>Time: {wave.timestamp.toString()}</div>  
              <div>Message: {wave.message}</div>  
            </div>
          )
        })   
        }
        </div>
      </div>
    </div>
  )
}
