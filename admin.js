document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('github-token');
    const connectBtn = document.getElementById('connect-btn');
    const authStatus = document.getElementById('auth-status');
    const authSection = document.getElementById('auth-section');
    const editorSection = document.getElementById('editor-section');
    
    const timetableContainer = document.getElementById('timetable-container');
    const commitBtn = document.getElementById('commit-btn');
    const commitStatus = document.getElementById('commit-status');

    // Modals
    const sessionModal = document.getElementById('session-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const sessionForm = document.getElementById('session-form');
    const modalTitle = document.getElementById('modal-title');

    const optionsModal = document.getElementById('options-modal');
    const closeOptionsBtn = document.getElementById('close-options-btn');
    const manageOptionsBtn = document.getElementById('manage-options-btn');

    const REPO_OWNER = 'Karimskee';
    const REPO_NAME = 'fcai-usc-28-schedule';
    const FILE_PATH = 'data.db';
    
    let db = null;
    let currentSha = null;
    let githubToken = '';
    
    let uniqueTypes = new Set();
    let uniqueInstructors = new Set();
    let uniqueGroups = new Set();
    let uniqueCourses = [];
    let customDates = [];

    const daysOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekDaysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    document.getElementById('add-date-btn').addEventListener('click', () => {
        const dStr = prompt("Enter a specific date (YYYY-MM-DD):");
        if (!dStr) return;
        const d = new Date(dStr);
        if (isNaN(d.getTime())) {
            alert("Invalid date format. Please use YYYY-MM-DD.");
            return;
        }
        d.setHours(0,0,0,0);
        customDates.push(d.getTime());
        renderTimetable();
    });

    window.removeCustomDate = function(ts) {
        if (!confirm("Are you sure you want to remove this date? This will delete ALL sessions scheduled on this exact date.")) return;
        
        try {
            const res = db.exec("SELECT id, day FROM sessions");
            const idsToDelete = [];
            if (res.length > 0) {
                res[0].values.forEach(row => {
                    const dTs = parseDayToTimestamp(row[1]);
                    if (dTs === ts) idsToDelete.push(row[0]);
                });
            }
            if (idsToDelete.length > 0) {
                db.run(`DELETE FROM sessions WHERE id IN (${idsToDelete.join(',')})`);
            }
            
            customDates = customDates.filter(t => t !== ts);
            renderTimetable();
        } catch(e) {
            alert("Error removing date: " + e.message);
        }
    };

    function showStatus(el, msg, type) {
        el.textContent = msg;
        el.className = `status-msg ${type}`;
        el.style.display = 'block';
    }

    function base64ToUint8Array(base64) {
        const raw = window.atob(base64);
        const rawLength = raw.length;
        const array = new Uint8Array(new ArrayBuffer(rawLength));
        for (let i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    }

    function uint8ArrayToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // 1. Connect and Load DB
    connectBtn.addEventListener('click', async () => {
        githubToken = tokenInput.value.trim();
        if (!githubToken) {
            showStatus(authStatus, 'Please enter a valid token.', 'error');
            return;
        }

        connectBtn.disabled = true;
        connectBtn.textContent = 'Connecting...';
        showStatus(authStatus, 'Fetching database from GitHub...', 'info');

        try {
            const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);

            const data = await response.json();
            currentSha = data.sha;
            
            const base64Content = data.content.replace(/\n/g, '');
            const uInt8Array = base64ToUint8Array(base64Content);

            const SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
            });
            
            db = new SQL.Database(uInt8Array);
            
            // Ensure necessary tables exist
            db.run("CREATE TABLE IF NOT EXISTS session_types (name TEXT PRIMARY KEY);");
            db.run("CREATE TABLE IF NOT EXISTS instructors (name TEXT PRIMARY KEY);");
            db.run("CREATE TABLE IF NOT EXISTS courses (id TEXT, name TEXT);");
            
            // Seed them from existing sessions to maintain current data
            db.run("INSERT OR IGNORE INTO session_types (name) SELECT DISTINCT type FROM sessions WHERE type IS NOT NULL AND type != '';");
            db.run("INSERT OR IGNORE INTO instructors (name) SELECT DISTINCT instructor FROM sessions WHERE instructor IS NOT NULL AND instructor != '';");
            db.run(`
                INSERT INTO courses (id, name) 
                SELECT DISTINCT course_id, course_name FROM sessions 
                WHERE course_name IS NOT NULL AND course_name != '' 
                AND NOT EXISTS (
                    SELECT 1 FROM courses c WHERE c.name = sessions.course_name AND (c.id = sessions.course_id OR (c.id IS NULL AND sessions.course_id IS NULL))
                );
            `);
            
            showStatus(authStatus, 'Database loaded successfully!', 'success');
            
            setTimeout(() => {
                authSection.classList.add('hidden');
                editorSection.classList.remove('hidden');
                extractOptions();
                renderTimetable();
            }, 1000);

        } catch (error) {
            console.error(error);
            showStatus(authStatus, error.message, 'error');
        } finally {
            connectBtn.disabled = false;
            connectBtn.textContent = 'Connect & Load Database';
        }
    });
    
    // 2. Extract Options
    function extractOptions() {
        uniqueTypes.clear();
        uniqueInstructors.clear();
        uniqueGroups.clear();
        uniqueCourses = [];
        
        try {
            const res = db.exec("SELECT DISTINCT name FROM session_types WHERE name IS NOT NULL AND name != ''");
            if (res.length > 0) res[0].values.forEach(row => uniqueTypes.add(row[0]));
            
            const res2 = db.exec("SELECT DISTINCT name FROM instructors WHERE name IS NOT NULL AND name != ''");
            if (res2.length > 0) res2[0].values.forEach(row => uniqueInstructors.add(row[0]));

            // Read groups from sections table as primary source
            const res3 = db.exec("SELECT DISTINCT name FROM sections WHERE name IS NOT NULL AND name != ''");
            if (res3.length > 0) res3[0].values.forEach(row => uniqueGroups.add(row[0]));
            
            const res4 = db.exec("SELECT DISTINCT id, name FROM courses WHERE name IS NOT NULL AND name != ''");
            if (res4.length > 0) {
                res4[0].values.forEach(row => {
                    uniqueCourses.push({ id: row[0] || '', name: row[1] });
                });
            }
            
            populateSelects();
        } catch (e) {
            console.error("Error extracting options:", e);
        }
    }
    
    function populateSelects() {
        const typeSelect = document.getElementById('form-type');
        const instSelect = document.getElementById('form-instructor');
        const groupsContainer = document.getElementById('form-groups-container');
        const courseSelect = document.getElementById('form-course-name');
        
        typeSelect.innerHTML = '<option value="">-- Select Type --</option>';
        instSelect.innerHTML = '<option value="">-- Select Instructor --</option>';
        courseSelect.innerHTML = '<option value="">-- Select Course --</option>';
        groupsContainer.innerHTML = '';
        
        Array.from(uniqueTypes).sort().forEach(t => {
            typeSelect.innerHTML += `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`;
        });
        
        Array.from(uniqueInstructors).sort().forEach(i => {
            instSelect.innerHTML += `<option value="${escapeHtml(i)}">${escapeHtml(i)}</option>`;
        });

        Array.from(uniqueGroups).sort().forEach(g => {
            const safeG = escapeHtml(g);
            groupsContainer.innerHTML += `
                <label class="checkbox-item">
                    <input type="checkbox" value="${safeG}" class="group-checkbox"> ${safeG}
                </label>
            `;
        });
        
        uniqueCourses.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
            const display = c.id ? `${c.name} (${c.id})` : c.name;
            courseSelect.innerHTML += `<option value="${escapeHtml(c.name)}" data-cid="${escapeHtml(c.id)}">${escapeHtml(display)}</option>`;
        });
    }

    // Auto-fill Course ID
    document.getElementById('form-course-name').addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption && selectedOption.dataset.cid) {
            document.getElementById('form-course-id').value = selectedOption.dataset.cid;
        }
    });

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatTime12h(time24) {
        if (!time24) return '';
        if (time24 === 'غير مؤكد' || !time24.includes(':')) return time24;
        const [hours24, minutes] = time24.split(':');
        let hours = parseInt(hours24, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    function enforce24hFormat(timeStr) {
        if (!timeStr || !timeStr.includes(':')) return '';
        let [h, m] = timeStr.split(':');
        h = h.padStart(2, '0');
        return `${h}:${m.substring(0,2)}`;
    }

    function highlightText(text) {
        if (!text && text !== 0) return text;
        const regex = /`([^`]+)`/g;
        return String(text).replace(regex, (match, p1) => {
            return `<span class="highlight-badge">${p1}</span>`;
        });
    }

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

    function formatTimestampToTitle(ts) {
        const dateObj = new Date(ts);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const diffDays = Math.round((ts - today.getTime()) / (1000 * 3600 * 24));
        const weekdayName = weekDaysList[dateObj.getDay()];
        
        if (diffDays >= 0 && diffDays < 7) {
            return weekdayName;
        }
        
        const formattedDate = `${dateObj.getMonth()+1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
        return `${weekdayName} ${formattedDate}`;
    }

    function getDBDayString(ts) {
        const dateObj = new Date(ts);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const diffDays = Math.round((ts - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays < 7) {
            return weekDaysList[dateObj.getDay()];
        }
        
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // 3. Render Timetable
    function renderTimetable() {
        timetableContainer.innerHTML = '';
        if (!db) return;

        const timelineByTs = new Map();
        
        const today = new Date();
        today.setHours(0,0,0,0);
        for (let i = 0; i < 7; i++) {
            const target = new Date(today);
            target.setDate(today.getDate() + i);
            timelineByTs.set(target.getTime(), []);
        }
        
        customDates.forEach(ts => {
            if (!timelineByTs.has(ts)) timelineByTs.set(ts, []);
        });

        try {
            const res = db.exec("SELECT id, groups, course_id, course_name, type, day, start_time, end_time, location, instructor, notes, is_visible FROM sessions");
            if (res.length > 0) {
                res[0].values.forEach(row => {
                    const dayStr = row[5];
                    const ts = parseDayToTimestamp(dayStr);
                    if (ts) {
                        if (!timelineByTs.has(ts)) timelineByTs.set(ts, []);
                        timelineByTs.get(ts).push({
                            id: row[0],
                            groups: row[1],
                            courseId: row[2],
                            courseName: row[3],
                            type: row[4],
                            day: dayStr,
                            start: row[6],
                            end: row[7],
                            location: row[8],
                            instructor: row[9],
                            notes: row[10],
                            isVisible: row[11]
                        });
                    }
                });
            }
        } catch (e) {
            console.error("Error reading sessions:", e);
        }

        const sortedTimestamps = Array.from(timelineByTs.keys()).sort((a,b) => a - b);

        sortedTimestamps.forEach(ts => {
            const daySessions = timelineByTs.get(ts);
            const dbDayVal = getDBDayString(ts);
            const displayTitle = formatTimestampToTitle(ts);
            
            const dayGroup = document.createElement('div');
            dayGroup.className = 'day-group';

            const dayHeader = document.createElement('div');
            dayHeader.className = 'admin-day-header';
            
            const dayTitle = document.createElement('h3');
            dayTitle.className = 'day-title';
            dayTitle.innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${displayTitle}`;
            
            // Check if this is a custom date (not in the 7 generic days)
            const isCustomDate = (ts < today.getTime() || ts >= today.getTime() + 7 * 24 * 3600 * 1000);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '0.5rem';
            
            if (isCustomDate) {
                const removeDayBtn = document.createElement('button');
                removeDayBtn.className = 'admin-btn delete';
                removeDayBtn.style.padding = '0.5rem 1rem';
                removeDayBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Remove Date';
                removeDayBtn.onclick = () => removeCustomDate(ts);
                actionsDiv.appendChild(removeDayBtn);
            }
            
            const addBtn = document.createElement('button');
            addBtn.className = 'primary-btn';
            addBtn.style.padding = '0.5rem 1rem';
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Session';
            addBtn.onclick = () => openSessionModal('add', null, dbDayVal);

            actionsDiv.appendChild(addBtn);
            
            dayHeader.appendChild(dayTitle);
            dayHeader.appendChild(actionsDiv);
            dayGroup.appendChild(dayHeader);

            const sessionsList = document.createElement('div');
            sessionsList.className = 'sessions-list';

            if (daySessions.length === 0) {
                sessionsList.innerHTML = `<p style="color:var(--text-secondary); font-size:0.9rem; font-style:italic;">No sessions on this day.</p>`;
            } else {
                daySessions.sort((a, b) => (a.start || '').localeCompare(b.start || ''));

                daySessions.forEach(session => {
                    const card = document.createElement('div');
                    card.className = `session-card ${session.type ? session.type.toLowerCase() : ''}`;
                    if (!session.isVisible) card.style.opacity = '0.6';

                    card.innerHTML = `
                        <div class="session-header">
                            <span class="session-badge">${highlightText(session.type) || 'No Type'}</span>
                            <span class="session-time"><i class="fa-regular fa-clock"></i> ${formatTime12h(session.start)}${session.end && session.end !== session.start ? ' - ' + formatTime12h(session.end) : ''}</span>
                        </div>
                        <div class="session-content">
                            <div>
                                <div class="session-title">${highlightText(session.courseName)} <span class="session-course-id">${(session.courseId || '').toUpperCase()}</span></div>
                                <div class="session-details">
                                    <span><i class="fa-solid fa-location-dot"></i> ${highlightText(session.location)}</span>
                                    <span><i class="fa-solid fa-users"></i> ${highlightText(session.groups)}</span>
                                    <span><i class="fa-solid fa-chalkboard-user"></i> ${highlightText(session.instructor || 'TBA')}</span>
                                    ${session.notes ? `<span><i class="fa-solid fa-circle-info"></i> ${highlightText(session.notes)}</span>` : ''}
                                    ${!session.isVisible ? `<span style="color:#ef4444;"><i class="fa-solid fa-eye-slash"></i> Hidden</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="admin-card-actions">
                            <button class="admin-btn edit" onclick='editSession(${JSON.stringify(session).replace(/'/g, "&apos;")})'><i class="fa-solid fa-pen"></i> Edit</button>
                            <button class="admin-btn delete" onclick="deleteSession(${session.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                        </div>
                    `;
                    sessionsList.appendChild(card);
                });
            }

            dayGroup.appendChild(sessionsList);
            timetableContainer.appendChild(dayGroup);
        });
    }

    // Session Modal Logic
    function openSessionModal(mode, sessionData = null, day = null) {
        document.querySelectorAll('.group-checkbox').forEach(cb => cb.checked = false);

        if (mode === 'add') {
            modalTitle.textContent = `Add Session to ${day}`;
            document.getElementById('form-session-id').value = '';
            document.getElementById('form-day').value = day;
            sessionForm.reset();
            document.getElementById('form-visible').checked = true;
            
            document.getElementById('form-start-hour').value = '08';
            document.getElementById('form-start-minute').value = '00';
            document.getElementById('form-start-ampm').value = 'AM';
            document.getElementById('form-end-hour').value = '';
            document.getElementById('form-end-minute').value = '';
            document.getElementById('form-end-ampm').value = '';
        } else if (mode === 'edit' && sessionData) {
            modalTitle.textContent = `Edit Session`;
            document.getElementById('form-session-id').value = sessionData.id;
            document.getElementById('form-day').value = sessionData.day;
            
            document.getElementById('form-course-name').value = sessionData.courseName || '';
            document.getElementById('form-course-id').value = sessionData.courseId || '';
            document.getElementById('form-location').value = sessionData.location || '';
            
            function setSelectTime(prefix, time24) {
                if (!time24 || !time24.includes(':')) {
                    document.getElementById(prefix + '-hour').value = '';
                    document.getElementById(prefix + '-minute').value = '';
                    document.getElementById(prefix + '-ampm').value = '';
                    return;
                }
                const [h24Str, mStr] = time24.split(':');
                let h24 = parseInt(h24Str, 10);
                const ampm = h24 >= 12 ? 'PM' : 'AM';
                let h12 = h24 % 12;
                if (h12 === 0) h12 = 12;
                const h12Str = h12.toString().padStart(2, '0');
                const min = mStr.substring(0,2);
                
                document.getElementById(prefix + '-hour').value = h12Str;
                document.getElementById(prefix + '-minute').value = min;
                document.getElementById(prefix + '-ampm').value = ampm;
            }
            
            setSelectTime('form-start', sessionData.start);
            setSelectTime('form-end', sessionData.end);
            
            document.getElementById('form-type').value = sessionData.type || '';
            document.getElementById('form-instructor').value = sessionData.instructor || '';
            document.getElementById('form-notes').value = sessionData.notes || '';
            document.getElementById('form-visible').checked = !!sessionData.isVisible;

            // Check the groups
            if (sessionData.groups) {
                const sGroups = sessionData.groups.split(',').map(g => g.trim());
                document.querySelectorAll('.group-checkbox').forEach(cb => {
                    if (sGroups.includes(cb.value)) cb.checked = true;
                });
            }
        }
        
        sessionModal.classList.add('active');
    }

    closeModalBtn.addEventListener('click', () => sessionModal.classList.remove('active'));
    cancelBtn.addEventListener('click', () => sessionModal.classList.remove('active'));
    
    window.editSession = function(sessionData) { openSessionModal('edit', sessionData); };
    window.deleteSession = function(id) {
        if (!confirm('Are you sure you want to delete this session?')) return;
        try {
            db.run("DELETE FROM sessions WHERE id = ?", [id]);
            extractOptions();
            renderTimetable();
        } catch (e) {
            alert('Error deleting: ' + e.message);
        }
    };

    sessionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('form-session-id').value;
        const day = document.getElementById('form-day').value;
        
        const courseName = document.getElementById('form-course-name').value.trim();
        const courseId = document.getElementById('form-course-id').value.trim();
        const location = document.getElementById('form-location').value.trim();
        function getSelectTime(prefix) {
            const h = document.getElementById(prefix + '-hour').value;
            const m = document.getElementById(prefix + '-minute').value;
            const ampm = document.getElementById(prefix + '-ampm').value;
            
            if (!h || !m || !ampm) return '';
            
            let h24 = parseInt(h, 10);
            if (ampm === 'PM' && h24 !== 12) h24 += 12;
            if (ampm === 'AM' && h24 === 12) h24 = 0;
            
            return `${h24.toString().padStart(2, '0')}:${m}`;
        }
        
        const start = getSelectTime('form-start');
        const end = getSelectTime('form-end');
        
        const checkedGroups = Array.from(document.querySelectorAll('.group-checkbox:checked')).map(cb => cb.value);
        if (checkedGroups.length === 0) {
            alert('Please select at least one group.');
            return;
        }
        const groups = checkedGroups.join(', ');

        const type = document.getElementById('form-type').value;
        const instructor = document.getElementById('form-instructor').value;
        const notes = document.getElementById('form-notes').value.trim();
        const isVisible = document.getElementById('form-visible').checked ? 1 : 0;
        
        try {
            if (id) {
                db.run(`
                    UPDATE sessions SET 
                    groups = ?, course_id = ?, course_name = ?, type = ?, day = ?, 
                    start_time = ?, end_time = ?, location = ?, instructor = ?, 
                    notes = ?, is_visible = ? 
                    WHERE id = ?
                `, [groups, courseId, courseName, type, day, start, end, location, instructor, notes, isVisible, id]);
            } else {
                db.run(`
                    INSERT INTO sessions (groups, course_id, course_name, type, day, start_time, end_time, location, instructor, notes, is_visible)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [groups, courseId, courseName, type, day, start, end, location, instructor, notes, isVisible]);
            }
            
            sessionModal.classList.remove('active');
            extractOptions();
            renderTimetable();
        } catch (error) {
            alert('Error saving session: ' + error.message);
        }
    });

    // Options Manager Modal
    manageOptionsBtn.addEventListener('click', () => {
        populateOptionsModal();
        optionsModal.classList.add('active');
    });

    closeOptionsBtn.addEventListener('click', () => optionsModal.classList.remove('active'));

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab).classList.add('active');
        });
    });

    function populateOptionsModal() {
        const listGroups = document.getElementById('list-groups');
        const listTypes = document.getElementById('list-types');
        const listInstructors = document.getElementById('list-instructors');
        const listCourses = document.getElementById('list-courses');

        listGroups.innerHTML = '';
        listTypes.innerHTML = '';
        listInstructors.innerHTML = '';
        listCourses.innerHTML = '';

        Array.from(uniqueGroups).sort().forEach(g => {
            listGroups.innerHTML += `
                <li class="option-item">
                    <span>${escapeHtml(g)}</span>
                    <div class="option-actions">
                        <button class="edit" onclick="editOption('groups', '${escapeHtml(g)}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete" onclick="deleteOption('groups', '${escapeHtml(g)}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </li>
            `;
        });

        Array.from(uniqueTypes).sort().forEach(t => {
            listTypes.innerHTML += `
                <li class="option-item">
                    <span>${escapeHtml(t)}</span>
                    <div class="option-actions">
                        <button class="edit" onclick="editOption('types', '${escapeHtml(t)}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete" onclick="deleteOption('types', '${escapeHtml(t)}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </li>
            `;
        });

        Array.from(uniqueInstructors).sort().forEach(i => {
            listInstructors.innerHTML += `
                <li class="option-item">
                    <span>${escapeHtml(i)}</span>
                    <div class="option-actions">
                        <button class="edit" onclick="editOption('instructors', '${escapeHtml(i)}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete" onclick="deleteOption('instructors', '${escapeHtml(i)}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </li>
            `;
        });

        uniqueCourses.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
            const cJSON = JSON.stringify(c).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            listCourses.innerHTML += `
                <li class="option-item">
                    <span>${escapeHtml(c.name)} <small style="color:var(--text-secondary)">(${escapeHtml(c.id)})</small></span>
                    <div class="option-actions">
                        <button class="edit" onclick="editOption('courses', '${cJSON}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete" onclick="deleteOption('courses', '${cJSON}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </li>
            `;
        });
    }

    // Global CRUD actions for Options
    window.addNewOption = function(field) {
        if (field === 'course') {
            const cName = prompt("Enter new Course Name:");
            if (!cName || !cName.trim()) return;
            const cId = prompt("Enter new Course ID for " + cName + ":");
            if (!cId || !cId.trim()) return;
            
            db.run("INSERT INTO courses (id, name) VALUES (?, ?)", [cId.trim(), cName.trim()]);
            uniqueCourses.push({ id: cId.trim(), name: cName.trim() });
            const sel = document.getElementById('form-course-name');
            const display = `${cName.trim()} (${cId.trim()})`;
            sel.innerHTML += `<option value="${escapeHtml(cName.trim())}" data-cid="${escapeHtml(cId.trim())}">${escapeHtml(display)}</option>`;
            sel.value = cName.trim();
            document.getElementById('form-course-id').value = cId.trim();
            return;
        }
        
        const val = prompt(`Enter new ${field}:`);
        if (!val || !val.trim()) return;
        
        const cleanVal = val.trim();
        if (field === 'type') {
            db.run("INSERT INTO session_types (name) VALUES (?)", [cleanVal]);
            uniqueTypes.add(cleanVal);
            const sel = document.getElementById('form-type');
            sel.innerHTML += `<option value="${escapeHtml(cleanVal)}">${escapeHtml(cleanVal)}</option>`;
            sel.value = cleanVal;
        } else if (field === 'instructor') {
            db.run("INSERT INTO instructors (name) VALUES (?)", [cleanVal]);
            uniqueInstructors.add(cleanVal);
            const sel = document.getElementById('form-instructor');
            sel.innerHTML += `<option value="${escapeHtml(cleanVal)}">${escapeHtml(cleanVal)}</option>`;
            sel.value = cleanVal;
        }
    };

    window.addOption = function(category) {
        if (category === 'courses') {
            const cName = prompt("Enter Course Name:");
            if (!cName || !cName.trim()) return;
            const cId = prompt("Enter Course ID:");
            if (!cId || !cId.trim()) return;
            db.run("INSERT INTO courses (id, name) VALUES (?, ?)", [cId.trim(), cName.trim()]);
            uniqueCourses.push({ id: cId.trim(), name: cName.trim() });
            refreshOptionsUI();
            return;
        }
        
        const val = prompt(`Enter new ${category.slice(0,-1)} name:`);
        if (!val || !val.trim()) return;
        const newVal = val.trim();

        if (category === 'groups') {
            try {
                // Determine a department based on naming (or default to CS)
                let dep = 'CS';
                if (newVal.startsWith('IS')) dep = 'IS';
                db.run("INSERT INTO sections (name, department_id) VALUES (?, ?)", [newVal, dep]);
            } catch (e) {
                alert("Error adding group: " + e.message); return;
            }
        } else if (category === 'types') {
            db.run("INSERT INTO session_types (name) VALUES (?)", [newVal]);
        } else if (category === 'instructors') {
            db.run("INSERT INTO instructors (name) VALUES (?)", [newVal]);
        }

        refreshOptionsUI();
    };

    window.editOption = function(category, oldVal) {
        if (category === 'courses') {
            const oldCourse = JSON.parse(oldVal.replace(/&quot;/g, '"').replace(/&#039;/g, "'"));
            const newName = prompt(`Edit Course Name:`, oldCourse.name);
            if (!newName || !newName.trim()) return;
            const newId = prompt(`Edit Course ID:`, oldCourse.id);
            if (!newId || !newId.trim()) return;
            
            try {
                if (oldCourse.id) {
                    db.run("UPDATE courses SET name = ?, id = ? WHERE name = ? AND id = ?", [newName.trim(), newId.trim(), oldCourse.name, oldCourse.id]);
                    db.run("UPDATE sessions SET course_name = ?, course_id = ? WHERE course_name = ? AND course_id = ?", [newName.trim(), newId.trim(), oldCourse.name, oldCourse.id]);
                } else {
                    db.run("UPDATE courses SET name = ?, id = ? WHERE name = ? AND (id IS NULL OR id = '')", [newName.trim(), newId.trim(), oldCourse.name]);
                    db.run("UPDATE sessions SET course_name = ?, course_id = ? WHERE course_name = ? AND (course_id IS NULL OR course_id = '')", [newName.trim(), newId.trim(), oldCourse.name]);
                }
            } catch (e) {
                alert("Error updating: " + e.message);
            }
            refreshOptionsUI();
            return;
        }
        
        const val = prompt(`Edit ${category.slice(0,-1)}:`, oldVal);
        if (!val || !val.trim() || val.trim() === oldVal) return;
        const newVal = val.trim();

        try {
            if (category === 'types') {
                db.run("UPDATE session_types SET name = ? WHERE name = ?", [newVal, oldVal]);
                db.run("UPDATE sessions SET type = ? WHERE type = ?", [newVal, oldVal]);
            } else if (category === 'instructors') {
                db.run("UPDATE instructors SET name = ? WHERE name = ?", [newVal, oldVal]);
                db.run("UPDATE sessions SET instructor = ? WHERE instructor = ?", [newVal, oldVal]);
            } else if (category === 'groups') {
                db.run("UPDATE sections SET name = ? WHERE name = ?", [newVal, oldVal]);
                db.run("UPDATE student_groups SET group_name = ? WHERE group_name = ?", [newVal, oldVal]);
                
                // Update comma-separated groups in sessions
                const res = db.exec("SELECT id, groups FROM sessions");
                if (res.length > 0) {
                    res[0].values.forEach(row => {
                        const id = row[0];
                        const gStr = row[1];
                        if (gStr) {
                            let gList = gStr.split(',').map(g => g.trim());
                            if (gList.includes(oldVal)) {
                                gList = gList.map(g => g === oldVal ? newVal : g);
                                db.run("UPDATE sessions SET groups = ? WHERE id = ?", [gList.join(', '), id]);
                            }
                        }
                    });
                }
            }
        } catch (e) {
            alert("Error updating: " + e.message);
        }

        refreshOptionsUI();
    };

    window.deleteOption = function(category, val) {
        if (!confirm(`Are you sure you want to delete "${val}"? This will affect all sessions using it.`)) return;

        try {
            if (category === 'types') {
                db.run("DELETE FROM session_types WHERE name = ?", [val]);
                db.run("UPDATE sessions SET type = NULL WHERE type = ?", [val]);
            } else if (category === 'instructors') {
                db.run("DELETE FROM instructors WHERE name = ?", [val]);
                db.run("UPDATE sessions SET instructor = NULL WHERE instructor = ?", [val]);
            } else if (category === 'courses') {
                const oldCourse = JSON.parse(val.replace(/&quot;/g, '"').replace(/&#039;/g, "'"));
                if (oldCourse.id) {
                    db.run("DELETE FROM courses WHERE name = ? AND id = ?", [oldCourse.name, oldCourse.id]);
                    db.run("DELETE FROM sessions WHERE course_name = ? AND course_id = ?", [oldCourse.name, oldCourse.id]);
                } else {
                    db.run("DELETE FROM courses WHERE name = ? AND (id IS NULL OR id = '')", [oldCourse.name]);
                    db.run("DELETE FROM sessions WHERE course_name = ? AND (course_id IS NULL OR course_id = '')", [oldCourse.name]);
                }
            } else if (category === 'groups') {
                db.run("DELETE FROM sections WHERE name = ?", [val]);
                db.run("DELETE FROM student_groups WHERE group_name = ?", [val]);
                
                // Remove from sessions.groups
                const res = db.exec("SELECT id, groups FROM sessions");
                if (res.length > 0) {
                    res[0].values.forEach(row => {
                        const id = row[0];
                        const gStr = row[1];
                        if (gStr) {
                            let gList = gStr.split(',').map(g => g.trim());
                            if (gList.includes(val)) {
                                gList = gList.filter(g => g !== val);
                                db.run("UPDATE sessions SET groups = ? WHERE id = ?", [gList.join(', '), id]);
                            }
                        }
                    });
                }
            }
        } catch (e) {
            alert("Error deleting: " + e.message);
        }

        refreshOptionsUI();
    };

    function refreshOptionsUI() {
        extractOptions();
        populateOptionsModal();
        renderTimetable();
    }

    // 7. Commit changes back to GitHub API
    commitBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to commit these changes to GitHub? The live website will update shortly after.')) return;
        
        commitBtn.disabled = true;
        commitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Committing...';
        showStatus(commitStatus, 'Exporting database and uploading to GitHub...', 'info');

        try {
            const exportedData = db.export();
            const newBase64 = uint8ArrayToBase64(exportedData);

            const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "Update schedule database via admin page",
                    content: newBase64,
                    sha: currentSha
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to commit changes');
            }

            const data = await response.json();
            currentSha = data.content.sha; 

            showStatus(commitStatus, 'Successfully committed to GitHub! The live site will update in about a minute.', 'success');
            setTimeout(() => {
                commitStatus.style.display = 'none';
            }, 5000);

        } catch (error) {
            console.error(error);
            showStatus(commitStatus, `Error: ${error.message}`, 'error');
        } finally {
            commitBtn.disabled = false;
            commitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Commit Changes to GitHub';
        }
    });
});
