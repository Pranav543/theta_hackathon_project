import React from "react";
import {
  Box,
  Text,
  Image,
  Avatar,
  Center,
  Button,
  Divider,
  Link,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useToast,
  Popover,
  useColorMode,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Spinner,
} from "@chakra-ui/react";
import { FaMedal, FaFilter } from "react-icons/fa";
import Carousel from "nuka-carousel";
import bg from "../../../assets/bg.png";
import { BiVideoPlus } from "react-icons/bi";
import { AiFillCheckCircle } from "react-icons/ai";
import axie from "../../../assets/axie.png";
import pubg from "../../../assets/pubg.png";
import sandbox from "../../../assets/sandbox.webp";
import metacratch from "../../../assets/metacratch.webp";
import metacratchLight from "../../../assets/metacratch-light.webp";
import "./style.css";
import { Link as RouterLink } from "react-router-dom";
import { getHomePageLives } from "../../../services/liveService";
import { getHomePageVideos } from "../../../services/videoService";
import {
  getVerifiedUsers,
  getOnlineUsers,
} from "../../../services/usersService";
import FollowerComponent from "../Followers/FollowerComponent";
import { useNavigate } from "react-router-dom";
import { useMetaMask } from "../../../hooks/useMetamask";
import { format } from "timeago.js";

export function setWithExpiry(key, value, ttl) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  // if the item doesn't exist, return null
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage
    // and return null
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

