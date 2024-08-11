import { explorerLink } from "../constants/constants";
// import { argType, functionType } from "../functionality/analyzeABI";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import {
  decodeErrorResult,
  decodeFunctionResult,
  encodeFunctionData,
} from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

const ReturnedFunction = (props) => {
  const [inputs, setInputs] = useState();
  const [argInputs, setArgInputs] = useState([]);
  const [value, setValue] = useState("0");
  const [argOutputs, setArgOutputs] = useState([]);
  const [outputs, setOutputs] = useState();
  const [ifPayable, setIfPayable] = useState(false);
  const [txData, setTxData] = useState();
  const [txLink, setTxLink] = useState();
  const data = props.functionData;
  const contractAddress = props.contractAddress;

  const { address, isConnected } = useAccount();
  const provider = usePublicClient();
  const { data: signer } = useWalletClient();

  async function handle() {
    // console.log(data);
    setInputs(data.inputs);
    setOutputs(data.outputs);
    if (data.stateMutability) {
      const payable = data.stateMutability == "payable" ? true : false;
      setIfPayable(payable);
    }
  }
  async function handleSubmit() {
    // const abiInterface = new ethers.Interface([data]);

    // const encodedData = abiInterface.encodeFunctionData(
    //   `${data.name}`,
    //   argInputs
    // );

    const encodedData = encodeFunctionData({
      abi: [data],
      functionName: data.name,
      args: argInputs,
    });

    /// Also sending the value if the function is payable
    const tx = {
      to: contractAddress,
      data: encodedData,
      value: value ? ethers.parseEther(value) : 0,
    };

    let txRes;

    try {
      if (data.stateMutability == "view") {
        // read tx
        txRes = await provider.call(tx);
        console.log(txRes);

        // const decoded = abiInterface.decodeFunctionResult(
        //   `${data.name}`,
        //   txRes
        // );

        const decoded = decodeFunctionResult({
          abi: [data],
          functionName: data.name,
          data: txRes,
        });

        /// Error handling not checked

        console.log(decoded);

        if (!decoded) {
          console.log("No Output recieved");
          return;
        }

        // output Formatting needs to be done
        let formattedOutput;

        if (Array.isArray(decoded)) {
          setArgOutputs(decoded);
          return;
        } else {
          //setting the inddividual
          /// for int
          // formattedOutput = parseInt(decoded);
          console.log(formattedOutput);

          /// for Address , String
          // formattedOutput = decoded;

          // pushing the results
          let currOutput = argOutputs;
          currOutput?.push(formattedOutput);
          setArgOutputs(currOutput);
        }

        // results not showing up on the page on the first reload
      } else if (data.stateMutability != "view") {
        // send write transaction
        const txRes = await signer.sendTransaction(tx);

        console.log(txRes);

        const txLink = `${explorerLink}/tx/${txRes}`;

        console.log(`Tx completed with the link ${txLink}`);
        //// show the tx data in the frontend
        setTxData(txRes);
      }
    } catch (error) {
      console.log(error);

      /// alert user with the error display on the page

      const decoded = decodeErrorResult({
        abi: [data],
        data: error,
      });
      console.log(decoded);
    }
  }

  async function handleInput(inputvalue, key) {
    let currInput = argInputs;
    currInput[key] = inputvalue;
    setArgInputs(currInput);
  }

  async function handleOutputs() {
    console.log(argOutputs);
    let currOutput = argOutputs;
    outputs?.map((output, key) => {
      if (output.type == "uint256") {
        const formattedOuput = parseInt(currOutput[key]);
      }
    });
  }

  function handleOutput(output, argValue) {
    if (argValue == undefined) return "Nan";
    if (output.type == "uint256") {
      return parseInt(argValue);
    } else if (output.type == "address") {
      return `${argValue.slice(0, 5)}..${argValue.slice(-5)}`;
    } else if (output.type == "bool") {
      if (argValue) {
        return "true";
      } else {
        return "false";
      }
    } else {
      return argValue;
    }
  }

  useEffect(() => {
    handle();
  }, []);

  return (
    <div className="flex flex-col justify-around w-[318px] h-[320px] pb-5 px-8 border border-black bg-white text-black rounded-xl">
      <h4 className="text-black text-xl py-2">{data.name}</h4>
      {ifPayable && (
        <>
          <p className="text-indigo-500 text-m py-2">Payable</p>
          <input
            onChange={(e) => setValue(e.target.value)}
            placeholder=""
            className="px-2 py-1 mb-4 bg-white text-black outline-none rounded-xl border border-black"
          />
        </>
      )}
      {inputs &&
        inputs.map((input, key) => {
          return (
            <input
              key={key}
              onChange={(e) => handleInput(e.target.value, key)}
              placeholder={input.name}
              className="px-2 py-1 mb-4 bg-white text-black outline-none rounded-xl border border-black"
            />
          );
        })}
      <div className="flex items-center justify-center">
        <button
          onClick={() => handleSubmit()}
          className="bg-gradient-to-t from-indigo-400 to-green-400 py-2 px-10 mb-5 rounded-xl"
        >
          Submit
        </button>

        {txLink && <h2>{txLink}</h2>}
      </div>
      {/* returned value */}
      <div className="py-3">
        {/* align the outputs with the name and value
         */}
        {outputs &&
          outputs.map((output, key) => {
            return (
              <div
                key={key}
                className="flex items-center justify-between text-xl"
              >
                <h1 className="text-lg">
                  {output.name ? output.name : "Output :"}
                </h1>
                <h2 className="text-indigo-400">
                  {/* {output.type == "uint256"
                    ? parseInt(argOutputs[key])
                    : argOutputs[key]} */}
                  {handleOutput(output, argOutputs[key])}
                </h2>
              </div>
            );
          })}
        {/* <h2 className="break-all">
          0x7B4A8d0862F049E35078E49F2561630Fac079eB9
        </h2> */}
      </div>
    </div>
  );
};

export default ReturnedFunction;
