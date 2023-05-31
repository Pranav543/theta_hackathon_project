import React, { Suspense, useEffect } from "react";
import { Box, Center, Spinner, useColorMode } from "@chakra-ui/react";
import { useMetaMask } from "./hooks/useMetamask.jsx";

import axios from "axios";
const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/`

const Login = React.lazy(() => import("./components/Login/Login"));
const Dashboard = React.lazy(() => import("./components/Dashboard/Dashboard"));

function App() {
  const { colorMode } = useColorMode();
  const [isLoading, setIsloading] = React.useState(true);
  const {  isConnected, currentAccount } = useMetaMask();
  const verifyConnection = () => {
    if (isConnected) {
      setIsloading(false);
    } else {
      setIsloading(false);
    }
  };

  React.useEffect(() => {
    verifyConnection();
  }, []);

  const generateToken = async () => {
    const res =  await axios.post(apiUrl + "generateToken", {
      user: currentAccount.toLowerCase()
    })
    return res
  }

  React.useEffect(() => {
    if (isConnected) {
      setIsloading(false);
      const getToken = async () => {
        const res = await generateToken();
        const token = res.data.token
        window.localStorage.setItem("auth-token", token);
      };
      getToken();
    }
  }, [isConnected]);
  

  if (!isConnected) {
    return (
      <>
        {isLoading ? (
          <Center w="100%" h="100vh">
            <Spinner
              thickness="4px"
              color="#3EA6FF"
              size="xl"
              ariaLabel="loading"
              speed="0.65s"
              emptyColor="grey"
            />
          </Center>
        ) : (
          <Suspense
            fallback={
              <Center w="100%" h="100vh">
                <Spinner
                  thickness="4px"
                  color="#3EA6FF"
                  size="xl"
                  ariaLabel="loading"
                  speed="0.65s"
                  emptyColor="grey"
                />
              </Center>
            }
          >
            <Login />
          </Suspense>
        )}
      </>
    );
  } else {
    return (
      <Box bg={colorMode === "light" ? "#F2F2F2" : "#111315"}>
        <Suspense
          fallback={
            <Center w="100%" h="100vh">
              <Spinner
                thickness="4px"
                color="#3EA6FF"
                size="xl"
                ariaLabel="loading"
                speed="0.65s"
                emptyColor="grey"
              />
            </Center>
          }
        >
          <Dashboard />
        </Suspense>
      </Box>
    );
  }
}

export default App;
