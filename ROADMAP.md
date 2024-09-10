# Goals for Version 1.0

## Couch Co-op

- The game should allow one or two players to play together on the same device, optimized for using two controllers

## Biomes

- The v1 of the game should have three complete biomes.
- - Death
- - Wild
- - one more

## Modularity

- The project should be set up in such a way that the editors generate files which are only loosely coupled to the game mechanics. In particular, that means that both the editors and the game should adhear to a agreed upon set of configuration interfaces which are than utilized at playtime.
- Mods extend or replace these configurations
- All assets should be loaded directly form online sources, but also allow preloading and bundling for offline builds. This should allow a dynamic usage of new tilesets etc from mods.
- The base content itself should also be structured as a mod, to guarantee later mod compatibility

## Abilities

- All abilities should be generated through configuration.
- Mods should be able to overwrite any abilities.

## Graphics

- All characters and enemies should be composible and colorable.
- All characters and enemies stats, abilities and behaviour should likewise be configureable.

## Sound

- Finish the music editor
- Implement spatial sound effects (https://github.com/phaserjs/phaser/blob/master/changelog/3.60/SpatialSound.md)
