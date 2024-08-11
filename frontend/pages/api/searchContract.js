import { Registery_ABI, Registery_address } from "@/constants/constants";
const RPC_LINK = process.env.NEXT_PUBLIC_RPC_URL;

import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import {
  addNewContractRecord,
  getContractRecord,
} from "../../firebase/methods";

// GET

// Response from the API
// type contractDataType = {
//   name: string,
//   address: string,
//   deployer: string,
//   abi: any[],
//   bytecode: string,
//   code: any,
// };

async function searchContract(req, res) {
  if (!req.body.contractAddress) {
    return res.status(400).json({ message: "Contract Address required" });
  }

  const address = req.body.contractAddress;

  // const publicClient = createPublicClient({
  //   chain: mainnet,
  //   transport: http(RPC_LINK),
  // });

  try {
    // const data = await publicClient.readContract({
    //   address: Registery_address,
    //   abi: Registery_ABI,
    //   functionName: "getContractRecord",
    //   args: [address],
    // });

    const data = await getContractRecord(`${address}`);

    console.log(data);
    if (!data) {
      console.log("Contract does not exist");
      res
        .status(400)
        .json({ output: "Contract is not verified , verify First" });
    }
    const ipfsURL = data.ipfsURI;
    const contractData = await (await fetch(ipfsURL)).json();

    if (!contractData) {
      res.status(400).json({ output: "Contract data not found " });
    }

    res.status(200).json({ output: contractData });
  } catch (error) {
    res.status(400).json({ output: error });
    console.log(error);
  }
}

export default searchContract;
