import axios from "axios"

const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/users`
const key = localStorage.getItem("auth-token")

let reqInstance = axios.create({
    headers: {
      Authorization : `Bearer ${key}`
      }
    }
  )

// Get all users
export function getUsers() {
    return reqInstance.get(apiUrl)
    
}


// Get limited users (10)

export function getLimitedUsers() {
    return reqInstance.get(apiUrl + "/limited/all")
    
}



// Get all verified users
export function getVerifiedUsers() {
    return reqInstance.get(apiUrl + "/verified/all")
    
}

// Get all online users
export function getOnlineUsers() {
    return reqInstance.get(apiUrl + "/online/all")
    
}



// Get  user profile
export function getUserProfile(id) {
    return reqInstance.get(apiUrl + `/profile/${id}`)
    
}


// Get specific user

export function getUser(id) {
    return reqInstance.get(apiUrl + `/${id}`)
}

// Add new user

export function addUser(data) {
    return reqInstance.post(apiUrl + "/add", data)
}

// edit Specific user

export function editUser(id,data) {
    return reqInstance.put(apiUrl + `/${id}/edit`, data)
}

// Follow user

export function followUser(id, data) {
    return reqInstance.put(apiUrl + `/follow/${id}`, data)
}

// Unfollow user

export function unFollowUser(id, data) {
    return reqInstance.put(apiUrl + `/unfollow/${id}`, data)
}
