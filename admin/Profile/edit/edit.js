/* ===== Profile Functions ===== */
const PROFILE_ENDPOINT = "/SYSTEM_VERSION_!/admin/Profile/edit/get.php";
const DEFAULT_PROFILE_PICTURE = "/SYSTEM_VERSION_!/login/images/ces.png";

function updateHeaderProfilePicture(src) {
    const parentDoc = parent.document;
    const profilePicture = parentDoc.getElementById("profilePicture") || parentDoc.querySelector(".admin-logo");

    if (profilePicture && src) {
        profilePicture.src = src;
    }
}

async function injectProfileCSS() {
    try {
        const cssText = `
        /* Full-screen overlay */
        .overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }

        /* Modal content */
        .profile-modal {
            background: #fff;
            color: #333;
            padding: 30px;
            border-radius: 12px;
            width: 420px;
            max-width: 90%;
            box-shadow: 0 20px 50px rgba(0,0,0,0.25);
            transform: scale(0.95);
            animation: fadeIn 0.25s ease forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to   { opacity: 1; transform: scale(1); }
        }

        .profile-modal h2 {
            text-align: center;
            margin-bottom: 25px;
            font-size: 22px;
            font-weight: 600;
            color: #333;
        }

        .profile-modal label {
            font-size: 13px;
            font-weight: 600;
            color: #555;
            display: block;
            margin-bottom: 6px;
            margin-top: 15px;
        }

        .profile-modal input {
            width: 100%;
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid #ddd;
            font-size: 14px;
            transition: 0.2s ease;
            outline: none;
            box-sizing: border-box;
        }

        .profile-modal input:focus {
            border-color: #4a90e2;
            box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
        }

        .profile-modal input[readonly] {
            background-color: #f5f5f5;
            cursor: not-allowed;
        }

        .profile-picture-editor {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 8px;
        }

        .profile-picture-preview {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #55a630;
            background: #f7f7f7;
            flex: 0 0 auto;
        }

        .profile-picture-input {
            flex: 1;
        }

        .profile-picture-input input[type="file"] {
            padding: 8px;
            background: #fff;
        }

        .profile-picture-input input[type="file"]::file-selector-button {
            background: #59AF29;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            margin-right: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s ease;
        }

        .profile-picture-input input[type="file"]::file-selector-button:hover {
            background: #254911;
        }

        .profile-picture-input input[type="file"]::-webkit-file-upload-button {
            background: #59AF29;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            margin-right: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s ease;
        }

        .profile-picture-input input[type="file"]::-webkit-file-upload-button:hover {
            background: #254911;
        }

        /* Style for info display (non-editable fields) */
        .profile-modal .info-field {
            background-color: #f9f9f9;
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid #eee;
            font-size: 14px;
            color: #333;
            margin-bottom: 5px;
            cursor: default; /* Changed from default cursor to text cursor */
        }

        /* Add text cursor specifically for role and department info fields */
        .profile-modal #role,
        .profile-modal #department {
            cursor: text; /* Shows text selection cursor when hovering over these fields */
        }

        .profile-modal button {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: none;
            font-size: 14px;
            font-weight: 600;
            margin-top: 18px;
            cursor: pointer;
            transition: 0.2s ease;
        }

        .profile-modal button:first-of-type {
            background: #4a90e2;
            color: #fff;
        }

        .profile-modal button:first-of-type:hover {
            background: #357abd;
        }

        .profile-modal button:last-of-type {
            background: #f2f2f2;
            color: #333;
        }

        .profile-modal button:last-of-type:hover {
            background: #ddd;
        }
        `;

        if (parent && parent.document && !parent.document.getElementById('profileCSS')) {
            const styleEl = parent.document.createElement('style');
            styleEl.id = 'profileCSS';
            styleEl.textContent = cssText;
            parent.document.head.appendChild(styleEl);
        }
    } catch (err) {
        console.error("CSS injection failed:", err);
    }
}

