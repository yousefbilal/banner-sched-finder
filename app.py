from course import *
from utils import *
import os
import uuid
from functools import wraps
from flask import (
    Flask,
    jsonify,
    render_template,
    request,
    stream_with_context,
    Response,
)

# mongo db
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)
# mongo db

uri = os.environ.get("MONGODB_URI")
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi("1"))
# Send a ping to confirm a successful connection
try:
    client.admin.command("ping")
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Get the database
db = client.get_database("banner")
# Get the collection
collection = db.get_collection("subjectss24")
coursesCollection = db.get_collection("coursesf24")
subjProjection = {"_id": 0, "subject": 1}
projection = {
    "_id": 0,
    "full_name": 1,
    "subject": 1,
    "code": 1,
    "credits": 1,
    "section": 1,
    "instructor": 1,
    "time": 1,
    "days": 1,
}
# schedulesCollection = db.get_collection('schedules')
# schedulesProjection = {"_id": 0, "courses": 1, "schedules": 1}
userCollection = db.get_collection("users")
historyCollection = db.get_collection("history")
historyProjection = {"_id": 0, "courses": 1, "constraints": 1, "datetime": 1}
adminCollection = db.get_collection("admin")
adminProjection = {"_id": 0, "datetime": 1, "semester": 1}
# end of mongo db


def prepare_courses(selectedCoursesArray, breaks, noClosedCourses):
    try:
        lectures_list = []
        lectures_dict = dict()
        labs_dict = dict()
        selectedCoursesArrayString = [
            f"{obj['subject']} {obj['code']}" for obj in selectedCoursesArray
        ]
        isAvailable = ["Y"] if noClosedCourses else ["Y", "N"]
        for dataCourse in selectedCoursesArray:
            courses = []
            if dataCourse["sections"][0] != "Any":
                for section in dataCourse["sections"]:
                    courses += list(
                        coursesCollection.find(
                            {
                                "code": dataCourse["code"],
                                "subject": dataCourse["subject"],
                                "section": section,
                                "isAvailable": {"$in": isAvailable},
                            }
                        )
                    )
            else:
                courses = list(
                    coursesCollection.find(
                        {
                            "code": dataCourse["code"],
                            "subject": dataCourse["subject"],
                            "isAvailable": {"$in": isAvailable},
                        }
                    )
                )

            course_code = dataCourse["subject"] + " " + dataCourse["code"]
            courses.sort(key=lambda x: x["section"])  # not always necessary
            for course in courses:
                crn = course["crn"]
                section = course["section"]
                time = course["time"]
                days = course["days"]
                instructor_name = course["instructor"]
                # course is a lab and has a lecture
                if course["isLab"] and course_code[:-1] in selectedCoursesArrayString:
                    labs_dict.setdefault(course_code[:-1], []).append(
                        Lab(
                            course_code,
                            crn,
                            section,
                            time,
                            days,
                            instructor_name,
                            *Course.find_required_sections(course["full_name"]),
                        )
                    )
                # course is a lecture
                else:
                    lectures_dict.setdefault(course_code, []).append(
                        Lecture.createLecture(
                            course_code,
                            crn,
                            section,
                            time,
                            days,
                            instructor_name,
                            selectedCoursesArrayString,
                            *Course.find_required_sections(course["full_name"]),
                        )
                    )

        for value in lectures_dict.values():
            lectures_list.append(value)
        for _break in breaks:
            lectures_list.append(
                [
                    Lecture.createBreak(
                        _break["startTime"],
                        _break["endTime"],
                        _break.get("days", "MTWR"),
                    )
                ]
            )
        return lectures_list, labs_dict

    except Exception as e:
        print(e)
        return []


@app.route("/")
def home():
    return render_template("index.html")


def get_id(f):
    @wraps(f)  # preserves the name of the function
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")
        if auth == "null":
            return jsonify({"message": "unexpected error"}), 401
        auth = auth.split(" ")[1]  # equals to id
        return f(auth, *args, **kwargs)

    return decorated


@app.route("/getCourses", methods=["GET"])
def getCourses():
    try:
        auth = request.headers.get("Authorization")
        id = None
        if auth == "null":
            id = str(uuid.uuid4())
            # token = jwt.encode({'id': id}, secret_key, algorithm='HS256')
            # insert the id into the database
            userCollection.insert_one({"id": id, "datetime": datetime.utcnow()})
        subjects = list(collection.find({}, subjProjection).sort([("subject", 1)]))
        courses = list(
            coursesCollection.find({}, projection).sort(
                [("subject", 1), ("code", 1), ("section", 1)]
            )
        )
        last_updated = adminCollection.find_one({}, adminProjection)["datetime"]
        semester = adminCollection.find_one({}, adminProjection)["semester"]
        return (
            jsonify(
                {
                    "subjects": subjects,
                    "courses": courses,
                    "token": id,
                    "last_updated": last_updated,
                    "semester": semester,
                }
            ),
            200,
        )
    except Exception as e:
        print(e)
        return jsonify({"message": "error"}), 400


@app.route("/generateScheduleDOM", methods=["POST"])
@get_id
def generatedom(user_id):
    if request.method == "POST":
        data = request.get_json()
        print(data)
        selectedCourses = data["selectedCourses"]
        breaks = data["breaks"]
        noClosedCourses = data["noClosedCourses"]
        # history save
        entry = historyCollection.find_one(
            {
                "id": user_id,
                "courses": selectedCourses,
                "constraints": {"breaks": breaks, "noClosedCourses": noClosedCourses},
            }
        )
        if entry == None:
            historyCollection.insert_one(
                {
                    "id": user_id,
                    "courses": selectedCourses,
                    "constraints": {
                        "breaks": breaks,
                        "noClosedCourses": noClosedCourses,
                    },
                    "datetime": datetime.utcnow(),
                }
            )
        else:
            historyCollection.update_one(
                {
                    "id": user_id,
                    "courses": selectedCourses,
                    "constraints": {
                        "breaks": breaks,
                        "noClosedCourses": noClosedCourses,
                    },
                },
                {"$set": {"datetime": datetime.utcnow()}},
            )
        # end of history save
        lectures_list, labs_dict = prepare_courses(
            selectedCourses, breaks, noClosedCourses
        )

        return Response(
            stream_with_context(generate_scheds(lectures_list, labs_dict)),
            content_type="application/json",
        )


@app.route("/getHistory", methods=["GET"])
@get_id
def getHistory(user_id):
    if request.method == "GET":
        history = list(
            historyCollection.find({"id": user_id}, historyProjection)
            .sort([("datetime", -1)])
            .limit(10)
        )  # limited to 10
        return jsonify({"history": history}), 200


@app.route("/clearHistory", methods=["POST"])
@get_id
def clearHistory(user_id):
    if request.method == "POST":
        db.get_collection("history").delete_many({"id": user_id})
        return jsonify({"message": "History Cleared"}), 200


if __name__ == "__main__":
    # app.run(debug=True, port=8080)
    from waitress import serve

    serve(app, host="0.0.0.0", port=8080, threads=100)
