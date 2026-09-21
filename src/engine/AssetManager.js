import assetLookup from './assetLookup.json';

class AssetManager {
  constructor() {
    this.images = {};
    this.loaded = false;
    
    // Default tiles mapping based on default-layout-1.json
    this.floorPaths = {
      0: null,
      1: '/assets/floors/floor_1.png', 
      7: '/assets/floors/floor_7.png', 
      9: '/assets/floors/floor_9.png'
    };
  }

  async loadAll() {
    const promises = [];
    
    // Load Furniture
    for (const [id, data] of Object.entries(assetLookup)) {
      promises.push(this.loadImage(id, data.file));
    }

    // Load Floors/Walls
    for (const [id, path] of Object.entries(this.floorPaths)) {
      if (path) {
        promises.push(this.loadImage('tile_' + id, path));
      }
    }

    await Promise.all(promises);
    this.loaded = true;
  }

  loadImage(key, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.images[key] = img;
        resolve();
      };
      img.onerror = () => {
        console.warn('Failed to load image:', src);
        resolve(); 
      };
    });
  }

  getFurniture(id) {
    // If it has a suffix like :left, we might need to flip it, but for now we just load the base image.
    // The canvas will handle the flipping if needed.
    const baseId = id.split(':')[0];
    return {
      image: this.images[baseId],
      meta: assetLookup[baseId]
    };
  }

  getTile(id) {
    return this.images['tile_' + id];
  }
}

export const assetManager = new AssetManager();
