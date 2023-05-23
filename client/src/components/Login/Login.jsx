import {Box,Text,Button,Center , Image, useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody, Input, Link} from '@chakra-ui/react';
  import React from 'react';
  import Carousel from 'nuka-carousel';
  import qr from '../../assets/qr.png'
   import metamask from '../../assets/metamask.png'
  import walletconnect from '../../assets/walletconnect.png'
  import magicWallet from '../../assets/magicWallet.svg'
  import magic from '../../assets/happyface.png'
  import magicLink from "../../assets/magicLink.png"
  import nft from '../../assets/nft.gif'
  import world from '../../assets/meta.jpg'
  import platform from '../../assets/platform.jpg'
  import { useMoralis } from 'react-moralis';
  import Moralis from 'moralis-v1';

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
        position: 'relative',
        margin: 0,
        padding: 0,
      };
    }
  


    getListItemStyles() {
      return {
        listStyleType: 'none',
        display: 'inline-block',
      };
    }
  
    getButtonStyles(active) {
      return {
        border: 0,
        background: 'transparent',
        color: 'black',
        cursor: 'pointer',
        padding: 10,
        outline: 0,
        fontSize: 28,
        opacity: active ? 1 : 0.5,
      };
    }
  
    render() {
      const indexes = this.getIndexes(
        this.props.slideCount,
        this.props.slidesToScroll,
      );
      return (
        <ul style={this.getListStyles()}>
          {indexes.map(index => {
            return (
              <li style={this.getListItemStyles()} key={index}>
                <button
                  style={this.getButtonStyles(this.props.currentSlide === index)}
                  onClick={this.props.goToSlide.bind(null, index)}
                >
                  &bull;
                </button>
              </li>
            );
          })}
        </ul>
      );
    }
  }
  
  function Login() {
    const { authenticate, enableWeb3 } = useMoralis();

    React.useEffect(()=>{
      window.localStorage.setItem('chakra-ui-color-mode','dark')
    },[])

    const [email,setEmail] = React.useState("")
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isLoading,setIsLoading] = React.useState(false)

    const metaMask = async() => {
      try {
  
        // Enable web3 to get user address and chain
        await enableWeb3({ throwOnError: true, provider:'metamask' });
        const { account, chainId } = Moralis;
        if (!account) {
          throw new Error('Connecting to chain failed, as no connected account was found');
        }
        if (!chainId) {
          throw new Error('Connecting to chain failed, as no connected chain was found');
        }

        if (chainId !== '0x38') {
          await Moralis.switchNetwork("0x38").catch(async (e) => {
            if(e.code === 4902) {
            const chainId = 56;
            const chainName = "Binance Smart Chain";
            const currencyName = "BNB";
            const currencySymbol = "BNB";
            const rpcUrl = "https://bsc-dataseed.binance.org/";
            const blockExplorerUrl = "https://bscscan.com";
            
            await Moralis.addNetwork(
              chainId,
              chainName,
              currencyName,
              currencySymbol,
              rpcUrl,
              blockExplorerUrl
            );
            await Moralis.switchNetwork("0x38")
          }
          })
          
} 
  
        // Get message to sign from the auth api
        const { message } = await Moralis.Cloud.run('requestMessage', {
          address: account,
          chain: parseInt(chainId, 16),
          networkType: 'evm',
        });
  
        // Authenticate and login via parse
        const data = await authenticate({
          signingMessage: message,
          throwOnError: true,
        });
        if(data?.id.length > 2) {
          const user = account;
          localStorage.setItem('userLogged', user.toLowerCase())
          window.location.reload()
        }
      } catch (error) {
        console.log(error);
      } 
    }

    const walletConnect = async() => {
      try {
  
        // Enable web3 to get user address and chain
        await enableWeb3({ throwOnError: true, provider:'walletconnect' });
        const { account, chainId } = Moralis;
        if (!account) {
          throw new Error('Connecting to chain failed, as no connected account was found');
        }
        if (!chainId) {
          throw new Error('Connecting to chain failed, as no connected chain was found');
        }

        if (chainId !== '0x38') {
          await Moralis.switchNetwork("0x89").catch(async (e) => {
            if(e.code === 4902) {
             const chainId = 56;
            const chainName = "Binance Smart Chain";
            const currencyName = "BNB";
            const currencySymbol = "BNB";
            const rpcUrl = "https://bsc-dataseed.binance.org/";
            const blockExplorerUrl = "https://bscscan.com";
            
            
            await Moralis.addNetwork(
              chainId,
              chainName,
              currencyName,
              currencySymbol,
              rpcUrl,
              blockExplorerUrl
            );
            await Moralis.switchNetwork("0x38")
          }
          })
          
} 
  
        // Get message to sign from the auth api
        const { message } = await Moralis.Cloud.run('requestMessage', {
          address: account,
          chain: parseInt(chainId, 16),
          networkType: 'evm',
        });
        // Authenticate and login via parse
        const data = await authenticate({
          signingMessage: message,
          throwOnError: true,
        });
        if(data?.id.length > 2) {
          const user = account;
          localStorage.setItem('userLogged', user.toLowerCase())
          window.location.reload()
        }
      } catch (error) {
        console.log(error);
      } 
    }


    const handleEmailChange = (e) => {
      setEmail(e.target.value)
    }


