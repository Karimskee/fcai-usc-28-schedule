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
    
    // Database instance
    let db = null;

    // Initialize formatting
    initDB();

    async function initDB() {
        try {
            const sqlPromise = initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
            });
            const dataPromise = fetch("data.db").then(res => res.arrayBuffer());
            const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
            db = new SQL.Database(new Uint8Array(buf));
            init();
        } catch (error) {
            console.error("Failed to load database:", error);
            deptsContainer.innerHTML = '<p class="subtitle" style="color:#ef4444">Failed to load database. Please try again later.</p>';
        }
    }

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
        
        try {
            const res = db.exec("SELECT * FROM departments");
            if (res.length > 0) {
                res[0].values.forEach(row => {
                    const deptId = row[0];
                    const deptName = row[1];
                    const label = document.createElement('label');
                    label.className = 'course-checkbox-label';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = deptId;
                    checkbox.addEventListener('change', handleDeptChange);

                    const span = document.createElement('span');
                    span.textContent = deptName;

                    label.appendChild(checkbox);
                    label.appendChild(span);
                    deptsContainer.appendChild(label);
                });
            }
        } catch (e) {
            console.error("Error fetching departments", e);
        }
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
            
            const placeholders = selectedDepts.map(() => '?').join(',');
            try {
                // Get sections for selected departments
                const res = db.exec(`SELECT name, department_id FROM sections WHERE department_id IN (${placeholders})`, selectedDepts);
                if (res.length > 0) {
                    allGroups = res[0].values.map(row => ({ name: row[0], deptId: row[1] }));
                }
            } catch (e) {
                console.error(e);
            }

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

        let mappedGroup = null;
        try {
            const res = db.exec("SELECT group_name FROM student_groups WHERE student_id = ?", [studentId]);
            if (res.length > 0 && res[0].values.length > 0) {
                mappedGroup = res[0].values[0][0];
            }
        } catch (e) {
            console.error(e);
        }
        
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
        
        try {
            const likeClauses = selectedGroups.map(() => 'groups LIKE ?').join(' OR ');
            const likeParams = selectedGroups.map(g => `%${g}%`);
            const res = db.exec(`SELECT course_id, course_name FROM sessions WHERE (${likeClauses}) AND is_visible = 1`, likeParams);
            if (res.length > 0) {
                res[0].values.forEach(row => {
                    allGroupSessions.push({
                        courseId: row[0],
                        courseName: row[1]
                    });
                });
            }
        } catch (e) {
             console.error(e);
        }

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

        // Gather all sessions from all groups for the selected courses
        let allCourseSessions = [];
        try {
            const coursePlaceholders = selectedCourses.map(() => '?').join(',');
            // We now query WITHOUT filtering by group_name upfront.
            // This ensures we fetch the session rows for ALL groups that share these courses.
            const query = `
                SELECT groups, course_id, course_name, type, day, start_time, end_time, location, instructor, notes 
                FROM sessions 
                WHERE course_id IN (${coursePlaceholders}) AND is_visible = 1
            `;
            const res = db.exec(query, selectedCourses);
            if (res.length > 0) {
                 res[0].values.forEach(row => {
                      const groupString = row[0];
                      const sessionGroups = groupString ? groupString.split(',').map(s => s.trim()) : [];
                      
                      sessionGroups.forEach(g => {
                          allCourseSessions.push({
                               _sourceGroup: g,
                               courseId: row[1],
                               courseName: row[2],
                               type: row[3],
                               day: row[4],
                               start: row[5],
                               end: row[6],
                               location: row[7],
                               instructor: row[8],
                               notes: row[9]
                          });
                      });
                 });
            }
        } catch (e) {
             console.error(e);
        }

        // Deduplicate sessions that are identical (same course, type, day, start, end, location)
        // while accumulating ALL the groups that attend them.
        const uniqueSessionsMap = new Map();

        allCourseSessions.forEach(session => {
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
                    // Start the groups array with the source group
                    groups: [session._sourceGroup] 
                });
            }
        });

        // Filter the deduplicated sessions to only those that the user's selected groups actually attend
        const mySessions = [];
        uniqueSessionsMap.forEach(session => {
            // Check if at least one of the session's groups is in the user's selectedGroups
            const isAttendedBySelectedGroup = session.groups.some(g => selectedGroups.includes(g));
            if (isAttendedBySelectedGroup) {
                // We sort the groups alphabetically for clean display
                session.groups.sort();
                mySessions.push(session);
            }
        });

        // Group by Timestamp
        const timelineByTs = new Map();
        
        const weekDaysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        function parseDayToTimestamp(dayStr) {
            if (!dayStr) return null;
            const idx = weekDaysList.indexOf(dayStr);
            if (idx !== -1) {
                const today = new Date();
                today.setHours(0,0,0,0);
                const todayIdx = today.getDay();
                let diff = idx - todayIdx;
                if (diff < 0) diff += 7;
                const target = new Date(today);
                target.setDate(today.getDate() + diff);
                return target.getTime();
            }
            const d = new Date(dayStr);
            if (!isNaN(d.getTime())) {
                d.setHours(0,0,0,0);
                return d.getTime();
            }
            return null;
        }

        // Add my sessions to the timeline
        mySessions.forEach(session => {
            const ts = parseDayToTimestamp(session.day);
            if (ts) {
                if (!timelineByTs.has(ts)) {
                    timelineByTs.set(ts, []);
                }
                timelineByTs.get(ts).push(session);
            }
        });

        renderTimetable(timelineByTs);

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

    function renderTimetable(timelineByTs) {
        timetableContainer.innerHTML = '';

        const weekDaysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        function formatTimestampToTitle(ts) {
            const dateObj = new Date(ts);
            const weekdayName = weekDaysList[dateObj.getDay()];
            const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()}`;
            return `${weekdayName} ${formattedDate}`;
        }

        // Helper function for 12-hour format
        function formatTime12h(time24) {
            if (!time24) return 'غير محدد';
            if (time24 === 'غير مؤكد' || time24 === 'غير محدد' || !time24.includes(':')) return time24;
            const [hours24, minutes] = time24.split(':');
            let hours = parseInt(hours24, 10);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            return `${hours}:${minutes} ${ampm}`;
        }

        // Helper function to highlight text enclosed in backticks
        function highlightText(text) {
            if (!text && text !== 0) return text;
            
            // Matches text between backticks
            const regex = /`([^`]+)`/g;
            
            return String(text).replace(regex, (match, p1) => {
                return `<span class="highlight-badge">${p1}</span>`;
            });
        }

        // Sort timestamps chronologically
        const activeTimestamps = Array.from(timelineByTs.keys()).sort((a, b) => a - b);

        if (activeTimestamps.length === 0) {
            timetableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-mug-hot" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-secondary);"></i>
                    <p>No sessions found for your selection. You have a free schedule!</p>
                </div>
            `;
            return;
        }

        activeTimestamps.forEach(ts => {
            const daySessions = timelineByTs.get(ts);
            
            // Sort sessions in the day by start time
            daySessions.sort((a, b) => a.start.localeCompare(b.start));

            const dayGroup = document.createElement('div');
            dayGroup.className = 'day-group';

            // Icon logic based on day
            let icon = 'fa-calendar-day';

            const displayTitle = formatTimestampToTitle(ts);
            
            const headerContainer = document.createElement('div');
            headerContainer.style.display = 'flex';
            headerContainer.style.justifyContent = 'space-between';
            headerContainer.style.alignItems = 'center';
            headerContainer.style.marginBottom = '1.2rem';

            const dayHeader = document.createElement('h3');
            dayHeader.className = 'day-title';
            dayHeader.style.marginBottom = '0';
            dayHeader.innerHTML = `<i class="fa-solid ${icon}"></i> ${displayTitle}`;
            
            const copyImgBtn = document.createElement('button');
            copyImgBtn.className = 'view-btn';
            copyImgBtn.innerHTML = '<i class="fa-solid fa-camera"></i> Copy Image';
            copyImgBtn.style.padding = '0.4rem 0.8rem';
            copyImgBtn.style.fontSize = '0.85rem';
            copyImgBtn.style.display = 'flex';
            copyImgBtn.style.alignItems = 'center';
            copyImgBtn.style.gap = '0.4rem';
            
            copyImgBtn.addEventListener('click', async () => {
                const originalText = copyImgBtn.innerHTML;
                copyImgBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Copying...';
                copyImgBtn.disabled = true;
                
                try {
                    copyImgBtn.style.visibility = 'hidden';
                    const originalPadding = dayGroup.style.padding;
                    const originalRadius = dayGroup.style.borderRadius;
                    const originalBg = dayGroup.style.background;
                    const originalBorder = dayGroup.style.border;
                    
                    dayGroup.style.padding = '1.5rem';
                    dayGroup.style.borderRadius = '12px';
                    dayGroup.style.background = '#0d1117'; 
                    dayGroup.style.border = '1px solid rgba(48, 54, 61, 0.5)';
                    
                    const canvas = await html2canvas(dayGroup, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#0d1117'
                    });
                    
                    dayGroup.style.padding = originalPadding;
                    dayGroup.style.borderRadius = originalRadius;
                    dayGroup.style.background = originalBg;
                    dayGroup.style.border = originalBorder;
                    copyImgBtn.style.visibility = 'visible';
                    
                    canvas.toBlob(async (blob) => {
                        try {
                            const item = new ClipboardItem({ 'image/png': blob });
                            await navigator.clipboard.write([item]);
                            copyImgBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                            setTimeout(() => {
                                copyImgBtn.innerHTML = originalText;
                                copyImgBtn.disabled = false;
                            }, 2000);
                        } catch (err) {
                            console.error('Clipboard write failed:', err);
                            copyImgBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Failed';
                            setTimeout(() => {
                                copyImgBtn.innerHTML = originalText;
                                copyImgBtn.disabled = false;
                            }, 3000);
                        }
                    }, 'image/png');
                } catch (err) {
                    console.error('html2canvas failed:', err);
                    copyImgBtn.style.visibility = 'visible';
                    copyImgBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Error';
                    setTimeout(() => {
                        copyImgBtn.innerHTML = originalText;
                        copyImgBtn.disabled = false;
                    }, 2000);
                }
            });

            headerContainer.appendChild(dayHeader);
            headerContainer.appendChild(copyImgBtn);
            dayGroup.appendChild(headerContainer);

            const sessionsList = document.createElement('div');
            sessionsList.className = 'sessions-list';

            daySessions.forEach(session => {
                const card = document.createElement('div');
                card.className = `session-card ${session.type.toLowerCase()}`;

                card.innerHTML = `
                    <div class="session-header">
                        <span class="session-badge">${highlightText(session.type)}</span>
                        <span class="session-time"><i class="fa-regular fa-clock"></i> ${(!session.start && !session.end) ? 'غير محدد' : (session.start === session.end ? formatTime12h(session.start) : `${formatTime12h(session.start)} - ${formatTime12h(session.end)}`)}</span>
                    </div>
                    <div class="session-content">
                        <div>
                            <div class="session-title">${highlightText(session.courseName)} <span class="session-course-id">${session.courseId.toUpperCase()}</span></div>
                            <div class="session-details">
                                <span><i class="fa-solid fa-location-dot"></i> ${highlightText(session.location)}</span>
                                <span><i class="fa-solid fa-users"></i> ${highlightText(session.groups.join(', '))}</span>
                                <span><i class="fa-solid fa-chalkboard-user"></i> ${highlightText(session.instructor || 'TBA')}</span>
                                ${session.notes ? `<span><i class="fa-solid fa-circle-info"></i> ${highlightText(session.notes)}</span>` : ''}
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
