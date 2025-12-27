import * as THREE from 'three';
import { getAddressPosition } from './ManhattanGrid';

// Building Footprint Data (Simplified GIS style)
// Height is relative to block size

export const landmarkData = [
  // --- Central Park South (59th St) ---
  {
    name: "The Plaza Hotel",
    address: { st: 59, ave: 5 },
    height: 8,
    color: "#d6336c", // Pink/Red accent
    shape: "u-shape"
  },
  {
    name: "Central Park Tower",
    address: { st: 57, ave: 7 }, // Slightly south
    height: 45, // Supertall
    color: "#e64980",
    shape: "square"
  },
  {
    name: "Steinway Tower (111 W 57th)",
    address: { st: 57, ave: 6 },
    height: 40, // Supertall thin
    color: "#e64980",
    shape: "thin"
  },

  // --- Fifth Avenue (Museum Mile) ---
  {
    name: "The Met Museum",
    address: { st: 82, ave: 5 },
    height: 4,
    color: "#c2255c",
    shape: "complex-met" // Custom geometry needed
  },
  {
    name: "Guggenheim",
    address: { st: 88, ave: 5 },
    height: 3,
    color: "#f783ac",
    shape: "spiral"
  },

  // --- Central Park West ---
  {
    name: "The Dakota",
    address: { st: 72, ave: 8 },
    height: 5,
    color: "#a61e4d",
    shape: "courtyard"
  },
  {
    name: "The San Remo",
    address: { st: 74, ave: 8 },
    height: 12,
    color: "#a61e4d",
    shape: "twin-towers"
  },
  {
    name: "Museum of Natural History",
    address: { st: 79, ave: 8 },
    height: 5,
    color: "#c2255c",
    shape: "complex-museum"
  }
];
