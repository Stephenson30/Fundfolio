import styles from "@/components/styles/header.module.css";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";


export default function Header({connectWallet}) {
  const [connectedAddress, setConnectedAddress] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const connectUser = async () => {
    const connect = await connectWallet();
    setConnectedAddress(connect.address);
  }

  function handleAuthentication() {
    setAuthenticated(true);
  }
  
  return (
    <div className={styles.header}>
      <p className={styles.logo}>FUNDFOLIO</p>
      <div className={styles.connect_section}>
        {
          authenticated? <Link href={`/profile/${1}`} className={styles.profile_btn}>
            <img src="/" alt="profile logo" />
            <p>Profile</p>
          </Link>:
        <button className={styles.x} onClick={handleAuthentication}>
          <p>Connect with</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="24"
            viewBox="0 0 251 256"
          >
            <path d="M149.079 108.399L242.33 0h-22.098l-80.97 94.12L74.59 0H0l97.796 142.328L0 256h22.1l85.507-99.395L175.905 256h74.59L149.073 108.399zM118.81 143.58l-9.909-14.172l-78.84-112.773h33.943l63.625 91.011l9.909 14.173l82.705 118.3H186.3l-67.49-96.533z" />
          </svg>
        </button>
        }
        <button className={styles.wallet} onClick={connectUser}>{connectedAddress?connectedAddress.slice(0,13) + "...": "Connect Wallet"}</button>
      </div>
    </div>
  );
}
