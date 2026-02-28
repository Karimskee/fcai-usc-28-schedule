document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const deptSelect = document.getElementById('department-select');
    const groupSelect = document.getElementById('group-select');
    const coursesContainer = document.getElementById('courses-container');
    const generateBtn = document.getElementById('generate-btn');

    const stepGroup = document.getElementById('step-group');
    const stepCourses = document.getElementById('step-courses');
    const scheduleView = document.getElementById('schedule-view');
    const timetableContainer = document.getElementById('timetable-container');

    // State Variables
    let selectedDept = null;
    let selectedGroup = null;
    let selectedCourses = [];

    // Initialize formatting
    init();

    function init() {
        populateDepartments();

        // Event Listeners
        deptSelect.addEventListener('change', handleDeptChange);
        groupSelect.addEventListener('change', handleGroupChange);
        generateBtn.addEventListener('click', generateSchedule);
    }

    function populateDepartments() {
        scheduleData.departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            deptSelect.appendChild(option);
        });
    }

    function handleDeptChange(e) {
        selectedDept = e.target.value;
        selectedGroup = null;
        selectedCourses = [];

        // Reset and hide downstream selectors
        groupSelect.innerHTML = '<option value="" disabled selected>Choose Group</option>';
        stepCourses.classList.add('hidden');
        generateBtn.classList.add('hidden');
        scheduleView.classList.add('hidden');

        // Populate groups for the selected department
        const groups = scheduleData.groups[selectedDept] || [];

        if (groups.length > 0) {
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group;
                option.textContent = group;
                groupSelect.appendChild(option);
            });
            stepGroup.classList.remove('hidden');
        } else {
            // If department has no groups, skip group selection
            stepGroup.classList.add('hidden');
            populateCourses();
        }
    }

    function handleGroupChange(e) {
        selectedGroup = e.target.value;
        populateCourses();
    }

    function populateCourses() {
        coursesContainer.innerHTML = '';

        // Find courses that belong to the selected department
        const availableCourses = scheduleData.courses.filter(course =>
            course.departments.includes(selectedDept)
        );

        if (availableCourses.length === 0) {
            coursesContainer.innerHTML = '<p class="subtitle">No courses available for this department.</p>';
        } else {
            // Add Select All Checkbox
            const selectAllLabel = document.createElement('label');
            selectAllLabel.className = 'course-checkbox-label select-all-label';

            const selectAllCheckbox = document.createElement('input');
            selectAllCheckbox.type = 'checkbox';
            selectAllCheckbox.id = 'select-all-courses';
            selectAllCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                const courseCheckboxes = coursesContainer.querySelectorAll('input[type="checkbox"]:not(#select-all-courses)');

                courseCheckboxes.forEach(cb => {
                    cb.checked = isChecked;
                    // Trigger the individual selection logic manually
                    if (isChecked && !selectedCourses.includes(cb.value)) {
                        selectedCourses.push(cb.value);
                    } else if (!isChecked) {
                        selectedCourses = selectedCourses.filter(id => id !== cb.value);
                    }
                });
                updateGenerateButton();
            });

            const selectAllSpan = document.createElement('span');
            selectAllSpan.textContent = 'Select All Courses';
            selectAllSpan.style.fontWeight = '700';
            selectAllSpan.style.color = 'var(--accent-color)';

            selectAllLabel.appendChild(selectAllCheckbox);
            selectAllLabel.appendChild(selectAllSpan);
            coursesContainer.appendChild(selectAllLabel);

            // Add Individual Course Checkboxes
            availableCourses.forEach(course => {
                const label = document.createElement('label');
                label.className = 'course-checkbox-label';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = course.id;
                checkbox.addEventListener('change', (e) => {
                    handleCourseSelection(e);

                    // Update Select All checkbox state
                    const allCourseCheckboxes = Array.from(coursesContainer.querySelectorAll('input[type="checkbox"]:not(#select-all-courses)'));
                    const allChecked = allCourseCheckboxes.every(cb => cb.checked);
                    const someChecked = allCourseCheckboxes.some(cb => cb.checked);

                    const selectAllCb = document.getElementById('select-all-courses');
                    if (selectAllCb) {
                        selectAllCb.checked = allChecked;
                        selectAllCb.indeterminate = someChecked && !allChecked;
                    }
                });

                const span = document.createElement('span');
                span.textContent = course.name;

                label.appendChild(checkbox);
                label.appendChild(span);
                coursesContainer.appendChild(label);
            });
        }

        stepCourses.classList.remove('hidden');
        generateBtn.classList.remove('hidden');
        updateGenerateButton();
    }

    function handleCourseSelection(e) {
        if (e.target.checked) {
            selectedCourses.push(e.target.value);
        } else {
            selectedCourses = selectedCourses.filter(id => id !== e.target.value);
        }
        updateGenerateButton();
    }

    function updateGenerateButton() {
        if (selectedCourses.length > 0) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        }
    }

    function generateSchedule() {
        // Build personalized schedule data
        const timeline = {};

        // Filter sessions based on selected courses and group
        scheduleData.courses.forEach(course => {
            if (selectedCourses.includes(course.id)) {

                const relevantSessions = course.sessions.filter(session => {
                    // Check if the session is for all groups, or if it matches the student's group
                    // AND ensure the session is for the selected department
                    return session.groups.includes(selectedGroup) && (!session.departments || session.departments.includes(selectedDept));
                });

                relevantSessions.forEach(session => {
                    if (!timeline[session.day]) {
                        timeline[session.day] = [];
                    }
                    timeline[session.day].push({
                        courseId: course.id,
                        courseName: course.name,
                        ...session
                    });
                });
            }
        });

        renderTimetable(timeline);

        // Show timetable
        scheduleView.classList.remove('hidden');
        // Scroll to timetable
        scheduleView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderTimetable(timeline) {
        timetableContainer.innerHTML = '';

        const daysOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        // Helper function for 12-hour format
        function formatTime12h(time24) {
            const [hours24, minutes] = time24.split(':');
            let hours = parseInt(hours24, 10);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            return `${hours}:${minutes} ${ampm}`;
        }

        // Sort days of the week
        const activeDays = Object.keys(timeline).sort((a, b) => {
            return daysOrder.indexOf(a) - daysOrder.indexOf(b);
        });

        if (activeDays.length === 0) {
            timetableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-mug-hot" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-secondary);"></i>
                    <p>No sessions found for your selection. You have a free schedule!</p>
                </div>
            `;
            return;
        }

        activeDays.forEach(day => {
            // Sort sessions in the day by start time
            timeline[day].sort((a, b) => a.start.localeCompare(b.start));

            const dayGroup = document.createElement('div');
            dayGroup.className = 'day-group';

            // Icon logic based on day
            let icon = 'fa-calendar-day';

            const dayHeader = document.createElement('h3');
            dayHeader.className = 'day-title';
            dayHeader.innerHTML = `<i class="fa-solid ${icon}"></i> ${day}`;
            dayGroup.appendChild(dayHeader);

            const sessionsList = document.createElement('div');
            sessionsList.className = 'sessions-list';

            timeline[day].forEach(session => {
                const card = document.createElement('div');
                card.className = `session-card ${session.type.toLowerCase()}`;

                card.innerHTML = `
                    <div class="session-header">
                        <span class="session-badge">${session.type}</span>
                        <span class="session-time"><i class="fa-regular fa-clock"></i> ${formatTime12h(session.start)} - ${formatTime12h(session.end)}</span>
                    </div>
                    <div class="session-content">
                        <div>
                            <div class="session-title">${session.courseName} <span class="session-course-id">${session.courseId.toUpperCase()}</span></div>
                            <div class="session-details">
                                <span><i class="fa-solid fa-location-dot"></i> ${session.location}</span>
                                <span><i class="fa-solid fa-users"></i> ${session.groups.join(', ')}</span>
                                <span><i class="fa-solid fa-chalkboard-user"></i> ${session.instructor || 'TBA'}</span>
                                ${session.notes ? `<span><i class="fa-solid fa-circle-info"></i> ${session.notes}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;

                sessionsList.appendChild(card);
            });

            dayGroup.appendChild(sessionsList);
            timetableContainer.appendChild(dayGroup);
        });
    }
});
