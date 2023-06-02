import React from "react";
import {
  Box,
  Center,
  Text,
  Avatar,
  AvatarBadge,
  Input,
  Button,
  Image,
  InputGroup,
  InputLeftElement,
  Spinner,
  SkeletonCircle,
  Skeleton,
  useColorMode,
} from "@chakra-ui/react";
import { AiOutlineSend } from "react-icons/ai";
import {
  getLimitedUsers,
  getUser,
  getUsers,
} from "../../../services/usersService";
import { sendMessage, getAllMessages } from "../../../services/messagesService";
import robot from "../../../assets/robot.gif";
import { format } from "timeago.js";
import Picker from "emoji-picker-react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { io } from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import { FiSearch } from "react-icons/fi";
import { addUserNotification } from "../../../services/notificationsService";
import { Link, useParams } from "react-router-dom";
import { useMetaMask } from "../../../hooks/useMetamask";

const RobotComponent = ({ username, mode }) => {
  return (
    <Box
      d="flex"
      justifyContent="center"
      alignItems="center"
      color="white"
      flexDirection="column"
    >
      <Image src={robot} height="20rem" />
      <Text as="h1" d="flex">
        Welcome,{" "}
        <Text
          color={mode === "light" ? "#D2BB31" : "#FB5B78"}
          fontSize={["0.95rem", "1.1rem", "1.1rem", "1.1rem"]}
          fontWeight="bold"
          pl={1}
        >
          {username.slice(0, 12)}!
        </Text>
      </Text>
      <Text as="h3">Please select a chat to Start messaging.</Text>
    </Box>
  );
};

