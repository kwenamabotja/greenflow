import { Server as SocketIOServer, Socket } from "socket.io";
import { createServer } from "http";
import { logger } from "./logger.js";
import { getActiveTaxis, getRecentGpsPings } from "@workspace/db";

interface GpsUpdate {
  userId: string;
  latitude: number;
  longitude: number;
  destination: string;
  routeId?: string;
}

interface VirtualTaxiUpdate {
  id: string;
  routeId: string;
  routeName: string;
  latitude: number;
  longitude: number;
  passengerCount: number;
  destination: string;
  origin: string;
  estimatedArrivalMinutes: number;
  formedAt: string;
  expiresAt: string;
}

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedClients: Set<string> = new Set();

  initialize(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on("connection", (socket: Socket) => {
      logger.info({ socketId: socket.id }, "WebSocket client connected");
      this.connectedClients.add(socket.id);

      // Send current state to newly connected client
      this.sendInitialState(socket);

      // Handle client disconnection
      socket.on("disconnect", () => {
        logger.info({ socketId: socket.id }, "WebSocket client disconnected");
        this.connectedClients.delete(socket.id);
      });

      // Handle GPS updates from clients
      socket.on("gps-update", async (data: GpsUpdate) => {
        try {
          logger.info({ userId: data.userId, latitude: data.latitude, longitude: data.longitude }, "Received GPS update via WebSocket");
          
          // Broadcast to all other clients in same route
          socket.broadcast.emit("gps-update-broadcast", {
            ...data,
            timestamp: new Date().toISOString()
          });

          // Check for virtual taxi formation
          await this.checkAndFormVirtualTaxi(data);
        } catch (error) {
          logger.error({ error }, "Failed to process GPS update via WebSocket");
        }
      });

      // Handle route-specific subscriptions
      socket.on("subscribe-route", (routeId: string) => {
        logger.info({ socketId: socket.id, routeId }, "Client subscribed to route");
        socket.join(`route-${routeId}`);
      });

      // Handle location-specific subscriptions
      socket.on("subscribe-location", (data: { lat: number; lng: number; radius: number }) => {
        const room = `location-${Math.floor(data.lat / 0.01)}-${Math.floor(data.lng / 0.01)}`;
        socket.join(room);
        logger.info({ socketId: socket.id, room }, "Client subscribed to location room");
      });
    });

    logger.info("WebSocket server initialized");
  }

  private async sendInitialState(socket: Socket) {
    try {
      // Send active virtual taxis
      const activeTaxis = await getActiveTaxis();
      socket.emit("active-taxis", activeTaxis);

      // Send recent GPS pings for default route
      const recentPings = await getRecentGpsPings("R001", 5);
      socket.emit("recent-pings", recentPings);
    } catch (error) {
      logger.error({ error }, "Failed to send initial state to WebSocket client");
    }
  }

  private async checkAndFormVirtualTaxi(gpsUpdate: GpsUpdate) {
    try {
      // Get recent pings in area
      const nearbyPings = await getRecentGpsPings(gpsUpdate.routeId || "default", 5);
      
      // Filter by distance (within 500 meters)
      const nearbyUsers = nearbyPings.filter(ping => {
        const distance = this.calculateDistance(
          gpsUpdate.latitude, 
          gpsUpdate.longitude, 
          ping.latitude, 
          ping.longitude
        );
        return distance <= 0.5; // 500 meters
      });

      // If we have 3+ nearby users, form virtual taxi
      if (nearbyUsers.length >= 3) {
        const uniqueUsers = [...new Set(nearbyUsers.map(p => p.userId))];
        
        if (uniqueUsers.length >= 3) {
          const virtualTaxi: VirtualTaxiUpdate = {
            id: `taxi_${Date.now()}`,
            routeId: gpsUpdate.routeId || "R001",
            routeName: `Virtual Route ${gpsUpdate.routeId || "1"}`,
            latitude: gpsUpdate.latitude,
            longitude: gpsUpdate.longitude,
            passengerCount: uniqueUsers.length,
            destination: gpsUpdate.destination,
            origin: `${gpsUpdate.latitude},${gpsUpdate.longitude}`,
            estimatedArrivalMinutes: 15,
            formedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours
          };

          // Broadcast virtual taxi formation to all clients
          this.io?.emit("virtual-taxi-formed", virtualTaxi);
          
          logger.info({ 
            passengerCount: uniqueUsers.length, 
            destination: gpsUpdate.destination,
            latitude: gpsUpdate.latitude,
            longitude: gpsUpdate.longitude
          }, "Virtual taxi formed via WebSocket");
        }
      }
    } catch (error) {
      logger.error({ error }, "Failed to check and form virtual taxi via WebSocket");
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Public methods for external use
  broadcastVirtualTaxiUpdate(taxi: VirtualTaxiUpdate) {
    this.io?.emit("virtual-taxi-update", taxi);
  }

  broadcastGpsUpdate(update: GpsUpdate) {
    this.io?.emit("gps-update-broadcast", {
      ...update,
      timestamp: new Date().toISOString()
    });
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

export const wsService = new WebSocketService();
