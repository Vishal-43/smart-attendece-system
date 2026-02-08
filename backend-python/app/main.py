from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, attendance, batches, branches, codes, courses, divisions, locations, timetable, users, enrollments

app = FastAPI(
    title="smart Attendance System",
    description="Attendance Tracking with QR codes",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(batches.router)
app.include_router(branches.router)
app.include_router(codes.router)
app.include_router(courses.router)
app.include_router(divisions.router)
app.include_router(locations.router)
app.include_router(timetable.router)
app.include_router(users.router)
app.include_router(enrollments.router)


@app.get("/")
def root():
    return {"message": "Smart Attendance System API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
