import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';

import { fileURLToPath } from 'url';

const app = express();
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the built Vite frontend
app.use(express.static(path.join(__dirname, 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const players = {}; 
const npcs = {};
let npcCounter = 0;

// NPC factions for natural combat
const FACTIONS = ['red', 'blue', 'green'];
const AI_STATES = { PATROL: 0, ENGAGE: 1, STRAFE: 2, EVADE: 3, DIVE: 4 };

function spawnNPC() {
    const id = 'npc_' + (npcCounter++);
    const faction = FACTIONS[Math.floor(Math.random() * FACTIONS.length)];
    npcs[id] = {
        id,
        isNPC: true,
        faction,
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 1200,
        // Velocity
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 2,
        speed: 1.5 + Math.random() * 1.5,
        qx: 0, qy: 0, qz: 0, qw: 1,
        health: 80,
        maxHealth: 80,
        isDead: false,
        targetId: null,
        lastShoot: 0,
        retargetTime: 0,
        // AI State machine
        aiState: AI_STATES.PATROL,
        stateTimer: Date.now() + 2000 + Math.random() * 3000,
        patrolAngle: Math.random() * Math.PI * 2,
        patrolRadius: 80 + Math.random() * 170,
        patrolCenterX: (Math.random() - 0.5) * 1000,
        patrolCenterZ: (Math.random() - 0.5) * 1000,
        evadeDir: { x: 0, y: 0, z: 0 },
        diveStartY: 0
    };
    io.emit('npcSpawned', npcs[id]);
}

// Initial NPCs
for(let i = 0; i < 20; i++) spawnNPC();

function getDistance(a, b) {
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2);
}

function normalize(x, y, z) {
    const m = Math.sqrt(x*x + y*y + z*z) || 1;
    return { x: x/m, y: y/m, z: z/m };
}

function updateNPCs() {
    const now = Date.now();
    const dt = 0.1; // 100ms tick
    
    for(let id in npcs) {
        const npc = npcs[id];
        if(npc.isDead) continue;
        
        const npcIdx = parseInt(id.replace('npc_','')) || 0;
        
        // Re-target every 3-5 seconds
        if(!npc.targetId || now - npc.retargetTime > 3000 + Math.random() * 2000) {
            npc.retargetTime = now;
            npc.targetId = null;
            
            let bestDist = 400;
            let bestTarget = null;
            let bestPlayerDist = 400;
            let bestPlayerTarget = null;
            
            for(let oid in npcs) {
                if(oid === id || npcs[oid].isDead) continue;
                if(npcs[oid].faction === npc.faction) continue;
                const dist = getDistance(npc, npcs[oid]);
                if(dist < bestDist) { bestDist = dist; bestTarget = oid; }
            }
            
            for(let pid in players) {
                if(players[pid].isDead || !players[pid].isPlaying) continue;
                if(players[pid].spawnProtection && now < players[pid].spawnProtection) continue;
                const dist = getDistance(npc, players[pid]);
                if(dist < bestPlayerDist) { bestPlayerDist = dist; bestPlayerTarget = pid; }
            }
            
            if(bestPlayerTarget && (Math.random() < 0.6 || !bestTarget)) {
                npc.targetId = bestPlayerTarget;
            } else {
                npc.targetId = bestTarget;
            }
            
            // Set initial engage state when acquiring target
            if(npc.targetId && npc.aiState === AI_STATES.PATROL) {
                npc.aiState = AI_STATES.ENGAGE;
                npc.stateTimer = now + 3000 + Math.random() * 2000;
            }
        }
        
        // Get target
        let target = null;
        if(npc.targetId) {
            target = npcs[npc.targetId] || players[npc.targetId];
            if(!target || target.isDead || (target.isPlaying === false && !target.isNPC)) {
                npc.targetId = null;
                target = null;
                npc.aiState = AI_STATES.PATROL;
            }
        }
        
        // State timer - switch behaviors
        if(now > npc.stateTimer && target) {
            const roll = Math.random();
            if(roll < 0.35) {
                npc.aiState = AI_STATES.ENGAGE;
                npc.stateTimer = now + 2000 + Math.random() * 2000;
            } else if(roll < 0.6) {
                npc.aiState = AI_STATES.STRAFE;
                npc.stateTimer = now + 2000 + Math.random() * 1500;
            } else if(roll < 0.8) {
                npc.aiState = AI_STATES.EVADE;
                npc.stateTimer = now + 1000 + Math.random() * 1500;
                // Pick random evade direction
                npc.evadeDir = normalize(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5),
                    (Math.random() - 0.5) * 2
                );
            } else {
                npc.aiState = AI_STATES.DIVE;
                npc.stateTimer = now + 1500 + Math.random() * 1000;
                npc.diveStartY = npc.y;
            }
        }
        
        // === MOVEMENT BY STATE ===
        if(target) {
            const dx = target.x - npc.x;
            const dy = target.y - npc.y;
            const dz = target.z - npc.z;
            const mag = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
            const toTarget = { x: dx/mag, y: dy/mag, z: dz/mag };
            
            // Perpendicular vectors for strafing
            const perpX = -toTarget.z;
            const perpZ = toTarget.x;
            
            switch(npc.aiState) {
                case AI_STATES.ENGAGE: {
                    // Fly straight toward target, full speed
                    const approachSpeed = npc.speed * (mag > 40 ? 1.8 : 0.8);
                    npc.vx += toTarget.x * approachSpeed * 0.15;
                    npc.vy += toTarget.y * approachSpeed * 0.1;
                    npc.vz += toTarget.z * approachSpeed * 0.15;
                    // Slight wobble
                    npc.vy += Math.sin(now/400 + npcIdx) * 0.15;
                    break;
                }
                case AI_STATES.STRAFE: {
                    // Circle-strafe around target at combat distance
                    const idealDist = 60 + npcIdx % 3 * 20;
                    const distForce = (mag - idealDist) * 0.03;
                    const strafeSpeed = npc.speed * 1.5;
                    const strafePhase = Math.sin(now/600 + npcIdx * 2.1);
                    
                    npc.vx += toTarget.x * distForce + perpX * strafeSpeed * 0.12 * strafePhase;
                    npc.vz += toTarget.z * distForce + perpZ * strafeSpeed * 0.12 * strafePhase;
                    npc.vy += Math.sin(now/500 + npcIdx * 1.3) * 0.2;
                    // Altitude variation
                    npc.vy += Math.cos(now/800 + npcIdx) * 0.1;
                    break;
                }
                case AI_STATES.EVADE: {
                    // Break away fast in a random direction
                    const evadeSpeed = npc.speed * 2.5;
                    npc.vx += npc.evadeDir.x * evadeSpeed * 0.2;
                    npc.vy += npc.evadeDir.y * evadeSpeed * 0.15;
                    npc.vz += npc.evadeDir.z * evadeSpeed * 0.2;
                    // Corkscrew motion
                    npc.vx += Math.sin(now/200 + npcIdx) * 0.5;
                    npc.vy += Math.cos(now/200 + npcIdx) * 0.3;
                    break;
                }
                case AI_STATES.DIVE: {
                    // Dive down then pull up - attack run
                    const diveProgress = 1 - (npc.stateTimer - now) / 2500;
                    if(diveProgress < 0.5) {
                        // Dive toward target
                        npc.vx += toTarget.x * npc.speed * 0.25;
                        npc.vy -= npc.speed * 0.3;
                        npc.vz += toTarget.z * npc.speed * 0.25;
                    } else {
                        // Pull up and away
                        npc.vy += npc.speed * 0.4;
                        npc.vx -= toTarget.x * npc.speed * 0.1;
                        npc.vz -= toTarget.z * npc.speed * 0.1;
                    }
                    break;
                }
            }
            
            // Shoot
            if(mag < 200 && now - npc.lastShoot > 1500 + Math.random() * 1000) {
                npc.lastShoot = now;
                
                const laserColor = npc.faction === 'red' ? 0xff2244 : 
                                   npc.faction === 'blue' ? 0x4488ff : 0x44ff44;
                
                io.emit('laserFired', { 
                    id: npc.id, 
                    posX: npc.x + toTarget.x*3, posY: npc.y + toTarget.y*3, posZ: npc.z + toTarget.z*3, 
                    dirX: toTarget.x, dirY: toTarget.y, dirZ: toTarget.z,
                    color: laserColor
                });
                
                const hitChance = mag < 50 ? 0.45 : (mag < 100 ? 0.25 : 0.12);
                if(Math.random() < hitChance) {
                    const dmg = 6 + Math.floor(Math.random() * 4);
                    
                    if(target.isNPC) {
                        target.health -= dmg;
                        if(target.health <= 0) {
                            target.isDead = true;
                            io.emit('npcDied', { id: npc.targetId, killer: npc.id });
                            const deadId = npc.targetId;
                            setTimeout(() => { delete npcs[deadId]; spawnNPC(); }, 4000);
                        }
                    } else {
                        target.health -= dmg;
                        io.emit('playerDamaged', { id: npc.targetId, health: target.health });
                        if(target.health <= 0) {
                            target.isDead = true;
                            io.emit('playerDied', { id: npc.targetId, killer: npc.id });
                        }
                    }
                }
            }
        } else {
            // PATROL - fly in wide circles, change altitude
            npc.patrolAngle += 0.008 + (npcIdx % 5) * 0.002;
            const targetX = npc.patrolCenterX + Math.cos(npc.patrolAngle) * npc.patrolRadius;
            const targetZ = npc.patrolCenterZ + Math.sin(npc.patrolAngle) * npc.patrolRadius;
            const targetY = Math.sin(npc.patrolAngle * 0.5) * 80;
            
            npc.vx += (targetX - npc.x) * 0.01;
            npc.vy += (targetY - npc.y) * 0.01;
            npc.vz += (targetZ - npc.z) * 0.01;
        }
        
        // Apply velocity with drag
        const drag = 0.92;
        npc.vx *= drag;
        npc.vy *= drag;
        npc.vz *= drag;
        
        // Speed clamp
        const vel = Math.sqrt(npc.vx*npc.vx + npc.vy*npc.vy + npc.vz*npc.vz);
        const maxVel = npc.speed * 4;
        if(vel > maxVel) {
            npc.vx = (npc.vx/vel) * maxVel;
            npc.vy = (npc.vy/vel) * maxVel;
            npc.vz = (npc.vz/vel) * maxVel;
        }
        
        // Update position
        npc.x += npc.vx;
        npc.y += npc.vy;
        npc.z += npc.vz;
        
        // Keep in bounds
        const bound = 600;
        if(Math.abs(npc.x) > bound) npc.vx *= -0.5;
        if(Math.abs(npc.y) > bound) npc.vy *= -0.5;
        if(Math.abs(npc.z) > bound) npc.vz *= -0.5;
    }
    io.emit('npcUpdate', npcs);
}

setInterval(updateNPCs, 100);

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    players[socket.id] = {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 200,
        qx: 0, qy: 0, qz: 0, qw: 1,
        health: 100,
        maxHealth: 100,
        isDead: false,
        isNPC: false,
        isPlaying: false  // Not targetable until START pressed
    };

    socket.emit('init', { id: socket.id, players, npcs });
    socket.broadcast.emit('playerJoined', { id: socket.id, state: players[socket.id] });

    // Player pressed START - now NPCs can target them
    socket.on('startGame', () => {
        if (players[socket.id]) {
            players[socket.id].isPlaying = true;
            players[socket.id].spawnProtection = Date.now() + 3000; // 5s protection
        }
    });

    socket.on('updateState', (state) => {
        if (players[socket.id] && !players[socket.id].isDead) {
            players[socket.id] = { ...players[socket.id], ...state };
            socket.broadcast.emit('playerMoved', { id: socket.id, state: players[socket.id] });
        }
    });

    socket.on('shoot', (data) => {
        if (players[socket.id] && !players[socket.id].isDead) {
            socket.broadcast.emit('laserFired', { id: socket.id, ...data });
        }
    });

    socket.on('hitTarget', (data) => {
        const tId = data.targetId;
        const dmg = data.damage || 20;
        
        let target = players[tId] || npcs[tId];
        if (target && !target.isDead) {
            target.health -= dmg;
            if(!target.isNPC) {
                io.emit('playerDamaged', { id: tId, health: target.health });
            }
            
            if (target.health <= 0) {
                target.isDead = true;
                if(target.isNPC) {
                    io.emit('npcDied', { id: tId, killer: socket.id });
                    setTimeout(() => {
                        delete npcs[tId];
                        spawnNPC();
                    }, 3000);
                } else {
                    io.emit('playerDied', { id: tId, killer: socket.id });
                }
            }
        }
    });
    
    socket.on('updateMaxHealth', (hp) => {
        if (players[socket.id]) {
            players[socket.id].maxHealth = hp;
            players[socket.id].health = hp;
            io.emit('playerDamaged', { id: socket.id, health: hp });
        }
    });

    socket.on('respawn', () => {
        if (players[socket.id]) {
            players[socket.id].health = players[socket.id].maxHealth;
            players[socket.id].isDead = false;
            players[socket.id].isPlaying = true;
            players[socket.id].spawnProtection = Date.now() + 5000; // 5s protection
            players[socket.id].x = (Math.random() - 0.5) * 200;
            players[socket.id].y = (Math.random() - 0.5) * 200;
            players[socket.id].z = (Math.random() - 0.5) * 200;
            io.emit('playerRespawned', { id: socket.id, state: players[socket.id] });
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('playerLeft', socket.id);
    });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`PvP Space Server with NPC Factions running on port ${PORT}`);
});
