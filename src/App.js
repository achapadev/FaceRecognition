import React from "react"
import Navigation from "./components/Navigation/Navigation.js"
import Clarifai from "clarifai"
import FaceRecognition from "./components/FaceRecognition/FaceRecognition"
import Logo from "./components/Logo/Logo.js"
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.js"
import Rank from "./components/Rank/Rank"
import "./App.css"
import Particles from "react-tsparticles"
import Signin from "./components/Signin/Signin"
import Register from "./components/Register/Register"

const app = new Clarifai.App({
  apiKey: "dc7c3b7ef8684391bcd249af0c897a49",
})

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

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route: "signin",
      isSignedIn: false,
    }
  }

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
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then((response) =>
        this.displayFaceBox(this.calculateFaceLocation(response))
      )
      .catch((err) => console.log(err))
  }

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState({ isSignedIn: false })
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
        {route === "home" ? (
          <div>
            <Logo />
            <Rank />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            {/* You have to write this. above because onInputChange is a property of the 'App' */}
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === "signin" ? (
          <Signin onRouteChange={this.onRouteChange} />
        ) : (
          <Register onRouteChange={this.onRouteChange} />
        )}
      </div>
    )
  }
}

export default App
