import { Web3Storage } from "web3.storage";
import {File} from '@web-std/file';
import axios from 'axios';
const FormDataa = require("form-data");

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;


const storeContract = async (obj) => {

  const formData = new FormData();

  const fmDx = new FormDataa();

  const blob = new Blob([JSON.stringify(obj)], { type: "application/json", name: "contract.json" });
  
  formData.append("file", blob);

  const pinataMetadata = JSON.stringify({
    name: "contract.json",
  });

  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", pinataOptions);

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${fmDx.getBoundary()}`,
          Authorization: `Bearer ${JWT}`,
        },
      }
    );


    return response?.data?.IpfsHash;

    
  } catch (error) {
    console.error(error);
    throw error;
  }  
};

export default storeContract
