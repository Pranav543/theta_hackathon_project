import React from "react";
import {
  Box,
  Center,
  Image,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Button,
  useToast,
  Input,
  useColorMode,
} from "@chakra-ui/react";
import nft from "../../../assets/nft.webp";
import nftImage from "../../../assets/nfts.webp";
import logo from "../../../assets/logo.png";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { addUserNotification } from "../../../services/notificationsService";
import { useMetaMask } from "../../../hooks/useMetamask";
import axios from "axios";
import { Link } from "react-router-dom";
import { editNft, getAllUserCreatedNfts } from "../../../services/nftService";
import Web3 from "web3";
import { Abi } from "../../../contract/ABI";
import { editVideo } from "../../../services/videoService";
import {erc20Abi} from '../../../utils/erc20Abi'

function Donate({ receiver, isOpen, onClose, onOpen, nfts, username }) {
  const toast = useToast();
  const { currentAccount, currentChainId, switchNetwork, web3Provider } =
    useMetaMask();

  const [success, setSuccess] = React.useState(false);
  const [tab, setTab] = React.useState(1);
  const user = currentAccount;
  const [amount, setAmount] = React.useState(1);
  const [isLoading, setIsloading] = React.useState(0);
  const web3 = new Web3(Web3.givenProvider);
  const [nftLoading, setNftLoading] = React.useState("");
  const { colorMode } = useColorMode();

  const pinJSONToIPFS = async (JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return axios
      .post(url, JSONBody, {
        headers: {
          pinata_api_key: `${process.env.REACT_APP_PINATA_API_KEY}`,
          pinata_secret_api_key: `${process.env.REACT_APP_PINATA_SECRET_KEY}`,
        },
      })
      .then(function (response) {
        return {
          success: true,
          pinataUrl:
            "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
        };
      })
      .catch(function (error) {
        console.log(error);
        return {
          success: false,
          message: error.message,
        };
      });
  };

  const mintNft = async (
    name,
    description,
    videoUrl,
    available,
    minted,
    price,
    owners,
    idVideo,
    nftowners,
    contract,
    imgIpfs
  ) => {
    setNftLoading(idVideo);
    try {
      var nftsleft = available;
      let userData = await getAllUserCreatedNfts(receiver.toLocaleLowerCase());
      if (userData?.data) {
        nftsleft = userData?.data?.filter(
          (data) => data?.videoId?.videoId === videoUrl
        ).available;
      }
      if (nftsleft !== 0) {
        try {
          await window.ethereum.enable();
          const chainId = currentChainId;
          if (chainId !== "0x16d") {
            try {
              await switchNetwork();
            } catch (e) {}
          }
          const signer = web3Provider.getSigner(currentAccount);
          const tokenContract = new ethers.Contract(
            "0x8f204ef710a354d6cbf9bb66939bc2eed028b69f",
            erc20Abi,
            signer
          );
          const result = await tokenContract.transfer(receiver, price);
          if (result.hash) {
            let nft = {
              name: name + " #" + minted,
              description: description,
              image: imgIpfs,
              video: videoUrl,
            };
            let data = await pinJSONToIPFS(nft);

            if (data?.success) {
              try {
                let uri = data?.pinataUrl;
                let owner = [
                  ...owners,
                  {
                    userId: user.toLocaleLowerCase(),
                    nftTitle: name + " #" + minted,
                    tokenId: minted,
                  },
                ];

                // Interact with smart contract
                const contractAdress = new web3.eth.Contract(Abi, contract);
                const response = await contractAdress.methods
                  .safeMint(user, uri)
                  .send({ from: user });

                if (response?.status) {
                  await editNft(contract, {
                    available: available - 1,
                    minted: minted + 1,
                    owners: owner,
                  });

                  toast({
                    title: `NFT minted successfully`,
                    position: "top",
                    status: "success",
                    isClosable: true,
                  });
                  setNftLoading("");
                  var crnfts = nftowners;
                  crnfts.push(user.toLowerCase());
                  await editVideo(idVideo, {
                    nftOwners: crnfts,
                  });

                  await addUserNotification({
                    from: user.toLocaleLowerCase(),
                    to: receiver.toLocaleLowerCase(),
                    type: "nft purchase",
                    username: username,
                  });
                } else {
                  toast({
                    title: `Mint failed`,
                    position: "top",
                    status: "error",
                    isClosable: true,
                  });
                  setNftLoading("");
                }
              } catch (e) {
                toast({
                  title: `Mint failed`,
                  position: "top",
                  status: "error",
                  isClosable: true,
                });
                setNftLoading("");
              }
            }
          } else {
            toast({
              title: `Transaction failed`,
              position: "top",
              status: "error",
              isClosable: true,
            });
            setNftLoading("");
          }
        } catch {
          toast({
            title: `Transaction failed`,
            position: "top",
            status: "error",
            isClosable: true,
          });
          setNftLoading("");
        }
      }
    } catch (e) {}
  };

  const handleCRTC = (e) => {
    setAmount(e.target.value);
  };

  const TokenDonation = async (e) => {
    e.preventDefault();
    if (amount > 0) {
      setIsloading(2);

      try {
        await window.ethereum.enable();
        const chainId = currentChainId;
        if (chainId !== "0x16d") {
          try {
            await switchNetwork();
          } catch (e) {}
        }
        const signer = web3Provider.getSigner(currentAccount);
        const tokenContract = new ethers.Contract(
          "0x8f204ef710a354d6cbf9bb66939bc2eed028b69f",
          erc20Abi,
          signer
        );
        const result = await tokenContract.transfer(receiver, amount);

        console.log(result);
        if (result?.hash) {
          toast({
            title: `Transaction completed successfully`,
            position: "top",
            status: "success",
            isClosable: true,
          });
          setSuccess(true);

          await addUserNotification({
            from: user,
            to: receiver,
            type: "donate",
            username: username,
          });
          setIsloading(0);
        } else {
          toast({
            title: `Transaction failed`,
            position: "top",
            status: "error",
            isClosable: true,
          });

          setSuccess(false);
        }
      } catch {
        toast({
          title: `Transaction failed`,
          position: "top",
          status: "error",
          isClosable: true,
        });
        setIsloading(0);
      }
    }
  };

  return (
    <>
      <Modal
        size="lg"
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
        borderRadius="5px"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="5px"
          height="auto"
          bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
        >
          <ModalCloseButton
            onClick={() => {
              setIsloading(0);
              setAmount(1);
            }}
          />
          <ModalBody
            pt={6}
            pb={6}
            bg={colorMode === "light" ? "#DAD9D9" : "#242627"}
            borderRadius="5px"
          >
            <Box height="100%" w="100%">
              <Text as="h1" fontSize="1.2rem" fontWeight="bold" pl={2}>
                Your support can make a difference
              </Text>

              <Center w="100%" h="100%" pt={5}>
                <Box w="95%" h="100%">
                  {tab === 1 && nfts?.length > 0 && (
                    <Box
                      w="100%"
                      h="100%"
                      borderRadius="5px"
                      textAlign="center"
                      overflowY="auto"
                      maxHeight="60vh"
                    >
                      {nfts?.map((nft) => (
                        <Box
                          key={nft._id}
                          d="flex"
                          mt={3}
                          mb={3}
                          bg={
                            colorMode === "light"
                              ? "rgb(36, 38, 39,0.7)"
                              : "rgb(68, 72, 73,0.25)"
                          }
                          p={3}
                          borderRadius="5px"
                        >
                          <Box w="40%">
                            <Link to={`/video/${nft?.videoId?.videoId}`}>
                              <Image
                                src={nft?.videoId?.thumbnail}
                                alt={nft?.name}
                                w="8rem"
                                h="5.5rem"
                                borderRadius="3px"
                              />
                            </Link>
                          </Box>
                          <Box w="60%">
                            {colorMode === "dark" && (
                              <Text
                                textAlign="left"
                                as="h4"
                                noOfLines={1}
                                lineHeight="2rem"
                                fontSize="1rem"
                                pb={1.5}
                              >
                                {nft.name}
                              </Text>
                            )}
                            {colorMode === "light" && (
                              <Text
                                color="white"
                                textAlign="left"
                                as="h4"
                                noOfLines={1}
                                lineHeight="2rem"
                                fontSize="1rem"
                                pb={1.5}
                              >
                                {nft.name}
                              </Text>
                            )}

                            <Box d="flex">
                              <Box
                                w="25%"
                                alignContent="left"
                                justifyContent="left"
                              >
                                <Text
                                  textAlign="left"
                                  color="rgb(255,255,255,0.5)"
                                  fontSize="0.8rem"
                                  p={0}
                                  m={0}
                                >
                                  Price
                                </Text>
                                <Box d="flex">
                                  <Image
                                    src={logo}
                                    w="1rem"
                                    h="1rem"
                                    alt="logo"
                                    mt={0.5}
                                  />
                                  {colorMode === "dark" && (
                                    <Text
                                      fontSize="0.9rem"
                                      fontWeight="bold"
                                      pl={1}
                                    >
                                      {nft?.price}
                                    </Text>
                                  )}

                                  {colorMode === "light" && (
                                    <Text
                                      color="white"
                                      fontSize="0.9rem"
                                      fontWeight="bold"
                                      pl={1}
                                    >
                                      {nft?.price}
                                    </Text>
                                  )}
                                </Box>
                              </Box>

                              {nft?.available > 0 && (
                                <Button
                                  isLoading={
                                    nftLoading === nft?.videoId?.videoId
                                  }
                                  mt={1}
                                  bg={
                                    colorMode === "light"
                                      ? "#242627"
                                      : "rgb(210, 187, 49)"
                                  }
                                  _hover={{ bg: "rrgb(210, 187, 49,0.5)" }}
                                  fontWeight="bold"
                                  color={
                                    colorMode === "light" ? "white" : "black"
                                  }
                                  w="75%"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    mintNft(
                                      nft?.name,
                                      nft?.description,
                                      nft?.videoId?.ipfsUrl,
                                      nft?.available,
                                      nft?.minted,
                                      nft?.price,
                                      nft?.owners,
                                      nft?.videoId?.videoId,
                                      nft?.videoId?.nftOwners,
                                      nft?.contract,
                                      nft?.ipfsThumbnail
                                    );
                                  }}
                                >
                                  Mint
                                </Button>
                              )}

                              {nft?.available === 0 && (
                                <Button
                                  mt={1}
                                  disabled
                                  _hover={{ bg: "rgb(219, 195, 50,0.8)" }}
                                  fontSize="1.1rem"
                                  w="75%"
                                  bg={
                                    colorMode === "light"
                                      ? "#242627"
                                      : "rgb(210, 187, 49)"
                                  }
                                  color={
                                    colorMode === "light" ? "white" : "black"
                                  }
                                  fontWeight="bold"
                                >
                                  Sold out
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {tab === 1 && nfts?.length < 1 && (
                    <Box w="100%" h="100%" textAlign="center">
                      <Text as="h3" h="10%" pb={5}>
                        Video creator did not create an NFT collection yet
                      </Text>
                      <Box w="100%" h="90%">
                        <Center w="100%" h="100%">
                          <Image src={nftImage} h="100%" w="90%" />
                        </Center>
                      </Box>
                    </Box>
                  )}

                  {tab === 2 && (
                    <Box w="100%" h="100%" textAlign="center">
                      {success ? (
                        <Box w="100%" h="90%" pt={5}>
                          <Center w="100%" h="100%">
                            <Box w="100%" h="100%">
                              <Center w="100%">
                                <AiOutlineCheckCircle
                                  fill="#3ADB15"
                                  size="6rem"
                                />
                              </Center>

                              <Text
                                fontSize="1.3rem"
                                color="#3ADB15"
                                fontWeight="bold"
                                pt={5}
                              >
                                Success
                              </Text>
                            </Box>
                          </Center>
                        </Box>
                      ) : (
                        <>
                          <Box w="100%" h="100%" textAlign="center">
                            <Text as="h3" h="10%" pb={5}>
                              Only{" "}
                              <span
                                style={{ fontWeight: "bold", color: "#DBC332" }}
                              >
                                CRTC
                              </span>{" "}
                              tokens are accepted
                            </Text>
                            <Box w="100%" h="90%">
                              <Center w="100%" h="100%">
                                <Image src={nft} h="100%" w="70%" />
                              </Center>
                            </Box>
                          </Box>
                          <Box w="100%" h="90%">
                            <Center w="100%" h="100%">
                              <Box w="100%" h="100%">
                                <Box w="100%" h="50%" d="flex" pt={8}>
                                  <Image
                                    src={logo}
                                    h="2.8rem"
                                    w="2.8rem"
                                    mr={5}
                                  />
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
                                    color={
                                      colorMode === "light" ? "black" : "white"
                                    }
                                    onChange={handleCRTC}
                                    value={amount}
                                    placeholder="Amount"
                                  />
                                  {isLoading == 2 ? (
                                    <Button
                                      isLoading
                                      loadingText=""
                                      ml={2}
                                      w="10rem"
                                      pb={0.5}
                                    >
                                      Send
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={TokenDonation}
                                      ml={2}
                                      w="10rem"
                                      pb={0.5}
                                    >
                                      Send
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                            </Center>
                          </Box>
                        </>
                      )}
                    </Box>
                  )}
                  <Box h="20%" w="100%" d="flex" mt={5} columnGap={5}>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setTab(1);
                      }}
                      fontWeight="bold"
                      w="50%"
                      fontSize="1.1rem"
                      bg="transparent"
                      border={
                        colorMode === "light"
                          ? "1px solid #242627"
                          : "1px solid white"
                      }
                    >
                      NFT
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setTab(2);
                        setSuccess(false);
                      }}
                      w="50%"
                      _hover={
                        colorMode === "light"
                          ? { bg: "rgb(36, 38, 39,0.9)" }
                          : { bg: "rgb(219, 195, 50,0.8)" }
                      }
                      fontSize="1.1rem"
                      bg={colorMode === "light" ? "#242627" : "#DBC332"}
                      color={colorMode === "light" ? "white" : "black"}
                      fontWeight="bold"
                    >
                      Token
                    </Button>
                  </Box>
                </Box>
              </Center>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Donate;
