// API endpoint - files are in the same directory
const API_BASE_URL = window.location.origin + '/coordinator/Profile'; // Adjust this path if needed

// State management
let notificationCheckInterval;
let notificationStylesInjected = false;

/* ================= NOTIFICATION CSS INJECTION ================= */
async function loadAndInjectNotificationCSS() {
    try {
        // Create CSS styles for notification display
        const cssText = `
            /* Notification Badge Styles */
            .notification-icon {
                position: relative;
                cursor: pointer;
                margin-right: 15px;
                font-size: 20px;
                color: #555;
                transition: color 0.3s;
            }

            .notification-icon:hover {
                color: #55a630;
            }

            .notification-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #ff4444;
                color: white;
                font-size: 11px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            /* Notification Panel Styles - FIXED SIZE */
            .notification-panel-overlay {
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

            .notification-panel {
                background-color: white;
                border-radius: 12px;
                width: 600px;
                max-width: 90%;
                height: 600px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
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

            .notification-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #e0e0e0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px 12px 0 0;
                flex-shrink: 0;
            }

            .notification-panel-header h2 {
                margin: 0;
                color: white;
                font-size: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .notification-panel-header h2 i {
                font-size: 18px;
            }

            .notification-panel-header .close-btn {
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

            .notification-panel-header .close-btn:hover {
                background-color: rgba(255, 255, 255, 0.3);
            }

            .panel-notification-badge {
                background-color: #ff4444;
                color: white;
                font-size: 12px;
                font-weight: bold;
                padding: 2px 8px;
                border-radius: 20px;
                margin-left: 10px;
            }

            .notification-filters {
                display: flex;
                padding: 15px 20px;
                gap: 10px;
                border-bottom: 1px solid #e0e0e0;
                background-color: #f8f9fa;
                flex-shrink: 0;
                overflow-x: auto;
                white-space: nowrap;
            }

            .filter-btn {
                padding: 8px 16px;
                border: 1px solid #ddd;
                border-radius: 20px;
                background: white;
                color: #555;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
                flex-shrink: 0;
            }

            .filter-btn:hover {
                background-color: #e0e0e0;
            }

            .filter-btn.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-color: transparent;
            }

            .notifications-list {
                padding: 15px;
                overflow-y: auto;
                flex: 1;
                min-height: 0;
            }

            .notification-item {
                display: flex;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 8px;
                background-color: #f8f9fa;
                border-left: 3px solid transparent;
                transition: all 0.3s;
                cursor: pointer;
            }

            .notification-item:hover {
                background-color: #f0f0f0;
                transform: translateX(2px);
            }

            .notification-item.unread {
                background-color: #e8f0fe;
                border-left-color: #667eea;
            }

            .notification-item.urgent {
                border-left-color: #dc3545;
            }

            .notification-item.important {
                border-left-color: #ffc107;
            }

            .notification-icon-side {
                margin-right: 12px;
                font-size: 20px;
                color: #667eea;
                flex-shrink: 0;
            }

            .notification-content {
                flex: 1;
                min-width: 0;
            }

            .notification-message {
                font-size: 14px;
                color: #333;
                margin-bottom: 8px;
                line-height: 1.5;
                word-wrap: break-word;
            }

            .notification-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 11px;
                color: #666;
                flex-wrap: wrap;
            }

            .notification-sender {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .notification-sender i {
                font-size: 10px;
                color: #667eea;
            }

            .notification-time {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .notification-priority {
                font-size: 10px;
                padding: 2px 8px;
                border-radius: 12px;
                text-transform: uppercase;
                font-weight: bold;
            }

            .priority-urgent {
                background-color: #dc3545;
                color: white;
            }

            .priority-important {
                background-color: #ffc107;
                color: #333;
            }

            .priority-normal {
                background-color: #e0e0e0;
                color: #333;
            }

            .empty-notifications {
                text-align: center;
                padding: 60px 20px;
                color: #999;
            }

            .empty-notifications i {
                font-size: 60px;
                margin-bottom: 15px;
                color: #ddd;
            }

            .empty-notifications p {
                font-size: 16px;
            }

            .loading-spinner {
                text-align: center;
                padding: 60px 20px;
                color: #667eea;
            }

            .loading-spinner i {
                font-size: 50px;
                animation: spin 1s linear infinite;
            }

            .loading-spinner p {
                margin-top: 15px;
                color: #666;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            /* Dark mode support */
            body.dark-mode .notification-icon {
                color: #fff;
            }

            body.dark-mode .notification-badge {
                background-color: #ff6b6b;
            }

            body.dark-mode .notification-panel {
                background-color: #1a1a1a;
                color: #fff;
            }

            body.dark-mode .notification-filters {
                background-color: #2d2d2d;
                border-bottom-color: #444;
            }

            body.dark-mode .filter-btn {
                background-color: #2d2d2d;
                border-color: #444;
                color: #fff;
            }

            body.dark-mode .notification-item {
                background-color: #2d2d2d;
            }

            body.dark-mode .notification-item.unread {
                background-color: #1e2a3a;
            }

            body.dark-mode .notification-message {
                color: #fff;
            }

            body.dark-mode .notification-meta {
                color: #aaa;
            }

            body.dark-mode .empty-notifications {
                color: #666;
            }

            /* Scrollbar styling */
            .notifications-list::-webkit-scrollbar {
                width: 8px;
            }

            .notifications-list::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }

            .notifications-list::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 10px;
            }

            .notifications-list::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `;

        if (parent && parent.document) {
            // Inject styles into parent document
            if (!notificationStylesInjected) {
                const style = parent.document.createElement('style');
                style.id = 'notification-panel-styles';
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

/* ================= CREATE NOTIFICATION PANEL IN PARENT ================= */
function createNotificationPanelInParent() {
    if (!parent || !parent.document) return null;
    
    // Check if panel already exists in parent
    let panelOverlay = parent.document.getElementById('notificationPanelOverlay');
    
    if (!panelOverlay) {
        // Create overlay
        panelOverlay = parent.document.createElement('div');
        panelOverlay.id = 'notificationPanelOverlay';
        panelOverlay.className = 'notification-panel-overlay';
        panelOverlay.style.display = 'none';
        
        // Create panel content
        const panelContent = parent.document.createElement('div');
        panelContent.className = 'notification-panel';
        panelContent.id = 'notificationPanel';
        
        panelContent.innerHTML = `
            <div class="notification-panel-header">
                <h2>
                    <i class="fa-solid fa-bell"></i> 
                    Notifications
                    <span class="panel-notification-badge" id="panelNotificationBadge" style="display: none;">0</span>
                </h2>
                <button class="close-btn" id="parentClosePanelBtn"><i class="fa-solid fa-times"></i></button>
            </div>
            
            <div class="notification-filters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="unread">Unread</button>
                <button class="filter-btn" data-filter="urgent">Urgent</button>
                <button class="filter-btn" data-filter="important">Important</button>
            </div>
            
            <div class="notifications-list" id="notificationsList">
                <div class="loading-spinner">
                    <i class="fa-solid fa-circle-notch"></i>
                    <p>Loading notifications...</p>
                </div>
            </div>
        `;
        
        panelOverlay.appendChild(panelContent);
        parent.document.body.appendChild(panelOverlay);
        
        // Attach event listeners
        attachNotificationPanelListeners(panelOverlay);
    }
    
    return panelOverlay;
}

/* ================= ATTACH EVENT LISTENERS ================= */
function attachNotificationPanelListeners(panelOverlay) {
    if (!parent || !parent.document) return;
    
    // Close button
    const closeBtn = parent.document.getElementById('parentClosePanelBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideNotificationPanel);
    }
    
    // Filter buttons
    const filterBtns = parent.document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all filters
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked filter
            this.classList.add('active');
            // Load notifications with filter
            loadNotifications(this.dataset.filter);
        });
    });
    
    // Click outside to close
    panelOverlay.addEventListener('click', function(e) {
        if (e.target === panelOverlay) {
            hideNotificationPanel();
        }
    });
}

