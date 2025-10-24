import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Heading,
  Input,
  Link,
  Logo,
  Modal,
  Text,
  ThemeSwitch,
} from "@stellar/design-system";
import { useQueryClient } from "@tanstack/react-query";

import { NetworkSelector } from "@/component/NetworkSelector";
import { SelectAccount } from "@/component/SelectAccount.tsx";

import { getPublicKeyError } from "@/helper/validation.ts";
import { useGetSignerAccounts } from "@/query/useGetSignerAccounts";
import { useRevokeAccount } from "@/query/useRevokeAccount";

import type { NetworkId } from "@/types/types";

export const Revoke = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>("mainnet");

  const [publicKey, setPublicKey] = useState("");
  const [publicKeyError, setPublicKeyError] = useState("");

  const [selectedAccount, setSelectedAccount] = useState("");
  const [masterSecretKey, setMasterSecretKey] = useState("");

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

  const queryClient = useQueryClient();

  const resetQuery = useCallback(() => {
    queryClient.resetQueries({
      queryKey: ["useGetSignerAccounts", "useRevokeAccount"],
    });
  }, [queryClient]);

  const {
    data: signerAccounts,
    error: singerAccountsError,
    isLoading: isSignerAccountsLoading,
    isFetching: isSignerAccountsFetching,
    refetch: fetchSignerAccounts,
  } = useGetSignerAccounts({
    publicKey,
    networkId: selectedNetwork,
  });

  const {
    isSuccess: isRevokeSuccess,
    error: revokeError,
    isLoading: isRevokeLoading,
    isFetching: isRevokeFetching,
    refetch: revokeAccount,
  } = useRevokeAccount({
    secretKey: masterSecretKey,
    accountId: selectedAccount,
    networkId: selectedNetwork,
  });

  const revokeErrorMessage = revokeError?.message || revokeError?.toString();

  useEffect(() => {
    if (isRevokeSuccess) {
      fetchSignerAccounts().then(() => {
        setSelectedAccount("");
        setMasterSecretKey("");
        setIsSuccessModalVisible(true);
      });

      resetQuery();
    }
  }, [fetchSignerAccounts, isRevokeSuccess, resetQuery]);

  useEffect(() => {
    if (revokeError) {
      setIsErrorModalVisible(true);
      setMasterSecretKey("");
    }
  }, [queryClient, revokeError]);

  const closeRevokeModal = () => {
    setIsConfirmModalVisible(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
  };

  const closeErrorModal = () => {
    setIsErrorModalVisible(false);
  };

  return (
    <div className="StellarApp">
      {/* Header */}
      <div className="StellarApp__header">
        <div className="StellarApp__logo">
          <Logo.Stellar />
        </div>

        <ThemeSwitch storageKeyId="stellar-tools-theme" />
      </div>

      {/* Content */}
      <div className="StellarApp__body">
        <div className="StellarApp__content">
          <div className="StellarApp__section">
            <Heading as="h1" size="xs">
              Emergency SDP host access revocation
            </Heading>

            <Text as="p" size="sm">
              Use your master public key to revoke your SDP host’s access to
              your SDP distribution account in case of an emergency. After
              revocation, your funds will remain secure and accessible through
              your master key.{" "}
              <strong>
                This action is irreversible, and the host will not be able to
                restore their access to the account.
              </strong>
            </Text>
          </div>

          {/* Network selector */}
          <NetworkSelector
            selectedNetworkId={selectedNetwork}
            onSelect={setSelectedNetwork}
          />

          {/* Input form */}
          <Card>
            <form
              className="StellarApp__section"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                id="sa-public-key"
                fieldSize="lg"
                label="Enter your master public key to see all keys over which it has signing privileges"
                placeholder="Enter master public key"
                value={publicKey}
                onChange={(e) => {
                  if (signerAccounts) {
                    resetQuery();
                    setSelectedAccount("");
                    setMasterSecretKey("");
                  }

                  const val = e.target.value;
                  const error = getPublicKeyError(val);

                  setPublicKey(val);
                  setPublicKeyError(error);
                }}
                error={publicKeyError}
              />

              {singerAccountsError?.message ? (
                <Text as="div" size="sm" addlClassName="StellarApp--error">
                  {singerAccountsError.message}
                </Text>
              ) : null}

              <Button
                type="submit"
                size="md"
                variant="secondary"
                disabled={!publicKey || Boolean(publicKeyError)}
                isLoading={isSignerAccountsLoading || isSignerAccountsFetching}
                onClick={async () => {
                  await fetchSignerAccounts();
                }}
              >
                Check account
              </Button>
            </form>
          </Card>

          {/* Results */}
          {signerAccounts && signerAccounts.length === 0 ? (
            <Card>
              <div className="StellarApp__section">
                <Text as="h2" size="lg">
                  No result found
                </Text>

                <Text as="p" size="sm">
                  We couldn’t find any other accounts over which your "master"
                  public key has signing privileges.
                </Text>
              </div>
            </Card>
          ) : null}

          {signerAccounts && signerAccounts.length > 0 ? (
            <Card>
              <div className="StellarApp__section">
                <Text as="h2" size="lg">
                  {`${signerAccounts.length} ${signerAccounts.length === 1 ? "account" : "accounts"} found`}
                </Text>

                <Text as="p" size="sm">
                  Select an account below to permanently revoke access. This
                  means the account will no longer be able to sign transactions
                  on its own behalf. Any actions for that account must be
                  initiated and signed by your master key.
                </Text>

                {signerAccounts.map((a) => (
                  <SelectAccount
                    key={a}
                    publicKey={a}
                    networkId={selectedNetwork}
                    isSelected={selectedAccount === a}
                    isDisabled={Boolean(
                      selectedAccount && selectedAccount !== a,
                    )}
                    isLoading={isRevokeLoading || isRevokeFetching}
                    isError={Boolean(revokeError)}
                    onSelect={() => {
                      setSelectedAccount(a);
                    }}
                    onClose={() => {
                      setSelectedAccount("");
                      setMasterSecretKey("");
                    }}
                    onRevoke={(masterSecretKey) => {
                      setIsConfirmModalVisible(true);
                      setMasterSecretKey(masterSecretKey);
                    }}
                  />
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="StellarApp__footer">
        <Link
          href="https://www.stellar.org/privacy-policy"
          variant="secondary"
          size="sm"
        >
          Privacy Policy
        </Link>
        <Link
          href="https://www.stellar.org/terms-of-service"
          variant="secondary"
          size="sm"
        >
          Terms of Service
        </Link>
      </div>

      {/* Modals */}
      <Modal visible={isConfirmModalVisible} onClose={closeRevokeModal}>
        <Modal.Heading>Are you sure you want to revoke access?</Modal.Heading>
        <Modal.Body>
          <Text as="p" size="sm">
            This action is irreversible. Your SDP host will not be able to
            restore their access to your account once permissions are revoked.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="tertiary" size="md" onClick={closeRevokeModal}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="md"
            onClick={() => {
              revokeAccount();
              closeRevokeModal();
            }}
          >
            Revoke access
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal visible={isSuccessModalVisible} onClose={closeSuccessModal}>
        <Modal.Heading>Key removed successfully</Modal.Heading>
        <Modal.Body>
          <Text as="p" size="sm">
            You may now close this page, or continue to remove additional keys
            if needed.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="tertiary" size="md" onClick={closeSuccessModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal visible={isErrorModalVisible} onClose={closeErrorModal}>
        <Modal.Heading>Something went wrong</Modal.Heading>
        <Modal.Body>
          <div>
            <Text as="div" size="sm">
              We couldn’t revoke your account access. Please try again.
            </Text>

            {revokeErrorMessage ? (
              <Text as="div" size="sm">{`Error: ${revokeErrorMessage}`}</Text>
            ) : null}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="tertiary" size="md" onClick={closeErrorModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
