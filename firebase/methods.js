import { getDatabase, ref, set, get, child } from "firebase/database";


// Network options :  base, baseGoerli , mainnet, optimism, optimismGoerli, zora, zoraTestnet,

export const addNewContractRecord = async (
  contractAddress, // in String
  ipfsURI,
  network, // Name
  chainId // Number
) => {
  
  try {

    const db = getDatabase();

    await set(ref(db, `contracts/${contractAddress}`), {
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
    
    const ref = ref(getDatabase());

    const docSnap = await get(child(ref, `contracts/${contractAddress}`));;

    if (docSnap.exists()) {
      // console.log("Document data:", docSnap.data());
      
      return docSnap.data();

    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  } catch (error) {
    console.log(error);
  }
};
