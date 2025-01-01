import Head from "next/head";
import { ethers } from "ethers";
import { useState } from "react";
import styles from "@/styles/Home.module.css";
import {
  contractAddress,
  contractABI,
  TipJarCreatedContractABI,
} from "@/components/constants";
import Header from "@/components/Header";
import Projects from "@/components/Projects";

export default function Home() {
  const [tipContract, setTipContract] = useState("");
  const [balance, setBalance] = useState("");
  const [totaltip, getTotalTip] = useState(0)

  
  async function connectWallet() {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await new ethers.BrowserProvider(
        window.ethereum
      ).getSigner();
      console.log("Signer:", signer);

      return signer;
    } else {
      console.error("MetaMask is not installed");
    }
  }

  async function createTipJar() {
    try {
      const signer = await connectWallet();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Set up the event listener BEFORE calling create()
      contract.on("TipJarCreated", (owner, tipJarAddress, message, event) => {
        console.log("Event detected:", { owner, tipJarAddress, message });
        setTipContract(tipJarAddress);

        // Optionally remove the listener after detecting the event
        contract.removeListener("TipJarCreated");
      });

      // Call the create function and wait for the transaction to be mined
      const tx = await contract.create();
      console.log("Transaction hash:", tx.hash);

      // Wait for the transaction receipt
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      // If the event listener doesn't trigger, fallback to querying past logs
      const events = await contract.queryFilter(
        "TipJarCreated",
        receipt.blockNumber,
        receipt.blockNumber
      );
      if (events.length > 0) {
        const event = events[0];
        console.log("Fallback event data:", {
          owner: event.args.owner,
          tipJarAddress: event.args.tipJarAddress,
          message: event.args.message,
        });
        setTipContract(event.args.tipJarAddress);
      } else {
        console.error("TipJarCreated event not found in logs.");
      }
    } catch (error) {
      console.error("Error creating TipJar:", error);
    }
  }

 

  async function balanceOf() {
    if (!tipContract) return;
    try {
      const signer = await connectWallet();
      const provider = signer.provider; // Get the provider from the signer
      const contract = new ethers.Contract(
        tipContract,
        TipJarCreatedContractABI,
        signer
      );

      const tx = await contract.getTotalTip()
      getTotalTip(tx)
      // Get the balance of the contract address
      const balance = await provider.getBalance(tipContract);

      // Since the balance is in wei, you may wish to display it in ether
      setBalance(ethers.formatEther(balance));
      console.log("Balance in Ether:", ethers.formatEther(balance));
    } catch (error) {
      console.log("Error fetching balance:", error);
    }
  }

  async function withdraw() {
    try {
      if (!tipContract) return;
      const signer = await connectWallet();
      const contract = new ethers.Contract(
        tipContract,
        TipJarCreatedContractABI,
        signer
      );

      const checkBalanceTx = await contract.getTotalTip()
      if(checkBalanceTx <= 0) return alert("Not enough balance to be withdrawn");

      contract.on("Withdrawn", (owner, value, event) => {
        console.log(`${owner} Withdrawn ${value}eth out of this contract`);
        contract.removeListener("Withdrawn");
      });

      const tx = await contract.withdraw();

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      balanceOf();
      console.log("Transaction receipt:", receipt);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Head>
        <title>FUNDFOLIO</title>
        <meta name="description" content="Go Open Source" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.home}>
       <Header connectWallet={connectWallet} />
       <Projects />
       {/* <button onClick={createTipJar}>click</button> */}
      </div>
    </>
  );
}
