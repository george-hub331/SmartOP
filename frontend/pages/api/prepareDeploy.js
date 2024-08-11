// send in the ContractData as

// type contractDataType = {
//   name: string;
//   address: string;
//   deployer: string;
//   abi: any[];
//   bytecode: string;
//   code: any;
//   network: string;
//   chainId: number;
// };

import { Registery_ABI, Registery_address } from "@/constants/constants";
import { storeContract } from "@/functionality/storeData";
import { http, createWalletClient, publicActions } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  addNewContractRecord,
  getContractRecord,
} from "../../firebase/methods";

// POST

const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const RPC_LINK = process.env.NEXT_PUBLIC_RPC_URL;

async function prepareDeploy(req, res) {
  if (!req.body.contractData) {
    return res.status(400).json({ message: "Contract Data required" });
  }

  const contractData = req.body.contractData;

  if (!contractData) {
    return res.status(400).json({ message: "Check contract Data Again" });
  }

  try {
    const CID = await storeContract(contractData);
    const IPFSURL = `https://w3s.link/ipfs/${CID}`;
    const deployLink = `http://localhost:3000/deploy/${CID}`;
    console.log(IPFSURL);
    console.log(deployLink);
    /// Record of the tx with the txHash
    res
      .status(200)
      .json({ ipfsCID: CID, deployLink: deployLink, ipfsURL: IPFSURL });
  } catch (error) {
    res.status(400).json({ output: error });
    console.log(error);
  }
}

export default verifyContract;
