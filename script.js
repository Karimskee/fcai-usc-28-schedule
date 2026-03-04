document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const deptsContainer = document.getElementById('departments-container');
    const groupsContainer = document.getElementById('groups-container');
    const coursesContainer = document.getElementById('courses-container');
    const generateBtn = document.getElementById('generate-btn');

    const stepGroup = document.getElementById('step-group');
    const stepCourses = document.getElementById('step-courses');
    const scheduleView = document.getElementById('schedule-view');
    const timetableContainer = document.getElementById('timetable-container');

    const idSearchContainer = document.getElementById('id-search-container');
    const toggleSearchBtn = document.getElementById('toggle-search-btn');
    const studentIdInput = document.getElementById('student-id-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResult = document.getElementById('search-result');

    // State Variables
    let selectedDepts = [];
    let selectedGroups = [];
    let selectedCourses = [];

    // Initialize formatting
    init();

    function init() {
        populateDepartments();

        // Event Listeners
        generateBtn.addEventListener('click', generateSchedule);
        
        toggleSearchBtn.addEventListener('click', () => {
            idSearchContainer.classList.toggle('hidden');
        });

        searchBtn.addEventListener('click', handleIdSearch);
        studentIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleIdSearch();
        });
    }

    function populateDepartments() {
        deptsContainer.innerHTML = '';
        
        scheduleData.departments.forEach(dept => {
            const label = document.createElement('label');
            label.className = 'course-checkbox-label';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = dept.id;
            checkbox.addEventListener('change', handleDeptChange);

            const span = document.createElement('span');
            span.textContent = dept.name;

            label.appendChild(checkbox);
            label.appendChild(span);
            deptsContainer.appendChild(label);
        });
    }

    function handleDeptChange(e) {
        if (e.target.checked) {
            selectedDepts.push(e.target.value);
        } else {
            selectedDepts = selectedDepts.filter(id => id !== e.target.value);
        }
        
        selectedGroups = [];
        selectedCourses = [];

        // Reset and hide downstream selectors
        groupsContainer.innerHTML = '';
        stepCourses.classList.add('hidden');
        generateBtn.classList.add('hidden');
        scheduleView.classList.add('hidden');
        idSearchContainer.classList.add('hidden');
        studentIdInput.value = '';
        searchResult.textContent = '';

        if (selectedDepts.length > 0) {
            // Populate groups for all selected departments
            let allGroups = [];
            selectedDepts.forEach(deptId => {
                const groupsForDept = scheduleData.groups[deptId] || [];
                // Add a department tag to easily identify them if groups share names across depts
                const groupedWithDeptName = groupsForDept.map(g => ({...g, deptId: deptId}));
                allGroups = [...allGroups, ...groupedWithDeptName];
            });

            if (allGroups.length > 0) {
                // Deduplicate groups by name just in case
                const uniqueGroups = Array.from(new Map(allGroups.map(item => [item.name, item])).values());
                
                uniqueGroups.forEach(group => {
                    const label = document.createElement('label');
                    label.className = 'course-checkbox-label';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = group.name;
                    checkbox.setAttribute('data-dept', group.deptId);
                    checkbox.addEventListener('change', handleGroupChange);

                    const span = document.createElement('span');
                    span.textContent = group.name;

                    label.appendChild(checkbox);
                    label.appendChild(span);
                    groupsContainer.appendChild(label);
                });
                
                stepGroup.classList.remove('hidden');
            } else {
                // If departments have no groups, skip group selection
                stepGroup.classList.add('hidden');
                populateCourses();
            }
        } else {
            stepGroup.classList.add('hidden');
        }
    }

    function handleGroupChange(e) {
        if (e.target.checked) {
            selectedGroups.push(e.target.value);
        } else {
            selectedGroups = selectedGroups.filter(name => name !== e.target.value);
        }
        
        populateCourses();
    }

    function handleIdSearch() {
        const studentId = studentIdInput.value.trim();
        if (!studentId) {
            searchResult.style.color = '#ef4444'; // Red
            searchResult.textContent = 'Please enter a Student ID.';
            return;
        }

        const mappedGroup = scheduleData.studentGroups && scheduleData.studentGroups[studentId];
        
        if (mappedGroup) {
            // Find the checkbox for this group
            const groupCheckbox = Array.from(groupsContainer.querySelectorAll('input[type="checkbox"]'))
                .find(cb => cb.value === mappedGroup);
            
            if (groupCheckbox) {
                if (!groupCheckbox.checked) {
                    groupCheckbox.checked = true;
                    selectedGroups.push(mappedGroup);
                    
                    // Manually trigger the visual update for courses
                    populateCourses();
                }
                
                searchResult.style.color = '#10b981'; // Green
                searchResult.textContent = `Found! You are in ${mappedGroup}.`;
                
                // Hide search container after a short delay
                setTimeout(() => {
                    idSearchContainer.classList.add('hidden');
                }, 1500);
            } else {
                searchResult.style.color = '#ef4444'; // Red
                searchResult.textContent = `This ID belongs to ${mappedGroup}, but that group is not currently available under your selected departments.`;
            }
        } else {
            searchResult.style.color = '#ef4444'; // Red
            searchResult.textContent = 'Student ID not found in the database. Please select your group manually.';
        }
    }

    function populateCourses() {
        coursesContainer.innerHTML = '';

        if (selectedGroups.length === 0) {
            stepCourses.classList.add('hidden');
            generateBtn.classList.add('hidden');
            return;
        }

        // Gather all sessions from all selected groups
        let allGroupSessions = [];
        
        // Find the group objects from the original data based on selected names
        selectedDepts.forEach(deptId => {
            const groupsForDept = scheduleData.groups[deptId] || [];
            groupsForDept.forEach(groupObj => {
                if (selectedGroups.includes(groupObj.name)) {
                    allGroupSessions = [...allGroupSessions, ...groupObj.sessions];
                }
            });
        });

        // Build unique available courses from sessions
        const courseMap = new Map();
        allGroupSessions.forEach(session => {
            if (!courseMap.has(session.courseId)) {
                courseMap.set(session.courseId, { id: session.courseId, name: session.courseName });
            }
        });
        const availableCourses = Array.from(courseMap.values());

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

        // Gather all sessions from all selected groups
        let allGroupSessions = [];
        selectedDepts.forEach(deptId => {
            const groupsForDept = scheduleData.groups[deptId] || [];
            groupsForDept.forEach(groupObj => {
                if (selectedGroups.includes(groupObj.name)) {
                    // Tag each session with its original group so we know where it came from
                    const sessionsWithGroup = groupObj.sessions.map(s => ({
                        ...s,
                        _sourceGroup: groupObj.name
                    }));
                    allGroupSessions = [...allGroupSessions, ...sessionsWithGroup];
                }
            });
        });

        // Deduplicate sessions that are identical (same course, type, day, start, end, location)
        // while accumulating the groups that attend them.
        const uniqueSessionsMap = new Map();

        allGroupSessions.forEach(session => {
            if (selectedCourses.includes(session.courseId)) {
                // Create a unique hash for the session
                const sessionKey = `${session.courseId}-${session.type}-${session.day}-${session.start}-${session.end}-${session.location}`;
                
                if (uniqueSessionsMap.has(sessionKey)) {
                    // Session already exists, just add this group to its groups list if not already there
                    const existingSession = uniqueSessionsMap.get(sessionKey);
                    if (!existingSession.groups.includes(session._sourceGroup)) {
                        existingSession.groups.push(session._sourceGroup);
                    }
                } else {
                    // New unique session
                    uniqueSessionsMap.set(sessionKey, {
                        ...session,
                        // Override original group array with just this source group to start,
                        // this ensures we only show the groups the student actually selected
                        groups: [session._sourceGroup] 
                    });
                }
            }
        });

        // Add deduplicated sessions to the timeline
        uniqueSessionsMap.forEach(session => {
            if (!timeline[session.day]) {
                timeline[session.day] = [];
            }
            timeline[session.day].push(session);
        });

        renderTimetable(timeline);

        // Show timetable
        scheduleView.classList.remove('hidden');
        
        // Use window.scrollTo instead of scrollIntoView to prevent the iOS/WebKit 
        // bug where the screen shakes and becomes unresponsive due to layout thrashing.
        setTimeout(() => {
            const rect = scheduleView.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            window.scrollTo({
                top: rect.top + scrollTop - 30, // 30px padding from the top
                behavior: 'smooth'
            });
        }, 100);
    }

    function renderTimetable(timeline) {
        timetableContainer.innerHTML = '';

        const daysOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        // Helper function for 12-hour format
        function formatTime12h(time24) {
            if (!time24) return '';
            if (time24 === 'غير مؤكد' || !time24.includes(':')) return time24;
            const [hours24, minutes] = time24.split(':');
            let hours = parseInt(hours24, 10);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            return `${hours}:${minutes} ${ampm}`;
        }

        // Helper function to highlight 'ONLINE' text
        function highlightOnline(text) {
            if (!text && text !== 0) return text;
            return String(text).replace(/online/gi, '<span class="highlight-online">$&</span>');
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
                        <span class="session-badge">${highlightOnline(session.type)}</span>
                        <span class="session-time"><i class="fa-regular fa-clock"></i> ${formatTime12h(session.start)}${session.end && session.end !== session.start ? ' - ' + formatTime12h(session.end) : ''}</span>
                    </div>
                    <div class="session-content">
                        <div>
                            <div class="session-title">${highlightOnline(session.courseName)} <span class="session-course-id">${session.courseId.toUpperCase()}</span></div>
                            <div class="session-details">
                                <span><i class="fa-solid fa-location-dot"></i> ${highlightOnline(session.location)}</span>
                                <span><i class="fa-solid fa-users"></i> ${highlightOnline(session.groups.join(', '))}</span>
                                <span><i class="fa-solid fa-chalkboard-user"></i> ${highlightOnline(session.instructor || 'TBA')}</span>
                                ${session.notes ? `<span><i class="fa-solid fa-circle-info"></i> ${highlightOnline(session.notes)}</span>` : ''}
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
