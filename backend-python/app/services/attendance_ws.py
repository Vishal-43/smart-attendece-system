import json
from collections import defaultdict

from fastapi import WebSocket


class AttendanceWebSocketManager:
    def __init__(self) -> None:
        self._connections: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, timetable_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[timetable_id].add(websocket)

    def disconnect(self, timetable_id: int, websocket: WebSocket) -> None:
        sockets = self._connections.get(timetable_id)
        if not sockets:
            return
        sockets.discard(websocket)
        if not sockets:
            self._connections.pop(timetable_id, None)

    async def broadcast(self, timetable_id: int, payload: dict) -> None:
        sockets = list(self._connections.get(timetable_id, set()))
        if not sockets:
            return

        data = json.dumps(payload)
        to_remove: list[WebSocket] = []
        for socket in sockets:
            try:
                await socket.send_text(data)
            except Exception:
                to_remove.append(socket)

        for socket in to_remove:
            self.disconnect(timetable_id, socket)


attendance_ws_manager = AttendanceWebSocketManager()
