import { Box, Text } from '@chakra-ui/react';
import React from 'react'
import { AiFillDislike, AiFillLike, AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import {format} from "timeago.js"
import {getLikes,getDisLikes,upLike,unLike,unDisLike,upDisLike} from '../../../services/likesService'

function CommentComponent({comment,userId,commentedNow,mode}) {

    const [CommentLikes, setCommentLikes] = React.useState(0)
    const [CommentDislikes, setCommentDislikes] = React.useState(0)
    const [CommentLikeAction, setCommentLikeAction] = React.useState(null)
    const [CommentDislikeAction, setCommentDislikeAction] = React.useState(null)

    let variable = { commentId: comment._id, userId: userId }


    const getCommentsLikesandDislikes = async() => {
        setCommentLikes(0)
        setCommentDislikes(0)
        setCommentLikeAction(null)
        setCommentDislikeAction(null)
        try {

        
        await getLikes(variable)
        .then(response => {


            if (response.data.success) {
                //How many likes does this comment have 
                setCommentLikes(commentedNow ? 0 : response.data.likes.length)

                //if I already click this like button or not 
                response.data.likes.map(like => {
                    if (like.userId === userId && like.commentId === comment._id && !commentedNow) {
                        setCommentLikeAction('liked')
                    }else {
                        setCommentLikeAction(null)
                    }
                })
            } else {
                console.log('Failed to get likes')
            }
        })

    await getDisLikes(variable)
        .then(response => {
           
            if (response.data.success) {
                //How many likes does this comment have 
                setCommentDislikes(response.data.dislikes.length)

                //if I already click this like button or not 
                response.data.dislikes.map(dislike => {
                    if (dislike.userId === userId  && dislike.commentId === comment._id && !commentedNow) {
                        setCommentDislikeAction('disliked')
                    }else {
                        setCommentDislikeAction(null)
                    }
                })
            } else {
                console.log('Failed to get dislikes')
            }
        })
    }catch{}
    }

    React.useEffect(() => {
        getCommentsLikesandDislikes()
    }, [])


    const onLike = async() => {

        if (CommentLikeAction === null) {
            setCommentLikes(CommentLikes + 1)
            setCommentLikeAction('liked')
            await upLike(variable)
                .then(response => {
                    if (response.data.success) {
                        //If dislike button is already clicked

                        if (CommentDislikeAction !== null) {
                            setCommentDislikeAction(null)
                            setCommentDislikes(CommentDislikes - 1)
                        }


                    } else {
                        console.log("")
                    }
                })


        } else {
            setCommentLikes(CommentLikes - 1)
            setCommentLikeAction(null)
            await unLike(variable)
                

        }

    }


    const onDisLike = async() => {

        if (CommentDislikeAction !== null) {
            setCommentDislikes(CommentDislikes - 1)
            setCommentDislikeAction(null)
          await  unDisLike(variable)
          
        } else {
            setCommentDislikes(CommentDislikes + 1)
            setCommentDislikeAction('disliked')
            await upDisLike(variable)
                .then(response => {
                    if (response.data.success) {
                        //If dislike button is already clicked
                        if(CommentLikeAction !== null ) {
                            setCommentLikeAction(null)
                            setCommentLikes(CommentLikes - 1)
                        }

                    } else {
                        console.log("")
                    }
                })


        }


    }
  return (
    <>

                <Box pl={3} pb={3} >
                            <Box d="flex">
                                <Text as="h3"  fontWeight="600" cursor="pointer">{comment?.creator?.username}</Text>
                                <Box pl={2} pt={1}><Text as="h2" color={mode==="light" ? "#595B5D": "rgb(255,255,255,0.50)"} fontSize="0.75rem">{format(comment?.createdAt)}</Text></Box>
                            </Box>
                          
                            <Text w="100%" pt={1} as="h2" color={mode === "light" ? "#1C1F20" : "rgb(255,255,255,0.9)"} fontSize="1rem">{comment?.content} </Text>
                            <Box d="flex" pt={1}> 
                                <Box  d="flex" >
                                     <Box pt={0.5} cursor="pointer" onClick={onLike} color={CommentLikeAction === 'liked' ? "#FB5B78" : ""}>
                                         {CommentLikeAction === 'liked' ? <AiFillLike size="1rem" /> : <AiOutlineLike size="1rem" />}
                                     </Box>
                                     <Text pl={1.5} as="p"  fontSize="0.85rem" color={mode === "light" ? "#1C1F20" : "rgb(255,255,255,0.89)"}>{CommentLikes}</Text>
                                </Box>
                                     <Box  d="flex" pl={5}>
                                        <Box pt={1} cursor="pointer" onClick={onDisLike} color={CommentDislikeAction === 'disliked' ? "#FB5B78" : ""}>
                                            {CommentDislikeAction === 'disliked' ? <AiFillDislike size="1rem" /> : <AiOutlineDislike size="1rem" />}
                                         </Box>
                                        <Text pl={1.5} as="p"  fontSize="0.85rem" color={mode === "light" ? "#1C1F20" : "rgb(255,255,255,0.89)"}>{CommentDislikes}</Text>
                                    </Box>
                                </Box>
                                                            
                                            
                                        
                          </Box>

    </>
  )
}

export default CommentComponent