const magicAuth = async() => {

      try {
        setIsLoading(true)
        await Moralis.enableWeb3();
        await authenticate({ 
          provider: "magicLink",
          email: email,
          apiKey: `${process.env.REACT_APP_API_MAGIC}`,
          network: "kovan",
        })
        const user = Moralis.User.current().get("ethAddress");
        localStorage.setItem('userLogged', user.toLowerCase())
        setIsLoading(false)
        window.location.reload() 
    }
    catch (error) {
        console.log(error);
      } 
    }




    return (
  
      <>
      <Box bg="#111315" height="100vh" width="100vw" d="flex" fontFamily="Archivo,sans-serif" color="#1A202C">
      <Box width={["50%","50%","60%","60%"]} height="100%" bg="#F7F7FC" display={["none", "none","block","block","block"]}>
          <Center width="100%" height="100%">
            <Box width="70%" height="100%" >
            <Carousel enableKeyboardControls={true} renderBottomCenterControls={props => <PagingDots {...props} />} autoplay={true} autoplayInterval={5000} wrapAround={true} renderCenterLeftControls={() => (null)} renderCenterRightControls={() => (null)}>
                <Box height="100%" width="100%" pt={5} pb={10}>
                  <Text as="h1" fontSize="2rem" fontWeight="bold" pb={3}>MetaCratch Universe</Text>
                  <Box  borderRadius="5px" ><Image loading="lazy" display={["none", "none","block","block","block"]} src={world} borderRadius="10px" width="100%" alt="meta" /></Box>
                  
                  <Text as="h3" fontSize="1.8rem" fontWeight="bold"  pt={8}>Join the awesome <span style={{color: '#0d3ac1'}}>community</span></Text>
                  <Text as="h3" fontSize="1.1rem" pb={5}>Join one of the best Metaverse community in the crypto space. Create, play, earn and meet new friends.</Text>
                </Box>
                <Box height="100%" width="100%" pt={5} pb={10}>
                  <Text as="h1" fontSize="2rem" fontWeight="bold" pb={3}>Cratch World</Text>
                  <Box bg="#FDF1F4" borderRadius="5px" ><Image loading="lazy" display={["none", "none","block","block","block"]} src={platform} borderRadius="10px" alt="meta" /></Box>
                  <Text as="h3" fontSize="1.8rem" fontWeight="bold"  pt={8}><span style={{color: '#0d3ac1'}}>Create, Watch & Earn</span> in Cratch</Text>
                  <Text as="h3" fontSize="1.1rem" pb={5}>Share your content in Cratch and create a brand, commuity. Go live and experience a new world of MetaStreams.
                  </Text>
                </Box>
                <Box height="100%" width="100%" pt={5} pb={10}>
                  <Text as="h1" fontSize="2rem" fontWeight="bold" pb={3}>NFTs only in MobiCratch</Text>
                  <Box bg="#EDF9FE" borderRadius="5px" >
                    <Image loading="lazy" display={["none", "none","block","block","block"]} src={nft} borderRadius="10px" alt="meta" />
                  </Box>
                  <Text as="h3" fontSize="1.8rem" fontWeight="bold"  pt={8}>Monthly <span style={{color: '#0d3ac1'}}>NFT</span> airdrop</Text>
                  <Text as="h3" fontSize="1.1rem" pb={5}>Download MobiCratch to experience the future of video sharing, live streaming and digital content.
                  Win valuable NFTs only in MobiCratch.
                  </Text>
                </Box>
            </Carousel>
            </Box>
          </Center>
      </Box>
  
      <Box width={["100%","100%","50%","40%","40%"]} height="100%" bg="#100B1C" >
          <Center width="100%" height="100%">
              <Box width="90%" height="90%">
                <Center width="100%" height="100%">
                  <Box width="100%" height="100%" bg="#F7F7FC" borderRadius="8px">
                    <Center width="100%" height="100%">
                      <Box width="90%" height="90%">
                      <Text as="h1" fontSize="1.8rem" fontWeight="bold" pb={2}>
                        Sign in
                      </Text>
                      <Text as="p" fontSize="1rem" color="#716E85" pb={10}>Log in with your Wallet</Text>
                      
                      <Button width="100%" height="4rem" mb={5} bg="#EFF0F7" display="block" textAlign="left" _hover={{
                        boxShadow: '-0.1em 0 .4em #100B1C;'
                      }} onClick={metaMask}>
                        
                      <Box d="flex" ><Image src={metamask} width="3.5rem" alt="metamask" /> <Text pt={2.5} textAlign="center">Metamask</Text></Box>
                      
                      </Button>
                      <Button onClick={walletConnect} width="100%" height="4rem" mb={5} bg="#EFF0F7" display="block" textAlign="left" _hover={{
                        boxShadow: '-0.1em 0 .4em #100B1C;'
                      }} >
                      <Box d="flex" ><Image src={walletconnect} width="3.5rem" alt="walletconnect" /> <Text pt={2.5} textAlign="center">WalletConnect</Text></Box>
                      </Button>
                      <Button width="100%" height="4rem" mb={5} bg="#EFF0F7" display="block" textAlign="left" _hover={{
                        boxShadow: '-0.1em 0 .4em #100B1C;'
                      }} onClick={onOpen}>
                      <Box d="flex" ><Image src={magicWallet} width="2rem" alt="Magic Link" ml={4} mr={3}/> <Text pt={2.5} textAlign="center">Magic</Text></Box>
                      </Button>
  
                      <Center width="100%" pt={5} >
                        <Image src={qr} alt="qr" />
                      </Center>
                      </Box>
                    </Center>
                  </Box>
                </Center>
              </Box>
          </Center>
      </Box>
    


      <Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay />
                <ModalContent borderRadius="20px" w={["80%","80%","100%","100%"]}>
                  
                  <ModalBody pt={10} pb={10} bg="#F7F7FC" borderRadius="20px">
                    <Center w="100%" fontFamily="Arial">
                      <Box w="85%" alignItems="center" textAlign="center" justifyContent="center" alignSelf="center">
                        <Center w="100%" >
                            <Image src={magic} alt="Magic Wallet" h="4rem" w="4rem" />
                        </Center>
                        
                        
                        <Text pt={4} pb={8} as="h1" color="#1A202C" fontSize={["1.8rem","1.8rem","2.1rem","2.1rem"]} fontWeight="bold">Welcome</Text>

                        <Input borderRadius="10px" h="3rem" _placeholder={{color : "black"}} borderColor="rgb(0,0,0,0.2)" _hover={{borderColor : "#9483ff" }} focusBorderColor="#9483ff" type="text" color="black" placeholder='Email address' value={email} onChange={handleEmailChange} />

                        {isLoading ? 
                        <Button isLoading loadingText='Log in / Sign up' mt={6} h="3.2rem" _hover={{bg : "#4e3bdb"}} w="100%" borderRadius="50px" bg="#6851ff" color="white" fontWeight="500" fontFamily="Arial" fontSize="1.2rem"> Log in / Sign up</Button>
                        :<Button onClick={magicAuth} isDisabled={email.length <1} mt={6} h="3.2rem" _hover={{bg : "#4e3bdb"}} w="100%" borderRadius="50px" bg="#6851ff" color="white" fontWeight="500" fontFamily="Arial" fontSize="1.2rem"> Log in / Sign up</Button>
                        }
                        <Box d="flex" w="100%" textAlign="center" justifyContent="center" alignSelf="center" pt={6}>
                          <Link href="https://magic.link/" isExternal><Text _hover={{textDecoration: "underline"}} pt={4} as="h1" fontWeight="400" color="#b6b4ba" fontSize={["0.75rem","0.75rem","0.8rem","0.8rem"]} pr={2} >Secured by</Text></Link>
                          
                          <Link href="https://magic.link/" isExternal><Image mt={2.5} src={magicLink} alt="Magic Link" w="4rem" h="2rem" /></Link>
                        </Box>
                      </Box>
                        
                  
                   </Center>
                  </ModalBody>
                    
                  
                </ModalContent>
              </Modal>
  
      </Box>
      
      </>
    );
  }
  
  export default Login;
  