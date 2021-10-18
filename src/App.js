import React from "react"
import Navigation from "./components/Navigation/Navigation.js"
import FaceRecognition from "./components/FaceRecognition/FaceRecognition"
import Logo from "./components/Logo/Logo.js"
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.js"
import Rank from "./components/Rank/Rank"
import "./App.css"
import Particles from "react-tsparticles"
import Signin from "./components/Signin/Signin"
import Register from "./components/Register/Register"

// const app = new Clarifai.App({
//   apiKey: "9b63d7b1a1654d2e973684b2d7717f67",
// })

const particlesOptions = {
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: {
        value: "#ffffff",
      },
      distance: 150,
      enable: true,
      warp: true,
    },
    move: {
      attract: {
        rotate: {
          x: 600,
          y: 1200,
        },
      },
      enable: true,
      outModes: {
        bottom: "out",
        left: "out",
        right: "out",
        top: "out",
      },
      speed: 6,
      warp: true,
    },
    number: {
      density: {
        enable: true,
      },
      value: 80,
    },
    opacity: {
      value: 0.5,
      animation: {
        speed: 3,
        minimumValue: 0.1,
      },
    },
  },
}
const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signin",
  // state to keep track of where we are on the page
  // when app initially loads and constructor gets run route will be signin
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
}

class App extends React.Component {
  constructor() {
    super()
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    })
  }

  // componentDidMount() {
  //   fetch("http://localhost:3000/")
  //     .then((response) => response.json())
  //     .then(console.log)
  //   above is same thing as .then(data => console.log(data))
  // }

  // we want to call this based on inputs we get from clarifai. Call this function from response we get from API
  calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById("inputimage")
    const width = Number(image.width)
    const height = Number(image.height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box })
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value })
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input })
    fetch("https://enigmatic-caverns-09719.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.input,
      }),
    })
      .then((response) => response.json())
      // app.models
      //   .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then((response) => {
        if (response) {
          fetch("https://enigmatic-caverns-09719.herokuapp.com/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch((err) => console.log(err))
  }

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState(initialState)
    } else if (route === "home") {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route })
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {/* if route is home then render home screen otherwise */}
        {route === "home" ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            {/* You have to write this. above because onInputChange is a property of the 'App' */}
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : /* if it is signin route then return signin form otherwise return register form */
        route === "signin" ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    )
  }
}

export default App
