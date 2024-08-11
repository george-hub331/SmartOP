import React, { useState, useEffect } from "react";
import { Code } from "@chakra-ui/react";
import ConstructorArguments from "../components/constructorArgs";
import { deploy, deployViaEthers } from "../functionality/deployContract";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useNetwork,
} from "wagmi";
import { analyzeABI, functionType } from "../functionality/analyzeABI";
import { storeContract } from "../functionality/storeData";
import { Contract, ContractFactory, Wallet, ethers, parseEther } from "ethers";
import { Registery_ABI, Registery_address } from "../constants/constants";
import { explorerLink } from "../constants/constants";
import { useToast } from "@chakra-ui/react";

const Deployer = () => {
  const { address } = useAccount();
  const provider = usePublicClient();
  const { data: signer } = useWalletClient();
  const { chain, chains } = useNetwork();

  const toast = useToast();
  const [contractName, setContractName] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [output, setOutput] = useState();
  const [constructorArg, setConstructorArg] = useState();
  const [argInputs, setArgInputs] = useState([]);
  const [ethValue, setEthValue] = useState("");

  const [contractAddress, setContractAddress] = useState("");
  const [error, setError] = useState("");
  const [txLink, setTxLink] = useState("");
  const [compiled, setCompiled] = useState(false);
  const [ipfsLink, setIpfsLink] = useState();

  /// contract with imports have to be managed , not yet handled
  async function handleCompile() {
    if (!sourceCode) {
      toast({
        title: "No source code",
        description:
          "You need to provide source code to perform compilation!!!",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      // console.log("no Source code set");
      return;
    }

    /// For proper handling we can change the API call format
    const response = await fetch("./api/compile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sourceCode }),
    });

    console.log(response);
    const formattedResponse = (await response.json()).output;
    // console.log(formattedResponse, "formatted response");

    if (response.status == 200) {
      setOutput(formattedResponse);
      toast({
        title: "Compilation successfull",
        description:
          "Your code was compiled succesfully, You can deploy your contract now.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      // console.log("Successfully Compiled");
      setError("Successfully Compiled");
      /// analyze the ABI and show const
      handleABI(formattedResponse.abi);

      setCompiled(true);
    } else {
      setError(formattedResponse);
      toast({
        title: "Compilation error",
        description: `${formattedResponse}`,
        status: "error",
        duration: 2700,
        isClosable: true,
      });
    }
  }

  async function handleABI(abi) {
    /// analyze the ABI and show constructors
    const data = await analyzeABI(abi);
    console.log(data?.constructor);
    setConstructorArg(data?.constructor);
  }

  async function handleDeploy() {
    /// checking if the contract is compiled
    if (!output?.bytecode) {
      toast({
        title: "Contract Not Compiled!!!",
        description:
          "Make sure the contract is compiled before proceeding with this process",
        status: "error",
        duration: 2700,
        isClosable: true,
      });
      // console.log("Compile the Contract first");
      setError("Compile the Contract first");
      return;
    }

    /// checking if the contructor has arg
    if (constructorArg[0]?.inputs?.length) {
      console.log(argInputs);
      if (!argInputs) {
        toast({
          title: "No Arguments provided",
          description: `Fill in the constructor arguments in order to deploy this contract`,
          status: "error",
          duration: 2500,
          isClosable: true,
        });
        // console.log("Add the Constructor Arguements")
        setError("Add the Constructor Arguements");
        return;
      }
    }

    console.log("deploying...");
    // toast here
    toast({
      title: "Deploying Contract....",
      description: `Your contract is being deployed`,
      status: "loading",
      duration: 2500,
      isClosable: true,
    });

    // const factory = new ContractFactory(output.abi, output.bytecode, signer);

    let contract;
    let hash;
    //handle args
    console.log(argInputs);
    console.log(output)
    if (argInputs.length) {
      // contract = await factory.deploy(argInputs, {
      //   value: ethValue ? ethers.utils.parseEther(ethValue) : 0,
      // });
      hash = await signer.deployContract({
        abi: output.abi,
        args: argInputs,
        bytecode: output.bytecode,
        account : address,
      });
    } else {
      // contract = await factory.deploy({
      //   value: ethValue ? ethers.utils.parseEther(ethValue) : 0,
      // });
      hash = await signer.deployContract({
        abi: output.abi,
        bytecode: output.bytecode,
        account : address,
      });
    }
    // console.log(contract);
    console.log(hash);
    // const tx = await provider.getTransaction(hash);
    const deployedContractAddress = hash; /// -- NEED TO CHECK --
    setContractAddress(deployedContractAddress);
    // const deployTx = contract.deployTransaction;

    const contractLink = `${explorerLink}/tx/${deployedContractAddress}`;

    toast({
      title: "Contract Deployed!!!",
      description: `Contract created with the address Copied to clipboard ${contractLink}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    navigator.clipboard.writeText(contractLink);
    // console.log(`Contract Created with the address${contractLink}`);

    const txLink = `${explorerLink}/tx/${hash}`;
    console.log(txLink);
    toast({
      title: "Transaction Hash",
      description: `${txLink}`,
      status: "info",
      duration: 5000,
      isClosable: true,
    });
    ///Show the tx
    setTxLink(txLink);
  }

  async function verifyContract() {
    /// store the contract info on the Web3.storage and add the data , CID to a Contract or Web2 Database
    if (!output && !contractAddress) {
      toast({
        title: "Contract Not Compiled OR Deployed!!!",
        description: `This contract is either not deployed or compiled, which is necessary for contract verification`,
        status: "error",
        duration: 2800,
        isClosable: true,
      });
      // console.log("Compile & Deploy the Contract first");
      setError("Compile & Deploy the Contract first");
      return;
    }

    const contractData = {
      name: contractName,
      address: contractAddress,
      deployer: address,
      abi: output?.abi,
      bytecode: output?.bytecode,
      code: sourceCode,
      network: chain.network, /// need to check the network name
      chainId: chain.id,
    };

    toast({
      title: "Uploading to IPFS...",
      status: "loading",
      duration: 2000,
      isClosable: true,
    });

    const response = await fetch("./api/verifyContract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contractData }),
    });

    const formattedResponse = await response.json();

    console.log("IPFSURL", formattedResponse.ipfsURL);

    setIpfsLink(formattedResponse.ipfsURL);
    toast({
      title: "IPFS URL",
      description: `${formattedResponse.ipfsURL}`,
      status: "success",
      duration: 2800,
      isClosable: true,
    });

    toast({
      title: "Adding Contract to Registry",
      status: "loading",
      duration: 2500,
      isClosable: true,
    });
    // await tx.wait();
    // console.log("Record Added in the registery");
    toast({
      title: "Record Added in the Registry",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }

  return (
    <div>
      <div className="w-screen h-full bg-gradient-to-br from-gray-50 via-sky-50 to-slate-50">
        <div className="flex flex-col justify-center mx-auto items-center">
          <div className="mt-24">
            <p className="text-4xl">Deploy Contracts</p>
          </div>
          <div className="mt-14 flex flex-col">
            <div className="flex justify-start">
              <p className="text-xl font-mono">Paste Contract Code Here</p>
            </div>
            <div className="flex mt-6 justify-center mx-auto">
              <textarea
                onChange={(e) => setSourceCode(e.target.value)}
                className="border border-black w-[700px] rounded-xl px-4 py-2 font-sans h-[500px]"
              ></textarea>
              {constructorArg?.length && (
                <ConstructorArguments
                  args={constructorArg}
                  inputs={argInputs}
                  setInputs={setArgInputs}
                  eth={ethValue}
                  setEth={setEthValue}
                />
              )}
            </div>
            <div className="mt-7 mb-20 flex justify-center mx-auto">
              <button
                onClick={() => handleCompile()}
                className="px-10 py-1.5 rounded-xl border bg-gradient-to-r from-indigo-400 to-green-400 text-white text-xl hover:scale-110 duration-200"
              >
                Compile
              </button>
              {compiled && (
                <button
                  onClick={() => handleDeploy()}
                  className="px-10 py-1.5 rounded-xl border bg-gradient-to-r from-indigo-400 to-green-400 text-white text-xl hover:scale-110 duration-200 mx-3"
                >
                  Deploy
                </button>
              )}
              {compiled && (
                <button
                  onClick={() => verifyContract()}
                  className="px-10 py-1.5 rounded-xl border bg-gradient-to-r from-indigo-400 to-green-400 text-white text-xl hover:scale-110 duration-200 mx-3"
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deployer;
