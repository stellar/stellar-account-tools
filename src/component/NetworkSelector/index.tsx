import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@stellar/design-system";

import { delayedAction } from "@/helper/delayedAction";
import { NetworkIndicator } from "@/component/NetworkIndicator";

import type { NetworkId } from "@/types/types";

import "./styles.scss";

export const NetworkSelector = ({
  selectedNetworkId,
  onSelect,
}: {
  selectedNetworkId: NetworkId;
  onSelect: (networkId: NetworkId) => void;
}) => {
  const networks: { id: NetworkId; label: string }[] = [
    {
      id: "mainnet",
      label: "Mainnet",
    },
    {
      id: "testnet",
      label: "Testnet",
    },
  ];

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isDropdownActive, setIsDropdownActive] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = (isVisible: boolean) => {
    const delay = 100;

    if (isVisible) {
      setIsDropdownActive(true);
      delayedAction({
        action: () => {
          setIsDropdownVisible(true);
        },
        delay,
      });
    } else {
      setIsDropdownVisible(false);
      delayedAction({
        action: () => {
          setIsDropdownActive(false);
        },
        delay,
      });
    }
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      toggleDropdown(false);
    }
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef?.current?.contains(event.target as Node) ||
      buttonRef?.current?.contains(event.target as Node)
    ) {
      return;
    }

    toggleDropdown(false);
  }, []);

  // Close dropdown when clicked outside
  useLayoutEffect(() => {
    if (isDropdownVisible) {
      document.addEventListener("pointerup", handleClickOutside);
      document.addEventListener("keyup", handleKeyPress);
    } else {
      document.removeEventListener("pointerup", handleClickOutside);
      document.removeEventListener("keyup", handleKeyPress);
    }

    return () => {
      document.removeEventListener("pointerup", handleClickOutside);
      document.removeEventListener("keyup", handleKeyPress);
    };
  }, [isDropdownVisible, handleClickOutside, handleKeyPress]);

  return (
    <div className="NetworkSelector">
      <button
        className="NetworkSelector__button"
        onClick={() => toggleDropdown(!isDropdownVisible)}
        tabIndex={0}
      >
        <NetworkIndicator
          networkId={selectedNetworkId}
          networkLabel={selectedNetworkId === "mainnet" ? "Mainnet" : "Testnet"}
        />
        <Icon.ChevronDown />
      </button>
      <div
        className="NetworkSelector__floater Floater__content Floater__content--light"
        data-is-active={isDropdownActive}
        data-is-visible={isDropdownVisible}
        tabIndex={0}
      >
        <div className="NetworkSelector__body">
          <div className="NetworkSelector__body__links">
            {networks.map((op) => (
              <div
                key={op.id}
                className="NetworkSelector__body__link"
                data-is-active={op.id === selectedNetworkId}
                role="button"
                onClick={() => {
                  onSelect(op.id);
                  toggleDropdown(false);
                }}
                tabIndex={0}
              >
                <NetworkIndicator networkId={op.id} networkLabel={op.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
