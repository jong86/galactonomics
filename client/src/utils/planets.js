import imgPlanet0 from 'assets/images/planet0.png'
import imgPlanet1 from 'assets/images/planet1.png'
import imgPlanet2 from 'assets/images/planet2.png'
import imgPlanet3 from 'assets/images/planet3.png'
import imgPlanet4 from 'assets/images/planet4.png'
import imgPlanet5 from 'assets/images/planet5.png'
import imgPlanet6 from 'assets/images/planet6.png'

import imgTemple from 'assets/images/temple.png'

import songPlanet0 from 'assets/songs/planet0.wav'
import songPlanet1 from 'assets/songs/planet1.wav'
import songPlanet2 from 'assets/songs/planet2.wav'
import songPlanet3 from 'assets/songs/planet3.wav'
import songPlanet4 from 'assets/songs/planet4.wav'
import songPlanet5 from 'assets/songs/planet5.wav'
import songPlanet6 from 'assets/songs/planet6.wav'

export default [
  // Coordinates are intended to be 0-100% of window dimension
  { id: 0, name: "Mondopia", img: imgPlanet0, x: 70, y: 70, song: songPlanet0 },
  { id: 1, name: "Zyrgon",   img: imgPlanet1, x: 32, y: 42, song: songPlanet1 },
  { id: 2, name: "Ribos",    img: imgPlanet2, x: 8,  y: 3,  song: songPlanet2 },
  { id: 3, name: "Mustafar", img: imgPlanet3, x: 53, y: 16, song: songPlanet3 },
  { id: 4, name: "Arrakis",  img: imgPlanet4, x: 82, y: 29, song: songPlanet4 },
  { id: 5, name: "Kronos",   img: imgPlanet5, x: 94, y: 57, song: songPlanet5 },
  { id: 6, name: "4546B",    img: imgPlanet6, x: 18, y: 78, song: songPlanet6 },
  { id: 255, name: "Temple of Nakamoto", img: imgTemple, x: 29, y: 12 },
]