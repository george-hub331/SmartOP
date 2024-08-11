import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Network options :  base, baseGoerli , mainnet, optimism, optimismGoerli, zora, zoraTestnet,

export const addNewContractRecord = async (
  contractAddress, // in String
  ipfsURI,
  network, // Name
  chainId // Number
) => {
  try {
    const docRef = doc(db, "contractRegistery", `${contractAddress}`);
    await setDoc(docRef, {
      network: network,
      ipfsURI: ipfsURI,
      chainId: chainId,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getContractRecord = async (contractAddress) => {
  try {
    const docRef = doc(db, "contractRegistery", contractAddress);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log("Document data:", docSnap.data());
      console.log(docSnap.data());
      return docSnap.data();
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  } catch (error) {
    console.log(error);
  }
};
