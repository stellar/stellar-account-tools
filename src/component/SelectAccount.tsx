import { useEffect, useState } from "react";
import {
  Button,
  Icon,
  IconButton,
  Input,
  Link,
  Text,
} from "@stellar/design-system";
import { getSecretKeyError } from "@/helper/validation";
import type { NetworkId } from "@/types/types";

export const SelectAccount = ({
  publicKey,
  networkId,
  isSelected,
  isDisabled,
  isLoading,
  isError,
  onSelect,
  onClose,
  onRevoke,
}: {
  publicKey: string;
  networkId: NetworkId;
  isSelected: boolean;
  isDisabled: boolean;
  isLoading: boolean;
  isError: boolean;
  onSelect: () => void;
  onClose: () => void;
  onRevoke: (masterSecretKey: string) => void;
}) => {
  const [masterSecretKey, setMasterSecretKey] = useState("");
  const [masterSecretKeyError, setMasterSecretKeyError] = useState("");

  useEffect(() => {
    if (!isSelected) {
      setMasterSecretKey("");
      setMasterSecretKeyError("");
    }
  }, [isSelected]);

  useEffect(() => {
    if (isError) {
      setMasterSecretKey("");
    }
  }, [isError]);

  const AccountPublicKey = () => (
    <div className="StellarApp__selectAccount__key">
      <Icon.Key01 />
      <Text as="span" size="sm" weight="medium" title={publicKey}>
        {publicKey}
      </Text>
    </div>
  );

  if (isSelected) {
    return (
      <div className="StellarApp__selectAccount" data-is-selected="true">
        <div className="StellarApp__selectAccount__header">
          <AccountPublicKey />
          <IconButton icon={<Icon.X />} altText="Close" onClick={onClose} />
        </div>

        <div className="StellarApp__selectAccount__form">
          <form onSubmit={(e) => e.preventDefault()}>
            <Input
              id="sa-master-key"
              fieldSize="md"
              placeholder={`Enter your “master” secret key to revoke this key’s permission. `}
              value={masterSecretKey}
              onChange={(e) => {
                const val = e.target.value;
                const error = getSecretKeyError(val);

                setMasterSecretKey(val);
                setMasterSecretKeyError(error);
              }}
              error={masterSecretKeyError}
              autoComplete="off"
              isPassword={true}
              disabled={isLoading}
            />
            <Button
              variant="secondary"
              size="md"
              disabled={Boolean(!masterSecretKey || masterSecretKeyError)}
              onClick={() => onRevoke(masterSecretKey)}
              isLoading={isLoading}
            >
              Revoke access
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="StellarApp__selectAccount">
      <AccountPublicKey />

      <Link
        href={`https://stellar.expert/explorer/${networkId === "mainnet" ? "public" : "testnet"}/account/${publicKey}`}
        size="sm"
        icon={<Icon.LinkExternal01 />}
        variant="primary"
      ></Link>

      <Button
        variant="tertiary"
        size="md"
        onClick={onSelect}
        disabled={isDisabled}
      >
        Select
      </Button>
    </div>
  );
};
