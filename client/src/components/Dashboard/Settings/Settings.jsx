import React from "react";
import {
  Box,
  Center,
  Text,
  Button,
  Avatar,
  Textarea,
  Input,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import { BiEdit } from "react-icons/bi";
import { FiEdit } from "react-icons/fi";
import Dropzone from "react-dropzone";
import { getUser, editUser } from "../../../services/usersService";
import { storeIMGProfile } from "../../../services/apiCalls";
import { useMetaMask } from "../../../hooks/useMetamask";

function Setting() {
  document.title = `Profile Settings`;

  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();

  const [textAreaedit, setTextAreaEdit] = React.useState(false);
  const [usernameEdit, setUsernameEdit] = React.useState(false);
  const [about, setAbout] = React.useState(
    "Hello, welcome to my Cratch channel!"
  );
  const [avatar, setAvatar] = React.useState(
    "https://bafybeifgsujzqhmwznuytnynypwg2iaotji3d3whty5ymjbi6gghwcmgk4.ipfs.dweb.link/profile-avatar.png"
  );
  const [cover, setCover] = React.useState(
    "https://bafybeie3mniojsxcxbvruv4hcfadymzl3c7dioj7jvffyr53rtelduys3a.ipfs.dweb.link/meta.jpeg"
  );
  const [username, setUsername] = React.useState(
    localStorage.getItem("userLogged").toLowerCase().slice(0, 12)
  );
  const [balance, setBalance] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [imgProfile, setImgProfile] = React.useState(false);
  const [imgCover, setImgCover] = React.useState(false);
  const { colorMode } = useColorMode();

  const handleDropAvatarImage = async (acceptedFiles) => {
    setImgProfile(true);
    const img = await storeIMGProfile(acceptedFiles[0]);
    if (img !== undefined) {
      setAvatar(img);
      setImgProfile(false);
    }
    await editUser(user, { ProfileAvatar: img });
  };

  const handleDropCoverImage = async (acceptedFiles) => {
    setImgCover(true);
    const img = await storeIMGProfile(acceptedFiles[0]);
    if (img !== undefined) {
      setCover(img);
      setImgCover(false);
    }

    await editUser(user, { ProfileCover: img });
  };

  const GetUser = async () => {
    try {
      const result = await getUser(user);
      setCover(result.data.ProfileCover);
      setUsername(result.data.username.slice(0, 12));
      setAvatar(result.data.ProfileAvatar);
      setAbout(result.data.about);
      setBalance(result.data.rewards);
      setIsLoading(false);
    } catch {
      console.log("");
    }
  };

  const userEdit = async () => {
    try {
      const data = await editUser(user, { username: username });
      if (data.data.username.length > 1) {
        setUsername(username);
      }
    } catch {
      console.log("");
    }
  };

  const aboutEdit = async () => {
    try {
      const data = await editUser(user, { about: about });
      if (data.data.about.length > 1) {
        setAbout(about);
      }
    } catch {
      console.log("");
    }
  };

  React.useEffect(() => {
    GetUser();
  }, []);

  const handleChange = (e) => {
    setAbout(e.target.value);
  };
  const handleInputChange = (e) => {
    setUsername(e.target.value);
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
      <Center>
        <Box width={["90%", "90%", "90%", "95%", "95%", "95%"]} height="100%">
          <Box width="100%">
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
              Settings
            </Text>
          </Box>
          <Text
            pb={3}
            fontSize={["1rem", "1rem", "1.2rem", "1.2rem"]}
            fontWeight="bold"
          >
            Profile cover
          </Text>
          {imgCover ? (
            <Center w="100%" h="20vh">
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
              height="20vh"
              width="100%"
              bgImage={`url(${cover})`}
              bgSize="cover"
              bgPosition="center center"
              borderRadius="4px"
            >
              <Box
                d="flex"
                justifyContent="right"
                textAlign="right"
                _hover={{ color: "#D2BB31" }}
              >
                <Dropzone
                  onDrop={handleDropCoverImage}
                  accept="image/*"
                  minSize={1024}
                  maxSize={3072000}
                >
                  {({
                    getRootProps,
                    getInputProps,
                    isDragActive,
                    isDragAccept,
                    isDragReject,
                  }) => {
                    const additionalClass = isDragAccept
                      ? "accept"
                      : isDragReject
                      ? "reject"
                      : "";

                    return (
                      <Box
                        {...getRootProps({
                          className: `dropzone ${additionalClass}`,
                        })}
                        cursor="pointer"
                      >
                        <Center width="100%" height="100%">
                          <input {...getInputProps()} />

                          {colorMode === "dark" && (
                            <BiEdit cursor="pointer" size="2.2rem" />
                          )}
                          {colorMode === "light" && (
                            <BiEdit
                              fill="white"
                              cursor="pointer"
                              size="2.2rem"
                            />
                          )}
                        </Center>
                      </Box>
                    );
                  }}
                </Dropzone>
              </Box>
            </Box>
          )}
          {isLoading ? (
            <Center w="100%" h="45vh">
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
              w="100%"
              height="45vh"
              d={["grid", "grid", "flex", "flex"]}
              columnGap={[0, 0, 5, 5]}
              gridTemplateColumns={["2fr 2fr", "2fr 2fr", "", ""]}
            >
              <Box w={["100%", "100%", "26%", "26%"]} pt={5}>
                <Box w="100%" h="100%">
                  <Box w="100%" d="flex">
                    <Box>
                      <Text
                        pb={3}
                        fontSize={["1rem", "1rem", "1.2rem", "1.2rem"]}
                        fontWeight="bold"
                      >
                        Profile avatar
                      </Text>
                    </Box>
                  </Box>

                  <Box h="100%">
                    <Box h="100%" w="100%">
                      <Box w="100%" height="50%">
                        <Box
                          w="75%"
                          h="100%"
                          bg="rgb(55, 57, 58,0.5)"
                          borderRadius="5px"
                          d="flex"
                        >
                          <Box position="absolute" pl={1} pt={1}>
                            <Box cursor="pointer" _hover={{ color: "#D2BB31" }}>
                              <Dropzone
                                onDrop={handleDropAvatarImage}
                                accept="image/*"
                                minSize={1024}
                                maxSize={3072000}
                              >
                                {({
                                  getRootProps,
                                  getInputProps,
                                  isDragActive,
                                  isDragAccept,
                                  isDragReject,
                                }) => {
                                  const additionalClass = isDragAccept
                                    ? "accept"
                                    : isDragReject
                                    ? "reject"
                                    : "";

                                  return (
                                    <Box
                                      {...getRootProps({
                                        className: `dropzone ${additionalClass}`,
                                      })}
                                      cursor="pointer"
                                    >
                                      <Center width="100%" height="100%">
                                        <input {...getInputProps()} />

                                        {colorMode === "dark" && (
                                          <FiEdit
                                            cursor="pointer"
                                            size="1.6rem"
                                          />
                                        )}
                                        {colorMode === "light" && (
                                          <FiEdit
                                            color="white"
                                            cursor="pointer"
                                            size="1.6rem"
                                          />
                                        )}
                                      </Center>
                                    </Box>
                                  );
                                }}
                              </Dropzone>
                            </Box>
                          </Box>
                          <Center w="100%" h="100%">
                            <Box borderRadius="50%" mt={2} mb={2}>
                              {imgProfile ? (
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
                                <Avatar
                                  w={["5rem", "5rem", "6rem", "7.5rem"]}
                                  h={["5rem", "5rem", "6rem", "7.5rem"]}
                                  src={avatar}
                                />
                              )}
                            </Box>
                          </Center>
                        </Box>
                      </Box>
                      <Box h="50%" w="100%">
                        <Box w="100%">
                          <Text
                            pt={5}
                            pb={2}
                            fontSize={["1rem", "1rem", "1.2rem", "1.2rem"]}
                            fontWeight="bold"
                          >
                            Username
                          </Text>
                          {colorMode === "dark" && (
                            <Box d="flex">
                              <Box
                                w="50%"
                                boxShadow="0px 4px 21px rgb(218, 194, 50,0.11)"
                                borderRadius="5px"
                                border="1px solid rgb(255,255,255,0.3)"
                              >
                                {usernameEdit ? (
                                  <Input
                                    fontSize="1.1rem"
                                    value={username}
                                    onChange={handleInputChange}
                                  />
                                ) : (
                                  <Text
                                    color="#DAC232"
                                    fontSize={[
                                      "0.9rem",
                                      "0.9rem",
                                      "1.1rem",
                                      "1.1rem",
                                    ]}
                                    pl={2.5}
                                    pt={1.5}
                                    fontWeight={["500", "bold"]}
                                    fontFamily="sans-serif"
                                  >
                                    {username}
                                  </Text>
                                )}
                              </Box>

                              <Box w="50%" pl={4}>
                                {usernameEdit ? (
                                  <Button
                                    onClick={() => {
                                      userEdit();
                                      setUsernameEdit(!usernameEdit);
                                    }}
                                    w="50%"
                                  >
                                    Save
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() =>
                                      setUsernameEdit(!usernameEdit)
                                    }
                                    w="50%"
                                  >
                                    Edit
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          )}

                          {colorMode === "light" && (
                            <Box d="flex">
                              <Box
                                w="50%"
                                boxShadow="0px 2px 2px #2D2D2E"
                                borderRadius="5px"
                                border="1px solid #2D2D2E"
                              >
                                {usernameEdit ? (
                                  <Input
                                    _hover={{ borderColor: "#5A5A5B" }}
                                    borderColor="#5A5A5B"
                                    focusBorderColor="#5A5A5B"
                                    _placeholder={{ color: "black" }}
                                    color="black"
                                    fontSize={[
                                      "0.9rem",
                                      "0.9rem",
                                      "1.1rem",
                                      "1.1rem",
                                    ]}
                                    value={username}
                                    onChange={handleInputChange}
                                  />
                                ) : (
                                  <Text
                                    color={
                                      colorMode === "light"
                                        ? "#1C1F20"
                                        : "#DAC232"
                                    }
                                    fontSize={[
                                      "0.9rem",
                                      "0.9rem",
                                      "1.1rem",
                                      "1.1rem",
                                    ]}
                                    pl={2.5}
                                    pt={1.5}
                                    fontWeight={["500", "bold"]}
                                    fontFamily="sans-serif"
                                  >
                                    {username}
                                  </Text>
                                )}
                              </Box>

                              <Box w="50%" pl={4}>
                                {usernameEdit ? (
                                  <Button
                                    _active={{ bg: "#5A5A5B" }}
                                    _hover={{ bg: "#5A5A5B" }}
                                    color="white"
                                    bg="#5A5A5B"
                                    onClick={() => {
                                      userEdit();
                                      setUsernameEdit(!usernameEdit);
                                    }}
                                    w="50%"
                                  >
                                    Save
                                  </Button>
                                ) : (
                                  <Button
                                    _active={{ bg: "#5A5A5B" }}
                                    color="white"
                                    bg="#5A5A5B"
                                    _hover={{ bg: "#5A5A5B" }}
                                    onClick={() =>
                                      setUsernameEdit(!usernameEdit)
                                    }
                                    w="50%"
                                  >
                                    Edit
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box w={["100%", "100%", "40%", "40%"]} h="100%" pt={5}>
                <Box w={["100%", "100%", "90%", "90%"]} d="flex">
                  <Box w="80%">
                    <Text
                      fontSize={["1rem", "1rem", "1.2rem", "1.2rem"]}
                      fontWeight="bold"
                    >
                      About
                    </Text>
                  </Box>
                  {colorMode === "dark" && (
                    <Center w="20%" justifyContent="right">
                      {textAreaedit == false && (
                        <Button onClick={() => setTextAreaEdit(!textAreaedit)}>
                          Edit
                        </Button>
                      )}
                    </Center>
                  )}

                  {colorMode === "light" && (
                    <Center w="20%" justifyContent="right">
                      {textAreaedit == false && (
                        <Button
                          _active={{ bg: "#5A5A5B" }}
                          _hover={{ bg: "#5A5A5B" }}
                          color="white"
                          bg="#5A5A5B"
                          onClick={() => setTextAreaEdit(!textAreaedit)}
                        >
                          Edit
                        </Button>
                      )}
                    </Center>
                  )}
                </Box>
                <Box w={["100%", "100%", "90%", "90%"]}>
                  <Textarea
                    isReadOnly={!textAreaedit}
                    value={about}
                    onChange={handleChange}
                    mt={1.5}
                    placeholder="Write something about you or your content"
                    size="sm"
                    resize="none"
                    rows={textAreaedit ? 9 : 10}
                    color={colorMode === "light" ? "black" : "white"}
                    _hover={
                      colorMode === "light" ? { borderColor: "#5A5A5B" } : {}
                    }
                    borderColor={
                      colorMode === "light"
                        ? "#5A5A5B"
                        : "rgba(255, 255, 255, 0.24)"
                    }
                    focusBorderColor={colorMode === "light" ? "#5A5A5B" : ""}
                    borderRadius="5px"
                  />
                  {textAreaedit == true && (
                    <Center pt={2} w="100%" justifyContent="right">
                      {colorMode === "dark" && (
                        <Button
                          w="30%"
                          onClick={() => {
                            aboutEdit();
                            setTextAreaEdit(!textAreaedit);
                          }}
                        >
                          Save
                        </Button>
                      )}
                      {colorMode === "light" && (
                        <Button
                          _active={{ bg: "#5A5A5B" }}
                          _hover={{ bg: "#5A5A5B" }}
                          color="white"
                          bg="#5A5A5B"
                          w="30%"
                          onClick={() => {
                            aboutEdit();
                            setTextAreaEdit(!textAreaedit);
                          }}
                        >
                          Save
                        </Button>
                      )}
                    </Center>
                  )}
                </Box>
              </Box>
              <Box
                w={["100%", "100%", "34%", "34%"]}
                h="100%"
                pt={[8, 8, 5, 5]}
              >
                <Text
                  fontSize={["1rem", "1rem", "1.2rem", "1.2rem"]}
                  fontWeight="bold"
                  pb={4}
                  pt={[5, 5, 0, 0]}
                >
                  Balance
                </Text>

                <Box
                  w="90%"
                  h="76%"
                  bg={
                    colorMode === "light" ? "rgb(55, 57, 58,0.35)" : "#232527"
                  }
                  borderRadius="5px"
                >
                  <Center w="100%" h="90%">
                    <Box>
                      <Box w="100%" textAlign="center">
                        <Text
                          color={colorMode === "light" ? "#1C1F20" : "#FFD600"}
                          fontWeight="bold"
                          fontSize={["1.2rem", "1.8rem"]}
                        >
                          {balance.toFixed(2)} $CRTC
                        </Text>
                      </Box>
                      <Box w="100%">
                        <Button
                          color={colorMode === "light" ? "white" : "#111315"}
                          isDisabled={true}
                          fontSize="1.1rem"
                          pb={0.5}
                          w="100%"
                          mt={5}
                          _hover={{ bg: "rgb(62, 166, 255,0.89)" }}
                          _active={{ bg: "rgb(62, 166, 255,0.89)" }}
                          bg="#3EA6FF"
                          mb={2}
                        >
                          Withdraw
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

export default Setting;
