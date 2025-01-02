import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/styles/project.module.css";
import { MockData } from "@/components/MockData";
import Link from "next/link";
import { ethers } from "ethers";
import { TipJarCreatedContractABI } from "@/components/constants";

export default function Project() {
  const [showPopup, setShowPopup] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [tipContract, setTipContract] = useState(
    "0xA4C8495ba6243F718Aa01cE75Dbd0b63EFCe6f71"
  );

  const params = useParams();
  const id = params?.id;

  const router = useRouter();
  const project = MockData.find((item) => item.id === id);

  if (!id || !project) {
    return <p>Loading...</p>;
  }

  //   copy contract address function for tipping
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(project.walletAddress);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000); // Hide "Copied!" after 2 seconds
  };

  //   connect wallet function
  async function connectWallet() {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await new ethers.BrowserProvider(
        window.ethereum
      ).getSigner();
      console.log("Signer:", signer);
      setWalletConnected(true);
      //   alert(`Wallet connected successfully! account of ${signer.address}`);
      return signer;
    } else {
      setWalletConnected(false);
      console.error("MetaMask is not installed");
    }
  }

  //   tip project function
  async function tipProject() {
    if (!tipContract) return;
    if (!tipAmount) {
      alert("Please enter a valid tip amount.");
      return;
    }
    try {
      const signer = await connectWallet();
      const contract = new ethers.Contract(
        tipContract,
        TipJarCreatedContractABI,
        signer
      );

      contract.on("Tipped", (sender, value, message, event) => {
        console.log(
          `${sender} sent ${value}eth to you and here is the message "${message}`
        );
        contract.removeListener("Tipped");
      });

      const tx = await contract.tip("sent you some donations", {
        value: ethers.parseEther("1.0"),
      });

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      alert(`Tipped ${tipAmount} successfully!`);
      setShowPopup(false); // Close popup after tipping
      console.log("Transaction receipt:", receipt);
    } catch (error) {
      if (error.code === "INSUFFICIENT_FUNDS") {
        alert("Insufficient funds for the transaction.");
      } else if (error.code === "NETWORK_ERROR") {
        alert("Network error. Please check your connection.");
      } else {
        alert(`Transaction failed: ${error.message}`);
      }
      console.error("Transaction Error:", error);
    }
  }

  const handleConnectWallet = () => {
    connectWallet();
  };

  const handleTipProject = () => {
    tipProject();
  };

  return (
    <>
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
      <div className={styles.project}>
        <div className={styles.project_card}>
          <h1 className={styles.project_name}>{project.projectName}</h1>
          <img
            src={project.image}
            alt={`${project.projectName} logo`}
            className={styles.project_image}
          />
          <div className={styles.project_links}>
            <Link
              href={`/${project.githubLink}`}
              className={styles.project_github}
            >
              GitHub
            </Link>
            <Link href={`/${project.docs}`} className={styles.project_docs}>
              Docs
            </Link>
            <Link
              href={`/${project.website}`}
              className={styles.project_website}
            >
              Website
            </Link>
            <Link
              href={`/${project.twitter}`}
              className={styles.project_twitter}
            >
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="20"
                viewBox="0 0 251 256"
              >
                <path d="M149.079 108.399L242.33 0h-22.098l-80.97 94.12L74.59 0H0l97.796 142.328L0 256h22.1l85.507-99.395L175.905 256h74.59L149.073 108.399zM118.81 143.58l-9.909-14.172l-78.84-112.773h33.943l63.625 91.011l9.909 14.173l82.705 118.3H186.3l-67.49-96.533z" />
              </svg>
            </Link>
          </div>
          <p className={styles.project_description}>{project.description}</p>
          <p className={styles.project_category}>
            Category: {project.category.join(", ")}
          </p>
          <p className={styles.project_programming_language}>
            Programming Languages: {project.programming_language.join(", ")}
          </p>
          <button className={styles.tip_btn} onClick={() => setShowPopup(true)}>
            Tip project
          </button>
        </div>

        <div className={styles.funders}>
          <h2>Funders</h2>
          <div className={styles.funders_list}>
            <div className={styles.funder_container}>
              {project.funders.map((funder, index) => (
                <div key={index} className={styles.funder_item}>
                  <p>{funder}</p>
                  <a
                    href={`https://etherscan.io/address/${funder}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.transaction_btn}
                  >
                    View Transaction
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        {showPopup && (
          <div className={styles.popup}>
            <div className={styles.popup_content}>
              <button
                className={styles.close_btn}
                onClick={() => setShowPopup(false)}
              >
                &times;
              </button>
              <h2>Tip {project.projectName}</h2>
              <img
                src="https://via.placeholder.com/150" // Replace with QR code generation
                alt="QR Code"
                className={styles.qr_code}
              />
              <p>Contract Address:</p>
              <p className={styles.contract_address}>{project.walletAddress}</p>
              <button className={styles.copy_btn} onClick={handleCopyAddress}>
                Copy Address
              </button>
              {copySuccess && <p className={styles.copy_feedback}>Copied!</p>}
              <input
                type="number"
                placeholder="Enter tip amount"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                className={styles.tip_input}
              />
              {!walletConnected ? (
                <button
                  className={styles.wallet_btn}
                  onClick={handleConnectWallet}
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  className={styles.tip_project_btn}
                  onClick={handleTipProject}
                >
                  Tip Project
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
