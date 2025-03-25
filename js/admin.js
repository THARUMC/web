// KingDevil Website - Admin Panel JavaScript

// DOM Elements
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPanel = document.getElementById('adminPanel');
const loginStatus = document.getElementById('loginStatus');
const logoutBtn = document.getElementById('logoutBtn');
const postForm = document.getElementById('postForm');
const postTitle = document.getElementById('postTitle');
const postImage = document.getElementById('postImage');
const postContent = document.getElementById('postContent');
const imagePreview = document.getElementById('imagePreview');
const postId = document.getElementById('postId');
const cancelEdit = document.getElementById('cancelEdit');
const adminPostsList = document.getElementById('adminPostsList');
const blogPostsContainer = document.getElementById('blog-posts-container');
const blogEmpty = document.getElementById('blog-empty');

// Admin password (in a real application, this would be handled server-side)
const ADMIN_PASSWORD = 'kingdevil2025';

// Open admin login modal
if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
        adminLoginModal.style.display = 'flex';
    });
}

// Close modal when clicking on X
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === adminLoginModal) {
        adminLoginModal.style.display = 'none';
    }
});

// Admin Login
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            adminLoginModal.style.display = 'none';
            adminPanel.style.display = 'block';
            loadAdminPosts();
        } else {
            loginStatus.innerHTML = '<p class="error">Incorrect password</p>';
            
            // Clear error message after 3 seconds
            setTimeout(() => {
                loginStatus.innerHTML = '';
            }, 3000);
        }
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        adminPanel.style.display = 'none';
        document.getElementById('adminPassword').value = '';
    });
}

// Handle image upload and preview
if (postImage) {
    postImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// Generate unique ID for posts
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Save post to localStorage
function savePost(post) {
    let posts = JSON.parse(localStorage.getItem('kingdevilPosts')) || [];
    
    if (post.id) {
        // Update existing post
        const index = posts.findIndex(p => p.id === post.id);
        if (index !== -1) {
            posts[index] = post;
        }
    } else {
        // Add new post
        post.id = generateId();
        post.date = new Date().toLocaleDateString();
        posts.push(post);
    }
    
    localStorage.setItem('kingdevilPosts', JSON.stringify(posts));
    return post;
}

// Delete post from localStorage
function deletePost(id) {
    let posts = JSON.parse(localStorage.getItem('kingdevilPosts')) || [];
    posts = posts.filter(post => post.id !== id);
    localStorage.setItem('kingdevilPosts', JSON.stringify(posts));
}

// Get posts from localStorage
function getPosts() {
    return JSON.parse(localStorage.getItem('kingdevilPosts')) || [];
}

// Handle post form submission
if (postForm) {
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form
        if (!postTitle.value || !postContent.value || (!postId.value && !postImage.files[0])) {
            alert('Please fill in all fields');
            return;
        }
        
        // Create post object
        const post = {
            id: postId.value,
            title: postTitle.value,
            content: postContent.value
        };
        
        // Handle image
        if (postImage.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                post.image = event.target.result;
                const savedPost = savePost(post);
                
                // Reset form
                postForm.reset();
                postId.value = '';
                imagePreview.innerHTML = '';
                cancelEdit.style.display = 'none';
                
                // Update UI
                loadAdminPosts();
                loadBlogPosts();
            };
            
            reader.readAsDataURL(postImage.files[0]);
        } else {
            // Keep existing image if editing
            const posts = getPosts();
            const existingPost = posts.find(p => p.id === post.id);
            
            if (existingPost) {
                post.image = existingPost.image;
                savePost(post);
                
                // Reset form
                postForm.reset();
                postId.value = '';
                imagePreview.innerHTML = '';
                cancelEdit.style.display = 'none';
                
                // Update UI
                loadAdminPosts();
                loadBlogPosts();
            }
        }
    });
}

// Cancel edit
if (cancelEdit) {
    cancelEdit.addEventListener('click', () => {
        postForm.reset();
        postId.value = '';
        imagePreview.innerHTML = '';
        cancelEdit.style.display = 'none';
    });
}

// Load posts in admin panel
function loadAdminPosts() {
    if (!adminPostsList) return;
    
    const posts = getPosts();
    
    if (posts.length === 0) {
        adminPostsList.innerHTML = '<p>No posts yet. Add your first post above.</p>';
        return;
    }
    
    let html = '';
    
    posts.forEach(post => {
        html += `
            <div class="admin-post-item">
                <div class="admin-post-title">${post.title}</div>
                <div class="admin-post-actions">
                    <button class="edit-post" data-id="${post.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-post" data-id="${post.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    
    adminPostsList.innerHTML = html;
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-post').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            editPost(id);
        });
    });
    
    document.querySelectorAll('.delete-post').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            
            if (confirm('Are you sure you want to delete this post?')) {
                deletePost(id);
                loadAdminPosts();
                loadBlogPosts();
            }
        });
    });
}

// Edit post
function editPost(id) {
    const posts = getPosts();
    const post = posts.find(p => p.id === id);
    
    if (post) {
        postId.value = post.id;
        postTitle.value = post.title;
        postContent.value = post.content;
        imagePreview.innerHTML = `<img src="${post.image}" alt="Preview">`;
        cancelEdit.style.display = 'inline-block';
    }
}

// Load posts in blog section
function loadBlogPosts() {
    if (!blogPostsContainer || !blogEmpty) return;
    
    const posts = getPosts();
    
    if (posts.length === 0) {
        blogPostsContainer.innerHTML = '';
        blogEmpty.style.display = 'block';
        return;
    }
    
    blogEmpty.style.display = 'none';
    
    let html = '';
    
    posts.forEach(post => {
        // Create excerpt from content
        const excerpt = post.content.length > 150 
            ? post.content.substring(0, 150) + '...' 
            : post.content;
        
        html += `
            <div class="blog-card">
                <img src="${post.image}" alt="${post.title}" class="blog-image">
                <div class="blog-content">
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${excerpt}</p>
                    <p class="blog-date">${post.date}</p>
                </div>
            </div>
        `;
    });
    
    blogPostsContainer.innerHTML = html;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
});
