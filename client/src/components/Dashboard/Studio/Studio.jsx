import React from "react";
import {
  Box,
  Center,
  Text,
  Link,
  Modal,
  Input,
  FormLabel,
  Textarea,
  FormControl,
  RadioGroup,
  Stack,
  Radio,
  ModalOverlay,
  Select,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Spinner,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import Dropzone from "react-dropzone";
import { MdUpload } from "react-icons/md";
import { FiRadio } from "react-icons/fi";
import { BiImageAdd } from "react-icons/bi";
import { Link as RouterLink } from "react-router-dom";
import { uploadVideoFile, uploadVideo } from "../../../services/videoService";
import { editUser, getUser } from "../../../services/usersService";
import { customAlphabet } from "nanoid";
import { storeIMGProfile, storeVideo } from "../../../services/apiCalls";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { useMetaMask } from "../../../hooks/useMetamask";
import { getUserLives } from "../../../services/liveService";

function Studio() {
  document.title = `Studio`;
  const { currentAccount } = useMetaMask();
  const user = currentAccount.toLowerCase();
  const toast = useToast();
  const empty =
    "https://bafybeih2yjkdyp6jxf4qubv6wnwmmjljenbwxis4prmdmrqugp7c53lpym.ipfs.w3s.link/images.jpg";
  const history = useNavigate();
  const nanoid = customAlphabet("qwertyuiopasdfghjklzxcvbnm0123456789", 24);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fileUploaded, setFileUploaded] = React.useState(null);
  const [input, setInput] = React.useState(false);
  const [imageUpload, setImageUpload] = React.useState(null);
  const [active, setActive] = React.useState(0);
  const [userData, setUserData] = React.useState(null);
  const [videoTitle, setVideoTitle] = React.useState("");
  const [videoId, setVideoId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState([]);
  const [thumbnailUrl, setThumbnailUrl] = React.useState("");
  const [tags, setTags] = React.useState([]);
  const [videoDuration, setVideoDuration] = React.useState("0");
  const [category, setCategory] = React.useState("Crypto");
  const [filePath, setFilePath] = React.useState("");
  const [visibility, setVisibility] = React.useState("1");
  const [isVideoLoading, setIsVideoLoading] = React.useState(true);
  const [isSubmit, setIsSubmit] = React.useState(false);
  const [ipfs, setIPFS] = React.useState("");
  const { colorMode } = useColorMode();
  const [createdKey, setCreatedKey] = React.useState("");

  React.useEffect(() => {
    try {
      if (
        fileUploaded != null &&
        (fileUploaded.type == "video/mp4" ||
          fileUploaded.type == "video/quicktime")
      ) {
        setTimeout(() => {
          onDrop(fileUploaded);

          onOpen();
        }, 2000);
      } else if (
        fileUploaded != null &&
        !(
          fileUploaded.type == "video/mp4" ||
          fileUploaded.type == "video/quicktime"
        )
      ) {
        toast({
          title: `Only video files are allowed`,
          position: "top",
          isClosable: true,
          status: "error",
        });
        setFileUploaded(null);
      }
    } catch {}
  }, [fileUploaded]);

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

  const handleDropThumbnail = async () => {
    const img = await storeIMGProfile(imageUpload);

    if (img !== undefined) {
      var newThumbnail = thumbnail;
      newThumbnail.unshift(img);
      setThumbnailUrl(img);
      setThumbnail(newThumbnail);
      setActive(1);
    }
  };

  React.useEffect(() => {
    try {
      if (
        imageUpload != null &&
        (imageUpload.type == "image/png" ||
          imageUpload.type == "image/jpg" ||
          imageUpload.type == "image/jpeg" ||
          imageUpload.type == "image/webp")
      ) {
        handleDropThumbnail();
      } else if (
        imageUpload != null &&
        !(
          imageUpload.type == "image/png" ||
          imageUpload.type == "image/jpg" ||
          imageUpload.type == "image/jpeg" ||
          imageUpload.type == "image/webp"
        )
      ) {
        toast({
          title: `Only image files are allowed`,
          position: "top",
          isClosable: true,
          status: "error",
        });
        setImageUpload(null);
      }
    } catch {}
  }, [imageUpload]);

  const handleVideoDrop = (acceptedFiles) => {
    try {
      setFileUploaded(acceptedFiles[0]);
    } catch {}

    return acceptedFiles[0];
  };

  const handleDropImage = (acceptedFiles) => {
    try {
      setImageUpload(acceptedFiles[0]);
    } catch {}

    return acceptedFiles[0];
  };

  const handleVideoTitle = (e) => {
    setVideoTitle(e.target.value);
  };
  const handleDescription = (e) => {
    setDescription(e.target.value);
  };

  const getuser = async () => {
    if (user) {
      try {
        const data = await getUser(user);
        if (data?.data) setUserData(data?.data);
        if (
          localStorage.getItem("streamKey") !== null &&
          localStorage.getItem("streamKey") !== "null" &&
          localStorage.getItem("streamKey") !== undefined &&
          localStorage.getItem("streamKey") !== "undefined"
        ) {
          let key = localStorage.getItem("streamKey");
          setCreatedKey(key);
        } else {
          const live = await getUserLives(data?.data?._id);
          if (live?.data) {
            setCreatedKey(live?.data?.streamUrl);
            localStorage.setItem("streamKey", live?.data?.streamUrl);
          }
        }
      } catch (e) {}
    }
  };

  React.useEffect(() => {
    getuser();
  }, []);

  /// Reduce Base64 image size

  async function reduce_image_file_size(
    base64Str,
    MAX_WIDTH = 450,
    MAX_HEIGHT = 450
  ) {
    let resized_base64 = await new Promise((resolve) => {
      let img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL()); // this will return base64 image results after resize
      };
    });
    return resized_base64;
  }

  // Get video duration

  function getDuration(control) {
    var video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = function () {
      window.URL.revokeObjectURL(video.src);
      const totalSeconds = Math.floor(video.duration);
      const secondsToMinutes = (seconds) =>
        Math.floor(totalSeconds / 60) +
        ":" +
        ("0" + Math.floor(totalSeconds % 60)).slice(-2);
      setVideoDuration(secondsToMinutes);
    };
    video.src = URL.createObjectURL(control);
  }

  const onDrop = async (file) => {
    try {
      setIsVideoLoading(true);
      let formData = new FormData();

      formData.append("file", file);
      const response = await uploadVideoFile(formData);
      if (response?.data?.success) {
        const value = nanoid();
        setVideoId(value);
        setFilePath(`uploads/${response.data.fileName}`);
        setVideoTitle(fileUploaded.name.split(".")[0]);

        /// Generate Thumbnails

        await generateVideoThumbnails(fileUploaded, 3)
          .then(async (thumbnailArray) => {
            try {

              setThumbnail([
                thumbnailArray[0],
                thumbnailArray[1],
                thumbnailArray[2],
              ]);
              setThumbnailUrl(thumbnailArray[1]);
              var image1 = await reduce_image_file_size(thumbnailArray[0]);
              var image2 = await reduce_image_file_size(thumbnailArray[1]);
              var image3 = await reduce_image_file_size(thumbnailArray[2]);
              setThumbnail([image1, image2, image3]);
              setThumbnailUrl(image2);
            } catch (e) {}
          })
          .catch((err) => {
            console.error(err);
          });

        // get Video duration
        getDuration(fileUploaded);

        setIsVideoLoading(false);
        // Store to IPFS
        const ipfsURL = await storeVideo(fileUploaded);

        if (ipfsURL) {
          setIPFS(ipfsURL);
        }
      } else {
        toast({
          title: `Failed to upload video, please try again later`,
          position: "top",
          isClosable: true,
          status: "error",
        });
      }
    } catch (e) {}
  };

  const clearStates = () => {
    setFileUploaded(null);
    setImageUpload(null);
    setVideoTitle("");
    setDescription("");
    setThumbnail([]);
    setThumbnailUrl("");
    setTags([]);
    setVideoDuration("0");
    setCategory("");
    setVisibility("1");
    setInput(false);
  };

  const SubmitVideo = async () => {
    if (videoTitle.length < 3) {
      toast({
        title: `Title is required`,
        position: "top",
        isClosable: true,
      });
    } else {
      setIsSubmit(true);
      try {
        const response = await fetch(thumbnailUrl);
        const blob = await response.blob();
        const file = new File([blob], "image.png", { type: "image/png" });
        const ipfsimg = await storeIMGProfile(file);

        const data = await uploadVideo({
          videoId: videoId,
          creator: userData._id,
          videoPath: `${process.env.REACT_APP_SERVER_HOST}/${filePath}`,
          title: videoTitle,
          description: description,
          ipfsThumbnail: ipfsimg,
          thumbnail: thumbnailUrl,
          duration: videoDuration,
          tags: tags,
          category: category,
          visibility: Number(visibility),
          ipfsUrl: ipfs.length > 3 ? ipfs : "",
        });

        if (data.status == 200) {
          toast({
            title: `Video published successfully`,
            position: "top",
            isClosable: true,
            status: "success",
          });

          onClose();

          await editUser(user, { rewards: userData?.rewards + 0.2 });

          history(`/video/${videoId.toLocaleLowerCase()}`);
        }
      } catch (error) {
        toast({
          title: `An error occurred please try again later`,
          position: "top",
          isClosable: true,
          status: "error",
        });

        onClose();
      }
    }
  };

  return (
    <Box
      width="100%"
      position="relative"
      ml={["0%", "0%", "0%", "12.2%", "12.2%", "12.2%"]}
      mt={["20%", "14.5%", "8.4%", "8%", "6.8%", "6.8%"]}
      height="86%"
      bg={colorMode === "light" ? "#F2F2F2" : "#111315"}
      fontFamily="heading"
    >
      <Box width="100%" height="100%">
        <Center
          height="88%"
          d={["grid", "grid", "flex", "flex"]}
          gridTemplateColumns={["1fr", "1fr", "", ""]}
        >
          <Box width={["100%", "100%", "50%", "50%"]}>
            <Center>
              <Text
                as="h1"
                fontSize="1.6rem"
                color={
                  colorMode === "light" ? "#1C1F20" : "rgb(255,255,255,0.90)"
                }
                fontFamily="sans-serif"
                pt={5}
                pb={5}
                fontWeight="bold"
              >
                Upload video
              </Text>
            </Center>

            <Center width="100%" height="100%">
              <Box
                width="80%"
                height="70%"
                bg={colorMode === "light" ? "#1C1F20" : "rgb(89, 91, 93,0.36)"}
                _hover={
                  colorMode === "light"
                    ? { bg: "rgb(28, 31, 32,0.9)" }
                    : { bg: "rgb(89, 91, 93,0.55)" }
                }
                borderRadius="10px"
              >
                <Center
                  width="100%"
                  height="100%"
                  display="inline-block"
                  justifyContent="center"
                  textAlign="center"
                  alignItems="center"
                >
                  <Center pt={12}>
                    <Box width="9rem" height="9rem">
                      <Dropzone onDrop={handleVideoDrop}>
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
                                <Box
                                  bg={
                                    colorMode === "light" ? "grey" : "#1F1F1F"
                                  }
                                  borderRadius="50%"
                                  width="9rem"
                                  height="9rem"
                                  onClick={() => setInput(true)}
                                >
                                  <Center width="100%" height="100%">
                                    <input {...getInputProps()} name="file" />

                                    {input && fileUploaded !== null ? (
                                      <Spinner
                                        thickness="4px"
                                        color="#3EA6FF"
                                        size="xl"
                                        speed="0.65s"
                                        emptyColor="grey"
                                      />
                                    ) : (
                                      <MdUpload
                                        size="4.5rem"
                                        fill={
                                          colorMode === "light"
                                            ? "rgb(255,255,255,0.63"
                                            : "#909090"
                                        }
                                      />
                                    )}
                                  </Center>
                                </Box>
                              </Center>
                            </Box>
                          );
                        }}
                      </Dropzone>
                    </Box>
                  </Center>

                  <Text
                    as="h4"
                    fontSize={["0.9rem", "0.9rem", "1rem", "1rem"]}
                    color="white"
                    pt={5}
                  >
                    Drag and drop video file to upload
                  </Text>
                  <Text as="h4" fontSize="0.8rem" color="rgb(255,255,255,0.50)">
                    Only videos in .mp4 & .mov formats can be uploaded.
                  </Text>
                  <Center pt={5}>
                    <Box>
                      <Dropzone onDrop={handleVideoDrop}>
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
                                <Box
                                  bg="#3ea6ff"
                                  borderRadius="5px"
                                  width="8rem"
                                  height="2.5rem"
                                  onClick={() => setInput(true)}
                                >
                                  <Center width="100%" height="100%">
                                    <input name="file" {...getInputProps()} />
                                    <Text
                                      fontSize="0.9rem"
                                      fontFamily="sans-serif"
                                      color="#111315"
                                    >
                                      SELECT FILE
                                    </Text>
                                  </Center>
                                </Box>
                              </Center>
                            </Box>
                          );
                        }}
                      </Dropzone>
                    </Box>
                  </Center>
                  <Center width="100%">
                    <Center width="80%">
                      <Text
                        pt={10}
                        pb={6}
                        as="h4"
                        fontSize="0.8rem"
                        color="rgb(255,255,255,0.50)"
                      >
                        By submitting your videos to Stream Scape, you acknowledge
                        that you agree to Stream Scape's{" "}
                        <Link
                          href="https://stream-scape.io/terms"
                          color="#3ea6ff"
                          isExternal
                        >
                          Terms & Conditions.
                        </Link>
                      </Text>
                    </Center>
                  </Center>
                </Center>
              </Box>
            </Center>
          </Box>
          <Box width={["100%", "100%", "50%", "50%"]}>
            <Center>
              <Text
                as="h1"
                fontSize="1.6rem"
                color={
                  colorMode === "light" ? "#1C1F20" : "rgb(255,255,255,0.90)"
                }
                fontFamily="sans-serif"
                pb={5}
                pt={5}
                fontWeight="bold"
              >
                Go live
              </Text>
            </Center>

            <Center width="100%">
              <Box
                width="80%"
                height="70%"
                bg={colorMode === "light" ? "#1C1F20" : "rgb(89, 91, 93,0.36)"}
                _hover={
                  colorMode === "light"
                    ? { bg: "rgb(28, 31, 32,0.9)" }
                    : { bg: "rgb(89, 91, 93,0.55)" }
                }
                borderRadius="10px"
                cursor="pointer"
              >
                <RouterLink
                  to={
                    createdKey?.length > 5 ? `/stream/${createdKey}` : "/stream"
                  }
                >
                  <Center
                    width="100%"
                    height="100%"
                    display="inline-block"
                    justifyContent="center"
                    textAlign="center"
                    alignItems="center"
                  >
                    <Center>
                      <Box pt="100px">
                        <Center width="100%" height="100%">
                          <Box
                            bg={
                              colorMode === "light" ? "grey" : "rgb(0,0,0,0.45)"
                            }
                            borderRadius="50%"
                            width="9rem"
                            height="9rem"
                          >
                            {colorMode === "dark" && (
                              <Center
                                width="100%"
                                height="100%"
                                _hover={{ color: "#ff4949" }}
                                color="#909090"
                              >
                                <FiRadio size="4.5rem" />
                              </Center>
                            )}
                            {colorMode === "light" && (
                              <Center
                                width="100%"
                                height="100%"
                                _hover={{ color: "red" }}
                                color="rgb(255,255,255,0.63"
                              >
                                <FiRadio size="4.5rem" />
                              </Center>
                            )}
                          </Box>
                        </Center>
                      </Box>
                    </Center>

                    <Text
                      as="h4"
                      fontSize={["1rem", "1rem", "1.2rem", "1.2rem"]}
                      color="white"
                      pt={5}
                    >
                      Go live on Stream Scape
                    </Text>
                    <Text
                      as="h4"
                      fontSize="0.8rem"
                      color="rgb(255,255,255,0.50)"
                      pb="105px"
                    >
                      Start streaming now and build your audience.
                    </Text>
                  </Center>
                </RouterLink>
              </Box>
            </Center>
          </Box>
        </Center>
      </Box>

      {/* Video Upload Modal */}

      <Modal
        size="4xl"
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
      >
        <ModalOverlay />

        <ModalContent bg="#F7F7FC">
          <ModalCloseButton
            onClick={() => {
              clearStates();
            }}
          />

          <ModalBody
            bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
            borderRadius="5px"
          >
            {videoTitle != null && (
              <Text as="h2" fontSize="1.4rem" fontWeight="600" pt={1} pb={5}>
                {videoTitle}
              </Text>
            )}
            <Center
              width="100%"
              borderTop="1px solid rgb(96, 96, 96,0.6)"
              height="63vh"
            >
              <Box
                pl={[0, 0, 4, 4]}
                width={["95%", "95%", "100%", "100%"]}
                pt={5}
                pb={5}
                pr={[5, 5, 0, 0]}
                bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
                d={["grid", "grid", "flex", "flex"]}
                overflowY="auto"
                height="100%"
              >
                <Box width={["100%", "100%", "60%", "60%"]}>
                  <Text
                    as="h1"
                    color={
                      colorMode === "light"
                        ? "#1C1F20"
                        : "rgb(255,255,255,0.95)"
                    }
                    fontWeight="bold"
                    fontSize="1.6rem"
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
                      required
                      value={videoTitle}
                      onChange={handleVideoTitle}
                      id="title"
                      placeholder="Choose a title for your video"
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
                      placeholder="Tell viewers about your video"
                      size="md"
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
                    />
                  </FormControl>
                  <Text
                    as="h3"
                    color={
                      colorMode === "light"
                        ? "#1C1F20"
                        : "rgb(255,255,255,0.95)"
                    }
                    fontSize="1.1rem"
                    fontFamily="sans-serif"
                    pt={5}
                    fontWeight="bold"
                  >
                    Thumbnail
                  </Text>
                  <Text
                    as="p"
                    fontSize="0.9rem"
                    color={
                      colorMode === "light"
                        ? "#595B5D"
                        : "rgb(255,255,255,0.50)"
                    }
                  >
                    Select or upload a picture that shows what's in your video.
                  </Text>
                  <Box pt={3} width="100%" d="flex" height="5.5rem" gap={1.5}>
                    <Box
                      width="25%"
                      border="1px dashed rgb(96, 96, 96)"
                      cursor="pointer"
                      borderRadius="2px"
                    >
                      <Dropzone
                        onDrop={handleDropImage}
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
                                <Box
                                  width="100%"
                                  height="100%"
                                  justifyContent="center"
                                  alignItems="center"
                                  textAlign="center"
                                >
                                  <input {...getInputProps()} />
                                  <Center pt={3}>
                                    <BiImageAdd size="2rem" color="grey" />
                                  </Center>

                                  <Text
                                    as="h5"
                                    color={
                                      colorMode === "light"
                                        ? "#595B5D"
                                        : "rgb(255,255,255,0.50)"
                                    }
                                    fontSize="0.65rem"
                                  >
                                    Upload thumbnail
                                  </Text>
                                </Box>
                              </Center>
                            </Box>
                          );
                        }}
                      </Dropzone>
                    </Box>
                    <Box
                      width="25%"
                      bg={
                        colorMode === "light"
                          ? "rgb(17, 19, 21,0.3)"
                          : "#111315"
                      }
                      onClick={() => {
                        setActive(1);
                        setThumbnailUrl(
                          thumbnail.length > 2 ? thumbnail[0] : empty
                        );
                      }}
                      cursor="pointer"
                      borderRadius="2px"
                      border={active === 1 ? "1px solid white" : ""}
                      bgImage={`url(${thumbnail[0]})`}
                      bgPosition="center"
                      bgSize="cover"
                    ></Box>
                    <Box
                      width="25%"
                      bg={
                        colorMode === "light"
                          ? "rgb(17, 19, 21,0.3)"
                          : "#111315"
                      }
                      onClick={() => {
                        setActive(2);
                        setThumbnailUrl(
                          thumbnail.length > 2 ? thumbnail[1] : empty
                        );
                      }}
                      cursor="pointer"
                      borderRadius="2px"
                      border={active === 2 ? "1px solid white" : ""}
                      bgImage={`url(${thumbnail[1]})`}
                      bgPosition="center"
                      bgSize="cover"
                    ></Box>
                    <Box
                      width="25%"
                      bg={
                        colorMode === "light"
                          ? "rgb(17, 19, 21,0.3)"
                          : "#111315"
                      }
                      onClick={() => {
                        setActive(3);
                        setThumbnailUrl(
                          thumbnail.length > 2 ? thumbnail[2] : empty
                        );
                      }}
                      cursor="pointer"
                      borderRadius="2px"
                      border={active === 3 ? "1px solid white" : ""}
                      bgImage={`url(${thumbnail[2]})`}
                      bgPosition="center"
                      bgSize="cover"
                    ></Box>
                  </Box>

                  <Text
                    as="h3"
                    color={
                      colorMode === "light"
                        ? "#1C1F20"
                        : "rgb(255,255,255,0.95)"
                    }
                    fontSize="1.1rem"
                    fontFamily="sans-serif"
                    pt={5}
                    fontWeight="bold"
                  >
                    Category
                  </Text>
                  <Text
                    as="p"
                    fontSize="0.9rem"
                    color={
                      colorMode === "light"
                        ? "#595B5D"
                        : "rgb(255,255,255,0.50)"
                    }
                  >
                    Add your video to a category so viewers can find it more
                    easily
                  </Text>
                  <FormControl pt={3}>
                    {colorMode === "dark" && (
                      <Select size="lg" bg="#242627" color="white">
                        <option
                          style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                          onClick={() => setCategory("Crypto")}
                          value="Crypto"
                        >
                          &nbsp;Crypto
                        </option>
                        <option
                          style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                          onClick={() => setCategory("Gaming")}
                          value="Gaming"
                        >
                          &nbsp;Gaming
                        </option>
                        <option
                          style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                          onClick={() => setCategory("Play 2 Earn")}
                          value="Play 2 Earn"
                        >
                          &nbsp;Play 2 Earn
                        </option>
                        <option
                          style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                          onClick={() => setCategory("Lifectyle")}
                          value="Lifectyle"
                        >
                          &nbsp;Lifectyle
                        </option>
                        <option
                          style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                          onClick={() => setCategory("Educational")}
                          value="Educational"
                        >
                          &nbsp;Educational
                        </option>
                        <option
                          style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                          onClick={() => setCategory("Sports")}
                          value="Sports"
                        >
                          &nbsp;Sports
                        </option>
                        <option
                          style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                          onClick={() => setCategory("Travel & Events")}
                          value="Travel & Events"
                        >
                          &nbsp;Travel & Events
                        </option>
                        <option
                          style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                          onClick={() => setCategory("Film & Animation")}
                          value="Film & Animation"
                        >
                          &nbsp;Film & Animation
                        </option>
                        <option
                          style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                          onClick={() => setCategory("People & Blogs")}
                          value="People & Blogs"
                        >
                          &nbsp;People & Blogs
                        </option>
                      </Select>
                    )}

                    {colorMode === "light" && (
                      <Select
                        size="lg"
                        bg="rgb(17, 19, 21,0.3)"
                        color="#101011"
                      >
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
                      colorMode === "light"
                        ? "#1C1F20"
                        : "rgb(255,255,255,0.95)"
                    }
                    fontSize="1.1rem"
                    fontFamily="sans-serif"
                    pt={5}
                    fontWeight="bold"
                  >
                    Tags
                  </Text>
                  <Text
                    as="p"
                    fontSize="0.9rem"
                    color={
                      colorMode === "light"
                        ? "#595B5D"
                        : "rgb(255,255,255,0.50)"
                    }
                  >
                    Tags can be useful if content in your video is commonly
                    misspelled.
                  </Text>
                  <FormControl pt={3}>
                    {/* <Input id='tags' value={tags} onChange={handleTags} placeholder='Add tag' height="3rem" /> */}
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
                            colorMode === "light"
                              ? "tag-item-light"
                              : "tag-item"
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
                  <Text
                    as="h3"
                    color={
                      colorMode === "light"
                        ? "#1C1F20"
                        : "rgb(255,255,255,0.95)"
                    }
                    fontSize="1.1rem"
                    fontFamily="sans-serif"
                    pt={5}
                    fontWeight="bold"
                  >
                    Visibility
                  </Text>
                  <Text
                    as="p"
                    fontSize="0.9rem"
                    color={
                      colorMode === "light"
                        ? "#595B5D"
                        : "rgb(255,255,255,0.50)"
                    }
                  >
                    Choose who can see your video
                  </Text>
                  <Box
                    borderRadius="5px"
                    border={
                      colorMode === "light"
                        ? "1px solid #1C1F20"
                        : "1px solid rgb(255,255,255,0.50)"
                    }
                    height="11.5rem"
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
                            value={1}
                            as="p"
                            fontSize="0.85rem"
                            color={
                              colorMode === "light"
                                ? "#595B5D"
                                : "rgb(255,255,255,0.50)"
                            }
                          >
                            Everyone can watch your video
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
                            Only your NFT holders can watch your video
                          </Text>
                        </Radio>

                        <Radio value="2">
                          Private
                          <Text
                            value={2}
                            as="p"
                            fontSize="0.85rem"
                            color={
                              colorMode === "light"
                                ? "#595B5D"
                                : "rgb(255,255,255,0.50)"
                            }
                          >
                            Only you can watch your video
                          </Text>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </Box>
                </Box>

                <Center
                  width={["100%", "100%", "40%", "40%"]}
                  pl={[0, 0, 5, 5]}
                  pr={[0, 0, 5, 5]}
                  pt={[0, 0, 1, 1]}
                >
                  <Box
                    width={["60%", "50%", "100%", "100%"]}
                    height={["100%", "100%", "50%", "50%"]}
                  >
                    <Box
                      width="100%"
                      bg={thumbnailUrl.length < 1 ? "black" : ""}
                      d="flex"
                      justifyContent="right"
                      height="74%"
                      bgImage={`url(${thumbnailUrl})`}
                      bgPosition="center"
                      bgSize="cover"
                      mt={20}
                      borderRadius="5px 5px 0px 0px"
                    >
                      {isVideoLoading && fileUploaded !== null ? (
                        <Center w="100%" h="100%">
                          <Spinner
                            thickness="4px"
                            color="#3EA6FF"
                            size="xl"
                            speed="0.65s"
                            emptyColor="grey"
                          />
                        </Center>
                      ) : (
                        <></>
                      )}
                      <Text
                        color="white"
                        borderRadius="2px"
                        as="h3"
                        w="auto"
                        bg="rgb(0,0,0,0.3)"
                        flex="0 1 auto"
                        noOfLines={1}
                        alignSelf="flex-end"
                        mr={2}
                      >
                        {videoDuration}
                      </Text>
                    </Box>
                    <Box
                      width="100%"
                      height="26%"
                      bg="rgb(0, 0, 0,0.1)"
                      borderRadius="0px 0px 5px 5px"
                    >
                      <Box pl={5} height="100%" pt={1}>
                        {fileUploaded != null && (
                          <Text
                            noOfLines={2}
                            as="h2"
                            fontSize="0.9rem"
                            fontWeight="600"
                            pb={6}
                          >
                            {fileUploaded.name.split(".")[0].length < 74
                              ? fileUploaded.name.split(".")[0]
                              : fileUploaded.name.split(".")[0].slice(0, 74) +
                                "..."}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Center>
              </Box>
            </Center>
            <Box
              width="100%"
              borderTop="1px solid rgb(96, 96, 96,0.6)"
              height="4rem"
              position="sticky"
              textAlign="end"
            >
              {isSubmit ? (
                <Button
                  color="white"
                  isLoading
                  loadingText="Publish"
                  fontSize="1rem"
                  bg="#3ea6ff"
                  mr={5}
                  pb={1}
                  height="3rem"
                  width="7rem"
                  mt={3}
                  _hover={{ bg: "rgb(62, 166, 255, 0.85)" }}
                  _active={{ bg: "rgb(62, 166, 255, 0.85)" }}
                ></Button>
              ) : (
                <Button
                  isDisabled={isVideoLoading}
                  color="white"
                  onClick={SubmitVideo}
                  fontSize="1.15rem"
                  bg="#3ea6ff"
                  mr={5}
                  pb={1}
                  height="3rem"
                  width="7rem"
                  mt={3}
                  _hover={{ bg: "rgb(62, 166, 255, 0.85)" }}
                  _active={{ bg: "rgb(62, 166, 255, 0.85)" }}
                >
                  Publish
                </Button>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Studio;
