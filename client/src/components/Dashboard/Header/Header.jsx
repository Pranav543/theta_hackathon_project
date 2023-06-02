import React from "react";
import {
  Box,
  Text,
  Avatar,
  Center,
  Input,
  Button,
  Stack,
  InputGroup,
  AvatarBadge,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  useColorMode,
  useDisclosure,
  Slide,
  Tooltip,
} from "@chakra-ui/react";
import { FiSearch, FiSettings } from "react-icons/fi";
import {
  AiOutlineDown,
  AiOutlineVideoCameraAdd,
  AiOutlineLogout,
  AiFillVideoCamera,
  AiOutlineUsergroupDelete,
  AiOutlineStar,
} from "react-icons/ai";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaMoon, FaRegUser } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, addUser, editUser } from "../../../services/usersService";
import {
  getUserNotifications,
  deleteUserNotifications,
  updateUserNotifications,
} from "../../../services/notificationsService";
import { RiUserFollowLine } from "react-icons/ri";
import { AiOutlineMessage } from "react-icons/ai";
import {
  MdInsertChartOutlined,
  MdOutlineAttachMoney,
  MdOutlineMenu,
  MdVideoLibrary,
} from "react-icons/md";
import { SiMediamarkt } from "react-icons/si";
import { useMetaMask } from "../../../hooks/useMetamask";
import { getUserLives } from "../../../services/liveService";
import { BsChatText, BsMicrosoft } from "react-icons/bs";
import { BiMenuAltLeft, BiSun } from "react-icons/bi";
import { io } from "socket.io-client";

