import React from 'react'
import {Box, Text,Skeleton, Avatar, SkeletonCircle, SkeletonText, Center,useColorMode} from "@chakra-ui/react"
import {AiFillCheckCircle} from "react-icons/ai"
import {getVideos} from '../../../services/videoService'
import { Link , useParams} from 'react-router-dom'
import { format } from 'timeago.js'
import { getAllSavedLives } from '../../../services/liveService'

function Videos() {

  document.title = "Discover Videos"

  const [videos,setVideos] = React.useState([])
  const {title} = useParams()
  const [showSkeleton,setShowSkeleton] = React.useState(true)
  const [found,setFound] = React.useState(false)
  const [skip, setSkip] = React.useState(0)
  const [loader, setLoader] = React.useState(false)
  const limit = 20
  const {colorMode} = useColorMode()
  
  const skeletons = [0,1,2,3,4,5,6,7,8,9,10,11]

  const getAllVideos = async() =>{
    setShowSkeleton(true)
    try {
      const data = await getVideos(skip,limit)
      const sessions = await getAllSavedLives()
      const values = []
      var allvideos = []
      var sorted = []
        if(data?.data && !title){
          if(sessions?.data?.status !== "not found") {
              allvideos = [ ...data?.data , ...sessions?.data]
              sorted = allvideos.sort((a, b) => a.views - b.views);
          }else{
            sorted = data?.data?.sort((a, b) => a.views - b.views);
          }
          
          setVideos(sorted)
          setShowSkeleton(false)
          setFound(true)

        }else {
          const datas = await getVideos(0,50)
          setFound(false)
          await datas?.data?.map((datass) => {
            
            if(datass.title.toLowerCase().includes(title.toLowerCase()) || datass.tags.includes(title.toLowerCase()) || datass.category.toLowerCase().includes(title.toLowerCase())) {
              values.push(datass)
              setFound(true)
            }
          
          })
          setVideos(values)
          setShowSkeleton(false)
        }
    }catch{}
      
  }



  function numFormatter(num) {
    if(num > 999 && num < 1000000){
        return (num/1000).toFixed(1) + 'K'; 
    }else if(num > 1000000){
        return (num/1000000).toFixed(1) + 'M';
    }else if(num < 900){
        return num; 
    }
}


const handleScroll = () => {
    if(window.innerHeight + document.documentElement.scrollTop + 800 >= document.documentElement.scrollHeight) {
      setSkip((prev) => prev + 1)
      setLoader(true)
      }
  }

  const getNext = async () => {
    const data = await getVideos(skip,limit)
      if(data?.data && !title && skip > 0) {
        setVideos(videos => [...videos, ...data?.data])
        setLoader(false)
      }
  }

React.useEffect(() => {
  getNext()
},[skip])


  React.useEffect(() => {
    getAllVideos()
    
  },[title])


React.useEffect(() => {
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
},[])



  return (
    <>
    <Box w="100%" h="auto" position="relative" ml={["0%","0%","0%","12.2%","12.2%","12.2%"]} mt={["20%","14.5%","10%","10%","10%","8.2%"]} height="86%" pt={8} bg={colorMode === 'light' ? "#F2F2F2" : "#111315"}> 
    
    <Center w="100%">
    {!title && <Box d="grid" w={["80%","95%","95%","100%"]} rowGap={36} gridTemplateColumns={["4fr","2fr 2fr","1fr 1fr 1fr","1fr 1fr 1fr","4fr 4fr 4fr 4fr"]} columnGap={[0,3,4,5]} >
      {!showSkeleton && <> {videos?.map((video) => (
          
            <Box  borderRadius="5px" height={["12rem","10.3rem","10.3rem","10.3rem"]} cursor="pointer" className={colorMode === "light" ? "stream-light" : 'stream'}>
          {
          /* Main Player box */
          
          }
                <Link to={video?.streamId ? `/session/watch/${video?.streamId}` : `/video/${video?.videoId}`}>
                              <Box className={colorMode === "light" ? "stream-light__thumbnail" : "stream__thumbnail"} cursor="pointer" d="flex" height={["12rem","10.3rem","10.3rem","10.3rem"]} bgPosition="center" bgSize="cover" justifyContent="right" bgImage={`url(${video.thumbnail})`} borderRadius="5px">
                                      
                                      <Text borderRadius="2px" as="h3" w="auto" color="white" bg="rgb(0,0,0,0.3)" flex="0 1 auto" alignSelf="flex-end" mr={1}>{video.duration}</Text>
                                                
                                </Box>

                </Link>
                    <Box d="flex" mt={3}>
                                    <Box mt={1} label="Studio" cursor="pointer"  width="2.3rem" height="2.3rem" borderRadius="50%">
                                      <Link to={`/profile/${video?.creator?.userId}`}>
                                          <Avatar src={video?.creator?.ProfileAvatar} alt={video?.creator?.username?.slice(0,20)} width="2.3rem" height="2.3rem" borderRadius="50%" />
                                      </Link>
                                    </Box>

                                    <Box pl={5}>
                                        <Box d="flex">
                                        <Link to={`/profile/${video?.creator?.userId}`}><Text as="h3" fontSize="0.9rem" color={colorMode==="light" ? "#101011" : "#FFD600"} fontWeight="600" cursor="pointer">{video?.creator?.username?.slice(0,20)}</Text></Link>
                                          {video?.creator?.isVerified && <Box pl={2} pt={1}><AiFillCheckCircle fill={colorMode==="light" ? "#5B61FB" : "#FFD600"} /></Box>}
                                          
                                        </Box>
                                        <Link to={video?.streamId ? `/session/watch/${video?.streamId}` : `/video/${video?.videoId}`}><Text noOfLines={2} lineHeight="1.25rem" fontWeight="500" as="h2" pt={1} color={colorMode==="light" ? "rgb(5,0,0,0.85)" : "rgb(255,255,255,0.85)"}  fontSize="1rem">{video.title}</Text></Link>
                                      <Text pt={1} as="h2" color={colorMode === "light" ? "#595B5D":"#595B5D"} fontSize="0.8rem">{numFormatter(video?.views)} views &bull; {video?.streamId ? "Streamed " : ""}{format(video.createdAt)}</Text>

                                     
                                    </Box>
                     </Box>
            </Box>
          
        ))}
        </>
        }

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
                          
                   </>}
                        

      </Box>
      
      }
    



    
      
      {title && 
      <Box d="grid"  w={["80%","95%","95%","100%"]} rowGap={36} gridTemplateColumns={["4fr","2fr 2fr","1fr 1fr 1fr","1fr 1fr 1fr","4fr 4fr 4fr 4fr"]} columnGap={[0,3,4,5]}>
      {found && <>{!showSkeleton && <> {videos?.map((video) => (
          <Link to={`/video/${video?.videoId}`}>
            <Box  borderRadius="10px" height={["12rem","10.3rem","10.3rem","10.3rem"]} cursor="pointer" className={colorMode === "light" ? "stream-light" : 'stream'}>
          {
          /* Main Player box */
          
          }
                         <Link to={`/video/${video?.videoId}`}>
                              <Box className={colorMode === "light" ? "stream-light__thumbnail" : "stream__thumbnail"} cursor="pointer" d="flex" height={["12rem","10.3rem","10.3rem","10.3rem"]} bgPosition="center" bgSize="cover" justifyContent="right" bgImage={`url(${video.thumbnail})`} borderRadius="10px">
                                      
                                      <Text borderRadius="2px" as="h3" w="auto" color="white" bg="rgb(0,0,0,0.3)" flex="0 1 auto" alignSelf="flex-end" mr={1}>{video.duration}</Text>
                                                
                                </Box>
                          </Link>
              
                    <Box d="flex" mt={3}>
                                    <Box mt={1} label="Studio" cursor="pointer"  width="2.3rem" height="2.3rem" borderRadius="50%">
                                      <Link to={`/profile/${video?.creator?.userId}`}>
                                          <Avatar src={video.creator.ProfileAvatar} alt={video?.creator?.username.slice(0,20)} width="2.3rem" height="2.3rem" borderRadius="50%" />
                                      </Link>
                                    </Box>

                                    <Box pl={5}>
                                        <Box d="flex">
                                        <Link to={`/profile/${video?.creator?.userId}`}><Text as="h3" fontSize="0.9rem" color={colorMode==="light" ? "#101011" : "#FFD600"} fontWeight="600" cursor="pointer">{video?.creator?.username.slice(0,20)}</Text></Link>
                                          {video.creator.isVerified && <Box pl={2} pt={1}><AiFillCheckCircle fill={colorMode==="light" ? "#5B61FB" : "#FFD600"} /></Box>}
                                          
                                        </Box>
                                        <Link to={`/video/${video?.videoId}`}><Text noOfLines={2} lineHeight="1.25rem" as="h2" pt={1} color={colorMode==="light" ? "rgb(5,0,0,0.85)" : "rgb(255,255,255,0.85)"}  fontSize="1rem">{video.title}</Text></Link>
                                      <Text as="h2" color={colorMode === "light" ? "#595B5D":"#595B5D"} fontSize="0.8rem">{numFormatter(video.views)} {video.views > 1 ? "View" : "Views"}</Text>

                                     
                                    </Box>
                     </Box>
            </Box>
          </Link>
        ))}
        </>
        }
      </>}
      

                    {showSkeleton && <>
                        {skeletons.map(() => (
                                    <Box   height={["12rem","10.3rem","10.3rem","10.3rem"]} >
                                    {
                                    /* Main Player box */
                                    
                                    }
                                    <Box cursor="pointer"  height={["12rem","10.3rem","10.3rem","10.3rem"]} >
                                    <Skeleton borderRadius="10px" height="100%" w="100%" startColor={colorMode === "light" ? "#5B61FB" : '#FB5B78'}  />
                                        
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

      </Box>
      
      
      }
      {(!found && !showSkeleton) && 
      <Box w="100%" pt={5} extAlign="center" ><Text as="h1" color={colorMode === "light" ? "black" : "white"} fontSize="1.25rem">No results found</Text></Box>
      }
      
                      
      </Center> 
          </Box>
    
    </>
  )
}

export default Videos