function openProfile() {
    const parentDoc = parent.document;

    // Inject CSS first
    injectProfileCSS();

    // Create overlay if not exists
    let overlay = parentDoc.getElementById("profileOverlay");
    if (!overlay) {
        overlay = parentDoc.createElement("div");
        overlay.id = "profileOverlay";
        overlay.className = "overlay";
        overlay.innerHTML = `
            <div class="profile-modal">
                <h2>Edit Profile</h2>
                
                <!-- Hidden ID field (kept for form data) -->
                <input type="hidden" id="userId">

                <label>Profile Picture</label>
                <div class="profile-picture-editor">
                    <img id="profilePicturePreview" class="profile-picture-preview" src="${DEFAULT_PROFILE_PICTURE}" alt="Profile picture preview">
                    <div class="profile-picture-input">
                        <input id="profilePictureInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif">
                    </div>
                </div>
                
                <label>Username</label><input id="username" type="text">
                <label>Name</label><input id="name" type="text">
                <label>Email</label><input id="email" type="email">
                <label>Password</label><input id="password" type="password" placeholder="Leave blank to keep current">
                
                
                <input type="hidden" id="role">

               
                <input type="hidden" id="department">
                
                <button id="saveProfile">Save Changes</button>
                <button id="cancelProfile">Cancel</button>
            </div>
        `;
        parentDoc.body.appendChild(overlay);

        // Cancel button closes overlay
        overlay.querySelector("#cancelProfile").addEventListener("click", () => {
            overlay.style.display = "none";
        });

        overlay.querySelector("#profilePictureInput").addEventListener("change", event => {
            const file = event.target.files[0];

            if (file) {
                overlay.querySelector("#profilePicturePreview").src = URL.createObjectURL(file);
            }
        });
    }

    // Show overlay
    overlay.style.display = "flex";

    // Clear password field
    overlay.querySelector("#password").value = "";
    overlay.querySelector("#profilePictureInput").value = "";

    // Fetch profile data
    fetch(PROFILE_ENDPOINT)
        .then(res => res.json())
        .then(data => {
            if (data.status === "error") {
                alert(data.message);
                overlay.style.display = "none";
                return;
            }
            overlay.querySelector("#userId").value = data.id;
            overlay.querySelector("#username").value = data.username;
            overlay.querySelector("#name").value = data.name;
            overlay.querySelector("#email").value = data.email;      
            overlay.querySelector("#role").value = data.role;
            overlay.querySelector("#department").value = data.department;
            overlay.querySelector("#profilePicturePreview").src = data.profile_picture || DEFAULT_PROFILE_PICTURE;
            updateHeaderProfilePicture(data.profile_picture || DEFAULT_PROFILE_PICTURE);
        })
        .catch(err => {
            console.error("Error fetching profile:", err);
            alert("Failed to load profile data");
        });

    // Save button functionality
    overlay.querySelector("#saveProfile").onclick = () => {
        const formData = new FormData();
        const selectedPicture = overlay.querySelector("#profilePictureInput").files[0];

        formData.append("id", overlay.querySelector("#userId").value);
        formData.append("username", overlay.querySelector("#username").value);
        formData.append("name", overlay.querySelector("#name").value);
        formData.append("email", overlay.querySelector("#email").value);
        formData.append("password", overlay.querySelector("#password").value);
        formData.append("role", overlay.querySelector("#role").value);
        formData.append("department", overlay.querySelector("#department").value);

        if (selectedPicture) {
            formData.append("profile_picture", selectedPicture);
        }

        fetch(PROFILE_ENDPOINT, {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(resp => {
            alert(resp.message);
            if (resp.status === "success") {
                if (resp.profile_picture) {
                    updateHeaderProfilePicture(resp.profile_picture);
                }
                overlay.style.display = "none";
                // Optionally refresh the page or update UI
                location.reload();
            }
        })
        .catch(err => {
            console.error("Error updating profile:", err);
            alert("Failed to update profile");
        });
    };
}

// Single event listener
document.addEventListener("DOMContentLoaded", () => {
    const profileBtn = document.getElementById("profileBtn");
    if (profileBtn) {
        profileBtn.addEventListener("click", openProfile);
    }
});
