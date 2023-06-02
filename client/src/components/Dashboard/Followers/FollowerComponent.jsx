import React from 'react'
import {Box,Center,Text,Button, Avatar,AvatarBadge} from '@chakra-ui/react';
import {AiFillCheckCircle} from "react-icons/ai"
import {Link} from "react-router-dom";
import {RiUserFollowLine} from 'react-icons/ri'
import {HiCheck} from 'react-icons/hi'
import {followUser,unFollowUser} from "../../../services/usersService";
import {useMetaMask} from '../../../hooks/useMetamask'

function FollowerComponent({avatar,username,followers,follow,userId,isVerified,isOnline,mode}) {

  const { currentAccount } = useMetaMask();
    const user = currentAccount.toLowerCase();
    const [addFollow,setAddFollow] = React.useState(false)
    const [isFollow,setIsFollow]= React.useState(follow||false)

    const Follow = async() => {
      try{
          setAddFollow(true)
          setIsFollow(true)
          await followUser(userId.toLowerCase(),{value : user})
          
          
          
      }catch(error) {
          console.log(error)
      }
  }
  
  const unFollow = async() => {
      try{
          setAddFollow(false)
          setIsFollow(false)
          await unFollowUser(userId.toLowerCase(),{value : user})
          
          
      }catch(error) {
          console.log(error)
      }
  }

  return (
    <> 
      <Box pt={2} pl={[0,0,7,7]} d="flex">
                <Center width="100%">
                  <Box width={["35%","40%","40%","40%"]} d="flex">
                      <Box  label="Studio" cursor="pointer"  width={["2rem","2rem","2.3rem","2.3rem"]}  h={["2rem","2rem","2.3rem","2.3rem"]} borderRadius="50%" >
                                    

                                    <Link to={`/profile/${userId}`}>
                                      <Avatar name={`${username}`}  src={avatar} >
                                      {isOnline ? <AvatarBadge borderColor="#2D2D2E" boxSize='1rem' bg='#55D64F' /> : <AvatarBadge borderColor="#2D2D2E" boxSize='1rem' bg='grey' />} 
                                      </Avatar>
                                        </Link>                                
                                </Box>

                                <Box pl={5}>
                                    <Box d="flex" >
                                      <Link to={`/profile/${userId}`}>
                                        <Text as="h3" noOfLines={1} color={mode === "light" ? "#101011" : "#FFD600"} fontWeight="600" fontSize={["0.9rem","0.9rem","1rem","1rem"]} cursor="pointer">{username.slice(0,10)}</Text>
                                      </Link>
                                        {isVerified && <Box pl={[0.5,2,2,2]} pt={1}><AiFillCheckCircle fill={mode==="light" ? "#5B61FB" : "#FFD600"}/></Box>}
                                    </Box>
                                  
                                  <Text as="h2" color="#595B5D" fontSize="0.8rem">{followers.length} {followers.length > 1 ? 'Followers' : 'Follower'}</Text>
                                </Box>
                  </Box>
                              
                              <Box width={["65%","60%","60%","60%"]} d="flex"  ml={[8,10,10,10]} pr={[2,2,10,10] } columnGap={5}>
                                  <Box width="50%">
                                          {(isFollow || addFollow) && <Button  onClick={unFollow} leftIcon={<HiCheck />} _hover={{bg : "rgb(69, 82, 254,0.8)"}} _active={{bg : "rgb(69, 82, 254,0.8)"}} bg="rgb(69, 82, 254,0.5)" 
                                              pb={1}
                                              pl={3}
                                              borderRadius="5px" fontSize="0.9rem" height="2rem" width={["6rem","7rem","7rem","7rem"]}>
                                              Following
                                            </Button>
                                             }
                                          {(!isFollow && !addFollow)
                                            && <Button color="white" onClick={Follow} leftIcon={<RiUserFollowLine />} _hover={{bg : "rgb(69, 82, 254,0.8)"}} _active={{bg : "rgb(69, 82, 254,0.8)"}} bg={mode==="light" ? "#3EA6FF" : "#4552FE"} 
                                            pb={1}
                                            borderRadius="5px" height="2rem" width="7rem">
                                            Follow
                                          </Button> 
                                          }
                                  </Box>
                                   <Box width="50%">
                                       <Link to={`/messages/${userId}`}>
                                            <Button _hover={{
                                                bg: 'rgb(255,255,255,0.1)'
                                                }} _active={{bg: 'transparent'}} bg="transparent" border={mode==="light" ? "1px solid black" : "1px solid white"} 
                                                 
                                                pb={1}
                                                borderRadius="5px" height="2rem" width={["6rem","7rem","7rem","7rem"]}>
                                                Message
                                            </Button>
                                        </Link>
                                   </Box>
                                  
                              </Box>

                               
                </Center>
                
              </Box>
 
            



    </>
  )
}

export default FollowerComponent