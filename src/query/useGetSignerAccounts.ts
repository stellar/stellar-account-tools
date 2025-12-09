import { useQuery } from "@tanstack/react-query";
import { Horizon } from "@stellar/stellar-sdk";
import type { NetworkId } from "@/types/types";

export const useGetSignerAccounts = ({
  publicKey,
  networkId,
}: {
  publicKey: string;
  networkId: NetworkId;
}) => {
  return useQuery({
    queryKey: ["useGetSignerAccounts", publicKey],
    queryFn: async () => {
      if (!(publicKey && networkId)) {
        throw new Error("Public key and network are required.");
      }

      const server = new Horizon.Server(
        networkId === "mainnet"
          ? "https://horizon.stellar.org"
          : "https://horizon-testnet.stellar.org",
      );

      try {
        const response = await server.accounts().forSigner(publicKey).call();

        // Get accounts, excluding master public key
        const accounts = response.records.filter((a) => a.id !== publicKey);

        // Return only account IDs (we don’t need any other data)
        return accounts.reduce((res, cur) => {
          // Filter out accounts that have 0 signer weight (revoked access)
          const signerAccount = cur.signers.find((s) => s.key === cur.id);

          if (signerAccount && signerAccount.weight > 0) {
            return [...res, cur.id];
          }

          return res;
        }, [] as string[]);
      } catch (e) {
        throw new Error(`Failed to check public key: ${e}.`);
      }
    },
    enabled: false,
  });
};
