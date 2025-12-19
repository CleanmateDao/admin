export const StreakABI = [
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
        internalType: "struct Params.ApproveStreaksParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "approveStreaks",
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
            internalType: "string[]",
            name: "reasons",
            type: "string[]",
          },
        ],
        internalType: "struct Params.RejectStreaksParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "rejectStreaks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "submissionId",
        type: "uint256",
      },
    ],
    name: "getSubmission",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "submissionId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "rewardAmount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "metadata",
            type: "string",
          },
          {
            internalType: "string[]",
            name: "ipfsHashes",
            type: "string[]",
          },
          {
            internalType: "string[]",
            name: "mimetypes",
            type: "string[]",
          },
          {
            internalType: "enum IStreak.SubmissionStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "submittedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reviewedAt",
            type: "uint256",
          },
        ],
        internalType: "struct IStreak.Submission",
        name: "submission",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

