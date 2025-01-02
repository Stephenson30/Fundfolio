import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MockData } from "@/components/MockData";
import styles from "@/styles/profile.module.css";
import { ethers } from "ethers";
import {
  contractAddress,
  contractABI,
  TipJarCreatedContractABI,
} from "@/components/constants";

export default function Profile() {
  const [tipContract, setTipContract] = useState(""); // store created jar address
  const [balance, setBalance] = useState(""); // store balance of jar address
  const [totaltip, getTotalTip] = useState(0); //store balance of jar address
  const params = useParams(); // Extract userId or email from the route
  const router = useRouter();
  const [user, setUser] = useState(null); // Store user details
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Simulate login state

  const userId = params?.userId || params?.email; // Handle dynamic routing
  console.log(userId);
  useEffect(() => {
    // Simulate fetching user data
    if (userId) {
      const foundUser = MockData.find(
        (item) => item.id === userId || item.email === userId
      );
      setUser(foundUser || null);
    }
  }, [userId]);

  if (!isLoggedIn) {
    return <p>Please log in to view your profile.</p>;
  }

  if (!user) {
    return <p>Loading profile...</p>; // Show loading state
  }

  // connect wallet function
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

  // get balance function
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

      const tx = await contract.getTotalTip();
      getTotalTip(tx);
      // Get the balance of the contract address
      const balance = await provider.getBalance(tipContract);

      // Since the balance is in wei, you may wish to display it in ether
      setBalance(ethers.formatEther(balance) + "ETH");
      console.log("Balance in Ether:", ethers.formatEther(balance));
    } catch (error) {
      console.log("Error fetching balance:", error);
    }
  }

  // create jar function
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
        alert("Tip Jar Created!"); // Simulate creating a tip jar
      } else {
        console.error("TipJarCreated event not found in logs.");
      }
    } catch (error) {
      console.error("Error creating TipJar:", error);
    }
  }

  const handleCreateTipJar = () => {
    createTipJar();
    // setUser({ ...user, tipJarAddress: "0xNewTipJarAddress" });
  };

  // withdraw tip jar function
  async function withdraw() {
    try {
      if (!tipContract) return;
      const signer = await connectWallet();
      const contract = new ethers.Contract(
        tipContract,
        TipJarCreatedContractABI,
        signer
      );

      balanceOf();

      const checkBalanceTx = await contract.getTotalTip();
      if (checkBalanceTx <= 0)
        return alert("Not enough balance to be withdrawn");

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

  const handleWithdraw = () => {
    withdraw(); // Simulate withdraw
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <svg
        onClick={() => {
          router.push("/");
        }}
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="m7.825 13l4.9 4.9q.3.3.288.7t-.313.7q-.3.275-.7.288t-.7-.288l-6.6-6.6q-.15-.15-.213-.325T4.426 12t.063-.375t.212-.325l6.6-6.6q.275-.275.688-.275t.712.275q.3.3.3.713t-.3.712L7.825 11H19q.425 0 .713.288T20 12t-.288.713T19 13z"
        />
      </svg>
      <div className={styles.profile_container}>
        <h1>Welcome, {user.projectName}</h1>
        <div className={styles.profile_details}>
          <img
            src={user.image || "https://via.placeholder.com/150"}
            alt={`${user.name} profile`}
            className={styles.profile_image}
          />
          <p style={{ width: "100%" }}>
            <strong style={{ fontSize: "16px" }}>owners Address:</strong>{" "}
            {user.walletAddress}
          </p>
          <p className={styles.balance}>balance: {balance}</p>
        </div>
        <div className={styles.profile_actions}>
          {tipContract ? (
            <>
              <p style={{ width: "100%", fontSize: "12px" }}>
                Your Tip Jar Address: {tipContract}
              </p>
              <br />
              <button className={styles.withdraw_btn} onClick={handleWithdraw}>
                Withdraw
              </button>
              <button className={styles.withdraw_btn} onClick={balanceOf}>
                check balance
              </button>
            </>
          ) : (
            <button
              className={styles.create_tipjar_btn}
              onClick={handleCreateTipJar}
            >
              Create Tip Jar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