function Home() {
  const { colorMode } = useColorMode();
  const [activeLink, setActiveLink] = React.useState(1);
  const navigate = useNavigate();
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const [route, setRoute] = React.useState("/lives");
  const defaultThumbnail = "https://i.stack.imgur.com/XZDsP.jpg";
  document.title = `Home`;
  const [showSkeleton, setShowSkeleton] = React.useState(true);
  const [showUserSkeleton, setShowUserSkeleton] = React.useState(true);
  const [showVideoSkeleton, setShowVideoSkeleton] = React.useState(true);
  const [showSpinner, setShowSpinner] = React.useState(true);
  const skeletons =
    window.screen.height * window.devicePixelRatio >= 1600
      ? [0, 1, 2, 3, 4, 5, 6, 7]
      : [0, 1, 2, 3];
  const [allLives, setAllLives] = React.useState([]);
  const [videos, setVideos] = React.useState([]);
  const [online, setOnline] = React.useState([]);
  const [verified, setVerified] = React.useState([]);
  const toast = useToast();
  const categories = [
    "crypto",
    "gaming",
    "play 2 earn",
    "lifectyle",
    "educational",
    "sports",
    "travel & events",
    "film & animation",
    "people & blogs",
  ];

  const getStreams = async () => {
    try {
      const live = await getHomePageLives(
        window.screen.height * window.devicePixelRatio >= 1600 ? 8 : 4
      );
      var lives = [];
      live?.data?.map((data) => {
        if (data.isActive) {
          lives.push(data);
        }
      });
      setAllLives(lives);
      setShowSkeleton(false);
      if (getWithExpiry("AllVerifiedUsers") !== null) {
        let allverified = getWithExpiry("AllVerifiedUsers");
        setVerified(allverified);
        setShowUserSkeleton(false);
        setShowSpinner(false);
      } else {
        const verifiedUsers = await getVerifiedUsers();
        var allverif = [];
        verifiedUsers.data
          .sort(function (a, b) {
            return b.followers.length - a.followers.length;
          })
          .map((users) => {
            var isFollowing = false;
            if (users.followers.includes(user)) {
              isFollowing = true;
            }

            var VerifiedUsersData = {
              userId: users.userId,
              followers: users.followers,
              isOnline: users.isOnline,
              ProfileAvatar: users.ProfileAvatar,
              username: users.username,
              isVerified: users.isVerified,
              follow: isFollowing,
            };
            setVerified((verified) => [...verified, VerifiedUsersData]);
            allverif.push(VerifiedUsersData);
            setShowUserSkeleton(false);
            setShowSpinner(false);
          });
        setWithExpiry("AllVerifiedUsers", allverif, 86400000);
      }

      const onlineUsers = await getOnlineUsers();
      onlineUsers.data
        .sort(function (a, b) {
          return b.followers.length - a.followers.length;
        })
        .map((users) => {
          var isFollowing = false;
          if (users.followers.includes(user)) {
            isFollowing = true;
          }

          var OnlineUsersdata = {
            userId: users.userId,
            followers: users.followers,
            isOnline: users.isOnline,
            ProfileAvatar: users.ProfileAvatar,
            username: users.username,
            isVerified: users.isVerified,
            follow: isFollowing,
          };

          setOnline((online) => [...online, OnlineUsersdata]);
          setShowSpinner(false);
        });
      const video = await getHomePageVideos(
        window.screen.height * window.devicePixelRatio >= 1600 ? 8 : 4
      );
      setVideos(video?.data);
      setShowVideoSkeleton(false);
    } catch (e) {
      setShowVideoSkeleton(false);
    }
  };

  React.useState(() => {
    getStreams();
  }, []);

  class PagingDots extends React.Component {
    getIndexes(count, inc) {
      const arr = [];
      for (let i = 0; i < count; i += inc) {
        arr.push(i);
      }
      return arr;
    }

    getListStyles() {
      return {
        position: "absolute",
        margin: (-25, 0, 25, 0),
        padding: 0,
        display: "flex",
      };
    }

    getListItemStyles() {
      return {
        listStyleType: "none",
        display: "inline-block",
      };
    }

    getButtonStyles(active) {
      return {
        border: 0,
        position: "relative",
        color: colorMode === "light" ? "black" : "white",
        cursor: "pointer",
        outline: 0,
        padding: 2,
        fontSize: 28,
        opacity: active ? 1 : 0.5,
      };
    }

    render() {
      const indexes = this.getIndexes(
        this.props.slideCount,
        this.props.slidesToScroll
      );
      return (
        <ul style={this.getListStyles()}>
          {indexes.map((index) => {
            return (
              <li style={this.getListItemStyles()} key={index}>
                <button
                  style={this.getButtonStyles(
                    this.props.currentSlide === index
                  )}
                  onClick={this.props.goToSlide.bind(null, index)}
                >
                  {this.props.currentSlide === index ? (
                    <Box
                      width="2rem"
                      borderRadius="50px"
                      height="0.35rem"
                      color={colorMode === "light" ? "black" : "white"}
                      bg={colorMode === "light" ? "black" : "white"}
                    ></Box>
                  ) : (
                    <Box
                      width="0.4rem"
                      height="0.4rem"
                      borderRadius="50%"
                      bg="#595B5D"
                    ></Box>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      );
    }
  }

  const filterContent = (filter) => {
    if (filter.length > 0) {
      navigate(`/videos/${filter}`);
    }
  };

  return (
    <Center
      w="100%"
      h="auto"
      position="relative"
      ml={["0%", "0%", "0%", "12.2%", "12.2%", "12.2%"]}
      mt={["22%", "18%", "13.5%", "10%", "10%", "8.2%"]}
    >
      <Box w={["95%", "95%", "95%", "100%", "100%", "100%"]}>
        {/* Carousel and Top Streamers blocks */}

        <Box
          d={["none", "none", "none", "none", "flex", "flex"]}
          width="100%"
          maxW="100%"
          height="34%"
          borderRadius="20px"
          columnGap={[0, 0, 10, 10, 12, 16]}
        >
          <Box width="60%" maxW="100%">
            <Carousel
              enableKeyboardControls={true}
              renderBottomCenterControls={(props) => <PagingDots {...props} />}
              autoplay={true}
              autoplayInterval={8000}
              wrapAround={true}
              renderCenterLeftControls={() => null}
              renderCenterRightControls={() => null}
            >
              <Box
                width="100%"
                height="100%"
                bg={
                  colorMode === "light" ? "#5B61FB" : "rgb(123, 91, 251,0.91)"
                }
                borderRadius="20px"
              >
                <Box d="flex">
                  <Box width="50%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="93%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={4}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.6rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch P2E Tournaments Anywhere Anytime
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="1rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="80%"
                        >
                          Watch your favorite streamers & players only on Cratch
                        </Text>
                        <RouterLink to="/lives">
                          <Button
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={4}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </RouterLink>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    width="48%"
                    height="auto"
                    d={["none", "none", "block", "block"]}
                  >
                    <Image src={bg} ml={10} width="88%" />
                  </Box>
                </Box>
              </Box>

              <Box
                width="100%"
                height="100%"
                bg="linear-gradient(0deg, #243B4B 0%, #ffffdb 100%)"
                borderRadius="20px"
              >
                <Box d="flex">
                  <Box width="50%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="93%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={4}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.6rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch PUBG Global Championship
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="1rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="75%"
                        >
                          Enjoy watching one of the biggest PUBG event this
                          year.
                        </Text>
                        <Button
                          onClick={() => {
                            toast({
                              title: `Coming soon`,
                              position: "top",
                              isClosable: true,
                            });
                          }}
                          fontWeight="bold"
                          _active={{ bg: "rgb(255,255,255,0.95)" }}
                          _hover={{ bg: "rgb(255,255,255,0.95)" }}
                          mt={4}
                          bg="rgb(255,255,255,0.85)"
                          color="#595B5D"
                          borderRadius="50px"
                        >
                          Watch Now
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    width="48%"
                    height="auto"
                    d={["none", "none", "block", "block"]}
                  >
                    <Image src={pubg} ml={5} width="98%" />
                  </Box>
                </Box>
              </Box>

              <Box
                width="100%"
                height="100%"
                bg="radial-gradient(circle at top, #00D0AA , #81BF7F)"
                borderRadius="20px"
              >
                <Box d="flex">
                  <Box width="50%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="93%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={4}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.6rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch Axie Infinity: Battle of the Guilds
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="1rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="75%"
                        >
                          Watch Axie Infinity tournaments only on Cratch, and
                          win valuable prizes
                        </Text>
                        <Button
                          onClick={() => {
                            toast({
                              title: `Coming soon`,
                              position: "top",
                              isClosable: true,
                            });
                          }}
                          fontWeight="bold"
                          _active={{ bg: "rgb(255,255,255,0.95)" }}
                          _hover={{ bg: "rgb(255,255,255,0.95)" }}
                          mt={4}
                          bg="rgb(255,255,255,0.85)"
                          color="#595B5D"
                          borderRadius="50px"
                        >
                          Watch Now
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    width="48%"
                    height="auto"
                    d={["none", "none", "block", "block"]}
                  >
                    <Image src={axie} ml={10} width="79%" />
                  </Box>
                </Box>
              </Box>

              <Box
                width="100%"
                height="100%"
                bg="linear-gradient(0deg, #233C89 0%, #7A2261 100%)"
                borderRadius="20px"
              >
                <Box d="flex">
                  <Box width="50%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="93%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={4}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.6rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch The Sandbox Alpha Season 3
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="1rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="80%"
                        >
                          Watch events live on MetaCratch, and join the
                          Metaverse community
                        </Text>
                        <Link href="https://meta.cratch.io" isExternal>
                          <Button
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={4}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </Link>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    width="48%"
                    height="auto"
                    d={["none", "none", "block", "block"]}
                  >
                    <Image pb={3.5} src={sandbox} ml={10} width="100%" />
                  </Box>
                </Box>
              </Box>
            </Carousel>
          </Box>

          {colorMode === "dark" && (
            <Box width="35%" bg="rgb(36, 38, 39,0.63)" borderRadius="20px">
              <Text
                as="h1"
                fontSize="1.6rem"
                fontWeight="bold"
                pt={
                  window.screen.height * window.devicePixelRatio >= 1600 ? 3 : 1
                }
                pl={6}
              >
                Top Streamers
              </Text>
              <Box pt={2} pl={6} d="flex">
                <Center>
                  <FaMedal size="1.5rem" fill="#FFD600" />
                  <Box
                    ml={6}
                    label="Studio"
                    cursor="pointer"
                    width="2.3rem"
                    height="2.3rem"
                    borderRadius="50%"
                  >
                    <RouterLink to={`/profile/${verified[0]?.userId}`}>
                      <Avatar
                        name="YoungBd"
                        src={verified[0]?.ProfileAvatar}
                        w="2.3rem"
                        h="2.3rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="#FFD600"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[0]?.userId}`}>
                            {verified[0]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#FFD600" />
                      </Box>
                    </Box>

                    <Text as="h2" color="#595B5D" fontSize="0.8rem">
                      {verified[0]?.followers?.length}{" "}
                      {verified[0]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    _hover={{
                      bg: "rgb(123, 91, 251)",
                    }}
                    _active={{ bg: "rgb(123, 91, 251)" }}
                    bg="rgb(123, 91, 251,0.92)"
                    leftIcon={<BiVideoPlus size="1.4rem" fill="white" />}
                    ml="4.6rem"
                    borderRadius="50"
                    height="2rem"
                    width="7rem"
                  >
                    Axie
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={6} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.3rem"
                    fontWeight="bold"
                    color="#595B5D"
                  >
                    02
                  </Text>
                  <Box
                    ml={6}
                    label="Studio"
                    cursor="pointer"
                    width="2.3rem"
                    height="2.3rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[1]?.userId}`}>
                      <Avatar
                        name="NatalyKey"
                        w="2.3rem"
                        h="2.3rem"
                        src={verified[1]?.ProfileAvatar}
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="#FFD600"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[1]?.userId}`}>
                            {verified[1]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#FFD600" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#595B5D" fontSize="0.8rem">
                      {verified[1]?.followers?.length}{" "}
                      {verified[1]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    _hover={{
                      bg: "rgb(129, 191, 127,0.8)",
                    }}
                    _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                    bg="#81BF7F"
                    leftIcon={<BiVideoPlus size="1.4rem" fill="white" />}
                    ml="4.8rem"
                    borderRadius="50"
                    height="2rem"
                    width="7rem"
                  >
                    Mobox
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={6} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.3rem"
                    fontWeight="bold"
                    color="#595B5D"
                  >
                    03
                  </Text>
                  <Box
                    ml={6}
                    label="Studio"
                    cursor="pointer"
                    width="2.3rem"
                    height="2.3rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[2]?.userId}`}>
                      {" "}
                      <Avatar
                        name="DavinciJ15"
                        src={verified[2]?.ProfileAvatar}
                        w="2.3rem"
                        h="2.3rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="#FFD600"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[2]?.userId}`}>
                            {verified[2]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#FFD600" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#595B5D" fontSize="0.8rem">
                      {verified[2]?.followers?.length}{" "}
                      {verified[2]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    _hover={{
                      bg: "rgb(223, 215, 42,0.9)",
                    }}
                    _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                    bg="rgb(223, 215, 42,0.8)"
                    leftIcon={<BiVideoPlus size="1.4rem" fill="white" />}
                    ml="4.7rem"
                    borderRadius="50"
                    height="2rem"
                    width="7rem"
                  >
                    Alien W
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
            </Box>
          )}

          {colorMode === "light" && (
            <Box width="35%" bg="#1C1F20" borderRadius="20px">
              <Text
                as="h1"
                fontSize="1.6rem"
                fontWeight="bold"
                pt={
                  window.screen.height * window.devicePixelRatio >= 1600 ? 3 : 1
                }
                pl={6}
                color="white"
              >
                Top Streamers
              </Text>
              <Box pt={2} pl={6} d="flex">
                <Center>
                  <FaMedal size="1.5rem" fill="#5B61FB" />
                  <Box
                    ml={6}
                    label="Studio"
                    cursor="pointer"
                    width="2.3rem"
                    height="2.3rem"
                    borderRadius="50%"
                  >
                    <RouterLink to={`/profile/${verified[0]?.userId}`}>
                      <Avatar
                        name="YoungBd"
                        src={verified[0]?.ProfileAvatar}
                        w="2.3rem"
                        h="2.3rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="white"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[0]?.userId}`}>
                            {verified[0]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#5B61FB" />
                      </Box>
                    </Box>

                    <Text as="h2" color="#828282" fontSize="0.8rem">
                      {verified[0]?.followers?.length}{" "}
                      {verified[0]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    _hover={{
                      bg: "rgb(123, 91, 251)",
                    }}
                    _active={{ bg: "rgb(123, 91, 251)" }}
                    bg="rgb(123, 91, 251,0.92)"
                    leftIcon={<BiVideoPlus size="1.4rem" fill="white" />}
                    ml="4.6rem"
                    borderRadius="50"
                    height="2rem"
                    width="7rem"
                  >
                    Axie
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={6} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.3rem"
                    fontWeight="bold"
                    color="#A6A6A6"
                  >
                    02
                  </Text>
                  <Box
                    ml={6}
                    label="Studio"
                    cursor="pointer"
                    width="2.3rem"
                    height="2.3rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[1]?.userId}`}>
                      <Avatar
                        name="NatalyKey"
                        w="2.3rem"
                        h="2.3rem"
                        src={verified[1]?.ProfileAvatar}
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="white"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[1]?.userId}`}>
                            {verified[1]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#5B61FB" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#828282" fontSize="0.8rem">
                      {verified[1]?.followers?.length}{" "}
                      {verified[1]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    _hover={{
                      bg: "rgb(129, 191, 127,0.8)",
                    }}
                    _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                    bg="#81BF7F"
                    leftIcon={<BiVideoPlus size="1.4rem" fill="white" />}
                    ml="4.8rem"
                    borderRadius="50"
                    height="2rem"
                    width="7rem"
                  >
                    Mobox
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={6} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.3rem"
                    fontWeight="bold"
                    color="#A6A6A6"
                  >
                    03
                  </Text>
                  <Box
                    ml={6}
                    label="Studio"
                    cursor="pointer"
                    width="2.3rem"
                    height="2.3rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[2]?.userId}`}>
                      {" "}
                      <Avatar
                        name="DavinciJ15"
                        src={verified[2]?.ProfileAvatar}
                        w="2.3rem"
                        h="2.3rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="white"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[2]?.userId}`}>
                            {verified[2]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#5B61FB" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#828282" fontSize="0.8rem">
                      {verified[2]?.followers?.length}{" "}
                      {verified[2]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    _hover={{
                      bg: "rgb(223, 215, 42,0.9)",
                    }}
                    _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                    bg="rgb(223, 215, 42,0.8)"
                    leftIcon={<BiVideoPlus size="1.4rem" fill="white" />}
                    ml="4.7rem"
                    borderRadius="50"
                    height="2rem"
                    width="7rem"
                  >
                    Alien W
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
            </Box>
          )}
        </Box>

        <Box
          d={["none", "none", "none", "flex", "none", "none"]}
          width="100%"
          maxW="100%"
          height="34%"
          borderRadius="20px"
          columnGap={[0, 0, 10, 10, 12, 16]}
        >
          <Box width="60%" maxW="100%">
            <Carousel
              enableKeyboardControls={true}
              renderBottomCenterControls={(props) => <PagingDots {...props} />}
              autoplay={true}
              autoplayInterval={8000}
              wrapAround={true}
              renderCenterLeftControls={() => null}
              renderCenterRightControls={() => null}
            >
              <Box
                width="100%"
                height="100%"
                bg={
                  colorMode === "light" ? "#5B61FB" : "rgb(123, 91, 251,0.91)"
                }
                borderRadius="20px"
              >
                <Box
                  d="flex"
                  bgImage={`url('${bg}')`}
                  bgSize="contain"
                  bgPosition="right"
                  bgRepeat="no-repeat"
                >
                  <Box width="60%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="98%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={3} pt={2}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.4rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch P2E Tournaments Anywhere Anytime
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="0.9rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="80%"
                        >
                          Watch your favorite streamers & players only on Cratch
                        </Text>
                        <RouterLink to="/lives">
                          <Button
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={4}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </RouterLink>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                width="100%"
                height="100%"
                bg="linear-gradient(0deg, #243B4B 0%, #ffffdb 100%)"
                borderRadius="20px"
              >
                <Box
                  d="flex"
                  bgImage={`url('${pubg}')`}
                  bgSize="contain"
                  bgPosition="right"
                  bgRepeat="no-repeat"
                >
                  <Box width="60%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="98%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={2}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.4rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch PUBG Global Championship
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="0.9rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="75%"
                        >
                          Enjoy watching one of the biggest PUBG event this
                          year.
                        </Text>
                        <Button
                          onClick={() => {
                            toast({
                              title: `Coming soon`,
                              position: "top",
                              isClosable: true,
                            });
                          }}
                          fontWeight="bold"
                          _active={{ bg: "rgb(255,255,255,0.95)" }}
                          _hover={{ bg: "rgb(255,255,255,0.95)" }}
                          mt={4}
                          bg="rgb(255,255,255,0.85)"
                          color="#595B5D"
                          borderRadius="50px"
                        >
                          Watch Now
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                width="100%"
                height="100%"
                bg="radial-gradient(circle at top, #00D0AA , #81BF7F)"
                borderRadius="20px"
              >
                <Box
                  d="flex"
                  bgImage={`url('${axie}')`}
                  bgSize="contain"
                  bgPosition="right"
                  bgRepeat="no-repeat"
                >
                  <Box width="60%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="98%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={2}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.4rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch Axie Infinity: Battle of the Guilds
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="0.9rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="75%"
                        >
                          Watch Axie Infinity tournaments only on Cratch, and
                          win valuable prizes
                        </Text>
                        <Button
                          onClick={() => {
                            toast({
                              title: `Coming soon`,
                              position: "top",
                              isClosable: true,
                            });
                          }}
                          fontWeight="bold"
                          _active={{ bg: "rgb(255,255,255,0.95)" }}
                          _hover={{ bg: "rgb(255,255,255,0.95)" }}
                          mt={4}
                          bg="rgb(255,255,255,0.85)"
                          color="#595B5D"
                          borderRadius="50px"
                        >
                          Watch Now
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                width="100%"
                height="100%"
                bg="linear-gradient(0deg, #233C89 0%, #7A2261 100%)"
                borderRadius="20px"
              >
                <Box
                  d="flex"
                  bgImage={`url('${sandbox}')`}
                  bgSize="contain"
                  bgPosition="right"
                  bgRepeat="no-repeat"
                >
                  <Box width="60%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="98%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={2}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.4rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch The Sandbox Alpha Season 3
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="0.9rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="80%"
                        >
                          Watch events live on MetaCratch, and join the
                          Metaverse community
                        </Text>
                        <Link href="https://meta.cratch.io" isExternal>
                          <Button
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={4}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </Link>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Carousel>
          </Box>

          {colorMode === "dark" && (
            <Box width="35%" bg="rgb(36, 38, 39,0.63)" borderRadius="20px">
              <Text as="h1" fontSize="1.6rem" fontWeight="bold" pt={1} pl={3}>
                Top Streamers
              </Text>
              <Box pt={2} pl={3} d="flex">
                <Center>
                  <FaMedal size="1.5rem" fill="#FFD600" />
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    <RouterLink to={`/profile/${verified[0]?.userId}`}>
                      <Avatar
                        name="YoungBd"
                        src={verified[0]?.ProfileAvatar}
                        w="2.2rem"
                        h="2.2rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="#FFD600"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[0]?.userId}`}>
                            {verified[0]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#FFD600" />
                      </Box>
                    </Box>

                    <Text as="h2" color="#595B5D" fontSize="0.8rem">
                      {verified[0]?.followers?.length}{" "}
                      {verified[0]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(123, 91, 251)",
                    }}
                    _active={{ bg: "rgb(123, 91, 251)" }}
                    bg="rgb(123, 91, 251,0.92)"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Axie
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={3} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.2rem"
                    fontWeight="bold"
                    color="#595B5D"
                  >
                    02
                  </Text>
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[1]?.userId}`}>
                      <Avatar
                        name="NatalyKey"
                        w="2.2rem"
                        h="2.2rem"
                        src={verified[1]?.ProfileAvatar}
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="#FFD600"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[1]?.userId}`}>
                            {verified[1]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#FFD600" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#595B5D" fontSize="0.8rem">
                      {verified[1]?.followers?.length}{" "}
                      {verified[1]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(129, 191, 127,0.8)",
                    }}
                    _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                    bg="#81BF7F"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2.2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Mobox
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={3} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.2rem"
                    fontWeight="bold"
                    color="#595B5D"
                  >
                    03
                  </Text>
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[2]?.userId}`}>
                      {" "}
                      <Avatar
                        name="DavinciJ15"
                        src={verified[2]?.ProfileAvatar}
                        w="2.2rem"
                        h="2.2rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="#FFD600"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[2]?.userId}`}>
                            {verified[2]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#FFD600" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#595B5D" fontSize="0.8rem">
                      {verified[2]?.followers?.length}{" "}
                      {verified[2]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(223, 215, 42,0.9)",
                    }}
                    _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                    bg="rgb(223, 215, 42,0.8)"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Alien W
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
            </Box>
          )}

          {colorMode === "light" && (
            <Box width="35%" bg="#1C1F20" borderRadius="20px">
              <Text
                as="h1"
                fontSize="1.6rem"
                fontWeight="bold"
                pt={1}
                pl={3}
                color="white"
              >
                Top Streamers
              </Text>
              <Box pt={2} pl={3} d="flex">
                <Center>
                  <FaMedal size="1.5rem" fill="#5B61FB" />
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    <RouterLink to={`/profile/${verified[0]?.userId}`}>
                      <Avatar
                        name="YoungBd"
                        src={verified[0]?.ProfileAvatar}
                        w="2.2rem"
                        h="2.2rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="white"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[0]?.userId}`}>
                            {verified[0]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#5B61FB" />
                      </Box>
                    </Box>

                    <Text as="h2" color="#828282" fontSize="0.8rem">
                      {verified[0]?.followers?.length}{" "}
                      {verified[0]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(123, 91, 251)",
                    }}
                    _active={{ bg: "rgb(123, 91, 251)" }}
                    bg="rgb(123, 91, 251,0.92)"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Axie
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={3} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.2rem"
                    fontWeight="bold"
                    color="#A6A6A6"
                  >
                    02
                  </Text>
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[1]?.userId}`}>
                      <Avatar
                        name="NatalyKey"
                        w="2.2rem"
                        h="2.2rem"
                        src={verified[1]?.ProfileAvatar}
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="white"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[1]?.userId}`}>
                            {verified[1]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#5B61FB" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#828282" fontSize="0.8rem">
                      {verified[1]?.followers?.length}{" "}
                      {verified[1]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(129, 191, 127,0.8)",
                    }}
                    _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                    bg="#81BF7F"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2.2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Mobox
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={3} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.2rem"
                    fontWeight="bold"
                    color="#A6A6A6"
                  >
                    03
                  </Text>
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[2]?.userId}`}>
                      {" "}
                      <Avatar
                        name="DavinciJ15"
                        src={verified[2]?.ProfileAvatar}
                        w="2.2rem"
                        h="2.2rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="white"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[2]?.userId}`}>
                            {verified[2]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#5B61FB" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#828282" fontSize="0.8rem">
                      {verified[2]?.followers?.length}{" "}
                      {verified[2]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(223, 215, 42,0.9)",
                    }}
                    _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                    bg="rgb(223, 215, 42,0.8)"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Alien W
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
            </Box>
          )}
        </Box>

        <Box
          d={["none", "none", "flex", "none", "none", "none"]}
          width="100%"
          maxW="100%"
          height="34%"
          borderRadius="20px"
          columnGap={[0, 0, 10, 10, 12, 16]}
        >
          <Box width="55%" maxW="100%">
            <Carousel
              enableKeyboardControls={true}
              renderBottomCenterControls={(props) => <PagingDots {...props} />}
              autoplay={true}
              autoplayInterval={8000}
              wrapAround={true}
              renderCenterLeftControls={() => null}
              renderCenterRightControls={() => null}
            >
              <Box
                width="100%"
                height="100%"
                bg={
                  colorMode === "light" ? "#5B61FB" : "rgb(123, 91, 251,0.91)"
                }
                borderRadius="20px"
              >
                <Box
                  d="flex"
                  bgImage={`url('${bg}')`}
                  bgSize="contain"
                  bgPosition="right"
                  bgRepeat="no-repeat"
                >
                  <Box width="80%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="98%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={3} pt={2}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.2rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch P2E Tournaments Anywhere Anytime
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="0.9rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="80%"
                        >
                          Watch your favorite streamers & players only on Cratch
                        </Text>
                        <RouterLink to="/lives">
                          <Button
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={4}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </RouterLink>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                width="100%"
                height="100%"
                bg="linear-gradient(0deg, #243B4B 0%, #ffffdb 100%)"
                borderRadius="20px"
              >
                <Box
                  d="flex"
                  bgImage={`url('${pubg}')`}
                  bgSize="contain"
                  bgPosition="right"
                  bgRepeat="no-repeat"
                >
                  <Box width="80%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="98%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={2}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.2rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch PUBG Global Championship
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="0.9rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="75%"
                        >
                          Enjoy watching one of the biggest PUBG event this
                          year.
                        </Text>
                        <Button
                          onClick={() => {
                            toast({
                              title: `Coming soon`,
                              position: "top",
                              isClosable: true,
                            });
                          }}
                          fontWeight="bold"
                          _active={{ bg: "rgb(255,255,255,0.95)" }}
                          _hover={{ bg: "rgb(255,255,255,0.95)" }}
                          mt={4}
                          bg="rgb(255,255,255,0.85)"
                          color="#595B5D"
                          borderRadius="50px"
                        >
                          Watch Now
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                width="100%"
                height="100%"
                bg="radial-gradient(circle at top, #00D0AA , #81BF7F)"
                borderRadius="20px"
              >
                <Box
                  d="flex"
                  bgImage={`url('${axie}')`}
                  bgSize="contain"
                  bgPosition="right"
                  bgRepeat="no-repeat"
                >
                  <Box width="80%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="98%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={2}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.2rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch Axie Infinity: Battle of the Guilds
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="0.9rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="75%"
                        >
                          Watch Axie Infinity tournaments only on Cratch, and
                          win valuable prizes
                        </Text>
                        <Button
                          onClick={() => {
                            toast({
                              title: `Coming soon`,
                              position: "top",
                              isClosable: true,
                            });
                          }}
                          fontWeight="bold"
                          _active={{ bg: "rgb(255,255,255,0.95)" }}
                          _hover={{ bg: "rgb(255,255,255,0.95)" }}
                          mt={4}
                          bg="rgb(255,255,255,0.85)"
                          color="#595B5D"
                          borderRadius="50px"
                        >
                          Watch Now
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                width="100%"
                height="100%"
                bg="linear-gradient(0deg, #233C89 0%, #7A2261 100%)"
                borderRadius="20px"
              >
                <Box
                  d="flex"
                  bgImage={`url('${sandbox}')`}
                  bgSize="contain"
                  bgPosition="right"
                  bgRepeat="no-repeat"
                >
                  <Box width="80%">
                    <Box
                      bg="rgb(1, 1, 1,0.27)"
                      height="98%"
                      mt={2}
                      borderRadius="20px"
                      ml={5}
                    >
                      <Box pl={5} pt={2}>
                        <Text
                          as="h4"
                          fontSize="0.8rem"
                          color="rgb(255, 255, 255,0.66)"
                        >
                          #TRENDING
                        </Text>
                        <Text
                          as="h1"
                          fontSize="1.2rem"
                          fontWeight="bold"
                          lineHeight="2rem"
                          color="white"
                          width="90%"
                        >
                          Watch The Sandbox Alpha Season 3
                        </Text>
                        <Text
                          pt={2.5}
                          as="p"
                          fontFamily="Archivo-Light"
                          fontSize="0.9rem"
                          color="rgb(255, 255, 255,0.66)"
                          width="80%"
                        >
                          Watch events live on MetaCratch, and join the
                          Metaverse community
                        </Text>
                        <Link href="https://meta.cratch.io" isExternal>
                          <Button
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={4}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </Link>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Carousel>
          </Box>

          {colorMode === "dark" && (
            <Box width="40%" bg="rgb(36, 38, 39,0.63)" borderRadius="20px">
              <Text as="h1" fontSize="1.6rem" fontWeight="bold" pt={1} pl={3}>
                Top Streamers
              </Text>
              <Box pt={2} pl={3} d="flex">
                <Center>
                  <FaMedal size="1.5rem" fill="#FFD600" />
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    <RouterLink to={`/profile/${verified[0]?.userId}`}>
                      <Avatar
                        name="YoungBd"
                        src={verified[0]?.ProfileAvatar}
                        w="2.2rem"
                        h="2.2rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="#FFD600"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[0]?.userId}`}>
                            {verified[0]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#FFD600" />
                      </Box>
                    </Box>

                    <Text as="h2" color="#595B5D" fontSize="0.8rem">
                      {verified[0]?.followers?.length}{" "}
                      {verified[0]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(123, 91, 251)",
                    }}
                    _active={{ bg: "rgb(123, 91, 251)" }}
                    bg="rgb(123, 91, 251,0.92)"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Axie
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={3} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.2rem"
                    fontWeight="bold"
                    color="#595B5D"
                  >
                    02
                  </Text>
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[1]?.userId}`}>
                      <Avatar
                        name="NatalyKey"
                        w="2.2rem"
                        h="2.2rem"
                        src={verified[1]?.ProfileAvatar}
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="#FFD600"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[1]?.userId}`}>
                            {verified[1]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#FFD600" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#595B5D" fontSize="0.8rem">
                      {verified[1]?.followers?.length}{" "}
                      {verified[1]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(129, 191, 127,0.8)",
                    }}
                    _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                    bg="#81BF7F"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2.2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Mobox
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={3} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.2rem"
                    fontWeight="bold"
                    color="#595B5D"
                  >
                    03
                  </Text>
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[2]?.userId}`}>
                      {" "}
                      <Avatar
                        name="DavinciJ15"
                        src={verified[2]?.ProfileAvatar}
                        w="2.2rem"
                        h="2.2rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="#FFD600"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[2]?.userId}`}>
                            {verified[2]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#FFD600" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#595B5D" fontSize="0.8rem">
                      {verified[2]?.followers?.length}{" "}
                      {verified[2]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(223, 215, 42,0.9)",
                    }}
                    _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                    bg="rgb(223, 215, 42,0.8)"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Alien W
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
            </Box>
          )}

          {colorMode === "light" && (
            <Box width="40%" bg="#1C1F20" borderRadius="20px">
              <Text
                as="h1"
                fontSize="1.6rem"
                fontWeight="bold"
                pt={1}
                pl={3}
                color="white"
              >
                Top Streamers
              </Text>
              <Box pt={2} pl={3} d="flex">
                <Center>
                  <FaMedal size="1.5rem" fill="#5B61FB" />
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    <RouterLink to={`/profile/${verified[0]?.userId}`}>
                      <Avatar
                        name="YoungBd"
                        src={verified[0]?.ProfileAvatar}
                        w="2.2rem"
                        h="2.2rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="white"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[0]?.userId}`}>
                            {verified[0]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#5B61FB" />
                      </Box>
                    </Box>

                    <Text as="h2" color="#828282" fontSize="0.8rem">
                      {verified[0]?.followers?.length}{" "}
                      {verified[0]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(123, 91, 251)",
                    }}
                    _active={{ bg: "rgb(123, 91, 251)" }}
                    bg="rgb(123, 91, 251,0.92)"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Axie
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={3} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.2rem"
                    fontWeight="bold"
                    color="#A6A6A6"
                  >
                    02
                  </Text>
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[1]?.userId}`}>
                      <Avatar
                        name="NatalyKey"
                        w="2.2rem"
                        h="2.2rem"
                        src={verified[1]?.ProfileAvatar}
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="white"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[1]?.userId}`}>
                            {verified[1]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#5B61FB" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#828282" fontSize="0.8rem">
                      {verified[1]?.followers?.length}{" "}
                      {verified[1]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(129, 191, 127,0.8)",
                    }}
                    _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                    bg="#81BF7F"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2.2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Mobox
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
              <Box pt={3} pl={3} d="flex">
                <Center>
                  <Text
                    as="h1"
                    fontSize="1.2rem"
                    fontWeight="bold"
                    color="#A6A6A6"
                  >
                    03
                  </Text>
                  <Box
                    ml={3}
                    label="Studio"
                    cursor="pointer"
                    width="2.2rem"
                    height="2.2rem"
                    borderRadius="50%"
                  >
                    {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                    <RouterLink to={`/profile/${verified[2]?.userId}`}>
                      {" "}
                      <Avatar
                        name="DavinciJ15"
                        src={verified[2]?.ProfileAvatar}
                        w="2.2rem"
                        h="2.2rem"
                      />
                    </RouterLink>
                  </Box>

                  <Box pl={2.5}>
                    <Box d="flex">
                      {showUserSkeleton ? (
                        <Skeleton w="4rem" />
                      ) : (
                        <Text
                          as="h3"
                          color="white"
                          fontWeight="600"
                          cursor="pointer"
                        >
                          <RouterLink to={`/profile/${verified[2]?.userId}`}>
                            {verified[2]?.username?.slice(0, 7)}
                          </RouterLink>
                        </Text>
                      )}
                      <Box pl={2} pt={1}>
                        <AiFillCheckCircle fill="#5B61FB" />
                      </Box>
                    </Box>
                    <Text as="h2" color="#828282" fontSize="0.8rem">
                      {verified[2]?.followers?.length}{" "}
                      {verified[2]?.followers?.length > 1
                        ? "Followers"
                        : "Follower"}
                    </Text>
                  </Box>

                  <Button
                    color="white"
                    fontSize="0.9rem"
                    _hover={{
                      bg: "rgb(223, 215, 42,0.9)",
                    }}
                    _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                    bg="rgb(223, 215, 42,0.8)"
                    leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                    ml="2rem"
                    borderRadius="50"
                    height="2rem"
                    width="5rem"
                  >
                    Alien W
                  </Button>
                </Center>
              </Box>
              <Center pt={3} opacity="0.3">
                <Divider orientation="horizontal" width="90%" />
              </Center>
            </Box>
          )}
        </Box>

        <Box
          w="100%"
          maxWidth="100%"
          gridTemplateColumns="4fr"
          d={["none", "grid", "none", "none", "none", "none"]}
          height="50%"
          borderRadius="20px"
        >
          <Center width="100%" h="100%" maxWidth="100%">
            <Box w="95%">
              <Carousel
                style={{ width: "90vw" }}
                enableKeyboardControls={true}
                renderBottomCenterControls={(props) => (
                  <PagingDots {...props} />
                )}
                autoplay={true}
                autoplayInterval={8000}
                wrapAround={true}
                renderCenterLeftControls={() => null}
                renderCenterRightControls={() => null}
              >
                <Box
                  width="100%"
                  maxWidth="100%"
                  height="100%"
                  bg={
                    colorMode === "light" ? "#5B61FB" : "rgb(123, 91, 251,0.91)"
                  }
                  borderRadius="20px"
                >
                  <Box
                    d="flex"
                    bgImage={`url('${bg}')`}
                    bgSize="contain"
                    bgPosition="right"
                    bgRepeat="no-repeat"
                  >
                    <Box width="80%">
                      <Box
                        bg="rgb(1, 1, 1,0.27)"
                        height="98%"
                        mt={2}
                        borderRadius="20px"
                        ml={5}
                      >
                        <Box pl={3} pt={2}>
                          <Text
                            as="h4"
                            fontSize="0.8rem"
                            color="rgb(255, 255, 255,0.66)"
                          >
                            #TRENDING
                          </Text>
                          <Text
                            as="h1"
                            fontSize="1.2rem"
                            fontWeight="bold"
                            lineHeight="2rem"
                            color="white"
                            width="90%"
                          >
                            Watch P2E Tournaments Anywhere Anytime
                          </Text>
                          <Text
                            pt={2.5}
                            as="p"
                            fontFamily="Archivo-Light"
                            fontSize="0.9rem"
                            color="rgb(255, 255, 255,0.66)"
                            width="80%"
                          >
                            Watch your favorite streamers & players only on
                            Cratch
                          </Text>
                          <RouterLink to="/lives">
                            <Button
                              fontWeight="bold"
                              _active={{ bg: "rgb(255,255,255,0.95)" }}
                              _hover={{ bg: "rgb(255,255,255,0.95)" }}
                              mt={4}
                              bg="rgb(255,255,255,0.85)"
                              color="#595B5D"
                              borderRadius="50px"
                            >
                              Watch Now
                            </Button>
                          </RouterLink>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box
                  width="100%"
                  maxWidth="100%"
                  height="100%"
                  bg="linear-gradient(0deg, #243B4B 0%, #ffffdb 100%)"
                  borderRadius="20px"
                >
                  <Box
                    d="flex"
                    bgImage={`url('${pubg}')`}
                    bgSize="contain"
                    bgPosition="right"
                    bgRepeat="no-repeat"
                  >
                    <Box width="80%">
                      <Box
                        bg="rgb(1, 1, 1,0.27)"
                        height="98%"
                        mt={2}
                        borderRadius="20px"
                        ml={5}
                      >
                        <Box pl={5} pt={2}>
                          <Text
                            as="h4"
                            fontSize="0.8rem"
                            color="rgb(255, 255, 255,0.66)"
                          >
                            #TRENDING
                          </Text>
                          <Text
                            as="h1"
                            fontSize="1.2rem"
                            fontWeight="bold"
                            lineHeight="2rem"
                            color="white"
                            width="90%"
                          >
                            Watch PUBG Global Championship
                          </Text>
                          <Text
                            pt={2.5}
                            as="p"
                            fontFamily="Archivo-Light"
                            fontSize="0.9rem"
                            color="rgb(255, 255, 255,0.66)"
                            width="75%"
                          >
                            Enjoy watching one of the biggest PUBG event this
                            year.
                          </Text>
                          <Button
                            onClick={() => {
                              toast({
                                title: `Coming soon`,
                                position: "top",
                                isClosable: true,
                              });
                            }}
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={4}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box
                  width="100%"
                  maxWidth="100%"
                  height="100%"
                  bg="radial-gradient(circle at top, #00D0AA , #81BF7F)"
                  borderRadius="20px"
                >
                  <Box
                    d="flex"
                    bgImage={`url('${axie}')`}
                    bgSize="contain"
                    bgPosition="right"
                    bgRepeat="no-repeat"
                  >
                    <Box width="80%">
                      <Box
                        bg="rgb(1, 1, 1,0.27)"
                        height="98%"
                        mt={2}
                        borderRadius="20px"
                        ml={5}
                      >
                        <Box pl={5} pt={2}>
                          <Text
                            as="h4"
                            fontSize="0.8rem"
                            color="rgb(255, 255, 255,0.66)"
                          >
                            #TRENDING
                          </Text>
                          <Text
                            as="h1"
                            fontSize="1.2rem"
                            fontWeight="bold"
                            lineHeight="2rem"
                            color="white"
                            width="90%"
                          >
                            Watch Axie Infinity: Battle of the Guilds
                          </Text>
                          <Text
                            pt={2.5}
                            as="p"
                            fontFamily="Archivo-Light"
                            fontSize="0.9rem"
                            color="rgb(255, 255, 255,0.66)"
                            width="75%"
                          >
                            Watch Axie Infinity tournaments only on Cratch, and
                            win valuable prizes
                          </Text>
                          <Button
                            onClick={() => {
                              toast({
                                title: `Coming soon`,
                                position: "top",
                                isClosable: true,
                              });
                            }}
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={4}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box
                  width="100%"
                  maxWidth="100%"
                  height="100%"
                  bg="linear-gradient(0deg, #233C89 0%, #7A2261 100%)"
                  borderRadius="20px"
                >
                  <Box
                    d="flex"
                    bgImage={`url('${sandbox}')`}
                    bgSize="contain"
                    bgPosition="right"
                    bgRepeat="no-repeat"
                  >
                    <Box width="80%">
                      <Box
                        bg="rgb(1, 1, 1,0.27)"
                        height="98%"
                        mt={2}
                        borderRadius="20px"
                        ml={5}
                      >
                        <Box pl={5} pt={2}>
                          <Text
                            as="h4"
                            fontSize="0.8rem"
                            color="rgb(255, 255, 255,0.66)"
                          >
                            #TRENDING
                          </Text>
                          <Text
                            as="h1"
                            fontSize="1.2rem"
                            fontWeight="bold"
                            lineHeight="2rem"
                            color="white"
                            width="90%"
                          >
                            Watch The Sandbox Alpha Season 3
                          </Text>
                          <Text
                            pt={2.5}
                            as="p"
                            fontFamily="Archivo-Light"
                            fontSize="0.9rem"
                            color="rgb(255, 255, 255,0.66)"
                            width="80%"
                          >
                            Watch events live on MetaCratch, and join the
                            Metaverse community
                          </Text>
                          <Link href="https://meta.cratch.io" isExternal>
                            <Button
                              fontWeight="bold"
                              _active={{ bg: "rgb(255,255,255,0.95)" }}
                              _hover={{ bg: "rgb(255,255,255,0.95)" }}
                              mt={4}
                              bg="rgb(255,255,255,0.85)"
                              color="#595B5D"
                              borderRadius="50px"
                            >
                              Watch Now
                            </Button>
                          </Link>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Carousel>
            </Box>
          </Center>

          <Center w="100%" mt={8}>
            {colorMode === "dark" && (
              <Box
                width="95%"
                bg="rgb(36, 38, 39,0.63)"
                borderRadius="20px"
                pl={6}
              >
                <Text as="h1" fontSize="1.6rem" fontWeight="bold" pt={1} pl={3}>
                  Top Streamers
                </Text>
                <Box pt={2} pl={3} d="flex">
                  <Center>
                    <FaMedal size="1.5rem" fill="#FFD600" />
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      <RouterLink to={`/profile/${verified[0]?.userId}`}>
                        <Avatar
                          name="YoungBd"
                          src={verified[0]?.ProfileAvatar}
                          w="2.2rem"
                          h="2.2rem"
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="#FFD600"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[0]?.userId}`}>
                              {verified[0]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#FFD600" />
                        </Box>
                      </Box>

                      <Text as="h2" color="#595B5D" fontSize="0.8rem">
                        {verified[0]?.followers?.length}{" "}
                        {verified[0]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(123, 91, 251)",
                      }}
                      _active={{ bg: "rgb(123, 91, 251)" }}
                      bg="rgb(123, 91, 251,0.92)"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="7rem"
                      borderRadius="50"
                      height="2rem"
                      width="7rem"
                    >
                      Axie
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
                <Box pt={3} pl={3} d="flex">
                  <Center>
                    <Text
                      as="h1"
                      fontSize="1.2rem"
                      fontWeight="bold"
                      color="#595B5D"
                    >
                      02
                    </Text>
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                      <RouterLink to={`/profile/${verified[1]?.userId}`}>
                        <Avatar
                          name="NatalyKey"
                          w="2.2rem"
                          h="2.2rem"
                          src={verified[1]?.ProfileAvatar}
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="#FFD600"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[1]?.userId}`}>
                              {verified[1]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#FFD600" />
                        </Box>
                      </Box>
                      <Text as="h2" color="#595B5D" fontSize="0.8rem">
                        {verified[1]?.followers?.length}{" "}
                        {verified[1]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(129, 191, 127,0.8)",
                      }}
                      _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                      bg="#81BF7F"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="7.2rem"
                      borderRadius="50"
                      height="2rem"
                      width="7rem"
                    >
                      Mobox
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
                <Box pt={3} pl={3} d="flex">
                  <Center>
                    <Text
                      as="h1"
                      fontSize="1.2rem"
                      fontWeight="bold"
                      color="#595B5D"
                    >
                      03
                    </Text>
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                      <RouterLink to={`/profile/${verified[2]?.userId}`}>
                        {" "}
                        <Avatar
                          name="DavinciJ15"
                          src={verified[2]?.ProfileAvatar}
                          w="2.2rem"
                          h="2.2rem"
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="#FFD600"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[2]?.userId}`}>
                              {verified[2]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#FFD600" />
                        </Box>
                      </Box>
                      <Text as="h2" color="#595B5D" fontSize="0.8rem">
                        {verified[2]?.followers?.length}{" "}
                        {verified[2]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(223, 215, 42,0.9)",
                      }}
                      _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                      bg="rgb(223, 215, 42,0.8)"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="7rem"
                      borderRadius="50"
                      height="2rem"
                      width="7rem"
                    >
                      Alien W
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
              </Box>
            )}

            {colorMode === "light" && (
              <Box width="95%" bg="#1C1F20" borderRadius="20px" pl={6}>
                <Text
                  as="h1"
                  fontSize="1.6rem"
                  fontWeight="bold"
                  pt={1}
                  pl={3}
                  color="white"
                >
                  Top Streamers
                </Text>
                <Box pt={2} pl={3} d="flex">
                  <Center>
                    <FaMedal size="1.5rem" fill="#5B61FB" />
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      <RouterLink to={`/profile/${verified[0]?.userId}`}>
                        <Avatar
                          name="YoungBd"
                          src={verified[0]?.ProfileAvatar}
                          w="2.2rem"
                          h="2.2rem"
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="white"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[0]?.userId}`}>
                              {verified[0]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#5B61FB" />
                        </Box>
                      </Box>

                      <Text as="h2" color="#828282" fontSize="0.8rem">
                        {verified[0]?.followers?.length}{" "}
                        {verified[0]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(123, 91, 251)",
                      }}
                      _active={{ bg: "rgb(123, 91, 251)" }}
                      bg="rgb(123, 91, 251,0.92)"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="7rem"
                      borderRadius="50"
                      height="2rem"
                      width="5rem"
                    >
                      Axie
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
                <Box pt={3} pl={3} d="flex">
                  <Center>
                    <Text
                      as="h1"
                      fontSize="1.2rem"
                      fontWeight="bold"
                      color="#A6A6A6"
                    >
                      02
                    </Text>
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                      <RouterLink to={`/profile/${verified[1]?.userId}`}>
                        <Avatar
                          name="NatalyKey"
                          w="2.2rem"
                          h="2.2rem"
                          src={verified[1]?.ProfileAvatar}
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="white"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[1]?.userId}`}>
                              {verified[1]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#5B61FB" />
                        </Box>
                      </Box>
                      <Text as="h2" color="#828282" fontSize="0.8rem">
                        {verified[1]?.followers?.length}{" "}
                        {verified[1]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(129, 191, 127,0.8)",
                      }}
                      _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                      bg="#81BF7F"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="7.2rem"
                      borderRadius="50"
                      height="2rem"
                      width="5rem"
                    >
                      Mobox
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
                <Box pt={3} pl={3} d="flex">
                  <Center>
                    <Text
                      as="h1"
                      fontSize="1.2rem"
                      fontWeight="bold"
                      color="#A6A6A6"
                    >
                      03
                    </Text>
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                      <RouterLink to={`/profile/${verified[2]?.userId}`}>
                        {" "}
                        <Avatar
                          name="DavinciJ15"
                          src={verified[2]?.ProfileAvatar}
                          w="2.2rem"
                          h="2.2rem"
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="white"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[2]?.userId}`}>
                              {verified[2]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#5B61FB" />
                        </Box>
                      </Box>
                      <Text as="h2" color="#828282" fontSize="0.8rem">
                        {verified[2]?.followers?.length}{" "}
                        {verified[2]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(223, 215, 42,0.9)",
                      }}
                      _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                      bg="rgb(223, 215, 42,0.8)"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="7rem"
                      borderRadius="50"
                      height="2rem"
                      width="5rem"
                    >
                      Alien W
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
              </Box>
            )}
          </Center>
        </Box>

        <Box
          w="100%"
          maxWidth="100%"
          gridTemplateColumns="4fr"
          d={["grid", "none", "none", "none", "none", "none"]}
          height="50%"
          borderRadius="20px"
        >
          <Center width="100%" h="100%" maxWidth="100%">
            <Box w="95%">
              <Carousel
                style={{ width: "90vw" }}
                enableKeyboardControls={true}
                renderBottomCenterControls={(props) => (
                  <PagingDots {...props} />
                )}
                autoplay={true}
                autoplayInterval={8000}
                wrapAround={true}
                renderCenterLeftControls={() => null}
                renderCenterRightControls={() => null}
              >
                <Box
                  width="100%"
                  maxWidth="100%"
                  height="100%"
                  bg={
                    colorMode === "light" ? "#5B61FB" : "rgb(123, 91, 251,0.91)"
                  }
                  borderRadius="20px"
                >
                  <Box
                    d="flex"
                    bgImage={`url('${bg}')`}
                    bgSize="contain"
                    bgPosition="right"
                    bgRepeat="no-repeat"
                  >
                    <Box width="90%">
                      <Box
                        bg="rgb(1, 1, 1,0.27)"
                        height="98%"
                        mt={2}
                        borderRadius="20px"
                        ml={5}
                      >
                        <Box pl={3} pt={2}>
                          <Text
                            as="h4"
                            fontSize="0.8rem"
                            color="rgb(255, 255, 255,0.66)"
                          >
                            #TRENDING
                          </Text>
                          <Text
                            as="h1"
                            fontSize="1.2rem"
                            fontWeight="bold"
                            lineHeight="2rem"
                            color="white"
                            width="90%"
                          >
                            Watch P2E Tournaments Anywhere Anytime
                          </Text>
                          <Text
                            pt={2.5}
                            as="p"
                            fontFamily="Archivo-Light"
                            fontSize="0.9rem"
                            color="rgb(255, 255, 255,0.66)"
                            width="80%"
                          >
                            Watch your favorite streamers & players only on
                            Cratch
                          </Text>
                          <RouterLink to="/lives">
                            <Button
                              fontWeight="bold"
                              _active={{ bg: "rgb(255,255,255,0.95)" }}
                              _hover={{ bg: "rgb(255,255,255,0.95)" }}
                              mt={2}
                              bg="rgb(255,255,255,0.85)"
                              color="#595B5D"
                              borderRadius="50px"
                            >
                              Watch Now
                            </Button>
                          </RouterLink>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box
                  width="100%"
                  maxWidth="100%"
                  height="100%"
                  bg="linear-gradient(0deg, #243B4B 0%, #ffffdb 100%)"
                  borderRadius="20px"
                >
                  <Box
                    d="flex"
                    bgImage={`url('${pubg}')`}
                    bgSize="contain"
                    bgPosition="right"
                    bgRepeat="no-repeat"
                  >
                    <Box width="90%">
                      <Box
                        bg="rgb(1, 1, 1,0.27)"
                        height="98%"
                        mt={2}
                        borderRadius="20px"
                        ml={5}
                      >
                        <Box pl={5} pt={2}>
                          <Text
                            as="h4"
                            fontSize="0.8rem"
                            color="rgb(255, 255, 255,0.66)"
                          >
                            #TRENDING
                          </Text>
                          <Text
                            as="h1"
                            fontSize="1.2rem"
                            fontWeight="bold"
                            lineHeight="2rem"
                            color="white"
                            width="90%"
                          >
                            Watch PUBG Global Championship
                          </Text>
                          <Text
                            pt={2.5}
                            as="p"
                            fontFamily="Archivo-Light"
                            fontSize="0.9rem"
                            color="rgb(255, 255, 255,0.66)"
                            width="75%"
                          >
                            Enjoy watching one of the biggest PUBG event this
                            year.
                          </Text>
                          <Button
                            onClick={() => {
                              toast({
                                title: `Coming soon`,
                                position: "top",
                                isClosable: true,
                              });
                            }}
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={2}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box
                  width="100%"
                  maxWidth="100%"
                  height="100%"
                  bg="radial-gradient(circle at top, #00D0AA , #81BF7F)"
                  borderRadius="20px"
                >
                  <Box
                    d="flex"
                    bgImage={`url('${axie}')`}
                    bgSize="contain"
                    bgPosition="right"
                    bgRepeat="no-repeat"
                  >
                    <Box width="90%">
                      <Box
                        bg="rgb(1, 1, 1,0.27)"
                        height="98%"
                        mt={2}
                        borderRadius="20px"
                        ml={5}
                      >
                        <Box pl={5} pt={2}>
                          <Text
                            as="h4"
                            fontSize="0.8rem"
                            color="rgb(255, 255, 255,0.66)"
                          >
                            #TRENDING
                          </Text>
                          <Text
                            as="h1"
                            fontSize="1.2rem"
                            fontWeight="bold"
                            lineHeight="2rem"
                            color="white"
                            width="90%"
                          >
                            Watch Axie Infinity: Battle of the Guilds
                          </Text>
                          <Text
                            pt={2.5}
                            as="p"
                            fontFamily="Archivo-Light"
                            fontSize="0.9rem"
                            color="rgb(255, 255, 255,0.66)"
                            width="75%"
                          >
                            Watch Axie Infinity tournaments only on Cratch, and
                            win valuable prizes
                          </Text>
                          <Button
                            onClick={() => {
                              toast({
                                title: `Coming soon`,
                                position: "top",
                                isClosable: true,
                              });
                            }}
                            fontWeight="bold"
                            _active={{ bg: "rgb(255,255,255,0.95)" }}
                            _hover={{ bg: "rgb(255,255,255,0.95)" }}
                            mt={2}
                            bg="rgb(255,255,255,0.85)"
                            color="#595B5D"
                            borderRadius="50px"
                          >
                            Watch Now
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box
                  width="100%"
                  maxWidth="100%"
                  height="100%"
                  bg="linear-gradient(0deg, #233C89 0%, #7A2261 100%)"
                  borderRadius="20px"
                >
                  <Box
                    d="flex"
                    bgImage={`url('${sandbox}')`}
                    bgSize="contain"
                    bgPosition="right"
                    bgRepeat="no-repeat"
                  >
                    <Box width="90%">
                      <Box
                        bg="rgb(1, 1, 1,0.27)"
                        height="98%"
                        mt={2}
                        borderRadius="20px"
                        ml={5}
                      >
                        <Box pl={5} pt={2}>
                          <Text
                            as="h4"
                            fontSize="0.8rem"
                            color="rgb(255, 255, 255,0.66)"
                          >
                            #TRENDING
                          </Text>
                          <Text
                            as="h1"
                            fontSize="1.2rem"
                            fontWeight="bold"
                            lineHeight="2rem"
                            color="white"
                            width="90%"
                          >
                            Watch The Sandbox Alpha Season 3
                          </Text>
                          <Text
                            pt={2.5}
                            as="p"
                            fontFamily="Archivo-Light"
                            fontSize="0.9rem"
                            color="rgb(255, 255, 255,0.66)"
                            width="80%"
                          >
                            Watch events live on MetaCratch, and join the
                            Metaverse community
                          </Text>
                          <Link href="https://meta.cratch.io" isExternal>
                            <Button
                              fontWeight="bold"
                              _active={{ bg: "rgb(255,255,255,0.95)" }}
                              _hover={{ bg: "rgb(255,255,255,0.95)" }}
                              mt={2}
                              bg="rgb(255,255,255,0.85)"
                              color="#595B5D"
                              borderRadius="50px"
                            >
                              Watch Now
                            </Button>
                          </Link>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Carousel>
            </Box>
          </Center>

          <Center w="100%" mt={8}>
            {colorMode === "dark" && (
              <Box
                width="95%"
                bg="rgb(36, 38, 39,0.63)"
                borderRadius="20px"
                pl={2}
              >
                <Text as="h1" fontSize="1.6rem" fontWeight="bold" pt={1} pl={3}>
                  Top Streamers
                </Text>
                <Box pt={2} pl={3} d="flex">
                  <Center>
                    <FaMedal size="1.5rem" fill="#FFD600" />
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      <RouterLink to={`/profile/${verified[0]?.userId}`}>
                        <Avatar
                          name="YoungBd"
                          src={verified[0]?.ProfileAvatar}
                          w="2.2rem"
                          h="2.2rem"
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="#FFD600"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[0]?.userId}`}>
                              {verified[0]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#FFD600" />
                        </Box>
                      </Box>

                      <Text as="h2" color="#595B5D" fontSize="0.8rem">
                        {verified[0]?.followers?.length}{" "}
                        {verified[0]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(123, 91, 251)",
                      }}
                      _active={{ bg: "rgb(123, 91, 251)" }}
                      bg="rgb(123, 91, 251,0.92)"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="5rem"
                      borderRadius="50"
                      height="2rem"
                      width="5rem"
                    >
                      Axie
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
                <Box pt={3} pl={3} d="flex">
                  <Center>
                    <Text
                      as="h1"
                      fontSize="1.2rem"
                      fontWeight="bold"
                      color="#595B5D"
                    >
                      02
                    </Text>
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                      <RouterLink to={`/profile/${verified[1]?.userId}`}>
                        <Avatar
                          name="NatalyKey"
                          w="2.2rem"
                          h="2.2rem"
                          src={verified[1]?.ProfileAvatar}
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="#FFD600"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[1]?.userId}`}>
                              {verified[1]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#FFD600" />
                        </Box>
                      </Box>
                      <Text as="h2" color="#595B5D" fontSize="0.8rem">
                        {verified[1]?.followers?.length}{" "}
                        {verified[1]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(129, 191, 127,0.8)",
                      }}
                      _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                      bg="#81BF7F"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="5.2rem"
                      borderRadius="50"
                      height="2rem"
                      width="5rem"
                    >
                      Mobox
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
                <Box pt={3} pl={3} d="flex">
                  <Center>
                    <Text
                      as="h1"
                      fontSize="1.2rem"
                      fontWeight="bold"
                      color="#595B5D"
                    >
                      03
                    </Text>
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                      <RouterLink to={`/profile/${verified[2]?.userId}`}>
                        {" "}
                        <Avatar
                          name="DavinciJ15"
                          src={verified[2]?.ProfileAvatar}
                          w="2.2rem"
                          h="2.2rem"
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="#FFD600"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[2]?.userId}`}>
                              {verified[2]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#FFD600" />
                        </Box>
                      </Box>
                      <Text as="h2" color="#595B5D" fontSize="0.8rem">
                        {verified[2]?.followers?.length}{" "}
                        {verified[2]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(223, 215, 42,0.9)",
                      }}
                      _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                      bg="rgb(223, 215, 42,0.8)"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="5rem"
                      borderRadius="50"
                      height="2rem"
                      width="5rem"
                    >
                      Alien W
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
              </Box>
            )}

            {colorMode === "light" && (
              <Box width="95%" bg="#1C1F20" borderRadius="20px" pl={6}>
                <Text
                  as="h1"
                  fontSize="1.6rem"
                  fontWeight="bold"
                  pt={1}
                  pl={3}
                  color="white"
                >
                  Top Streamers
                </Text>
                <Box pt={2} pl={3} d="flex">
                  <Center>
                    <FaMedal size="1.5rem" fill="#5B61FB" />
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      <RouterLink to={`/profile/${verified[0]?.userId}`}>
                        <Avatar
                          name="YoungBd"
                          src={verified[0]?.ProfileAvatar}
                          w="2.2rem"
                          h="2.2rem"
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="white"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[0]?.userId}`}>
                              {verified[0]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#5B61FB" />
                        </Box>
                      </Box>

                      <Text as="h2" color="#828282" fontSize="0.8rem">
                        {verified[0]?.followers?.length}{" "}
                        {verified[0]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(123, 91, 251)",
                      }}
                      _active={{ bg: "rgb(123, 91, 251)" }}
                      bg="rgb(123, 91, 251,0.92)"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="5rem"
                      borderRadius="50"
                      height="2rem"
                      width="5rem"
                    >
                      Axie
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
                <Box pt={3} pl={3} d="flex">
                  <Center>
                    <Text
                      as="h1"
                      fontSize="1.2rem"
                      fontWeight="bold"
                      color="#A6A6A6"
                    >
                      02
                    </Text>
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img5} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                      <RouterLink to={`/profile/${verified[1]?.userId}`}>
                        <Avatar
                          name="NatalyKey"
                          w="2.2rem"
                          h="2.2rem"
                          src={verified[1]?.ProfileAvatar}
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="white"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[1]?.userId}`}>
                              {verified[1]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#5B61FB" />
                        </Box>
                      </Box>
                      <Text as="h2" color="#828282" fontSize="0.8rem">
                        {verified[1]?.followers?.length}{" "}
                        {verified[1]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(129, 191, 127,0.8)",
                      }}
                      _active={{ bg: "rgb(129, 191, 127,0.8)" }}
                      bg="#81BF7F"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="5.2rem"
                      borderRadius="50"
                      height="2rem"
                      width="5rem"
                    >
                      Mobox
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
                <Box pt={3} pl={3} d="flex">
                  <Center>
                    <Text
                      as="h1"
                      fontSize="1.2rem"
                      fontWeight="bold"
                      color="#A6A6A6"
                    >
                      03
                    </Text>
                    <Box
                      ml={3}
                      label="Studio"
                      cursor="pointer"
                      width="2.2rem"
                      height="2.2rem"
                      borderRadius="50%"
                    >
                      {/* <Image src={img7} alt="John" width="2.3rem" height="2.3rem" borderRadius="50%" /> */}
                      <RouterLink to={`/profile/${verified[2]?.userId}`}>
                        {" "}
                        <Avatar
                          name="DavinciJ15"
                          src={verified[2]?.ProfileAvatar}
                          w="2.2rem"
                          h="2.2rem"
                        />
                      </RouterLink>
                    </Box>

                    <Box pl={2.5}>
                      <Box d="flex">
                        {showUserSkeleton ? (
                          <Skeleton w="4rem" />
                        ) : (
                          <Text
                            as="h3"
                            color="white"
                            fontWeight="600"
                            cursor="pointer"
                          >
                            <RouterLink to={`/profile/${verified[2]?.userId}`}>
                              {verified[2]?.username?.slice(0, 7)}
                            </RouterLink>
                          </Text>
                        )}
                        <Box pl={2} pt={1}>
                          <AiFillCheckCircle fill="#5B61FB" />
                        </Box>
                      </Box>
                      <Text as="h2" color="#828282" fontSize="0.8rem">
                        {verified[2]?.followers?.length}{" "}
                        {verified[2]?.followers?.length > 1
                          ? "Followers"
                          : "Follower"}
                      </Text>
                    </Box>

                    <Button
                      color="white"
                      fontSize="0.9rem"
                      _hover={{
                        bg: "rgb(223, 215, 42,0.9)",
                      }}
                      _active={{ bg: "rgb(223, 215, 42,0.9)" }}
                      bg="rgb(223, 215, 42,0.8)"
                      leftIcon={<BiVideoPlus size="1.2rem" fill="white" />}
                      ml="5rem"
                      borderRadius="50"
                      height="2rem"
                      width="5rem"
                    >
                      Alien W
                    </Button>
                  </Center>
                </Box>
                <Center pt={3} opacity="0.3">
                  <Divider orientation="horizontal" width="90%" />
                </Center>
              </Box>
            )}
          </Center>
        </Box>

        {/* Trending block */}
        <Box height="54%">
          <Text
            as="h3"
            color={
              colorMode === "light"
                ? "rgb(0,0,0,0.69)"
                : "rgb(255,255,255,0.69)"
            }
            fontFamily="sans-serif"
            fontSize="0.9rem"
            textTransform="uppercase"
            pt={5}
          >
            trending
          </Text>
          <Box width="100%" d="flex" flexDirection="row">
            <Text
              width="80%"
              as="h3"
              color={colorMode === "light" ? "black" : "rgb(255,255,255,0.95)"}
              fontSize="1.3rem"
              fontWeight="bold"
              textTransform="capitalize"
            >
              #play with axie
            </Text>
            <Text
              fontWeight={colorMode === "light" ? "600" : ""}
              textAlign="right"
              width="20%"
              as="h3"
              pr={2}
              cursor="pointer"
              color={colorMode === "light" ? "#5B61FB" : "#FB5B78"}
              fontSize="1rem"
              textTransform="capitalize"
            >
              <RouterLink to={route}>View All</RouterLink>
            </Text>
          </Box>
          <Box pt={2.5} d="flex" flexDirection="row">
            {colorMode === "dark" && (
              <Box d="flex" width="80%">
                <Text
                  lineHeight="2rem"
                  cursor="pointer"
                  as="h4"
                  borderBottom={activeLink === 1 ? "1px solid #FB5B78" : ""}
                  color={
                    activeLink === 1 ? "#FB5B78" : "rgba(255,255,255,0.63)"
                  }
                  fontSize="1rem"
                  onClick={() => {
                    setActiveLink(1);
                    setRoute("/lives");
                  }}
                >
                  Top Streams
                </Text>
                <Text
                  lineHeight="2rem"
                  cursor="pointer"
                  ml={5}
                  as="h4"
                  borderBottom={activeLink === 2 ? "1px solid #FB5B78" : ""}
                  color={
                    activeLink === 2 ? "#FB5B78" : "rgba(255,255,255,0.63)"
                  }
                  fontSize="1rem"
                  onClick={() => {
                    setActiveLink(2);
                    setRoute("/videos");
                  }}
                >
                  Top Videos
                </Text>
                <Text
                  lineHeight="2rem"
                  cursor="pointer"
                  ml={5}
                  as="h4"
                  borderBottom={activeLink === 3 ? "1px solid #FB5B78" : ""}
                  color={
                    activeLink === 3 ? "#FB5B78" : "rgba(255,255,255,0.63)"
                  }
                  fontSize="1rem"
                  onClick={() => {
                    setActiveLink(3);
                    setRoute("/online_users");
                  }}
                  d={["none", "block", "block", "block", "block", "block"]}
                >
                  Currently Online
                </Text>
                <Text
                  lineHeight="2rem"
                  cursor="pointer"
                  ml={5}
                  as="h4"
                  borderBottom={activeLink === 4 ? "1px solid #FB5B78" : ""}
                  color={
                    activeLink === 4 ? "#FB5B78" : "rgba(255,255,255,0.63)"
                  }
                  fontSize="1rem"
                  onClick={() => {
                    setActiveLink(4);
                    setRoute("/verified_users");
                  }}
                  d={["none", "block", "block", "block", "block", "block"]}
                >
                  Verified
                </Text>
                <Link
                  href="https://meta.cratch.io"
                  isExternal
                  d={["none", "none", "block", "block"]}
                >
                  {" "}
                  <Image
                    ml={4}
                    width="9rem"
                    src={metacratch}
                    alt="metacratch"
                    cursor="pointer"
                  />
                </Link>
              </Box>
            )}

            {colorMode === "light" && (
              <Box d="flex" width="80%">
                <Text
                  fontWeight="bold"
                  lineHeight="2rem"
                  cursor="pointer"
                  as="h4"
                  borderBottom={activeLink === 1 ? "1px solid #5B61FB" : ""}
                  color={activeLink === 1 ? "#5B61FB" : "#5A5A5B"}
                  fontSize="1rem"
                  onClick={() => {
                    setActiveLink(1);
                    setRoute("/lives");
                  }}
                >
                  Top Streams
                </Text>
                <Text
                  fontWeight="bold"
                  lineHeight="2rem"
                  cursor="pointer"
                  ml={5}
                  as="h4"
                  borderBottom={activeLink === 2 ? "1px solid #5B61FB" : ""}
                  color={activeLink === 2 ? "#5B61FB" : "#5A5A5B"}
                  fontSize="1rem"
                  onClick={() => {
                    setActiveLink(2);
                    setRoute("/videos");
                  }}
                >
                  Top Videos
                </Text>
                <Text
                  fontWeight="bold"
                  lineHeight="2rem"
                  cursor="pointer"
                  ml={5}
                  as="h4"
                  borderBottom={activeLink === 3 ? "1px solid #5B61FB" : ""}
                  color={activeLink === 3 ? "#5B61FB" : "#5A5A5B"}
                  fontSize="1rem"
                  onClick={() => {
                    setActiveLink(3);
                    setRoute("/online_users");
                  }}
                  d={["none", "block", "block", "block", "block", "block"]}
                >
                  Currently Online
                </Text>
                <Text
                  fontWeight="bold"
                  lineHeight="2rem"
                  cursor="pointer"
                  ml={5}
                  as="h4"
                  borderBottom={activeLink === 4 ? "1px solid #5B61FB" : ""}
                  color={activeLink === 4 ? "#5B61FB" : "#5A5A5B"}
                  fontSize="1rem"
                  onClick={() => {
                    setActiveLink(4);
                    setRoute("/verified_users");
                  }}
                  d={["none", "block", "block", "block", "block", "block"]}
                >
                  Verified
                </Text>
                <Link
                  href="https://meta.cratch.io"
                  isExternal
                  d={["none", "none", "block", "block"]}
                >
                  {" "}
                  <Image
                    ml={4}
                    width="9rem"
                    src={metacratchLight}
                    alt="metacratch"
                    cursor="pointer"
                  />
                </Link>
              </Box>
            )}
            <Box width="20%" textAlign="right">
              <Popover placement="top-start" _focus={{ border: "none" }}>
                <PopoverTrigger>
                  <Button
                    _hover={{ bg: "#2D2D2E" }}
                    color={colorMode === "light" ? "rgb(255,255,255,0.83)" : ""}
                    bg="#2D2D2E"
                    _focus={{ border: "none" }}
                    borderRadius="50px"
                    leftIcon={
                      <FaFilter size="0.8rem" fill="rgb(255,255,255,0.83)" />
                    }
                    height="2.2rem"
                  >
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
                  _focus={{ border: "1px solid grey" }}
                >
                  <PopoverArrow />
                  <PopoverBody w="100%">
                    <Center w="100%" h="100%">
                      <Box w="100%" h="100%">
                        {categories.map((category) => (
                          <Button
                            onClick={() => {
                              filterContent(category);
                            }}
                            mb={1.5}
                            borderRadius="50px"
                            key={category}
                          >
                            {category}
                          </Button>
                        ))}
                      </Box>
                    </Center>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Box>
          </Box>

          <Box pt={4} d="flex" gap={6}>
            <>
              {!showSkeleton && activeLink === 1 && (
                <Center w="100%">
                  <Box
                    d="grid"
                    mb={
                      window.screen.height * window.devicePixelRatio >= 1600
                        ? 5
                        : 0
                    }
                    w={["80%", "100%", "100%", "100%"]}
                    rowGap={28}
                    gridTemplateColumns={[
                      "4fr",
                      "2fr 2fr",
                      "1fr 1fr 1fr",
                      "1fr 1fr 1fr",
                      "4fr 4fr 4fr 4fr",
                    ]}
                    columnGap={[0, 3, 4, 5]}
                  >
                    {allLives?.map((live) => (
                      <RouterLink to={`/live/${live?.streamUrl}`}>
                        <Box
                          borderRadius="20px"
                          height={["12rem", "10.3rem", "10.3rem", "10.3rem"]}
                        >
                          {/* Main Player box */}
                          <Box
                            cursor="pointer"
                            position="relative"
                            className={
                              colorMode === "light" ? "stream-light" : "stream"
                            }
                            height={["10.7rem", "9rem", "9rem", "9rem"]}
                          >
                            {activeLink === 1 ? (
                              <Box
                                position="absolute"
                                top="0"
                                zIndex={10}
                                right="0"
                                pr={1}
                                pt={1}
                                textAlign="center"
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
                                >
                                  Live
                                </Text>
                              </Box>
                            ) : (
                              ""
                            )}

                            <Box
                              bgImage={`url(${
                                live?.thumbnail
                                  ? live?.thumbnail
                                  : defaultThumbnail
                              })`}
                              bgSize="cover"
                              bgPosition="center"
                              className={
                                colorMode === "light"
                                  ? "stream-light__thumbnail"
                                  : "stream__thumbnail"
                              }
                              height="100%"
                              width="100%"
                              style={{ borderRadius: "10px" }}
                            />
                          </Box>

                          <Box d="flex" mt={3}>
                            <Box
                              mt={1}
                              label="Studio"
                              cursor="pointer"
                              width="2.3rem"
                              height="2.3rem"
                              borderRadius="50%"
                            >
                              <Avatar
                                src={live?.creator?.ProfileAvatar}
                                alt="John"
                                width="2.3rem"
                                height="2.3rem"
                                borderRadius="50%"
                              />
                            </Box>

                            <Box pl={5}>
                              <Box d="flex">
                                <Text
                                  as="h3"
                                  fontSize="0.9rem"
                                  color={
                                    colorMode === "light"
                                      ? "#101011"
                                      : "#FFD600"
                                  }
                                  fontWeight="600"
                                  cursor="pointer"
                                >
                                  {live?.creator?.username.slice(0, 8)}
                                </Text>
                                {live?.creator?.isVerified && (
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
                                {activeLink === 1 && (
                                  <>
                                    {live?.tags?.includes("axie") && (
                                      <Button
                                        color="white"
                                        ml="2rem"
                                        _hover={{
                                          bg: "rgb(123, 91, 251)",
                                        }}
                                        _active={{ bg: "rgb(123, 91, 251)" }}
                                        bg="rgb(123, 91, 251,0.92)"
                                        leftIcon={
                                          <BiVideoPlus
                                            size="1.2rem"
                                            fill="white"
                                          />
                                        }
                                        borderRadius="50"
                                        height="1.5rem"
                                        width="4.5rem"
                                        fontSize="0.9rem"
                                      >
                                        Axie
                                      </Button>
                                    )}{" "}
                                    {live?.tags?.includes("sps") && (
                                      <Button
                                        color="white"
                                        ml="2rem"
                                        _hover={{
                                          bg: "rgb(11, 127, 165,0.8)",
                                        }}
                                        _active={{
                                          bg: "rgb(11, 127, 165,0.8)",
                                        }}
                                        bg="rgb(11, 127, 165)"
                                        leftIcon={
                                          <BiVideoPlus
                                            size="1.2rem"
                                            fill="white"
                                          />
                                        }
                                        borderRadius="50"
                                        height="1.5rem"
                                        width="4.5rem"
                                        fontSize="0.9rem"
                                      >
                                        Sps
                                      </Button>
                                    )}
                                    {live?.tags?.includes("mobox") && (
                                      <Button
                                        color="white"
                                        ml="2rem"
                                        _hover={{
                                          bg: "rgb(129, 191, 127,0.8)",
                                        }}
                                        _active={{
                                          bg: "rgb(129, 191, 127,0.8)",
                                        }}
                                        bg="#81BF7F"
                                        leftIcon={
                                          <BiVideoPlus
                                            size="1.2rem"
                                            fill="white"
                                          />
                                        }
                                        borderRadius="50"
                                        height="1.5rem"
                                        width="5.2rem"
                                        fontSize="0.9rem"
                                      >
                                        Mobox
                                      </Button>
                                    )}
                                    {!live?.tags?.includes("axie") &&
                                      !live?.tags?.includes("sps") &&
                                      !live?.tags?.includes("mobox") && (
                                        <Button
                                          color="white"
                                          ml="2rem"
                                          _hover={{
                                            bg: "#81BF7F",
                                          }}
                                          _active={{
                                            bg: "rgb(223, 215, 42,0.9)",
                                          }}
                                          bg="rgb(223, 215, 42,0.8)"
                                          leftIcon={
                                            <BiVideoPlus
                                              size="1.2rem"
                                              fill="white"
                                            />
                                          }
                                          borderRadius="50"
                                          height="1.5rem"
                                          width="5.2rem"
                                          fontSize="0.9rem"
                                        >
                                          {live?.tags[0]
                                            ?.slice(0, 5)
                                            .charAt(0)
                                            .toUpperCase() +
                                            live?.tags[0]?.slice(1).slice(0, 5)}
                                        </Button>
                                      )}
                                  </>
                                )}
                              </Box>
                              <Text
                                noOfLines={2}
                                fontWeight="500"
                                lineHeight="1.25rem"
                                as="h2"
                                pt={1}
                                color={
                                  colorMode === "light"
                                    ? "rgb(5,0,0,0.85)"
                                    : "rgb(255,255,255,0.85)"
                                }
                                fontSize="1rem"
                              >
                                {live?.title}
                              </Text>
                              <Text
                                as="h2"
                                color={
                                  colorMode === "light" ? "#595B5D" : "#595B5D"
                                }
                                fontSize="0.8rem"
                              >
                                {live?.currentlyWatching} Watching
                              </Text>
                            </Box>
                          </Box>
                        </Box>
                      </RouterLink>
                    ))}
                  </Box>
                </Center>
              )}

              {showSkeleton && activeLink == 1 && (
                <Center w="100%">
                  <Box
                    d="grid"
                    mb={
                      window.screen.height * window.devicePixelRatio >= 1600
                        ? 5
                        : 0
                    }
                    w={["80%", "100%", "100%", "100%"]}
                    rowGap={28}
                    gridTemplateColumns={[
                      "4fr",
                      "2fr 2fr",
                      "1fr 1fr 1fr",
                      "1fr 1fr 1fr",
                      "4fr 4fr 4fr 4fr",
                    ]}
                    columnGap={[0, 3, 4, 5]}
                  >
                    {skeletons.map(() => (
                      <Box height={["12rem", "10.3rem", "10.3rem", "10.3rem"]}>
                        {/* Main Player box */}
                        <Box
                          cursor="pointer"
                          height={["10.7rem", "9rem", "9rem", "9rem"]}
                        >
                          <Skeleton
                            borderRadius="10px"
                            height="100%"
                            w="100%"
                            startColor={
                              colorMode === "light" ? "#5B61FB" : "#FB5B78"
                            }
                          />
                        </Box>

                        <Box d="flex" mt={3}>
                          <Box
                            mt={1}
                            label="Studio"
                            cursor="pointer"
                            width="2.3rem"
                            height="2.3rem"
                            borderRadius="50%"
                          >
                            <SkeletonCircle
                              startColor={
                                colorMode === "light" ? "#5B61FB" : "#FB5B78"
                              }
                              size="10"
                            />
                          </Box>

                          <Box pl={5}>
                            <Box>
                              <SkeletonText
                                w="10rem"
                                startColor={
                                  colorMode === "light" ? "#5B61FB" : "#FB5B78"
                                }
                                noOfLines={3}
                                spacing="3"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Center>
              )}

              {!showVideoSkeleton && activeLink === 2 && (
                <Center w="100%">
                  <Box
                    d="grid"
                    mb={
                      window.screen.height * window.devicePixelRatio >= 1600
                        ? 5
                        : 0
                    }
                    w={["80%", "100%", "100%", "100%"]}
                    rowGap={28}
                    gridTemplateColumns={[
                      "4fr",
                      "2fr 2fr",
                      "1fr 1fr 1fr",
                      "1fr 1fr 1fr",
                      "4fr 4fr 4fr 4fr",
                    ]}
                    columnGap={[0, 3, 4, 5]}
                  >
                    {videos?.map((video) => (
                      <Box
                        borderRadius="20px"
                        height={["12rem", "10.3rem", "10.3rem", "10.3rem"]}
                      >
                        {/* Main Player box */}
                        <Box
                          cursor="pointer"
                          className={
                            colorMode === "light" ? "stream-light" : "stream"
                          }
                          height={["10.7rem", "9rem", "9rem", "9rem"]}
                        >
                          <RouterLink to={`/video/${video?.videoId}`}>
                            <Box
                              d="flex"
                              justifyContent="right"
                              bgImage={`url(${
                                video?.thumbnail
                                  ? video?.thumbnail
                                  : defaultThumbnail
                              })`}
                              bgSize="cover"
                              bgPosition="center"
                              className={
                                colorMode === "light"
                                  ? "stream-light__thumbnail"
                                  : "stream__thumbnail"
                              }
                              height="100%"
                              width="100%"
                              style={{ borderRadius: "10px" }}
                            >
                              <Text
                                borderRadius="2px"
                                as="h3"
                                w="auto"
                                color="white"
                                bg="rgb(0,0,0,0.3)"
                                flex="0 1 auto"
                                alignSelf="flex-end"
                                mr={1}
                              >
                                {video.duration}
                              </Text>
                            </Box>
                          </RouterLink>
                        </Box>

                        <Box d="flex" mt={3}>
                          <Box
                            mt={1}
                            label="Studio"
                            cursor="pointer"
                            width="2.3rem"
                            height="2.3rem"
                            borderRadius="50%"
                          >
                            <RouterLink
                              to={`/profile/${video?.creator?.userId}`}
                            >
                              <Avatar
                                src={video?.creator?.ProfileAvatar}
                                alt="John"
                                width="2.3rem"
                                height="2.3rem"
                                borderRadius="50%"
                              />
                            </RouterLink>
                          </Box>

                          <Box pl={5}>
                            <Box d="flex">
                              <RouterLink
                                to={`/profile/${video?.creator?.userId}`}
                              >
                                <Text
                                  as="h3"
                                  fontSize="0.9rem"
                                  color={
                                    colorMode === "light"
                                      ? "#101011"
                                      : "#FFD600"
                                  }
                                  fontWeight="600"
                                  cursor="pointer"
                                >
                                  {video?.creator?.username.slice(0, 8)}
                                </Text>
                              </RouterLink>
                              {video?.creator?.isVerified && (
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
                            <RouterLink to={`/video/${video?.videoId}`}>
                              <Text
                                noOfLines={2}
                                fontWeight="500"
                                lineHeight="1.25rem"
                                as="h2"
                                pt={1}
                                color={
                                  colorMode === "light"
                                    ? "rgb(5,0,0,0.85)"
                                    : "rgb(255,255,255,0.85)"
                                }
                                fontSize="1rem"
                              >
                                {video?.title}
                              </Text>
                            </RouterLink>
                            <Text
                              as="h2"
                              color={
                                colorMode === "light" ? "#595B5D" : "#595B5D"
                              }
                              fontSize="0.8rem"
                            >
                              {video?.views} views &bull;{" "}
                              {format(video.createdAt)}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Center>
              )}

              {showVideoSkeleton && activeLink == 2 && (
                <Center w="100%">
                  <Box
                    d="grid"
                    mb={
                      window.screen.height * window.devicePixelRatio >= 1600
                        ? 5
                        : 0
                    }
                    w={["80%", "100%", "100%", "100%"]}
                    rowGap={28}
                    gridTemplateColumns={[
                      "4fr",
                      "2fr 2fr",
                      "1fr 1fr 1fr",
                      "1fr 1fr 1fr",
                      "4fr 4fr 4fr 4fr",
                    ]}
                    columnGap={[0, 3, 4, 5]}
                  >
                    {skeletons.map(() => (
                      <Box height={["12rem", "10.3rem", "10.3rem", "10.3rem"]}>
                        {/* Main Player box */}
                        <Box
                          cursor="pointer"
                          height={["10.7rem", "9rem", "9rem", "9rem"]}
                        >
                          <Skeleton
                            borderRadius="10px"
                            height="100%"
                            w="100%"
                            startColor={
                              colorMode === "light" ? "#5B61FB" : "#FB5B78"
                            }
                          />
                        </Box>

                        <Box d="flex" mt={3}>
                          <Box
                            mt={1}
                            label="Studio"
                            cursor="pointer"
                            width="2.3rem"
                            height="2.3rem"
                            borderRadius="50%"
                          >
                            <SkeletonCircle
                              startColor={
                                colorMode === "light" ? "#5B61FB" : "#FB5B78"
                              }
                              size="10"
                            />
                          </Box>

                          <Box pl={5}>
                            <Box>
                              <SkeletonText
                                w="10rem"
                                startColor={
                                  colorMode === "light" ? "#5B61FB" : "#FB5B78"
                                }
                                noOfLines={3}
                                spacing="3"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Center>
              )}
            </>

            {activeLink === 3 && !showSpinner && (
              <Center
                w="100%"
                d={["none", "block", "block", "block", "block", "block"]}
              >
                <Box
                  d="grid"
                  gridTemplateColumns={[
                    "4fr",
                    "4fr",
                    "4fr",
                    "2fr 2fr",
                    "2fr 2fr",
                  ]}
                  gap={[5, 5, 5, 5, 5, 6]}
                  w="100%"
                >
                  {online
                    ?.filter((e) => e.userId !== user)
                    .slice(
                      0,
                      window.screen.height * window.devicePixelRatio >= 1600
                        ? 10
                        : 6
                    )
                    .map(
                      ({
                        userId,
                        username,
                        ProfileAvatar,
                        followers,
                        isOnline,
                        isVerified,
                        follow,
                      }) => (
                        <Box width="100%">
                          <FollowerComponent
                            mode={colorMode}
                            isVerified={isVerified}
                            isOnline={isOnline}
                            userId={userId}
                            username={username}
                            avatar={ProfileAvatar}
                            followers={followers}
                            follow={follow}
                          />
                        </Box>
                      )
                    )}
                </Box>
              </Center>
            )}

            {activeLink === 4 && !showSpinner && (
              <Center
                w="100%"
                d={["none", "block", "block", "block", "block", "block"]}
              >
                <Box
                  d="grid"
                  gridTemplateColumns={[
                    "4fr",
                    "4fr",
                    "4fr",
                    "2fr 2fr",
                    "2fr 2fr",
                  ]}
                  gap={[5, 5, 5, 5, 5, 6]}
                  w="100%"
                >
                  {verified
                    ?.filter((e) => e.userId !== user)
                    .slice(
                      0,
                      window.screen.height * window.devicePixelRatio >= 1600
                        ? 10
                        : 6
                    )
                    .map(
                      ({
                        userId,
                        username,
                        ProfileAvatar,
                        followers,
                        isOnline,
                        isVerified,
                        follow,
                      }) => (
                        <Box width="100%">
                          <FollowerComponent
                            mode={colorMode}
                            isVerified={isVerified}
                            isOnline={isOnline}
                            userId={userId}
                            username={username}
                            avatar={ProfileAvatar}
                            followers={followers}
                            follow={follow}
                          />
                        </Box>
                      )
                    )}
                </Box>
              </Center>
            )}

            {(activeLink === 3 || activeLink === 4) && showSpinner && (
              <Center
                w="100%"
                height={["12rem", "10.3rem", "10.3rem", "10.3rem"]}
              >
                <Spinner
                  thickness="4px"
                  color="#3EA6FF"
                  size="xl"
                  ariaLabel="loading"
                  speed="0.65s"
                  emptyColor="grey"
                />
              </Center>
            )}
          </Box>
        </Box>
      </Box>
    </Center>
  );
}

export default Home;
