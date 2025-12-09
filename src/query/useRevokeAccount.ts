import { useQuery } from "@tanstack/react-query";
import {
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { NetworkId, RevokeAccountError } from "@/types/types";

export const useRevokeAccount = ({
  accountId,
  secretKey,
  networkId,
}: {
  accountId: string;
  secretKey: string;
  networkId: NetworkId;
}) => {
  return useQuery<
    Horizon.HorizonApi.SubmitTransactionResponse,
    RevokeAccountError,
    Horizon.HorizonApi.SubmitTransactionResponse,
    string[]
  >({
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
        throw getHorizonErrorMsg(e);
      }
    },
    enabled: false,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getHorizonErrorMsg = (e: any) => {
  const txErrorCode = e?.response?.data?.extras?.result_codes?.transaction;

  if (txErrorCode === "tx_bad_auth") {
    return {
      title: 'Wrong "master" secret key entered',
      message: 'Please make sure you’re using the correct "master" secret key.',
    };
  }

  return {
    title: "Something went wrong",
    message: e?.message || e.toString(),
  };
};
