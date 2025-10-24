import { useQuery } from "@tanstack/react-query";
import {
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { NetworkId } from "@/types/types";

export const useRevokeAccount = ({
  accountId,
  secretKey,
  networkId,
}: {
  accountId: string;
  secretKey: string;
  networkId: NetworkId;
}) => {
  return useQuery({
    queryKey: ["useRevokeAccount", accountId],
    queryFn: async () => {
      if (!(accountId && secretKey && networkId)) {
        throw new Error(
          "Master secret key, account ID, and network are required.",
        );
      }

      const server = new Horizon.Server(
        networkId === "mainnet"
          ? "https://horizon.stellar.org"
          : "https://horizon-testnet.stellar.org",
      );

      try {
        const account = await server.loadAccount(accountId);
        const baseFee = await server.fetchBaseFee();

        // Build transaction
        const transaction = new TransactionBuilder(account, {
          fee: baseFee.toString(),
          networkPassphrase:
            networkId === "mainnet" ? Networks.PUBLIC : Networks.TESTNET,
        })
          .addOperation(Operation.setOptions({ masterWeight: 0 }))
          .setTimeout(30)
          .build();

        // Sign transaction
        const keypair = Keypair.fromSecret(secretKey);
        transaction.sign(keypair);

        // Submit transaction
        return await server.submitTransaction(transaction);
      } catch (e) {
        throw new Error(
          `We couldn’t revoke your account access: ${e}. Please try again.`,
        );
      }
    },
    enabled: false,
  });
};
