import React from "react";
import {
  Box,
  Center,
  Text,
  Avatar,
  Button,
  AvatarBadge,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Input,
  SkeletonText,
  Skeleton,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import {
  getUserProfile,
  followUser,
  unFollowUser,
} from "../../../services/usersService";
import { useParams } from "react-router-dom";
import { RiArrowLeftCircleLine, RiUserFollowLine } from "react-icons/ri";
import { BsFillSuitHeartFill } from "react-icons/bs";
import { BiMessageAltDetail } from "react-icons/bi";
import { HiCheck } from "react-icons/hi";
import astronaut from "../../../assets/astronaut.jpg";
import universe from "../../../assets/universe.png";
import Picker from "emoji-picker-react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { AiOutlineSend } from "react-icons/ai";
import { sendMessage } from "../../../services/messagesService";
import { addUserNotification } from "../../../services/notificationsService";
import { getUserVideos } from "../../../services/videoService";
import { getAllUserCreatedNfts } from "../../../services/nftService";
import Donate from "../Donate/Donate";
import { useMetaMask } from "../../../hooks/useMetamask";
import { format } from "timeago.js";
import {
  getPublicSavedUserLives,
  getUserProfileLives,
} from "../../../services/liveService";

const Profiles = () => {
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const [nfts, setNfts] = React.useState([]);
  const initialFocusRef = React.useRef();
  const { id } = useParams();
  const [about, setAbout] = React.useState(
    "Hello, welcome to my Cratch channel!"
  );
  const [username, setUsername] = React.useState(id);
  const [avatar, setAvatar] = React.useState(
    "https://bafybeifgsujzqhmwznuytnynypwg2iaotji3d3whty5ymjbi6gghwcmgk4.ipfs.dweb.link/profile-avatar.png"
  );
  const [followersCount, setFollowersCount] = React.useState(0);
  const [cover, setCover] = React.useState(
    "https://bafybeie3mniojsxcxbvruv4hcfadymzl3c7dioj7jvffyr53rtelduys3a.ipfs.dweb.link/meta.jpeg"
  );
  const [tab, setTab] = React.useState(1);
  const [error, setError] = React.useState(false);
  const [follow, setFollow] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [loggedinUsername, setLoggedinUsername] = React.useState(user);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [videos, setVideos] = React.useState([]);
  const [showSkeleton, setShowSkeleton] = React.useState(true);
  const [userId, setUserId] = React.useState("");
  const [live, setLive] = React.useState([]);
  const skeletons = [0, 1, 2, 3];
  const { colorMode } = useColorMode();

  document.title = `Profile | ${username}`;

  //// handle follow functionality

  const getVideos = async (id) => {
    try {
      const data = await getUserVideos(id);
      const savedLives = await getPublicSavedUserLives(id);
      var allVideos = [];
      if (data?.data) {
        if (savedLives?.data?.status !== "not found") {
          allVideos = [...data?.data, ...savedLives?.data];
        } else {
          allVideos = [...data?.data];
        }
        setVideos(
          allVideos.sort(
            (x, y) => +new Date(y.createdAt) - +new Date(x.createdAt)
          )
        );
        const isStreaming = await getUserProfileLives(id);
        if (isStreaming?.data?.status !== "not found") {
          if (isStreaming?.data?.isActive) {
            setLive(isStreaming?.data);
          }
        }
      }
    } catch (e) {}
  };

  const getUserNfts = async (receiver) => {
    try {
      const userNfts = await getAllUserCreatedNfts(receiver);
      if (userNfts?.data) {
        setNfts(userNfts?.data);
      }
    } catch (e) {}
  };

  const GetUser = async () => {
    setLive([]);
    setVideos([]);
    setIsLoading(true);
    setShowSkeleton(true);
    try {
      setError(false);
      const result = await getUserProfile(id);
      const loggedusername = await getUserProfile(user);
      if (result.data.status === "not found") {
        setError(true);
      } else {
        setCover(result.data.ProfileCover);
        setUsername(result.data.username.slice(0, 20));
        setAvatar(result.data.ProfileAvatar);
        setFollowersCount(result.data.followers.length);
        setAbout(result.data.about);
        setIsOnline(result.data.isOnline);
        setUserId(result?.data?.userId);
        setIsLoading(false);

        await getVideos(result.data._id);
        await getUserNfts(id);
        setShowSkeleton(false);
        setLoggedinUsername(loggedusername.data.username);
        if (result.data.followers.includes(user)) {
          setFollow(true);
        } else {
          setFollow(false);
        }
      }
    } catch {
      console.log("");
      setIsLoading(false);
    }
  };

  const sendmessage = async () => {
    try {
      if (message.length > 1) {
        await sendMessage({
          from: user,
          to: id,
          message: message,
        });

        setMessage("");

        await addUserNotification({
          from: user,
          to: id,
          type: "message",
          username: loggedinUsername,
        });
      }
    } catch (e) {}
  };

  const keyDownHandler = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      sendmessage();
    }
  };

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const Follow = async () => {
    try {
      await followUser(id.toLowerCase(), { value: user });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEmojiClick = (event, emojiObject) => {
    let msg = message;
    msg += emojiObject.emoji;
    setMessage(msg);
  };

  const unFollow = async () => {
    try {
      await unFollowUser(id.toLowerCase(), { value: user });
    } catch (error) {
      console.log(error);
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

  React.useEffect(() => {
    GetUser();
  }, [id]);

  if (error) {
    return (
      <Box
        width="100%"
        position="relative"
        ml={["0%", "0%", "0%", "12.2%", "12.2%", "12.2%"]}
        mt={["16%", "14.5%", "11%", "10%", "10%", "8.2%"]}
        height="86%"
        bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
        fontFamily="heading"
        borderRadius={colorMode === "light" ? "5px" : ""}
      >
        <Center w="100%" h="100%">
          <Box width="95%" height="100%">
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
                  ERROR
                </Text>
                <Text color="white" fontSize="17rem" fontWeight="bold">
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
          </Box>
        </Center>
      </Box>
    );
  } else {
    return (
      <Box
        width="100%"
        position="relative"
        ml={["0%", "0%", "0%", "12.2%", "12.2%", "12.2%"]}
        mt={["16%", "14.5%", "11%", "10%", "10%", "8.2%"]}
        height="86%"
        bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
        fontFamily="heading"
      >
        <Center w="100%" h="100%">
          <Box width="95%" height="100%">
            <Box width="100%">
              <Text
                width="100%"
                as="h1"
                fontSize="1.7rem"
                color={
                  colorMode === "light" ? "#1C1F20" : "rgb(255,255,255,0.90)"
                }
                fontFamily="sans-serif"
                pt={[0, 2]}
                pb={5}
                fontWeight="bold"
              >
                Profile
              </Text>
            </Box>
            {isLoading ? (
              <Center w="100%" h="75vh">
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
              <Box>
                <Box
                  height="20vh"
                  width="100%"
                  borderRadius="5px"
                  bgImage={`url(${cover})`}
                  bgSize="cover"
                  bgPosition="center center"
                ></Box>

                <Box height="50vh">
                  <Box d="flex" pl={2} pt={2}>
                    <Box
                      w={
                        id !== user
                          ? ["40%", "40%", "50%", "50%"]
                          : ["60%", "70%", "80%", "80%"]
                      }
                      d="flex"
                    >
                      <Avatar
                        mt={[2, 0, 0, 0]}
                        src={avatar}
                        w={["2rem", "3rem", "4rem", "4rem"]}
                        h={["2rem", "3rem", "4rem", "4rem"]}
                      >
                        {isOnline ? (
                          <AvatarBadge
                            borderColor="#2D2D2E"
                            boxSize="1.1rem"
                            bg="#55D64F"
                          />
                        ) : (
                          <AvatarBadge
                            borderColor="#2D2D2E"
                            boxSize="1.1rem"
                            bg="grey"
                          />
                        )}
                      </Avatar>
                      <Box pl={5} pt={2}>
                        <Text
                          noOfLines={1}
                          as="h3"
                          color={colorMode === "light" ? "#1C1F20" : "#D5BD31"}
                          fontSize={["1rem", "1.1rem", "1.2rem", "1.2rem"]}
                          fontWeight="bold"
                        >
                          {username}
                        </Text>
                        <Text
                          as="h4"
                          color={
                            colorMode === "light"
                              ? "#595B5D"
                              : "rgb(255,255,255,0.5)"
                          }
                          fontSize="0.9rem"
                        >
                          {followersCount} Followers
                        </Text>
                      </Box>
                    </Box>
                    {id !== user ? (
                      <Box
                        d="flex"
                        columnGap={[5, 5, 2, 5]}
                        w={["60%", "60%", "50%", "50%"]}
                        pr={3}
                      >
                        <Box w="33%" d={["none", "none", "block", "block"]}>
                          <Popover
                            initialFocusRef={initialFocusRef}
                            placement="bottom"
                            closeOnBlur={false}
                          >
                            <PopoverTrigger>
                              <Button
                                pb={0.5}
                                leftIcon={<BiMessageAltDetail />}
                                height="70%"
                                w="100%"
                                border={
                                  colorMode === "light"
                                    ? "1px solid #1C1F20"
                                    : "1px solid white"
                                }
                                _hover={{ bg: "transparent" }}
                                _active={{ bg: "transparent" }}
                                bg="transparent"
                              >
                                Message
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              color="white"
                              bg="#47494A"
                              borderColor="#47494A"
                              _focus={{ border: "1px solid black" }}
                            >
                              <PopoverHeader
                                pt={4}
                                fontWeight="bold"
                                border="0"
                                d="flex"
                              >
                                Chat with{" "}
                                <Text color="#D5BD31" pl={2}>
                                  {username}
                                </Text>
                              </PopoverHeader>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverBody>
                                <Box w="95%" d="flex" pb={2}>
                                  <Box
                                    pr={4}
                                    pt={3}
                                    cursor="pointer"
                                    onClick={handleEmojiPickerhideShow}
                                  >
                                    <BsEmojiSmileFill />
                                    {showEmojiPicker && (
                                      <Picker
                                        pickerStyle={{
                                          position: "absolute",
                                          marginTop: "20px",
                                          width: "18rem",
                                          height: "10rem",
                                        }}
                                        onEmojiClick={handleEmojiClick}
                                      />
                                    )}
                                  </Box>
                                  <Input
                                    onKeyDown={keyDownHandler}
                                    p={0}
                                    value={message}
                                    onChange={handleInputChange}
                                    width="90%"
                                    placeholder="Send a message"
                                    border="none"
                                    _focus={{ border: "none" }}
                                  />

                                  <Box d="flex">
                                    <Button
                                      height="auto"
                                      onClick={sendmessage}
                                      _hover={{ bg: "#242627" }}
                                      _active={{ bg: "#242627" }}
                                      bg="#242627"
                                      cursor="pointer"
                                      textAlign="center"
                                    >
                                      <AiOutlineSend />
                                    </Button>
                                  </Box>
                                </Box>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        </Box>
                        <Box w="33%" d={["none", "none", "block", "block"]}>
                          {colorMode === "dark" && (
                            <Button
                              onClick={onOpen}
                              pb={0.5}
                              leftIcon={<BsFillSuitHeartFill />}
                              height="70%"
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
                              pb={0.5}
                              leftIcon={<BsFillSuitHeartFill fill="white" />}
                              height="70%"
                              w="100%"
                              border="1px solid rgb(255,255,255,0.6)"
                            >
                              Support
                            </Button>
                          )}
                        </Box>
                        <Box
                          w={["100%", "100%", "33%", "33%"]}
                          pl={[20, 28, 0, 0]}
                        >
                          {follow ? (
                            <Button
                              textAlign="center"
                              pl={2.5}
                              onClick={() => {
                                unFollow();
                                setFollow(!follow);
                              }}
                              pb={0.5}
                              leftIcon={<HiCheck size="1.3rem" />}
                              height="70%"
                              w="100%"
                              _hover={{ bg: "rgb(69, 82, 254,0.8)" }}
                              _active={{ bg: "rgb(69, 82, 254,0.8)" }}
                              bg="rgb(69, 82, 254,0.5)"
                            >
                              Following
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                Follow();
                                setFollow(!follow);
                              }}
                              pb={0.5}
                              leftIcon={<RiUserFollowLine />}
                              height="70%"
                              w="100%"
                              _hover={{ bg: "rgb(69, 82, 254,0.8)" }}
                              _active={{ bg: "rgb(69, 82, 254,0.8)" }}
                              color="white"
                              bg={colorMode === "light" ? "#3EA6FF" : "#4552FE"}
                            >
                              Follow
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Box w={["40%", "30%", "80%", "20%"]} pr={2}>
                        <Link to="/content">
                          <Button
                            fontSize={["1rem", "1.1rem", "1.2rem", "1.2rem"]}
                            height="75%"
                            pb={0.5}
                            color="white"
                            w="100%"
                            mt={2}
                            bg="radial-gradient(circle at top, #7154E6 , #FB5B78)"
                            _hover={{
                              bg: "radial-gradient(circle at top, #7154E6 , #FB5B78)",
                            }}
                            _active={{
                              bg: "radial-gradient(circle at top, #7154E6 , #FB5B78)",
                            }}
                          >
                            Manage Videos
                          </Button>
                        </Link>
                      </Box>
                    )}
                  </Box>
                  {colorMode === "dark" && (
                    <Box d="flex" w="auto">
                      <Text
                        onClick={() => setTab(1)}
                        cursor="pointer"
                        color="rgb(255,255,255,0.85)"
                        as="h2"
                        fontSize="1.2rem"
                        fontWeight="bold"
                        pt={5}
                        pb={2}
                        w="auto"
                        borderBottom={
                          tab === 1 ? "2px solid rgb(255,255,255,0.85)" : ""
                        }
                      >
                        Videos
                      </Text>
                      <Text
                        onClick={() => setTab(2)}
                        ml={5}
                        cursor="pointer"
                        color="rgb(255,255,255,0.85)"
                        as="h2"
                        fontSize="1.2rem"
                        fontWeight="bold"
                        pt={5}
                        pb={2}
                        w="auto"
                        borderBottom={
                          tab === 2 ? "2px solid rgb(255,255,255,0.85)" : ""
                        }
                      >
                        About
                      </Text>
                    </Box>
                  )}

                  {colorMode === "light" && (
                    <Box d="flex" w="auto">
                      <Text
                        onClick={() => setTab(1)}
                        cursor="pointer"
                        borderBottom={tab === 1 ? "2px solid #5B61FB" : ""}
                        color={tab === 1 ? "#5B61FB" : "#5A5A5B"}
                        as="h2"
                        fontSize="1.2rem"
                        fontWeight="bold"
                        pt={5}
                        pb={2}
                        w="auto"
                      >
                        Videos
                      </Text>
                      <Text
                        onClick={() => setTab(2)}
                        ml={5}
                        cursor="pointer"
                        borderBottom={tab === 2 ? "2px solid #5B61FB" : ""}
                        color={tab === 2 ? "#5B61FB" : "#5A5A5B"}
                        as="h2"
                        fontSize="1.2rem"
                        fontWeight="bold"
                        pt={5}
                        pb={2}
                        w="auto"
                      >
                        About
                      </Text>
                    </Box>
                  )}

                  {tab === 1 && (
                    <Center w="100%">
                      <Box
                        d="grid"
                        w={["80%", "100%", "100%", "100%"]}
                        gridTemplateColumns={[
                          "4fr",
                          "2fr 2fr",
                          "1fr 1fr 1fr",
                          "1fr 1fr 1fr",
                          "4fr 4fr 4fr 4fr",
                        ]}
                        rowGap={28}
                        columnGap={[0, 3, 4, 5]}
                        mt={5}
                      >
                        {!showSkeleton && (
                          <>
                            {live?.streamUrl?.length > 5 && (
                              <Link to={`/live/${live?.streamUrl}`}>
                                <Box
                                  borderRadius="5px"
                                  height={[
                                    "12rem",
                                    "10.3rem",
                                    "10.3rem",
                                    "10.3rem",
                                  ]}
                                  className={
                                    colorMode === "light"
                                      ? "stream-light"
                                      : "stream"
                                  }
                                  cursor="pointer"
                                >
                                  {/* Main Player box */}

                                  <Box
                                    className={
                                      colorMode === "light"
                                        ? "stream-light__thumbnail"
                                        : "stream__thumbnail"
                                    }
                                    cursor="pointer"
                                    d="flex"
                                    height={[
                                      "12rem",
                                      "10.3rem",
                                      "10.3rem",
                                      "10.3rem",
                                    ]}
                                    bgPosition="center"
                                    bgSize="cover"
                                    justifyContent="right"
                                    bgImage={`url(${live.thumbnail})`}
                                    borderRadius="5px"
                                  >
                                    <Text
                                      pt={0.4}
                                      color="white"
                                      fontSize="0.8rem"
                                      borderRadius="50px"
                                      height="1.5rem"
                                      fontWeight="500"
                                      width="2.5rem"
                                      bg="#FB5B78"
                                      flex="0 0 auto"
                                      alignSelf="flex-start"
                                      mr={1}
                                    >
                                      <Center
                                        w="100%"
                                        h="100%"
                                        pb={0.5}
                                        color="white"
                                      >
                                        Live
                                      </Center>
                                    </Text>
                                  </Box>

                                  <Box d="flex" pt={2}>
                                    <Box pl={5}>
                                      <Text
                                        as="h2"
                                        color={
                                          colorMode === "light"
                                            ? "rgb(5,0,0,0.85)"
                                            : "rgb(255,255,255,0.85)"
                                        }
                                        fontWeight="500"
                                        noOfLines={2}
                                        lineHeight="1.25rem"
                                        fontSize="1rem"
                                      >
                                        {live?.title}
                                      </Text>
                                      <Text
                                        pt={1}
                                        as="h2"
                                        color={
                                          colorMode === "light"
                                            ? "#595B5D"
                                            : "#595B5D"
                                        }
                                        fontSize="0.8rem"
                                      >
                                        {numFormatter(live?.currentlyWatching)}{" "}
                                        watching
                                      </Text>
                                    </Box>
                                  </Box>
                                </Box>
                              </Link>
                            )}

                            {videos?.map((video) => (
                              <Link
                                to={
                                  video?.streamId
                                    ? `/session/watch/${video?.streamId}`
                                    : `/video/${video?.videoId}`
                                }
                              >
                                <Box
                                  borderRadius="5px"
                                  height={[
                                    "12rem",
                                    "10.3rem",
                                    "10.3rem",
                                    "10.3rem",
                                  ]}
                                  className={
                                    colorMode === "light"
                                      ? "stream-light"
                                      : "stream"
                                  }
                                  cursor="pointer"
                                >
                                  {/* Main Player box */}
                                  <Box
                                    className={
                                      colorMode === "light"
                                        ? "stream-light__thumbnail"
                                        : "stream__thumbnail"
                                    }
                                    cursor="pointer"
                                    d="flex"
                                    height={[
                                      "12rem",
                                      "10.3rem",
                                      "10.3rem",
                                      "10.3rem",
                                    ]}
                                    bgPosition="center"
                                    bgSize="cover"
                                    justifyContent="right"
                                    bgImage={`url(${video.thumbnail})`}
                                    borderRadius="5px"
                                  >
                                    <Text
                                      color="white"
                                      borderRadius="2px"
                                      as="h3"
                                      w="auto"
                                      bg="rgb(0,0,0,0.3)"
                                      flex="0 1 auto"
                                      alignSelf="flex-end"
                                      mr={1}
                                    >
                                      {video.duration}
                                    </Text>
                                  </Box>

                                  <Box d="flex" pt={2}>
                                    <Box pl={5}>
                                      <Link
                                        to={
                                          video?.streamId
                                            ? `/session/watch/${video?.streamId}`
                                            : `/video/${video?.videoId}`
                                        }
                                      >
                                        <Text
                                          as="h2"
                                          color={
                                            colorMode === "light"
                                              ? "rgb(5,0,0,0.85)"
                                              : "rgb(255,255,255,0.85)"
                                          }
                                          fontWeight="500"
                                          noOfLines={2}
                                          lineHeight="1.25rem"
                                          fontSize="1rem"
                                        >
                                          {video.title}
                                        </Text>
                                      </Link>
                                      <Text
                                        pt={1}
                                        as="h2"
                                        color={
                                          colorMode === "light"
                                            ? "#595B5D"
                                            : "#595B5D"
                                        }
                                        fontSize="0.8rem"
                                      >
                                        {numFormatter(video.views)} views &bull;{" "}
                                        {video?.streamId ? "Streamed " : ""}
                                        {format(video.createdAt)}
                                      </Text>
                                    </Box>
                                  </Box>
                                </Box>
                              </Link>
                            ))}
                          </>
                        )}

                        {showSkeleton && (
                          <>
                            {skeletons.map(() => (
                              <Box
                                height={[
                                  "12rem",
                                  "10.3rem",
                                  "10.3rem",
                                  "10.3rem",
                                ]}
                              >
                                {/* Main Player box */}
                                <Box cursor="pointer" height="10.3rem">
                                  <Skeleton
                                    borderRadius="5px"
                                    height="100%"
                                    w="100%"
                                    startColor={
                                      colorMode === "light"
                                        ? "#5B61FB"
                                        : "#FB5B78"
                                    }
                                  />
                                </Box>

                                <Box d="flex" mt={3}>
                                  <Box pl={5}>
                                    <Box>
                                      <SkeletonText
                                        w="10rem"
                                        startColor={
                                          colorMode === "light"
                                            ? "#5B61FB"
                                            : "#FB5B78"
                                        }
                                        noOfLines={3}
                                        spacing="3"
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            ))}
                          </>
                        )}
                        {!showSkeleton &&
                          !isLoading &&
                          videos?.length < 1 &&
                          live?.length < 1 && (
                            <Text pt={2} fontSize="1.1rem">
                              No published content yet
                            </Text>
                          )}
                      </Box>
                    </Center>
                  )}
                  {tab === 2 && (
                    <Box mt={5} w="80%">
                      <Text fontSize="1.1rem" as="h1" fontFamily="sans-serif">
                        {about}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Center>

        <Donate
          username={username}
          nfts={nfts}
          receiver={userId}
          isOpen={isOpen}
          onClose={onClose}
          onOpen={onOpen}
        />
      </Box>
    );
  }
};

export default Profiles;
