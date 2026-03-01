// Core Structured Schedule Data - Natively editable by the user without need for a backend.
const scheduleData = {
    "departments": [
        { "id": "IS", "name": "Information Systems (IS)" },
        { "id": "CS", "name": "Computer Science (CS)" },
        // { "id": "AI", "name": "Artificial Intelligence (AI)" }
    ],
    "groups": {
        "IS": ["IS Group 1", "IS Group 2"],
        "CS": ["CS Group 1", "CS Group 2"],
        // "AI": ["AI Group 1"]
    },
    "courses": [
        {
            "id": "CS203",
            "name": "Computer Programming-2 (OOP)",
            "departments": ["AI", "CS", "IS"],
            "sessions": [
                { "type": "Section", "day": "Tuesday", "start": "10:00", "end": "11:00", "location": "القاعة الجديدة", "groups": ["IS Group 2"], "instructor": "م/ نادر جمال", "departments": ["IS"], "notes": "OR ومرة Programming مرة" },
                { "type": "Section", "day": "Wednesday", "start": "11:30", "end": "12:30", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2"], "instructor": "م/ اسراء ماجد", "departments": ["CS"], "notes": "" },
                { "type": "Section", "day": "Thursday", "start": "09:30", "end": "10:30", "location": "قاعة (1)", "groups": ["IS Group 1"], "instructor": "م/ عبدالله حلمي", "departments": ["IS"], "notes": "" },
                // { "type": "Lecture", "day": "Thursday", "start": "11:30", "end": "12:30", "location": "البلازا الداخلية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"], "instructor": "ا.م.د/ سارة شهاب", "departments": ["CS", "IS"], "notes": "" },
                // { "type": "Lecture", "day": "Sunday", "start": "11:00", "end": "13:00", "location": "قاعة(1)", "groups": ["AI Group 1"], "instructor": "ا.م.د/ سارة شهاب", "departments": ["AI"], "notes": "" },
                // { "type": "Section", "day": "Saturday", "start": "09:00", "end": "11:00", "location": "معمل سيسكو", "groups": ["AI Group 1"], "instructor": "م/ سارة سمير", "departments": ["AI"], "notes": "" },
            ]
        },
        {
            "id": "IS201",
            "name": "Multimedia",
            "departments": ["AI", "CS", "IS"],
            "sessions": [
                { "type": "Lecture", "day": "Saturday", "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"], "instructor": "د/ احمد جمال", "departments": ["CS", "IS"], "notes": "" },
                { "type": "Section", "day": "Monday", "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1"], "instructor": "م/ مريم فياض", "departments": ["CS"], "notes": "" },
                { "type": "Section", "day": "Monday", "start": "10:00", "end": "11:00", "location": "البلازا الخارجية", "groups": ["IS Group 1"], "instructor": "م/ مريم فياض", "departments": ["IS"], "notes": "" },
                { "type": "Section", "day": "Wednesday", "start": "10:30", "end": "11:30", "location": "السيمينار", "groups": ["CS Group 2"], "instructor": "م/ نانسي عبدالحليم", "departments": ["CS"], "notes": "" },
                { "type": "Section", "day": "Wednesday", "start": "11:30", "end": "12:30", "location": "السيمينار", "groups": ["IS Group 2"], "instructor": "م/ نانسي عبدالحليم", "departments": ["IS"], "notes": "" },
                // { "type": "Lecture", "day": "Saturday", "start": "11:00", "end": "13:00", "location": "قاعة(2)", "groups": ["AI Group 1"], "instructor": "د/ احمد جمال", "departments": ["AI"], "notes": "" },
                // { "type": "Section", "day": "Sunday", "start": "13:00", "end": "15:00", "location": "قاعة(2)", "groups": ["AI Group 1"], "instructor": "م.م/ احمد عبدالسلام, م/ مريم فياض", "departments": ["AI"], "notes": "" },
            ]
        },
        {
            "id": "CS204",
            "name": "Data Structure",
            "departments": ["AI", "CS", "IS"],
            "sessions": [
                { "type": "Section", "day": "Monday", "start": "11:00", "end": "12:00", "location": "القاعة الجديدة", "groups": ["CS Group 2"], "instructor": "م.م/ ابراهيم عبدالله", "departments": ["CS"], "notes": "الميعاد غير مؤكد" },
                { "type": "Section", "day": "Monday", "start": "12:00", "end": "13:00", "location": "البلازا الخارجية", "groups": ["CS Group 1"], "instructor": "م/ ابراهيم عبدالله", "departments": ["CS"], "notes": "الميعاد غير مؤكد" },
                { "type": "Lecture", "day": "Tuesday", "start": "09:00", "end": "10:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"], "instructor": "ا.د/ طارق مصطفي", "departments": ["CS", "IS"], "notes": "" },
                { "type": "Section", "day": "Wednesday", "start": "10:00", "end": "11:00", "location": "البلازا الخارجية", "groups": ["IS Group 1"], "instructor": "م.م/ هبه فتحي", "departments": ["IS"], "notes": "الميعاد غير مؤكد" },
                { "type": "Section", "day": "Wednesday", "start": "10:00", "end": "11:00", "location": "القاعة الجديدة", "groups": ["IS Group 2"], "instructor": "م. ابراهيم عبدالله", "departments": ["IS"], "notes": "الميعاد غير مؤكد" },
                // { "type": "Lecture", "day": "Tuesday", "start": "13:00", "end": "15:00", "location": "قاعة(2)", "groups": ["AI Group 1"], "instructor": "ا.د/ طارق مصطفي", "departments": ["AI"], "notes": "" },
                // { "type": "Section", "day": "Saturday", "start": "13:00", "end": "15:00", "location": "قاعة(1)", "groups": ["AI Group 1"], "instructor": "م/ ابراهيم عبدالله", "departments": ["AI"], "notes": "" },
            ]
        },
        {
            "id": "CS209",
            "name": "Data Visualization and Dashboards",
            "departments": ["AI"],
            "sessions": [
                // { "type": "Lecture", "day": "Sunday", "start": "09:00", "end": "11:00", "location": "قاعة(1)", "groups": ["AI Group 1"], "instructor": "د/ احمد جمال", "departments": ["AI"], "notes": "" },
                // { "type": "Section", "day": "Wednesday", "start": "11:00", "end": "13:00", "location": "قاعة(2)", "groups": ["AI Group 1"], "instructor": "م/ ايه الملاح", "departments": ["AI"], "notes": "" },
            ]
        },
        {
            "id": "CS206",
            "name": "Web Design and Development",
            "departments": ["AI", "CS", "IS"],
            "sessions": [
                // { "type": "Section", "day": "Saturday", "start": "13:15", "end": "14:15", "location": "البلازا الخارجية", "groups": ["CS Group 1", "IS Group 2"], "instructor": "م/ عبدالله حلمي", "departments": ["CS", "IS"], "notes": "" },
                { "type": "Section", "day": "Monday", "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["IS Group 1"], "instructor": "م.م/ هبه فتحي", "departments": ["IS"], "notes": "الميعاد والمحاضر غير مؤكدان" },
                { "type": "Section", "day": "Monday", "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["IS Group 2"], "instructor": "م.م/ ابراهيم عبدالله", "departments": ["IS"], "notes": "الميعاد غير مؤكد" },
                { "type": "Lecture", "day": "Thursday", "start": "11:30", "end": "12:30", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"], "instructor": "ا.م.د/ سارة شهاب", "departments": ["CS", "IS"], "notes": "" },
                { "type": "Section", "day": "Wednesday", "start": "09:00", "end": "10:00", "location": "البلازا الداخلية", "groups": ["CS Group 2"], "instructor": "م.م/ هبه فتحي", "departments": ["CS"], "notes": "الميعاد والمحاضر غير مؤكدان" },
                // { "type": "Lecture", "day": "Sunday", "start": "15:00", "end": "17:00", "location": "قاعة(1)", "groups": ["AI Group 1"], "instructor": "ا.م.د/ سارة شهاب", "departments": ["AI"], "notes": "" },
                // { "type": "Section", "day": "Wednesday", "start": "09:00", "end": "11:00", "location": "قاعة(2)", "groups": ["AI Group 1"], "instructor": "م/ ابراهيم عبدالله", "departments": ["AI"], "notes": "" },
            ]
        },
        {
            "id": "CS205",
            "name": "Operating Systems-1",
            "departments": ["AI", "CS", "IS"],
            "sessions": [
                { "type": "Section", "day": "Tuesday", "start": "10:00", "end": "11:00", "location": "القاعة الجديدة", "groups": ["IS Group 1"], "instructor": "م/ ديفيد كمال", "departments": ["IS"], "notes": "" },
                { "type": "Section", "day": "Tuesday", "start": "10:00", "end": "11:00", "location": "البلازا الخارجية", "groups": ["IS Group 2"], "instructor": "م/ نادر جمال", "departments": ["IS"], "notes": "OR ومرة Programming مرة" },
                { "type": "Lecture", "day": "Tuesday", "start": "11:00", "end": "12:00", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"], "instructor": "ا.د/ ابراهيم سليم", "departments": ["CS", "IS"], "notes": "" },
                { "type": "Section", "day": "Tuesday", "start": "10:00", "end": "11:00", "location": "القاعة الجديدة", "groups": ["CS Group 1"], "instructor": "م/ ديفيد كمال", "departments": ["CS"], "notes": "" },
                { "type": "Section", "day": "Wednesday", "start": "09:00", "end": "10:00", "location": "القاعة الجديدة", "groups": ["CS Group 1"], "instructor": "م.م/ سلمى رأفت", "departments": ["CS"], "notes": "" },
                // { "type": "Section", "day": "Tuesday", "start": "09:00", "end": "11:00", "location": "قاعة(2)", "groups": ["AI Group 1"], "instructor": "م/ ديفيد كمال", "departments": ["AI"], "notes": "" },
                // { "type": "Lecture", "day": "Wednesday", "start": "15:00", "end": "17:00", "location": "قاعة(1)", "groups": ["AI Group 1"], "instructor": "ا.د/ ابراهيم سليم", "departments": ["AI"], "notes": "" },
            ]
        },
        {
            "id": "IS205",
            "name": "Introduction to Operation Research & Decision Support",
            "departments": ["CS", "IS"],
            "sessions": [
                { "type": "Lecture", "day": "Saturday", "start": "12:15", "end": "13:15", "location": "البلازا الخارجية", "groups": ["CS Group 1", "CS Group 2", "IS Group 1", "IS Group 2"], "instructor": "د/ كرم السيد", "departments": ["CS", "IS"], "notes": "احتمال الميعاد يتغير" },
                { "type": "Section", "day": "Wednesday", "start": "12:30", "end": "13:30", "location": "القاعة الجديدة", "groups": ["CS Group 1", "CS Group 2"], "instructor": "م/ اسراء ماجد", "departments": ["CS"], "notes": "" },
                { "type": "Section", "day": "Wednesday", "start": "12:30", "end": "13:30", "location": "البلازا الخارجية", "groups": ["IS Group 1", "IS Group 2"], "instructor": "م/ ابتهال يسري", "departments": ["CS", "IS"], "notes": "" },
            ]
        }
    ]
};
