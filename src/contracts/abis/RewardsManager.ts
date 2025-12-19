// ABI extracted from vechain-subgraph/abis/RewardsManager.json
export const RewardsManagerABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address[]",
            name: "recipients",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
          {
            internalType: "enum Params.RewardType[]",
            name: "rewardTypes",
            type: "uint8[]",
          },
        ],
        internalType: "struct Params.SendRewardsParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "sendRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cleanup",
            type: "address",
          },
          {
            internalType: "address[]",
            name: "participants",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        internalType: "struct Params.DistributeRewardsParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "distributeRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256[]",
            name: "submissionIds",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        internalType: "struct Params.DistributeStreaksRewardParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "distributeStreaksReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        internalType: "struct Params.ClaimRewardsParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "rewards",
    outputs: [
      {
        internalType: "uint256",
        name: "pending",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "claimed",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalDistributed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
