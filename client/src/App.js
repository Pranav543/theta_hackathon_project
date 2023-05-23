import React, { Suspense } from "react";
import { Box, Center, Spinner, useColorMode } from "@chakra-ui/react";

const Login = React.lazy(() => import("./components/Login/Login"));
const Dashboard = React.lazy(() => import("./components/Dashboard/Dashboard"));

function App() {
  const { colorMode } = useColorMode();
  const [isLoading, setIsloading] = React.useState(true);
  const [connected, setConnected] = React.useState(false);
  const verifyConnection = async () => {
    if (
      localStorage.getItem("userLogged") !== null &&
      localStorage.getItem("userLogged") !== "null" &&
      localStorage.getItem("userLogged") !== undefined &&
      localStorage.getItem("userLogged") !== "undefined"
    ) {
      setConnected(true);
      setIsloading(false);
    } else {
      setConnected(false);
      setIsloading(false);
    }
  };

  React.useEffect(() => {
    verifyConnection();
  }, []);
  
  if (!connected) {
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
