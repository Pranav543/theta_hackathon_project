import { Box, Button, Center, Text, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { RiArrowLeftCircleLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import astronaut from "../../../assets/astronaut.jpg"
import universe from "../../../assets/universe.png"


function Error() {
    const {colorMode} = useColorMode()
    return (
        <Box width="100%" position="relative" ml={["0%","0%","0%","12.2%","12.2%","12.2%"]} mt={["20%","14.5%","10%","10%","10%","8.2%"]} height="86%" bg={colorMode === 'light' ? "#F2F2F2" : "#111315"} fontFamily="heading" >
            <Center w="100%" h="100%">
            <Box width="95%" height="100%" >
                    <Center mt={2} w="100%" h="90%" bgImage={`url('${universe}')`} bgRepeat="no-repeat" bgSize="cover" bgPosition="center" borderRadius="10px">
                        <Box textAlign="center" w="100%" h="100%" bgImage={`url('${astronaut}')`} bgRepeat="no-repeat" bgSize="contain" bgPosition="center">
                            <Text color="white" fontSize="3rem" fontWeight="bold" pt={5}>ERROR</Text>
                            <Text fontSize="17rem" fontWeight="bold" color="white">4&nbsp;&nbsp;4</Text>
                            <Link to="/"><Button fontSize="1.1rem" borderRadius="50px" p={6} leftIcon={<RiArrowLeftCircleLine size="1.2rem"/>}>Back to home</Button></Link>
                        </Box>
                        
                    </Center>
      
  
                </Box>
            </Center>
        </Box>
    )
}

export default Error