import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import {ethers} from "ethers";

const EASContractAddress = "0x4200000000000000000000000000000000000021";
const EASVersion = "0.26";
const CHAINID = 420;

const SchemaUID =
  "0x00491640b394551b1ae75f42c48fbd53b7eacb17c1430af1a9d3126a2d2e46bb";
const rawSchema =
  "address ContractAddress,string IpfsURI,string Network,uint32 chainID,address DeployerAddress";

const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion, // 0.26
  chainId: CHAINID,
};

class EASService {
  easClient;
  //   offChain;
  signer;

  constructor(signer) {
    /// This Signer is ethers one I think , We might need to switch to Viem and create a different way of attesting
    this.easClient = new EAS(EASContractAddress);
    // this.offchain = new Offchain(EAS_CONFIG, 1);
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = signer;
    console.log(signer);

    this.easClient.connect(signer);
  }

  async getAttestationData(attestationUid) {
    const attestation = await this.easClient.getAttestation(attestationUid);

    console.log(attestation);
    return attestation;
  }

  async createOnChainsAttestations(
    ContractAddress,
    IpfsURI,
    Network,
    chainID,
    DeployerAddress
  ) {
    const schemaEncoder = new SchemaEncoder(rawSchema);
    const encodedData = schemaEncoder.encodeData([
      { name: "ContractAddress", value: ContractAddress, type: "address" },
      { name: "IpfsURI", value: IpfsURI, type: "string" },
      { name: "Network", value: Network, type: "string" },
      { name: "chainID", value: chainID, type: "uint32" },
      { name: "DeployerAddress", value: DeployerAddress, type: "address" },
    ]);

    const address = await this.signer.getAddress();
    console.log(address);
    console.log(this.easClient);

    const tx = await this.easClient.attest({
      schema: SchemaUID,
      data: {
        recipient: address,
        expirationTime: 0,
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);
  }

  // async createOffChainAttestations(
  //   ContractAddress,
  //   IpfsURI,
  //   Network,
  //   chainID,
  //   DeployerAddress
  // ) {
  //   const timestamp = Math.floor(Date.now() / 1000);
  //   console.log(timestamp);
  //   const address = await this.signer.getAddress();
  //   const schemaEncoder = new SchemaEncoder(rawSchema);

  //   const encodedData = schemaEncoder.encodeData([
  //     { name: "ContractAddress", value: ContractAddress, type: "address" },
  //     { name: "IpfsURI", value: IpfsURI, type: "string" },
  //     { name: "Network", value: Network, type: "string" },
  //     { name: "chainID", value: chainID, type: "uint32" },
  //     { name: "DeployerAddress", value: DeployerAddress, type: "address" },
  //   ]);
  //   console.log(encodedData);
  //   const offChainClient = new Offchain(EAS_CONFIG, 1);

  //   const signedoffchainAttestation =
  //     await offChainClient.signOffchainAttestation(
  //       {
  //         recipient: address,
  //         expirationTime: 0,
  //         time: timestamp,
  //         revocable: true,
  //         nonce: 0,
  //         schema: SchemaUID,
  //         version: 1,
  //         refUID:
  //           "0x0000000000000000000000000000000000000000000000000000000000000000",
  //         data: encodedData,
  //       },
  //       this.signer
  //     );
  //   console.log(signedoffchainAttestation);
  //   const uid = signedoffchainAttestation.uid;
  //   const url = await createOffchainURL({
  //     sig: signedoffchainAttestation,
  //     signer: address,
  //   });
  //   console.log(url);
  //   return { url, uid };
  // }
}

export default EASService;
