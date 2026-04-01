import {CoinflowEnvs} from './common';

/**
 * Initializes Coinflow fraud protection services.
 * On React Native, this is a no-op — native SDKs are not yet supported.
 */
export function CoinflowPurchaseProtection(_props: {
  coinflowEnv: CoinflowEnvs;
  merchantId: string;
}) {
  return null;
}
