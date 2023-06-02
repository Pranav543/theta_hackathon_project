import React from 'react'
import { Box, Center, Text,FormControl,Select,Tabs, TabList, TabPanels, Tab, TabPanel, Spinner, useColorMode} from "@chakra-ui/react"
import {BiCheckCircle} from 'react-icons/bi'
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, YAxis } from 'recharts';
import {getUserVideos} from '../../../services/videoService'
import {getUser} from '../../../services/usersService'
import { useMetaMask } from "../../../hooks/useMetamask"
import { GetAllUserAnalytics, GetMonthlyUserAnalytics, GetNinetyDaysUserAnalytics, GetWeeklyUserAnalytics, GetYearlyUserAnalytics } from '../../../services/analyticService';



function Analytics() {
  const { currentAccount } = useMetaMask();

  const [userData, setUserData] = React.useState([])
  const [latestvideo, setLatestvideo] = React.useState({})
  const [isLoading,setIsLoading] = React.useState(false)
  const [watchtime,setWatchtime] = React.useState(0)
  const [viewData,setViewData] = React.useState([])
  const [watchtimeData,setWatchtimeData] = React.useState([])
  const [views,setViews] = React.useState(0)
  const [earnings,setEarnings] = React.useState(0)
  const [followers,setFollowers] = React.useState(0)
  const user = currentAccount.toLowerCase()
  const {colorMode} = useColorMode()
  const [period,setPeriod] = React.useState("Last 7 days")

  document.title = `Analytics`
 


  const getPrevMonthName = d => {
    const prevMonth = new Date(d); prevMonth.setMonth(prevMonth.getMonth()-1);
    return new Intl.DateTimeFormat("en-GB",{month: "long"}).format(prevMonth)
  };

  const getPrevMonthName2 = d => {
    const prevMonth = new Date(d); prevMonth.setMonth(prevMonth.getMonth()-2);
    return new Intl.DateTimeFormat("en-GB",{month: "long"}).format(prevMonth)
  };

  const data3 = [

    {
      name: getPrevMonthName2(new Date()),
      followers: 0,
    
    },
    {
      name: getPrevMonthName(new Date()),
      followers: 0,
    
    },
    {
      name: new Date().toLocaleString('default', { month: 'long' }),
      followers: followers,
    
    },

  ];

  const whichPeriod = async(id) => {
    setEarnings(0)
    setViews(0)
    setWatchtime(0)
    try {
      if(period == 'Last 7 days') {
        const data = await GetWeeklyUserAnalytics(id)
        if(data?.data?.length > 0){
            let view = data?.data?.length;
            let viewdata = []
            let watchtimedata = []
            setViews(data?.data?.length)
            let watch = 0;
            data?.data?.map((watch) => {
              var current = new Date(watch.createdAt).toLocaleString('default', { month: 'long' });
              viewdata.push({name : `${current} ${new Date(watch.createdAt).getDate()}` , views : 1})
              watchtimedata.push({name : `${current} ${new Date(watch.createdAt).getDate()}` , hours : watch.watchtime / 3600})
              setWatchtime(hours => hours + (watch.watchtime / 3600))
              watch += watch.watchtime / 3600
            })
            

            const resultViews = Array.from(viewdata.reduce(
              (m, {name, views}) => m.set(name, (m.get(name) || 0) + views), new Map
            ), ([name, views]) => ({name, views}));

            const resultWatchtime = Array.from(watchtimedata.reduce(
              (m, {name, hours}) => m.set(name, (m.get(name) || 0) + hours), new Map
            ), ([name, hours]) => ({name, hours}));

          setViewData(resultViews)
          setWatchtimeData(resultWatchtime)

            setEarnings((5 * watch) + (view * 0.05))
        }
      }


      else if(period == 'Last 28 days') {
        const data = await GetMonthlyUserAnalytics(id)
        if(data?.data?.length > 0){
          let view = data?.data?.length;
          let viewdata = []
          let watchtimedata = []
          setViews(data?.data?.length)
          let watch = 0;
          data?.data?.map((watch) => {
            var current = new Date(watch.createdAt).toLocaleString('default', { month: 'long' });
            viewdata.push({name : `${current} ${new Date(watch.createdAt).getDate()}` , views : 1})
            watchtimedata.push({name : `${current} ${new Date(watch.createdAt).getDate()}` , hours : watch.watchtime / 3600})
            setWatchtime(hours => hours + (watch.watchtime / 3600))
            watch += watch.watchtime / 3600
          })
          

          const resultViews = Array.from(viewdata.reduce(
            (m, {name, views}) => m.set(name, (m.get(name) || 0) + views), new Map
          ), ([name, views]) => ({name, views}));

          const resultWatchtime = Array.from(watchtimedata.reduce(
            (m, {name, hours}) => m.set(name, (m.get(name) || 0) + hours), new Map
          ), ([name, hours]) => ({name, hours}));

        setViewData(resultViews)
        setWatchtimeData(resultWatchtime)

          setEarnings((5 * watch) + (view * 0.05))
      }
      }

      else if(period == 'Last 90 days') {
        const data = await GetNinetyDaysUserAnalytics(id)
        if(data?.data?.length > 0){
          let view = data?.data?.length;
          let viewdata = []
          let watchtimedata = []
          setViews(data?.data?.length)
          let watch = 0;
          data?.data?.map((watch) => {
            var current = new Date(watch.createdAt).toLocaleString('default', { month: 'long' });
            viewdata.push({name : current , views : 1})
            watchtimedata.push({name : current , hours : watch.watchtime / 3600})
            setWatchtime(hours => hours + (watch.watchtime / 3600))
            watch += watch.watchtime / 3600
          })
          

          const resultViews = Array.from(viewdata.reduce(
            (m, {name, views}) => m.set(name, (m.get(name) || 0) + views), new Map
          ), ([name, views]) => ({name, views}));

          const resultWatchtime = Array.from(watchtimedata.reduce(
            (m, {name, hours}) => m.set(name, (m.get(name) || 0) + hours), new Map
          ), ([name, hours]) => ({name, hours}));

          var prev = getPrevMonthName(new Date())
          var prev2 = getPrevMonthName2(new Date())
          if(resultViews.length < 2){
            resultViews.unshift({
              name : prev2,
              views : 0
            },{
              name : prev,
              views : 0
            })
            setViewData(resultViews)
          }else{
            setViewData(resultViews)
          }
        
        if(resultWatchtime.length < 2){
          resultWatchtime.unshift({
            name : prev2,
            hours : 0
          },{
            name : prev,
            hours : 0
          })
          setWatchtimeData(resultWatchtime)
        }else {
          setWatchtimeData(resultWatchtime)
        }
          setEarnings((5 * watch) + (view * 0.05))
      }
      }

      else if(period == 'Last 365 days') {
        const data = await GetYearlyUserAnalytics(id)
        if(data?.data?.length > 0){
          let view = data?.data?.length;
          let viewdata = []
          let watchtimedata = []
          setViews(data?.data?.length)
          let watch = 0;
          data?.data?.map((watch) => {
            var current = new Date(watch.createdAt).toLocaleString('default', { month: 'long' });
            viewdata.push({name : current , views : 1})
            watchtimedata.push({name : current , hours : watch.watchtime / 3600})
            setWatchtime(hours => hours + (watch.watchtime / 3600))
            watch += watch.watchtime / 3600
          })
          

          const resultViews = Array.from(viewdata.reduce(
            (m, {name, views}) => m.set(name, (m.get(name) || 0) + views), new Map
          ), ([name, views]) => ({name, views}));

          const resultWatchtime = Array.from(watchtimedata.reduce(
            (m, {name, hours}) => m.set(name, (m.get(name) || 0) + hours), new Map
          ), ([name, hours]) => ({name, hours}));

          setViewData(resultViews)
          setWatchtimeData(resultWatchtime)

          setEarnings((5 * watch) + (view * 0.05))
      }
      }
      else {
        const data = await GetAllUserAnalytics(id)
        if(data?.data?.length > 0){
          let view = data?.data?.length;
          let viewdata = []
          let watchtimedata = []
          setViews(data?.data?.length)
          let watch = 0;
          data?.data?.map((watch) => {
            var current = new Date(watch.createdAt).toLocaleString('default', { month: 'long' });
            viewdata.push({name : `${current}, ${new Date(watch.createdAt).getFullYear()}` , views : 1})
            watchtimedata.push({name : `${current}, ${new Date(watch.createdAt).getFullYear()}` , hours : watch.watchtime / 3600})
            setWatchtime(hours => hours + (watch.watchtime / 3600))
            watch += watch.watchtime / 3600
          })
          

          const resultViews = Array.from(viewdata.reduce(
            (m, {name, views}) => m.set(name, (m.get(name) || 0) + views), new Map
          ), ([name, views]) => ({name, views}));

          const resultWatchtime = Array.from(watchtimedata.reduce(
            (m, {name, hours}) => m.set(name, (m.get(name) || 0) + hours), new Map
          ), ([name, hours]) => ({name, hours}));

          setViewData(resultViews)
          setWatchtimeData(resultWatchtime)

          
      }
      setEarnings(userData?.rewards)
      }
      
    }catch(e) {
      console.log(e)
    }
    
  }



  const getAllData = async() => {
    try {
      setIsLoading(true)
    if(userData?.length > 0) {
      
      await whichPeriod(userData?._id)
    }
    else {

    const userdata = await getUser(user)
    await whichPeriod(userdata?.data?._id)
    setUserData(userdata?.data)
    setFollowers(userdata?.data?.followers?.length)
    const videos = await getUserVideos(userdata?.data?._id)
    if(videos.data.length > 1) {
      var lastvideo = videos?.data[0]
      setLatestvideo(lastvideo);
    }
    }
    }catch(e) {
      setIsLoading(false)
    }
    
    
    setIsLoading(false)
  }

  React.useEffect(() => {
    getAllData()
  },[period])




    

  return (
    <Box width="100%" position="relative" ml={["0%","0%","0%","12.2%","12.2%","12.2%"]} mt={["20%","15.5%","11%","10%","10%","8.2%"]} height="86%" bg={colorMode === 'light' ? "#F2F2F2" : "#111315"} fontFamily="heading" >
          <Center w="100%" h="100%">
            <Box width="95%" height="100%" >
                    <Box width="100%">
                        <Text width="100%" as="h1" fontSize={["1.6rem","1.7rem"]} color={colorMode === "light" ? "black" : "rgb(255,255,255,0.90)" } fontFamily="sans-serif" pt={[0,2]} pb={5}  fontWeight="bold">Channel analytics</Text>
                    </Box>
                    {isLoading ? <Center w="100%" h="70vh"><Spinner 
                                    thickness='4px'
                                    color='#3EA6FF'
                                    size='xl'
                                    ariaLabel='loading'
                                    speed='0.65s'
                                    emptyColor='grey'
                                /></Center> :
                    <Box bg={colorMode === "light" ? "#2D2D2E" :"#242627"} borderRadius="5px" height={window.screen.height * window.devicePixelRatio >= 1600 ? "85%" : "auto"}>
                      <Center w="100%" >
                        <Box d="flex" w="95%" borderBottom="1px solid rgb(255,255,255,0.2)" pt={1} pb={1} >
                          <Box w={["60%","60%","70%","70%"]} pt={2}>
                            <Text as="h3" w={["40%","28%","17%","16%","12%","10%"]} fontSize="1rem" pb={2} borderBottom="2px solid #3EA6FF" fontWeight="bold" color="#3EA6FF">Overview</Text>
                          </Box>
                          <Box w={["40%","40%","30%","30%"]} height="auto">
                            {colorMode === "dark" &&
                              <FormControl p="0 auto" >
                        
                                <Select bg="#242627" defaultValue={period} fontSize="0.95rem" fontFamily="sans-serif" size="lg" border="none" _focus={{border: 'none'}} color="white" cursor="pointer">
                                <option onClick={() => setPeriod('Last 7 days')} value='Last 7 days' style={{backgroundColor : '#111315'}}>&nbsp;Last 7 days</option>
                                  <option onClick={() => setPeriod('Last 28 days')} value='Last 28 days' style={{backgroundColor : '#111315'}}>&nbsp;Last 28 days</option>
                                  <option onClick={() => setPeriod('Last 90 days')} value='Last 90 days' style={{backgroundColor : '#111315'}}>&nbsp;Last 90 days</option>
                                  <option  onClick={() => setPeriod('Last 365 days')} value='Last 365 days' style={{backgroundColor : '#111315'}}>&nbsp;Last 365 days</option>
                                  <option onClick={() => setPeriod('Lifetime')} value='Lifetime' style={{backgroundColor : '#111315'}}>&nbsp;Lifetime</option>
                                 
                                </Select>
                            </FormControl>}


                            {colorMode === "light" &&
                              <FormControl p="0 auto" >
                        
                                <Select bg="#242627" defaultValue={period} fontSize="0.95rem" fontFamily="sans-serif" size="lg" border="none" _focus={{border: 'none'}} color="white" cursor="pointer">
                                <option onClick={() => setPeriod('Last 7 days')} value='Last 7 days' style={{backgroundColor: 'grey'}}>&nbsp;Last 7 days</option>
                                  <option onClick={() => setPeriod('Last 28 days')} value='Last 28 days' style={{backgroundColor: 'grey'}}>&nbsp;Last 28 days</option>
                                  <option onClick={() => setPeriod('Last 90 days')} value='Last 90 days' style={{backgroundColor: 'grey'}}>&nbsp;Last 90 days</option>
                                  <option onClick={() => setPeriod('Last 365 days')} value='Last 365 days' style={{backgroundColor: 'grey'}}>&nbsp;Last 365 days</option>
                                  <option onClick={() => setPeriod('Lifetime')} value='Lifetime' style={{backgroundColor: 'grey'}}>&nbsp;Lifetime</option>
                                 
                                </Select>
                            </FormControl>}
                          </Box>
                      </Box>
                      </Center>
                      
                          <Box w="100%" h="100%" d={["none","none","none","none","none","flex","flex"]} pt={5}>
                            <Box w="70%" height="100%">
                              <Center w="100%" height="auto" pt={2}>
                                <Box w="70%">
                                    <Text as="h2" fontSize="1.45rem" fontWeight="bold" color="white">
                                      {views > 0 ? `Your channel got ${views} views in the ${period.toLowerCase()}`:`Your channel didn’t get any views in the ${period.toLowerCase()}`}
                                      
                                      </Text>
                                </Box>
                              </Center>
                                <Tabs pt={7} ml={8} mr={8} >
                                  <TabList border="none" >
                                    <Tab _focus={{outline : 'none'}}  pt={10} pb={10} borderRadius="5px 0px 0px 0px" _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF', bg:"none"}} bg="#1F1F1F" border="1px solid rgb(255,255,255,0.2)" w="33%" >
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Views</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{views > 1 ? views : "0" }</Text>
                                      </Box>
                                   
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Watch time (hours)</Text>
                                          <Text as="p" fontWeight="bold" color="white">{watchtime.toFixed(2)}</Text>
                                      </Box>
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  borderRadius="0px 5px 0px 0px" pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Followers</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{followers < 1 ? "___" : <Box d="flex"> <Text>+ {userData?.followers.length}</Text> <Box pt={2} pl={3}><BiCheckCircle size="1.1rem" color="green" /></Box> </Box>}</Text>
                                      </Box>
                                    </Tab>
                                  </TabList>

                                  <TabPanels>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center" mt={window.screen.height * window.devicePixelRatio >= 1600 ? 20 : 5}>
                                      <AreaChart
                                        width={765}
                                        height={200}
                                        data={viewData}
                                       
                                      >
                                        <CartesianGrid strokeDasharray="1 3" />
                                        <XAxis dataKey="name" />
                                        
                                        <Tooltip />
                                        <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center"  mt={window.screen.height * window.devicePixelRatio >= 1600 ? 20 : 5}>
                                    <AreaChart
                                      width={765}
                                      height={200}
                                      data={watchtimeData}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      <Tooltip />
                                      <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center" mt={window.screen.height * window.devicePixelRatio >= 1600 ? 20 : 5}>
                                    <AreaChart
                                      width={765}
                                      height={200}
                                      data={data3}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      
                                      <Tooltip />
                                      <Area type="monotone" dataKey="followers" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                  </TabPanels>
                                </Tabs>

                              
                            </Box>

                            <Box w="30%" height="100%" >
                                <Box w="90%" bg="#1F1F1F" borderRadius="10px" mt={1.5}>
                                      <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.2rem" color="white">{followers}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Followers</Text>
                                       </Box>

                                       <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.2rem" color="white">{views}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Views · {period}</Text>
                                       </Box>
                                       <Box pl={5} pt={2} pb={2} >
                                          <Text fontWeight="bold" fontSize="1.2rem" color="green" >{earnings.toFixed(2)}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem" >$CRTC Earnings · {period}</Text>
                                       </Box>
                                </Box>
                                <Box w="90%" bg="#1F1F1F" borderRadius="10px" mt={window.screen.height * window.devicePixelRatio >= 1600 ? 20 : 5}>
                                  <Center>
                                    <Box width="100%" textAlign="left" pb={2}>
                                          <Text as="h3" pt={1} pl={5} color="white">Latest video</Text>
                                          <Box height={155} >
                                            <Center width="100%" pt={2}>
                                              <Box width="85%" d="flex" justifyContent="left" bg={!latestvideo?.thumbnail ? 'black' : ''} bgImage={`url(${latestvideo?.thumbnail})`} height={135} bgSize="cover">
                                                
                                                <Box flex="1 0 auto" alignSelf="flex-end" bg="rgb(0,0,0,0.4)" w="100%" pt={2} pb={2}>
                                                
                                                        <Text pl={1} fontSize="0.75rem" fontWeight="bold" color="white" noOfLines={2}> {latestvideo?.title} </Text>
                                                     
                                                  
                                                </Box>
                                                
                                              </Box>
                                              
                                            </Center>
                                            
                                          </Box>
                                          
                                    </Box>
                                  </Center>
                                </Box>
                            </Box>
                          </Box>



                          <Box w="100%" h="100%" d={["none","none","none","none","flex","none","none"]} pt={5}>
                            <Box w="70%" height="100%">
                              <Center w="100%" height="auto" pt={2}>
                                <Box w="70%">
                                    <Text as="h2" fontSize="1.45rem" fontWeight="bold" color="white">
                                      {views > 0 ? `Your channel got ${views} views in the ${period.toLowerCase()}`:'Your channel didn’t get any views in the last 7 days'}
                                      
                                      </Text>
                                </Box>
                              </Center>
                                <Tabs pt={7} ml={8} mr={8} >
                                  <TabList border="none" >
                                    <Tab _focus={{outline : 'none'}}  pt={10} pb={10} borderRadius="5px 0px 0px 0px" _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF', bg:"none"}} bg="#1F1F1F" border="1px solid rgb(255,255,255,0.2)" w="33%" >
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Views</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{views > 1 ? views : "0" }</Text>
                                      </Box>
                                   
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Watch time (hours)</Text>
                                          <Text as="p" fontWeight="bold" color="white">{watchtime.toFixed(2)}</Text>
                                      </Box>
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  borderRadius="0px 5px 0px 0px" pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Followers</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{followers < 1 ? "___" : <Box d="flex"> <Text>+ {userData?.followers.length}</Text> <Box pt={2} pl={3}><BiCheckCircle size="1.1rem" color="green" /></Box> </Box>}</Text>
                                      </Box>
                                    </Tab>
                                  </TabList>

                                  <TabPanels>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                      <AreaChart
                                        width={700}
                                        height={200}
                                        data={viewData}
                                       
                                      >
                                        <CartesianGrid strokeDasharray="1 3" />
                                        <XAxis dataKey="name" />
                                        
                                        <Tooltip />
                                        <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                    <AreaChart
                                      width={700}
                                      height={200}
                                      data={watchtimeData}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      <Tooltip />
                                      <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                    <AreaChart
                                      width={700}
                                      height={200}
                                      data={data3}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      
                                      <Tooltip />
                                      <Area type="monotone" dataKey="followers" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                  </TabPanels>
                                </Tabs>

                              
                            </Box>

                            <Box w="30%" height="100%" >
                                <Box w="90%" bg="#1F1F1F" borderRadius="10px" mt={1.5}>
                                      <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.2rem" color="white">{followers}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Followers</Text>
                                       </Box>

                                       <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.2rem" color="white">{views}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Views · {period}</Text>
                                       </Box>
                                       <Box pl={5} pt={2} pb={2} >
                                          <Text fontWeight="bold" fontSize="1.2rem" color="green" >{earnings.toFixed(2)}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem" >$CRTC Earnings · {period}</Text>
                                       </Box>
                                </Box>
                                <Box w="90%" bg="#1F1F1F" borderRadius="10px" mt={5}>
                                  <Center>
                                    <Box width="100%" textAlign="left" pb={2}>
                                          <Text as="h3" pt={1} pl={5} color="white">Latest video</Text>
                                          <Box height={155} >
                                            <Center width="100%" pt={2}>
                                              <Box width="85%" d="flex" justifyContent="left" bg={!latestvideo?.thumbnail ? 'black' : ''} bgImage={`url(${latestvideo?.thumbnail})`} height={135} bgSize="cover">
                                                
                                                <Box flex="1 0 auto" alignSelf="flex-end" bg="rgb(0,0,0,0.4)" w="100%" pt={2} pb={2}>
                                                
                                                        <Text pl={1} fontSize="0.75rem" fontWeight="bold" color="white" noOfLines={2}> {latestvideo?.title} </Text>
                                                     
                                                  
                                                </Box>
                                                
                                              </Box>
                                              
                                            </Center>
                                            
                                          </Box>
                                          
                                    </Box>
                                  </Center>
                                </Box>
                            </Box>
                          </Box>



                          <Box w="100%" h="100%" d={["none","none","none","flex","none","none","none"]} pt={5}>
                            <Box w="70%" height="100%">
                              <Center w="100%" height="auto" pt={2}>
                                <Box w="70%">
                                    <Text as="h2" fontSize="1.45rem" fontWeight="bold" color="white">
                                      {views > 0 ? `Your channel got ${views} views in the ${period.toLowerCase()}`:'Your channel didn’t get any views in the last 7 days'}
                                      
                                      </Text>
                                </Box>
                              </Center>
                                <Tabs pt={7} ml={8} mr={8} >
                                  <TabList border="none" >
                                    <Tab _focus={{outline : 'none'}}  pt={10} pb={10} borderRadius="5px 0px 0px 0px" _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF', bg:"none"}} bg="#1F1F1F" border="1px solid rgb(255,255,255,0.2)" w="33%" >
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Views</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{views > 1 ? views : "0" }</Text>
                                      </Box>
                                   
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Watch time (hours)</Text>
                                          <Text as="p" fontWeight="bold" color="white">{watchtime.toFixed(2)}</Text>
                                      </Box>
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  borderRadius="0px 5px 0px 0px" pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Followers</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{followers < 1 ? "___" : <Box d="flex"> <Text>+ {userData?.followers.length}</Text> <Box pt={2} pl={3}><BiCheckCircle size="1.1rem" color="green" /></Box> </Box>}</Text>
                                      </Box>
                                    </Tab>
                                  </TabList>

                                  <TabPanels>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                      <AreaChart
                                        width={550}
                                        height={200}
                                        data={viewData}
                                       
                                      >
                                        <CartesianGrid strokeDasharray="1 3" />
                                        <XAxis dataKey="name" />
                                        
                                        <Tooltip />
                                        <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                    <AreaChart
                                      width={550}
                                      height={200}
                                      data={watchtimeData}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      <Tooltip />
                                      <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                    <AreaChart
                                      width={550}
                                      height={200}
                                      data={data3}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      
                                      <Tooltip />
                                      <Area type="monotone" dataKey="followers" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                  </TabPanels>
                                </Tabs>

                              
                            </Box>

                            <Box w="30%" height="100%" >
                                <Box w="90%" bg="#1F1F1F" borderRadius="10px" mt={1.5}>
                                      <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.2rem" color="white">{followers}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Followers</Text>
                                       </Box>

                                       <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.2rem" color="white">{views}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Views · {period}</Text>
                                       </Box>
                                       <Box pl={5} pt={2} pb={2} >
                                          <Text fontWeight="bold" fontSize="1.2rem" color="green" >{earnings.toFixed(2)}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem" >$CRTC Earnings · {period}</Text>
                                       </Box>
                                </Box>
                                <Box w="90%" bg="#1F1F1F" borderRadius="10px" mt={5}>
                                  <Center>
                                    <Box width="100%" textAlign="left" pb={2}>
                                          <Text as="h3" pt={1} pl={5} color="white">Latest video</Text>
                                          <Box height={155} >
                                            <Center width="100%" pt={2}>
                                              <Box width="85%" d="flex" justifyContent="left" bg={!latestvideo?.thumbnail ? 'black' : ''} bgImage={`url(${latestvideo?.thumbnail})`} height={135} bgSize="cover">
                                                
                                                <Box flex="1 0 auto" alignSelf="flex-end" bg="rgb(0,0,0,0.4)" w="100%" pt={2} pb={2}>
                                                
                                                        <Text pl={1} fontSize="0.75rem" fontWeight="bold" color="white" noOfLines={2}> {latestvideo?.title} </Text>
                                                     
                                                  
                                                </Box>
                                                
                                              </Box>
                                              
                                            </Center>
                                            
                                          </Box>
                                          
                                    </Box>
                                  </Center>
                                </Box>
                            </Box>
                          </Box>


                          <Box w="100%" h="100%" d={["none","none","flex","none","none","none","none"]} pt={5}>
                            <Box w="70%" height="100%">
                              <Center w="100%" height="auto" pt={2}>
                                <Box w="70%">
                                    <Text as="h2" fontSize="1.45rem" fontWeight="bold" color="white">
                                      {views > 0 ? `Your channel got ${views} views in the ${period.toLowerCase()}`:'Your channel didn’t get any views in the last 7 days'}
                                      
                                      </Text>
                                </Box>
                              </Center>
                                <Tabs pt={7} ml={8} mr={8} >
                                  <TabList border="none" >
                                    <Tab _focus={{outline : 'none'}}  pt={10} pb={10} borderRadius="5px 0px 0px 0px" _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF', bg:"none"}} bg="#1F1F1F" border="1px solid rgb(255,255,255,0.2)" w="33%" >
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Views</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{views > 1 ? views : "0" }</Text>
                                      </Box>
                                   
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Watch time (hours)</Text>
                                          <Text as="p" fontWeight="bold" color="white">{watchtime.toFixed(2)}</Text>
                                      </Box>
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  borderRadius="0px 5px 0px 0px" pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Followers</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{followers < 1 ? "___" : <Box d="flex"> <Text>+ {userData?.followers.length}</Text> <Box pt={2} pl={3}><BiCheckCircle size="1.1rem" color="green" /></Box> </Box>}</Text>
                                      </Box>
                                    </Tab>
                                  </TabList>

                                  <TabPanels>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                      <AreaChart
                                        width={500}
                                        height={200}
                                        data={viewData}
                                       
                                      >
                                        <CartesianGrid strokeDasharray="1 3" />
                                        <XAxis dataKey="name" />
                                        
                                        <Tooltip />
                                        <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box >
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                    <AreaChart
                                      width={500}
                                      height={200}
                                      data={watchtimeData}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      <Tooltip />
                                      <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                    <AreaChart
                                      width={500}
                                      height={200}
                                      data={data3}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      
                                      <Tooltip />
                                      <Area type="monotone" dataKey="followers" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                  </TabPanels>
                                </Tabs>

                              
                            </Box>

                            <Box w="30%" height="100%" >
                                <Box w="90%" bg="#1F1F1F" borderRadius="10px" mt={1.5}>
                                      <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.2rem" color="white">{followers}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Followers</Text>
                                       </Box>

                                       <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.2rem" color="white">{views}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Views · {period}</Text>
                                       </Box>
                                       <Box pl={5} pt={2} pb={2} >
                                          <Text fontWeight="bold" fontSize="1.2rem" color="green" >{earnings.toFixed(2)}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem" >$CRTC Earnings · {period}</Text>
                                       </Box>
                                </Box>
                                <Box w="90%" bg="#1F1F1F" borderRadius="10px" mt={5}>
                                  <Center>
                                    <Box width="100%" textAlign="left" pb={2}>
                                          <Text as="h3" pt={1} pl={5} color="white">Latest video</Text>
                                          <Box height={155} >
                                            <Center width="100%" pt={2}>
                                              <Box width="85%" d="flex" justifyContent="left" bg={!latestvideo?.thumbnail ? 'black' : ''} bgImage={`url(${latestvideo?.thumbnail})`} height={135} bgSize="cover">
                                                
                                                <Box flex="1 0 auto" alignSelf="flex-end" bg="rgb(0,0,0,0.4)" w="100%" pt={2} pb={2}>
                                                
                                                        <Text pl={1} fontSize="0.75rem" fontWeight="bold" color="white" noOfLines={2}> {latestvideo?.title} </Text>
                                                     
                                                  
                                                </Box>
                                                
                                              </Box>
                                              
                                            </Center>
                                            
                                          </Box>
                                          
                                    </Box>
                                  </Center>
                                </Box>
                            </Box>
                          </Box>



                          <Box w="100%" h="100%" d={["grid","grid","none","none","none","none","none"]} gridTemplateColumns="4fr" pt={5}>
                            <Box w="100%" height="100%">
                              <Center w="100%" height="auto" pt={2}>
                                <Box w="70%">
                                    <Text as="h2" fontSize="1.2rem" fontWeight="bold" color="white">
                                      {views > 0 ? `Your channel got ${views} views in the ${period.toLowerCase()}`:'Your channel didn’t get any views in the last 7 days'}
                                      
                                      </Text>
                                </Box>
                              </Center>
                                <Tabs pt={7} justifyContent="center" alignItems="center" >
                                  <TabList border="none" >
                                    <Tab _focus={{outline : 'none'}}  pt={10} pb={10} borderRadius="5px 0px 0px 0px" _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF', bg:"none"}} bg="#1F1F1F" border="1px solid rgb(255,255,255,0.2)" w="33%" >
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Views</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{views > 1 ? views : "0" }</Text>
                                      </Box>
                                   
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Watch time (hours)</Text>
                                          <Text as="p" fontWeight="bold" color="white">{watchtime.toFixed(2)}</Text>
                                      </Box>
                                    </Tab>
                                    <Tab  _focus={{outline : 'none'}}  borderRadius="0px 5px 0px 0px" pt={10} pb={10} _selected={{borderBottom: 'none',borderTop: '3px solid #3EA6FF' , bg: 'none'}} w="33%" border="1px solid rgb(255,255,255,0.2)" bg="#1F1F1F">
                                      <Box>
                                           <Text as="h4" color="rgb(255,255,255,0.5)" fontSize="0.85rem">Followers</Text>
                                          <Text as="p" fontWeight="bold" fontSize="1.2rem" color="white">{followers < 1 ? "___" : <Box d="flex"> <Text>+ {userData?.followers.length}</Text> <Box pt={2} pl={3}><BiCheckCircle size="1.1rem" color="green" /></Box> </Box>}</Text>
                                      </Box>
                                    </Tab>
                                  </TabList>

                                  <TabPanels>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                      <AreaChart
                                        width={350}
                                        height={200}
                                        data={viewData}
                                       
                                      >
                                        <CartesianGrid strokeDasharray="1 3" />
                                        <XAxis dataKey="name" />
                                        
                                        <Tooltip />
                                        <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box >
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                    <AreaChart
                                      width={350}
                                      height={200}
                                      data={watchtimeData}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      <Tooltip />
                                      <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                    <TabPanel>
                                    <Box d="flex" alignItems="center" justifyContent="center">
                                    <AreaChart
                                      width={350}
                                      height={200}
                                      data={data3}
                                      
                                    >
                                      <CartesianGrid strokeDasharray="1 3" />
                                      <XAxis dataKey="name" />
                                      
                                      <Tooltip />
                                      <Area type="monotone" dataKey="followers" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                  </Box>
                                    </TabPanel>
                                  </TabPanels>
                                </Tabs>

                              
                            </Box>

                              <Center w="100%" pb={5}>
                              <Box w="90%" height="100%" d="flex" columnGap={[1,5,5,5]}>
                                <Box w="50%" bg="#1F1F1F" borderRadius="10px" >
                                      <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.1rem" color="white">{followers}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Followers</Text>
                                       </Box>

                                       <Box pl={5} pt={2} pb={2} borderBottom="1px solid rgb(255,255,255,0.05)">
                                          <Text fontWeight="bold" fontSize="1.1rem" color="white">{views}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem">Views · {period}</Text>
                                       </Box>
                                       <Box pl={5} pt={2} pb={2} >
                                          <Text fontWeight="bold" fontSize="1.1rem" color="green" >{earnings.toFixed(2)}</Text>
                                          <Text color="rgb(255,255,255,0.5)" fontSize="0.8rem" >$CRTC Earnings · {period}</Text>
                                       </Box>
                                </Box>
                                <Box w="50%" bg="#1F1F1F" borderRadius="10px" >
                                  <Center>
                                    <Box width="100%" textAlign="left" pb={2}>
                                          <Text as="h3" pt={1} pl={5} color="white">Latest video</Text>
                                          <Box height={155} >
                                            <Center width="100%" pt={2}>
                                              <Box width="85%" d="flex" justifyContent="left" bg={!latestvideo?.thumbnail ? 'black' : ''} bgImage={`url(${latestvideo?.thumbnail})`} height={135} bgSize="cover">
                                                
                                                <Box flex="1 0 auto" alignSelf="flex-end" bg="rgb(0,0,0,0.4)" w="100%" pt={2} pb={2}>
                                                
                                                        <Text pl={1} fontSize="0.75rem" fontWeight="bold" color="white" noOfLines={2}> {latestvideo?.title} </Text>
                                                     
                                                  
                                                </Box>
                                                
                                              </Box>
                                              
                                            </Center>
                                            
                                          </Box>
                                          
                                    </Box>
                                  </Center>
                                </Box>
                            </Box>
                              </Center>
                              
                          </Box>

                          
                    </Box>
                      }
                

                
                    
            </Box>
            </Center>
    </Box>
  )
}

export default Analytics