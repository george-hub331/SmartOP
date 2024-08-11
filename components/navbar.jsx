import React from "react";
import { useRouter } from "next/router";
import CustomButton from "./customButton";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";

const Navbar = () => {
  const router = useRouter();

  const { isConnected, address } = useAccount();

  return (
    <div className="w-screen bg-gradient-to-br from-gray-50 via-sky-50 to-slate-50">
      <div className="flex px-10 pt-3 pb-1 justify-between align-middle">
        <p
          onClick={() => router.push("/")}
          className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 text-4xl cursor-pointer"
        >
          SmartOP
        </p>
        {isConnected ? (
          <div className="flex justify-evenly w-1/2 mt-3">
            <p
              onClick={() => router.push("/explorer")}
              className="text-2xl text-blue-600 before:content-[''] before:absolute before:block before:w-full before:h-[2px] 
                    before:bottom-0 before:left-0 before:bg-blue-600 cursor-pointer
                    before:hover:scale-x-100 before:scale-x-0 before:origin-top-left
                    before:transition before:ease-in-out before:duration-300 block relative"
            >
              Explorer
            </p>
            <p
              onClick={() => router.push("/deployer")}
              className="text-2xl text-blue-600 before:content-[''] before:absolute before:block before:w-full before:h-[2px] 
                    before:bottom-0 before:left-0 before:bg-blue-600 cursor-pointer
                    before:hover:scale-x-100 before:scale-x-0 before:origin-top-left
                    before:transition before:ease-in-out before:duration-300 block relative"
            >
              Deployer
            </p>
            <p
              onClick={() => router.push("/verifier")}
              className="text-2xl text-blue-600 before:content-[''] before:absolute before:block before:w-full before:h-[2px] 
                    before:bottom-0 before:left-0 before:bg-blue-600 cursor-pointer
                    before:hover:scale-x-100 before:scale-x-0 before:origin-top-left
                    before:transition before:ease-in-out before:duration-300 block relative"
            >
              Verifier
            </p>
          </div>
        ) : (
          <div></div>
        )}
        <CustomButton />
      </div>
    </div>
  );
};

// export default Navbar;
export default dynamic(() => Promise.resolve(Navbar), { ssr: false });
