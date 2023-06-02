import React from "react";
import {
  Box,
  Text,
  Center,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  RadioGroup,
  Stack,
  Radio,
  Button,
  Select,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import "./style.css";
import { getUserLives, startNewLive } from "../../../services/liveService";
import { editUser, getUser } from "../../../services/usersService";
import { useNavigate } from "react-router-dom";
import { useMetaMask } from "../../../hooks/useMetamask";
import { customAlphabet } from "nanoid";

function CreateStream() {
  document.title = "Start new live stream";

  const toast = useToast();
  const navigate = useNavigate();
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const [videoTitle, setVideoTitle] = React.useState("");
  const [userData, setUserData] = React.useState([]);
  const [description, setDescription] = React.useState("");
  const [tags, setTags] = React.useState([]);
  const [category, setCategory] = React.useState("Crypto");
  const [isLoading, setIsLoading] = React.useState(false);
  const { colorMode } = useColorMode();
  const nanoid1 = customAlphabet("qwertyuiopasdfghjklzxcvbnm0123456789", 8);
  const nanoid2 = customAlphabet("qwertyuiopasdfghjklzxcvbnm0123456789", 4);
  const nanoid3 = customAlphabet("qwertyuiopasdfghjklzxcvbnm0123456789", 12);
  const [visibility, setVisibility] = React.useState("1");

  const onStart = async () => {
    if (videoTitle.length > 3 && tags.length > 0) {
      setIsLoading(true);
      const streamKey =
        nanoid2() + "-" + nanoid2() + "-" + nanoid2() + "-" + nanoid2();
      const streamId =
        nanoid1() + "-" + nanoid2() + "-" + nanoid2() + "-" + nanoid3();
      if (streamKey) {
        await startNewLive({
          creator: userData._id,
          title: videoTitle,
          description: description,
          category: category,
          isActive: false,
          tags: tags,
          visibility: Number(visibility),
          streamUrl: streamId,
          streamKey: streamKey,
          playbackUrl: `${process.env.REACT_APP_LIVE_SERVER}/live/${streamKey}/index.m3u8`,
        });
        localStorage.setItem(`streamKey:${user}`, streamId);
        await editUser(user, { rewards: userData?.rewards + 0.25 });
        navigate(`/stream/${streamId}`);
      } else {
        toast({
          title: `An error occurred, please try again later`,
          position: "top",
          status: "error",
          isClosable: true,
        });
      }
    } else {
      toast({
        title: `Please fill in all required fields`,
        position: "top",
        status: "warning",
        isClosable: true,
      });
    }
  };

  const getUserData = async () => {
    try {
      const data = await getUser(user);
      if (data?.data) {
        const live = await getUserLives(data?.data?._id);
        if (live?.data?.streamUrl) {
          navigate(`/stream/${live?.data?.streamUrl}`);
        }
        setUserData(data.data);
      }
    } catch {}
  };

  React.useEffect(() => {
    getUserData();
  }, []);

  function handleKeyDown(e) {
    // If user did not press enter key, return
    if (e.key !== "Enter") return;
    // Get the value of the input
    const value = e.target.value;
    // If the value is empty, return
    if (!value.trim()) return;
    // Add the value to the tags array
    setTags([...tags, value.toLowerCase()]);
    // Clear the input
    e.target.value = "";
  }

  function removeTag(index) {
    setTags(tags.filter((el, i) => i !== index));
  }

  const handleVideoTitle = (e) => {
    setVideoTitle(e.target.value);
  };
  const handleDescription = (e) => {
    setDescription(e.target.value);
  };

  return (
    <>
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
            <Text
              as="h1"
              fontSize={["1.6rem", "1.7rem"]}
              color={
                colorMode === "light" ? "#1C1F20" : "rgb(255,255,255,0.90)"
              }
              fontFamily="sans-serif"
              pt={3}
              pb={5}
              borderBottom="1px solid rgb(96, 96, 96,0.6)"
              fontWeight="bold"
            >
              Create stream
            </Text>
            <Box
              d={["grid", "grid", "flex", "flex"]}
              pt={[5, 8, 8, 8]}
              gridAutoColumns={["4fr", "4fr", "", ""]}
            >
              <Box width={["100%", "100%", "50%", "50%"]} pl={[0, 2, 5, 5]}>
                <Text
                  as="h1"
                  color={
                    colorMode === "light" ? "#1C1F20" : "rgb(255,255,255,0.95)"
                  }
                  fontWeight="bold"
                  fontSize="1.4rem"
                  pb={3}
                >
                  Details
                </Text>
                <FormControl isRequired>
                  <FormLabel
                    htmlFor="title"
                    fontSize="1.1rem"
                    fontWeight="500"
                    fontFamily="sans-serif"
                    color={
                      colorMode === "light"
                        ? "#595B5D"
                        : "rgb(255,255,255,0.50)"
                    }
                  >
                    Title
                  </FormLabel>
                  <Input
                    _placeholder={
                      colorMode === "light"
                        ? { color: "black" }
                        : { color: "white" }
                    }
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
                    value={videoTitle}
                    onChange={handleVideoTitle}
                    id="title"
                    placeholder="Choose a title for your stream"
                    height="3rem"
                  />
                </FormControl>
                <FormControl pt={4}>
                  <FormLabel
                    htmlFor="description"
                    fontSize="1.1rem"
                    fontWeight="500"
                    fontFamily="sans-serif"
                    color={
                      colorMode === "light"
                        ? "#595B5D"
                        : "rgb(255,255,255,0.50)"
                    }
                  >
                    Description
                  </FormLabel>
                  <Textarea
                    onChange={handleDescription}
                    value={description}
                    fontSize="1rem"
                    placeholder="Tell viewers about your stream"
                    size="md"
                    resize="none"
                    height="8rem"
                    _placeholder={
                      colorMode === "light"
                        ? { color: "black" }
                        : { color: "white" }
                    }
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
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    color={
                      colorMode === "light"
                        ? "#1C1F20"
                        : "rgb(255,255,255,0.95)"
                    }
                    fontSize="1.1rem"
                    fontFamily="sans-serif"
                    pt={4}
                    fontWeight="bold"
                    d="flex"
                  >
                    Tags
                  </FormLabel>
                  <Text
                    as="p"
                    fontSize="0.9rem"
                    color={
                      colorMode === "light"
                        ? "#595B5D"
                        : "rgb(255,255,255,0.50)"
                    }
                  >
                    Tags can be useful if content in your stream is commonly
                    misspelled.
                  </Text>
                </FormControl>

                <FormControl pt={3}>
                  <div
                    className={
                      colorMode === "light"
                        ? "tags-input-container-light"
                        : "tags-input-container"
                    }
                  >
                    {tags.map((tag, index) => (
                      <div
                        className={
                          colorMode === "light" ? "tag-item-light" : "tag-item"
                        }
                        key={index}
                      >
                        <span className="text">{tag}</span>
                        <span
                          className={
                            colorMode === "light" ? "close-light" : "close"
                          }
                          onClick={() => removeTag(index)}
                        >
                          &times;
                        </span>
                      </div>
                    ))}
                    <input
                      onKeyDown={handleKeyDown}
                      type="text"
                      className="tags-input"
                      placeholder="Add tag"
                    />
                  </div>
                </FormControl>
              </Box>
              <Box width={["100%", "100%", "50%", "50%"]} pl={[0, 2, 16, 16]}>
                <Text
                  as="h3"
                  color={
                    colorMode === "light" ? "#1C1F20" : "rgb(255,255,255,0.95)"
                  }
                  fontSize="1.1rem"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  pt={3}
                >
                  Category
                </Text>
                <Text
                  as="p"
                  fontSize="0.9rem"
                  color={
                    colorMode === "light" ? "#595B5D" : "rgb(255,255,255,0.50)"
                  }
                  pt={2}
                >
                  Add your stream to a category so viewers can find it more
                  easily
                </Text>
                <FormControl pt={3}>
                  {colorMode === "dark" && (
                    <Select
                      defaultValue="Crypto"
                      size="lg"
                      bg="#111315"
                      color="white"
                    >
                      <option
                        style={{ backgroundColor: "#242627" }}
                        onClick={() => setCategory("Crypto")}
                        value="Crypto"
                      >
                        &nbsp;Crypto
                      </option>
                      <option
                        style={{ backgroundColor: "#242627" }}
                        onClick={() => setCategory("Gaming")}
                        value="Gaming"
                      >
                        &nbsp;Gaming
                      </option>
                      <option
                        style={{ backgroundColor: "#242627" }}
                        onClick={() => setCategory("Play 2 Earn")}
                        value="Play 2 Earn"
                      >
                        &nbsp;Play 2 Earn
                      </option>
                      <option
                        style={{ backgroundColor: "#242627" }}
                        onClick={() => setCategory("Lifectyle")}
                        value="Lifectyle"
                      >
                        &nbsp;Lifectyle
                      </option>
                      <option
                        style={{ backgroundColor: "#242627" }}
                        onClick={() => setCategory("Educational")}
                        value="Educational"
                      >
                        &nbsp;Educational
                      </option>
                      <option
                        style={{ backgroundColor: "#242627" }}
                        onClick={() => setCategory("Sports")}
                        value="Sports"
                      >
                        &nbsp;Sports
                      </option>
                      <option
                        style={{ backgroundColor: "#242627" }}
                        onClick={() => setCategory("Travel & Events")}
                        value="Travel & Events"
                      >
                        &nbsp;Travel & Events
                      </option>
                      <option
                        style={{ backgroundColor: "#242627" }}
                        onClick={() => setCategory("Film & Animation")}
                        value="Film & Animation"
                      >
                        &nbsp;Film & Animation
                      </option>
                      <option
                        style={{ backgroundColor: "#242627" }}
                        onClick={() => setCategory("People & Blogs")}
                        value="People & Blogs"
                      >
                        &nbsp;People & Blogs
                      </option>
                    </Select>
                  )}

                  {colorMode === "light" && (
                    <Select size="lg" bg="rgb(17, 19, 21,0.1)" color="#101011">
                      <option
                        style={{
                          backgroundColor: "rgb(17, 19, 21,0.3)",
                          color: "white",
                        }}
                        onClick={() => setCategory("Crypto")}
                        value="Crypto"
                      >
                        &nbsp;Crypto
                      </option>
                      <option
                        style={{
                          backgroundColor: "rgb(17, 19, 21,0.3)",
                          color: "white",
                        }}
                        onClick={() => setCategory("Gaming")}
                        value="Gaming"
                      >
                        &nbsp;Gaming
                      </option>
                      <option
                        style={{
                          backgroundColor: "rgb(17, 19, 21,0.3)",
                          color: "white",
                        }}
                        onClick={() => setCategory("Play 2 Earn")}
                        value="Play 2 Earn"
                      >
                        &nbsp;Play 2 Earn
                      </option>
                      <option
                        style={{
                          backgroundColor: "rgb(17, 19, 21,0.3)",
                          color: "white",
                        }}
                        onClick={() => setCategory("Lifectyle")}
                        value="Lifectyle"
                      >
                        &nbsp;Lifectyle
                      </option>
                      <option
                        style={{
                          backgroundColor: "rgb(17, 19, 21,0.3)",
                          color: "white",
                        }}
                        onClick={() => setCategory("Educational")}
                        value="Educational"
                      >
                        &nbsp;Educational
                      </option>
                      <option
                        style={{
                          backgroundColor: "rgb(17, 19, 21,0.3)",
                          color: "white",
                        }}
                        onClick={() => setCategory("Sports")}
                        value="Sports"
                      >
                        &nbsp;Sports
                      </option>
                      <option
                        style={{
                          backgroundColor: "rgb(17, 19, 21,0.3)",
                          color: "white",
                        }}
                        onClick={() => setCategory("Travel & Events")}
                        value="Travel & Events"
                      >
                        &nbsp;Travel & Events
                      </option>
                      <option
                        style={{
                          backgroundColor: "rgb(17, 19, 21,0.3)",
                          color: "white",
                        }}
                        onClick={() => setCategory("Film & Animation")}
                        value="Film & Animation"
                      >
                        &nbsp;Film & Animation
                      </option>
                      <option
                        style={{
                          backgroundColor: "rgb(17, 19, 21,0.3)",
                          color: "white",
                        }}
                        onClick={() => setCategory("People & Blogs")}
                        value="People & Blogs"
                      >
                        &nbsp;People & Blogs
                      </option>
                    </Select>
                  )}
                </FormControl>

                <Text
                  as="h3"
                  color={
                    colorMode === "light" ? "#1C1F20" : "rgb(255,255,255,0.95)"
                  }
                  fontSize="1.1rem"
                  fontFamily="sans-serif"
                  pt={6}
                  fontWeight="bold"
                >
                  Visibility
                </Text>
                <Text
                  as="p"
                  fontSize="0.9rem"
                  color={
                    colorMode === "light" ? "#595B5D" : "rgb(255,255,255,0.50)"
                  }
                  pt={2}
                >
                  Choose who can see your stream
                </Text>
                <Box
                  borderRadius="5px"
                  border={
                    colorMode === "light"
                      ? "1px solid #1C1F20"
                      : "1px solid rgb(255,255,255,0.50)"
                  }
                  height="8rem"
                  mt={3}
                >
                  <RadioGroup
                    onChange={setVisibility}
                    value={visibility}
                    pl={5}
                    pb={16}
                  >
                    <Stack>
                      <Radio value="1" pt={3}>
                        Public
                        <Text
                          as="p"
                          fontSize="0.85rem"
                          color={
                            colorMode === "light"
                              ? "#595B5D"
                              : "rgb(255,255,255,0.50)"
                          }
                        >
                          Everyone can watch your stream
                        </Text>
                      </Radio>

                      <Radio value="0">
                        NFT Holders
                        <Text
                          value={0}
                          as="p"
                          fontSize="0.85rem"
                          color={
                            colorMode === "light"
                              ? "#595B5D"
                              : "rgb(255,255,255,0.50)"
                          }
                        >
                          Only your NFT holders can watch your stream
                        </Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </Box>

                <Center>
                  {isLoading ? (
                    <Button
                      color="white"
                      isLoading
                      loadingText="Starting"
                      fontSize="1.4rem"
                      bg="#3ea6ff"
                      pb={1}
                      height="3rem"
                      width="100%"
                      mt={12}
                      _hover={{ bg: "rgb(62, 166, 255, 0.85)" }}
                      _active={{ bg: "rgb(62, 166, 255, 0.85)" }}
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      color="white"
                      onClick={onStart}
                      fontSize="1.4rem"
                      bg="#3ea6ff"
                      pb={1}
                      height="3rem"
                      width="100%"
                      mt={12}
                      _hover={{ bg: "rgb(62, 166, 255, 0.85)" }}
                      _active={{ bg: "rgb(62, 166, 255, 0.85)" }}
                    >
                      Start
                    </Button>
                  )}
                </Center>
              </Box>
            </Box>
          </Box>
        </Center>
      </Box>
    </>
  );
}

export default CreateStream;
