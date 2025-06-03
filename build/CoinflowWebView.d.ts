import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { CoinflowIFrameProps, IFrameMessageHandlers } from './common';
export type WithStyles = {
    style?: StyleProp<ViewStyle>;
};
export type WithOnLoad = {
    onLoad?: () => void;
};
export type CoinflowWebViewProps = Omit<CoinflowIFrameProps, 'IFrameRef'> & WithOnLoad & {
    /**
     * If set, the webview will only render the content after the webview sends a "loaded" message
     */
    waitForWebviewLoadedMessage?: boolean;
};
export declare function useRandomHandleHeightChangeId(): string;
export declare function CoinflowWebView(props: CoinflowWebViewProps & WithStyles & IFrameMessageHandlers): React.JSX.Element;
