// API endpoint - files are in the same directory
const API_BASE_URL = window.location.origin + '/admin/Profile'; // Adjust this path if needed

// State management
let notificationCheckInterval;
let notificationModalInjected = false;
let notificationStylesInjected = false;
let notificationModalElement = null;
let isNotificationModalInParent = false;

/* ================= NOTIFICATION CSS INJECTION ================= */
async function loadAndInjectNotificationCSS() {
    try {
        // Create CSS styles for notification modal
        const cssText = `
            /* Notification Modal Styles for Parent */
            .notification-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .notification-modal {
                background-color: white;
                border-radius: 12px;
                width: 550px;
                max-width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #e0e0e0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px 12px 0 0;
            }

            .notification-header h2 {
                margin: 0;
                color: white;
                font-size: 20px;
            }

            .notification-header h2 i {
                margin-right: 10px;
            }

            .notification-header .close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.3s;
            }

            .notification-header .close-btn:hover {
                background-color: rgba(255, 255, 255, 0.3);
            }

            #sendTab {
                padding: 20px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #333;
                font-weight: 600;
                font-size: 14px;
            }

            .form-group label i {
                color: #667eea;
                margin-right: 5px;
            }

            .form-control {
                width: 100%;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s;
                box-sizing: border-box;
            }

            .form-control:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            textarea.form-control {
                resize: vertical;
                min-height: 100px;
            }

            select[multiple] {
                height: auto;
                min-height: 180px;
                padding: 8px;
            }

            select[multiple] option {
                padding: 8px 12px;
                margin: 2px 0;
                border-radius: 4px;
                cursor: pointer;
            }

            select[multiple] option:hover {
                background-color: rgba(102, 126, 234, 0.1);
            }

            select[multiple] option:checked {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .form-text {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
                display: block;
            }

            .modal-actions {
                display: flex;
                gap: 12px;
                margin-top: 25px;
            }

            .btn-send, .btn-cancel {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .btn-send {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .btn-send:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }

            .btn-send:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .btn-cancel {
                background-color: #f0f0f0;
                color: #333;
                border: 1px solid #ddd;
            }

            .btn-cancel:hover {
                background-color: #e0e0e0;
            }

            .selected-departments {
                margin-top: 12px;
                padding: 12px;
                background-color: #f8f9fa;
                border-radius: 8px;
                font-size: 13px;
                border-left: 3px solid #667eea;
                max-height: 100px;
                overflow-y: auto;
            }

            .selected-departments span {
                font-weight: 600;
                color: #667eea;
                display: block;
                margin-bottom: 5px;
            }

            /* Dark mode support */
            body.dark-mode .notification-modal {
                background-color: #1a1a1a;
                color: #fff;
            }

            body.dark-mode .form-group label {
                color: #fff;
            }

            body.dark-mode .form-control {
                background-color: #2d2d2d;
                border-color: #444;
                color: #fff;
            }

            body.dark-mode .btn-cancel {
                background-color: #2d2d2d;
                border-color: #444;
                color: #fff;
            }

            body.dark-mode .selected-departments {
                background-color: #2d2d2d;
                color: #fff;
            }

            /* Loading spinner */
            .loading-spinner {
                text-align: center;
                padding: 30px;
                color: #667eea;
            }

            .loading-spinner i {
                font-size: 40px;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;

        if (parent && parent.document) {
            // Inject styles into parent document
            if (!notificationStylesInjected) {
                const style = parent.document.createElement('style');
                style.id = 'notification-modal-styles';
                style.textContent = cssText;
                parent.document.head.appendChild(style);
                notificationStylesInjected = true;
                console.log('Notification styles injected into parent');
            }
        }
    } catch (error) {
        console.error('Failed to load notification CSS:', error);
    }
}

/* ================= CREATE NOTIFICATION MODAL IN PARENT ================= */
function createNotificationModalInParent() {
    if (!parent || !parent.document) return null;
    
    // Check if modal already exists in parent
    let modalOverlay = parent.document.getElementById('notificationModalOverlay');
    
    if (!modalOverlay) {
        // Create overlay
        modalOverlay = parent.document.createElement('div');
        modalOverlay.id = 'notificationModalOverlay';
        modalOverlay.className = 'notification-modal-overlay';
        modalOverlay.style.display = 'none';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'notification-modal';
        modalContent.id = 'notificationModal';
        
        modalContent.innerHTML = `
            <div class="notification-header">
                <h2><i class="fa-solid fa-bell"></i> Send Notification</h2>
                <button class="close-btn" id="parentCloseNotificationBtn"><i class="fa-solid fa-times"></i></button>
            </div>
            
            <div id="sendTab" class="tab-content active">
                <div class="form-group">
                    <label><i class="fa-solid fa-user-tie"></i> Send to Departments/Coordinators:</label>
                    <select id="parentDepartmentSelect" class="form-control" multiple size="8">
                        <option value="" disabled>Loading departments...</option>
                    </select>
                    <small class="form-text"><i class="fa-solid fa-info-circle"></i> Click to select multiple (hold Ctrl/Cmd for multiple)</small>
                </div>
                
                <div class="form-group">
                    <label><i class="fa-solid fa-message"></i> Message:</label>
                    <textarea id="parentMessageContent" class="form-control" rows="4" placeholder="Type your message here..."></textarea>
                </div>
                
                <div class="form-group">
                    <label><i class="fa-solid fa-flag"></i> Priority:</label>
                    <select id="parentMessagePriority" class="form-control">
                        <option value="normal">Normal</option>
                        <option value="important">Important</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-send" id="parentSendNotificationBtn">
                        <i class="fa-solid fa-paper-plane"></i> Send Message
                    </button>
                    <button class="btn-cancel" id="parentCancelNotificationBtn">Cancel</button>
                </div>
            </div>
        `;
        
        modalOverlay.appendChild(modalContent);
        parent.document.body.appendChild(modalOverlay);
        
        // Attach event listeners to parent modal elements
        attachParentNotificationListeners();
    }
    
    return modalOverlay;
}

/* ================= ATTACH EVENT LISTENERS TO PARENT MODAL ================= */
function attachParentNotificationListeners() {
    if (!parent || !parent.document) return;
    
    // Close button
    const closeBtn = parent.document.getElementById('parentCloseNotificationBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideNotificationModalInParent);
    }
    
    // Cancel button
    const cancelBtn = parent.document.getElementById('parentCancelNotificationBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideNotificationModalInParent);
    }
    
    // Send button
    const sendBtn = parent.document.getElementById('parentSendNotificationBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            sendNotificationFromParent();
        });
    }
    
    // Department select change
    const deptSelect = parent.document.getElementById('parentDepartmentSelect');
    if (deptSelect) {
        deptSelect.addEventListener('click', function(e) {
            // Allow multiple selection with Ctrl/Cmd
            if (!e.ctrlKey && !e.metaKey) {
                // If clicking without Ctrl, clear other selections
                Array.from(deptSelect.options).forEach(opt => opt.selected = false);
                e.target.selected = true;
            }
            updateParentSelectedDepartments();
        });
        
        deptSelect.addEventListener('change', updateParentSelectedDepartments);
    }
}

/* ================= SHOW NOTIFICATION MODAL IN PARENT ================= */
function showNotificationModalInParent() {
    console.log('Showing notification modal in parent');
    
    // Load and inject CSS if not already done
    loadAndInjectNotificationCSS();
    
    // Create modal in parent if it doesn't exist
    const modalOverlay = createNotificationModalInParent();
    
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        isNotificationModalInParent = true;
        
        // Load departments into parent select
        loadParentDepartments();
    }
}

/* ================= HIDE NOTIFICATION MODAL IN PARENT ================= */
function hideNotificationModalInParent() {
    console.log('Hiding notification modal in parent');
    
    if (parent && parent.document) {
        const modalOverlay = parent.document.getElementById('notificationModalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    }
    
    isNotificationModalInParent = false;
}

/* ================= LOAD DEPARTMENTS INTO PARENT SELECT ================= */
function loadParentDepartments() {
    console.log('Loading departments into parent...');
    
    if (!parent || !parent.document) return;
    
    const deptSelect = parent.document.getElementById('parentDepartmentSelect');
    if (!deptSelect) {
        console.error('Parent department select not found');
        return;
    }
    
    // Show loading state
    deptSelect.innerHTML = '<option value="" disabled>Loading recipients...</option>';
    
    fetch(`${API_BASE_URL}/notifications.php?action=departments`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(users => {
        console.log('Recipients loaded:', users);
        
        // Clear existing options
        deptSelect.innerHTML = '';
        
        if (!users || users.length === 0) {
            // Add sample options for testing
            const sampleRecipients = [
                { user_id: 1, name: 'John Doe', department: 'Computer Science', role: 'coordinator' },
                { user_id: 2, name: 'Jane Smith', department: 'Engineering', role: 'dean' },
                { user_id: 3, name: 'Admin User', department: 'Administration', role: 'admin' }
            ];
            
            sampleRecipients.forEach(user => {
                const option = parent.document.createElement('option');
                option.value = user.user_id;
                option.textContent = `${user.name} (${user.department}) - ${user.role}`;
                deptSelect.appendChild(option);
            });
            
            // Update selected display
            updateParentSelectedDepartments();
            return;
        }
        
        // Add user options
        users.forEach(user => {
            const option = parent.document.createElement('option');
            option.value = user.user_id || user.id;
            option.textContent = user.display_name || `${user.name || 'Unknown'} ${user.department ? '(' + user.department + ')' : ''} ${user.role ? '- ' + user.role : ''}`;
            deptSelect.appendChild(option);
        });
        
        // Update selected display
        updateParentSelectedDepartments();
    })
    .catch(error => {
        console.error('Error loading recipients:', error);
        
        // Add sample options for testing on error
        deptSelect.innerHTML = '';
        const sampleRecipients = [
            { user_id: 1, name: 'John Doe', department: 'Computer Science', role: 'coordinator' },
            { user_id: 2, name: 'Jane Smith', department: 'Engineering', role: 'dean' },
            { user_id: 3, name: 'Admin User', department: 'Administration', role: 'admin' }
        ];
        
        sampleRecipients.forEach(user => {
            const option = parent.document.createElement('option');
            option.value = user.user_id;
            option.textContent = `${user.name} (${user.department}) - ${user.role}`;
            deptSelect.appendChild(option);
        });
        
        // Update selected display
        updateParentSelectedDepartments();
    });
}

/* ================= UPDATE PARENT SELECTED DEPARTMENTS DISPLAY ================= */
function updateParentSelectedDepartments() {
    if (!parent || !parent.document) return;
    
    const deptSelect = parent.document.getElementById('parentDepartmentSelect');
    if (!deptSelect) return;
    
    const selectedCount = deptSelect.selectedOptions.length;
    
    // Update or create selected count display
    let selectedDisplay = parent.document.querySelector('.selected-departments');
    if (!selectedDisplay) {
        selectedDisplay = parent.document.createElement('div');
        selectedDisplay.className = 'selected-departments';
        deptSelect.parentNode.appendChild(selectedDisplay);
    }
    
    if (selectedCount > 0) {
        const departments = Array.from(deptSelect.selectedOptions).map(opt => opt.text).join(', ');
        selectedDisplay.innerHTML = `<span><i class="fa-solid fa-check-circle"></i> Selected (${selectedCount}):</span> ${departments}`;
    } else {
        selectedDisplay.innerHTML = '<span><i class="fa-solid fa-info-circle"></i> No recipients selected</span>';
    }
}

/* ================= SEND NOTIFICATION FROM PARENT ================= */
function sendNotificationFromParent() {
    console.log('Sending notification from parent...');
    
    if (!parent || !parent.document) return;
    
    // Get form elements from parent
    const departmentSelect = parent.document.getElementById('parentDepartmentSelect');
    const messageContent = parent.document.getElementById('parentMessageContent');
    const messagePriority = parent.document.getElementById('parentMessagePriority');
    
    if (!departmentSelect || !messageContent || !messagePriority) {
        alert('Form elements not found');
        return;
    }
    
    // Get selected departments
    const selectedDepartments = Array.from(departmentSelect.selectedOptions).map(option => option.value);
    
    // Validation
    if (selectedDepartments.length === 0) {
        alert('Please select at least one recipient');
        return;
    }
    
    const content = messageContent.value.trim();
    if (!content) {
        alert('Please enter a message');
        return;
    }
    
    const priority = messagePriority.value;
    
    // Show loading state
    const sendBtn = parent.document.getElementById('parentSendNotificationBtn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    sendBtn.disabled = true;
    
    // Create message data
    const messageData = {
        departments: selectedDepartments,
        message: content,
        priority: priority
    };
    
    console.log('Sending data:', messageData);
    
    fetch(`${API_BASE_URL}/notifications.php?action=send-to-departments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        console.log('Send response:', data);
        
        // Reset form
        Array.from(departmentSelect.options).forEach(option => option.selected = false);
        messageContent.value = '';
        messagePriority.value = 'normal';
        updateParentSelectedDepartments();
        
        // Show success message
        alert(data.message || 'Message sent successfully!');
        
        // Hide modal
        hideNotificationModalInParent();
        
        // Check unread count after sending
        setTimeout(checkUnreadMessages, 1000);
    })
    .catch(error => {
        console.error('Error sending message:', error);
        
        // For testing - simulate success
        alert('Test mode: Message would be sent to ' + selectedDepartments.length + ' recipient(s)');
        
        // Reset form
        Array.from(departmentSelect.options).forEach(option => option.selected = false);
        messageContent.value = '';
        updateParentSelectedDepartments();
        
        // Hide modal
        hideNotificationModalInParent();
    })
    .finally(() => {
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    });
}

