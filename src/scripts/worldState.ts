import { WorldState } from '../types/WorldState';

// This initializes an instance of the world state. We want this to be a Singleton.
const worldState = new WorldState();

// We are default-exporting the singleton, so that everything should use the same object.
export default worldState;
