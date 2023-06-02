import React from "react";
import {
  Box,
  Text,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import FollowerComponent from "./FollowerComponent";
import { getUsers, getUser } from "../../../services/usersService";
import { useMetaMask } from "../../../hooks/useMetamask";
import { getWithExpiry, setWithExpiry } from "../Home/Home";

function Followers() {
  const { colorMode } = useColorMode();
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const [search, setSearch] = React.useState("");
  const [filteredData, setFileteredData] = React.useState([]);
  const [alluserData, setAllUserData] = React.useState([]);
  const [onlineFollowers, setOnlineFollowers] = React.useState(0);
  const [allFollowers, setAllFollowers] = React.useState(0);
  const [allFollowersData, setAllFollowersData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  document.title = `Followers`;

  React.useEffect(() => {
    getFollowersData();
  }, []);

  const getFollowersData = async () => {
    try {
      let data;
      if (getWithExpiry("AllUsers") !== null) {
        data = getWithExpiry("AllUsers");
        setAllUserData(data);
        setFileteredData(data);
      } else {
        const req = await getUsers();
        data = req?.data
          ?.filter((e) => e.userId !== user)
          .map((users) => {
            var isFollowing = false;
            if (users.followers.includes(user)) {
              isFollowing = true;
            }

            var userdata = {
              userId: users.userId,
              followers: users.followers,
              isOnline: users.isOnline,
              ProfileAvatar: users.ProfileAvatar,
              username: users.username,
              isVerified: users.isVerified,
              follow: isFollowing,
            };

            setAllUserData((alluserData) => [...alluserData, userdata]);
            setFileteredData((filteredData) => [...filteredData, userdata]);
          });
        setWithExpiry("AllUsers", data, 86400000);
      }

      const userInfo = await getUser(user);

      data?.map((myFollowers) => {
        if (userInfo.data.followers.includes(myFollowers.userId)) {
          setAllFollowers((allFollowers) => allFollowers + 1);
          var isFollowing = false;
          if (myFollowers.followers.includes(user)) {
            isFollowing = true;
          }
          if (myFollowers.isOnline == true) {
            setOnlineFollowers((onlineFollowers) => onlineFollowers + 1);
          }
          var data = {
            userId: myFollowers.userId,
            followers: myFollowers.followers,
            isOnline: myFollowers.isOnline,
            ProfileAvatar: myFollowers.ProfileAvatar,
            username: myFollowers.username,
            isVerified: myFollowers.isVerified,
            follow: isFollowing,
          };

          setAllFollowersData((allFollowersData) => [
            ...allFollowersData,
            data,
          ]);
        }
      });
    } catch (e) {
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  const filter = (e) => {
    e.preventDefault();
    setSearch(e.target.value);

    if (
      search === "" ||
      search === " " ||
      e.target.value === "" ||
      e.target.value === " "
    ) {
      setFileteredData(alluserData);
      return;
    }

    const usersfound = filteredData.filter((d) =>
      d.username.toLowerCase().includes(search.toLowerCase())
    );
    setFileteredData(usersfound);
  };

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
          <Box
            d="flex"
            borderBottom={
              colorMode === "light" ? "" : "1px solid rgb(96, 96, 96,0.6)"
            }
            width="100%"
            pb={2}
          >
            <Box width={["40%", "40%", "80%", "80%"]}>
              <Text
                width="100%"
                as="h1"
                fontSize={["1.6rem", "1.7rem"]}
                color={
                  colorMode === "light" ? "#1C1F20" : "rgb(255,255,255,0.90)"
                }
                fontFamily="sans-serif"
                pb={5}
                pt={[0, 2]}
                fontWeight="bold"
              >
                Followers
              </Text>
            </Box>

            {colorMode === "dark" && (
              <InputGroup ml={[10, 10, 28, 28]} pt={3} textAlign="right">
                <InputLeftElement
                  pt={8}
                  pl={2}
                  ml={24}
                  children={
                    <FiSearch size="1.5rem" color="rgb(255,255,255,0.5)" />
                  }
                />
                <Input
                  onChange={filter}
                  value={search}
                  ml={24}
                  pl={12}
                  width="80%"
                  height="3rem"
                  placeholder="Search"
                />
              </InputGroup>
            )}

            {colorMode === "light" && (
              <InputGroup ml={[10, 10, 28, 28]} pt={3} textAlign="right">
                <InputLeftElement
                  pt={8}
                  pl={2}
                  ml={24}
                  children={<FiSearch size="1.5rem" color="#1C1F20" />}
                />
                <Input
                  _hover={{ borderColor: "#5A5A5B" }}
                  width="80%"
                  borderColor="#5A5A5B"
                  focusBorderColor="#5A5A5B"
                  _placeholder={{ color: "black" }}
                  color="black"
                  onChange={filter}
                  value={search}
                  ml={24}
                  pl={12}
                  height="3rem"
                  placeholder="Search"
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
            <Box d="flex" pt={2}>
              <Box width="100%">
                <Tabs isFitted>
                  {colorMode === "dark" && (
                    <TabList width="100%">
                      <Tab
                        width="33%"
                        fontWeight={["500", "500", "600", "600"]}
                      >
                        All followers{" "}
                        <Text ml={[10, 10, 16, 16]} fontWeight="bold">
                          {allFollowers}
                        </Text>
                      </Tab>
                      <Tab
                        width="33%"
                        fontWeight={["500", "500", "600", "600"]}
                      >
                        Followers online{" "}
                        <Text ml={[10, 10, 16, 16]} fontWeight="bold">
                          {onlineFollowers}
                        </Text>
                      </Tab>
                      <Tab
                        width="33%"
                        fontWeight={["500", "500", "600", "600"]}
                      >
                        Connect
                      </Tab>
                    </TabList>
                  )}

                  {colorMode === "light" && (
                    <TabList borderRadius="5px" border="1px solid #111315">
                      <Tab
                        fontWeight={["500", "500", "600", "600"]}
                        _focus={{ border: "none" }}
                        _selected={{
                          color: "white",
                          bg: "#111315",
                          border: "none",
                        }}
                      >
                        All followers{" "}
                        <Text ml={[10, 10, 16, 16]} fontWeight="bold">
                          {allFollowers}
                        </Text>
                      </Tab>
                      <Tab
                        borderLeft="1px solid #111315"
                        fontWeight={["500", "500", "600", "600"]}
                        _focus={{ border: "none" }}
                        _selected={{
                          color: "white",
                          bg: "#111315",
                          border: "none",
                        }}
                      >
                        Followers online{" "}
                        <Text ml={[10, 10, 16, 16]} fontWeight="bold">
                          {onlineFollowers}
                        </Text>
                      </Tab>
                      <Tab
                        borderLeft="1px solid #111315"
                        fontWeight={["500", "500", "600", "600"]}
                        _focus={{ border: "none" }}
                        _selected={{
                          color: "white",
                          bg: "#111315",
                          border: "none",
                        }}
                      >
                        Connect
                      </Tab>
                    </TabList>
                  )}

                  <TabPanels height="100%">
                    <TabPanel>
                      {allFollowersData.length === 0 ? (
                        <Text
                          pt={3}
                          fontSize="1.2rem"
                          color="rgb(255,255,255,0.5)"
                        >
                          You don't have any followers yet.
                        </Text>
                      ) : (
                        <Box
                          d="grid"
                          gridTemplateColumns={[
                            "4fr",
                            "4fr",
                            "4fr",
                            "2fr 2fr",
                            "2fr 2fr",
                          ]}
                          gap={6}
                        >
                          {allFollowersData.map(
                            ({
                              username,
                              ProfileAvatar,
                              isVerified,
                              followers,
                              userId,
                              follow,
                              isOnline,
                            }) => (
                              <FollowerComponent
                                mode={colorMode}
                                username={username}
                                avatar={ProfileAvatar}
                                isVerified={isVerified}
                                followers={followers}
                                userId={userId}
                                follow={follow}
                                isOnline={isOnline}
                              />
                            )
                          )}
                        </Box>
                      )}
                    </TabPanel>
                    <TabPanel>
                      {onlineFollowers === 0 ? (
                        <Text
                          pt={3}
                          fontSize="1.2rem"
                          color="rgb(255,255,255,0.5)"
                        >
                          None of your followers is online.
                        </Text>
                      ) : (
                        <Box
                          d="grid"
                          gridTemplateColumns={[
                            "4fr",
                            "4fr",
                            "4fr",
                            "2fr 2fr",
                            "2fr 2fr",
                          ]}
                          gap={6}
                        >
                          {allFollowersData.map(
                            ({
                              username,
                              ProfileAvatar,
                              isVerified,
                              followers,
                              userId,
                              follow,
                              isOnline,
                            }) => (
                              <>
                                {isOnline && (
                                  <FollowerComponent
                                    mode={colorMode}
                                    username={username}
                                    avatar={ProfileAvatar}
                                    isVerified={isVerified}
                                    followers={followers}
                                    userId={userId}
                                    isOnline={isOnline}
                                    follow={follow}
                                  />
                                )}
                              </>
                            )
                          )}
                        </Box>
                      )}
                    </TabPanel>
                    <TabPanel>
                      <Box
                        d="grid"
                        gridTemplateColumns={[
                          "4fr",
                          "4fr",
                          "4fr",
                          "2fr 2fr",
                          "2fr 2fr",
                        ]}
                        gap={[6, 6, 4, 6]}
                      >
                        {filteredData.map(
                          ({
                            username,
                            ProfileAvatar,
                            isVerified,
                            followers,
                            userId,
                            follow,
                            isOnline,
                          }) => (
                            <FollowerComponent
                              mode={colorMode}
                              username={username}
                              avatar={ProfileAvatar}
                              isVerified={isVerified}
                              followers={followers}
                              userId={userId}
                              isOnline={isOnline}
                              follow={follow}
                            />
                          )
                        )}
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </Box>
          )}
        </Box>
      </Center>
    </Box>
  );
}

export default Followers;
