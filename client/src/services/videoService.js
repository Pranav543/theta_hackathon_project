import axios from "axios"

const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/video`
const key = localStorage.getItem("auth-token")

let reqInstanceUpload = axios.create({
    headers: {
      Authorization : `Bearer ${key}`,
      'Content-Type': 'multipart/form-data; boundary=XXX'
      
      }
    }
  )

  let reqInstance = axios.create({
    headers: {
      Authorization : `Bearer ${key}`
      }
    }
  )

// Upload new videoFile

  export function uploadVideoFile(data) {
    return reqInstanceUpload.post(apiUrl +"/upload", data)
    
}


// Upload new video

export function uploadVideo(data) {
    return reqInstance.post(apiUrl +"/", data)
    
}


// Get video details

export function getVideo(video,userId) {
    return reqInstance.get(apiUrl +`/${video}/user/${userId}`)
    
}


// Get user videos

export function getUserVideos(userId) {
  return reqInstance.get(apiUrl +`/user/${userId}`)
  
}


// Get all videos

export function getVideos(skip,limit) {
  return reqInstance.get(apiUrl +`/all/${skip}/${limit}`)
  
}

// get homePage videos

export function getHomePageVideos(number) {
  return reqInstance.get(apiUrl +`/home/videos/${number}`)
  
}


// Edit specific video

export function editVideo(id,data) {
  return reqInstance.put(apiUrl + `/edit/${id}`, data)
}