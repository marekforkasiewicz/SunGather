from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from threading import Thread
import uvicorn
import logging
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import deque

class export_api(object):
    """FastAPI-based REST API and WebSocket server for modern web dashboard"""
    
    # Class-level storage for latest data
    latest_data = {
        "registers": {},
        "config": {},
        "timestamp": None,
        "status": "initializing"
    }
    
    # Historical data storage (in-memory, limited size)
    history_data = deque(maxlen=1440)  # 24 hours at 1min intervals
    
    # Active WebSocket connections
    active_connections: List[WebSocket] = []
    
    def __init__(self):
        self.app = None
        self.server = None
        
    def configure(self, config, inverter):
        """Configure and start FastAPI server"""
        try:
            port = config.get('port', 8000)
            host = config.get('host', '0.0.0.0')
            
            # Create FastAPI app
            self.app = FastAPI(
                title="SunGather API",
                description="RESTful API for SunGather solar monitoring",
                version="1.0.0",
                docs_url="/api/docs",
                redoc_url="/api/redoc"
            )
            
            # Enable CORS for frontend development
            self.app.add_middleware(
                CORSMiddleware,
                allow_origins=config.get('cors_origins', ["*"]),
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
            )
            
            # Register routes
            self._register_routes()
            
            # Store initial config
            export_api.latest_data["config"] = {
                "inverter": inverter.inverter_config,
                "client": inverter.client_config
            }
            
            # Start server in background thread
            self.server_thread = Thread(
                target=self._run_server,
                args=(host, port),
                daemon=True
            )
            self.server_thread.start()
            
            logging.info(f"API: FastAPI server started on http://{host}:{port}")
            logging.info(f"API: Swagger docs available at http://{host}:{port}/api/docs")
            
            return True
            
        except Exception as err:
            logging.error(f"API: Configuration error: {err}")
            return False
    
    def _run_server(self, host: str, port: int):
        """Run uvicorn server"""
        uvicorn.run(self.app, host=host, port=port, log_level="warning")
    
    def _register_routes(self):
        """Register all API routes"""
        
        @self.app.get("/api/v1/status")
        async def get_status():
            """Get current system status"""
            return JSONResponse({
                "status": export_api.latest_data["status"],
                "timestamp": export_api.latest_data["timestamp"],
                "registers_count": len(export_api.latest_data["registers"]),
                "history_points": len(export_api.history_data)
            })
        
        @self.app.get("/api/v1/registers")
        async def get_all_registers():
            """Get all current register values"""
            return JSONResponse(export_api.latest_data["registers"])
        
        @self.app.get("/api/v1/registers/{register_name}")
        async def get_register(register_name: str):
            """Get specific register value"""
            registers = export_api.latest_data["registers"]
            if register_name not in registers:
                raise HTTPException(status_code=404, detail="Register not found")
            return JSONResponse({
                "name": register_name,
                "value": registers[register_name]["value"],
                "unit": registers[register_name]["unit"],
                "address": registers[register_name]["address"],
                "timestamp": export_api.latest_data["timestamp"]
            })
        
        @self.app.get("/api/v1/config")
        async def get_config():
            """Get current configuration"""
            return JSONResponse(export_api.latest_data["config"])
        
        @self.app.get("/api/v1/history/daily")
        async def get_daily_history(
            hours: Optional[int] = 24,
            register: Optional[str] = "total_active_power"
        ):
            """Get historical data for specified register"""
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            filtered_data = [
                point for point in export_api.history_data
                if datetime.fromisoformat(point["timestamp"]) > cutoff_time
                and register in point["registers"]
            ]
            
            return JSONResponse({
                "register": register,
                "hours": hours,
                "data_points": len(filtered_data),
                "data": [
                    {
                        "timestamp": point["timestamp"],
                        "value": point["registers"][register]["value"]
                    }
                    for point in filtered_data
                ]
            })
        
        @self.app.get("/api/v1/summary")
        async def get_summary():
            """Get dashboard summary with key metrics"""
            registers = export_api.latest_data["registers"]
            
            # Extract key metrics (with fallbacks)
            summary = {
                "production": {
                    "current": registers.get("total_active_power", {}).get("value", 0),
                    "daily": registers.get("daily_power_yields", {}).get("value", 0),
                    "total": registers.get("total_power_yields", {}).get("value", 0),
                },
                "consumption": {
                    "current": registers.get("load_power", {}).get("value", 0),
                },
                "grid": {
                    "export": registers.get("export_to_grid", {}).get("value", 0),
                    "import": registers.get("import_from_grid", {}).get("value", 0),
                    "daily_export": registers.get("daily_export_to_grid", {}).get("value", 0),
                    "daily_import": registers.get("daily_import_from_grid", {}).get("value", 0),
                },
                "battery": {
                    "level": registers.get("battery_level", {}).get("value", None),
                    "power": registers.get("battery_power", {}).get("value", None),
                },
                "temperature": registers.get("internal_temperature", {}).get("value", None),
                "status": registers.get("run_state", {}).get("value", "unknown"),
                "timestamp": export_api.latest_data["timestamp"]
            }
            
            return JSONResponse(summary)
        
        @self.app.websocket("/api/v1/ws")
        async def websocket_endpoint(websocket: WebSocket):
            """WebSocket endpoint for real-time updates"""
            await websocket.accept()
            export_api.active_connections.append(websocket)
            
            try:
                # Send initial data
                await websocket.send_json({
                    "type": "initial",
                    "data": export_api.latest_data
                })
                
                # Keep connection alive
                while True:
                    # Wait for client messages (ping/pong)
                    data = await websocket.receive_text()
                    if data == "ping":
                        await websocket.send_text("pong")
                        
            except WebSocketDisconnect:
                export_api.active_connections.remove(websocket)
                logging.info("API: WebSocket client disconnected")
            except Exception as e:
                logging.error(f"API: WebSocket error: {e}")
                if websocket in export_api.active_connections:
                    export_api.active_connections.remove(websocket)
    
    def publish(self, inverter):
        """Called when new data is scraped from inverter"""
        try:
            # Prepare register data
            registers_data = {}
            for register, value in inverter.latest_scrape.items():
                registers_data[register] = {
                    "value": value,
                    "unit": inverter.getRegisterUnit(register),
                    "address": inverter.getRegisterAddress(register)
                }
            
            # Update latest data
            export_api.latest_data["registers"] = registers_data
            export_api.latest_data["timestamp"] = datetime.now().isoformat()
            export_api.latest_data["status"] = "healthy"
            
            # Add to history
            export_api.history_data.append({
                "timestamp": export_api.latest_data["timestamp"],
                "registers": registers_data
            })
            
            # Broadcast to WebSocket clients
            if export_api.active_connections:
                asyncio.run(self._broadcast_update({
                    "type": "update",
                    "data": {
                        "registers": registers_data,
                        "timestamp": export_api.latest_data["timestamp"]
                    }
                }))
            
            return True
            
        except Exception as err:
            logging.error(f"API: Publish error: {err}")
            return False
    
    async def _broadcast_update(self, message: dict):
        """Broadcast message to all connected WebSocket clients"""
        disconnected = []
        
        for connection in export_api.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logging.warning(f"API: Failed to send to WebSocket client: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            export_api.active_connections.remove(connection)
