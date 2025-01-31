# Coinflow React Native

## Withdraw Usage

```
import {useWallet} from '@solana/wallet-adapter-react';
const wallet = useWallet();
const connection = useConnection();

<CoinflowWithdraw wallet={wallet} merchantId='<YOUR MERCHANT ID>' env='prod|sandbox|staging' connection={connection} />;
```

Props:

- `wallet`: The Solana Wallet Adapter Wallet
- `merchantId`: Your Merchant ID (Contact Coinflow support for this)
- `connection`: Solana Connection
- `env` (optional): This defaults to `prod`
  - For testing set to `staging`
- `onSuccess` (optional): function to run when the withdrawal process is successful
- `lockAmount` (optional): Whether to let the user select the amount to withdraw or to disable the input
- `amount` (optional): The amount to withdraw - required if `lockAmount=true`
- `tokens` (optional): Define a list to filter the available tokens
- `lockDefaultToken` (optional): Only allow the default token to be used
- `email` (optional): Set the default email to be used in entry fields
- `bankAccountLinkRedirect` (optional): The URL to be used for bank account setup
- `additionalWallets` (optional): Define additional wallets to assign to the user
- `usePermit` (optional): Pass as false to disable permit message signing for EVM and use approve transactions
- `transactionSigner` (optional): Public Key of the wallet which will actually execute the withdrawal transaction. Must be associated with the same withdrawer as the main wallet.

## Purchase Usage

```
import {useWallet} from '@solana/wallet-adapter-react';
const wallet = useWallet();
const connection = useConnection();

<CoinflowPurchase wallet={wallet} merchantId='<YOUR MERCHANT ID>' env='prod|sandbox|staging' connection={connection} />;
```

Props:

- `subtotal` (optional): Fix the amount of purchase
- `wallet`: The Solana Wallet Adapter Wallet
- `merchantId`: Your Merchant ID (Contact Coinflow support for this)
- `connection`: Solana Connection
- `env` (optional): This defaults to `prod`
  - For testing set to `staging`
- `onSuccess` (optional): function to run when the purchase process is successful
- `transaction` (optional): transaction for the user to run which redeems their credits with your smart contract. Create this transaction just like you would for a normal user who has USDC in their account.
- `debugTx` (optional): Setting this to `true` will sign the transaction with the wallet, and send the transaction with no preflight checks allowing for easier debug of any issues.
- `planCode` (optional): When a subscription is being purchased, the code of the subscription plan.
- `settlementType` (optional): The settlement method to use for the proceeds of a purchase. (Credits, USDC, or Bank)
- `webhookInfo` (optional): Product or transaction based information that you want transmitted when you receive webhooks regarding the purchase
- `email` (optional): Set the default email to use in email entry fields
- `chargebackProtectionData` (optional):
- `customerInfo` (optional): Additional information about the customer
- `allowedPaymentMethods` (optional): The payment methods displayed on the UI. If omitted, all available payment methods will be displayed.
- `rent` (optional, Solana only): Specify the blockchain rent amount to add to the total
- `nativeSolToConvert` (optional, Solana only): Specify the amount of native SOL to convert wSOL for the purchase
- `jwtToken` (optional): A JWT token which encodes verified checkout parameters to prevent spoofing of arguments.
- `supportEmail` (optional): Your business support email address to use for support inquiries

# Changelog

## 4.0.2

- Added `allowedPaymentMethods` to `CoinflowPurchase`
- Options are:
  - 'card' = Credit and debit cards
  - 'ach' = ACH bank account transfers
  - 'fasterPayments' = UK Faster Payments (GBP Bank Transfers)
  - 'sepa' = SEPA bank account transfers (EUR Bank Transfers)
  - 'pix' = Pix bank account transfers (BRL Bank Transfers)
  - 'usdc' = USDC
  - 'googlePay' = Google Pay
  - 'applePay' = Apple Pay
  - 'credits' = Credits

## 4.0.1

- Fix for iframe from here: Can't open URL about:srcdoc on IOS react-native-webview/react-native-webview#2567 (comment)
- Allow for inspection in safari from here: Feature/webview debugging enabled prop react-native-webview/react-native-webview#2937
- Fixing the use of session keys in react native SDK

## 4.0.0

- Deprecating `amount` and `token` in favor of subtotal which can be accessed via the following ways:
- Added multi-currency support for presentment
- SEPA and UK Faster Payments support

```js
{
  cents: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'BRL';
}
```

or

```js
{
  address: string;
  amount: number;
}
```

## 3.4.2

- Extended redirect blacklist for CoinflowWebView

## 3.4.1

- Added sessionKey authentication mechanism to `CoinflowWithdraw`

## 3.4.0

- Added sessionKey authentication mechanism to `CoinflowPurchase`

## 3.2.1

- CoinflowPurchaseV2 component added for a modernized purchase flow

## 3.2.0

- Added arbitrum blockchain support

## 3.1.5

- Allow custom taker on reservoir transactions

## 3.1.4

- Fix redirect bug on checkout component

## 3.1.0

- Added base blockchain support
- Added AuthOnly parameter to CoinflowPurchase

## 3.0.0

- Require `signMessage` on wallets for stronger withdraw authentication

## 2.1.13

- Added new ChargebackProtectionData productTypes

## 2.1.12

- Added `waitForHash` to EvmTransactionData

## 2.1.11

- Added `theme` props to Coinflow components for easy color control
-

## 2.1.10

- Added `orderId` option for reservoir items

## 2.1.9

- Added `nativeSolToConvert` for Solana transactions

## 2.1.7

- Settlement type param for settlement control

## 2.1.6

- Customer info param for added reporting capabilities

## 2.1.5

- Added disableGooglePay and disableApplePay props to CoinflowPurchase

## 2.1.2

- Bug fix for enhanced usage with Google Pay

## 2.1.0

- Added support for EVM NFT purchases

### 2.0.0

**Breaking Changes**

- This is enabled to true by default. If you are using a wallet that does not support versioned transactions, you must set `supportsVersionedTransactions` in `CoinflowWithdraw` to `false`.

### 1.3.1

- Added new property lockDefaultToken which locks the withdrawal option to the users default currency (USDC or EUROe)

### 1.3.0

- Added support for paying solana rent for a transaction

# 1.2.8

- Fix external linking for Coinflow URLs

# 1.2.7

- Fix external linking for specified URLs

# 1.2.6

- Added deviceId and chargebackProtectionData to CoinflowPurchase

# 1.2.5

- Fixing Webhook Info

# 1.2.3

- `getFeePayer` - Return the `PublicKey` of the Coinflow Fee Payer

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
