import axios from "axios"

const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/analytics`
const key = localStorage.getItem("auth-token")

let reqInstance = axios.create({
    headers: {
      Authorization : `Bearer ${key}`
      }
    }
  )


  // create new doc

export function CreateDocAnalytics(data) {
    return reqInstance.post(apiUrl + "/add",data)
    
}


// Get user videoCreator lifetime analytics

export function GetAllUserAnalytics(data) {
  return reqInstance.get(apiUrl + "/all/" + data)
  
}



// Get user videoCreator weekly analytics

export function GetWeeklyUserAnalytics(data) {
  return reqInstance.get(apiUrl + "/week/" + data)
  
}


// Get user videoCreator 28 days analytics

export function GetMonthlyUserAnalytics(data) {
  return reqInstance.get(apiUrl + "/twentyeight/" + data)
  
}


// Get user videoCreator 90 days analytics

export function GetNinetyDaysUserAnalytics(data) {
  return reqInstance.get(apiUrl + "/threemonth/" + data)
  
}


// Get user videoCreator 365 days analytics

export function GetYearlyUserAnalytics(data) {
  return reqInstance.get(apiUrl + "/year/" + data)
  
}
