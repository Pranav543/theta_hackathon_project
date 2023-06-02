import React from "react";
import { Box, Center, Spinner, useColorMode } from "@chakra-ui/react";
import { getUsers } from "../../../services/usersService";
import FollowerComponent from "../Followers/FollowerComponent";
import { useMetaMask } from "../../../hooks/useMetamask";

function Verified() {
  document.title = "Verified Users";
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const [verified, setVerified] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { colorMode } = useColorMode();

  const getVerifiedUsers = async () => {
    try {
      const users = await getUsers();
      users.data
        .filter((e) => e.userId !== user)
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
          if (userdata.isVerified) {
            setVerified((verified) => [...verified, userdata]);
          }
        });
    } catch {}

    setIsLoading(false);
  };

  React.useState(() => {
    getVerifiedUsers();
  }, []);

  return (
    <>
      <Box
        w="100%"
        position="relative"
        ml={["0%", "0%", "0%", "12.2%", "12.2%", "12.2%"]}
        mt={["20%", "14.5%", "10%", "10%", "10%", "8.2%"]}
        height="86%"
      >
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
          <Center w="100%">
            <Box
              pt={4}
              d="grid"
              w={["95%", "95%", "95%", "100%"]}
              gridTemplateColumns={["4fr", "4fr", "4fr", "1fr 1fr", "1fr 1fr"]}
              rowGap={6}
              columnGap={4}
            >
              {verified?.map(
                ({
                  userId,
                  username,
                  ProfileAvatar,
                  followers,
                  isOnline,
                  isVerified,
                  follow,
                }) => (
                  <>
                    {isVerified && (
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
                    )}
                  </>
                )
              )}
            </Box>
          </Center>
        )}
      </Box>
    </>
  );
}

export default Verified;
