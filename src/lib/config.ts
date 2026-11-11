/**
 * ARRA release configuration — the ONLY module that binds the app to a
 * network and a deployed contract.
 *
 * Rotating the deployment address:
 *   1. Preferred: build with  VITE_ARRA_CONTRACT=0x... npm run build
 *      (deploy/deployScript.ts writes .env.local automatically).
 *   2. Or change the single ARRA_CONTRACT fallback constant below.
 *
 * Everything else in the app imports from here; no other file may hardcode
 * an address, chain ID or RPC endpoint. docs/CONFIGURATION.md has the full
 * procedure, and scripts/check_release.py verifies the wiring.
 */

export const CHAIN_ID = 61999;
export const CHAIN_HEX = "0x" + CHAIN_ID.toString(16);
export const RPC = "https://studio.genlayer.com/api";
export const EXPLORER = "https://explorer-studio.genlayer.com";

/** Fallback canonical address (release 1.1.0-studionet). */
const ARRA_CONTRACT = "0x8738E2B7660775eD3737BF2c692E6a26b5043d33";

const envContract = (import.meta as any).env?.VITE_ARRA_CONTRACT as string | undefined;

export const CONTRACT_ADDRESS =
  envContract && /^0x[0-9a-fA-F]{40}$/.test(envContract) ? envContract : ARRA_CONTRACT;

export const IS_DEPLOYED = /^0x(?!0{40})[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS);

export const NETWORK = {
  chainId: CHAIN_HEX,
  chainName: "GenLayer Studionet",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: [RPC],
  blockExplorerUrls: [EXPLORER],
};

export function addressExplorer(address: string): string {
  return `${EXPLORER}/address/${address}`;
}

export function txExplorer(hash: string): string {
  return `${EXPLORER}/tx/${hash}`;
}

export function assertReleaseConfig(): void {
  const envId = Number((import.meta as any).env?.VITE_GENLAYER_CHAIN_ID || CHAIN_ID);
  const envRpc = ((import.meta as any).env?.VITE_GENLAYER_RPC_URL as string | undefined) || RPC;
  if (envId !== CHAIN_ID || envRpc !== RPC) {
    throw new Error("ARRA is locked to Studionet 61999 / studio.genlayer.com/api");
  }
}
