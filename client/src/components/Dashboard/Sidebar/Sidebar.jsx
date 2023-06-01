import React from "react";
import logo from "../../../assets/logo.png";
import { Box, Center, Image, Tooltip, useColorMode } from "@chakra-ui/react";
import { BsMicrosoft, BsChatText } from "react-icons/bs";
import {
  AiFillVideoCamera,
  AiOutlineUsergroupDelete,
  AiOutlineStar,
} from "react-icons/ai";
import { BiSun } from "react-icons/bi";
import { FaRegUser, FaMoon } from "react-icons/fa";
import { MdInsertChartOutlined, MdVideoLibrary } from "react-icons/md";
import { Link } from "react-router-dom";
import { editUser } from "../../../services/usersService";
import { useLocation } from "react-router-dom";
import { useMetaMask } from "../../../hooks/useMetamask";

function Sidebar() {
  const location = useLocation();
  const { currentAccount } = useMetaMask();

  const user = currentAccount.toLowerCase();
  const [active, setActive] = React.useState(10);
  const { colorMode, toggleColorMode } = useColorMode();

  const changeUserStatus = async () => {
    await editUser(user.toLowerCase(), { isOnline: true });
  };

  React.useEffect(() => {
    changeUserStatus();
  }, []);

  React.useEffect(() => {
    window.onbeforeunload = (event) => {
      // Cancel the event
      editUser(user, { isOnline: false });
      event.returnValue = "";
      var ev = new KeyboardEvent("keydown", {
        altKey: false,
        bubbles: true,
        cancelBubble: false,
        cancelable: true,
        charCode: 0,
        code: "Enter",
        composed: true,
        ctrlKey: false,
        currentTarget: null,
        defaultPrevented: true,
        detail: 0,
        eventPhase: 0,
        isComposing: false,
        isTrusted: true,
        key: "Enter",
        keyCode: 13,
        location: 0,
        metaKey: false,
        repeat: false,
        returnValue: false,
        shiftKey: false,
        type: "keydown",
        which: 13,
      });
      window.dispatchEvent(ev);
    };
  });

  return (
    <>
      <Box
        width={["0%", "0%", "8%", "10%", "10%"]}
        height="100vh"
        d={["none", "none", "none", "block", "block"]}
        position="fixed"
        bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
      >
        <Box h="100vh">
          <Center
            justifyContent="center"
            display="flex"
            flexDirection="column"
            alignContent="center"
            textAlign="center"
          >
            <Image src={logo} alt="logo" width="4.5rem" pt={5} />
            <Link to="/">
              {colorMode === "dark" && (
                <Box
                  mt={8}
                  bg={
                    active === 0 || location.pathname === "/"
                      ? "#FB5B78"
                      : "rgb(89, 91, 93,0.36)"
                  }
                  width="3.4rem"
                  height="3.4rem"
                  borderRadius="50%"
                  cursor="pointer"
                  onClick={() => setActive(0)}
                >
                  <Center height="100%">
                    <BsMicrosoft size="1rem" fill="white" />
                  </Center>
                </Box>
              )}

              {colorMode === "light" && (
                <Box
                  mt={8}
                  bg={
                    active === 0 || location.pathname === "/"
                      ? "#5B61FB"
                      : "#242627"
                  }
                  width="3.4rem"
                  height="3.4rem"
                  borderRadius="50%"
                  cursor="pointer"
                  onClick={() => setActive(0)}
                >
                  <Center height="100%">
                    <BsMicrosoft size="1rem" fill="white" />
                  </Center>
                </Box>
              )}
            </Link>

            {colorMode === "dark" && (
              <Box
                mt={4}
                bg="#242627"
                width={["auto", "3.2rem", "3.4rem", "3.4rem"]}
                height={
                  window.screen.height * window.devicePixelRatio >= 1600
                    ? "12rem"
                    : "10rem"
                }
                borderRadius="60px"
                p={
                  window.screen.height * window.devicePixelRatio >= 1600
                    ? 3.5
                    : 2.5
                }
              >
                <Center
                  height="100%"
                  d="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                >
                  <Link to="/studio">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #7154E6 , #FB5B78)"
                      borderRadius="50px"
                      label="Studio"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        label="Studio"
                        cursor="pointer"
                        bg={
                          active === 1 || location.pathname === "/studio"
                            ? "#FB5B78"
                            : "#323435"
                        }
                        onClick={() => setActive(1)}
                        _hover={{
                          bg: "#FB5B78",
                        }}
                        width="2.4rem"
                        height="2.4rem"
                        borderRadius="50%"
                      >
                        <Center height="100%">
                          <AiFillVideoCamera size="1.2rem" fill="white" />
                        </Center>
                      </Box>
                    </Tooltip>
                  </Link>
                  <Link to="/followers">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #7154E6 , #FB5B78)"
                      borderRadius="50px"
                      label="Followers"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 2 || location.pathname === "/followers"
                            ? "#FB5B78"
                            : "#595B5D"
                        }
                        onClick={() => setActive(2)}
                        _hover={{
                          color: "#FB5B78",
                        }}
                      >
                        <AiOutlineUsergroupDelete size="1.8rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                  <Link to="/content">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #7154E6 , #FB5B78)"
                      borderRadius="50px"
                      label="Content"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 3 || location.pathname === "/content"
                            ? "#FB5B78"
                            : "#595B5D"
                        }
                        onClick={() => setActive(3)}
                        _hover={{
                          color: "#FB5B78",
                        }}
                      >
                        <MdVideoLibrary size="1.5rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                  <Link to="/favorites">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #7154E6 , #FB5B78)"
                      borderRadius="50px"
                      label="Favorites"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 4 || location.pathname === "/favorites"
                            ? "#FB5B78"
                            : "#595B5D"
                        }
                        onClick={() => setActive(4)}
                        _hover={{
                          color: "#FB5B78",
                        }}
                      >
                        <AiOutlineStar size="1.7rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                </Center>
              </Box>
            )}

            {colorMode === "light" && (
              <Box
                mt={4}
                bg="#1C1F20"
                width={["auto", "3.2rem", "3.4rem", "3.4rem"]}
                height={
                  window.screen.height * window.devicePixelRatio >= 1600
                    ? "12rem"
                    : "10rem"
                }
                borderRadius="60px"
                p={
                  window.screen.height * window.devicePixelRatio >= 1600
                    ? 3.5
                    : 2.5
                }
              >
                <Center
                  height="100%"
                  d="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                >
                  <Link to="/studio">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #5B61FB , #1C1F20)"
                      borderRadius="50px"
                      label="Studio"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        label="Studio"
                        cursor="pointer"
                        bg={
                          active === 1 || location.pathname === "/studio"
                            ? "#5B61FB"
                            : "#323435"
                        }
                        onClick={() => setActive(1)}
                        _hover={{
                          bg: "#5B61FB",
                        }}
                        width="2.4rem"
                        height="2.4rem"
                        borderRadius="50%"
                      >
                        <Center height="100%">
                          <AiFillVideoCamera size="1.2rem" fill="white" />
                        </Center>
                      </Box>
                    </Tooltip>
                  </Link>
                  <Link to="/followers">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #5B61FB , #1C1F20)"
                      borderRadius="50px"
                      label="Followers"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 2 || location.pathname === "/followers"
                            ? "#5B61FB"
                            : "#FFFFFF"
                        }
                        onClick={() => setActive(2)}
                        _hover={{
                          color: "#5B61FB",
                        }}
                      >
                        <AiOutlineUsergroupDelete size="1.8rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                  <Link to="/content">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #5B61FB , #1C1F20)"
                      borderRadius="50px"
                      label="Content"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 3 || location.pathname === "/content"
                            ? "#5B61FB"
                            : "#FFFFFF"
                        }
                        onClick={() => setActive(3)}
                        _hover={{
                          color: "#5B61FB",
                        }}
                      >
                        <MdVideoLibrary size="1.5rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                  <Link to="/favorites">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #5B61FB , #1C1F20)"
                      borderRadius="50px"
                      label="Favorites"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 4 || location.pathname === "/favorites"
                            ? "#5B61FB"
                            : "#FFFFFF"
                        }
                        onClick={() => setActive(4)}
                        _hover={{
                          color: "#5B61FB",
                        }}
                      >
                        <AiOutlineStar size="1.7rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                </Center>
              </Box>
            )}

            <Box
              mt={1}
              width="3.4rem"
              height={
                window.screen.height * window.devicePixelRatio >= 1600
                  ? "8.5rem"
                  : "7rem"
              }
              borderRadius="60px"
              p={
                window.screen.height * window.devicePixelRatio >= 1600 ? 3.5 : 2
              }
            >
              <Center
                height="100%"
                d="flex"
                flexDirection="column"
                justifyContent="space-between"
                cursor="pointer"
              >
                {colorMode === "dark" && (
                  <Link to="/analytics">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #7154E6 , #FB5B78)"
                      borderRadius="50px"
                      label="Analytics"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 5 || location.pathname === "/analytics"
                            ? "#FB5B78"
                            : "#595B5D"
                        }
                        onClick={() => setActive(5)}
                        _hover={{
                          color: "#FB5B78",
                        }}
                      >
                        <MdInsertChartOutlined size="1.7rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                )}

                {colorMode === "light" && (
                  <Link to="/analytics">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #5B61FB , #1C1F20)"
                      borderRadius="50px"
                      label="Analytics"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 5 || location.pathname === "/analytics"
                            ? "#5B61FB"
                            : "black"
                        }
                        onClick={() => setActive(5)}
                        _hover={{
                          color: "#5B61FB",
                        }}
                      >
                        <MdInsertChartOutlined size="1.7rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                )}

                {colorMode === "dark" && (
                  <Link to="/messages">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #7154E6 , #FB5B78)"
                      borderRadius="50px"
                      label="Messages"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 7 || location.pathname === "/messages"
                            ? "#FB5B78"
                            : "#595B5D"
                        }
                        onClick={() => setActive(7)}
                        _hover={{
                          color: "#FB5B78",
                        }}
                      >
                        <BsChatText size="1.5rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                )}

                {colorMode === "light" && (
                  <Link to="/messages">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #5B61FB , #1C1F20)"
                      borderRadius="50px"
                      label="Messages"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 7 || location.pathname === "/messages"
                            ? "#5B61FB"
                            : "black"
                        }
                        onClick={() => setActive(7)}
                        _hover={{
                          color: "#5B61FB",
                        }}
                      >
                        <BsChatText size="1.5rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                )}

                {colorMode === "dark" && (
                  <Link to="/profile">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #7154E6 , #FB5B78)"
                      borderRadius="50px"
                      label="Profile"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 8 || location.pathname === "/profile"
                            ? "#FB5B78"
                            : "#595B5D"
                        }
                        onClick={() => setActive(8)}
                        _hover={{
                          color: "#FB5B78",
                        }}
                      >
                        <FaRegUser size="1.5rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                )}

                {colorMode === "light" && (
                  <Link to="/profile">
                    <Tooltip
                      width="200px"
                      height="40px"
                      color="white"
                      fontWeight="bold"
                      fontSize="1.3rem"
                      bg="radial-gradient(circle at top, #5B61FB , #1C1F20)"
                      borderRadius="50px"
                      label="Profile"
                      textAlign="center"
                      placement="right"
                    >
                      <Box
                        cursor="pointer"
                        color={
                          active === 8 || location.pathname === "/profile"
                            ? "#5B61FB"
                            : "black"
                        }
                        onClick={() => setActive(8)}
                        _hover={{
                          color: "#5B61FB",
                        }}
                      >
                        <FaRegUser size="1.5rem" />
                      </Box>
                    </Tooltip>
                  </Link>
                )}
              </Center>
            </Box>

            <Center
              cursor="pointer"
              mt={
                window.screen.height * window.devicePixelRatio >= 1600 &&
                window.screen.height * window.devicePixelRatio < 1900
                  ? 260
                  : 120
              }
              onClick={toggleColorMode}
              bg={colorMode === "dark" ? "#323435" : "#FFFFFF"}
              width="3.4rem"
              height="6rem"
              justifyContent="space-between"
              p={2}
              borderRadius="60px"
              d="flex"
              flexDirection="column"
            >
              {colorMode === "dark" ? (
                <>
                  <BiSun size="1.8rem" fill="#595B5D" />
                  <Box
                    bg="white"
                    width="2.6rem"
                    height="2.6rem"
                    borderRadius="50%"
                  >
                    <Center height="100%">
                      <FaMoon size="1.2rem" fill="black" />
                    </Center>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    bg="rgb(28,31,32,0.9)"
                    width="2.6rem"
                    height="2.6rem"
                    borderRadius="50%"
                  >
                    <Center height="100%">
                      <BiSun size="1.5rem" fill="white" />{" "}
                    </Center>
                  </Box>

                  <FaMoon size="1.5rem" fill="black" />
                </>
              )}
            </Center>
          </Center>
        </Box>
      </Box>
    </>
  );
}

export default Sidebar;
