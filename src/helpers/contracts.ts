import { ABIContract, Address, Clause } from "@vechain/sdk-core";

export function createClause(
  abi: readonly unknown[],
  address: string,
  functionName: string,
  params: unknown[]
) {
  return Clause.callFunction(
    Address.of(address),
    ABIContract.ofAbi(
      abi as Parameters<typeof ABIContract.ofAbi>[0]
    ).getFunction(functionName),
    params
  );
}

