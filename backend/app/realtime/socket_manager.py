import socketio
import logging
import asyncio
from typing import Any, Dict

logger = logging.getLogger(__name__)

# Create async Socket.io server with permissive CORS for development and production
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)

@sio.event
async def connect(sid, environ, auth=None):
    logger.info(f"Socket.io client connected: {sid}")
    await sio.emit("connected", {"status": "connected", "sid": sid}, to=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"Socket.io client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    room = data.get("room")
    if room:
        sio.enter_room(sid, room)
        logger.info(f"Client {sid} joined room: {room}")


def broadcast_change(entity: str, action: str, data: Dict[str, Any] = None):
    """
    Broadcasts real-time entity change to all connected clients.
    entity: 'committees' | 'meetings' | 'minutes' | 'actions' | 'members' | 'notifications' | 'documents'
    action: 'created' | 'updated' | 'deleted'
    """
    try:
        payload = {
            "entity": entity,
            "action": action,
            "data": data or {}
        }
        
        async def _emit():
            try:
                # Global generic channel
                await sio.emit("data_changed", payload)
                # Specific entity channel
                await sio.emit(f"{entity}:{action}", payload)
                await sio.emit(f"{entity}_changed", payload)
            except Exception as e:
                logger.debug(f"Socket.io emit error: {e}")

        try:
            loop = asyncio.get_running_loop()
            loop.create_task(_emit())
        except RuntimeError:
            try:
                asyncio.run(_emit())
            except Exception:
                pass

    except Exception as err:
        logger.warning(f"Could not broadcast change: {err}")
