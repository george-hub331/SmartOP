import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
const CustomButton = () => {
  const [customChains, setCustomChains] = useState();
  const [isAddNewChain, setIsAddNewChain] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [chainData, setChainData] = useState({
    chainId: "",
    chainName: "",
    currName: "",
    currSymbol: "",
    currDecimals: "",
    rpcURL: "",
  });
  const addNewChain = async (
    chain_Id,
    chain_Name,
    curr_Name,
    curr_Symbol,
    curr_Decimals,
    rpc_URL
  ) => {
    // accept Inputs as form for the new Chain to be added
    let chains = localStorage.getItem("chains");
    const newChain = {
      chain_Id: chain_Id,
      chain_Name: chain_Name,
      nativeCurrency: {
        name: curr_Name,
        symbol: curr_Symbol,
        decimals: curr_Decimals,
      },
      rpcUrls: [rpc_URL],
    };

    if (chains) {
      chains.push(newChain);
    } else {
      chains = [newChain];
    }

    localStorage.setItem("chains", chains);

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chain_Id: chain_Id }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [newChain],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  };

  const changeNetwork = async (chainId) => {
    switchNetwork(chainId);
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }],
      });
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts);
    } catch (error) {
      console.log(error);
    }
  };

  const getChains = async () => {
    const chains = await localStorage.getItem("chains");
    console.log(chains);
    setCustomChains(chains);
  };

  useEffect(() => {
    getChains();
  }, []);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-10 py-2 rounded-2xl border text-xl border-indigo-200 text-indigo-500"
                  >
                    Sign In
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{ display: "flex", alignItems: "center" }}
                    type="button"
                    className="mt-3"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: "hidden",
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>
                 
                  <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Add Custom Chain</ModalHeader>
                      <ModalCloseButton />
                      <div className="mt-6 flex justify-center mx-auto mb-3 px-10 py-2 rounded-2xl border font-bold border-indigo-200 text-indigo-500">
                        <button>Add New Chain</button>
                      </div>
                      <ModalBody>
                        <div className="flex flex-col">
                          <div className="flex flex-col">
                            <p className="font-semibold">Chain Name</p>
                            <input
                              type="text"
                              className="mt-2 px-3 py-1 border border-black rounded-xl"
                            ></input>
                          </div>
                          <div className="flex flex-col mt-4">
                            <p className="font-semibold">Chain ID</p>
                            <input
                              type="text"
                              className="mt-2 px-3 py-1 border border-black rounded-xl"
                            ></input>
                          </div>
                          <div className="flex flex-col mt-4">
                            <p className="font-semibold">Chain RPC Url</p>
                            <input
                              type="text"
                              className="mt-2 px-3 py-1 border border-black rounded-xl"
                            ></input>
                          </div>
                          <div className="flex flex-col mt-4">
                            <p className="font-semibold">Currency Name</p>
                            <input
                              type="text"
                              className="mt-2 px-3 py-1 border border-black rounded-xl"
                            ></input>
                          </div>
                          <div className="flex flex-col mt-4">
                            <p className="font-semibold">
                              Currency Symbol (Optional)
                            </p>
                            <input
                              type="text"
                              className="mt-2 px-3 py-1 border border-black rounded-xl"
                            ></input>
                          </div>
                          <div className="mt-6 flex justify-center mx-auto mb-3 px-10 py-2 rounded-2xl border font-bold border-indigo-200 text-indigo-500">
                            <button>Add Chain</button>
                          </div>
                        </div>
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                  <button onClick={openAccountModal}>
                    {/* {account.displayName} */}
                    {/* {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""} */}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default CustomButton;
