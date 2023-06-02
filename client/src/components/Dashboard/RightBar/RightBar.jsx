import React from "react";
import {
  Box,
  Center,
  Image,
  Text,
  Avatar,
  AvatarBadge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Tooltip,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { BsFillPersonFill } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import axie from "../../../assets/axie-infinity.png";
import alienworlds from "../../../assets/alienworlds.png";
import splinterlands from "../../../assets/splinterlands.png";
import { getUsers } from "../../../services/usersService";
import { AiFillCheckCircle } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useMetaMask } from "../../../hooks/useMetamask";
import { getWithExpiry, setWithExpiry } from "../Home/Home";

function RightBar() {
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const navigate = useNavigate();

  const [users, setUsers] = React.useState(() => {
    let value;
    try {
      value = JSON.parse(localStorage.getItem("myHomepageFriends")) || [];
    } catch (e) {}
    return value;
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [allusers, setAllUsers] = React.useState([]);

  const GetFavorites = async () => {
    try {
      let value;
      if (
        getWithExpiry("AllUsers") !== null &&
        getWithExpiry("AllUsers")[0] &&
        (getWithExpiry("AllUsers")[0]?.userId !== "null" ||
          getWithExpiry("AllUsers")[0]?.userId !== null)
      ) {
        value = getWithExpiry("AllUsers");
        setAllUsers(value);
      } else {
        const data = await getUsers();
        value = data?.data?.filter((e) => e.userId !== user);
        setAllUsers(value);
        setWithExpiry("AllUsers", value, 86400000);
      }

      if (
        localStorage.getItem("myHomepageFriends") === null ||
        users.length < 1
      ) {
        var values = value.sort(() => Math.random() * 3).slice(0, 4);
        setUsers(values);
        localStorage.setItem("myHomepageFriends", JSON.stringify(values));
      }
    } catch (e) {}
  };

  const AddFavorites = (userId) => {
    var followusers = users;
    const alluser = followusers.slice(0, 3);
    var all = allusers;
    var newu = all.filter((e) => e.userId == userId);
    alluser.unshift(newu[0]);
    setUsers(alluser);
    toast({
      title: `Added to favorite users successfully`,
      position: "top",
      status: "success",
      isClosable: true,
    });
    if (users.length > 4) {
      var vals = users.slice(0, 4);
      setAllUsers(
        allusers.filter((ar) => !vals.find((rm) => rm.userId === ar.userId))
      );
    }

    window.localStorage.setItem("myHomepageFriends", JSON.stringify(alluser));
  };
  React.useEffect(() => {
    GetFavorites();
  }, []);

  return (
    <Box
      position="fixed"
      pt
      d={["none", "none", "none", "block", "block"]}
      ml="92%"
      width={["0", "0", "8%", "8%", "8%"]}
      bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
      height="100vh"
    >
      <Center
        justifyContent="center"
        d="flex"
        flexDirection="column"
        alignContent="center"
        textAlign="center"
      >
        <Box
          label="Studio"
          cursor="pointer"
          bg={colorMode === "light" ? "#2D2D2E" : "rgb(39, 42, 45,0.61)"}
          mt={5}
          width="2.4rem"
          height="2.4rem"
          borderRadius="50%"
        >
          <Center height="100%">
            <BsFillPersonFill size="1.5rem" fill="white" />
          </Center>
        </Box>
        <Box
          mt={6}
          width={["auto", "3.2rem", "3.4rem", "3.4rem"]}
          height="16rem"
          borderRadius="60px"
          p={2.5}
        >
          <Center
            height="100%"
            d="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            {users.map(({ ProfileAvatar, isOnline, userId, username }) => (
              <Box
                label="Studio"
                cursor="pointer"
                bg="blue"
                width="2.2rem"
                height="2.2rem"
                borderRadius="50%"
              >
                <Link to={`/profile/${userId}`}>
                  <Tooltip
                    bg={colorMode === "light" ? "#1C1F20" : ""}
                    fontSize="1rem"
                    pt={1}
                    pb={1}
                    pr={3}
                    pl={3}
                    label={`${username?.slice(0, 12)}`}
                    placement="left"
                    borderRadius="50px"
                  >
                    <Avatar
                      name={`${username}`}
                      width="2.2rem"
                      height="2.2rem"
                      src={ProfileAvatar}
                    >
                      {isOnline ? (
                        <AvatarBadge
                          boxSize="1rem"
                          bg="#55D64F"
                          borderColor="#2D2D2E"
                        />
                      ) : (
                        <AvatarBadge
                          borderColor="#2D2D2E"
                          boxSize="1rem"
                          bg="grey"
                        />
                      )}
                    </Avatar>
                  </Tooltip>
                </Link>
              </Box>
            ))}

            <Box
              label="Studio"
              cursor="pointer"
              bg={colorMode === "light" ? "#2D2D2E" : "rgb(36, 38, 39,0.63)"}
              width="2.2rem"
              height="2.2rem"
              borderRadius="50%"
            >
              <Center height="100%">
                <AiOutlinePlus size="1.5rem" fill="white" onClick={onOpen} />
              </Center>
            </Box>
          </Center>
        </Box>

        <Box
          mt={10}
          width={["auto", "4rem", "4.5rem", "4.5rem"]}
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
            <Image
              onClick={() => {
                navigate("/videos/axie");
              }}
              src={axie}
              alt="axie"
              width="2.8rem"
              cursor="pointer"
            />
            <Image
              onClick={() => {
                navigate("/videos/splinterlands");
              }}
              src={splinterlands}
              alt="splinterlands"
              width="2rem"
              cursor="pointer"
            />
            <Image
              onClick={() => {
                navigate("/videos/alienworlds");
              }}
              src={alienworlds}
              alt="alienworlds"
              width="1.8rem"
              cursor="pointer"
            />
          </Center>
        </Box>
      </Center>

      <Modal
        size="lg"
        isOpen={isOpen}
        onClose={onClose}
        bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="5px"
          maxHeight="75vh"
          overflowY="auto"
          bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
        >
          <ModalCloseButton />
          <ModalBody
            pt={6}
            pb={6}
            bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
          >
            <Box
              d="grid"
              gridTemplateColumn="4fr 4fr"
              gap={5}
              rowGap={2}
              height="100%"
            >
              {allusers
                ?.filter((ar) => !users.find((rm) => rm.userId === ar.userId))
                .map(
                  ({
                    username,
                    ProfileAvatar,
                    followers,
                    isOnline,
                    isVerified,
                    userId,
                  }) => (
                    <Box pt={2} d="flex">
                      <Center width="100%">
                        <Box w="80%" d="flex">
                          <Box width="50%" d="flex">
                            <Box
                              label="Studio"
                              cursor="pointer"
                              width="2.3rem"
                              height="2.3rem"
                              borderRadius="50%"
                            >
                              <Link to={`/profile/${userId}`}>
                                <Avatar
                                  name="YoungBd"
                                  w="2.3rem"
                                  h="2.3rem"
                                  src={ProfileAvatar}
                                >
                                  {isOnline ? (
                                    <AvatarBadge
                                      boxSize="1rem"
                                      bg="#55D64F"
                                      borderColor="#2D2D2E"
                                    />
                                  ) : (
                                    <AvatarBadge
                                      borderColor="#2D2D2E"
                                      boxSize="1rem"
                                      bg="grey"
                                    />
                                  )}
                                </Avatar>
                              </Link>
                            </Box>

                            <Box pl={5}>
                              <Box d="flex">
                                <Text
                                  as="h3"
                                  color={
                                    colorMode === "light"
                                      ? "rgb(0,0,0,0.75)"
                                      : "#FFD600"
                                  }
                                  fontWeight="600"
                                  cursor="pointer"
                                >
                                  <Link to={`/profile/${userId}`}>
                                    {username.slice(0, 12)}
                                  </Link>
                                </Text>
                                {isVerified && (
                                  <Box pl={2} pt={1}>
                                    <AiFillCheckCircle
                                      fill={
                                        colorMode === "light"
                                          ? "#5B61FB"
                                          : "#FFD600"
                                      }
                                    />
                                  </Box>
                                )}
                              </Box>

                              <Text
                                as="h2"
                                color={
                                  colorMode === "light" ? "#595B5D" : "#808589"
                                }
                                fontSize="0.8rem"
                              >
                                {followers.length}{" "}
                                {followers.length > 2
                                  ? "Followers"
                                  : "Follower"}
                              </Text>
                            </Box>
                          </Box>

                          <Box width="50%" d="flex" pl={5} pt={1}>
                            <Box d="flex" width="100%" justifyContent="right">
                              <Button
                                onClick={() => AddFavorites(userId)}
                                _hover={{
                                  bg: "rgb(255,255,255,0.1)",
                                }}
                                _active={{ bg: "transparent" }}
                                bg="transparent"
                                border={
                                  colorMode === "light"
                                    ? "1px solid #1C1F20"
                                    : "1px solid white"
                                }
                                pb={1}
                                borderRadius="5px"
                                height="2rem"
                                width="7rem"
                              >
                                + Add
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </Center>
                    </Box>
                  )
                )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default RightBar;
