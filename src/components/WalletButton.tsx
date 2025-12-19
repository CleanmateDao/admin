import { WalletButton as VeChainWalletButton } from "@vechain/vechain-kit";
import { Button } from "./ui/Button";
import { useWallet } from "@vechain/vechain-kit";
import { formatAddress } from "../helpers/format";

export function WalletButton() {
  const { account, disconnect } = useWallet();

  if (account?.address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">
          {formatAddress(account.address)}
        </span>
        <Button variant="secondary" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return <VeChainWalletButton />;
}
