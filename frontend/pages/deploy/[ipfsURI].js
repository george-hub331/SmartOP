import React, { useState, useEffect } from "react";
import { Code } from "@chakra-ui/react";
import ConstructorArguments from "../components/constructorArgs";
import { deploy, deployViaEthers } from "../functionality/deployContract";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { analyzeABI, functionType } from "../functionality/analyzeABI";
import { storeContract } from "../functionality/storeData";
import { Contract, ContractFactory, Wallet, ethers, parseEther } from "ethers";
import { Registery_ABI, Registery_address } from "../constants/constants";
import { explorerLink } from "../constants/constants";
import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import EASService from "../../components/eas";

const Deployer = () => {
  const router = useRouter();
  const { address } = useAccount();
  const provider = usePublicClient();
  const { data: signer } = useWalletClient();
  const { chain } = useNetwork();
  const { chains, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();
  const { ipfsURI } = router.query;

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

  useEffect(() => {
    if (ipfsURI) {
      getContractDetails(ipfsURI);
    }
  }, [ipfsURI]);

  async function getContractDetails(ipfsURI) {
    try {
      const IPFSURL = `https://w3s.link/ipfs/${ipfsURI}`;
      const contractData = await (await fetch(IPFSURL)).json();

      console.log(contractData);
      if (!contractData) {
        toast({
          title: "Contract Data not found",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        // console.log("Contract Data not found");
        return;
      }

      setSourceCode(contractData.code);
      setContractName(contractData.name);

      if (contractData.chainId) {
        switchNetwork(contractData.chainId);
      } else {
        toast({
          title: "Select the Network you want to deploy on",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      }

      setError("Successfully Compiled");
      /// analyze the ABI and show const
      handleABI(formattedResponse.abi);
      setCompiled(true);
      setOutput(contractData);
    } catch (error) {
      console.log(error);
      setError(error);
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
    if (argInputs.length) {
      // contract = await factory.deploy(argInputs, {
      //   value: ethValue ? ethers.utils.parseEther(ethValue) : 0,
      // });
      hash = await signer.deployContract({
        abi: output.abi,
        args: argInputs,
        value: ethValue ? parseEther(ethValue) : 0,
        bytecode: output.bytecode,
      });
    } else {
      // contract = await factory.deploy({
      //   value: ethValue ? ethers.utils.parseEther(ethValue) : 0,
      // });
      hash = await signer.deployContract({
        abi: output.abi,
        value: ethValue ? parseEther(ethValue) : 0,
        bytecode: output.bytecode,
      });
    }

    // console.log(contract);
    console.log(hash);
    const tx = await provider.getTransaction(hash);
    const deployedContractAddress = tx.to; /// -- NEED TO CHECK --
    setContractAddress(deployedContractAddress);
    // const deployTx = contract.deployTransaction;

    const contractLink = `${explorerLink}/contract/${deployedContractAddress}`;

    toast({
      title: "Contract Deployed!!!",
      description: `Contract created with the address Copied to clipboard ${deployedContractAddress}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    navigator.clipboard.writeText(deployedContractAddress);
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
      ...output,
      address: contractAddress,
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
              <textarea className="border border-black w-[700px] rounded-xl px-4 py-2 font-sans h-[500px]"></textarea>
            </div>
            <div className="mt-7 mb-20 flex justify-center mx-auto">
              <button className="px-10 py-1.5 rounded-xl border bg-gradient-to-r from-indigo-400 to-green-400 text-white text-xl hover:scale-110 duration-200">
                Compile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deployer;
