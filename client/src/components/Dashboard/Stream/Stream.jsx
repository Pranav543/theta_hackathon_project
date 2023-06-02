import React from "react";
import {
  Box,
  Text,
  Center,
  Avatar,
  Button,
  Input,
  Spinner,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { AiFillCheckCircle } from "react-icons/ai";
import { HiCheck, HiFire } from "react-icons/hi";
import {
  BsFillPersonFill,
  BsFillSuitHeartFill,
  BsFillHeartFill,
  BsFillEyeFill,
} from "react-icons/bs";
import {
  RiUserFollowLine,
  RiMessage3Line,
  RiArrowLeftCircleLine,
} from "react-icons/ri";
import astronaut from "../../../assets/astronaut.jpg";
import universe from "../../../assets/universe.png";
import { getUserProfile, editUser } from "../../../services/usersService";
import {
  EdiLiveStream,
  getLive,
  getChatMessages,
  AddMessage,
} from "../../../services/liveService";
import { followUser, unFollowUser } from "../../../services/usersService";
import { Link, useParams } from "react-router-dom";
import LivePlayer from "./Player";
import { format } from "timeago.js";
import { io } from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import Donate from "../Donate/Donate";
import { getAllUserCreatedNfts } from "../../../services/nftService";
import { useMetaMask } from "../../../hooks/useMetamask";
import { CreateDocAnalytics } from "../../../services/analyticService";
import axios from "axios";

function Stream() {
  const playerRef = React.useRef();
  const socket = React.useRef();
  const { id } = useParams();
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [click, setClick] = React.useState(false);
  const [streamData, setStreamData] = React.useState([]);
  const [userData, setUserData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [follow, setFollow] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [likes, setLikes] = React.useState(0);
  const [message, setMessage] = React.useState("");
  const [arrivalMessage, setArrivalMessage] = React.useState({});
  const [chatSelected, setChatSelected] = React.useState([]);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [allmessages, setAllmessages] = React.useState(0);
  const [showButtons, setShowButtons] = React.useState(true);
  const [currentlyWatching, setCurrentlyWatching] = React.useState(0);
  const { colorMode } = useColorMode();
  const [allowed, setAllowed] = React.useState(false);
  const notAllowed =
    "https://bafybeibmdmuv6qqgs7yxfymd3yyynz4my6cssqsj6hikylmnrww4qvmq5q.ipfs.w3s.link/Group%205.png";
  const [nfts, setNfts] = React.useState([]);
  document.title = `Live 🔴 | ${streamData?.title}`;

  const getUserNfts = async (receiver) => {
    try {
      const userNfts = await getAllUserCreatedNfts(receiver);
      if (userNfts?.data.length > 0) {
        setNfts(userNfts?.data);
        if (
          streamData?.visibility === 0 &&
          streamData?.creator?.userId !== user
        ) {
          if (userNfts?.data.length > 0) {
            userNfts?.data.map((nft) => {
              if (streamData?.visibility === 0) {
                if (nft?.owners.length > 0) {
                  nft?.owners?.map((owner) => {
                    if (owner.userId === user.toLowerCase()) {
                      setAllowed(true);
                    }
                  });
                }
              }
            });
          }
        } else {
          setAllowed(true);
        }
      } else {
        setAllowed(true);
      }
    } catch (e) {}
  };

  console.log("streamData: ", streamData)

  const getAlldata = async () => {
    try {
      const data = await getUserProfile(user);
      const liveData = await getLive(id);

      if (liveData?.data?.status !== "not found") {
        setUserData(data?.data);
        setStreamData(liveData?.data);
        setLikes(liveData?.data?.likes);
        if (liveData?.data?.creator?.followers.includes(user)) {
          setFollow(true);
        } else {
          setFollow(false);
        }
        if (liveData?.data.creator?._id === data?.data?._id) {
          setShowButtons(false);
        }
        setSelectedUserId(liveData?.data?._id);
        const datas = await getChatMessages(liveData?.data._id);
        setChatSelected(datas?.data);
        setAllmessages(datas?.data.length);
        getUserNfts(liveData?.data.creator?.userId);
        allUserOwnedNfts(liveData?.data);
        setCurrentlyWatching(liveData?.data?.currentlyWatching + 1);
        await EdiLiveStream(liveData?.data?._id, {
          currentlyWatching: liveData?.data?.currentlyWatching + 1,
          views: liveData?.data?.views + 1,
        });
        if (
          localStorage.getItem(liveData?.data?._id) !== null &&
          localStorage.getItem(liveData?.data?._id) !== "null" &&
          localStorage.getItem(liveData?.data?._id) !== undefined &&
          localStorage.getItem(liveData?.data?._id) !== "undefined"
        ) {
          setClick(
            localStorage.getItem(liveData?.data?._id) === "true" ? true : false
          );
        }
      } else {
        setError(true);
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const Follow = async () => {
    try {
      await followUser(streamData?.creator?.userId.toLowerCase(), {
        value: user,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const unFollow = async () => {
    try {
      await unFollowUser(streamData?.creator?.userId.toLowerCase(), {
        value: user,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const saveDocAnalytics = async (duration) => {
    try {
      await CreateDocAnalytics({
        videoCreator: streamData?.creator,
        videoId: streamData?._id,
        viewerId: user,
        watchtime: duration,
      });
      let reward = (duration / 2) * 0.001;
      let reward2 = duration * 0.0001;
      if (duration > 5 && userData?.userId && streamData?.creator?.userId) {
        await editUser(user, { rewards: userData?.rewards + reward });
        await editUser(streamData?.creator?.userId, {
          rewards: streamData?.creator?.rewards + reward2,
        });
      }
      await EdiLiveStream(streamData?._id, {
        currentlyWatching: currentlyWatching - 1,
      });
    } catch {}
  };

  const start = new Date().getTime();

  React.useEffect(() => {
    window.onbeforeunload = (event) => {
      const end = new Date().getTime();
      const totalTime = (end - start) / 1000;
      /// store a new document
      if (totalTime > 5) {
        saveDocAnalytics(totalTime);
      }
      event.returnValue = "";
    };
  });

  React.useEffect(() => {
    window.onpopstate = async function (event) {
      const end = new Date().getTime();
      const totalTime = (end - start) / 1000;
      if (totalTime > 5) {
        saveDocAnalytics(totalTime);
      }
    };
  });

  const allUserOwnedNfts = async (dbs) => {
    try {
      let found = false;
      const data = await axios.get(
        `https://api.rarible.org/v0.1/items/byOwner/?owner=ETHEREUM:${user}`
      );
      const response = data.data.items;
      if (response.length > 0) {
        response.map((item) => {
          if (
            dbs?.creator?.userId ===
            item?.creators[0]?.account.split(":")[1].toLowerCase()
          ) {
            found = true;
          }
        });
        setAllowed(found);
      }
    } catch (e) {}
  };

  const sendmessage = async () => {
    try {
      if (selectedUserId.length > 1 && message.length > 1) {
        const msgs = [...chatSelected];
        msgs.push({
          creator: userData,
          liveId: streamData._id,
          content: message,
        });

        await AddMessage({
          userData: userData,
          creator: userData?._id,
          liveId: streamData?._id,
          content: message,
        });

        setMessage("");
        setChatSelected(msgs);
        await EdiLiveStream(streamData._id, { numOfmessages: allmessages + 1 });
      }
    } catch (e) {}
  };

  const keyDownHandler = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      sendmessage();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  React.useEffect(() => {
    if (selectedUserId) {
      socket.current = io(`${process.env.REACT_APP_SERVER_HOST}`, {
        transports: ["websocket", "polling"],
      });
      socket.current.emit("add-user-chat", userData.userId);
    }
  }, [selectedUserId]);

  React.useEffect(() => {
    if (socket.current) {
      socket.current.on("live-chat-sent", (message) => {
        setArrivalMessage(message);
      });
    }
  }, [selectedUserId]);

  React.useEffect(() => {
    arrivalMessage &&
      setChatSelected((chatSelected) => [...chatSelected, arrivalMessage]);
  }, [arrivalMessage]);

  React.useEffect(() => {
    getAlldata();
  }, []);

  const onLike = async () => {
    if (click) {
      setLikes(likes - 1);
      await EdiLiveStream(streamData?._id, { likes: streamData?.likes - 1 });
      window.localStorage.setItem(streamData?._id, false);
    } else {
      setLikes(likes + 1);
      await EdiLiveStream(streamData?._id, { likes: streamData?.likes + 1 });
      window.localStorage.setItem(streamData?._id, true);
    }
  };

  function numFormatter(num) {
    if (num > 999 && num < 1000000) {
      return (num / 1000).toFixed(1) + "K";
    } else if (num > 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num < 900) {
      return num;
    }
  }

  if (error) {
    return (
      <Box
        width="100%"
        position="relative"
        ml={["0%", "0%", "0%", "12.2%", "12.2%", "12.2%"]}
        mt={["20%", "14.5%", "10%", "10%", "10%", "8.2%"]}
        height="86%"
        bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
        fontFamily="heading"
      >
        <Center w="100%" h="100%">
          <Box width="95%" height="100%">
            {isLoading ? (
              <Center w="100%" h="100%">
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
              <Center
                mt={2}
                w="100%"
                h="90%"
                bgImage={`url('${universe}')`}
                bgRepeat="no-repeat"
                bgSize="cover"
                bgPosition="center"
                borderRadius="10px"
              >
                <Box
                  textAlign="center"
                  w="100%"
                  h="100%"
                  bgImage={`url('${astronaut}')`}
                  bgRepeat="no-repeat"
                  bgSize="contain"
                  bgPosition="center"
                >
                  <Text color="white" fontSize="3rem" fontWeight="bold" pt={5}>
                    {error ? "ERROR" : "NOT ALLOWED"}
                  </Text>
                  <Text fontSize="17rem" fontWeight="bold" color="white">
                    4&nbsp;&nbsp;4
                  </Text>
                  <Link to="/">
                    <Button
                      fontSize="1.1rem"
                      borderRadius="50px"
                      p={6}
                      leftIcon={<RiArrowLeftCircleLine size="1.2rem" />}
                    >
                      Back to home
                    </Button>
                  </Link>
                </Box>
              </Center>
            )}
          </Box>
        </Center>
      </Box>
    );
  } else {
    return (
      <>
        <Box
          width="100%"
          ml={["0%", "0%", "0%", "12.2%", "12.2%", "12.2%"]}
          mt={["20%", "14.5%", "10%", "10%", "10%", "8.2%"]}
          height="86%"
          position="relative"
          bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
          fontFamily="heading"
        >
          <Center w="100%" h="100%">
            {isLoading ? (
              <Center w="100%" h="100%">
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
              <Box
                width="98%"
                height="100%"
                d={["grid", "grid", "flex", "flex"]}
                gridTemplateColumns={["4fr", "4fr", "", ""]}
              >
                <Box width={["100%", "100%", "70%", "70%"]} height="100%">
                  <Center
                    width="100%"
                    h="10%"
                    mt={[2, 2, 0, 0]}
                    mb={[5, 5, 0, 0]}
                  >
                    <Box d="flex" w="95%" h="100%">
                      <Box w="33%" h="100%">
                        <Box pt={[0, 0, 2, 2]} d="flex">
                          <Box
                            pt={1}
                            label="Studio"
                            cursor="pointer"
                            width="2.3rem"
                            height="2.3rem"
                            borderRadius="50%"
                          >
                            <Link
                              to={`/profile/${streamData?.creator?.userId}`}
                            >
                              <Avatar
                                name={streamData?.creator?.username?.slice(
                                  0,
                                  20
                                )}
                                w="2.3rem"
                                h="2.3rem"
                                src={streamData?.creator?.ProfileAvatar}
                              />
                            </Link>
                          </Box>

                          <Box pl={3}>
                            <Box d="flex">
                              <Text
                                as="h3"
                                color={
                                  colorMode === "light" ? "#1C1F20" : "white"
                                }
                                fontWeight="600"
                                cursor="pointer"
                              >
                                <Link
                                  to={`/profile/${streamData?.creator?.userId}`}
                                >
                                  {streamData?.creator?.username?.slice(0, 20)}
                                </Link>
                              </Text>

                              <Box pl={2} pt={1}>
                                {streamData?.creator?.isVerified && (
                                  <AiFillCheckCircle
                                    fill={
                                      colorMode === "light"
                                        ? "#5B61FB"
                                        : "#FFD600"
                                    }
                                  />
                                )}
                              </Box>
                            </Box>

                            <Text
                              as="h2"
                              color={
                                colorMode === "light"
                                  ? "#595B5D"
                                  : "rgb(255,255,255,0.5)"
                              }
                              fontSize="0.8rem"
                            >
                              {numFormatter(
                                streamData?.creator?.followers.length
                              )}{" "}
                              Followers
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                      <Box w="33%" h="100%">
                        <Center w="100%" h="100%" columnGap={4}>
                          <Box
                            d="flex"
                            width="4rem"
                            height="1.5rem"
                            bg="#FB5B78"
                            borderRadius="7px"
                          >
                            <Center w="100%" h="100%">
                              <Box d="flex">
                                <Box pt={0.5}>
                                  <HiFire color="white" />
                                </Box>

                                <Text
                                  fontSize="0.8rem"
                                  fontWeight="600"
                                  color="white"
                                >
                                  Live
                                </Text>
                              </Box>
                            </Center>
                          </Box>
                          <Box d={["none", "none", "flex", "flex"]}>
                            <BsFillPersonFill size="1.3rem" fill="#47494A" />
                            <Text
                              as="p"
                              fontWeight="bold"
                              fontSize="0.86rem"
                              color={
                                colorMode === "light"
                                  ? "black"
                                  : "rgb(255,255,255,0.89)"
                              }
                              pl={0.5}
                            >
                              {numFormatter(streamData?.views)}
                            </Text>
                          </Box>
                        </Center>
                      </Box>
                      <Box w="33%" h="100%">
                        {showButtons && (
                          <Center h="100%" w="100%" columnGap={2}>
                            <Box w={["100%", "75%", "50%", "50%"]}>
                              {follow ? (
                                <Button
                                  pb={1}
                                  _hover={{ bg: "rgb(69, 82, 254,0.8)" }}
                                  _active={{ bg: "rgb(69, 82, 254,0.8)" }}
                                  bg="rgb(69, 82, 254,0.5)"
                                  leftIcon={<HiCheck size="1.3rem" />}
                                  onClick={() => {
                                    unFollow();
                                    setFollow(!follow);
                                  }}
                                  w="100%"
                                >
                                  Following
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => {
                                    Follow();
                                    setFollow(!follow);
                                  }}
                                  leftIcon={<RiUserFollowLine />}
                                  w="100%"
                                  _hover={{ bg: "rgb(69, 82, 254,0.8)" }}
                                  color="white"
                                  _active={{ bg: "rgb(69, 82, 254,0.8)" }}
                                  bg={
                                    colorMode === "light"
                                      ? "#3EA6FF"
                                      : "#4552FE"
                                  }
                                >
                                  Follow
                                </Button>
                              )}
                            </Box>
                            <Box w="50%" d={["none", "none", "block", "block"]}>
                              {colorMode === "dark" && (
                                <Button
                                  onClick={onOpen}
                                  leftIcon={<BsFillSuitHeartFill />}
                                  w="100%"
                                  border="1px solid rgb(255,255,255,0.6)"
                                >
                                  Support
                                </Button>
                              )}
                              {colorMode === "light" && (
                                <Button
                                  _hover={{ bg: "rgb(45, 45, 46,0.8)" }}
                                  color="white"
                                  bg="#2D2D2E"
                                  onClick={onOpen}
                                  leftIcon={
                                    <BsFillSuitHeartFill fill="white" />
                                  }
                                  w="100%"
                                  border="1px solid rgb(255,255,255,0.6)"
                                >
                                  Support
                                </Button>
                              )}
                            </Box>
                          </Center>
                        )}
                        {!showButtons && (
                          <Box d="flex" justifyContent="right" pt={2}>
                            <Link
                              to={`/stream/${streamData?.streamUrl}`}
                              w="60%"
                              alignSelf="flex-end"
                            >
                              <Button
                                pb={1}
                                _hover={
                                  colorMode === "light"
                                    ? {
                                        color:
                                          "radial-gradient(circle at top, #5B61FB , #1C1F20)",
                                      }
                                    : {
                                        color:
                                          "radial-gradient(circle at top, #7154E6 , #FB5B78)",
                                      }
                                }
                                bg={
                                  colorMode === "light"
                                    ? "radial-gradient(circle at top, #5B61FB , #1C1F20)"
                                    : "radial-gradient(circle at top, #7154E6 , #FB5B78)"
                                }
                                color="white"
                                border="1px solid rgb(255,255,255,0.6)"
                              >
                                Manage Stream
                              </Button>
                            </Link>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Center>
                  <Box
                    w="100%"
                    h={["50%", "50%", "60%", "75%"]}
                    ref={playerRef}
                    borderRadius="5px"
                    bg="black"
                    position="relative"
                  >
                    {allowed || streamData?.visibility === 1 ? (
                      <LivePlayer videoUrl={streamData?.playbackUrl} />
                    ) : (
                      <Box
                        h="100%"
                        w="100%"
                        borderRadius="3px"
                        bgImage={`url(${notAllowed})`}
                        bgSize="contain"
                        bgPosition="center"
                      />
                    )}
                  </Box>
                  <Center w="100%" h={["40%", "40%", "30%", "15%"]}>
                    <Box w="67%" h="100%">
                      <Center w="100%" h="100%">
                        <Box w="100%" h="100%" pt={4}>
                          <Text
                            fontWeight="600"
                            noOfLines={2}
                            color={
                              colorMode === "light"
                                ? "#1C1F20"
                                : "rgb(255,255,255,0.9)"
                            }
                            fontFamily="heading"
                            fontSize="1.2rem"
                            as="h2"
                          >
                            {streamData?.title}
                          </Text>
                          <Text
                            lineHeight="1.5rem"
                            pt={1}
                            color={
                              colorMode === "light"
                                ? "#595B5D"
                                : "rgb(255,255,255,0.6)"
                            }
                            fontFamily="sans-serif"
                            fontSize="1rem"
                            as="h2"
                          >
                            {streamData?.description}
                          </Text>
                        </Box>
                      </Center>
                    </Box>
                    <Box w="33%" h="100%" pt={1}>
                      <Center
                        w="100%"
                        h="100%"
                        columnGap={10}
                        justifyContent="right"
                        pr={8}
                      >
                        <Box textAlign="center">
                          <Box
                            textAlign="center"
                            cursor="pointer"
                            onClick={() => {
                              setClick(!click);
                              onLike();
                            }}
                            color={click ? "#FB5B78" : ""}
                          >
                            <BsFillHeartFill size="1.3rem" />
                          </Box>
                          <Text
                            textAlign="center"
                            pt={1}
                            as="p"
                            pl={1}
                            fontSize="1rem"
                            color={
                              colorMode === "light"
                                ? "black"
                                : "rgb(255,255,255,0.89)"
                            }
                          >
                            {numFormatter(likes)}
                          </Text>
                        </Box>
                        <Box textAlign="center">
                          <RiMessage3Line size="1.4rem" />
                          <Text
                            textAlign="center"
                            pt={1}
                            as="p"
                            fontSize="1rem"
                            color={
                              colorMode === "light"
                                ? "black"
                                : "rgb(255,255,255,0.89)"
                            }
                          >
                            {numFormatter(allmessages)}
                          </Text>
                        </Box>
                        <Box textAlign="center">
                          <BsFillEyeFill size="1.4rem" />
                          <Text
                            pt={1}
                            as="p"
                            fontSize="1rem"
                            color={
                              colorMode === "light"
                                ? "black"
                                : "rgb(255,255,255,0.89)"
                            }
                          >
                            {numFormatter(currentlyWatching)}
                          </Text>
                        </Box>
                      </Center>
                    </Box>
                  </Center>
                </Box>
                <Box w={["100%", "100%", "30%", "30%"]} height="100%">
                  <Box h="10%" pt={2}>
                    <Text as="h3" fontSize="1.2rem" fontWeight="bold" pl={5}>
                      Live chat room
                    </Text>
                  </Box>
                  <Box
                    h="75%"
                    overflowY="auto"
                    maxHeight="75%"
                    pl={5}
                    socket={socket}
                  >
                    <Box h="100%">
                      <ScrollableFeed>
                        <Box
                          width="100%"
                          d="grid"
                          gridTemplateRows="4fr 4fr 4fr 4fr"
                          gap={5}
                          pt={5}
                          pb={5}
                        >
                          {chatSelected?.map((message) => (
                            <Box w="auto" d="flex">
                              <Link to={`/profile/${message?.creator?.userId}`}>
                                <Avatar
                                  w="2.2rem"
                                  h="2.2rem"
                                  src={message?.creator?.ProfileAvatar}
                                  ml={1}
                                  mt={1}
                                />
                              </Link>
                              <Box>
                                <Box d="flex" pl={3}>
                                  <Link
                                    to={`/profile/${message?.creator?.userId}`}
                                  >
                                    <Text as="h4">
                                      {message?.creator?.username?.slice(0, 12)}
                                    </Text>
                                  </Link>
                                  <Text
                                    pl={5}
                                    pt={1}
                                    color="rgb(255,255,255,0.5)"
                                    fontSize="0.8rem"
                                  >
                                    {format(message?.createdAt)}
                                  </Text>
                                </Box>

                                <Text
                                  color="white"
                                  w="auto"
                                  bg="#212024"
                                  mt={1}
                                  pl={5}
                                  ml={2}
                                  pt={2}
                                  pb={2}
                                  pr={5}
                                  borderRadius="2px 10px 10px 10px"
                                >
                                  {message?.content}
                                </Text>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </ScrollableFeed>
                    </Box>
                  </Box>
                  <Center
                    h={["20%", "20%", "12%", "12%"]}
                    w="100%"
                    position="sticky"
                    mb={[5, 5, 0, 0]}
                  >
                    <Box
                      w="98%"
                      h="100%"
                      bg="#101014"
                      ml={5}
                      borderRadius="5px"
                      d="flex"
                    >
                      <Input
                        _placeholder={{ color: "white" }}
                        color="white"
                        onKeyDown={keyDownHandler}
                        value={message}
                        onChange={handleInputChange}
                        height="100%"
                        width="75%"
                        placeholder="Send a message"
                        border="none"
                        _focus={{ border: "none" }}
                      />
                      <Box w="25%" mr={4}>
                        <Center w="100%" h="100%">
                          <Button
                            color="white"
                            onClick={sendmessage}
                            w="100%"
                            _hover={{ bg: "rgb(69, 82, 254,0.8)" }}
                            _active={{ bg: "rgb(69, 82, 254,0.8)" }}
                            bg="#4552FE"
                            pb={1}
                            height={["100%", "100%", "60%", "60%"]}
                            cursor="pointer"
                            textAlign="center"
                          >
                            Send
                          </Button>
                        </Center>
                      </Box>
                    </Box>
                  </Center>
                </Box>
              </Box>
            )}
            <Donate
              username={streamData?.creator?.username}
              nfts={nfts}
              receiver={streamData?.creator?.userId}
              isOpen={isOpen}
              onClose={onClose}
              onOpen={onOpen}
            />
          </Center>
        </Box>
      </>
    );
  }
}

export default Stream;
