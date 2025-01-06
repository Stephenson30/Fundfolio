import styles from "@/components/styles/header.module.css";
import { signIn, signOut, useSession } from "next-auth/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";

export default function Header({ connectWallet }) {
  const [connectedAddress, setConnectedAddress] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const { data: session } = useSession();

  const connectUser = async () => {
    const connect = await connectWallet();
    setConnectedAddress(connect.address);
  };

  function handleAuthentication() {
    signIn("github");
  }

  return (
    <div className={styles.header}>
      <p className={styles.logo}>FUNDFOLIO</p>
      <div className={styles.connect_section}>
        {session ? (
          <Link href={`/profile/${1}`} className={styles.profile_btn}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd">
                <path d="M16 9a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-2 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0" />
                <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11s11-4.925 11-11S18.075 1 12 1M3 12c0 2.09.713 4.014 1.908 5.542A8.99 8.99 0 0 1 12.065 14a8.98 8.98 0 0 1 7.092 3.458A9 9 0 1 0 3 12m9 9a8.96 8.96 0 0 1-5.672-2.012A6.99 6.99 0 0 1 12.065 16a6.99 6.99 0 0 1 5.689 2.92A8.96 8.96 0 0 1 12 21" />
              </g>
            </svg>
            <p>Profile</p>
          </Link>
        ) : (
          <button className={styles.x} onClick={handleAuthentication}>
            <p>Connect with</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 22v-3q0-2 1-3A7 6.5 0 0 1 5 5Q4 3 5 1q3 0 4 2q3.5-1 7 0q1-2 4-2q1 2 0 4a7 6.5 0 0 1-5 11q1 1 1 3v3m-7-3c-4 1-4-2-7-3"
              />
            </svg>
          </button>
        )}
        <button className={styles.wallet} onClick={connectUser}>
          {connectedAddress
            ? connectedAddress.slice(0, 13) + "..."
            : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}
