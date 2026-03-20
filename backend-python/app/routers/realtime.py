from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.attendance_ws import attendance_ws_manager

router = APIRouter(tags=["realtime"])


@router.websocket("/ws/attendance/{timetable_id}")
async def attendance_stream(websocket: WebSocket, timetable_id: int):
    await attendance_ws_manager.connect(timetable_id, websocket)
    try:
        while True:
            try:
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                attendance_ws_manager.disconnect(timetable_id, websocket)
                break
    except Exception:
        attendance_ws_manager.disconnect(timetable_id, websocket)
