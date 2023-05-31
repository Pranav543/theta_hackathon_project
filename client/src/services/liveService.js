import axios from "axios"

const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/live`
const key = localStorage.getItem("auth-token")

let reqInstance = axios.create({
    headers: {
      Authorization : `Bearer ${key}`
      }
    }
  )
 
  
  // get all lives

  export function getLives(skip,limit) {
    return reqInstance.get(apiUrl + `/all/${skip}/${limit}`)
}

  // get homepage lives

  export function getHomePageLives(number) {
    return reqInstance.get(apiUrl + `/home/lives/${number}`)
}


  // get user live

  export function getUserLives(id) {
    return reqInstance.get(apiUrl + `/user/${id}`)
}

export function getUserProfileLives(id) {
  return reqInstance.get(apiUrl + `/profile/user/${id}`)
}


  // get all user saved lives

  export function getSavedUserLives(id) {
    return reqInstance.get(apiUrl + `/user/saved/${id}`)
}


  // get all user public saved lives

  export function getPublicSavedUserLives(id) {
    return reqInstance.get(apiUrl + `/user/saved/public/${id}`)
}

// create new live

export function startNewLive(data) {
  return reqInstance.post(apiUrl + `/new`,data)
}


// get specific live
export function getLive(id) {
  return reqInstance.get(apiUrl + `/${id}`)
}

// get saved live

export function getSavedLive(id) {
  return reqInstance.get(apiUrl + `/saved/${id}`)
}


// get all saved lives

export function getAllSavedLives() {
  return reqInstance.get(apiUrl + `/sessions/all`)
}

// edit live stream

export function EdiLiveStream(id,data) {
  return reqInstance.put(apiUrl + `/${id}`,data)
}

export function EditSavedLiveStream(id,data) {
  return reqInstance.put(apiUrl + `/saved/${id}`,data)
}

// create new chat message (live stream)

export function AddMessage(data) {
  return reqInstance.post(apiUrl + `/chat`,data)
}



// get all chat messages (live stream)

export function getChatMessages(id) {
  return reqInstance.get(apiUrl + `/chat/${id}`)
}

// get all chat messages (Saved live stream)

export function getSavedChatMessages(id) {
  return reqInstance.get(apiUrl + `/chat/saved/${id}`)
}