function Header() {
  const socket = React.useRef();
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState(user);
  const [avatar, setAvatar] = React.useState(
    "https://bafybeifgsujzqhmwznuytnynypwg2iaotji3d3whty5ymjbi6gghwcmgk4.ipfs.dweb.link/profile-avatar.png"
  );
  const [balance, setBalance] = React.useState(0);
  const [notifications, setNotifications] = React.useState([]);
  const [notifClickBell, setNotifClickBell] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamUrl, setStreamUrl] = React.useState("");
  const { colorMode, toggleColorMode } = useColorMode();
  const [active, setActive] = React.useState(10);
  const location = useLocation();

  const hadleLogout = () => {
    localStorage.removeItem("userLogged");
    localStorage.removeItem("auth-token");
    editUser(user, { isOnline: false });
    logout();
    window.location.href = "https://account.cratch.io";
  };

  const Search = () => {
    return (
      <Box>
        <Button
          onClick={searchResult}
          _hover={{ bg: "rgb(89, 91, 93,0.36)" }}
          height="2.5rem"
          width="5rem"
          bg={colorMode === "light" ? "#5A5A5B" : "rgb(89, 91, 93,0.36)"}
          color="rgb(255,255,255,0.63)"
          borderRadius="50px"
          fontSize="0.9rem"
        >
          Search
        </Button>
      </Box>
    );
  };

  const AiCamera = () => {
    return (
      <Box
        borderRadius="50%"
        bg={colorMode === "light" ? "#5A5A5B" : "rgb(145, 92, 228, 0.83)"}
        height="2rem"
        width="2rem"
        mt={1}
      >
        <Center height="100%">
          <AiOutlineVideoCameraAdd size="1.3rem" />
        </Center>
      </Box>
    );
  };

  const handleUser = async () => {
    const result = await getUser(user);
    if (result.data.status == "not found") {
      try {
        const data = await addUser({
          userId: user,
          username: user,
          isOnline: true,
        });
        setUsername(username);
        setAvatar(avatar);
        setBalance(0);
      } catch (error) {
        console.log(error);
      }
    } else {
      if (
        localStorage.getItem(`streamKey:${user}`) !== null &&
        localStorage.getItem(`streamKey:${user}`) !== "null" &&
        localStorage.getItem(`streamKey:${user}`) !== undefined &&
        localStorage.getItem(`streamKey:${user}`) !== "undefined"
      ) {
        let key = localStorage.getItem(`streamKey:${user}`);
        setStreamUrl(key);
        const live = await getUserLives(result?.data?._id);
        if (live?.data) {
          setIsStreaming(live?.data?.isActive);
        }
      }

      setUsername(result?.data?.username);
      setAvatar(result?.data?.ProfileAvatar);
      setBalance(result?.data?.rewards);
    }
  };

  const handelNotifBell = async () => {
    try {
      const data = await updateUserNotifications(user);
      setNotifClickBell(true);
    } catch {}
  };

  React.useEffect(() => {
    socket.current = io(`${process.env.REACT_APP_SERVER_HOST}`, {
      transports: ["websocket", "polling"],
    });
    socket.current.on("notif", (data) => {
      if (data?.to === user) {
        let vals = [data, ...notifications];
        var uniqueNotifications = vals.reduce((filter, current) => {
          var dk = filter.find(
            (item) =>
              item.from === current.from ||
              (item.from === current.from && item.type === current.type)
          );
          if (!dk) {
            return filter.concat([current]);
          } else {
            return filter;
          }
        }, []);
        setNotifications(uniqueNotifications);
        setNotifClickBell(false);
      }
    });
  }, []);

  const handleNotifications = async () => {
    try {
      const data = await getUserNotifications(user);
      if (data?.data) {
        var uniqueNotifications = data.data.reduce((filter, current) => {
          var dk = filter.find(
            (item) =>
              item.from === current.from ||
              (item.from === current.from && item.type === current.type)
          );
          if (!dk) {
            return filter.concat([current]);
          } else {
            return filter;
          }
        }, []);
        setNotifications(uniqueNotifications);

        setNotifClickBell(false);
      }
    } catch (e) {}
  };

  const handleClearNotifications = async () => {
    setNotifications([]);
    const data = await deleteUserNotifications(user);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  React.useEffect(() => {
    // handleNotifications();
  }, []);

  React.useEffect(() => {
    handleUser();
  }, []);

  const keyDownHandler = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      searchResult();
    }
  };

  const searchResult = () => {
    if (search.length > 2) {
      navigate(`/videos/${search}`);
    }
  };

  return (
    <>
      <Box
        socket={socket}
        width="82%"
        d={["none", "none", "none", "none", "flex", "flex"]}
        height="12%"
        ml="10%"
        position="fixed"
        zIndex={100}
        bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
      >
        <Stack
          width="35%"
          alignContent="center"
          textAlign="center"
          justifyContent="center"
          ml={8}
        >
          <InputGroup>
            <InputLeftElement
              pt={2}
              pl={4}
              children={
                <FiSearch
                  color={colorMode === "light" ? "white" : "#595B5D"}
                  size="1.5rem"
                />
              }
            />
            <Input
              _placeholder={colorMode === "light" ? { color: "white" } : {}}
              onKeyDown={keyDownHandler}
              onChange={handleSearch}
              value={search}
              _focus={{ outline: "1px solid #595B5D " }}
              border="none"
              bg={colorMode === "light" ? "#2D2D2E" : "#242627"}
              pb={1}
              color={colorMode === "light" ? "white" : "rgb(255,255,255,0.63)"}
              type="text"
              pl={12}
              placeholder="Search"
              borderRadius="50px"
              h="3.125rem"
            />
            <InputRightElement pt={2.5} pr={12} children={<Search />} />
          </InputGroup>
        </Stack>

        <Stack
          alignContent="center"
          textAlign="center"
          justifyContent="center"
          ml={24}
        >
          <Link
            to={
              isStreaming || streamUrl?.length > 5
                ? `/stream/${streamUrl}`
                : "/stream"
            }
          >
            {colorMode === "dark" && (
              <Button
                pb={1}
                _hover={{
                  bg: "rgb(38, 29, 55,0.89)",
                }}
                _active={{
                  bg: "rgb(38, 29, 55,0.89)",
                }}
                bg="#261D37"
                h="3.125rem"
                leftIcon={<AiCamera />}
                color="rgb(255,255,255,0.85)"
                borderRadius="50px"
              >
                {isStreaming ? "Manage Stream" : "Start Stream"}
              </Button>
            )}

            {colorMode === "light" && (
              <Button
                pb={1}
                _hover={{
                  bg: "black",
                }}
                _active={{
                  bg: "black",
                }}
                bg="#111315"
                h="3.125rem"
                leftIcon={<AiCamera />}
                color="white"
                borderRadius="50px"
              >
                {isStreaming ? "Manage Stream" : "Start Stream"}
              </Button>
            )}
          </Link>
        </Stack>

        <Stack
          alignContent="center"
          _hiver
          textAlign="center"
          justifyContent="center"
          ml={28}
        >
          <Link to="/settings">
            <FiSettings
              size="1.4rem"
              color={colorMode === "light" ? "black" : "#595B5D"}
              cursor="pointer"
            />
          </Link>
        </Stack>
        <Stack
          alignContent="center"
          textAlign="center"
          justifyContent="center"
          ml={8}
          overflowX="hidden"
          overflowY="auto"
          maxHeight="25vh"
        >
          <Menu isLazy overflowX="hidden">
            <MenuButton
              d="flex"
              onClick={() => {
                handelNotifBell();
              }}
            >
              <Avatar
                bg="transparent"
                icon={
                  <IoIosNotificationsOutline
                    size="1.8rem"
                    cursor="pointer"
                    color={colorMode === "light" ? "black" : "#595B5D"}
                  />
                }
              >
                {notifications?.length > 0 && notifClickBell === false ? (
                  <AvatarBadge
                    mb={5}
                    mr={1.5}
                    textAlign="center"
                    fontWeight="bold"
                    borderColor="transparent"
                    color="white"
                    w="1rem"
                    h="1rem"
                    bg="red"
                    fontSize="0.65rem"
                  >
                    {notifications.length > 9
                      ? `${notifications.length}+`
                      : `${notifications.length}`}
                  </AvatarBadge>
                ) : (
                  <></>
                )}
              </Avatar>
            </MenuButton>
            <MenuList bg="#37393A">
              {/* MenuItems are not rendered unless Menu is open */}
              {notifications.length > 0 ? (
                <>
                  {notifications.map(({ username, type, from }) => (
                    <>
                      {type == "message" && (
                        <Link to={`/messages/${from}`}>
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.4)" }
                                : { bg: "#434546" }
                            }
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <AiOutlineMessage />
                            </Box>
                            You received a new message from{" "}
                            {username?.slice(0, 12)}
                          </MenuItem>
                        </Link>
                      )}
                      {type == "nft creation" && (
                        <Link to={`/profile/${from}`}>
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.4)" }
                                : { bg: "#434546" }
                            }
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <SiMediamarkt />
                            </Box>
                            {username?.slice(0, 12)} created a new NFT
                            Collection
                          </MenuItem>
                        </Link>
                      )}
                      {type == "follow" && (
                        <Link to={`/profile/${from}`}>
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.4)" }
                                : { bg: "#434546" }
                            }
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <RiUserFollowLine />
                            </Box>
                            {username?.slice(0, 12)} started following you
                          </MenuItem>
                        </Link>
                      )}
                      {type == "donate" && (
                        <Link to={`/profile/${from}`}>
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={{ bg: "transparent" }}
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <MdOutlineAttachMoney />
                            </Box>
                            You received a new donation from{" "}
                            {username?.slice(0, 12)}
                          </MenuItem>
                        </Link>
                      )}
                      {type == "nft purchase" && (
                        <Link to={`/profile/${from}`}>
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.4)" }
                                : { bg: "#434546" }
                            }
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <SiMediamarkt />
                            </Box>
                            {username?.slice(0, 12)} purchased your NFT
                          </MenuItem>
                        </Link>
                      )}
                    </>
                  ))}
                  <MenuItem
                    _hover={
                      colorMode === "light"
                        ? { bg: "rgb(255,255,255,0.3)" }
                        : { bg: "#434546" }
                    }
                    fontSize="1.1rem"
                    color="#E4A101"
                    onClick={handleClearNotifications}
                  >
                    <Center w="100%">Clear notifications</Center>
                  </MenuItem>
                </>
              ) : (
                <MenuItem
                  isDisabled={true}
                  color={colorMode === "light" ? "white" : ""}
                  borderBottom="1px solid rgb(255,255,255,0.1)"
                >
                  You don't have any new notifications
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Stack>

        <Stack alignContent="center" textAlign="center" justifyContent="center">
          <Box
            pl={6}
            d="flex"
            alignContent="center"
            textAlign="center"
            justifyContent="center"
          >
            <Menu isLazy>
              <MenuButton>
                <Center h="100%">
                  <Box
                    ml={20}
                    label="Studio"
                    cursor="pointer"
                    width="3rem"
                    height="3rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img5} alt="John" width="3rem" height="3rem" borderRadius="50%" /> */}

                    <Avatar name={`${username}`} src={avatar} />
                  </Box>

                  <Box pl={5}>
                    <Text
                      as="h3"
                      color={
                        colorMode === "light"
                          ? "#050505"
                          : "rgb(255,255,255,0.90)"
                      }
                      fontWeight="600"
                      cursor="pointer"
                    >
                      {username?.slice(0, 7)}
                    </Text>
                    <Text
                      as="h2"
                      fontWeight={colorMode === "light" ? "bold" : ""}
                      color={colorMode === "light" ? "#D2BB31" : "#E4A101"}
                      fontSize="0.8rem"
                    >
                      Online
                    </Text>
                  </Box>
                  <Center pl={12} pb={2} cursor="pointer">
                    <AiOutlineDown size="1.2rem" />
                  </Center>
                </Center>
              </MenuButton>
              {colorMode === "dark" && (
                <MenuList ml={20} bg="#242627">
                  {/* MenuItems are not rendered unless Menu is open */}
                  <MenuItem
                    borderBottom="1px solid rgb(255,255,255,0.1)"
                    fontSize="1.1rem"
                  >
                    <Center w="100%">
                      <Box>
                        <Text pl={2} pb={2} fontWeight="bold" color="#FFD600">
                          {balance.toFixed(2)} $CRTC
                        </Text>
                        <Button
                          isDisabled={true}
                          _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                          _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                          bg="#3EA6FF"
                          mb={2}
                          color="#111315"
                        >
                          Withdraw
                        </Button>
                      </Box>
                    </Center>
                  </MenuItem>
                  <Link to="/profile">
                    <MenuItem
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <FaRegUser />
                      </Box>
                      Profile
                    </MenuItem>
                  </Link>
                  <Link to="/settings">
                    <MenuItem
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <FiSettings />
                      </Box>
                      Settings
                    </MenuItem>
                  </Link>

                  <MenuItem
                    onClick={hadleLogout}
                    borderBottom="1px solid rgb(255,255,255,0.1)"
                    fontSize="1.1rem"
                  >
                    <Box pr={3} color="rgb(255,255,255,0.5)">
                      <AiOutlineLogout />
                    </Box>
                    Logout
                  </MenuItem>
                </MenuList>
              )}

              {colorMode === "light" && (
                <MenuList ml={20} bg="#DAD9D9">
                  {/* MenuItems are not rendered unless Menu is open */}
                  <MenuItem
                    _hover={{ bg: "#c9c9c9" }}
                    borderBottom="1px solid rgb(0,0,0,0.2)"
                    fontSize="1.1rem"
                  >
                    <Center w="100%">
                      <Box>
                        <Text pl={2} pb={2} fontWeight="bold" color="#1C1F20">
                          {balance.toFixed(2)} $CRTC
                        </Text>
                        <Button
                          isDisabled={true}
                          _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                          _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                          bg="#3EA6FF"
                          mb={2}
                          color="#111315"
                        >
                          Withdraw
                        </Button>
                      </Box>
                    </Center>
                  </MenuItem>
                  <Link to="/profile">
                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <FaRegUser fill="black" />
                      </Box>
                      Profile
                    </MenuItem>
                  </Link>
                  <Link to="/settings">
                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <FiSettings color="black" />
                      </Box>
                      Settings
                    </MenuItem>
                  </Link>

                  <MenuItem
                    _hover={{ bg: "#c9c9c9" }}
                    onClick={hadleLogout}
                    borderBottom="1px solid rgb(0,0,0,0.2)"
                    fontSize="1.1rem"
                  >
                    <Box pr={3} color="rgb(255,255,255,0.5)">
                      <AiOutlineLogout color="black" />
                    </Box>
                    Logout
                  </MenuItem>
                </MenuList>
              )}
            </Menu>
          </Box>
        </Stack>
      </Box>

      <Box
        width="82%"
        d={["none", "none", "none", "flex", "none", "none"]}
        height="12%"
        ml="10%"
        position="fixed"
        zIndex={100}
        bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
      >
        <Stack
          width="35%"
          alignContent="center"
          textAlign="center"
          justifyContent="center"
          ml={8}
        >
          <InputGroup>
            <InputLeftElement
              pt={2}
              pl={4}
              children={
                <FiSearch
                  color={colorMode === "light" ? "white" : "#595B5D"}
                  size="1.2rem"
                />
              }
            />
            <Input
              fontSize="0.9rem"
              _placeholder={colorMode === "light" ? { color: "white" } : {}}
              onKeyDown={keyDownHandler}
              onChange={handleSearch}
              value={search}
              _focus={{ outline: "1px solid #595B5D " }}
              border="none"
              bg={colorMode === "light" ? "#2D2D2E" : "#242627"}
              pb={1}
              color={colorMode === "light" ? "white" : "rgb(255,255,255,0.63)"}
              type="text"
              pl={12}
              placeholder="Search"
              borderRadius="50px"
              h="3.125rem"
            />
            <InputRightElement
              pt={2.5}
              pr={10}
              children={
                <Box>
                  <Button
                    onClick={searchResult}
                    _hover={{ bg: "rgb(89, 91, 93,0.36)" }}
                    height="2.2rem"
                    width="4rem"
                    bg={
                      colorMode === "light" ? "#5A5A5B" : "rgb(89, 91, 93,0.36)"
                    }
                    color="rgb(255,255,255,0.63)"
                    borderRadius="50px"
                    fontSize="0.9rem"
                  >
                    Search
                  </Button>
                </Box>
              }
            />
          </InputGroup>
        </Stack>

        <Stack
          alignContent="center"
          textAlign="center"
          justifyContent="center"
          ml={20}
        >
          <Link
            to={
              isStreaming || streamUrl?.length > 5
                ? `/stream/${streamUrl}`
                : "/stream"
            }
          >
            {colorMode === "dark" && (
              <Button
                fontSize="0.9rem"
                pb={1}
                _hover={{
                  bg: "rgb(38, 29, 55,0.89)",
                }}
                _active={{
                  bg: "rgb(38, 29, 55,0.89)",
                }}
                bg="#261D37"
                h="3.125rem"
                leftIcon={<AiCamera />}
                color="rgb(255,255,255,0.85)"
                borderRadius="50px"
              >
                {isStreaming ? "Manage Stream" : "Start Stream"}
              </Button>
            )}

            {colorMode === "light" && (
              <Button
                fontSize="0.9rem"
                pb={1}
                _hover={{
                  bg: "black",
                }}
                _active={{
                  bg: "black",
                }}
                bg="#111315"
                h="3.125rem"
                leftIcon={<AiCamera />}
                color="white"
                borderRadius="50px"
              >
                {isStreaming ? "Manage Stream" : "Start Stream"}
              </Button>
            )}
          </Link>
        </Stack>

        <Stack
          alignContent="center"
          textAlign="center"
          justifyContent="center"
          ml={26}
        >
          <Link to="/settings">
            <FiSettings
              size="1.4rem"
              color={colorMode === "light" ? "black" : "#595B5D"}
              cursor="pointer"
            />
          </Link>
        </Stack>
        <Stack
          alignContent="center"
          textAlign="center"
          justifyContent="center"
          ml={4}
          overflowX="hidden"
          overflowY="auto"
          maxHeight="25vh"
        >
          <Menu isLazy w="auto" overflowX="hidden">
            <MenuButton
              w="auto"
              d="flex"
              onClick={() => {
                handelNotifBell();
              }}
            >
              <Avatar
                bg="transparent"
                icon={
                  <IoIosNotificationsOutline
                    size="1.8rem"
                    cursor="pointer"
                    color={colorMode === "light" ? "black" : "#595B5D"}
                  />
                }
              >
                {notifications.length > 0 &&
                notifClickBell === false &&
                notifications[0].isRead === false ? (
                  <AvatarBadge
                    mb={5}
                    mr={1.5}
                    textAlign="center"
                    fontWeight="bold"
                    borderColor="transparent"
                    color="white"
                    w="1rem"
                    h="1rem"
                    bg="red"
                    fontSize="0.65rem"
                  >
                    {notifications.length > 9
                      ? `${notifications.length}+`
                      : `${notifications.length}`}
                  </AvatarBadge>
                ) : (
                  <></>
                )}
              </Avatar>
            </MenuButton>
            <MenuList bg="#37393A">
              {/* MenuItems are not rendered unless Menu is open */}
              {notifications.length > 0 ? (
                <>
                  {notifications.map(({ username, type, from }) => (
                    <>
                      {type == "message" && (
                        <Link to="/messages">
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.4)" }
                                : { bg: "#434546" }
                            }
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <AiOutlineMessage />
                            </Box>
                            You received a new message from{" "}
                            {username?.slice(0, 12)}
                          </MenuItem>
                        </Link>
                      )}
                      {type == "nft creation" && (
                        <Link to={`/profile/${from}`}>
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.4)" }
                                : { bg: "#434546" }
                            }
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <SiMediamarkt />
                            </Box>
                            {username?.slice(0, 12)} created a new NFT
                            Collection
                          </MenuItem>
                        </Link>
                      )}
                      {type == "follow" && (
                        <Link to={`/profile/${from}`}>
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.4)" }
                                : { bg: "#434546" }
                            }
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <RiUserFollowLine />
                            </Box>
                            {username?.slice(0, 12)} started following you
                          </MenuItem>
                        </Link>
                      )}
                      {type == "donate" && (
                        <Link to={`/profile/${from}`}>
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={{ bg: "transparent" }}
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <MdOutlineAttachMoney />
                            </Box>
                            You received a new donation from{" "}
                            {username?.slice(0, 12)}
                          </MenuItem>
                        </Link>
                      )}
                      {type == "nft purchase" && (
                        <Link to={`/profile/${from}`}>
                          <MenuItem
                            _focus={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.3)" }
                                : { bg: "#434546" }
                            }
                            _hover={
                              colorMode === "light"
                                ? { bg: "rgb(255,255,255,0.4)" }
                                : { bg: "#434546" }
                            }
                            borderBottom="1px solid rgb(255,255,255,0.1)"
                            color="white"
                          >
                            <Box pr={2}>
                              <SiMediamarkt />
                            </Box>
                            {username?.slice(0, 12)} purchased your NFT
                          </MenuItem>
                        </Link>
                      )}
                    </>
                  ))}
                  <MenuItem
                    _hover={
                      colorMode === "light"
                        ? { bg: "rgb(255,255,255,0.3)" }
                        : { bg: "#434546" }
                    }
                    fontSize="1.1rem"
                    color="#E4A101"
                    onClick={handleClearNotifications}
                  >
                    <Center w="100%">Clear notifications</Center>
                  </MenuItem>
                </>
              ) : (
                <MenuItem
                  isDisabled={true}
                  color={colorMode === "light" ? "white" : ""}
                  borderBottom="1px solid rgb(255,255,255,0.1)"
                >
                  You don't have any new notifications
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Stack>

        <Stack w="auto">
          <Box pt={4} ml={6} d="flex" w="auto">
            <Menu isLazy w="auto">
              <MenuButton w="auto">
                <Center w="auto">
                  <Box
                    ml={20}
                    label="Studio"
                    cursor="pointer"
                    width="3rem"
                    height="3rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img5} alt="John" width="3rem" height="3rem" borderRadius="50%" /> */}

                    <Avatar name={`${username}`} src={avatar} />
                  </Box>

                  <Box pl={5}>
                    <Text
                      as="h3"
                      color={
                        colorMode === "light"
                          ? "#050505"
                          : "rgb(255,255,255,0.90)"
                      }
                      fontWeight="600"
                      cursor="pointer"
                    >
                      {username?.slice(0, 7)}
                    </Text>
                    <Text
                      as="h2"
                      fontWeight={colorMode === "light" ? "bold" : ""}
                      color={colorMode === "light" ? "#D2BB31" : "#E4A101"}
                      fontSize="0.8rem"
                    >
                      Online
                    </Text>
                  </Box>
                  <Center pl={12} pb={2} cursor="pointer">
                    <AiOutlineDown size="1.2rem" />
                  </Center>
                </Center>
              </MenuButton>
              {colorMode === "dark" && (
                <MenuList ml={20} bg="#242627">
                  {/* MenuItems are not rendered unless Menu is open */}
                  <MenuItem
                    borderBottom="1px solid rgb(255,255,255,0.1)"
                    fontSize="1.1rem"
                  >
                    <Center w="100%">
                      <Box>
                        <Text pl={2} pb={2} fontWeight="bold" color="#FFD600">
                          {balance.toFixed(2)} $CRTC
                        </Text>
                        <Button
                          isDisabled={true}
                          _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                          _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                          bg="#3EA6FF"
                          mb={2}
                          color="#111315"
                        >
                          Withdraw
                        </Button>
                      </Box>
                    </Center>
                  </MenuItem>
                  <Link to="/profile">
                    <MenuItem
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <FaRegUser />
                      </Box>
                      Profile
                    </MenuItem>
                  </Link>
                  <Link to="/settings">
                    <MenuItem
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <FiSettings />
                      </Box>
                      Settings
                    </MenuItem>
                  </Link>

                  <MenuItem
                    onClick={hadleLogout}
                    borderBottom="1px solid rgb(255,255,255,0.1)"
                    fontSize="1.1rem"
                  >
                    <Box pr={3} color="rgb(255,255,255,0.5)">
                      <AiOutlineLogout />
                    </Box>
                    Logout
                  </MenuItem>
                </MenuList>
              )}

              {colorMode === "light" && (
                <MenuList ml={20} bg="#DAD9D9">
                  {/* MenuItems are not rendered unless Menu is open */}
                  <MenuItem
                    _hover={{ bg: "#c9c9c9" }}
                    borderBottom="1px solid rgb(0,0,0,0.2)"
                    fontSize="1.1rem"
                  >
                    <Center w="100%">
                      <Box>
                        <Text pl={2} pb={2} fontWeight="bold" color="#1C1F20">
                          {balance.toFixed(2)} $CRTC
                        </Text>
                        <Button
                          isDisabled={true}
                          _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                          _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                          bg="#3EA6FF"
                          mb={2}
                          color="#111315"
                        >
                          Withdraw
                        </Button>
                      </Box>
                    </Center>
                  </MenuItem>
                  <Link to="/profile">
                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <FaRegUser fill="black" />
                      </Box>
                      Profile
                    </MenuItem>
                  </Link>
                  <Link to="/settings">
                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <FiSettings color="black" />
                      </Box>
                      Settings
                    </MenuItem>
                  </Link>

                  <MenuItem
                    _hover={{ bg: "#c9c9c9" }}
                    onClick={hadleLogout}
                    borderBottom="1px solid rgb(0,0,0,0.2)"
                    fontSize="1.1rem"
                  >
                    <Box pr={3} color="rgb(255,255,255,0.5)">
                      <AiOutlineLogout color="black" />
                    </Box>
                    Logout
                  </MenuItem>
                </MenuList>
              )}
            </Menu>
          </Box>
        </Stack>
      </Box>

      <Center
        w="100%"
        d={["none", "none", "flex", "none", "none", "none"]}
        height="10%"
        justifyContent="center"
        position="fixed"
        zIndex={100}
        bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
      >
        <Box width="95%" d="flex" h="100%" justifyContent="center">
          <Stack
            alignContent="center"
            textAlign="center"
            justifyContent="center"
          >
            <Box
              d="flex"
              alignContent="center"
              cursor="pointer"
              justifyContent="center"
              onClick={onOpen}
            >
              <MdOutlineMenu size="2.5rem" />
            </Box>
          </Stack>

          <Stack
            width="32%"
            alignContent="center"
            textAlign="center"
            justifyContent="center"
            ml={12}
          >
            <InputGroup>
              <InputLeftElement
                pt={2}
                pl={4}
                children={
                  <FiSearch
                    color={colorMode === "light" ? "white" : "#595B5D"}
                    size="1.2rem"
                  />
                }
              />
              <Input
                fontSize="0.9rem"
                _placeholder={colorMode === "light" ? { color: "white" } : {}}
                onKeyDown={keyDownHandler}
                onChange={handleSearch}
                value={search}
                _focus={{ outline: "1px solid #595B5D " }}
                border="none"
                bg={colorMode === "light" ? "#2D2D2E" : "#242627"}
                pb={1}
                color={
                  colorMode === "light" ? "white" : "rgb(255,255,255,0.63)"
                }
                type="text"
                pl={12}
                placeholder="Search"
                borderRadius="50px"
                h="3.125rem"
              />
              <InputRightElement
                pt={2.5}
                pr={10}
                children={
                  <Box>
                    <Button
                      onClick={searchResult}
                      _hover={{ bg: "rgb(89, 91, 93,0.36)" }}
                      height="2.2rem"
                      width="4rem"
                      bg={
                        colorMode === "light"
                          ? "#5A5A5B"
                          : "rgb(89, 91, 93,0.36)"
                      }
                      color="rgb(255,255,255,0.63)"
                      borderRadius="50px"
                      fontSize="0.9rem"
                    >
                      Search
                    </Button>
                  </Box>
                }
              />
            </InputGroup>
          </Stack>

          <Stack
            alignContent="center"
            textAlign="center"
            justifyContent="center"
            ml={28}
          >
            <Link to="/settings">
              <FiSettings
                size="1.4rem"
                color={colorMode === "light" ? "black" : "#595B5D"}
                cursor="pointer"
              />
            </Link>
          </Stack>
          <Stack
            alignContent="center"
            textAlign="center"
            justifyContent="center"
            ml={4}
            overflowX="hidden"
            overflowY="auto"
            maxHeight="25vh"
          >
            <Menu isLazy w="auto" overflowX="hidden">
              <MenuButton
                w="auto"
                d="flex"
                onClick={() => {
                  handelNotifBell();
                }}
              >
                <Avatar
                  bg="transparent"
                  icon={
                    <IoIosNotificationsOutline
                      size="1.8rem"
                      cursor="pointer"
                      color={colorMode === "light" ? "black" : "#595B5D"}
                    />
                  }
                >
                  {notifications.length > 0 &&
                  notifClickBell === false &&
                  notifications[0].isRead === false ? (
                    <AvatarBadge
                      mb={5}
                      mr={1.5}
                      textAlign="center"
                      fontWeight="bold"
                      borderColor="transparent"
                      color="white"
                      w="1rem"
                      h="1rem"
                      bg="red"
                      fontSize="0.65rem"
                    >
                      {notifications.length > 9
                        ? `${notifications.length}+`
                        : `${notifications.length}`}
                    </AvatarBadge>
                  ) : (
                    <></>
                  )}
                </Avatar>
              </MenuButton>
              <MenuList bg="#37393A">
                {/* MenuItems are not rendered unless Menu is open */}
                {notifications.length > 0 ? (
                  <>
                    {notifications.map(({ username, type, from }) => (
                      <>
                        {type == "message" && (
                          <Link to={`/messages/${from}`}>
                            <MenuItem
                              _focus={
                                colorMode === "light"
                                  ? { bg: "rgb(255,255,255,0.3)" }
                                  : { bg: "#434546" }
                              }
                              _hover={
                                colorMode === "light"
                                  ? { bg: "rgb(255,255,255,0.4)" }
                                  : { bg: "#434546" }
                              }
                              borderBottom="1px solid rgb(255,255,255,0.1)"
                              color="white"
                            >
                              <Box pr={2}>
                                <AiOutlineMessage />
                              </Box>
                              You received a new message from{" "}
                              {username?.slice(0, 12)}
                            </MenuItem>
                          </Link>
                        )}
                        {type == "nft creation" && (
                          <Link to={`/profile/${from}`}>
                            <MenuItem
                              _focus={
                                colorMode === "light"
                                  ? { bg: "rgb(255,255,255,0.3)" }
                                  : { bg: "#434546" }
                              }
                              _hover={
                                colorMode === "light"
                                  ? { bg: "rgb(255,255,255,0.4)" }
                                  : { bg: "#434546" }
                              }
                              borderBottom="1px solid rgb(255,255,255,0.1)"
                              color="white"
                            >
                              <Box pr={2}>
                                <SiMediamarkt />
                              </Box>
                              {username?.slice(0, 12)} created a new NFT
                              Collection
                            </MenuItem>
                          </Link>
                        )}
                        {type == "follow" && (
                          <Link to={`/profile/${from}`}>
                            <MenuItem
                              _focus={
                                colorMode === "light"
                                  ? { bg: "rgb(255,255,255,0.3)" }
                                  : { bg: "#434546" }
                              }
                              _hover={
                                colorMode === "light"
                                  ? { bg: "rgb(255,255,255,0.4)" }
                                  : { bg: "#434546" }
                              }
                              borderBottom="1px solid rgb(255,255,255,0.1)"
                              color="white"
                            >
                              <Box pr={2}>
                                <RiUserFollowLine />
                              </Box>
                              {username?.slice(0, 12)} started following you
                            </MenuItem>
                          </Link>
                        )}
                        {type == "donate" && (
                          <Link to={`/profile/${from}`}>
                            <MenuItem
                              _focus={
                                colorMode === "light"
                                  ? { bg: "rgb(255,255,255,0.3)" }
                                  : { bg: "#434546" }
                              }
                              _hover={{ bg: "transparent" }}
                              borderBottom="1px solid rgb(255,255,255,0.1)"
                              color="white"
                            >
                              <Box pr={2}>
                                <MdOutlineAttachMoney />
                              </Box>
                              You received a new donation from{" "}
                              {username?.slice(0, 12)}
                            </MenuItem>
                          </Link>
                        )}
                        {type == "nft purchase" && (
                          <Link to={`/profile/${from}`}>
                            <MenuItem
                              _focus={
                                colorMode === "light"
                                  ? { bg: "rgb(255,255,255,0.3)" }
                                  : { bg: "#434546" }
                              }
                              _hover={
                                colorMode === "light"
                                  ? { bg: "rgb(255,255,255,0.4)" }
                                  : { bg: "#434546" }
                              }
                              borderBottom="1px solid rgb(255,255,255,0.1)"
                              color="white"
                            >
                              <Box pr={2}>
                                <SiMediamarkt />
                              </Box>
                              {username?.slice(0, 12)} purchased your NFT
                            </MenuItem>
                          </Link>
                        )}
                      </>
                    ))}
                    <MenuItem
                      _hover={
                        colorMode === "light"
                          ? { bg: "rgb(255,255,255,0.3)" }
                          : { bg: "#434546" }
                      }
                      fontSize="1.1rem"
                      color="#E4A101"
                      onClick={handleClearNotifications}
                    >
                      <Center w="100%">Clear notifications</Center>
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem
                    isDisabled={true}
                    color={colorMode === "light" ? "white" : ""}
                    borderBottom="1px solid rgb(255,255,255,0.1)"
                  >
                    You don't have any new notifications
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </Stack>

          <Stack w="auto">
            <Box pt={4} ml={6} d="flex" w="auto">
              <Menu isLazy w="auto">
                <MenuButton w="auto">
                  <Center w="auto">
                    <Box
                      ml={20}
                      label="Studio"
                      cursor="pointer"
                      width="3rem"
                      height="3rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img5} alt="John" width="3rem" height="3rem" borderRadius="50%" /> */}

                      <Avatar name={`${username}`} src={avatar} />
                    </Box>

                    <Box pl={5}>
                      <Text
                        as="h3"
                        color={
                          colorMode === "light"
                            ? "#050505"
                            : "rgb(255,255,255,0.90)"
                        }
                        fontWeight="600"
                        cursor="pointer"
                      >
                        {username?.slice(0, 7)}
                      </Text>
                      <Text
                        as="h2"
                        fontWeight={colorMode === "light" ? "bold" : ""}
                        color={colorMode === "light" ? "#D2BB31" : "#E4A101"}
                        fontSize="0.8rem"
                      >
                        Online
                      </Text>
                    </Box>
                    <Center pl={8} pb={2} cursor="pointer">
                      <AiOutlineDown size="1.2rem" />
                    </Center>
                  </Center>
                </MenuButton>
                {colorMode === "dark" && (
                  <MenuList ml={20} bg="#242627">
                    {/* MenuItems are not rendered unless Menu is open */}
                    <MenuItem
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Center w="100%">
                        <Box>
                          <Text pl={2} pb={2} fontWeight="bold" color="#FFD600">
                            {balance.toFixed(2)} $CRTC
                          </Text>
                          <Button
                            isDisabled={true}
                            _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                            _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                            bg="#3EA6FF"
                            mb={2}
                            color="#111315"
                          >
                            Withdraw
                          </Button>
                        </Box>
                      </Center>
                    </MenuItem>
                    <Link to="/profile">
                      <MenuItem
                        borderBottom="1px solid rgb(255,255,255,0.1)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FaRegUser />
                        </Box>
                        Profile
                      </MenuItem>
                    </Link>
                    <Link to="/settings">
                      <MenuItem
                        borderBottom="1px solid rgb(255,255,255,0.1)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FiSettings />
                        </Box>
                        Settings
                      </MenuItem>
                    </Link>

                    <MenuItem
                      onClick={hadleLogout}
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <AiOutlineLogout />
                      </Box>
                      Logout
                    </MenuItem>
                  </MenuList>
                )}

                {colorMode === "light" && (
                  <MenuList ml={20} bg="#DAD9D9">
                    {/* MenuItems are not rendered unless Menu is open */}
                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Center w="100%">
                        <Box>
                          <Text pl={2} pb={2} fontWeight="bold" color="#1C1F20">
                            {balance.toFixed(2)} $CRTC
                          </Text>
                          <Button
                            isDisabled={true}
                            _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                            _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                            bg="#3EA6FF"
                            mb={2}
                            color="#111315"
                          >
                            Withdraw
                          </Button>
                        </Box>
                      </Center>
                    </MenuItem>
                    <Link to="/profile">
                      <MenuItem
                        _hover={{ bg: "#c9c9c9" }}
                        borderBottom="1px solid rgb(0,0,0,0.2)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FaRegUser fill="black" />
                        </Box>
                        Profile
                      </MenuItem>
                    </Link>
                    <Link to="/settings">
                      <MenuItem
                        _hover={{ bg: "#c9c9c9" }}
                        borderBottom="1px solid rgb(0,0,0,0.2)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FiSettings color="black" />
                        </Box>
                        Settings
                      </MenuItem>
                    </Link>

                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      onClick={hadleLogout}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <AiOutlineLogout color="black" />
                      </Box>
                      Logout
                    </MenuItem>
                  </MenuList>
                )}
              </Menu>
            </Box>
          </Stack>
        </Box>
      </Center>

      <Center
        w="100%"
        d={["none", "flex", "none", "none", "none", "none"]}
        height="10%"
        justifyContent="center"
        position="fixed"
        zIndex={100}
        bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
      >
        <Box width="95%" d="flex" h="100%" justifyContent="center">
          <Stack
            alignContent="center"
            textAlign="center"
            justifyContent="center"
            w="15%"
          >
            <Box
              d="flex"
              alignContent="center"
              cursor="pointer"
              justifyContent="center"
              onClick={onOpen}
            >
              <MdOutlineMenu size="2.2rem" />
            </Box>
          </Stack>

          <Stack
            width="45%"
            alignContent="center"
            textAlign="center"
            justifyContent="center"
          >
            <InputGroup>
              <InputLeftElement
                pl={4}
                children={
                  <FiSearch
                    color={colorMode === "light" ? "white" : "#595B5D"}
                    size="1.2rem"
                  />
                }
              />
              <Input
                fontSize="0.9rem"
                _placeholder={colorMode === "light" ? { color: "white" } : {}}
                onKeyDown={keyDownHandler}
                onChange={handleSearch}
                value={search}
                _focus={{ outline: "1px solid #595B5D " }}
                border="none"
                bg={colorMode === "light" ? "#2D2D2E" : "#242627"}
                pb={1}
                color={
                  colorMode === "light" ? "white" : "rgb(255,255,255,0.63)"
                }
                type="text"
                pl={12}
                placeholder="Search"
                borderRadius="50px"
                h="2.5rem"
              />
              <InputRightElement
                pr={10}
                children={
                  <Box>
                    <Button
                      onClick={searchResult}
                      _hover={{ bg: "rgb(89, 91, 93,0.36)" }}
                      height="2.2rem"
                      width="4rem"
                      bg={
                        colorMode === "light"
                          ? "#5A5A5B"
                          : "rgb(89, 91, 93,0.36)"
                      }
                      color="rgb(255,255,255,0.63)"
                      borderRadius="50px"
                      fontSize="0.9rem"
                    >
                      Search
                    </Button>
                  </Box>
                }
              />
            </InputGroup>
          </Stack>

          <Stack
            w="40%"
            alignContent="center"
            textAlign="center"
            justifyContent="center"
          >
            <Box
              pt={2}
              d="flex"
              w="auto"
              alignContent="center"
              textAlign="center"
              justifyContent="center"
            >
              <Menu isLazy w="auto">
                <MenuButton w="auto">
                  <Center w="auto">
                    <Box
                      label="Studio"
                      cursor="pointer"
                      width="3rem"
                      height="3rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img5} alt="John" width="3rem" height="3rem" borderRadius="50%" /> */}

                      <Avatar name={`${username}`} src={avatar} />
                    </Box>

                    <Box pl={4}>
                      <Text
                        as="h3"
                        color={
                          colorMode === "light"
                            ? "#050505"
                            : "rgb(255,255,255,0.90)"
                        }
                        fontWeight="600"
                        cursor="pointer"
                      >
                        {username?.slice(0, 7)}
                      </Text>
                      <Text
                        as="h2"
                        fontWeight={colorMode === "light" ? "bold" : ""}
                        color={colorMode === "light" ? "#D2BB31" : "#E4A101"}
                        fontSize="0.8rem"
                      >
                        Online
                      </Text>
                    </Box>
                    <Center pl={5} pb={2} cursor="pointer">
                      <AiOutlineDown size="1.2rem" />
                    </Center>
                  </Center>
                </MenuButton>
                {colorMode === "dark" && (
                  <MenuList ml={20} bg="#242627">
                    {/* MenuItems are not rendered unless Menu is open */}
                    <MenuItem
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Center w="100%">
                        <Box>
                          <Text pl={2} pb={2} fontWeight="bold" color="#FFD600">
                            {balance.toFixed(2)} $CRTC
                          </Text>
                          <Button
                            isDisabled={true}
                            _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                            _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                            bg="#3EA6FF"
                            mb={2}
                            color="#111315"
                          >
                            Withdraw
                          </Button>
                        </Box>
                      </Center>
                    </MenuItem>
                    <Link to="/profile">
                      <MenuItem
                        borderBottom="1px solid rgb(255,255,255,0.1)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FaRegUser />
                        </Box>
                        Profile
                      </MenuItem>
                    </Link>
                    <Link to="/settings">
                      <MenuItem
                        borderBottom="1px solid rgb(255,255,255,0.1)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FiSettings />
                        </Box>
                        Settings
                      </MenuItem>
                    </Link>

                    <MenuItem
                      onClick={hadleLogout}
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <AiOutlineLogout />
                      </Box>
                      Logout
                    </MenuItem>
                  </MenuList>
                )}

                {colorMode === "light" && (
                  <MenuList ml={20} bg="#DAD9D9">
                    {/* MenuItems are not rendered unless Menu is open */}
                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Center w="100%">
                        <Box>
                          <Text pl={2} pb={2} fontWeight="bold" color="#1C1F20">
                            {balance.toFixed(2)} $CRTC
                          </Text>
                          <Button
                            isDisabled={true}
                            _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                            _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                            bg="#3EA6FF"
                            mb={2}
                            color="#111315"
                          >
                            Withdraw
                          </Button>
                        </Box>
                      </Center>
                    </MenuItem>
                    <Link to="/profile">
                      <MenuItem
                        _hover={{ bg: "#c9c9c9" }}
                        borderBottom="1px solid rgb(0,0,0,0.2)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FaRegUser fill="black" />
                        </Box>
                        Profile
                      </MenuItem>
                    </Link>
                    <Link to="/settings">
                      <MenuItem
                        _hover={{ bg: "#c9c9c9" }}
                        borderBottom="1px solid rgb(0,0,0,0.2)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FiSettings color="black" />
                        </Box>
                        Settings
                      </MenuItem>
                    </Link>

                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      onClick={hadleLogout}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <AiOutlineLogout color="black" />
                      </Box>
                      Logout
                    </MenuItem>
                  </MenuList>
                )}
              </Menu>
            </Box>
          </Stack>
        </Box>
      </Center>

      <Center
        w="100%"
        d={["flex", "none", "none", "none", "none", "none"]}
        height="10%"
        justifyContent="center"
        position="fixed"
        zIndex={100}
        bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
      >
        <Box width="95%" d="flex" h="100%" justifyContent="center">
          <Stack
            alignContent="center"
            textAlign="center"
            justifyContent="center"
            w="20%"
          >
            <Box
              d="flex"
              alignContent="center"
              cursor="pointer"
              justifyContent="center"
              onClick={onOpen}
            >
              <MdOutlineMenu size="2.2rem" />
            </Box>
          </Stack>

          <Stack
            width="60%"
            alignContent="center"
            textAlign="center"
            justifyContent="center"
          >
            <InputGroup>
              <InputLeftElement
                pl={4}
                children={
                  <FiSearch
                    color={colorMode === "light" ? "white" : "#595B5D"}
                    size="1.2rem"
                  />
                }
              />
              <Input
                fontSize="0.9rem"
                _placeholder={colorMode === "light" ? { color: "white" } : {}}
                onKeyDown={keyDownHandler}
                onChange={handleSearch}
                value={search}
                _focus={{ outline: "1px solid #595B5D " }}
                border="none"
                bg={colorMode === "light" ? "#2D2D2E" : "#242627"}
                pb={1}
                color={
                  colorMode === "light" ? "white" : "rgb(255,255,255,0.63)"
                }
                type="text"
                pl={12}
                placeholder="Search"
                borderRadius="50px"
                h="2.5rem"
              />
              <InputRightElement
                pr={10}
                children={
                  <Box>
                    <Button
                      onClick={searchResult}
                      _hover={{ bg: "rgb(89, 91, 93,0.36)" }}
                      height="2.2rem"
                      width="4rem"
                      bg={
                        colorMode === "light"
                          ? "#5A5A5B"
                          : "rgb(89, 91, 93,0.36)"
                      }
                      color="rgb(255,255,255,0.63)"
                      borderRadius="50px"
                      fontSize="0.9rem"
                    >
                      Search
                    </Button>
                  </Box>
                }
              />
            </InputGroup>
          </Stack>

          <Stack
            w="20%"
            alignContent="center"
            textAlign="center"
            justifyContent="center"
          >
            <Box
              pt={2}
              d="flex"
              w="auto"
              alignContent="center"
              textAlign="center"
              justifyContent="center"
            >
              <Menu isLazy w="auto">
                <MenuButton w="auto">
                  <Center w="auto">
                    <Box
                      label="Studio"
                      cursor="pointer"
                      width="3rem"
                      height="3rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img5} alt="John" width="3rem" height="3rem" borderRadius="50%" /> */}

                      <Avatar name={`${username}`} src={avatar} />
                    </Box>
                  </Center>
                </MenuButton>
                {colorMode === "dark" && (
                  <MenuList ml={20} bg="#242627">
                    {/* MenuItems are not rendered unless Menu is open */}

                    <MenuItem
                      _hover={{ bg: "none" }}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1rem"
                    >
                      <Center w="100%">
                        <Text
                          as="h3"
                          color={colorMode === "light" ? "#D2BB31" : "#E4A101"}
                          fontWeight="600"
                        >
                          {username?.slice(0, 12)}
                        </Text>
                      </Center>
                    </MenuItem>
                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Center w="100%">
                        <Box>
                          <Text pl={2} pb={2} fontWeight="bold" color="#FFD600">
                            {balance.toFixed(2)} $CRTC
                          </Text>
                          <Button
                            isDisabled={true}
                            _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                            _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                            bg="#3EA6FF"
                            mb={2}
                            color="#111315"
                          >
                            Withdraw
                          </Button>
                        </Box>
                      </Center>
                    </MenuItem>
                    <Link to="/profile">
                      <MenuItem
                        borderBottom="1px solid rgb(255,255,255,0.1)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FaRegUser />
                        </Box>
                        Profile
                      </MenuItem>
                    </Link>
                    <Link to="/settings">
                      <MenuItem
                        borderBottom="1px solid rgb(255,255,255,0.1)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FiSettings />
                        </Box>
                        Settings
                      </MenuItem>
                    </Link>

                    <MenuItem
                      onClick={hadleLogout}
                      borderBottom="1px solid rgb(255,255,255,0.1)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <AiOutlineLogout />
                      </Box>
                      Logout
                    </MenuItem>
                  </MenuList>
                )}

                {colorMode === "light" && (
                  <MenuList ml={20} bg="#DAD9D9">
                    {/* MenuItems are not rendered unless Menu is open */}

                    <MenuItem
                      _hover={{ bg: "none" }}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1rem"
                    >
                      <Center w="100%">
                        <Text
                          as="h3"
                          color={colorMode === "light" ? "#D2BB31" : "#E4A101"}
                          fontWeight="600"
                        >
                          {username?.slice(0, 12)}
                        </Text>
                      </Center>
                    </MenuItem>
                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Center w="100%">
                        <Box>
                          <Text pl={2} pb={2} fontWeight="bold" color="#1C1F20">
                            {balance.toFixed(2)} $CRTC
                          </Text>
                          <Button
                            isDisabled={true}
                            _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                            _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                            bg="#3EA6FF"
                            mb={2}
                            color="#111315"
                          >
                            Withdraw
                          </Button>
                        </Box>
                      </Center>
                    </MenuItem>
                    <Link to="/profile">
                      <MenuItem
                        _hover={{ bg: "#c9c9c9" }}
                        borderBottom="1px solid rgb(0,0,0,0.2)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FaRegUser fill="black" />
                        </Box>
                        Profile
                      </MenuItem>
                    </Link>
                    <Link to="/settings">
                      <MenuItem
                        _hover={{ bg: "#c9c9c9" }}
                        borderBottom="1px solid rgb(0,0,0,0.2)"
                        fontSize="1.1rem"
                      >
                        <Box pr={3} color="rgb(255,255,255,0.5)">
                          <FiSettings color="black" />
                        </Box>
                        Settings
                      </MenuItem>
                    </Link>

                    <MenuItem
                      _hover={{ bg: "#c9c9c9" }}
                      onClick={hadleLogout}
                      borderBottom="1px solid rgb(0,0,0,0.2)"
                      fontSize="1.1rem"
                    >
                      <Box pr={3} color="rgb(255,255,255,0.5)">
                        <AiOutlineLogout color="black" />
                      </Box>
                      Logout
                    </MenuItem>
                  </MenuList>
                )}
              </Menu>
            </Box>
          </Stack>
        </Box>
      </Center>

      {/* Sidebar Menu */}

      <Slide
        display={["block", "block", "block", "none", "none", "none"]}
        bg="transparent"
        direction="left"
        in={isOpen}
        style={{
          height: "100vh",
          width: "100vw",
          zIndex: 100,
          display: "flex",
        }}
      >
        <Box
          display={["block", "block", "block", "none", "none", "none"]}
          w="20vw"
          h="100vh"
          bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
        >
          <Center
            onClick={onClose}
            d="flex"
            justifyContent="center"
            cursor="pointer"
            h="10%"
          >
            <BiMenuAltLeft size="2.4rem" />
          </Center>
          <Center
            h="90%"
            justifyContent="center"
            d="flex"
            flexDirection="column"
            alignContent="center"
            textAlign="center"
          >
            <Link to="/">
              {colorMode === "dark" && (
                <Box
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
                height="10rem"
                borderRadius="60px"
                p={2.5}
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
                height="10rem"
                borderRadius="60px"
                p={2.5}
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

            <Box mt={1} width="3.4rem" height="7rem" borderRadius="60px" p={2}>
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
              mt={120}
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
        <Box w="80vw" onClick={onClose} bg="rgb(0,0,0,0.2)"></Box>
      </Slide>
    </>
  );
}

export default Header;
