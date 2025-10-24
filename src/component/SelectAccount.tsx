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

export const SelectAccount = ({
  publicKey,
  isSelected,
  isDisabled,
  isLoading,
  onSelect,
  onClose,
  onRevoke,
}: {
  publicKey: string;
  isSelected: boolean;
  isDisabled: boolean;
  isLoading: boolean;
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
              placeholder="Enter your master secret key to revoke this key’s permission"
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

          <Text
            as="div"
            size="xs"
            addlClassName="StellarApp__selectAccount__warning"
          >
            Be careful when copying your secret key to avoid unnecessary
            exposure
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="StellarApp__selectAccount">
      <AccountPublicKey />

      <Link
        href={`https://stellar.expert/explorer/public/account/${publicKey}`}
        size="sm"
        icon={<Icon.LinkExternal01 />}
        variant="primary"
      ></Link>

      <Button
        variant="tertiary"
        size="sm"
        onClick={onSelect}
        disabled={isDisabled}
      >
        Select
      </Button>
    </div>
  );
};
