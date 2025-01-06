import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MockData } from "@/components/MockData";
import styles from "@/styles/profile.module.css";
import { signIn, signOut, useSession } from "next-auth/react";
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
  const { data: session } = useSession();
  const [user, setUser] = useState(null); // Store user details
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Simulate login state

  const [bio, setBio] = useState("This is your bio. Click edit to change it."); // Default bio
  const [github, setGithub] = useState(user?.github || "");
  const [docs, setDocs] = useState(user?.docs || "");
  const [twitter, setTwitter] = useState(user?.twitter || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [other, setOther] = useState(user?.other || "");
  const [category, setCategory] = useState(user?.category || "");
  const [programmingLanguage, setProgrammingLanguage] = useState(
    user?.programmingLanguage || ""
  );
  const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
  const [copySuccess, setCopySuccess] = useState(false);

  const userId = params?.userId || params?.email; // Handle dynamic routing
  console.log(userId);

  const handleShareClick = () => {
    copyToClipboard();
  };

  const copyToClipboard = () => {
   //const link = window.location.href; // Use the current page URL or your desired link
    const link = `http://localhost:3000/project/${userId?.id}`; // Use the current page URL or your desired link
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Hide "Copied!" after 2 seconds
    });
  };

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
        balanceOf();
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes logic (e.g., update the backend)
      console.log({
        bio,
        github,
        docs,
        twitter,
        website,
        other,
        category,
        programmingLanguage,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    // Reset fields to original values
    setBio(user?.bio || "");
    setGithub(user?.github || "");
    setDocs(user?.docs || "");
    setTwitter(user?.twitter || "");
    setWebsite(user?.website || "");
    setOther(user?.other || "");
    setCategory(user?.category || "");
    setProgrammingLanguage(user?.programmingLanguage || "");
    setIsEditing(false);
  };

  if (!session) {
    router.push("/");
  }

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
          <div className={styles.bio_section}>
            {isEditing ? (
              <div>
                <textarea
                  className={styles.bio_textarea}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Add your bio here..."
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="GitHub Link"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Docs Link"
                  value={docs}
                  onChange={(e) => setDocs(e.target.value)}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Twitter Handle"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Other"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Programming Language"
                  value={programmingLanguage}
                  onChange={(e) => setProgrammingLanguage(e.target.value)}
                />
                <div>
                  <button
                    className={styles.save_btn}
                    onClick={handleEditToggle}
                  >
                    Save
                  </button>
                  <button className={styles.cancel_btn} onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.profile_detail}>
                <p className={styles.bio_text}>{bio || "No bio available."}</p>
                <p className={styles.bio_text}>
                  GitHub: {github || "Not provided"}
                </p>
                <p className={styles.bio_text}>
                  Docs: {docs || "Not provided"}
                </p>
                <p className={styles.bio_text}>
                  Twitter: {twitter || "Not provided"}
                </p>
                <p className={styles.bio_text}>
                  Website: {website || "Not provided"}
                </p>
                <p className={styles.bio_text}>
                  Other: {other || "Not provided"}
                </p>
                <p className={styles.bio_text}>
                  Category: {category || "Not provided"}
                </p>
                <p className={styles.bio_text}>
                  Programming Language: {programmingLanguage || "Not provided"}
                </p>
                <button className={styles.edit_btn} onClick={handleEditToggle}>
                  Edit
                </button>
              </div>
            )}
          </div>

          {tipContract ? (
            <div>
              <p style={{ width: "100%" }}>
                <strong style={{ fontSize: "16px" }}>owners Address:</strong>{" "}
                {user.walletAddress}
              </p>
              <p className={styles.balance}>balance: {balance}</p>
            </div>
          ) : (
            <div></div>
          )}
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
        {copySuccess && <p className={styles.copy_feedback}>Copied!</p>}
        <div className={styles.btn_action}>
          {" "}
          <button className={styles.share_btn} onClick={handleShareClick}>
            Share Folio
          </button>
          <button className={styles.sign_btn} onClick={() => signOut()}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
