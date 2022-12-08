import { mnemonicGenerate, cryptoWaitReady } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/keyring";
import fs from "fs";
import { generateDidDocument } from "./generate-did.js";
import { getNetworkApi, getPeaqKeyPair } from "./utils.js";
import { networks } from "./constants.js";
import os from "os";

const controller = "5EsRqVnHsJLMGZMExqZ3QmBdQG4xQ2oUtnVh7in6CHcE51KE";

const generateKeyPair = (mnemonic) => {
  const keyring = new Keyring({ type: "sr25519" });
  const pair = keyring.addFromUri(mnemonic);
  return pair;
};

const getMachineKeyPair = async () => {
  console.log("Fetching machine key pair from seed.txt...");
  if (fs.existsSync("seed.txt")) {
    const seed = fs.readFileSync("seed.txt", "utf8");
    if (seed) return generateKeyPair(seed);
  }

  console.log("No seed found, generating new key pair...");
  const mnemonic = mnemonicGenerate();

  const pair = generateKeyPair(mnemonic);
  fs.writeFileSync("seed.txt", mnemonic);
  console.log("New key pair generated and saved to seed.txt");
  return pair;
};

const callDIDPallet = async (address, didDocumentHash) => {
  try {
    const api = await getNetworkApi(networks.PEAQ);

    const data = api.tx.peaqDid
      .addAttribute(address, os.hostname(), didDocumentHash, "")
      .signAndSend(getPeaqKeyPair(), ({ status, events, dispatchError }) => {
        // status would still be set, but in the case of error we can shortcut
        // to just check it (so an error would indicate InBlock or Finalized)
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, name, section } = decoded;

            console.log(`${section}.${name}: ${docs.join(" ")}`);
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            // toast.error(dispatchError.toString())
          }
          console.log(
            "---------DID document failed to save to network!----------"
          );
          // process.exit(1);
        }
        console.log("---------DID document saved to network!----------");

        // process.exit(0);
      });

    return data;
  } catch (error) {
    console.log("===await SUB_API.tx.peaqDid.addAttribute==error===", error);
  }
};

const main = async () => {
  await cryptoWaitReady();
  const pair = await getMachineKeyPair();
  console.log("Machine address:", pair.address);

  console.log("Generating DID document...");
  const did = generateDidDocument(controller, pair.address);

  console.log("DID document generated:", did);

  console.log("Calling DID pallet...");
  await callDIDPallet(pair.address, did);
  console.log("---------Network call complete!----------");
};

main();
