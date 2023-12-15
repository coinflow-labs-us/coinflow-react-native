# Coinflow React Native

## Withdraw Usage
```
import {useWallet} from '@solana/wallet-adapter-react';
const wallet = useWallet();
const connection = useConnection();

<CoinflowWithdraw wallet={wallet} merchantId='<YOUR MERCHANT ID>' env='prod|sandbox|staging' connection={connection} />;
```

Props:
* `wallet`: The Solana Wallet Adapter Wallet
* `merchantId`: Your Merchant ID (Contact Coinflow support for this)
* `connection`: Solana Connection
* `env` (optional): This defaults to `prod`
    - For testing set to `staging`
* `onSuccess` (optional): function to run when the withdrawal process is successful

## Purchase Usage
```
import {useWallet} from '@solana/wallet-adapter-react';
const wallet = useWallet();
const connection = useConnection();

<CoinflowPurchase wallet={wallet} merchantId='<YOUR MERCHANT ID>' env='prod|sandbox|staging' connection={connection} />;
```

Props:
* `wallet`: The Solana Wallet Adapter Wallet
* `merchantId`: Your Merchant ID (Contact Coinflow support for this)
* `connection`: Solana Connection
* `env` (optional): This defaults to `prod`
  - For testing set to `staging`
* `onSuccess` (optional): function to run when the purchase process is successful
* `transaction` (optional): transaction for the user to run which redeems their credits with your smart contract. Create this transaction just like you would for a normal user who has USDC in their account.
* `partialSigners` (optional): Keypairs of Partial Signers to sign the transaction with, this is necessary when initializing new accounts as the new account Keypair must sign the transaction.
* `debugTx` (optional): Setting this to `true` will sign the transaction with the wallet, and send the transaction with no preflight checks allowing for easier debug of any issues.

## 2.1.5

- Added disableGooglePay and disableApplePay props to CoinflowPurchase

## 2.1.2

- Bug fix for enhanced usage with Google Pay

## 2.1.0

- Added support for EVM NFT purchases

### 2.0.0

**Breaking Changes**

- Added supportsVersionedTransactions to CoinflowWithdraw allowing platforms with wallets that support versioned transactions to Withdraw non-USDC/EuroE tokens in a single transaction with better prices.
- This is enabled to true by default. If you are using a wallet that does not support versioned transactions, you must set `supportsVersionedTransactions` in `CoinflowWithdraw` to `false`.

### 1.3.1

- Added new property lockDefaultToken which locks the withdrawal option to the users default currency (USDC or EUROe)

### 1.3.0

- Added support for paying solana rent for a transaction

# 1.2.8

* Fix external linking for Coinflow URLs

# 1.2.7

* Fix external linking for specified URLs

# 1.2.6

* Added deviceId and chargebackProtectionData to CoinflowPurchase

# 1.2.5

* Fixing Webhook Info

# 1.2.3

* `getFeePayer` - Return the `PublicKey` of the Coinflow Fee Payer

# Changelog

### 1.2.4

- Added `token` prop for `CoinflowPurchase` with polygon

### 1.2.3

- Fixing nSure redirect error

### 1.2.2

- Added Withdraw and Purchase history components

### 0.1.3

- Added the ability to sign transactions instead of sign messages

# 0.1.0
 Genesis 1:1
