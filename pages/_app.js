import "../styles/globals.css";
import { RecoilRoot } from "recoil";
import { ConfigProvider } from "../lib/useConfig";
import { GlobalStyle } from "../ui/GlobalStyle";

function CustomApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <ConfigProvider>
        <GlobalStyle />
        <Component {...pageProps} />
      </ConfigProvider>
    </RecoilRoot>
  );
}

export default CustomApp;
