import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { CoinflowIFrameProps, IFrameMessageHandlers } from './common';
export type WithStyles = {
    style?: StyleProp<ViewStyle>;
};
export type WithOnLoad = {
    onLoad?: () => void;
    /**
     * Override the onShouldStartLoadWithRequest with your own function
     *
     * Function that allows custom handling of any web view requests. Return true from the function to continue loading the request and false to stop loading.
     */
    onShouldStartLoadWithRequest?: (request: ShouldStartLoadRequest) => boolean;
};
export type CoinflowWebViewProps = Omit<CoinflowIFrameProps, 'IFrameRef'> & WithOnLoad & {
    /**
     * If set, the webview will only render the content after the webview sends a "loaded" message
     */
    waitForWebviewLoadedMessage?: boolean;
};
export declare function useRandomHandleHeightChangeId(): string;
export declare function CoinflowWebView(props: CoinflowWebViewProps & WithStyles & IFrameMessageHandlers): React.JSX.Element;
