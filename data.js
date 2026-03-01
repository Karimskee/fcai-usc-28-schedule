// Core Structured Schedule Data - Natively editable by the user without need for a backend.
const scheduleData = {
    "departments": [
        { "id": "IS", "name": "Information Systems (IS)" },
        { "id": "CS", "name": "Computer Science (CS)" }
    ],
    "studentGroups": {
        "2332002": "IS Group 1",
        "2432002": "IS Group 1",
        "2432003": "IS Group 1",
        "2432004": "IS Group 1",
        "2432005": "IS Group 1",
        "2432007": "IS Group 1",
        "2432008": "IS Group 1",
        "2432009": "IS Group 1",
        "2432010": "IS Group 1",
        "2432012": "IS Group 1",
        "2432013": "IS Group 1",
        "2432014": "IS Group 1",
        "2432015": "IS Group 1",
        "2432016": "IS Group 1",
        "2432017": "IS Group 1",
        "2432082": "IS Group 1",
        "2432018": "IS Group 1",
        "2432019": "IS Group 1",
        "2432026": "IS Group 1",
        "2432027": "IS Group 1",
        "2432028": "IS Group 1",
        "2432029": "IS Group 1",
        "2432030": "IS Group 1",
        "2432031": "IS Group 1",
        "2432033": "IS Group 1",
        "2432035": "IS Group 1",
        "2432036": "IS Group 1",
        "2432038": "IS Group 1",
        "2432040": "IS Group 1",
        "2432041": "IS Group 1",
        "2432042": "IS Group 1",
        "2432044": "IS Group 1",
        "2432045": "IS Group 2",
        "2432047": "IS Group 2",
        "2432049": "IS Group 2",
        "2432050": "IS Group 2",
        "2432051": "IS Group 2",
        "2432053": "IS Group 2",
        "2432054": "IS Group 2",
        "2432055": "IS Group 2",
        "2432056": "IS Group 2",
        "2432058": "IS Group 2",
        "2432059": "IS Group 2",
        "2432060": "IS Group 2",
        "2432064": "IS Group 2",
        "2432066": "IS Group 2",
        "2432068": "IS Group 2",
        "2432070": "IS Group 2",
        "2432072": "IS Group 2",
        "2432073": "IS Group 2",
        "2432074": "IS Group 2",
        "2432075": "IS Group 2",
        "2432076": "IS Group 2",
        "2432077": "IS Group 2",
        "2432078": "IS Group 2",
        "2432080": "IS Group 2",
        "2432083": "IS Group 2",
        "2432101": "IS Group 2",
        "2432104": "IS Group 2",
        "2432109": "IS Group 2",
        "2432111": "IS Group 2",
        "2432189": "IS Group 2",
        "2425028": "IS Group 2"
    },
    "groups": {
        "IS": [
            {
                "name": "IS Group 1",
                "sessions": [
                    { "courseId": "CS203", "courseName": "Computer Programming-2 (OOP)",                            "type": "Section", "day": "Thursday" , "start": "09:30", "end": "10:30", "location": "قاعة (1)"       , "groups": ["IS Group 1"]                                            , "instructor": "م/ عبدالله حلمي"     , "notes": "احتمال الميعاد يتغير" },
                    { "courseId": "IS201", "courseName": "Multimedia",                                              "type": "Lecture", "day": "Saturday" , "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "د/ احمد جمال"        , "notes": "احتمال الميعاد يتغير" },
                    { "courseId": "IS201", "courseName": "Multimedia",                                              "type": "Section", "day": "Monday"   , "start": "10:00", "end": "11:00", "location": "البلازا الخارجية", "groups": ["IS Group 1"]                                            , "instructor": "م/ مريم فياض"        , "notes": "" },
                    { "courseId": "CS204", "courseName": "Data Structure",                                          "type": "Lecture", "day": "Tuesday"  , "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.د/ طارق مصطفي"     , "notes": "" },
                    { "courseId": "CS204", "courseName": "Data Structure",                                          "type": "Section", "day": "Wednesday", "start": "10:00", "end": "11:00", "location": "البلازا الخارجية", "groups": ["IS Group 1"]                                            , "instructor": "م.م/ هبه فتحي"       , "notes": "الميعاد والمحاضر غير مؤكدان" },
                    { "courseId": "CS206", "courseName": "Web Design and Development",                              "type": "Section", "day": "Monday"   , "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["IS Group 1"]                                            , "instructor": "م.م/ هبه فتحي"       , "notes": "الميعاد والمحاضر غير مؤكدان" },
                    { "courseId": "CS206", "courseName": "Web Design and Development",                              "type": "Lecture", "day": "Thursday" , "start": "11:30", "end": "12:30", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.م.د/ سارة شهاب"    , "notes": "" },
                    { "courseId": "CS205", "courseName": "Operating Systems-1",                                     "type": "Section", "day": "Tuesday"  , "start": "10:00", "end": "11:00", "location": "القاعة الجديدة" , "groups": ["IS Group 1"]                                            , "instructor": "م/ ديفيد كمال"       , "notes": "" },
                    { "courseId": "CS205", "courseName": "Operating Systems-1",                                     "type": "Lecture", "day": "Tuesday"  , "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.د/ ابراهيم سليم"   , "notes": "" },
                    { "courseId": "IS205", "courseName": "Introduction to Operation Research & Decision Support",   "type": "Lecture", "day": "Saturday" , "start": "12:15", "end": "13:15", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "د/ كرم السيد"        , "notes": "احتمال الميعاد يتغير" },
                    { "courseId": "IS205", "courseName": "Introduction to Operation Research & Decision Support",   "type": "Section", "day": "Wednesday", "start": "12:30", "end": "13:30", "location": "البلازا الخارجية", "groups": ["IS Group 1", "IS Group 2"]                              , "instructor": "م/ ابتهال يسري"      , "notes": "احتمال الميعاد يتغير" }
                ]
            },
            {
                "name": "IS Group 2",
                "sessions": [
                    { "courseId": "CS203", "courseName": "Computer Programming-2 (OOP)",                            "type": "Section", "day": "Tuesday"  , "start": "10:00", "end": "11:00", "location": "البلازا الخارجية", "groups": ["IS Group 2"]                                            , "instructor": "م/ نادر جمال"        , "notes": "OR ومرة Programming احتمال مرة \\ احتمال الميعاد يتغير" },
                    { "courseId": "IS201", "courseName": "Multimedia",                                              "type": "Lecture", "day": "Saturday" , "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "د/ احمد جمال"        , "notes": "احتمال الميعاد يتغير" },
                    { "courseId": "IS201", "courseName": "Multimedia",                                              "type": "Section", "day": "Wednesday", "start": "11:30", "end": "12:30", "location": "السيمينار"      , "groups": ["IS Group 2"]                                            , "instructor": "م/ نانسي عبدالحليم"  , "notes": "" },
                    { "courseId": "CS204", "courseName": "Data Structure",                                          "type": "Lecture", "day": "Tuesday"  , "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.د/ طارق مصطفي"     , "notes": "" },
                    { "courseId": "CS204", "courseName": "Data Structure",                                          "type": "Section", "day": "Wednesday", "start": "10:00", "end": "11:00", "location": "القاعة الجديدة" , "groups": ["IS Group 2"]                                            , "instructor": "م. ابراهيم عبدالله"  , "notes": "الميعاد غير مؤكد" },
                    { "courseId": "CS206", "courseName": "Web Design and Development",                              "type": "Section", "day": "Monday"   , "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["IS Group 2"]                                            , "instructor": "م.م/ عبدالله حلمي"   , "notes": "الميعاد غير مؤكد" },
                    { "courseId": "CS206", "courseName": "Web Design and Development",                              "type": "Lecture", "day": "Thursday" , "start": "11:30", "end": "12:30", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.م.د/ سارة شهاب"    , "notes": "" },
                    { "courseId": "CS205", "courseName": "Operating Systems-1",                                     "type": "Section", "day": "Tuesday"  , "start": "10:00", "end": "11:00", "location": "البلازا الخارجية", "groups": ["IS Group 2"]                                            , "instructor": "م/ نادر جمال"        , "notes": "OR ومرة Programming احتمال مرة \\ احتمال الميعاد يتغير" },
                    { "courseId": "CS205", "courseName": "Operating Systems-1",                                     "type": "Lecture", "day": "Tuesday"  , "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.د/ ابراهيم سليم"   , "notes": "" },
                    { "courseId": "IS205", "courseName": "Introduction to Operation Research & Decision Support",   "type": "Lecture", "day": "Saturday" , "start": "12:15", "end": "13:15", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "د/ كرم السيد"        , "notes": "احتمال الميعاد يتغير" },
                    { "courseId": "IS205", "courseName": "Introduction to Operation Research & Decision Support",   "type": "Section", "day": "Wednesday", "start": "12:30", "end": "13:30", "location": "البلازا الخارجية", "groups": ["IS Group 1", "IS Group 2"]                              , "instructor": "م/ ابتهال يسري"      , "notes": "احتمال الميعاد يتغير" }
                ]
            }
        ],
        "CS": [
            {
                "name": "CS Group 1",
                "sessions": [
                    { "courseId": "CS203", "courseName": "Computer Programming-2 (OOP)",                            "type": "Section", "day": "Wednesday", "start": "11:30", "end": "12:30", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2"]                              , "instructor": "م/ اسراء ماجد"       , "notes": "" },
                    { "courseId": "IS201", "courseName": "Multimedia",                                              "type": "Lecture", "day": "Saturday" , "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "د/ احمد جمال"        , "notes": "احتمال الميعاد يتغير" },
                    { "courseId": "IS201", "courseName": "Multimedia",                                              "type": "Section", "day": "Monday"   , "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1"]                                            , "instructor": "م/ مريم فياض"        , "notes": "" },
                    { "courseId": "CS204", "courseName": "Data Structure",                                          "type": "Section", "day": "Monday"   , "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["CS Group 1"]                                            , "instructor": "م/ ابراهيم عبدالله"  , "notes": "الميعاد غير مؤكد" },
                    { "courseId": "CS204", "courseName": "Data Structure",                                          "type": "Lecture", "day": "Tuesday"  , "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.د/ طارق مصطفي"     , "notes": "" },
                    { "courseId": "CS206", "courseName": "Web Design and Development",                              "type": "Section", "day": "Monday"   , "start": "12:00", "end": "13:00", "location": "البلازا الخارجية", "groups": ["CS Group 1"]                                            , "instructor": "م.م/ عبدالله حلمي"   , "notes": "الميعاد غير مؤكد" },
                    { "courseId": "CS206", "courseName": "Web Design and Development",                              "type": "Lecture", "day": "Thursday" , "start": "11:30", "end": "12:30", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.م.د/ سارة شهاب"    , "notes": "" },
                    { "courseId": "CS205", "courseName": "Operating Systems-1",                                     "type": "Lecture", "day": "Tuesday"  , "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.د/ ابراهيم سليم"   , "notes": "" },
                    { "courseId": "CS205", "courseName": "Operating Systems-1",                                     "type": "Section", "day": "Tuesday"  , "start": "10:00", "end": "11:00", "location": "القاعة الجديدة" , "groups": ["CS Group 1"]                                            , "instructor": "م/ ديفيد كمال"       , "notes": "" },
                    { "courseId": "IS205", "courseName": "Introduction to Operation Research & Decision Support",   "type": "Lecture", "day": "Saturday" , "start": "12:15", "end": "13:15", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "د/ كرم السيد"        , "notes": "احتمال الميعاد يتغير" },
                    { "courseId": "IS205", "courseName": "Introduction to Operation Research & Decision Support",   "type": "Section", "day": "Wednesday", "start": "12:30", "end": "13:30", "location": "القاعة الجديدة" , "groups": ["CS Group 1", "CS Group 2"]                              , "instructor": "م/ اسراء ماجد"       , "notes": "" }
                ]
            },
            {
                "name": "CS Group 2",
                "sessions": [
                    { "courseId": "CS203", "courseName": "Computer Programming-2 (OOP)",                            "type": "Section", "day": "Wednesday", "start": "11:30", "end": "12:30", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2"]                              , "instructor": "م/ اسراء ماجد"       , "notes": "" },
                    { "courseId": "IS201", "courseName": "Multimedia",                                              "type": "Lecture", "day": "Saturday" , "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "د/ احمد جمال"        , "notes": "احتمال الميعاد يتغير" },
                    { "courseId": "IS201", "courseName": "Multimedia",                                              "type": "Section", "day": "Wednesday", "start": "10:30", "end": "11:30", "location": "السيمينار"      , "groups": ["CS Group 2"]                                            , "instructor": "م/ نانسي عبدالحليم"  , "notes": "" },
                    { "courseId": "CS204", "courseName": "Data Structure",                                          "type": "Section", "day": "Monday"   , "start": "11:00", "end": "12:00", "location": "القاعة الجديدة" , "groups": ["CS Group 2"]                                            , "instructor": "م.م/ ابراهيم عبدالله", "notes": "الميعاد غير مؤكد" },
                    { "courseId": "CS204", "courseName": "Data Structure",                                          "type": "Lecture", "day": "Tuesday"  , "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.د/ طارق مصطفي"     , "notes": "" },
                    { "courseId": "CS206", "courseName": "Web Design and Development",                              "type": "Lecture", "day": "Thursday" , "start": "11:30", "end": "12:30", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.م.د/ سارة شهاب"    , "notes": "" },
                    { "courseId": "CS206", "courseName": "Web Design and Development",                              "type": "Section", "day": "Wednesday", "start": "09:00", "end": "10:00", "location": "البلازا الداخلية", "groups": ["CS Group 2"]                                            , "instructor": "م.م/ هبه فتحي"       , "notes": "الميعاد والمحاضر غير مؤكدان" },
                    { "courseId": "CS205", "courseName": "Operating Systems-1",                                     "type": "Lecture", "day": "Tuesday"  , "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "ا.د/ ابراهيم سليم"   , "notes": "" },
                    { "courseId": "IS205", "courseName": "Introduction to Operation Research & Decision Support",   "type": "Lecture", "day": "Saturday" , "start": "12:15", "end": "13:15", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"]  , "instructor": "د/ كرم السيد"        , "notes": "احتمال الميعاد يتغير" },
                    { "courseId": "IS205", "courseName": "Introduction to Operation Research & Decision Support",   "type": "Section", "day": "Wednesday", "start": "12:30", "end": "13:30", "location": "القاعة الجديدة" , "groups": ["CS Group 1", "CS Group 2"]                              , "instructor": "م/ اسراء ماجد"       , "notes": "" }
                ]
            }
        ]
    }
};
