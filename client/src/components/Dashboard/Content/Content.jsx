import React from "react";
import {
  Box,
  Center,
  Text,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
  Button,
  Avatar,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  NumberInputStepper,
  ModalCloseButton,
  FormLabel,
  NumberDecrementStepper,
  NumberInput,
  useColorMode,
  NumberInputField,
  NumberIncrementStepper,
  Select,
  FormControl,
  Spinner,
  Input,
  Textarea,
  RadioGroup,
  Stack,
  Radio,
  useToast,
  Image,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { AiFillCheckCircle, AiFillEye } from "react-icons/ai";
import { SiMediamarkt } from "react-icons/si";
import { BiEdit, BiImageAdd } from "react-icons/bi";
import { MdAdd } from "react-icons/md";
import { getUser } from "../../../services/usersService";
import { editVideo, getUserVideos } from "../../../services/videoService";
import {
  EditSavedLiveStream,
  getSavedUserLives,
} from "../../../services/liveService";
import { storeIMGProfile } from "../../../services/apiCalls";
import { Link } from "react-router-dom";
import Dropzone from "react-dropzone";
import { useMetaMask } from "../../../hooks/useMetamask";
import { addUserNotification } from "../../../services/notificationsService";
import logo from "../../../assets/logo.png";
import Web3 from "web3";
import { Abi, Bytecode } from "../../../contract/ABI";

import "./style.css";
import {
  createNFT,
  getAllUserCreatedNfts,
  getAllUserOwnedNfts,
  editNft,
} from "../../../services/nftService";
import { FiExternalLink } from "react-icons/fi";
import axios from "axios";

function Content() {
  document.title = `Channel Content`;

  const { currentAccount, currentChainId, switchNetwork, web3Provider } =
    useMetaMask();
  const user = currentAccount.toLowerCase();

  const { colorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [userData, setUserData] = React.useState(null);

  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const [lives, setLives] = React.useState([]);

  const [selectedVideo, setSelectedVideo] = React.useState([]);

  const [selectedNFT, setSelectedNFT] = React.useState([]);

  const [editNftPrice, setEditNftPrice] = React.useState(0);

  const [editSelectedNft, setEditSelectedNft] = React.useState(false);

  const [videos, setVideos] = React.useState([]);

  const [isLoading, setIsLoading] = React.useState(true);

  const [allUserNfts, setAllUserNfts] = React.useState([]);

  const [allUserCreatednfts, setAllUserCreatednfts] = React.useState([]);

  const [nftsCreated, setNftsCreated] = React.useState([]);

  const [nftsOwned, setNftsOwned] = React.useState([]);

  const [isSubmit, setIsSubmit] = React.useState(false);
  const [userId, setUserId] = React.useState(null);
  const [collectionName, setCollectionName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [quantity, setQuantity] = React.useState(15);
  const [imageUpload, setImageUpload] = React.useState(null);
  const [active, setActive] = React.useState(0);
  const [videoTitle, setVideoTitle] = React.useState("");
  const [videoId, setVideoId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState([]);
  const [thumbnailUrl, setThumbnailUrl] = React.useState("");
  const [tags, setTags] = React.useState([]);
  const empty =
    "https://bafybeih2yjkdyp6jxf4qubv6wnwmmjljenbwxis4prmdmrqugp7c53lpym.ipfs.w3s.link/images.jpg";
  const [videoDuration, setVideoDuration] = React.useState("0");
  const [category, setCategory] = React.useState("Crypto");
  const [visibility, setVisibility] = React.useState("1");
  const [nftLoading, setNftLoading] = React.useState(false);
  const [editChoice, setEditChoice] = React.useState("");
  const toast = useToast();
  const web3 = new Web3(Web3.givenProvider);

  const Deploy = async () => {
    // Data set up
    let abi = Abi;
    let bytecode = Bytecode;

    //Contract object and account info
    let deploy_contract = new web3.eth.Contract(abi);
    let account1 = user;

    // Function Parameter
    let payload = {
      data: bytecode,
      arguments: [quantity],
    };

    let parameter = {
      from: account1,
    };

    // Function Call

    const dep = await deploy_contract.deploy(payload);
    const send = await dep.send(parameter);
    if (send._address.length > 3) {
      return send._address;
    } else {
      throw new Error("Contract not deployed");
    }
  };

  const Create = async (e) => {
    e.preventDefault();
    if (
      !isNaN(price) &&
      Number(price) > 0 &&
      collectionName.length > 6 &&
      quantity > 0
    ) {
      setNftLoading(true);
      try {
        const chainId = currentChainId;
        if (chainId !== "0x16d") {
          try {
            await switchNetwork();
            let signer = web3Provider.getSigner(currentAccount);
            let sign = await signer.signMessage(
              `Approval of NFT Collection "${collectionName}" creation`
            );

            if (sign) {
              try {
                let address = await Deploy();
                const create = await createNFT({
                  name: collectionName,
                  creator: user,
                  videoId: selectedVideo._id,
                  description: selectedVideo?.description,
                  price: Number(price),
                  quantity: quantity,
                  ipfsThumbnail: selectedVideo?.ipfsThumbnail,
                  contract: address,
                  available: quantity,
                  ipfsUrl: selectedVideo?.IpfsUrl,
                });
                if (create.data) {
                  var crnfts = selectedVideo?.nftOwners;
                  crnfts.push(user.toLowerCase());

                  await editVideo(selectedVideo?.videoId, {
                    isNFT: true,
                    nftOwners: crnfts,
                  });
                  userData?.followers.map(async (follower) => {
                    await addUserNotification({
                      from: userData?.userId,
                      to: follower,
                      type: "nft creation",
                      username: userData?.username,
                    });
                  });
                  toast({
                    title: `NFT Collection created successfully`,
                    position: "top",
                    isClosable: true,
                    status: "success",
                  });
                  setNftLoading(false);
                  onClose();
                  const created = await getAllUserCreatedNfts(userData?.userId);
                  if (created?.data) {
                    setNftsCreated(created?.data);
                  }
                }
              } catch (e) {
                toast({
                  title: `There was an error creating the NFT Collection.`,
                  position: "top",
                  isClosable: true,
                  status: "error",
                });
                setNftLoading(false);
                onClose();
              }
            } else {
              toast({
                title: `Signature is required to create an NFT Collection`,
                position: "top",
                isClosable: true,
                status: "error",
              });

              setNftLoading(false);
            }
          } catch (e) {
            setNftLoading(false);
          }
        } else {
          let signer = web3Provider.getSigner();
          let sign = await signer.signMessage(
            `Approval of NFT Collection "${collectionName}" creation`
          );

          if (sign) {
            try {
              let address = await Deploy();
              const create = await createNFT({
                name: collectionName,
                creator: user,
                videoId: selectedVideo._id,
                price: Number(price),
                contract: address,
                ipfsThumbnail: selectedVideo?.ipfsThumbnail,
                description: selectedVideo?.description,
                quantity: quantity,
                available: quantity,
                ipfsUrl: selectedVideo?.IpfsUrl,
              });
              if (create.data) {
                var crnft = selectedVideo?.nftOwners;
                crnft.push(user.toLowerCase());

                await editVideo(selectedVideo?.videoId, {
                  isNFT: true,
                  nftOwners: crnft,
                });
                userData?.followers.map(async (follower) => {
                  await addUserNotification({
                    from: userData?.userId,
                    to: follower,
                    type: "nft creation",
                    username: userData?.username,
                  });
                });
                toast({
                  title: `NFT Collection created successfully`,
                  position: "top",
                  isClosable: true,
                  status: "success",
                });
                setNftLoading(false);
                onClose();
                const created = await getAllUserCreatedNfts(userData?.userId);
                if (created?.data) {
                  setNftsCreated(created?.data);
                }
              }
            } catch (e) {
              toast({
                title: `There was an error creating the NFT Collection.`,
                position: "top",
                isClosable: true,
                status: "error",
              });
              setNftLoading(false);
              onClose();
            }
          } else {
            toast({
              title: `Signature is required to create an NFT Collection`,
              position: "top",
              isClosable: true,
              status: "error",
            });

            setNftLoading(false);
          }
        }
      } catch (e) {
        setNftLoading(false);
      }
    } else {
      toast({
        title: `Please fill in all required fields`,
        position: "top",
        isClosable: true,
        status: "warning",
      });
    }
  };

  const allUserOwnedNfts = async (owned) => {
    try {
      let values = [];
      const data = await axios.get(
        `https://api.rarible.org/v0.1/items/byOwner/?owner=ETHEREUM:${user}`
      );
      const response = data.data.items;
      if (response.length > 0) {
        if (owned.length > 0) {
          let names = [];
          owned.map((item) => {
            names.push(
              item?.owners?.filter((data) => data.userId === user)[0].nftTitle
            );
          });

          response.map((dt) => {
            if (!names.includes(dt?.meta?.name)) {
              values.push(dt);
            }
          });
          setAllUserNfts(values);
        } else {
          setAllUserNfts(response);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const allUserCreatedNfts = async (created) => {
    try {
      let values = [];
      const data = await axios.get(
        `https://api.rarible.org/v0.1/items/byCreator/?creator=ETHEREUM:${user}`
      );
      const response = data.data.items;
      if (response.length > 0) {
        if (created.length > 0) {
          let names = [];
          created.map((item) => {
            names.push(item?.name);
          });

          response.map((dt) => {
            if (!names.includes(dt?.meta?.name)) {
              values.push(dt);
            }
          });
          setAllUserCreatednfts(values);
        } else {
          setAllUserCreatednfts(response);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const GetUser = async () => {
    try {
      const result = await getUser(user);
      if (result?.data) {
        setUserData(result?.data);
        setUserId(result?.data?._id);
        await getuserVideos(result?.data?._id);
        await getLives(result?.data?._id);
        const nfts = await getAllUserOwnedNfts(result?.data?.userId);

        if (nfts?.data) {
          setNftsOwned(nfts?.data);
          allUserOwnedNfts(nfts?.data);
        }

        const created = await getAllUserCreatedNfts(result?.data?.userId);
        if (created?.data) {
          setNftsCreated(created?.data);
          allUserCreatedNfts(created?.data);
        }
      }

      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const getLives = async (id) => {
    try {
      const data = await getSavedUserLives(id);
      if (data?.data.status !== "not found") {
        setLives(data?.data);
      }
    } catch (e) {}
  };

  const onCollectioName = (e) => {
    setCollectionName(e.target.value);
  };

  const onEditNftPriceChange = (e) => {
    setEditNftPrice(e.target.value);
  };

  const onPriceChange = (e) => {
    setPrice(e.target.value);
  };

  const onQuantityChange = (e) => {
    setQuantity(e);
  };

  const clearStates = () => {
    setImageUpload(null);
    setVideoTitle("");
    setDescription("");
    setThumbnail([]);
    setThumbnailUrl("");
    setTags([]);
    setVideoDuration("0");
    setCategory("");
    setVisibility("1");
  };

  const dateformater = (date) => {
    const publishDate = new Date(date);
    const longEnUSFormatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const publishedDate = longEnUSFormatter.format(publishDate);
    return publishedDate;
  };

  const getuserVideos = async (id) => {
    try {
      const data = await getUserVideos(id);
      if (data?.data) {
        setVideos(data?.data);
        setSelectedVideo(data?.data.filter((video) => video.isNFT !== true)[0]);
        setCollectionName(
          data?.data.filter((video) => video.isNFT !== true)[0].title
        );
        return data?.data;
      }
    } catch (e) {}
  };

  function getElByPropVal(myArray, val) {
    for (var i = 0, length = myArray.length; i < length; i++) {
      if (myArray[i].title == val) {
        return myArray[i];
      }
    }
  }
  const OptionChange = (e) => {
    var result = getElByPropVal(videos, e.target.value);
    setSelectedVideo(result);
    setCollectionName(result.title);
  };

  const handleVideoTitle = (e) => {
    setVideoTitle(e.target.value);
  };
  const handleDescription = (e) => {
    setDescription(e.target.value);
  };

  function handleKeyDown(e) {
    // If user did not press enter key, return
    if (e.key !== "Enter") return;
    // Get the value of the input
    const value = e.target.value;
    // If the value is empty, return
    if (!value.trim()) return;
    // Add the value to the tags array
    setTags([...tags, value]);
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

  const onEdit = (
    duration,
    title,
    thumbnail,
    tags,
    description,
    visibility,
    category
  ) => {
    setVideoDuration(duration);
    setVideoTitle(title);
    setThumbnailUrl(thumbnail);
    setThumbnail([thumbnail, "", ""]);
    setTags(tags);
    setDescription(description);
    setVisibility(String(visibility));
    setCategory(category);
  };

  const handleDropImage = (acceptedFiles) => {
    try {
      setImageUpload(acceptedFiles[0]);
    } catch {}

    return acceptedFiles[0];
  };
  const SubmitVideo = async (id) => {
    setIsSubmit(true);
    if (videoTitle.length < 3) {
      toast({
        title: `Title is required`,
        position: "top",
        isClosable: true,
      });
    } else {
      try {
        if (editChoice === "video") {
          const data = await editVideo(id, {
            title: videoTitle,
            description: description,
            thumbnail: thumbnailUrl,
            tags: tags,
            category: category,
            visibility: Number(visibility),
          });

          if (data.status == 200) {
            setIsSubmit(false);
            toast({
              title: `Video details updated successfully`,
              position: "top",
              isClosable: true,
              status: "success",
            });
            setIsEditOpen(false);

            await getuserVideos(userId);
          }
        }

        if (editChoice === "live") {
          const data = await EditSavedLiveStream(id, {
            title: videoTitle,
            description: description,
            thumbnail: thumbnailUrl,
            tags: tags,
            category: category,
            visibility: Number(visibility),
          });

          if (data.status == 200) {
            setIsSubmit(false);
            toast({
              title: `Live details updated successfully`,
              position: "top",
              isClosable: true,
              status: "success",
            });
            setIsEditOpen(false);
          }
        }

        setIsEditOpen(false);
      } catch (error) {
        toast({
          title: `An error occurred please try again later`,
          position: "top",
          isClosable: true,
          status: "error",
        });
      }
    }
  };

  const SubmitEditNft = async () => {
    if (!isNaN(editNftPrice) && editNftPrice > 0) {
      try {
        await editNft(selectedNFT?.contract, {
          price: editNftPrice,
        });

        const created = await getAllUserCreatedNfts(user);
        if (created?.data) {
          setNftsCreated(created?.data);
        }
        toast({
          title: `Price updated successfully`,
          position: "top",
          isClosable: true,
          status: "success",
        });
        setEditSelectedNft(false);
      } catch (e) {
        toast({
          title: `There was an error updating the price, please try again later`,
          position: "top",
          isClosable: true,
          status: "error",
        });
      }
    } else {
      toast({
        title: `Please make sure you entered a valid price`,
        position: "top",
        isClosable: true,
        status: "warning",
      });
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

  React.useEffect(() => {
    GetUser();
  }, []);

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
          <Box d="flex" width="100%">
            <Box width={["60%", "60%", "80%", "80%"]}>
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
                Channel content
              </Text>
            </Box>

            {colorMode === "dark" && (
              <Box width={["40%", "40%", "20%", "20%"]} pt={5}>
                <Tooltip label="Create NFT Collection">
                  <Button
                    onClick={onOpen}
                    _hover={{
                      bg: "rgb(251, 91, 120,0.8)",
                    }}
                    _active={{ bg: "rgb(251, 91, 120,0.7)" }}
                    bg="#FB5B78"
                    width="100%"
                    height="3rem"
                    leftIcon={<MdAdd fill="white" size="1.5rem" />}
                    fontSize={["1rem", "1.1rem", "1.1rem", "1.1rem"]}
                    fontWeight="bold"
                  >
                    {" "}
                    NFT Collection
                  </Button>
                </Tooltip>
              </Box>
            )}

            {colorMode === "light" && (
              <Box width={["40%", "40%", "20%", "20%"]} pt={5}>
                <Tooltip label="Create NFT Collection">
                  <Button
                    onClick={onOpen}
                    _hover={{
                      bg: "#5B61FB",
                    }}
                    _active={{ bg: "#5B61FB" }}
                    bg="#5B61FB"
                    width="100%"
                    height="3rem"
                    leftIcon={<MdAdd fill="white" size="1.5rem" />}
                    color="white"
                    fontSize={["1rem", "1.1rem", "1.1rem", "1.1rem"]}
                    fontWeight="bold"
                  >
                    {" "}
                    NFT Collection
                  </Button>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Box>
            {isLoading ? (
              <Center w="100%" h="50vh">
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
              <Tabs
                isLazy
                size="md"
                variant="enclosed"
                bg={colorMode === "light" ? "#F0EEEE" : ""}
                borderRadius={colorMode === "light" ? "5px" : ""}
                boxShadow={
                  colorMode === "light"
                    ? "4px 4px 8px 0px rgba(34, 60, 80, 0.2)"
                    : ""
                }
              >
                {colorMode === "dark" && (
                  <TabList>
                    <Tab fontWeight="600">Videos</Tab>
                    <Tab fontWeight="600">Lives</Tab>
                    <Tab fontWeight="600">NFTs</Tab>
                  </TabList>
                )}

                {colorMode === "light" && (
                  <TabList>
                    <Tab
                      fontWeight="600"
                      _focus={{ border: "none" }}
                      _selected={{
                        color: "white",
                        bg: "#111315",
                        border: "none",
                      }}
                    >
                      Videos
                    </Tab>
                    <Tab
                      fontWeight="600"
                      _focus={{ border: "none" }}
                      _selected={{
                        color: "white",
                        bg: "#111315",
                        border: "none",
                      }}
                    >
                      Live
                    </Tab>
                    <Tab
                      fontWeight="600"
                      _focus={{ border: "none" }}
                      _selected={{
                        color: "white",
                        bg: "#111315",
                        border: "none",
                      }}
                    >
                      NFTs
                    </Tab>
                  </TabList>
                )}
                <TabPanels>
                  <TabPanel width="100%">
                    <Box width="100%">
                      <TableContainer>
                        <Table variant="simple">
                          <TableCaption fontSize="1.3rem">
                            {videos?.length < 1 ? (
                              <Text fontSize="1.3rem" pt={5}>
                                You didn't share any videos yet
                              </Text>
                            ) : (
                              ""
                            )}
                          </TableCaption>
                          <Thead>
                            <Tr>
                              <Th>Video</Th>
                              <Th>Visibility</Th>
                              <Th>Date</Th>
                              <Th>Views</Th>
                              <Th>Comments</Th>
                              <Th>Likes</Th>
                              <Th>Edit</Th>
                            </Tr>
                          </Thead>

                          {videos.length > 0 && (
                            <Tbody>
                              {videos?.map(
                                ({
                                  videoId,
                                  title,
                                  description,
                                  visibility,
                                  views,
                                  category,
                                  createdAt,
                                  likes,
                                  comments,
                                  tags,
                                  thumbnail,
                                  duration,
                                }) => (
                                  <Tr>
                                    <Td>
                                      <Box
                                        d="flex"
                                        width="18rem"
                                        height="4.5rem"
                                      >
                                        <Link to={`/video/${videoId}`}>
                                          <Box
                                            width="8rem"
                                            height="4.5rem"
                                            cursor="pointer"
                                            justifyContent="right"
                                            d="flex"
                                            borderRadius="5px"
                                            bgImage={`url(${thumbnail})`}
                                            bgSize="cover"
                                            bgPosition="center"
                                          >
                                            <Text
                                              borderRadius="2px"
                                              as="h3"
                                              w="auto"
                                              bg="rgb(0,0,0,0.3)"
                                              flex="0 1 auto"
                                              color="white"
                                              alignSelf="flex-end"
                                              mr={1}
                                            >
                                              {duration}
                                            </Text>
                                          </Box>
                                        </Link>
                                        <Box width="60%" pl={4}>
                                          <Center width="100%" height="100%">
                                            <Box>
                                              <Tooltip label={title}>
                                                <Link to={`/video/${videoId}`}>
                                                  <Text cursor="pointer">
                                                    {title.length > 20
                                                      ? title
                                                          .slice(0, 20)
                                                          .replace(
                                                            /(^\w|\s\w)(\S*)/g,
                                                            (_, m1, m2) =>
                                                              m1.toUpperCase() +
                                                              m2.toLowerCase()
                                                          ) + "..."
                                                      : title.replace(
                                                          /(^\w|\s\w)(\S*)/g,
                                                          (_, m1, m2) =>
                                                            m1.toUpperCase() +
                                                            m2.toLowerCase()
                                                        )}
                                                  </Text>
                                                </Link>
                                              </Tooltip>

                                              <Text
                                                pt={1}
                                                as="p"
                                                fontSize="0.8rem"
                                                color={
                                                  colorMode === "light"
                                                    ? "#595B5D"
                                                    : "rgb(255,255,255,0.5)"
                                                }
                                              >
                                                {description.length > 20
                                                  ? description
                                                      .slice(0, 25)
                                                      .replace(
                                                        /(^\w|\s\w)(\S*)/g,
                                                        (_, m1, m2) =>
                                                          m1.toUpperCase() +
                                                          m2.toLowerCase()
                                                      ) + "..."
                                                  : description.replace(
                                                      /(^\w|\s\w)(\S*)/g,
                                                      (_, m1, m2) =>
                                                        m1.toUpperCase() +
                                                        m2.toLowerCase()
                                                    )}
                                              </Text>
                                            </Box>
                                          </Center>
                                        </Box>
                                      </Box>
                                    </Td>
                                    <Td>
                                      <Box d="flex">
                                        <Box>
                                          {visibility === 1 && (
                                            <AiFillEye
                                              fill="green"
                                              size="1.5rem"
                                            />
                                          )}
                                          {visibility === 0 && (
                                            <SiMediamarkt
                                              fill="#4299E1"
                                              size="1.2rem "
                                            />
                                          )}
                                          {visibility === 2 && (
                                            <AiFillEye
                                              fill={
                                                colorMode === "dark"
                                                  ? "rgb(255,255,255,0.45)"
                                                  : "rgb(0,0,0,0.8)"
                                              }
                                              size="1.5rem"
                                            />
                                          )}
                                        </Box>
                                        {visibility === 1 && (
                                          <Text pl={2}>Public</Text>
                                        )}
                                        {visibility === 0 && (
                                          <Text pl={2}>NFT holders</Text>
                                        )}
                                        {visibility === 2 && (
                                          <Text pl={2}>Private</Text>
                                        )}
                                      </Box>
                                    </Td>
                                    <Td>
                                      <Box>
                                        <Text as="p">
                                          {dateformater(createdAt)}
                                        </Text>
                                        <Text
                                          as="p"
                                          color={
                                            colorMode === "light"
                                              ? "#595B5D"
                                              : "rgb(255,255,255,0.5)"
                                          }
                                          fontSize="0.85rem"
                                          pt={1}
                                        >
                                          Published
                                        </Text>
                                      </Box>
                                    </Td>

                                    <Td textAlign="center">{views}</Td>
                                    <Td textAlign="center">{comments}</Td>

                                    <Td textAlign="center">{likes}</Td>
                                    <Td>
                                      <BiEdit
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setEditChoice("video");
                                          setIsEditOpen(true);
                                          onEdit(
                                            duration,
                                            title,
                                            thumbnail,
                                            tags,
                                            description,
                                            visibility,
                                            category
                                          );
                                          setVideoId(videoId);
                                        }}
                                        cursor="pointer"
                                        size="1.6rem"
                                        color={
                                          colorMode === "light"
                                            ? "#5A5A5B"
                                            : "rgb(255,255,255,0.45)"
                                        }
                                      />
                                    </Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          )}
                        </Table>
                      </TableContainer>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box width="100%">
                      <TableContainer>
                        <Table variant="simple">
                          <TableCaption fontSize="1.3rem">
                            {lives.length < 1 ? (
                              <Text fontSize="1.3rem" pt={5}>
                                You didn't create any livestream yet
                              </Text>
                            ) : (
                              ""
                            )}
                          </TableCaption>
                          <Thead>
                            <Tr>
                              <Th>Video</Th>
                              <Th>Visibility</Th>
                              <Th>Date</Th>
                              <Th>Views</Th>
                              <Th>Likes</Th>
                              <Th>Edit</Th>
                            </Tr>
                          </Thead>
                          {lives.length > 0 && (
                            <Tbody>
                              {lives?.map(
                                ({
                                  thumbnail,
                                  title,
                                  description,
                                  views,
                                  createdAt,
                                  visibility,
                                  likes,
                                  tags,
                                  streamId,
                                }) => (
                                  <Tr>
                                    <Td>
                                      <Box
                                        d="flex"
                                        width="18rem"
                                        height="4.5rem"
                                      >
                                        <Link to={`/session/watch/${streamId}`}>
                                          <Box
                                            width="8rem"
                                            height="4.5rem"
                                            cursor="pointer"
                                            justifyContent="right"
                                            d="flex"
                                            borderRadius="5px"
                                            bgImage={`url(${thumbnail})`}
                                            bgSize="cover"
                                            bgPosition="center"
                                          ></Box>
                                        </Link>
                                        <Box width="60%" pl={4}>
                                          <Center width="100%" height="100%">
                                            <Box>
                                              <Tooltip label={title}>
                                                <Link
                                                  to={`/session/watch/${streamId}`}
                                                >
                                                  <Text cursor="pointer">
                                                    {title.length > 20
                                                      ? title
                                                          .slice(0, 20)
                                                          .replace(
                                                            /(^\w|\s\w)(\S*)/g,
                                                            (_, m1, m2) =>
                                                              m1.toUpperCase() +
                                                              m2.toLowerCase()
                                                          ) + "..."
                                                      : title.replace(
                                                          /(^\w|\s\w)(\S*)/g,
                                                          (_, m1, m2) =>
                                                            m1.toUpperCase() +
                                                            m2.toLowerCase()
                                                        )}
                                                  </Text>
                                                </Link>
                                              </Tooltip>

                                              <Text
                                                pt={1}
                                                as="p"
                                                fontSize="0.8rem"
                                                color={
                                                  colorMode === "light"
                                                    ? "#595B5D"
                                                    : "rgb(255,255,255,0.5)"
                                                }
                                              >
                                                {description.length > 20
                                                  ? description
                                                      .slice(0, 25)
                                                      .replace(
                                                        /(^\w|\s\w)(\S*)/g,
                                                        (_, m1, m2) =>
                                                          m1.toUpperCase() +
                                                          m2.toLowerCase()
                                                      ) + "..."
                                                  : description.replace(
                                                      /(^\w|\s\w)(\S*)/g,
                                                      (_, m1, m2) =>
                                                        m1.toUpperCase() +
                                                        m2.toLowerCase()
                                                    )}
                                              </Text>
                                            </Box>
                                          </Center>
                                        </Box>
                                      </Box>
                                    </Td>
                                    <Td>
                                      <Box d="flex">
                                        <Box>
                                          {visibility === 1 && (
                                            <AiFillEye
                                              fill="green"
                                              size="1.5rem"
                                            />
                                          )}
                                          {visibility === 0 && (
                                            <SiMediamarkt
                                              fill="#4299E1"
                                              size="1.2rem "
                                            />
                                          )}
                                          {visibility === 2 && (
                                            <AiFillEye
                                              fill={
                                                colorMode === "dark"
                                                  ? "rgb(255,255,255,0.45)"
                                                  : "rgb(0,0,0,0.8)"
                                              }
                                              size="1.5rem"
                                            />
                                          )}
                                        </Box>
                                        {visibility === 1 && (
                                          <Text pl={2}>Public</Text>
                                        )}
                                        {visibility === 0 && (
                                          <Text pl={2}>NFT holders</Text>
                                        )}
                                        {visibility === 2 && (
                                          <Text pl={2}>Private</Text>
                                        )}
                                      </Box>
                                    </Td>
                                    <Td>
                                      <Box>
                                        <Text as="p">
                                          {dateformater(createdAt)}
                                        </Text>
                                        <Text
                                          as="p"
                                          color={
                                            colorMode === "light"
                                              ? "#595B5D"
                                              : "rgb(255,255,255,0.5)"
                                          }
                                          fontSize="0.85rem"
                                          pt={1}
                                        >
                                          Streamed
                                        </Text>
                                      </Box>
                                    </Td>

                                    <Td>{views}</Td>

                                    <Td>{likes}</Td>

                                    <Td>
                                      <BiEdit
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setEditChoice("live");
                                          setIsEditOpen(true);
                                          onEdit(
                                            "",
                                            title,
                                            thumbnail,
                                            tags,
                                            description,
                                            visibility,
                                            category
                                          );
                                          setVideoId(streamId);
                                        }}
                                        cursor="pointer"
                                        size="1.6rem"
                                        color={
                                          colorMode === "light"
                                            ? "#5A5A5B"
                                            : "rgb(255,255,255,0.45)"
                                        }
                                      />
                                    </Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          )}
                        </Table>
                      </TableContainer>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Tabs isLazy size="md" variant="enclosed">
                      {colorMode === "dark" && (
                        <TabList>
                          <Tab
                            _selected={{
                              color: "#FB5B78",
                              bg: "rgb(36, 38, 39,0.5)",
                            }}
                          >
                            Created
                          </Tab>
                          <Tab
                            _selected={{
                              color: "#FB5B78",
                              bg: "rgb(36, 38, 39,0.5)",
                            }}
                          >
                            Holding
                          </Tab>
                        </TabList>
                      )}

                      {colorMode === "light" && (
                        <TabList>
                          <Tab
                            _focus={{ border: "none" }}
                            _selected={{ color: "white", bg: "#5A5A5B" }}
                          >
                            Created
                          </Tab>
                          <Tab
                            _focus={{ border: "none" }}
                            _selected={{ color: "white", bg: "#5A5A5B" }}
                          >
                            Holding
                          </Tab>
                        </TabList>
                      )}
                      <TabPanels>
                        <TabPanel>
                          {nftsCreated?.length < 1 &&
                          allUserCreatednfts?.length < 1 ? (
                            <Text fontSize="1.3rem" pt={5}>
                              You didn't create an NFT collection yet.
                            </Text>
                          ) : (
                            <Box
                              d="grid"
                              gridTemplateColumns={[
                                "4fr",
                                "2fr 2fr",
                                "1fr 1fr 1fr",
                                "1fr 1fr 1fr",
                                "4fr 4fr 4fr 4fr",
                              ]}
                              columnGap={7}
                              rowGap={16}
                            >
                              {nftsCreated?.map((nft) => (
                                <Box>
                                  <Box position="relative">
                                    <Box
                                      position="absolute"
                                      top="0"
                                      zIndex={10}
                                      right="0"
                                      pr={1}
                                      pt={1}
                                    >
                                      <BiEdit
                                        onClick={() => {
                                          setSelectedNFT(nft);
                                          setEditSelectedNft(true);
                                          setEditNftPrice(nft?.price);
                                        }}
                                        size="1.5rem"
                                        cursor="pointer"
                                        color={
                                          colorMode === "light"
                                            ? "#5A5A5B"
                                            : "white"
                                        }
                                      />
                                    </Box>
                                    <Link
                                      to={`/video/${nft?.videoId?.videoId}`}
                                    >
                                      <Box
                                        position="absolute"
                                        zIndex={20}
                                        pl={1}
                                        pt={140}
                                        textAlign="center"
                                        d="flex"
                                      >
                                        <Center>
                                          <Text
                                            fontSize="1rem"
                                            fontWeight="bold"
                                            pr={1}
                                            color="white"
                                          >
                                            {nft?.price}
                                          </Text>
                                          <Image
                                            src={logo}
                                            w="1.5rem"
                                            h="1.5rem"
                                            alt="logo"
                                          />
                                        </Center>
                                      </Box>
                                      <Box
                                        _hover={{ opacity: "0.6" }}
                                        height={[
                                          "12rem",
                                          "10.3rem",
                                          "10.3rem",
                                          "10.3rem",
                                        ]}
                                        opacity="0.92"
                                        cursor="pointer"
                                        justifyContent="right"
                                        d="flex"
                                        borderRadius="5px"
                                        bgImage={`url(${nft?.videoId?.thumbnail})`}
                                        bgSize="cover"
                                        bgPosition="center"
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
                                          {nft?.videoId?.duration}
                                        </Text>
                                      </Box>
                                    </Link>
                                    <Text pt={2} noOfLines={2}>
                                      <Link
                                        to={`/video/${nft?.videoId?.videoId}`}
                                      >
                                        {nft?.name}
                                      </Link>
                                    </Text>
                                    <Box w="100%" d="flex" pt={0.5}>
                                      <Box w="45%">
                                        <Text
                                          w="100%"
                                          color={
                                            colorMode === "light"
                                              ? "#5A5A5B"
                                              : "rgb(255,255,255,0.5)"
                                          }
                                          fontSize="0.8rem"
                                        >
                                          {nft?.available} Available
                                        </Text>
                                      </Box>
                                      <Box w="45%">
                                        <Text
                                          w="100%"
                                          color={
                                            colorMode === "light"
                                              ? "#5A5A5B"
                                              : "rgb(255,255,255,0.5)"
                                          }
                                          fontSize="0.8rem"
                                        >
                                          {nft?.minted} Minted
                                        </Text>
                                      </Box>
                                      <Box w="10%">
                                        <Tooltip label="Contract">
                                          <ChakraLink
                                            isExternal
                                            href={`https://polygonscan.com/address/${nft?.contract}`}
                                          >
                                            <FiExternalLink
                                              size="1.15rem"
                                              color={
                                                colorMode === "light"
                                                  ? "#5A5A5B"
                                                  : "rgb(255,255,255,0.5)"
                                              }
                                            />
                                          </ChakraLink>
                                        </Tooltip>
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}

                              {allUserCreatednfts?.map((item) => (
                                <Box>
                                  <Box position="relative">
                                    <ChakraLink
                                      isExternal
                                      href={`https://polygonscan.com/address/${
                                        item?.contract.split(":")[1]
                                      }`}
                                    >
                                      <Box
                                        _hover={{ opacity: "0.6" }}
                                        height={[
                                          "12rem",
                                          "10.3rem",
                                          "10.3rem",
                                          "10.3rem",
                                        ]}
                                        opacity="0.92"
                                        cursor="pointer"
                                        justifyContent="right"
                                        d="flex"
                                        borderRadius="5px"
                                        bgImage={`url(${
                                          item?.meta?.content[0]?.url ||
                                          "https://bafybeig23iwo2femqtqngbwwifnursl3ktgvjydgbrraa7rih53cyrohsu.ipfs.w3s.link/image.PNG"
                                        })`}
                                        bgSize="cover"
                                        bgPosition="center"
                                      ></Box>
                                    </ChakraLink>

                                    <Text pt={2} noOfLines={2}>
                                      <ChakraLink
                                        style={{ textDecoration: "none" }}
                                        isExternal
                                        href={`https://polygonscan.com/address/${
                                          item?.contract.split(":")[1]
                                        }`}
                                      >
                                        {item?.meta?.name}
                                      </ChakraLink>
                                    </Text>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </TabPanel>
                        <TabPanel>
                          {nftsOwned?.length < 1 && allUserNfts?.length < 1 ? (
                            <Text fontSize="1.3rem" pt={5}>
                              You didn't purchased any NFTs
                            </Text>
                          ) : (
                            <Box
                              d="grid"
                              gridTemplateColumns={[
                                "4fr",
                                "2fr 2fr",
                                "1fr 1fr 1fr",
                                "1fr 1fr 1fr",
                                "4fr 4fr 4fr 4fr",
                              ]}
                              columnGap={7}
                              rowGap={16}
                            >
                              {nftsOwned?.map((video) => (
                                <Box>
                                  <Box>
                                    <Link
                                      to={`/video/${video?.videoId?.videoId}`}
                                    >
                                      <Box
                                        _hover={{ transform: "scale(1.01)" }}
                                        height={[
                                          "12rem",
                                          "10.3rem",
                                          "10.3rem",
                                          "10.3rem",
                                        ]}
                                        cursor="pointer"
                                        justifyContent="right"
                                        d="flex"
                                        borderRadius="5px"
                                        bgImage={`url(${video?.videoId?.thumbnail})`}
                                        bgSize="cover"
                                        bgPosition="center"
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
                                          {video?.videoId?.duration}
                                        </Text>
                                      </Box>
                                    </Link>
                                    <Text pt={2} noOfLines={2}>
                                      <Link
                                        to={`/video/${video?.videoId?.videoId}`}
                                      >
                                        {
                                          video?.owners?.filter(
                                            (data) => data.userId === user
                                          )[0].nftTitle
                                        }
                                      </Link>
                                    </Text>
                                    <Box d="flex" pt={2}>
                                      <Link
                                        to={`/profile/${video?.videoId?.creator?.userId}`}
                                      >
                                        <Avatar
                                          src={
                                            video?.videoId?.creator
                                              ?.ProfileAvatar
                                          }
                                          h="2rem"
                                          w="2rem"
                                        />
                                      </Link>
                                      <Center>
                                        <Text
                                          color={
                                            colorMode === "light"
                                              ? "#101011"
                                              : "#FFD600"
                                          }
                                          cursor="pointer"
                                          fontWeight="bold"
                                          pl={3}
                                        >
                                          <Link
                                            to={`/profile/${video?.videoId?.creator?.userId}`}
                                          >
                                            {video?.videoId?.creator?.username}
                                          </Link>
                                        </Text>
                                        {video?.videoId?.creator
                                          ?.isVerified && (
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
                                        <Box pl={5}>
                                          <Tooltip label="View on explorer">
                                            <ChakraLink
                                              isExternal
                                              href={`https://polygonscan.com/token/${
                                                video?.contract
                                              }?a=${
                                                video?.owners?.filter(
                                                  (data) => data.userId === user
                                                )[0].tokenId
                                              }`}
                                            >
                                              <FiExternalLink
                                                size="1.1rem"
                                                color={
                                                  colorMode === "light"
                                                    ? "#5A5A5B"
                                                    : "rgb(255,255,255,0.5)"
                                                }
                                              />
                                            </ChakraLink>
                                          </Tooltip>
                                        </Box>
                                      </Center>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}

                              {allUserNfts?.map((item) => (
                                <Box>
                                  <Box>
                                    <ChakraLink
                                      isExternal
                                      href={`https://polygonscan.com/token/${
                                        item?.contract.split(":")[1]
                                      }?a=${item?.tokenId}`}
                                    >
                                      <Box
                                        _hover={{ transform: "scale(1.01)" }}
                                        height={[
                                          "12rem",
                                          "10.3rem",
                                          "10.3rem",
                                          "10.3rem",
                                        ]}
                                        justifyContent="right"
                                        d="flex"
                                        borderRadius="5px"
                                        bgImage={`url(${
                                          item?.meta?.content[0]?.url ||
                                          "https://bafybeig23iwo2femqtqngbwwifnursl3ktgvjydgbrraa7rih53cyrohsu.ipfs.w3s.link/image.PNG"
                                        })`}
                                        bgSize="cover"
                                        bgPosition="center"
                                      ></Box>
                                    </ChakraLink>

                                    <Text pt={2} noOfLines={2}>
                                      <ChakraLink
                                        style={{ textDecoration: "none" }}
                                        isExternal
                                        href={`https://polygonscan.com/token/${
                                          item?.contract.split(":")[1]
                                        }?a=${item?.tokenId}`}
                                      >
                                        {item?.meta?.name}
                                      </ChakraLink>
                                    </Text>
                                    <Box d="flex" pt={2}>
                                      <Avatar
                                        src="https://bafybeifgsujzqhmwznuytnynypwg2iaotji3d3whty5ymjbi6gghwcmgk4.ipfs.dweb.link/profile-avatar.png"
                                        h="2rem"
                                        w="2rem"
                                      />

                                      <Center>
                                        <Text
                                          color={
                                            colorMode === "light"
                                              ? "#101011"
                                              : "#FFD600"
                                          }
                                          cursor="pointer"
                                          fontWeight="bold"
                                          pl={3}
                                        >
                                          {item?.creators[0]?.account
                                            .split(":")[1]
                                            .slice(0, 12)}
                                        </Text>
                                        <Box pl={5}>
                                          <Tooltip label="View on explorer">
                                            <ChakraLink
                                              isExternal
                                              href={`https://polygonscan.com/token/${
                                                item?.contract.split(":")[1]
                                              }?a=${item?.tokenId}`}
                                            >
                                              <FiExternalLink
                                                size="1.1rem"
                                                color={
                                                  colorMode === "light"
                                                    ? "#5A5A5B"
                                                    : "rgb(255,255,255,0.5)"
                                                }
                                              />
                                            </ChakraLink>
                                          </Tooltip>
                                        </Box>
                                      </Center>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </Box>
        </Box>
      </Center>

      <Modal
        size="2xl"
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
      >
        <ModalOverlay />

        <ModalContent bg={colorMode === "light" ? "#DAD9D9" : "#242627"}>
          <ModalCloseButton
            mr={8}
            onClick={() => {
              if (userId !== null) {
                getuserVideos(userId);
              }
            }}
          />

          <ModalBody
            bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
            borderRadius="5px"
          >
            <Center width="100%" mt={5}>
              <Box
                pl={4}
                width="100%"
                pb={5}
                bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
                d="flex"
              >
                <Box width="93%">
                  <Text
                    as="h1"
                    color={
                      colorMode === "light"
                        ? "#111315"
                        : "rgb(255,255,255,0.95)"
                    }
                    fontWeight="bold"
                    fontSize="1.6rem"
                    pb={4}
                  >
                    Create NFT
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
                      Select Title
                    </FormLabel>
                    <Select
                      size="lg"
                      defaultValue=""
                      color="white"
                      bg="#242627"
                      onChange={OptionChange}
                    >
                      {videos
                        ?.filter((video) => video.isNFT !== true)
                        .map(({ title }) => (
                          <option
                            style={{ backgroundColor: "rgb(18, 19, 20,0.3)" }}
                            value={title}
                          >
                            {title}
                          </option>
                        ))}
                    </Select>
                  </FormControl>

                  <Box
                    width="100%"
                    d={["grid", "flex", "flex", "flex", "flex", "flex"]}
                    gridTemplateColumns={["4fr", "", "", "", "", ""]}
                    pt={5}
                  >
                    <Link to={`/video/${selectedVideo?.videoId}`}>
                      <Box
                        d="flex"
                        justifyContent="right"
                        borderRadius="5px"
                        w="15rem"
                        h="10rem"
                        bgImage={`url(${selectedVideo?.thumbnail})`}
                        bgSize="cover"
                        bgPosition="center"
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
                          {selectedVideo?.duration}
                        </Text>
                      </Box>
                    </Link>
                    <Box
                      width={["100%", "60%", "60%", "60%", "60%", "60%"]}
                      pl={[0, 10, 10, 10, 10, 10]}
                    >
                      <Center height="100%" w="100%">
                        <Box w="100%" h="100%">
                          <FormControl>
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
                              Name
                            </FormLabel>
                            <Input
                              _hover={
                                colorMode === "light"
                                  ? { borderColor: "#5A5A5B" }
                                  : {}
                              }
                              borderColor={
                                colorMode === "light"
                                  ? "#5A5A5B"
                                  : "rgba(255, 255, 255, 0.24)"
                              }
                              focusBorderColor={
                                colorMode === "light" ? "#5A5A5B" : ""
                              }
                              borderRadius="5px"
                              color={colorMode === "light" ? "black" : "white"}
                              value={collectionName}
                              onChange={onCollectioName}
                              type="text"
                              placeholder="Collection name"
                            />
                          </FormControl>
                          <Box w="100%" d="flex" pt={2}>
                            <FormControl w="50%" pr={2}>
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
                                Price
                              </FormLabel>
                              <Input
                                _hover={
                                  colorMode === "light"
                                    ? { borderColor: "#5A5A5B" }
                                    : {}
                                }
                                borderColor={
                                  colorMode === "light"
                                    ? "#5A5A5B"
                                    : "rgba(255, 255, 255, 0.24)"
                                }
                                focusBorderColor={
                                  colorMode === "light" ? "#5A5A5B" : ""
                                }
                                borderRadius="5px"
                                _placeholder={
                                  colorMode === "light"
                                    ? { color: "black" }
                                    : {}
                                }
                                color={
                                  colorMode === "light" ? "black" : "white"
                                }
                                value={price}
                                onChange={onPriceChange}
                                type="number"
                                placeholder="in $CRTC"
                              />
                            </FormControl>
                            <FormControl w="50%">
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
                                Quantity
                              </FormLabel>
                              <NumberInput
                                _hover={
                                  colorMode === "light"
                                    ? { borderColor: "#5A5A5B" }
                                    : {}
                                }
                                borderColor={
                                  colorMode === "light"
                                    ? "#5A5A5B"
                                    : "rgba(255, 255, 255, 0.24)"
                                }
                                focusBorderColor={
                                  colorMode === "light" ? "#5A5A5B" : ""
                                }
                                borderRadius="5px"
                                onChange={onQuantityChange}
                                value={quantity}
                                min={10}
                              >
                                <NumberInputField
                                  _hover={
                                    colorMode === "light"
                                      ? { borderColor: "#5A5A5B" }
                                      : {}
                                  }
                                />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            </FormControl>
                          </Box>
                        </Box>
                      </Center>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Center>
            <Box
              width="100%"
              borderTop="1px solid rgb(96, 96, 96,0.6)"
              height="4rem"
              position="sticky"
              textAlign="end"
            >
              {nftLoading ? (
                <Button
                  color="white"
                  isLoading
                  fontSize="1.15rem"
                  bg={colorMode === "light" ? "#3EA6FF" : "#3ea6ff"}
                  mr={5}
                  pb={1}
                  height="3rem"
                  width="7rem"
                  mt={3}
                  _hover={{ bg: "rgb(62, 166, 255, 0.85)" }}
                  _active={{ bg: "rgb(62, 166, 255, 0.85)" }}
                >
                  Create
                </Button>
              ) : (
                <Button
                  color="white"
                  onClick={Create}
                  fontSize="1.15rem"
                  bg={colorMode === "light" ? "#3EA6FF" : "#3ea6ff"}
                  mr={5}
                  pb={1}
                  height="3rem"
                  width="7rem"
                  mt={3}
                  _hover={{ bg: "rgb(62, 166, 255, 0.85)" }}
                  _active={{ bg: "rgb(62, 166, 255, 0.85)" }}
                >
                  Create
                </Button>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="2xl"
        closeOnOverlayClick={false}
        isOpen={editSelectedNft}
        onClose={() => setEditSelectedNft(false)}
        bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
      >
        <ModalOverlay />

        <ModalContent bg={colorMode === "light" ? "#DAD9D9" : "#242627"}>
          <ModalCloseButton
            mr={8}
            onClick={() => {
              setEditSelectedNft(false);
            }}
          />

          <ModalBody
            bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
            borderRadius="5px"
          >
            <Center width="100%" mt={5}>
              <Box
                pl={4}
                width="100%"
                pb={5}
                bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
                d="flex"
              >
                <Box width="93%">
                  <Text
                    as="h1"
                    color={
                      colorMode === "light"
                        ? "#111315"
                        : "rgb(255,255,255,0.95)"
                    }
                    fontWeight="bold"
                    fontSize="1.6rem"
                    pb={4}
                  >
                    Edit NFT Price
                  </Text>

                  <Box width="100%" d="flex" pt={5}>
                    <Link to={`/video/${selectedNFT?.videoId?.videoId}`}>
                      <Box
                        d="flex"
                        justifyContent="right"
                        borderRadius="5px"
                        w="15rem"
                        h="10rem"
                        bgImage={`url(${selectedNFT?.videoId?.thumbnail})`}
                        bgSize="cover"
                        bgPosition="center"
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
                          {selectedNFT?.videoId?.duration}
                        </Text>
                      </Box>
                    </Link>
                    <Box width="60%" pl={10}>
                      <Center height="100%" w="100%">
                        <Box w="100%" h="100%">
                          <FormControl>
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
                              Name
                            </FormLabel>
                            <Input
                              color={colorMode === "light" ? "black" : "white"}
                              _hover={
                                colorMode === "light"
                                  ? { borderColor: "#5A5A5B" }
                                  : {}
                              }
                              borderColor={
                                colorMode === "light"
                                  ? "#5A5A5B"
                                  : "rgba(255, 255, 255, 0.24)"
                              }
                              focusBorderColor={
                                colorMode === "light" ? "#5A5A5B" : ""
                              }
                              borderRadius="5px"
                              disabled
                              value={selectedNFT?.name}
                              type="text"
                            />
                          </FormControl>
                          <Box w="100%" d="flex" pt={2}>
                            <FormControl w="50%" pr={2}>
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
                                Price
                              </FormLabel>
                              <Input
                                color={
                                  colorMode === "light" ? "black" : "white"
                                }
                                _hover={
                                  colorMode === "light"
                                    ? { borderColor: "#5A5A5B" }
                                    : {}
                                }
                                borderColor={
                                  colorMode === "light"
                                    ? "#5A5A5B"
                                    : "rgba(255, 255, 255, 0.24)"
                                }
                                focusBorderColor={
                                  colorMode === "light" ? "#5A5A5B" : ""
                                }
                                borderRadius="5px"
                                value={editNftPrice}
                                onChange={onEditNftPriceChange}
                                type="number"
                                placeholder="in $CRTC"
                              />
                            </FormControl>
                            <FormControl w="50%">
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
                                NFTs left
                              </FormLabel>
                              <NumberInput
                                _hover={
                                  colorMode === "light"
                                    ? { borderColor: "#5A5A5B" }
                                    : {}
                                }
                                borderColor={
                                  colorMode === "light"
                                    ? "#5A5A5B"
                                    : "rgba(255, 255, 255, 0.24)"
                                }
                                focusBorderColor={
                                  colorMode === "light" ? "#5A5A5B" : ""
                                }
                                borderRadius="5px"
                                disabled
                                value={selectedNFT?.available}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>
                          </Box>
                        </Box>
                      </Center>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Center>
            <Box
              width="100%"
              borderTop="1px solid rgb(96, 96, 96,0.6)"
              height="4rem"
              position="sticky"
              textAlign="end"
            >
              <Button
                onClick={SubmitEditNft}
                color="white"
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
                Edit
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="4xl"
        closeOnOverlayClick={false}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
      >
        <ModalOverlay />

        <ModalContent bg="#F7F7FC">
          <ModalCloseButton
            onClick={() => {
              clearStates();
              setIsEditOpen(false);
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
                pl={4}
                width="100%"
                pt={5}
                pb={5}
                bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
                d="flex"
                overflowY="auto"
                height="100%"
              >
                <Box width="60%">
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
                      borderRadius="5px"
                      required
                      value={videoTitle}
                      onChange={handleVideoTitle}
                      id="title"
                      placeholder={`Choose a title for your ${
                        editChoice === "live" ? "livestream" : "video"
                      }`}
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
                      placeholder={`Tell viewrs about your ${
                        editChoice === "live" ? "livestream" : "video"
                      }`}
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
                      borderRadius="5px"
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
                    Select or upload a picture that shows what's in your{" "}
                    {editChoice === "live" ? "livestream" : "video"}.
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
                    Add your {editChoice === "live" ? "livestream" : "video"} to
                    a category so viewers can find it more easily
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
                    Tags can be useful if content in your{" "}
                    {editChoice === "live" ? "livestream" : "video"} is commonly
                    misspelled.
                  </Text>
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
                        ? "1px solid #1C1F20"
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
                    Choose who can see your{" "}
                    {editChoice === "live" ? "livestream" : "video"}
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
                            Everyone can watch your{" "}
                            {editChoice === "live" ? "livestream" : "video"}
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
                            Only your NFT holders can watch your{" "}
                            {editChoice === "live" ? "livestream" : "video"}
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
                            Only you can watch your{" "}
                            {editChoice === "live" ? "livestream" : "video"}
                          </Text>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </Box>
                </Box>

                <Box width="40%" pl={5} pr={5} pt={1}>
                  <Box width="100%" height="50%">
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
                      <Text
                        borderRadius="2px"
                        as="h3"
                        w="auto"
                        bg="rgb(0,0,0,0.3)"
                        flex="0 1 auto"
                        alignSelf="flex-end"
                        mr={2}
                        color="white"
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
                        <Text
                          noOfLines={2}
                          as="h2"
                          fontSize="0.9rem"
                          fontWeight="600"
                          pb={6}
                        >
                          {videoTitle}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
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
                  Save
                </Button>
              ) : (
                <Button
                  color="white"
                  onClick={(e) => {
                    e.preventDefault();
                    SubmitVideo(videoId);
                  }}
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
                  Save
                </Button>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Content;
