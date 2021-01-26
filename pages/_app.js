import "../styles/globals.css";
import { RecoilRoot } from "recoil";
import { ConfigProvider } from "../lib/useConfig";

function MyApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <ConfigProvider>
        <Component {...pageProps} />
      </ConfigProvider>
    </RecoilRoot>
  );
}

export default MyApp;
