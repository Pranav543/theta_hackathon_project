import axios from "axios"

const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/nft`
const key = localStorage.getItem("auth-token")

let reqInstance = axios.create({
    headers: {
      Authorization : `Bearer ${key}`
      }
    }
  )

// create new nft
export function createNFT(data) {
    return reqInstance.post(apiUrl + "/add", data )
}

// Get all user owned Nfts
export function getAllUserOwnedNfts(userId) {
    return reqInstance.get(apiUrl + `/all/${userId}`)
}

// Get all user created Nfts
export function getAllUserCreatedNfts(userId) {
    return reqInstance.get(apiUrl + `/user/${userId}`)
}

// Edit Nft
export function editNft(contract,data) {
    return reqInstance.put(apiUrl + `/edit/${contract}`, data)
}