function Messages() {
  document.title = `Messages`;
  const { colorMode } = useColorMode();
  const { id } = useParams();
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const [message, setMessage] = React.useState("");
  const [friends, setFriends] = React.useState([]);
  const [backupFriends, setBackupFriends] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [chatSelected, setChatSelected] = React.useState([]);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [isChatActive, setIsChatActive] = React.useState(false);
  const [usernameAvatar, setUsernameAvatar] = React.useState("");
  const [arrivalMessage, setArrivalMessage] = React.useState(null);
  const [allusers, setAllUsers] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const socket = React.useRef();

  const [selectedUserAvatar, setSelectedUserAvatar] = React.useState("");
  const [userName, setUserName] = React.useState(user);
  const [displayChatUsername, setDisplayChatUsername] = React.useState("");
  const [displayChatAvatar, setDisplayChatAvatar] = React.useState("");
  const [showSkeleton, setShowSkeleton] = React.useState(true);
  const [chatsLoading, setChatsLoading] = React.useState(false);
  const skeletons = [0, 1, 2, 3, 4];
  const back =
    colorMode === "light" ? "rgb(255,255,255,0.4)" : "rgb(31, 34, 35)";

  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event, emojiObject) => {
    let msg = message;
    msg += emojiObject.emoji;
    setMessage(msg);
  };

  const filterFriends = (e) => {
    e.preventDefault();
    setSearch(e.target.value);

    if (
      search === "" ||
      search === " " ||
      e.target.value === "" ||
      e.target.value === " "
    ) {
      setFriends(backupFriends);
      return;
    }
    let usrs = allusers;
    const usersfound = usrs.filter((d) =>
      d.username.toLowerCase().includes(search.toLowerCase())
    );
    setFriends(usersfound);
  };

  const keyDownHandler = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      sendmessage();
    }
  };

  const sendmessage = async () => {
    try {
      if (selectedUserId.length > 1 && message.length > 1) {
        const msgs = [...chatSelected];
        msgs.push({ fromSelf: true, message: message });
        let mess = message;
        setChatSelected(msgs);
        setMessage("");
        await sendMessage({
          from: user,
          to: selectedUserId,
          message: mess,
        });

        fetchUserChat();
        await addUserNotification({
          from: user,
          to: selectedUserId,
          type: "message",
          username: userName,
        });
      }
    } catch (e) {}
  };

  const formatTimeStampAMPM = (date) => {
    let hours = new Date(date).getHours();
    let minutes = new Date(date).getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes.toString().padStart(2, "0");
    let strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  };

  const fetchUserChat = async () => {
    try {
      const data = await getUser(user);
      const limited = await getLimitedUsers();
      const values = limited?.data?.sort(() => Math.random() * 3).slice(0, 5);
      setUserName(data?.data?.username);
      setUsernameAvatar(data?.data?.ProfileAvatar);
      const value = await getUsers();
      const all = value.data.filter((e) => e.userId !== user);
      const mergedArray = [...data.data.followers, ...data.data.following];
      var newArray = [...new Set(mergedArray)];

      values.map(({ userId }) => {
        newArray.push(userId);
      });
      await all.map(async (usr) => {
        var dats = await getAllMessages({ from: user, to: usr.userId });

        if (dats?.data?.length > 0 && dats?.data?.status !== "not found") {
          newArray.push(usr.userId.toString());
          var c = Object.assign(usr, {
            message: dats.data[dats.data.length - 1].message,
            sentAt: dats.data[dats.data.length - 1].createdAt,
          });
          setFriends((friend) => [...friend, c]);
          setAllUsers((friend) => [...friend, c]);
          setBackupFriends((friend) => [...friend, c]);
        } else {
          var d = Object.assign(usr, {
            message: "Hi there! let's chat",
            sentAt: "👋",
          });
          setAllUsers((friend) => [...friend, d]);
        }
      });
      setIsLoading(false);
      if (friends.length < 10) {
        values.map((usr) => {
          var d = Object.assign(usr, {
            message: "Hi there! let's chat",
            sentAt: "👋",
          });
          setFriends((friend) => [...friend, d]);
          setBackupFriends((friend) => [...friend, d]);
        });
      }

      if (id) {
        setSelectedUserId(id);
        setIsChatActive(true);
        setDisplayChatUsername(
          value?.data?.find(
            (x) => x?.userId?.toLowerCase() == id?.toLowerCase()
          )?.username
        );
        setDisplayChatAvatar(
          value?.data?.find(
            (x) => x?.userId?.toLowerCase() == id?.toLowerCase()
          )?.ProfileAvatar
        );
        window.history.replaceState(null, "Messages", "/messages");
      }
    } catch (e) {
      setIsLoading(false);
      setShowSkeleton(false);
    }

    setIsLoading(false);
    setShowSkeleton(false);
  };

  const getMessages = async () => {
    setChatsLoading(true);
    if (selectedUserId.length > 0) {
      try {
        const data = await getAllMessages({ from: user, to: selectedUserId });
        setChatSelected(data?.data);
        setChatsLoading(false);
      } catch (e) {}
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

      if ((id && backupFriends?.length > 2) || !id) {
        setDisplayChatUsername(
          allusers?.find(
            (x) => x?.userId?.toLowerCase() == selectedUserId?.toLowerCase()
          )?.username
        );
        setDisplayChatAvatar(
          allusers?.find(
            (x) => x?.userId?.toLowerCase() == selectedUserId?.toLowerCase()
          )?.ProfileAvatar
        );
      }
    }
  }, [selectedUserId]);

  React.useEffect(() => {
    if (socket.current) {
      socket.current.on("chat-sent", (data) => {
        if (data.to == user) {
          setArrivalMessage({ fromSelf: false, message: data.message });
        }
      });
    }
  }, [selectedUserId]);

  React.useEffect(() => {
    arrivalMessage &&
      setChatSelected((chatSelected) => [...chatSelected, arrivalMessage]);
  }, [arrivalMessage]);

  React.useEffect(() => {
    fetchUserChat();
  }, []);

  React.useEffect(() => {
    getMessages();
  }, [selectedUserId]);
  return (
    <Box
      width="100%"
      position="relative"
      ml={["0%", "0%", "0%", "12.2%", "12.2%", "12.2%"]}
      mt={["20%", "14.5%", "11%", "10%", "10%", "8.2%"]}
      height="86%"
      bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
      fontFamily="heading"
    >
      <Center w="100%" h="100%">
        <Box width="95%" height="100%">
          <Box
            width={["100%", "80%", "50%", "40%"]}
            d="flex"
            pt={[0, 2]}
            pb={5}
          >
            <Text
              w="40%"
              as="h1"
              fontSize={["1.6rem", "1.7rem"]}
              color={
                colorMode === "light" ? "#1C1F20" : "rgb(255,255,255,0.90)"
              }
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              Messages
            </Text>
            {colorMode === "dark" && (
              <InputGroup w="60%">
                <InputLeftElement
                  children={
                    <FiSearch size="1rem" color="rgb(255,255,255,0.5)" />
                  }
                />
                <Input
                  onChange={filterFriends}
                  value={search}
                  w="100%"
                  placeholder="Search for friend"
                />
              </InputGroup>
            )}

            {colorMode === "light" && (
              <InputGroup w="60%">
                <InputLeftElement
                  children={<FiSearch size="1rem" color="#1C1F20" />}
                />
                <Input
                  _placeholder={{ color: "black" }}
                  color="black"
                  _hover={{ borderColor: "#5A5A5B" }}
                  borderColor="#5A5A5B"
                  focusBorderColor="#5A5A5B"
                  onChange={filterFriends}
                  value={search}
                  w="100%"
                  placeholder="Search for friend"
                />
              </InputGroup>
            )}
          </Box>

          {isLoading ? (
            <Center w="100%" h="70vh">
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
              d="flex"
              boxShadow={
                colorMode === "light"
                  ? "6px 6px rgb(0,0,0,0.5)"
                  : "6px 6px rgb(255,255,255,0.3)"
              }
              borderRadius="5px"
            >
              <Box
                width={["50%", "40%", "40%", "40%"]}
                bg={colorMode === "light" ? "#DAD9D9" : "rgb(89, 91, 93,0.55)"}
                height="100%"
                borderRadius="5px 0px 0px 5px"
              >
                <Box
                  overflowY="auto"
                  overflowX={["hidden", "hidden", "auto", "auto"]}
                  height="70vh"
                >
                  <Box
                    width="100%"
                    d="grid"
                    gridAutoRows="4fr 4fr 4fr 4fr"
                    gap={4}
                    pt={5}
                  >
                    {!showSkeleton && (
                      <>
                        {Array.from(
                          friends
                            ?.reduce((m, t) => m.set(t.userId, t), new Map())
                            .values()
                        )
                          .filter((a) => a.userId !== user)
                          .map(
                            ({
                              userId,
                              ProfileAvatar,
                              username,
                              isOnline,
                              message,
                              sentAt,
                            }) => (
                              <Box
                                key={userId}
                                bg={
                                  isChatActive == true &&
                                  selectedUserId == userId
                                    ? back
                                    : ""
                                }
                                cursor="pointer"
                                _hover={
                                  colorMode === "light"
                                    ? { bg: "rgb(255,255,255,0.4)" }
                                    : { bg: "rgb(31, 34, 35)" }
                                }
                                onClick={() => {
                                  setIsChatActive(true);
                                  setSelectedUserId(userId);
                                  setSelectedUserAvatar(ProfileAvatar);
                                  setDisplayChatAvatar("");
                                  setDisplayChatUsername("");
                                }}
                              >
                                <Center width="100%">
                                  <Box width="95%" d="flex" mt={3} mb={3}>
                                    <Avatar
                                      w={["2rem", "2.5rem", "2.5rem", "2.5rem"]}
                                      h={["2rem", "2.5rem", "2.5rem", "2.5rem"]}
                                      src={ProfileAvatar}
                                    >
                                      {isOnline ? (
                                        <AvatarBadge
                                          borderColor="#2D2D2E"
                                          boxSize="0.85rem"
                                          bg="#55D64F"
                                        />
                                      ) : (
                                        <AvatarBadge
                                          borderColor="#2D2D2E"
                                          boxSize="0.85rem"
                                          bg="gray"
                                        />
                                      )}
                                    </Avatar>
                                    <Box width="80%" ml={2}>
                                      <Text
                                        as="h3"
                                        color={
                                          colorMode === "light"
                                            ? "#1C1F20"
                                            : "white"
                                        }
                                      >
                                        {username?.slice(0, 20)}
                                      </Text>
                                      <Text
                                        as="p"
                                        color={
                                          colorMode === "light"
                                            ? "#595B5D"
                                            : "rgb(255,255,255,0.5)"
                                        }
                                        fontSize="0.85rem"
                                        noOfLines={1}
                                      >
                                        {message.length > 0
                                          ? message
                                          : "Hey there! let's chat"}
                                      </Text>
                                    </Box>
                                    <Box width="20%" pl={5} pt={2}>
                                      <Text
                                        fontSize={
                                          sentAt == "👋" ? "1.2rem" : "0.9rem"
                                        }
                                        as="p"
                                      >
                                        {sentAt == "👋"
                                          ? sentAt
                                          : formatTimeStampAMPM(sentAt)}
                                      </Text>
                                    </Box>
                                  </Box>
                                </Center>
                              </Box>
                            )
                          )}
                      </>
                    )}

                    {showSkeleton && (
                      <>
                        {skeletons.map(() => (
                          <Box>
                            <Box d="flex" mt={3} pl={5}>
                              <Box
                                label="messages"
                                cursor="pointer"
                                width="2.3rem"
                                height="2.3rem"
                                borderRadius="50%"
                              >
                                <SkeletonCircle w="3rem" h="3rem" />
                              </Box>

                              <Box pl={5}>
                                <Box>
                                  <Skeleton w="22rem" height="4rem" />
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box
                width={["50%", "60%", "60%", "60%"]}
                bg="rgb(36, 38, 39,0.8)"
                height="100%"
                borderRadius="0px 5px 0px 0px"
              >
                <Box
                  overflowY="auto"
                  w="96%"
                  height="60vh"
                  ml={5}
                  mr={5}
                  socket={socket}
                >
                  {!isChatActive && (
                    <RobotComponent mode={colorMode} username={userName} />
                  )}

                  {isChatActive && (
                    <ScrollableFeed>
                      <Box
                        width="100%"
                        d="grid"
                        gridTemplateRows="4fr 4fr 4fr 4fr"
                        gap={5}
                        pt={5}
                        pb={5}
                      >
                        {chatSelected.length < 1 && (
                          <Box d="flex">
                            <Link to={`/profile/${selectedUserId}`}>
                              <Avatar
                                w={["2rem", "2.2rem", "2.2rem", "2.2rem"]}
                                h={["2rem", "2.2rem", "2.2rem", "2.2rem"]}
                                src={displayChatAvatar}
                                ml={2}
                                mt={1}
                              />
                            </Link>
                            <Box pl={[1, 3, 3, 3]}>
                              <Text
                                fontSize={[
                                  "0.95rem",
                                  "0.95rem",
                                  "1.1rem",
                                  "1.1rem",
                                  "1.1rem",
                                ]}
                                color="white"
                              >
                                {displayChatUsername}
                              </Text>
                              <Text
                                color="rgb(255,255,255,0.5)"
                                fontSize="0.85rem"
                              >
                                Hi there! let's chat
                              </Text>
                            </Box>
                          </Box>
                        )}

                        {chatsLoading ? (
                          <Center w="100%">
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
                          <>
                            {chatSelected?.map((message) => (
                              <>
                                {message.fromSelf ? (
                                  <Box
                                    w="auto"
                                    d="flex"
                                    justifyContent="right"
                                    pr={5}
                                  >
                                    <Center
                                      pr={3}
                                      textAlign="right"
                                      d={["none", "block", "block", "block"]}
                                    >
                                      <Text
                                        color="rgb(255,255,255,0.5)"
                                        fontSize={[
                                          "0.65rem",
                                          "0.8rem",
                                          "0.8rem",
                                          "0.8rem",
                                        ]}
                                      >
                                        {format(message.createdAt)}
                                      </Text>
                                    </Center>
                                    <Box>
                                      <Text
                                        color="white"
                                        bg="#4552FE"
                                        pl={[2, 5, 5, 5]}
                                        ml={2}
                                        pt={2}
                                        pb={2}
                                        pr={[2, 5, 5, 5]}
                                        borderRadius="10px 2px 10px 10px"
                                      >
                                        {message.message}
                                      </Text>
                                      <Center
                                        textAlign="right"
                                        d={["block", "none", "none", "none"]}
                                      >
                                        <Text
                                          color="rgb(255,255,255,0.5)"
                                          fontSize={[
                                            "0.65rem",
                                            "0.8rem",
                                            "0.8rem",
                                            "0.8rem",
                                          ]}
                                        >
                                          {format(message.createdAt)}
                                        </Text>
                                      </Center>
                                    </Box>
                                    <Avatar
                                      w="2rem"
                                      h="2rem"
                                      src={usernameAvatar}
                                      ml={2}
                                      mt={1}
                                    />
                                  </Box>
                                ) : (
                                  <Box w="auto" d="flex">
                                    <Link to={`/profile/${selectedUserId}`}>
                                      <Avatar
                                        w="2rem"
                                        h="2rem"
                                        src={selectedUserAvatar}
                                        ml={1}
                                        mt={1}
                                      />
                                    </Link>
                                    <Box>
                                      <Text
                                        color="white"
                                        bg="rgb(18, 19, 20,0.2)"
                                        pl={[2, 5, 5, 5]}
                                        ml={2}
                                        pt={2}
                                        pb={2}
                                        pr={[2, 5, 5, 5]}
                                        borderRadius="2px 10px 10px 10px"
                                      >
                                        {message.message}
                                      </Text>
                                      <Center
                                        d={["block", "none", "none", "none"]}
                                      >
                                        <Text
                                          color="rgb(255,255,255,0.5)"
                                          fontSize={[
                                            "0.65rem",
                                            "0.8rem",
                                            "0.8rem",
                                            "0.8rem",
                                          ]}
                                        >
                                          {format(message.createdAt)}
                                        </Text>
                                      </Center>
                                    </Box>
                                    <Center
                                      pl={[2, 5, 5, 5]}
                                      d={["none", "block", "block", "block"]}
                                    >
                                      <Text
                                        color="rgb(255,255,255,0.5)"
                                        fontSize={[
                                          "0.65rem",
                                          "0.8rem",
                                          "0.8rem",
                                          "0.8rem",
                                        ]}
                                      >
                                        {format(message.createdAt)}
                                      </Text>
                                    </Center>
                                  </Box>
                                )}
                              </>
                            ))}
                          </>
                        )}
                      </Box>
                    </ScrollableFeed>
                  )}
                </Box>
                <Box
                  height="10vh"
                  d="sticky"
                  width="100%"
                  borderRadius="0px 0px 5px 0px"
                  borderTop="1px solid rgb(255,255,255,0.3)"
                >
                  <Center width="100%" height="100%">
                    <Box w="95%" h="90%" d="flex">
                      <Box
                        pr={5}
                        pt={6}
                        cursor="pointer"
                        onClick={handleEmojiPickerhideShow}
                      >
                        <BsEmojiSmileFill fill="white" />
                        {showEmojiPicker && (
                          <Picker
                            pickerStyle={{
                              position: "absolute",
                              top: "38vh",
                              left: "45vw",
                            }}
                            onEmojiClick={handleEmojiClick}
                          />
                        )}
                      </Box>
                      <Input
                        color="white"
                        onKeyDown={keyDownHandler}
                        p={0}
                        isDisabled={!isChatActive}
                        value={message}
                        onChange={handleInputChange}
                        height="100%"
                        width="90%"
                        placeholder="Send a message"
                        border="none"
                        _focus={{ border: "none" }}
                      />

                      <Box pl={6} pt={1.5} d="flex">
                        <Button
                          color="white"
                          isDisabled={!isChatActive}
                          onClick={sendmessage}
                          _hover={{ bg: "rgb(69, 82, 254,0.8)" }}
                          _active={{ bg: "rgb(69, 82, 254,0.8)" }}
                          bg="#4552FE"
                          pb={1}
                          height="90%"
                          cursor="pointer"
                          textAlign="center"
                          rightIcon={<AiOutlineSend fill="white" />}
                        >
                          Send
                        </Button>
                      </Box>
                    </Box>
                  </Center>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Center>
    </Box>
  );
}

export default Messages;
