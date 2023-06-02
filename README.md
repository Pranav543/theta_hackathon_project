<p align="center">
  <a href="" rel="noopener">
 <img src="https://i.imgur.com/AZ2iWek.png" alt="Project logo"></a>
</p>
<h3 align="center">Cratch | The Future of Content Creation</h3>



## 🧐 Inspiration <a name = "inspiration"></a>

All of us use YouTube or Twitch from time to time, and all we can agree that the amount of ads in these platforms are a lot, without mentioning the data these platforms collect everyday from its users to benefit only one side, so we decided to create a solution that favors all parties included in the video sharing/ live streaming platform and make sure it's decentralised and fun to use.

## 💡 What it does <a name = "idea"></a>

Imagine that there is a platform where you can watch your favourite streamer, interact and communicate directly with him/her and getting paid along the way, not just that but also experiencing live & video streams in the Metaverse. Well that's exactly what Cratch is for, making sure both content creators and viewers benefit from the platform, and therefore we are building a virtuous ecosystem that includes :

An online video sharing, live streaming and social media platform
Metaverse world for content creation & live interaction with the community
Mobile app to watch content on the run
NFTS for in game assets & Videos

## ⛓️ How we built it <a name = "limitations"></a>

At the first stage, we decided which features we want to implement first, and where to start. Starting from that point, it was not hard to decide which technologies to use. On the backend side we used **Node**, **Express** and **MongoDB** and for storing data we used **Web3.storage**. For smart contract interaction we used web3 and Metamask and we built the frontend using **React** and **Chakra UI** as a UI library.

To enable live streaming and streaming of other video content, we integrated the **Theta Video API** into our system. This API provided the necessary functionality for creating live streams and streaming various types of video content. And the platform uses Theta Testnet as its blockchain network.

## 🚀 Future Scope <a name = "future_scope"></a>

Write about what you could not develop during the course of the Hackathon; and about what your project can achieve
in the future.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development
and testing purposes.

### Prerequisites

Make sure you also have Mongo Atlas Project created and running. Add the required keys in .env file


### Installing

A step by step series of examples that tell you how to get a development env running.

1. Cloning the repo

```
git clone https://github.com/Pranav543/theta_hackathon_project.git
```

2. Installing Dependencies

```
cd theta_hackathon_project
```

```
yarn install
```

```
cd client && yarn install
```

3. start redis server

```
redis-server
```

4. Start Express Server

```
cd ..
```

```
yarn start
```

5. Start React Server

```
cd client
```

```
yarn start
```

## ⛏️ Built With <a name = "tech_stack"></a>

- [MongoDB](https://www.mongodb.com/) - Database
- [Express](https://expressjs.com/) - Server Framework
- [ReactJs](https://reactjs.org/) - Web Framework
- [NodeJs](https://nodejs.org/en/) - Server Environment
- [Theta Video Api](https://www.thetavideoapi.com/) - Live Streaming / Video Streaming


