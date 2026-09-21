/**
 * Character logic for Canvas Grid Engine
 */
import { findPath } from './Pathfinding.js';

export class Character {
  constructor(id, tileX, tileY, spriteUrl) {
    this.id = id;
    
    // Grid position
    this.tileX = tileX;
    this.tileY = tileY;
    
    // Exact pixel position for smooth drawing
    this.pixelX = tileX;
    this.pixelY = tileY;
    
    // Image loading
    this.image = new Image();
    this.image.src = spriteUrl;
    this.imageLoaded = false;
    this.image.onload = () => {
      this.imageLoaded = true;
      // Fixed size from agents-in-the-office
      this.frameWidth = 16;
      this.frameHeight = 32;
    };
    
    // Movement state
    this.path = [];
    this.speed = 3.0; // tiles per second
    this.direction = 'down'; 
    this.state = 'idle'; // 'idle', 'walking', 'working'
    this.targetState = 'idle';
    this.targetFacing = 'down';
    
    // Animation state
    this.animTimer = 0;
    this.animFrame = 0;
    this.walkCycle = [1, 0, 1, 2]; // Stand, Left, Stand, Right
    this.workCycle = [3, 4]; // Programming frames (col 3 and 4)
  }

  walkTo(destTileX, destTileY, width, height, isWalkable, targetState, targetFacing) {
    const start = { x: Math.round(this.tileX), y: Math.round(this.tileY) };
    const dest = { x: destTileX, y: destTileY };
    
    this.path = findPath(start, dest, width, height, isWalkable);
    this.targetState = targetState || 'idle';
    this.targetFacing = targetFacing || 'down';
    if (this.path.length > 0) {
      this.state = 'walking';
    } else {
      this.state = this.targetState;
      this.direction = this.targetFacing;
    }
  }

  updateDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else if (dy !== 0) {
      this.direction = dy > 0 ? 'down' : 'up';
    }
  }



  update(dtMs) {
    const dt = dtMs / 1000; // Delta time in seconds

    if (this.path.length > 0) {
      this.state = 'walking';
      const target = this.path[0];
      const dx = target.x - this.pixelX;
      const dy = target.y - this.pixelY;
      
      this.updateDirection(dx, dy);
      
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveDistance = this.speed * dt;

      if (distance <= moveDistance) {
        // Snap to target and remove from path
        this.pixelX = target.x;
        this.pixelY = target.y;
        this.tileX = target.x;
        this.tileY = target.y;
        this.path.shift();
        
        // If arrived at final destination
        if (this.path.length === 0) {
          this.state = this.targetState;
          this.animFrame = 0;
          this.direction = this.targetFacing;
        }
      } else {
        // Move towards target
        this.pixelX += (dx / distance) * moveDistance;
        this.pixelY += (dy / distance) * moveDistance;
      }
      
      // Update animation timer
      this.animTimer += dt;
      if (this.animTimer > 0.15) { // 0.15s per frame
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % this.walkCycle.length;
      }
      
    } else {
      // Not walking (Idle or Working)
      if (this.state === 'working') {
        // Slower animation for typing
        this.animTimer += dt;
        if (this.animTimer > 0.4) {
          this.animTimer = 0;
          this.animFrame = (this.animFrame + 1) % this.workCycle.length;
        }
      } else {
        this.animFrame = 0; // Reset to standing
      }
    }
  }

  draw(ctx, tileSize) {
    if (!this.imageLoaded) return;
    
    let col = 1; // Default standing
    
    if (this.state === 'walking') {
      col = this.walkCycle[this.animFrame];
    } else if (this.state === 'working') {
      col = this.workCycle[this.animFrame];
    } else if (this.state === 'idle') {
      // idle at lounge means sitting still (no typing animation)
      col = 3; 
    } else {
      // offline (door) or any other state
      col = this.walkCycle[0]; // standing frame
    }

    let row = 0;
    let flipX = false;

    // auto-3x3 Layout mapping
    switch (this.direction) {
      case 'down': row = 0; break;
      case 'up': row = 1; break;
      case 'right': row = 2; break;
      case 'left': row = 2; flipX = true; break;
    }
    
    const sx = col * this.frameWidth;
    const sy = row * this.frameHeight;
    
    // Size scaling
    // The original tiles are 32x32, sprite is 16x32. We scale sprite so width is roughly tileSize.
    // 16 * 2 = 32 width, 32 * 2 = 64 height.
    const drawWidth = tileSize;
    const drawHeight = tileSize * 2;
    
    // Offset so feet align with the bottom of the tile
    const drawX = (this.pixelX * tileSize);
    let drawY = (this.pixelY * tileSize) - (drawHeight - tileSize);
    
    // If sitting (working or idle in lounge), visually lower them slightly to fit the chair/sofa
    if (this.state === 'working' || this.state === 'idle') {
      drawY += 24;
    }

    // Shadow removed per user request

    if (flipX) {
      ctx.save();
      // Translate to the center of where we draw, flip, translate back
      ctx.translate(drawX + drawWidth / 2, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.image,
        sx, sy, this.frameWidth, this.frameHeight,
        -drawWidth / 2, drawY, drawWidth, drawHeight
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        this.image,
        sx, sy, this.frameWidth, this.frameHeight,
        drawX, drawY, drawWidth, drawHeight
      );
    }
  }
}


