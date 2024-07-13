function redirectToLogin() {
    event.preventDefault();
  
    // Get form data
    const loginType = document.getElementById("login-type").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    // Define redirection URLs based on login type
    const redirectMap = {
      "mahasiswa": "dashboard_mahasiswa.html",
      "dosen": "dashboard_dosen.html",
      "prodi": "prodi.html",
      "fakultas": "fakultas.html",
      "lppm": "lppm.html",
      "admin": "admin.html"
    };
  
    // Prepare data for POST request
    const data = {
      username: username,
      password: password
    };
  
    // Send POST request to server
    fetch('http://localhost:3000/users/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    })
    .then(data => {
      // Handle successful login
      const accessToken = data.accessToken;
      setJwtToCookie(accessToken); // Set JWT token to cookie
  
      // Redirect based on login type
      if (redirectMap.hasOwnProperty(loginType)) {
        window.location.href = redirectMap[loginType];
      } else {
        alert("Invalid login type selected.");
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    });
  
    return false;
  }
  
  function setJwtToCookie(token) {
    const expirationDays = 1; // Set cookie to expire in 1 day
    const date = new Date();
    date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `jwt=${token}; ${expires}; path=/`; // Adjust the cookie settings as needed
  }
  