from datetime import datetime
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
from course import Course, Lecture, Lab
from utils import generate_schedules, init_db
from dotenv import load_dotenv

load_dotenv(".env")
app = Flask(__name__)

uri = os.getenv("MONGODB_URI")
db = init_db(uri, "banner")
subjects_collection = db.get_collection("subjects")
courses_collection = db.get_collection("courses")
user_collection = db.get_collection("users")
history_collection = db.get_collection("history")
metadata_collection = db.get_collection("metadata")


def prepare_courses(selectedCoursesArray, breaks, noClosedCourses):
    try:
        lectures_list = []
        lectures_dict = dict()
        labs_dict = dict()
        selectedCoursesArrayString = [
            f"{obj['subject']} {obj['code']}" for obj in selectedCoursesArray
        ]
        isAvailable = [True] if noClosedCourses else [True, False]
        for dataCourse in selectedCoursesArray:
            courses = []
            if dataCourse["sections"][0] != "Any":
                for section in dataCourse["sections"]:
                    courses += list(
                        courses_collection.find(
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
                    courses_collection.find(
                        {
                            "code": dataCourse["code"],
                            "subject": dataCourse["subject"],
                            "isAvailable": {"$in": isAvailable},
                        }
                    )
                )
            if len(courses) == 0:
                return [], {}
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
        return [], {}


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
def get_courses():
    try:
        auth = request.headers.get("Authorization")
        id = None
        if auth == "null":
            id = str(uuid.uuid4())
            # token = jwt.encode({'id': id}, secret_key, algorithm='HS256')
            # insert the id into the database
            user_collection.insert_one({"id": id, "datetime": datetime.utcnow()})
        subjects = list(subjects_collection.find({}, {"_id": 0}).sort([("subject", 1)]))
        courses = list(
            courses_collection.find(
                {},
                {
                    "_id": 0,
                    "full_name": 1,
                    "subject": 1,
                    "code": 1,
                    "credits": 1,
                    "section": 1,
                    "instructor": 1,
                    "time": 1,
                    "days": 1,
                },
            ).sort([("subject", 1), ("code", 1), ("section", 1)])
        )
        metadata = metadata_collection.find_one(
            {}, {"_id": 0, "last_updated": 1, "semester": 1}
        )
        return (
            jsonify(
                {"subjects": subjects, "courses": courses, "token": id, **metadata}
            ),
            200,
        )
    except Exception as e:
        print(e)
        return jsonify({"message": "error"}), 400


@app.route("/generateSchedules", methods=["POST"])
@get_id
def generate(user_id):
    if request.method == "POST":
        data = request.get_json()
        print(data)
        selectedCourses = data["selectedCourses"]
        breaks = data["breaks"]
        noClosedCourses = data["noClosedCourses"]
        # history save
        entry = history_collection.find_one(
            {
                "id": user_id,
                "courses": selectedCourses,
                "constraints": {"breaks": breaks, "noClosedCourses": noClosedCourses},
            }
        )
        if entry is None:
            history_collection.insert_one(
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
            history_collection.update_one(
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
        if len(lectures_list) == 0:
            return jsonify({"message": "No schedules found"}), 404
        return Response(
            stream_with_context(generate_schedules(lectures_list, labs_dict)),
            content_type="application/json",
        )


@app.route("/getHistory", methods=["GET"])
@get_id
def get_history(user_id):
    if request.method == "GET":
        history = list(
            history_collection.find({"id": user_id}, {"_id": 0})
            .sort([("datetime", -1)])
            .limit(10)
        )  # limited to 10
        return jsonify({"history": history}), 200


@app.route("/clearHistory", methods=["POST"])
@get_id
def clear_history(user_id):
    if request.method == "POST":
        db.get_collection("history").delete_many({"id": user_id})
        return jsonify({"message": "History Cleared"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=8080)
