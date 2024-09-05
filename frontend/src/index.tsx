import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./resizeObserverPolyfill"; // Import the polyfill
import { Provider } from "react-redux";
import store from "./redux/store";
import { SocketProvider } from "./socket/SocketContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

//Provider :- Connects the Redux store to the React application, making the Redux state available throughout the app.

root.render(
  <>
    <Provider store={store}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </Provider>
  </>
);


