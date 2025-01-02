import Head from "next/head";
import { ethers } from "ethers";
import { useState } from "react";
import styles from "@/styles/Home.module.css";
import Header from "@/components/Header";
import Projects from "@/components/Projects";

export default function Home() {

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