/* ================= SHOW NOTIFICATION PANEL ================= */
function showNotificationPanel() {
    console.log('Showing notification panel');
    
    // Load and inject CSS if not already done
    loadAndInjectNotificationCSS();
    
    // Create panel in parent if it doesn't exist
    const panelOverlay = createNotificationPanelInParent();
    
    if (panelOverlay) {
        panelOverlay.style.display = 'flex';
        
        // Load notifications
        loadNotifications('all');
    }
}

/* ================= HIDE NOTIFICATION PANEL ================= */
function hideNotificationPanel() {
    console.log('Hiding notification panel');
    
    if (parent && parent.document) {
        const panelOverlay = parent.document.getElementById('notificationPanelOverlay');
        if (panelOverlay) {
            panelOverlay.style.display = 'none';
        }
    }
}

/* ================= LOAD NOTIFICATIONS ================= */
function loadNotifications(filter = 'all') {
    if (!parent || !parent.document) return;
    
    const notificationsList = parent.document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    // Show loading
    notificationsList.innerHTML = `
        <div class="loading-spinner">
            <i class="fa-solid fa-circle-notch"></i>
            <p>Loading notifications...</p>
        </div>
    `;
    
    fetch(`${API_BASE_URL}/notifications.php?action=inbox&filter=${filter}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(notifications => {
        console.log('Notifications loaded:', notifications);
        
        if (!notifications || notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="empty-notifications">
                    <i class="fa-solid fa-bell-slash"></i>
                    <p>No notifications found</p>
                </div>
            `;
            return;
        }
        
        // Render notifications - WITHOUT onclick attribute
        let html = '';
        notifications.forEach(notification => {
            const isUnread = notification.is_read == 0 ? 'unread' : '';
            const priority = notification.priority || 'normal';
            const timeAgo = getTimeAgo(notification.created_at);
            
            html += `
                <div class="notification-item ${isUnread} ${priority}" data-id="${notification.notification_id}">
                    <div class="notification-icon-side">
                        <i class="fa-solid ${getNotificationIcon(priority)}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-message">${escapeHtml(notification.message)}</div>
                        <div class="notification-meta">
                            <span class="notification-sender">
                                <i class="fa-solid fa-user"></i> ${escapeHtml(notification.sender_name || 'Unknown')}
                            </span>
                            <span class="notification-time">
                                <i class="fa-regular fa-clock"></i> ${timeAgo}
                            </span>
                            <span class="notification-priority priority-${priority}">
                                ${priority}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        notificationsList.innerHTML = html;
        
        // Add click event listeners to notification items
        const notificationItems = parent.document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', function() {
                const notificationId = this.dataset.id;
                markNotificationAsRead(notificationId);
            });
        });
        
        // Update unread count after loading
        checkUnreadMessages();
    })
    .catch(error => {
        console.error('Error loading notifications:', error);
        notificationsList.innerHTML = `
            <div class="empty-notifications">
                <i class="fa-solid fa-exclamation-circle"></i>
                <p>Error loading notifications</p>
            </div>
        `;
    });
}

/* ================= MARK NOTIFICATION AS READ ================= */
function markNotificationAsRead(notificationId) {
    console.log('Marking notification as read:', notificationId);
    
    fetch(`${API_BASE_URL}/notifications.php?action=mark-read&id=${notificationId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Marked as read response:', data);
        
        if (data.success) {
            // Immediately update the unread count
            checkUnreadMessages();
            
            // Reload current filter after a short delay
            setTimeout(() => {
                const activeFilter = parent?.document.querySelector('.filter-btn.active');
                const filter = activeFilter ? activeFilter.dataset.filter : 'all';
                loadNotifications(filter);
            }, 300);
        }
    })
    .catch(error => {
        console.error('Error marking as read:', error);
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
        
        // Update badge in header
        updateNotificationBadge(data.count || 0);
        
        // Update badge in panel header if it exists
        if (parent && parent.document) {
            const panelBadge = parent.document.getElementById('panelNotificationBadge');
            if (panelBadge) {
                if (data.count > 0) {
                    panelBadge.textContent = data.count > 99 ? '99+' : data.count;
                    panelBadge.style.display = 'inline-block';
                } else {
                    panelBadge.style.display = 'none';
                }
            }
        }
        
    } catch (error) {
        console.error('Failed to fetch unread messages:', error);
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

/* ================= HELPER FUNCTIONS ================= */
function getTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString();
}

function getNotificationIcon(priority) {
    switch(priority) {
        case 'urgent': return 'fa-solid fa-exclamation-circle';
        case 'important': return 'fa-solid fa-star';
        default: return 'fa-solid fa-info-circle';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ================= MAKE FUNCTIONS AVAILABLE GLOBALLY ================= */
// Make functions available in both iframe and parent contexts
window.markNotificationAsRead = markNotificationAsRead;

// Also expose to parent window
if (parent) {
    parent.markNotificationAsRead = markNotificationAsRead;
}

/* ================= INITIALIZATION ================= */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing notifications receiver...');
    
    // Add click event to notification bell
    const notificationBell = document.getElementById('notificationBell');
    if (notificationBell) {
        notificationBell.addEventListener('click', showNotificationPanel);
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
    
    // Remove panel from parent if it exists
    if (parent && parent.document) {
        const panelOverlay = parent.document.getElementById('notificationPanelOverlay');
        if (panelOverlay) {
            panelOverlay.remove();
        }
        
        const style = parent.document.getElementById('notification-panel-styles');
        if (style) {
            style.remove();
        }
    }
});