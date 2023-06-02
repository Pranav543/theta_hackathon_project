import React from 'react'
import {Box, Text, Button, SkeletonCircle, SkeletonText, Skeleton, Avatar,useColorMode, Center} from "@chakra-ui/react"
import {AiFillCheckCircle} from "react-icons/ai"
import {BiVideoPlus} from "react-icons/bi"
import {getLives} from '../../../services/liveService'
import { Link } from 'react-router-dom'



function Streams() {

  document.title = "Dicover Live Streams"
  const [showSkeleton,setShowSkeleton] = React.useState(true)
  const [allLives, setAllLives] = React.useState([])
  const skeletons = [0,1,2,3,4,5,6,7,8,9,10,11]
  const limit = 20
  const [skip, setSkip] = React.useState(0)
  const [loader, setLoader] = React.useState(false)
  const defaultThumbnail = "https://i.stack.imgur.com/XZDsP.jpg"
  const {colorMode} = useColorMode()



  const getStreams = async() => {
    try{
      const livees = await getLives(skip,limit)
      if(livees?.data){ 
       
        setAllLives(livees?.data)
          
        
        setShowSkeleton(false)
      }
    }
    catch(e){
      setShowSkeleton(false)
    }
  }



  const handleScroll = () => {
    if(window.innerHeight + document.documentElement.scrollTop + 500 >= document.documentElement.scrollHeight) {
      setSkip((prev) => prev + 1)
      setLoader(true)
      }
  }
  
    const getNext = async () => {
      const data = await getLives(skip,limit)
        if(data?.data && skip > 0) {
          setAllLives(videos => [...videos, ...data?.data])
          setLoader(false)
        }
    }

    React.useEffect(() => {
      getNext()
    },[skip])

    React.useEffect(() => {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    },[])


  React.useEffect(() => {
    getStreams()
  },[])

  return (
    <> 
    <Box w="100%" h="auto" position="relative" ml={["0%","0%","0%","12.2%","12.2%","12.2%"]} mt={["20%","14.5%","10%","10%","10%","8.2%"]} height="86%" pt={8}> 
      <Center w="100%">
      
        <Box d="grid" w={["80%","95%","95%","100%"]} rowGap={28} gridTemplateColumns={["4fr","2fr 2fr","1fr 1fr 1fr","1fr 1fr 1fr","4fr 4fr 4fr 4fr"]} columnGap={[0,3,4,5]}>
          {!showSkeleton && <>
          {allLives.map((live) => (
          
              <Box borderRadius="5px" height={["12rem","10.3rem","10.3rem","10.3rem"]} >
              {
              /* Main Player box */
              
              }

                      <Link to={`/live/${live?.streamUrl}`}>
                          <Box cursor="pointer" position="relative" className={colorMode==="light" ? "stream-light" :'stream'} height={["12rem","10.3rem","10.3rem","10.3rem"]}>
                                  <Box position="absolute" top="0" zIndex={10} right="0" pr={1} pt={1} textAlign="center" >
                                    <Text pt={0.4} fontSize="0.8rem" borderRadius="50px" height="1.5rem" color="white" fontWeight="500" width="2.5rem" bg="#FB5B78" >Live</Text>
                                  </Box>
                                
                                
                                  <Box bgImage={`url(${live?.thumbnail ? live?.thumbnail: defaultThumbnail})`} bgSize="cover" 
                                    bgPosition="center" className={colorMode==="light"? "stream-light__thumbnail": "stream__thumbnail" }
                                    height="100%" width="100%" style={{borderRadius : '5px'}}/>
                          </Box>

                        </Link>    
                        <Box d="flex" mt={3}>
                                        <Box mt={1} label="Studio" cursor="pointer"  width="2.3rem" height="2.3rem" borderRadius="50%">
                                          <Link to={`/profile/${live?.creator?.userId}`}>
                                            <Avatar src={live?.creator?.ProfileAvatar} alt={live?.creator?.username} width="2.3rem" height="2.3rem"  />
                                          </Link>
                                        </Box>

                                        <Box pl={5}>
                                            <Box d="flex">
                                            <Link to={`/profile/${live?.creator?.userId}`}><Text as="h3" fontSize="0.9rem" color={colorMode==="light" ? "#101011" : "#FFD600"} fontWeight="600" cursor="pointer">{live?.creator?.username?.slice(0,20)}</Text></Link>
                                              {live?.creator?.isVerified && <Box pl={2} pt={1}><AiFillCheckCircle fill={colorMode==="light" ? "#5B61FB" : "#FFD600"} /></Box>}
                                            {live?.tags?.includes("axie") &&  <Button color="white" ml="2rem" _hover={{
                                                  bg: 'rgb(123, 91, 251)'
                                                }} _active={{bg: 'rgb(123, 91, 251)'}} bg="rgb(123, 91, 251,0.92)" 
                                                  leftIcon={<BiVideoPlus size="1.2rem" fill='white'/>}  
                                                  borderRadius="50" height="1.5rem" width="4.5rem" fontSize="0.9rem">
                                                  Axie
                                          </Button>
                                          }  {(live?.tags?.includes("sps") || live?.tags?.includes("splinterlands")) && <Button color="white" ml="2rem" _hover={{
                                            bg: 'rgb(11, 127, 165,0.8)'
                                          }} _active={{bg: 'rgb(11, 127, 165,0.8)'}} bg="rgb(11, 127, 165)" 
                                            leftIcon={<BiVideoPlus size="1.2rem" fill='white'/>}  
                                            borderRadius="50" height="1.5rem" width="4.5rem" fontSize="0.9rem">
                                            Sps
                                    </Button>
                                        }

                                          {live?.tags?.includes("mobox") && <Button color="white" ml="2rem" _hover={{
                                            bg: 'rgb(129, 191, 127,0.8)'
                                          }} _active={{bg: 'rgb(129, 191, 127,0.8)'}} bg="#81BF7F" 
                                            leftIcon={<BiVideoPlus size="1.2rem" fill='white'/>}  
                                            borderRadius="50" height="1.5rem" width="5.2rem" fontSize="0.9rem">
                                            Mobox
                                          </Button>
                                            }
                                        {(!live?.tags?.includes("axie") && !live?.tags?.includes("sps") && !live?.tags?.includes("mobox")) && 
                                        
                                        <Button color="white" ml="2rem" _hover={{
                                          bg: '#81BF7F'
                                        }} _active={{bg: 'rgb(223, 215, 42,0.9)'}} bg="rgb(223, 215, 42,0.8)" 
                                          leftIcon={<BiVideoPlus size="1.2rem" fill='white'/>}  
                                          borderRadius="50" height="1.5rem" width="5.2rem" fontSize="0.9rem">
                                          {live?.tags[0]?.slice(0,6).charAt(0).toUpperCase() + live?.tags[0]?.slice(1).slice(0,5)}
                                  </Button>
                                        }
                                            </Box>
                                            <Link to={`/live/${live?.streamUrl}`}><Text noOfLines={2} fontWeight="500" lineHeight="1.25rem" as="h2" pt={1} color={colorMode==="light" ? "rgb(5,0,0,0.85)" : "rgb(255,255,255,0.85)"}  fontSize="1rem">{live?.title}</Text></Link>
                                          <Text as="h2" color={colorMode === "light" ? "#595B5D":"#595B5D"} fontSize="0.8rem">{live?.views} Watching</Text>

                                        
                                        </Box>
                        </Box>
              </Box>
            
        ))}
          </>}

          {showSkeleton && <>
                          {skeletons.map(() => (
                                      <Box   height={["12rem","10.3rem","10.3rem","10.3rem"]} >
                                      {
                                      /* Main Player box */
                                      
                                      }
                                      <Box cursor="pointer"  height={["12rem","10.3rem","10.3rem","10.3rem"]} >
                                      <Skeleton borderRadius="5px" height="100%" w="100%" startColor={colorMode === "light" ? "#5B61FB" : '#FB5B78'}  />
                                          
                                      </Box>
                            
                                          
                                                <Box d="flex" mt={3}>
                                                                <Box mt={1} label="Studio" cursor="pointer"  width="2.3rem" height="2.3rem" borderRadius="50%">
                                                                  <SkeletonCircle startColor={colorMode === "light" ? "#5B61FB" : '#FB5B78'}  size='10' />
                            
                                                                </Box>
                            
                                                                <Box pl={5}>
                                                                <Box >
                                                                <SkeletonText w="10rem" startColor={colorMode === "light" ? "#5B61FB" : '#FB5B78'}  noOfLines={3} spacing='3' />
                                                                </Box>
                                                                      
                            
                                                                
                                                                </Box>
                                                </Box>
                                      </Box>
                          ))}
                              
                      </>
                          }


          {loader && <>
                        {[0,1,2,3,4,5,6,7].map(() => (
                                    <Box   height={["12rem","10.3rem","10.3rem","10.3rem"]} >
                                    {
                                    /* Main Player box */
                                    
                                    }
                                    <Box cursor="pointer"  height={["12rem","10.3rem","10.3rem","10.3rem"]} >
                                    <Skeleton borderRadius="5px" height="100%" w="100%" startColor='#FB5B78' />
                                        
                                    </Box>
                          
                                        
                                              <Box d="flex" mt={3}>
                                                              <Box mt={1} label="Studio" cursor="pointer"  width="2.3rem" height="2.3rem" borderRadius="50%">
                                                                <SkeletonCircle startColor='#FB5B78' size='10' />
                          
                                                              </Box>
                          
                                                              <Box pl={5}>
                                                              <Box >
                                                              <SkeletonText w="10rem" startColor='#FB5B78' noOfLines={3} spacing='3' />
                                                              </Box>
                                                                    
                          
                                                              
                                                              </Box>
                                              </Box>
                                    </Box>
                        ))}
                            
                    </>}
          
        </Box>
      
      </Center>
    </Box>
                              
              
          </>
  )
}

export default Streams