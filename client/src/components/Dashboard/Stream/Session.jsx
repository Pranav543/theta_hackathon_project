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
import { HiCheck } from "react-icons/hi";
import {
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
import { editUser, getUserProfile } from "../../../services/usersService";
import {
  EditSavedLiveStream,
  getSavedLive,
  getSavedChatMessages,
} from "../../../services/liveService";
import { followUser, unFollowUser } from "../../../services/usersService";
import { Link, useParams } from "react-router-dom";
import VideoPlayer from "../Videos/Player";
import { format } from "timeago.js";
import ScrollableFeed from "react-scrollable-feed";
import Donate from "../Donate/Donate";
import { getAllUserCreatedNfts } from "../../../services/nftService";
import { duration } from "../Videos/Player";
import { useMetaMask } from "../../../hooks/useMetamask";
import { CreateDocAnalytics } from "../../../services/analyticService";
import axios from "axios";

function Session() {
  const { sessionId } = useParams();
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [click, setClick] = React.useState(false);
  const [streamData, setStreamData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [follow, setFollow] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [likes, setLikes] = React.useState(0);
  const [chatSelected, setChatSelected] = React.useState([]);
  const [allmessages, setAllmessages] = React.useState(0);
  const [showButtons, setShowButtons] = React.useState(true);
  const [userData, setUserData] = React.useState([]);
  const { colorMode } = useColorMode();
  const [allowed, setAllowed] = React.useState(false);
  const notAllowed =
    "https://bafybeibmdmuv6qqgs7yxfymd3yyynz4my6cssqsj6hikylmnrww4qvmq5q.ipfs.w3s.link/Group%205.png";
  const [nfts, setNfts] = React.useState([]);
  document.title = `${streamData?.title}`;

  const getUserNfts = async (receiver) => {
    try {
      const userNfts = await getAllUserCreatedNfts(receiver);
      if (userNfts?.data) {
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
      }
    } catch (e) {}
  };

  const getAlldata = async () => {
    const data = await getUserProfile(user);
    const liveData = await getSavedLive(sessionId);
    setUserData(data?.data);

    if (liveData?.data) {
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
      const datas = await getSavedChatMessages(sessionId);
      if (datas?.data) {
        setChatSelected(datas?.data);
        setAllmessages(datas?.data.content?.length);
      }

      getUserNfts(liveData?.data?.creator?.userId);
      allUserOwnedNfts(liveData?.data);
      await EditSavedLiveStream(liveData?.data?.streamId, {
        views: liveData?.data?.views + 1,
      });
      if (
        localStorage.getItem(liveData?.data?.streamId) !== null &&
        localStorage.getItem(liveData?.data?.streamId) !== "null" &&
        localStorage.getItem(liveData?.data?.streamId) !== undefined &&
        localStorage.getItem(liveData?.data?.streamId) !== "undefined"
      ) {
        setClick(
          localStorage.getItem(liveData?.data?.streamId) === "true"
            ? true
            : false
        );
      }

      setIsLoading(false);
    } else {
      setError(true);
    }
  };

  const allUserOwnedNfts = async (video) => {
    try {
      let found = false;
      const data = await axios.get(
        `https://api.rarible.org/v0.1/items/byOwner/?owner=ETHEREUM:${user}`
      );
      const response = data.data.items;
      if (response.length > 0) {
        response.map((item) => {
          if (
            video?.creator?.userId ===
            item?.creators[0]?.account.split(":")[1].toLowerCase()
          ) {
            found = true;
          }
        });
        setAllowed(found);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveDocAnalytics = async () => {
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
    } catch {}
  };

  React.useEffect(() => {
    window.onbeforeunload = (event) => {
      // Cancel the event
      /// store a new document
      if (duration > 5) {
        saveDocAnalytics();
      }
      event.returnValue = "";
    };
  });
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

  React.useEffect(() => {
    window.onpopstate = function (event) {
      if (duration > 5) {
        saveDocAnalytics();
      }
    };
  });

  React.useEffect(() => {
    getAlldata();
  }, []);

  const onLike = async () => {
    if (click) {
      setLikes(likes - 1);
      await EditSavedLiveStream(streamData?.streamId, {
        likes: streamData?.likes - 1,
      });
      window.localStorage.setItem(streamData?.streamId, false);
    } else {
      setLikes(likes + 1);
      await EditSavedLiveStream(streamData?.streamId, {
        likes: streamData?.likes + 1,
      });
      window.localStorage.setItem(streamData?.streamId, true);
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
                <Box width="70%" height="100%">
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
                        <Center w="100%" h="100%">
                          <Text
                            lineHeight="1.5rem"
                            pt={1}
                            color={
                              colorMode === "light"
                                ? "#595B5D"
                                : "rgb(255,255,255,0.6)"
                            }
                            fontFamily="sans-serif"
                            fontSize="0.92rem"
                            as="h2"
                          >
                            Streamed live &bull; {format(streamData?.createdAt)}
                          </Text>
                        </Center>
                      </Box>
                      <Box w="33%" h="100%">
                        {showButtons && (
                          <Center h="100%" w="100%" columnGap={2}>
                            <Box w="50%">
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
                            <Link to="/content" w="60%" alignSelf="flex-end">
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
                    borderRadius="5px"
                    bg="black"
                    position="relative"
                  >
                    {allowed ? (
                      <VideoPlayer
                        reward={userData?.rewards}
                        viewerId={user}
                        id="videoPlayer"
                        videoId={streamData?._id}
                        videoCreator={streamData?.creator}
                        source={`${streamData?.streamUrl}`}
                        poster={`${streamData?.thumbnail}`}
                      />
                    ) : (
                      <Box
                        h="100%"
                        w="100%"
                        borderRadius="3px"
                        bgImage={`url(${notAllowed})`}
                        bgSize="cover"
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
                            {numFormatter(streamData?.views)}
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
                  <Box h="75%" overflowY="auto" maxHeight="75%" pl={5}>
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
                          {chatSelected?.content?.map((message) => (
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
                        isDisabled={true}
                        _placeholder={{ color: "white" }}
                        color="white"
                        value=""
                        height="100%"
                        width="75%"
                        placeholder="Send a message"
                        border="none"
                        _focus={{ border: "none" }}
                      />
                      <Box w="25%" mr={4}>
                        <Center w="100%" h="100%">
                          <Button
                            isDisabled={true}
                            color="white"
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

export default Session;