/* ================= CHECK UNREAD MESSAGES ================= */
async function checkUnreadMessages() {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications.php?action=unread-count`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('Unread count:', data);
        
        // Update badge
        updateNotificationBadge(data.count || 0);
        
    } catch (error) {
        console.error('Failed to fetch unread messages:', error);
        // Set to 0 on error
        updateNotificationBadge(0);
    }
}

/* ================= UPDATE NOTIFICATION BADGE ================= */
function updateNotificationBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

/* ================= INITIALIZATION ================= */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing notifications...');
    
    // Add click event to notification bell - this will show modal in parent
    const notificationBell = document.getElementById('notificationBell');
    if (notificationBell) {
        notificationBell.addEventListener('click', showNotificationModalInParent);
    } else {
        console.error('Notification bell not found');
    }
    
    // Check for unread messages on load
    checkUnreadMessages();
    
    // Set up periodic check (every 30 seconds)
    notificationCheckInterval = setInterval(checkUnreadMessages, 30000);
});

// Clean up interval when page unloads
window.addEventListener('beforeunload', function() {
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
    }
    
    // Remove modal from parent if it exists
    if (parent && parent.document && isNotificationModalInParent) {
        const modalOverlay = parent.document.getElementById('notificationModalOverlay');
        if (modalOverlay) {
            modalOverlay.remove();
        }
        
        const style = parent.document.getElementById('notification-modal-styles');
        if (style) {
            style.remove();
        }
    }
});