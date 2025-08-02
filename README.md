# ReSure

A decentralized, blockchain-based reinsurance marketplace that enables small insurers to pool and access reinsurance capital in a trustless, transparent, and automated way — powered by Clarity smart contracts on the Stacks blockchain.

---

## Overview

ReSure consists of ten main smart contracts that together form a secure, transparent, and efficient peer-to-peer reinsurance protocol:

1. **Capital Pool Contract** – Aggregates staked capital from liquidity providers to underwrite reinsurance risk.
2. **Coverage Agreement Contract** – Represents individual reinsurance deals with parameters like risk type, coverage, and duration.
3. **Premium Escrow Contract** – Holds and distributes premiums from insurers to capital providers based on active coverage.
4. **Risk Oracle Interface Contract** – Connects to off-chain data feeds to validate risk event occurrences.
5. **Payout & Claims Contract** – Automates claim validation and payout processes using parametric triggers or oracle input.
6. **Governance DAO Contract** – Allows stakeholders to propose and vote on protocol changes, including capital allocation policies.
7. **Underwriting Contract** – Enables third-party underwriters to initiate and price coverage agreements based on risk models.
8. **KYC/Compliance Contract** – Optional module for insurer and provider identity validation and regulatory compliance.
9. **Rewards & Yield Distribution Contract** – Manages earnings distribution, staking incentives, and withdrawal logic.
10. **Dispute Resolution Contract** – Handles conflict resolution for claim disputes via DAO voting or arbitration.

---

## Features

- **Trustless reinsurance pooling** via smart contracts  
- **Transparent coverage agreements** with on-chain risk parameters  
- **Oracle-based claims** processing for automated payouts  
- **Premium distribution** directly to capital providers  
- **DAO governance** for decentralized control of the protocol  
- **Third-party underwriting** support with risk models  
- **Optional compliance/KYC** for regulated entities  
- **Yield farming and staking rewards** for capital providers  
- **On-chain claim dispute resolution**  
- **Modular, extensible architecture** for new risk classes  

---

## Smart Contracts

### Capital Pool Contract
- Accepts capital from stakers
- Allocates capital to active coverage
- Tracks available liquidity

### Coverage Agreement Contract
- Created per reinsurance deal
- Contains premium, risk, duration, and coverage limits
- Tracks activation and expiration

### Premium Escrow Contract
- Holds premiums from insurers
- Releases payouts or distributes earnings
- Refund logic for untriggered policies

### Risk Oracle Interface Contract
- Pulls verified external data (e.g., disaster events)
- Triggers claims via Clarity-defined callbacks

### Payout & Claims Contract
- Executes automatic payouts
- Supports parametric and oracle-based triggers
- Maintains claim history ledger

### Governance DAO Contract
- Token-weighted voting mechanism
- Manages proposals and quorum rules
- Allocates treasury funds and adjusts parameters

### Underwriting Contract
- Allows risk modeling submissions
- Links to pricing logic for agreements
- Incentivizes accurate risk proposals

### KYC/Compliance Contract
- Optional identity verification module
- Supports whitelisting and regulatory checks
- Integrates with decentralized identity solutions

### Rewards & Yield Distribution Contract
- Calculates and distributes yield to stakers
- Manages compounding or scheduled withdrawals
- Incentive multipliers for long-term staking

### Dispute Resolution Contract
- Receives claim disputes
- Initiates DAO vote or arbitration
- Enforces final rulings on claims or refunds

---

## Installation

1. Install [Clarinet CLI](https://docs.hiro.so/clarinet/getting-started)
2. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/resure.git
   ```
3. Run tests:
    ```bash
    npm test
    ```
4. Deploy contracts:
    ```bash
    clarinet deploy
    ```

## Usage

Each smart contract is modular and interacts with others via well-defined Clarity interfaces. The system allows:

- Insurers to purchase reinsurance coverage
- Capital providers to stake and earn yield
- Oracle-based claim automation
- Governance for protocol control and updates

> Refer to individual contract documentation in the contracts/ folder for detailed interfaces and example calls.

## Testing

All contracts include unit tests written in Clarity’s testing framework. To run the full test suite:
```bash
npm test
```

## License

MIT License